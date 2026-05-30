<script>
  import { onMount, onDestroy, tick } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import FullscreenMenu from "./FullscreenMenu.svelte";
  import { navigate } from "$lib/navigate.js";
  import {
    registerRead,
    unregisterRead,
    forceScrollEngineUpdate
  } from "$lib/scrollEngine.js";

  let lastScrollY = 0;
  let scrollingDown = false;
  let atTopOfPage = true;
  let menuOpen = false;
  let textColor = "white";
  let headerEl;
  let menuButtonEl;
  let menuOrigin = { x: 0, y: 0, width: 44, height: 40 };

  let linksOpening = false;
  let linksTextReady = true;
  let linksTextFlipIn = false;
  let openAnimTimer;
  let flipResetTimer;

  let headerIntroStarted = false;
  let headerIntroVisible = false;
  let headerIntroDone = false;
  let headerReady = false;
  let blurWarm = false;
  let headerIntroFallback;
  let headerIntroCleanup;
  let headerIntroDelay;
  let blurWarmCleanup;

  let btnEls = [];
  let tourTimer;
  let tourRaf;
  let isTouringNow = false;
  let downwardScrollProgress = 0;
  const hoverFlipTimers = new WeakMap();

  let themedSections = [];
  let refreshSectionsRaf = 0;
  let mixSliderHeaderTone = null;
  let projectHeaderTone = null;
  const SCROLL_THRESHOLD = 10;
  const COMPACT_TRIGGER_Y = 80;
  const COMPACT_DOWNWARD_DISTANCE = 360;
  const LIGHT_TEXT_COLOR = "#000";
  const SECTION_SELECTOR =
    "section.hero-wrapper, section.creative-section, section.services, section.dna-section, section.lifestyles-section";
  $: pathname = $page.url.pathname.replace(/\/+$/, "") || "/";

  function refreshThemeSections() {
    if (!browser) return;
    themedSections = Array.from(document.querySelectorAll(SECTION_SELECTOR));
  }

  function scheduleThemeSectionsRefresh() {
    cancelAnimationFrame(refreshSectionsRaf);
    refreshSectionsRaf = requestAnimationFrame(async () => {
      await tick();
      refreshThemeSections();
      forceScrollEngineUpdate();
    });
  }

  function processScrollState(state) {
    const currentY = state?.y ?? state?.currentY ?? window.scrollY ?? 0;
    const delta = currentY - lastScrollY;
    atTopOfPage = currentY <= 24;

    if (Math.abs(delta) >= SCROLL_THRESHOLD) {
      if (delta > 0) {
        downwardScrollProgress += delta;

        if (currentY > COMPACT_TRIGGER_Y && downwardScrollProgress >= COMPACT_DOWNWARD_DISTANCE) {
          scrollingDown = true;
        }
      } else if (delta < 0) {
        downwardScrollProgress = 0;
        scrollingDown = false;
      }

      lastScrollY = currentY;
    }

    updateTextColor();
  }

  function updateTextColor() {
    if (!headerEl) return;
    const rect = headerEl.getBoundingClientRect();
    const headerMid = rect.top + rect.height * 0.5;

    if (browser && window.innerWidth > 768) {
      const footerEl = document.querySelector(".footer");
      if (footerEl) {
        const footerReveal = parseFloat(
          window.getComputedStyle(footerEl).getPropertyValue("--footer-reveal") || "0"
        );
        const isOverFooter = footerReveal >= 0.97;

        if (isOverFooter) {
          if (textColor !== "white") textColor = "white";
          return;
        }
      }
    }

    if (pathname === "/mentions-legales") {
      if (textColor !== LIGHT_TEXT_COLOR) textColor = LIGHT_TEXT_COLOR;
      return;
    }
    if (projectHeaderTone === "dark") {
      if (textColor !== LIGHT_TEXT_COLOR) textColor = LIGHT_TEXT_COLOR;
      return;
    }
    if (projectHeaderTone === "light") {
      if (textColor !== "white") textColor = "white";
      return;
    }
    if (mixSliderHeaderTone === "dark") {
      if (textColor !== LIGHT_TEXT_COLOR) textColor = LIGHT_TEXT_COLOR;
      return;
    }
    if (mixSliderHeaderTone === "light") {
      if (textColor !== "white") textColor = "white";
      return;
    }
    if (!themedSections.length) {
      if (textColor !== "white") textColor = "white";
      return;
    }

    let overLight = false;

    for (let i = 0; i < themedSections.length; i++) {
      const sectionRect = themedSections[i].getBoundingClientRect();
      if (headerMid >= sectionRect.top && headerMid <= sectionRect.bottom) {
        overLight = true;
        break;
      }
    }

    const nextColor = overLight ? LIGHT_TEXT_COLOR : "white";
    if (nextColor !== textColor) textColor = nextColor;
  }

  function handleButtonMove(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  function triggerHoverFlip(event) {
    const btn = event.currentTarget;
    if (!btn || btn.classList.contains("more")) return;
    if (browser && window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;
    if (btn.classList.contains("is-hover-flipping")) return;

    btn.classList.add("is-hover-flipping");

    const timer = setTimeout(() => {
      btn.classList.remove("is-hover-flipping");
      hoverFlipTimers.delete(btn);
    }, 460);

    hoverFlipTimers.set(btn, timer);
  }

  function startTour() {
    if (isTouringNow) return;

    const linkBtns = btnEls.filter(Boolean);
    if (!linkBtns.length) return;

    const btn = linkBtns[Math.floor(Math.random() * linkBtns.length)];
    const rect = btn.getBoundingClientRect();
    const h = rect.height;

    btn.style.setProperty("--my", `${h / 2}px`);

    const duration = 900;
    const start = performance.now();
    const fromX = -20;
    const toX = rect.width + 20;

    isTouringNow = true;
    btn.classList.add("auto-glow");

    const isBurger = btn.classList.contains("more");
    if (isBurger) {
      const spans = btn.querySelectorAll("span");
      if (spans[0]) spans[0].style.transform = "translateX(6px) scale(1.6)";
      if (spans[1]) {
        spans[1].style.opacity = "0";
        spans[1].style.transform = "scale(0)";
      }
      if (spans[2]) spans[2].style.transform = "translateX(-6px) scale(1.6)";
    }

    function animFrame(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const mx = fromX + (toX - fromX) * ease;
      btn.style.setProperty("--mx", `${mx}px`);

      if (t < 1) {
        tourRaf = requestAnimationFrame(animFrame);
      } else {
        btn.classList.remove("auto-glow");
        btn.classList.add("auto-glow-out");

        if (isBurger) {
          const spans = btn.querySelectorAll("span");
          spans.forEach((s) => {
            s.style.transform = "";
            s.style.opacity = "";
          });
        }

        setTimeout(() => {
          btn.classList.remove("auto-glow-out");
          isTouringNow = false;
          scheduleTour();
        }, 350);
      }
    }

    tourRaf = requestAnimationFrame(animFrame);
  }

  function scheduleTour() {
    clearTimeout(tourTimer);
    const delay = 3000 + Math.random() * 3000;
    tourTimer = setTimeout(startTour, delay);
  }

  function registerBurger(node) {
    btnEls[5] = node;
    return {
      destroy() {
        btnEls[5] = null;
      }
    };
  }

  function openMenu() {
    if (menuButtonEl) {
      const rect = menuButtonEl.getBoundingClientRect();
      menuOrigin = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height
      };
    }

    menuOpen = true;
  }

  function handleLogoClick() {
    menuOpen = false;
    navigate("home");
  }

  function runLinksOpenSequence() {
    clearTimeout(openAnimTimer);
    clearTimeout(flipResetTimer);

    linksOpening = true;
    linksTextReady = false;
    linksTextFlipIn = false;

    openAnimTimer = setTimeout(() => {
      linksTextReady = true;
      linksTextFlipIn = true;

      flipResetTimer = setTimeout(() => {
        linksOpening = false;
        linksTextFlipIn = false;
      }, 420);
    }, 250);
  }

  function resetLinksSequence() {
    clearTimeout(openAnimTimer);
    clearTimeout(flipResetTimer);
    linksOpening = false;
    linksTextReady = false;
    linksTextFlipIn = false;
  }

  function startHeaderIntro() {
    if (headerIntroStarted) return;
    headerIntroStarted = true;

    const revealDelay =
      browser && window.matchMedia("(hover: none) and (pointer: coarse)").matches ? 120 : 0;

    clearTimeout(headerIntroDelay);
    headerIntroDelay = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          headerIntroVisible = true;

          clearTimeout(headerIntroCleanup);
          headerIntroCleanup = setTimeout(() => {
            headerIntroDone = true;
          }, 1100);
        });
      });
    }, revealDelay);
  }

  $: compact = scrollingDown && !menuOpen;
  $: mobileTopLinksVisible = atTopOfPage && !menuOpen;

  $: themeClass =
    pathname === "/services" ? "theme-services" :
    ["/travail", "/projet1", "/projet2", "/projet3", "/projet4", "/projet5"].includes(pathname) ? "theme-projets" :
    pathname === "/apropos" ? "theme-apropos" :
    pathname === "/contact" ? "theme-contact" :
    "";

  let previousCompact = compact;
  $: if (browser) {
    if (previousCompact && !compact && !menuOpen) {
      runLinksOpenSequence();
    } else if (compact || menuOpen) {
      resetLinksSequence();
    } else if (!compact && !menuOpen && previousCompact === compact) {
      linksTextReady = true;
    }

    previousCompact = compact;
  }

  $: if (browser && pathname) {
    scheduleThemeSectionsRefresh();
  }

  function handleProjectHeaderTone(event) {
    projectHeaderTone = event.detail?.tone ?? null;
    updateTextColor();
  }

  function hasActivePreloader() {
    return !!document.getElementById("site-intro-loader");
  }

  onMount(() => {
    let destroyed = false;

    lastScrollY = window.scrollY || 0;
    downwardScrollProgress = 0;
    refreshThemeSections();
    linksTextReady = false;

    registerRead(processScrollState);
    forceScrollEngineUpdate();

    const markHeaderReady = async () => {
      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch {}
      }

      if (destroyed) return;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (destroyed) return;
          headerReady = true;
          linksTextReady = !compact;
          forceScrollEngineUpdate();
        });
      });
    };

    const handlePreloaderDone = async () => {
      await markHeaderReady();
      if (destroyed) return;
      startHeaderIntro();
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (destroyed) return;
        blurWarm = true;
      });
    });

    window.addEventListener("preloader:done", handlePreloaderDone);
    window.addEventListener("project-header-tone", handleProjectHeaderTone);

    markHeaderReady();

    if (!hasActivePreloader()) {
      handlePreloaderDone();
    }

    headerIntroFallback = setTimeout(async () => {
      await markHeaderReady();
      if (destroyed) return;
      startHeaderIntro();
    }, 1800);

    blurWarmCleanup = setTimeout(() => {
      if (destroyed) return;
      blurWarm = false;
    }, 2600);

    window.addEventListener("resize", scheduleThemeSectionsRefresh, { passive: true });

    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      scheduleTour();
    }

    return () => {
      destroyed = true;
      unregisterRead(processScrollState);
      window.removeEventListener("preloader:done", handlePreloaderDone);
      window.removeEventListener("project-header-tone", handleProjectHeaderTone);
      window.removeEventListener("resize", scheduleThemeSectionsRefresh);
    };
  });

  onDestroy(() => {
    if (!browser) return;

    unregisterRead(processScrollState);

    clearTimeout(tourTimer);
    clearTimeout(openAnimTimer);
    clearTimeout(flipResetTimer);
    clearTimeout(headerIntroFallback);
    clearTimeout(headerIntroCleanup);
    clearTimeout(headerIntroDelay);
    clearTimeout(blurWarmCleanup);
    btnEls.filter(Boolean).forEach((btn) => {
      clearTimeout(hoverFlipTimers.get(btn));
      btn.classList.remove("is-hover-flipping");
    });

    cancelAnimationFrame(tourRaf);
    cancelAnimationFrame(refreshSectionsRaf);
  });
