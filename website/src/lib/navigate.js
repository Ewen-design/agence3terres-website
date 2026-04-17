import { goto } from "$app/navigation";
import { browser } from "$app/environment";
import {
  clearSilentNavigation,
  markNextNavigationSilent
} from "$lib/routeTransitionState.js";

let _isTransitioning = false;

export function isTransitioning() {
  return _isTransitioning;
}

export async function navigate(page, options = {}) {
  if (!browser) return;

  const url = page === "home" ? "/" : `/${page}`;
  const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
  const targetPath = url.replace(/\/+$/, "") || "/";

  if (targetPath === currentPath || _isTransitioning) return;

  _isTransitioning = true;

  try {
    if (options.silent) {
      markNextNavigationSilent();
    }

    await goto(url, {
      noScroll: true,
      keepFocus: true
    });

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });

    window.dispatchEvent(new CustomEvent("app:route-settled"));
  } catch (error) {
    clearSilentNavigation();
    console.error("Navigation error:", error);
  } finally {
    _isTransitioning = false;
  }
}
