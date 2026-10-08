let pendingSilentNavigation = false;
let activeSilentNavigation = false;

export function markNextNavigationSilent() {
  pendingSilentNavigation = true;
}

// La prochaine navigation est-elle déjà annoncée silencieuse (menu, pied de
// page « projet suivant ») ? Lu par la transition de page du menu, qui ne
// doit pas s'en mêler.
export function isSilentNavigationPending() {
  return pendingSilentNavigation;
}

export function activatePendingSilentNavigation() {
  if (!pendingSilentNavigation) return false;
  pendingSilentNavigation = false;
  activeSilentNavigation = true;
  return true;
}

export function isSilentNavigationActive() {
  return activeSilentNavigation;
}

export function clearSilentNavigation() {
  pendingSilentNavigation = false;
  activeSilentNavigation = false;
}
