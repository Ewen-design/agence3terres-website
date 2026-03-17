// lib/scrollEngine.js
//
// Single broadcast layer. Lenis calls updateScrollEngine(y) each RAF frame.
// We fan-out to all registered callbacks synchronously — no extra RAF, no lerp.
//
// winH / vw are cached here and updated only on resize (via updateScrollEngineViewport).
// This prevents layout queries (window.innerHeight) inside scroll callbacks,
// which would force a reflow on every frame and cause jank.

let callbacks   = new Set();
let initialized = false;
let currentY    = 0;
let cachedVh    = 0;
let cachedVw    = 0;

function readViewport() {
  cachedVh = window.innerHeight || 0;
  cachedVw = window.innerWidth  || 0;
}

// Called once at init and on every resize from App.svelte
export function updateScrollEngineViewport() {
  readViewport();
}

function emit() {
  const ctx = { vh: cachedVh, vw: cachedVw, isMobile: cachedVw <= 900 };
  callbacks.forEach((cb) => {
    try { cb(currentY, ctx); }
    catch (e) { console.warn("ScrollEngine callback error:", e); }
  });
}

export function initScrollEngine() {
  if (initialized) return;
  initialized = true;
  readViewport();
  // Keep viewport fresh on resize — single listener for the whole app
  window.addEventListener("resize", updateScrollEngineViewport, { passive: true });
}

export function destroyScrollEngine() {
  callbacks.clear();
  window.removeEventListener("resize", updateScrollEngineViewport);
  initialized = false;
  currentY = 0;
}

// Called by App.svelte inside lenis.on("scroll", e => updateScrollEngine(e.animatedScroll))
// Already on Lenis RAF cadence — fan-out immediately, no buffering.
export function updateScrollEngine(y) {
  currentY = y;
  emit();
}

export function registerParallax(cb) {
  callbacks.add(cb);
  if (!cachedVh) readViewport();
  // Fire once immediately so the component draws at the current scroll position
  try {
    cb(currentY, { vh: cachedVh, vw: cachedVw, isMobile: cachedVw <= 900 });
  } catch (e) {
    console.warn("ScrollEngine callback error:", e);
  }
}

export function unregisterParallax(cb) {
  callbacks.delete(cb);
}

export function forceScrollEngineUpdate() {
  emit();
}

export function getScrollY() {
  return currentY;
}