<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";
  import {
    storyDarkPhase,
    setStoryDarkPhase,
    resetStoryDarkPhase
  } from "$lib/storyThemeSync.js";

  let sectionEl;
  let transitionTextEl;

  let resizeObs;
  let resizeTimer;
  let sectionVisible = false;
  let intersectionObs;

  let cards = [
    {
      tag: "Vision produit",
      subtag: "Interface / tonalité",
      title: "Hero visual",
      effect: true
    },
    {
      tag: "Direction image",
      subtag: "Narration visuelle",
      title: "Focus principal",
      effect: true
    },
    {
      tag: "Still frame",
      subtag: "Texture / respiration",
      title: "Frame secondaire",
      effect: false
    }
  ];

  let cardEls = [];
  let mediaEls = [];
  let imgEls = [];
  let infoEls = [];

  let cardMetrics = [];
  let transitionMetric = { top: 0, height: 0 };
  let sectionMetrics = { top: 0, height: 0 };

  let prevScale = [];
  let prevDark = [];
  let prevInfoOpacity = [];
  let prevInfoY = [];
  let prevVisible = [];

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const round = (v) => Math.round(v * 100) / 100;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function measure() {
    if (!sectionEl) return;

    const scrollY = window.lenis?.animatedScroll ?? window.scrollY ?? 0;
    const sectionRect = sectionEl.getBoundingClientRect();

    sectionMetrics = {
      top: sectionRect.top + scrollY,
      height: sectionRect.height
    };

    if (transitionTextEl) {
      const rect = transitionTextEl.getBoundingClientRect();
      transitionMetric = {
        top: rect.top + scrollY,
        height: rect.height
      };
    }

    cardMetrics = cardEls.map((el) => {
      if (!el) return { top: 0, height: 0 };
      const rect = el.getBoundingClientRect();
      return {
        top: rect.top + scrollY,
        height: rect.height
      };
    });

    prevScale = new Array(cards.length).fill(null);
    prevDark = new Array(cards.length).fill(null);
    prevInfoOpacity = new Array(cards.length).fill(null);
    prevInfoY = new Array(cards.length).fill(null);
    prevVisible = new Array(cards.length).fill(null);
  }

  function getCardActivation(cardTop, cardHeight, scrollY, vh) {
    const topInView = cardTop - scrollY;
    const start = vh * 0.76;
    const end = vh * 0.44;
    const triggerPoint = topInView + cardHeight * 0.22;
    return clamp((start - triggerPoint) / (start - end), 0, 1);
  }

  function applyCardEffect(i, progress) {
    const media = mediaEls[i];
    const img = imgEls[i];
    const info = infoEls[i];
    if (!media || !img || !info) return;

    const eased = easeOutCubic(progress);
    const scale = round(lerp(1, 1.04, eased));
    const brightness = round(lerp(1, 0.76, eased));
    const infoOpacity = round(lerp(0, 1, eased));
    const infoY = round(lerp(16, 0, eased));
    const visible = infoOpacity > 0.02;

    if (prevScale[i] !== scale) {
      img.style.transform = `scale(${scale}) translateZ(0)`;
      prevScale[i] = scale;
    }

    if (prevDark[i] !== brightness) {
      img.style.filter = `brightness(${brightness})`;
      prevDark[i] = brightness;
    }

    if (prevInfoOpacity[i] !== infoOpacity) {
      info.style.opacity = `${infoOpacity}`;
      prevInfoOpacity[i] = infoOpacity;
    }

    if (prevInfoY[i] !== infoY) {
      info.style.transform = `translate3d(0, ${infoY}px, 0)`;
      prevInfoY[i] = infoY;
    }

    if (prevVisible[i] !== visible) {
      info.style.visibility = visible ? "visible" : "hidden";
      prevVisible[i] = visible;
    }
  }

  function onScroll(scrollY, { vh }) {
    if (!sectionVisible) return;

    for (let i = 0; i < cards.length; i++) {
      if (!cards[i].effect) continue;
      const metric = cardMetrics[i];
      if (!metric?.height) continue;
      const progress = getCardActivation(metric.top, metric.height, scrollY, vh);
      applyCardEffect(i, progress);
    }

    if (transitionMetric.height) {
      const textCenter = transitionMetric.top + transitionMetric.height * 0.5;
      const triggerY = scrollY + vh * 0.5;
      setStoryDarkPhase(textCenter <= triggerY);
    }
  }

  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      measure();
    }, 80);
  }

  onMount(() => {
    resetStoryDarkPhase();

    requestAnimationFrame(() => {
      measure();
      registerParallax(onScroll, { priority: 2 });
    });

    intersectionObs = new IntersectionObserver(
      ([entry]) => {
        sectionVisible = entry.isIntersecting;
        if (sectionVisible) measure();
      },
      { rootMargin: "500px 0px 500px 0px", threshold: 0 }
    );

    if (sectionEl) intersectionObs.observe(sectionEl);

    resizeObs = new ResizeObserver(handleResize);
    if (sectionEl) resizeObs.observe(sectionEl);

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });
  });

  onDestroy(() => {
    if (!browser) return;
    unregisterParallax(onScroll);
    intersectionObs?.disconnect();
    resizeObs?.disconnect();
    clearTimeout(resizeTimer);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("orientationchange", handleResize);
    resetStoryDarkPhase();
  });
