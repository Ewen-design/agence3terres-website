let wheelRaf = 0;
let wheelTargetY = 0;
let wheelCurrentY = 0;
let wheelActive = false;
let wheelSuppressedUntil = 0;

function stopWheelDampingInternal() {
  if (wheelRaf) cancelAnimationFrame(wheelRaf);
  wheelRaf = 0;
  wheelActive = false;
  wheelTargetY = 0;
  wheelCurrentY = 0;
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

/*  ── La hauteur de course est mise en cache ────────────────────────────────
 *  `scrollHeight` force un calcul de mise en page. Le lire à chaque image
 *  pendant toute la course, c'est imposer une mise en page synchrone par image
 *  AU MILIEU du défilement — la cause de tremblement déjà retirée du moteur de
 *  défilement, restée ici. Cette valeur ne sert qu'à borner la course : un
 *  cache court suffit, et il est vidé dès que la fenêtre change. */
let maxScrollCache = -1;
let maxScrollStamp = 0;
const MAX_SCROLL_TTL_MS = 300;

function getMaxScroll(frais = false) {
  const now = performance.now();

  if (!frais && maxScrollCache >= 0 && now - maxScrollStamp < MAX_SCROLL_TTL_MS) {
    return maxScrollCache;
  }

  maxScrollCache = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
  maxScrollStamp = now;
  return maxScrollCache;
}

function invalidateMaxScroll() {
  maxScrollCache = -1;
}

/*  ── La position est ENGAGÉE sur la grille de pixels de l'écran ─────────────
 *  Ce module ne laisse pas le navigateur défiler seul : il intercepte la
 *  molette et pose lui-même la position, image par image. La valeur calculée
 *  est fractionnaire — c'est ce qui rend la course douce — mais elle ne doit
 *  pas être engagée telle quelle.
 *
 *  Un élément `position: sticky` est posé par le fil de défilement à partir de
 *  DEUX termes : la position du calque qui défile, et le rattrapage collant qui
 *  l'annule exactement. Chacun est arrondi au pixel de l'écran, de son côté.
 *  Quand la position engagée tombe sur la grille, les deux arrondis s'annulent
 *  et le cadre collant est parfaitement immobile. Avec une valeur fractionnaire
 *  ils se contredisent d'une image à l'autre, et le cadre vibre d'un demi-pixel
 *  — invisible sur du contenu qui défile, flagrant sur le seul élément censé ne
 *  pas bouger. C'était le tremblement du visuel collant.
 *
 *  L'arrondi se fait sur la grille de l'ÉCRAN et non sur le pixel CSS : sur un
 *  écran Retina c'est un demi-pixel CSS, soit le pas le plus fin que l'écran
 *  sache peindre. La douceur de la course est intacte, l'arrondi devient exact. */
function engagerY(y) {
  const grille = window.devicePixelRatio || 1;
  return Math.round(y * grille) / grille;
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

    window.scrollTo(0, engagerY(wheelCurrentY));

    if (Math.abs(diff) < snapThreshold) {
      wheelCurrentY = wheelTargetY;
      window.scrollTo(0, engagerY(wheelTargetY));
      stopWheelDampingInternal();
      return;
    }

    wheelRaf = requestAnimationFrame(animateWheel);
  }

  function handleWheel(e) {
    if (performance.now() < wheelSuppressedUntil) {
      e.preventDefault();
      stopWheelDampingInternal();
      return;
    }

    if (e.ctrlKey) return;
    if (Math.abs(e.deltaY) < 0.01) return;
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

    const activeEl = document.activeElement;
    if (isEditableElement(activeEl)) return;
    if (isNativeWheelZone(e.target)) return;

    const maxScroll = getMaxScroll(!wheelActive);
    if (maxScroll <= 1) {
      stopWheelDampingInternal();
      return;
    }

    e.preventDefault();

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

  function handleForceStop() {
    stopWheelDampingInternal();
  }

  function handleSuppress(event) {
    const durationMs = Math.max(0, Number(event?.detail?.durationMs) || 0);
    wheelSuppressedUntil = performance.now() + durationMs;
    stopWheelDampingInternal();
  }

  window.addEventListener("resize", invalidateMaxScroll, { passive: true });
  window.addEventListener("orientationchange", invalidateMaxScroll, { passive: true });
  window.addEventListener("wheel", handleWheel, { passive: false });
  window.addEventListener("mousedown", cancelOnDirectUserAction, { passive: true });
  window.addEventListener("keydown", cancelOnDirectUserAction, { passive: true });
  window.addEventListener("app:wheel-damping-stop", handleForceStop);
  window.addEventListener("app:wheel-damping-suppress", handleSuppress);

  return {
    stop() {
      stopWheelDampingInternal();
    },
    destroy() {
      window.removeEventListener("resize", invalidateMaxScroll);
      window.removeEventListener("orientationchange", invalidateMaxScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("mousedown", cancelOnDirectUserAction);
      window.removeEventListener("keydown", cancelOnDirectUserAction);
      window.removeEventListener("app:wheel-damping-stop", handleForceStop);
      window.removeEventListener("app:wheel-damping-suppress", handleSuppress);
      stopWheelDampingInternal();
    }
  };
}
