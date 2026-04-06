<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import {
    registerParallax,
    unregisterParallax,
    registerWrite,
    unregisterWrite,
    forceScrollEngineUpdate
  } from "../scrollEngine.js";

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
  let fixedTextEl;
  let galleryShellEl;

  let resizeObserver;
  let resizeTimer = null;
  let isMobile = false;

  let sectionTop = 0;
  let sectionHeight = 0;
  let visibleState = false;

  let pending = null;
  let dirty = false;

  let applied = {
    textOpacity: -1,
    textTranslate: -999,
    galleryOpacity: -1,
    galleryBlur: -999,
    galleryBrightness: -999,
    galleryExitCut: -999,
    galleryExitFeather: -999
  };

  const DESKTOP_TEXT_CENTER = 0.56;
  const DESKTOP_TEXT_ENTER_RANGE = 0.42;
  const DESKTOP_TEXT_LEAVE_RANGE = 0.98;
  const DESKTOP_GALLERY_CENTER = 0.58;
  const DESKTOP_GALLERY_RANGE = 0.62;

  const MOBILE_TEXT_CENTER = 0.60;
  const MOBILE_TEXT_ENTER_RANGE = 0.34;
  const MOBILE_TEXT_LEAVE_RANGE = 0.91;
  const MOBILE_GALLERY_CENTER = 0.98;
  const MOBILE_GALLERY_RANGE = 0.32;

  const DESKTOP_EXIT_START = 1.08;
  const DESKTOP_EXIT_END = 0.18;
  const MOBILE_EXIT_START = 1.02;
  const MOBILE_EXIT_END = 0.24;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function currentScrollY() {
    return window.lenis?.animatedScroll ?? window.scrollY ?? 0;
  }

  function q(value, step) {
    return Math.round(value / step) * step;
  }

  function updateDeviceState() {
    isMobile = window.innerWidth <= 640;
  }

  function measure() {
    if (!sectionEl) return;
    const scrollY = currentScrollY();
    const rect = sectionEl.getBoundingClientRect();
    sectionTop = rect.top + scrollY;
    sectionHeight = rect.height;
  }

  function computeFromScroll(scrollY, { vh }) {
    if (!sectionEl || !sectionHeight) return;

    const topInViewport = sectionTop - scrollY;
    const bottomInViewport = topInViewport + sectionHeight;

    const textCenterY = vh * (isMobile ? MOBILE_TEXT_CENTER : DESKTOP_TEXT_CENTER);
    const textEnterRange = vh * (isMobile ? MOBILE_TEXT_ENTER_RANGE : DESKTOP_TEXT_ENTER_RANGE);
    const textLeaveRange = vh * (isMobile ? MOBILE_TEXT_LEAVE_RANGE : DESKTOP_TEXT_LEAVE_RANGE);

    const enter = clamp((textCenterY - topInViewport) / Math.max(textEnterRange, 1), 0, 1);
    const leave = clamp((bottomInViewport - textCenterY) / Math.max(textLeaveRange, 1), 0, 1);
    const visibility = easeInOutCubic(enter) * easeInOutCubic(leave);

    const galleryCenterY = vh * (isMobile ? MOBILE_GALLERY_CENTER : DESKTOP_GALLERY_CENTER);
    const galleryRange = vh * (isMobile ? MOBILE_GALLERY_RANGE : DESKTOP_GALLERY_RANGE);

    const gEnter = clamp((galleryCenterY - topInViewport) / Math.max(galleryRange, 1), 0, 1);
    const gLeave = clamp((bottomInViewport - galleryCenterY) / Math.max(galleryRange, 1), 0, 1);
    const galleryProgress = easeInOutCubic(gEnter) * easeInOutCubic(gLeave);

    const exitStart = vh * (isMobile ? MOBILE_EXIT_START : DESKTOP_EXIT_START);
    const exitEnd = vh * (isMobile ? MOBILE_EXIT_END : DESKTOP_EXIT_END);
    const rawExit = clamp((exitStart - bottomInViewport) / Math.max(exitStart - exitEnd, 1), 0, 1);

    const slowStart = Math.pow(rawExit, 2.15);
    const reinforcedMid = 1 - Math.pow(1 - rawExit, 2.4);
    const blendedExit = slowStart * 0.68 + reinforcedMid * 0.32;

    pending = {
      textOpacity: q(visibility, 0.001),
      textTranslate: q((1 - visibility) * 34, 0.1),
      galleryOpacity: q(galleryProgress, 0.001),
      galleryBlur: q((1 - galleryProgress) * 12, 0.1),
      galleryBrightness: q(0.55 + galleryProgress * 0.45, 0.001),
      galleryExitCut: q(blendedExit * 78, 0.1),
      galleryExitFeather: q(16 + blendedExit * 10, 0.1)
    };

    dirty = true;
  }

  function applyPending() {
    if (!dirty || !pending) return;

    if (fixedTextEl) {
      if (pending.textOpacity !== applied.textOpacity) {
        fixedTextEl.style.opacity = `${pending.textOpacity}`;
        applied.textOpacity = pending.textOpacity;
      }

      if (pending.textTranslate !== applied.textTranslate) {
        fixedTextEl.style.transform = `translate3d(0, ${pending.textTranslate}px, 0)`;
        applied.textTranslate = pending.textTranslate;
      }

      const shouldBeVisible = pending.textOpacity > 0.015;
      if (shouldBeVisible !== visibleState) {
        visibleState = shouldBeVisible;
        fixedTextEl.classList.toggle("is-visible", shouldBeVisible);
      }
    }

    if (galleryShellEl) {
      if (pending.galleryOpacity !== applied.galleryOpacity) {
        galleryShellEl.style.opacity = `${pending.galleryOpacity}`;
        applied.galleryOpacity = pending.galleryOpacity;
      }

      if (pending.galleryBlur !== applied.galleryBlur) {
        galleryShellEl.style.setProperty("--gallery-blur", `${pending.galleryBlur}px`);
        applied.galleryBlur = pending.galleryBlur;
      }

      if (pending.galleryBrightness !== applied.galleryBrightness) {
        galleryShellEl.style.setProperty("--gallery-brightness", `${pending.galleryBrightness}`);
        applied.galleryBrightness = pending.galleryBrightness;
      }

      if (pending.galleryExitCut !== applied.galleryExitCut) {
        galleryShellEl.style.setProperty("--exit-cut", `${pending.galleryExitCut}%`);
        applied.galleryExitCut = pending.galleryExitCut;
      }

      if (pending.galleryExitFeather !== applied.galleryExitFeather) {
        galleryShellEl.style.setProperty("--exit-feather", `${pending.galleryExitFeather}%`);
        applied.galleryExitFeather = pending.galleryExitFeather;
      }
    }

    dirty = false;
  }

  function handleResize() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateDeviceState();
      measure();
      forceScrollEngineUpdate();
    }, 70);
  }

  onMount(() => {
    if (!browser) return;

    requestAnimationFrame(() => {
      updateDeviceState();
      measure();
      if (fixedTextEl) {
        fixedTextEl.style.opacity = "0";
        fixedTextEl.style.transform = "translate3d(0, 34px, 0)";
      }
      if (galleryShellEl) {
        galleryShellEl.style.opacity = "0";
        galleryShellEl.style.setProperty("--gallery-blur", "12px");
        galleryShellEl.style.setProperty("--gallery-brightness", "0.55");
        galleryShellEl.style.setProperty("--exit-cut", "0%");
        galleryShellEl.style.setProperty("--exit-feather", "18%");
      }
      forceScrollEngineUpdate();
    });

    registerParallax(computeFromScroll, { priority: 2 });
    registerWrite(applyPending, { priority: 2 });

    resizeObserver = new ResizeObserver(handleResize);
    if (sectionEl) resizeObserver.observe(sectionEl);

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });
  });

  onDestroy(() => {
    if (!browser) return;

    unregisterParallax(computeFromScroll);
    unregisterWrite(applyPending);
    resizeObserver?.disconnect();

    if (resizeTimer) clearTimeout(resizeTimer);

    window.removeEventListener("resize", handleResize);
    window.removeEventListener("orientationchange", handleResize);
  });
