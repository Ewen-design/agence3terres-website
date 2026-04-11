<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { navigate } from "$lib/navigate.js";
  import {
    registerParallax,
    unregisterParallax,
    forceScrollEngineUpdate
  } from "$lib/scrollEngine.js";

  const slides = [
    {
      title: "Serein Design",
      lead: "Un univers objet premium, calme et fonctionnel.",
      rest: "Une direction pensée pour traduire une élégance sobre, technologique et durable à travers une identité visuelle claire et sensible.",
      image: "/images/serein_design.webp",
      cta: "Voir le projet",
      page: "projet1"
    },
    {
      title: "Hansatsu",
      lead: "Une présence plus sensorielle, plus singulière.",
      rest: "Un travail d’image et de narration conçu pour installer une esthétique précise, immersive et raffinée autour du produit.",
      image: "/images/parfum_rouge.webp",
      cta: "Voir le projet",
      page: "projet2"
    },
    {
      title: "Votre projet ?",
      lead: "Une approche sur mesure pour révéler votre singularité.",
      rest: "Identité, direction artistique, expérience visuelle ou territoire de marque : chaque projet est pensé avec exigence, cohérence et impact.",
      image: "/images/telephone2.webp",
      cta: "Contactez-nous",
      page: "contact"
    }
  ];

  const SLIDE_COUNT = slides.length;

  let sectionEl;

  let resizeObserver;
  let intersectionObserver;
  let resizeTimer = null;
  let preloadImages = [];

  let sectionTop = 0;
  let sectionHeight = 1;
  let viewportH = 1;
  let sectionActive = false;
  let measured = false;

  let currentIndex = 0;
  let currentImageIndex = 0;
  let wipeImageIndex = 1;

  let currentTitle = slides[0].title;
  let currentLead = slides[0].lead;
  let currentRest = slides[0].rest;
  let currentCta = slides[0].cta;
  let currentPage = slides[0].page;

  let titleVisible = false;
  let textVisible = false;

  let currentScale = 1.014;
  let wipeScale = 1.014;
  let wipeOpacity = 0;
  let wipeClip = "inset(100% 0 0 0)";
  let wipeDirection = "up";
  let progressScale = 0;

  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

  function invLerp(a, b, v) {
    if (a === b) return 0;
    return clamp((v - a) / (b - a));
  }

  function smooth01(t) {
    const x = clamp(t, 0, 1);
    return x * x * (3 - 2 * x);
  }

  function smoother01(t) {
    const x = clamp(t, 0, 1);
    return x * x * x * (x * (x * 6 - 15) + 10);
  }

  function warmImages() {
    if (!browser) return;

    preloadImages = slides.map((slide, i) => {
      const img = new Image();
      img.decoding = "async";
      img.loading = i === 0 ? "eager" : "lazy";
      if (i === 0) img.fetchPriority = "high";
      img.src = slide.image;
      return img;
    });
  }

  function setContent(index) {
    if (currentIndex === index) return;
    currentIndex = index;
    currentTitle = slides[index].title;
    currentLead = slides[index].lead;
    currentRest = slides[index].rest;
    currentCta = slides[index].cta;
    currentPage = slides[index].page;
  }

  function setCurrentImage(index) {
    currentImageIndex = index;
  }

  function setWipeImage(index) {
    wipeImageIndex = index;
  }

  function handleButtonMove(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  function measure() {
    if (!browser || !sectionEl) return;

    const scrollY = window.scrollY || window.pageYOffset || 0;
    const rect = sectionEl.getBoundingClientRect();

    sectionTop = rect.top + scrollY;
    sectionHeight = Math.max(rect.height, 1);
    viewportH = Math.max(window.innerHeight, 1);
    measured = true;
  }

  function getSegment(index) {
    if (index === 0) {
      return {
        titleStart: 0.13,
        textStart: 0.13,
        wipeStart: 0.4,
        wipeEnd: 0.99
      };
    }

    return {
      titleStart: 0.07,
      textStart: 0.21,
      wipeStart: 0.60,
      wipeEnd: 0.985
    };
  }

  function applyStableState(index, local) {
    const seg = getSegment(index);

    setCurrentImage(index);
    setWipeImage(Math.min(index + 1, SLIDE_COUNT - 1));
    setContent(index);

    titleVisible = local >= seg.titleStart;
    textVisible = local >= seg.textStart;

    currentScale = 1.014 + smooth01(local) * 0.022;
    wipeScale = 1.014;
    wipeOpacity = 0;
    wipeDirection = "up";
    wipeClip = "inset(100% 0 0 0)";
  }

  function applyBoundaryWipe(index, local, direction) {
    const seg = getSegment(index);
    const t = smoother01(invLerp(seg.wipeStart, seg.wipeEnd, local));

    if (direction === "up") {
      setCurrentImage(index);
      setWipeImage(Math.min(index + 1, SLIDE_COUNT - 1));
      setContent(index);
      wipeDirection = "up";
      wipeClip = `inset(${((1 - t) * 100).toFixed(3)}% 0 0 0)`;
    } else {
      setCurrentImage(Math.min(index + 1, SLIDE_COUNT - 1));
      setWipeImage(index);
      setContent(index);
      wipeDirection = "down";
      wipeClip = `inset(0 0 ${((1 - t) * 100).toFixed(3)}% 0)`;
    }

    titleVisible = false;
    textVisible = false;

    const baseZoom = 1.014 + smooth01(local) * 0.022;
    currentScale = baseZoom + t * 0.078;
    wipeScale = 1.014;
    wipeOpacity = t <= 0.001 ? 0 : 1;
  }

  function updateState(y, ctx) {
    if (!sectionActive || !measured || !sectionEl) return;

    const vh = ctx?.vh || viewportH || window.innerHeight || 1;
    const maxScroll = Math.max(sectionHeight - vh, 1);
    const overall = clamp((y - sectionTop) / maxScroll);

    const raw = overall * SLIDE_COUNT;
    const baseIndex = Math.min(SLIDE_COUNT - 1, Math.floor(raw));
    const local = clamp(raw - baseIndex, 0, 0.999999);

    const seg = getSegment(baseIndex);
    const hasNext = baseIndex < SLIDE_COUNT - 1;

    if (hasNext && local >= seg.wipeStart) {
      applyBoundaryWipe(baseIndex, local, "up");
    } else if (baseIndex > 0) {
      const prevSeg = getSegment(baseIndex - 1);
      const prevLocal = 1 + local;

      if (prevLocal >= prevSeg.wipeStart && prevLocal <= prevSeg.wipeEnd) {
        applyBoundaryWipe(baseIndex - 1, prevLocal, "down");
      } else {
        applyStableState(baseIndex, local);
      }
    } else {
      applyStableState(baseIndex, local);
    }

    progressScale = clamp((baseIndex + local) / SLIDE_COUNT);
  }

  function handleParallax(y, ctx) {
    if (!sectionActive) return;
    updateState(y, ctx);
  }

  function handleResize() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      measure();
      forceScrollEngineUpdate();
    }, 80);
  }

  onMount(() => {
    if (!browser) return;

    warmImages();

    requestAnimationFrame(() => {
      measure();

      currentIndex = 0;
      currentImageIndex = 0;
      wipeImageIndex = 1;

      currentTitle = slides[0].title;
      currentLead = slides[0].lead;
      currentRest = slides[0].rest;
      currentCta = slides[0].cta;
      currentPage = slides[0].page;

      titleVisible = false;
      textVisible = false;

      currentScale = 1.014;
      wipeScale = 1.014;
      wipeOpacity = 0;
      wipeClip = "inset(100% 0 0 0)";
      wipeDirection = "up";
      progressScale = 0;

      forceScrollEngineUpdate();
    });

    resizeObserver = new ResizeObserver(handleResize);
    if (sectionEl) resizeObserver.observe(sectionEl);

    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        sectionActive =
          entry.isIntersecting ||
          entry.boundingClientRect.top < window.innerHeight + 220;

        if (sectionActive) {
          measure();
          forceScrollEngineUpdate();
        }
      },
      {
        rootMargin: "220px 0px 220px 0px",
        threshold: 0
      }
    );

    if (sectionEl) intersectionObserver.observe(sectionEl);

    registerParallax(handleParallax, { priority: -1 });
  });

  onDestroy(() => {
    if (!browser) return;

    unregisterParallax(handleParallax);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();

    if (resizeTimer) clearTimeout(resizeTimer);

    preloadImages = [];
  });
