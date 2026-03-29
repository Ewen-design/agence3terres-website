<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import FullscreenMenu from "./FullscreenMenu.svelte";
  import { navigate } from "$lib/navigate.js";

  // ── State ──────────────────────────────────────────────────────────────────
  let lastScrollY   = 0;
  let scrollingDown = false;
  let menuOpen      = false;
  let textColor     = "white";
  let headerEl;
  let menuButtonEl;
  let menuOrigin = { x: 0, y: 0, width: 44, height: 40 };

  let linksOpening = false;
  let linksTextReady = true;
  let linksTextFlipIn = false;
  let openAnimTimer;
  let flipResetTimer;

  const SCROLL_THRESHOLD = 10;

  // ── Scroll handler ─────────────────────────────────────────────────────────
  let ticking = false;
  function handleScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { processScroll(); ticking = false; });
  }
  function processScroll() {
    const currentY = window.scrollY;
    const delta    = currentY - lastScrollY;
    if (Math.abs(delta) >= SCROLL_THRESHOLD) {
      scrollingDown = delta > 0 && currentY > 80 ? true : delta < 0 ? false : scrollingDown;
      lastScrollY   = currentY;
    }
    updateTextColor();
  }

  function updateTextColor() {
    if (!headerEl) return;
    const headerMid = headerEl.getBoundingClientRect().top + headerEl.offsetHeight / 2;
    const sections  = document.querySelectorAll(
      "section.hero-wrapper, section.creative-section, section.services, section.dna-section, section.lifestyles-section"
    );
    let overLight = false;
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (headerMid >= rect.top && headerMid <= rect.bottom) overLight = true;
    });
    textColor = overLight ? "black" : "white";
  }

  // ── Glow cursor (hover manuel) ─────────────────────────────────────────────
  function handleButtonMove(e) {
    const btn  = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  // ── Auto-tour glow ─────────────────────────────────────────────────────────
  let btnEls = []; // refs sur tous les .nav-btn (logo + links + burger)
  let tourTimer;
  let tourRaf;
  let isTouringNow = false;

  function startTour() {
    if (isTouringNow) return;

    const linkBtns = btnEls.filter(el => el != null);
    if (!linkBtns.length) return;

    const btn = linkBtns[Math.floor(Math.random() * linkBtns.length)];
    const rect = btn.getBoundingClientRect();
    const h    = rect.height;

    btn.style.setProperty("--my", `${h / 2}px`);

    const duration = 900;
    const start    = performance.now();
    const fromX    = -20;
    const toX      = rect.width + 20;

    isTouringNow = true;
    btn.classList.add("auto-glow");

    const isBurger = btn.classList.contains("more");
    if (isBurger) {
      const spans = btn.querySelectorAll("span");
      if (spans[0]) spans[0].style.transform = "translateX(6px) scale(1.6)";
      if (spans[1]) spans[1].style.opacity = "0";
      if (spans[1]) spans[1].style.transform = "scale(0)";
      if (spans[2]) spans[2].style.transform = "translateX(-6px) scale(1.6)";
    }

    function animFrame(now) {
      const t    = Math.min((now - start) / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const mx   = fromX + (toX - fromX) * ease;
      btn.style.setProperty("--mx", `${mx}px`);

      if (t < 1) {
        tourRaf = requestAnimationFrame(animFrame);
      } else {
        btn.classList.remove("auto-glow");
        btn.classList.add("auto-glow-out");
        if (isBurger) {
          const spans = btn.querySelectorAll("span");
          spans.forEach(s => { s.style.transform = ""; s.style.opacity = ""; });
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
    const delay = 3000 + Math.random() * 3000;
    tourTimer = setTimeout(startTour, delay);
  }

  function registerBurger(node) {
    btnEls[5] = node;
    return { destroy() { btnEls[5] = null; } };
  }

  // ── Menu ───────────────────────────────────────────────────────────────────
  function openMenu() {
    if (menuButtonEl) {
      const rect = menuButtonEl.getBoundingClientRect();
      menuOrigin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: rect.width, height: rect.height };
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

  // ── Dérivés ────────────────────────────────────────────────────────────────
  $: compact = scrollingDown && !menuOpen;
  $: themeClass =
    $page.url.pathname === "/services" ? "theme-services" :
    $page.url.pathname === "/travail"  ? "theme-projets"  :
    $page.url.pathname === "/apropos"  ? "theme-apropos"  :
    $page.url.pathname === "/contact"  ? "theme-contact"  :
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

  onMount(() => {
    lastScrollY = window.scrollY;
    updateTextColor();
    linksTextReady = !compact;
    window.addEventListener("scroll", handleScroll, { passive: true });
    scheduleTour();
  });

  onDestroy(() => {
    if (!browser) return;
    window.removeEventListener("scroll", handleScroll);
    clearTimeout(tourTimer);
    clearTimeout(openAnimTimer);
    clearTimeout(flipResetTimer);
    cancelAnimationFrame(tourRaf);
  });
</script>

<header
  class="nav-wrapper {compact ? 'compact' : ''} {menuOpen ? 'menu-open' : ''} {themeClass}"
  style="color:{textColor}"
  bind:this={headerEl}
>
  <nav class="nav-inner" aria-label="Navigation principale">

    <!-- Logo -->
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

    <!-- Liens desktop -->
    <div
      class="links"
      class:opening={linksOpening}
      class:text-ready={linksTextReady}
      class:flip-in={linksTextFlipIn}
      role="list"
    >
      {#each [
        { label: "Projets",  page: "travail"  },
        { label: "À propos", page: "apropos"  },
        { label: "Services", page: "services" },
        { label: "Contact",  page: "contact"  },
      ] as link, i}
        <button
          class="nav-btn fade"
          class:active={$page.url.pathname === `/${link.page}`}
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

    <!-- Burger -->
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
  /* ── Wrapper fixé ──────────────────────────────────────────────────────── */
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
      opacity   0.9s ease,
      transform 0.9s cubic-bezier(.22,.61,.36,1),
      filter    0.9s ease;
  }
  .menu-open {
    opacity: 0.35;
    transform: translateX(-50%) scale(0.97);
    filter: blur(6px);
  }

  /* ── Nav inner ─────────────────────────────────────────────────────────── */
  .nav-inner {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    transition: gap 0.7s cubic-bezier(.22,.9,.3,1);
  }

  /* ── Boutons base ──────────────────────────────────────────────────────── */
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
    border: none;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 2px;
    box-shadow:
      0 6px 8px rgba(0, 0, 0, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      inset 0 -1px 1px rgba(0, 0, 0, 0.08);
    transition:
      transform  1.2s cubic-bezier(.22,.61,.36,1),
      box-shadow 1.2s cubic-bezier(.22,.61,.36,1),
      background 1.2s cubic-bezier(.22,.61,.36,1);
  }
  .nav-btn.active {
    background: rgba(255, 255, 255, 0.25);
  }

  /* ── Hover texte flip uniquement ──────────────────────────────────────── */
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

  /* texte caché pendant le dépliage */
  .links:not(.text-ready) .nav-btn-text {
    transform: translateY(115%) rotateX(-70deg);
    transform-origin: bottom center;
    opacity: 0;
  }
  .links:not(.text-ready) .nav-btn-flip::after {
    transform: translateY(100%);
    opacity: 0;
  }

  /* arrivée du texte : un seul texte qui s'ouvre vers le haut */
  .links.flip-in .nav-btn-text {
    transform: translateY(0%) rotateX(0deg);
    opacity: 1;
  }
  .links.flip-in .nav-btn-flip::after {
    transform: translateY(100%);
    opacity: 0;
  }

  /* état normal après l'arrivée */
  .links.text-ready:not(.flip-in) .nav-btn-text {
    transform: translateY(0%);
    opacity: 1;
  }
  .links.text-ready:not(.flip-in) .nav-btn-flip::after {
    transform: translateY(100%);
    opacity: 1;
  }

  /* ✅ hover flip réactivé explicitement pour les 4 boutons du milieu */
  .links .nav-btn:hover .nav-btn-text {
    transform: translateY(-100%);
    opacity: 1;
  }
  .links .nav-btn:hover .nav-btn-flip::after {
    transform: translateY(0%);
    opacity: 1;
  }

  /* ── Glow border ───────────────────────────────────────────────────────── */
  .nav-btn::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: radial-gradient(
      80px circle at var(--mx, 50%) var(--my, 50%),
      rgba(212, 175, 55, 0.95),
      rgba(212, 102, 55, 0.45) 40%,
      transparent 75%
    );
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;
    filter: drop-shadow(0 0 3px rgba(212, 175, 55, 0.35));
  }

  /* Hover manuel */
  .nav-btn:hover::before { opacity: 1; }

  /* Auto-tour : glow visible */
  .nav-btn.auto-glow::before {
    opacity: 1;
  }

  /* Auto-tour : fade out */
  .nav-btn.auto-glow-out::before {
    opacity: 0;
    transition: opacity 0.35s ease;
  }

  /* ── Thèmes page ───────────────────────────────────────────────────────── */
  .theme-services .nav-btn::before {
    background: radial-gradient(
      80px circle at var(--mx, 50%) var(--my, 50%),
      rgba(145, 205, 255, 0.98),
      rgba(74, 140, 255, 0.68) 35%,
      rgba(18, 45, 120, 0.52) 58%,
      transparent 75%
    );
    filter: drop-shadow(0 0 4px rgba(95, 165, 255, 0.4));
  }
  .theme-projets .nav-btn::before {
    background: radial-gradient(
      80px circle at var(--mx, 50%) var(--my, 50%),
      rgba(210, 210, 230, 0.98),
      rgba(130, 110, 220, 0.7) 35%,
      rgba(35, 30, 95, 0.55) 58%,
      transparent 75%
    );
    filter: drop-shadow(0 0 4px rgba(150, 140, 230, 0.4));
  }
  .theme-apropos .nav-btn::before {
    background: radial-gradient(
      80px circle at var(--mx, 50%) var(--my, 50%),
      rgba(255, 170, 170, 0.98),
      rgba(255, 110, 90, 0.75) 35%,
      rgba(150, 40, 40, 0.55) 58%,
      transparent 75%
    );
    filter: drop-shadow(0 0 4px rgba(255, 110, 90, 0.4));
  }
  .theme-contact .nav-btn::before {
    background: radial-gradient(
      80px circle at var(--mx, 50%) var(--my, 50%),
      rgba(170, 255, 233, 0.98),
      rgba(77, 214, 182, 0.72) 34%,
      rgba(26, 111, 117, 0.5) 58%,
      transparent 75%
    );
    filter: drop-shadow(0 0 4px rgba(77, 214, 182, 0.4));
  }

  /* ── Liens desktop : ouverture/fermeture depuis le milieu des 4 ───────── */
  .links {
    display: flex;
    gap: 0.5rem;
    overflow: hidden;
    max-width: 32rem;
    opacity: 1;
    transition:
      max-width 0.68s cubic-bezier(.2,.85,.25,1),
      opacity 0.12s linear;
  }

  .links button {
    flex: 0 0 auto;
    transform-origin: center center;
    transition:
      transform 0.58s cubic-bezier(.2,.85,.25,1),
      opacity 0.12s linear,
      filter 0.58s cubic-bezier(.2,.85,.25,1);
  }

  /* ouverture : 2 et 3 d'abord, puis 1 et 4 */
  .links button:nth-child(1) { transition-delay: 0.045s; }
  .links button:nth-child(2) { transition-delay: 0.00s; }
  .links button:nth-child(3) { transition-delay: 0.00s; }
  .links button:nth-child(4) { transition-delay: 0.045s; }

  /* ── Compact ───────────────────────────────────────────────────────────── */
  .compact .links {
    max-width: 0;
  }

  .compact .links button {
    opacity: 0;
    transform: scaleX(0.84) scaleY(0.96);
    filter: blur(1.2px);
    pointer-events: none;
  }

  /* fermeture : 1 et 4 d'abord, puis 2 et 3 */
  .compact .links button:nth-child(1) { transition-delay: 0.00s; }
  .compact .links button:nth-child(2) { transition-delay: 0.045s; }
  .compact .links button:nth-child(3) { transition-delay: 0.045s; }
  .compact .links button:nth-child(4) { transition-delay: 0.00s; }

  .compact .nav-inner {
    justify-content: center;
    gap: 0.5rem;
  }

  /* ── Burger ────────────────────────────────────────────────────────────── */
  .more { width: 44px; padding: 0; cursor: pointer; gap: 3px; }
  .more span {
    width: 3px;
    height: 3px;
    background: currentColor;
    border-radius: 50%;
    transition: all 1s cubic-bezier(.22,.61,.36,1);
  }
  .more:hover span:nth-child(1) { transform: translateX(6px)  scale(1.6); }
  .more:hover span:nth-child(2) { opacity: 0; transform: scale(0); }
  .more:hover span:nth-child(3) { transform: translateX(-6px) scale(1.6); }

  /* ── Mobile ────────────────────────────────────────────────────────────── */
  @media (max-width: 768px) { .links { display: none; } }

  /* ── Reduced motion ────────────────────────────────────────────────────── */
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
    .nav-btn.auto-glow::before,
    .nav-btn.auto-glow-out::before { display: none; }
  }
</style>