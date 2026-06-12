<script>
  import { getContext, onMount } from "svelte";
  import { PROJECT_THEME_CONTEXT } from "./projectThemeContext.js";

  export let theme = "light";
  export let offset = 0;

  let markerEl;
  const controller = getContext(PROJECT_THEME_CONTEXT);

  onMount(() => controller?.registerMarker(markerEl, theme, offset));
</script>

<span
  class="project-theme-trigger"
  bind:this={markerEl}
  aria-hidden="true"
></span>

<style>
  .project-theme-trigger {
    display: block;
    width: 100%;
    height: 1px;
    margin-top: -1px;
    pointer-events: none;
  }
</style>
