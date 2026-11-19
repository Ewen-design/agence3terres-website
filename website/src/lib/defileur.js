/*  ── Le défilement interne sur écran tactile (2026-11-19) ──────────────────
 *
 *  Comme estrela.studio : sur téléphone et tablette, ce n'est plus le
 *  DOCUMENT qui défile mais `.defileur`, un bloc plein écran (voir app.css et
 *  +layout.svelte). Safari ne replie plus jamais sa barre, la fenêtre ne
 *  change plus de taille en cours de route, et ses éléments fixes (le header)
 *  ne peuvent plus glisser — le bug WebKit qu'aucun recalage ne rattrapait
 *  à coup sûr (voir `$lib/fixedResync.js`, désactivé dans ce mode).
 *
 *  Tout le site (moteur de défilement, menu, transitions, pied de page
 *  « projet suivant », sliders, et SvelteKit lui-même pour la remise en haut
 *  et le retour arrière) parle à la FENÊTRE : `scrollY`, `scrollTo`,
 *  l'événement `scroll`, la hauteur du document. Plutôt que de réécrire ces
 *  ~130 appels, ce module les redirige vers le bloc :
 *   - `window.scrollY` / `pageYOffset` / `scrollX` / `pageXOffset` lisent le
 *     bloc ; `window.scrollTo` / `scroll` / `scrollBy` le font défiler ;
 *   - `document.documentElement.scrollTop` et `scrollHeight` aussi ;
 *   - chaque `scroll` (et `scrollend`) du bloc est réémis sur `window`.
 *  Ce qui ne passe pas par ces API reste juste tel quel : les
 *  IntersectionObserver (la fenêtre est toujours la racine, et le bloc la
 *  couvre exactement), `getBoundingClientRect`, `position: sticky` (collé au
 *  bloc, qui couvre l'écran), `scrollIntoView`.
 *
 *  Sur bureau (pointeur fin) : rien n'est installé, la classe n'est pas
 *  posée — Lenis et le défilement natif du document restent tels quels.
 * ─────────────────────────────────────────────────────────────────────────── */

let bloc = null;

export const defilementInterne = () =>
  typeof document !== "undefined" && document.documentElement.classList.contains("defilement-interne");

function relayer(cible, nom, get, set) {
  try {
    Object.defineProperty(cible, nom, {
      configurable: true,
      enumerable: true,
      get,
      set: set ?? (() => {})
    });
  } catch {
    // Propriété non reconfigurable sur ce navigateur : on laisse la native.
  }
}

/** Installe le relais. Idempotent ; rend le bloc, ou `null` hors de ce mode. */
export function installerDefileur() {
  if (bloc) return bloc;
  if (!defilementInterne()) return null;
  const el = document.querySelector(".defileur");
  if (!el) return null;
  bloc = el;

  const haut = () => el.scrollTop;
  const gauche = () => el.scrollLeft;
  relayer(window, "scrollY", haut);
  relayer(window, "pageYOffset", haut);
  relayer(window, "scrollX", gauche);
  relayer(window, "pageXOffset", gauche);

  const vers = (a, b) => (a && typeof a === "object" ? el.scrollTo(a) : el.scrollTo(+a || 0, +b || 0));
  window.scrollTo = vers;
  window.scroll = vers;
  window.scrollBy = (a, b) => (a && typeof a === "object" ? el.scrollBy(a) : el.scrollBy(+a || 0, +b || 0));

  const racine = document.documentElement;
  relayer(racine, "scrollTop", haut, (v) => (el.scrollTop = v));
  relayer(racine, "scrollHeight", () => el.scrollHeight);

  el.addEventListener("scroll", () => window.dispatchEvent(new Event("scroll")), { passive: true });
  el.addEventListener("scrollend", () => window.dispatchEvent(new Event("scrollend")), { passive: true });
  return el;
}