</script>

<section class="story-slider" bind:this={sectionEl}>
  <div class="story-slider__sticky">
    <div class="story-slider__images">
      <img
        class="story-slider__bg-current"
        src={slides[currentImageIndex].image}
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchpriority="high"
        loading="eager"
        draggable="false"
        style={`transform: translate3d(0,0,0) scale(${currentScale.toFixed(5)});`}
      />

      <div
        class="story-slider__wipe-layer"
        data-dir={wipeDirection}
        aria-hidden="true"
        style={`
          opacity:${wipeOpacity};
          clip-path:${wipeClip};
          -webkit-clip-path:${wipeClip};
        `}
      >
        <img
          class="story-slider__bg-next"
          src={slides[wipeImageIndex].image}
          alt=""
          decoding="async"
          loading="lazy"
          draggable="false"
          style={`transform: translate3d(0,0,0) scale(${wipeScale.toFixed(5)});`}
        />
        <div class="story-slider__wipe-line"></div>
      </div>

      <div class="story-slider__shade"></div>
      <div class="story-slider__bottom-gradient"></div>
    </div>

    <div class="story-slider__content">
      <div class="story-slider__slide-title-wrap">
        <h3 class="story-slider__slide-title" class:is-visible={titleVisible}>
          <span>{currentTitle}</span>
        </h3>
      </div>

      <div class="story-slider__slide-text-wrap">
        <div class="story-slider__slide-copy" class:is-visible={textVisible}>
          <p class="story-slider__slide-text">
            <span class="story-slider__slide-text-lead">{currentLead}</span>
            <span class="story-slider__slide-text-rest"> {currentRest}</span>
          </p>

          <button
            class="story-slider__cta nav-btn"
            type="button"
            data-cursor="button"
            aria-label={currentCta}
            on:mousemove={handleButtonMove}
            on:click={() => navigate(currentPage)}
          >
            <span class="nav-btn-flip" data-text={currentCta}>
              <span class="nav-btn-text">{currentCta}</span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <div class="story-slider__hud">
      <div class="story-slider__progress">
        <div class="story-slider__progress-index">
          {String(currentIndex + 1).padStart(2, "0")}
        </div>

        <div class="story-slider__progress-track">
          <div
            class="story-slider__progress-fill"
            style={`transform: scaleX(${progressScale.toFixed(5)});`}
          ></div>
        </div>
      </div>

      <div class="story-slider__arrow" aria-hidden="true">
        <span class="arrow-flip">
          <span class="arrow-face arrow-current">
            <svg viewBox="0 0 24 24" class="arrow">
              <path d="M12 19V5M12 19l-6-6M12 19l6-6" />
            </svg>
          </span>
          <span class="arrow-face arrow-next">
            <svg viewBox="0 0 24 24" class="arrow">
              <path d="M12 19V5M12 19l-6-6M12 19l6-6" />
            </svg>
          </span>
        </span>
      </div>
    </div>
  </div>
