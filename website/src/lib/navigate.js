import { goto } from "$app/navigation";
import { browser } from "$app/environment";
import {
  clearSilentNavigation,
  markNextNavigationSilent
} from "$lib/routeTransitionState.js";
import { clearGlobalScrollLocks, resetScrollPosition } from "$lib/scrollLocks.js";

let _isTransitioning = false;

function normalizeUrl(target) {
  if (!target) return "/";
  return target === "home" ? "/" : target.startsWith("/") ? target : `/${target}`;
}

function stopWheelDamping(durationMs = 0) {
  if (!browser) return;

  window.dispatchEvent(new CustomEvent("app:wheel-damping-stop"));

  if (durationMs > 0) {
    window.dispatchEvent(
      new CustomEvent("app:wheel-damping-suppress", {
        detail: { durationMs }
      })
    );
  }
}

function blurActiveElement() {
  if (!browser) return;

  const activeEl = document.activeElement;
  if (!(activeEl instanceof HTMLElement)) return;
  activeEl.blur?.();
}

export function isTransitioning() {
  return _isTransitioning;
}

export async function navigate(target, options = {}) {
  if (!browser) return;

  const url = normalizeUrl(target);
  const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
  const targetPath = url.replace(/\/+$/, "") || "/";

  if (targetPath === currentPath || _isTransitioning) return;

  _isTransitioning = true;

  try {
    blurActiveElement();
    clearGlobalScrollLocks();

    if (options.silent) {
      markNextNavigationSilent();
    }

    stopWheelDamping();

    await goto(url, {
      noScroll: false,
      keepFocus: false
    });

    clearGlobalScrollLocks();
    resetScrollPosition();
    requestAnimationFrame(() => {
      clearGlobalScrollLocks();
      stopWheelDamping();
      resetScrollPosition();
    });
    setTimeout(() => {
      clearGlobalScrollLocks();
      stopWheelDamping();
    }, 120);
    setTimeout(() => {
      clearGlobalScrollLocks();
      stopWheelDamping();
      resetScrollPosition();
    }, 320);
    setTimeout(() => {
      clearGlobalScrollLocks();
      stopWheelDamping();
    }, 700);

    window.dispatchEvent(new CustomEvent("app:route-settled"));
  } catch (error) {
    clearSilentNavigation();
    console.error("Navigation error:", error);
  } finally {
    _isTransitioning = false;
  }
}
