import { installLazyAhead } from "$lib/lazyAhead.js";
import { installPrechargement } from "$lib/prechargement.js";

// Ce fichier ne s'exécute que dans le navigateur (jamais au prérendu).
export function init() {
  // Les images en `loading="lazy"` partent 2,5 écrans en avance, rails
  // horizontaux compris — Safari, livré à lui-même, part trop tard. Elles
  // reçoivent la variante à la taille de leur boîte, et arrivent en fondu une
  // fois décodées.
  installLazyAhead();
  // L'image d'ouverture d'une page est chargée dès qu'on vise son lien.
  installPrechargement();
}
