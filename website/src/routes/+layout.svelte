<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import "../app.css";
  import Header from "$lib/structure/Header.svelte";
  import Footer from "$lib/structure/Footer.svelte";
  import CustomCursor from "$lib/structure/CustomCursor.svelte";
  import IconeFleche from "$lib/structure/IconeFleche.svelte";
  import {
    initScrollEngine,
    destroyScrollEngine,
    updateScrollEngine,
    updateScrollEngineViewport,
  } from "$lib/scrollEngine.js";
  import { registerOverlay, registerGsap, registerLenis } from "$lib/navigate.js";
  import Lenis from "lenis";

  /** @type {HTMLElement} */
  let overlayEl;
  let lenis;
  let rafId;
  let isMobile = false;

  function checkMobile() {
    isMobile = window.innerWidth <= 768;
  }

  $: hideFooter = ["/projet1", "/projet2", "/contact"].includes($page.url.pathname);

  onMount(async () => {
    const gsapModule = await import("gsap");
    const gsap = gsapModule.gsap || gsapModule.default;

    registerOverlay(overlayEl);
    registerGsap(gsap);

    window.addEventListener("load", () => lenis?.resize());
    checkMobile();
    window.addEventListener("resize", () => {
      checkMobile();
      updateScrollEngineViewport();
    });

    initScrollEngine();
    updateScrollEngineViewport();

    lenis = new Lenis({
      duration: 1.35,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: window.innerWidth > 768,
      smoothTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 1,
    });
    window.lenis = lenis;
    lenis.on("scroll", (e) => updateScrollEngine(e.animatedScroll));
    registerLenis(lenis);

    function raf(time) {
      if (!lenis) return;
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);
    updateScrollEngine(window.scrollY || window.pageYOffset || 0);
  });

  onDestroy(() => {
    if (!browser) return;
    cancelAnimationFrame(rafId);
    lenis?.destroy();
    destroyScrollEngine();
    window.lenis = null;
  });
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Aboreto&family=Manrope:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<main>
  {#if !isMobile}
    <CustomCursor />
  {/if}
  <IconeFleche />
  <Header />

  <div class="page-wrapper">
    <slot />
  </div>

  {#if !hideFooter}
    <Footer />
  {/if}

  <!--
    Wipe overlay: always in DOM, collapsed by default.
    GSAP animates clip-path during page transitions and resets it on complete.
  -->
  <div
    class="wipe-overlay"
    bind:this={overlayEl}
  ></div>
</main>

<style>
  main {
    position: relative;
    width: 100%;
    overflow-x: clip;
    background: #000;
  }

  .page-wrapper {
    position: relative;
    width: 100%;
  }

  .wipe-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    overflow: hidden;
    pointer-events: none;
    background: #000;
    clip-path: polygon(0% -2%, 100% -2%, 100% -2%, 0% -2%);
  }

  :global(body.hero-snap-lock),
  :global(body.intro-lock) {
    overflow: hidden;
    overscroll-behavior: none;
    touch-action: none;
  }
</style>
