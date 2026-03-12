<script>
  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";
  import ProjectOffCanvas from "./ProjectOffCanvas.svelte";

  let selected = null;
  let gallerySection;
  let isMobile = false;
  let sectionMetrics = null;
  let headerMetrics = null;
  let headerEl;
  let lineEl;

  const items = [
    {
      title: "Création de logo",
      date: "2024",
      desc: "Refonte complète de l'identité visuelle et création d'un système graphique minimaliste.",
    },
    {
      title: "Brand Identity",
      date: "2023",
      desc: "Développement d'une plateforme de marque et direction artistique globale.",
    },
    {
      title: "UI Design",
      date: "2024",
      desc: "Conception d'interfaces modernes axées sur l'expérience utilisateur.",
    },
    {
      title: "UX Research",
      date: "2022",
      desc: "Études utilisateurs et architecture d'information pour application mobile.",
    },
    {
      title: "Direction Artistique",
      date: "2023",
      desc: "Supervision créative et mise en place d'un univers visuel premium.",
    },
    {
      title: "Motion Concept",
      date: "2024",
      desc: "Concept motion design pour lancement de produit digital.",
    },
  ];

  // ── Parallax state ────────────────────────────────────────────────────────
  // Chaque carte a un offset courant (lerp-é) et un offset cible (calculé depuis scroll)
  let cardData = [];

  // scroll Y courant, mis à jour par scrollEngine
  let currentScrollY = 0;
  let rafId = null;
  let sectionVisible = false;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const clamp  = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  const round2 = (v) => Math.round(v * 100) / 100;
  // lerp standard
  const lerp   = (a, b, t) => a + (b - a) * t;

  // ── Mesures DOM (batch read) ───────────────────────────────────────────────
  function measure() {
    if (!gallerySection) return;
    const scrollY = window.scrollY;

    const sr = gallerySection.getBoundingClientRect();
    sectionMetrics = { top: sr.top + scrollY, height: sr.height };

    if (headerEl) {
      const hr = headerEl.getBoundingClientRect();
      headerMetrics = { top: hr.top + scrollY, height: hr.height };
    }

    const cards = [...gallerySection.querySelectorAll(".card")];
    cardData = cards.map((card) => {
      const r = card.getBoundingClientRect();
      return {
        top:       r.top + scrollY,
        height:    r.height,
        wrapper:   card.querySelector(".card-image-wrapper"),
        info:      card.querySelector(".info"),
        img:       card.querySelector("img"),
        // lerp state
        curOffset:         0,
        tgtOffset:         0,
        // mobile active state (lerp-é aussi)
        curOpacity:        0,
        curTranslate:     -10,
        lastActive:        null,
      };
    });
  }

  // ── Callback scrollEngine : stocke le scrollY, c'est tout ─────────────────
  function updateParallax(scrollY) {
    currentScrollY = scrollY;
  }

  // ── rAF loop : calcul des cibles + lerp + writes ───────────────────────────
  function tick() {
    if (!sectionVisible) { rafId = null; return; }

    const scrollY = currentScrollY;
    const winH    = window.innerHeight;

    // Amplitudes
    // Desktop : −155 (bien visible), Mobile : −75 (visible sans jank)
    const speed       = isMobile ? -75 : -155;
    // Facteur lerp : mobile plus doux pour absorber le scroll iOS inertiel
    const lerpFactor  = isMobile ? 0.10 : 0.16;

    // Culling section
    if (sectionMetrics) {
      const secTopVP  = sectionMetrics.top - scrollY;
      const secBotVP  = secTopVP + sectionMetrics.height;
      if (secBotVP < -600 || secTopVP > winH + 600) {
        rafId = requestAnimationFrame(tick);
        return;
      }
    }

    // ── BATCH READ ─────────────────────────────────────────────────────────
    const targets = cardData.map((c) => {
      const center   = c.top - scrollY + c.height / 2;
      const progress = clamp((center - winH / 2) / winH, -1, 1);
      const tgt      = round2(progress * speed);

      let tgtActive = false;
      if (isMobile) {
        const dist = Math.abs(center - winH / 2);
        tgtActive  = dist < c.height * 0.42;
      }
      return { tgt, tgtActive };
    });

    // Header target
    let headerProg = 0;
    if (headerMetrics) {
      const hTop = headerMetrics.top - scrollY;
      headerProg = clamp(1 - hTop / winH, 0, 1);
    }

    // ── LERP + BATCH WRITE ─────────────────────────────────────────────────
    cardData.forEach((c, i) => {
      const { tgt, tgtActive } = targets[i];
      c.tgtOffset = tgt;
      c.curOffset = lerp(c.curOffset, c.tgtOffset, lerpFactor);

      if (c.wrapper) {
        c.wrapper.style.transform = `translate3d(0,${round2(c.curOffset)}px,0)`;
      }

      if (isMobile && c.info && c.img) {
        // Lerp opacity et translate pour l'activation mobile
        const tgtOp = tgtActive ? 1 : 0;
        const tgtTr = tgtActive ? 0 : -10;
        c.curOpacity   = lerp(c.curOpacity,   tgtOp, 0.12);
        c.curTranslate = lerp(c.curTranslate,  tgtTr, 0.12);

        c.info.style.opacity   = round2(c.curOpacity).toString();
        c.info.style.transform = `translate3d(0,${round2(c.curTranslate)}px,0)`;
        c.img.style.filter     = c.curOpacity > 0.5 ? "brightness(0.6)" : "";
        c.img.style.transform  = c.curOpacity > 0.5
          ? "scale(1.05) translateZ(0)"
          : "translateZ(0)";
      }
    });

    if (headerEl && lineEl && headerMetrics) {
      headerEl.style.opacity   = round2(headerProg).toString();
      headerEl.style.transform = `translate3d(0,${round2(40 - headerProg * 40)}px,0)`;
      lineEl.style.transform   = `scaleX(${round2(headerProg)})`;
    }

    rafId = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (!rafId) rafId = requestAnimationFrame(tick);
  }
  function stopLoop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  // ── Resize (debounce 120ms) ────────────────────────────────────────────────
  let resizeTimeout;
  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      isMobile = window.innerWidth <= 900;
      measure();
    }, 120);
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  let resizeObserver;
  let intersectionObserver;

  onMount(() => {
    isMobile = window.innerWidth <= 900;

    requestAnimationFrame(() => {
      measure();
      startLoop();
    });

    registerParallax(updateParallax);

    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(gallerySection);

    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        sectionVisible = entry.isIntersecting;
        if (sectionVisible) startLoop();
        else stopLoop();
      },
      { rootMargin: "300px 0px 300px 0px" }
    );
    intersectionObserver.observe(gallerySection);
  });

  onDestroy(() => {
    stopLoop();
    unregisterParallax(updateParallax);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    clearTimeout(resizeTimeout);
  });

  // ── Off-canvas ────────────────────────────────────────────────────────────
  function openProject(item) {
    selected = item;
    document.body.style.overflow = "hidden";
  }
  function closeProject() {
    selected = null;
    document.body.style.overflow = "";
  }
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
    {#each items as item, i}
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

        <!-- Numéro éditorial -->
        <span class="card-index" aria-hidden="true">
          {String(i + 1).padStart(2, "0")}
        </span>

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

<ProjectOffCanvas {selected} {items} on:close={closeProject} />

<style>
  /* ─── Section ──────────────────────────────────────────────────────────── */
  .gallery {
    position: relative;
    width: 100vw;
    left: 50%;
    transform: translateX(-50%);
    background: #111;
    padding: 10rem 0;
    overflow: clip;
  }

  /* ─── Header ───────────────────────────────────────────────────────────── */
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

  /* ─── Grid ─────────────────────────────────────────────────────────────── */
  .gallery-grid {
    width: min(1500px, 92%);
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }

  /* ─── Card ─────────────────────────────────────────────────────────────── */
  .card {
    aspect-ratio: 1 / 1;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    will-change: transform;
    contain: layout paint;
    background: #161616;
  }

  /* ─── Image wrapper ─────────────────────────────────────────────────────── */
  .card-image-wrapper {
    /* Overscan : 124% desktop, réduit en media query pour mobile */
    height: 124%;
    top: -12%;
    position: absolute;
    inset-inline: 0;
    will-change: transform;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
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

  /* ─── Info overlay ──────────────────────────────────────────────────────── */
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

  .date { opacity: 0.7; }

  .title {
    font-family: "Manrope", sans-serif;
  }

  /* ─── Index numéro ──────────────────────────────────────────────────────── */
  .card-index {
    position: absolute;
    top: 16px;
    right: 16px;
    font-family: "Manrope", sans-serif;
    font-size: 0.65rem;
    letter-spacing: 0.18em;
    color: rgba(255, 255, 255, 0.3);
    z-index: 2;
    pointer-events: none;
    transition: color 0.4s ease;
  }

  .card:hover .card-index {
    color: rgba(255, 255, 255, 0.6);
  }

  /* ─── Card plus ─────────────────────────────────────────────────────────── */
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

  /* ─── Footer ────────────────────────────────────────────────────────────── */
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

  /* ════════════════════
     RESPONSIVE
  ════════════════════ */

  @media (max-width: 900px) {
    .gallery { padding: 8rem 0; }

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
    .line { width: 96px; margin-bottom: 1.5rem; }

    .gallery-grid {
      width: min(94%, 760px);
      grid-template-columns: 1fr;
      gap: 0.9rem;
    }

    .card { aspect-ratio: 1 / 1.08; }

    /* Overscan réduit mobile : moins de GPU pressure */
    .card-image-wrapper {
      height: 116%;
      top: -8%;
    }

    /* Hover désactivé sur touch */
    .card:hover img       { filter: none; transform: translateZ(0); }
    .card:hover .info     { opacity: 0; transform: translate3d(0, -10px, 0); }
    .card:hover .card-plus {
      transform: none;
      background: rgba(255, 255, 255, 0.15);
    }

    .gallery-footer { margin-top: 4rem; }
  }

  @media (max-width: 640px) {
    .gallery { padding: 6.5rem 0; }

    .gallery-header {
      width: min(92%, 560px);
      margin-bottom: 3rem;
    }
    .gallery-header h2 {
      font-size: clamp(1.8rem, 8vw, 2.6rem);
      letter-spacing: 0.08em;
      margin-bottom: 1rem;
    }
    .gallery-header p { font-size: 0.9rem; line-height: 1.55; }
    .line { width: 82px; margin-bottom: 1.2rem; }

    .gallery-grid { width: min(94%, 560px); gap: 0.75rem; }
    .card { aspect-ratio: 1 / 1.12; }
    .card-image-wrapper { height: 114%; top: -7%; }

    .info { top: 14px; left: 14px; padding: 9px 12px; font-size: 0.74rem; }
    .card-plus { bottom: 14px; left: 14px; width: 38px; height: 38px; font-size: 1rem; }
    .card-index { top: 14px; right: 14px; }

    .services-btn { padding: 12px 24px; font-size: 0.72rem; letter-spacing: 0.14em; }
  }

  @media (max-width: 420px) {
    .gallery { padding: 5.5rem 0; }

    .gallery-header {
      width: min(94%, 420px);
      margin-bottom: 2.4rem;
    }
    .gallery-header h2 {
      font-size: clamp(1.55rem, 8vw, 2.15rem);
      letter-spacing: 0.06em;
    }
    .gallery-header p { font-size: 0.86rem; line-height: 1.5; }
    .line { width: 70px; margin-bottom: 1rem; }

    .gallery-grid { width: min(94%, 420px); gap: 0.65rem; }
    .card { aspect-ratio: 1 / 1.16; }
    .card-image-wrapper { height: 112%; top: -6%; }

    .info { top: 12px; left: 12px; padding: 8px 11px; font-size: 0.7rem; }
    .card-plus { bottom: 12px; left: 12px; width: 34px; height: 34px; font-size: 0.95rem; }
    .card-index { top: 12px; right: 12px; }

    .gallery-footer { margin-top: 3rem; }
    .services-btn { padding: 11px 20px; font-size: 0.68rem; letter-spacing: 0.12em; }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .card img,
    .info,
    .card-plus { transition: none; }
    .gallery-header { opacity: 1 !important; transform: none !important; }
    .line { transform: scaleX(1) !important; }
  }
</style>