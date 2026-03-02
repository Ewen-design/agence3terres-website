<script>
  import { onMount } from "svelte";
  import FullscreenMenu from "./FullscreenMenu.svelte";

  export let navigate;

  let x = 50;
  let y = 50;

  let lastScrollY = 0;
  let scrollingDown = false;
  let userExpanded = false;
  let menuOpen = false;

  let textColor = "white"; // couleur dynamique du texte

  function handleMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    x = ((e.clientX - rect.left) / rect.width) * 100;
    y = ((e.clientY - rect.top) / rect.height) * 100;
  }

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

  $: compact = scrollingDown && !userExpanded;

  onMount(() => {
    window.addEventListener("scroll", handleScroll);

    // Initial
    updateTextColor();

    return () => window.removeEventListener("scroll", handleScroll);
  });

  function updateTextColor() {
    const header = document.querySelector("header");
    const headerMid = header.getBoundingClientRect().top + header.offsetHeight / 2;

    // liste des sections où le texte doit devenir noir
    const sections = document.querySelectorAll("section.hero-wrapper, section.creative-section, section.services, section.contact");

    // vérifie si le milieu du header est au-dessus de l'une de ces sections
    let overSection = false;
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (headerMid >= rect.top && headerMid <= rect.bottom) {
        overSection = true;
      }
    });

    textColor = overSection ? "black" : "white";
  }
</script>

<header
  class="nav-wrapper {compact ? 'compact' : ''} {menuOpen ? 'menu-open' : ''}"
  on:mousemove={handleMove}
  on:mouseenter={handleHover}
  style="--x:{x}%; --y:{y}%; color:{textColor}"
>
  <nav class="nav-inner">
    <!-- LOGO -->
    <div
      class="nav-btn logo"
      data-cursor="button"
      on:click={() => navigate("home")}
    >
      Agence 3 Terres
    </div>

    <!-- LIENS -->
    <div class="links">
      <button
        class="nav-btn fade"
        data-cursor="button"
        on:click={() => navigate("travail")}
      >
        Travail
      </button>

      <button
        class="nav-btn fade"
        data-cursor="button"
        on:click={() => navigate("apropos")}
      >
        À propos
      </button>

      <button
        class="nav-btn fade"
        data-cursor="button"
        on:click={() => navigate("services")}
      >
        Services
      </button>

      <button
        class="nav-btn fade"
        data-cursor="button"
        on:click={() => navigate("contact")}
      >
        Contact
      </button>
    </div>

    <!-- MENU BURGER -->
    <div
      class="nav-btn more"
      on:click={() => (menuOpen = true)}
      data-cursor="button"
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

<FullscreenMenu bind:open={menuOpen} />

<style>
/* Tout ton style existant reste inchangé */
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
  color: inherit; /* suit textColor */
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
  background: radial-gradient(
    200px circle at var(--x) var(--y),
    rgba(255,255,255,0.35),
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.8s ease;
  pointer-events: none;
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