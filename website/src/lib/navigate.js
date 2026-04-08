import { goto } from "$app/navigation";
import { browser } from "$app/environment";

let _isTransitioning = false;

export function isTransitioning() {
  return _isTransitioning;
}

export async function navigate(page) {
  if (!browser) return;

  const url = page === "home" ? "/" : `/${page}`;
  const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
  const targetPath = url.replace(/\/+$/, "") || "/";

  if (targetPath === currentPath || _isTransitioning) return;

  _isTransitioning = true;

  try {
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
    console.error("Navigation error:", error);
  } finally {
    _isTransitioning = false;
  }
}