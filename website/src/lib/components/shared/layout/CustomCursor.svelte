<script>
  import { onDestroy, onMount } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";

  let cursor;
  let isDesktop = false;
  let isVisible = false;
  let mode = "view";
  let x = 0;
  let y = 0;
  let mediaQuery;
  let carouselDirection = "next";

  $: themeClass =
    $page.url.pathname === "/services" ? "theme-services" :
    ["/travail", "/projet1", "/projet2"].includes($page.url.pathname) ? "theme-projets" :
    $page.url.pathname === "/apropos" ? "theme-apropos" :
    $page.url.pathname === "/contact" ? "theme-contact" :
    "";

  function updateTransform() {
    if (!cursor) return;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  function syncStateFromPoint(clientX, clientY) {
    const hovered = document.elementFromPoint(clientX, clientY);
    const carouselEl = hovered?.closest?.("[data-cursor='carousel']");
    const viewEl = hovered?.closest?.("[data-cursor='view']");

    if (carouselEl) {
      mode = "carousel";
      isVisible = true;
      return;
    }

    if (viewEl) {
      mode = "view";
      isVisible = true;
      return;
    }

    isVisible = false;
  }

  function move(event) {
    syncStateFromPoint(event.clientX, event.clientY);
    if (mode === "carousel") {
      x = event.clientX - 30;
      y = event.clientY - 30;
    } else {
      x = event.clientX + 16;
      y = event.clientY + 14;
    }
    updateTransform();
  }

  function updateCarouselDirection(event) {
    carouselDirection = event.detail;
  }

  function hide() {
    isVisible = false;
  }

  function addListeners() {
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", hide);
    window.addEventListener("blur", hide);
    window.addEventListener("carousel-direction", updateCarouselDirection);
  }

  function removeListeners() {
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseleave", hide);
    window.removeEventListener("blur", hide);
    window.removeEventListener("carousel-direction", updateCarouselDirection);
    isVisible = false;
  }

  function updateCursorMode() {
    const nextIsDesktop = mediaQuery?.matches ?? false;

    if (nextIsDesktop === isDesktop) return;
    isDesktop = nextIsDesktop;

    if (isDesktop) addListeners();
    else removeListeners();
  }

  onMount(() => {
    if (!browser) return;

    mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 769px)");
    updateCursorMode();

    const onMediaChange = () => updateCursorMode();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", onMediaChange);
    } else {
      mediaQuery.addListener(onMediaChange);
    }

    return () => {
      if (mediaQuery?.removeEventListener) {
        mediaQuery.removeEventListener("change", onMediaChange);
      } else {
        mediaQuery?.removeListener(onMediaChange);
      }

      removeListeners();
    };
  });

  onDestroy(() => {
    if (!browser) return;
    removeListeners();
  });
</script>

{#if isDesktop}
  <div
    bind:this={cursor}
    class={`cursor-indicator ${themeClass}`}
    class:is-visible={isVisible}
    class:is-carousel={mode === "carousel"}
    class:is-view={mode === "view"}
    aria-hidden="true"
  >
    {#if mode === "carousel"}
      <div class="cursor-arrow {carouselDirection}">
        <svg viewBox="0 0 60 20" fill="none">
          <path d="M0 10H50" stroke="white" stroke-width="1.5" />
          <path d="M40 2L50 10L40 18" stroke="white" stroke-width="1.5" />
        </svg>
      </div>
    {:else}
      <span>VOIR</span>
    {/if}
  </div>
{/if}

<style>
  .cursor-indicator {
    --cursor-glow-core:
      radial-gradient(
        68px circle at 50% 50%,
        rgba(255, 225, 140, 1) 0%,
        rgba(212, 175, 55, 0.95) 22%,
        rgba(212, 102, 55, 0.55) 45%,
        rgba(212, 102, 55, 0.12) 62%,
        transparent 78%
      );
    --cursor-glow-soft:
      radial-gradient(
        78px circle at 50% 50%,
        rgba(212, 175, 55, 0.55) 0%,
        rgba(212, 102, 55, 0.22) 42%,
        transparent 72%
      );

    position: fixed;
    top: 0;
    left: 0;
    z-index: 10000;
    pointer-events: none;
    opacity: 0;
    transform: translate3d(0, 0, 0);
    transition:
      opacity 0.16s ease,
      transform 0.08s linear;
  }

  .cursor-indicator.is-visible {
    opacity: 1;
  }

  .cursor-indicator.is-view {
    min-width: 44px;
    height: 42px;
    padding: 0 16px;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    white-space: nowrap;
    background: rgba(6, 6, 8, 0.72);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 14px 24px rgba(0, 0, 0, 0.28);
  }

  .cursor-indicator.is-view span {
    position: relative;
    z-index: 1;
    font-size: 0.76rem;
    font-weight: 400;
    line-height: 1;
    letter-spacing: 0.01em;
  }

  .cursor-indicator.is-carousel {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    transform-origin: center center;
  }

  .cursor-arrow {
    width: 60px;
    height: 20px;
  }

  .cursor-arrow.prev {
    transform: rotate(180deg);
  }

  .cursor-arrow svg {
    width: 100%;
    height: 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    .cursor-indicator {
      transition: none;
    }
  }
</style>
