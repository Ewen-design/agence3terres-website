<script>
  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";

  let sectionEl;
  let headerEl;
  let lineEl;
  let buttonEl;
  let isMobile = false;

  const projects = [
    {
      title: "Maison Élément",
      category: "Brand Identity",
      year: "2024",
      desc: "Création d'une identité complète pour une marque premium mêlant matière brute et minimalisme contemporain.",
      img: "/images/parfum.jpg",
    },
    {
      title: "Horizon Digital",
      category: "Expérience Web",
      year: "2023",
      desc: "Conception d'une expérience immersive avec narration visuelle, transitions fluides et direction artistique forte.",
      img: "/images/parfum.jpg",
    },
  ];

  // ── Parallax state ─────────────────────────────────────────────────────────
  let cardData = [];     // { top, height, wrapper, overlay, img, curOffset, tgtOffset, curOp, curTr }
  let sectionTop    = 0;
  let sectionHeight = 0;
  let headerTop     = 0;

  let currentScrollY = 0;
  let rafId          = null;
  let sectionVisible = false;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const clamp  = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  const lerp   = (a, b, t)   => a + (b - a) * t;
  const round2 = (v)         => Math.round(v * 100) / 100;

  // ── Mesures DOM ────────────────────────────────────────────────────────────
  function measure() {
    if (!sectionEl) return;
    const scrollY = window.scrollY;

    const sr = sectionEl.getBoundingClientRect();
    sectionTop    = sr.top + scrollY;
    sectionHeight = sr.height;

    if (headerEl) {
      headerTop = headerEl.getBoundingClientRect().top + scrollY;
    }

    const cards = [...sectionEl.querySelectorAll(".card")];
    cardData = cards.map((card) => {
      const r = card.getBoundingClientRect();
      return {
        top:       r.top + scrollY,
        height:    r.height,
        wrapper:   card.querySelector(".card-image-wrapper"),
        overlay:   card.querySelector(".overlay"),
        img:       card.querySelector("img"),
        curOffset: 0,
        tgtOffset: 0,
        curOp:     0,
        curTr:     20,
      };
    });
  }

  // ── Callback scrollEngine ──────────────────────────────────────────────────
  function updateParallax(scrollY) {
    currentScrollY = scrollY;
  }

  // ── rAF loop ───────────────────────────────────────────────────────────────
  function tick() {
    if (!sectionVisible) { rafId = null; return; }

    const scrollY    = currentScrollY;
    const winH       = window.innerHeight;
    const lerpFactor = isMobile ? 0.10 : 0.16;

    // Culling
    const secTopVP = sectionTop - scrollY;
    if (secTopVP > winH + 600 || secTopVP + sectionHeight < -600) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    // ── BATCH READ ──────────────────────────────────────────────────────────
    const targets = cardData.map((c) => {
      const center   = c.top - scrollY + c.height / 2;
      const progress = clamp((center - winH / 2) / winH, -1, 1);
      const tgt      = round2(progress * -155);

      let tgtOp = 0;
      let tgtTr = 20;
      if (isMobile) {
        const dist = Math.abs(center - winH / 2);
        if (dist < c.height / 2) { tgtOp = 1; tgtTr = 0; }
      }
      return { tgt, tgtOp, tgtTr };
    });

    // Header progress
    const headerTopVP = headerTop - scrollY;
    const headerProg  = clamp(1 - headerTopVP / winH, 0, 1);

    // ── LERP + BATCH WRITE ──────────────────────────────────────────────────
    cardData.forEach((c, i) => {
      const { tgt, tgtOp, tgtTr } = targets[i];
      c.curOffset = lerp(c.curOffset, tgt,   lerpFactor);

      if (c.wrapper) {
        c.wrapper.style.transform = `translate3d(0,${round2(c.curOffset)}px,0)`;
      }

      if (isMobile && c.overlay && c.img) {
        c.curOp = lerp(c.curOp, tgtOp, 0.12);
        c.curTr = lerp(c.curTr, tgtTr, 0.12);

        c.overlay.style.opacity   = round2(c.curOp).toString();
        c.overlay.style.transform = `translateY(${round2(c.curTr)}px)`;
        c.img.style.transform     = c.curOp > 0.5 ? "scale(1.08)" : "";
        c.img.style.filter        = c.curOp > 0.5 ? "brightness(0.6)" : "";
      }
    });

    if (headerEl && lineEl) {
      headerEl.style.opacity   = round2(headerProg).toString();
      headerEl.style.transform = `translateY(${round2(40 - headerProg * 40)}px)`;
      lineEl.style.transform   = `scaleX(${round2(headerProg)})`;
    }

    if (buttonEl) {
      buttonEl.style.opacity   = round2(headerProg).toString();
      buttonEl.style.transform = `translateY(${round2(30 - headerProg * 30)}px)`;
    }

    rafId = requestAnimationFrame(tick);
  }

  function startLoop() { if (!rafId) rafId = requestAnimationFrame(tick); }
  function stopLoop()  { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

  // ── Resize ─────────────────────────────────────────────────────────────────
  let resizeObserver;
  let resizeTimeout;

  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      isMobile = window.innerWidth <= 900;
      measure();
    }, 120);
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  let intersectionObserver;

  onMount(() => {
    isMobile = window.innerWidth <= 900;

    requestAnimationFrame(() => {
      measure();
      startLoop();
    });

    registerParallax(updateParallax);

    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(sectionEl);

    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        sectionVisible = entry.isIntersecting;
        if (sectionVisible) startLoop();
        else stopLoop();
      },
      { rootMargin: "300px 0px 300px 0px" }
    );
    intersectionObserver.observe(sectionEl);
  });

  onDestroy(() => {
    stopLoop();
    unregisterParallax(updateParallax);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    clearTimeout(resizeTimeout);
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

  <div class="projects-grid">
    {#each projects as project, i}
      <div class="card">
        <div class="card-image-wrapper">
          <img src={project.img} alt={project.title} loading="lazy" decoding="async" draggable="false" />
        </div>

        <!-- Numéro éditorial -->
        <span class="card-index" aria-hidden="true">
          {String(i + 1).padStart(2, "0")}
        </span>

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
    overflow: clip;
  }

  /* ── Header ────────────────────────────────────────────────────────────── */
  .projects-header {
    width: min(900px, 90%);
    margin: 0 auto 6rem auto;
    text-align: center;
    opacity: 0;
    transform: translateY(40px);
    will-change: transform, opacity;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
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
    will-change: transform;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  /* ── Grid ──────────────────────────────────────────────────────────────── */
  .projects-grid {
    width: min(1300px, 92%);
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  /* ── Card ──────────────────────────────────────────────────────────────── */
  .card {
    position: relative;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    cursor: pointer;
  }

  /* ── Image wrapper (parallaxe) ─────────────────────────────────────────── */
  .card-image-wrapper {
    position: absolute;
    inset: 0;
    height: 124%;
    top: -12%;
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
    pointer-events: none;
    user-select: none;
    transition: transform 1.2s ease, filter 0.6s ease;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .card:hover img {
    transform: scale(1.08);
    filter: brightness(0.6);
  }

  /* ── Overlay ───────────────────────────────────────────────────────────── */
  .overlay {
    position: absolute;
    inset: 0;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent 60%);
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s ease, transform 0.5s ease;
    pointer-events: none;
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

  /* ── Index numéro ──────────────────────────────────────────────────────── */
  .card-index {
    position: absolute;
    top: 18px;
    right: 18px;
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

  /* ── Footer ────────────────────────────────────────────────────────────── */
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
    will-change: transform, opacity;
    transition: background 0.4s ease, color 0.4s ease;
  }

  .all-btn:hover {
    background: white;
    color: #111;
  }

  /* ── Responsive ────────────────────────────────────────────────────────── */
  @media (max-width: 900px) {
    .projects-grid {
      grid-template-columns: 1fr;
    }

    .card-image-wrapper {
      height: 116%;
      top: -8%;
    }

    /* Désactiver hover sur touch */
    .card:hover img {
      transform: translateZ(0);
      filter: none;
    }

    .card:hover .overlay {
      opacity: 0;
      transform: translateY(20px);
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .card img,
    .overlay { transition: none; }
    .projects-header { opacity: 1 !important; transform: none !important; }
    .line { transform: scaleX(1) !important; }
    .all-btn { opacity: 1 !important; transform: none !important; }
  }
</style>