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

  let heroSection;
  let heroMediaImgEl;
  let heroDarkLayerEl;
  let scrollHintEl;
  let afterTextEl;
  let afterTextEntered = false;

  let vh = 1;
  let heroTop = 0;
  let heroHeight = 1;
  let afterTextTop = 0;

  let introVisible = false;
  let hintVisible = false;

  let fallbackTimeout;
  let hintTimeout;
  let resizeObserver;
  let resizeTimer;
  let afterTextObserver;

  let isActive = true;
  let isMobile = false;
  let dirty = false;
  let pendingFrame = null;

  const title = "À propos";

  const finalText =
    "Nous concevons des identités, des expériences et des univers visuels pensés pour marquer durablement les esprits.";

  const words = finalText.split(" ");

  let charCount = 0;
  const totalChars = finalText.replace(/\s/g, "").length;
  const halfChars = totalChars / 2;

  let grayStartsAtWord = words.length;

  for (let w = 0; w < words.length; w++) {
    const nextCount = charCount + words[w].length;
    if (nextCount >= halfChars) {
      grayStartsAtWord = w + 1;
      break;
    }
    charCount = nextCount;
  }

  let applied = {
    imageScale: -1,
    imageBrightness: -1,
    imageDark: -1,
    hintOpacity: -1,
    hintY: -9999,
    hintBlur: -1,
    textOpacity: -1,
    textX: -9999,
    textY: -9999,
    textEdge: -9999
  };

  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const q = (v, step) => Math.round(v / step) * step;

  function easeInOutSine(t) {
    const x = clamp(t, 0, 1);
    return -(Math.cos(Math.PI * x) - 1) / 2;
  }

  function easeOutCubic(t) {
    const x = clamp(t, 0, 1);
    return 1 - Math.pow(1 - x, 3);
  }

  function easeOutQuart(t) {
    const x = clamp(t, 0, 1);
    return 1 - Math.pow(1 - x, 4);
  }

  function easeInCubic(t) {
    const x = clamp(t, 0, 1);
    return x * x * x;
  }

  function getPremiumFlowOffset(progress, distance, centerDrag = 0.04) {
    const entryEnd = 0.46;
    const centerEnd = 0.56;

    if (progress <= entryEnd) {
      const t = easeInOutSine(progress / entryEnd);
      return distance * (1 - t) + distance * centerDrag * 0.5 * t;
    }

    if (progress < centerEnd) {
      const t = easeInOutSine((progress - entryEnd) / (centerEnd - entryEnd));
      return distance * centerDrag * (0.5 - t);
    }

    const t = easeInOutSine((progress - centerEnd) / (1 - centerEnd));
    return -distance * centerDrag * 0.5 * (1 - t) + -distance * t;
  }

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
    isMobile = window.innerWidth <= 900;
    heroTop = getAbsoluteTop(heroSection);
    afterTextTop = getAbsoluteTop(afterTextEl);
    heroHeight = Math.max(heroSection?.offsetHeight || 1, 1);
  }

  function updateAllMeasures() {
    measureLayout();
  }

  function getLocalRevealFromAbsolute(scrollY, absTop, startMul = 0.92, endMul = 0.14) {
    const topInViewport = absTop - scrollY;
    const start = vh * startMul;
    const end = vh * endMul;
    return clamp((start - topInViewport) / Math.max(start - end, 1), 0, 1);
  }

  function computeFrame(y) {
    if (!heroSection || !afterTextEl || !isActive) return;

    const heroScrollable = Math.max(heroHeight - vh, 1);
    const imageFadeProgress = clamp((y - heroTop) / heroScrollable, 0, 1);
    const globalFade = easeInOutSine(imageFadeProgress);
    const endFade = Math.pow(clamp((imageFadeProgress - 0.78) / 0.22, 0, 1), 1.7);

    const imageDark = clamp(globalFade * 0.42 + endFade * 0.58, 0, 1);
    const midBrightness = lerp(1, 0.58, globalFade);
    const imageBrightness = lerp(midBrightness, 0, endFade);
    const imageScale = lerp(1.06, 1.025, globalFade);

    const hintScrollFade = 1 - easeOutCubic(clamp(imageFadeProgress / 0.06, 0, 1));
    const scrollHintOpacity = hintVisible ? hintScrollFade : 0;

    pendingFrame = {
      imageScale: q(imageScale, 0.001),
      imageBrightness: q(imageBrightness, 0.001),
      imageDark: q(imageDark, 0.001),
      hintOpacity: q(scrollHintOpacity, 0.001),
      hintY: q(lerp(14, 0, scrollHintOpacity), 0.1),
      hintBlur: q(isMobile ? 0 : lerp(10, 0, scrollHintOpacity), 0.1)
    };

    dirty = true;
  }

  function applyFrame() {
    if (!dirty || !pendingFrame) return;

    const f = pendingFrame;

    if (heroMediaImgEl) {
      if (f.imageScale !== applied.imageScale || f.imageBrightness !== applied.imageBrightness) {
        heroMediaImgEl.style.transform = `scale(${f.imageScale})`;
        heroMediaImgEl.style.filter = `brightness(${f.imageBrightness})`;
        applied.imageScale = f.imageScale;
        applied.imageBrightness = f.imageBrightness;
      }
    }

    if (heroDarkLayerEl && f.imageDark !== applied.imageDark) {
      heroDarkLayerEl.style.opacity = `${f.imageDark}`;
      applied.imageDark = f.imageDark;
    }

    if (scrollHintEl) {
      if (
        f.hintOpacity !== applied.hintOpacity ||
        f.hintY !== applied.hintY ||
        f.hintBlur !== applied.hintBlur
      ) {
        scrollHintEl.style.opacity = `${f.hintOpacity}`;
        scrollHintEl.style.transform = `translate3d(-50%, ${f.hintY}px, 0)`;
        scrollHintEl.style.filter = `blur(${f.hintBlur}px)`;
        applied.hintOpacity = f.hintOpacity;
        applied.hintY = f.hintY;
        applied.hintBlur = f.hintBlur;
      }
    }
    dirty = false;
  }

  function handleParallax(y) {
    if (!isActive) return;
    computeFrame(y);
  }

  function handleWrite() {
    if (!isActive) return;
    applyFrame();
  }

  function startIntro() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        introVisible = true;

        hintTimeout = setTimeout(() => {
          hintVisible = true;
          forceScrollEngineUpdate();
        }, 240);
      });
    });
  }

  function scheduleResizeUpdate() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateAllMeasures();
      forceScrollEngineUpdate();
    }, 70);
  }

  onMount(() => {
    if (!browser) return;

    let destroyed = false;

    const handleWindowLoad = () => {
      updateAllMeasures();
      forceScrollEngineUpdate();
    };

    const handlePageShow = () => {
      updateAllMeasures();
      forceScrollEngineUpdate();
    };

    const boot = async () => {
      updateAllMeasures();

      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch {}
      }

      if (destroyed) return;

      requestAnimationFrame(() => {
        updateAllMeasures();
        requestAnimationFrame(() => {
          updateAllMeasures();
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

    afterTextObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || afterTextEntered) return;
        afterTextEntered = true;
        afterTextEl?.style.setProperty("--text-reveal-edge", "118%");
        afterTextObserver?.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.2 }
    );
    if (afterTextEl) afterTextObserver.observe(afterTextEl);

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        scheduleResizeUpdate();
      });

      if (heroSection) resizeObserver.observe(heroSection);
      if (afterTextEl) resizeObserver.observe(afterTextEl);
    }

    fallbackTimeout = setTimeout(() => {
      startIntro();
    }, 120);

    return () => {
      destroyed = true;
      unregisterParallax(handleParallax);
      unregisterWrite(handleWrite);
      window.removeEventListener("resize", scheduleResizeUpdate);
      window.removeEventListener("orientationchange", scheduleResizeUpdate);
      window.removeEventListener("load", handleWindowLoad);
      window.removeEventListener("pageshow", handlePageShow);
      clearTimeout(fallbackTimeout);
      clearTimeout(hintTimeout);
      clearTimeout(resizeTimer);
      afterTextObserver?.disconnect();
      resizeObserver?.disconnect();
    };
  });
