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
  let introZoneEl;
  let transitionTextEl;

  let resizeObs;
  let resizeTimer;
  let sectionVisible = false;
  let intersectionObs;
  let slideshowInterval = null;

  const rightImages = [
    "images/photo.webp",
    "images/photo.webp",
    "images/photo.webp"
  ];

  let currentRightImage = 0;
  let rightImageVisible = true;

  let cardEls = [];
  let imgEls = [];
  let overlayEls = [];
  let cardMetrics = [];

  let transitionMetric = { top: 0, height: 0 };
  let introMetric = { top: 0, height: 0 };

  let prevScale = [];
  let prevDark = [];
  let prevOverlayOpacity = [];
  let prevOverlayY = [];
  let prevVisible = [];

  let introTitleProgress = 0;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const round = (v) => Math.round(v * 1000) / 1000;

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function measure() {
    if (!sectionEl) return;
    const scrollY = window.lenis?.animatedScroll ?? window.scrollY ?? 0;

    if (introZoneEl) {
      const rect = introZoneEl.getBoundingClientRect();
      introMetric = {
        top: rect.top + scrollY,
        height: rect.height
      };
    }

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

  function updateIntroTitle(scrollY, vh) {
  if (!introMetric.height) return;

  const start = introMetric.top + 4;
  const end = introMetric.top + vh * 0.22;

  introTitleProgress = clamp((scrollY - start) / (end - start), 0, 1);
}

  function startRightImageSlideshow() {
    if (slideshowInterval) return;

    slideshowInterval = setInterval(() => {
      rightImageVisible = false;

      setTimeout(() => {
        currentRightImage = (currentRightImage + 1) % rightImages.length;
        rightImageVisible = true;
      }, 180);
    }, 2000);
  }

  function stopRightImageSlideshow() {
    if (slideshowInterval) {
      clearInterval(slideshowInterval);
      slideshowInterval = null;
    }
    rightImageVisible = true;
  }

  function onScroll(scrollY, { vh }) {
    if (!sectionVisible) return;

    updateIntroTitle(scrollY, vh);

    const heroProgress = cardMetrics[0]?.height
      ? getCardActivation(cardMetrics[0].top, cardMetrics[0].height, scrollY, vh)
      : 0;

    const leftDuoProgress = cardMetrics[1]?.height
      ? getCardActivation(cardMetrics[1].top, cardMetrics[1].height, scrollY, vh)
      : 0;

    applyCardEffect(0, heroProgress);
    applyCardEffect(1, leftDuoProgress);

    if (leftDuoProgress > 0.3) startRightImageSlideshow();
    else stopRightImageSlideshow();

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
        if (!sectionVisible) stopRightImageSlideshow();
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
    stopRightImageSlideshow();
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("orientationchange", handleResize);
    resetStoryDarkPhase();
  });

  $: introTitleOpacity = lerp(1, 0, introTitleProgress);
  $: introTitleBlur = lerp(0, 18, introTitleProgress);
  $: introTitleY = lerp(0, -24, introTitleProgress);
</script>

<section class="story-gallery-a" class:dark-phase={$storyDarkPhase} bind:this={sectionEl}>
  <div class="intro-zone" bind:this={introZoneEl}>
    <div class="intro-sticky">
      <div class="intro-title-wrap">
        <h2
          class="intro-title"
          style={`opacity:${introTitleOpacity}; filter: blur(${introTitleBlur}px); transform: translate3d(0, ${introTitleY}px, 0);`}
        >
          <span class="intro-title-main">Nos</span>
          <span class="intro-title-accent">projets</span>
        </h2>
      </div>
    </div>
  </div>

  <div class="shell">
    <article class="hero-card visual-card" bind:this={cardEls[0]}>
      <div class="visual-media">
        <img bind:this={imgEls[0]} src="images/photo.webp" alt="Serein Design" />
      </div>

      <div class="project-overlay project-overlay-large" bind:this={overlayEls[0]}>
        <span class="overlay-chip overlay-chip-title">Serein Design</span>
        <span class="overlay-chip overlay-chip-line">Une direction plus calme, plus raffinée et plus contemporaine.</span>
        <span class="overlay-chip overlay-chip-italic">Brand Design</span>
      </div>
    </article>

    <div class="duo-grid">
      <article class="duo-card visual-card" bind:this={cardEls[1]}>
        <div class="visual-media">
          <img bind:this={imgEls[1]} src="images/photo.webp" alt="Serein Design détail" />
        </div>

        <div class="project-overlay" bind:this={overlayEls[1]}>
          <span class="overlay-chip overlay-chip-title">Serein Design</span>
          <span class="overlay-chip overlay-chip-line">Direction artistique premium</span>
          <span class="overlay-chip overlay-chip-italic">Art Direction</span>
        </div>
      </article>

      <article class="duo-card static-card" bind:this={cardEls[2]}>
        <div class="visual-media">
          <img
            class:fade-hidden={!rightImageVisible}
            src={rightImages[currentRightImage]}
            alt="Serein Design variation"
          />
        </div>
      </article>
    </div>
  </div>

  <div class="transition-band">
    <div class="transition-inner" bind:this={transitionTextEl}>
      <div class="transition-copy-wrap">
        <h2 class="transition-title">
          <span class="transition-title-main">Une narration</span>
          <span class="transition-title-accent">visuelle</span>
        </h2>

        <p class="transition-copy">
          Des images pensées comme des respirations, avec un rythme plus éditorial,
          plus calme et plus premium.
        </p>
      </div>
    </div>
  </div>
