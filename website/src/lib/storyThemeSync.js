import { writable } from "svelte/store";

export const storyDarkPhase = writable(false);

export function setStoryDarkPhase(value) {
  storyDarkPhase.set(!!value);
}

export function resetStoryDarkPhase() {
  storyDarkPhase.set(false);
}