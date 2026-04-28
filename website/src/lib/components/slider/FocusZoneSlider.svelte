<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";

  export let slides = [];
  export let headerTone = null;
  export let zoneHeight = "34svh";
  export let itemHeightDesktop = "38vh";
  export let itemHeightMobile = "42svh";

  let sliderEl;
  let itemEls = [];
  let activeIndex = 0;
  let previousActiveIndex = 0;
  let numberDirection = 1;
  let numberKey = 0;
  let ticking = false;
  let resizeTimer;
  let prefersReducedMotion = false;
  let isInView = false;
  let visibilityObserver;

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const normalizeSlideLines = (description = "") => description.split("\n").filter(Boolean);

  $: activeIndex = clamp(activeIndex, 0, Math.max(slides.length - 1, 0));
  $: normalizedSlides = slides.map((slide) => ({
    ...slide,
    lines: normalizeSlideLines(slide.description)
  }));
  $: if (activeIndex !== previousActiveIndex) {
    numberDirection = activeIndex > previousActiveIndex ? 1 : -1;
    previousActiveIndex = activeIndex;
    numberKey += 1;
  }

  function syncHeaderTone() {
    if (!browser || !headerTone) return;

    window.dispatchEvent(
      new CustomEvent("mixslider:header-tone", {
        detail: { tone: isInView ? headerTone : null }
      })
    );
  }

  function updateState() {
    if (!browser || !sliderEl || itemEls.length === 0) {
      ticking = false;
      return;
    }

    const viewportHeight = window.innerHeight || 1;
    const zoneCenter = viewportHeight * 0.5;
    let nextActiveIndex = activeIndex;
    let closestDistance = Number.POSITIVE_INFINITY;

    itemEls.forEach((item, index) => {
      if (!item) return;

      const rect = item.getBoundingClientRect();
      const center = rect.top + rect.height * 0.5;
      const distance = center - zoneCenter;

      if (Math.abs(distance) < closestDistance) {
        closestDistance = Math.abs(distance);
        nextActiveIndex = index;
      }
    });

    activeIndex = nextActiveIndex;
    ticking = false;
  }

  function queueUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateState);
  }

  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(queueUpdate, 80);
  }

  onMount(() => {
    if (!browser) return;

    const motionMedia = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    prefersReducedMotion = motionMedia?.matches ?? false;

    visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isInView = !!entry?.isIntersecting;
        syncHeaderTone();
        if (isInView) queueUpdate();
      },
      { rootMargin: "-15% 0px -15% 0px", threshold: 0 }
    );

    visibilityObserver.observe(sliderEl);
    queueUpdate();

    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", handleResize);
      visibilityObserver?.disconnect();
      isInView = false;
      syncHeaderTone();
      clearTimeout(resizeTimer);
    };
  });

  onDestroy(() => {
    if (!browser) return;
    window.removeEventListener("scroll", queueUpdate);
    window.removeEventListener("resize", handleResize);
    visibilityObserver?.disconnect();
    isInView = false;
    syncHeaderTone();
    clearTimeout(resizeTimer);
  });
</script>

<section
  class="focus-zone-slider"
  bind:this={sliderEl}
  style={`--focus-zone-height:${zoneHeight}; --slide-count:${slides.length}; --item-height-desktop:${itemHeightDesktop}; --item-height-mobile:${itemHeightMobile};`}
