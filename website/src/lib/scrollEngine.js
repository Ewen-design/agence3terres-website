let callbacks = [];
let ticking = false;
let scrollY = 0;
let initialized = false;

function loop() {
  callbacks.forEach(cb => cb(scrollY));
  ticking = false;
}

function onScroll() {
  scrollY = window.scrollY;
  if (!ticking) {
    requestAnimationFrame(loop);
    ticking = true;
  }
}

export function initScrollEngine() {
  if (initialized) return;
  window.addEventListener("scroll", onScroll, { passive: true });
  initialized = true;
}

export function registerParallax(cb) {
  callbacks.push(cb);
}

export function unregisterParallax(cb) {
  callbacks = callbacks.filter(c => c !== cb);
}
