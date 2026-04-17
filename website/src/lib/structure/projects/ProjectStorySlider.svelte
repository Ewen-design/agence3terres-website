<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";

  export let slides = [];
  export let title = "";

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
  const mobileFillEase = 0.18;

  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));

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
        nextScales[i] = (isMobile ? 1.01 : 1.02) + progress * (isMobile ? 0.03 : 0.07);
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

  onMount(() => {
    if (!browser) return;
    prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    checkMobile();
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", handleResize);
  });

  onDestroy(() => {
    if (!browser) return;
    stopFillAnimation();
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", handleResize);
    clearTimeout(resizeTimeout);
  });
</script>

<section class="project-slider" bind:this={sliderEl}>
  <div class="project-slider__header">
    <h2>{title}</h2>
  </div>

  <div class="project-slider__sticky">
    <div class="project-slider__backgrounds">
      <div class="project-slider__shade"></div>

      <div class="project-slider__nav">
        {#each slides as slide, i}
          <button
            class="project-slider__segment"
            class:is-active={activeIndex === i}
            type="button"
            aria-label={`Aller au slide ${slide.label}`}
            aria-pressed={activeIndex === i}
            on:click={() => jumpToSlide(i)}
          >
            <div class="project-slider__line">
              <div class="project-slider__fill" style={`transform: scaleX(${fills[i] / 100})`}></div>
            </div>

            <div class="project-slider__segment-label">
              <span class="project-slider__num">{slide.number}</span>
              <span class="project-slider__label">{slide.label}</span>
            </div>
          </button>
        {/each}
      </div>

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

  <div class="project-slider__mobile-progress" aria-hidden="true">
    <div class="project-slider__mobile-line">
      <div class="project-slider__fill" style={`transform: scaleX(${displayedFills[activeIndex] / 100})`}></div>
    </div>

    {#key activeIndex}
      <div class="project-slider__mobile-meta">
        <span>{slides[activeIndex].number}</span>
        <span>{slides[activeIndex].label}</span>
      </div>
    {/key}
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
            <div class="project-slider__content-num">{slide.number}</div>
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
    min-height: 420vh;
    background: #050505;
  }

  .project-slider__header {
    position: relative;
    z-index: 2;
    padding: clamp(2rem, 5vw, 3.6rem) clamp(1.2rem, 3vw, 2.2rem) 0;
    max-width: 26rem;
  }

  .project-slider__header h2 {
    margin: 0;
    font-family: "Titre italic", serif;
    font-style: italic;
    font-size: clamp(2.3rem, 4.5vw, 4.2rem);
    line-height: 0.93;
    letter-spacing: -0.05em;
    color: #f5f1e8;
  }

  .project-slider__sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    height: 100svh;
    overflow: hidden;
    background: #050505;
    isolation: isolate;
  }

  .project-slider__backgrounds,
  .project-slider__bg {
    position: absolute;
    inset: 0;
  }

  .project-slider__bg {
    opacity: 0;
    transition: opacity 0.7s ease;
  }

  .project-slider__bg.is-active {
    opacity: 1;
  }

  .project-slider__bg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.5s ease;
  }

  .project-slider__bg-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.16) 100%),
      linear-gradient(90deg, rgba(0, 0, 0, 0.18) 0%, rgba(0, 0, 0, 0.04) 45%, rgba(0, 0, 0, 0.14) 100%);
  }

  .project-slider__shade {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 68%, rgba(0, 0, 0, 0.26) 100%);
  }

  .project-slider__nav {
    position: absolute;
    top: clamp(1.2rem, 3vw, 1.8rem);
    right: clamp(1.2rem, 3vw, 2.2rem);
    z-index: 2;
    display: grid;
    gap: 0.95rem;
    width: min(21rem, calc(100vw - 2.4rem));
  }

  .project-slider__segment {
    display: grid;
    gap: 0.5rem;
    border: 0;
    padding: 0;
    background: transparent;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .project-slider__line,
  .project-slider__mobile-line {
    height: 1px;
    background: rgba(245, 241, 232, 0.18);
    overflow: hidden;
  }

  .project-slider__fill {
    width: 100%;
    height: 100%;
    background: #f5f1e8;
    transform-origin: left center;
  }

  .project-slider__segment-label,
  .project-slider__mobile-meta {
    display: flex;
    gap: 0.7rem;
    align-items: baseline;
  }

  .project-slider__num,
  .project-slider__content-num,
  .project-slider__mobile-meta span:first-child {
    font-family: "General Sans", sans-serif;
    font-size: 0.8rem;
    color: rgba(245, 241, 232, 0.56);
  }

  .project-slider__label,
  .project-slider__mobile-meta span:last-child {
    font-family: "General Sans", sans-serif;
    font-size: 0.92rem;
    color: rgba(245, 241, 232, 0.84);
  }

  .project-slider__mobile-progress {
    display: none;
  }

  .project-slider__slides {
    position: relative;
    z-index: 1;
    margin-top: -100vh;
    margin-top: -100svh;
  }

  .project-slider__mask-anchor {
    position: relative;
    height: 0;
    top: 78vh;
  }

  .project-slider__slide {
    min-height: 100vh;
    min-height: 100svh;
    display: flex;
    align-items: flex-end;
    padding: clamp(1.2rem, 3vw, 2.2rem);
  }

  .project-slider__content-clip {
    width: 100%;
    overflow: visible;
  }

  .project-slider__content {
    max-width: 24rem;
    padding-bottom: clamp(1.2rem, 2.6vw, 1.8rem);
  }

  .project-slider__content h3 {
    margin: 0.35rem 0 0;
    font-family: "Titre italic", serif;
    font-style: italic;
    font-size: clamp(3.4rem, 6vw, 6rem);
    line-height: 0.9;
    letter-spacing: -0.065em;
    color: #f5f1e8;
    max-width: 8ch;
  }

  .project-slider__content p {
    margin: 0.9rem 0 0;
    max-width: 18rem;
    font-family: "General Sans", sans-serif;
    font-size: clamp(0.98rem, 1.15vw, 1.04rem);
    line-height: 1.58;
    color: rgba(245, 241, 232, 0.84);
  }

  .project-slider__tail {
    height: 100vh;
    height: 100svh;
  }

  @media (max-width: 700px) {
    .project-slider {
      min-height: 380vh;
    }

    .project-slider__header {
      padding: 1.4rem 1rem 0;
      max-width: 18rem;
    }

    .project-slider__header h2 {
      font-size: clamp(2rem, 10vw, 3.3rem);
    }

    .project-slider__nav {
      display: none;
    }

    .project-slider__mobile-progress {
      position: sticky;
      top: 1rem;
      z-index: 4;
      display: grid;
      gap: 0.55rem;
      width: calc(100% - 2rem);
      margin: 0 auto;
      transform: translateY(1rem);
    }

    .project-slider__slide {
      padding: 1rem;
    }

    .project-slider__content {
      max-width: 16rem;
      padding-bottom: 0.8rem;
    }

    .project-slider__content h3 {
      font-size: clamp(2.8rem, 15vw, 4.4rem);
    }

    .project-slider__content p {
      font-size: 0.95rem;
      max-width: 16rem;
    }
  }
</style>
