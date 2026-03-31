<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";
  import { navigate } from "$lib/navigate.js";

  export let darkPhase = false;

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
          src: "images/photo.webp",
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
          src: "images/photo.webp",
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

  function handleProjectButtonMove(e: MouseEvent) {
    const btn = e.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${e.clientY - rect.top}px`);
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
        c.img.style.transform = c.curOpacity > 0.5 ? "scale(1.05) translateZ(0)" : "translateZ(0)";
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
    if (!browser) return;
    stopLoop();
    unregisterParallax(updateParallax);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    if (resizeTimeout) clearTimeout(resizeTimeout);
  });
</script>

<section
  class="lifestyles-section"
  class:dark-phase={darkPhase}
  aria-labelledby="lifestyle-title"
  bind:this={lifestyleSection}
>
  <div class="canvas-shell">
    <div class="top">
      <h2 id="lifestyle-title" class="heading">
        <span class="title-main">Un projet de</span>
        <span class="title-accent">Serein Design</span>
      </h2>

      <p class="project-description">
        Une direction plus raffinée, plus calme et plus contemporaine.
        Un univers pensé pour installer une marque premium avec justesse.
      </p>

      <div class="controls">
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
            ></button>
          {/each}
        </div>
      </div>

      <button
        type="button"
        class="project-button"
        data-cursor="button"
        on:mousemove={handleProjectButtonMove}
        on:click={() => navigate("projet1")}
      >
        <span class="project-button-flip" data-text="Voir le projet">
          <span class="project-button-text">Voir le projet</span>
        </span>
      </button>
    </div>
  </div>

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
</section>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(html, body) {
    margin: 0;
  }

  .lifestyles-section {
    --bg: #f4efe6;
    --bg-top: #f7f4ef;
    --text: #4e4741;
    --muted: #8d857d;
    --card: #e9e3db;
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
    font-family: "General Sans", sans-serif;
    color: var(--text);
    contain: layout paint style;
    transition:
      background 520ms ease,
      color 520ms ease;
  }

  .lifestyles-section.dark-phase {
    --bg: #111;
    --bg-top: #111;
    --text: #f5f5f5;
    --muted: rgba(255, 255, 255, 0.62);
    --panel-bg: rgba(0, 0, 0, 0.86);
    --panel-text: #f5f5f5;
    --panel-muted: rgba(255, 255, 255, 0.62);
    --panel-border: rgba(255, 255, 255, 0.1);
    --shadow-ui: 0 1px 0 rgba(255, 255, 255, 0.05) inset,
      0 12px 28px rgba(0, 0, 0, 0.22);
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
    margin-bottom: clamp(2.8rem, 4.2vw, 4rem);
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
    font-family: "Titre", serif;
    font-weight: 400;
    font-size: clamp(2.8rem, 4.25vw, 3rem);
    color: rgba(74, 67, 61, 0.96);
  }

  .title-accent {
    font-family: "Titre italic", serif;
    font-style: italic;
    font-weight: 100;
    font-size: clamp(2.9rem, 4.45vw, 4.15rem);
    color: rgba(79, 72, 66, 0.92);
  }

  .dark-phase .title-main,
  .dark-phase .title-accent {
    color: #fff;
  }

  .project-description {
    margin: 0;
    max-width: 30ch;
    font-family: "General Sans", sans-serif;
    font-weight: 300;
    font-size: clamp(1.1rem, 1.6vw, 1.35rem);
    line-height: 1.42;
    letter-spacing: -0.02em;
    text-align: center;
    color: var(--panel-muted);
    transition: color 520ms ease;
  }

  .controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.7rem;
    flex-wrap: wrap;
  }

  .finish-card {
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

  .finish-card {
    min-height: 2.35rem;
    border-radius: 7px;
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
    font-family: "General Sans", sans-serif;
    position: relative;
    min-height: 2.35rem;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 1.5rem;
    font-size: 0.9rem;
    white-space: nowrap;
    color: var(--panel-text);
    border: 1px solid rgba(255, 255, 255, 0.15);
    cursor: pointer;
    background: rgba(255, 255, 255, 0.10);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 2px;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.04);
    transition:
      transform 1.2s cubic-bezier(.22,.61,.36,1),
      box-shadow 1.2s cubic-bezier(.22,.61,.36,1),
      background 1.2s cubic-bezier(.22,.61,.36,1),
      color 520ms ease,
      border-color 520ms ease;
    -webkit-tap-highlight-color: transparent;
  }

  .project-button-flip {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
  }

  .project-button-text {
    display: block;
    transform: translateY(0%);
    transition:
      transform 0.45s cubic-bezier(.22,.61,.36,1),
      opacity 0.28s ease;
  }

  .project-button-flip::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition:
      transform 0.45s cubic-bezier(.22,.61,.36,1),
      opacity 0.28s ease;
    white-space: nowrap;
    color: inherit;
  }

  .project-button:hover .project-button-text {
    transform: translateY(-100%);
  }

  .project-button:hover .project-button-flip::after {
    transform: translateY(0%);
  }

  .project-button::before,
  .project-button::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
  }

  .project-button::before {
    border: 1px solid transparent;
    border-radius: inherit;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      rgba(235, 232, 255, 1) 0%,
      rgba(210, 210, 230, 0.98) 22%,
      rgba(130, 110, 220, 0.62) 45%,
      rgba(35, 30, 95, 0.14) 62%,
      transparent 78%
    );
    transition: opacity 0.25s ease;
  }

  .project-button::after {
    border: 1px solid transparent;
    border-radius: inherit;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      rgba(150, 140, 230, 0.42) 0%,
      rgba(130, 110, 220, 0.18) 42%,
      transparent 72%
    );
    filter: blur(2px);
    transition: opacity 0.25s ease;
  }

  .project-button:hover::before,
  .project-button:hover::after {
    opacity: 1;
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
    align-items: end;
  }

  .col {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 0.72rem;
    min-height: 30rem;
    contain: layout paint;
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
    top: -12%;
    will-change: transform;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
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
    padding-top: 1.1rem;
  }

  .portrait-left {
    padding-top: 5.2rem;
  }

  .portrait-center {
    padding-top: 8.3rem;
  }

  .hero-product {
    padding-top: 4.2rem;
  }

  .edge-right {
    margin-right: clamp(-1.6rem, -1.8vw, -1rem);
    padding-top: 0;
  }

  .left-top {
    height: 18rem;
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
      padding-top: 0;
      margin: 0;
    }

    .portrait-left .single {
      height: 18rem;
    }

    .portrait-center .single {
      height: 14rem;
      margin-top: 2.8rem;
    }

    .hero-product .single {
      height: 20rem;
      margin-top: 0.6rem;
    }
  }

  @media (max-width: 780px) {
    .canvas-shell {
      padding: 0 0.9rem 1.2rem;
    }

    .top {
      margin-bottom: 2rem;
    }

    .title-main {
      font-size: clamp(2rem, 10vw, 3rem);
    }

    .title-accent {
      font-size: clamp(2.1rem, 10.3vw, 3.15rem);
    }

    .project-description {
      font-size: clamp(1rem, 4.2vw, 1.2rem);
      max-width: 28ch;
    }

    .controls {
      width: 100%;
      gap: 0.6rem;
    }

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
      margin-top: 0;
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
    .lifestyles-section,
    .title-main,
    .title-accent,
    .finish-card,
    .project-button,
    .project-button-text,
    .project-button-flip::after,
    .swatch,
    .card img,
    .card-info,
    .project-description {
      transition: none;
    }
  }
</style>