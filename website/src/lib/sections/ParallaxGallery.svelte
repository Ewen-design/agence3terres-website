<script>
  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";
  import ProjectOffCanvas from "./ProjectOffCanvas.svelte";
  import { sectionIsNearViewport } from "../scrollEngine.js";

  let cards = [];
  let metrics = [];
  let selected = null;
  let gallerySection;

  let isMobile = false;

  // HEADER animation
  let headerEl;
  let lineEl;

  const items = [
    { title: "Création de logo", date: "2024", desc: "Refonte complète de l'identité visuelle et création d'un système graphique minimaliste." },
    { title: "Brand Identity", date: "2023", desc: "Développement d'une plateforme de marque et direction artistique globale." },
    { title: "UI Design", date: "2024", desc: "Conception d'interfaces modernes axées sur l’expérience utilisateur." },
    { title: "UX Research", date: "2022", desc: "Études utilisateurs et architecture d'information pour application mobile." },
    { title: "Direction Artistique", date: "2023", desc: "Supervision créative et mise en place d’un univers visuel premium." },
    { title: "Motion Concept", date: "2024", desc: "Concept motion design pour lancement de produit digital." }
  ];

  const clamp = (v, min, max) => Math.max(min, Math.min(v, max));

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

    // PARALLAX CARDS (inchangé)
    metrics.forEach((m, index) => {
      const center = (m.top - scrollY) + m.height / 2;
      const progress = clamp((center - winH / 2) / winH, -1, 1);
      const speed = -150;
      const offset = progress * speed;
      m.wrapper.style.transform = `translate3d(0, ${offset}px, 0)`;

      // ✅ Ajout mobile uniquement
      if (isMobile) {
        const card = cards[index];
        const info = card.querySelector(".info");
        const img = card.querySelector("img");

        const distanceFromCenter = Math.abs(center - winH / 2);
        const threshold = m.height / 2;

        if (distanceFromCenter < threshold) {
          info.style.opacity = "1";
          info.style.transform = "translateY(0)";
          img.style.filter = "brightness(0.6)";
          img.style.transform = "scale(1.05)";
        } else {
          info.style.opacity = "0";
          info.style.transform = "translateY(-10px)";
          img.style.filter = "";
          img.style.transform = "";
        }
      }
    });

    // HEADER ANIMATION (inchangé)
    if (headerEl && lineEl) {
      const rect = headerEl.getBoundingClientRect();
      const progress = clamp(1 - rect.top / winH, 0, 1);

      headerEl.style.opacity = progress;
      headerEl.style.transform = `translateY(${40 - progress * 40}px)`;

      lineEl.style.transform = `scaleX(${progress})`;
    }
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
    isMobile = window.matchMedia("(max-width: 900px)").matches;

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

  <div class="gallery-header" bind:this={headerEl}>
    <h2>Nos services</h2>
    <div class="line" bind:this={lineEl}></div>
    <p>
      Une approche stratégique et sensorielle pour construire des identités fortes,
      des expériences digitales immersives et des univers visuels mémorables.
    </p>
  </div>

  <div class="gallery-grid">
    {#each items as item}
      <div
        class="card"
        data-cursor="view"
        role="button"
        tabindex="0"
        on:click={() => openProject(item)}
        on:keydown={(e) => e.key === 'Enter' && openProject(item)}
      >
        <div class="card-image-wrapper">
          <img src="/images/photo.webp" alt={item.title} />
        </div>

        <div class="info">
          <span class="date">{item.date}</span>
          <span class="title">{item.title}</span>
        </div>
        <div class="card-plus">
  +
</div>
      </div>
    {/each}
  </div>

  <div class="gallery-footer">
    <a href="/services" class="services-btn">
      Découvrir tous les services
    </a>
  </div>

</section>

<ProjectOffCanvas 
  {selected} 
  items={items}
  on:close={closeProject} 
/>

<style>
.gallery {
  position: relative;
  width: 100vw;
  left: 50%;
  transform: translateX(-50%);
  background: #111;
  padding: 10rem 0;
}

.gallery-header {
  width: min(900px, 90%);
  margin: 0 auto 6rem auto;
  text-align: center;
  color: #fff;

  opacity: 0;
  transform: translateY(40px);
  transition: transform 0.6s ease, opacity 0.6s ease;
}

.gallery-header h2 {
  font-family: "Aboreto", serif;
  font-size: clamp(2.5rem, 4vw, 4rem);
  letter-spacing: 0.2em;
  margin-bottom: 1.5rem;
}

.gallery-header p {
  font-family: "Manrope", sans-serif;
  font-size: 1rem;
  opacity: 0.65;
  line-height: 1.6;
}

.line {
  width: 120px;
  height: 1px;
  background: #fff;
  margin: 0 auto 2rem auto;

  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.6s ease;
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
  cursor: pointer;
  will-change: transform;
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
  backdrop-filter: blur(10px);
  background: rgba(255,255,255,0.15);
  color: #fff;
  font-size: 0.8rem;
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.card:hover .info {
  opacity: 1;
  transform: translateY(0);
}

.gallery-footer {
  text-align: center;
  margin-top: 6rem;
}

.services-btn {
  display: inline-block;
  padding: 14px 36px;
  border: 1px solid #fff;
  color: #fff;
  text-decoration: none;
  font-family: "Manrope", sans-serif;
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  transition: all 0.4s ease;
}

.services-btn:hover {
  background: #fff;
  color: #111;
}

@media (max-width: 900px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }
}

.card-plus {
  position: absolute;
  bottom: 16px;
  left: 16px;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #fff;

  backdrop-filter: blur(10px);
  background: rgba(255,255,255,0.15);

  transition: transform 0.4s ease, background 0.4s ease;
}

/* animation au hover de la carte */
.card:hover .card-plus {
  transform: scale(1.15);
  background: rgba(255,255,255,0.25);
}

</style>