<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";
  import {
    sharedLightPhase,
    setEnteredLightZone,
    resetSharedLightPhase
  } from "$lib/sectionThemeSync.js";

  const leftImages = [
    { ratio: "portrait", height: 34 },
    { ratio: "landscape", height: 23 },
    { ratio: "portrait", height: 38 },
    { ratio: "landscape", height: 24 }
  ];

  const centerImages = [
    { ratio: "landscape", height: 28 },
    { ratio: "portrait", height: 42 },
    { ratio: "landscape", height: 24 },
    { ratio: "portrait", height: 36 }
  ];

  const rightImages = [
    { ratio: "portrait", height: 35 },
    { ratio: "landscape", height: 22 },
    { ratio: "portrait", height: 39 },
    { ratio: "landscape", height: 25 }
  ];

  const text = "Nos instants visuels".split("");

  let sectionEl;
  let textVisible = false;
  let textOpacity = 0;
  let textTranslate = 34;
  let rafId = null;
  let targetOpacity = 0;
  let targetTranslate = 34;
  let galleryProgress = 0;

  let sectionTop = 0;
  let sectionHeight = 0;
  let resizeObserver;
  let resizeTimer = null;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  function measure() {
    if (!sectionEl) return;
    const scrollY = window.lenis?.animatedScroll ?? window.scrollY ?? 0;
    const rect = sectionEl.getBoundingClientRect();
    sectionTop = rect.top + scrollY;
    sectionHeight = rect.height;
  }

  function animateText() {
    textOpacity = lerp(textOpacity, targetOpacity, 0.11);
    textTranslate = lerp(textTranslate, targetTranslate, 0.11);

    textVisible = textOpacity > 0.015;

    const opacityDiff = Math.abs(textOpacity - targetOpacity);
    const translateDiff = Math.abs(textTranslate - targetTranslate);

    if (opacityDiff > 0.001 || translateDiff > 0.001) {
      rafId = requestAnimationFrame(animateText);
    } else {
      textOpacity = targetOpacity;
      textTranslate = targetTranslate;
      textVisible = textOpacity > 0.015;
      rafId = null;
    }
  }

  function startAnimationLoop() {
    if (rafId === null) {
      rafId = requestAnimationFrame(animateText);
    }
  }

  function updateFromScroll(scrollY, { vh }) {
    if (!sectionEl || !sectionHeight) return;

    const topInViewport = sectionTop - scrollY;
    const bottomInViewport = topInViewport + sectionHeight;
    const centerY = vh * 0.5;

    const enter = clamp((centerY - topInViewport) / (vh * 0.4), 0, 1);
    const leave = clamp((bottomInViewport - centerY) / (vh * 0.4), 0, 1);
    const visibility = easeInOutCubic(enter) * easeInOutCubic(leave);

    targetOpacity = visibility;
    targetTranslate = (1 - visibility) * 34;

    const gEnter = clamp((centerY - topInViewport) / (vh * 0.55), 0, 1);
    const gLeave = clamp((bottomInViewport - centerY) / (vh * 0.55), 0, 1);
    galleryProgress = easeInOutCubic(gEnter) * easeInOutCubic(gLeave);

    const lightTrigger = sectionTop + sectionHeight - vh * 0.06;
    setEnteredLightZone(scrollY >= lightTrigger);

    startAnimationLoop();
  }

  function handleResize() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      measure();
    }, 80);
  }

  onMount(() => {
    resetSharedLightPhase();

    requestAnimationFrame(() => {
      measure();
    });

    registerParallax(updateFromScroll, { priority: 2 });

    resizeObserver = new ResizeObserver(() => handleResize());
    if (sectionEl) resizeObserver.observe(sectionEl);

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });
  });

  onDestroy(() => {
    if (!browser) return;
    unregisterParallax(updateFromScroll);
    resizeObserver?.disconnect();
    if (resizeTimer) clearTimeout(resizeTimer);
    if (rafId !== null) cancelAnimationFrame(rafId);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("orientationchange", handleResize);
    resetSharedLightPhase();
  });
</script>

<section
  class="gallery-section"
  class:light-phase={$sharedLightPhase}
  bind:this={sectionEl}
