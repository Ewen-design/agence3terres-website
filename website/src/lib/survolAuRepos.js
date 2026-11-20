// ───────────────────────────────────────────────────────────────────────────
//  Pas d'effets de SURVOL pendant que la page défile (2026-11-20, bureau).
//
//  Le curseur reste posé pendant qu'on défile au pavé ou à la molette : les
//  blocs passent dessous, et chacun lançait son effet de survol en pleine
//  glissade — dézoom des images et titre qui bascule des cartes « Trois
//  pôles », bouton « + » des cartes « Accompagnement / Parlons-en », slider
//  des projets, questions de la FAQ. Mesuré dans Safari, curseur sur la page :
//  18 changements de survol sur une descente de la home, pile sur les blocs où
//  le client sentait un « frein ». Des choses qui bougent à contre-temps du
//  défilement, et du travail de rendu en plus pendant la glissade.
//
//  Pendant un défilement À LA MOLETTE / AU PAVÉ, la page (`.page-stage`) ne
//  capte plus le pointeur (classe `survol-suspendu` sur <html>, voir app.css) ;
//  200 ms après le dernier mouvement de la page, tout redevient survolable.
//  Seul un geste de molette déclenche la suspension : un défilement venu du
//  site (ancre, retour en haut, clavier, test automatique) ne la pose pas. Et
//  la souris qui BOUGE vraiment la lève aussitôt — pour cliquer, on bouge :
//  aucun clic n'est perdu (Safari envoie aussi des `mousemove` immobiles après
//  un défilement, écartés). Le header reste cliquable (hors `.page-stage`).
//  Écran tactile : rien à faire.
// ───────────────────────────────────────────────────────────────────────────
const REPOS_MS = 200;

export function installerSurvolAuRepos() {
  if (typeof window === "undefined") return () => {};
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {};
  const html = document.documentElement;
  let minuterie = 0;
  let suspendu = false;
  const lever = () => {
    clearTimeout(minuterie);
    if (!suspendu) return;
    suspendu = false;
    html.classList.remove("survol-suspendu");
  };
  const prolonger = () => {
    clearTimeout(minuterie);
    minuterie = window.setTimeout(lever, REPOS_MS);
  };
  const aLaMolette = () => {
    if (!suspendu) {
      suspendu = true;
      html.classList.add("survol-suspendu");
    }
    prolonger();
  };
  const auDefilement = () => {
    if (suspendu) prolonger();
  };
  const aLaSouris = (e) => {
    if (suspendu && (e.movementX || e.movementY)) lever();
  };
  window.addEventListener("wheel", aLaMolette, { passive: true });
  window.addEventListener("scroll", auDefilement, { passive: true });
  window.addEventListener("mousemove", aLaSouris, { passive: true });
  return () => {
    window.removeEventListener("wheel", aLaMolette);
    window.removeEventListener("scroll", auDefilement);
    window.removeEventListener("mousemove", aLaSouris);
    lever();
  };
}
