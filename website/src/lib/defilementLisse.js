// ───────────────────────────────────────────────────────────────────────────
//  Le défilement LISSÉ sur grand écran (Lenis) — 2026-11-18.
//
//  Plainte du client : « sur desktop le défilement n'est pas super fluide, pas
//  vraiment saccadé mais pas très beau » (testé surtout sur Safari). Le site
//  défilait en natif partout : à la molette, la page avance par crans. Les
//  trois sites de référence qu'il a donnés (estrela.studio, fantasy.co,
//  vision.avatr.com) lissent tous la molette avec Lenis ; c'est ce qui fait
//  leur défilement « glissé ».
//
//  Réglé PRESQUE NATIF (2026-11-18, second retour : « un peu trop travaillé,
//  pas assez natif — plus simple, mais complètement fluide ») : `lerp` 0,2 au
//  lieu du 0,1 d'Estrela. Un cran de molette est rattrapé à 95 % en ~12 images
//  (~200 ms, la durée d'un défilement doux natif) au lieu de ~28 (~470 ms) :
//  plus de crans, et plus de flottement non plus. Le monter rend le défilement
//  plus sec, le baisser plus « glissé ».
//
//  Ce qui reste NATIF :
//    • le tactile (téléphone, tablette) : il est jugé parfait tel quel ;
//    • les gestes surtout HORIZONTAUX (rails, carrousels au trackpad) ;
//    • les blocs qui défilent VRAIMENT seuls, marqués `data-lenis-prevent`
//      (la carte du témoignage) ;
//    • le clavier, la barre de défilement, les ancres (Lenis se recale dessus) ;
//    • le mouvement réduit (aucun lissage).
//
//  Lenis est MIS EN PAUSE quand la page ne doit pas défiler : intro, menu
//  ouvert, témoignage ouvert (tous posent `overflow: hidden` sur la page),
//  et pendant un changement de page (comme Estrela). En pause, il bloque la
//  molette ; un filet de 3 s le relance si une navigation n'aboutit jamais.
//
//  ⚠️ Safari 18.1 (Mac du client) : un écouteur de molette qui annule
//  l'événement puis est RETIRÉ laisse la page incapable de défiler (voir la
//  mémoire du projet). Lenis garde le sien toute la vie de la page : ne jamais
//  appeler `destroy()` en cours de visite.
// ───────────────────────────────────────────────────────────────────────────
import Lenis from "lenis";
import { setScrollEngineExternalSmoothing, stepScrollEngine } from "$lib/scrollEngine.js";

let lenis = null;
let enTransition = false;
let filet = 0;

export function installerDefilementLisse() {
  if (lenis || typeof window === "undefined") return null;
  const bureau = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!bureau || reduit) return null;

  lenis = new Lenis({
    lerp: 0.2,
    wheelMultiplier: 1,
    smoothWheel: true,
    syncTouch: false,
    // PAS de « défilement imbriqué » automatique (2026-11-18, le défilement
    // qui « s'arrête sans raison » sur la home, mesuré à la sonde de fluidité) :
    // un rail en `overflow-x: auto` est aussi, pour le navigateur, en
    // `overflow-y: auto` ; qu'il déborde de quelques pixels en hauteur et Lenis
    // lui cédait la molette — la page s'arrêtait, puis repartait. Un bloc qui
    // doit défiler seul le dit avec `data-lenis-prevent`.
    allowNestedScroll: false,
    autoRaf: true,
    // Un geste surtout horizontal n'est pas pour Lenis (qui ne gère que le
    // vertical) : sans ça, un glissé au trackpad sur un rail, à peine
    // incliné, partait en défilement de la page au lieu de faire glisser le rail.
    // ⚠️ Le marqueur `data-native-wheel` (rails, galerie « Trois pôles » de la
    // home) n'est PAS respecté ici : il venait de l'ancien amortisseur de
    // molette. Le respecter rendait la molette NATIVE dès que la souris
    // passait sur ces grandes cartes — et une glissade de Lenis en cours se
    // battait alors avec le natif : arrêts et ralentissements. Le vertical
    // est à Lenis partout ; l'horizontal reste natif (règle ci-dessus).
    virtualScroll: ({ deltaX, deltaY }) => Math.abs(deltaY) >= Math.abs(deltaX)
  });
  window.lenis = lenis;

  // Le moteur de défilement du site lit la position dans la MÊME image que
  // celle où Lenis la pose, et ne la lisse plus par-dessus.
  setScrollEngineExternalSmoothing(true);
  lenis.on("scroll", () => stepScrollEngine(performance.now()));

  synchroniserDefilementLisse();
  return lenis;
}

/** Met Lenis en pause ou le relance selon l'état de la page. À appeler quand
 *  la classe ou le style de `<html>` / `<body>` change (verrous). */
export function synchroniserDefilementLisse() {
  if (!lenis) return;
  const html = document.documentElement;
  const bloque =
    enTransition ||
    html.classList.contains("site-intro-active") ||
    getComputedStyle(html).overflowY === "hidden" ||
    getComputedStyle(document.body).overflowY === "hidden";
  // `start()` recale Lenis sur la position réelle : un saut fait pendant la
  // pause (remise en haut d'une nouvelle page) n'est pas défait au geste suivant.
  if (bloque) lenis.stop();
  else lenis.start();
}

/** Début / fin d'un changement de page. */
export function transitionDeDefilement(debut) {
  if (!lenis) return;
  clearTimeout(filet);
  enTransition = debut;
  if (debut) {
    filet = window.setTimeout(() => {
      enTransition = false;
      synchroniserDefilementLisse();
    }, 3000);
  }
  synchroniserDefilementLisse();
}

/** Arrête net une glissade en cours (sans mettre Lenis en pause). */
export function arreterGlissade() {
  if (!lenis) return;
  lenis.scrollTo(window.scrollY || window.pageYOffset || 0, { immediate: true, force: true });
}

/** Défilement doux vers une position : Lenis s'il est là, sinon natif. */
export function defilerVers(y) {
  if (lenis && !lenis.isStopped) lenis.scrollTo(y);
  else window.scrollTo({ top: y, behavior: "smooth" });
}
