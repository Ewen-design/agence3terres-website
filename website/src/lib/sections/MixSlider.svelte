<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";

  const slides = [
    {
      number: "01",
      navTitle: "CRÉATION DE LOGO",
      title: "CRÉATION\nDE LOGO",
      description: "Nous révélons l’essence des marques et façonnons des identités fortes, cohérentes et mémorables. De la stratégie à l’identité visuelle, chaque élément est pensé pour créer une marque singulière et durable.",
      image: "/images/telephone2_parfum.webp"
    },
    {
      number: "02",
      navTitle: "BRAND IDENTITY",
      title: "BRAND\nIDENTITY",
      description: "Nous structurons des identités de marque complètes, capables d’aligner vision, ton, image et système visuel dans une direction claire et durable.",
      image: "/images/telephone2.webp"
    },
    {
      number: "03",
      navTitle: "UI DESIGN",
      title: "UI\nDESIGN",
      description: "Nous concevons des interfaces élégantes, lisibles et sensibles, pensées pour traduire l’univers d’une marque dans des expériences digitales fluides et immersives.",
      image: "/images/parfum4.webp"
    },
    {
      number: "04",
      navTitle: "UX RESEARCH",
      title: "UX\nRESEARCH",
      description: "Nous analysons les usages, les parcours et les points de friction pour construire des expériences utiles, intuitives et ancrées dans les attentes réelles des publics.",
      image: "/images/telephone2.webp"
    },
    {
      number: "05",
      navTitle: "DIRECTION ARTISTIQUE",
      title: "DIRECTION\nARTISTIQUE",
      description: "Nous définissons des directions artistiques fortes pour donner aux marques une présence cohérente, désirable et reconnaissable sur tous leurs supports.",
      image: "/images/parfum3.webp"
    },
    {
      number: "06",
      navTitle: "MOTION CONCEPT",
      title: "MOTION\nCONCEPT",
      description: "Nous imaginons des principes de mouvement et des récits visuels animés qui renforcent l’impact d’une identité et prolongent son expression dans le digital.",
      image: "/images/parfum2.webp"
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
  let fillFrame = 0;
  let maskAnchorEl;
  let sliderEl;
  let isMobile = false;
  let prefersReducedMotion = false;
  let resizeTimeout;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchDeltaX = 0;
  let touchDeltaY = 0;
  const mobileFillEase = 0.18;
  const firstSlideShadeMin = 0;

  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
  const getBottomShadeBackground = (strength) => `linear-gradient(
    to top,
    rgba(5, 11, 20, ${(0.9 * strength).toFixed(3)}) 0%,
    rgba(5, 11, 20, ${(0.72 * strength).toFixed(3)}) 28%,
    rgba(5, 11, 20, ${(0.38 * strength).toFixed(3)}) 58%,
    rgba(5, 11, 20, 0) 100%
  )`;

  function syncHeaderTone(nextActiveIndex = activeIndex) {
    if (!browser || !sliderEl) return;

    const rect = sliderEl.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const sliderIsStickyActive = rect.top <= 0 && rect.bottom >= vh;
    const tone = sliderIsStickyActive
      ? nextActiveIndex === 0
        ? "dark"
        : "light"
      : null;

    window.dispatchEvent(
      new CustomEvent("mixslider:header-tone", {
        detail: { tone }
      })
    );
  }

  function checkMobile() {
    isMobile = window.innerWidth <= 700;
  }

  function stopFillAnimation() {
    if (fillFrame) {
      cancelAnimationFrame(fillFrame);
      fillFrame = 0;
    }
  }

  function animateDisplayedFills() {
    if (!isMobile || prefersReducedMotion) {
      displayedFills = [...fills];
      stopFillAnimation();
      return;
    }

    if (fillFrame) return;

    const step = () => {
      let done = true;
      const nextDisplayed = displayedFills.map((value, index) => {
        const target = fills[index];
        const delta = target - value;

        if (Math.abs(delta) < 0.2) {
          return target;
        }

        done = false;
        return value + delta * mobileFillEase;
      });

      displayedFills = nextDisplayed;

      if (!done) {
        fillFrame = requestAnimationFrame(step);
      } else {
        fillFrame = 0;
      }
    };

    fillFrame = requestAnimationFrame(step);
  }

  function updateProgress() {
    const vh = window.innerHeight || 1;
    const next = slides.map(() => 0);
    const nextScales = slides.map(() => (prefersReducedMotion ? 1 : isMobile ? 1.01 : 1.02));
    const nextClipInsets = slides.map(() => 0);
    const progressLine = vh * (isMobile ? 0.56 : 0.5);
    const fallbackRevealLine = vh * (isMobile ? 0.74 : 0.8);
    const revealLine = maskAnchorEl?.getBoundingClientRect().top ?? fallbackRevealLine;
    let nextActiveIndex = activeIndex;
    let closestDistance = Number.POSITIVE_INFINITY;

    sections.forEach((section, i) => {
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const progress = clamp((progressLine - rect.top) / Math.max(rect.height, 1), 0, 1);
      const distanceToCenter = Math.abs(rect.top + rect.height * 0.5 - progressLine);

      next[i] = progress * 100;
      if (!prefersReducedMotion) {
        nextScales[i] = (isMobile ? 1.01 : 1.02) + progress * (isMobile ? 0.03 : 0.08);
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

      nextClipInsets[i] = Math.max(rect.height - visibleHeight, 0);
    });

    activeIndex = nextActiveIndex;
    fills = next;
    animateDisplayedFills();
    bgScales = nextScales;
    contentClipInsets = nextClipInsets;
    syncHeaderTone(nextActiveIndex);
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateProgress);
    }
  }

  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      checkMobile();
      onScroll();
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
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    sliderEl?.addEventListener("touchstart", handleTouchStart, { passive: true });
    sliderEl?.addEventListener("touchmove", handleTouchMove, { passive: true });
    sliderEl?.addEventListener("touchend", handleTouchEnd, { passive: true });
  });

  onDestroy(() => {
    if (!browser) return;
    window.dispatchEvent(
      new CustomEvent("mixslider:header-tone", {
        detail: { tone: null }
      })
    );
    stopFillAnimation();
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", handleResize);
    sliderEl?.removeEventListener("touchstart", handleTouchStart);
    sliderEl?.removeEventListener("touchmove", handleTouchMove);
    sliderEl?.removeEventListener("touchend", handleTouchEnd);
    clearTimeout(resizeTimeout);
  });
