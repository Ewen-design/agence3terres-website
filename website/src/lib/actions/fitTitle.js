// ─────────────────────────────────────────────────────────────────────────────
//  fitTitle — un titre géant qui ne sort jamais de l'écran (2026-10-09)
//
//  Les grands titres des pages projet sont dimensionnés en `vw`, mot par mot
//  (`max-width` en `ch`, `min-width: min-content`). Un mot très long ne peut donc
//  pas revenir à la ligne : « Ludosphères » débordait de 4 à 8 px à droite sur
//  tous les téléphones, le dégradé du titre (peint sur la boîte) le rognait.
//
//  L'action mesure le MOT LE PLUS LONG à la taille prévue par le CSS, la compare
//  à la place disponible — la largeur de l'écran moins la marge de gauche du
//  titre, reportée à droite (marges égales) — et pose
//  `--title-fit` = la réduction juste nécessaire (1 si ça tient). Le CSS
//  multiplie sa taille par ce facteur : `calc(clamp(…) * var(--title-fit, 1))`.
//  Les titres qui tiennent ne bougent pas d'un pixel.
//
//  ⚠️ Posée à l'identique sur le hero projet ET sur le pied de page « projet
//  suivant » : les deux titres doivent se superposer au pixel près au changement
//  de page, ils doivent donc être réduits par le même calcul.
// ─────────────────────────────────────────────────────────────────────────────

const SAFETY = 0.985;

const COPIED = [
  "fontFamily",
  "fontWeight",
  "fontStyle",
  "fontStretch",
  "fontSize",
  "fontVariationSettings",
  "fontFeatureSettings",
  "letterSpacing",
  "textTransform"
];

export function fitTitle(node) {
  let frame = 0;

  function longestWordWidth() {
    const style = getComputedStyle(node);
    const probe = document.createElement("span");
    for (const key of COPIED) probe.style[key] = style[key];
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.whiteSpace = "nowrap";
    probe.style.left = "-9999px";
    probe.style.top = "0";
    document.body.appendChild(probe);
    let widest = 0;
    for (const word of (node.textContent || "").trim().split(/\s+/)) {
      probe.textContent = word;
      widest = Math.max(widest, probe.getBoundingClientRect().width);
    }
    probe.remove();
    return widest;
  }

  function measure() {
    frame = 0;
    if (!node.isConnected || !node.getClientRects().length) return;
    // Mesure à la taille PRÉVUE par le CSS : le facteur est retiré puis reposé
    // dans la même tâche, aucune image n'est peinte entre les deux.
    node.style.removeProperty("--title-fit");
    // La marge de gauche en coordonnées de MISE EN PAGE (offsetLeft), pas
    // d'écran : pendant une transition la page est réduite par un transform,
    // un getBoundingClientRect() y mesurerait une marge fausse. Et pas la
    // largeur du parent : s'il épouse son contenu, le titre se réduirait à
    // chaque mesure, sans fin.
    let left = 0;
    for (let el = node; el; el = el.offsetParent) left += el.offsetLeft;
    const room = document.documentElement.clientWidth - 2 * left;
    const word = longestWordWidth();
    if (!room || !word) return;
    const fit = Math.min(1, (room * SAFETY) / word);
    if (fit < 1) node.style.setProperty("--title-fit", fit.toFixed(4));
  }

  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(measure);
  }

  measure();
  // La police arrive parfois après le montage : une mesure faite avec la
  // police de repli serait fausse.
  document.fonts?.ready?.then(schedule);
  window.addEventListener("resize", schedule, { passive: true });

  return {
    // Le titre peut changer (pied de page qui passe au projet suivant).
    update: schedule,
    destroy() {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
    }
  };
}
