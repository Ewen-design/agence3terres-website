let callbacks = new Set();
let initialized = false;
let currentY = 0;
let cachedVh = 0;
let cachedVw = 0;

function readViewport() {
  cachedVh = window.innerHeight || 0;
  cachedVw = window.innerWidth || 0;
}

export function updateScrollEngineViewport() {
  readViewport();
}

function getContext() {
  return {
    vh: cachedVh,
    vw: cachedVw,
    isMobile: cachedVw <= 900
  };
}

function emit() {
  const ctx = getContext();
  const list = Array.from(callbacks);

  for (const cb of list) {
    try {
      cb(currentY, ctx);
    } catch (e) {
      console.warn('ScrollEngine callback error:', e);
    }
  }
}

export function initScrollEngine() {
  if (initialized) return;
  initialized = true;
  readViewport();
  window.addEventListener('resize', updateScrollEngineViewport, { passive: true });
}

export function destroyScrollEngine() {
  if (!initialized) return;
  callbacks.clear();
  window.removeEventListener('resize', updateScrollEngineViewport);
  initialized = false;
  currentY = 0;
  cachedVh = 0;
  cachedVw = 0;
}

export function updateScrollEngine(y) {
  currentY = Number.isFinite(y) ? y : 0;
  emit();
}

export function registerParallax(cb) {
  callbacks.add(cb);

  if (!cachedVh || !cachedVw) {
    readViewport();
  }

  try {
    cb(currentY, getContext());
  } catch (e) {
    console.warn('ScrollEngine callback error:', e);
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