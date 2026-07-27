<script>
  import { onDestroy, onMount, setContext } from "svelte";
  import { browser } from "$app/environment";
  import {
    forceScrollEngineUpdate,
    registerRead,
    unregisterRead
  } from "$lib/scrollEngine.js";
  import { PROJECT_THEME_CONTEXT } from "./projectThemeContext.js";

  export let initialTheme = "dark";
  export let headerToneOverride = null;
  export let switchAnchor = 0.08;

  let rootEl;
  let theme = initialTheme;
  let markers = [];
  let activeMarkerIndex = null;
  let mounted = false;
  let lastHeaderTone = null;
  let lastLayoutTheme = null;
  let measureRaf = 0;
  let resizeTimer;
  let resizeObserver;

  const HYSTERESIS_PX = 18;

  function getScrollY() {
    return window.scrollY || window.pageYOffset || 0;
  }

  function measureMarkers() {
    const scrollY = getScrollY();

    markers = markers.filter((marker) => marker.node?.isConnected);
    markers.forEach((marker) => {
      marker.top = marker.node.getBoundingClientRect().top + scrollY + marker.offset;
    });
    markers.sort((a, b) => a.top - b.top);

    activeMarkerIndex = null;
  }

  function scheduleMeasure() {
    if (!browser) return;

    cancelAnimationFrame(measureRaf);
    measureRaf = requestAnimationFrame(() => {
      measureMarkers();
      forceScrollEngineUpdate();
    });
  }

  function registerMarker(node, nextTheme, offset = 0) {
    const marker = { node, theme: nextTheme, offset: Number(offset) || 0, top: 0 };
    markers = [...markers, marker];
    scheduleMeasure();

    return () => {
      markers = markers.filter((item) => item !== marker);
      scheduleMeasure();
    };
  }

  function resolveMarkerIndex(triggerLine) {
    if (activeMarkerIndex === null) {
      let resolved = -1;

      for (let index = 0; index < markers.length; index += 1) {
        if (triggerLine >= markers[index].top) resolved = index;
        else break;
      }

      return resolved;
    }

    let resolved = activeMarkerIndex;

    while (
      resolved + 1 < markers.length &&
      triggerLine >= markers[resolved + 1].top + HYSTERESIS_PX
    ) {
      resolved += 1;
    }

    while (
      resolved >= 0 &&
      triggerLine < markers[resolved].top - HYSTERESIS_PX
    ) {
      resolved -= 1;
    }

    return resolved;
  }

  function handleRead(y, context) {
    if (!markers.length) return;

    const viewportHeight = context?.vh || window.innerHeight || 1;
    const triggerOffset = Math.min(88, Math.max(56, viewportHeight * switchAnchor));
    const triggerLine = y + triggerOffset;
    const nextMarkerIndex = resolveMarkerIndex(triggerLine);

    activeMarkerIndex = nextMarkerIndex;

    const nextTheme =
      nextMarkerIndex >= 0 ? markers[nextMarkerIndex].theme : initialTheme;

    if (nextTheme !== theme) theme = nextTheme;
  }

  function syncHeaderTone() {
    if (!browser || !mounted) return;

    const tone = headerToneOverride || (theme === "light" ? "dark" : "light");
    if (tone === lastHeaderTone) return;

    lastHeaderTone = tone;
    window.dispatchEvent(new CustomEvent("project-header-tone", { detail: { tone } }));
  }

  function syncLayoutTheme() {
    if (!browser || !mounted || theme === lastLayoutTheme) return;

    lastLayoutTheme = theme;
    window.dispatchEvent(new CustomEvent("project-theme-change", { detail: { theme } }));
  }

  setContext(PROJECT_THEME_CONTEXT, { registerMarker });

  $: syncHeaderTone(theme, headerToneOverride);
  $: syncLayoutTheme(theme);

  onMount(() => {
    mounted = true;
    measureMarkers();
    registerRead(handleRead, { priority: 1 });
    syncHeaderTone();
    syncLayoutTheme();
    forceScrollEngineUpdate();

    // Au premier chargement d'une page, l'onMount de ce composant (enfant) tourne
    // AVANT celui du layout (parent) qui pose ses écouteurs `project-theme-change`
    // / `project-header-tone`. Les pages projet classiques changent de thème au
    // scroll et se resynchronisent, mais une page à thème STATIQUE (ex. pôle
    // Design, clair) n'émet qu'une fois — au mauvais moment. On force donc une
    // ré-émission au frame suivant, quand les écouteurs du layout sont en place.
    requestAnimationFrame(() => {
      if (!mounted) return;
      lastHeaderTone = null;
      lastLayoutTheme = null;
      syncHeaderTone();
      syncLayoutTheme();
    });

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(scheduleMeasure, 80);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });
    window.addEventListener("pageshow", scheduleMeasure);

    if (typeof ResizeObserver !== "undefined" && rootEl) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(rootEl);
    }

    return () => {
      mounted = false;
      unregisterRead(handleRead);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      window.removeEventListener("pageshow", scheduleMeasure);
      clearTimeout(resizeTimer);
      cancelAnimationFrame(measureRaf);
      resizeObserver?.disconnect();
    };
  });

  onDestroy(() => {
    if (!browser) return;
    window.dispatchEvent(new CustomEvent("project-header-tone", { detail: { tone: null } }));
    window.dispatchEvent(new CustomEvent("project-theme-change", { detail: { theme: null } }));
  });
</script>

<div
  class="project-theme-page"
  class:theme-light={theme === "light"}
  class:theme-night={theme === "night"}
  class:theme-dark={theme !== "light" && theme !== "night"}
  data-project-theme={theme}
  bind:this={rootEl}
>
  <slot />
</div>
