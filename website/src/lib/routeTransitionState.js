let pendingSilentNavigation = false;
let activeSilentNavigation = false;

export function markNextNavigationSilent() {
  pendingSilentNavigation = true;
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
