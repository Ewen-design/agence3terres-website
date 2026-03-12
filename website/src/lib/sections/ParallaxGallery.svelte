<script>
  // ─────────────────────────────────────────────────────────────────────────
  //  GallerySection.svelte — Version Premium
  //
  //  Optimisations clés :
  //  • Parallaxe avec lerp (damping) pour fluidité native 60/120fps
  //  • rAF propre découplé du scroll event (pas de layout thrashing)
  //  • Mobile : amplitude réduite + désactivation complète si prefers-reduced-motion
  //  • Mesures DOM une seule fois au mount + ResizeObserver (pas de resize brutal)
  //  • will-change ciblé uniquement pendant l'animation active
  //  • Batch reads DOM / batch writes DOM séparés strictement
  //  • IntersectionObserver pour activer/désactiver le rAF loop hors écran
  // ─────────────────────────────────────────────────────────────────────────

  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";
  import ProjectOffCanvas from "./ProjectOffCanvas.svelte";

  // ── Data ──────────────────────────────────────────────────────────────────
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

  // ── State ─────────────────────────────────────────────────────────────────
  let selected = null;
  let gallerySection;
  let headerEl;
  let lineEl;

  // ── Parallax engine state ──────────────────────────────────────────────────
  // On stocke les données de chaque carte dans un tableau d'objets légers
  // pour éviter les re-queries DOM dans la boucle de rendu.
  let cardData = []; // { top, height, wrapper, info, img, curOffset, tgtOffset, active }

  let sectionTop    = 0;
  let sectionHeight = 0;
  let headerTop     = 0;
  let headerHeight  = 0;

  let isMobile       = false;
  let reducedMotion  = false;
  let sectionVisible = false; // géré par IntersectionObserver

  // Lerp damping — plus élevé = plus réactif, moins élevé = plus doux
  // Mobile : 0.10–0.12 pour masquer le jank du scroll iOS
  // Desktop : 0.14–0.16 pour une réponse vive mais fluide
  const LERP_DESKTOP = 0.14;
  const LERP_MOBILE  = 0.10;

  // Amplitude parallaxe (px) : réduite sur mobile pour éviter l'effet "flottant"
  const SPEED_DESKTOP = -130;
  const SPEED_MOBILE  =  -50;

  // rAF handle
  let rafId = null;
  // Scroll Y courant (mis à jour dans le callback du scrollEngine)
  let currentScrollY = 0;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const clamp   = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  const lerp    = (a, b, t)   => a + (b - a) * t;
  const round2  = (v)         => Math.round(v * 100) / 100;

  // ── Mesures DOM (batch read — jamais de write ici) ────────────────────────
  function measure() {
    if (!gallerySection) return;

    const scrollY = window.scrollY;

    // Section
    const sr = gallerySection.getBoundingClientRect();
    sectionTop    = sr.top  + scrollY;
    sectionHeight = sr.height;

    // Header
    if (headerEl) {
      const hr  = headerEl.getBoundingClientRect();
      headerTop    = hr.top  + scrollY;
      headerHeight = hr.height;
    }

    // Cards — batch read strict
    const cards = gallerySection.querySelectorAll(".card");
    cardData = Array.from(cards).map((card) => {
      const r = card.getBoundingClientRect();
      return {
        top:       r.top + scrollY,
        height:    r.height,
        wrapper:   card.querySelector(".card-image-wrapper"),
        info:      card.querySelector(".info"),
        img:       card.querySelector("img"),
        curOffset: 0,
        tgtOffset: 0,
        active:    false,
        curActiveTranslate: -10,
        tgtActiveTranslate: -10,
        curActiveOpacity:   0,
        tgtActiveOpacity:   0,
      };
    });

    // Activer will-change uniquement pendant l'utilisation
    cardData.forEach((c) => {
      if (c.wrapper) c.wrapper.style.willChange = "transform";
    });
  }

  // ── Callback scroll (appelé par scrollEngine — pas de writes DOM ici) ────
  function updateParallax(scrollY) {
    currentScrollY = scrollY;
    // Le rAF loop s'occupe des writes
  }

  // ── rAF loop : lerp + writes DOM ──────────────────────────────────────────
  function tick() {
    if (!sectionVisible || reducedMotion) {
      rafId = null;
      return;
    }

    const scrollY = currentScrollY;
    const winH    = window.innerHeight;
    const speed   = isMobile ? SPEED_MOBILE : SPEED_DESKTOP;
    const lerpFactor = isMobile ? LERP_MOBILE : LERP_DESKTOP;

    // Culling grossier : section hors écran → skip + désactiver will-change
    const secBottom = sectionTop - scrollY + sectionHeight;
    const secTopVP  = sectionTop - scrollY;
    if (secBottom < -600 || secTopVP > winH + 600) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    // ── BATCH READ (valeurs logiques, pas de layout trigger) ────────────────
    const targets = cardData.map((c) => {
      const center   = c.top - scrollY + c.height / 2;
      const progress = clamp((center - winH / 2) / winH, -1, 1);
      const tgtOffset = round2(progress * speed);

      // Mobile : activation de l'info overlay basée sur la proximité du centre
      let tgtActive = false;
      if (isMobile) {
        const dist      = Math.abs(center - winH / 2);
        const threshold = c.height * 0.4;
        tgtActive = dist < threshold;
      }

      return { tgtOffset, tgtActive };
    });

    // Header
    const headerTopInView = headerTop - scrollY;
    const headerProg      = clamp(1 - headerTopInView / winH, 0, 1);

    // ── LERP state ──────────────────────────────────────────────────────────
    let needsAnotherFrame = false;

    cardData.forEach((c, i) => {
      const { tgtOffset, tgtActive } = targets[i];
      c.tgtOffset = tgtOffset;

      const newOffset = lerp(c.curOffset, c.tgtOffset, lerpFactor);
      if (Math.abs(newOffset - c.tgtOffset) > 0.05) needsAnotherFrame = true;

      c.curOffset = newOffset;

      // Mobile active state (lerp opacity/translate)
      if (isMobile) {
        const tgtOp = tgtActive ? 1 : 0;
        const tgtTr = tgtActive ? 0 : -10;
        c.curActiveOpacity   = lerp(c.curActiveOpacity,   tgtOp, 0.12);
        c.curActiveTranslate = lerp(c.curActiveTranslate, tgtTr, 0.12);
        if (Math.abs(c.curActiveOpacity - tgtOp) > 0.005) needsAnotherFrame = true;
      }
    });

    // ── BATCH WRITE ─────────────────────────────────────────────────────────
    cardData.forEach((c) => {
      if (c.wrapper) {
        c.wrapper.style.transform = `translate3d(0,${round2(c.curOffset)}px,0)`;
      }

      if (isMobile && c.info && c.img) {
        c.info.style.opacity   = round2(c.curActiveOpacity).toString();
        c.info.style.transform = `translate3d(0,${round2(c.curActiveTranslate)}px,0)`;
        c.img.style.filter     = c.curActiveOpacity > 0.5 ? "brightness(0.6)" : "";
        c.img.style.transform  = c.curActiveOpacity > 0.5 ? "scale(1.05)" : "";
      }
    });

    // Header
    if (headerEl && lineEl) {
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

  // ── Resize (ResizeObserver — pas d'écouteur window bruyant) ───────────────
  let resizeObserver;
  let resizeTimeout;

  function onResize() {
    // Debounce 120ms pour éviter les mesures en cascade
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      isMobile = window.innerWidth <= 900;
      measure();
    }, 120);
  }

  // ── Intersection observer — pause rAF hors champ ──────────────────────────
  let intersectionObserver;

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  onMount(() => {
    // Détection reduced motion
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    isMobile = window.innerWidth <= 900;

    // Mesure initiale après le premier paint
    requestAnimationFrame(() => {
      measure();
      startLoop();
    });

    // scrollEngine
    registerParallax(updateParallax);

    // ResizeObserver sur la section (plus précis que window.resize)
    resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(gallerySection);

    // IntersectionObserver : start/stop rAF selon visibilité
    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        sectionVisible = entry.isIntersecting;
        if (sectionVisible) startLoop();
        else stopLoop();
      },
      { rootMargin: "200px 0px 200px 0px" }
    );
    intersectionObserver.observe(gallerySection);
  });

  onDestroy(() => {
    stopLoop();
    unregisterParallax(updateParallax);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    clearTimeout(resizeTimeout);
    // Nettoyer will-change
    cardData.forEach((c) => {
      if (c.wrapper) c.wrapper.style.willChange = "auto";
    });
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

<!-- ════════════════════════════════════════════════════════════════════════
     TEMPLATE
═════════════════════════════════════════════════════════════════════════ -->
<section class="gallery" bind:this={gallerySection}>

  <!-- Header -->
  <header class="gallery-header" bind:this={headerEl} aria-label="Nos services">
    <p class="gallery-eyebrow">Studio</p>
    <h2>Nos&thinsp;services</h2>
    <div class="line" bind:this={lineEl} aria-hidden="true"></div>
    <p class="gallery-lead">
      Une approche stratégique et sensorielle pour construire des identités fortes,
      des expériences digitales immersives et des univers visuels mémorables.
    </p>
  </header>

  <!-- Grid -->
  <div class="gallery-grid" role="list">
    {#each items as item, i}
      <article
        class="card"
        role="listitem"
        tabindex="0"
        aria-label="Voir le projet : {item.title}"
        data-cursor="view"
        on:click={() => openProject(item)}
        on:keydown={(e) => e.key === "Enter" && openProject(item)}
      >
        <!-- Numéro éditorial -->
        <span class="card-index" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>

        <!-- Image avec parallaxe -->
        <div class="card-image-wrapper" aria-hidden="true">
          <img
            src="/images/photo2.webp"
            alt=""
            loading={i < 3 ? "eager" : "lazy"}
            decoding="async"
            draggable="false"
          />
        </div>

        <!-- Overlay info -->
        <div class="info" aria-hidden="true">
          <span class="date">{item.date}</span>
          <span class="title">{item.title}</span>
        </div>

        <!-- CTA -->
        <div class="card-plus" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="8" y1="0" x2="8" y2="16" stroke="currentColor" stroke-width="1.2"/>
            <line x1="0" y1="8" x2="16" y2="8" stroke="currentColor" stroke-width="1.2"/>
          </svg>
        </div>

        <!-- Barre de progression hover (détail premium) -->
        <div class="card-hover-line" aria-hidden="true"></div>
      </article>
    {/each}
  </div>

  <!-- Footer -->
  <footer class="gallery-footer">
    <a href="/services" class="services-btn">
      <span>Découvrir tous les services</span>
      <svg class="btn-arrow" width="20" height="10" viewBox="0 0 20 10" fill="none" aria-hidden="true">
        <path d="M0 5H18M14 1L18 5L14 9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
    </a>
  </footer>

</section>

<ProjectOffCanvas {selected} {items} on:close={closeProject} />

<!-- ════════════════════════════════════════════════════════════════════════
     STYLES
═════════════════════════════════════════════════════════════════════════ -->
<style>
  /* ── Tokens ────────────────────────────────────────────────────────────── */
  :root {
    --clr-bg:        #0c0c0c;
    --clr-surface:   #141414;
    --clr-border:    rgba(255,255,255,0.07);
    --clr-text:      #f0ece4;
    --clr-muted:     rgba(240,236,228,0.45);
    --clr-accent:    #c8b89a;    /* beige chaud, ton premium */

    --font-display:  "Aboreto", serif;
    --font-body:     "Manrope", sans-serif;

    --ease-out:      cubic-bezier(0.16, 1, 0.3, 1);
    --ease-inout:    cubic-bezier(0.65, 0, 0.35, 1);
  }

  /* ── Section ───────────────────────────────────────────────────────────── */
  .gallery {
    position: relative;
    width: 100vw;
    left: 50%;
    transform: translateX(-50%);
    background: var(--clr-bg);
    padding: 10rem 0 12rem;
    overflow: clip;
    /* Texture subtile */
    background-image:
      radial-gradient(ellipse 80% 50% at 50% -10%, rgba(200,184,154,0.04) 0%, transparent 60%);
  }

  /* ── Header ────────────────────────────────────────────────────────────── */
  .gallery-header {
    width: min(860px, 88%);
    margin: 0 auto 7rem;
    text-align: center;
    color: var(--clr-text);
    opacity: 0;
    transform: translate3d(0, 40px, 0);
    will-change: transform, opacity;
  }

  .gallery-eyebrow {
    font-family: var(--font-body);
    font-size: 0.7rem;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--clr-accent);
    margin-bottom: 1.4rem;
  }

  .gallery-header h2 {
    font-family: var(--font-display);
    font-size: clamp(2.4rem, 4vw, 4.2rem);
    letter-spacing: 0.18em;
    font-weight: 400;
    margin-bottom: 0;
    line-height: 1.1;
    color: var(--clr-text);
  }

  .line {
    width: 1px;
    height: 52px;
    background: linear-gradient(to bottom, var(--clr-accent), transparent);
    margin: 2rem auto;
    transform: scaleY(0);
    transform-origin: top center;
    will-change: transform;
  }

  .gallery-lead {
    font-family: var(--font-body);
    font-size: clamp(0.88rem, 1.1vw, 1rem);
    color: var(--clr-muted);
    line-height: 1.75;
    max-width: 560px;
    margin: 0 auto;
  }

  /* ── Grid ──────────────────────────────────────────────────────────────── */
  .gallery-grid {
    width: min(1480px, 92%);
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: clamp(10px, 1.2vw, 18px);
  }

  /* ── Card ──────────────────────────────────────────────────────────────── */
  .card {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    background: var(--clr-surface);
    aspect-ratio: 3 / 4;
    /* contain: layout paint style;  ← retiré : bloque les stacking contexts */
    outline: none;
    border: 1px solid var(--clr-border);
    transition: border-color 0.6s var(--ease-out);
  }

  .card:hover,
  .card:focus-visible {
    border-color: rgba(200,184,154,0.25);
  }

  .card:focus-visible {
    outline: 2px solid var(--clr-accent);
    outline-offset: 3px;
  }

  /* ── Card index ────────────────────────────────────────────────────────── */
  .card-index {
    position: absolute;
    top: 18px;
    right: 18px;
    font-family: var(--font-body);
    font-size: 0.65rem;
    letter-spacing: 0.15em;
    color: rgba(255,255,255,0.25);
    z-index: 3;
    transition: color 0.4s ease;
    pointer-events: none;
  }

  .card:hover .card-index {
    color: rgba(255,255,255,0.5);
  }

  /* ── Image wrapper (parallaxe) ─────────────────────────────────────────── */
  .card-image-wrapper {
    position: absolute;
    inset: 0;
    /* Overscan : plus haut que la carte pour permettre le parallaxe */
    /* Desktop : 124%, Mobile : 114% (géré en media query) */
    height: 124%;
    top: -12%;
    transform: translate3d(0, 0, 0);
    /* will-change activé/désactivé dynamiquement par JS */
  }

  .card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    pointer-events: none;
    user-select: none;
    /* transition uniquement pour hover — pas pour le parallaxe */
    transition: filter 0.5s var(--ease-out), transform 0.8s var(--ease-out);
    transform: translateZ(0);
  }

  .card:hover img {
    filter: brightness(0.55);
    transform: scale(1.04) translateZ(0);
  }

  /* ── Info overlay ──────────────────────────────────────────────────────── */
  .info {
    position: absolute;
    top: 18px;
    left: 18px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 10px 14px;
    background: rgba(12, 12, 12, 0.6);
    backdrop-filter: blur(12px) saturate(1.4);
    -webkit-backdrop-filter: blur(12px) saturate(1.4);
    border: 1px solid rgba(255,255,255,0.08);
    color: var(--clr-text);
    font-size: 0.75rem;
    opacity: 0;
    transform: translate3d(0, -8px, 0);
    transition: opacity 0.45s var(--ease-out), transform 0.45s var(--ease-out);
    z-index: 2;
    pointer-events: none;
  }

  .card:hover .info {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  .date {
    font-family: var(--font-body);
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    color: var(--clr-accent);
  }

  .title {
    font-family: var(--font-body);
    font-weight: 500;
    letter-spacing: 0.03em;
  }

  /* ── Card plus ─────────────────────────────────────────────────────────── */
  .card-plus {
    position: absolute;
    bottom: 18px;
    right: 18px;
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    color: var(--clr-text);
    background: rgba(12, 12, 12, 0.55);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 50%;
    z-index: 2;
    transition:
      transform 0.45s var(--ease-out),
      background 0.45s ease,
      border-color 0.45s ease;
    pointer-events: none;
  }

  .card:hover .card-plus {
    transform: scale(1.12) rotate(90deg);
    background: rgba(200,184,154,0.2);
    border-color: rgba(200,184,154,0.35);
  }

  /* ── Hover line (détail premium) ───────────────────────────────────────── */
  .card-hover-line {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--clr-accent), transparent);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.55s var(--ease-out);
    pointer-events: none;
  }

  .card:hover .card-hover-line {
    transform: scaleX(1);
  }

  /* ── Footer ────────────────────────────────────────────────────────────── */
  .gallery-footer {
    text-align: center;
    margin-top: 7rem;
  }

  .services-btn {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    padding: 15px 40px;
    border: 1px solid rgba(200,184,154,0.35);
    color: var(--clr-text);
    text-decoration: none;
    font-family: var(--font-body);
    font-size: 0.72rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    transition:
      background 0.45s var(--ease-out),
      color 0.45s var(--ease-out),
      border-color 0.45s var(--ease-out),
      gap 0.45s var(--ease-out);
  }

  .services-btn:hover {
    background: var(--clr-accent);
    color: var(--clr-bg);
    border-color: var(--clr-accent);
    gap: 20px;
  }

  .btn-arrow {
    flex-shrink: 0;
    transition: transform 0.4s var(--ease-out);
  }

  .services-btn:hover .btn-arrow {
    transform: translateX(4px);
  }

  /* ════════════════════════════════
     RESPONSIVE
  ════════════════════════════════ */

  /* ── Tablet / petits desktop ─────────────────────────────────────────── */
  @media (max-width: 900px) {
    .gallery {
      padding: 8rem 0 9rem;
    }

    .gallery-header {
      width: min(92%, 640px);
      margin-bottom: 4.5rem;
    }

    .gallery-grid {
      width: min(94%, 640px);
      /* Colonne unique sur mobile */
      grid-template-columns: 1fr;
      gap: clamp(8px, 2vw, 14px);
    }

    .card {
      aspect-ratio: 4 / 3;
    }

    /*
      Parallaxe mobile : amplitude réduite → overscan réduit
      Moins d'overscan = moins de layout shift et GPU pressure
    */
    .card-image-wrapper {
      height: 115%;
      top: -7.5%;
    }

    /*
      Sur mobile, les hover CSS sont désactivés (touch).
      L'activation est gérée par JS (IntersectionObserver-like via scroll).
    */
    .card:hover img {
      filter: none;
      transform: translateZ(0);
    }

    .card:hover .info {
      opacity: 0;
      transform: translate3d(0, -8px, 0);
    }

    .card:hover .card-plus {
      transform: none;
      background: rgba(12, 12, 12, 0.55);
      border-color: rgba(255,255,255,0.1);
    }

    .card:hover .card-hover-line {
      transform: scaleX(0);
    }
  }

  /* ── Mobile ──────────────────────────────────────────────────────────── */
  @media (max-width: 640px) {
    .gallery {
      padding: 6rem 0 7rem;
    }

    .gallery-header {
      width: min(92%, 480px);
      margin-bottom: 3.5rem;
    }

    .gallery-header h2 {
      letter-spacing: 0.1em;
    }

    .gallery-grid {
      width: min(94%, 480px);
    }

    .card {
      aspect-ratio: 3 / 3.5;
    }

    .card-image-wrapper {
      height: 112%;
      top: -6%;
    }

    .gallery-footer {
      margin-top: 4.5rem;
    }
  }

  /* ── Petit mobile ────────────────────────────────────────────────────── */
  @media (max-width: 420px) {
    .gallery {
      padding: 5rem 0 6rem;
    }

    .gallery-header {
      margin-bottom: 2.8rem;
    }

    .card {
      aspect-ratio: 3 / 3.8;
    }

    .card-image-wrapper {
      height: 110%;
      top: -5%;
    }
  }

  /* ── Reduced motion ──────────────────────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .card img,
    .info,
    .card-plus,
    .card-hover-line,
    .services-btn,
    .btn-arrow {
      transition: none;
    }

    .gallery-header,
    .line {
      opacity: 1 !important;
      transform: none !important;
    }
  }
</style>