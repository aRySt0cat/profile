import { prefersReducedMotion } from "./motion";

let running = 0;

/**
 * Runs a DOM update inside a View Transition when the browser supports it,
 * so entries glide to their new places instead of jumping. `update` must
 * change the DOM synchronously (wrap React state in `flushSync`).
 */
export function transition(update: () => void) {
  if (!document.startViewTransition || prefersReducedMotion()) {
    update();
    return;
  }
  const root = document.documentElement;
  // Names are only assigned while a transition runs; a newer transition
  // skipping an older one must not strip them early.
  running += 1;
  root.classList.add("vt");
  const view = document.startViewTransition(update);
  view.finished.finally(() => {
    running -= 1;
    if (!running) root.classList.remove("vt");
  });
}
