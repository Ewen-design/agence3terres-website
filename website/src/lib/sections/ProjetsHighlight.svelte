<script>
  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";
  import { sectionIsNearViewport } from "../scrollEngine.js";

  let cards = [];
  let metrics = [];
  let sectionEl;
  let headerEl;
  let lineEl;
  let buttonEl;
  let isMobile = false;
  let section;

  const projects = [
    {
      title: "Maison Élément",
      category: "Brand Identity",
      year: "2024",
      desc: "Création d’une identité complète pour une marque premium mêlant matière brute et minimalisme contemporain.",
      img: "/images/parfum.jpg"
    },
    {
      title: "Horizon Digital",
      category: "Expérience Web",
      year: "2023",
      desc: "Conception d’une expérience immersive avec narration visuelle, transitions fluides et direction artistique forte.",
      img: "/images/parfum.jpg"
    }
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
    const rect = section.getBoundingClientRect();

if (!sectionIsNearViewport(rect)) return;
    const winH = window.innerHeight;

    metrics.forEach((m, index) => {
      const center = (m.top - scrollY) + m.height / 2;
      const progress = clamp((center - winH / 2) / winH, -1, 1);
      const offset = progress * -120;
      m.wrapper.style.transform = `translate3d(0, ${offset}px, 0)`;

      // ✅ Responsive mobile (centre écran)
      if (isMobile) {
        const card = cards[index];
        const overlay = card.querySelector(".overlay");
        const img = card.querySelector("img");

        const distanceFromCenter = Math.abs(center - winH / 2);
        const threshold = m.height / 2;

        if (distanceFromCenter < threshold) {
          overlay.style.opacity = "1";
          overlay.style.transform = "translateY(0)";
          img.style.transform = "scale(1.08)";
          img.style.filter = "brightness(0.6)";
        } else {
          overlay.style.opacity = "0";
          overlay.style.transform = "translateY(20px)";
          img.style.transform = "";
          img.style.filter = "";
        }
      }
    });

    // Micro animation titre (inchangé)
    const progress = clamp(1 - rect.top / winH, 0, 1);

    headerEl.style.opacity = progress;
    headerEl.style.transform = `translateY(${40 - progress * 40}px)`;

    lineEl.style.transform = `scaleX(${progress})`;

    // Bouton fade + slide (inchangé)
    if (buttonEl) {
      buttonEl.style.opacity = progress;
      buttonEl.style.transform = `translateY(${30 - progress * 30}px)`;
    }
  }

  onMount(() => {
    isMobile = window.matchMedia("(max-width: 900px)").matches;

    cards = [...sectionEl.querySelectorAll(".card")];
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

<section class="projects" bind:this={sectionEl}>

  <div class="projects-header" bind:this={headerEl}>
    <h2>Nos projets</h2>
    <div class="line" bind:this={lineEl}></div>
    <p>
      Deux collaborations marquantes illustrant notre approche stratégique,
      esthétique et immersive.
    </p>
  </div>
<div bind:this={section}></div>
  <div class="projects-grid">
    {#each projects as project}
      <div class="card">
        <div class="card-image-wrapper">
          <img src={project.img} alt={project.title} />
        </div>

        <div class="overlay">
          <span class="meta">{project.category} — {project.year}</span>
          <h3>{project.title}</h3>
          <p>{project.desc}</p>
          <span class="cta">Voir le projet →</span>
        </div>
      </div>
    {/each}
  </div>

  <div class="projects-footer">
    <a href="/travail" class="all-btn" bind:this={buttonEl}>
      Voir tous les projets
    </a>
  </div>

</section>

<style>
.projects {
  width: 100vw;
  left: 50%;
  transform: translateX(-50%);
  position: relative;
  background: #111;
  padding: 12rem 0;
  color: white;
}

.projects-header {
  width: min(900px, 90%);
  margin: 0 auto 6rem auto;
  text-align: center;
  opacity: 0;
  transform: translateY(40px);
  transition: transform 0.6s ease, opacity 0.6s ease;
}

.projects-header h2 {
  font-family: "Aboreto", serif;
  font-size: clamp(2.5rem, 4vw, 4rem);
  letter-spacing: 0.2em;
  margin-bottom: 1.2rem;
}

.projects-header p {
  font-family: "Manrope", sans-serif;
  opacity: 0.6;
  line-height: 1.6;
}

.line {
  width: 120px;
  height: 1px;
  background: white;
  margin: 0 auto 2rem auto;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.6s ease;
}

.projects-grid {
  width: min(1300px, 92%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.card {
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
  cursor: pointer;
}

.card-image-wrapper {
  height: 110%;
  transform: translate3d(0,0,0);
  will-change: transform;
}

.card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1.2s ease, filter 0.6s ease;
}

.card:hover img {
  transform: scale(1.08);
  filter: brightness(0.6);
}

.overlay {
  position: absolute;
  inset: 0;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: linear-gradient(to top, rgba(0,0,0,0.75), transparent 60%);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.card:hover .overlay {
  opacity: 1;
  transform: translateY(0);
}

.meta {
  font-size: 0.8rem;
  opacity: 0.7;
  letter-spacing: 0.1em;
}

.overlay h3 {
  font-family: "Aboreto", serif;
  font-size: 1.8rem;
  margin: 0.5rem 0;
}

.overlay p {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 1rem;
}

.cta {
  font-size: 0.85rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.projects-footer {
  text-align: center;
  margin-top: 6rem;
}

.all-btn {
  display: inline-block;
  padding: 14px 36px;
  border: 1px solid white;
  color: white;
  text-decoration: none;
  font-family: "Manrope", sans-serif;
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s ease;
}

.all-btn:hover {
  background: white;
  color: #111;
}

@media (max-width: 900px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>