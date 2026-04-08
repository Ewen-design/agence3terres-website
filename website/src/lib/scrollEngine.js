let initialized = false;

/* -------------------------------------------------------------------------- */
/* State                                                                      */
/* -------------------------------------------------------------------------- */

let currentY = 0;
let cachedVh = 0;
let cachedVw = 0;
let isMobile = false;

let rafId = 0;
let ticking = false;

/* -------------------------------------------------------------------------- */
/* Registries                                                                 */
/* -------------------------------------------------------------------------- */

const parallaxCallbacks = [];
const readCallbacks = [];
const writeCallbacks = [];

/* -------------------------------------------------------------------------- */
/* Shared context                                                             */
/* -------------------------------------------------------------------------- */

const sharedCtx = {
  y: 0,
  delta: 0,
  direction: 0,
  velocity: 0,
  smoothVelocity: 0,
  vh: 0,
  vw: 0,
  isMobile: false,
  dt: 16.67
};

/* -------------------------------------------------------------------------- */
/* Utils                                                                      */
/* -------------------------------------------------------------------------- */

function readViewport() {
  cachedVh = window.innerHeight || 0;
  cachedVw = window.innerWidth || 0;
  isMobile = cachedVw <= 900;
}

function getNativeScrollY() {
  return window.scrollY || window.pageYOffset || 0;
}

