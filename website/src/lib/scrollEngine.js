// lib/scrollEngine.js

let callbacks = new Set();
let initialized = false;
let currentY = 0;

function emit() {
  for (const cb of callbacks) {
    try {
      cb(currentY);
    } catch (e) {
      console.warn("ScrollEngine callback error:", e);
    }
  }
}

export function initScrollEngine() {
  if (initialized) return;
  initialized = true;
}

export function destroyScrollEngine() {
  callbacks.clear();
  initialized = false;
  currentY = 0;
}

export function registerParallax(cb) {
  callbacks.add(cb);

  // appel immédiat pour éviter un "flash" au montage
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
  currentY = y;
  emit();
}

export function getScrollY() {
  return currentY;
}