</script>

<section class="gallery-section" bind:this={sectionEl}>
  <div class="fixed-text" bind:this={fixedTextEl}>
    <h2 class="title">
      {#each text as letter}
        <span class="letter">{letter === " " ? "\u00A0" : letter}</span>
      {/each}
    </h2>
  </div>

  <div class="gallery-track">
    <div class="gallery-shell" bind:this={galleryShellEl}>
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
  }

  .fixed-text {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    z-index: 999;
    pointer-events: none;
    opacity: 0;
    transform: translate3d(0, 34px, 0);
    will-change: transform, opacity;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
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
  }

  .letter {
    display: inline-block;
  }

  .gallery-track {
    min-height: 220vh;
  }

  .gallery-shell {
    width: 120vw;
    margin-left: 50%;
    transform: translate3d(-50%, 0, 0);
    padding: 10vh 0;
    opacity: 0;
    filter: blur(var(--gallery-blur, 12px)) brightness(var(--gallery-brightness, 0.55));
    will-change: opacity, filter;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
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
    transform: translate3d(-3vw, 0, 0);
  }

  .col-right {
    transform: translate3d(3vw, 0, 0);
  }

  .card {
    overflow: hidden;
    background: var(--card-bg);
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .card img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
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
      transform: translate3d(-50%, 0, 0);
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
      height: calc(var(--h) * 1.6);
    }

    .card.landscape {
      height: calc(var(--h) * 1.18);
    }

    .card.square {
      height: calc(var(--h) * 1.24);
    }

    .col-center .card.portrait {
      height: calc(var(--h) * 1.72);
    }

    .col-center .card.landscape {
      height: calc(var(--h) * 1.24);
    }

    .col-center .card.square {
      height: calc(var(--h) * 1.28);
    }
  }
</style>