function sortByPriority(list) {
  list.sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

function updateSharedContext() {
  sharedCtx.y = currentY;
  sharedCtx.delta = 0;
  sharedCtx.direction = 0;
  sharedCtx.velocity = 0;
  sharedCtx.smoothVelocity = 0;
  sharedCtx.vh = cachedVh;
  sharedCtx.vw = cachedVw;
  sharedCtx.isMobile = isMobile;
  sharedCtx.dt = 16.67;
  return sharedCtx;
}

function safeCall(fn, ctx) {
  try {
    fn(ctx.y, ctx);
  } catch (e) {
    console.warn("ScrollEngine callback error:", e);
  }
}

function safeCallRead(fn, ctx) {
  try {
    fn(ctx);
  } catch (e) {
    console.warn("ScrollEngine read callback error:", e);
  }
}

function safeCallWrite(fn, ctx) {
  try {
    fn(ctx);
  } catch (e) {
    console.warn("ScrollEngine write callback error:", e);
  }
}

function runReadPhase(ctx) {
  for (let i = 0; i < readCallbacks.length; i++) {
    const item = readCallbacks[i];
    if (item.active) safeCallRead(item.cb, ctx);
  }
}

function runParallaxPhase(ctx) {
  for (let i = 0; i < parallaxCallbacks.length; i++) {
    const item = parallaxCallbacks[i];
    if (item.active) safeCall(item.cb, ctx);
  }
}

function runWritePhase(ctx) {
  for (let i = 0; i < writeCallbacks.length; i++) {
    const item = writeCallbacks[i];
    if (item.active) safeCallWrite(item.cb, ctx);
  }
}

function runAllPhases() {
  const ctx = updateSharedContext();
  runReadPhase(ctx);
  runParallaxPhase(ctx);
  runWritePhase(ctx);
}

function ensureViewportReady() {
  if (!cachedVh || !cachedVw) {
    readViewport();
    updateSharedContext();
  }
}

/* -------------------------------------------------------------------------- */
/* Native loop                                                                */
/* -------------------------------------------------------------------------- */

function flush() {
  ticking = false;
  currentY = getNativeScrollY();
  runAllPhases();
}

function requestFlush() {
  if (!initialized || ticking) return;
  ticking = true;
  rafId = requestAnimationFrame(flush);
}

function handleNativeScroll() {
  requestFlush();
}

function handleNativeResize() {
  readViewport();
  requestFlush();
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

export function initScrollEngine() {
  if (initialized) return;

  initialized = true;

  readViewport();
  currentY = getNativeScrollY();
  rafId = 0;
  ticking = false;

  updateSharedContext();

  window.addEventListener("scroll", handleNativeScroll, { passive: true });
  window.addEventListener("resize", handleNativeResize, { passive: true });
  window.addEventListener("orientationchange", handleNativeResize, { passive: true });
}

export function destroyScrollEngine() {
  if (!initialized) return;

  initialized = false;

  window.removeEventListener("scroll", handleNativeScroll);
  window.removeEventListener("resize", handleNativeResize);
  window.removeEventListener("orientationchange", handleNativeResize);

  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  ticking = false;

  parallaxCallbacks.length = 0;
  readCallbacks.length = 0;
  writeCallbacks.length = 0;

  currentY = 0;
  cachedVh = 0;
  cachedVw = 0;
  isMobile = false;

  updateSharedContext();
}

export function updateScrollEngineViewport() {
  if (!initialized) return;
  readViewport();
  runAllPhases();
}

export function updateScrollEngine(y) {
  if (!initialized) return;

  currentY = Number.isFinite(y) ? y : getNativeScrollY();
  runAllPhases();
}

export function forceScrollEngineUpdate() {
  if (!initialized) return;

  currentY = getNativeScrollY();
  runAllPhases();
}

export function getScrollY() {
  return getNativeScrollY();
}

export function getScrollContext() {
  currentY = getNativeScrollY();
  return updateSharedContext();
}

/* -------------------------------------------------------------------------- */
/* Registration helpers                                                       */
/* -------------------------------------------------------------------------- */

function createEntry(cb, priority = 0) {
  return {
    cb,
    priority,
    active: true
  };
}

export function registerParallax(cb, options = {}) {
  const entry = createEntry(cb, options.priority || 0);
  parallaxCallbacks.push(entry);
  sortByPriority(parallaxCallbacks);

  ensureViewportReady();
  safeCall(cb, updateSharedContext());

  return () => {
    const index = parallaxCallbacks.indexOf(entry);
    if (index !== -1) parallaxCallbacks.splice(index, 1);
  };
}

export function unregisterParallax(cb) {
  const index = parallaxCallbacks.findIndex((item) => item.cb === cb);
  if (index !== -1) parallaxCallbacks.splice(index, 1);
}

export function registerRead(cb, options = {}) {
  const entry = createEntry(cb, options.priority || 0);
  readCallbacks.push(entry);
  sortByPriority(readCallbacks);

  ensureViewportReady();
  safeCallRead(cb, updateSharedContext());

  return () => {
    const index = readCallbacks.indexOf(entry);
    if (index !== -1) readCallbacks.splice(index, 1);
  };
}

export function unregisterRead(cb) {
  const index = readCallbacks.findIndex((item) => item.cb === cb);
  if (index !== -1) readCallbacks.splice(index, 1);
}

export function registerWrite(cb, options = {}) {
  const entry = createEntry(cb, options.priority || 0);
  writeCallbacks.push(entry);
  sortByPriority(writeCallbacks);

  ensureViewportReady();
  safeCallWrite(cb, updateSharedContext());

  return () => {
    const index = writeCallbacks.indexOf(entry);
    if (index !== -1) writeCallbacks.splice(index, 1);
  };
}

export function unregisterWrite(cb) {
  const index = writeCallbacks.findIndex((item) => item.cb === cb);
  if (index !== -1) writeCallbacks.splice(index, 1);
}

export function setParallaxActive(cb, active) {
  const item = parallaxCallbacks.find((entry) => entry.cb === cb);
  if (item) item.active = !!active;
}

export function setReadActive(cb, active) {
  const item = readCallbacks.find((entry) => entry.cb === cb);
  if (item) item.active = !!active;
}

export function setWriteActive(cb, active) {
  const item = writeCallbacks.find((entry) => entry.cb === cb);
  if (item) item.active = !!active;
}