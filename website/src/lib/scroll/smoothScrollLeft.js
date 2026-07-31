// Défilement horizontal partagé par les sliders à dock (MediaSlider des pôles,
// ParallaxGallery2 de l'accueil). Deux modes :
//
// • DÉFAUT (natif) : `scrollTo({behavior:'smooth'})`. Tourne côté compositeur →
//   fluide même avec un dock en `backdrop-filter` posé par-dessus les images qui
//   défilent. Seul défaut : durée/courbe imposées par le navigateur (pas réglables).
//   On coupe le snap pendant l'anim (le navigateur re-viserait le snap → instable)
//   puis on le restaure sur `scrollend` (ou un filet de sécurité).
//
// • `eased: true` (PREMIUM) : on anime `scrollLeft` en rAF avec une courbe
//   ease-in-out douce et une durée maîtrisée → mouvement lent, régulier, premium.
//   Comme écrire `scrollLeft` en JS ferait re-rasteriser un dock flouté par frame,
//   l'appelant DOIT neutraliser ce flou le temps de l'anim via `onStart`/`onDone`
//   (cf. MediaSlider). Réservé donc aux sliders qui gèrent cette mitigation.

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
// easeInOutCubic — démarrage doux, fin douce (rendu premium symétrique).
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Défile `el` jusqu'à `toLeft` (borné à la plage scrollable), snap géré.
 * `options`: { eased, duration, settleTimeout, onStart, onDone }.
 * Retourne `{ cancel(restoreSnap = false) }`.
 */
export function animateScrollLeft(el, toLeft, options = {}) {
  const noop = { cancel() {} };
  if (!el) return noop;

  const max = Math.max(0, el.scrollWidth - el.clientWidth);
  const target = clamp(toLeft, 0, max);
  const start = el.scrollLeft;
  const dist = target - start;

  if (Math.abs(dist) < 1) {
    options.onDone?.();
    return noop;
  }

  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  // Coupe le snap pendant l'anim (sera restauré à '' → valeur CSS d'origine).
  el.style.scrollSnapType = "none";

  // ── Mode PREMIUM (rAF, courbe maîtrisée) ──────────────────────────────────
  if (options.eased && !reduce) {
    const duration =
      options.duration ?? clamp(760 + Math.abs(dist) * 0.26, 1000, 1450);

    let rafId = 0;
    let startT = 0;
    let done = false;

    const finish = (restoreSnap = true) => {
      if (done) return;
      done = true;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      if (restoreSnap) el.style.scrollSnapType = "";
      options.onDone?.();
    };

    options.onStart?.();
    const stepAnim = (ts) => {
      if (!startT) startT = ts;
      const p = Math.min(1, (ts - startT) / duration);
      el.scrollLeft = start + dist * easeInOutCubic(p);
      if (p < 1) rafId = requestAnimationFrame(stepAnim);
      else finish();
    };
    rafId = requestAnimationFrame(stepAnim);

    return {
      cancel(restoreSnap = false) {
        if (done) return;
        done = true;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
        if (restoreSnap) el.style.scrollSnapType = "";
        // On prévient toujours l'appelant (rétablit le dock via onDone), même si
        // une nouvelle anim va reprendre.
        options.onDone?.();
      }
    };
  }

  // ── Mode NATIF (smooth navigateur) ────────────────────────────────────────
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
  fallback = setTimeout(finish, options.settleTimeout ?? 850);

  el.scrollTo({ left: target, behavior: reduce ? "auto" : "smooth" });

  return {
    cancel(restoreSnap = false) {
      if (done) return;
      done = true;
      cleanup();
      if (restoreSnap) el.style.scrollSnapType = "";
    }
  };
}
