let wheelRaf = 0;
let wheelTargetY = 0;
let wheelCurrentY = 0;
let wheelActive = false;

function stopWheelDampingInternal() {
  if (wheelRaf) cancelAnimationFrame(wheelRaf);
  wheelRaf = 0;
  wheelActive = false;
}

function isEditableElement(el) {
  if (!el) return false;

  const tag = el.tagName;
  return (
    el.isContentEditable ||
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT"
  );
}

function isNativeWheelZone(target) {
  return target instanceof Element && !!target.closest("[data-native-wheel='true']");
}

function getMaxScroll() {
  return Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function installDesktopWheelDamping({
  factor = 0.86,
  lerp = 0.14,
  snapThreshold = 0.18
} = {}) {
  if (typeof window === "undefined") {
    return {
      destroy() {},
      stop() {}
    };
  }

  function animateWheel() {
    const maxScroll = getMaxScroll();
    wheelTargetY = clamp(wheelTargetY, 0, maxScroll);

    const diff = wheelTargetY - wheelCurrentY;

    // lissage dynamique : plus réactif sur les grands écarts, plus doux en fin
    const dynamicLerp = Math.min(0.24, lerp + Math.min(Math.abs(diff) / 2000, 0.08));

    wheelCurrentY += diff * dynamicLerp;
    wheelCurrentY = clamp(wheelCurrentY, 0, maxScroll);

    window.scrollTo(0, wheelCurrentY);

    if (Math.abs(diff) < snapThreshold) {
      wheelCurrentY = wheelTargetY;
      window.scrollTo(0, wheelTargetY);
      stopWheelDampingInternal();
      return;
    }

    wheelRaf = requestAnimationFrame(animateWheel);
  }

  function handleWheel(e) {
    if (e.ctrlKey) return;
    if (Math.abs(e.deltaY) < 0.01) return;
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

    const activeEl = document.activeElement;
    if (isEditableElement(activeEl)) return;
    if (isNativeWheelZone(e.target)) return;

    e.preventDefault();

    const maxScroll = getMaxScroll();

    if (!wheelActive) {
      wheelCurrentY = window.scrollY || window.pageYOffset || 0;
      wheelTargetY = wheelCurrentY;
      wheelActive = true;
    }

    wheelTargetY += e.deltaY * factor;
    wheelTargetY = clamp(wheelTargetY, 0, maxScroll);

    if (!wheelRaf) {
      wheelRaf = requestAnimationFrame(animateWheel);
    }
  }

  function cancelOnDirectUserAction() {
    if (!wheelActive) return;
    stopWheelDampingInternal();
  }

  window.addEventListener("wheel", handleWheel, { passive: false });
  window.addEventListener("mousedown", cancelOnDirectUserAction, { passive: true });
  window.addEventListener("keydown", cancelOnDirectUserAction, { passive: true });

  return {
    stop() {
      stopWheelDampingInternal();
    },
    destroy() {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("mousedown", cancelOnDirectUserAction);
      window.removeEventListener("keydown", cancelOnDirectUserAction);
      stopWheelDampingInternal();
    }
  };
}