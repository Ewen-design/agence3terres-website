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

  let headerIntroStarted = false;
  let headerIntroVisible = false;
  let headerIntroDone = false;
  let headerReady = false;
  let blurWarm = false;
  let headerIntroFallback;
  let headerIntroCleanup;
  let headerIntroDelay;
  let blurWarmCleanup;

  let tourTimer;
  let tourRaf;
  let isTouringNow = false;
  let downwardScrollProgress = 0;

  let themedSections = [];
  let refreshSectionsRaf = 0;
  let mixSliderHeaderTone = null;
  let projectHeaderTone = null;
  const SCROLL_THRESHOLD = 10;
  const COMPACT_TRIGGER_Y = 80;
  const COMPACT_DOWNWARD_DISTANCE = 360;
  const TOP_LINKS_SHOW_Y = 14;
  const TOP_LINKS_HIDE_Y = 54;
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
    if (atTopOfPage) {
      if (currentY > TOP_LINKS_HIDE_Y) atTopOfPage = false;
    } else if (currentY <= TOP_LINKS_SHOW_Y) {
      atTopOfPage = true;
    }

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
        if (footerReveal >= 0.97) {
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

  function startTour() {
    if (isTouringNow || !menuButtonEl) return;

    const btn = menuButtonEl;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--my", `${rect.height / 2}px`);

    const duration = 900;
    const start = performance.now();
    const fromX = -20;
    const toX = rect.width + 20;

    isTouringNow = true;
    btn.classList.add("auto-glow");

    const dots = btn.querySelectorAll(".dot");
    if (dots[0]) dots[0].style.transform = "translateX(6px) scale(1.6)";
    if (dots[1]) { dots[1].style.opacity = "0"; dots[1].style.transform = "scale(0)"; }
    if (dots[2]) dots[2].style.transform = "translateX(-6px) scale(1.6)";

    function animFrame(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      btn.style.setProperty("--mx", `${fromX + (toX - fromX) * ease}px`);

      if (t < 1) {
        tourRaf = requestAnimationFrame(animFrame);
      } else {
        btn.classList.remove("auto-glow");
        btn.classList.add("auto-glow-out");
        dots.forEach((s) => { s.style.transform = ""; s.style.opacity = ""; });
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
    tourTimer = setTimeout(startTour, 3000 + Math.random() * 3000);
  }

  function handleLogoClick() {
    // Sur la page d'accueil, le logo ne doit pas naviguer (on y est déjà).
    if (pathname === "/") return;
    navigate("home");
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

  function toggleMenu() {
    if (menuOpen) {
      menuOpen = false;
    } else {
      openMenu();
    }
  }

  function startHeaderIntro() {
    if (headerIntroStarted) return;
    headerIntroStarted = true;
    clearTimeout(headerIntroFallback);

    const revealDelay =
      browser && window.matchMedia("(hover: none) and (pointer: coarse)").matches ? 40 : 0;

    clearTimeout(headerIntroDelay);
    headerIntroDelay = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          headerIntroVisible = true;
          window.dispatchEvent(new CustomEvent("header:intro-visible"));

          clearTimeout(headerIntroCleanup);
          headerIntroCleanup = setTimeout(() => {
            headerIntroDone = true;
            blurWarm = false;
            window.dispatchEvent(new CustomEvent("header:intro-done"));
          }, 720);
        });
      });
    }, revealDelay);
  }

  $: compact = scrollingDown && !menuOpen;

  $: themeClass =
    pathname === "/services" ? "theme-services" :
    ["/travail", "/projet1", "/projet3", "/projet4", "/projet5", "/projet6", "/projet7", "/services/digital", "/services/design", "/services/studio"].includes(pathname) ? "theme-projets" :
    pathname === "/apropos" ? "theme-apropos" :
    pathname === "/contact" ? "theme-contact" :
    "";

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

    registerRead(processScrollState);
    forceScrollEngineUpdate();

    const markHeaderReady = async () => {
      if (document.fonts?.ready) {
        try { await document.fonts.ready; } catch {}
      }
      if (destroyed) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (destroyed) return;
          headerReady = true;
          forceScrollEngineUpdate();
        });
      });
    };

    const handleHeaderReveal = async () => {
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

    window.addEventListener("preloader:header-reveal", handleHeaderReveal);
    window.addEventListener("project-header-tone", handleProjectHeaderTone);

    markHeaderReady();

    if (!hasActivePreloader()) {
      handleHeaderReveal();
    }

    headerIntroFallback = setTimeout(async () => {
      await markHeaderReady();
      if (destroyed) return;
      startHeaderIntro();
    }, hasActivePreloader() ? 8000 : 1800);

    blurWarmCleanup = setTimeout(() => {
      if (destroyed) return;
      blurWarm = false;
    }, 10000);

    window.addEventListener("resize", scheduleThemeSectionsRefresh, { passive: true });

    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      scheduleTour();
    }

    return () => {
      destroyed = true;
      unregisterRead(processScrollState);
      window.removeEventListener("preloader:header-reveal", handleHeaderReveal);
      window.removeEventListener("project-header-tone", handleProjectHeaderTone);
      window.removeEventListener("resize", scheduleThemeSectionsRefresh);
    };
  });

  onDestroy(() => {
    if (!browser) return;
    unregisterRead(processScrollState);
    clearTimeout(tourTimer);
    clearTimeout(headerIntroFallback);
    clearTimeout(headerIntroCleanup);
    clearTimeout(headerIntroDelay);
    clearTimeout(blurWarmCleanup);
    cancelAnimationFrame(tourRaf);
    cancelAnimationFrame(refreshSectionsRaf);
  });
