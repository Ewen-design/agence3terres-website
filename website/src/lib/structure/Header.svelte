<script>
  import { onMount } from "svelte";
  import FullscreenMenu from "./FullscreenMenu.svelte";

  let x = 50;
  let y = 50;

  let lastScrollY = 0;
  let scrollingDown = false;
  let userExpanded = false;
  let menuOpen = false;

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
  }

  onMount(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  function handleHover() {
    userExpanded = true;
  }

  $: compact = scrollingDown && !userExpanded;
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<header
  class="nav-wrapper {compact ? 'compact' : ''} {menuOpen ? 'menu-open' : ''}"
  on:mousemove={handleMove}
  on:mouseenter={handleHover}
  style="--x:{x}%; --y:{y}%"
>
  <nav class="nav-inner">
    <div class="nav-btn logo" data-cursor="button">Agence 3 Terres</div>

    <div class="links">
      <a href="/" class="nav-btn fade" data-cursor="button">Travail</a>
      <a href="/" class="nav-btn fade" data-cursor="button">À propos</a>
      <a href="/" class="nav-btn fade" data-cursor="button">Services</a>
      <a href="/" class="nav-btn fade" data-cursor="button">Contact</a>
    </div>

    <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
    <div class="nav-btn more" on:click={() => menuOpen = true} data-cursor="button" role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && (menuOpen = true)}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  </nav>
</header>

<FullscreenMenu bind:open={menuOpen} />

<style>
header {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
}

/* SUPPRESSION DU BLOC GLOBAL */
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

/* NAV */
.nav-inner {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  transition: gap 1.6s cubic-bezier(.22,.61,.36,1);
}

/* BOUTONS APPLE LIKE */
.nav-btn {
  position: relative;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0 1.5rem;
  font-size: 0.9rem;
  white-space: nowrap;
  text-decoration: none;
  color: #111;

  /* BLUR */
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(3.5px);
  -webkit-backdrop-filter: blur(3.5px); 

  border-radius: 3px;

  box-shadow:
    0 8px 10px rgba(0,0,0,0.06),
    inset 0 0 0 1px rgba(255,255,255,0.4);

  transition:
    transform 1.2s cubic-bezier(.22,.61,.36,1),
    box-shadow 1.2s cubic-bezier(.22,.61,.36,1),
    background 1.2s cubic-bezier(.22,.61,.36,1);
}

/* LIGHT TRACKING */
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

/* PREMIUM HOVER */
.nav-btn:hover {
  transform: translateY(-3px) scale(1.02);

  box-shadow:
    0 12px 40px rgba(0,0,0,0.08),
    0 0 40px rgba(194, 156, 123, 0.45),
    inset 0 0 0 1px rgba(255,255,255,0.10);
}

/* LINKS */
.links {
  display: flex;
  gap: 0.5rem;
  transition: all 1.6s cubic-bezier(.22,.61,.36,1);
}

.links a {
  transition:
    opacity 1.4s cubic-bezier(.22,.61,.36,1),
    transform 1.4s cubic-bezier(.22,.61,.36,1);
}

/* COMPACT MODE CONSERVÉ */
.compact .links a {
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

/* BOUTON MORE */
.more {
  width: 44px;
  padding: 0;
  cursor: pointer;
  gap: 3px;
}

.more span {
  width: 3px;
  height: 3px;
  background: #111;
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
