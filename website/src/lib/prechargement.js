// ───────────────────────────────────────────────────────────────────────────
//  Préchargement de l'image d'ouverture de la page VISÉE.
//
//  SvelteKit précharge déjà le CODE d'une page au survol d'un lien
//  (`data-sveltekit-preload-data="hover"` dans app.html) — pas ses images. La
//  page suivante se montait donc sous la transition et commençait seulement à
//  ce moment-là à télécharger son hero : il arrivait vide, puis l'image
//  tombait. Ici, dès qu'on survole, qu'on touche ou qu'on prend au clavier un
//  lien interne, l'image d'ouverture de sa page est téléchargée ET décodée.
//  Au clic, elle est déjà là : la transition (qui l'attend, voir
//  `$lib/mediaPret.js`) se fait sans attente.
//
//  Ce qui est préchargé, par ordre de confiance :
//    • page projet : l'image du hero décrite dans `$lib/data/projets.js`
//      (l'affiche, pour un hero vidéo) ;
//    • toute page : les `<img fetchpriority="high">` et les
//      `<link rel="preload" as="image">` de son HTML prérendu (lu une fois).
//  La variante choisie est la même que celle que choisira la page : même
//  `srcset`, même `sizes`, même source de `<picture>` selon l'écran.
// ───────────────────────────────────────────────────────────────────────────
import { PROJETS } from "$lib/data/projets.js";
import { srcset as variantes } from "$lib/images/responsive.js";

const pages = new Map(); // route → Promise
const gardees = []; // les dernières images préchargées (retenues en mémoire)
const GARDER = 8;

const normaliser = (p) => p.replace(/\/+$/, "") || "/";

function routeDe(lien) {
  if (!(lien instanceof HTMLAnchorElement)) return null;
  if (lien.target && lien.target !== "_self") return null;
  if (lien.hasAttribute("download")) return null;
  try {
    const u = new URL(lien.href, location.href);
    if (u.origin !== location.origin) return null;
    const route = normaliser(u.pathname);
    if (route === normaliser(location.pathname)) return null;
    if (/\.[a-z0-9]+$/i.test(route)) return null; // un fichier, pas une page
    return route;
  } catch {
    return null;
  }
}

function charger({ src, srcset, sizes }) {
  if (!src && !srcset) return Promise.resolve();
  const img = new Image();
  img.decoding = "async";
  if (sizes) img.sizes = sizes;
  if (srcset) img.srcset = srcset;
  if (src) img.src = src;
  gardees.push(img);
  if (gardees.length > GARDER) gardees.shift();
  return (typeof img.decode === "function" ? img.decode() : Promise.resolve()).catch(() => {});
}

const ecran = (media) => !media || window.matchMedia(media).matches;

async function depuisHtml(route) {
  const res = await fetch(route === "/" ? "/" : `${route}/`, { credentials: "same-origin" });
  if (!res.ok) return [];
  const doc = new DOMParser().parseFromString(await res.text(), "text/html");
  const out = [];
  for (const l of doc.querySelectorAll('link[rel="preload"][as="image"]')) {
    if (!ecran(l.getAttribute("media"))) continue;
    out.push({ src: l.getAttribute("href"), srcset: l.getAttribute("imagesrcset"), sizes: l.getAttribute("imagesizes") });
  }
  for (const img of doc.querySelectorAll('img[fetchpriority="high"]')) {
    const picture = img.parentElement?.tagName === "PICTURE" ? img.parentElement : null;
    const source = picture
      ? [...picture.querySelectorAll("source")].find((s) => ecran(s.getAttribute("media")))
      : null;
    if (source) out.push({ srcset: source.getAttribute("srcset"), sizes: source.getAttribute("sizes") });
    else out.push({ src: img.getAttribute("src"), srcset: img.getAttribute("srcset"), sizes: img.getAttribute("sizes") });
  }
  return out;
}

function depuisProjets(route) {
  const projet = PROJETS.find((p) => `/${p.slug}` === route);
  if (!projet?.hero) return [];
  const src = window.matchMedia("(max-width: 640px)").matches && projet.hero.mobileImage
    ? projet.hero.mobileImage
    : projet.hero.image;
  return [{ src, srcset: variantes(src), sizes: "100vw" }];
}

/** Précharge l'ouverture d'une page (une seule fois par page). */
export function prechargerPage(route) {
  if (!route || pages.has(route)) return pages.get(route);
  const p = (async () => {
    const liste = depuisProjets(route);
    try {
      liste.push(...(await depuisHtml(route)));
    } catch {
      // Hors ligne ou page inconnue : rien à précharger.
    }
    const vues = new Set();
    await Promise.all(
      liste.filter((x) => {
        const cle = x.srcset || x.src;
        if (!cle || vues.has(cle)) return false;
        vues.add(cle);
        return true;
      }).map(charger)
    );
  })();
  pages.set(route, p);
  return p;
}

let installe = false;

export function installPrechargement() {
  if (installe || typeof window === "undefined") return;
  if (navigator.connection?.saveData) return;
  installe = true;

  let survol = 0;
  /*  Un `pointerover` arrive aussi quand la PAGE défile sous une souris
   *  immobile : chaque lien qui passe sous le curseur lançait alors un
   *  téléchargement et une analyse de page en plein défilement (Safari bureau
   *  le payait). On ne retient que les survols précédés d'un vrai mouvement
   *  de la souris. */
  let dernierMouvement = -1e9;
  document.addEventListener("pointermove", () => (dernierMouvement = performance.now()), { passive: true });
  const viser = (event, delai) => {
    const lien = event.target instanceof Element ? event.target.closest("a[href]") : null;
    const route = routeDe(lien);
    if (!route) return;
    clearTimeout(survol);
    if (delai) survol = window.setTimeout(() => prechargerPage(route), delai);
    else prechargerPage(route);
  };

  // Au survol, un court délai : un pointeur qui ne fait que traverser un
  // lien ne déclenche rien.
  document.addEventListener(
    "pointerover",
    (e) => e.pointerType === "mouse" && performance.now() - dernierMouvement < 120 && viser(e, 70),
    { passive: true }
  );
  document.addEventListener("pointerout", () => clearTimeout(survol), { passive: true });
  document.addEventListener("touchstart", (e) => viser(e, 0), { passive: true });
  document.addEventListener("focusin", (e) => viser(e, 0));
}
