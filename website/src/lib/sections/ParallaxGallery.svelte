<script>
  import { onMount, onDestroy } from "svelte";
  import {
    registerParallax,
    unregisterParallax
  } from "../scrollEngine.js";
  import ProjectOffCanvas from "./ProjectOffCanvas.svelte";

  let cards = [];
  let metrics = [];
  let selected = null;
  let gallerySection;

  let isMobile = false;

  let sectionMetrics = null;
  let headerMetrics = null;

  // HEADER animation
  let headerEl;
  let lineEl;

  const items = [
    {
      title: "Création de logo",
      date: "2024",
      desc: "Refonte complète de l'identité visuelle et création d'un système graphique minimaliste."
    },
    {
      title: "Brand Identity",
      date: "2023",
      desc: "Développement d'une plateforme de marque et direction artistique globale."
    },
    {
      title: "UI Design",
      date: "2024",
      desc: "Conception d'interfaces modernes axées sur l’expérience utilisateur."
    },
    {
      title: "UX Research",
      date: "2022",
      desc: "Études utilisateurs et architecture d'information pour application mobile."
    },
    {
      title: "Direction Artistique",
      date: "2023",
      desc: "Supervision créative et mise en place d’un univers visuel premium."
    },
    {
      title: "Motion Concept",
      date: "2024",
      desc: "Concept motion design pour lancement de produit digital."
    }
  ];

  const clamp = (v, min, max) => Math.max(min, Math.min(v, max));
  const round2 = (v) => Math.round(v * 100) / 100;

  function checkMobile() {
    isMobile = window.innerWidth <= 900;
  }

  function measure() {
    if (!gallerySection) return;

    const scrollY = window.scrollY;

    const sectionRect = gallerySection.getBoundingClientRect();
    sectionMetrics = {
      top: sectionRect.top + scrollY,
      height: sectionRect.height
    };

    if (headerEl) {
      const rect = headerEl.getBoundingClientRect();
      headerMetrics = {
        top: rect.top + scrollY,
        height: rect.height
      };
    }

    metrics = cards.map((card) => {
      const rect = card.getBoundingClientRect();

      return {
        top: rect.top + scrollY,
        height: rect.height,
        wrapper: card.querySelector(".card-image-wrapper"),
        info: card.querySelector(".info"),
        img: card.querySelector("img"),
        lastOffset: null,
        lastActive: null
      };
    });
  }

  function updateParallax(scrollY, ctx = {}) {
    if (!gallerySection || !sectionMetrics) return;

    const winH = ctx.vh || window.innerHeight;
    const mobile = typeof ctx.isMobile === "boolean" ? ctx.isMobile : isMobile;

    const sectionTopInView = sectionMetrics.top - scrollY;
    const sectionBottomInView = sectionTopInView + sectionMetrics.height;

    if (sectionBottomInView < -800 || sectionTopInView > winH + 800) return;

    metrics.forEach((m) => {
      if (!m.wrapper) return;

      const center = m.top - scrollY + m.height / 2;
      const progress = clamp((center - winH / 2) / winH, -1, 1);

      const speed = mobile ? -70 : -135;
      const offset = round2(progress * speed);

      if (offset !== m.lastOffset) {
        m.wrapper.style.transform = `translate3d(0, ${offset}px, 0)`;
        m.lastOffset = offset;
      }

      if (mobile && m.info && m.img) {
        const distanceFromCenter = Math.abs(center - winH / 2);
        const threshold = m.height * 0.42;
        const active = distanceFromCenter < threshold;

        if (active !== m.lastActive) {
          m.info.style.opacity = active ? "1" : "0";
          m.info.style.transform = active
            ? "translate3d(0, 0, 0)"
            : "translate3d(0, -10px, 0)";
          m.img.style.filter = active ? "brightness(0.6)" : "";
          m.img.style.transform = active ? "scale(1.05)" : "";
          m.lastActive = active;
        }
      }
    });

    if (headerEl && lineEl && headerMetrics) {
      const headerTopInView = headerMetrics.top - scrollY;
      const progress = clamp(1 - headerTopInView / winH, 0, 1);

      headerEl.style.opacity = `${progress}`;
      headerEl.style.transform = `translate3d(0, ${round2(40 - progress * 40)}px, 0)`;
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

  function handleResize() {
    checkMobile();
    measure();
    updateParallax(window.scrollY, {
      vh: window.innerHeight,
      vw: window.innerWidth,
      isMobile
    });
  }

  onMount(() => {
    checkMobile();

    cards = [...gallerySection.querySelectorAll(".card")];

    measure();

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("load", handleResize);

    registerParallax(updateParallax);
  });

  onDestroy(() => {
    unregisterParallax(updateParallax);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("load", handleResize);
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
        on:keydown={(e) => e.key === "Enter" && openProject(item)}
      >
        <div class="card-image-wrapper">
          <img
            src="/images/photo2.webp"
            alt={item.title}
            loading="lazy"
            decoding="async"
            fetchpriority="low"
            draggable="false"
          />
        </div>

        <div class="info">
          <span class="date">{item.date}</span>
          <span class="title">{item.title}</span>
        </div>

        <div class="card-plus">+</div>
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
  overflow: clip;
}

.gallery-header {
  width: min(900px, 90%);
  margin: 0 auto 6rem auto;
  text-align: center;
  color: #fff;
  opacity: 0;
  transform: translate3d(0, 40px, 0);
  will-change: transform, opacity;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
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
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.gallery-grid {
  width: min(1500px, 92%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.card {
  aspect-ratio: 1 / 1;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  will-change: transform;
  contain: layout paint;
  background: #161616;
}

.card-image-wrapper {
  height: 124%;
  will-change: transform;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform-origin: center center;
}

.card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transition: filter 0.45s ease, transform 0.8s ease;
  user-select: none;
  pointer-events: none;
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
  -webkit-backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 0.8rem;
  opacity: 0;
  transform: translate3d(0, -10px, 0);
  transition: opacity 0.4s ease, transform 0.4s ease;
  z-index: 2;
}

.card:hover .info {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.date {
  opacity: 0.7;
}

.title {
  font-family: "Manrope", sans-serif;
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
  -webkit-backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.15);
  transition: transform 0.4s ease, background 0.4s ease;
  z-index: 2;
}

.card:hover .card-plus {
  transform: scale(1.15);
  background: rgba(255, 255, 255, 0.25);
}

@media (max-width: 900px) {
  .gallery {
    padding: 8rem 0;
  }

  .gallery-header {
    width: min(92%, 720px);
    margin-bottom: 4rem;
  }

  .gallery-header h2 {
    font-size: clamp(2.1rem, 6vw, 3.2rem);
    letter-spacing: 0.12em;
  }

  .gallery-header p {
    font-size: 0.96rem;
    line-height: 1.58;
  }

  .line {
    width: 96px;
    margin-bottom: 1.5rem;
  }

  .gallery-grid {
    width: min(94%, 760px);
    grid-template-columns: 1fr;
    gap: 0.9rem;
  }

  .card {
    aspect-ratio: 1 / 1.08;
  }

  .card-image-wrapper {
    height: 116%;
  }

  .info {
    opacity: 0;
    transform: translate3d(0, -10px, 0);
  }

  .card:hover .info {
    opacity: 0;
    transform: translate3d(0, -10px, 0);
  }

  .card:hover img {
    filter: none;
    transform: none;
  }

  .gallery-footer {
    margin-top: 4rem;
  }
}

@media (max-width: 640px) {
  .gallery {
    padding: 6.5rem 0;
  }

  .gallery-header {
    width: min(92%, 560px);
    margin-bottom: 3rem;
  }

  .gallery-header h2 {
    font-size: clamp(1.8rem, 8vw, 2.6rem);
    letter-spacing: 0.08em;
    margin-bottom: 1rem;
  }

  .gallery-header p {
    font-size: 0.9rem;
    line-height: 1.55;
  }

  .line {
    width: 82px;
    margin-bottom: 1.2rem;
  }

  .gallery-grid {
    width: min(94%, 560px);
    gap: 0.75rem;
  }

  .card {
    aspect-ratio: 1 / 1.12;
  }

  .card-image-wrapper {
    height: 114%;
  }

  .info {
    top: 14px;
    left: 14px;
    padding: 9px 12px;
    font-size: 0.74rem;
  }

  .card-plus {
    bottom: 14px;
    left: 14px;
    width: 38px;
    height: 38px;
    font-size: 1rem;
  }

  .services-btn {
    padding: 12px 24px;
    font-size: 0.72rem;
    letter-spacing: 0.14em;
  }
}

@media (max-width: 420px) {
  .gallery {
    padding: 5.5rem 0;
  }

  .gallery-header {
    width: min(94%, 420px);
    margin-bottom: 2.4rem;
  }

  .gallery-header h2 {
    font-size: clamp(1.55rem, 8vw, 2.15rem);
    letter-spacing: 0.06em;
  }

  .gallery-header p {
    font-size: 0.86rem;
    line-height: 1.5;
  }

  .line {
    width: 70px;
    margin-bottom: 1rem;
  }

  .gallery-grid {
    width: min(94%, 420px);
    gap: 0.65rem;
  }

  .card {
    aspect-ratio: 1 / 1.16;
  }

  .card-image-wrapper {
    height: 112%;
  }

  .info {
    top: 12px;
    left: 12px;
    padding: 8px 11px;
    font-size: 0.7rem;
  }

  .card-plus {
    bottom: 12px;
    left: 12px;
    width: 34px;
    height: 34px;
    font-size: 0.95rem;
  }

  .gallery-footer {
    margin-top: 3rem;
  }

  .services-btn {
    padding: 11px 20px;
    font-size: 0.68rem;
    letter-spacing: 0.12em;
  }
}
</style>