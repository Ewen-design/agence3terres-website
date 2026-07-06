<script>
  import { onMount, tick } from "svelte";
  import { page } from "$app/stores";
  import { afterNavigate, onNavigate } from "$app/navigation";
  import "../app.css";

  import Header from "$lib/components/shared/layout/Header.svelte";
  import Footer from "$lib/components/shared/layout/Footer.svelte";
  import CustomCursor from "$lib/components/shared/layout/CustomCursor.svelte";
  import SiteIntroLoader from "$lib/components/shared/layout/SiteIntroLoader.svelte";

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
  import {
    clearGlobalScrollLocks,
    clearUnexpectedGlobalScrollLocks
  } from "$lib/scrollLocks.js";

  let isMobile = false;
  let isTouchDevice = false;
  let prefersReducedMotion = false;
  let onLoad, onResize, onRouteSettled, onPageShow, onVisibilityChange;
  let syncRaf1, syncRaf2, syncTimeout;
  let cancelTransitionAnimation;
  let scrollLockObserver;
  let removeTouchFlipListener;
  let projectTheme = null;
  let removeProjectThemeListener;
  let pipDockVisible = false;

  let transitionLayer;
  let pageWrapper;

  let wheelDamping = null;

  const ENABLE_DESKTOP_WHEEL_DAMPING = false;
  const DESKTOP_WHEEL_FACTOR = 0.86;
  const DESKTOP_WHEEL_LERP = 0.14;
  const DESKTOP_WHEEL_SNAP = 0.18;
  const DESKTOP_WHEEL_MIN_WIDTH = 1100;
  const SITE_URL = "https://agence3terres.com";
  const SHARE_IMAGE_PATH = "/images/ordinateur.webp";
  const PAGE_META = {
    "/": {
      title: "Agence 3 Terres | Sites web, identité et direction artistique",
      description:
        "Agence 3 Terres crée des sites web, identités visuelles et expériences digitales exigeantes pour des marques qui veulent gagner en présence.",
      imageAlt: "Création digitale par Agence 3 Terres"
    },
    "/services": {
      title: "Services | Agence 3 Terres",
      description:
        "Sites web, identité visuelle, direction artistique et expérience digitale: Agence 3 Terres structure des présences de marque nettes et premium.",
      imageAlt: "Services digitaux et direction artistique Agence 3 Terres"
    },
    "/travail": {
      title: "Travail et projets | Agence 3 Terres",
      description:
        "Découvrez les projets d'Agence 3 Terres: sites web, interfaces, identités et directions artistiques conçus avec précision.",
      imageAlt: "Projets et réalisations Agence 3 Terres"
    },
    "/apropos": {
      title: "À propos | Agence 3 Terres",
      description:
        "Agence 3 Terres accompagne les marques avec une approche stratégique, sensible et précise du design digital.",
      imageAlt: "Approche et vision Agence 3 Terres"
    },
    "/contact": {
      title: "Contact | Agence 3 Terres",
      description:
        "Échangeons sur votre projet digital, votre identité visuelle ou votre prochaine expérience de marque avec Agence 3 Terres.",
      imageAlt: "Contact Agence 3 Terres"
    },
    "/mentions-legales": {
      title: "Mentions légales | Agence 3 Terres",
      description: "Mentions légales et informations juridiques du site Agence 3 Terres.",
      imageAlt: "Agence 3 Terres"
    },
    "/projet1": {
      title: "Serein Design | Projet Agence 3 Terres",
      description:
        "Identité produit, direction artistique et interface: découvrez le projet Serein Design par Agence 3 Terres.",
      imageAlt: "Projet Serein Design par Agence 3 Terres"
    },
    "/projet3": {
      title: "Moovy | Projet Agence 3 Terres",
      description:
        "Plateforme web, UX et UI: découvrez le projet Moovy conçu par Agence 3 Terres.",
      imageAlt: "Projet Moovy par Agence 3 Terres"
    },
    "/projet4": {
      title: "Ludosphères | Projet Agence 3 Terres",
      description:
        "Site d'artiste, direction artistique et approche éditoriale: découvrez le projet Ludosphères par Agence 3 Terres.",
      imageAlt: "Projet Ludosphères par Agence 3 Terres"
    },
    "/projet5": {
      title: "JustX | Projet Agence 3 Terres",
      description:
        "Marque de sport, programmes personnalisés et gamme textile: découvrez le projet JustX par Agence 3 Terres.",
      imageAlt: "Projet JustX par Agence 3 Terres"
    },
    "/projet6": {
      title: "Mission X | Projet Agence 3 Terres",
      description:
        "Jeu de stratégie, game design et direction artistique: découvrez le projet Mission X par Agence 3 Terres.",
      imageAlt: "Projet Mission X par Agence 3 Terres"
    },
    "/projet7": {
      title: "JustX Fitness | Projet Agence 3 Terres",
      description:
        "Application fitness, product design et UX/UI: découvrez JustX Fitness par Agence 3 Terres.",
      imageAlt: "Application JustX Fitness par Agence 3 Terres"
    }
  };

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
    const ua = window.navigator.userAgent || "";
    const vendor = window.navigator.vendor || "";
    const isSafariDesktop =
      /Safari/i.test(ua) &&
      !/Chrome|CriOS|Edg|OPR|Firefox|FxiOS/i.test(ua) &&
      /Apple/i.test(vendor);

    return hasFinePointer && hasHover && wideEnough && !isSafariDesktop;
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

  function installTouchFlipAnimation() {
    if (typeof window === "undefined") return () => {};

    const coarsePointerQuery = window.matchMedia("(hover: none) and (pointer: coarse)");
    const timers = new WeakMap();
    const interactiveSelector = [
      ".nav-btn",
      ".services-btn",
      ".premium-contact-cta__button",
      ".hero-cta"
    ].join(", ");

    const triggerFlip = (event) => {
      if (!coarsePointerQuery.matches) return;

      const target = event.target instanceof Element ? event.target.closest(interactiveSelector) : null;
      if (!target) return;

      if (target.classList.contains("touch-flip-active")) return;

      target.classList.add("touch-flip-active");
      const duration = target.classList.contains("header-nav-btn") ? 760 : 520;

      const timer = window.setTimeout(() => {
        target.classList.remove("touch-flip-active");
        timers.delete(target);
      }, duration);

      timers.set(target, timer);
    };

    window.addEventListener("pointerdown", triggerFlip, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", triggerFlip);
    };
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
  $: hideFooter = ["/projet1", "/projet3", "/projet4", "/projet5", "/projet6", "/projet7", "/contact"].includes(pathname)
    || ($page.status ?? 200) >= 400;   // no footer on the error / 404 page
  $: isTravailPage = pathname === "/travail";
  $: isProjectLightTheme = projectTheme === "light";
  $: currentMeta = PAGE_META[pathname] ?? PAGE_META["/"];
  $: canonicalUrl = `${SITE_URL}${pathname === "/" ? "" : `${pathname}/`}`;
  $: shareImageUrl = `${SITE_URL}${SHARE_IMAGE_PATH}`;
  $: seoTitle = currentMeta.title;
  $: seoDescription = currentMeta.description ?? PAGE_META["/"].description;
  $: seoImageAlt = currentMeta.imageAlt ?? PAGE_META["/"].imageAlt;

  function getTransitionProfile() {
    if (prefersReducedMotion) {
      return {
        enterDuration: 0,
        exitDuration: 0
      };
    }

    return {
      enterDuration: isMobile ? 260 : 300,
      exitDuration: isMobile ? 460 : 520
    };
  }

  function resetTransitionStyles() {
    cancelTransitionAnimation?.();
    if (!pageWrapper) return;
    pageWrapper.style.transition = "none";
    pageWrapper.style.opacity = "1";
    // IMPORTANT: reset to `none` (not blur(0)) so no filter containing-block
    // lingers — that would break sticky/fixed inside the page.
    pageWrapper.style.filter = "none";
    pageWrapper.style.willChange = "";
  }

  function settleGlobalScrollLocks() {
    clearGlobalScrollLocks();
    wheelDamping?.stop?.();
  }

  function enforceGlobalScrollLockIntegrity() {
    if (clearUnexpectedGlobalScrollLocks()) {
      wheelDamping?.stop?.();
      forceScrollEngineUpdate();
    }
  }

  // Focus-pull page transition: the content itself blurs + fades (over the
  // black background), then the next page blurs + fades back in. A soft,
  // progressive blur fade — and the only thing animated is the page content.
  // amount: 0 = sharp & visible, 1 = blurred & hidden.
  function fadeTransitionLayer(amount, duration) {
    cancelTransitionAnimation?.();
    if (!pageWrapper) return Promise.resolve(false);

    const opacity = (1 - amount).toFixed(3);
    // Blurring the full viewport is costly on phones — keep it very light there
    // (the opacity fade carries the transition); full focus-pull on desktop.
    const blur = amount * (isMobile ? 3 : 12);
    const setTarget = () => {
      pageWrapper.style.opacity = opacity;
      // Always a blur() value (incl. blur(0px)) so it can interpolate; the final
      // `filter: none` reset is applied by resetTransitionStyles after settle.
      pageWrapper.style.filter = `blur(${blur.toFixed(2)}px)`;
    };

    if (duration <= 0) {
      pageWrapper.style.transition = "none";
      setTarget();
      return Promise.resolve(true);
    }

    const ease = "cubic-bezier(0.33, 0, 0.2, 1)";
    pageWrapper.style.transition = `opacity ${duration}ms ${ease}, filter ${duration}ms ${ease}`;
    void pageWrapper.offsetWidth;   // commit the current state so it animates
    setTarget();

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        if (cancelTransitionAnimation === cancel) cancelTransitionAnimation = null;
        resolve(true);
      }, duration + 30);
      const cancel = () => { clearTimeout(timer); resolve(false); };
      cancelTransitionAnimation = cancel;
    });
  }

  onNavigate(async () => {
    if (!pageWrapper) return;

    if (activatePendingSilentNavigation()) {
      resetTransitionStyles();
      return;
    }

    const profile = getTransitionProfile();

    if (profile.enterDuration === 0) {
      resetTransitionStyles();
      return;
    }

    pageWrapper.style.willChange = "opacity, filter";

    await fadeTransitionLayer(1, profile.enterDuration);
  });

  afterNavigate(() => {
    settleGlobalScrollLocks();
    syncScrollState();

    if (!pageWrapper) {
      return;
    }

    if (isSilentNavigationActive()) {
      clearSilentNavigation();
      resetTransitionStyles();
      return;
    }

    const profile = getTransitionProfile();

    if (profile.exitDuration === 0) {
      resetTransitionStyles();
      return;
    }

    pageWrapper.style.willChange = "opacity, filter";
    fadeTransitionLayer(1, 0);   // start hidden + blurred (covers the swap)

    requestAnimationFrame(() => {
      settleGlobalScrollLocks();
      fadeTransitionLayer(0, profile.exitDuration).then((completed) => {
        if (!completed) return;
        settleGlobalScrollLocks();
        resetTransitionStyles();
      });
    });

    setTimeout(() => settleGlobalScrollLocks(), 80);
    setTimeout(() => settleGlobalScrollLocks(), 220);
  });

  onMount(() => {
    let destroyed = false;
    let cleanupResizeObserver;

    const handleProjectThemeChange = (event) => {
      projectTheme = event.detail?.theme ?? null;
    };
    const handlePipDockVisible = (event) => {
      pipDockVisible = Boolean(event.detail?.visible);
    };

    window.addEventListener("project-theme-change", handleProjectThemeChange);
    window.addEventListener("pip-dock-visible", handlePipDockVisible);
    removeProjectThemeListener = () => {
      window.removeEventListener("project-theme-change", handleProjectThemeChange);
      window.removeEventListener("pip-dock-visible", handlePipDockVisible);
    };

    const init = async () => {
      await import("gsap");
      if (destroyed) return;

      checkMobile();
      initScrollEngine();
      updateScrollEngineViewport();
      removeTouchFlipListener = installTouchFlipAnimation();

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
      onRouteSettled = () => {
        settleGlobalScrollLocks();
        enforceGlobalScrollLockIntegrity();
        syncScrollState();
      };
      onPageShow = (event) => {
        // iOS/Safari can restore a backgrounded page from the bfcache with its
        // <link> stylesheets dropped → the "unstyled" state the user sees on
        // resume (white background, images at full natural size). A page
        // restored in that state never repaints correctly on its own, so force
        // one clean reload. `persisted` is true ONLY for bfcache restores, so
        // normal loads and in-app navigations are never reloaded. A reload is a
        // fresh load (persisted === false), so this can't loop.
        if (event?.persisted) {
          window.location.reload();
          return;
        }
        settleGlobalScrollLocks();
        enforceGlobalScrollLockIntegrity();
        syncScrollState();
      };
      onVisibilityChange = () => {
        if (document.visibilityState !== "visible") return;
        settleGlobalScrollLocks();
        enforceGlobalScrollLockIntegrity();
        syncScrollState();
      };

      window.addEventListener("load", onLoad);
      window.addEventListener("resize", onResize, { passive: true });
      window.addEventListener("app:route-settled", onRouteSettled);
      window.addEventListener("pageshow", onPageShow);
      document.addEventListener("visibilitychange", onVisibilityChange);

      scrollLockObserver = new MutationObserver(() => {
        enforceGlobalScrollLockIntegrity();
      });

      scrollLockObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "style"]
      });

      scrollLockObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ["class", "style"],
        childList: true,
        subtree: false
      });

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
      settleGlobalScrollLocks();
      enforceGlobalScrollLockIntegrity();
      await syncScrollState();
    };

    init();

    return () => {
      destroyed = true;

      cancelAnimationFrame(syncRaf1);
      cancelAnimationFrame(syncRaf2);
      cancelTransitionAnimation?.();
      clearTimeout(syncTimeout);

      if (onLoad) window.removeEventListener("load", onLoad);
      if (onResize) window.removeEventListener("resize", onResize);
      if (onRouteSettled) window.removeEventListener("app:route-settled", onRouteSettled);
      if (onPageShow) window.removeEventListener("pageshow", onPageShow);
      if (onVisibilityChange) document.removeEventListener("visibilitychange", onVisibilityChange);
      removeTouchFlipListener?.();
      removeProjectThemeListener?.();
      projectTheme = null;

      wheelDamping?.destroy?.();
      wheelDamping = null;
      scrollLockObserver?.disconnect?.();
      scrollLockObserver = null;

      cleanupResizeObserver?.();
      destroyScrollEngine();
      window.lenis = null;
    };
  });
