<script>

  import { onMount, onDestroy } from "svelte";
  import FullscreenMenu from "./FullscreenMenu.svelte";

  export let navigate;
  export let currentPage = "home";

  // ── State ──────────────────────────────────────────────────────────────────
  let lastScrollY    = 0;
  let scrollingDown  = false;
  let menuOpen       = false;
  let textColor      = "white";
  let headerEl;
  let menuButtonEl;
  let menuOrigin = { x: 0, y: 0, width: 44, height: 40 };

  const SCROLL_THRESHOLD = 10;

  // ── Scroll handler — debattu via rAF pour éviter le layout thrashing ───────
  let ticking = false;

  function handleScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      processScroll();
      ticking = false;
    });
  }

  function processScroll() {
    const currentY = window.scrollY;
    const delta    = currentY - lastScrollY;

    if (Math.abs(delta) >= SCROLL_THRESHOLD) {
      scrollingDown = delta > 0 && currentY > 80
        ? true
        : delta < 0
          ? false
          : scrollingDown;
      lastScrollY = currentY;
    }

    updateTextColor();
  }

  // ── Couleur texte selon la section survolée ────────────────────────────────
  function updateTextColor() {
    if (!headerEl) return;
    const headerMid = headerEl.getBoundingClientRect().top + headerEl.offsetHeight / 2;
    const sections  = document.querySelectorAll(
      "section.hero-wrapper, section.creative-section, section.services"
    );

    let overLight = false;
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (headerMid >= rect.top && headerMid <= rect.bottom) overLight = true;
    });

    textColor = overLight ? "black" : "white";
  }

  // ── Glow cursor ────────────────────────────────────────────────────────────
  function handleButtonMove(e) {
    const btn  = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  // ── Menu origin ────────────────────────────────────────────────────────────
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

  // ── Logo ───────────────────────────────────────────────────────────────────
  function handleLogoClick() {
    menuOpen = false;
    window.location.reload();
  }

  // ── Dérivés ────────────────────────────────────────────────────────────────
  $: compact = scrollingDown && !menuOpen;

  $: themeClass =
    currentPage === "services" ? "theme-services" :
    currentPage === "travail"  ? "theme-projets"  :
    currentPage === "apropos"  ? "theme-apropos"  :
    currentPage === "contact"  ? "theme-contact"  :
    "";

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  onMount(() => {
    lastScrollY = window.scrollY;
    updateTextColor();
    window.addEventListener("scroll", handleScroll, { passive: true });
  });

  onDestroy(() => {
    window.removeEventListener("scroll", handleScroll);
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
      on:mousemove={handleButtonMove}
      on:click={handleLogoClick}
    >
      Agence 3 Terres
    </button>

    <!-- Liens desktop -->
    <div class="links" role="list">
      {#each [
        { label: "Projets",  page: "travail"  },
        { label: "À propos", page: "apropos"  },
        { label: "Services", page: "services" },
        { label: "Contact",  page: "contact"  },
      ] as link}
        <button
          class="nav-btn fade"
          class:active={currentPage === link.page}
          data-cursor="button"
          type="button"
          role="listitem"
          aria-current={currentPage === link.page ? "page" : undefined}
          on:mousemove={handleButtonMove}
          on:click={() => navigate(link.page)}
        >
          {link.label}
        </button>
      {/each}
    </div>

    <!-- Burger -->
    <div
      bind:this={menuButtonEl}
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

<FullscreenMenu bind:open={menuOpen} {navigate} origin={menuOrigin} />

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

  /* État menu ouvert */
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
    transition: gap 1.6s cubic-bezier(.22,.61,.36,1);
  }

  /* ── Boutons base ──────────────────────────────────────────────────────── */
  .nav-btn {
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
    border-radius: 3px;
    box-shadow:
      0 8px 10px rgba(0, 0, 0, 0.06),
      inset 0 0 0 0px rgba(255, 255, 255, 0.4);
    transition:
      transform    1.2s cubic-bezier(.22,.61,.36,1),
      box-shadow   1.2s cubic-bezier(.22,.61,.36,1),
      background   1.2s cubic-bezier(.22,.61,.36,1);
  }

  /* Page active : légèrement plus opaque */
  .nav-btn.active {
    background: rgba(255, 255, 255, 0.25);
  }

  /* ── Glow border (cursor-tracking) ────────────────────────────────────── */
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

  .nav-btn:hover::before { opacity: 1; }

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
      rgba(249, 130, 130, 0.98),
      rgba(124, 69, 165, 0.7) 35%,
      rgba(40, 92, 255, 0.5) 58%,
      transparent 75%
    );
    filter: drop-shadow(0 0 4px rgba(255, 90, 90, 0.4));
  }

  .theme-apropos .nav-btn::before {
    background: radial-gradient(
      80px circle at var(--mx, 50%) var(--my, 50%),
      rgba(255, 235, 145, 0.98),
      rgba(230, 190, 72, 0.72) 35%,
      rgba(145, 100, 20, 0.45) 58%,
      transparent 75%
    );
    filter: drop-shadow(0 0 4px rgba(255, 212, 95, 0.4));
  }

  .theme-contact .nav-btn::before {
    background: radial-gradient(
      80px circle at var(--mx, 50%) var(--my, 50%),
      rgba(186, 132, 255, 0.98),
      rgba(110, 74, 255, 0.7) 35%,
      rgba(40, 92, 255, 0.5) 58%,
      transparent 75%
    );
    filter: drop-shadow(0 0 4px rgba(122, 102, 255, 0.42));
  }

  /* ── Liens desktop ─────────────────────────────────────────────────────── */
  .links {
    display: flex;
    gap: 0.5rem;
    transition: all 1.6s cubic-bezier(.22,.61,.36,1);
  }

  /* ── Compact (scroll down) ─────────────────────────────────────────────── */
  .compact .links button {
    opacity: 0;
    transform: translateY(-18px) scale(0.95);
    pointer-events: none;
  }

  .compact .links {
    width: 0;
    overflow: hidden;
  }

  .compact .nav-inner {
    justify-content: center;
    gap: 0.5rem;
  }

  /* ── Burger ────────────────────────────────────────────────────────────── */
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

  .more:hover span:nth-child(1) { transform: translateX(6px)  scale(1.6); }
  .more:hover span:nth-child(2) { opacity: 0; transform: scale(0); }
  .more:hover span:nth-child(3) { transform: translateX(-6px) scale(1.6); }

  /* ── Mobile ────────────────────────────────────────────────────────────── */
  @media (max-width: 768px) {
    .links { display: none; }
  }

  /* ── Reduced motion ────────────────────────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .nav-wrapper,
    .nav-btn,
    .links,
    .more span { transition: none; }
  }
</style>