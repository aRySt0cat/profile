"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Language } from "../../src/data/activities";

const sections = [
  { id: "profile", label: "Profile" },
  { id: "activities", label: "Activities" },
  { id: "education", label: "Education" },
];

const copy = {
  ja: {
    top: "ページ上部へ",
    profile: "プロフィールへ戻る",
    nav: "メインナビゲーション",
    language: "表示言語を選択",
    status: "日本語で表示中",
  },
  en: {
    top: "Back to the top of the page",
    profile: "Back to the profile",
    nav: "Main navigation",
    language: "Select display language",
    status: "Showing the English version",
  },
} satisfies Record<Language, Record<string, string>>;

/** Slides an underline under whichever child is currently selected. */
function useIndicator(
  container: React.RefObject<HTMLElement | null>,
  selector: string,
  key: unknown,
) {
  const indicator = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const parent = container.current;
    const bar = indicator.current;
    if (!parent || !bar) return;
    const place = () => {
      const active = parent.querySelector<HTMLElement>(selector);
      bar.toggleAttribute("data-hidden", !active);
      if (!active) return;
      bar.style.width = `${active.offsetWidth}px`;
      bar.style.transform = `translateX(${active.offsetLeft}px)`;
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [container, selector, key]);
  return indicator;
}

export function SiteHeader({
  language,
  onLanguage,
  home,
}: {
  language: Language;
  onLanguage: (language: Language) => void;
  /** On pages other than the profile, where section links should lead. */
  home?: string;
}) {
  const text = copy[language];
  const [active, setActive] = useState<string | null>(
    home ? null : "profile",
  );
  const nav = useRef<HTMLElement>(null);
  const switcher = useRef<HTMLDivElement>(null);
  const navIndicator = useIndicator(nav, '[aria-current="location"]', active);
  const languageIndicator = useIndicator(
    switcher,
    '[aria-pressed="true"]',
    language,
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <header className="site-header">
      <div className="wrap site-header-inner">
        <a
          className="site-mark"
          href={`${home ?? ""}#profile`}
          aria-label={home ? text.profile : text.top}
        >
          <span className="site-mark-full">Ryuta Shimogauchi</span>
          <span className="site-mark-short" aria-hidden="true">
            R.S.
          </span>
        </a>
        <nav className="main-nav" aria-label={text.nav} ref={nav}>
          {sections.map((section) => (
            <a
              key={section.id}
              href={`${home ?? ""}#${section.id}`}
              aria-current={active === section.id ? "location" : undefined}
              className={section.id === "profile" ? "nav-profile" : undefined}
            >
              {section.label}
            </a>
          ))}
          <span className="nav-indicator" ref={navIndicator} aria-hidden="true" />
        </nav>
        <div
          className="language-switch"
          role="group"
          aria-label={text.language}
          ref={switcher}
        >
          <span className="visually-hidden">LANGUAGE</span>
          {(["ja", "en"] as const).map((option) => (
            <button
              key={option}
              type="button"
              lang={option}
              aria-pressed={language === option}
              onClick={() => onLanguage(option)}
            >
              {option.toUpperCase()}
            </button>
          ))}
          <span
            className="language-indicator"
            ref={languageIndicator}
            aria-hidden="true"
          />
          <span className="visually-hidden" aria-live="polite">
            {text.status}
          </span>
        </div>
      </div>
      <span className="header-progress" aria-hidden="true" />
    </header>
  );
}