</section>

<style>
  .story-slider {
    position: relative;
    height: 860vh;
    background: #05070a;
    overflow: clip;
    isolation: isolate;
    z-index: 1;
  }

  .story-slider__sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
    background: #05070a;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .story-slider__images {
    position: absolute;
    inset: 0;
    z-index: 1;
    overflow: hidden;
    background: #05070a;
  }

  .story-slider__bg-current,
  .story-slider__bg-next {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    pointer-events: none;
    user-select: none;
    will-change: transform;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform: translate3d(0, 0, 0) scale(1.014);
  }

  .story-slider__bg-current {
    z-index: 1;
  }

  .story-slider__wipe-layer {
    position: absolute;
    inset: 0;
    z-index: 2;
    overflow: hidden;
    pointer-events: none;
    background: #05070a;
    will-change: clip-path, opacity;
    clip-path: inset(100% 0 0 0);
    -webkit-clip-path: inset(100% 0 0 0);
    opacity: 0;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .story-slider__wipe-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 1.5px;
    z-index: 3;
    background: rgba(245, 241, 232, 0.94);
    box-shadow:
      0 0 16px rgba(245, 241, 232, 0.18),
      0 0 34px rgba(245, 241, 232, 0.08);
    pointer-events: none;
  }

  .story-slider__wipe-layer[data-dir="up"] .story-slider__wipe-line {
    top: 0;
    bottom: auto;
  }

  .story-slider__wipe-layer[data-dir="down"] .story-slider__wipe-line {
    top: auto;
    bottom: 0;
  }

  .story-slider__shade {
    position: absolute;
    inset: 0;
    z-index: 4;
    pointer-events: none;
    background:
      linear-gradient(to bottom, rgba(5, 7, 10, 0.13), rgba(5, 7, 10, 0.23)),
      rgba(5, 7, 10, 0.16);
  }

  .story-slider__bottom-gradient {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 44vh;
    z-index: 5;
    pointer-events: none;
    background:
      linear-gradient(
        to top,
        rgba(5, 7, 10, 0.996) 0%,
        rgba(5, 7, 10, 0.975) 10%,
        rgba(5, 7, 10, 0.92) 24%,
        rgba(5, 7, 10, 0.72) 42%,
        rgba(5, 7, 10, 0.34) 68%,
        rgba(5, 7, 10, 0.03) 100%
      );
  }

  .story-slider__content {
    position: absolute;
    inset: 0;
    z-index: 20;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
    width: 100%;
    height: 100%;
    padding: clamp(1rem, 2.4vw, 2rem);
    pointer-events: none;
  }

  .story-slider__slide-title-wrap {
    align-self: center;
    width: min(92vw, 1400px);
    padding-left: clamp(0rem, 1vw, 1rem);
  }

  .story-slider__slide-title {
    margin: 0;
    color: #f5f1e8;
    font-family: "Titre italic", serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(3.5rem, 8vw, 8.4rem);
    line-height: 0.94;
    letter-spacing: -0.045em;
    opacity: 0;
    transform: translate3d(0, 18px, 0) scale(0.99);
    filter: blur(8px);
    transition:
      opacity 0.98s cubic-bezier(0.22, 1, 0.36, 1),
      transform 0.98s cubic-bezier(0.22, 1, 0.36, 1),
      filter 0.98s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: opacity, transform, filter;
  }

  .story-slider__slide-title.is-visible {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
    filter: blur(0);
  }

  .story-slider__slide-title span {
    display: inline-block;
    white-space: nowrap;
  }

  .story-slider__slide-text-wrap {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    padding-right: clamp(0rem, 1vw, 1rem);
    padding-bottom: clamp(3.1rem, 4.8vw, 4.7rem);
  }

  .story-slider__slide-copy {
    width: min(54rem, 62vw);
    max-width: none;
    opacity: 0;
    transform: translate3d(0, 15px, 0);
    filter: blur(6px);
    transition:
      opacity 0.92s cubic-bezier(0.22, 1, 0.36, 1),
      transform 0.92s cubic-bezier(0.22, 1, 0.36, 1),
      filter 0.92s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: opacity, transform, filter;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1.1rem;
    pointer-events: auto;
  }

  .story-slider__slide-copy.is-visible {
    opacity: 1;
    transform: translate3d(0, 0, 0);
    filter: blur(0);
  }

  .story-slider__slide-text {
    width: 100%;
    margin: 0;
    color: rgba(255, 255, 255, 1);
    font-family: "General Sans", sans-serif;
    font-size: clamp(1.15rem, 2.05vw, 2.05rem);
    font-weight: 300;
    line-height: 1.08;
    letter-spacing: -0.022em;
    max-width: 48ch;
  }

  .story-slider__slide-text-lead {
    color: #f5f1e8;
  }

  .story-slider__slide-text-rest {
    color: #b6b6b6;
  }

  .story-slider__cta {
    pointer-events: auto;
  }

  .nav-btn {
    font-family: "General Sans", sans-serif;
    position: relative;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 1.5rem;
    font-size: 0.9rem;
    white-space: nowrap;
    color: #f5f1e8;
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
      background 1.2s cubic-bezier(.22,.61,.36,1);
  }

  .nav-btn-flip {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
  }

  .nav-btn-text {
    display: block;
    transform: translateY(0%);
    transition:
      transform 0.45s cubic-bezier(.22,.61,.36,1),
      opacity 0.28s ease;
  }

  .nav-btn-flip::after {
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

  .nav-btn:hover .nav-btn-text {
    transform: translateY(-100%);
  }

  .nav-btn:hover .nav-btn-flip::after {
    transform: translateY(0%);
  }

  .nav-btn::before,
  .nav-btn::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
  }

  .nav-btn::before {
    border: 1px solid transparent;
    border-radius: inherit;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      rgba(255, 225, 140, 1) 0%,
      rgba(212, 175, 55, 0.95) 22%,
      rgba(212, 102, 55, 0.55) 45%,
      rgba(212, 102, 55, 0.12) 62%,
      transparent 78%
    );
    transition: opacity 0.25s ease;
  }

  .nav-btn::after {
    border: 1px solid transparent;
    border-radius: inherit;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      rgba(212, 175, 55, 0.55) 0%,
      rgba(212, 102, 55, 0.22) 42%,
      transparent 72%
    );
    filter: blur(2px);
    transition: opacity 0.25s ease;
  }

  .nav-btn:hover::before,
  .nav-btn:hover::after {
    opacity: 1;
  }

  .story-slider__hud {
    position: absolute;
    inset: 0;
    z-index: 60;
    pointer-events: none;
  }

  .story-slider__progress {
    position: absolute;
    left: clamp(1rem, 2vw, 2rem);
    bottom: clamp(3rem, 4.6vw, 4rem);
    display: flex;
    align-items: center;
    gap: 0.9rem;
    width: min(240px, 34vw);
  }

  .story-slider__progress-index {
    flex: 0 0 auto;
    color: #f5f1e8;
    font-family: "Titre italic", serif;
    font-style: italic;
    font-size: 0.95rem;
    line-height: 1;
    letter-spacing: 0.02em;
  }

  .story-slider__progress-track {
    position: relative;
    flex: 1 1 auto;
    height: 1px;
    background: rgba(255, 255, 255, 0.22);
    overflow: hidden;
    transform: translateY(1px);
  }

  .story-slider__progress-fill {
    position: absolute;
    inset: 0;
    background: rgba(245, 241, 232, 0.95);
    transform-origin: left center;
    will-change: transform;
  }

  .story-slider__arrow {
    position: absolute;
    left: clamp(1rem, 2vw, 2rem);
    bottom: clamp(1.2rem, 2.2vw, 2rem);
    opacity: 0.92;
  }

  .arrow-flip {
    position: relative;
    display: block;
    width: 20px;
    height: 20px;
    overflow: hidden;
  }

  .arrow-face {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
  }

  .arrow-current {
    transform: translateY(0%);
    opacity: 1;
  }

  .arrow-next {
    transform: translateY(-100%);
    opacity: 1;
  }

  .arrow {
    width: 20px;
    height: 20px;
    stroke-width: 1.5;
    fill: none;
    stroke: rgba(255, 255, 255, 0.9);
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  @media (max-width: 900px) {
    .story-slider {
      height: 720vh;
    }

    .story-slider__slide-title {
      font-size: clamp(2.8rem, 11vw, 5.4rem);
      line-height: 0.98;
    }

    .story-slider__slide-title span {
      white-space: normal;
      text-wrap: balance;
    }

    .story-slider__slide-text-wrap {
      justify-content: flex-start;
      padding-right: 0;
      padding-bottom: clamp(4.5rem, 8vw, 6rem);
    }

    .story-slider__slide-copy {
      width: min(38rem, 100%);
      max-width: none;
      gap: 1rem;
    }

    .story-slider__slide-text {
      font-size: clamp(1rem, 4.8vw, 1.45rem);
      line-height: 1.12;
      max-width: 30ch;
    }

    .story-slider__progress {
      width: min(180px, 48vw);
      bottom: clamp(2.6rem, 6vw, 3.2rem);
    }

    .story-slider__arrow {
      bottom: clamp(1rem, 3.2vw, 1.4rem);
    }

    .story-slider__bottom-gradient {
      height: 46vh;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .story-slider__slide-title,
    .story-slider__slide-copy,
    .nav-btn,
    .nav-btn-text,
    .nav-btn-flip::after {
      transition: none !important;
      filter: none !important;
    }
  }
</style>