>
  <div
    class="fixed-text"
    class:is-visible={textVisible}
    style={`opacity:${textOpacity}; transform: translateY(${textTranslate}px);`}
  >
    <h2 class="title">
      {#each text as letter, i}
        <span
          class="letter"
          style={`--i:${i}; opacity:${textOpacity}; transform: translateY(${textTranslate}px);`}
        >
          {letter === " " ? "\u00A0" : letter}
        </span>
      {/each}
    </h2>
  </div>

  <div class="gallery-track">
    <div
      class="gallery-shell"
      style={`opacity:${galleryProgress};
      filter: blur(${(1 - galleryProgress) * 12}px)
              brightness(${0.55 + galleryProgress * 0.45});`}
    >
      <div class="gallery-grid">
        <div class="col col-left">
          {#each leftImages as image}
            <figure class={`card ${image.ratio}`} style={`--h:${image.height}vw`}>
              <img src="images/photo.webp" alt="" />
            </figure>
          {/each}
        </div>

        <div class="col col-center">
          {#each centerImages as image}
            <figure class={`card ${image.ratio}`} style={`--h:${image.height}vw`}>
              <img src="images/photo.webp" alt="" />
            </figure>
          {/each}
        </div>

        <div class="col col-right">
          {#each rightImages as image}
            <figure class={`card ${image.ratio}`} style={`--h:${image.height}vw`}>
              <img src="images/photo.webp" alt="" />
            </figure>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .gallery-section {
    --section-bg: #000;
    --section-text: #f5f1e8;
    --card-bg: #111;

    position: relative;
    width: 100%;
    background: var(--section-bg);
    overflow: hidden;
    color: var(--section-text);
    transition:
      background-color 620ms cubic-bezier(0.22, 1, 0.36, 1),
      color 620ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .gallery-section.light-phase {
    --section-bg: #f5f1e8;
    --section-text: #111;
    --card-bg: #ddd5ca;
  }

  .fixed-text {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    z-index: 999;
    pointer-events: none;
    opacity: 0;
    transform: translateY(34px);
    will-change: opacity, transform;
  }

  .fixed-text:not(.is-visible) {
    visibility: hidden;
  }

  .fixed-text.is-visible {
    visibility: visible;
  }

  .title {
    margin: 0;
    font-family: "Titre italic", serif;
    font-style: italic;
    font-size: clamp(2.5rem, 6vw, 6rem);
    font-weight: 100;
    line-height: 0.95;
    letter-spacing: -0.04em;
    text-align: center;
    color: var(--section-text);
    text-wrap: balance;
    transition: color 620ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .letter {
    display: inline-block;
    will-change: opacity, transform;
  }

  .gallery-track {
    min-height: 220vh;
  }

  .gallery-shell {
    width: 120vw;
    margin-left: 50%;
    transform: translateX(-50%);
    padding: 10vh 0;
    will-change: opacity, filter;
  }

  .gallery-grid {
    display: grid;
    grid-template-columns: 0.95fr 1.1fr 0.95fr;
    column-gap: 0.15rem;
  }

  .col {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .col-left,
  .col-right {
    padding-top: 8vh;
  }

  .col-center {
    margin-top: 2vh;
    padding-bottom: 8vh;
  }

  .col-left {
    transform: translateX(-3vw);
  }

  .col-right {
    transform: translateX(3vw);
  }

  .card {
    overflow: hidden;
    background: var(--card-bg);
    transition: background-color 620ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .card img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .card.portrait {
    height: clamp(280px, var(--h), 700px);
  }

  .card.landscape {
    height: clamp(180px, calc(var(--h) * 0.8), 500px);
  }

  @media (max-width: 900px) {
    .gallery-grid {
      grid-template-columns: 0.9fr 1.05fr 0.9fr;
      column-gap: 0.12rem;
    }

    .col {
      gap: 0.4rem;
    }

    .gallery-shell {
      width: 130vw;
    }

    .title {
      font-size: clamp(1.6rem, 7vw, 2.6rem);
    }
  }

  @media (max-width: 640px) {
    .gallery-track {
      min-height: 145vh;
    }

    .gallery-shell {
      width: 140vw;
      margin-left: 50%;
      transform: translateX(-50%);
      padding: 8vh 0 2vh;
    }

    .gallery-grid {
      grid-template-columns: 0.9fr 1.14fr 0.9fr;
      column-gap: 0.12rem;
      align-items: center;
    }

    .col {
      gap: 0.4rem;
      justify-content: center;
    }

    .col-left,
    .col-right,
    .col-center {
      padding-top: 0;
      padding-bottom: 0;
      margin-top: 0;
    }

    .col-left,
    .col-right,
    .col-center {
      transform: none;
    }

    .title {
      font-size: clamp(2rem, 9vw, 3.1rem);
      line-height: 0.92;
    }

    .card.portrait {
      height: calc(var(--h) * 1.18);
    }

    .card.landscape {
      height: calc(var(--h) * 0.94);
    }

    .col-center .card.portrait {
      height: calc(var(--h) * 1.28);
    }

    .col-center .card.landscape {
      height: calc(var(--h) * 1);
    }
  }
</style>