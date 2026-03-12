<script>
  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax, sectionIsNearViewport } from "../scrollEngine.js";

  let section;
  let cards = [];
  let metrics = [];

  let headerEl;
  let lineEl;

  let isMobile = false;

  const clamp = (v, min, max) => Math.max(min, Math.min(v, max));
  const round2 = (v) => Math.round(v * 100) / 100;

  function checkMobile() {
    isMobile = window.innerWidth <= 900;
  }

  function measure() {
    if (!section) return;

    const scrollY = window.scrollY;

    metrics = cards.map((card) => {
      const rect = card.getBoundingClientRect();
      return {
        top: rect.top + scrollY,
        height: rect.height,
        wrapper: card.querySelector(".parallax-wrapper"),
        lastOffset: null
      };
    });
  }

  function updateParallax(scrollY) {
    if (!section) return;

    const rect = section.getBoundingClientRect();
    if (!sectionIsNearViewport(rect)) return;

    const winH = window.innerHeight;

    metrics.forEach((m, i) => {
      if (!m.wrapper) return;

      const center = (m.top - scrollY) + m.height / 2;
      const progress = clamp((center - winH / 2) / winH, -1, 1);

      // amplitudes plus raisonnables
      const speed = isMobile
        ? [70, 45, 60][i % 3]
        : [140, 90, 120][i % 3];

      const offset = round2(progress * speed * -1);

      if (offset !== m.lastOffset) {
        m.wrapper.style.transform = `translate3d(0, ${offset}px, 0)`;
        m.lastOffset = offset;
      }
    });

    if (headerEl && lineEl) {
      const headerRect = headerEl.getBoundingClientRect();
      const progress = clamp(1 - headerRect.top / winH, 0, 1);

      headerEl.style.opacity = `${progress}`;
      headerEl.style.transform = `translate3d(0, ${round2(40 - progress * 40)}px, 0)`;
      lineEl.style.transform = `scaleX(${progress})`;
    }
  }

  function handleResize() {
    checkMobile();
    measure();
    updateParallax(window.scrollY);
  }

  onMount(() => {
    cards = [...section.querySelectorAll(".visual")];

    checkMobile();
    measure();

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("load", handleResize);

    registerParallax(updateParallax);
    updateParallax(window.scrollY);
  });

  onDestroy(() => {
    unregisterParallax(updateParallax);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("load", handleResize);
  });
</script>

<section class="home-showcase" bind:this={section}>
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
          <img
            src={sectionData.img}
            alt={sectionData.alt}
            loading="lazy"
            decoding="async"
            fetchpriority="low"
            draggable="false"
          />
        </div>
      </div>
      <div class="content">
        <h2>{sectionData.title}</h2>
        <p>{sectionData.text}</p>
      </div>
    </div>
  {/each}

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
  align-items: center;
}

/* HEADER */
.gallery-header {
  width: min(900px, 90%);
  margin-bottom: 6rem;
  text-align: center;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translate3d(0, 40px, 0);
  will-change: transform, opacity;
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
  will-change: transform;
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
  contain: paint;
  background: #161616;
}

.parallax-wrapper {
  height: 128%;
  transform: translate3d(0, 0, 0);
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  user-select: none;
  pointer-events: none;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
}

.content h2 {
  font-family: 'Aboreto', serif;
  font-size: clamp(2.5rem, 4vw, 4.5rem);
  line-height: 1.05;
  margin-bottom: 2rem;
  width: 100%;
}

.content p {
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
  align-items: center;
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
    gap: 2.5rem;
  }

  .split.reverse .visual,
  .split.reverse .content {
    order: initial;
  }

  .visual {
    height: min(68vw, 460px);
  }

  .parallax-wrapper {
    height: 118%;
  }

  .content h2 {
    font-size: clamp(2rem, 7vw, 3.4rem);
  }

  .content p {
    font-size: 0.98rem;
    line-height: 1.6;
  }
}
</style>