<script>
  import { onMount } from "svelte";
  import FullscreenMenu from "./FullscreenMenu.svelte";

  export let navigate;

  let lastScrollY = 0;
  let scrollingDown = false;
  let userExpanded = false;
  let menuOpen = false;
  let textColor = "white";

  function handleScroll() {
    const currentY = window.scrollY;

    if (currentY > lastScrollY && currentY > 50) {
      scrollingDown = true;
      userExpanded = false;
    } else {
      scrollingDown = false;
    }

    lastScrollY = currentY;
    updateTextColor();
  }

  function handleHover() {
    userExpanded = true;
  }

  function updateTextColor() {
    const header = document.querySelector("header");
    const headerMid = header.getBoundingClientRect().top + header.offsetHeight / 2;

    const sections = document.querySelectorAll(
      "section.hero-wrapper, section.creative-section, section.services, section.contact"
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

  // 🔥 Curseur par bouton (suivi réel)
  function handleButtonMove(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    btn.style.setProperty("--mx", `${x}px`);
    btn.style.setProperty("--my", `${y}px`);
  }

  $: compact = scrollingDown && !userExpanded;

  onMount(() => {
    window.addEventListener("scroll", handleScroll);
    updateTextColor();
    return () => window.removeEventListener("scroll", handleScroll);
  });
</script>

<header
  class="nav-wrapper {compact ? 'compact' : ''} {menuOpen ? 'menu-open' : ''}"
  on:mouseenter={handleHover}
  style="color:{textColor}"
>
  <nav class="nav-inner">

    <div
      class="nav-btn logo"
      data-cursor="button"
      on:mousemove={handleButtonMove}
      on:click={() => navigate("home")}
    >
      Agence 3 Terres
    </div>

    <div class="links">
      <button class="nav-btn fade" data-cursor="button" on:mousemove={handleButtonMove} on:click={() => navigate("travail")}>
        Travail
      </button>

      <button class="nav-btn fade" data-cursor="button" on:mousemove={handleButtonMove} on:click={() => navigate("apropos")}>
        À propos
      </button>

      <button class="nav-btn fade" data-cursor="button" on:mousemove={handleButtonMove} on:click={() => navigate("services")}>
        Services
      </button>

      <button class="nav-btn fade" data-cursor="button" on:mousemove={handleButtonMove} on:click={() => navigate("contact")}>
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
  z-index: 999;
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

/* 🔥 Glow bordure localisé ultra premium */
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
      rgba(212, 175, 55, 0.45) 40%,
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