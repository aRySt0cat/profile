"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ActivitySpread } from "./components/ActivityList";
import { ActivityContents } from "./components/ActivityContents";
import { PaperSculpture } from "./components/PaperSculpture";
import {
  ACTIVITIES_CONTENTS,
  ACTIVITY_START,
  chapterAt,
  sceneOpacity,
  timelineTime,
  lastMoment,
  filteredActivities,
  spreadForHash,
} from "./lib/narrative";
import { activities } from "../src/data/activities";
import type { Language, ActivityType } from "../src/data/activities";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const socialLinks = [
  { label: "GitHub", href: "https://github.com/aRySt0cat" },
  { label: "X", href: "https://x.com/eta1ia" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ryuta-shimogauchi/" },
  { label: "Instagram", href: "https://www.instagram.com/et_a11a/" },
  {
    label: "YouTube — Elith Official",
    href: "https://www.youtube.com/@elithofficial",
  },
];

const education = [
  {
    year: "2020",
    ja: {
      school: "東京大学大学院",
      course: "情報理工学系研究科 電子情報学専攻",
      degree: "修士",
    },
    en: {
      school: "The University of Tokyo",
      course:
        "Graduate School of Information Science and Technology, Department of Information and Communication Engineering",
      degree: "M.S.",
    },
  },
  {
    year: "2017",
    ja: {
      school: "東京大学",
      course: "工学部 電子情報工学科",
      degree: "学士",
    },
    en: {
      school: "The University of Tokyo",
      course:
        "Faculty of Engineering, Department of Electrical and Electronic Engineering",
      degree: "B.Eng.",
    },
  },
  {
    year: "2012",
    ja: {
      school: "神戸市立工業高等専門学校",
      course: "電子工学科",
      degree: "準学士",
    },
    en: {
      school: "Kobe City College of Technology",
      course: "Department of Electronics",
      degree: "Associate",
    },
  },
];

const pageCopy = {
  ja: {
    skip: "本文へ移動",
    topLabel: "ページ上部へ",
    navLabel: "メインナビゲーション",
    nav: ["プロフィール", "学歴", "活動"],
    languageLabel: "表示言語を選択",
    languageStatus: "日本語で表示中",
    eyebrow: "Board Director & CAIO, Elith Inc.",
    role: "株式会社Elith 取締役CAIO",
    socialLabel: "公開アカウント",
    portraitAlt: "下垣内隆太のプロフィール画像",
    educationNote: "学歴",
    activitiesNote: "出版・研究・登壇を新しい順に掲載",
    backToTop: "ページ上部へ",
  },
  en: {
    skip: "Skip to main content",
    topLabel: "Back to the top of the page",
    navLabel: "Main navigation",
    nav: ["Profile", "Education", "Activities"],
    languageLabel: "Select display language",
    languageStatus: "Showing the English version",
    eyebrow: "Board Director & CAIO, Elith Inc.",
    role: "Board Director & Chief AI Officer, Elith Inc.",
    socialLabel: "Public profiles",
    portraitAlt: "Portrait of Ryuta Shimogauchi",
    educationNote: "Academic background",
    activitiesNote: "Books, papers, and talks in reverse chronological order",
    backToTop: "Back to top",
  },
} satisfies Record<Language, Record<string, string | string[]>>;

function isLanguage(value: string | null): value is Language {
  return value === "ja" || value === "en";
}

const languageChangeEvent = "profile-language-change";

function getLanguageSnapshot(): Language {
  const urlLanguage = new URL(window.location.href).searchParams.get("lang");
  let savedLanguage: string | null = null;
  try {
    savedLanguage = window.localStorage.getItem("profile-language");
  } catch {
    /* Device storage is optional. */
  }

  if (isLanguage(urlLanguage)) return urlLanguage;
  if (isLanguage(savedLanguage)) return savedLanguage;
  return "ja";
}

function getServerLanguageSnapshot(): Language {
  return "ja";
}

function subscribeToLanguageChange(onStoreChange: () => void) {
  window.addEventListener(languageChangeEvent, onStoreChange);
  window.addEventListener("popstate", onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(languageChangeEvent, onStoreChange);
    window.removeEventListener("popstate", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

const chapterIds = ["profile", "education", "activities"];
const chapterNames = ["Profile", "Education", "Activities"];
const motionQuery = "(prefers-reduced-motion: reduce)";
const subscribeToMotion = (change: () => void) => {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", change);
  return () => media.removeEventListener("change", change);
};
const filterOptions = [
  { value: "all", hash: "all", ja: "すべて", en: "All" },
  { value: "book", hash: "books", ja: "書籍", en: "Books" },
  { value: "paper", hash: "papers", ja: "論文", en: "Papers" },
  { value: "talk", hash: "talks", ja: "登壇", en: "Talks" },
] as const;

export default function Home() {
  const language = useSyncExternalStore(
    subscribeToLanguageChange,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  const preferStill = useSyncExternalStore(
    subscribeToMotion,
    () => window.matchMedia(motionQuery).matches,
    () => false,
  );
  const [reading, setReading] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const [filter, setFilter] = useState<"all" | ActivityType>("all");
  const [spread, setSpread] = useState(0);
  const story = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const time = useRef(0);
  const pendingSpread = useRef<number | null>(null);
  const copy = pageCopy[language];
  const still = reading || preferStill;
  const visibleActivities = filteredActivities(activities, filter);
  const count = visibleActivities.length + ACTIVITY_START;
  const chapter = Math.min(2, spread);
  const ids = [
    "profile",
    "education",
    "activities",
    ...visibleActivities.map((item) => item.id),
  ];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  useEffect(() => {
    const fallback = () => {
      pendingSpread.current = chapterAt(time.current, count);
      setReading(true);
    };
    window.addEventListener("profile-book-unavailable", fallback);
    return () =>
      window.removeEventListener("profile-book-unavailable", fallback);
  }, [count]);

  useEffect(() => {
    const container = story.current;
    if (!container) return;
    let frame = 0;
    const panels = [...container.querySelectorAll<HTMLElement>(".book-spread")];
    const update = () => {
      frame = 0;
      const readingIndex = still
        ? Math.max(
            0,
            panels.reduce(
              (last, panel, index) =>
                panel.getBoundingClientRect().top < window.innerHeight * 0.4
                  ? index
                  : last,
              0,
            ),
          )
        : 0;
      const t = still
        ? readingIndex
        : timelineTime(
            window.scrollY,
            container.offsetTop,
            container.offsetHeight - window.innerHeight,
            count,
          );
      time.current = t;
      setSpread(chapterAt(t, count));
      panels.forEach((panel, index) => {
        panel.style.setProperty(
          "--spread-opacity",
          String(still ? 1 : sceneOpacity(t, index, count)),
        );
      });
      progress.current?.style.setProperty(
        "--progress",
        `${(t / lastMoment(count)) * 100}%`,
      );
      window.dispatchEvent(new Event("profile-time-update"));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const scrollToSpread = (index: number) => {
      setSpread(Math.min(count - 1, index));
      if (still) panels[index]?.scrollIntoView({ behavior: "instant" });
      else
        window.scrollTo({
          top:
            container.offsetTop +
            (index / lastMoment(count)) *
              (container.offsetHeight - window.innerHeight),
          behavior: "instant",
        });
      schedule();
    };
    const followHash = () => {
      const hash = window.location.hash.slice(1);
      const nextFilter = filterOptions.find((option) => option.hash === hash);
      if (nextFilter && nextFilter.value !== filter) {
        pendingSpread.current = ACTIVITIES_CONTENTS;
        setFilter(nextFilter.value);
        return;
      }
      const activity = activities.find((item) => item.id === hash);
      if (activity && filter !== "all" && activity.type !== filter) {
        pendingSpread.current =
          activities.findIndex((item) => item.id === hash) + ACTIVITY_START;
        setFilter("all");
        return;
      }
      scrollToSpread(
        spreadForHash(hash, filteredActivities(activities, filter)),
      );
    };
    setEnhanced(true);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", followHash);
    const observer = new ResizeObserver(schedule);
    observer.observe(container);
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      if (pendingSpread.current !== null) {
        scrollToSpread(Math.min(count - 1, pendingSpread.current));
        pendingSpread.current = null;
      } else followHash();
    });
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", followHash);
    };
  }, [still, count, filter]);

  const switchLanguage = (nextLanguage: Language) => {
    try {
      window.localStorage.setItem("profile-language", nextLanguage);
    } catch {
      /* The URL also stores this preference. */
    }
    const url = new URL(window.location.href);
    url.searchParams.set("lang", nextLanguage);
    window.history.replaceState(null, "", url);
    window.dispatchEvent(new Event(languageChangeEvent));
  };

  const goToSpread = (index: number, focus = false) => {
    const target = Math.max(0, Math.min(count - 1, index));
    const container = story.current;
    if (!container) return;
    window.history.pushState(null, "", `#${ids[target]}`);
    if (still || focus) setSpread(target);
    if (still)
      document
        .getElementById(ids[target])
        ?.scrollIntoView({ behavior: "instant" });
    else
      window.scrollTo({
        top:
          container.offsetTop +
          (target / lastMoment(count)) *
            (container.offsetHeight - window.innerHeight),
        behavior: focus ? "instant" : "smooth",
      });
    if (focus)
      window.requestAnimationFrame(() =>
        document.getElementById(ids[target])?.focus({ preventScroll: true }),
      );
  };

  const selectFilter = (next: "all" | ActivityType, hash: string) => {
    window.history.pushState(null, "", `#${hash}`);
    if (next === filter) {
      goToSpread(ACTIVITIES_CONTENTS);
      window.history.replaceState(null, "", `#${hash}`);
    } else {
      pendingSpread.current = ACTIVITIES_CONTENTS;
      setSpread(ACTIVITIES_CONTENTS);
      setFilter(next);
    }
  };

  return (
    <div
      className="profile-experience"
      data-enhanced={enhanced}
      data-mode={still ? "reading" : "immersive"}
    >
      <a
        className="skip-link"
        href="#profile"
        onClick={(event) => {
          event.preventDefault();
          goToSpread(0, true);
        }}
      >
        {copy.skip}
      </a>
      <header className="site-header">
        <a
          className="site-mark"
          href="#profile"
          onClick={(event) => {
            event.preventDefault();
            goToSpread(0, event.detail === 0);
          }}
          aria-label={copy.topLabel as string}
        >
          Ryuta Shimogauchi
        </a>
        <nav className="main-nav" aria-label={copy.navLabel as string}>
          {chapterNames.map((name, index) => (
            <a
              key={name}
              href={`#${chapterIds[index]}`}
              aria-current={chapter === index ? "location" : undefined}
              onClick={(event) => {
                event.preventDefault();
                goToSpread(index, event.detail === 0);
              }}
            >
              {name}
            </a>
          ))}
        </nav>
        <div
          className="language-switch"
          aria-label={copy.languageLabel as string}
        >
          <span className="visually-hidden">LANGUAGE</span>
          {(["ja", "en"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={language === option}
              onClick={() => switchLanguage(option)}
            >
              {option.toUpperCase()}
            </button>
          ))}
          <span className="visually-hidden" aria-live="polite">
            {copy.languageStatus}
          </span>
        </div>
      </header>

      <main id="main-content">
        <div
          className="narrative"
          ref={story}
          style={{ "--spread-count": count } as React.CSSProperties}
        >
          <div className="narrative-stage">
            <div className="book-stage" ref={surface}>
              <PaperSculpture
                time={time}
                still={still}
                surface={surface}
                count={count}
              />
              <section
                className="book-spread spread-profile"
                id="profile"
                data-spread="0"
                tabIndex={0}
                aria-labelledby="profile-name"
                inert={enhanced && !still && spread !== 0}
              >
                <div className="paper-page page-left">
                  <div className="page-inner" tabIndex={0}>
                    <p className="page-label">Profile</p>
                    <img
                      className="profile-portrait"
                      src={`${basePath}/assets/profile.webp`}
                      alt={copy.portraitAlt as string}
                      width="152"
                      height="152"
                    />
                    <h1 id="profile-name">
                      {language === "ja" ? "下垣内 隆太" : "Ryuta Shimogauchi"}
                    </h1>
                    <p className="alternate-name">
                      {language === "ja" ? "Ryuta Shimogauchi" : "下垣内 隆太"}
                    </p>
                  </div>
                </div>
                <div className="paper-page page-right">
                  <div className="page-inner profile-details" tabIndex={0}>
                    <p className="profile-role">{copy.role}</p>
                    <ul
                      className="social-links"
                      aria-label={copy.socialLabel as string}
                    >
                      {socialLinks.map((link) => (
                        <li key={link.label}>
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            {link.label}
                            <span aria-hidden="true">↗</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              <section
                className="book-spread spread-education"
                id="education"
                data-spread="1"
                tabIndex={0}
                aria-labelledby="education-title"
                inert={enhanced && !still && spread !== 1}
              >
                <div className="paper-page page-left">
                  <div className="page-inner" tabIndex={0}>
                    <p className="page-label">Education</p>
                    <h2 id="education-title">{copy.educationNote}</h2>
                    <div className="education-entry">
                      <time>{education[0].year}</time>
                      <h3>{education[0][language].school}</h3>
                      <p>{education[0][language].course}</p>
                      <p className="degree">{education[0][language].degree}</p>
                    </div>
                  </div>
                </div>
                <div className="paper-page page-right">
                  <div className="page-inner" tabIndex={0}>
                    {education.slice(1).map((item) => (
                      <div className="education-entry" key={item.year}>
                        <time>{item.year}</time>
                        <h3>{item[language].school}</h3>
                        <p>{item[language].course}</p>
                        <p className="degree">{item[language].degree}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section
                className="book-spread spread-contents"
                id="activities"
                data-spread={ACTIVITIES_CONTENTS}
                tabIndex={0}
                aria-labelledby="activities-title"
                inert={enhanced && !still && spread !== ACTIVITIES_CONTENTS}
              >
                <ActivityContents
                  items={visibleActivities}
                  language={language}
                  onSelect={(id) =>
                    goToSpread(spreadForHash(id, visibleActivities), true)
                  }
                />
              </section>

              {visibleActivities.map((activity, index) => (
                <section
                  key={activity.id}
                  id={activity.id}
                  data-spread={index + ACTIVITY_START}
                  className="book-spread spread-activity"
                  tabIndex={0}
                  aria-labelledby={`${activity.id}-title`}
                  inert={
                    enhanced && !still && spread !== index + ACTIVITY_START
                  }
                >
                  <ActivitySpread
                    activity={activity}
                    language={language}
                    index={index}
                    total={visibleActivities.length}
                    onBackToContents={() =>
                      goToSpread(ACTIVITIES_CONTENTS, true)
                    }
                  />
                </section>
              ))}
            </div>

            <div className="book-controls" ref={progress}>
              <div
                className="activity-controls"
                role="group"
                aria-label={
                  language === "ja"
                    ? "活動種別で絞り込む"
                    : "Filter activities by type"
                }
              >
                {filterOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    aria-pressed={filter === option.value}
                    onClick={() => selectFilter(option.value, option.hash)}
                  >
                    {option[language]}{" "}
                    <span>
                      {filteredActivities(activities, option.value).length}
                    </span>
                  </button>
                ))}
              </div>
              <div className="page-navigation">
                <button
                  type="button"
                  aria-label={
                    language === "ja" ? "前のページ" : "Previous page"
                  }
                  disabled={spread === 0}
                  onClick={(event) =>
                    goToSpread(spread - 1, event.detail === 0)
                  }
                >
                  ←
                </button>
                <label className="spread-selector">
                  <span className="visually-hidden">
                    {language === "ja" ? "表示するページ" : "Select a page"}
                  </span>
                  <select
                    aria-label={
                      language === "ja" ? "表示するページ" : "Select a page"
                    }
                    value={spread}
                    onChange={(event) =>
                      goToSpread(Number(event.target.value), true)
                    }
                  >
                    <option value={0}>Profile</option>
                    <option value={1}>Education</option>
                    <option value={ACTIVITIES_CONTENTS}>
                      {language === "ja"
                        ? "Activities — 目次"
                        : "Activities — Contents"}
                    </option>
                    {visibleActivities.map((item, index) => (
                      <option key={item.id} value={index + ACTIVITY_START}>
                        {language === "en"
                          ? (item.title_en ?? item.title)
                          : item.title}
                      </option>
                    ))}
                  </select>
                </label>
                <span className="page-counter" aria-live="polite">
                  {String(spread + 1).padStart(2, "0")} /{" "}
                  {String(count).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  aria-label={language === "ja" ? "次のページ" : "Next page"}
                  disabled={spread === count - 1}
                  onClick={(event) =>
                    goToSpread(spread + 1, event.detail === 0)
                  }
                >
                  →
                </button>
              </div>
              <div className="timeline-track" aria-hidden="true">
                <span />
              </div>
              <div className="footer-meta">
                <span>
                  {language === "ja"
                    ? "スクロールでページをめくる"
                    : "Scroll to turn the pages"}
                </span>
                <button
                  className="reading-toggle"
                  type="button"
                  aria-pressed={still}
                  disabled={preferStill}
                  onClick={() => {
                    pendingSpread.current = spread;
                    setReading(!reading);
                  }}
                >
                  {still
                    ? language === "ja"
                      ? preferStill
                        ? "動きを抑えて表示中"
                        : "本の表示に戻る"
                      : preferStill
                        ? "Reduced motion"
                        : "Return to book"
                    : language === "ja"
                      ? "一覧で読む"
                      : "Reading view"}
                </button>
                <span>© 2026 Ryuta Shimogauchi</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
