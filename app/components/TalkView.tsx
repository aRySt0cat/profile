"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { Activity, Language } from "../../src/data/activities";
import {
  activityLinks,
  categoryLabels,
  deckPath,
  formatDate,
  localized,
} from "../lib/activity";
import { useLanguage } from "../lib/language";
import { Atmosphere } from "./Atmosphere";
import { MotionDirector } from "./MotionDirector";
import { SiteHeader } from "./SiteHeader";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Manifest = {
  aspectRatio?: number;
  pages: { no: number; title: string }[];
};

const copy = {
  ja: {
    skip: "スライドへ移動",
    back: "活動一覧へ",
    previous: "前のページ",
    next: "次のページ",
    page: (page: number, total: number) =>
      total ? `${total}ページ中${page}ページ目` : `${page}ページ目`,
    fullscreen: "全画面",
    open: "別タブで開く",
    hint: "← → キーでページ送り。スライドをクリックすると、アニメーションや音声などスライド内の操作もできます。",
    contents: "目次",
    frame: (title: string) => `スライド：${title}`,
    loading: "スライドを読み込んでいます",
    missing: "スライドを読み込めませんでした。",
    missingDev: "ローカルでは npm run slides でスライドをビルドしてください。",
    links: "関連リンク",
  },
  en: {
    skip: "Skip to the slides",
    back: "All activities",
    previous: "Previous page",
    next: "Next page",
    page: (page: number, total: number) =>
      total ? `Page ${page} of ${total}` : `Page ${page}`,
    fullscreen: "Full screen",
    open: "Open in a new tab",
    hint: "Use ← → to turn pages. Click inside the slides to use their own animations, audio and controls.",
    contents: "Contents",
    frame: (title: string) => `Slides: ${title}`,
    loading: "Loading the slides",
    missing: "The slides could not be loaded.",
    missingDev: "Build them locally with npm run slides.",
    links: "Related links",
  },
} satisfies Record<Language, Record<string, unknown>>;

