// lib/navigate.js
//
// Thin navigation wrapper that fires a GSAP wipe transition before calling
// SvelteKit's goto(). All state is module-level — only ever mutated in the
// browser (guarded by the browser check inside navigate()).
//
// Layout registers the overlay element, GSAP instance and Lenis instance once
// they are available (in onMount). Components import navigate() directly,
// removing the need to thread a navigate prop through every component tree.

import { goto } from '$app/navigation';
import { browser } from '$app/environment';

/** @type {HTMLElement | null} */
let _overlayEl = null;
let _gsap = null;
let _lenis = null;
let _isTransitioning = false;

const DURATION_IN  = 0.65;
const DURATION_OUT = 0.55;
const EASE         = 'power3.inOut';

/** Called once from +layout.svelte after the overlay element is bound. */
export function registerOverlay(el) {
  _overlayEl = el;
}

/** Called once from +layout.svelte after GSAP is dynamically imported. */
export function registerGsap(gsap) {
  _gsap = gsap;
}

/** Called once from +layout.svelte after Lenis is initialised. */
export function registerLenis(lenis) {
  _lenis = lenis;
}

/**
 * Navigate to a page with a GSAP clip-path wipe transition.
 * Accepts the same page keys used in the original app:
 *   'home' | 'travail' | 'apropos' | 'services' | 'contact' | 'projet1' | 'projet2'
 *
 * Falls back to a bare goto() if the overlay/GSAP are not ready yet.
 *
 * @param {string} page
 */
export async function navigate(page) {
  if (!browser) return;

  const url = page === 'home' ? '/' : `/${page}`;

  if (!_overlayEl || !_gsap || _isTransitioning) {
    goto(url);
    return;
  }

  _isTransitioning = true;

  // Double rAF: ensures the overlay's initial clip-path is painted before
  // GSAP starts animating (same technique as original App.svelte).
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  // Phase 1 — wipe in: overlay sweeps down from top to cover the screen.
  await new Promise((resolve) => {
    _gsap.fromTo(_overlayEl,
      { clipPath: 'polygon(0% -2%, 100% -2%, 100% -2%, 0% -2%)' },
      {
        duration: DURATION_IN,
        ease: EASE,
        clipPath: 'polygon(0% -2%, 100% -2%, 100% 102%, 0% 102%)',
        onComplete: resolve,
      }
    );
  });

  // Screen is now fully covered — safe to navigate and jump to top.
  _lenis?.scrollTo(0, { immediate: true });
  await goto(url, { noScroll: true });
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  // Phase 2 — wipe out: overlay lifts upward to reveal the new page.
  _gsap.to(_overlayEl, {
    duration: DURATION_OUT,
    ease: EASE,
    clipPath: 'polygon(0% -104%, 100% -104%, 100% -2%, 0% -2%)',
    onComplete() {
      // Snap back to the collapsed state for the next navigation.
      _gsap.set(_overlayEl, {
        clipPath: 'polygon(0% -2%, 100% -2%, 100% -2%, 0% -2%)',
      });
      _isTransitioning = false;
    },
  });
}