>
  <div class="focus-zone-slider__sticky">
    <div class="focus-zone-slider__backgrounds" aria-hidden="true">
      {#each slides as slide, index}
        <div class="focus-zone-slider__bg" class:is-active={activeIndex === index}>
          <img src={slide.image} alt="" />
        </div>
      {/each}
    </div>

    <div class="focus-zone-slider__frame">
      <div class="focus-zone-slider__zone" aria-hidden="true"></div>

      <div class="focus-zone-slider__number" aria-live="polite">
        <div class="focus-zone-slider__number-window">
          {#key numberKey}
            <span
              class="focus-zone-slider__number-inner"
              class:is-forward={numberDirection >= 0}
              class:is-backward={numberDirection < 0}
            >
              {normalizedSlides[activeIndex]?.number}
            </span>
          {/key}
        </div>
      </div>
    </div>
  </div>

  <div class="focus-zone-slider__track">
    <div class="focus-zone-slider__spacer focus-zone-slider__spacer--top" aria-hidden="true"></div>

    {#each normalizedSlides as slide, index}
      <article
        class="focus-zone-slider__item"
        class:is-active={activeIndex === index}
        bind:this={itemEls[index]}
      >
        <div class="focus-zone-slider__item-inner">
          <h2>{slide.title}</h2>

          <div class="focus-zone-slider__copy" class:is-active={activeIndex === index}>
            {#each slide.lines as line, lineIndex}
              <span
                class="focus-zone-slider__copy-line"
                style={`--line-index:${lineIndex};`}
              >
                <span>{line}</span>
              </span>
            {/each}
          </div>
        </div>
      </article>
    {/each}

    <div class="focus-zone-slider__spacer focus-zone-slider__spacer--bottom" aria-hidden="true"></div>
  </div>
</section>

<style>
  .focus-zone-slider {
    --title-active: #f5f1e8;
    --title-muted: #707070;
    --copy-color: rgba(255, 255, 255, 0.86);
    --number-color: rgba(245, 241, 232, 0.96);
    --left-gutter: clamp(2rem, 7vw, 7rem);
    --right-gutter: clamp(1.6rem, 4vw, 4.6rem);
    --content-center-shift: -3.4vh;
    --content-center-shift-mobile: -2.2svh;
    position: relative;
    background: #000;
    color: var(--title-active);
  }

  .focus-zone-slider__sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: clip;
  }

  .focus-zone-slider__backgrounds,
  .focus-zone-slider__bg,
  .focus-zone-slider__bg img,
  .focus-zone-slider__frame {
    position: absolute;
    inset: 0;
  }

  .focus-zone-slider__bg {
    opacity: 0;
    transition: opacity 0.85s ease;
  }

  .focus-zone-slider__bg.is-active {
    opacity: 1;
  }

  .focus-zone-slider__bg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    transform: none;
  }

  .focus-zone-slider__frame {
    pointer-events: none;
  }

  .focus-zone-slider__zone {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: var(--focus-zone-height);
    transform: translateY(-50%);
    background: transparent;
  }

  .focus-zone-slider__number {
    position: absolute;
    right: var(--right-gutter);
    top: 50%;
    transform: translateY(-50%);
    font-family: "Clash Display", sans-serif;
    font-size: clamp(1.9rem, 3vw, 2.8rem);
    font-weight: 300;
    line-height: 1;
    color: var(--number-color);
    letter-spacing: -0.04em;
    text-shadow: 0 1px 10px rgba(0, 0, 0, 0.18);
  }

  .focus-zone-slider__number-window {
    overflow: hidden;
    height: 1.02em;
  }

  .focus-zone-slider__number-inner {
    display: block;
    animation: focus-zone-number-flip 0.42s cubic-bezier(.22,.61,.36,1);
  }

  .focus-zone-slider__number-inner.is-backward {
    animation-name: focus-zone-number-flip-reverse;
  }

  .focus-zone-slider__track {
    position: relative;
    z-index: 2;
    margin-top: -100vh;
    padding-left: var(--left-gutter);
    padding-right: clamp(7rem, 16vw, 20rem);
  }

  .focus-zone-slider__spacer {
    height: calc(50vh - (var(--item-height-desktop) * 0.5));
  }

  .focus-zone-slider__spacer--top {
    height: max(0px, calc(50vh - (var(--item-height-desktop) * 0.5) + 12vh));
  }

  .focus-zone-slider__spacer--bottom {
    height: max(0px, calc(50vh - (var(--item-height-desktop) * 0.5) + 10vh));
  }

  .focus-zone-slider__item {
    display: flex;
    align-items: center;
    min-height: var(--item-height-desktop);
  }

  .focus-zone-slider__item-inner {
    max-width: min(48rem, 58vw);
    transform: translate3d(0, var(--content-center-shift), 0);
    display: grid;
    align-content: start;
    grid-template-rows: auto minmax(7.2rem, auto);
  }

  .focus-zone-slider__item h2 {
    margin: 0;
    font-family: "Clash Display", sans-serif;
    font-size: clamp(3.8rem, 7.2vw, 6.4rem);
    font-weight: 300;
    line-height: 0.92;
    letter-spacing: -0.045em;
    white-space: pre-line;
    color: var(--title-muted);
    text-shadow: 0 2px 16px rgba(0, 0, 0, 0.16);
    transition: color 0.28s ease;
  }

  .focus-zone-slider__item.is-active h2 {
    color: var(--title-active);
    text-shadow: 0 2px 14px rgba(0, 0, 0, 0.22);
  }

  .focus-zone-slider__copy {
    margin-top: 1rem;
    max-width: 30rem;
    min-height: 7.2rem;
    visibility: hidden;
  }

  .focus-zone-slider__copy-line {
    display: block;
    overflow: hidden;
    margin: 0.12rem 0;
  }

  .focus-zone-slider__copy-line > span {
    display: block;
    font-family: "Clash Display", sans-serif;
    font-size: clamp(0.96rem, 1.22vw, 1.16rem);
    font-weight: 300;
    line-height: 1.42;
    color: var(--copy-color);
    opacity: 0;
    transform: translate3d(0, 115%, 0);
  }

  .focus-zone-slider__copy.is-active {
    visibility: visible;
  }

  .focus-zone-slider__copy.is-active .focus-zone-slider__copy-line > span {
    animation: focus-zone-copy-rise 0.36s cubic-bezier(.22,.61,.36,1) both;
  }

  @media (max-width: 900px) {
    .focus-zone-slider {
      --left-gutter: 1.35rem;
      --right-gutter: 1rem;
    }

    .focus-zone-slider__zone {
      height: 34svh;
    }

    .focus-zone-slider__track {
      padding-right: 4.6rem;
    }

    .focus-zone-slider__spacer {
      height: calc(50svh - (var(--item-height-mobile) * 0.5));
    }

    .focus-zone-slider__spacer--top {
      height: max(0px, calc(50svh - (var(--item-height-mobile) * 0.5) + 8svh));
    }

    .focus-zone-slider__spacer--bottom {
      height: max(0px, calc(50svh - (var(--item-height-mobile) * 0.5) + 6svh));
    }

    .focus-zone-slider__item {
      min-height: var(--item-height-mobile);
    }

    .focus-zone-slider__item-inner {
      max-width: min(78vw, 24rem);
      transform: translate3d(0, var(--content-center-shift-mobile), 0);
      grid-template-rows: auto minmax(6.2rem, auto);
    }

    .focus-zone-slider__item h2 {
      font-size: clamp(2.8rem, 11vw, 4rem);
      line-height: 0.94;
    }

    .focus-zone-slider__copy {
      margin-top: 0.8rem;
      max-width: 17rem;
      min-height: 6.2rem;
    }

    .focus-zone-slider__copy-line > span {
      font-size: clamp(0.92rem, 3.7vw, 1.02rem);
      line-height: 1.46;
    }

    .focus-zone-slider__number {
      right: 1rem;
      font-size: clamp(1.45rem, 6vw, 1.9rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .focus-zone-slider__bg,
    .focus-zone-slider__item h2,
    .focus-zone-slider__copy-line > span,
    .focus-zone-slider__number-inner {
      transition: none;
      animation: none;
    }
  }

  @keyframes focus-zone-number-flip {
    from {
      opacity: 0;
      transform: translate3d(0, 115%, 0);
    }

    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes focus-zone-number-flip-reverse {
    from {
      opacity: 0;
      transform: translate3d(0, -115%, 0);
    }

    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes focus-zone-copy-rise {
    from {
      opacity: 0;
      transform: translate3d(0, 115%, 0);
    }

    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }
</style>
