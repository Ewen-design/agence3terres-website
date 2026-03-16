<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";

  type GalleryCard = {
    image: string;
    alt: string;
    className: string;
    width: number;
    height: number;
    loading?: "eager" | "lazy";
    fetchpriority?: "high" | "low" | "auto";
    year?: string;
    title?: string;
  };

  const cards: GalleryCard[] = [
    {
      image: "images/photo.webp",
      alt: "Close-up technical detail",
      title: "Technical detail",
      year: "2024",
      className: "dna-top-left",
      width: 900,
      height: 420,
      loading: "eager",
      fetchpriority: "high"
    },
    {
      image: "images/photo.webp",
      alt: "Metallic product close-up",
      title: "Metallic close-up",
      year: "2024",
      className: "dna-bottom-left",
      width: 900,
      height: 980,
      loading: "lazy",
      fetchpriority: "low"
    },
    {
      image: "images/photo.webp",
      alt: "Minimal wearable device",
      title: "Wearable device",
      year: "2024",
      className: "dna-center",
      width: 1100,
      height: 1400,
      loading: "eager",
      fetchpriority: "high"
    },
    {
      image: "images/photo.webp",
      alt: "Soft material surface",
      title: "Material surface",
      year: "2024",
      className: "dna-right",
      width: 950,
      height: 900,
      loading: "lazy",
      fetchpriority: "low"
    }
  ];

  let sectionEl: HTMLElement;
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
    if (!sectionEl || !galleryEl) return;

    const scrollY = window.scrollY;
    const sectionRect = sectionEl.getBoundingClientRect();

    sectionMetrics = {
      top: sectionRect.top + scrollY,
      height: sectionRect.height
    };

    const domCards = [...galleryEl.querySelectorAll<HTMLElement>(".dna-card")];

    cardData = domCards.map((card) => {
      const rect = card.getBoundingClientRect();

      return {
        top: rect.top + scrollY,
        height: rect.height,
        wrapper: card.querySelector<HTMLDivElement>(".dna-card-image-wrapper"),
        info: card.querySelector<HTMLDivElement>(".dna-card-info"),
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
        c.img.style.filter = c.curOpacity > 0.5 ? "brightness(0.68)" : "";
        c.img.style.transform = c.curOpacity > 0.5
          ? "scale(1.05) translateZ(0)"
          : "translateZ(0)";
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
      isMobile = window.innerWidth <= 700;
      measure();
    }, 120);
  }

  onMount(() => {
    isMobile = window.innerWidth <= 700;

    requestAnimationFrame(() => {
      measure();
      startLoop();
    });

    registerParallax(updateParallax);

    resizeObserver = new ResizeObserver(handleResize);
    if (sectionEl) resizeObserver.observe(sectionEl);

    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        sectionVisible = entry.isIntersecting;
        if (sectionVisible) startLoop();
        else stopLoop();
      },
      { rootMargin: "300px 0px 300px 0px" }
    );

    if (sectionEl) intersectionObserver.observe(sectionEl);
  });

  onDestroy(() => {
    stopLoop();
    unregisterParallax(updateParallax);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    if (resizeTimeout) clearTimeout(resizeTimeout);
  });
</script>

