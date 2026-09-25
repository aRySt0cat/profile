"use client";

import { useEffect, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import type { Language } from "../src/data/activities";
import { ActivitySection } from "./components/ActivitySection";
import { Atmosphere } from "./components/Atmosphere";
import { Bookmark } from "./components/Bookmark";
import { EducationSection } from "./components/EducationSection";
import { Hero } from "./components/Hero";
import { MotionDirector } from "./components/MotionDirector";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { transition } from "./lib/transition";

const languageChangeEvent = "profile-language-change";

function isLanguage(value: string | null): value is Language {
  return value === "ja" || value === "en";
}

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

const skipLabel = { ja: "本文へ移動", en: "Skip to main content" };

export default function Home() {
  const language = useSyncExternalStore(
    subscribeToLanguageChange,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const switchLanguage = (nextLanguage: Language) => {
    if (nextLanguage === language) return;
    try {
      window.localStorage.setItem("profile-language", nextLanguage);
    } catch {
      /* The URL also stores this preference. */
    }
    const url = new URL(window.location.href);
    url.searchParams.set("lang", nextLanguage);
    window.history.replaceState(null, "", url);
    transition(() =>
      flushSync(() => window.dispatchEvent(new Event(languageChangeEvent))),
    );
  };

  return (
    <>
      <a className="skip-link" href="#main-content">
        {skipLabel[language]}
      </a>
      <Atmosphere />
      <SiteHeader language={language} onLanguage={switchLanguage} />
      <Bookmark language={language} />
      <main id="main-content" tabIndex={-1}>
        <Hero language={language} />
        <ActivitySection language={language} />
        <EducationSection language={language} />
      </main>
      <SiteFooter language={language} />
      <MotionDirector />
    </>
  );
}
