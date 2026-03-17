<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";

  export let navigate;
  export let darkPhase = false;

  const dispatch = createEventDispatcher();

  type Finish = {
    color: string;
    label: string;
  };

  type GalleryItem = {
    src: string;
    alt: string;
    className: string;
    width?: number;
    height?: number;
    loading?: "eager" | "lazy";
    fetchpriority?: "high" | "low" | "auto";
    year?: string;
    title?: string;
  };

  type GalleryColumn = {
    className: string;
    items: GalleryItem[];
  };

  const finishes: Finish[] = [
    { color: "#d9d8d5", label: "Ivoire doux" },
    { color: "#b8b7b3", label: "Gris minéral" },
    { color: "#6e6b67", label: "Graphite" },
    { color: "#2d2c2a", label: "Noir profond" },
    { color: "#b89c63", label: "Or satiné" },
    { color: "#e4d4ca", label: "Rose poudré" }
  ];

  let selectedFinish = 1;

  const galleryColumns: GalleryColumn[] = [
    {
      className: "edge-left",
      items: [
        {
          src: "images/parfum.jpg",
          alt: "Ring close-up",
          title: "Ring close-up",
          year: "2024",
          className: "left-top",
          width: 500,
          height: 720,
          loading: "eager",
          fetchpriority: "high"
        },
        {
          src: "images/photo.webp",
          alt: "Hands detail",
          title: "Hands detail",
          year: "2024",
          className: "left-bottom",
          width: 500,
          height: 640,
          loading: "lazy",
          fetchpriority: "low"
        }
      ]
    },
    {
      className: "portrait-left",
      items: [
        {
          src: "images/photo.webp",
          alt: "Smiling woman portrait",
          title: "Smiling woman",
          year: "2024",
          className: "single",
          width: 700,
          height: 1100,
          loading: "eager",
          fetchpriority: "high"
        }
      ]
    },
    {
      className: "portrait-center",
      items: [
        {
          src: "images/photo.webp",
          alt: "Athletic portrait",
          title: "Athletic portrait",
          year: "2024",
          className: "single",
          width: 700,
          height: 980,
          loading: "eager",
          fetchpriority: "high"
        }
      ]
    },
    {
      className: "hero-product",
      items: [
        {
          src: "images/photo.webp",
          alt: "Ring on mineral surface",
          title: "Ring on mineral",
          year: "2024",
          className: "single",
          width: 1000,
          height: 1200,
          loading: "eager",
          fetchpriority: "high"
        }
      ]
    },
    {
      className: "edge-right",
      items: [
        {
          src: "images/parfum.jpg",
          alt: "Ring detail",
          title: "Ring detail",
          year: "2024",
          className: "right-top",
          width: 500,
          height: 720,
          loading: "lazy",
          fetchpriority: "low"
        },
        {
          src: "images/photo.webp",
          alt: "Hands with rings",
          title: "Hands with rings",
          year: "2024",
          className: "right-bottom",
          width: 500,
          height: 720,
          loading: "lazy",
          fetchpriority: "low"
        }
      ]
    }
  ];

  function selectFinish(index: number) {
    selectedFinish = index;
  }

  const flatItems = galleryColumns.flatMap((column) => column.items);

  let lifestyleSection: HTMLElement;
  let galleryEl: HTMLElement;

  let isMobile = false;
  let sectionMetrics: { top: number; height: number } | null = null;

  let cardData: {
    top: number;
    height: number;
    wrapper: HTMLDivElement | null;
    info: HTMLDivElement | null;
    img: HTMLImageElement | null;
    curOffset: number;
    tgtOffset: number;
    curOpacity: number;
    curTranslate: number;
  }[] = [];

  let currentScrollY = 0;
  let rafId: number | null = null;
  let sectionVisible = false;
  let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let intersectionObserver: IntersectionObserver | null = null;

  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
  const round2 = (v: number) => Math.round(v * 100) / 100;
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  function measure() {
    if (!lifestyleSection || !galleryEl) return;

    const scrollY = window.scrollY;
    const sectionRect = lifestyleSection.getBoundingClientRect();

    sectionMetrics = {
      top: sectionRect.top + scrollY,
      height: sectionRect.height
    };

    const cards = [...galleryEl.querySelectorAll<HTMLElement>(".card")];

    cardData = cards.map((card) => {
      const rect = card.getBoundingClientRect();

      return {
        top: rect.top + scrollY,
        height: rect.height,
        wrapper: card.querySelector<HTMLDivElement>(".card-image-wrapper"),
        info: card.querySelector<HTMLDivElement>(".card-info"),
        img: card.querySelector<HTMLImageElement>("img"),
        curOffset: 0,
        tgtOffset: 0,
        curOpacity: 0,
        curTranslate: -10
      };
    });
  }

  function updateParallax(scrollY: number) {
    currentScrollY = scrollY;
  }

  function tick() {
    if (!sectionVisible) {
      rafId = null;
      return;
    }

    const scrollY = currentScrollY;
    const winH = window.innerHeight;
    const speed = isMobile ? -55 : -110;
    const lerpFactor = isMobile ? 0.1 : 0.14;

    if (sectionMetrics) {
      const secTopVP = sectionMetrics.top - scrollY;
      const secBotVP = secTopVP + sectionMetrics.height;

      if (secBotVP < -500 || secTopVP > winH + 500) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const darkTrigger = sectionMetrics.top + Math.min(120, sectionMetrics.height * -0.027);
      const nextDarkPhase = scrollY > darkTrigger;

      if (nextDarkPhase !== darkPhase) {
        darkPhase = nextDarkPhase;
        dispatch("darkchange", darkPhase);
      }
    }

    const targets = cardData.map((c) => {
      const center = c.top - scrollY + c.height / 2;
      const progress = clamp((center - winH / 2) / winH, -1, 1);
      const tgt = round2(progress * speed);

      let tgtActive = false;
      if (isMobile) {
        const dist = Math.abs(center - winH / 2);
        tgtActive = dist < c.height * 0.42;
      }

      return { tgt, tgtActive };
    });

    cardData.forEach((c, i) => {
      const { tgt, tgtActive } = targets[i];

      c.tgtOffset = tgt;
      c.curOffset = lerp(c.curOffset, c.tgtOffset, lerpFactor);

      if (c.wrapper) {
        c.wrapper.style.transform = `translate3d(0, ${round2(c.curOffset)}px, 0)`;
      }

      if (isMobile && c.info && c.img) {
        const tgtOp = tgtActive ? 1 : 0;
        const tgtTr = tgtActive ? 0 : -10;

        c.curOpacity = lerp(c.curOpacity, tgtOp, 0.12);
        c.curTranslate = lerp(c.curTranslate, tgtTr, 0.12);

        c.info.style.opacity = round2(c.curOpacity).toString();
        c.info.style.transform = `translate3d(0, ${round2(c.curTranslate)}px, 0)`;
        c.img.style.filter =
          c.curOpacity > 0.5
            ? "saturate(0.94) brightness(0.68) contrast(0.98)"
            : "saturate(0.94) brightness(1.01) contrast(0.98)";
        c.img.style.transform =
          c.curOpacity > 0.5 ? "scale(1.05) translateZ(0)" : "translateZ(0)";
      }
    });

    rafId = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function handleResize() {
    if (resizeTimeout) clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(() => {
      isMobile = window.innerWidth <= 780;
      measure();
    }, 120);
  }

  onMount(() => {
    isMobile = window.innerWidth <= 780;

    requestAnimationFrame(() => {
      measure();
      startLoop();
    });

    registerParallax(updateParallax);

    resizeObserver = new ResizeObserver(handleResize);
    if (lifestyleSection) resizeObserver.observe(lifestyleSection);

    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        sectionVisible = entry.isIntersecting;
        if (sectionVisible) startLoop();
        else stopLoop();
      },
      { rootMargin: "300px 0px 300px 0px" }
    );

    if (lifestyleSection) intersectionObserver.observe(lifestyleSection);
  });

  onDestroy(() => {
    stopLoop();
    unregisterParallax(updateParallax);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    if (resizeTimeout) clearTimeout(resizeTimeout);
  });
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Cormorant+Garamond:ital,wght@1,400&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<section
  class="lifestyle-section top-aligned"
  class:dark-phase={darkPhase}
  aria-labelledby="lifestyle-title"
  bind:this={lifestyleSection}
