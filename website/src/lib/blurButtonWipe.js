// Effet de clic pour les boutons "verre dépoli" (backdrop-filter: blur) du site.
//
// Au clic, un voile blanc balaie le bouton de gauche à droite, très fluidement.
// Le voile est en `mix-blend-mode: difference` : il INVERSE tout ce qui se trouve
// dessous à l'intérieur du bouton — le fond sombre devient blanc et le texte clair
// devient noir, exactement en suivant le bord du balayage. Aucune duplication de
// texte ni structure spécifique n'est nécessaire, donc ça marche sur tous les
// boutons blur du site via un seul écouteur global.
//
// (Le bouton établit déjà un contexte d'empilement via `backdrop-filter`, ce qui
// confine le blend au bouton — pas d'inversion de la page derrière.)

export function installBlurButtonWipe() {
  if (typeof window === "undefined") return () => {};

  const reduceQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");

  // Boutons à exclure explicitement (logo, ou opt-out manuel via data-no-wipe).
  const EXCLUDE = ".site-prism-mark, [data-no-wipe]";

  function hasBlurBackdrop(el) {
    const cs = getComputedStyle(el);
    const bf = cs.backdropFilter || cs.webkitBackdropFilter || "";
    return bf.indexOf("blur") !== -1;
  }

  function onPointerDown(event) {
    if (reduceQuery?.matches) return;
    // Clic principal uniquement (souris gauche / tactile / stylet).
    if (event.button != null && event.button !== 0) return;

    const targetEl = event.target;
    if (!(targetEl instanceof Element)) return;

    const btn = targetEl.closest('button, a, [role="button"]');
    if (!btn || btn.matches(EXCLUDE)) return;
    if (!hasBlurBackdrop(btn)) return;

    // Un seul balayage à la fois par bouton.
    if (btn.__blurWipeOverlay) {
      btn.__blurWipeOverlay.remove();
      btn.__blurWipeOverlay = null;
    }

    // Le voile a besoin d'un parent positionné.
    if (getComputedStyle(btn).position === "static") {
      btn.style.position = "relative";
    }

    const overlay = document.createElement("span");
    overlay.setAttribute("aria-hidden", "true");
    const s = overlay.style;
    s.position = "absolute";
    s.inset = "0";
    s.borderRadius = "inherit";
    s.background = "#fff";
    s.mixBlendMode = "difference";
    s.pointerEvents = "none";
    s.zIndex = "40";
    // Reste dans la silhouette arrondie du bouton (scaleX plutôt que clip-path
    // pour ne pas faire dépasser de coins carrés).
    s.transformOrigin = "left center";
    s.transform = "scaleX(0)";
    s.willChange = "transform, opacity";

    btn.appendChild(overlay);
    btn.__blurWipeOverlay = overlay;

    const animation = overlay.animate(
      [
        { transform: "scaleX(0)", opacity: 1, offset: 0 },
        { transform: "scaleX(1)", opacity: 1, offset: 0.6 },
        { transform: "scaleX(1)", opacity: 0, offset: 1 }
      ],
      {
        duration: 820,
        easing: "cubic-bezier(0.22, 0.61, 0.36, 1)",
        fill: "forwards"
      }
    );

    const cleanup = () => {
      if (btn.__blurWipeOverlay === overlay) btn.__blurWipeOverlay = null;
      overlay.remove();
    };

    animation.onfinish = cleanup;
    animation.oncancel = cleanup;
  }

  window.addEventListener("pointerdown", onPointerDown, { passive: true });

  return () => {
    window.removeEventListener("pointerdown", onPointerDown);
  };
}
