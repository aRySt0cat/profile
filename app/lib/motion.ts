/**
 * One requestAnimationFrame loop for every scroll- and pointer-linked effect.
 * Values are eased toward their targets so layers glide rather than jump,
 * and the loop sleeps as soon as everything has settled.
 */
export type Frame = {
  scrollY: number;
  smoothY: number;
  pointerX: number;
  pointerY: number;
  lightX: number;
  lightY: number;
  hasPointer: boolean;
  vw: number;
  vh: number;
};

/** Return `true` to ask for another frame while a listener is still easing. */
type Listener = (frame: Frame) => boolean | void;

const listeners = new Set<Listener>();
const frame: Frame = {
  scrollY: 0,
  smoothY: 0,
  pointerX: 0,
  pointerY: 0,
  lightX: 0,
  lightY: 0,
  hasPointer: false,
  vw: 0,
  vh: 0,
};
let raf = 0;
let last = 0;
let started = false;

const ease = (current: number, target: number, rate: number, dt: number) =>
  current + (target - current) * (1 - Math.pow(1 - rate, dt / 16.667));

function tick(now: number) {
  const dt = Math.min(64, last ? now - last : 16.667);
  last = now;
  frame.scrollY = window.scrollY;
  frame.vw = window.innerWidth;
  frame.vh = window.innerHeight;
  frame.smoothY = ease(frame.smoothY, frame.scrollY, 0.14, dt);
  frame.lightX = ease(frame.lightX, frame.pointerX, 0.09, dt);
  frame.lightY = ease(frame.lightY, frame.pointerY, 0.09, dt);
  const settled =
    Math.abs(frame.smoothY - frame.scrollY) < 0.1 &&
    Math.abs(frame.lightX - frame.pointerX) < 0.1 &&
    Math.abs(frame.lightY - frame.pointerY) < 0.1;
  if (settled) {
    frame.smoothY = frame.scrollY;
    frame.lightX = frame.pointerX;
    frame.lightY = frame.pointerY;
  }
  let busy = false;
  listeners.forEach((listener) => {
    if (listener(frame)) busy = true;
  });
  if (settled && !busy) {
    raf = 0;
    last = 0;
  } else raf = window.requestAnimationFrame(tick);
}

export function wake() {
  if (!raf && typeof window !== "undefined")
    raf = window.requestAnimationFrame(tick);
}

function start() {
  if (started) return;
  started = true;
  frame.scrollY = frame.smoothY = window.scrollY;
  frame.pointerX = frame.lightX = window.innerWidth * 0.72;
  frame.pointerY = frame.lightY = window.innerHeight * 0.3;
  window.addEventListener("scroll", wake, { passive: true });
  window.addEventListener("resize", wake);
  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse") return;
      frame.pointerX = event.clientX;
      frame.pointerY = event.clientY;
      frame.hasPointer = true;
      wake();
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () => {
    frame.hasPointer = false;
    wake();
  });
}

export function onFrame(listener: Listener) {
  start();
  listeners.add(listener);
  // Draw once immediately so layers never wait for the first scroll.
  wake();
  return () => {
    listeners.delete(listener);
  };
}

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const hasFinePointer = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;
