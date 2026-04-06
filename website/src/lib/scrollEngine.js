let initialized = false;

/* -------------------------------------------------------------------------- */
/* State                                                                      */
/* -------------------------------------------------------------------------- */

let currentY = 0;
let targetY = 0;
let lastY = 0;

let delta = 0;
let direction = 0;
let velocity = 0;
let smoothVelocity = 0;

let cachedVh = 0;
let cachedVw = 0;
let isMobile = false;

let lastFrameTime = 0;
let rafId = 0;
let scheduled = false;

/* -------------------------------------------------------------------------- */
/* Registries                                                                 */
/* -------------------------------------------------------------------------- */

const parallaxCallbacks = [];
const readCallbacks = [];
const writeCallbacks = [];

/* -------------------------------------------------------------------------- */
/* Utils                                                                      */
/* -------------------------------------------------------------------------- */

function readViewport() {
  cachedVh = window.innerHeight || 0;
  cachedVw = window.innerWidth || 0;
  isMobile = cachedVw <= 900;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function getThreshold() {
  return isMobile ? 0.35 : 0.15;
}

function quantize(value, step) {
  if (!step) return value;
  return Math.round(value / step) * step;
}

function sortByPriority(list) {
  list.sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

function buildContext(dt) {
  return {
    y: currentY,
    delta,
    direction,
    velocity,
    smoothVelocity,
    vh: cachedVh,
    vw: cachedVw,
    isMobile,
    dt
  };
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

/* -------------------------------------------------------------------------- */
/* Core frame                                                                 */
/* -------------------------------------------------------------------------- */

function runFrame(now) {
  scheduled = false;

  const dt = lastFrameTime ? clamp(now - lastFrameTime, 8, 34) : 16.67;
  lastFrameTime = now;

  const nextY = Number.isFinite(targetY) ? targetY : 0;
  const rawDelta = nextY - lastY;
  const threshold = getThreshold();

  if (Math.abs(rawDelta) < threshold && Math.abs(nextY - currentY) < threshold) {
    return;
  }

  currentY = quantize(nextY, isMobile ? 0.02 : 0.01);
  delta = currentY - lastY;
  direction = delta > 0 ? 1 : delta < 0 ? -1 : 0;

  const instantVelocity = dt > 0 ? delta / dt : 0;
  velocity = instantVelocity;
  smoothVelocity = lerp(smoothVelocity, instantVelocity, isMobile ? 0.1 : 0.16);

  const ctx = buildContext(dt);

  for (let i = 0; i < readCallbacks.length; i++) {
    const item = readCallbacks[i];
    if (!item.active) continue;
    safeCallRead(item.cb, ctx);
  }

  for (let i = 0; i < parallaxCallbacks.length; i++) {
    const item = parallaxCallbacks[i];
    if (!item.active) continue;
    safeCall(item.cb, ctx);
  }

  for (let i = 0; i < writeCallbacks.length; i++) {
    const item = writeCallbacks[i];
    if (!item.active) continue;
    safeCallWrite(item.cb, ctx);
  }

  lastY = currentY;
}

function schedule() {
  if (scheduled) return;
  scheduled = true;
  rafId = requestAnimationFrame(runFrame);
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

export function initScrollEngine() {
  if (initialized) return;
  initialized = true;

  readViewport();
  lastFrameTime = performance.now();
  currentY = 0;
  targetY = 0;
  lastY = 0;
  delta = 0;
  direction = 0;
  velocity = 0;
  smoothVelocity = 0;

  window.addEventListener("resize", updateScrollEngineViewport, { passive: true });
}

export function destroyScrollEngine() {
  if (!initialized) return;

  initialized = false;

  window.removeEventListener("resize", updateScrollEngineViewport);

  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  scheduled = false;

  parallaxCallbacks.length = 0;
  readCallbacks.length = 0;
  writeCallbacks.length = 0;

  currentY = 0;
  targetY = 0;
  lastY = 0;
  delta = 0;
  direction = 0;
  velocity = 0;
  smoothVelocity = 0;
  cachedVh = 0;
  cachedVw = 0;
  isMobile = false;
  lastFrameTime = 0;
}

export function updateScrollEngineViewport() {
  readViewport();
}

export function updateScrollEngine(y) {
  targetY = Number.isFinite(y) ? y : 0;
  schedule();
}

export function forceScrollEngineUpdate() {
  currentY = Number.isFinite(targetY) ? targetY : currentY;
  lastY = currentY;

  const ctx = buildContext(16.67);

  for (let i = 0; i < readCallbacks.length; i++) {
    const item = readCallbacks[i];
    if (!item.active) continue;
    safeCallRead(item.cb, ctx);
  }

  for (let i = 0; i < parallaxCallbacks.length; i++) {
    const item = parallaxCallbacks[i];
    if (!item.active) continue;
    safeCall(item.cb, ctx);
  }

  for (let i = 0; i < writeCallbacks.length; i++) {
    const item = writeCallbacks[i];
    if (!item.active) continue;
    safeCallWrite(item.cb, ctx);
  }
}

export function getScrollY() {
  return currentY;
}

export function getScrollContext() {
  return buildContext(16.67);
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

  if (!cachedVh || !cachedVw) {
    readViewport();
  }

  safeCall(cb, buildContext(16.67));

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

  safeCallRead(cb, buildContext(16.67));

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

  safeCallWrite(cb, buildContext(16.67));

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