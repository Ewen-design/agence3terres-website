<script>
  import { onDestroy, onMount } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";

  let cursor;
  let isDesktop = false;
  let isVisible = false;
  let mode = "view";
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let mediaQuery;
  let carouselDirection = "next";
  let rafId = 0;
  let isSafariDesktop = false;

  $: themeClass =
    $page.url.pathname === "/services" ? "theme-services" :
    ["/travail", "/projet1", "/projet3", "/projet4", "/projet5", "/projet6", "/projet7"].includes($page.url.pathname) ? "theme-projets" :
    $page.url.pathname === "/apropos" ? "theme-apropos" :
    $page.url.pathname === "/contact" ? "theme-contact" :
    "";

  function updateTransform() {
    if (!cursor) return;
    cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
  }

  function stopCursorLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function runCursorLoop() {
    if (rafId || !isDesktop) return;

    const loop = () => {
      const lerp = isSafariDesktop ? 0.34 : 0.24;
      currentX += (targetX - currentX) * lerp;
      currentY += (targetY - currentY) * lerp;

      if (Math.abs(targetX - currentX) < 0.1) currentX = targetX;
      if (Math.abs(targetY - currentY) < 0.1) currentY = targetY;

      updateTransform();

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
  }

  function syncStateFromTarget(target) {
    const hovered = target instanceof Element ? target : null;
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
    if (mode === "carousel") {
      targetX = event.clientX - 30;
      targetY = event.clientY - 30;
    } else {
      targetX = event.clientX + 16;
      targetY = event.clientY + 14;
    }
  }

  function handlePointerOver(event) {
    syncStateFromTarget(event.target);
  }

  function handlePointerOut(event) {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Element) {
      syncStateFromTarget(nextTarget);
      return;
    }

    isVisible = false;
  }

  function updateCarouselDirection(event) {
    carouselDirection = event.detail;
  }

  function hide() {
    isVisible = false;
  }

  function addListeners() {
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", handlePointerOver, { passive: true });
    document.addEventListener("pointerout", handlePointerOut, { passive: true });
    window.addEventListener("mouseleave", hide);
    window.addEventListener("blur", hide);
    window.addEventListener("carousel-direction", updateCarouselDirection);
    runCursorLoop();
  }

  function removeListeners() {
    window.removeEventListener("pointermove", move);
    document.removeEventListener("pointerover", handlePointerOver);
    document.removeEventListener("pointerout", handlePointerOut);
    window.removeEventListener("mouseleave", hide);
    window.removeEventListener("blur", hide);
    window.removeEventListener("carousel-direction", updateCarouselDirection);
    stopCursorLoop();
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

    const ua = window.navigator.userAgent || "";
    const vendor = window.navigator.vendor || "";
    isSafariDesktop =
      /Safari/i.test(ua) &&
      !/Chrome|CriOS|Edg|OPR|Firefox|FxiOS/i.test(ua) &&
      /Apple/i.test(vendor) &&
      !(window.matchMedia?.("(pointer: coarse)")?.matches ?? false);

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
    class:is-safari={isSafariDesktop}
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
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10000;
    pointer-events: none;
    opacity: 0;
    transform: translate3d(0, 0, 0);
    transition:
      opacity 0.16s ease;
    will-change: transform, opacity;
    contain: layout style paint;
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

  .cursor-indicator.is-safari.is-view {
    background: rgba(12, 12, 14, 0.9);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.2);
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

  .cursor-indicator.is-safari.is-carousel {
    width: 56px;
    height: 56px;
  }

  .cursor-arrow {
    width: 60px;
    height: 20px;
  }

  .cursor-indicator.is-safari .cursor-arrow {
    width: 56px;
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
