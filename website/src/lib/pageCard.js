import { writable } from "svelte/store";

/*  ── La carte de contenu (2026-10-09) ───────────────────────────────────────
 *  Un panneau plein écran qui s'ouvre et se referme avec le geste de la
 *  transition de page : la page recule sur place, se voile au noir, puis la
 *  carte — restée noire — revient plein écran et le panneau s'y pose. Premier
 *  usage : la citation complète d'un client (`ProjectQuote`).
 *
 *  Trois acteurs, reliés ici sans s'importer l'un l'autre :
 *  - le MOTEUR, `FullscreenMenu.svelte`, qui sait faire reculer la page
 *    (`registerPageCardEngine`) ;
 *  - le PANNEAU, qui demande `coverPage()` / `uncoverPage()` ;
 *  - le HEADER, dont le bouton menu passe en croix tant qu'une carte est
 *    ouverte (`pageCardState`) et la referme (`closePageCard`). */

/** `{ open }` — lu par le header. */
export const pageCardState = writable({ open: false });

let closeHandler = null;
let engine = null;

/** Le panneau annonce son ouverture (et comment le refermer), ou sa fermeture. */
export function setPageCardOpen(open, onClose = null) {
  closeHandler = open ? onClose : null;
  pageCardState.set({ open });
}

/** Le bouton du header : referme la carte ouverte. */
export function closePageCard() {
  closeHandler?.();
}

export function registerPageCardEngine(impl) {
  engine = impl;
  return () => {
    if (engine === impl) engine = null;
  };
}

/**
 * Recule la page, la voile au noir et ramène la carte noire plein écran.
 * Résout quand l'écran est entièrement noir : le panneau doit alors se poser,
 * dans l'image même. La valeur est `{ released }`, une promesse tenue quand la
 * page est rendue à plat SOUS le panneau et au repos — c'est là, et pas avant,
 * que ses textes peuvent arriver. `null` si le geste ne peut pas être joué
 * (mouvement réduit, menu ouvert…) : le panneau s'affiche alors par un fondu.
 */
export function coverPage() {
  return engine?.cover?.() ?? null;
}

/**
 * Le geste inverse. `onCovered` est appelé quand le même noir est en place
 * SOUS le panneau : c'est l'instant de retirer le panneau, d'un coup. Renvoie
 * `false` si le geste ne peut pas être joué (`onCovered` n'est alors jamais
 * appelé) : au panneau de s'effacer seul, en fondu.
 */
export function uncoverPage(onCovered) {
  return Boolean(engine?.uncover?.(onCovered));
}
