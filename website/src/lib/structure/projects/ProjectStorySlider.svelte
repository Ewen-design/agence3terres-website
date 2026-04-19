<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";

  export let slides = [];
  let sections = [];
  let contentRefs = [];
  let activeIndex = 0;
  let bgScales = slides.map(() => 1.02);
  let contentClipInsets = slides.map(() => 0);
  let ticking = false;
  let maskAnchorEl;
  let sliderEl;
  let isMobile = false;
  let prefersReducedMotion = false;
  let resizeTimeout;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchDeltaX = 0;
  let touchDeltaY = 0;

  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));

  $: sections.length = slides.length;
  $: contentRefs.length = slides.length;
  $: sliderHeightStyle = `--slider-height: ${Math.max(slides.length * 100 + 80, 320)}vh;`;

  function checkMobile() {
    isMobile = window.innerWidth <= 700;
  }

  function updateProgress() {
    const vh = window.innerHeight || 1;
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
    bgScales = nextScales;
    contentClipInsets = nextClipInsets;
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
    if (!browser) return;
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
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", handleResize);
    sliderEl?.removeEventListener("touchstart", handleTouchStart);
    sliderEl?.removeEventListener("touchmove", handleTouchMove);
    sliderEl?.removeEventListener("touchend", handleTouchEnd);
    clearTimeout(resizeTimeout);
  });
</script>

<section class="project-slider" bind:this={sliderEl} style={sliderHeightStyle}>
  <div class="project-slider__sticky">
    <div class="project-slider__backgrounds">
      <div class="project-slider__shade"></div>

      {#each slides as slide, i}
        <div class="project-slider__bg" class:is-active={activeIndex === i}>
          <img
            src={slide.image}
            alt=""
            decoding="async"
            draggable="false"
            style={`transform:scale(${bgScales[i].toFixed(3)})`}
          />
          <div class="project-slider__bg-overlay"></div>
        </div>
      {/each}
    </div>
  </div>

  <div class="project-slider__slides">
    <div class="project-slider__mask-anchor" bind:this={maskAnchorEl} aria-hidden="true"></div>

    {#each slides as slide, i}
      <section class="project-slider__slide" bind:this={sections[i]}>
        <div class="project-slider__content-clip">
          <div
            class="project-slider__content"
            bind:this={contentRefs[i]}
            style={
              isMobile
                ? ""
                : `clip-path: inset(0 0 ${contentClipInsets[i]}px 0); -webkit-clip-path: inset(0 0 ${contentClipInsets[i]}px 0);`
            }
          >
            <h3>{slide.title}</h3>
            <p>{slide.text}</p>
          </div>
        </div>
      </section>
    {/each}

    <div class="project-slider__tail" aria-hidden="true"></div>
  </div>
</section>

<style>
  .project-slider {
    position: relative;
    width: 100%;
    min-height: var(--slider-height, 420vh);
    background: #050b14;
    color: #f5f1e8;
  }

  .project-slider__sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    height: 100svh;
    overflow: hidden;
    background: #050b14;
    isolation: isolate;
  }

  .project-slider__backgrounds {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: #050b14;
  }

  .project-slider__bg {
    position: absolute;
    inset: 0;
    opacity: 0;
    z-index: 1;
    background: #050b14;
    transition: opacity 900ms ease;
  }

  .project-slider__bg.is-active {
    opacity: 1;
    z-index: 2;
  }

  .project-slider__bg img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 120ms linear;
  }

  .project-slider__bg-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.2);
    pointer-events: none;
  }

  .project-slider__shade {
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

  .project-slider__slides {
    position: relative;
    z-index: 3;
    margin-top: -100vh;
    margin-top: -100svh;
  }

  .project-slider__mask-anchor {
    position: sticky;
    top: 88vh;
    top: 88svh;
    height: 0;
    pointer-events: none;
  }

  .project-slider__slide {
    min-height: 100vh;
    min-height: 100svh;
    display: flex;
    align-items: center;
    padding: 8rem 4rem;
  }

  .project-slider__content-clip {
    max-width: 70%;
    overflow: hidden;
    position: relative;
    z-index: 5;
  }

  .project-slider__content {
    position: relative;
    z-index: 5;
    max-width: 32rem;
    will-change: clip-path;
    backface-visibility: hidden;
    transform: translateZ(0);
  }

  .project-slider__content h3 {
    margin: 0;
    font-family: "Titre italic", serif;
    font-style: italic;
    font-weight: 100;
    font-size: clamp(4rem, 7vw, 8rem);
    line-height: 0.95;
    letter-spacing: 0;
    color: #f5f1e8;
    white-space: pre-line;
  }

  .project-slider__content p {
    margin: 2rem 0 0;
    max-width: 30rem;
    font-family: "General Sans", sans-serif;
    font-size: 1.2rem;
    line-height: 1.55;
    color: rgba(244, 244, 244, 0.86);
  }

  .project-slider__tail {
    height: 60vh;
  }

  @media (max-width: 1100px) {
    .project-slider__slide {
      padding: 7rem 2.5rem;
    }

    .project-slider__content-clip {
      max-width: 82%;
    }
  }

  @media (max-width: 800px) {
    .project-slider {
      min-height: max(var(--slider-height, 420vh), 460vh);
    }

    .project-slider__slide {
      padding: 7rem 2rem 11rem;
    }

    .project-slider__content-clip {
      max-width: 100%;
      overflow: visible;
    }

    .project-slider__content h3 {
      font-size: clamp(3rem, 15vw, 5rem);
    }

    .project-slider__content p {
      font-size: 1rem;
      max-width: 100%;
    }
  }

  @media (max-width: 700px) {
    .project-slider {
      min-height: max(var(--slider-height, 420vh), 420vh);
    }

    .project-slider__shade {
      height: 40vh;
      height: 40svh;
    }

    .project-slider__slide {
      padding: 6.5rem 1.25rem 6rem;
    }

    .project-slider__content h3 {
      font-size: clamp(2.6rem, 13vw, 4rem);
    }

    .project-slider__content p {
      margin-top: 1.25rem;
      font-size: 0.95rem;
    }

    .project-slider__tail {
      height: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .project-slider__bg,
    .project-slider__bg img {
      transition: none;
    }
  }
</style>
