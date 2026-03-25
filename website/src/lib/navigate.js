import { goto } from '$app/navigation';
import { browser } from '$app/environment';

/** @type {any | null} */
let _lenis = null;
/** @type {boolean} */
let _isTransitioning = false;

const DURATION  = 1.05;
const SWITCH_AT = 0.60;
const EASE      = 'power3.inOut';

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

function lockTransition() {
  document.documentElement.classList.add('page-transition-lock');
  document.body.classList.add('page-transition-lock');
}

function unlockTransition() {
  document.documentElement.classList.remove('page-transition-lock');
  document.body.classList.remove('page-transition-lock');
}

function startRouteTransitionClass() {
  document.documentElement.classList.add('route-wipe-transition');
}

function stopRouteTransitionClass() {
  document.documentElement.classList.remove('route-wipe-transition');
}

/**
 * Navigate to a page with a native page-to-page transition.
 * Accepted keys:
 * 'home' | 'travail' | 'apropos' | 'services' | 'contact' | 'projet1' | 'projet2'
 *
 * @param {string} page
 */
export async function navigate(page) {
  if (!browser) return;

  const url = page === 'home' ? '/' : `/${page}`;
  const currentUrl = window.location.pathname;

  if (url === currentUrl || _isTransitioning) return;

  _isTransitioning = true;

  // Double rAF: ensures the overlay's initial clip-path is painted before
  // GSAP starts animating (same technique as original App.svelte).
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  return new Promise((resolve) => {
    _gsap.to(_overlayEl, {
      duration: DURATION,
      ease: EASE,
      clipPath: 'polygon(0% -2%, 100% -2%, 100% 120%, 0% 102%)',

      onUpdate() {
        if (!this._switched && this.progress() >= SWITCH_AT) {
          this._switched = true;
          _lenis?.scrollTo(0, { immediate: true });
          goto(url);
        }
      },

      onComplete() {
        // Reset clip-path so the overlay is collapsed for the next navigation.
        _gsap.set(_overlayEl, {
          clipPath: 'polygon(0% -2%, 100% -2%, 100% -2%, 0% -2%)',
        });
        _isTransitioning = false;
        resolve();
      },
    });
  });
}
