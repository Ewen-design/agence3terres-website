<script>
  import { onMount } from "svelte";
  import FullscreenMenu from "./FullscreenMenu.svelte";

  export let navigate;

  let lastScrollY = 0;
  let scrollingDown = false;
  let menuOpen = false;

  function handleScroll() {
    const currentY = window.scrollY;

    if (currentY > lastScrollY && currentY > 60) {
      scrollingDown = true;
    } else {
      scrollingDown = false;
    }

    lastScrollY = currentY;
  }

  onMount(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  });

  $: compact = scrollingDown;
</script>

<header class="header {compact ? 'compact' : ''} {menuOpen ? 'menu-open' : ''}">

  <!-- LEFT -->
  <div class="side left">
    <button on:click={() => navigate("travail")} class="link">Travail</button>
    <button on:click={() => navigate("apropos")} class="link">À propos</button>
    <button on:click={() => navigate("services")} class="link">Services</button>
  </div>

  <!-- CENTER LOGO -->
  <div class="logo" on:click={() => navigate("home")}>
    Agence 3 Terres
  </div>

  <!-- RIGHT -->
  <div class="side right">
    <button on:click={() => navigate("contact")} class="link contact">
      Contact
    </button>

    <div
      class="more"
      on:click={() => (menuOpen = true)}
      role="button"
      tabindex="0"
      on:keydown={(e) => e.key === "Enter" && (menuOpen = true)}
    >
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>

</header>

<FullscreenMenu bind:open={menuOpen} />

<style>

/* HEADER */

.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 56px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 6vw;

  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background: rgba(255,255,255,0.25);

  z-index: 1000;

  transition:
    background 0.6s ease,
    opacity 0.6s ease,
    transform 0.6s cubic-bezier(.22,.61,.36,1);
}

/* COMPACT (SCROLL DOWN) */

.compact .link,
.compact .contact {
  opacity: 0;
  transform: translateY(-6px);
  pointer-events: none;
}

/* SIDES */

.side {
  display: flex;
  align-items: center;
  gap: 1.8rem;
  transition: all 0.6s cubic-bezier(.22,.61,.36,1);
}

/* LOGO */

.logo {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Aboreto', serif;
  font-size: clamp(1.2rem, 1.6vw, 1.6rem);
  letter-spacing: 2px;
  color: #000;
  cursor: pointer;
  transition: opacity 0.5s ease;
}

/* LINKS */

.link {
  background: none;
  border: none;
  font-size: 0.85rem;
  font-weight: 400;
  color: #111;
  cursor: pointer;
  position: relative;

  transition:
    opacity 0.5s ease,
    transform 0.5s ease,
    text-shadow 0.5s ease;
}

/* SUBTLE LUXE GLOW */

.link:hover {
  text-shadow:
    0 0 6px rgba(0,0,0,0.15),
    0 0 20px rgba(0,0,0,0.08);
}

/* CONTACT */

.contact {
  font-weight: 500;
}

/* THREE DOT MENU */

.more {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: opacity 0.5s ease;
}

.more span {
  width: 3px;
  height: 3px;
  background: #000;
  border-radius: 50%;
  transition: transform 0.5s cubic-bezier(.22,.61,.36,1);
}

.more:hover span:nth-child(1) {
  transform: translateY(-3px);
}
.more:hover span:nth-child(3) {
  transform: translateY(3px);
}

/* MENU OPEN STATE */

.menu-open {
  opacity: 0.6;
  transform: scale(0.99);
}

/* RESPONSIVE */

@media (max-width: 900px) {
  .side.left {
    display: none;
  }

  .contact {
    display: none;
  }
}

</style>