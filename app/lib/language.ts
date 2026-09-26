"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import type { Language } from "../../src/data/activities";
import { transition } from "./transition";

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

/**
 * The reader's language, shared by every page: `?lang=` wins, then the
 * last choice saved on this device, then Japanese.
 */
export function useLanguage() {
  const language = useSyncExternalStore(
    subscribeToLanguageChange,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const switchLanguage = useCallback(
    (nextLanguage: Language) => {
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
    },
    [language],
  );

  return [language, switchLanguage] as const;
}
