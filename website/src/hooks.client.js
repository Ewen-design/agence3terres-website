import { installLazyAhead } from "$lib/lazyAhead.js";
import { installerDefileur } from "$lib/defileur.js";
import { installPrechargement } from "$lib/prechargement.js";

// Ce fichier ne s'exécute que dans le navigateur (jamais au prérendu).
export function init() {
  // Écran tactile : la page défile dans `.defileur` (déjà dans le HTML
  // prérendu) — le relais doit être là AVANT que le routeur et les composants
  // ne lisent ou ne posent la position. Voir `$lib/defileur.js`.
  installerDefileur();
  // Les images en `loading="lazy"` partent 2,5 écrans en avance, rails
  // horizontaux compris — Safari, livré à lui-même, part trop tard. Elles
  // reçoivent la variante à la taille de leur boîte, et arrivent en fondu une
  // fois décodées.
  installLazyAhead();
  // L'image d'ouverture d'une page est chargée dès qu'on vise son lien.
  installPrechargement();
}

// Une adresse inconnue est un cas PRÉVU (Caddy sert 200.html, le routeur
// affiche +error.svelte) : le gestionnaire par défaut l'écrivait pourtant en
// ERREUR dans la console (« Not found: /… ») à chaque visite. Les vraies
// erreurs restent journalisées.
export function handleError({ error, status }) {
  if (status !== 404) console.error(error);
}
