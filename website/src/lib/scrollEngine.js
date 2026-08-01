let initialized = false;

let currentY = 0;
let motionY = 0;
let lastY = 0;
let delta = 0;
let direction = 0;
let velocity = 0;
let smoothVelocity = 0;
let lastFrameTime = 0;
let lastActivityTime = 0;

let cachedVh = 0;
let cachedVw = 0;
let isMobile = false;
let isTouch = false;
let prefersReducedMotion = false;

let rafId = 0;
let viewportDirty = false;
let pendingNativeY = 0;
let resizeRafId = 0;

const IDLE_TIMEOUT_MS = 140;
const STABLE_EPSILON = 0.1;
const MOBILE_MOTION_SMOOTHING_MS = 165;
// Desktop scrolls natively (no Lenis, wheel damping disabled), so the wheel
// arrives in coarse ~100px notches. Without temporal smoothing, motionY would
// track those raw steps and every scroll-linked value driven by it (the hero
// darkening in particular) would jump notch-by-notch — the "saccadé" the darker
// the bigger the screen. Easing motionY toward currentY turns those discrete
// steps into a continuous glide; the motionSettling keep-alive below then runs
// the rAF loop until it lands, so the darkening softly settles after scroll.
const DESKTOP_MOTION_SMOOTHING_MS = 155;

const parallaxCallbacks = [];
const readCallbacks = [];
const writeCallbacks = [];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getNow() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function getNativeScrollY() {
  return window.scrollY || window.pageYOffset || 0;
}

function getMaxScroll() {
  const doc = document.documentElement;
  const body = document.body;
  return Math.max(
    0,
    (doc.scrollHeight || body.scrollHeight || 0) - (window.innerHeight || 0)
  );
}

function readViewport() {
  const viewport = window.visualViewport;
  cachedVh = Math.round(viewport?.height || window.innerHeight || 0);
  cachedVw = Math.round(viewport?.width || window.innerWidth || 0);
  isMobile = cachedVw <= 900;
  isTouch = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
  prefersReducedMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

function sortByPriority(list) {
  list.sort((a, b) => (a.priority || 0) - (b.priority || 0));
}

function makeContext(y, now) {
  return {
    y,
    motionY,
    vh: cachedVh,
    vw: cachedVw,
    delta,
    direction,
    velocity,
    smoothVelocity,
    isMobile,
    isTouch,
    prefersReducedMotion,
    now
  };
}

function runRegistry(list, y, ctx) {
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (!item || typeof item.callback !== "function") continue;
    item.callback(y, ctx);
  }
}

function emitFrame(now) {
  const maxScroll = getMaxScroll();
  const nextY = clamp(pendingNativeY, 0, maxScroll);
  const dt = Math.min(34, Math.max(16, now - (lastFrameTime || now - 16)));

  delta = nextY - lastY;
  direction = delta === 0 ? 0 : delta > 0 ? 1 : -1;
  velocity = delta;

  const smoothing = isMobile ? 0.16 : 0.14;
  smoothVelocity += (velocity - smoothVelocity) * smoothing;

  currentY = nextY;

  if (!prefersReducedMotion) {
    const smoothingMs =
      isMobile || isTouch ? MOBILE_MOTION_SMOOTHING_MS : DESKTOP_MOTION_SMOOTHING_MS;
    const motionAlpha = 1 - Math.exp(-dt / smoothingMs);
    motionY += (currentY - motionY) * motionAlpha;

    if (Math.abs(currentY - motionY) <= STABLE_EPSILON) {
      motionY = currentY;
    }
  } else {
    motionY = currentY;
  }

  const ctx = makeContext(currentY, now);

  runRegistry(readCallbacks, currentY, ctx);
  runRegistry(parallaxCallbacks, currentY, ctx);
  runRegistry(writeCallbacks, currentY, ctx);

  lastY = currentY;
  lastFrameTime = now;

  const nativeY = getNativeScrollY();
  const moved = Math.abs(nativeY - pendingNativeY) > STABLE_EPSILON;
  pendingNativeY = nativeY;

  if (moved || viewportDirty || Math.abs(delta) > STABLE_EPSILON) {
    lastActivityTime = now;
  }

  viewportDirty = false;

  const keepAlive = now - lastActivityTime < IDLE_TIMEOUT_MS;
  const motionSettling = Math.abs(currentY - motionY) > STABLE_EPSILON;

  if (keepAlive || motionSettling) {
    rafId = requestAnimationFrame(loop);
  } else {
    rafId = 0;
  }
}

