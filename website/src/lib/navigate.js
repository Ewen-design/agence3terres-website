import { goto } from "$app/navigation";
import { browser } from "$app/environment";
import {
  clearSilentNavigation,
  markNextNavigationSilent
} from "$lib/routeTransitionState.js";

let _isTransitioning = false;

function normalizeUrl(target) {
  if (!target) return "/";
  return target === "home" ? "/" : target.startsWith("/") ? target : `/${target}`;
}

function isDesktopSafari() {
  if (!browser) return false;

  const ua = window.navigator.userAgent || "";
  const vendor = window.navigator.vendor || "";
  const isSafari =
    /Safari/i.test(ua) &&
    !/Chrome|CriOS|Edg|OPR|Firefox|FxiOS/i.test(ua) &&
    /Apple/i.test(vendor);
  const isTouch = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;

  return isSafari && !isTouch;
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

function clearGlobalScrollLocks() {
  if (!browser) return;

  document.documentElement.classList.remove("preloader-active");
  document.body.classList.remove("preloader-active", "menu-open");

  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.inset = "";
  document.body.style.top = "";
  document.body.style.width = "";
  document.body.style.touchAction = "";
}

function resetScrollPosition() {
  if (!browser) return;

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "auto"
  });

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function isTransitioning() {
  return _isTransitioning;
}

export async function navigate(target, options = {}) {
  if (!browser) return;

  const url = normalizeUrl(target);
  const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
  const targetPath = url.replace(/\/+$/, "") || "/";
  const useNativeScrollReset =
    isDesktopSafari() && currentPath === "/contact" && targetPath !== "/contact";

  if (targetPath === currentPath || _isTransitioning) return;

  _isTransitioning = true;

  try {
    blurActiveElement();
    clearGlobalScrollLocks();

    if (options.silent) {
      markNextNavigationSilent();
    }

    stopWheelDamping(900);

    await goto(url, {
      noScroll: !useNativeScrollReset,
      keepFocus: false
    });

    clearGlobalScrollLocks();
    if (!useNativeScrollReset) {
      resetScrollPosition();
      requestAnimationFrame(() => {
        clearGlobalScrollLocks();
        stopWheelDamping();
        resetScrollPosition();
      });
    } else {
      requestAnimationFrame(() => {
        clearGlobalScrollLocks();
        stopWheelDamping();
      });
    }
    setTimeout(() => {
      clearGlobalScrollLocks();
      stopWheelDamping();
    }, 120);

    window.dispatchEvent(new CustomEvent("app:route-settled"));
  } catch (error) {
    clearSilentNavigation();
    console.error("Navigation error:", error);
  } finally {
    _isTransitioning = false;
  }
}
