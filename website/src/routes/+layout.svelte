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
      syncRaf2 = requestAnimationFrame(() => { runSync(); });
    });
    syncTimeout = setTimeout(() => { runSync(); }, 120);
  }

$: pathname = $page.url.pathname.replace(/\/+$/, "") || "/";
$: hideFooter = ["/projet1", "/projet2", "/contact"].includes(pathname);
  $: isTravailPage = $page.url.pathname === "/travail";

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  onNavigate(() => {
    return new Promise((resolve) => {
      const wrapper = document.querySelector('.page-wrapper');
      if (!wrapper) { resolve(); return; }

      const duration = 420;
      const start = performance.now();

      wrapper.style.transformOrigin = 'center top';
      wrapper.style.willChange = 'transform, opacity, filter';

      function frame(now) {
        const t = Math.min((now - start) / duration, 1);
        const ease = easeInOutCubic(t);

        wrapper.style.transform = `scale(${1 - ease * 0.04})`;
        wrapper.style.opacity = `${1 - ease}`;
        wrapper.style.filter = `blur(${ease * 4}px)`;

        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          resolve();
        }
      }

      requestAnimationFrame(frame);
    });
  });

  afterNavigate(() => {
    syncScrollState();

    const wrapper = document.querySelector('.page-wrapper');
    if (!wrapper) return;

    wrapper.style.transformOrigin = 'center top';
    wrapper.style.willChange = 'transform, opacity, filter';
    wrapper.style.transform = 'scale(0.97)';
    wrapper.style.opacity = '0';
    wrapper.style.filter = 'blur(6px)';

    requestAnimationFrame(() => {
      const duration = 650;
      const start = performance.now();

      function frame(now) {
        const t = Math.min((now - start) / duration, 1);
        const ease = easeOutCubic(t);

        wrapper.style.transform = `scale(${0.97 + ease * 0.03})`;
        wrapper.style.opacity = `${ease}`;
        wrapper.style.filter = `blur(${(1 - ease) * 6}px)`;

        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          wrapper.style.transform = '';
          wrapper.style.opacity = '';
          wrapper.style.filter = '';
          wrapper.style.willChange = '';
        }
      }

      requestAnimationFrame(frame);
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

      lenis.on("scroll", (e) => { updateScrollEngine(e.animatedScroll); });

      const raf = (time) => {
        if (!lenis) return;
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);

      onLoad = () => syncScrollState();
      onResize = () => { checkMobile(); syncScrollState(); };
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

      await syncScrollState();
    };

    init();

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(syncRaf1);
      cancelAnimationFrame(syncRaf2);
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
  <div class="top-gradient"></div>
  <div class="bottom-gradient"></div>

  <div class="page-wrapper">
    <slot />
  </div>

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
    z-index: 10;
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
    z-index: 10;
    transition: opacity 0.35s ease;
  }

  main.travail-soft-gradients .top-gradient {
    opacity: 0.65;
  }

  main.travail-soft-gradients .bottom-gradient {
    opacity: 0.3;
  }
</style>