<script>
  import { onMount, tick } from "svelte";
  import { page } from "$app/stores";
  import { afterNavigate, onNavigate } from "$app/navigation";
  import "../app.css";

  import Header from "$lib/structure/Header.svelte";
  import Footer from "$lib/structure/Footer.svelte";
  import CustomCursor from "$lib/structure/CustomCursor.svelte";

  import {
    initScrollEngine,
    destroyScrollEngine,
    updateScrollEngineViewport,
    forceScrollEngineUpdate
  } from "$lib/scrollEngine.js";

  import { installDesktopWheelDamping } from "$lib/desktopWheelDamping.js";
  import {
    activatePendingSilentNavigation,
    clearSilentNavigation,
    isSilentNavigationActive
  } from "$lib/routeTransitionState.js";

  let isMobile = false;
  let isTouchDevice = false;
  let prefersReducedMotion = false;
  let onLoad, onResize, onRouteSettled;
  let syncRaf1, syncRaf2, syncTimeout;
  let transitionRaf;

  let pageWrapper;
  let transitionLayer;
  let transitionBlur;
  let transitionDarkness;
  let transitionWipe;

  let wheelDamping = null;

  const ENABLE_DESKTOP_WHEEL_DAMPING = true;
  const DESKTOP_WHEEL_FACTOR = 0.86;
  const DESKTOP_WHEEL_LERP = 0.14;
  const DESKTOP_WHEEL_SNAP = 0.18;
  const DESKTOP_WHEEL_MIN_WIDTH = 1100;

  function checkMobile() {
    isTouchDevice = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
    prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    isMobile = window.innerWidth <= 900 || isTouchDevice;
  }

  function isRealDesktop() {
    if (typeof window === "undefined") return false;

    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const hasHover = window.matchMedia("(hover: hover)").matches;
    const wideEnough = window.innerWidth >= DESKTOP_WHEEL_MIN_WIDTH;

    return hasFinePointer && hasHover && wideEnough;
  }

  function syncWheelDamping() {
    const shouldEnable =
      ENABLE_DESKTOP_WHEEL_DAMPING &&
      isRealDesktop();

    if (shouldEnable) {
      if (!wheelDamping) {
        wheelDamping = installDesktopWheelDamping({
          factor: DESKTOP_WHEEL_FACTOR,
          lerp: DESKTOP_WHEEL_LERP,
          snapThreshold: DESKTOP_WHEEL_SNAP
        });
      }
    } else {
      wheelDamping?.destroy?.();
      wheelDamping = null;
    }
  }

  function runSync() {
    updateScrollEngineViewport();
    forceScrollEngineUpdate();
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

  function easeInOutSine(t) {
    const x = clamp01(t);
    return -(Math.cos(Math.PI * x) - 1) / 2;
  }

  function easeInOutQuint(t) {
    const x = clamp01(t);
    return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
  }

  function tanhEase(t, strength = 2.6) {
    const x = clamp01(t);
    const a = Math.tanh(strength * (2 * x - 1));
    const b = Math.tanh(strength);
    return (a / b + 1) * 0.5;
  }

  function premiumWipeEase(t) {
    const x = clamp01(t);
    return easeInOutSine(x) * 0.4 + easeInOutQuint(x) * 0.6;
  }

  function getTransitionTheme(path = "/") {
    return { mask: "#000000" };
  }

  function getTransitionProfile() {
    if (prefersReducedMotion) {
      return {
        enterDuration: 0,
        exitDuration: 0,
        blurMax: 0,
        blurBase: 0,
        darknessMax: 0,
        pageFade: 0
      };
    }

    if (isMobile) {
      return {
        enterDuration: 560,
        exitDuration: 500,
        blurMax: 2,
        blurBase: 0.08,
        darknessMax: 0.24,
        pageFade: 0.04,
        pageBlurOut: 2.5,
        pageBlurIn: 2.4
      };
    }

    return {
      enterDuration: 1040,
      exitDuration: 920,
      blurMax: 9,
      blurBase: 0.04,
      darknessMax: 0.42,
      pageFade: 0.1,
      pageBlurOut: 7,
      pageBlurIn: 6
    };
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
    const baseY = startY + (endY - startY) * p;
    const arcLift = Math.sin(p * Math.PI) * vh * 0.042;
    const y = baseY - arcLift;

    const drift =
      Math.sin((p - 0.03) * Math.PI) * vw * 0.02 +
      Math.sin((p - 0.12) * Math.PI * 2) * vw * 0.0024;

    transitionWipe.style.transform = `translate3d(${drift}px, ${y}px, 0)`;
  }

  function resetWrapperStyles() {
    if (!pageWrapper) return;
    pageWrapper.style.opacity = "";
    pageWrapper.style.filter = "";
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

      if (activatePendingSilentNavigation()) {
        resetWrapperStyles();
        resetTransitionStyles();
        resolve();
        return;
      }

      const profile = getTransitionProfile();

      if (profile.enterDuration === 0) {
        resetWrapperStyles();
        resetTransitionStyles();
        resolve();
        return;
      }

      applyTransitionTheme(to?.url?.pathname || pathname);

      transitionLayer.style.opacity = "1";
      transitionBlur.style.opacity = "1";
      transitionDarkness.style.opacity = "0";
      transitionWipe.style.opacity = "1";

      pageWrapper.style.willChange = "opacity, filter";

      setWipeProgress(0);

      await animate(profile.enterDuration, (t) => {
        const wipe = premiumWipeEase(t);
        const blurLead = premiumWipeEase(clamp01(t + 0.08));
        const darknessFollow = premiumWipeEase(clamp01((wipe - 0.015) / 0.985));
        const pageFade = easeOutCubic(clamp01((t - 0.16) / 0.84));
        const pageBlur = premiumWipeEase(clamp01((t - 0.02) / 0.9));

        transitionBlur.style.backdropFilter = `blur(${blurLead * profile.blurMax}px)`;
        transitionBlur.style.webkitBackdropFilter = `blur(${blurLead * profile.blurMax}px)`;
        transitionBlur.style.opacity = `${profile.blurBase + blurLead * Math.max(0, profile.darknessMax * 0.55)}`;

        transitionDarkness.style.opacity = `${darknessFollow * profile.darknessMax}`;

        pageWrapper.style.opacity = `${1 - pageFade * profile.pageFade}`;
        pageWrapper.style.filter = `blur(${pageBlur * profile.pageBlurOut}px) brightness(${1 - pageBlur * 0.16})`;

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

    if (isSilentNavigationActive()) {
      clearSilentNavigation();
      resetWrapperStyles();
      resetTransitionStyles();
      return;
    }

    const profile = getTransitionProfile();

    if (profile.exitDuration === 0) {
      resetWrapperStyles();
      resetTransitionStyles();
      return;
    }

    applyTransitionTheme(pathname);

    transitionLayer.style.opacity = "1";
    transitionBlur.style.opacity = "1";
    transitionBlur.style.backdropFilter = `blur(${profile.blurMax}px)`;
    transitionBlur.style.webkitBackdropFilter = `blur(${profile.blurMax}px)`;
    transitionDarkness.style.opacity = `${profile.darknessMax}`;
    transitionWipe.style.opacity = "1";

    pageWrapper.style.willChange = "opacity, filter";
    pageWrapper.style.opacity = "0";
    pageWrapper.style.filter = `blur(${profile.pageBlurIn}px) brightness(0.84)`;

    setWipeProgress(1);

    requestAnimationFrame(() => {
      animate(profile.exitDuration, (t) => {
        const pageEase = premiumWipeEase(t);
        const overlayFade = easeInOutSine(clamp01((t - 0.08) / 0.92));
        const exitPush = premiumWipeEase(clamp01(t / 0.82));
        const pageBlurRelease = easeInOutSine(t);

        pageWrapper.style.opacity = `${pageEase}`;
        pageWrapper.style.filter = `blur(${(1 - pageBlurRelease) * profile.pageBlurIn}px) brightness(${0.84 + pageBlurRelease * 0.16})`;

        transitionBlur.style.opacity = `${(1 - overlayFade) * Math.max(profile.blurBase, profile.darknessMax * 0.66)}`;
        transitionBlur.style.backdropFilter = `blur(${(1 - overlayFade) * profile.blurMax}px)`;
        transitionBlur.style.webkitBackdropFilter = `blur(${(1 - overlayFade) * profile.blurMax}px)`;

        transitionDarkness.style.opacity = `${(1 - overlayFade) * profile.darknessMax}`;
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

      window.lenis = null;

      syncWheelDamping();

      onLoad = () => syncScrollState();
      onResize = () => {
        checkMobile();
        wheelDamping?.destroy?.();
        wheelDamping = null;
        syncWheelDamping();
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

      cancelAnimationFrame(syncRaf1);
      cancelAnimationFrame(syncRaf2);
      cancelAnimationFrame(transitionRaf);
      clearTimeout(syncTimeout);

      if (onLoad) window.removeEventListener("load", onLoad);
      if (onResize) window.removeEventListener("resize", onResize);
      if (onRouteSettled) window.removeEventListener("app:route-settled", onRouteSettled);

      wheelDamping?.destroy?.();
      wheelDamping = null;

      cleanupResizeObserver?.();
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

  <div class="site-prism-mark" aria-hidden="true">
    <img src="/images/logo_prisme.png" alt="" loading="eager" />
  </div>

  <Header />

  <div class="page-wrapper" bind:this={pageWrapper}>
    <slot />
    <div class="ios-bottom-mask" aria-hidden="true"></div>
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
    z-index: 300000;
    opacity: 0;
    overflow: hidden;
    will-change: opacity;
  }

  .site-prism-mark {
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 5000;
    pointer-events: none;
    padding: 0.22rem;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
  }

  .site-prism-mark img {
    display: block;
    width: clamp(1.8rem, 2.9vw, 2.7rem);
    height: auto;
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
    height: calc(var(--viewport-height) + 280px);
    background: var(--wipe-color);
    opacity: 0;
    will-change: transform, opacity;
    transform: translate3d(0, calc(-100% - 140px), 0);
  }

  .ios-bottom-mask {
    display: none;
  }

  @media (hover: none) and (pointer: coarse) {
    .ios-bottom-mask {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      height: calc(env(safe-area-inset-bottom, 0px) + 28px);
      background: #000;
      pointer-events: none;
      z-index: 999999;
      display: block;
    }
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

  @media (max-width: 900px) {
    .site-prism-mark {
      top: 0.8rem;
      left: 0.8rem;
      padding: 0.2rem;
    }

    .site-prism-mark img {
      width: clamp(1.7rem, 8vw, 2.2rem);
    }

    .route-transition-blur {
      backdrop-filter: blur(0px);
      -webkit-backdrop-filter: blur(0px);
    }

    .top-gradient {
      height: 88px;
    }

    .bottom-gradient {
      height: 132px;
    }
  }
</style>
