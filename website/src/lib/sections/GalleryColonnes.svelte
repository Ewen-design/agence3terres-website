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
    { ratio: "portrait", height: 38 },
    { ratio: "landscape", height: 23 },
    { ratio: "portrait", height: 34 }
  ];

  const centerImages = [
    { ratio: "landscape", height: 28 },
    { ratio: "portrait", height: 42 },
    { ratio: "portrait", height: 36 }
  ];

  const rightImages = [
    { ratio: "portrait", height: 38 },
    { ratio: "landscape", height: 23 },
    { ratio: "portrait", height: 34 }
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

  let galleryExitCut = 0;
  let galleryExitFeather = 18;

  let sectionTop = 0;
  let sectionHeight = 0;
  let resizeObserver;
  let resizeTimer = null;
  let isMobile = false;

  // ===== RÉGLAGES TIMING =====
  // Desktop
  const DESKTOP_TEXT_CENTER = 0.56;
  const DESKTOP_TEXT_ENTER_RANGE = 0.42;
  const DESKTOP_TEXT_LEAVE_RANGE = 0.98;
  const DESKTOP_GALLERY_CENTER = 0.58;
  const DESKTOP_GALLERY_RANGE = 0.62;

  // Mobile
  const MOBILE_TEXT_CENTER = 0.60;
  const MOBILE_TEXT_ENTER_RANGE = 0.34;
  const MOBILE_TEXT_LEAVE_RANGE = 0.91;
  const MOBILE_GALLERY_CENTER = 0.72;
  const MOBILE_GALLERY_RANGE = 0.72;

  // Disparition progressive bas -> haut
  const DESKTOP_EXIT_START = 1.08;
  const DESKTOP_EXIT_END = 0.18;
  const MOBILE_EXIT_START = 1.02;
  const MOBILE_EXIT_END = 0.24;
  // ==========================

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

  function updateDeviceState() {
    isMobile = window.innerWidth <= 640;
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

    const textCenterY = vh * (isMobile ? MOBILE_TEXT_CENTER : DESKTOP_TEXT_CENTER);
    const textEnterRange = vh * (isMobile ? MOBILE_TEXT_ENTER_RANGE : DESKTOP_TEXT_ENTER_RANGE);
    const textLeaveRange = vh * (isMobile ? MOBILE_TEXT_LEAVE_RANGE : DESKTOP_TEXT_LEAVE_RANGE);

    const enter = clamp((textCenterY - topInViewport) / textEnterRange, 0, 1);
    const leave = clamp((bottomInViewport - textCenterY) / textLeaveRange, 0, 1);
    const visibility = easeInOutCubic(enter) * easeInOutCubic(leave);

    targetOpacity = visibility;
    targetTranslate = (1 - visibility) * 34;

    const galleryCenterY = vh * (isMobile ? MOBILE_GALLERY_CENTER : DESKTOP_GALLERY_CENTER);
    const galleryRange = vh * (isMobile ? MOBILE_GALLERY_RANGE : DESKTOP_GALLERY_RANGE);

    const gEnter = clamp((galleryCenterY - topInViewport) / galleryRange, 0, 1);
    const gLeave = clamp((bottomInViewport - galleryCenterY) / galleryRange, 0, 1);
    galleryProgress = easeInOutCubic(gEnter) * easeInOutCubic(gLeave);

    // Début précoce et très doux de la disparition depuis le bas
    const exitStart = vh * (isMobile ? MOBILE_EXIT_START : DESKTOP_EXIT_START);
    const exitEnd = vh * (isMobile ? MOBILE_EXIT_END : DESKTOP_EXIT_END);

    const rawExit = clamp((exitStart - bottomInViewport) / (exitStart - exitEnd), 0, 1);

    // départ très doux, puis montée progressive
    const slowStart = Math.pow(rawExit, 2.15);
    const reinforcedMid = 1 - Math.pow(1 - rawExit, 2.4);
    const blendedExit = slowStart * 0.68 + reinforcedMid * 0.32;

    galleryExitCut = blendedExit * 78;
    galleryExitFeather = 16 + blendedExit * 10;

    const lightTrigger = sectionTop + sectionHeight - vh * 0.06;
    setEnteredLightZone(scrollY >= lightTrigger);

    startAnimationLoop();
  }

  function handleResize() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateDeviceState();
      measure();
    }, 80);
  }

  onMount(() => {
    resetSharedLightPhase();

    requestAnimationFrame(() => {
      updateDeviceState();
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
              brightness(${0.55 + galleryProgress * 0.45});
      --exit-cut:${galleryExitCut}%;
      --exit-feather:${galleryExitFeather}%;`}
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
    will-change: opacity, filter, mask-image, -webkit-mask-image;
    -webkit-mask-image: linear-gradient(
      to top,
      transparent 0%,
      transparent var(--exit-cut, 0%),
      rgba(0, 0, 0, 0.2) calc(var(--exit-cut, 0%) + calc(var(--exit-feather, 18%) * 0.18)),
      rgba(0, 0, 0, 0.55) calc(var(--exit-cut, 0%) + calc(var(--exit-feather, 18%) * 0.42)),
      rgba(0, 0, 0, 0.82) calc(var(--exit-cut, 0%) + calc(var(--exit-feather, 18%) * 0.72)),
      #000 calc(var(--exit-cut, 0%) + var(--exit-feather, 18%)),
      #000 100%
    );
    mask-image: linear-gradient(
      to top,
      transparent 0%,
      transparent var(--exit-cut, 0%),
      rgba(0, 0, 0, 0.2) calc(var(--exit-cut, 0%) + calc(var(--exit-feather, 18%) * 0.18)),
      rgba(0, 0, 0, 0.55) calc(var(--exit-cut, 0%) + calc(var(--exit-feather, 18%) * 0.42)),
      rgba(0, 0, 0, 0.82) calc(var(--exit-cut, 0%) + calc(var(--exit-feather, 18%) * 0.72)),
      #000 calc(var(--exit-cut, 0%) + var(--exit-feather, 18%)),
      #000 100%
    );
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
  }

  .gallery-grid {
    display: grid;
    grid-template-columns: 0.95fr 1.1fr 0.95fr;
    column-gap: 0.15rem;
    align-items: center;
  }

  .col {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: center;
    align-self: center;
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

  .card.square {
    height: clamp(210px, calc(var(--h) * 0.95), 520px);
  }

  .col-center .card.portrait {
    height: clamp(300px, calc(var(--h) * 1.08), 760px);
  }

  .col-center .card.landscape {
    height: clamp(190px, calc(var(--h) * 0.86), 540px);
  }

  .col-center .card.square {
    height: clamp(220px, calc(var(--h) * 1.02), 560px);
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
      min-height: 146vh;
    }

    .gallery-shell {
      width: 145vw;
      margin-left: 50%;
      transform: translateX(-50%);
      padding: 6vh 0 0;
    }

    .gallery-grid {
      grid-template-columns: 0.9fr 1.14fr 0.9fr;
      column-gap: 0.12rem;
      align-items: center;
    }

    .col {
      gap: 0.45rem;
      justify-content: center;
      align-self: center;
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
      height: calc(var(--h) * 1.34);
    }

    .card.landscape {
      height: calc(var(--h) * 1);
    }

    .card.square {
      height: calc(var(--h) * 1.08);
    }

    .col-center .card.portrait {
      height: calc(var(--h) * 1.44);
    }

    .col-center .card.landscape {
      height: calc(var(--h) * 1.06);
    }

    .col-center .card.square {
      height: calc(var(--h) * 1.12);
    }
  }
</style>