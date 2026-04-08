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
  let headerIntroFallback;
  let headerIntroCleanup;

  let btnEls = [];
  let tourTimer;
  let tourRaf;
  let isTouringNow = false;

  let themedSections = [];
  let refreshSectionsRaf = 0;

  const SCROLL_THRESHOLD = 10;
  const SECTION_SELECTOR =
    "section.hero-wrapper, section.creative-section, section.services, section.dna-section, section.lifestyles-section";

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
    const currentY = state?.currentY ?? window.scrollY ?? 0;
    const delta = currentY - lastScrollY;

    if (Math.abs(delta) >= SCROLL_THRESHOLD) {
      if (delta > 0 && currentY > 80) scrollingDown = true;
      else if (delta < 0) scrollingDown = false;

      lastScrollY = currentY;
    }

    updateTextColor();
  }

  function updateTextColor() {
    if (!headerEl || !themedSections.length) return;

    const rect = headerEl.getBoundingClientRect();
    const headerMid = rect.top + rect.height * 0.5;

    let overLight = false;

    for (let i = 0; i < themedSections.length; i++) {
      const sectionRect = themedSections[i].getBoundingClientRect();
      if (headerMid >= sectionRect.top && headerMid <= sectionRect.bottom) {
        overLight = true;
        break;
      }
    }

    const nextColor = overLight ? "black" : "white";
    if (nextColor !== textColor) textColor = nextColor;
  }

  function handleButtonMove(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${e.clientY - rect.top}px`);
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

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        headerIntroVisible = true;

        clearTimeout(headerIntroCleanup);
        headerIntroCleanup = setTimeout(() => {
          headerIntroDone = true;
        }, 1100);
      });
    });
  }

  $: compact = scrollingDown && !menuOpen;

  $: themeClass =
    $page.url.pathname === "/services" ? "theme-services" :
    $page.url.pathname === "/travail" ? "theme-projets" :
    $page.url.pathname === "/apropos" ? "theme-apropos" :
    $page.url.pathname === "/contact" ? "theme-contact" :
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

  $: if (browser && $page.url.pathname) {
    scheduleThemeSectionsRefresh();
  }

  onMount(() => {
    lastScrollY = window.scrollY || 0;
    refreshThemeSections();
    linksTextReady = !compact;

    registerRead(processScrollState);
    forceScrollEngineUpdate();

    const handlePreloaderDone = () => {
      startHeaderIntro();
    };

    window.addEventListener("preloader:done", handlePreloaderDone);

    headerIntroFallback = setTimeout(() => {
      startHeaderIntro();
    }, 1800);

    window.addEventListener("resize", scheduleThemeSectionsRefresh, { passive: true });

    scheduleTour();

    return () => {
      unregisterRead(processScrollState);
      window.removeEventListener("preloader:done", handlePreloaderDone);
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

    cancelAnimationFrame(tourRaf);
    cancelAnimationFrame(refreshSectionsRaf);
  });
</script>

<header
  class="nav-wrapper {compact ? 'compact' : ''} {menuOpen ? 'menu-open' : ''} {themeClass} {headerIntroVisible ? 'intro-visible' : 'intro-hidden'} {headerIntroVisible && !headerIntroDone ? 'intro-animating' : ''}"
  style="color:{textColor}"
  bind:this={headerEl}
>
  <nav class="nav-inner" aria-label="Navigation principale">
    <button
      class="nav-btn logo"
      data-cursor="button"
      type="button"
      aria-label="Retour à l'accueil"
      bind:this={btnEls[0]}
      on:mousemove={handleButtonMove}
      on:click={handleLogoClick}
    >
      <span class="nav-btn-flip" data-text="Agence 3 Terres">
        <span class="nav-btn-text">Agence 3 Terres</span>
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
        { label: "Projets", page: "travail" },
        { label: "À propos", page: "apropos" },
        { label: "Services", page: "services" },
        { label: "Contact", page: "contact" }
      ] as link, i}
        <button
          class="nav-btn fade"
          data-cursor="button"
          type="button"
          aria-current={$page.url.pathname === `/${link.page}` ? "page" : undefined}
          bind:this={btnEls[i + 1]}
          on:mousemove={handleButtonMove}
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
      class="nav-btn more"
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
    z-index: 1000;
  }

  .nav-wrapper {
    padding: 0;
    background: none;
    backdrop-filter: none;
    box-shadow: none;
    transition:
      opacity 0.9s ease,
      transform 0.9s cubic-bezier(.22,.61,.36,1),
      filter 0.9s ease;
  }

  .nav-wrapper.intro-hidden {
    opacity: 0;
    transform: translateX(-50%);
    pointer-events: none;
  }

  .nav-wrapper.intro-visible {
    opacity: 1;
    transform: translateX(-50%);
    filter: none;
    pointer-events: auto;
  }

  .nav-wrapper.intro-animating {
    animation: headerIntroReveal 1s cubic-bezier(.22,1,.36,1) both;
  }

  @keyframes headerIntroReveal {
    from {
      opacity: 0;
      filter: blur(10px);
      transform: translateX(-50%) translate3d(0, -10px, 0) scale(0.985);
    }
    to {
      opacity: 1;
      filter: blur(0);
      transform: translateX(-50%) translate3d(0, 0, 0) scale(1);
    }
  }

  .menu-open {
    opacity: 0.35;
    transform: translateX(-50%) scale(0.97);
    filter: blur(6px);
  }

  .nav-inner {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    transition: gap 0.7s cubic-bezier(.22,.9,.3,1);
  }

  .nav-btn {
    font-family: "General Sans", sans-serif;
    position: relative;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 1.5rem;
    font-size: 0.9rem;
    white-space: nowrap;
    color: inherit;
    border: 1px solid rgba(255, 255, 255, 0.15);
    cursor: pointer;
    background: rgba(255, 255, 255, 0.10);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 2px;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.04);
    transition:
      transform 1.2s cubic-bezier(.22,.61,.36,1),
      box-shadow 1.2s cubic-bezier(.22,.61,.36,1),
      background 1.2s cubic-bezier(.22,.61,.36,1);
  }

  .logo {
    font-family: "Titre bold", serif;
    font-weight: 700;
    font-style: italic;
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

  .nav-btn:hover .nav-btn-text {
    transform: translateY(-100%);
  }

  .nav-btn:hover .nav-btn-flip::after {
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

  .links .nav-btn:hover .nav-btn-text {
    transform: translateY(-100%);
    opacity: 1;
  }

  .links .nav-btn:hover .nav-btn-flip::after {
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
      rgba(235, 232, 255, 1) 0%,
      rgba(210, 210, 230, 0.98) 22%,
      rgba(130, 110, 220, 0.62) 45%,
      rgba(35, 30, 95, 0.14) 62%,
      transparent 78%
    );
  }

  .theme-projets .nav-btn::after {
    border-image-source: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      rgba(150, 140, 230, 0.42) 0%,
      rgba(130, 110, 220, 0.18) 42%,
      transparent 72%
    );
  }

  .theme-apropos .nav-btn::before {
    border-image-source: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      rgba(255, 226, 226, 1) 0%,
      rgba(255, 170, 170, 0.98) 22%,
      rgba(255, 110, 90, 0.62) 45%,
      rgba(150, 40, 40, 0.14) 62%,
      transparent 78%
    );
  }

  .theme-apropos .nav-btn::after {
    border-image-source: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      rgba(255, 110, 90, 0.42) 0%,
      rgba(255, 110, 90, 0.18) 42%,
      transparent 72%
    );
  }

  .theme-contact .nav-btn::before {
    border-image-source: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      rgba(228, 255, 247, 1) 0%,
      rgba(170, 255, 233, 0.98) 22%,
      rgba(77, 214, 182, 0.62) 45%,
      rgba(26, 111, 117, 0.14) 62%,
      transparent 78%
    );
  }

  .theme-contact .nav-btn::after {
    border-image-source: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      rgba(77, 214, 182, 0.42) 0%,
      rgba(77, 214, 182, 0.18) 42%,
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
    .links { display: none; }
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