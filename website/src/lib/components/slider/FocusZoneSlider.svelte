<script>
  import { createEventDispatcher, onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";

  export let slides = [];
  export let zoneHeight = "34svh";
  export let itemHeightDesktop = "58vh";
  export let itemHeightMobile = "56svh";
  export let slideLinks = [];
  export let variant = "default";

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
  let isHeaderToneActive = false;
  let hasEnteredHeaderToneZone = false;
  let visibilityObserver;
  const dispatch = createEventDispatcher();

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

  function handleBtnMove(event) {
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }
  const normalizeSlideLines = (description = "") => description.split("\n").filter(Boolean);

  $: activeIndex = clamp(activeIndex, 0, Math.max(slides.length - 1, 0));
  $: normalizedSlides = slides.map((slide) => ({
    ...slide,
    lines: normalizeSlideLines(slide.description)
  }));
  $: resolvedSlideLinks = slides.map(
    (slide, index) => slide.href ?? slide.link ?? slideLinks[index] ?? null
  );
  $: activeSlideHref = resolvedSlideLinks[activeIndex] ?? null;
  $: activeSlideTitle = normalizedSlides[activeIndex]?.title?.replaceAll("\n", " ") ?? "slide";
  $: if (activeIndex !== previousActiveIndex) {
    numberDirection = activeIndex > previousActiveIndex ? 1 : -1;
    previousActiveIndex = activeIndex;
    numberKey += 1;
  }

  function syncHeaderTone() {
    dispatch("slideractivechange", { active: isHeaderToneActive });
  }

  function updateState() {
    if (!browser || !sliderEl || itemEls.length === 0) {
      ticking = false;
      return;
    }

    const viewportHeight = window.innerHeight || 1;
    const sliderRect = sliderEl.getBoundingClientRect();
    const zoneCenter = viewportHeight * 0.5;
    const sliderIsVisible = sliderRect.top < viewportHeight && sliderRect.bottom > 0;
    const sliderReachedFullscreen =
      sliderRect.top <= viewportHeight * 0.08 && sliderRect.bottom >= viewportHeight * 0.92;
    let nextHeaderToneActive = false;

    if (sliderRect.top >= viewportHeight) {
      hasEnteredHeaderToneZone = false;
    }

    if (sliderReachedFullscreen) {
      hasEnteredHeaderToneZone = true;
    }

    if (sliderIsVisible) {
      if (hasEnteredHeaderToneZone && sliderRect.top > viewportHeight * 0.08) {
        hasEnteredHeaderToneZone = false;
        nextHeaderToneActive = false;
      } else {
        nextHeaderToneActive = hasEnteredHeaderToneZone;
      }
    }

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
    if (nextHeaderToneActive !== isHeaderToneActive) {
      isHeaderToneActive = nextHeaderToneActive;
      syncHeaderTone();
    }
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
        if (isInView) queueUpdate();
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 }
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
      isHeaderToneActive = false;
      hasEnteredHeaderToneZone = false;
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
    isHeaderToneActive = false;
    hasEnteredHeaderToneZone = false;
    syncHeaderTone();
    clearTimeout(resizeTimer);
  });
</script>

<section
  class="focus-zone-slider"
  class:focus-zone-slider--project={variant === "project"}
  class:focus-zone-slider--home={variant === "home"}
  bind:this={sliderEl}
  style={`--focus-zone-height:${zoneHeight}; --slide-count:${slides.length}; --item-height-desktop:${itemHeightDesktop}; --item-height-mobile:${itemHeightMobile};`}