</script>

<svelte:head>
  <title>{seoTitle}</title>
  <meta name="description" content={seoDescription} />
  <meta name="robots" content="index, follow" />

  <link rel="canonical" href={canonicalUrl} />
  <link rel="sitemap" type="application/xml" href="/sitemap.xml" />

  <meta property="og:title" content={seoTitle} />
  <meta property="og:description" content={seoDescription} />
  <meta property="og:image" content={shareImageUrl} />
  <meta property="og:image:secure_url" content={shareImageUrl} />
  <meta property="og:image:type" content="image/webp" />
  <meta property="og:image:width" content="1800" />
  <meta property="og:image:height" content="1000" />
  <meta property="og:image:alt" content={seoImageAlt} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Agence 3 Terres" />
  <meta property="og:locale" content="fr_FR" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={seoTitle} />
  <meta name="twitter:description" content={seoDescription} />
  <meta name="twitter:image" content={shareImageUrl} />
  <meta name="twitter:image:alt" content={seoImageAlt} />
</svelte:head>

<main
  class:travail-soft-gradients={isTravailPage}
  class:contact-page={pathname === "/contact"}
  class:project-light-theme={isProjectLightTheme}
  class:legal-route={pathname === "/mentions-legales"}
  class:pip-dock-active={pipDockVisible}
