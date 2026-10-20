import { browser } from "$app/environment";

/*  ── Les éléments fixes qui « descendent » sur iPhone (2026-10-20) ─────────
 *  Safari iOS 26 décale parfois TOUS les éléments `position: fixed` à la fois
 *  — header, cache noir du haut — par rapport à la page : ils glissent de
 *  plusieurs dizaines de pixels et restent là jusqu'au prochain défilement
 *  (WebKit 297779, « position: fixed/sticky scroll drift »). Le DOM est juste,
 *  seul l'affichage est faux : rien à corriger en CSS. Déclencheurs vus :
 *  défilements programmés pendant une inertie ou une animation de la barre
 *  d'outils, changement brutal de hauteur du document (navigation), retour
 *  d'onglet, clavier.
 *
 *  Le remède connu : un défilement d'UN pixel aller-retour, qui force Safari à
 *  recaler sa fenêtre de mise en page. On le joue :
 *  - après chaque changement de page et chaque fermeture du menu (forcé) ;
 *  - quand la fenêtre visuelle annonce un décalage (`visualViewport`), hors
 *    clavier ouvert.
 *  iPhone / iPad seulement : ailleurs, rien n'est installé. */

const isIOS = () =>
  /iP(hone|ad|od)/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

let active = false;
let nudgeRaf = 0;
let lastNudge = 0;
let lastScrollAt = 0;
let retryTimer = 0;

function scrollLocked() {
  const html = document.documentElement;
  return (
    html.style.overflow === "hidden" ||
    document.body.style.overflow === "hidden" ||
    document.body.style.position === "fixed"
  );
}

function typing() {
  const el = document.activeElement;
  return !!el?.matches?.("input, textarea, select, [contenteditable='true']");
}

function drifted() {
  const vv = window.visualViewport;
  if (!vv || Math.abs(vv.scale - 1) > 0.01) return false;
  return Math.abs(vv.offsetTop) > 0.5 || Math.abs(window.innerHeight - vv.height) > 1;
}

function nudge() {
  if (scrollLocked() || typing()) return;
  cancelAnimationFrame(nudgeRaf);
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const to = y < max - 1 ? y + 1 : Math.max(0, y - 1);
  if (to === y) return;
  lastNudge = performance.now();
  window.scrollTo(0, to);
  nudgeRaf = requestAnimationFrame(() => {
    nudgeRaf = 0;
    // Le lecteur a repris la main entre-temps : on ne le ramène pas.
    if (Math.abs(window.scrollY - to) <= 1) window.scrollTo(0, y);
  });
}

/** Recale les éléments fixes. `force` : même sans décalage détecté. */
export function resyncFixedLayers({ force = false, tries = 6 } = {}) {
  if (!browser || !active) return;
  clearTimeout(retryTimer);
  // Le lecteur défile (inertie comprise) : un défilement programmé couperait
  // son geste net. On attend qu'il s'arrête.
  if (performance.now() - lastScrollAt < 220) {
    if (tries > 0) retryTimer = setTimeout(() => resyncFixedLayers({ force, tries: tries - 1 }), 300);
    return;
  }
  if (force) return nudge();
  // Un décalage qui résiste au remède ne doit pas faire tressauter la page en
  // boucle (le pixel aller-retour relance lui-même `scrollend`).
  if (drifted() && performance.now() - lastNudge > 1500) nudge();
}

export function installFixedResync() {
  if (!browser || !isIOS()) return () => {};
  active = true;

  let checkTimer = 0;
  const check = () => {
    clearTimeout(checkTimer);
    // Après la fin du mouvement : jamais pendant un geste du lecteur.
    checkTimer = setTimeout(() => resyncFixedLayers(), 260);
  };
  const forced = () => {
    clearTimeout(checkTimer);
    checkTimer = setTimeout(() => resyncFixedLayers({ force: true }), 260);
  };
  const onScroll = () => {
    // Le pixel aller-retour ne compte pas comme un geste du lecteur.
    if (performance.now() - lastNudge > 120) lastScrollAt = performance.now();
  };
  const onVisibility = () => {
    if (document.visibilityState === "visible") forced();
  };

  const vv = window.visualViewport;
  window.addEventListener("scroll", onScroll, { passive: true });
  vv?.addEventListener("resize", check);
  vv?.addEventListener("scroll", check);
  window.addEventListener("scrollend", check);
  window.addEventListener("orientationchange", forced);
  window.addEventListener("pageshow", forced);
  window.addEventListener("app:fixed-resync", forced);
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    active = false;
    clearTimeout(checkTimer);
    clearTimeout(retryTimer);
    cancelAnimationFrame(nudgeRaf);
    window.removeEventListener("scroll", onScroll);
    vv?.removeEventListener("resize", check);
    vv?.removeEventListener("scroll", check);
    window.removeEventListener("scrollend", check);
    window.removeEventListener("orientationchange", forced);
    window.removeEventListener("pageshow", forced);
    window.removeEventListener("app:fixed-resync", forced);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
