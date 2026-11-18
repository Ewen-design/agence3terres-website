// ───────────────────────────────────────────────────────────────────────────
//  Le premier écran est-il prêt à être montré ?
//
//  Repris d'Estrela (2026-11-18) : leur routeur ne découvre une page qu'une
//  fois l'image de son hero DÉCODÉE (`await img.decode()` puis deux images).
//  Ici, la même attente sert au préchargement du site (la phrase reste à
//  l'écran le temps qu'il faut) et à la transition de page (le voile ne se
//  lève qu'une fois l'image là) : on ne découvre plus jamais un hero vide
//  dont l'image tombe une seconde plus tard.
//
//  Toujours PLAFONNÉE : un réseau lent retarde l'ouverture d'un instant,
//  jamais au point de bloquer — passé le délai, on montre ce qu'on a.
// ───────────────────────────────────────────────────────────────────────────

const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const deuxImages = () =>
  new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

/** Les médias visibles dans le premier écran (boîte d'au moins 80 px). */
export function mediasPremierEcran(racine) {
  const zone = racine ?? document.querySelector(".page-wrapper") ?? document.body;
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const out = [];
  for (const m of zone.querySelectorAll("img, video")) {
    const r = m.getBoundingClientRect();
    if (r.width < 80 || r.height < 80) continue;
    if (r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) continue;
    out.push(m);
  }
  return out;
}

function imagePrete(img) {
  return new Promise((resolve) => {
    const fin = () => resolve();
    const decoder = () => (typeof img.decode === "function" ? img.decode().then(fin, fin) : fin());
    if (img.complete) {
      if (img.naturalWidth > 0) decoder();
      else fin(); // cassée, ou sans adresse : rien à attendre
      return;
    }
    img.addEventListener("load", decoder, { once: true });
    img.addEventListener("error", fin, { once: true });
  });
}

/** L'adresse d'un calque d'affiche posé en image de fond à côté de la vidéo
 *  (le hero de la home : `.hero__poster`). */
function afficheDeFond(video) {
  for (const el of video.parentElement?.children ?? []) {
    if (el === video) continue;
    const m = /url\(["']?([^"')]+)["']?\)/.exec(el.style?.backgroundImage || "");
    if (m) return m[1];
  }
  return null;
}

function videoPrete(video) {
  // Une vidéo avec affiche (attribut, ou calque d'affiche d'AutoVideo qui est
  // un <img> du premier écran, attendu à part) a déjà de quoi s'afficher.
  if (video.readyState >= 2 || video.getAttribute("poster")) return Promise.resolve();
  if (video.parentElement?.querySelector(":scope > img")) return Promise.resolve();
  // Affiche en image de fond : c'est elle qu'on attend, pas la vidéo (sur un
  // réseau lent, la vidéo n'a parfois rien à montrer avant longtemps).
  const fond = afficheDeFond(video);
  if (fond) {
    const img = new Image();
    img.src = fond;
    return imagePrete(img);
  }
  return new Promise((resolve) => {
    video.addEventListener("loadeddata", () => resolve(), { once: true });
    video.addEventListener("error", () => resolve(), { once: true });
  });
}

/**
 * Résout quand les médias du premier écran sont prêts (ou au plafond).
 * `peinte` : attendre en plus deux images d'affichage (hors View Transition).
 * @returns {Promise<boolean>} `true` si tout était prêt avant le plafond.
 */
export async function premierEcranPret({ racine, timeout = 800, peinte = true } = {}) {
  if (typeof window === "undefined") return true;
  const medias = mediasPremierEcran(racine);
  if (!medias.length) return true;
  // `peinte: false` pendant une View Transition : le navigateur y suspend
  // l'affichage, et `requestAnimationFrame` n'est pas appelé avant la fin de
  // la mise à jour — attendre deux images, c'était attendre le plafond.
  const tout = Promise.all(medias.map((m) => (m.tagName === "IMG" ? imagePrete(m) : videoPrete(m))))
    .then(() => (peinte ? deuxImages() : undefined))
    .then(() => true);
  return Promise.race([tout, attendre(timeout).then(() => false)]);
}
