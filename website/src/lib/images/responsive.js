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

/** La variante à utiliser pour une largeur donnée, en pixels réels — pour une
 *  image posée en FOND CSS, qui n'a pas de `srcset` (2026-11-20 : le pied de
 *  page de /services décodait 4 000 × 2 666 px, 43 Mo, au moment de se
 *  montrer). La plus petite qui couvre la largeur, sinon la plus grande. */
export function variantePour(src, largeur) {
  const e = entree(src);
  if (!e) return src;
  const jeton = src.includes("?") ? `?${src.split("?")[1]}` : "";
  const tailles = [...e.v];
  if (e.w <= ORIGINAL_MAX) tailles.push(e.w);
  tailles.sort((a, b) => a - b);
  const w = tailles.find((t) => t >= largeur) ?? tailles[tailles.length - 1];
  if (w === undefined || w === e.w) return src;
  return `${nomVariante(src.split("?")[0], w)}${jeton}`;
}
