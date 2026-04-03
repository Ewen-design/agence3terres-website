<script>
  import { onMount, tick } from "svelte";
  import { page } from "$app/stores";
  import { afterNavigate, onNavigate } from "$app/navigation";
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
    forceScrollEngineUpdate
  } from "$lib/scrollEngine.js";

  import { registerLenis } from "$lib/navigate.js";
  import Lenis from "lenis";

  let lenis;
  let rafId;
  let isMobile = false;
  let onLoad, onResize, onRouteSettled;
  let syncRaf1, syncRaf2, syncTimeout;
  let transitionRaf;

  let pageWrapper;
  let transitionLayer;
  let transitionBlur;
  let transitionDarkness;
  let transitionWipe;

  function checkMobile() {
    isMobile = window.innerWidth <= 768;
  }

  function runSync() {
    updateScrollEngineViewport();
    lenis?.resize();
    forceScrollEngineUpdate();
    updateScrollEngine(window.scrollY || window.pageYOffset || 0);
  }

  async function syncScrollState() {
    await tick();
    cancelAnimationFrame(syncRaf1);
    cancelAnimationFrame(syncRaf2);
    clearTimeout(syncTimeout);

    syncRaf1 = requestAnimationFrame(() => {
      runSync();
      syncRaf2 = requestAnimationFrame(() => {
        runSync();
      });
    });

    syncTimeout = setTimeout(() => {
      runSync();
    }, 120);
  }

  $: pathname = $page.url.pathname.replace(/\/+$/, "") || "/";
  $: hideFooter = ["/projet1", "/projet2", "/contact"].includes(pathname);
  $: isTravailPage = $page.url.pathname === "/travail";

  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function tanhEase(t, strength = 2.6) {
    const x = clamp01(t);
    const a = Math.tanh(strength * (2 * x - 1));
    const b = Math.tanh(strength);
    return (a / b + 1) * 0.5;
  }

  function premiumWipeEase(t) {
    return tanhEase(t, 4);
  }

  function getTransitionTheme(path = "/") {
    const normalized = path.replace(/\/+$/, "") || "/";

    if (normalized === "/travail") {
      return { mask: "#f5f1e8" };
    }

    return { mask: "#000000" };
  }

  function applyTransitionTheme(path) {
    if (!transitionLayer) return;
    const theme = getTransitionTheme(path);
    transitionLayer.style.setProperty("--wipe-color", theme.mask);
  }

  function setWipeProgress(progress) {
    if (!transitionWipe) return;

    const p = clamp01(progress);
    const vh = window.innerHeight || 0;
    const vw = window.innerWidth || 0;

    const overscanTop = 140;
    const overscanBottom = 140;
    const startY = -vh - overscanTop;
    const endY = overscanBottom;
    const y = startY + (endY - startY) * p;

    const drift =
      Math.sin((p - 0.08) * Math.PI) * vw * 0.006 +
      Math.sin((p - 0.14) * Math.PI * 2) * vw * 0.0012;

    transitionWipe.style.transform = `translate3d(${drift}px, ${y}px, 0)`;
  }

  function resetWrapperStyles() {
    if (!pageWrapper) return;
    pageWrapper.style.opacity = "";
    pageWrapper.style.willChange = "";
  }

  function resetTransitionStyles() {
    if (!transitionLayer || !transitionBlur || !transitionDarkness || !transitionWipe) return;

    transitionLayer.style.opacity = "0";

    transitionBlur.style.opacity = "0";
    transitionBlur.style.backdropFilter = "blur(0px)";
    transitionBlur.style.webkitBackdropFilter = "blur(0px)";

    transitionDarkness.style.opacity = "0";

    transitionWipe.style.opacity = "0";
    transitionWipe.style.transform = "translate3d(0, calc(-100% - 140px), 0)";
  }

  function animate(duration, render) {
    cancelAnimationFrame(transitionRaf);

    return new Promise((resolve) => {
      const start = performance.now();

      function frame(now) {
        const t = clamp01((now - start) / duration);
        render(t);

        if (t < 1) {
          transitionRaf = requestAnimationFrame(frame);
        } else {
          resolve();
        }
      }

      transitionRaf = requestAnimationFrame(frame);
    });
  }

  onNavigate(({ to }) => {
    return new Promise(async (resolve) => {
      if (!pageWrapper || !transitionLayer || !transitionBlur || !transitionDarkness || !transitionWipe) {
        resolve();
        return;
      }

      applyTransitionTheme(to?.url?.pathname || pathname);

      transitionLayer.style.opacity = "1";
      transitionBlur.style.opacity = "1";
      transitionDarkness.style.opacity = "0";
      transitionWipe.style.opacity = "1";

      pageWrapper.style.willChange = "opacity";

      setWipeProgress(0);

      await animate(1040, (t) => {
        const wipe = premiumWipeEase(t);
        const blurLead = premiumWipeEase(clamp01(t + 0.08));
        const darknessFollow = premiumWipeEase(clamp01((wipe - 0.015) / 0.985));
        const pageFade = easeOutCubic(clamp01((t - 0.16) / 0.84));

        transitionBlur.style.backdropFilter = `blur(${blurLead * 9}px)`;
        transitionBlur.style.webkitBackdropFilter = `blur(${blurLead * 9}px)`;
        transitionBlur.style.opacity = `${0.04 + blurLead * 0.24}`;

        transitionDarkness.style.opacity = `${darknessFollow * 0.42}`;

        pageWrapper.style.opacity = `${1 - pageFade * 0.1}`;

        setWipeProgress(wipe);
      });

      resolve();
    });
  });

  afterNavigate(() => {
    syncScrollState();

    if (!pageWrapper || !transitionLayer || !transitionBlur || !transitionDarkness || !transitionWipe) {
      return;
    }

    applyTransitionTheme(pathname);

    transitionLayer.style.opacity = "1";
    transitionBlur.style.opacity = "1";
    transitionBlur.style.backdropFilter = "blur(9px)";
    transitionBlur.style.webkitBackdropFilter = "blur(9px)";
    transitionDarkness.style.opacity = "0.42";
    transitionWipe.style.opacity = "1";

    pageWrapper.style.willChange = "opacity";
    pageWrapper.style.opacity = "0";

    setWipeProgress(1);

    requestAnimationFrame(() => {
      animate(920, (t) => {
        const pageEase = easeOutCubic(t);
        const overlayFade = easeOutCubic(clamp01((t - 0.1) / 0.9));
        const exitPush = easeOutCubic(clamp01(t / 0.78));

        pageWrapper.style.opacity = `${pageEase}`;

        transitionBlur.style.opacity = `${(1 - overlayFade) * 0.28}`;
        transitionBlur.style.backdropFilter = `blur(${(1 - overlayFade) * 9}px)`;
        transitionBlur.style.webkitBackdropFilter = `blur(${(1 - overlayFade) * 9}px)`;

        transitionDarkness.style.opacity = `${(1 - overlayFade) * 0.42}`;
        transitionWipe.style.opacity = `${1 - overlayFade}`;

        setWipeProgress(1 + exitPush * 0.045);
      }).then(() => {
        resetWrapperStyles();
        resetTransitionStyles();
      });
    });
  });

  onMount(() => {
    let destroyed = false;
    let cleanupResizeObserver;

    const init = async () => {
      await import("gsap");
      if (destroyed) return;

      checkMobile();
      initScrollEngine();
      updateScrollEngineViewport();

      lenis = new Lenis({
        duration: 1.35,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        smoothWheel: window.innerWidth > 768,
        smoothTouch: false,
        wheelMultiplier: 1,
        touchMultiplier: 1,
        syncTouch: false
      });

      window.lenis = lenis;
      registerLenis(lenis);

      lenis.on("scroll", (e) => {
        updateScrollEngine(e.animatedScroll);
      });

      const raf = (time) => {
        if (!lenis) return;
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);

      onLoad = () => syncScrollState();
      onResize = () => {
        checkMobile();
        syncScrollState();
      };
      onRouteSettled = () => syncScrollState();

      window.addEventListener("load", onLoad);
      window.addEventListener("resize", onResize, { passive: true });
      window.addEventListener("app:route-settled", onRouteSettled);

      if (document.fonts?.ready) {
        document.fonts.ready.then(() => syncScrollState());
      }

      if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => syncScrollState());
        const root = document.querySelector(".page-wrapper");
        if (root) ro.observe(root);
        cleanupResizeObserver = () => ro.disconnect();
      }

      resetTransitionStyles();
      await syncScrollState();
    };

    init();

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(syncRaf1);
      cancelAnimationFrame(syncRaf2);
      cancelAnimationFrame(transitionRaf);
      clearTimeout(syncTimeout);

      if (onLoad) window.removeEventListener("load", onLoad);
      if (onResize) window.removeEventListener("resize", onResize);
      if (onRouteSettled) window.removeEventListener("app:route-settled", onRouteSettled);

      cleanupResizeObserver?.();
      lenis?.destroy();
      destroyScrollEngine();
      window.lenis = null;
    };
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

