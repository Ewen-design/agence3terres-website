let initialized = false;

let currentY = 0;
let lastY = 0;
let delta = 0;
let direction = 0;
let velocity = 0;
let smoothVelocity = 0;

let cachedVh = 0;
let cachedVw = 0;
let isMobile = false;

let rafId = 0;

const parallaxCallbacks = [];
const readCallbacks = [];
const writeCallbacks = [];

function readViewport() {
  cachedVh = window.innerHeight || 0;
  cachedVw = window.innerWidth || 0;
  isMobile = cachedVw <= 900;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function quantizeY(y) {
  return Math.round(y * 4) / 4;
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

function sortByPriority(list) {
  list.sort((a, b) => (a.priority || 0) - (b.priority || 0));
}

function makeContext(y) {
  return {
    y,
    vh: cachedVh,
    vw: cachedVw,
    delta,
    direction,
    velocity,
    smoothVelocity,
    isMobile
  };
}

function runRegistry(list, y, ctx) {
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (!item || typeof item.callback !== "function") continue;
    item.callback(y, ctx);
  }
}

function emitFrame() {
  rafId = 0;

  const maxScroll = getMaxScroll();
  currentY = quantizeY(clamp(getNativeScrollY(), 0, maxScroll));

  delta = currentY - lastY;
  direction = delta === 0 ? 0 : delta > 0 ? 1 : -1;
  velocity = delta;
  smoothVelocity += (velocity - smoothVelocity) * 0.14;

  const ctx = makeContext(currentY);

  runRegistry(readCallbacks, currentY, ctx);
  runRegistry(parallaxCallbacks, currentY, ctx);
  runRegistry(writeCallbacks, currentY, ctx);

  lastY = currentY;
}

function requestEmit() {
  if (rafId) return;
  rafId = requestAnimationFrame(emitFrame);
}

function handleScroll() {
  requestEmit();
}

function handleResize() {
  readViewport();
  requestEmit();
}

export function initScrollEngine() {
  if (initialized || typeof window === "undefined") return;

  initialized = true;

  readViewport();

  currentY = quantizeY(getNativeScrollY());
  lastY = currentY;
  delta = 0;
  direction = 0;
  velocity = 0;
  smoothVelocity = 0;

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleResize, { passive: true });
  window.addEventListener("orientationchange", handleResize, { passive: true });

  const ctx = makeContext(currentY);
  runRegistry(readCallbacks, currentY, ctx);
  runRegistry(parallaxCallbacks, currentY, ctx);
  runRegistry(writeCallbacks, currentY, ctx);
}

export function destroyScrollEngine() {
  if (!initialized || typeof window === "undefined") return;

  initialized = false;

  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;

  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("orientationchange", handleResize);
}

export function forceScrollEngineUpdate() {
  if (typeof window === "undefined") return;
  readViewport();
  requestEmit();
}

export function updateScrollEngine() {
  if (typeof window === "undefined") return;
  requestEmit();
}

export function updateScrollEngineViewport() {
  if (typeof window === "undefined") return;
  handleResize();
}

export function getScrollEngineState() {
  return {
    y: currentY,
    delta,
    direction,
    velocity,
    smoothVelocity,
    vh: cachedVh,
    vw: cachedVw,
    isMobile
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