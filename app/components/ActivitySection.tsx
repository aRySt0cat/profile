"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  activities,
  type Activity,
  type Language,
} from "../../src/data/activities";
import {
  activityLinks,
  activityYear,
  categoryLabels,
  filterForHash,
  filteredActivities,
  filterOptions,
  formatDate,
  localized,
  primaryLink,
  type ActivityFilter,
} from "../lib/activity";
import { prefersReducedMotion } from "../lib/motion";
import { transition } from "../lib/transition";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const copy = {
  ja: {
    kicker: "活動",
    note: "出版・研究・登壇を新しい順に掲載",
    filterLabel: "活動種別で絞り込む",
    count: (count: number) => `${count}件`,
    publisher: "出版社",
    links: "関連リンク",
    cover: (title: string) => `『${title}』の書影`,
  },
  en: {
    kicker: null,
    note: "Books, papers, and talks in reverse chronological order",
    filterLabel: "Filter activities by type",
    count: (count: number) => `${count} ${count === 1 ? "item" : "items"}`,
    publisher: "Publisher",
    links: "Related links",
    cover: (title: string) => `Cover of ${title}`,
  },
};

function isSelf(name: string) {
  return name === "下垣内 隆太" || name === "Ryuta Shimogauchi";
}

/** A book cover that leans toward the cursor and catches a moving highlight. */
function Cover({ src, alt }: { src: string; alt: string }) {
  const cover = useRef<HTMLDivElement>(null);
  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const element = cover.current;
    if (!element || event.pointerType !== "mouse") return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    element.style.setProperty("--ry", `${(x - 0.5) * 16}deg`);
    element.style.setProperty("--rx", `${(0.5 - y) * 12}deg`);
    element.style.setProperty("--gx", `${x * 100}%`);
    element.style.setProperty("--gy", `${y * 100}%`);
  };
  const handleLeave = () => {
    const element = cover.current;
    if (!element) return;
    ["--ry", "--rx", "--gx", "--gy"].forEach((name) =>
      element.style.removeProperty(name),
    );
  };
  return (
    <figure className="work-cover">
      <div
        className="cover"
        ref={cover}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
      >
        <img
          src={`${basePath}/${src}`}
          alt={alt}
          width="360"
          height="480"
          loading="lazy"
          decoding="async"
        />
      </div>
    </figure>
  );
}

