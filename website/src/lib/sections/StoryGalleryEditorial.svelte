<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";
  import { navigate } from "$lib/navigate.js";
  import { storyDarkPhase } from "$lib/storyThemeSync.js";

  let sectionEl;
  let resizeObs;
  let resizeTimer;
  let sectionVisible = false;
  let intersectionObs;

  const rows = [
    {
      overline: "Focus story",
      titleA: "Un récit",
      titleB: "précis",
      copy:
        "Une composition plus calme, plus lisible et plus désirable, pensée pour faire exister la marque avec élégance.",
      button: "Voir le projet",
      href: "projet1",
      imageLeft: true
    },
    {
      overline: "Image system",
      titleA: "Une présence",
      titleB: "durable",
      copy:
        "Des visuels, des mots et un rythme d’ensemble construits pour installer une perception forte, premium et cohérente.",
      button: "Nous contacter",
      href: "contact",
      imageLeft: false
    }
  ];

  const visualCards = [
    { tag: "Opening frame", subtag: "Narration / tonalité" },
    { tag: "Smart detail", subtag: "Image / texte" },
    { tag: "Editorial flow", subtag: "Rythme / contraste" }
  ];

  let cardEls = [];
  let imgEls = [];
  let infoEls = [];
  let metrics = [];

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
    const scrollY = window.lenis?.animatedScroll ?? window.scrollY ?? 0;

    metrics = cardEls.map((el) => {
      if (!el) return { top: 0, height: 0 };
      const rect = el.getBoundingClientRect();
      return {
        top: rect.top + scrollY,
        height: rect.height
      };
    });

    prevScale = new Array(visualCards.length).fill(null);
    prevDark = new Array(visualCards.length).fill(null);
    prevInfoOpacity = new Array(visualCards.length).fill(null);
    prevInfoY = new Array(visualCards.length).fill(null);
    prevVisible = new Array(visualCards.length).fill(null);
  }

  function getCardActivation(cardTop, cardHeight, scrollY, vh) {
    const topInView = cardTop - scrollY;
    const start = vh * 0.76;
    const end = vh * 0.42;
    const triggerPoint = topInView + cardHeight * 0.18;
    return clamp((start - triggerPoint) / (start - end), 0, 1);
  }

  function applyCardEffect(i, progress) {
    const img = imgEls[i];
    const info = infoEls[i];
    if (!img || !info) return;

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

    for (let i = 0; i < metrics.length; i++) {
      const metric = metrics[i];
      if (!metric?.height) continue;
      const progress = getCardActivation(metric.top, metric.height, scrollY, vh);
      applyCardEffect(i, progress);
    }
  }

  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      measure();
    }, 80);
  }

  function handleButtonMove(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  onMount(() => {
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
  });
</script>

<section class="story-gallery-b" class:dark-phase={$storyDarkPhase} bind:this={sectionEl}>
  <div class="shell">
    <article class="hero-card visual-card" bind:this={cardEls[0]}>
      <img bind:this={imgEls[0]} src="images/photo.webp" alt="Ouverture éditoriale" />

      <div class="visual-info" bind:this={infoEls[0]}>
        <span class="info-chip info-primary">{visualCards[0].tag}</span>
        <span class="info-chip info-secondary">{visualCards[0].subtag}</span>
      </div>
    </article>

    {#each rows as row, index}
      <div class={`split-row ${row.imageLeft ? "image-left" : "image-right"}`}>
        <article class="split-visual visual-card" bind:this={cardEls[index + 1]}>
          <img bind:this={imgEls[index + 1]} src="images/photo.webp" alt={row.titleA} />

          <div class="visual-info" bind:this={infoEls[index + 1]}>
            <span class="info-chip info-primary">{visualCards[index + 1].tag}</span>
            <span class="info-chip info-secondary">{visualCards[index + 1].subtag}</span>
          </div>
        </article>

        <div class="split-copy">
          <span class="copy-overline">{row.overline}</span>

          <h2 class="copy-title">
            <span class="title-main">{row.titleA}</span>
            <span class="title-accent">{row.titleB}</span>
          </h2>

          <p>{row.copy}</p>

          <button
            type="button"
            class="cta-btn"
            on:mousemove={handleButtonMove}
            on:click={() => navigate(row.href)}
          >
            <span class="cta-btn-flip" data-text={row.button}>
              <span class="cta-btn-text">{row.button}</span>
            </span>
          </button>
        </div>
      </div>
    {/each}
  </div>
</section>

<style>
  .story-gallery-b {
    --bg: #000;
    --text: #f5f1e8;
    --muted: rgba(245, 241, 232, 0.64);
    --soft: rgba(245, 241, 232, 0.2);
    --button-text: #f5f1e8;
    --button-bg: rgba(255, 255, 255, 0.08);
    --button-border: rgba(255, 255, 255, 0.14);
    --chip-bg: rgba(255, 255, 255, 0.14);
    --chip-border: rgba(255, 255, 255, 0.1);
    --chip-text: #fff;

    width: 100%;
    background: var(--bg);
    color: var(--text);
    transition:
      background-color 620ms cubic-bezier(.22,.61,.36,1),
      color 620ms cubic-bezier(.22,.61,.36,1);
  }

  .story-gallery-b:not(.dark-phase) {
    --bg: #f5f1e8;
    --text: #111;
    --muted: rgba(17, 17, 17, 0.62);
    --soft: rgba(17, 17, 17, 0.18);
    --button-text: #111;
    --button-bg: rgba(17, 17, 17, 0.06);
    --button-border: rgba(17, 17, 17, 0.14);
  }

  .shell {
    padding: 10px;
  }

  .hero-card,
  .split-visual {
    position: relative;
    overflow: hidden;
    border-radius: 5px;
    background: #1a1a1a;
  }

  .hero-card {
    min-height: min(84vh, 940px);
  }

  .hero-card img,
  .split-visual img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    transform: scale(1) translateZ(0);
    filter: brightness(1);
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
    gap: 8px;
    opacity: 0;
    visibility: hidden;
    transform: translate3d(0, 16px, 0);
    z-index: 2;
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
    font-size: clamp(1.5rem, 1.9vw, 2.1rem);
    letter-spacing: -0.035em;
    min-height: 48px;
    padding: 0.45rem 1.05rem 0.52rem;
  }

  .info-secondary {
    font-family: "General Sans", sans-serif;
    font-size: clamp(0.82rem, 0.92vw, 1rem);
    font-weight: 400;
    letter-spacing: -0.02em;
  }

  .split-row {
    display: grid;
    grid-template-columns: minmax(0, 1.18fr) minmax(0, 0.82fr);
    align-items: stretch;
    gap: clamp(1rem, 2vw, 2rem);
    margin-top: 10px;
    min-height: min(78vh, 860px);
  }

  .split-row.image-right {
    grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
  }

  .split-row.image-right .split-visual {
    order: 2;
  }

  .split-row.image-right .split-copy {
    order: 1;
  }

  .split-visual {
    min-height: 100%;
  }

  .split-copy {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: clamp(1.5rem, 4vw, 4rem);
  }

  .copy-overline {
    display: inline-block;
    margin-bottom: 0.9rem;
    font-family: "General Sans", sans-serif;
    font-size: 0.82rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--soft);
  }

  .copy-title {
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    line-height: 0.96;
    letter-spacing: -0.045em;
    color: var(--text);
  }

  .title-main {
    font-family: "Titre", serif;
    font-weight: 400;
    font-size: clamp(2.1rem, 4.1vw, 4.8rem);
  }

  .title-accent {
    font-family: "Titre italic", serif;
    font-style: italic;
    font-weight: 100;
    font-size: clamp(2.15rem, 4.2vw, 4.95rem);
  }

  .split-copy p {
    margin: 1.05rem 0 0;
    max-width: 23ch;
    font-family: "General Sans", sans-serif;
    font-weight: 300;
    font-size: clamp(1rem, 1.2vw, 1.2rem);
    line-height: 1.42;
    letter-spacing: -0.02em;
    color: var(--muted);
  }

  .cta-btn {
    font-family: "General Sans", sans-serif;
    position: relative;
    margin-top: 1.5rem;
    height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    padding: 0 1.45rem;
    font-size: 0.92rem;
    white-space: nowrap;
    color: var(--button-text);
    border: 1px solid var(--button-border);
    cursor: pointer;
    background: var(--button-bg);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 3px;
    box-shadow: 0 10px 22px rgba(0, 0, 0, 0.08);
    transition:
      background 620ms cubic-bezier(.22,.61,.36,1),
      color 620ms cubic-bezier(.22,.61,.36,1),
      border-color 620ms cubic-bezier(.22,.61,.36,1),
      transform 1.2s cubic-bezier(.22,.61,.36,1);
  }

  .cta-btn-flip {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
  }

  .cta-btn-text {
    display: block;
    transform: translateY(0%);
    transition: transform 0.45s cubic-bezier(.22,.61,.36,1);
  }

  .cta-btn-flip::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition: transform 0.45s cubic-bezier(.22,.61,.36,1);
    white-space: nowrap;
    color: inherit;
  }

  .cta-btn:hover .cta-btn-text {
    transform: translateY(-100%);
  }

  .cta-btn:hover .cta-btn-flip::after {
    transform: translateY(0%);
  }

  .cta-btn::before,
  .cta-btn::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
  }

  .cta-btn::before {
    border: 1px solid transparent;
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

  .cta-btn::after {
    border: 1px solid transparent;
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

  .cta-btn:hover::before,
  .cta-btn:hover::after {
    opacity: 1;
  }

  @media (max-width: 980px) {
    .shell {
      padding: 8px;
    }

    .hero-card {
      min-height: 68vh;
    }

    .split-row,
    .split-row.image-right {
      grid-template-columns: 1fr;
      min-height: auto;
    }

    .split-row.image-right .split-visual,
    .split-row.image-right .split-copy {
      order: initial;
    }

    .split-visual {
      min-height: 52vh;
    }

    .split-copy {
      padding: 1.4rem 1rem 1.6rem;
    }

    .copy-title {
      gap: 0.22rem;
    }

    .title-main,
    .title-accent {
      font-size: clamp(2rem, 9vw, 3.4rem);
    }

    .split-copy p {
      max-width: 100%;
      font-size: clamp(1rem, 4.4vw, 1.16rem);
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
    .story-gallery-b,
    .cta-btn {
      transition: none;
    }

    .hero-card img,
    .split-visual img,
    .visual-info {
      transform: none !important;
      filter: none !important;
      opacity: 1 !important;
      visibility: visible !important;
    }
  }
</style>