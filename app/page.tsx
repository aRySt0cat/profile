"use client";

import { ActivitySection } from "./components/ActivitySection";
import { Atmosphere } from "./components/Atmosphere";
import { Bookmark } from "./components/Bookmark";
import { EducationSection } from "./components/EducationSection";
import { Hero } from "./components/Hero";
import { MotionDirector } from "./components/MotionDirector";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { useLanguage } from "./lib/language";

const skipLabel = { ja: "本文へ移動", en: "Skip to main content" };

export default function Home() {
  const [language, switchLanguage] = useLanguage();

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