</script>

<section class="hero-single-clean" bind:this={heroSection}>
  <div class="hero-media-sticky" aria-hidden="true">
    <div class="hero-media">
      <img
        bind:this={heroMediaImgEl}
        src="images/telephone2.webp"
        alt=""
      />
      <div class="hero-dark-layer" bind:this={heroDarkLayerEl}></div>
    </div>
  </div>

  <section class="hero-intro">
    <div class="hero-overlay">
      <h1 class:intro-visible={introVisible}>
        {title}
      </h1>

      <div
        class="scroll-hint"
        class:hint-visible={hintVisible}
        aria-hidden="true"
        bind:this={scrollHintEl}
      >
        Scroll pour découvrir
      </div>
    </div>
  </section>

  <section class="after-section">
    <div class="after-grid">
      <div class="after-spacer" aria-hidden="true"></div>

      <div class="after-text" class:after-text-visible={afterTextEntered} bind:this={afterTextEl}>
        <h2 aria-label={finalText}>
          {#each words as word, w}
            <span class="word" class:muted-word={w >= grayStartsAtWord}>
              {word}
            </span>{#if w < words.length - 1}<span class="space">&nbsp;</span>{/if}
          {/each}
        </h2>
      </div>
    </div>
  </section>
</section>

<style>
  .hero-single-clean {
    position: relative;
    width: 100%;
    background: #000;
    color: #f4efe6;
    overflow: clip;
  }

  .hero-media-sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    height: 100svh;
    margin-bottom: -100vh;
    z-index: 0;
    pointer-events: none;
  }

  .hero-media {
    position: absolute;
    inset: 0;
    background: #000;
  }

  .hero-media img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    will-change: transform, filter;
    transform: scale(1.06);
    filter: brightness(1);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  @media (max-width: 900px) {
    .hero-media img {
      will-change: transform;
      filter: none;
    }
  }

  .hero-dark-layer {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        circle at 50% 50%,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.02) 40%,
        rgba(0, 0, 0, 0.08) 68%,
        rgba(0, 0, 0, 0.40) 100%
      );
    pointer-events: none;
    will-change: opacity;
    opacity: 0;
  }

  .hero-intro {
    position: relative;
    min-height: 100vh;
    min-height: 100svh;
    z-index: 2;
  }

  .hero-overlay {
    position: relative;
    min-height: 100vh;
    min-height: 100svh;
    padding: clamp(1.1rem, 2vw, 2rem);
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
  }

  .hero-overlay h1 {
    margin: 0;
    max-width: 8ch;
    font-family: "Titre italic", serif;
    font-style: italic;
    font-weight: 100;
    font-size: clamp(4.2rem, 11vw, 13rem);
    line-height: 0.9;
    letter-spacing: -0.05em;
    color: #f4efe6;
    opacity: 0;
    transform: translate3d(0, 42px, 0);
    filter: blur(18px);
    will-change: transform, opacity, filter;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .hero-overlay h1.intro-visible {
    animation: titleEnterUp 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .scroll-hint {
    position: absolute;
    left: 50%;
    bottom: clamp(1.3rem, 3vw, 2.4rem);
    font-family: "General Sans", sans-serif;
    font-size: clamp(0.82rem, 0.95vw, 0.98rem);
    font-weight: 300;
    letter-spacing: 0.04em;
    color: rgba(255, 255, 255, 0.76);
    white-space: nowrap;
    will-change: transform, opacity, filter;
    opacity: 0;
    transform: translate3d(-50%, 14px, 0);
  }

  .hint-visible {
    transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .after-section {
    position: relative;
    z-index: 3;
    background: transparent;
    padding: 16vh 0 18vh;
  }

  .after-grid {
    width: min(1400px, 92%);
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(320px, 0.92fr);
    gap: clamp(1.4rem, 4vw, 4.5rem);
    align-items: start;
  }

  .after-spacer {
    min-height: 1px;
  }

  .after-text {
    grid-column: 2;
    justify-self: end;
    width: 100%;
    min-width: 0;
    opacity: 0;
    transform: translate3d(0, 42px, 0);
    will-change: transform, opacity;
    transition:
      opacity 1s cubic-bezier(0.22, 1, 0.36, 1),
      transform 1.1s cubic-bezier(0.22, 1, 0.36, 1);
    pointer-events: none;
    -webkit-mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 1) calc(var(--text-reveal-edge, 0%) - 12%),
      rgba(0, 0, 0, 0.75) calc(var(--text-reveal-edge, 0%) + 2%),
      rgba(0, 0, 0, 0.2) calc(var(--text-reveal-edge, 0%) + 14%),
      rgba(0, 0, 0, 0) calc(var(--text-reveal-edge, 0%) + 28%)
    );
    mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 1) calc(var(--text-reveal-edge, 0%) - 12%),
      rgba(0, 0, 0, 0.75) calc(var(--text-reveal-edge, 0%) + 2%),
      rgba(0, 0, 0, 0.2) calc(var(--text-reveal-edge, 0%) + 14%),
      rgba(0, 0, 0, 0) calc(var(--text-reveal-edge, 0%) + 28%)
    );
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-size: 100% 140%;
    mask-size: 100% 140%;
  }

  .after-text.after-text-visible {
    opacity: 1;
    transform: translate3d(0, 0, 0);
    pointer-events: auto;
  }

  .after-text h2 {
    margin: 0;
    width: 100%;
    max-width: 30ch;
    font-family: "General Sans", sans-serif;
    font-weight: 300;
    font-size: clamp(1.3rem, 2.8vw, 2.8rem);
    line-height: 1;
    letter-spacing: -0.05em;
    color: #fff;
    text-align: left;
  }

  .word {
    display: inline-block;
    white-space: nowrap;
    color: #fff;
  }

  .word.muted-word {
    color: rgba(255, 255, 255, 0.7);
  }

  .space {
    display: inline;
  }

  @keyframes titleEnterUp {
    from {
      opacity: 0;
      filter: blur(18px);
      transform: translate3d(0, 42px, 0);
    }
    to {
      opacity: 1;
      filter: blur(0);
      transform: translate3d(0, 0, 0);
    }
  }

  @media (max-width: 900px) {
    .hero-overlay {
      padding: 1rem 1rem 1.2rem;
    }

    .hero-overlay h1 {
      font-size: clamp(2.5rem, 10vw, 5.6rem);
      max-width: 9ch;
    }

    .after-grid {
      width: min(94%, 760px);
      grid-template-columns: 1fr;
      gap: 0.8rem;
    }

    .after-text {
      grid-column: auto;
      width: min(100%, 520px);
      justify-self: end;
    }

    .after-text h2 {
      font-size: clamp(1.3rem, 6.8vw, 2.7rem);
      max-width: 11ch;
    }

    .scroll-hint {
      bottom: 1.25rem;
      font-size: 0.82rem;
    }
  }

  @media (max-width: 640px) {
    .after-section {
      padding: 11vh 0 12vh;
    }

    .hero-overlay h1 {
      font-size: clamp(2.1rem, 11vw, 3.8rem);
      line-height: 0.92;
    }

    .after-grid {
      width: min(94%, 520px);
    }

    .after-text {
      width: min(82%, 100%);
    }

    .after-text h2 {
      font-size: clamp(1.15rem, 6.4vw, 1.95rem);
      line-height: 1.04;
      max-width: none;
    }

    .scroll-hint {
      bottom: 1.05rem;
      font-size: 0.78rem;
      letter-spacing: 0.03em;
    }

  }

  @media (prefers-reduced-motion: reduce) {
    .hero-media img,
    .hero-dark-layer,
    .hero-overlay h1,
    .scroll-hint,
    .after-text {
      transition: none !important;
      animation: none !important;
      filter: none !important;
      opacity: 1 !important;
      -webkit-mask-image: none !important;
      mask-image: none !important;
      transform: none !important;
    }
  }
</style>
