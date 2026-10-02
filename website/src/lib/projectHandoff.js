/**
 * Le relais entre le pied de page « projet suivant » et le hero qui lui succède.
 *
 * Le pied de page peint DÉJÀ l'image du hero du projet suivant, au même cadrage
 * et avec le titre à la même place. Quand la navigation part, les deux images
 * sont donc identiques à l'écran : il ne faut surtout pas que le nouveau hero
 * rejoue son arrivée (média qui monte de l'opacité zéro, titre qui sort du flou
 * en traversant l'indigo de la charte) — on verrait l'image disparaître puis
 * revenir.
 *
 * Le pied de page lève donc ce drapeau juste avant de naviguer ; le hero le
 * consomme à sa création — PAS dans `onMount`, sinon l'état serait posé après le
 * premier rendu et l'arrivée aurait déjà commencé.
 *
 * Le drapeau se périme tout seul : si la navigation est annulée, il ne doit pas
 * rester levé pour la page suivante, quelle qu'elle soit.
 */
let pending = 0;

/** Validité du relais, en millisecondes. Une navigation interne est immédiate. */
const DUREE_DE_VIE = 2500;

export function markProjectHandoff() {
  pending = Date.now();
}

export function consumeProjectHandoff() {
  if (!pending) return false;
  const frais = Date.now() - pending < DUREE_DE_VIE;
  pending = 0;
  return frais;
}

export function clearProjectHandoff() {
  pending = 0;
}
