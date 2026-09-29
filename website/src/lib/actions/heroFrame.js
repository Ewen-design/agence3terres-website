import {
  registerParallax,
  unregisterParallax,
  registerWrite,
  unregisterWrite,
  forceScrollEngineUpdate
} from "$lib/scrollEngine.js";

// ─────────────────────────────────────────────────────────────────────────────
//  heroFrame — le cadre des hero du site s'ouvre en plein écran, et se referme
//  au premier cran de défilement.
//
//  L'action ne fait qu'UNE chose : basculer `--hero-t` entre 0 et 1 sur le nœud.
//  Tout le reste est en CSS — la marge (`calc(var(--hero-inset) * var(--hero-t))`),
//  l'arrondi, et surtout la `transition` qui mène l'animation. C'est ce partage
//  qui rend le mouvement doux : une seule animation menée par le navigateur, au
//  lieu d'une valeur réécrite à chaque image.
//
//  Deux règles à ne pas perdre de vue dans les composants qui l'utilisent :
//    • le cadre se referme par un `clip-path`, jamais par une marge ni une
//      hauteur — redimensionner à chaque image un élément qui porte une image,
//      une vidéo ou un `backdrop-filter`, c'est la recette du défilement qui
//      accroche ;
//    • ce qui se pose PAR-DESSUS le cadre (titre, flèche, bouton) doit vivre
//      hors de lui, dans une couche posée à la marge finale : dans le cadre, le
//      découpage le rognerait, et il bougerait avec l'animation.
//
//  Les deux seuils sont volontairement asymétriques : refermer un peu plus bas
//  qu'on ne rouvre évite le clignotement quand on s'arrête pile sur la limite.
// ─────────────────────────────────────────────────────────────────────────────

const CLOSE_Y = 16; // px de défilement : au-delà, le cadre se referme
const OPEN_Y = 4;   // px : en deçà, il se rouvre en plein écran

export function heroFrame(node) {
  let framed = false;
  let applied = null;

  function read(y, ctx) {
    const scrollY = ctx?.y ?? y ?? 0;
    if (!framed && scrollY > CLOSE_Y) framed = true;
    else if (framed && scrollY <= OPEN_Y) framed = false;
  }

  function write() {
    if (framed === applied) return;
    node.style.setProperty("--hero-t", framed ? "1" : "0");
    applied = framed;
  }

  registerParallax(read, { priority: 2 });
  registerWrite(write, { priority: 2 });
  forceScrollEngineUpdate();

  return {
    destroy() {
      unregisterParallax(read);
      unregisterWrite(write);
    }
  };
}
