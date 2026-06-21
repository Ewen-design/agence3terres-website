<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import {
    registerParallax,
    unregisterParallax,
    registerWrite,
    unregisterWrite,
    forceScrollEngineUpdate
  } from "$lib/scrollEngine.js";

  let heroSection;
  let heroStage;
  let afterTextEl;
  let afterImageEl;
  let heroMediaImgEl;
  let heroDarkLayerEl;

  let introStarted = false;
  let introVisible = true;
  let heroMediaVisible = false;
  let titleVisible = false;

  let fallbackTimeout;
  let mediaIntroTimeout;
  let titleIntroTimeout;
  let resizeObserver;
  let resizeTimer;

  let vh = 1;
  let isMobile = false;
  let heroTop = 0;
  let heroHeight = 1;
  let afterTextTop = 0;
  let afterImageTop = 0;

  let pendingFrame = null;
  let dirty = false;

  let applied = {
    imageScale: -1,
    imageBrightness: -1,
    imageOpacity: -1,
    imageDark: -1,
    textOpacity: -1,
    textY: -9999,
    textEdge: -9999,
    smallImageScale: -1,
    smallImageY: -9999
  };

  const finalText =
    "Des services sur mesure, au service d'une présence juste et durable.";
  const activeAfterImage = "/images/moovy2.webp";

  const words = finalText.split(" ");

  const grayStartsAtWord = 4;

  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const q = (v, step) => Math.round(v / step) * step;

  function getScrollY() {
    return window.scrollY || window.pageYOffset || 0;
  }

  function getAbsoluteTop(el) {
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return rect.top + getScrollY();
  }

  function measureLayout() {
    vh = window.innerHeight || 1;
    isMobile = (window.innerWidth || 0) <= 640;
    heroTop = getAbsoluteTop(heroSection);
    heroHeight = Math.max(heroSection?.offsetHeight || 1, 1);
    afterTextTop = getAbsoluteTop(afterTextEl);
    afterImageTop = getAbsoluteTop(afterImageEl);
  }

  function getLocalRevealFromAbsolute(scrollY, absTop, startMul = 0.9, endMul = 0.2) {
    const topInViewport = absTop - scrollY;
    const start = vh * startMul;
    const end = vh * endMul;
    return clamp((start - topInViewport) / Math.max(start - end, 1), 0, 1);
  }

  function computeFrame(y) {
    if (!afterTextEl || !afterImageEl) return;

    const heroScrollable = Math.max(heroHeight - vh, 1);
    const imageFadeProgress = clamp((y - heroTop) / heroScrollable, 0, 1);
    const globalFade = imageFadeProgress * imageFadeProgress * (3 - 2 * imageFadeProgress);

    const localTextReveal = getLocalRevealFromAbsolute(y, afterTextTop, 0.92, 0.16);
    const localImageReveal = getLocalRevealFromAbsolute(y, afterImageTop, 0.98, 0.12);

    pendingFrame = {
      imageScale: q(lerp(1.03, 1.005, globalFade), 0.0001),
      imageBrightness: isMobile ? 1 : q(lerp(1, 0.62, globalFade), 0.001),
      imageOpacity: isMobile ? 1 : q(lerp(1, 0, globalFade), 0.001),
      imageDark: isMobile ? 0 : q(lerp(0.08, 0.62, globalFade), 0.001),
      textOpacity: q(lerp(0.14, 1, localTextReveal), 0.001),
      textY: q(lerp(18, 0, localTextReveal), 0.1),
      textEdge: q(lerp(0, 118, localTextReveal), 0.1),
      smallImageScale: q(lerp(0.885, 1.02, localImageReveal), 0.001),
      smallImageY: q(lerp(22, 0, localImageReveal), 0.1)
    };

    dirty = true;
  }

  function applyFrame() {
    if (!dirty || !pendingFrame) return;

    const f = pendingFrame;

    if (heroMediaImgEl) {
      if (
        f.imageScale !== applied.imageScale ||
        f.imageBrightness !== applied.imageBrightness ||
        f.imageOpacity !== applied.imageOpacity
      ) {
        heroMediaImgEl.style.transform = `scale(${f.imageScale})`;
        heroMediaImgEl.style.filter = `brightness(${f.imageBrightness})`;
        heroMediaImgEl.style.opacity = `${f.imageOpacity}`;
        applied.imageScale = f.imageScale;
        applied.imageBrightness = f.imageBrightness;
        applied.imageOpacity = f.imageOpacity;
      }
    }

    if (heroDarkLayerEl && f.imageDark !== applied.imageDark) {
      heroDarkLayerEl.style.opacity = `${f.imageDark}`;
      applied.imageDark = f.imageDark;
    }

    if (afterImageEl) {
      if (
        f.smallImageScale !== applied.smallImageScale ||
        f.smallImageY !== applied.smallImageY
      ) {
        afterImageEl.style.transform = `translate3d(0, ${f.smallImageY}px, 0) scale(${f.smallImageScale})`;
        applied.smallImageScale = f.smallImageScale;
        applied.smallImageY = f.smallImageY;
      }
    }

    dirty = false;
  }

  function handleParallax(y, ctx) {
    computeFrame(ctx?.motionY ?? y);
  }

  function handleWrite() {
    applyFrame();
  }

  function startIntro(withDelay = true) {
    if (introStarted) return;
    introStarted = true;

    if (typeof window !== "undefined") {
      window.__homeHeroIntroPlayed = true;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        introVisible = true;
        clearTimeout(mediaIntroTimeout);
        mediaIntroTimeout = setTimeout(() => {
          heroMediaVisible = true;
          clearTimeout(titleIntroTimeout);
          titleIntroTimeout = setTimeout(() => {
            titleVisible = true;
          }, 360);
        }, withDelay ? 120 : 0);
      });
    });
  }

  function shouldDelayIntroForSession() {
    if (typeof window === "undefined") return false;
    return !window.__homeHeroIntroPlayed;
  }

  function scheduleResizeUpdate() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      measureLayout();
      forceScrollEngineUpdate();
    }, 70);
  }

  onMount(() => {
    if (!browser) return;

    let destroyed = false;
    const shouldDelayIntro = shouldDelayIntroForSession();

    const handlePreloaderReveal = () => {
      clearTimeout(fallbackTimeout);
      startIntro(false);
    };

    const handleWindowLoad = () => {
      measureLayout();
      forceScrollEngineUpdate();
    };

    const handlePageShow = () => {
      measureLayout();
      forceScrollEngineUpdate();
    };

    const boot = async () => {
      measureLayout();

      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch {}
      }

      if (destroyed) return;

      requestAnimationFrame(() => {
        measureLayout();
        requestAnimationFrame(() => {
          measureLayout();
          forceScrollEngineUpdate();
        });
      });
    };

    boot();

    registerParallax(handleParallax, { priority: 2 });
    registerWrite(handleWrite, { priority: 2 });

    window.addEventListener("resize", scheduleResizeUpdate, { passive: true });
    window.addEventListener("orientationchange", scheduleResizeUpdate, { passive: true });
    window.addEventListener("load", handleWindowLoad);
    window.addEventListener("pageshow", handlePageShow);
    if (shouldDelayIntro) {
      window.addEventListener("preloader:content-reveal", handlePreloaderReveal);
      window.addEventListener("preloader:done", handlePreloaderReveal);
    }

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        scheduleResizeUpdate();
      });

      if (heroSection) resizeObserver.observe(heroSection);
      if (heroStage) resizeObserver.observe(heroStage);
      if (afterTextEl) resizeObserver.observe(afterTextEl);
      if (afterImageEl) resizeObserver.observe(afterImageEl);
    }

    if (shouldDelayIntro) {
      fallbackTimeout = setTimeout(() => {
        startIntro(true);
      }, document.getElementById("site-intro-loader") ? 8000 : 1800);
    } else {
      startIntro(false);
    }

    return () => {
      destroyed = true;
      unregisterParallax(handleParallax);
      unregisterWrite(handleWrite);
      window.removeEventListener("resize", scheduleResizeUpdate);
      window.removeEventListener("orientationchange", scheduleResizeUpdate);
      window.removeEventListener("load", handleWindowLoad);
      window.removeEventListener("pageshow", handlePageShow);
      if (shouldDelayIntro) {
        window.removeEventListener("preloader:content-reveal", handlePreloaderReveal);
        window.removeEventListener("preloader:done", handlePreloaderReveal);
      }
      clearTimeout(fallbackTimeout);
      clearTimeout(mediaIntroTimeout);
      clearTimeout(titleIntroTimeout);
      clearTimeout(resizeTimer);
      resizeObserver?.disconnect();
    };
  });
