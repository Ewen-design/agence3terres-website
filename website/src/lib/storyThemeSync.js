import { writable } from "svelte/store";

export const sharedLightPhase = writable(false);

export function setEnteredLightZone(value) {
  sharedLightPhase.set(!!value);
}

export function resetSharedLightPhase() {
  sharedLightPhase.set(false);
}