</script>

<section class="story-gallery-a" class:dark-phase={$storyDarkPhase} bind:this={sectionEl}>
  <div class="shell">
    <article class="hero-card visual-card" bind:this={cardEls[0]}>
      <div class="visual-media" bind:this={mediaEls[0]}>
        <img bind:this={imgEls[0]} src="images/photo.webp" alt="Visuel principal" />
      </div>

      <div class="visual-info" bind:this={infoEls[0]}>
        <span class="info-chip info-primary">{cards[0].tag}</span>
        <span class="info-chip info-secondary">{cards[0].subtag}</span>
      </div>
    </article>

    <div class="duo-grid">
      <article class="duo-card visual-card" bind:this={cardEls[1]}>
        <div class="visual-media" bind:this={mediaEls[1]}>
          <img bind:this={imgEls[1]} src="images/photo.webp" alt="Visuel secondaire" />
        </div>

        <div class="visual-info" bind:this={infoEls[1]}>
          <span class="info-chip info-primary">{cards[1].tag}</span>
          <span class="info-chip info-secondary">{cards[1].subtag}</span>
        </div>
      </article>

      <article class="duo-card static-card" bind:this={cardEls[2]}>
        <div class="visual-media">
          <img src="images/photo.webp" alt="Visuel fixe" />
        </div>
      </article>
    </div>
  </div>

  <div class="transition-band">
    <div class="transition-inner" bind:this={transitionTextEl}>
      <h2 class="transition-title">
        <span class="title-main">Une narration</span>
        <span class="title-accent">visuelle</span>
      </h2>

      <p class="transition-copy">
        Des images pensées comme des respirations, avec un rythme plus éditorial,
        plus calme et plus premium.
      </p>
    </div>
  </div>
</section>

