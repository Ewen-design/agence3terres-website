import { goto } from "$app/navigation";
import { browser } from "$app/environment";
import {
  clearSilentNavigation,
  markNextNavigationSilent
} from "$lib/routeTransitionState.js";
import {
  clearGlobalScrollLocks,
  clearUnexpectedGlobalScrollLocks,
  resetScrollPosition
} from "$lib/scrollLocks.js";

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

    /*  ── Pourquoi la remise à zéro TARDIVE saute en mode silencieux ──────────
     *  Ces rappels échelonnés existent pour la transition ordinaire : l'écran
     *  y est flouté et masqué pendant un demi-tour de seconde, donc remettre le
     *  défilement à zéro à 320 ms ne se voit pas, et ça rattrape les mises en
     *  page qui finissent de s'installer.
     *
     *  En mode SILENCIEUX, rien n'est masqué : le pied de page « projet
     *  suivant » passe à la page d'après sans le moindre fondu, et le lecteur
     *  est justement EN TRAIN DE DÉFILER — c'est son défilement qui a déclenché
     *  le passage. Il reprend donc la nouvelle page en main immédiatement, et le
     *  rappel de 320 ms le ramenait d'un coup en haut. C'est la saccade.
     *
     *  Le défilement est donc remis à zéro une seule fois, dans la première
     *  image, et plus jamais ensuite : passé là, la page appartient au lecteur.
     *  Les verrous de défilement, eux, continuent d'être nettoyés — les lever
     *  ne déplace rien. */
    const tardif = !options.silent;

    /*  ── Jamais contre le lecteur (2026-11-19) ───────────────────────────────
     *  La transition de page rend maintenant la nouvelle page VISIBLE avant
     *  320 ms, et le lecteur pressé défile dès qu'il la voit (vidéo du client :
     *  logo touché, défilement aussitôt). La remise à zéro tardive le ramenait
     *  en haut d'un coup — et sur iPhone, un défilement programmé pendant une
     *  inertie est LE déclencheur connu des éléments fixes (header, cache du
     *  haut) qui « descendent » (voir `$lib/fixedResync.js`). Son premier geste
     *  rend donc la main, comme `holdTop` dans le layout. */
    let lecteur = false;
    const GESTES = ["wheel", "touchstart", "keydown", "pointerdown"];
    const prendreLaMain = () => {
      lecteur = true;
    };
    for (const type of GESTES) window.addEventListener(type, prendreLaMain, { passive: true });
    const remettreEnHaut = () => {
      if (!lecteur && (window.scrollY || window.pageYOffset || 0) > 0.5) resetScrollPosition();
    };

    // Les rappels suivants ne lèvent que les verrous ORPHELINS : un menu ouvert
    // ou un témoignage ouvert entre-temps (la page est rendue au premier
    // toucher, voir FullscreenMenu) garde le sien.
    clearGlobalScrollLocks();
    remettreEnHaut();
    requestAnimationFrame(() => {
      clearUnexpectedGlobalScrollLocks();
      stopWheelDamping();
      remettreEnHaut();
    });
    setTimeout(() => {
      clearUnexpectedGlobalScrollLocks();
      stopWheelDamping();
    }, 120);
    setTimeout(() => {
      clearUnexpectedGlobalScrollLocks();
      stopWheelDamping();
      if (tardif) remettreEnHaut();
    }, 320);
    setTimeout(() => {
      for (const type of GESTES) window.removeEventListener(type, prendreLaMain);
      clearUnexpectedGlobalScrollLocks();
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