</script>

<section class="slider" bind:this={sliderEl}>
  <div class="sticky">
    <div class="backgrounds">
      <div
        class="bottom-shade"
        aria-hidden="true"
        style={`background: ${getBottomShadeBackground(firstSlideShadeMin + (1 - firstSlideShadeMin) * clamp(fills[0] / 100))};`}
      ></div>

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
              <div class="segment-fill" style={`transform: scaleX(${fills[i] / 100})`}></div>
            </div>

            <div class="segment-label">
              <span class="num">{slide.number}</span>
              <span class="segment-title">{slide.navTitle}</span>
            </div>
          </button>
        {/each}
      </div>

      {#each slides as slide, i}
        <div
          class="bg"
          class:active={activeIndex === i}
        >
          <img
            src={slide.image}
            alt=""
            decoding="async"
            draggable="false"
            style={`transform:scale(${bgScales[i].toFixed(3)})`}
          >
          <div class="overlay"></div>
        </div>
      {/each}
    </div>
  </div>

  <div class="mobile-progress-shell" aria-hidden="true">
    <div class="mobile-progress">
      <div class="segment-line mobile-progress-line">
        <div class="segment-fill" style={`transform: scaleX(${displayedFills[activeIndex] / 100})`}></div>
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

    {#each slides as slide, i}
      <section
        class="slide"
        class:first-slide={i === 0}
        bind:this={sections[i]}
        data-index={i}
      >
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
            <p>{slide.description}</p>
          </div>
        </div>
      </section>
    {/each}

    <div class="tail" aria-hidden="true"></div>
  </div>
</section>

<style>
  :global(body) {
    margin: 0;
    background: #050b14;
    color: white;
    font-family: Inter, sans-serif;
  }

  .slider {
    position: relative;
    width: 100%;
    min-height: 660vh;
  }

  .sticky {
    position: sticky;
    top: 0;
    height: var(--viewport-height);
    overflow: hidden;
    background: #050b14;
    isolation: isolate;
    z-index: 0;
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
    transition: background 320ms ease;
  }

  .bg {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 900ms ease;
    z-index: 1;
    background: #050b14;
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
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.2);
    pointer-events: none;
  }

  .slides {
    position: relative;
    z-index: 3;
    margin-top: calc(-1 * var(--viewport-height));
  }

  .slide {
    min-height: var(--viewport-height);
    display: flex;
    align-items: center;
    padding: 8rem 4rem;
    position: relative;
  }

  .mask-anchor {
    position: sticky;
    top: 88vh;
    top: 88svh;
    height: 0;
    pointer-events: none;
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

  .number {
    opacity: 0.7;
    margin-bottom: 1rem;
    font-size: 1.2rem;
    position: relative;
    z-index: 5;
    font-family: "Titre italic", serif;
    font-style: italic;
  }

  h2 {
    font-family: "Titre italic", serif;
    font-style: italic;
    font-size: clamp(4rem, 7vw, 8rem);
    line-height: 0.95;
    font-weight: 100;
    white-space: pre-line;
    margin: 0;
    color: #f5f1e8;
    letter-spacing: 0em;
    position: relative;
    z-index: 5;
  }

  .first-slide h2 {
    color: #353535;
  }

  p {
    margin-top: 2rem;
    font-size: 1.2rem;
    max-width: 480px;
    opacity: 0.9;
    position: relative;
    z-index: 5;
    color: rgba(244, 244, 244, 0.86);
  }

  .first-slide .number {
    opacity: 1;
    color: #4A4A4A;
    text-shadow: none;
  }

  .first-slide p {
    opacity: 1;
    color: #4A4A4A;
    text-shadow: none;
  }

  .progress-nav {
    position: absolute;
    left: 2rem;
    right: 2rem;
    bottom: max(2rem, var(--safe-bottom-offset));
    z-index: 5;
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 0.65rem;
  }

  .segment {
    display: block;
    width: 100%;
    appearance: none;
    -webkit-appearance: none;
    border: 0;
    border-radius: 0;
    padding: 0;
    background: transparent;
    box-shadow: none;
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
    width: 100%;
    background: white;
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.2);
    transform-origin: left center;
    transition: none;
    will-change: transform;
    backface-visibility: hidden;
    transform: translateZ(0);
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
    font-family: "Titre italic", serif;
    font-style: italic;
  }

  .segment-title {
    display: block;
    min-width: 0;
    font-family: "General Sans", sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: clamp(0.58rem, 0.72vw, 0.72rem);
    letter-spacing: 0.035em;
    text-transform: uppercase;
    line-height: 1.15;
    text-wrap: balance;
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
    font-family: "Titre italic", serif;
    font-style: italic;
  }

  .mobile-progress-title {
    min-width: 0;
    font-family: "General Sans", sans-serif;
    font-size: 0.72rem;
    font-weight: 400;
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

  @media (max-width: 1100px) {
    .slide {
      padding: 7rem 2.5rem;
    }

    .content-clip {
      max-width: 82%;
    }

    .progress-nav {
      grid-template-columns: repeat(3, 1fr);
      row-gap: 1.25rem;
      gap: 1.1rem 0.9rem;
    }

    .segment-title {
      font-size: 0.68rem;
    }
  }

  @media (max-width: 800px) {
    .slider {
      min-height: 680vh;
    }

    .sticky {
      height: var(--viewport-height);
    }

    .slide {
      min-height: var(--viewport-height);
      padding: 7rem 2rem 11rem;
      align-items: center;
    }

    .content-clip {
      max-width: 100%;
      overflow: visible;
    }

    h2 {
      font-size: clamp(3rem, 15vw, 5rem);
    }

    p {
      font-size: 1rem;
    }

    .progress-nav {
      grid-template-columns: repeat(2, 1fr);
      left: 1.25rem;
      right: 1.25rem;
      bottom: max(1.5rem, var(--safe-bottom-offset));
      gap: 1rem 0.8rem;
    }

    .segment-title {
      font-size: 0.66rem;
    }
  }

  @media (max-width: 700px) {
    .slider {
      min-height: 600vh;
    }

    .mobile-progress-meta {
      transition: none;
      animation: none;
    }

    .bottom-shade {
      height: 40vh;
      height: 40svh;
    }

    .slide {
      padding: 6.5rem 1.25rem 5.75rem;
      min-height: var(--viewport-height);
      align-items: center;
    }

    .tail {
      height: 0;
    }

    .progress-nav {
      display: none;
    }

    .mobile-progress-shell,
    .mobile-progress {
      display: none !important;
    }

    h2 {
      font-size: clamp(2.6rem, 13vw, 4rem);
    }

    p {
      margin-top: 1.25rem;
      font-size: 0.95rem;
      max-width: 100%;
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
