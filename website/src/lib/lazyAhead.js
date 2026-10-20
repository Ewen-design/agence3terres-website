/*  ── Chargement anticipé des images différées ─────────────────────────────
 *
 *  Pourquoi ce fichier existe (2026-10-20, plainte « images qui arrivent en
 *  retard / à blanc », sur iPhone ET sur le Mac du client, tous deux Safari).
 *
 *  `loading="lazy"` laisse le NAVIGATEUR décider quand partir chercher l'image.
 *  Chromium part très tôt (1 250 à 2 500 px avant l'écran selon le réseau).
 *  Safari part tard, à peine avant l'écran : sur un réseau moyen, l'image n'est
 *  pas arrivée quand elle entre dans le cadre et on voit le fond. Mesuré au
 *  Playwright, réseau bridé à 400 Ko/s : WebKit a des images vides sur 17 pas
 *  de défilement sur 72 (home) et 35 sur 95 (Harmonia), Chromium sur 0 à 8.
 *
 *  Deuxième trou, pour TOUS les navigateurs : une image différée posée dans un
 *  rail horizontal (cartes des pôles, sliders) est rognée par le rail tant
 *  qu'on n'a pas glissé jusqu'à elle. Aucune marge ne la rattrape : elle ne
 *  part qu'une fois à l'écran, donc toujours en retard.
 *
 *  Ce module garde `loading="lazy"` dans le HTML (le navigateur ne charge pas
 *  tout d'un coup) mais bascule chaque image en `eager` dès qu'elle arrive à
 *  AHEAD écrans sous le bas de la fenêtre. Une image dans un rail rogné est
 *  suivie à travers son rail : elle part quand le rail approche, comme ses
 *  voisines.
 *
 *  Ce qu'il ne fait PAS :
 *   - une image dont un ancêtre est en `display: none` n'a pas de boîte, donc
 *     pas d'intersection : elle n'est jamais demandée (c'est voulu, voir
 *     `home/HomeFeatureCards.svelte`). Si le bloc s'affiche plus tard,
 *     l'observateur la voit à ce moment-là.
 *   - aucune lecture de mise en page pendant le défilement : tout passe par un
 *     IntersectionObserver (calculé par le navigateur au rendu). Les seules
 *     lectures (`getComputedStyle`, `getBoundingClientRect`, pour savoir si
 *     un rail la cache) ont lieu une fois par image, à son arrivée dans le DOM.
 *   - rien si l'utilisateur a demandé l'économie de données (`saveData`).
 * ─────────────────────────────────────────────────────────────────────────── */

/** Écrans d'avance sous la fenêtre (et derrière, pour un retour en arrière). */
const AHEAD = 2.5;
const BEHIND = 1;

let installed = false;

export function installLazyAhead() {
  if (installed || typeof window === "undefined") return;
  if (!("IntersectionObserver" in window)) return;
  if (navigator.connection?.saveData) return;
  installed = true;

  const seen = new WeakSet();
  /** cible observée → images qu'elle porte (l'image elle-même, ou son rail) */
  const groups = new Map();

  const load = (img) => {
    if (img.getAttribute("loading") === "lazy") img.setAttribute("loading", "eager");
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const imgs = groups.get(entry.target);
        groups.delete(entry.target);
        io.unobserve(entry.target);
        imgs?.forEach(load);
      }
    },
    { rootMargin: `${BEHIND * 100}% 0px ${AHEAD * 100}% 0px` }
  );

  /*  Le rail qui rogne l'image horizontalement, s'il y en a un : premier
   *  ancêtre qui coupe en x ET hors duquel l'image tombe entièrement (carte
   *  rangée à droite d'un rail). Un cadre qui ne fait que rogner les bords
   *  d'une image agrandie (parallaxe) ne compte pas. Les très grands
   *  conteneurs (la page entière) sont ignorés : les suivre ferait tout partir
   *  dès l'ouverture. */
  const clipTarget = (img) => {
    const r = img.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return img;
    const maxH = window.innerHeight * 2;
    let el = img.parentElement;
    for (let depth = 0; el && el !== document.body && depth < 12; depth++, el = el.parentElement) {
      if (getComputedStyle(el).overflowX === "visible") continue;
      const b = el.getBoundingClientRect();
      const dehors = r.right <= b.left + 1 || r.left >= b.right - 1;
      if (dehors && b.height < maxH) return el;
    }
    return img;
  };

  const register = (img) => {
    if (seen.has(img)) return;
    seen.add(img);
    if (img.complete && img.naturalWidth > 0) return;
    const target = clipTarget(img);
    let set = groups.get(target);
    if (!set) {
      set = new Set();
      groups.set(target, set);
      io.observe(target);
    }
    set.add(img);
  };

  const scan = () => {
    // Les cibles d'une page quittée ne croiseront plus jamais la fenêtre.
    for (const target of groups.keys()) {
      if (!target.isConnected) {
        io.unobserve(target);
        groups.delete(target);
      }
    }
    document.querySelectorAll('img[loading="lazy"]').forEach(register);
  };

  // Navigation interne : les nouvelles pages arrivent par le routeur.
  let pending = 0;
  const schedule = () => {
    if (pending) return;
    pending = window.setTimeout(() => {
      pending = 0;
      scan();
    }, 120);
  };
  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  scan();
}
