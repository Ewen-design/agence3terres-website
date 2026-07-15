// Défilement horizontal fluide et STABLE, partagé par les sliders à dock
// (MediaSlider des pôles, ParallaxGallery2 de l'accueil).
//
// Pourquoi PAS un rAF maison qui écrit `scrollLeft` frame par frame : sur ce site
// c'est saccadé. Écrire `scrollLeft` en JS force un scroll sur le thread principal
// → repaint synchrone du dock en `backdrop-filter: blur(20px)` (posé en sticky
// par-dessus les images qui défilent) à chaque frame, en concurrence avec la boucle
// rAF de Lenis. Résultat : à-coups.
//
// Le smooth NATIF (`scrollTo({behavior:'smooth'})`) tourne côté compositeur → doux,
// fluide, GPU. Son seul défaut d'origine ici était le combat avec `scroll-snap-type:
// mandatory` (le navigateur re-visait le snap pendant l'anim → instable/saccadé).
// La solution : on COUPE le snap le temps de l'anim, puis on le restaure une fois le
// défilement posé. On obtient un mouvement beau, régulier et premium, sans lutte.

/**
 * Défile `el` en douceur (natif) jusqu'à `toLeft` (borné à la plage scrollable),
 * snap géré. Retourne `{ cancel(restoreSnap = false) }`.
 */
export function animateScrollLeft(el, toLeft, options = {}) {
  const noop = { cancel() {} };
  if (!el) return noop;

  const max = Math.max(0, el.scrollWidth - el.clientWidth);
  const target = Math.max(0, Math.min(toLeft, max));

  if (Math.abs(target - el.scrollLeft) < 1) {
    options.onDone?.();
    return noop;
  }

  // Coupe le snap pendant l'anim (sera restauré à '' → valeur CSS d'origine).
  el.style.scrollSnapType = "none";

  let done = false;
  let fallback = 0;

  const cleanup = () => {
    el.removeEventListener("scrollend", onEnd);
    clearTimeout(fallback);
  };

  const finish = () => {
    if (done) return;
    done = true;
    cleanup();
    el.style.scrollSnapType = "";
    options.onDone?.();
  };

  const onEnd = () => finish();
  el.addEventListener("scrollend", onEnd);
  // Filet de sécurité si `scrollend` n'est pas supporté (anciens Safari) ou raté.
  // Le smooth natif d'un cran reste bien en deçà de cette durée.
  fallback = setTimeout(finish, options.settleTimeout ?? 850);

  el.scrollTo({ left: target, behavior: "smooth" });

  return {
    cancel(restoreSnap = false) {
      if (done) return;
      done = true;
      cleanup();
      // Par défaut on NE restaure PAS : une nouvelle anim va prendre le relais et
      // gérer elle-même le snap (évite un re-snap parasite entre deux navigations).
      if (restoreSnap) el.style.scrollSnapType = "";
    }
  };
}
