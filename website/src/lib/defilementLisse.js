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
    virtualScroll: ({ deltaX, deltaY, event }) => {
      // ── Safari a déjà défilé lui-même (2026-11-20) ──
      //  Film d'écran du client (Safari bureau, premier passage rapide sur la
      //  home) : la page sautait de ~20 px en avant puis en arrière d'une
      //  image à l'autre, header compris. Safari attend que la page dise si
      //  elle bloque la molette ; si elle tarde (premier passage : images,
      //  arrivées de textes), il défile LUI-MÊME et la suite du geste arrive
      //  non annulable (`cancelable: false`). Lenis, qui ne le vérifie pas,
      //  continuait d'imposer sa position : deux défilements qui se battaient.
      //  Un tel geste est laissé au natif ; Lenis lâche sa glissade et se
      //  recale sur la position réelle (il suit ensuite le natif).
      if (event && event.type === "wheel" && !event.cancelable) {
        if (diag) diag.nonAnnulables++;
        if (lenis && lenis.isScrolling === "smooth") lenis.reset();
        return false;
      }
      if (diag && event && event.type === "wheel") diag.crans++;
      return Math.abs(deltaY) >= Math.abs(deltaX);
    }
  });
  window.lenis = lenis;
  if (positionsEntieres()) avancerAuPixelPres(lenis.animate, lenis);
  if (/[?&]diag-molette\b/.test(location.search)) afficherDiagnostic();

  // Le moteur de défilement du site lit la position dans la MÊME image que
  // celle où Lenis la pose, et ne la lisse plus par-dessus.
  setScrollEngineExternalSmoothing(true);
  lenis.on("scroll", () => stepScrollEngine(performance.now()));

  synchroniserDefilementLisse();
  return lenis;
}

// ── Safari : la position de défilement est un nombre ENTIER (2026-11-19) ──
//  Mesuré dans le vrai Safari du client : Lenis demande 47,9 puis 54,41…,
//  Safari pose 47 puis 54 (arrondi vers le bas). En pleine glissade ça ne se
//  voit pas ; dans le ralenti de fin de geste, où Lenis avance de moins d'un
//  pixel par image, la page avançait par à-coups — 1, 0, 1, 0, 0, 1, 0, 0, 0,
//  1 px — pendant un quart de seconde : la saccade « pas partout » de Safari,
//  que Firefox (positions fractionnaires) n'a pas. Les effets du moteur de
//  défilement, calés sur la position de Lenis, décalaient en plus d'une
//  fraction de pixel par rapport à la page.
//  Sur ces navigateurs, Lenis avance donc au pixel près : même courbe, des
//  pas entiers, et jamais une image immobile avant l'arrivée (au moins 1 px
//  par image dans le ralenti). Firefox et Chrome gardent Lenis tel quel.
function positionsEntieres() {
  const boite = document.createElement("div");
  boite.style.cssText =
    "position:absolute;top:0;left:-9999px;width:10px;height:10px;overflow:scroll;visibility:hidden";
  boite.appendChild(document.createElement("div")).style.height = "100px";
  document.body.appendChild(boite);
  boite.scrollTop = 10.5;
  const entier = boite.scrollTop === 10;
  boite.remove();
  return entier;
}

//  ⚠️ Et si la page n'est plus là où Lenis l'a posée à l'image d'avant
//  (2026-11-20), c'est que quelqu'un d'autre l'a bougée — le défilement natif
//  de Safari, qui a pris la main (voir `virtualScroll`), ou un saut voulu.
//  Lenis l'ADOPTE et s'arrête au lieu de la ramener de force : sinon les deux
//  se renvoyaient la page d'une image à l'autre (film du client : ±20 px,
//  header compris, sur les cartes « Accompagnement / Parlons-en »). Exact
//  ici puisque Lenis ne pose que des positions entières.
function avancerAuPixelPres(animation, instance) {
  const avancerDeBase = animation.advance.bind(animation);
  animation.advance = function (deltaTime) {
    // Les défilements à durée (ancres, `scrollTo` avec `duration`) : inchangés.
    if (!this.isRunning || !this.lerp || (this.duration && this.easing)) {
      return avancerDeBase(deltaTime);
    }
    const reel = window.scrollY;
    if (instance.isScrolling === "smooth" && Math.abs(reel - Math.round(this.value)) > 1) {
      if (diag) diag.reprises++;
      instance.reset();
      return;
    }
    const depart = Math.round(this.value);
    const reste = this.to - depart;
    let pas = Math.round(reste * (1 - Math.exp(-this.lerp * 60 * deltaTime)));
    if (pas === 0) pas = Math.sign(reste);
    if (Math.abs(reste) < 1 || Math.abs(pas) >= Math.abs(reste)) {
      this.value = this.to;
      this.stop();
      this.onUpdate?.(this.value, true);
      return;
    }
    this.value = depart + pas;
    this.onUpdate?.(this.value, false);
  };
}

// ── Diagnostic (`?diag-molette` dans l'adresse) ──
//  Compte, en bas à gauche de l'écran, les crans de molette, ceux que Safari a
//  rendus non annulables (il défilait déjà lui-même) et les reprises (page
//  bougée par un autre que Lenis). Pour vérifier au vrai pavé tactile.
let diag = null;
function afficherDiagnostic() {
  diag = { crans: 0, nonAnnulables: 0, reprises: 0 };
  const boite = document.createElement("div");
  boite.style.cssText =
    "position:fixed;left:12px;bottom:12px;z-index:2147483647;padding:8px 10px;border-radius:8px;background:rgba(0,0,0,.78);color:#fff;font:12px/1.4 ui-monospace,monospace;pointer-events:none";
  document.body.appendChild(boite);
  const ecrire = () => {
    boite.textContent = `crans ${diag.crans} · non annulables ${diag.nonAnnulables} · reprises ${diag.reprises}`;
    window.setTimeout(ecrire, 250);
  };
  ecrire();
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