</section>

<style>
  .story-gallery-a {
    --bg: #f5f1e8;
    --text: #111;
    --muted: #8d857d;
    --panel-bg: rgba(255, 255, 255, 0.18);
    --panel-border: rgba(255, 255, 255, 0.08);
    --panel-text: #fff;

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
    --muted: rgba(255, 255, 255, 0.62);
  }

  .intro-zone {
  position: relative;
  height: 50vh;
  z-index: 0;
}

.intro-sticky {
  position: sticky;
  top: 0;
  height: 50vh;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 1rem clamp(1.1rem, 3vw, 2.2rem);
  pointer-events: none;
}

  .intro-title-wrap {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .intro-title {
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.24rem;
    line-height: 0.9;
    letter-spacing: -0.05em;
    color: var(--text);
    will-change: opacity, filter, transform;
    transition: color 620ms cubic-bezier(.22,.61,.36,1);
    position: relative;
    z-index: 2;
  }

  .intro-title-main {
    font-family: "Titre", serif;
    font-weight: 400;
    font-size: clamp(4rem, 12vw, 9rem);
  }

  .intro-title-accent {
    font-family: "Titre italic", serif;
    font-style: italic;
    margin-left: 2rem;
    font-weight: 100;
    font-size: clamp(4.05rem, 12.2vw, 9.2rem);
  }

  .shell {
  width: min(100%, 100vw);
  padding: 10px;
  position: relative;
  z-index: 1;
  margin-top: 0;
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
    transition: opacity 180ms ease;
    will-change: transform, filter, opacity;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .visual-media img.fade-hidden {
    opacity: 0;
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

  .transition-band {
    min-height: clamp(34vh, 42vw, 52vh);
    display: grid;
    place-items: center;
    padding: clamp(3rem, 8vw, 7rem) 1.25rem;
  }

  .transition-inner {
    width: min(1500px, 92%);
    margin: 0 auto;
    display: flex;
  
  }

  .transition-copy-wrap {
    width: min(560px, 100%);
  }

  .transition-title {
    margin: 0;
    max-width: 60ch;
    line-height: 0.92;
    letter-spacing: -0.055em;
    text-align: left;
  }

  .transition-title-main {
    font-family: "Titre", serif;
    font-weight: 400;
    font-size: clamp(2.9rem, 4.45vw, 4.15rem);
    color: #000;
  }

  .story-gallery-a.dark-phase .transition-title-main {
    color: #fff;
  }

  .transition-title-accent {
    margin-left: 0.28rem;
    font-family: "Titre italic", serif;
    font-style: italic;
    font-weight: 100;
    font-size: clamp(2.9rem, 4.45vw, 4.15rem);
    color: #000;
  }

  .story-gallery-a.dark-phase .transition-title-accent {
    color: #fff;
  }

  .transition-copy {
    margin: 1rem 0 0;
    max-width: 30ch;
    font-family: "General Sans", sans-serif;
    font-weight: 300;
    font-size: clamp(1.1rem, 1.6vw, 1.35rem);
    line-height: 1.42;
    letter-spacing: -0.02em;
    color: var(--muted);
    text-align: left;
    transition: color 620ms cubic-bezier(.22,.61,.36,1);
  }

  @media (max-width: 900px) {
    .intro-zone {
      height: 88vh;
    }

    .intro-title-main,
    .intro-title-accent {
      font-size: clamp(3rem, 15vw, 5.6rem);
    }

    .shell {
      padding: 8px;
      margin-top: -10vh;
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

    .transition-band {
      min-height: 28vh;
      padding: 3rem 1rem;
    }

    .transition-inner {
      width: min(92%, 760px);
      display: block;
    }

    .transition-copy-wrap {
      width: 100%;
    }

    .transition-title-main {
      font-size: clamp(2rem, 10vw, 3rem);
    }

    .transition-title-accent {
      font-size: clamp(2.1rem, 10.3vw, 3.15rem);
    }

    .transition-copy {
      font-size: clamp(1rem, 4.2vw, 1.2rem);
      max-width: 28ch;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .story-gallery-a,
    .transition-copy {
      transition: none;
    }

    .intro-title {
      opacity: 1 !important;
      filter: none !important;
      transform: none !important;
    }

    .visual-media img,
    .project-overlay {
      transform: none !important;
      filter: none !important;
      opacity: 1 !important;
      visibility: visible !important;
    }
  }
</style>