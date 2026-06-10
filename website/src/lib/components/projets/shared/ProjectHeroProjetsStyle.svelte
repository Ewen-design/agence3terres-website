<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import {
    registerParallax,
    unregisterParallax,
    registerWrite,
    unregisterWrite,
    forceScrollEngineUpdate
  } from "$lib/scrollEngine.js";

  export let title = "";
  export let image = "";
  export let metaBlocks = [];
  export let ctaLabel = "Visit Website";
  export let ctaHref = "";
  export let ctaExternal = false;

  let heroSection;
  let heroStage;
  let afterTextEl;
  let afterActionEl;
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
  let afterActionTop = 0;

  let pendingFrame = null;
  let dirty = false;

  const applied = {
    imageScale: -1,
    imageBrightness: -1,
    imageOpacity: -1,
    imageDark: -1,
    textOpacity: -1,
    textY: -9999,
    actionOpacity: -1,
    actionY: -9999
  };

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
    afterActionTop = getAbsoluteTop(afterActionEl);
  }

  function getLocalRevealFromAbsolute(scrollY, absTop, startMul = 0.9, endMul = 0.22) {
    const topInViewport = absTop - scrollY;
    const start = vh * startMul;
    const end = vh * endMul;
    return clamp((start - topInViewport) / Math.max(start - end, 1), 0, 1);
  }

  function computeFrame(y) {
    if (!afterTextEl || !afterActionEl) return;

    const heroScrollable = Math.max(heroHeight - vh, 1);
    const imageFadeProgress = clamp((y - heroTop) / heroScrollable, 0, 1);
    const globalFade = imageFadeProgress * imageFadeProgress * (3 - 2 * imageFadeProgress);

    const textReveal = getLocalRevealFromAbsolute(y, afterTextTop, 0.92, 0.16);
    const actionReveal = getLocalRevealFromAbsolute(y, afterActionTop, 0.96, 0.2);

    pendingFrame = {
      imageScale: q(lerp(1.03, 1.005, globalFade), 0.0001),
      imageBrightness: isMobile ? 1 : q(lerp(1, 0.62, globalFade), 0.001),
      imageOpacity: isMobile ? 1 : q(lerp(1, 0, globalFade), 0.001),
      imageDark: isMobile ? 0 : q(lerp(0.08, 0.62, globalFade), 0.001),
      textOpacity: q(lerp(0.16, 1, textReveal), 0.001),
      textY: q(lerp(22, 0, textReveal), 0.1),
      actionOpacity: q(lerp(0.16, 1, actionReveal), 0.001),
      actionY: q(lerp(18, 0, actionReveal), 0.1)
    };

    dirty = true;
  }

  function applyFrame() {
    if (!dirty || !pendingFrame) return;

    const frame = pendingFrame;

    if (heroMediaImgEl) {
      if (
        frame.imageScale !== applied.imageScale ||
        frame.imageBrightness !== applied.imageBrightness ||
        frame.imageOpacity !== applied.imageOpacity
      ) {
        heroMediaImgEl.style.transform = `scale(${frame.imageScale})`;
        heroMediaImgEl.style.filter = `brightness(${frame.imageBrightness})`;
        heroMediaImgEl.style.opacity = `${frame.imageOpacity}`;
        applied.imageScale = frame.imageScale;
        applied.imageBrightness = frame.imageBrightness;
        applied.imageOpacity = frame.imageOpacity;
      }
    }

    if (heroDarkLayerEl && frame.imageDark !== applied.imageDark) {
      heroDarkLayerEl.style.opacity = `${frame.imageDark}`;
      applied.imageDark = frame.imageDark;
    }

    dirty = false;
  }

  function handleParallax(y, ctx) {
    computeFrame(ctx?.motionY ?? y);
  }

  function handleWrite() {
    applyFrame();
  }

  function handleButtonMove(event) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    button.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    button.style.setProperty("--my", `${event.clientY - rect.top}px`);
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
      if (afterActionEl) resizeObserver.observe(afterActionEl);
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
          src={image}
          alt=""
        />
        <div class="hero-dark-layer" bind:this={heroDarkLayerEl}></div>
      </div>
    </div>

    <div class="hero-stage-content">
      <div class="hero-scroll-cue" class:intro-visible={introVisible} class:title-visible={titleVisible}>
        <h1 class="hero-scroll-label">{title}</h1>
        <span class="hero-scroll-arrow" aria-hidden="true">↓</span>
      </div>
    </div>
  </section>

  <section class="after-section">
    <div class="after-grid">
      <div class="after-meta" bind:this={afterTextEl}>
        {#each metaBlocks as block}
          <article class="after-meta__block">
            <h2>{block.label}</h2>
            {#if Array.isArray(block.value)}
              <ul>
                {#each block.value as item}
                  <li>{item}</li>
                {/each}
              </ul>
            {:else}
              <p>{block.value}</p>
            {/if}
          </article>
        {/each}
      </div>

      <div class="after-action" bind:this={afterActionEl}>
        {#if ctaHref}
          <a
            class="hero-cta"
            href={ctaHref}
            target={ctaExternal ? "_blank" : undefined}
            rel={ctaExternal ? "noreferrer" : undefined}
            on:mousemove={handleButtonMove}
          >
            <span class="hero-cta__flip" data-text={ctaLabel}>
              <span class="hero-cta__text">{ctaLabel}</span>
            </span>
          </a>
        {:else}
          <button class="hero-cta" type="button" on:mousemove={handleButtonMove}>
            <span class="hero-cta__flip" data-text={ctaLabel}>
              <span class="hero-cta__text">{ctaLabel}</span>
            </span>
          </button>
        {/if}
      </div>
    </div>
  </section>

  <div class="hero-scroll-cue-mobile" class:title-visible={titleVisible} aria-hidden="true">
    <h1 class="hero-scroll-label">{title}</h1>
    <span class="hero-scroll-arrow">↓</span>
  </div>
</section>

<style>
  .hero-join-clean {
    position: relative;
    width: 100%;
    background: var(--project-surface-bg, #000);
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
    margin: 0;
    font-family: "Clash Display", sans-serif;
    font-size: clamp(5.8rem, 5vw, 18rem);
    font-weight: 200;
    line-height: 1;
    letter-spacing: 0.02em;
    text-align: left;
    color: #fff;
    max-width: 10ch;
    text-wrap: balance;
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
    font-family: "Clash Display", sans-serif;
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
    grid-template-columns: minmax(0, 1fr) auto;
    gap: clamp(2rem, 5vw, 6rem);
    align-items: start;
  }

  .after-meta {
    display: grid;
    gap: clamp(2rem, 3vw, 2.9rem);
    width: min(26rem, 100%);
    padding-inline: var(--project-text-inset, 0);
    opacity: 1;
    transform: none;
    will-change: transform, opacity;
  }

  .after-meta__block h2 {
    margin: 0 0 0.7rem;
    font-family: "Clash Display", sans-serif;
    font-size: clamp(1.55rem, 2vw, 2rem);
    font-weight: 300;
    line-height: 0.98;
    
    color: #f7f2e8;
  }

  .after-meta__block p,
  .after-meta__block li {
    margin: 0;
    font-family: "Clash Display", sans-serif;
    font-size: clamp(1.28rem, 2vw, 2.05rem);
    font-weight: 300;
    line-height: 1.14;
    
    color: rgba(244, 239, 230, 0.72);
  }

  .after-meta__block ul {
    list-style: none;
    display: grid;
    gap: 0.35rem;
    padding: 0;
    margin: 0;
  }

  .after-action {
    justify-self: end;
    padding-inline: var(--project-text-inset, 0);
    opacity: 1;
    transform: none;
    will-change: transform, opacity;
  }

  .hero-cta {
    font-family: "Clash Display", sans-serif;
    position: relative;
    min-width: clamp(10.5rem, 16vw, 14rem);
    height: clamp(3.15rem, 4vw, 3.9rem);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: 0 1.2rem;
    font-size: clamp(0.95rem, 1.1vw, 1.12rem);
    font-weight: 400;
    color: #f7f2e8;
    border: 0;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 2px;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.04);
    text-decoration: none;
    transition:
      transform 1.2s cubic-bezier(.22,.61,.36,1),
      box-shadow 1.2s cubic-bezier(.22,.61,.36,1),
      background 1.2s cubic-bezier(.22,.61,.36,1),
      color 220ms ease;
  }

  .hero-cta__flip {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
  }

  .hero-cta__text {
    display: block;
    transform: translateY(0%);
    transition:
      transform 0.45s cubic-bezier(.22,.61,.36,1),
      opacity 0.28s ease;
  }

  .hero-cta__flip::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition:
      transform 0.45s cubic-bezier(.22,.61,.36,1),
      opacity 0.28s ease;
    white-space: nowrap;
    color: inherit;
  }

  .hero-cta::before,
  .hero-cta::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
  }

  .hero-cta::before {
    border: 1px solid transparent;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      rgba(220, 240, 255, 1) 0%,
      rgba(145, 205, 255, 0.98) 22%,
      rgba(74, 140, 255, 0.62) 45%,
      rgba(18, 45, 120, 0.14) 62%,
      transparent 78%
    );
    transition: opacity 0.25s ease;
  }

  .hero-cta::after {
    border: 1px solid transparent;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      rgba(95, 165, 255, 0.42) 0%,
      rgba(74, 140, 255, 0.18) 42%,
      transparent 72%
    );
    filter: blur(2px);
    transition: opacity 0.25s ease;
  }

  .hero-cta:hover .hero-cta__text {
    transform: translateY(-100%);
  }

  .hero-cta:hover .hero-cta__flip::after {
    transform: translateY(0%);
  }

  .hero-cta:hover::before,
  .hero-cta:hover::after {
    opacity: 1;
  }

  @media (max-width: 900px) {
    .after-grid {
      width: min(94%, 760px);
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .after-action {
      justify-self: start;
    }

    .hero-scroll-label {
      font-size: clamp(4rem, 10vw, 7rem);
      max-width: 9ch;
    }
  }

  @media (max-width: 640px) {
    .hero-media::after {
      display: none;
    }

    .hero-stage {
      min-height: 128svh;
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

    .hero-scroll-label {
      font-size: clamp(2.9rem, 13vw, 4.8rem);
      line-height: 0.95;
      max-width: 8ch;
    }

    .hero-scroll-cue {
      display: none;
    }

    .hero-scroll-cue-mobile {
      position: absolute;
      left: 1rem;
      top: calc(100svh - max(8.8rem, calc(var(--safe-bottom-offset) + 8rem)));
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-end;
      gap: 0.42rem;
      color: #fff;
      z-index: 20;
      pointer-events: none;
    }

    .hero-scroll-arrow {
      font-size: 1rem;
    }

    .after-section {
      padding: 10vh 0 12vh;
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
      width: min(94%, 520px);
      gap: 1.25rem;
      position: relative;
      z-index: 1;
    }

    .after-meta {
      width: 100%;
      gap: 1.6rem;
    }

    .after-meta__block h2 {
      margin-bottom: 0.5rem;
      font-size: clamp(1.35rem, 5.3vw, 1.8rem);
    }

    .after-meta__block p,
    .after-meta__block li {
      font-size: clamp(1.2rem, 6vw, 1.6rem);
    }

    .hero-cta {
      min-width: min(100%, 18rem);
      width: 100%;
      height: 3.45rem;
      font-size: 1rem;
      padding: 0 1rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-media img,
    .hero-dark-layer,
    .hero-scroll-label,
    .hero-scroll-cue,
    .after-meta,
    .after-action,
    .hero-cta,
    .hero-cta__text,
    .hero-cta__flip::after {
      transition: none !important;
      animation: none !important;
      filter: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
  }
</style>