>
  <div class="focus-zone-slider__sticky">
    <div class="focus-zone-slider__backgrounds" aria-hidden="true">
      {#each slides as slide, index}
        <div class="focus-zone-slider__bg" class:is-active={activeIndex === index}>
          <picture>
            {#if slide.mobileImage}
              <source media="(max-width: 900px)" srcset={slide.mobileImage} />
            {/if}
            <img src={slide.image} alt="" />
          </picture>
        </div>
      {/each}

      <div class="focus-zone-slider__bg-gradient"></div>
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

          {#if variant !== "home"}
          <div
            class="focus-zone-slider__copy"
            class:is-active={activeIndex === index}
            class:is-inactive={activeIndex !== index}
            style={`--line-count:${slide.lines.length};`}
          >
            {#each slide.lines as line, lineIndex}
              <span
                class="focus-zone-slider__copy-line"
                style={`--line-index:${lineIndex}; --line-out-index:${slide.lines.length - lineIndex - 1};`}
              >
                <span>{line}</span>
              </span>
            {/each}
          </div>
          {/if}

          {#if resolvedSlideLinks[index]}
            <a
              class="fzs-btn"
              class:is-active={activeIndex === index}
              href={resolvedSlideLinks[index]}
              tabindex={activeIndex === index ? 0 : -1}
              data-cursor="button"
              onmousemove={handleBtnMove}
            >
              <span class="fzs-btn-flip" data-text="Voir le projet">
                <span class="fzs-btn-text">Voir le projet</span>
              </span>
            </a>
          {/if}
        </div>
      </article>
    {/each}

    <div class="focus-zone-slider__spacer focus-zone-slider__spacer--bottom" aria-hidden="true"></div>
  </div>

  {#if activeSlideHref}
    <a
      class="focus-zone-slider__link-overlay"
      href={activeSlideHref}
      data-cursor="view"
      aria-label={`Ouvrir ${activeSlideTitle}`}
    >
      <span class="focus-zone-slider__sr-only">Ouvrir {activeSlideTitle}</span>
    </a>
  {/if}
</section>

<style>
  .focus-zone-slider {
    --title-active: #f5f1e8;
    --title-muted: #707070;
    --copy-color: rgba(245, 241, 232, 0.5);
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

  .focus-zone-slider__link-overlay {
    position: absolute;
    inset: 0;
    z-index: 4;
    display: block;
    text-decoration: none;
    color: inherit;
  }

  .focus-zone-slider__link-overlay:focus-visible {
    outline: 2px solid rgba(245, 241, 232, 0.95);
    outline-offset: -0.35rem;
  }

  .focus-zone-slider__sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .focus-zone-slider__backgrounds,
  .focus-zone-slider__bg,
  .focus-zone-slider__bg picture,
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

  .focus-zone-slider__bg-gradient {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(
        90deg,
        rgba(0, 0, 0, 0.72) 0%,
        rgba(0, 0, 0, 0.46) 28%,
        rgba(0, 0, 0, 0.16) 60%,
        rgba(0, 0, 0, 0) 100%
      ),
      radial-gradient(
        95% 70% at 18% 50%,
        rgba(0, 0, 0, 0.34) 0%,
        rgba(0, 0, 0, 0.22) 42%,
        rgba(0, 0, 0, 0.07) 72%,
        rgba(0, 0, 0, 0) 100%
      );
    pointer-events: none;
  }

  .focus-zone-slider--project .focus-zone-slider__bg-gradient {
    background:
      linear-gradient(
        90deg,
        rgba(0, 0, 0, 1) 0%,
        rgba(0, 0, 0, 0.98) 12%,
        rgba(0, 0, 0, 0.86) 28%,
        rgba(0, 0, 0, 0.58) 48%,
        rgba(0, 0, 0, 0.18) 72%,
        rgba(0, 0, 0, 0) 100%
      ),
      radial-gradient(
        95% 70% at 12% 50%,
        rgba(0, 0, 0, 0.82) 0%,
        rgba(0, 0, 0, 0.56) 42%,
        rgba(0, 0, 0, 0.16) 72%,
        rgba(0, 0, 0, 0) 100%
      );
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
    font-family: var(--site-font);
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
    z-index: 5;
    margin-top: -100vh;
    padding-left: var(--left-gutter);
    padding-right: clamp(7rem, 16vw, 20rem);
    pointer-events: none;
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
    grid-template-rows: auto minmax(4rem, auto) auto;
  }

  .focus-zone-slider__item h2 {
    margin: 0;
    font-family: var(--site-font);
    font-size: clamp(3.2rem, 6.2vw, 5.8rem);
    font-weight: 600;
    line-height: 0.92;
    letter-spacing: -0.03em;
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
    margin-top: 2rem;
    max-width: 30rem;
    min-height: 4rem;
  }

  .focus-zone-slider__copy-line {
    display: block;
    overflow: hidden;
    margin: 0.12rem 0;
  }

  .focus-zone-slider__copy-line > span {
    display: block;
    font-family: var(--site-font);
    font-size: clamp(0.88rem, 1.1vw, 1.05rem);
    font-weight: 300;
    line-height: 1.42;
    color: var(--copy-color);
    opacity: 0;
    filter: blur(8px);
    transform: translate3d(0, 115%, 0);
    -webkit-transform: translate3d(0, 115%, 0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    will-change: transform, opacity;
    transition:
      transform 0.42s cubic-bezier(.22,.61,.36,1),
      opacity 0.32s ease,
      filter 0.57s cubic-bezier(.22,.61,.36,1);
    transition-delay: calc(var(--line-out-index, 0) * 0.045s);
  }

  .focus-zone-slider__copy.is-active .focus-zone-slider__copy-line > span {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
    -webkit-transform: translate3d(0, 0, 0);
    transition-delay: calc(var(--line-index, 0) * 0.05s);
  }

  .fzs-btn {
    font-family: var(--site-font);
    font-weight: 400;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    padding: 0 1.5rem;
    font-size: 0.9rem;
    white-space: nowrap;
    color: #f5f1e8;
    text-decoration: none;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    border-radius: 10px;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.04);
    pointer-events: auto;
    margin-top: 0.45rem;
    justify-self: start;
    opacity: 0;
    transform: translate3d(0, 80%, 0);
    transition:
      opacity 0.38s ease,
      transform 0.42s cubic-bezier(.22,.61,.36,1),
      color 220ms ease,
      box-shadow 1.2s cubic-bezier(.22,.61,.36,1),
      background 1.2s cubic-bezier(.22,.61,.36,1);
  }

  .fzs-btn.is-active {
    opacity: 1;
    transform: translate3d(0, 0, 0);
    transition-delay: 0.18s;
  }

  .fzs-btn:not(.is-active) {
    transition-delay: 0s;
  }

  .fzs-btn-flip {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
  }

  .fzs-btn-text {
    display: block;
    transform: translateY(0%);
    transition: transform 0.45s cubic-bezier(.22,.61,.36,1), opacity 0.28s ease;
  }

  .fzs-btn-flip::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition: transform 0.45s cubic-bezier(.22,.61,.36,1), opacity 0.28s ease;
    white-space: nowrap;
    color: inherit;
  }

  .fzs-btn:hover .fzs-btn-text { transform: translateY(-100%); }
  .fzs-btn:hover .fzs-btn-flip::after { transform: translateY(0%); }

  .fzs-btn::before,
  .fzs-btn::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0;
  }

  .fzs-btn::before {
    background: radial-gradient(
      128px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-strong) 0%,
      var(--site-glow-mid) 26%,
      var(--site-glow-soft) 52%,
      var(--site-glow-fade) 70%,
      transparent 86%
    );
    transition: opacity 0.25s ease;
  }

  .fzs-btn::after {
    background: radial-gradient(
      156px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-ambient) 0%,
      var(--site-glow-outer) 48%,
      transparent 82%
    );
    filter: blur(3px);
    transition: opacity 0.25s ease;
  }

  .fzs-btn:hover::before,
  .fzs-btn:hover::after {
    opacity: 1;
  }

  .focus-zone-slider--home .focus-zone-slider__item-inner {
    grid-template-rows: auto auto;
  }

  .focus-zone-slider--home .focus-zone-slider__item h2 {
    font-size: clamp(4.2rem, 7.8vw, 7.6rem);
  }

  .focus-zone-slider--home .fzs-btn {
    margin-top: 1.4rem;
  }

  @media (max-width: 900px) {
    .focus-zone-slider--home .focus-zone-slider__item h2 {
      font-size: clamp(3.4rem, 12vw, 5rem);
    }
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
      grid-template-rows: auto minmax(3.6rem, auto);
    }

    .focus-zone-slider__item h2 {
      font-size: clamp(2.6rem, 10vw, 3.8rem);
      line-height: 0.94;
    }

    .focus-zone-slider__copy {
      margin-top: 1.6rem;
      max-width: 17rem;
      min-height: 3.6rem;
    }

    .focus-zone-slider__copy-line > span {
      font-size: clamp(0.85rem, 3.4vw, 0.95rem);
      line-height: 1.46;
    }

    .fzs-btn {
      height: 36px;
      font-size: 0.85rem;
      padding: 0 1.2rem;
      margin-top: 0.45rem;
      backdrop-filter: blur(12px) saturate(130%);
      -webkit-backdrop-filter: blur(12px) saturate(130%);
    }

    .focus-zone-slider__number {
      right: 1rem;
      font-size: clamp(1.45rem, 6vw, 1.9rem);
    }

    .focus-zone-slider__bg-gradient {
      background:
        linear-gradient(
          90deg,
          rgba(0, 0, 0, 0.42) 0%,
          rgba(0, 0, 0, 0.22) 28%,
          rgba(0, 0, 0, 0.08) 55%,
          rgba(0, 0, 0, 0) 100%
        ),
        radial-gradient(
          120% 58% at 18% 50%,
          rgba(0, 0, 0, 0.24) 0%,
          rgba(0, 0, 0, 0.16) 36%,
          rgba(0, 0, 0, 0.05) 66%,
          rgba(0, 0, 0, 0) 100%
        );
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
</style>
