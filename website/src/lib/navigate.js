import { goto } from '$app/navigation';
import { browser } from '$app/environment';

let _lenis = null;
let _isTransitioning = false;

export function registerLenis(lenis) {
  _lenis = lenis;
}

export function isTransitioning() {
  return _isTransitioning;
}

export async function navigate(page) {
  if (!browser) return;
  const url = page === 'home' ? '/' : `/${page}`;
  const currentPath = window.location.pathname;
  if (url === currentPath || _isTransitioning) return;

  _isTransitioning = true;

  try {
    await goto(url, { noScroll: true, keepFocus: true });
    window.scrollTo(0, 0);
    _lenis?.scrollTo(0, { immediate: true, force: true });
    _lenis?.resize();
    window.dispatchEvent(new CustomEvent('app:route-settled'));
  } catch (error) {
    console.error('Navigation error:', error);
  } finally {
    _isTransitioning = false;
  }
}