"use client";

import { useEffect } from "react";
import { hasFinePointer, onFrame, prefersReducedMotion } from "../lib/motion";

/**
 * Page-wide motion: reveals content as it enters the viewport, drives the
 * scroll-linked layers, and moves the light that follows the cursor.
 * Everything here is decoration layered on top of fully rendered HTML.
 */
export function MotionDirector() {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motion = "ready";
    const still = prefersReducedMotion();
    const fine = hasFinePointer();

    let batch = 0;
    const reveal = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target as HTMLElement)
          .sort((a, b) =>
            a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
              ? -1
              : 1,
          );
        batch += 1;
        visible.forEach((element, index) => {
          element.style.setProperty("--stagger", `${index * 90}ms`);
          element.dataset.inview = String(batch);
          reveal.unobserve(element);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );
    const scan = () =>
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not([data-inview])")
        .forEach((element) => reveal.observe(element));
    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });

    const header = document.querySelector<HTMLElement>(".site-header");
    const atmosphere = document.querySelector<HTMLElement>(".atmosphere");
    const hero = document.querySelector<HTMLElement>(".hero");
    const drifting = [...document.querySelectorAll<HTMLElement>("[data-drift]")];
    const shifting = [...document.querySelectorAll<HTMLElement>("[data-shift]")];

    const stop = onFrame((frame) => {
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - frame.vh,
      );
      if (header) {
        header.toggleAttribute("data-scrolled", frame.scrollY > 16);
        header.style.setProperty(
          "--progress",
          String(Math.min(1, frame.smoothY / max)),
        );
      }
      if (still) return;
      if (hero) {
        const progress = Math.min(1, frame.smoothY / Math.max(1, frame.vh));
        hero.style.setProperty("--hero-progress", progress.toFixed(4));
        if (progress < 1)
          drifting.forEach((element) => {
            const speed = Number(element.dataset.drift);
            element.style.translate = `0 ${(frame.smoothY * speed).toFixed(2)}px`;
          });
      }
      const rects = shifting.map((element) =>
        element.parentElement!.getBoundingClientRect(),
      );
      shifting.forEach((element, index) => {
        const rect = rects[index];
        if (rect.bottom < -200 || rect.top > frame.vh + 200) return;
        // Measured against the eased scroll so the title trails the page a
        // little and settles after the reader stops.
        const lag = frame.scrollY - frame.smoothY;
        const offset = rect.top + rect.height / 2 - frame.vh / 2 + lag;
        // Narrow screens have less room for the title to travel.
        const speed =
          Number(element.dataset.shift) * (frame.vw < 640 ? 0.35 : 1);
        element.style.translate = `${(offset * speed).toFixed(2)}px 0`;
      });
      if (atmosphere && fine) {
        atmosphere.style.setProperty("--mx", `${frame.lightX.toFixed(1)}px`);
        atmosphere.style.setProperty("--my", `${frame.lightY.toFixed(1)}px`);
        atmosphere.style.setProperty(
          "--scroll",
          `${(-frame.smoothY).toFixed(1)}px`,
        );
        atmosphere.toggleAttribute("data-pointer", frame.hasPointer);
      }
    });

    return () => {
      stop();
      reveal.disconnect();
      mutations.disconnect();
    };
  }, []);

  return null;
}
