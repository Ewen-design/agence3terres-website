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

  if (targetPath === currentPath || _isTransitioning) return;

  _isTransitioning = true;

  try {
    if (options.silent) {
      markNextNavigationSilent();
    }

    stopWheelDamping(900);

    await goto(url, {
      noScroll: true,
      keepFocus: true
    });

    resetScrollPosition();
    requestAnimationFrame(() => {
      resetScrollPosition();
    });

    window.dispatchEvent(new CustomEvent("app:route-settled"));
  } catch (error) {
    clearSilentNavigation();
    console.error("Navigation error:", error);
  } finally {
    _isTransitioning = false;
  }
}
