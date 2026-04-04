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
      href: "projet2",
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

  let cardEls = [];
  let imgEls = [];
  let overlayEls = [];
  let metrics = [];

  let prevScale = [];
  let prevDark = [];
  let prevOverlayOpacity = [];
  let prevOverlayY = [];
  let prevVisible = [];

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const round = (v) => Math.round(v * 1000) / 1000;

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
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

    prevScale = new Array(3).fill(null);
    prevDark = new Array(3).fill(null);
    prevOverlayOpacity = new Array(3).fill(null);
    prevOverlayY = new Array(3).fill(null);
    prevVisible = new Array(3).fill(null);
  }

  function getCardActivation(cardTop, cardHeight, scrollY, vh) {
    const center = cardTop - scrollY + cardHeight * 0.5;
    const dist = Math.abs(center - vh * 0.5);
    const activeZone = Math.min(vh * 0.3, cardHeight * 0.36);
    const raw = 1 - dist / activeZone;
    return easeInOutCubic(clamp(raw, 0, 1));
  }

  function applyCardEffect(i, progress) {
    const img = imgEls[i];
    const overlay = overlayEls[i];
    if (!img || !overlay) return;

    const scale = round(lerp(1, 1.036, progress));
    const brightness = round(lerp(1, 0.7, progress));
    const overlayOpacity = round(lerp(0, 1, progress));
    const overlayY = round(lerp(26, 0, progress));
    const visible = overlayOpacity > 0.02;

    if (prevScale[i] !== scale) {
      img.style.transform = `scale(${scale}) translateZ(0)`;
      prevScale[i] = scale;
    }

    if (prevDark[i] !== brightness) {
      img.style.filter = `brightness(${brightness}) saturate(${lerp(1, 0.96, progress)})`;
      prevDark[i] = brightness;
    }

    if (prevOverlayOpacity[i] !== overlayOpacity) {
      overlay.style.opacity = `${overlayOpacity}`;
      prevOverlayOpacity[i] = overlayOpacity;
    }

    if (prevOverlayY[i] !== overlayY) {
      overlay.style.transform = `translate3d(0, ${overlayY}px, 0)`;
      prevOverlayY[i] = overlayY;
    }

    if (prevVisible[i] !== visible) {
      overlay.style.visibility = visible ? "visible" : "hidden";
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
      <img bind:this={imgEls[0]} src="images/photo.webp" alt="Hansatsu" />

      <div class="project-overlay project-overlay-large" bind:this={overlayEls[0]}>
        <span class="overlay-chip overlay-chip-title">Hansatsu</span>
        <span class="overlay-chip overlay-chip-line">Une identité plus précise, plus contemporaine et plus désirable.</span>
        <span class="overlay-chip overlay-chip-italic">Brand Design</span>
      </div>
    </article>

    {#each rows as row, index}
      <div class={`split-row ${row.imageLeft ? "image-left" : "image-right"}`}>
        <article class="split-visual visual-card" bind:this={cardEls[index + 1]}>
          <img bind:this={imgEls[index + 1]} src="images/photo.webp" alt={row.titleA} />

          <div class="project-overlay" bind:this={overlayEls[index + 1]}>
            <span class="overlay-chip overlay-chip-title">{index === 0 ? "Hansatsu" : "Votre projet"}</span>
            <span class="overlay-chip overlay-chip-line">
              {index === 0 ? "Direction artistique contemporaine" : "Image de marque premium"}
            </span>
            <span class="overlay-chip overlay-chip-italic">
              {index === 0 ? "Art Direction" : "Strategy"}
            </span>
          </div>
        </article>

        <div class="split-copy">

          <h2 class="copy-title">
            <span class="copy-title-main">{row.titleA}</span>
            <span class="copy-title-accent">{row.titleB}</span>
          </h2>

          <p class="copy-body">{row.copy}</p>

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
    --muted: rgba(255, 255, 255, 0.62);
    --soft: rgba(255, 255, 255, 0.2);
    --button-text: #f5f1e8;
    --button-bg: rgba(255, 255, 255, 0.08);
    --button-border: rgba(255, 255, 255, 0.14);
    --panel-bg: rgba(255, 255, 255, 0.18);
    --panel-border: rgba(255, 255, 255, 0.08);
    --panel-text: #fff;

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
    --muted: #8d857d;
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

  .project-overlay {
    position: absolute;
    left: 22px;
    bottom: 22px;
    z-index: 3;
    opacity: 0;
    visibility: hidden;
    transform: translate3d(0, 28px, 0);
    will-change: opacity, transform;
    pointer-events: none;
    max-width: min(560px, calc(100% - 44px));
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .project-overlay-large {
    left: 28px;
    bottom: 28px;
    max-width: min(700px, calc(100% - 56px));
  }

  .overlay-chip {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    min-height: 30px;
    padding: 0.38rem 0.9rem 0.42rem;
    border: 1px solid var(--panel-border);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    background: var(--panel-bg);
    color: var(--panel-text);
    border-radius: 3px;
    line-height: 1;
    white-space: nowrap;
  }

  .overlay-chip-title {
    font-family: "Titre", serif;
    font-weight: 400;
    font-size: clamp(1.5rem, 1.8vw, 1.95rem);
    letter-spacing: -0.035em;
    min-height: 48px;
    padding: 0.45rem 1.15rem 0.52rem;
  }

  .overlay-chip-line {
    font-family: "General Sans", sans-serif;
    font-size: clamp(0.82rem, 0.9vw, 0.98rem);
    font-weight: 400;
    letter-spacing: -0.02em;
  }

  .overlay-chip-italic {
    font-family: "Titre italic", serif;
    font-style: italic;
    font-weight: 100;
    font-size: clamp(1.15rem, 1.25vw, 1.32rem);
    letter-spacing: -0.03em;
    min-height: 40px;
    padding: 0.38rem 1rem 0.44rem;
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

  .copy-title {
    margin: 0;
    text-align: left;
    line-height: 0.92;
    letter-spacing: -0.055em;
  }

  .copy-title-main {
    font-family: "Titre", serif;
    font-weight: 400;
    font-size: clamp(2.9rem, 4.45vw, 4.15rem);
    color: var(--text);
  }

  .copy-title-accent {
    margin-left: 0.28rem;
    font-family: "Titre italic", serif;
    font-style: italic;
    font-weight: 100;
    font-size: clamp(2.9rem, 4.45vw, 4.15rem);
    color: var(--text);
  }

  .copy-body {
    margin: 2.7rem 0 0 5.35rem;
    max-width: 30ch;
    font-family: "General Sans", sans-serif;
    font-weight: 300;
    font-size: clamp(1.1rem, 1.6vw, 1.35rem);
    line-height: 1.42;
    letter-spacing: -0.02em;
    color: var(--muted);
    text-align: left;
  }

  .cta-btn {
    font-family: "General Sans", sans-serif;
    position: relative;
    margin-top: 1.5rem;
    margin-left: 5.35rem;
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

    .project-overlay {
      left: 14px;
      bottom: 14px;
      max-width: calc(100% - 28px);
    }

    .project-overlay-large {
      left: 16px;
      bottom: 16px;
      max-width: calc(100% - 32px);
    }

    .overlay-chip-title {
      font-size: clamp(1.3rem, 6vw, 1.7rem);
      min-height: 42px;
      padding: 0.42rem 1rem 0.48rem;
    }

    .overlay-chip-line {
      font-size: 0.78rem;
    }

    .overlay-chip-italic {
      font-size: clamp(1rem, 5vw, 1.18rem);
      min-height: 36px;
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

    .copy-title-main {
      font-size: clamp(2rem, 10vw, 3rem);
    }

    .copy-title-accent {
      font-size: clamp(2.1rem, 10.3vw, 3.15rem);
    }

    .copy-body {
      margin-left: 0.9rem;
      font-size: clamp(1rem, 4.2vw, 1.2rem);
      max-width: 28ch;
    }

    .cta-btn {
      margin-left: 0.9rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .story-gallery-b,
    .cta-btn {
      transition: none;
    }

    .hero-card img,
    .split-visual img,
    .project-overlay {
      transform: none !important;
      filter: none !important;
      opacity: 1 !important;
      visibility: visible !important;
    }
  }
</style>