<section class="dna-section" aria-labelledby="dna-title" bind:this={sectionEl}>
  <div class="dna-shell">
    <div class="dna-intro">
      <div class="dna-title-block">
        <h2 id="dna-title" class="dna-heading">
          <span class="dna-title-main">Design is in</span>
          <span class="dna-title-accent">our DNA</span>
        </h2>
      </div>

      <div class="dna-copy">
        <p>
          Oura is rooted in Finnish design philosophy — uniquely designed to
          pair with your mind and body. Each Oura Ring is made from
          aerospace-grade titanium, one of the strongest materials on earth.
          Years of testing guarantee they’re comfortable for everyone, crafted
          to perfection, and long-lasting.
        </p>
      </div>
    </div>

    <div class="dna-gallery" aria-label="Design gallery" bind:this={galleryEl}>
      {#each cards as card, i (card.className)}
        <article class={`dna-card ${card.className}`}>
          <div class="dna-card-image-wrapper">
            <img
              src={card.image}
              alt={card.alt}
              width={card.width}
              height={card.height}
              loading={card.loading ?? "lazy"}
              fetchpriority={card.fetchpriority ?? "auto"}
              decoding="async"
              draggable="false"
            />
          </div>

          <div class="dna-card-info">
            <span class="dna-card-date">{card.year ?? "2024"}</span>
            <span class="dna-card-title">{card.title ?? card.alt}</span>
          </div>

          <span class="dna-card-index" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>

        </article>
      {/each}
    </div>
  </div>
</section>

<style>
  .dna-section {
    --dna-bg: #f5f3ee;
    --dna-bg-top: #f8f7f3;
    --dna-text: #4d4843;
    --dna-muted: #6f6962;
    --dna-card-bg: #ece7df;
    --dna-line: rgba(96, 86, 78, 0.05);
    --dna-shadow-card:
      0 1px 0 rgba(255, 255, 255, 0.52) inset,
      0 8px 20px rgba(79, 62, 41, 0.014);

    width: 100%;
    min-height: auto;
    padding-block: clamp(4.5rem, 8vw, 7rem);
    background:
      radial-gradient(circle at 15% 0%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 34%),
      linear-gradient(180deg, var(--dna-bg-top) 0%, var(--dna-bg) 100%);
    color: var(--dna-text);
    font-family: "Inter", sans-serif;
    overflow: hidden;
  }

  .dna-shell {
    width: min(100%, 1560px);
    margin: 0 auto;
    padding:
      0
      clamp(1.25rem, 3vw, 2.6rem)
      clamp(1.2rem, 2vw, 2rem);
  }

  .dna-intro {
    display: grid;
    grid-template-columns: 1.3fr 0.95fr;
    align-items: start;
    column-gap: clamp(3rem, 9vw, 10rem);
    margin-bottom: clamp(2rem, 3.2vw, 2.8rem);
  }

  .dna-title-block {
    max-width: 42rem;
    padding-top: clamp(0.35rem, 0.9vw, 0.8rem);
  }

  .dna-heading {
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 0.9;
    letter-spacing: -0.055em;
  }

  .dna-title-main {
    font-size: clamp(2.9rem, 4.5vw, 4.5rem);
    font-weight: 300;
    color: rgba(78, 72, 67, 0.96);
  }

  .dna-title-accent {
    margin-top: 0.05em;
    margin-left: clamp(3.6rem, 6vw, 5.4rem);
    font-family: "Cormorant Garamond", serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(3rem, 4.6vw, 4.6rem);
    color: rgba(89, 82, 77, 0.86);
  }

  .dna-copy {
    max-width: 28.5rem;
    justify-self: end;
    padding-top: clamp(0.25rem, 0.8vw, 0.7rem);
  }

  .dna-copy p {
    margin: 0;
    font-size: clamp(1rem, 0.95vw, 1.06rem);
    line-height: 1.56;
    letter-spacing: -0.012em;
    color: var(--dna-muted);
  }

  .dna-gallery {
    display: grid;
    grid-template-columns: 1.08fr 1.28fr 1.06fr;
    grid-template-rows: 8.625rem 18.375rem;
    gap: 0.75rem;
    align-items: stretch;
    margin-top: clamp(1.4rem, 2.2vw, 2rem);
  }

  .dna-card {
    position: relative;
    overflow: hidden;
    border-radius: 3px;
    background: var(--dna-card-bg);
    border: 1px solid var(--dna-line);
    box-shadow: var(--dna-shadow-card);
    cursor: pointer;
  }

  .dna-card-image-wrapper {
    position: absolute;
    inset-inline: 0;
    height: 124%;
    top: -12%;
    will-change: transform;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .dna-card img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: center;
    user-select: none;
    pointer-events: none;
    transform: translateZ(0);
    transition: filter 0.45s ease, transform 0.8s ease;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .dna-card:hover img {
    filter: brightness(0.68);
    transform: scale(1.05);
  }

  .dna-card-info {
    position: absolute;
    top: 16px;
    left: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 14px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.16);
    color: white;
    font-size: 0.8rem;
    opacity: 0;
    transform: translate3d(0, -10px, 0);
    transition: opacity 0.4s ease, transform 0.4s ease;
    z-index: 2;
  }

  .dna-card:hover .dna-card-info {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  .dna-card-date {
    opacity: 0.62;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
  }

  .dna-card-title {
    font-size: 0.82rem;
    font-weight: 500;
    line-height: 1.1;
  }

  .dna-card-index {
    position: absolute;
    top: 16px;
    right: 16px;
    font-size: 0.65rem;
    letter-spacing: 0.18em;
    color: rgba(77, 72, 67, 0.34);
    z-index: 2;
    pointer-events: none;
    transition: color 0.4s ease;
  }

  .dna-card:hover .dna-card-index {
    color: rgba(77, 72, 67, 0.62);
  }

  .dna-top-left {
    grid-column: 1;
    grid-row: 1;
    height: calc(100% + 2rem);
    margin-top: -2rem;
  }

  .dna-bottom-left {
    grid-column: 1;
    grid-row: 2;
  }

  .dna-center {
    grid-column: 2;
    grid-row: 1 / span 2;
    margin-top: 0.75rem;
  }

  .dna-right {
    grid-column: 3;
    grid-row: 2;
  }

  @media (max-width: 1100px) {
    .dna-section {
      padding-block: clamp(3.5rem, 6vw, 5rem);
    }

    .dna-shell {
      padding: 0 1.35rem 1.2rem;
    }

    .dna-intro {
      grid-template-columns: 1fr;
      row-gap: 1.4rem;
      margin-bottom: 1.7rem;
    }

    .dna-copy {
      justify-self: start;
      max-width: 36rem;
      padding-top: 0;
    }

    .dna-gallery {
      grid-template-columns: 1fr 1.08fr;
      grid-template-rows: 8.625rem 15.125rem 15.125rem;
      gap: 0.7rem;
      margin-top: 1.6rem;
    }

    .dna-top-left {
      grid-column: 1;
      grid-row: 1;
      height: calc(100% + 1.5rem);
      margin-top: -1.5rem;
    }

    .dna-bottom-left {
      grid-column: 1;
      grid-row: 2 / span 2;
    }

    .dna-center {
      grid-column: 2;
      grid-row: 1 / span 2;
      margin-top: 0.625rem;
    }

    .dna-right {
      grid-column: 2;
      grid-row: 3;
    }
  }

  @media (max-width: 700px) {
    .dna-section {
      padding-block: 3rem 3.75rem;
    }

    .dna-shell {
      padding: 0 1rem 1rem;
    }

    .dna-intro {
      margin-bottom: 1.25rem;
    }

    .dna-title-main {
      font-size: clamp(2.35rem, 9vw, 3.25rem);
    }

    .dna-title-accent {
      margin-left: 2.25rem;
      font-size: clamp(2.45rem, 9.2vw, 3.35rem);
    }

    .dna-copy {
      max-width: 100%;
    }

    .dna-copy p {
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .dna-gallery {
      grid-template-columns: 1fr;
      grid-template-rows: none;
      gap: 0.65rem;
      margin-top: 1.3rem;
    }

    .dna-top-left,
    .dna-bottom-left,
    .dna-center,
    .dna-right {
      grid-column: 1;
      grid-row: auto;
      margin-top: 0;
      height: auto;
    }

    .dna-card-image-wrapper {
      height: 116%;
      top: -8%;
    }

    .dna-top-left {
      aspect-ratio: 1.8 / 1;
    }

    .dna-bottom-left {
      aspect-ratio: 1 / 1.18;
    }

    .dna-center {
      aspect-ratio: 1 / 1.28;
    }

    .dna-right {
      aspect-ratio: 1.08 / 1;
    }

    .dna-card:hover img {
      filter: none;
      transform: translateZ(0);
    }

    .dna-card:hover .dna-card-info {
      opacity: 0;
      transform: translate3d(0, -10px, 0);
    }

    .dna-card:hover .dna-card-plus {
      transform: none;
      background: rgba(255, 255, 255, 0.16);
    }
  }

  @media (max-width: 640px) {
    .dna-card-image-wrapper {
      height: 114%;
      top: -7%;
    }

    .dna-card-info {
      top: 14px;
      left: 14px;
      padding: 9px 12px;
      font-size: 0.74rem;
    }

    .dna-card-plus {
      bottom: 14px;
      left: 14px;
      width: 38px;
      height: 38px;
      font-size: 1rem;
    }

    .dna-card-index {
      top: 14px;
      right: 14px;
    }
  }

  @media (max-width: 420px) {
    .dna-card-image-wrapper {
      height: 112%;
      top: -6%;
    }

    .dna-card-info {
      top: 12px;
      left: 12px;
      padding: 8px 11px;
      font-size: 0.7rem;
    }

    .dna-card-plus {
      bottom: 12px;
      left: 12px;
      width: 34px;
      height: 34px;
      font-size: 0.95rem;
    }

    .dna-card-index {
      top: 12px;
      right: 12px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .dna-card img,
    .dna-card-info,
    .dna-card-plus {
      transition: none;
    }
  }
</style>