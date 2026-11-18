// Les variantes responsives d'une image, telles que le build les a validées
// (voir `scripts/images-responsives.mjs` et le greffon `imagesVariantes` de
// `vite.config.js`). Appelé par le code qu'injecte `preprocess.js` : rien à
// importer à la main dans les composants.
import variantes from "virtual:images-variantes";

/** Au-delà, l'original n'entre pas dans le `srcset` : on plafonne à 2880. */
const ORIGINAL_MAX = 3200;

const nomVariante = (chemin, largeur) =>
  `/images/_r/${chemin.replace(/^\//, "").replace(/\.[a-z]+$/i, "").replace(/\//g, "__")}-${largeur}.webp`;

function entree(src) {
  if (typeof src !== "string" || !src.startsWith("/")) return null;
  return variantes[src.split("?")[0]] ?? null;
}

/** `srcset` complet, ou `undefined` (l'attribut n'est alors pas posé). Le
 *  jeton `?v=` de l'original suit ses variantes : remplacer l'image remplace
 *  aussi leurs adresses. */
export function srcset(src) {
  const e = entree(src);
  if (!e || !e.v.length) return undefined;
  const jeton = src.includes("?") ? `?${src.split("?")[1]}` : "";
  const parts = e.v.map((l) => `${nomVariante(src.split("?")[0], l)}${jeton} ${l}w`);
  if (e.w <= ORIGINAL_MAX) parts.push(`${src} ${e.w}w`);
  return parts.join(", ");
}

/** Dimensions intrinsèques : réservent la place de l'image avant son arrivée. */
export const w = (src) => entree(src)?.w;
export const h = (src) => entree(src)?.h;