const pad = (value: number) => String(value).padStart(2, "0");
const pageFromHash = (hash: string) => Number(/^#\/?(\d+)/.exec(hash)?.[1]);

const subscribeToFullscreen = (change: () => void) => {
  document.addEventListener("fullscreenchange", change);
  return () => document.removeEventListener("fullscreenchange", change);
};

export function TalkView({ activity }: { activity: Activity }) {
  const [language, switchLanguage] = useLanguage();
  const deck = activity.deck!;
  const text = copy[language];
  const { title, subtitle, event } = localized(activity, language);
  const links = activityLinks(activity).filter((link) => !link.internal);
  const frame = useRef<HTMLIFrameElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">(
    "loading",
  );
  const [src, setSrc] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const total = manifest?.pages.length ?? 0;
  const canFullscreen = useSyncExternalStore(
    subscribeToFullscreen,
    () => document.fullscreenEnabled,
    () => false,
  );

  // The manifest is written next to the built deck; without it there is
  // nothing to show, so the frame is only created once it has loaded.
  useEffect(() => {
    let cancelled = false;
    const requested = pageFromHash(window.location.hash) || 1;
    fetch(`${basePath}/slides/${deck.slug}/deck.json`)
      .then((response) =>
        response.ok ? response.json() : Promise.reject(response.status),
      )
      .then((data: Manifest) => {
        if (cancelled) return;
        const start = Math.min(requested, data.pages.length || requested);
        setManifest(data);
        setPage(start);
        setSrc(deckPath(deck.slug, start));
      })
      .catch(() => {
        if (!cancelled) setStatus("missing");
      });
    return () => {
      cancelled = true;
    };
  }, [deck.slug]);

  /** Follows the deck's own navigation, and mirrors it in this page's URL. */
  const connect = useCallback(() => {
    const deckWindow = frame.current?.contentWindow;
    if (!deckWindow) return;
    setStatus("ready");
    const sync = () => {
      const current = pageFromHash(deckWindow.location.hash);
      if (!current) return;
      setPage(current);
      const url = new URL(window.location.href);
      url.hash = String(current);
      window.history.replaceState(window.history.state, "", url);
    };
    // Slidev moves between pages with history.pushState, which fires no
    // event, so observe the calls themselves. Each page replaces the last
    // entry: the browser's back button should leave the talk, not step
    // back through thirty slides.
    const replace = deckWindow.history.replaceState.bind(deckWindow.history);
    const follow = (...args: Parameters<History["replaceState"]>) => {
      replace(...args);
      sync();
    };
    deckWindow.history.pushState = follow;
    deckWindow.history.replaceState = follow;
    deckWindow.addEventListener("popstate", sync);
    sync();
  }, []);

  /** Sends a key press into the deck, so clicks and animations advance too. */
  const press = useCallback((key: "ArrowLeft" | "ArrowRight") => {
    const deckWindow = frame.current?.contentWindow as
      | (Window & typeof globalThis)
      | null;
    if (!deckWindow) return;
    for (const type of ["keydown", "keyup"])
      deckWindow.dispatchEvent(
        new deckWindow.KeyboardEvent(type, { key, code: key, bubbles: true }),
      );
  }, []);

  const goTo = useCallback((no: number, reveal = true) => {
    const deckWindow = frame.current?.contentWindow;
    if (!deckWindow || pageFromHash(deckWindow.location.hash) === no) return;
    // An absolute URL: a relative one would resolve against this page.
    const url = new URL(deckWindow.location.href);
    url.hash = `/${no}`;
    deckWindow.location.replace(url.href);
    const rect = stage.current?.getBoundingClientRect();
    if (reveal && rect && (rect.top < 0 || rect.bottom > window.innerHeight))
      stage.current?.scrollIntoView({ block: "center" });
  }, []);

  // Editing the page number in the address bar moves the deck as well.
  useEffect(() => {
    const follow = () => {
      const no = pageFromHash(window.location.hash);
      if (no) goTo(no, false);
    };
    window.addEventListener("hashchange", follow);
    return () => window.removeEventListener("hashchange", follow);
  }, [goTo]);

  // Arrow keys on this page turn the deck's pages too.
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey)
        return;
      if ((event.target as HTMLElement).closest?.("input, textarea, select"))
        return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      press(event.key);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [press]);

  return (
    <div
      className="talk-page"
      style={
        {
          "--aspect": manifest?.aspectRatio ?? 16 / 9,
        } as React.CSSProperties
      }
    >
      <a className="skip-link" href="#slides">
        {text.skip}
      </a>
      <Atmosphere />
      <SiteHeader
        language={language}
        onLanguage={switchLanguage}
        home={`${basePath}/`}
      />

      <main id="main-content" className="talk">
        <div className="talk-column">
          <nav className="talk-crumbs" aria-label={text.back}>
            <a className="quiet-link" href={`${basePath}/#${activity.id}`}>
              <span className="arrow arrow-back" aria-hidden="true">
                ←
              </span>
              <span>{text.back}</span>
            </a>
            <span className="talk-crumb-meta">
              <time dateTime={activity.sort_date}>{formatDate(activity)}</time>
              <span>{categoryLabels[activity.type][language]}</span>
            </span>
          </nav>

          <div className="talk-stage" id="slides" ref={stage} data-status={status}>
            {src && (
              <iframe
                ref={frame}
                src={src}
                title={text.frame(title)}
                allow="autoplay; fullscreen; screen-wake-lock"
                allowFullScreen
                onLoad={connect}
              />
            )}
            {status !== "ready" && (
              <div className="talk-stage-message" role="status">
                {status === "loading" ? (
                  <span className="talk-loading">{text.loading}</span>
                ) : (
                  <>
                    <p>{text.missing}</p>
                    {process.env.NODE_ENV !== "production" && (
                      <p className="talk-stage-dev">{text.missingDev}</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="deck-controls">
            <div className="deck-pager">
              <button
                type="button"
                onClick={() => press("ArrowLeft")}
                disabled={status !== "ready" || page <= 1}
                aria-label={text.previous}
              >
                ←
              </button>
              <span className="deck-count" aria-live="polite">
                <span className="visually-hidden">{text.page(page, total)}</span>
                <span aria-hidden="true">
                  {pad(page)}
                  <span className="deck-total"> / {total ? pad(total) : "––"}</span>
                </span>
              </span>
              <button
                type="button"
                onClick={() => press("ArrowRight")}
                disabled={status !== "ready" || (total > 0 && page >= total)}
                aria-label={text.next}
              >
                →
              </button>
            </div>
            <span
              className="deck-progress"
              aria-hidden="true"
              style={
                { "--progress": total ? page / total : 0 } as React.CSSProperties
              }
            />
            <div className="deck-actions">
              {canFullscreen && (
                <button
                  type="button"
                  className="quiet-link"
                  disabled={status !== "ready"}
                  onClick={() => {
                    frame.current?.requestFullscreen().then(() =>
                      frame.current?.focus(),
                    );
                  }}
                >
                  <span>{text.fullscreen}</span>
                  <span className="arrow" aria-hidden="true">
                    ⤢
                  </span>
                </button>
              )}
              <a
                className="quiet-link"
                href={deckPath(deck.slug, page)}
                target="_blank"
                rel="noopener"
              >
                <span>{text.open}</span>
                <span className="arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            </div>
          </div>
          <p className="deck-hint">{text.hint}</p>

          <header className="talk-head" data-reveal="">
            <h1 className="talk-title">{title}</h1>
            {subtitle && <p className="talk-subtitle">{subtitle}</p>}
            {event && (
              <p className="talk-event">
                <span>{event}</span>
                {links.length > 0 && (
                  <span className="talk-links" aria-label={text.links}>
                    {links.map((link) => (
                      <a
                        key={link.label}
                        className="quiet-link"
                        href={link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        <span>{link.label}</span>
                        <span className="arrow" aria-hidden="true">
                          ↗
                        </span>
                      </a>
                    ))}
                  </span>
                )}
              </p>
            )}
          </header>

          {manifest && manifest.pages.length > 0 && (
            <section
              className="talk-contents"
              aria-labelledby="talk-contents-title"
              data-reveal=""
            >
              <h2 id="talk-contents-title">{text.contents}</h2>
              <ol>
                {manifest.pages.map((slide, index) => (
                  <li key={slide.no}>
                    <button
                      type="button"
                      onClick={() => goTo(slide.no)}
                      aria-current={slide.no === page ? "page" : undefined}
                      disabled={status !== "ready"}
                    >
                      <span className="talk-contents-no">{pad(slide.no)}</span>
                      <span className="talk-contents-title">
                        {index === 0 ? activity.title : slide.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </main>

      <footer className="talk-footer">
        <div className="talk-column colophon">
          <span>© 2026 Ryuta Shimogauchi</span>
          <a className="quiet-link" href={`${basePath}/`}>
            <span>Ryuta Shimogauchi</span>
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </footer>
      <MotionDirector />
    </div>
  );
}
