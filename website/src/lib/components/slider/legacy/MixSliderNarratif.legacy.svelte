<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";

  const slides = [
    {
      number: "01",
      navTitle: "SEREIN Design",
      title: "Serein\nDesign",
      description:
        "Un univers objet premium, calme et fonctionnel. Une direction pensée pour traduire une élégance sobre, technologique et durable à travers une identité visuelle claire et sensible.",
      image: "/images/telephone3.webp"
    },
    {
      number: "02",
      navTitle: "Hansatsu",
      title: "Hansatsu",
      description:
        "Une présence plus sensorielle, plus singulière. Un travail d’image et de narration conçu pour installer une esthétique précise, immersive et raffinée autour du produit.",
      image: "/images/parfum_rouge.webp"
    },
    {
      number: "03",
      navTitle: "Votre projet ?",
      title: "Votre\nprojet ?",
      description:
        "Une approche sur mesure pour révéler votre singularité. Identité, direction artistique ou territoire de marque : chaque projet est pensé avec exigence, cohérence et impact.",
      image: "/images/telephone2.webp"
    }
  ];

  let sections = [];
  let contentRefs = [];
  let activeIndex = 0;
  let fills = slides.map(() => 0);
  let displayedFills = slides.map(() => 0);
  let bgScales = slides.map(() => 1.02);
  let contentClipInsets = slides.map(() => 0);
  let ticking = false;
  let maskAnchorEl;
  let stickyEl;
  let textLayerEl;
  let isMobile = false;
  let prefersReducedMotion = false;
  let resizeTimeout;
  let resizeRaf = 0;
  let progressRaf = 0;
  let settleTimer;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchDeltaX = 0;
  let touchDeltaY = 0;
  let sliderEl;
  let stableMobileViewport = 0;
  let lastViewportWidth = 0;
  let currentScrollY = 0;
  let sectionMetrics = [];
  let contentMetrics = [];
  let maskAnchorTop = 0;
  let metricsDirty = true;
  let sliderVisible = true;
  let sliderObserver;
  let layoutObserver;
  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));

  function checkMobile() {
    isMobile = window.innerWidth <= 700;
  }

  function syncStableMobileViewport(forceReset = false) {
    const nextWidth = window.innerWidth || 0;
    const nextHeight = window.innerHeight || document.documentElement.clientHeight || 1;

    if (!isMobile) {
      stableMobileViewport = nextHeight;
      lastViewportWidth = nextWidth;
      return;
    }

    const orientationShift = Math.abs(nextWidth - lastViewportWidth) > 80;
    if (forceReset || orientationShift || !stableMobileViewport) {
      stableMobileViewport = nextHeight;
    } else {
      stableMobileViewport = Math.max(stableMobileViewport, nextHeight);
    }

    lastViewportWidth = nextWidth;
  }

  function getStableViewportHeight() {
    return isMobile ? stableMobileViewport || window.innerHeight || 1 : window.innerHeight || 1;
  }

  function measureLayout() {
    if (!browser || !sliderEl) return;

    const scrollY = window.scrollY || window.pageYOffset || 0;
    sectionMetrics = sections.map((section) => {
      if (!section) return null;
      const rect = section.getBoundingClientRect();
      return {
        top: rect.top + scrollY,
        height: rect.height
      };
    });

    contentMetrics = contentRefs.map((content) => {
      if (!content) return null;
      const rect = content.getBoundingClientRect();
      return {
        top: rect.top + scrollY,
        height: rect.height
      };
    });

    maskAnchorTop = maskAnchorEl
      ? maskAnchorEl.getBoundingClientRect().top + scrollY
      : 0;

    metricsDirty = false;
  }

  function queueProgressUpdate() {
    if (progressRaf) return;
    progressRaf = requestAnimationFrame(() => {
      progressRaf = 0;
      updateProgress();
    });
  }

  function scheduleLayoutRefresh() {
    metricsDirty = true;
    currentScrollY = window.scrollY || window.pageYOffset || 0;
    measureLayout();
    queueProgressUpdate();
  }

  function updateProgress() {
    if (!sliderVisible && !metricsDirty) {
      ticking = false;
      return;
    }

    if (metricsDirty) measureLayout();

    const vh = getStableViewportHeight();
    const next = slides.map(() => 0);
    const nextScales = slides.map(() => (prefersReducedMotion ? 1 : isMobile ? 1.01 : 1.02));
    const nextClipInsets = slides.map(() => 0);
    const progressLine = vh * 0.5;
    const fallbackRevealLine = vh * 0.8;
    let nextActiveIndex = activeIndex;
    let closestDistance = Number.POSITIVE_INFINITY;

    if (isMobile) {
      const scrollY = currentScrollY || window.scrollY || window.pageYOffset || 0;
      sectionMetrics.forEach((metric, i) => {
        if (!metric) return;

        const sectionTop = metric.top - scrollY;
        const progress = clamp((progressLine - sectionTop) / Math.max(metric.height, 1), 0, 1);
        const distanceToCenter = Math.abs(sectionTop + metric.height * 0.5 - progressLine);

        next[i] = progress * 100;
        if (!prefersReducedMotion) {
          nextScales[i] = 1.01 + progress * 0.03;
        }

        if (distanceToCenter < closestDistance) {
          closestDistance = distanceToCenter;
          nextActiveIndex = i;
        }
      });
    } else {
      const revealLine = maskAnchorEl?.getBoundingClientRect().top ?? fallbackRevealLine;

      sections.forEach((section, i) => {
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const progress = clamp((progressLine - rect.top) / Math.max(rect.height, 1), 0, 1);
        const distanceToCenter = Math.abs(rect.top + rect.height * 0.5 - progressLine);

        next[i] = progress * 100;
        if (!prefersReducedMotion) {
          nextScales[i] = 1.02 + progress * 0.08;
        }

        if (distanceToCenter < closestDistance) {
          closestDistance = distanceToCenter;
          nextActiveIndex = i;
        }
      });

      contentRefs.forEach((content, i) => {
        if (!content) return;
        const rect = content.getBoundingClientRect();
        const visibleHeight = clamp(revealLine - rect.top, 0, rect.height);
        nextClipInsets[i] = clamp(rect.height - visibleHeight, 0, rect.height);
      });
    }

    activeIndex = nextActiveIndex;
    fills = next;
    displayedFills = next;
    bgScales = nextScales;
    contentClipInsets = nextClipInsets;
    ticking = false;
  }

  function onScroll() {
    if (!sliderVisible) return;
    currentScrollY = window.scrollY || window.pageYOffset || 0;
    if (ticking) return;
    ticking = true;
    queueProgressUpdate();
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      if (!sliderVisible) return;
      scheduleLayoutRefresh();
    }, 120);
  }

  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        metricsDirty = true;
        currentScrollY = window.scrollY || window.pageYOffset || 0;
        checkMobile();
        syncStableMobileViewport();
        scheduleLayoutRefresh();
      });
    }, 90);
  }

  function jumpToSlide(index) {
    sections[index]?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  }

  function handleTouchStart(event) {
    if (!isMobile) return;
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchDeltaX = 0;
    touchDeltaY = 0;
  }

  function handleTouchMove(event) {
    if (!isMobile) return;
    const touch = event.touches[0];
    touchDeltaX = touch.clientX - touchStartX;
    touchDeltaY = touch.clientY - touchStartY;
  }

  function handleTouchEnd() {
    if (!isMobile) return;
    const horizontalIntent = Math.abs(touchDeltaX) > 56 && Math.abs(touchDeltaY) < 42;
    if (!horizontalIntent) return;

    if (touchDeltaX < 0) {
      jumpToSlide(Math.min(activeIndex + 1, slides.length - 1));
    } else {
      jumpToSlide(Math.max(activeIndex - 1, 0));
    }
  }

  onMount(() => {
    prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    checkMobile();
    syncStableMobileViewport(true);
    currentScrollY = window.scrollY || window.pageYOffset || 0;
    measureLayout();
    updateProgress();
    sliderObserver = new IntersectionObserver(
      ([entry]) => {
        sliderVisible = !!entry?.isIntersecting;
        if (sliderVisible) {
          currentScrollY = window.scrollY || window.pageYOffset || 0;
          metricsDirty = true;
          measureLayout();
          queueProgressUpdate();
        }
      },
      { rootMargin: "125% 0px 125% 0px", threshold: 0 }
    );
    sliderObserver.observe(sliderEl);
    layoutObserver = new ResizeObserver(() => {
      scheduleLayoutRefresh();
    });
    layoutObserver.observe(sliderEl);
    sections.forEach((section) => section && layoutObserver.observe(section));
    contentRefs.forEach((content) => content && layoutObserver.observe(content));
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    window.visualViewport?.addEventListener("resize", handleResize);
    sliderEl?.addEventListener("touchstart", handleTouchStart, { passive: true });
    sliderEl?.addEventListener("touchmove", handleTouchMove, { passive: true });
    sliderEl?.addEventListener("touchend", handleTouchEnd, { passive: true });
  });

  onDestroy(() => {
    if (!browser) return;
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", handleResize);
    window.visualViewport?.removeEventListener("resize", handleResize);
    sliderEl?.removeEventListener("touchstart", handleTouchStart);
    sliderEl?.removeEventListener("touchmove", handleTouchMove);
    sliderEl?.removeEventListener("touchend", handleTouchEnd);
    sliderObserver?.disconnect();
    layoutObserver?.disconnect();
    clearTimeout(resizeTimeout);
    clearTimeout(settleTimer);
    cancelAnimationFrame(progressRaf);
    cancelAnimationFrame(resizeRaf);
  });