>
  <div class="gallery-wrap">
    <div class="gallery" aria-label="Galerie visuelle du projet" bind:this={galleryEl}>
      {#each galleryColumns as column (column.className)}
        <div class={`col ${column.className}`}>
          {#each column.items as item (item.alt)}
            <article
              class={`card ${item.className}`}
              style={`--card-index:"${String(flatItems.findIndex((entry) => entry.alt === item.alt) + 1).padStart(2, "0")}"`}
            >
              <div class="card-image-wrapper">
                <img
                  src={item.src}
                  alt={item.alt}
                  width={item.width}
                  height={item.height}
                  loading={item.loading ?? "lazy"}
                  decoding="async"
                  fetchpriority={item.fetchpriority ?? "auto"}
                  draggable="false"
                />
              </div>

              <div class="card-info">
                <span class="card-date">{item.year ?? "2024"}</span>
                <span class="card-title">{item.title ?? item.alt}</span>
              </div>

              <span class="card-index" aria-hidden="true">
                {String(flatItems.findIndex((entry) => entry.alt === item.alt) + 1).padStart(2, "0")}
              </span>
            </article>
          {/each}
        </div>
      {/each}
    </div>
  </div>

  <div class="canvas-shell">
    <div class="top text-part">
      <h2 id="lifestyle-title" class="heading">
        <span class="title-main">Un projet de</span>
        <span class="title-accent">Serein Design</span>
      </h2>

      <div class="controls">
        <div class="select-copy" aria-label="Collection sélectionnée">
          <span class="select-title">Horizon</span>
          <span class="select-subtitle">Sleek, sophisticated design</span>
        </div>

        <div class="finish-card" aria-label="Choix de couleur">
          {#each finishes as finish, index (finish.color)}
            <button
              type="button"
              class="swatch"
              class:active={selectedFinish === index}
              style={`--swatch:${finish.color}`}
              aria-label={`Choisir la finition ${finish.label}`}
              aria-pressed={selectedFinish === index}
              on:click={() => selectFinish(index)}
            />
          {/each}
        </div>
      </div>

      <button
        type="button"
        class="project-button"
        on:click={() => navigate("projet2")}
      >
        Voir le projet
      </button>
    </div>
  </div>
</section>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(html, body) {
    margin: 0;
  }

  .lifestyle-section {
    --bg: #f3efea;
    --text: #4e4741;
    --muted: #8d857d;
    --card: transparent;
    --line: rgba(96, 86, 78, 0.08);
    --line-soft: rgba(96, 86, 78, 0.06);
    --panel-bg: rgba(255, 255, 255, 0.82);
    --panel-text: rgba(76, 69, 63, 0.95);
    --panel-muted: #8d857d;
    --panel-border: rgba(96, 86, 78, 0.06);
    --shadow-ui: 0 1px 0 rgba(255, 255, 255, 0.72) inset,
      0 6px 18px rgba(93, 74, 49, 0.018);
    --shadow-card: 0 1px 0 rgba(255, 255, 255, 0.58) inset,
      0 10px 24px rgba(90, 72, 50, 0.018);

    position: relative;
    isolation: isolate;
    width: 100%;
    min-height: 100svh;
    padding-block: clamp(4.5rem, 9vw, 8.5rem);
    overflow: clip;
    background: var(--bg);
    font-family: "Inter", sans-serif;
    color: var(--text);
    contain: layout paint style;
    transition:
      background 520ms ease,
      color 520ms ease;
  }

  .lifestyle-section.dark-phase {
    --bg: #111;
    --text: #f5f5f5;
    --muted: rgba(255, 255, 255, 0.62);
    --panel-bg: rgba(0, 0, 0, 0.86);
    --panel-text: #f5f5f5;
    --panel-muted: rgba(255, 255, 255, 0.62);
    --panel-border: rgba(255, 255, 255, 0.1);
    --shadow-ui: 0 1px 0 rgba(255, 255, 255, 0.05) inset,
      0 12px 28px rgba(0, 0, 0, 0.22);
  }

  .gallery-wrap {
    width: 100%;
  }

  .gallery {
    width: 100%;
    margin: 0 auto;
    padding-inline: clamp(0.55rem, 1vw, 0.95rem);
    display: grid;
    grid-template-columns:
      minmax(72px, 0.6fr)
      minmax(150px, 1.15fr)
      minmax(130px, 1fr)
      minmax(220px, 1.6fr)
      minmax(72px, 0.6fr);
    gap: 0.8rem;
    align-items: start;
  }

  .col {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 0.72rem;
    min-height: 30rem;
    contain: layout paint;
  }

  .canvas-shell {
    width: min(100%, 1600px);
    margin: 0 auto;
    padding:
      0
      clamp(0.9rem, 1.25vw, 1.3rem)
      clamp(1.8rem, 2.4vw, 2.5rem);
  }

  .top {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.1rem;
  }

  .text-part {
    margin-top: clamp(2.8rem, 4.2vw, 4rem);
    margin-bottom: 0;
  }

  .heading {
    margin: 0;
    display: flex;
    align-items: baseline;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.28rem;
    line-height: 0.92;
    letter-spacing: -0.055em;
    text-align: center;
    text-wrap: balance;
  }

  .title-main,
  .title-accent {
    transition: color 520ms ease;
  }

  .title-main {
    font-size: clamp(2.8rem, 4.25vw, 3rem);
    font-weight: 300;
    color: rgba(74, 67, 61, 0.96);
  }

  .title-accent {
    font-family: "Cormorant Garamond", serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(2.9rem, 4.45vw, 4.15rem);
    color: rgba(79, 72, 66, 0.92);
  }

  .dark-phase .title-main,
  .dark-phase .title-accent {
    color: #fff;
  }

  .controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.7rem;
    flex-wrap: wrap;
  }

  .select-copy,
  .finish-card,
  .project-button {
    border: 1px solid var(--panel-border);
    background: var(--panel-bg);
    color: var(--panel-text);
    box-shadow: var(--shadow-ui);
    transition:
      background 520ms ease,
      color 520ms ease,
      border-color 520ms ease,
      box-shadow 520ms ease,
      transform 140ms ease;
  }

  .select-copy,
  .finish-card {
    min-height: 2.35rem;
    border-radius: 7px;
  }

  .select-copy {
    display: inline-flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.45rem 0.85rem 0.48rem;
  }

  .select-title {
    font-size: 0.86rem;
    font-weight: 500;
    color: var(--panel-text);
    line-height: 1;
    transition: color 520ms ease;
  }

  .select-subtitle {
    font-size: 0.78rem;
    font-weight: 400;
    color: var(--panel-muted);
    line-height: 1;
    white-space: nowrap;
    transition: color 520ms ease;
  }

  .finish-card {
    display: flex;
    align-items: center;
    gap: 0.48rem;
    padding: 0 0.72rem;
  }

  .swatch {
    position: relative;
    inline-size: 0.88rem;
    block-size: 0.88rem;
    flex: 0 0 auto;
    border: none;
    border-radius: 999px;
    background: var(--swatch);
    cursor: pointer;
    box-shadow:
      0 0 0 1px rgba(88, 79, 71, 0.11),
      inset 0 1px 1px rgba(255, 255, 255, 0.45);
    transition:
      transform 140ms ease,
      box-shadow 140ms ease,
      opacity 140ms ease;
    -webkit-tap-highlight-color: transparent;
  }

  .dark-phase .swatch {
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.12),
      inset 0 1px 1px rgba(255, 255, 255, 0.18);
  }

  .swatch:hover {
    transform: scale(1.04);
  }

  .swatch.active::before {
    content: "";
    position: absolute;
    inset: -0.24rem;
    border-radius: inherit;
    border: 1px solid rgba(103, 95, 87, 0.46);
  }

  .dark-phase .swatch.active::before {
    border-color: rgba(255, 255, 255, 0.45);
  }

  .project-button {
    min-height: 2.35rem;
    padding: 0.7rem 1.15rem;
    border-radius: 7px;
    font-family: "Inter", sans-serif;
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    cursor: pointer;
  }

  .project-button:hover {
    transform: translateY(-1px);
  }

  .card {
    position: relative;
    overflow: hidden;
    border-radius: 3px;
    background: var(--card);
    box-shadow: var(--shadow-card);
    contain: layout paint;
   
  }

  .card-image-wrapper {
    position: absolute;
    inset-inline: 0;
    height: 124%;
    top: -15%;
    will-change: transform;
    transform: translate3d(0, 0, 0);
  }

  .card img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: center;
    filter: saturate(0.94) brightness(1.01) contrast(0.98);
    transform: translateZ(0);
    transition: filter 0.45s ease, transform 0.8s ease;
    user-select: none;
    pointer-events: none;
  }

  .card:hover img {
    filter: saturate(0.94) brightness(0.68) contrast(0.98);
    transform: scale(1.05);
  }

  .card-info {
    position: absolute;
    top: 16px;
    left: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 14px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.18);
    color: white;
    font-size: 0.8rem;
    opacity: 0;
    transform: translate3d(0, -10px, 0);
    transition: opacity 0.4s ease, transform 0.4s ease;
    z-index: 2;
  }

  .card:hover .card-info {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  .card-date {
    opacity: 0.62;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
  }

  .card-title {
    font-size: 0.82rem;
    font-weight: 500;
    line-height: 1.1;
  }

  .card-index {
    position: absolute;
    top: 16px;
    right: 16px;
    font-size: 0.65rem;
    letter-spacing: 0.18em;
    color: rgba(79, 72, 66, 0.34);
    z-index: 2;
    pointer-events: none;
    transition: color 0.4s ease;
  }

  .card:hover .card-index {
    color: rgba(79, 72, 66, 0.62);
  }

  .edge-left {
    margin-left: clamp(-1.6rem, -1.8vw, -1rem);
    padding-bottom: 1.1rem;
  }

  .portrait-left {
    padding-bottom: 5.2rem;
  }

  .portrait-center {
    padding-bottom: 8.3rem;
  }

  .hero-product {
    padding-bottom: 4.2rem;
  }

  .edge-right {
    margin-right: clamp(-1.6rem, -1.8vw, -1rem);
    padding-bottom: 0;
  }

  .left-top {
    height: 16rem;
  }

  .left-bottom {
    height: 16rem;
  }

  .portrait-left .single {
    height: 26rem;
  }

  .portrait-center .single {
    height: 20rem;
  }

  .hero-product .single {
    height: 25rem;
  }

  .right-top {
    height: 18rem;
  }

  .right-bottom {
    height: 18rem;
  }

  @media (max-width: 1100px) {
    .gallery {
      grid-template-columns: 1fr 0.9fr 1.15fr;
      gap: 0.7rem;
      padding-inline: 0.9rem;
    }

    .edge-left,
    .edge-right {
      display: none;
    }

    .col {
      min-height: auto;
      padding-bottom: 0;
      margin: 0;
    }

    .portrait-left .single {
      height: 18rem;
    }

    .portrait-center .single {
      height: 14rem;
      margin-bottom: 2.8rem;
    }

    .hero-product .single {
      height: 20rem;
      margin-bottom: 0.6rem;
    }
  }

  @media (max-width: 780px) {
    .canvas-shell {
      padding: 0 0.9rem 1.2rem;
    }

    .text-part {
      margin-top: 2rem;
    }

    .title-main {
      font-size: clamp(2rem, 10vw, 3rem);
    }

    .title-accent {
      font-size: clamp(2.1rem, 10.3vw, 3.15rem);
    }

    .controls {
      width: 100%;
      gap: 0.6rem;
    }

    .select-copy,
    .finish-card,
    .project-button {
      width: min(100%, 22rem);
      justify-content: center;
    }

    .gallery {
      grid-template-columns: 1fr;
      gap: 0.8rem;
      padding-inline: 0.9rem;
    }

    .portrait-left,
    .portrait-center,
    .hero-product {
      margin: 0;
      padding-bottom: 0;
    }

    .card-image-wrapper {
      height: 116%;
      top: -8%;
    }

    .portrait-left .single,
    .portrait-center .single,
    .hero-product .single {
      height: auto;
      min-height: 14rem;
      margin-bottom: 0;
    }

    .portrait-left .single,
    .portrait-center .single {
      aspect-ratio: 0.76;
    }

    .hero-product .single {
      aspect-ratio: 1.08;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .lifestyle-section,
    .title-main,
    .title-accent,
    .select-copy,
    .finish-card,
    .project-button,
    .select-title,
    .select-subtitle,
    .swatch,
    .card img,
    .card-info {
      transition: none;
    }
  }
</style>