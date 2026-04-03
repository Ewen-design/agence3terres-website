import { writable, derived } from "svelte/store";

const enteredLightZone = writable(false);
const exitedLightZone = writable(false);

export const sharedLightPhase = derived(
  [enteredLightZone, exitedLightZone],
  ([$enteredLightZone, $exitedLightZone]) => $enteredLightZone && !$exitedLightZone
);

export function setEnteredLightZone(value) {
  enteredLightZone.set(!!value);
}

export function setExitedLightZone(value) {
  exitedLightZone.set(!!value);
}

export function resetSharedLightPhase() {
  enteredLightZone.set(false);
  exitedLightZone.set(false);
}