<script>
  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";

  export let client;
  export let index;

  let section;
  let coverLayer;
  let galleryItems = [];
  let offcanvas = false;

  onMount(() => {
    registerParallax(coverLayer, { speed: 0.1 });

    galleryItems.forEach((item, i) => {
      registerParallax(item, { speed: 0.1 + i * 0.05 });
    });
  });

  onDestroy(() => {
    unregisterParallax(coverLayer);
    galleryItems.forEach((item) => unregisterParallax(item));
  });

  function toggleOffcanvas() {
    offcanvas = !offcanvas;
  }
</script>

<section class="client-section" bind:this={section}>

  <!-- COVER PARALLAX -->
  <div class="cover">
    <div
      class="cover-layer"
      bind:this={coverLayer}
      style="background-image:url({client.cover})"
    ></div>

    <div class="cover-overlay"></div>
    <div class="cover-gradient"></div>
  </div>

  <!-- CONTENT -->
  <div class="content">

    <div class="text-block">
      <span class="index">0{index + 1}</span>
      <h2>{client.name}</h2>
      <h3>{client.role}</h3>
      <p>{client.description}</p>

      <button class="cta" on:click={toggleOffcanvas}>
        Voir le projet
      </button>
    </div>

    <!-- GALLERY -->
    <div class="gallery">

    {#each client.gallery as img, i}
  <div
    class="gallery-item {img.type}"
    bind:this={galleryItems[i]}
    style="background-image:url({img.src})"
  ></div>
{/each}

    </div>

  </div>

  <!-- TRANSITION GRADIENT -->
  <div class="section-fade"></div>

  <!-- OFF CANVAS -->
  {#if offcanvas}
    <div class="offcanvas">
      <div class="offcanvas-inner">
        <button class="close" on:click={toggleOffcanvas}>✕</button>
        <h2>{client.name}</h2>
        <p>Présentation complète du projet ici.</p>
      </div>
    </div>
  {/if}

</section>

<style>

/* SECTION */

.client-section {
  position: relative;
  min-height: 140vh;
  overflow: hidden;
  padding: 150px 0;
}

/* COVER */

.cover {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.cover-layer {
  position: absolute;
  inset: -10%;
  background-size: cover;
  background-position: center;
  transform: scale(1.1);
  will-change: transform;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.55);
}

.cover-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent 40%);
}

/* CONTENT */

.content {
  position: relative;
  z-index: 5;
  max-width: 1400px;
  margin: auto;
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 80px;
  padding: 0 80px;
}

/* TEXT */

.text-block {
  backdrop-filter: blur(10px);
  background: rgba(0,0,0,0.35);
  padding: 50px;
}

.index {
  letter-spacing: 4px;
  font-size: 0.8rem;
  opacity: 0.6;
}

h2 {
  font-family: 'Aboreto', serif;
  font-size: clamp(2.5rem, 4vw, 4rem);
  margin: 20px 0;
}

.cta {
  margin-top: 30px;
  padding: 14px 28px;
  background: white;
  color: black;
  border: none;
  cursor: pointer;
  letter-spacing: 2px;
  transition: all .4s ease;
}

.cta:hover {
  transform: translateY(-5px);
}

/* GALLERY */

.gallery {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: 140px;
  gap: 20px;
}

.gallery-item {
  background-size: cover;
  background-position: center;
  transition: transform 1s cubic-bezier(.77,0,.18,1),
              filter .6s ease;
  will-change: transform;
}

.gallery-item:hover {
  transform: scale(1.08);
  filter: blur(2px);
}

/* FORMAT TYPES */

.square { grid-column: span 2; grid-row: span 2; }
.wide { grid-column: span 4; grid-row: span 2; }
.vertical { grid-column: span 2; grid-row: span 3; }
.free { grid-column: span 3; grid-row: span 2; }

/* TRANSITION */

.section-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 200px;
  background: linear-gradient(to bottom, transparent, black);
  pointer-events: none;
}

/* OFFCANVAS */

.offcanvas {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.9);
  z-index: 9999;
  animation: fadeIn .5s ease forwards;
}

.offcanvas-inner {
  max-width: 900px;
  margin: 100px auto;
  padding: 60px;
  background: #111;
}

.close {
  position: absolute;
  top: 40px;
  right: 40px;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* RESPONSIVE */

@media (max-width: 1000px) {
  .content {
    grid-template-columns: 1fr;
  }

  .gallery {
    grid-template-columns: repeat(2, 1fr);
  }
}

</style>