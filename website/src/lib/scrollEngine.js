// lib/scrollEngine.js

let callbacks = new Set();
let initialized = false;

let currentY = 0;
let targetY = 0;
let ticking = false;

const VIEWPORT_MARGIN = 800;

function emit() {
  const vh = window.innerHeight;
  const vw = window.innerWidth;

  callbacks.forEach((cb) => {
    try {
      cb(currentY, {
        vh,
        vw,
        isMobile: vw <= 900
      });
    } catch (e) {
      console.warn("ScrollEngine callback error:", e);
    }
  });
}

function tick() {
  ticking = false;

  if (Math.abs(targetY - currentY) < 0.1) {
    currentY = targetY;
    emit();
    return;
  }

  currentY = targetY;
  emit();
}

function requestTick() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(tick);
}

export function initScrollEngine() {
  if (initialized) return;
  initialized = true;
}

export function destroyScrollEngine() {
  callbacks.clear();
  initialized = false;
  currentY = 0;
  targetY = 0;
  ticking = false;
}

export function registerParallax(cb) {
  callbacks.add(cb);

  try {
    cb(currentY, {
      vh: window.innerHeight,
      vw: window.innerWidth,
      isMobile: window.innerWidth <= 900
    });
  } catch (e) {
    console.warn("ScrollEngine callback error:", e);
  }
}

export function unregisterParallax(cb) {
  callbacks.delete(cb);
}

export function updateScrollEngine(y) {
  targetY = y;
  requestTick();
}

export function forceScrollEngineUpdate() {
  requestTick();
}

export function getScrollY() {
  return currentY;
}

export function sectionIsNearViewport(rect) {
  const vh = window.innerHeight;

  return !(
    rect.bottom < -VIEWPORT_MARGIN ||
    rect.top > vh + VIEWPORT_MARGIN
  );
}