<main class:travail-soft-gradients={isTravailPage}>
  {#if !isMobile}
    <CustomCursor />
  {/if}

  <IconeFleche />
  <Header />

  <div class="page-wrapper" bind:this={pageWrapper}>
    <slot />
  </div>

  <div class="route-transition-layer" bind:this={transitionLayer} aria-hidden="true">
    <div class="route-transition-blur" bind:this={transitionBlur}></div>
    <div class="route-transition-darkness" bind:this={transitionDarkness}></div>
    <div class="route-transition-wipe" bind:this={transitionWipe}></div>
  </div>

  <div class="top-gradient"></div>
  <div class="bottom-gradient"></div>

  {#if !hideFooter}
    <Footer />
  {/if}
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

  .route-transition-layer {
    --wipe-color: #000;
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 60;
    opacity: 0;
    overflow: hidden;
    will-change: opacity;
  }

  .route-transition-blur {
    position: absolute;
    inset: 0;
    opacity: 0;
    backdrop-filter: blur(0px);
    -webkit-backdrop-filter: blur(0px);
    will-change: opacity, backdrop-filter;
  }

  .route-transition-darkness {
    position: absolute;
    inset: 0;
    opacity: 0;
    background: rgba(0, 0, 0, 0.72);
    will-change: opacity;
  }

  .route-transition-wipe {
    position: absolute;
    left: -10vw;
    top: -140px;
    width: 120vw;
    height: calc(100vh + 280px);
    background: var(--wipe-color);
    opacity: 0;
    will-change: transform, opacity;
    transform: translate3d(0, calc(-100% - 140px), 0);
  }

  .top-gradient {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 120px;
    pointer-events: none;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.12) 0%,
      rgba(0, 0, 0, 0.06) 35%,
      rgba(0, 0, 0, 0.02) 65%,
      rgba(0, 0, 0, 0) 100%
    );
    z-index: 100;
    transition: opacity 0.35s ease;
  }

  .bottom-gradient {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 200px;
    pointer-events: none;
    background:
      radial-gradient(
        120% 95% at 50% 100%,
        rgba(0, 0, 0, 0.16) 0%,
        rgba(0, 0, 0, 0.10) 30%,
        rgba(0, 0, 0, 0.05) 60%,
        rgba(0, 0, 0, 0.015) 80%,
        rgba(0, 0, 0, 0) 100%
      ),
      linear-gradient(
        to top,
        rgba(0, 0, 0, 0.12) 0%,
        rgba(0, 0, 0, 0.06) 35%,
        rgba(0, 0, 0, 0.02) 65%,
        rgba(0, 0, 0, 0) 100%
      );
    z-index: 100;
    transition: opacity 0.35s ease;
  }

  main.travail-soft-gradients .top-gradient {
    opacity: 0.65;
  }

  main.travail-soft-gradients .bottom-gradient {
    opacity: 0.3;
  }
</style>