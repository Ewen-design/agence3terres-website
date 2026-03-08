// lib/scrollEngine.js

let callbacks = new Set();
let initialized = false;
let currentY = 0;
let lastY = -1;

function emit() {
  callbacks.forEach((cb) => {
    try {
      cb(currentY);
    } catch (e) {
      console.warn("ScrollEngine callback error:", e);
    }
  });
}

export function initScrollEngine() {
  if (initialized) return;
  initialized = true;
}

export function destroyScrollEngine() {
  callbacks.clear();
  initialized = false;
  currentY = 0;
  lastY = -1;
}

export function registerParallax(cb) {
  callbacks.add(cb);

  try {
    cb(currentY);
  } catch (e) {
    console.warn("ScrollEngine callback error:", e);
  }
}

export function unregisterParallax(cb) {
  callbacks.delete(cb);
}

export function updateScrollEngine(y) {

  // évite les recalculs inutiles
  if (Math.abs(y - lastY) < 0.1) return;

  lastY = y;
  currentY = y;

  emit();
}

export function getScrollY() {
  return currentY;
}