>
  {#if !isMobile}
    <CustomCursor />
  {/if}

  <a
    class="site-prism-mark {pathname === '/' ? 'is-home' : ''}"
    href="/"
    aria-label="Accueil — Agence 3 Terres"
    aria-disabled={pathname === "/"}
    on:click={(e) => { if (pathname === "/") e.preventDefault(); }}
  >
    <img src="/images/logo_prisme.png" alt="" loading="eager" />
  </a>

  <div class="ios-top-mask" aria-hidden="true"></div>
  <div class="ios-bottom-mask" aria-hidden="true"></div>

  <Header />
  <SiteIntroLoader />

  <div class="page-wrapper" bind:this={pageWrapper}>
    <slot />
  </div>

  <div class="route-transition-layer" bind:this={transitionLayer} aria-hidden="true"></div>

  <div class="top-gradient" aria-hidden="true"></div>
  <div class="bottom-gradient" aria-hidden="true"></div>

  {#if !hideFooter}
    <Footer />
  {/if}

</main>

<style>
  main {
    position: relative;
    isolation: isolate;
    width: 100%;
    overflow-x: clip;
    background: #000;
  }

  .ios-top-mask,
  .ios-bottom-mask {
    display: none;
  }

  .page-wrapper {
    position: relative;
    width: 100%;
    background: #000;
    z-index: 2;
    margin-bottom: var(--footer-reserve, 0px);
  }

  /* Frosted-blur page transition. Resting state = invisible (blur 0, clear);
     the JS animates the blur radius + tint for a clean, ghost-free blur. */
  .route-transition-layer {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 300000;
    opacity: 1;
    visibility: hidden;
    overflow: hidden;
    background: rgba(5, 11, 20, 0);
    -webkit-backdrop-filter: blur(0px);
    backdrop-filter: blur(0px);
  }

  .site-prism-mark {
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 5000;
    pointer-events: auto;
    cursor: pointer;
    display: block;
    padding: 0.22rem;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    transition: transform .3s cubic-bezier(.22,.61,.36,1), background .3s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .site-prism-mark:hover { transform: scale(1.06); background: rgba(255,255,255,.1); }
  .site-prism-mark:focus-visible { outline: 2px solid rgba(245,241,232,.9); outline-offset: 3px; }

  /* Sur la home, le logo ne navigue pas (on y est déjà). */
  .site-prism-mark.is-home { cursor: default; }
  .site-prism-mark.is-home:hover { transform: none; background: rgba(255,255,255,.05); }

  .site-prism-mark img {
    display: block;
    width: clamp(1.8rem, 2.9vw, 2.7rem);
    height: auto;
    transition: filter 220ms ease;
  }

  /* Pages à fond clair (Moovy en thème clair, mentions légales) : le texte du
     header passe au noir → le logo suit. */
  main.project-light-theme .site-prism-mark img,
  main.legal-route .site-prism-mark img {
    filter: brightness(0);
  }

  @media (hover: none) and (pointer: coarse) {
    /* Solid black cap over the top safe-area (status bar / dynamic island).
       On the widened-notch iPhones the browser exposes this strip over the
       page when the toolbar collapses, and full-bleed animations don't paint
       into it → a visible gap. This bar always fills it. The `+8px` bleed (like
       the bottom mask) kills any subpixel seam during scroll/animation.
       z-index sits ABOVE page content but BELOW the header (600000) so the
       mobile menu control stays visible and tappable over the bar. */
    .ios-top-mask {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      display: block;
      height: calc(env(safe-area-inset-top, 0px) + 8px);
      background: #000;
      pointer-events: none;
      z-index: 500000;
    }

    .ios-bottom-mask {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      display: block;
      height: calc(env(safe-area-inset-bottom, 0px) + 6px);
      background: #000;
      pointer-events: none;
      z-index: 999999;
    }
  }

  .top-gradient {
    position: fixed;
    top: calc(-1 * (var(--mobile-viewport-overscan-top, 0px) + var(--mobile-gradient-bleed-top, 0px)));
    left: 0;
    width: 100%;
    height: calc(176px + var(--mobile-viewport-overscan-top, 0px) + var(--mobile-gradient-bleed-top, 0px));
    pointer-events: none;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.14) 0%,
      rgba(0, 0, 0, 0.095) 18%,
      rgba(0, 0, 0, 0.055) 38%,
      rgba(0, 0, 0, 0.022) 58%,
      rgba(0, 0, 0, 0.006) 80%,
      rgba(0, 0, 0, 0) 100%
    );
    z-index: 99999;
    opacity: 1;
    transition: opacity var(--project-theme-transition, 0.35s ease);
  }

  .bottom-gradient {
    position: fixed;
    top: calc(100lvh - 220px);
    bottom: auto;
    left: 0;
    width: 100%;
    height: calc(220px + var(--mobile-viewport-overscan-bottom, 0px) + var(--mobile-gradient-bleed-bottom, 0px));
    pointer-events: none;
    background:
      radial-gradient(
        124% 100% at 50% 100%,
        rgba(0, 0, 0, 0.42) 0%,
        rgba(0, 0, 0, 0.26) 20%,
        rgba(0, 0, 0, 0.11) 42%,
        rgba(0, 0, 0, 0.03) 66%,
        rgba(0, 0, 0, 0.008) 84%,
        rgba(0, 0, 0, 0) 100%
      ),
      linear-gradient(
        to top,
        rgba(0, 0, 0, 0.34) 0%,
        rgba(0, 0, 0, 0.2) 18%,
        rgba(0, 0, 0, 0.09) 40%,
        rgba(0, 0, 0, 0.025) 64%,
        rgba(0, 0, 0, 0.006) 82%,
        rgba(0, 0, 0, 0) 100%
      );
    z-index: 99999;
    opacity: 1;
    transition: opacity var(--project-theme-transition, 0.35s ease);
  }

  main.project-light-theme .top-gradient,
  main.project-light-theme .bottom-gradient {
    opacity: 0;
  }

  /* Mentions légales is a light/white page → the global darkening gradients
     would show as dark edges, so remove them on this route. */
  main.legal-route .top-gradient,
  main.legal-route .bottom-gradient {
    opacity: 0;
  }

  main.travail-soft-gradients .top-gradient {
    opacity: 0.65;
  }

  main.travail-soft-gradients .bottom-gradient {
    opacity: 0.3;
  }

  /* The "projet en création" glass dock sits flush at the bottom of the
     viewport; while it is on screen, fade the global bottom vignette so the
     dock reads in front of it instead of scrolling behind it. */
  main.pip-dock-active .bottom-gradient {
    opacity: 0;
  }

  @media (max-width: 900px) {
    .site-prism-mark {
      display: none;
    }

    .top-gradient {
      opacity: 0;
    }

    .bottom-gradient {
      opacity: 0;
    }
  }
</style>
