import { browser } from "$app/environment";

function getLockedScrollY() {
  if (!browser) return null;

  const topValue = document.body.style.top || "";
  const parsedTop = Number.parseFloat(topValue);
  if (!Number.isFinite(parsedTop) || parsedTop === 0) return null;

  return Math.max(0, Math.round(Math.abs(parsedTop)));
}

export function clearGlobalScrollLocks() {
  if (!browser) return;

  const lockedScrollY = getLockedScrollY();

  document.documentElement.classList.remove("preloader-active");
  document.body.classList.remove("preloader-active", "menu-open");

  document.documentElement.style.overflow = "";
  document.documentElement.style.position = "";
  document.documentElement.style.inset = "";
  document.documentElement.style.height = "";
  document.documentElement.style.touchAction = "";

  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.inset = "";
  document.body.style.top = "";
  document.body.style.width = "";
  document.body.style.height = "";
  document.body.style.touchAction = "";

  if (lockedScrollY !== null) {
    window.scrollTo({
      top: lockedScrollY,
      left: 0,
      behavior: "auto"
    });
  }
}

export function resetScrollPosition() {
  if (!browser) return;

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "auto"
  });

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function hasActiveGlobalScrollLockOwner() {
  if (!browser) return false;

  const preloader = document.getElementById("site-intro-loader");
  if (preloader && !preloader.classList.contains("is-hidden")) {
    return true;
  }

  const fullscreenMenu = document.querySelector(".fs-menu.is-visible");
  if (fullscreenMenu) {
    return true;
  }

  return false;
}

export function clearUnexpectedGlobalScrollLocks() {
  if (!browser) return false;
  if (hasActiveGlobalScrollLockOwner()) return false;

  const html = document.documentElement;
  const body = document.body;
  const hasLockMarkers =
    html.classList.contains("preloader-active") ||
    body.classList.contains("preloader-active") ||
    body.classList.contains("menu-open") ||
    html.style.overflow === "hidden" ||
    body.style.overflow === "hidden" ||
    body.style.position === "fixed" ||
    body.style.touchAction === "none";

  if (!hasLockMarkers) return false;

  clearGlobalScrollLocks();
  return true;
}