</script>

{#if blurWarm}
  <div class="header-blur-prewarm" aria-hidden="true">
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
  </div>
{/if}

<header
  class="nav-wrapper {compact ? 'compact' : ''} {mobileTopLinksVisible ? 'mobile-top-links-visible' : 'mobile-top-links-hidden'} {menuOpen ? 'menu-open' : ''} {themeClass} {headerReady ? 'is-ready' : 'is-loading'} {headerIntroVisible ? 'intro-visible' : 'intro-hidden'} {headerIntroVisible && !headerIntroDone ? 'intro-animating' : ''}"
  style="color:{textColor}"
  bind:this={headerEl}
>
  <nav class="nav-inner" aria-label="Navigation principale">
    <button
      class="nav-btn header-nav-btn logo"
      data-cursor="button"
      type="button"
      aria-label="Retour à l'accueil"
      bind:this={btnEls[0]}
      on:mousemove={handleButtonMove}
      on:pointerdown={triggerHoverFlip}
      on:pointerenter={triggerHoverFlip}
      on:focus={triggerHoverFlip}
      on:click={handleLogoClick}
    >
      <span class="nav-btn-flip nav-btn-flip-logo">
        <span class="nav-btn-text nav-btn-text-logo nav-btn-text-logo-main">
          <span>Agence</span>
          <span class="nav-btn-logo-prism" aria-hidden="true"></span>
          <span>3 Terres</span>
        </span>
        <span class="nav-btn-text nav-btn-text-logo nav-btn-text-logo-clone" aria-hidden="true">
          <span>Agence</span>
          <span class="nav-btn-logo-prism" aria-hidden="true"></span>
          <span>3 Terres</span>
        </span>
      </span>
    </button>

    <div
      class="links"
      class:opening={linksOpening}
      class:text-ready={linksTextReady}
      class:flip-in={linksTextFlipIn}
      role="list"
    >
      {#each [
        { label: "Services", page: "services" },
        { label: "Projets", page: "travail" },
        { label: "À propos", page: "apropos" },
        { label: "Contact", page: "contact" }
      ] as link, i}
        <button
          class="nav-btn header-nav-btn fade"
          data-cursor="button"
          type="button"
          aria-current={$page.url.pathname === `/${link.page}` ? "page" : undefined}
          bind:this={btnEls[i + 1]}
          on:mousemove={handleButtonMove}
          on:pointerenter={triggerHoverFlip}
          on:focus={triggerHoverFlip}
          on:click={() => navigate(link.page)}
        >
          <span class="nav-btn-flip" data-text={link.label}>
            <span class="nav-btn-text">{link.label}</span>
          </span>
        </button>
      {/each}
    </div>

    <div
      bind:this={menuButtonEl}
      use:registerBurger
      class="nav-btn header-nav-btn more"
      data-cursor="button"
      role="button"
      tabindex="0"
      aria-label="Ouvrir le menu"
      aria-expanded={menuOpen}
      on:mousemove={handleButtonMove}
      on:click={openMenu}
      on:keydown={(e) => e.key === "Enter" && openMenu()}
    >
      <span></span>
      <span></span>
      <span></span>
    </div>
  </nav>
