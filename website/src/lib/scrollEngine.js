// lib/scrollEngine.js

let callbacks = new Set();
let ticking = false;
let scrollY = 0;
let initialized = false;

function loop() {
  for (const cb of callbacks) {
    try {
      cb(scrollY);
    } catch (e) {
      console.warn("ScrollEngine callback error:", e);
    }
  }
  ticking = false;
}

function onScroll() {
  scrollY = window.scrollY || window.pageYOffset;

  if (!ticking) {
    requestAnimationFrame(loop);
    ticking = true;
  }
}

export function initScrollEngine() {
  if (initialized) return;

  window.addEventListener("scroll", onScroll, { passive: true });
  initialized = true;
}

export function destroyScrollEngine() {
  window.removeEventListener("scroll", onScroll);
  callbacks.clear();
  initialized = false;
}

export function registerParallax(cb) {
  callbacks.add(cb);
}

export function unregisterParallax(cb) {
  callbacks.delete(cb);
}