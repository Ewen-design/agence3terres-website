import { installLazyAhead } from "$lib/lazyAhead.js";

// Ce fichier ne s'exécute que dans le navigateur (jamais au prérendu).
export function init() {
  // Les images en `loading="lazy"` partent 2,5 écrans en avance, rails
  // horizontaux compris — Safari, livré à lui-même, part trop tard.
  installLazyAhead();
}
