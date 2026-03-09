<script>
  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";

  import { sectionIsNearViewport } from "../scrollEngine.js";

  let section;
  let cards = [];
  let metrics = [];

  // HEADER + BOUTON
  let headerEl;
  let lineEl;

  const clamp = (v, min, max) => Math.max(min, Math.min(v, max));

  function measure() {
    const scrollY = window.scrollY;

    metrics = cards.map(card => {
      const rect = card.getBoundingClientRect();
      return {
        top: rect.top + scrollY,
        height: rect.height,
        wrapper: card.querySelector(".parallax-wrapper")
      };
    });
  }

  function updateParallax(scrollY) {
    const rect = section.getBoundingClientRect();

if (!sectionIsNearViewport(rect)) return;
    const winH = window.innerHeight;

    metrics.forEach(m => {
      const center = (m.top - scrollY) + m.height / 2;
      const progress = clamp((center - winH / 2) / winH, -1, 1);
      const speed = -200;
      const offset = progress * speed;

      m.wrapper.style.transform = `translate3d(0, ${offset}px, 0)`;
    });

    // HEADER ANIMATION
    if (headerEl && lineEl) {
      const rect = headerEl.getBoundingClientRect();
      const progress = clamp(1 - rect.top / winH, 0, 1);

      headerEl.style.opacity = progress;
      headerEl.style.transform = `translateY(${40 - progress * 40}px)`;

      lineEl.style.transform = `scaleX(${progress})`;
    }
  }

  onMount(() => {
    cards = [...section.querySelectorAll(".visual")];

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

<section class="home-showcase" bind:this={section}>

  <!-- HEADER -->
  <div class="gallery-header" bind:this={headerEl}>
    <h2>Découvrez nos terres</h2>
    <div class="line" bind:this={lineEl}></div>
    <p>
      Notre agence repose sur 3 piliers fondamentaux : les sommets de l'ambition, le reflet d'un art et les lumières de la création.
    </p>
  </div>

  {#each [
    { img: '/images/photo2.webp', alt: "Creative vision", title: "Discover our creative VISION", text: "We shape visual universes where form, texture and motion create immersive brand experiences.", reverse: false },
    { img: '/images/photo2.webp', alt: "Artistic depth", title: "Crafted interactions with artistic DEPTH", text: "Every motion, contrast and transition is designed to create rhythm and harmony.", reverse: true },
    { img: '/images/photo2.webp', alt: "Emotional impact", title: "Where design meets emotional IMPACT", text: "We blend minimalism, sculpture-like compositions and cinematic pacing.", reverse: false }
  ] as sectionData}
    <div class="split {sectionData.reverse ? 'reverse' : ''}">
      <div class="visual">
        <div class="parallax-wrapper">
          <img src={sectionData.img} alt={sectionData.alt} />
        </div>
      </div>
      <div class="content">
        <h2>{sectionData.title}</h2>
        <p>{sectionData.text}</p>
      </div>
    </div>
  {/each}

  <!-- BOUTON -->
  <div class="gallery-footer">
    <a href="/services" class="services-btn">
      Découvrir nos terres
    </a>
  </div>

</section>

<style>
.home-showcase {
  width: 100vw;
  margin-left: 50%;
  transform: translateX(-50%);
  background: #111;
  color: #fff;
  padding: 12vh 0;
  display: flex;
  flex-direction: column;
  align-items: center; /* CENTRAGE */
}

/* HEADER */
.gallery-header {
  width: min(900px, 90%);
  margin-bottom: 6rem;
  text-align: center;
  color: #fff;

  display: flex;
  flex-direction: column;
  align-items: center; /* CENTRAGE */
  justify-content: center;

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

/* Ligne animée */
.line {
  width: 120px;
  height: 1px;
  background: #fff;
  margin: 0 auto 2rem auto;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.6s ease;
}

/* SPLIT SECTIONS */
.split {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  align-items: center;
  gap: 6vw;
  padding: 14vh 10vw;
  width: 100%;
}

.split.reverse {
  grid-template-columns: 1fr 1.1fr;
}

.split.reverse .visual { order: 2; }
.split.reverse .content { order: 1; }

.visual {
  height: 520px;
  overflow: hidden;
  position: relative;
}

.parallax-wrapper {
  height: 140%;
  will-change: transform;
  transform: translate3d(0,0,0);
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
}

h2 {
  font-family: 'Aboreto', serif;
  font-size: clamp(2.5rem, 4vw, 4.5rem);
  line-height: 1.05;
  margin-bottom: 2rem;
  width: 100%;
}

p {
  font-size: 1.05rem;
  color: #9b9b9b;
  line-height: 1.65;
  max-width: 620px;
}

/* BOUTON */
.gallery-footer {
  text-align: center;
  margin-top: 6rem;

  display: flex;
  flex-direction: column;
  align-items: center; /* CENTRAGE */
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
  .split {
    grid-template-columns: 1fr;
    padding: 12vh 6vw;
  }
}
</style>