<style>
  .story-gallery-a {
    --bg: #f5f1e8;
    --text: #111;
    --muted: rgba(17, 17, 17, 0.58);
    --chip-bg: rgba(255, 255, 255, 0.14);
    --chip-border: rgba(255, 255, 255, 0.1);
    --chip-text: #fff;

    position: relative;
    width: 100%;
    background: var(--bg);
    color: var(--text);
    transition:
      background-color 620ms cubic-bezier(.22,.61,.36,1),
      color 620ms cubic-bezier(.22,.61,.36,1);
  }

  .story-gallery-a.dark-phase {
    --bg: #000;
    --text: #f5f1e8;
    --muted: rgba(245, 241, 232, 0.62);
  }

  .shell {
    width: min(100%, 100vw);
    padding: 10px;
  }

  .hero-card,
  .duo-card {
    position: relative;
    overflow: hidden;
    border-radius: 5px;
    background: #d9d2c7;
  }

  .hero-card {
    min-height: min(88vh, 980px);
  }

  .duo-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 10px;
  }

  .duo-card {
    min-height: min(62vh, 720px);
  }

  .visual-media {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: inherit;
    background: #d9d2c7;
  }

  .visual-media img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    transform: scale(1) translateZ(0);
    filter: brightness(1);
    transition: none;
    will-change: transform, filter;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .visual-info {
    position: absolute;
    top: 16px;
    left: 16px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    opacity: 0;
    visibility: hidden;
    transform: translate3d(0, 16px, 0);
    z-index: 2;
    will-change: opacity, transform;
    pointer-events: none;
  }

  .info-chip {
    display: inline-flex;
    align-items: center;
    min-height: 32px;
    padding: 0.42rem 0.9rem 0.46rem;
    border-radius: 4px;
    border: 1px solid var(--chip-border);
    background: var(--chip-bg);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: var(--chip-text);
    white-space: nowrap;
    line-height: 1;
  }

  .info-primary {
    font-family: "Titre italic", serif;
    font-style: italic;
    font-weight: 100;
    font-size: clamp(1.55rem, 2vw, 2.2rem);
    letter-spacing: -0.035em;
    min-height: 48px;
    padding: 0.46rem 1.05rem 0.54rem;
  }

  .info-secondary {
    font-family: "General Sans", sans-serif;
    font-size: clamp(0.82rem, 0.92vw, 1rem);
    font-weight: 400;
    letter-spacing: -0.02em;
  }

  .transition-band {
    min-height: clamp(34vh, 42vw, 52vh);
    display: grid;
    place-items: center;
    padding: clamp(3rem, 8vw, 7rem) 1.25rem;
  }

  .transition-inner {
    max-width: 920px;
    text-align: center;
  }

  .transition-title {
    margin: 0;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.35rem;
    line-height: 0.96;
    letter-spacing: -0.045em;
    color: var(--text);
    transition: color 620ms cubic-bezier(.22,.61,.36,1);
  }

  .title-main {
    font-family: "Titre", serif;
    font-weight: 400;
    font-size: clamp(2.3rem, 4.6vw, 5.2rem);
  }

  .title-accent {
    font-family: "Titre italic", serif;
    font-style: italic;
    font-weight: 100;
    font-size: clamp(2.4rem, 4.8vw, 5.35rem);
  }

  .transition-copy {
    margin: 1rem auto 0;
    max-width: 27ch;
    font-family: "General Sans", sans-serif;
    font-weight: 300;
    font-size: clamp(1rem, 1.35vw, 1.3rem);
    line-height: 1.35;
    letter-spacing: -0.02em;
    color: var(--muted);
    transition: color 620ms cubic-bezier(.22,.61,.36,1);
  }

  @media (max-width: 900px) {
    .shell {
      padding: 8px;
    }

    .hero-card {
      min-height: 72vh;
    }

    .duo-grid {
      gap: 8px;
      margin-top: 8px;
      grid-template-columns: 1fr;
    }

    .duo-card {
      min-height: 45vh;
    }

    .transition-band {
      min-height: 28vh;
      padding: 3.5rem 1rem;
    }

    .transition-title {
      gap: 0.22rem;
    }

    .title-main,
    .title-accent {
      font-size: clamp(2rem, 9vw, 3.4rem);
    }

    .transition-copy {
      font-size: clamp(1rem, 4.5vw, 1.2rem);
      max-width: 30ch;
    }

    .visual-info {
      top: 12px;
      left: 12px;
      gap: 7px;
    }

    .info-primary {
      font-size: clamp(1.25rem, 6vw, 1.7rem);
      min-height: 42px;
      padding: 0.42rem 0.9rem 0.48rem;
    }

    .info-secondary {
      font-size: 0.78rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .story-gallery-a,
    .transition-title,
    .transition-copy {
      transition: none;
    }

    .visual-media img,
    .visual-info {
      transform: none !important;
      filter: none !important;
      opacity: 1 !important;
      visibility: visible !important;
    }
  }
</style>