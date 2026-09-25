"use client";

import { useEffect, useRef } from "react";
import type { Language } from "../../src/data/activities";
import { socialLinks } from "../../src/data/profile";
import { hasFinePointer, onFrame, prefersReducedMotion } from "../lib/motion";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const nameLines = ["Ryuta", "Shimogauchi"].map((line, lineIndex, lines) => {
  const offset = lines
    .slice(0, lineIndex)
    .reduce((total, previous) => total + previous.length, 0);
  return [...line].map((character, index) => ({
    character,
    index: offset + index,
  }));
});
const REST_WEIGHT = 330;
const FOCUS_WEIGHT = 520;

const copy = {
  ja: {
    role: "株式会社Elith 取締役CAIO",
    portraitAlt: "下垣内隆太のプロフィール画像",
    socialLabel: "公開アカウント",
    name: "下垣内 隆太（Ryuta Shimogauchi）",
  },
  en: {
    role: "Board Director & Chief AI Officer, Elith Inc.",
    portraitAlt: "Portrait of Ryuta Shimogauchi",
    socialLabel: "Public profiles",
    name: "Ryuta Shimogauchi (下垣内 隆太)",
  },
} satisfies Record<Language, Record<string, string>>;

/** Letters near the cursor gain weight, as if the reader's attention were a lens. */
function useAttentiveName(name: React.RefObject<HTMLHeadingElement | null>) {
  useEffect(() => {
    const heading = name.current;
    if (!heading || prefersReducedMotion() || !hasFinePointer()) return;
    const letters = [...heading.querySelectorAll<HTMLElement>(".char > span")];
    let centers: { x: number; y: number }[] = [];
    let weights = letters.map(() => REST_WEIGHT);
    let measuredAt = -1;
    const measure = () => {
      centers = letters.map((letter) => {
        const rect = letter.parentElement!.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + window.scrollY + rect.height / 2,
        };
      });
    };
    const settle = () => heading.classList.add("is-attentive");
    // Let the entrance animation own font-weight until it has finished.
    const ready = window.setTimeout(settle, 2600);
    const stop = onFrame((frame) => {
      if (!heading.classList.contains("is-attentive")) return;
      if (frame.smoothY > frame.vh * 1.2) return;
      if (measuredAt !== frame.vw) {
        measure();
        measuredAt = frame.vw;
      }
      const radius = Math.max(200, frame.vw * 0.19);
      let easing = false;
      weights = weights.map((weight, index) => {
        const center = centers[index];
        const distance = Math.hypot(
          frame.lightX - center.x,
          frame.lightY + frame.scrollY - center.y,
        );
        const focus = frame.hasPointer ? Math.max(0, 1 - distance / radius) : 0;
        const target =
          REST_WEIGHT +
          (FOCUS_WEIGHT - REST_WEIGHT) * focus * focus * (3 - 2 * focus);
        if (Math.abs(target - weight) < 0.5) return target;
        easing = true;
        return weight + (target - weight) * 0.22;
      });
      letters.forEach((letter, index) => {
        letter.style.fontWeight = weights[index].toFixed(0);
      });
      return easing;
    });
    const remeasure = () => {
      measuredAt = -1;
    };
    window.addEventListener("resize", remeasure);
    // Letter positions move once the display face has loaded.
    document.fonts?.ready.then(remeasure);
    return () => {
      window.clearTimeout(ready);
      window.removeEventListener("resize", remeasure);
      stop();
    };
  }, [name]);
}

export function Hero({ language }: { language: Language }) {
  const text = copy[language];
  const name = useRef<HTMLHeadingElement>(null);
  useAttentiveName(name);

  return (
    <section className="hero" id="profile" aria-labelledby="profile-name">
      <div className="wrap hero-grid">
        <h1 className="hero-name" id="profile-name" ref={name}>
          <span className="visually-hidden">{text.name}</span>
          {nameLines.map((line, lineIndex) => (
            <span className="name-line" aria-hidden="true" key={lineIndex}>
              {line.map(({ character, index }) => (
                <span
                  className="char"
                  key={index}
                  style={{ "--i": index } as React.CSSProperties}
                >
                  <span>{character}</span>
                </span>
              ))}
            </span>
          ))}
        </h1>

        <p className="hero-kanji" lang="ja" aria-hidden="true" data-drift="-0.07">
          {[..."下垣内 隆太"].map((character, index) => (
            <span key={index} style={{ "--i": index } as React.CSSProperties}>
              {character === " " ? "　" : character}
            </span>
          ))}
        </p>

        <figure className="hero-portrait" data-drift="0.08">
          <div className="portrait-frame">
            <img
              src={`${basePath}/assets/profile.webp`}
              alt={text.portraitAlt}
              width="1024"
              height="1024"
              fetchPriority="high"
              data-drift="0.07"
            />
          </div>
        </figure>

        <div className="hero-meta">
          <p className="hero-role">{text.role}</p>
          <ul className="hero-links" aria-label={text.socialLabel}>
            {socialLinks.map((link, index) => (
              <li
                key={link.label}
                style={{ "--i": index } as React.CSSProperties}
              >
                <a
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
              </li>
            ))}
          </ul>
        </div>

        <span className="hero-cue" aria-hidden="true" />
      </div>
    </section>
  );
}
