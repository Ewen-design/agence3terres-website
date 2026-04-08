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

export function installDesktopWheelDamping({
  factor = 0.77,
  lerp = 0.1
} = {}) {
  if (typeof window === "undefined") {
    return {
      destroy() {},
      stop() {}
    };
  }

  function animateWheel() {
    wheelCurrentY += (wheelTargetY - wheelCurrentY) * lerp;

    if (Math.abs(wheelTargetY - wheelCurrentY) < 0.4) {
      wheelCurrentY = wheelTargetY;
      window.scrollTo(0, wheelCurrentY);
      stopWheelDampingInternal();
      return;
    }

    window.scrollTo(0, wheelCurrentY);
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

    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );

    if (!wheelActive) {
      wheelCurrentY = window.scrollY || window.pageYOffset || 0;
      wheelTargetY = wheelCurrentY;
      wheelActive = true;
    }

    wheelTargetY += e.deltaY * factor;
    wheelTargetY = Math.max(0, Math.min(maxScroll, wheelTargetY));

    if (!wheelRaf) {
      wheelRaf = requestAnimationFrame(animateWheel);
    }
  }

  window.addEventListener("wheel", handleWheel, { passive: false });

  return {
    stop() {
      stopWheelDampingInternal();
    },
    destroy() {
      window.removeEventListener("wheel", handleWheel);
      stopWheelDampingInternal();
    }
  };
}