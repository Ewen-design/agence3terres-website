// lib/scrollEngine.js

let callbacks = new Set();
let initialized = false;

let currentY = 0;
let lastY = -1;

const VIEWPORT_MARGIN = 800; 
// distance avant/après le viewport pour activer une section

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

  // évite les updates trop petites
  if (Math.abs(y - lastY) < 0.5) return;

  lastY = y;
  currentY = y;

  emit();
}

export function getScrollY() {
  return currentY;
}

/*
UTILITAIRE POUR LES COMPOSANTS

Permet de savoir si une section est proche du viewport.
*/
export function sectionIsNearViewport(rect) {

  const vh = window.innerHeight;

  return !(
    rect.bottom < -VIEWPORT_MARGIN ||
    rect.top > vh + VIEWPORT_MARGIN
  );
}