</header>

<FullscreenMenu bind:open={menuOpen} origin={menuOrigin} />

<style>
  header {
    position: fixed;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 400000;
  }

  .header-blur-prewarm {
    position: fixed;
    top: -200px;
    left: -200px;
    z-index: -1;
    display: flex;
    gap: 0.6rem;
    opacity: 0;
    pointer-events: none;
  }

  .header-blur-prewarm span {
    display: block;
    height: 40px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.10);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .header-blur-prewarm span:nth-child(1) { width: 168px; }
  .header-blur-prewarm span:nth-child(2) { width: 112px; }
  .header-blur-prewarm span:nth-child(3) { width: 124px; }
  .header-blur-prewarm span:nth-child(4) { width: 118px; }
  .header-blur-prewarm span:nth-child(5) { width: 114px; }
  .header-blur-prewarm span:nth-child(6) { width: 44px; }

  .nav-wrapper {
    padding: 0;
    background: none;
    backdrop-filter: none;
    box-shadow: none;
    isolation: isolate;
    overflow: visible;
    transition:
      color 220ms ease,
      opacity 0.9s ease,
      transform 0.9s cubic-bezier(.22,.61,.36,1);
  }

  .nav-wrapper.is-loading {
    opacity: 0;
    pointer-events: none;
  }

  .nav-wrapper.intro-hidden {
    opacity: 0;
    transform: translateX(-50%);
    pointer-events: none;
  }

  .nav-wrapper.intro-visible {
    opacity: 1;
    transform: translateX(-50%);
    pointer-events: auto;
  }

  .nav-wrapper.intro-animating {
    animation: headerIntroReveal 1s cubic-bezier(.22,1,.36,1) both;
  }

  @keyframes headerIntroReveal {
    from {
      opacity: 0;
      transform: translateX(-50%) translate3d(0, -10px, 0) scale(0.985);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translate3d(0, 0, 0) scale(1);
    }
  }

  .menu-open {
    opacity: 0.35;
    transform: translateX(-50%) scale(0.97);
  }

  .nav-inner {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    overflow: visible;
    transition: gap 0.7s cubic-bezier(.22,.9,.3,1);
  }

  .nav-btn {
    font-family: "Clash Display", sans-serif;
    font-weight: 400;
    position: relative;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 1.5rem;
    font-size: 0.9rem;
    white-space: nowrap;
    color: inherit;
    border: 0px solid rgba(255, 255, 255, 0.15);
    cursor: pointer;
    background: rgba(128, 128, 128, 0.24);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    will-change: transform, opacity, backdrop-filter, -webkit-backdrop-filter;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 2px;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0);
    transition:
      color 220ms ease,
      transform 1.2s cubic-bezier(.22,.61,.36,1),
      box-shadow 1.2s cubic-bezier(.22,.61,.36,1),
      background 1.2s cubic-bezier(.22,.61,.36,1);
  }

  .logo {
    font-family: "Clash Display", sans-serif;
    font-weight: 400;
    font-style: normal;
  }

  .nav-btn-flip {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
  }

  .nav-btn-text {
    display: block;
    transform: translateY(0%);
    transition:
      transform 0.45s cubic-bezier(.22,.61,.36,1),
      opacity 0.28s ease;
  }

  .nav-btn-text-logo {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  .nav-btn-text-logo-clone {
    position: absolute;
    left: 0;
    top: 0;
    transform: translateY(100%);
  }

  .logo .nav-btn-flip::after {
    content: none;
  }

  .nav-btn-logo-prism {
    display: none;
    width: 0.95em;
    height: 1.02em;
    flex: 0 0 auto;
    background-color: currentColor;
    -webkit-mask: url("/logo_prisme_noir.svg") center / contain no-repeat;
    mask: url("/logo_prisme_noir.svg") center / contain no-repeat;
  }

  .nav-btn-flip::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition:
      transform 0.45s cubic-bezier(.22,.61,.36,1),
      opacity 0.28s ease;
    white-space: nowrap;
    color: inherit;
  }

  .nav-btn:hover .nav-btn-text,
  .nav-btn:global(.is-hover-flipping) .nav-btn-text {
    transform: translateY(-100%);
  }

  .nav-btn:hover .nav-btn-flip::after,
  .nav-btn:global(.is-hover-flipping) .nav-btn-flip::after {
    transform: translateY(0%);
  }

  .links:not(.text-ready) .nav-btn-text {
    transform: translateY(115%) rotateX(-70deg);
    transform-origin: bottom center;
    opacity: 0;
  }

  .links:not(.text-ready) .nav-btn-flip::after {
    transform: translateY(100%);
    opacity: 0;
  }

  .links.flip-in .nav-btn-text {
    transform: translateY(0%) rotateX(0deg);
    opacity: 1;
  }

  .links.flip-in .nav-btn-flip::after {
    transform: translateY(100%);
    opacity: 0;
  }

  .links.text-ready:not(.flip-in) .nav-btn-text {
    transform: translateY(0%);
    opacity: 1;
  }

  .links.text-ready:not(.flip-in) .nav-btn-flip::after {
    transform: translateY(100%);
    opacity: 1;
  }

  .links .nav-btn:hover .nav-btn-text,
  .links .nav-btn:global(.is-hover-flipping) .nav-btn-text {
    transform: translateY(-100%);
    opacity: 1;
  }

  .links .nav-btn:hover .nav-btn-flip::after,
  .links .nav-btn:global(.is-hover-flipping) .nav-btn-flip::after {
    transform: translateY(0%);
    opacity: 1;
  }

  .logo:hover .nav-btn-text-logo-main,
  .logo:global(.is-hover-flipping) .nav-btn-text-logo-main {
    transform: translateY(-100%);
    opacity: 1;
  }

  .logo:hover .nav-btn-text-logo-clone,
  .logo:global(.is-hover-flipping) .nav-btn-text-logo-clone {
    transform: translateY(0%);
    opacity: 1;
  }

  .nav-btn::before,
  .nav-btn::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
  }

  .nav-btn::before {
    border: 1px solid transparent;
    border-radius: inherit;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      rgba(255, 225, 140, 1) 0%,
      rgba(212, 175, 55, 0.95) 22%,
      rgba(212, 102, 55, 0.55) 45%,
      rgba(212, 102, 55, 0.12) 62%,
      transparent 78%
    );
    transition: opacity 0.25s ease;
  }

  .nav-btn::after {
    border: 1px solid transparent;
    border-radius: inherit;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      rgba(212, 175, 55, 0.55) 0%,
      rgba(212, 102, 55, 0.22) 42%,
      transparent 72%
    );
    filter: blur(2px);
    transition: opacity 0.25s ease;
  }

  .nav-btn:hover::before,
  .nav-btn:hover::after {
    opacity: 1;
  }

  .nav-btn.auto-glow::before,
  .nav-btn.auto-glow::after {
    opacity: 1;
  }

  .nav-btn.auto-glow-out::before,
  .nav-btn.auto-glow-out::after {
    opacity: 0;
    transition: opacity 0.35s ease;
  }

  .theme-services .nav-btn::before {
    border-image-source: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      rgba(220, 240, 255, 1) 0%,
      rgba(145, 205, 255, 0.98) 22%,
      rgba(74, 140, 255, 0.62) 45%,
      rgba(18, 45, 120, 0.14) 62%,
      transparent 78%
    );
  }

  .theme-services .nav-btn::after {
    border-image-source: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      rgba(95, 165, 255, 0.42) 0%,
      rgba(74, 140, 255, 0.18) 42%,
      transparent 72%
    );
  }

  .theme-projets .nav-btn::before {
     border-image-source: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      rgba(220, 240, 255, 1) 0%,
      rgba(145, 205, 255, 0.98) 22%,
      rgba(74, 140, 255, 0.62) 45%,
      rgba(18, 45, 120, 0.14) 62%,
      transparent 78%
    );
  }

  .theme-projets .nav-btn::after {
     border-image-source: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      rgba(95, 165, 255, 0.42) 0%,
      rgba(74, 140, 255, 0.18) 42%,
      transparent 72%
    );
  }

  .theme-apropos .nav-btn::before {
    border-image-source: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      rgba(255, 225, 140, 1) 0%,
      rgba(212, 175, 55, 0.95) 22%,
      rgba(212, 102, 55, 0.55) 45%,
      rgba(212, 102, 55, 0.12) 62%,
      transparent 78%
    );
  }

  .theme-apropos .nav-btn::after {
    border-image-source: radial-gradient(
     78px circle at var(--mx, 50%) var(--my, 50%),
      rgba(212, 175, 55, 0.55) 0%,
      rgba(212, 102, 55, 0.22) 42%,
      transparent 72%
    );
  }

  .theme-contact .nav-btn::before {
     border-image-source: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      rgba(235, 232, 255, 1) 0%,
      rgba(210, 210, 230, 0.98) 22%,
      rgba(130, 110, 220, 0.62) 45%,
      rgba(35, 30, 95, 0.14) 62%,
      transparent 78%
    );
  }

  .theme-contact .nav-btn::after {
   border-image-source: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      rgba(150, 140, 230, 0.42) 0%,
      rgba(130, 110, 220, 0.18) 42%,
      transparent 72%
    );
  }

  .links {
    display: flex;
    gap: 0.5rem;
    overflow: visible;
    max-width: 32rem;
    opacity: 1;
    padding: 8px 0;
    margin: -8px 0;
    transition:
      max-width 0.68s cubic-bezier(.2,.85,.25,1),
      opacity 0.12s linear,
      clip-path 0.68s cubic-bezier(.2,.85,.25,1);
  }

  .links button {
    flex: 0 0 auto;
    transform-origin: center center;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.04);
    transition:
      transform 0.58s cubic-bezier(.2,.85,.25,1),
      opacity 0.12s linear,
      filter 0.58s cubic-bezier(.2,.85,.25,1);
  }

  .links button:nth-child(1) { transition-delay: 0.045s; }
  .links button:nth-child(2) { transition-delay: 0s; }
  .links button:nth-child(3) { transition-delay: 0s; }
  .links button:nth-child(4) { transition-delay: 0.045s; }

  .compact .links {
    max-width: 0;
    clip-path: inset(0 100% 0 0);
  }

  .compact .links button {
    opacity: 0;
    transform: scaleX(0.84) scaleY(0.96);
    filter: blur(1.2px);
    pointer-events: none;
  }

  .compact .links button:nth-child(1) { transition-delay: 0s; }
  .compact .links button:nth-child(2) { transition-delay: 0.045s; }
  .compact .links button:nth-child(3) { transition-delay: 0.045s; }
  .compact .links button:nth-child(4) { transition-delay: 0s; }

  .compact .nav-inner {
    justify-content: center;
    gap: 0.5rem;
  }

  .more {
    width: 44px;
    padding: 0;
    cursor: pointer;
    gap: 3px;
  }

  .more span {
    width: 3px;
    height: 3px;
    background: currentColor;
    border-radius: 50%;
    transition: all 1s cubic-bezier(.22,.61,.36,1);
  }

  .more:hover span:nth-child(1) { transform: translateX(6px) scale(1.6); }
  .more:hover span:nth-child(2) { opacity: 0; transform: scale(0); }
  .more:hover span:nth-child(3) { transform: translateX(-6px) scale(1.6); }

  @media (max-width: 768px) {
    .header-blur-prewarm {
      display: flex;
      top: 0.85rem;
      left: 50%;
      z-index: 399999;
      opacity: 0.001;
      transform: translate3d(-50%, 0, 0);
    }

    .nav-btn-logo-prism {
      display: block;
    }

    .nav-btn-text-logo {
      gap: 0.48rem;
    }

    header {
      top: 0.85rem;
      width: min(calc(100vw - 1.2rem), 28.8rem);
      overflow: visible;
    }

    .nav-wrapper,
    .nav-wrapper.intro-hidden,
    .nav-wrapper.intro-visible,
    .nav-wrapper.intro-animating,
    .menu-open {
      transform: translateX(-50%);
    }

    .nav-wrapper {
      transition:
        color 180ms ease,
        opacity 420ms cubic-bezier(.22, 1, .36, 1);
    }

    .nav-wrapper.intro-animating {
      animation-duration: 620ms;
    }

    .nav-inner {
      width: 100%;
      flex-wrap: wrap;
      justify-content: center;
      row-gap: 0.55rem;
      overflow: visible;
    }

    .nav-btn {
      background: rgba(128, 128, 128, 0.24);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      box-shadow: none;
      will-change: transform, opacity;
      transform: translate3d(0, 0, 0);
      transition:
        color 180ms ease,
        background 320ms cubic-bezier(.22, 1, .36, 1);
    }

    .nav-btn-text,
    .nav-btn-flip::after {
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }

    @media (hover: none) and (pointer: coarse) {
      .header-nav-btn .nav-btn-text,
      .header-nav-btn .nav-btn-flip::after {
        transition: none;
        will-change: transform;
      }

      .header-nav-btn .nav-btn-text {
        transform: translate3d(0, 0%, 0);
      }

      .header-nav-btn .nav-btn-flip::after,
      .header-nav-btn .nav-btn-text-logo-clone {
        transform: translate3d(0, 100%, 0);
      }

      .header-nav-btn:hover .nav-btn-text,
      .links .header-nav-btn:hover .nav-btn-text,
      .header-nav-btn.logo:hover .nav-btn-text-logo-main {
        opacity: 1;
        transform: translate3d(0, 0%, 0);
      }

      .header-nav-btn:hover .nav-btn-flip::after,
      .links .header-nav-btn:hover .nav-btn-flip::after,
      .header-nav-btn.logo:hover .nav-btn-text-logo-clone {
        opacity: 1;
        transform: translate3d(0, 100%, 0);
      }
    }

    .header-nav-btn.touch-flip-active .nav-btn-text:not(.nav-btn-text-logo-clone) {
      animation: headerMobileTextFlipMain 680ms cubic-bezier(.22, .9, .3, 1) both;
      will-change: transform;
    }

    .header-nav-btn.touch-flip-active .nav-btn-flip::after,
    .header-nav-btn.touch-flip-active .nav-btn-text-logo-clone {
      animation: headerMobileTextFlipClone 680ms cubic-bezier(.22, .9, .3, 1) both;
      will-change: transform;
    }

    @keyframes headerMobileTextFlipMain {
      0%,
      100% {
        transform: translate3d(0, 0%, 0);
      }

      42%,
      62% {
        transform: translate3d(0, -100%, 0);
      }
    }

    @keyframes headerMobileTextFlipClone {
      0%,
      100% {
        transform: translate3d(0, 100%, 0);
      }

      42%,
      62% {
        transform: translate3d(0, 0%, 0);
      }
    }

    .links {
      order: 3;
      display: flex;
      width: max-content;
      max-width: calc(100vw - 0.8rem);
      justify-content: center;
      gap: 0.42rem;
      padding: 0;
      margin: 0;
      max-height: 4rem;
      clip-path: inset(0 0 0 0);
      transform-origin: top center;
      transform: translate3d(0, -10px, 0) scaleY(0.82);
      transition:
        transform 520ms cubic-bezier(.22, 1, .36, 1),
        opacity 420ms cubic-bezier(.22, 1, .36, 1);
      opacity: 0;
      pointer-events: none;
    }

    .links button {
      flex: 0 0 auto;
      padding: 0 1.16rem;
      font-size: 0.84rem;
      transform: none;
      filter: none;
      transition: none;
      transition-delay: 0s !important;
    }

    .compact .nav-inner {
      justify-content: center;
      gap: 0.5rem;
      row-gap: 0;
    }

    .compact .links {
      width: max-content;
      max-width: calc(100vw - 0.8rem);
      max-height: 4rem;
      opacity: 0;
      margin-top: 0;
      clip-path: inset(0 0 0 0);
      transform: translate3d(0, -10px, 0) scaleY(0.82);
      pointer-events: none;
    }

    .compact .links button {
      opacity: 1;
      transform: none;
      filter: none;
    }

    .nav-wrapper.mobile-top-links-visible:not(.menu-open) .links {
      width: max-content;
      max-width: calc(100vw - 0.8rem);
      opacity: 1;
      margin-top: 0;
      transform: translate3d(0, 0, 0) scaleY(1);
      pointer-events: auto;
      overflow: visible;
    }

    .more span {
      transition:
        transform 320ms cubic-bezier(.22, 1, .36, 1),
        opacity 220ms ease;
    }

    .more:hover span:nth-child(1),
    .more:hover span:nth-child(3) {
      transform: none;
    }

    .more:hover span:nth-child(2) {
      opacity: 1;
      transform: none;
    }

    .more:active span:nth-child(1) {
      transform: translateX(4px) scale(1.3);
    }

    .more:active span:nth-child(2) {
      opacity: 0;
      transform: scale(0);
    }

    .more:active span:nth-child(3) {
      transform: translateX(-4px) scale(1.3);
    }
  }

  @media (max-width: 390px) {
    .links {
      gap: 0.38rem;
    }

    .links button {
      padding: 0 1.02rem;
      font-size: 0.8rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .nav-wrapper,
    .nav-btn,
    .links,
    .links button,
    .more span,
    .nav-btn-text,
    .nav-btn-flip::after {
      transition: none;
    }

    .nav-wrapper.intro-hidden,
    .nav-wrapper.intro-visible,
    .nav-wrapper.intro-animating {
      opacity: 1;
      transform: translateX(-50%);
      filter: none;
      animation: none;
      pointer-events: auto;
    }

    .nav-btn.auto-glow::before,
    .nav-btn.auto-glow::after,
    .nav-btn.auto-glow-out::before,
    .nav-btn.auto-glow-out::after {
      display: none;
    }
  }
</style>