</script>

{#if blurWarm}
  <div class="header-blur-prewarm" aria-hidden="true">
    <span></span>
    <span></span>
  </div>
{/if}

<header
  class="nav-wrapper {compact ? 'compact' : ''} {menuOpen ? 'menu-open' : ''} {themeClass} {headerReady ? 'is-ready' : 'is-loading'} {headerIntroVisible ? 'intro-visible' : 'intro-hidden'} {headerIntroVisible && !headerIntroDone ? 'intro-animating' : ''} {textColor === LIGHT_TEXT_COLOR && !menuOpen ? 'ink-dark' : ''}"
  style="color:{menuOpen ? '#ffffff' : textColor}"
  bind:this={headerEl}
>
  <button
    class="nav-btn mobile-logo {pathname === '/' ? 'is-home' : ''}"
    type="button"
    aria-label="Retour à l'accueil"
    aria-disabled={pathname === "/"}
    on:click={handleLogoClick}
  >
    <span class="mobile-logo-glass" aria-hidden="true"></span>
  </button>

  <div
    bind:this={menuButtonEl}
    class="nav-btn header-nav-btn more"
    data-cursor="button"
    role="button"
    tabindex="0"
    aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
    aria-expanded={menuOpen}
    on:mousemove={handleButtonMove}
    on:click={toggleMenu}
    on:keydown={(e) => e.key === "Enter" && toggleMenu()}
  >
    <span class="menu-text">MENU</span>
    <span class="dots">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </span>
    <svg class="close-cross" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6L18 18" />
      <path d="M18 6L6 18" />
    </svg>
  </div>
</header>

<FullscreenMenu bind:open={menuOpen} origin={menuOrigin} />

<style>
  header {
    position: fixed;
    top: 1rem;
    left: 0;
    right: 0;
    width: 100%;
    padding: 0 1rem;
    box-sizing: border-box;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    pointer-events: none;
    /* Above the fullscreen menu (z 500000) so the trigger stays on top and
       turns into the close (X) control. */
    z-index: 600000;
    overflow: visible;
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
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .header-blur-prewarm span:nth-child(1) { width: 130px; }
  .header-blur-prewarm span:nth-child(2) { width: 44px; }

  @media (max-width: 768px) {
    .header-blur-prewarm span {
      backdrop-filter: blur(12px) saturate(130%);
      -webkit-backdrop-filter: blur(12px) saturate(130%);
    }
  }

  .nav-wrapper {
    background: none;
    backdrop-filter: none;
    box-shadow: none;
    isolation: isolate;
    overflow: visible;
    transition:
      color var(--project-theme-transition, 220ms ease),
      opacity 0.9s ease;
  }

  .nav-wrapper.is-loading {
    opacity: 0;
  }

  .nav-wrapper.intro-hidden {
    opacity: 0;
    pointer-events: none;
  }

  .nav-wrapper.intro-visible {
    opacity: 1;
  }

  .nav-wrapper.intro-animating {
    animation: headerIntroReveal 680ms cubic-bezier(.22,1,.36,1) both;
  }

  @keyframes headerIntroReveal {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* The header sits ABOVE the menu and acts as the close control → stay full. */
  .menu-open {
    opacity: 1;
  }

  .nav-btn {
    pointer-events: auto;
    font-family: "Inter", sans-serif;
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
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    will-change: transform, opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 10px;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0);
    transition:
      color 220ms ease,
      transform 1.2s cubic-bezier(.22,.61,.36,1),
      box-shadow 1.2s cubic-bezier(.22,.61,.36,1),
      background 1.2s cubic-bezier(.22,.61,.36,1);
  }

  /* Logo mobile — masqué sur desktop */
  .mobile-logo {
    --logo-cut-size: 1.25rem;
    --logo-button-width: calc(var(--logo-cut-size) + 2rem);
    display: none;
    width: var(--logo-button-width);
    flex: 0 0 var(--logo-button-width);
    padding: 0;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-mask-image: linear-gradient(#fff 0 0), url("/images/logo_prisme.png");
    -webkit-mask-position: center, center;
    -webkit-mask-repeat: no-repeat, no-repeat;
    -webkit-mask-size: 100% 100%, var(--logo-cut-size) var(--logo-cut-size);
    -webkit-mask-composite: xor;
    mask-image: linear-gradient(#fff 0 0), url("/images/logo_prisme.png");
    mask-position: center, center;
    mask-repeat: no-repeat, no-repeat;
    mask-size: 100% 100%, var(--logo-cut-size) var(--logo-cut-size);
    mask-composite: exclude;
  }

  .mobile-logo-glass {
    position: absolute;
    inset: 0;
    display: none;
    border-radius: inherit;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform: translateZ(0);
    transition: background 1.2s cubic-bezier(.22,.61,.36,1);
    -webkit-mask-image: linear-gradient(#fff 0 0), url("/images/logo_prisme.png");
    -webkit-mask-position: center, center;
    -webkit-mask-repeat: no-repeat, no-repeat;
    -webkit-mask-size: 100% 100%, var(--logo-cut-size) var(--logo-cut-size);
    -webkit-mask-composite: xor;
    mask-image: linear-gradient(#fff 0 0), url("/images/logo_prisme.png");
    mask-position: center, center;
    mask-repeat: no-repeat, no-repeat;
    mask-size: 100% 100%, var(--logo-cut-size) var(--logo-cut-size);
    mask-composite: exclude;
  }

  /* Sur la home, le logo ne navigue pas : pas de curseur cliquable. */
  .mobile-logo.is-home {
    cursor: default;
  }

  @supports not ((-webkit-mask-composite: xor) or (mask-composite: exclude)) {
    .mobile-logo {
      background: rgba(255, 255, 255, 0.11);
      backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
      -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
      -webkit-mask: none;
      mask: none;
    }

    .mobile-logo-glass {
      display: block;
      inset: 50% auto auto 50%;
      width: var(--logo-cut-size);
      height: var(--logo-cut-size);
      background: currentColor;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      transform: translate3d(-50%, -50%, 0);
      -webkit-mask: url("/images/logo_prisme.png") center / contain no-repeat;
      mask: url("/images/logo_prisme.png") center / contain no-repeat;
    }
  }

  /* Menu button */
  .more {
    gap: 0;
    padding: 0 1.4rem;
    cursor: pointer;
    overflow: visible;
    justify-content: center;
  }

  .menu-text {
    font-family: "Inter", sans-serif;
    font-size: 0.72rem;
    font-weight: 400;
    letter-spacing: 0.1em;
    white-space: nowrap;
    max-width: 4rem;
    opacity: 1;
    overflow: hidden;
    margin-right: 0.45rem;
    transition:
      max-width 0.65s cubic-bezier(.22,.61,.36,1),
      opacity 0.5s cubic-bezier(.22,.61,.36,1),
      margin-right 0.65s cubic-bezier(.22,.61,.36,1);
  }

  .compact .menu-text,
  .menu-open .menu-text {
    max-width: 0;
    opacity: 0;
    margin-right: 0;
  }

  /* Conteneur des 3 points — centrage garanti même quand MENU est caché */
  .dots {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    transition:
      opacity 0.4s cubic-bezier(.22,.61,.36,1),
      transform 0.5s cubic-bezier(.22,.61,.36,1);
  }

  .dot {
    width: 3px;
    height: 3px;
    background: currentColor;
    border-radius: 50%;
    flex-shrink: 0;
    transition: all 1s cubic-bezier(.22,.61,.36,1);
  }

  /* Hover effects ONLY on real hover devices — on touch, :hover "sticks" after a
     tap, which would leave the dots spread/scaled after closing the menu. */
  @media (hover: hover) and (pointer: fine) {
    .more:hover .dots .dot:nth-child(1) { transform: translateX(6px) scale(1.6); }
    .more:hover .dots .dot:nth-child(2) { opacity: 0; transform: scale(0); }
    .more:hover .dots .dot:nth-child(3) { transform: translateX(-6px) scale(1.6); }
  }

  /* Close (X) — appears in place of the dots while the menu is open. */
  .close-cross {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 16px;
    height: 16px;
    margin: -8px 0 0 -8px;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    fill: none;
    opacity: 0;
    transform: scale(0.5) rotate(-90deg);
    transition:
      opacity 0.45s cubic-bezier(.22,.61,.36,1),
      transform 0.6s cubic-bezier(.22,.61,.36,1);
    pointer-events: none;
  }

  .menu-open .more .dots {
    opacity: 0;
    transform: scale(0.5);
  }

  .menu-open .more .close-cross {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }

  @media (hover: hover) and (pointer: fine) {
    .menu-open .more:hover .close-cross {
      transform: scale(1.12) rotate(90deg);
    }
  }

  /* Glow border effect — approche mask pour respecter border-radius */
  .nav-btn::before,
  .nav-btn::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0;
  }

  .nav-btn::before {
    background: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      rgba(208, 219, 255, 1) 0%,
      rgba(87, 104, 255, 0.95) 22%,
      rgba(87, 104, 255, 0.58) 45%,
      rgba(23, 5, 47, 0.16) 62%,
      transparent 78%
    );
    transition: opacity 0.25s ease;
  }

  .nav-btn::after {
    background: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      rgba(87, 104, 255, 0.38) 0%,
      rgba(87, 104, 255, 0.18) 42%,
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

  @media (max-width: 768px) {
    header {
      top: 0.85rem;
      padding: 0 0.6rem;
      justify-content: space-between;
      /* Pas de transform ici : transform sur le parent casse le backdrop-filter des enfants */
    }

    .mobile-logo {
      display: flex;
    }

    /* Menu open → the menu shows the contact button on the left, so free that
       corner by hiding the header logo (only the X close stays, on the right). */
    .menu-open .mobile-logo {
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .nav-wrapper {
      transition:
        color 150ms ease,
        opacity 600ms cubic-bezier(.22, 1, .36, 1);
    }

    .nav-btn {
      will-change: transform, opacity;
      transition: color 150ms ease;
      backdrop-filter: blur(12px) saturate(130%);
      -webkit-backdrop-filter: blur(12px) saturate(130%);
    }

    .mobile-logo {
      backdrop-filter: blur(12px) saturate(130%);
      -webkit-backdrop-filter: blur(12px) saturate(130%);
    }

    @supports not ((-webkit-mask-composite: xor) or (mask-composite: exclude)) {
      .mobile-logo {
        backdrop-filter: blur(12px) saturate(130%);
        -webkit-backdrop-filter: blur(12px) saturate(130%);
      }

      .mobile-logo-glass {
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }
    }

    .menu-text {
      transition:
        max-width 0.58s cubic-bezier(.22,.61,.36,1),
        opacity 0.42s ease,
        margin-right 0.58s cubic-bezier(.22,.61,.36,1);
    }

    .compact .menu-text,
    .menu-open .menu-text {
      max-width: 0;
      opacity: 0;
      margin-right: 0;
    }

    /* No :active dot feedback on touch — :active "sticks" after a tap on mobile,
       which would leave the dots shifted/scaled after closing the menu (they
       wouldn't reset on their own). The menu-open toggle handles the dots. */

    .dot {
      transition:
        transform 280ms cubic-bezier(.22, 1, .36, 1),
        opacity 200ms ease;
    }

    /* Snap the dots straight back to their neutral state when the menu closes. */
    .more .dots {
      transition:
        opacity 0.28s cubic-bezier(.22,.61,.36,1),
        transform 0.28s cubic-bezier(.22,.61,.36,1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .nav-wrapper,
    .nav-btn,
    .menu-text,
    .dot {
      transition: none;
    }

    .nav-wrapper.intro-hidden,
    .nav-wrapper.intro-visible,
    .nav-wrapper.intro-animating {
      opacity: 1;
      transform: none;
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
