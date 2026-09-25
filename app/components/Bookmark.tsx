"use client";

import { useEffect, useRef, useState } from "react";
import type { Language } from "../../src/data/activities";
import { onFrame } from "../lib/motion";

type Tick = { year: string; id: string; at: number };

const DIGITS = Array.from({ length: 10 }, (_, digit) => digit);

/** Document offset from layout alone, ignoring reveal transforms. */
function documentTop(element: HTMLElement) {
  let top = 0;
  for (
    let node: HTMLElement | null = element;
    node;
    node = node.offsetParent as HTMLElement | null
  )
    top += node.offsetTop;
  return top;
}

/** Four digit wheels that roll to the next year instead of swapping text. */
function Odometer({ value }: { value: string }) {
  return (
    <span className="odometer">
      {[...value].map((digit, index) => (
        <span className="odometer-wheel" key={index}>
          <span
            className="odometer-strip"
            style={
              { "--digit": digit, "--i": index } as React.CSSProperties
            }
          >
            {DIGITS.map((option) => (
              <span key={option}>{option}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}

/**
 * A ribbon in the margin that follows the reader through the page. Its
 * marks sit exactly where the year of the entry being read changes, so the
 * rail doubles as a chronological index: the page reads back through time.
 */
export function Bookmark({ language }: { language: Language }) {
  const rail = useRef<HTMLElement>(null);
  const [ticks, setTicks] = useState<Tick[]>([]);
  const [year, setYear] = useState<string | null>(null);

  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const track = element.querySelector<HTMLElement>(".bookmark-track")!;
    let markers: { year: string; offset: number }[] = [];
    let height = 1;
    let max = 1;
    let shown: string | null = null;

    const measure = () => {
      const readingLine = window.innerHeight * 0.42;
      max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      height = track.offsetHeight;
      const seen = new Map<string, Tick>();
      markers = [
        ...document.querySelectorAll<HTMLElement>("[data-year]"),
      ].map((marker) => {
        const offset = documentTop(marker) - readingLine;
        const year = marker.dataset.year!;
        if (!seen.has(year))
          seen.set(year, {
            year,
            id: marker.id,
            at: Math.max(0, Math.min(1, offset / max)),
          });
        return { year, offset };
      });
      setTicks([...seen.values()]);
    };

    const stop = onFrame((frame) => {
      const progress = Math.max(0, Math.min(1, frame.smoothY / max));
      element.style.setProperty("--progress", progress.toFixed(5));
      element.style.setProperty("--y", `${(progress * height).toFixed(2)}px`);
      let current: string | null = null;
      for (const marker of markers)
        if (marker.offset <= frame.smoothY + 1) current = marker.year;
      if (current !== shown) {
        shown = current;
        setYear(current);
      }
    });

    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      stop();
      resize.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <nav
      className="bookmark"
      ref={rail}
      aria-label={language === "ja" ? "年代で移動" : "Browse by year"}
      data-active={year ? "" : undefined}
    >
      <div className="bookmark-track">
        <span className="bookmark-fill" aria-hidden="true" />
        <ol>
          {ticks.map((tick) => (
            <li
              key={tick.year}
              style={{ "--at": tick.at } as React.CSSProperties}
              data-current={tick.year === year ? "" : undefined}
            >
              <a href={`#${tick.id}`}>
                <span className="bookmark-tick" aria-hidden="true" />
                <span className="bookmark-label">{tick.year}</span>
              </a>
            </li>
          ))}
        </ol>
        <span className="bookmark-marker" aria-hidden="true">
          <span className="bookmark-dot" />
          <Odometer value={year ?? ticks[0]?.year ?? "0000"} />
        </span>
      </div>
    </nav>
  );
}