function Work({
  activity,
  language,
}: {
  activity: Activity;
  language: Language;
}) {
  const text = copy[language];
  const { title, subtitle, authors, publisher, venue, event } = localized(
    activity,
    language,
  );
  const primary = primaryLink(activity);
  const links = activityLinks(activity);

  return (
    <li
      className={`work work-${activity.type}`}
      id={activity.id}
      data-year={activityYear(activity)}
      data-reveal=""
      style={{ "--vt": `work-${activity.id}` } as React.CSSProperties}
    >
      <p className="work-meta">
        <time dateTime={activity.sort_date}>{formatDate(activity)}</time>
        <span className="work-type" data-type={activity.type}>
          {categoryLabels[activity.type][language]}
        </span>
      </p>
      <div className="work-body">
        <h3 className="work-title">
          {primary ? (
            <a href={primary} target="_blank" rel="noreferrer noopener">
              {title}
              <span className="arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          ) : (
            title
          )}
        </h3>
        {subtitle && <p className="work-subtitle">{subtitle}</p>}
        {activity.type === "talk" && event && (
          <p className="work-venue">{event}</p>
        )}
        {authors && (
          <p className="work-authors">
            {authors.map((author, index) => (
              <span key={author}>
                {isSelf(author) ? <strong>{author}</strong> : author}
                {index < authors.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        )}
        {activity.type === "paper" && venue && (
          <p className="work-venue">
            {venue}
            {activity.pages ? `, pp. ${activity.pages}` : ""}
            {activity.year ? `, ${activity.year}` : ""}.
          </p>
        )}
        {activity.type === "book" && (
          <dl className="work-facts">
            <div>
              <dt>{text.publisher}</dt>
              <dd>{publisher}</dd>
            </div>
            <div>
              <dt>ISBN</dt>
              <dd>{activity.isbn}</dd>
            </div>
          </dl>
        )}
        {links.length > 0 && (
          <ul className="work-links" aria-label={`${title} — ${text.links}`}>
            {links.map(([label, href]) => (
              <li key={label}>
                <a
                  className="quiet-link"
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <span>{label}</span>
                  <span className="arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      {activity.cover_image && (
        <Cover src={activity.cover_image} alt={text.cover(title)} />
      )}
    </li>
  );
}

export function ActivitySection({ language }: { language: Language }) {
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const text = copy[language];
  const items = filteredActivities(activities, filter);
  const group = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);

  const applyFilter = useCallback((next: ActivityFilter, then?: () => void) => {
    transition(() => {
      flushSync(() => setFilter(next));
      // Entries arriving through the filter are already in view; show them
      // at once so the transition animates their final state.
      document
        .querySelectorAll<HTMLElement>(".work:not([data-inview])")
        .forEach((element) => {
          element.dataset.inview = "filter";
        });
      then?.();
    });
  }, []);

  useEffect(() => {
    const follow = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      const nextFilter = filterForHash(hash);
      if (nextFilter) {
        setFilter(nextFilter);
        document
          .getElementById("activities")
          ?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
        return;
      }
      const target = activities.find((item) => item.id === hash);
      if (target) {
        setFilter((current) =>
          current === "all" || current === target.type ? current : "all",
        );
        window.requestAnimationFrame(() =>
          document.getElementById(hash)?.scrollIntoView(),
        );
      }
    };
    follow();
    window.addEventListener("hashchange", follow);
    return () => window.removeEventListener("hashchange", follow);
  }, []);

  useLayoutEffect(() => {
    const container = group.current;
    const bar = indicator.current;
    if (!container || !bar) return;
    const place = () => {
      const active = container.querySelector<HTMLElement>(
        'button[aria-pressed="true"]',
      );
      if (!active) return;
      bar.style.width = `${active.offsetWidth}px`;
      bar.style.transform = `translateX(${active.offsetLeft}px)`;
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(container);
    return () => observer.disconnect();
  }, [filter, language]);

  return (
    <section
      className="section works"
      id="activities"
      aria-labelledby="activities-title"
    >
      <div className="wrap">
        <header className="section-head">
          <h2
            className="section-title"
            id="activities-title"
            data-reveal="rise"
          >
            <span data-shift="-0.08">Activities</span>
          </h2>
          <div className="section-aside" data-reveal="">
            {text.kicker && (
              <p className="section-kicker" lang="ja">
                {text.kicker}
              </p>
            )}
            <p className="section-note">{text.note}</p>
            <p className="section-count" aria-live="polite">
              {text.count(items.length)}
            </p>
          </div>
        </header>
      </div>

      <div className="works-toolbar">
        <div className="wrap">
          <div
            className="filter"
            role="group"
            aria-label={text.filterLabel}
            ref={group}
          >
            <span className="filter-indicator" ref={indicator} aria-hidden="true" />
            {filterOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                aria-pressed={filter === option.value}
                onClick={() => {
                  if (option.value === filter) return;
                  const url = new URL(window.location.href);
                  url.hash = option.value === "all" ? "activities" : option.hash;
                  window.history.replaceState(null, "", url);
                  applyFilter(option.value, () => {
                    // Keep the reader at the start of the new list rather
                    // than stranded below a shorter one.
                    const list = document.querySelector(".works-list");
                    const bar = group.current?.getBoundingClientRect();
                    if (list && bar && list.getBoundingClientRect().top < bar.bottom)
                      list.scrollIntoView();
                  });
                }}
              >
                {option[language]}
                <span className="filter-count">
                  {filteredActivities(activities, option.value).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap">
        <ol className="works-list">
          {items.map((activity) => (
            <Work key={activity.id} activity={activity} language={language} />
          ))}
        </ol>
      </div>
    </section>
  );
}
