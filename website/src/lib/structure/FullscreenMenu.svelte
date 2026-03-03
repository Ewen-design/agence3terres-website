<script>
  import { tick } from "svelte";
  export let open = false;
  export let navigate; // 🔥 fonction passée depuis Header
  let closing = false;
  let hovered = null;

  const links = [
    { label: "L'envol", page: "home", image: "https://images.unsplash.com/photo-1498579809087-ef1e558fd1da?q=80&w=2000" },
    { label: "Projets", page: "travail", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2000" },
    { label: "À propos", page: "apropos", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2000" },
    { label: "Services", page: "services", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2000" },
    { label: "Contact", page: "contact", image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=2000" }
  ];

  async function close() {
    closing = true;
    await tick();
    setTimeout(() => {
      open = false;
      closing = false;
      hovered = null;
    }, 900);
  }

  function handleClick(link) {
    if (navigate && link.page) {
      navigate(link.page); // 🔥 Appelle la fonction de App.svelte
    }
    close(); // fermer le menu
  }
</script>

{#if open}
<div class="wrapper {closing ? 'closing' : 'opening'}">

  <!-- BACKDROP -->
  <div
    class="backdrop {hovered ? 'fade-out' : ''}"
    on:click={close}
  ></div>

  <!-- MENU -->
  <div class="menu {hovered ? 'expanded' : ''}">

    <!-- TOP -->
    <div class="menu-top">
      <div class="close-block" on:click={close} data-cursor="fermer">
        <div class="close-icon">✕</div>
      </div>
      <div class="logo-center">
        <img src="/images/logo.jpg" alt="Logo" />
      </div>
    </div>

    <!-- BODY -->
    <div class="menu-body">
      <div class="links">
        {#each links as link, i}
          <a
            href="#"
            style="--i:{i}"
            on:mouseenter={() => hovered = link}
            on:mouseleave={() => hovered = null}
            on:click={() => handleClick(link)}
            class:active={hovered === link}
            class:dimmed={hovered && hovered !== link}
            data-cursor="voir"
          >
            {link.label}
          </a>
        {/each}
      </div>

      {#if hovered}
        <div class="image-wrapper">
          <div
            class="image"
            style="background-image:url({hovered.image})"
          ></div>
          <div class="image-overlay"></div>
          <div class="image-gradient"></div>
        </div>
      {/if}
    </div>
  </div>
</div>
{/if}

<style>
/* --- WRAPPER ENTRY / EXIT --- */
.wrapper {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  pointer-events: all;
}
.wrapper.opening .menu,
.wrapper.opening .backdrop { animation: menuBackdropIn 0.9s cubic-bezier(.77,0,.18,1) forwards; }
.wrapper.closing .menu,
.wrapper.closing .backdrop { animation: menuBackdropOut 0.9s cubic-bezier(.77,0,.18,1) forwards; }

@keyframes menuBackdropIn {
  0% { opacity: 0; transform: translateX(-20px); backdrop-filter: blur(0px); }
  100% { opacity: 1; transform: translateX(0); backdrop-filter: blur(30px); }
}
@keyframes menuBackdropOut {
  0% { opacity: 1; transform: translateX(0); backdrop-filter: blur(30px); }
  100% { opacity: 0; transform: translateX(-20px); backdrop-filter: blur(0px); }
}

/* --- BACKDROP --- */
.backdrop {
  position: absolute;
  right: 0;
  width: 50%;
  height: 100%;
  background: rgba(10,10,10,0.6);
  will-change: opacity, backdrop-filter;
}

/* --- MENU PANEL --- */
.menu {
  width: 50%;
  height: 100%;
  background: rgba(10,10,10,0.97);
  color: white;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  will-change: transform, opacity;
  transition: width 0.5s cubic-bezier(.77,0,.18,1);
}
.menu.expanded { width: 100%; }

/* --- TOP --- */
.menu-top {
  position: relative;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10; /* top au-dessus de l'image */
}

/* --- CLOSE BLOCK --- */
.close-block {
  position: absolute;
  left: 40px;
  width: 75px;
  height: 75px;
  backdrop-filter: blur(40px);
  background: rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all .5s ease;
}
.close-block:hover { background: white; }
.close-icon {
  font-size: 1.8rem;
  color: white;
  transition: .5s ease;
}
.close-block:hover .close-icon { color: black; transform: rotate(90deg) scale(1.2); }

/* --- LOGO --- */
.logo-center img { height: 65px; opacity: 0.85; }

/* --- BODY --- */
.menu-body {
  flex: 1;
  display: flex;
  align-items: center;
  padding-left: 90px;
  position: relative;
  overflow: hidden;
}

/* --- LINKS --- */
.links {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-family: 'Aboreto', serif;
  font-size: clamp(2rem, 4vw, 3.2rem);
  z-index: 10;
}
.links a {
  text-decoration: none;
  color: white;
  opacity: 0;
  transform: translateY(40px);
  animation: fadeUp .8s forwards;
  animation-delay: calc(var(--i) * .1s);
  transition: transform .5s cubic-bezier(.77,0,.18,1),
              letter-spacing .5s ease,
              filter .5s ease,
              opacity .5s ease;
}
@keyframes fadeUp { to { opacity:1; transform:translateY(0); } }
.links a.active { letter-spacing: 6px; transform: translateX(25px); }
.links a.dimmed { opacity: 0.25; filter: blur(3px); }

/* --- IMAGE FULL ON HOVER --- */
.image-wrapper {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 1; /* dessous logo et bouton */
}
.image {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  animation: revealImage .9s cubic-bezier(.77,0,.18,1) forwards,
             zoomInside 8s ease forwards;
  will-change: transform, clip-path;
}
.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.45);
}
/* --- Dégradé haut assombri --- */
.image-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 30%);
  pointer-events: none;
}

/* reveal gauche → droite */
@keyframes revealImage { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
/* zoom interne */
@keyframes zoomInside { from { transform: scale(1); } to { transform: scale(1.15); } }

/* --- RESPONSIVE --- */
@media (max-width: 900px) {
  .menu { width: 100%; height: 100%; }
  .menu-body { padding-left: 0; justify-content: center; align-items: center; }
  .links { font-size: clamp(2.5rem, 6vw, 4rem); text-align: center; gap: 1.5rem; align-items: center; }
}
</style>