function loop(now) {
  emitFrame(now || getNow());
}

function startLoop() {
  if (rafId || !initialized) return;
  lastActivityTime = getNow();
  rafId = requestAnimationFrame(loop);
}

function handleScroll() {
  pendingNativeY = getNativeScrollY();
  lastActivityTime = getNow();
  startLoop();
}

function handleResize() {
  if (resizeRafId) cancelAnimationFrame(resizeRafId);

  resizeRafId = requestAnimationFrame(() => {
    resizeRafId = 0;

    const prevVh = cachedVh;
    const prevVw = cachedVw;

    readViewport();
    pendingNativeY = getNativeScrollY();

    const viewportChanged = prevVh !== cachedVh || prevVw !== cachedVw;
    const scrollChanged = Math.abs(pendingNativeY - currentY) > STABLE_EPSILON;

    if (!viewportChanged && !scrollChanged) return;

    viewportDirty = true;
    lastActivityTime = getNow();
    startLoop();
  });
}

export function initScrollEngine() {
  if (initialized || typeof window === "undefined") return;

  initialized = true;

  readViewport();

  currentY = getNativeScrollY();
  motionY = currentY;
  pendingNativeY = currentY;
  lastY = currentY;
  delta = 0;
  direction = 0;
  velocity = 0;
  smoothVelocity = 0;
  lastFrameTime = getNow();
  lastActivityTime = lastFrameTime;

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleResize, { passive: true });
  window.addEventListener("orientationchange", handleResize, { passive: true });
  window.visualViewport?.addEventListener("resize", handleResize, { passive: true });

  const ctx = makeContext(currentY, lastFrameTime);
  runRegistry(readCallbacks, currentY, ctx);
  runRegistry(parallaxCallbacks, currentY, ctx);
  runRegistry(writeCallbacks, currentY, ctx);
}

export function destroyScrollEngine() {
  if (!initialized || typeof window === "undefined") return;

  initialized = false;

  if (rafId) cancelAnimationFrame(rafId);
  if (resizeRafId) cancelAnimationFrame(resizeRafId);
  rafId = 0;
  resizeRafId = 0;

  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("orientationchange", handleResize);
  window.visualViewport?.removeEventListener("resize", handleResize);
}

export function forceScrollEngineUpdate() {
  if (typeof window === "undefined") return;
  readViewport();
  pendingNativeY = getNativeScrollY();
  viewportDirty = true;
  lastActivityTime = getNow();
  startLoop();
}

export function updateScrollEngine() {
  if (typeof window === "undefined") return;
  pendingNativeY = getNativeScrollY();
  lastActivityTime = getNow();
  startLoop();
}

export function updateScrollEngineViewport() {
  if (typeof window === "undefined") return;
  handleResize();
}

export function getScrollEngineState() {
  return {
    y: currentY,
    motionY,
    delta,
    direction,
    velocity,
    smoothVelocity,
    vh: cachedVh,
    vw: cachedVw,
    isMobile,
    isTouch,
    prefersReducedMotion
  };
}

function addToRegistry(list, callback, options = {}) {
  if (typeof callback !== "function") return;

  const existing = list.find((item) => item.callback === callback);
  if (existing) return;

  list.push({
    callback,
    priority: options.priority || 0
  });

  sortByPriority(list);
}

function removeFromRegistry(list, callback) {
  const index = list.findIndex((item) => item.callback === callback);
  if (index !== -1) list.splice(index, 1);
}

export function registerParallax(callback, options = {}) {
  addToRegistry(parallaxCallbacks, callback, options);
}

export function unregisterParallax(callback) {
  removeFromRegistry(parallaxCallbacks, callback);
}

export function registerRead(callback, options = {}) {
  addToRegistry(readCallbacks, callback, options);
}

export function unregisterRead(callback) {
  removeFromRegistry(readCallbacks, callback);
}

export function registerWrite(callback, options = {}) {
  addToRegistry(writeCallbacks, callback, options);
}

export function unregisterWrite(callback) {
  removeFromRegistry(writeCallbacks, callback);
}
