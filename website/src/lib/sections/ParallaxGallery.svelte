<script>
  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";
  import ProjectOffCanvas from "./ProjectOffCanvas.svelte";

  let cards = [];
  let metrics = [];
  let selected = null;
  let gallerySection;

  const items = [
    { title: "Création de logo", date: "2024", desc: "Refonte complète de l'identité visuelle et création d'un système graphique minimaliste." },
    { title: "Brand Identity", date: "2023", desc: "Développement d'une plateforme de marque et direction artistique globale." },
    { title: "UI Design", date: "2024", desc: "Conception d'interfaces modernes axées sur l’expérience utilisateur." },
    { title: "UX Research", date: "2022", desc: "Études utilisateurs et architecture d'information pour application mobile." },
    { title: "Direction Artistique", date: "2023", desc: "Supervision créative et mise en place d’un univers visuel premium." },
    { title: "Motion Concept", date: "2024", desc: "Concept motion design pour lancement de produit digital." }
  ];

  function clamp(v, min, max) {
    return Math.max(min, Math.min(v, max));
  }

  function measure() {
    const scrollY = window.scrollY;

    metrics = cards.map(card => {
      const rect = card.getBoundingClientRect();

      return {
        top: rect.top + scrollY,
        height: rect.height,
        wrapper: card.querySelector(".card-image-wrapper")
      };
    });
  }

  function updateParallax(scrollY) {
    const winH = window.innerHeight;

    metrics.forEach(m => {
      const relativeTop = m.top - scrollY;
      const center = relativeTop + m.height / 2;

      const progress = clamp((center - winH / 2) / winH, -1, 1);

      const speed = -150;
      const offset = progress * speed;

      m.wrapper.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
  }

  function openProject(item) {
    selected = item;
    document.body.style.overflow = "hidden";
  }

  function closeProject() {
    selected = null;
    document.body.style.overflow = "";
  }

  onMount(() => {
    cards = [...gallerySection.querySelectorAll(".card")];

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);

    registerParallax(updateParallax);
  });

  onDestroy(() => {
    unregisterParallax(updateParallax);
    window.removeEventListener("resize", measure);
    window.removeEventListener("load", measure);
  });
</script>

<section class="gallery" bind:this={gallerySection}>
  <div class="gallery-grid">
    {#each items as item}
      <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
      <div class="card" data-cursor="view" role="button" tabindex="0" on:click={() => openProject(item)} on:keydown={(e) => e.key === 'Enter' && openProject(item)}>
        <div class="card-image-wrapper">
          <img src="/images/parfum.jpg" alt="{item.title}" />
        </div>

        <div class="info">
          <span class="date">{item.date}</span>
          <span class="title">{item.title}</span>
        </div>
      </div>
    {/each}
  </div>
</section>

<ProjectOffCanvas {selected} on:close={closeProject} />

<style>
.gallery {
  position: relative;
  left: 50%;
  margin-left: -50vw;
  width: 100vw;
  background: #111;
  padding: 8rem 0;
}

.gallery-grid {
  width: min(1500px, 92%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.card {
  aspect-ratio: 1/1;
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  cursor: pointer;
}

.card-image-wrapper {
  height: 120%;
  will-change: transform;
  transform: translate3d(0,0,0);
}

.card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.5s ease, transform 1.2s ease;
}

.card:hover img {
  filter: brightness(0.6);
  transform: scale(1.05);
}

.info {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 14px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  background: rgba(255,255,255,0.15);
  color: white;
  font-size: 0.8rem;
  opacity: 0;
  transform: translateY(-10px);
  transition: 0.4s ease;
}

.card:hover .info {
  opacity: 1;
  transform: translateY(0);
}
</style>