</script>

<section
  class="slider"
  bind:this={sliderEl}
  style={isMobile && stableMobileViewport ? `--current-viewport-height:${stableMobileViewport}px;` : ""}
>
  <div class="sticky" bind:this={stickyEl}>
    <div class="backgrounds">
      <div class="bottom-shade" aria-hidden="true"></div>

      <div class="progress-nav">
        {#each slides as slide, i}
          <button
            class="segment"
            class:is-active={activeIndex === i}
            type="button"
            aria-label={`Aller au slide ${slide.navTitle}`}
            aria-pressed={activeIndex === i}
            on:click={() => jumpToSlide(i)}
          >
            <div class="segment-line">
              <div class="segment-fill" style="width:{fills[i]}%"></div>
            </div>

            <div class="segment-label">
              <span class="num">{slide.number}</span>
              <span class="segment-title">{slide.navTitle}</span>
            </div>
          </button>
        {/each}
      </div>

      {#each slides as slide, i}
        <div class="bg" class:active={activeIndex === i}>
          <img
            src={slide.image}
            alt=""
            decoding="async"
            draggable="false"
            style={`transform:scale(${bgScales[i].toFixed(3)})`}
          />
        </div>
      {/each}
    </div>

    <div class="text-layer" bind:this={textLayerEl} aria-live="polite">
      {#each slides as slide, i}
        <div class="text-slide" class:active={activeIndex === i}>
          <p>{slide.description}</p>
        </div>
      {/each}
    </div>
  </div>

  <div class="mobile-progress-shell" aria-hidden="true">
    <div class="mobile-progress">
      <div class="segment-line mobile-progress-line">
        <div class="segment-fill" style="width:{displayedFills[activeIndex]}%"></div>
      </div>

      {#key activeIndex}
        <div class="mobile-progress-meta">
          <span class="mobile-progress-num">{slides[activeIndex].number}</span>
          <span class="mobile-progress-title">{slides[activeIndex].navTitle}</span>
        </div>
      {/key}
    </div>
  </div>

  <div class="slides">
    <div class="mask-anchor" bind:this={maskAnchorEl} aria-hidden="true"></div>

    <div class="mobile-text-sticky-shell" aria-live="polite">
      <div class="mobile-text-overlay">
        {#each slides as slide, i}
          <div class="mobile-text-panel" class:active={activeIndex === i}>
            <span class="mobile-text-num">{slide.number}</span>
            <p>{slide.description}</p>
          </div>
        {/each}
      </div>
    </div>

    {#each slides as slide, i}
      <section class="slide" bind:this={sections[i]} data-index={i}>
        <div class="content-clip">
          <div
            class="content"
            bind:this={contentRefs[i]}
            style={
              isMobile
                ? ""
                : `clip-path: inset(0 0 ${contentClipInsets[i]}px 0); -webkit-clip-path: inset(0 0 ${contentClipInsets[i]}px 0);`
            }
          >
            <div class="number">{slide.number}</div>
            <h2>{slide.title}</h2>
          </div>
        </div>
      </section>
    {/each}

    <div class="tail" aria-hidden="true"></div>
  </div>
</section>

<style>
  .slider {
    --current-viewport-height: var(--viewport-height);
    --slider-progress-bottom: max(2rem, var(--safe-bottom-offset));
    --slider-text-bottom: calc(var(--slider-progress-bottom) + 5rem);
    --slider-mask-top: 72vh;
    --slider-mask-top-mobile: 76lvh;
    position: relative;
    width: 100%;
    min-height: 360vh;
  }

  .sticky {
    position: sticky;
    top: 0;
    height: var(--current-viewport-height);
    overflow: hidden;
    background: #050b14;
    isolation: isolate;
    z-index: 0;
    contain: paint;
    transform: translateZ(0);
  }

  .sticky::before {
    content: "";
    position: absolute;
    inset: 0;
    background: #050b14;
    z-index: 0;
  }

  .backgrounds {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: #050b14;
    contain: paint;
  }

  .bottom-shade {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 32vh;
    height: 32svh;
    z-index: 3;
    pointer-events: none;
    background: linear-gradient(
      to top,
      rgba(5, 11, 20, 0.9) 0%,
      rgba(5, 11, 20, 0.72) 28%,
      rgba(5, 11, 20, 0.38) 58%,
      rgba(5, 11, 20, 0) 100%
    );
  }

  .bg {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 900ms ease;
    z-index: 1;
    background: #050b14;
    will-change: opacity;
  }

  .bg.active {
    opacity: 1;
    z-index: 2;
  }

  .bg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    inset: 0;
    display: block;
    transition: transform 120ms linear;
    will-change: transform;
    backface-visibility: hidden;
    transform-origin: center center;
  }

  .slides {
    position: relative;
    z-index: 3;
    margin-top: calc(-1 * var(--current-viewport-height));
    contain: paint;
  }

  .mask-anchor {
    position: sticky;
    top: var(--slider-mask-top);
    height: 0;
    pointer-events: none;
  }

  .slide {
    min-height: var(--current-viewport-height);
    display: flex;
    align-items: center;
    padding: 8rem 4rem;
    position: relative;
  }

  .tail {
    height: 60vh;
  }

  .content-clip {
    max-width: 70%;
    overflow: hidden;
    position: relative;
    z-index: 5;
  }

  .content {
    position: relative;
    z-index: 5;
    will-change: clip-path;
    backface-visibility: hidden;
    transform: translateZ(0);
  }

  .text-layer {
    position: absolute;
    left: 4rem;
    right: 4rem;
    bottom: var(--slider-text-bottom);
    z-index: 5;
    pointer-events: none;
  }

  .text-slide {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
    transition: opacity 900ms ease;
  }

  .text-slide.active {
    opacity: 1;
  }

  .text-slide p {
    margin: 0;
  }

  .number {
    opacity: 0.7;
    margin-bottom: 1rem;
    font-size: 1.2rem;
    position: relative;
    z-index: 5;
    font-family: "Clash Display", sans-serif;
    font-style: normal;
    font-weight: 300;
  }

  h2 {
    font-family: "Clash Display", sans-serif;
    font-style: normal;
    font-size: clamp(4rem, 7vw, 8rem);
    line-height: 0.95;
    font-weight: 300;
    white-space: pre-line;
    margin: 0;
    color: #f5f1e8;
    letter-spacing: 0em;
    position: relative;
    z-index: 5;
    text-shadow: 0 12px 34px rgba(0, 0, 0, 0.32);
  }

  p {
    margin-top: 2rem;
    font-family: "Clash Display", sans-serif;
    font-weight: 300;
    font-size: 1.2rem;
    max-width: 520px;
    opacity: 1;
    position: relative;
    z-index: 5;
    color: #d6d6d6;
    text-shadow: 0 10px 28px rgba(0, 0, 0, 0.28);
  }

  .progress-nav {
    position: absolute;
    left: 2rem;
    right: 2rem;
    bottom: var(--slider-progress-bottom);
    z-index: 4;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.7rem;
  }

  .segment {
    appearance: none;
    border: 0;
    padding: 0;
    background: transparent;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .segment-line {
    position: relative;
    height: 2px;
    background: rgba(255, 255, 255, 0.16);
    overflow: hidden;
    margin-bottom: 0.7rem;
  }

  .segment-fill {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 0%;
    background: white;
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.2);
    transition: width 80ms linear;
  }

  .segment-label {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    font-size: 0.9rem;
    opacity: 0.85;
    line-height: 1.05;
    min-width: 0;
  }

  .segment .num {
    flex: 0 0 auto;
    opacity: 0.72;
    font-family: "Clash Display", sans-serif;
    font-style: normal;
    font-weight: 500;
  }

  .segment-title {
    display: block;
    min-width: 0;
    font-family: "Clash Display", sans-serif;
    font-style: normal;
    font-weight: 300;
    font-size: clamp(0.62rem, 0.82vw, 0.78rem);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    max-width: none;
    white-space: nowrap;
  }

  .segment:hover .segment-title,
  .segment.is-active .segment-title {
    color: #fff;
  }

  .segment:focus-visible {
    outline: 2px solid rgba(244, 239, 230, 0.9);
    outline-offset: 4px;
  }

  .mobile-progress-shell {
    display: none;
    contain: paint;
  }

  .mobile-text-overlay {
    display: none;
  }

  .mobile-text-sticky-shell {
    display: none;
    contain: paint;
  }

  .mobile-progress {
    display: none;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 6;
    padding: 0.55rem 1.25rem calc(0.65rem + env(safe-area-inset-bottom));
    background: #000;
    box-shadow: 0 -12px 0 #000;
    transform: translateZ(0);
  }

  .mobile-progress-line {
    margin-bottom: 0.55rem;
  }

  .mobile-progress-meta {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    animation: mobileWipeFlipUp 0.48s cubic-bezier(0.22, 1, 0.36, 1);
    transform-origin: center bottom;
  }

  .mobile-progress-num {
    flex: 0 0 auto;
    opacity: 0.72;
    font-size: 0.92rem;
    font-family: "Clash Display", sans-serif;
    font-style: normal;
    font-weight: 500;
  }

  .mobile-progress-title {
    min-width: 0;
    font-family: "Clash Display", sans-serif;
    font-size: 0.72rem;
    font-weight: 300;
    letter-spacing: 0.04em;
    line-height: 1.1;
    text-transform: uppercase;
  }

  @keyframes mobileWipeFlipUp {
    0% {
      opacity: 0;
      transform: translate3d(0, 14px, 0) rotateX(-68deg);
      clip-path: inset(100% 0 0 0);
    }
    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0) rotateX(0deg);
      clip-path: inset(0 0 0 0);
    }
  }

  @media (max-width: 900px) {
    .slider {
      min-height: 360vh;
    }

    .slide {
      min-height: var(--current-viewport-height);
      padding: 7rem 2rem 11rem;
      align-items: center;
    }

    .text-layer {
      left: 2rem;
      right: 2rem;
    }

    .content-clip {
      max-width: 100%;
      overflow: visible;
    }

    .progress-nav {
      grid-template-columns: repeat(3, 1fr);
      left: 1.25rem;
      right: 1.25rem;
      bottom: max(1.5rem, var(--safe-bottom-offset));
      gap: 0.85rem;
    }

    h2 {
      font-size: clamp(3rem, 15vw, 5rem);
    }

    p {
      font-size: 1.14rem;
    }

    .segment-title {
      font-size: 0.66rem;
    }
  }

  @media (max-width: 700px) {
    .slider {
      --mobile-bg-bleed: 72px;
      --slider-progress-bottom: max(1.1rem, calc(env(safe-area-inset-bottom, 0px) + 0.9rem));
      --slider-text-bottom: calc(var(--slider-progress-bottom) + 1.2rem);
      touch-action: pan-y;
    }

    .slider {
      min-height: 300vh;
    }

    .sticky::before,
    .backgrounds,
    .bg {
      inset: 0 0 calc(-1 * var(--mobile-bg-bleed)) 0;
    }

    .bg img {
      inset: 0 0 calc(-1 * var(--mobile-bg-bleed)) 0;
      height: calc(100% + var(--mobile-bg-bleed));
    }

    .bottom-shade {
      bottom: calc(-1 * var(--mobile-bg-bleed));
    }

    .bg {
      transition: opacity 420ms ease;
    }

    .bg img {
      transition: transform 220ms ease-out;
    }

    .text-slide,
    .mobile-text-panel {
      transition-duration: 240ms;
    }

    .mobile-progress-meta {
      transition: none;
      animation: none;
    }

    .bottom-shade {
      height: 38vh;
      height: 38svh;
    }

    .slide {
      padding: 6.5rem 1.25rem 5.75rem;
      min-height: var(--current-viewport-height);
      align-items: center;
      touch-action: pan-y;
    }

    .text-layer {
      display: none;
    }

    .mobile-text-sticky-shell {
      --mobile-text-panel-height: 10.2rem;
      --mobile-text-panel-bleed: 2rem;
      --mobile-text-panel-lift: 1rem;
      display: block;
      position: absolute;
      inset: 0;
      z-index: 9;
      pointer-events: none;
    }

    .mobile-text-overlay {
      display: block;
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      height: var(--current-viewport-height);
      contain: paint;
      transform: translateZ(0);
    }

    .mobile-text-overlay::before {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: calc(var(--mobile-text-panel-lift) - var(--mobile-text-panel-bleed));
      height: calc(var(--mobile-text-panel-height) + var(--mobile-text-panel-bleed) + env(safe-area-inset-bottom, 0px));
      background: #000;
    }

    .mobile-text-panel {
      position: absolute;
      left: 0;
      right: 0;
      top: calc(
        var(--current-viewport-height) - var(--mobile-text-panel-height) - env(safe-area-inset-bottom, 0px) - var(--mobile-text-panel-lift)
      );
      padding: 0.95rem 1.25rem 0 1.5rem;
      display: grid;
      grid-template-columns: 2.45rem minmax(0, 1fr);
      column-gap: 1rem;
      align-items: start;
      opacity: 0;
      transition: opacity 900ms ease;
      will-change: opacity;
      transform: translateZ(0);
    }

    .mobile-text-panel.active {
      opacity: 1;
    }

    .mobile-text-num {
      display: block;
      margin: 0;
      grid-column: 1;
      grid-row: 1;
      color: #fff;
      font-size: 1.3rem;
      font-family: "Clash Display", sans-serif;
      font-style: normal;
      font-weight: 500;
      opacity: 1;
    }

    .mobile-text-panel p {
      margin: 0;
      grid-column: 2;
      grid-row: 1;
      font-family: "Clash Display", sans-serif;
      font-weight: 300;
      font-size: 0.96rem;
      max-width: 38ch;
    }

    .tail {
      height: 0;
    }

    .content-clip,
    .content,
    .number,
    h2,
    p {
      pointer-events: none;
      touch-action: pan-y;
      -webkit-user-select: none;
      user-select: none;
    }

    .content-clip {
      overflow: visible;
    }

    .content .number {
      display: none;
    }

    .progress-nav {
      display: none;
    }

    h2 {
      font-size: clamp(2.95rem, 13.8vw, 4.35rem);
    }

  }

  @media (prefers-reduced-motion: reduce) {
    .bg,
    .bg img,
    .mobile-progress-meta {
      transition: none;
      animation: none;
    }
  }
</style>
