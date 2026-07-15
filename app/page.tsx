"use client";

import { useEffect, useSyncExternalStore } from "react";
import { ActivityList } from "./components/ActivityList";
import { AmbientField } from "./components/AmbientField";
import type { Language } from "../src/data/activities";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const socialLinks = [
  { label: "GitHub", href: "https://github.com/aRySt0cat" },
  { label: "X", href: "https://x.com/eta1ia" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ryuta-shimogauchi/" },
  { label: "Instagram", href: "https://www.instagram.com/et_a11a/" },
  { label: "YouTube — Elith Official", href: "https://www.youtube.com/@elithofficial" },
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
      course: "Faculty of Engineering, Department of Electrical and Electronic Engineering",
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
  const savedLanguage = window.localStorage.getItem("profile-language");

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

export default function Home() {
  const language = useSyncExternalStore(
    subscribeToLanguageChange,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  const copy = pageCopy[language];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const switchLanguage = (nextLanguage: Language) => {
    window.localStorage.setItem("profile-language", nextLanguage);

    const url = new URL(window.location.href);
    if (nextLanguage === "en") {
      url.searchParams.set("lang", "en");
    } else {
      url.searchParams.delete("lang");
    }
    window.history.replaceState(null, "", url);
    window.dispatchEvent(new Event(languageChangeEvent));
  };

  return (
    <>
      <a className="skip-link" href="#main-content">
        {copy.skip}
      </a>
      <AmbientField />

      <header className="site-header">
        <a className="site-mark" href="#top" aria-label={copy.topLabel as string}>
          <span>RS</span>
          <span>35.6812° N</span>
        </a>

        <div className="header-tools">
          <nav aria-label={copy.navLabel as string}>
            <a href="#profile">{copy.nav[0]}</a>
            <a href="#education">{copy.nav[1]}</a>
            <a href="#activities">{copy.nav[2]}</a>
          </nav>

          <div className="language-switch" aria-label={copy.languageLabel as string}>
            <span className="language-switch-label" aria-hidden="true">
              LANGUAGE
            </span>
            <div className="language-options">
              {(["ja", "en"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={language === option}
                  aria-label={option === "ja" ? "日本語で表示" : "Show in English"}
                  onClick={() => switchLanguage(option)}
                >
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
            <span className="visually-hidden" aria-live="polite">
              {copy.languageStatus}
            </span>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section className="hero" id="top" aria-labelledby="profile-name">
          <div className="hero-orbit" aria-hidden="true">
            <span>01</span>
            <span>PROFILE</span>
          </div>

          <div className="hero-copy" id="profile">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 id="profile-name">
              <span className="name-ja">下垣内 隆太</span>
              <span className="name-en">Ryuta Shimogauchi</span>
            </h1>
            <p className="role">{copy.role}</p>

            <ul className="social-links" aria-label={copy.socialLabel as string}>
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} target="_blank" rel="noreferrer noopener">
                    {link.label}
                    <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <figure className="portrait-frame">
            <div className="portrait-layer" aria-hidden="true" />
            <img
              src={`${basePath}/assets/profile.webp`}
              alt={copy.portraitAlt as string}
              width="1024"
              height="1024"
              decoding="async"
              fetchPriority="high"
            />
            <figcaption>
              <span>PROFILE IMAGE</span>
              <span>01 / 03</span>
            </figcaption>
          </figure>

          <a className="scroll-cue" href="#education">
            <span>Scroll to explore</span>
            <span className="scroll-line" aria-hidden="true" />
          </a>
        </section>

        <section className="education-section" id="education" aria-labelledby="education-title">
          <div className="section-heading education-heading">
            <p className="section-index">02 / EDUCATION</p>
            <h2 id="education-title">Education</h2>
            <p className="section-note">{copy.educationNote}</p>
          </div>

          <ol className="education-list">
            {education.map((item) => {
              const localized = item[language];
              return (
                <li key={item.year}>
                  <time>{item.year}</time>
                  <div>
                    <h3>{localized.school}</h3>
                    <p>{localized.course}</p>
                  </div>
                  <p className="degree">{localized.degree}</p>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="activities-section" id="activities" aria-labelledby="activities-title">
          <div className="section-heading activities-heading">
            <p className="section-index">03 / ACTIVITIES</p>
            <h2 id="activities-title">Activities</h2>
            <p className="section-note">{copy.activitiesNote}</p>
          </div>
          <ActivityList language={language} />
        </section>
      </main>

      <footer className="site-footer">
        <p>© 2026 Ryuta Shimogauchi</p>
        <a href="#top">
          {copy.backToTop} <span aria-hidden="true">↑</span>
        </a>
      </footer>
    </>
  );
}
