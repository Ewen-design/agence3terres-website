<script>
  import { onMount } from "svelte";
  import FullscreenMenu from "./FullscreenMenu.svelte";

  export let navigate;

  let lastScrollY = 0;
  let scrollingDown = false;
  let menuOpen = false;
  let textColor = "white";

  const SCROLL_THRESHOLD = 10;

  function handleScroll() {
    const currentY = window.scrollY;
    const delta = currentY - lastScrollY;

    if (Math.abs(delta) < SCROLL_THRESHOLD) return;

    if (delta > 0 && currentY > 80) {
      scrollingDown = true;
    } else if (delta < 0) {
      scrollingDown = false;
    }

    lastScrollY = currentY;
    updateTextColor();
  }

  function updateTextColor() {
    const header = document.querySelector("header");
    if (!header) return;

    const headerMid = header.getBoundingClientRect().top + header.offsetHeight / 2;

    const sections = document.querySelectorAll(
      "section.hero-wrapper, section.creative-section, section.services"
    );

    let overSection = false;

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (headerMid >= rect.top && headerMid <= rect.bottom) {
        overSection = true;
      }
    });

    textColor = overSection ? "black" : "white";
  }

  function handleButtonMove(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    btn.style.setProperty("--mx", `${x}px`);
    btn.style.setProperty("--my", `${y}px`);
  }

  function handleLogoClick() {
    menuOpen = false;
    window.location.reload();
  }

  $: compact = scrollingDown && !menuOpen;

  onMount(() => {
    lastScrollY = window.scrollY;
    window.addEventListener("scroll", handleScroll);
    updateTextColor();

    return () => window.removeEventListener("scroll", handleScroll);
  });
</script>

<header
  class="nav-wrapper {compact ? 'compact' : ''} {menuOpen ? 'menu-open' : ''}"
  style="color:{textColor}"
>
  <nav class="nav-inner">

    <button
      class="nav-btn logo"
      data-cursor="button"
      on:mousemove={handleButtonMove}
      on:click={handleLogoClick}
      type="button"
    >
      Agence 3 Terres
    </button>

    <div class="links">
      <button
        class="nav-btn fade"
        data-cursor="button"
        on:mousemove={handleButtonMove}
        on:click={() => navigate("travail")}
        type="button"
      >
        Projets
      </button>

      <button
        class="nav-btn fade"
        data-cursor="button"
        on:mousemove={handleButtonMove}
        on:click={() => navigate("apropos")}
        type="button"
      >
        À propos
      </button>

      <button
        class="nav-btn fade"
        data-cursor="button"
        on:mousemove={handleButtonMove}
        on:click={() => navigate("services")}
        type="button"
      >
        Services
      </button>

      <button
        class="nav-btn fade"
        data-cursor="button"
        on:mousemove={handleButtonMove}
        on:click={() => navigate("contact")}
        type="button"
      >
        Contact
      </button>
    </div>

    <div
      class="nav-btn more"
      data-cursor="button"
      on:mousemove={handleButtonMove}
      on:click={() => (menuOpen = true)}
      role="button"
      tabindex="0"
      on:keydown={(e) => e.key === "Enter" && (menuOpen = true)}
    >
      <span></span>
      <span></span>
      <span></span>
    </div>

  </nav>
</header>

<FullscreenMenu bind:open={menuOpen} {navigate} />

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

.menu-open {
  opacity: 0.35;
  transform: translateX(-50%) scale(0.97);
  filter: blur(6px);
}

.nav-inner {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  transition: gap 1.6s cubic-bezier(.22,.61,.36,1);
}

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

  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  border-radius: 3px;

  box-shadow:
    0 8px 10px rgba(0,0,0,0.06),
    inset 0 0 0 0px rgba(255,255,255,0.4);

  transition:
    transform 1.2s cubic-bezier(.22,.61,.36,1),
    box-shadow 1.2s cubic-bezier(.22,.61,.36,1),
    background 1.2s cubic-bezier(.22,.61,.36,1);
}

.nav-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;

  background:
    radial-gradient(
      80px circle at var(--mx) var(--my),
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

.nav-btn:hover::before {
  opacity: 1;
}

.links {
  display: flex;
  gap: 0.5rem;
  transition: all 1.6s cubic-bezier(.22,.61,.36,1);
}

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
</style>