</script>

<section class="hero-join-clean" bind:this={heroSection}>
  <section class="hero-stage">
    <div class="hero-media-sticky" aria-hidden="true">
      <div class="hero-media" class:media-visible={heroMediaVisible} bind:this={heroStage}>
        <img
          bind:this={heroMediaImgEl}
          src="/images/justx.webp"
          alt=""
        />
        <div class="hero-dark-layer" bind:this={heroDarkLayerEl}></div>
      </div>
    </div>

    <div class="hero-stage-content">
      <div class="hero-scroll-cue" class:intro-visible={introVisible} class:title-visible={titleVisible} aria-hidden="true">
        <span class="hero-scroll-label">Services</span>
        <span class="hero-scroll-arrow">↓</span>
      </div>
    </div>
  </section>

  <section class="after-section">
    <div class="after-grid">
      <div class="after-text" bind:this={afterTextEl}>
        <h2 aria-label={finalText}>
          {#each words as word, w}
            {#if w === grayStartsAtWord}<br>{/if}<span class="word" class:muted-word={w >= grayStartsAtWord}>{word}</span>{#if w < words.length - 1 && w !== grayStartsAtWord - 1}<span class="space">&nbsp;</span>{/if}
          {/each}
        </h2>
      </div>

      <div class="after-image" bind:this={afterImageEl}>
        <img class="after-image-asset" src={activeAfterImage} alt="Visuel 3 Terres" />
      </div>
    </div>
  </section>

  <div class="hero-scroll-cue-mobile" class:title-visible={titleVisible} aria-hidden="true">
    <span class="hero-scroll-label">Services</span>
    <span class="hero-scroll-arrow">↓</span>
  </div>
</section>

<style>
  .hero-join-clean {
    position: relative;
    width: 100%;
    background: #000;
    color: #f4efe6;
    overflow: clip;
  }

  .hero-stage {
    position: relative;
    min-height: 132svh;
    z-index: 0;
  }

  .hero-media-sticky {
    position: sticky;
    top: 0;
    height: var(--viewport-height);
    margin-bottom: calc(-1 * var(--viewport-height));
    z-index: 0;
    pointer-events: none;
  }

  .hero-media {
    position: absolute;
    inset: 0;
    height: var(--viewport-height);
    background: #000;
    opacity: 0;
    transition: opacity 760ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .hero-media.media-visible {
    opacity: 1;
  }

  .hero-media::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 22vh;
    height: 22svh;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.88) 0%,
      rgba(0, 0, 0, 0.58) 34%,
      rgba(0, 0, 0, 0.2) 68%,
      rgba(0, 0, 0, 0) 100%
    );
    pointer-events: none;
    z-index: 1;
  }

  .hero-media img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 1;
    transform: scale(1.03);
    filter: brightness(1);
    transition:
      opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1),
      transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .hero-dark-layer {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(
        to top,
        rgba(0, 0, 0, 1) 0%,
        rgba(0, 0, 0, 0.96) 16%,
        rgba(0, 0, 0, 0.78) 34%,
        rgba(0, 0, 0, 0.42) 52%,
        rgba(0, 0, 0, 0.12) 66%,
        rgba(0, 0, 0, 0) 78%
      ),
      radial-gradient(
        circle at 50% 50%,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.03) 44%,
        rgba(0, 0, 0, 0.12) 72%,
        rgba(0, 0, 0, 0.34) 100%
      );
    pointer-events: none;
    opacity: 0.08;
    will-change: opacity;
  }

  .hero-stage-content {
    position: relative;
    min-height: 100svh;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }

  .hero-scroll-cue {
    position: absolute;
    left: clamp(1rem, 2vw, 1.8rem);
    bottom: max(clamp(1rem, 2.2vw, 1.6rem), var(--safe-bottom-offset));
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    gap: 0.45rem;
    color: #fff;
    z-index: 4;
    opacity: 1;
    transform: none;
  }

  .hero-scroll-cue-mobile {
    display: none;
  }

  .hero-scroll-label {
    font-family: "Inter", sans-serif;
    font-size: clamp(5.8rem, 5vw, 18rem);
    font-weight: 500;
    line-height: 1;
    letter-spacing: var(--site-display-letter-spacing);
    text-align: left;
    opacity: 0;
    transform: translate3d(0, 14px, 0);
    transition:
      opacity 720ms cubic-bezier(0.22, 1, 0.36, 1),
      transform 720ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .title-visible .hero-scroll-label {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  .hero-scroll-arrow {
    display: block;
    font-family: "Inter", sans-serif;
    font-size: clamp(1.1rem, 1.1vw, 1.2rem);
    line-height: 1;
    font-weight: 300;
    color: #fff;
  }

  .after-section {
    position: relative;
    z-index: 3;
    background: transparent;
    padding: 12vh 0 18vh;
  }

  .after-grid {
    width: min(1400px, 92%);
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.78fr);
    gap: clamp(1.4rem, 4vw, 4.5rem);
    align-items: start;
  }

  .after-text {
    will-change: transform, opacity;
    width: 100%;
    min-width: 0;
    opacity: 1;
    transform: none;
  }

  .after-text h2 {
    margin: 0;
    width: 100%;
    max-width: 24ch;
    font-family: "Inter", sans-serif;
    font-weight: 300;
    font-size: clamp(1.8rem, 3.5vw, 3.8rem);
    line-height: 1.08;
    letter-spacing: -0.02em;
    color: #fff;
  }

  .after-text h2::before {
    content: "";
    display: block;
    width: 24px;
    height: 1px;
    background: #5768ff;
    margin-bottom: 1.2rem;
  }

  .word {
    display: inline-block;
    white-space: nowrap;
    color: rgba(245, 241, 232, 0.35);
  }

  .word.muted-word {
    color: rgba(245, 241, 232, 0.35);
  }

  .space {
    display: inline;
  }

  .after-image {
    position: relative;
    justify-self: end;
    width: min(100%, 460px);
    aspect-ratio: 1.45 / 1;
    overflow: hidden;
    background: #0b0b0b;
    will-change: transform;
    margin-top: clamp(4rem, 6vw, 7rem);
    transform-origin: 50% 50%;
    transform: translate3d(0, 22px, 0) scale(0.885);
  }

  .after-image img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .after-image-asset {
    opacity: 1;
  }

  @media (max-width: 900px) {
    .after-grid {
      width: min(100%, 760px);
      grid-template-columns: 1fr 0.82fr;
      gap: 0.8rem;
      padding-inline: var(--project-side-padding, 0.8rem);
      box-sizing: border-box;
    }

    .after-text h2 {
      font-size: clamp(1.6rem, 5.5vw, 2.8rem);
      max-width: 20ch;
      line-height: 1.08;
      padding-inline: var(--project-text-inset, 0);
    }
  }

  @media (max-width: 640px) {
    .hero-media::after {
      display: none;
    }

    .hero-media img,
    .hero-dark-layer {
      inset: 0 0 -12svh 0;
      height: calc(100% + 12svh);
    }

    .hero-dark-layer {
      background: none;
      opacity: 0 !important;
    }

    .hero-scroll-cue {
      display: none;
    }

    .hero-scroll-cue-mobile {
      position: absolute;
      left: 1rem;
      top: calc(100svh - max(4.8rem, calc(var(--safe-bottom-offset) + 4rem)));
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-end;
      gap: 0.42rem;
      color: #fff;
      z-index: 20;
      pointer-events: none;
    }

    .hero-scroll-label {
      font-size: 3rem;
      letter-spacing: var(--site-display-letter-spacing);
    }

    .hero-scroll-arrow {
      font-size: 1.05rem;
    }

    .after-section {
      padding: 0 0 28vh;
      background: #000;
    }

    .after-section::before {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: -68rem;
      height: 68rem;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.01) 16%,
        rgba(0, 0, 0, 0.03) 32%,
        rgba(0, 0, 0, 0.08) 48%,
        rgba(0, 0, 0, 0.18) 64%,
        rgba(0, 0, 0, 0.38) 78%,
        rgba(0, 0, 0, 0.68) 90%,
        rgba(0, 0, 0, 0.92) 97%,
        rgba(0, 0, 0, 1) 100%
      );
      pointer-events: none;
      z-index: 0;
    }

    .after-grid {
      width: min(100%, 520px);
      grid-template-columns: 1fr;
      gap: 1rem;
      padding-inline: var(--project-side-padding, 0.8rem);
      box-sizing: border-box;
      margin-top: -9.5rem;
      position: relative;
      z-index: 1;
    }

    .after-text {
      width: 100%;
      justify-self: start;
    }

    .after-text h2 {
      max-width: 20ch;
      font-size: clamp(1.4rem, 6.5vw, 2.1rem);
      line-height: 1.08;
      padding-inline: var(--project-text-inset, 0);
    }

    .after-text h2::before {
      margin-top: clamp(2.5rem, 9vw, 4rem);
    }

    .after-image {
      width: min(78%, 340px);
      justify-self: end;
      aspect-ratio: 1.6 / 1;
      margin-top: 3.5rem;
    }

    .after-text,
    .after-image {
      transition: none !important;
      animation: none !important;
      filter: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-media img,
    .hero-scroll-cue,
    .hero-scroll-label,
    .after-text,
    .after-image {
      transition: none !important;
      animation: none !important;
      filter: none !important;
      opacity: 1 !important;
      -webkit-mask-image: none !important;
      mask-image: none !important;
      transform: none !important;
    }

    .hero-dark-layer {
      opacity: 0.22 !important;
    }
  }
</style>
