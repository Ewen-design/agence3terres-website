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
  let pinSection;
  let afterSection;
  let afterTextEl;
  let afterImageEl;
  let leftTitleEl;
  let rightTitleEl;
  let heroMediaImgEl;
  let heroDarkLayerEl;
  let scrollHintEl;

  let vw = 0;
  let vh = 1;
  let leftW = 0;
  let rightW = 0;

  let heroTop = 0;
  let heroHeight = 1;
  let pinTop = 0;
  let pinHeight = 1;
  let afterTop = 0;
  let afterTextTop = 0;
  let afterImageTop = 0;

  let introStarted = false;
  let introVisible = false;
  let heroMediaVisible = false;
  let hintVisible = false;

  let fallbackTimeout;
  let mediaIntroTimeout;
  let hintTimeout;
  let afterImageRotationTimeout;
  let afterImageFadeTimeout;
  let resizeObserver;
  let resizeTimer;

  let isActive = true;
  let isMobile = false;
  let pendingFrame = null;
  let dirty = false;

  let applied = {
    imageScale: -1,
    imageBrightness: -1,
    imageDark: -1,
    leftX: -9999,
    rightX: -9999,
    hintOpacity: -1,
    hintY: -9999,
    hintBlur: -1,
    textOpacity: -1,
    textX: -9999,
    textY: -9999,
    textEdge: -9999,
    smallImageScale: -1,
    smallImageY: -9999
  };

  const finalText =
    "Nous concevons des identités, des expériences et des univers visuels pensés pour marquer durablement les esprits.";
  const afterImages = [
    "images/telephone2.webp",
    "images/telephone2_parfum.webp",
    "images/telephone_main.webp"
  ];
  let activeAfterImage = afterImages[0];
  let incomingAfterImage = "";
  let incomingAfterImageVisible = false;
  let afterImageIndex = 0;
  let afterImagesReady = false;
  let isAfterImageTransitioning = false;

  const IMAGE_ROTATION_INTERVAL = 2600;
  const IMAGE_FADE_DURATION = 1150;
  const IMAGE_RETRY_DELAY = 700;

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

  function getScrollY() {
    return window.scrollY || window.pageYOffset || 0;
  }

  function getAbsoluteTop(el) {
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return rect.top + getScrollY();
  }

  function measureTitles() {
    vw = window.innerWidth || 0;
    leftW = Math.round(leftTitleEl?.getBoundingClientRect().width || 0);
    rightW = Math.round(rightTitleEl?.getBoundingClientRect().width || 0);
  }

  function measureLayout() {
    vh = window.innerHeight || 1;
    isMobile = window.innerWidth <= 640;

    heroTop = getAbsoluteTop(heroSection);
    pinTop = getAbsoluteTop(pinSection);
    afterTop = getAbsoluteTop(afterSection);
    afterTextTop = getAbsoluteTop(afterTextEl);
    afterImageTop = getAbsoluteTop(afterImageEl);

    heroHeight = Math.max(heroSection?.offsetHeight || 1, 1);
    pinHeight = Math.max(pinSection?.offsetHeight || 1, 1);
  }

  function updateAllMeasures() {
    measureTitles();
    measureLayout();
  }

  function getLocalRevealFromAbsolute(scrollY, absTop, startMul = 0.9, endMul = 0.2) {
    const topInViewport = absTop - scrollY;
    const start = vh * startMul;
    const end = vh * endMul;
    return clamp((start - topInViewport) / Math.max(start - end, 1), 0, 1);
  }

  function computeFrame(y) {
    if (!pinSection || !afterSection || !heroSection || !isActive) return;

    const pinScrollable = Math.max(pinHeight - vh, 1);
    const heroProgress = clamp((y - pinTop) / pinScrollable, 0, 1);

    const heroScrollable = Math.max(heroHeight - vh, 1);
    const imageFadeProgress = clamp((y - heroTop) / heroScrollable, 0, 1);

    const localTextReveal = getLocalRevealFromAbsolute(y, afterTextTop, 0.92, 0.16);

    const localImageReveal = getLocalRevealFromAbsolute(y, afterImageTop, 0.98, 0.12);

    const mergeProgress = clamp(heroProgress / 0.9, 0, 1);
    const smoothMerge = easeInOutSine(mergeProgress);

    const globalFade = easeInOutSine(imageFadeProgress);
    const endFade = Math.pow(clamp((imageFadeProgress - 0.78) / 0.22, 0, 1), 1.7);

    const imageDark = isMobile
      ? lerp(0.46, 0.86, globalFade)
      : clamp(globalFade * 0.42 + endFade * 0.58, 0, 1);
    const midBrightness = lerp(1, 0.58, globalFade);
    const imageBrightness = isMobile ? 1 : lerp(midBrightness, 0, endFade);
    const imageScale = isMobile ? lerp(1.045, 1.018, globalFade) : lerp(1.06, 1.025, globalFade);

    const sideMargin = Math.min(vw * 0.085, 118);
    const joinGap = Math.min(vw * 0.012, 14);

    const leftStartX = sideMargin;
    const leftEndX = vw * 0.5 - leftW - joinGap * 0.5;

    const rightStartX = vw - rightW - sideMargin;
    const rightEndX = vw * 0.5 + joinGap * 0.5;

    const leftX = lerp(leftStartX, leftEndX, smoothMerge);
    const rightX = lerp(rightStartX, rightEndX, smoothMerge);

    const hintFadeProgress = easeInOutSine(clamp(heroProgress / 0.085, 0, 1));
    const hintScrollFade = 1 - hintFadeProgress;
    const scrollHintOpacity = hintVisible ? hintScrollFade : 0;

    const textBlockOpacity = lerp(0.14, 1, localTextReveal);
    const textBlockY = lerp(18, 0, localTextReveal);
    const textBlockX = 0;
    const textRevealEdge = lerp(0, 118, localTextReveal);

    const smallImageScale = lerp(0.885, 1.02, localImageReveal);
    const smallImageY = lerp(22, 0, localImageReveal);

    pendingFrame = {
      imageScale: q(imageScale, 0.001),
      imageBrightness: q(imageBrightness, 0.001),
      imageDark: q(imageDark, 0.001),
      leftX: q(leftX, 0.1),
      rightX: q(rightX, 0.1),
      hintOpacity: q(scrollHintOpacity, 0.001),
      hintY: q(lerp(10, 0, scrollHintOpacity), 0.1),
      hintBlur: q(lerp(6, 0, scrollHintOpacity), 0.1),
      textOpacity: q(textBlockOpacity, 0.001),
      textX: q(textBlockX, 0.1),
      textY: q(textBlockY, 0.1),
      textEdge: q(textRevealEdge, 0.1),
      smallImageScale: q(smallImageScale, 0.001),
      smallImageY: q(smallImageY, 0.1)
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

    if (leftTitleEl && f.leftX !== applied.leftX) {
      leftTitleEl.style.setProperty("--title-x", `${f.leftX}px`);
      leftTitleEl.style.transform = `translate3d(${f.leftX}px,-50%,0)`;
      applied.leftX = f.leftX;
    }

    if (rightTitleEl && f.rightX !== applied.rightX) {
      rightTitleEl.style.setProperty("--title-x", `${f.rightX}px`);
      rightTitleEl.style.transform = `translate3d(${f.rightX}px,-50%,0)`;
      applied.rightX = f.rightX;
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

    if (afterTextEl) {
      if (
        f.textOpacity !== applied.textOpacity ||
        f.textX !== applied.textX ||
        f.textY !== applied.textY ||
        f.textEdge !== applied.textEdge
      ) {
        afterTextEl.style.opacity = `${f.textOpacity}`;
        afterTextEl.style.transform = `translate3d(${f.textX}px, ${f.textY}px, 0)`;
        afterTextEl.style.setProperty("--text-reveal-edge", `${f.textEdge}%`);
        applied.textOpacity = f.textOpacity;
        applied.textX = f.textX;
        applied.textY = f.textY;
        applied.textEdge = f.textEdge;
      }
    }

    if (afterImageEl) {
      if (
        f.smallImageScale !== applied.smallImageScale ||
        f.smallImageY !== applied.smallImageY
      ) {
        afterImageEl.style.transform = `translate3d(0,${f.smallImageY}px,0) scale(${f.smallImageScale})`;
        applied.smallImageScale = f.smallImageScale;
        applied.smallImageY = f.smallImageY;
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
        }, withDelay ? 180 : 0);

        hintTimeout = setTimeout(() => {
          hintVisible = true;
          forceScrollEngineUpdate();
        }, withDelay ? 420 : 0);
      });
    });
  }

  function shouldDelayIntroForSession() {
    if (typeof window === "undefined") return false;
    return !window.__homeHeroIntroPlayed;
  }

  function preloadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };

      img.onload = finish;
      img.onerror = finish;
      img.src = src;

      if (img.complete) {
        finish();
        return;
      }

      img.decode?.().then(finish).catch(() => {});
    });
  }

  async function ensureAfterImagesReady() {
    if (afterImagesReady || !browser) return;
    await Promise.allSettled(afterImages.map(preloadImage));
    afterImagesReady = true;
  }

  function resetAfterImageRotationState() {
    clearAfterImageRotationTimers();
    isAfterImageTransitioning = false;
    incomingAfterImage = "";
    incomingAfterImageVisible = false;
    afterImageIndex = 0;
    activeAfterImage = afterImages[0];
  }

  function clearAfterImageRotationTimers() {
    clearTimeout(afterImageRotationTimeout);
    clearTimeout(afterImageFadeTimeout);
  }

  function queueAfterImageRotation(delay = IMAGE_ROTATION_INTERVAL) {
    clearTimeout(afterImageRotationTimeout);
    afterImageRotationTimeout = setTimeout(runAfterImageRotation, delay);
  }

  function runAfterImageRotation() {
    if (
      !browser ||
      document.hidden ||
      isAfterImageTransitioning ||
      afterImages.length < 2 ||
      !afterImagesReady
    ) {
      queueAfterImageRotation(IMAGE_RETRY_DELAY);
      return;
    }

    isAfterImageTransitioning = true;

    const nextIndex = (afterImageIndex + 1) % afterImages.length;
    incomingAfterImage = afterImages[nextIndex];
    incomingAfterImageVisible = false;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        incomingAfterImageVisible = true;
      });
    });

    clearTimeout(afterImageFadeTimeout);
    afterImageFadeTimeout = setTimeout(() => {
      activeAfterImage = afterImages[nextIndex];
      afterImageIndex = nextIndex;
      incomingAfterImage = "";
      incomingAfterImageVisible = false;
      isAfterImageTransitioning = false;
      queueAfterImageRotation();
    }, IMAGE_FADE_DURATION);
  }

  async function startAfterImageRotation() {
    resetAfterImageRotationState();
    await ensureAfterImagesReady();
    if (!browser || isMobile || afterImages.length < 2) return;
    queueAfterImageRotation();
  }

  function handleDocumentVisibilityChange() {
    if (!browser) return;
    if (document.hidden) {
      clearAfterImageRotationTimers();
      return;
    }
    if (!isAfterImageTransitioning) {
      queueAfterImageRotation(900);
    }
  }

  function scheduleResizeUpdate() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const wasMobile = isMobile;
      updateAllMeasures();
      if (wasMobile !== isMobile) {
        startAfterImageRotation();
      }
      forceScrollEngineUpdate();
    }, 70);
  }

  onMount(() => {
    if (!browser) return;

    let destroyed = false;
    const shouldDelayIntro = shouldDelayIntroForSession();

    const handlePreloaderDone = () => {
      clearTimeout(fallbackTimeout);
      fallbackTimeout = setTimeout(() => {
        startIntro(true);
      }, 140);
    };

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
    if (shouldDelayIntro) {
      window.addEventListener("preloader:done", handlePreloaderDone);
    }

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        scheduleResizeUpdate();
      });

      if (heroSection) resizeObserver.observe(heroSection);
      if (leftTitleEl) resizeObserver.observe(leftTitleEl);
      if (rightTitleEl) resizeObserver.observe(rightTitleEl);
      if (afterTextEl) resizeObserver.observe(afterTextEl);
      if (afterImageEl) resizeObserver.observe(afterImageEl);
    }

    if (shouldDelayIntro) {
      fallbackTimeout = setTimeout(() => {
        startIntro(true);
      }, 1800);
    } else {
      startIntro(false);
    }

    startAfterImageRotation();
    document.addEventListener("visibilitychange", handleDocumentVisibilityChange);

    return () => {
      destroyed = true;
      unregisterParallax(handleParallax);
      unregisterWrite(handleWrite);
      window.removeEventListener("resize", scheduleResizeUpdate);
      window.removeEventListener("orientationchange", scheduleResizeUpdate);
      window.removeEventListener("load", handleWindowLoad);
      window.removeEventListener("pageshow", handlePageShow);
      if (shouldDelayIntro) {
        window.removeEventListener("preloader:done", handlePreloaderDone);
      }
      clearTimeout(fallbackTimeout);
      clearTimeout(mediaIntroTimeout);
      clearTimeout(hintTimeout);
      clearAfterImageRotationTimers();
      clearTimeout(resizeTimer);
      document.removeEventListener("visibilitychange", handleDocumentVisibilityChange);
      resizeObserver?.disconnect();
    };
  });
</script>

<section class="hero-join-clean" bind:this={heroSection}>
  <div class="hero-media-sticky" aria-hidden="true">
    <div class="hero-media">
      <img
        class:media-visible={heroMediaVisible}
        bind:this={heroMediaImgEl}
        src="images/telephone3.webp"
        alt=""
      />
      <div class="hero-dark-layer" bind:this={heroDarkLayerEl}></div>
    </div>
  </div>

  <section class="pin-section" bind:this={pinSection}>
    <div class="sticky-stage">
      <div class="titles-layer">
        <span
          class="title-left"
          class:intro-visible={introVisible}
          bind:this={leftTitleEl}
        >
          Agence
        </span>

        <span
          class="title-right"
          class:intro-visible={introVisible}
          bind:this={rightTitleEl}
        >
          3 Terres
        </span>

        <h1 class="title-mobile" class:intro-visible={introVisible} aria-label="Agence 3 Terres">
          <span class="title-mobile-top">Agence</span>
          <span class="title-mobile-bottom">3 Terres</span>
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
    </div>
  </section>

  <section class="after-section" bind:this={afterSection}>
    <div class="after-grid">
      <div
        class="after-text"
        bind:this={afterTextEl}
      >
        <h2 aria-label={finalText}>
          {#each words as word, w}
            <span class="word" class:muted-word={w >= grayStartsAtWord}>
              {word}
            </span>{#if w < words.length - 1}<span class="space">&nbsp;</span>{/if}
          {/each}
        </h2>
      </div>

      <div
        class="after-image"
        bind:this={afterImageEl}
      >
        <img class="after-image-asset" src={activeAfterImage} alt="Visuel 3 Terres" />
        {#if incomingAfterImage}
          <img
            class="after-image-asset after-image-incoming"
            class:is-visible={incomingAfterImageVisible}
            src={incomingAfterImage}
            alt="Visuel 3 Terres"
          />
        {/if}
      </div>
    </div>
  </section>
</section>

<style>
  .hero-join-clean {
    position: relative;
    width: 100%;
    background: #000;
    color: #f4efe6;
    overflow: clip;
  }

  .hero-join-clean::before {
    content: "";
    position: absolute;
    inset: 78svh 0 0;
    background: #000;
    opacity: 0;
    pointer-events: none;
    z-index: 1;
    transition: opacity 0.45s ease;
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
    opacity: 0;
    transition: opacity 1.25s cubic-bezier(0.22, 1, 0.36, 1);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .hero-media img.media-visible {
    opacity: 1;
  }

  .hero-dark-layer {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(
        to top,
        rgba(0, 0, 0, 0.94) 0%,
        rgba(0, 0, 0, 0.84) 20%,
        rgba(0, 0, 0, 0.56) 38%,
        rgba(0, 0, 0, 0.2) 54%,
        rgba(0, 0, 0, 0) 66%
      ),
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

  .pin-section {
    position: relative;
    height: 160vh;
    z-index: 2;
  }

  .sticky-stage {
    position: sticky;
    top: 0;
    height: var(--viewport-height);
    overflow: hidden;
  }

  .titles-layer {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
  }

  .title-left,
  .title-right {
    position: absolute;
    top: 50%;
    line-height: 0.94;
    letter-spacing: -0.05em;
    white-space: nowrap;
    will-change: transform, opacity, filter;
    font-size: clamp(2.9rem, 7.8vw, 8.8rem);
    opacity: 0;
    filter: blur(18px);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .title-left {
    font-family: "Clash Display", sans-serif;
    font-weight: 100;
  }

  .title-right {
    font-family: "Clash Display", sans-serif;
    font-style: normal;
    font-weight: 100;
  }

  .title-left.intro-visible {
    animation: titleEnterLeft 1.25s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .title-right.intro-visible {
    animation: titleEnterRight 1.25s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .scroll-hint {
    position: absolute;
    left: 50%;
    bottom: clamp(1.3rem, 3vw, 2.4rem);
    font-family: "Clash Display", sans-serif;
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
    transition: opacity 1.1s cubic-bezier(0.22, 1, 0.36, 1);
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
    grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.78fr);
    gap: clamp(1.4rem, 4vw, 4.5rem);
    align-items: start;
  }

  .after-text {
    will-change: transform, opacity;
    width: 100%;
    min-width: 0;
    opacity: 0.14;
    transform: translate3d(24px, 18px, 0);
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

  .after-text h2 {
    margin: 0;
    width: 100%;
    max-width: 30ch;
    font-family: "Clash Display", sans-serif;
    font-weight: 300;
    font-style: normal;
    font-size: clamp(1.3rem, 2.8vw, 2.8rem);
    line-height: 1;
   
    color: #fff;
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
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform: translate3d(0, 22px, 0) scale(0.885);
  }

  .after-image img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform: translateZ(0);
  }

  .after-image-asset {
    opacity: 1;
  }

  .after-image-incoming {
    opacity: 0;
    transition: opacity 1.35s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: opacity;
  }

  .after-image-incoming.is-visible {
    opacity: 1;
  }

  @keyframes titleEnterLeft {
    from {
      opacity: 0;
      filter: blur(18px);
      transform: translate3d(calc(var(--title-x, 0px) - 42px), -50%, 0);
    }
    to {
      opacity: 1;
      filter: blur(0);
      transform: translate3d(var(--title-x, 0px), -50%, 0);
    }
  }

  .title-mobile {
    display: none;
    position: absolute;
    left: 50%;
    top: 57%;
    transform: translate3d(-50%, -50%, 0);
    margin: 0;
    width: min(88vw, 420px);
    text-align: center;
    line-height: 0.9;
    letter-spacing: -0.05em;
    color: #f4efe6;
    z-index: 2;
    pointer-events: none;
    opacity: 0;
    filter: blur(18px);
    will-change: transform, opacity, filter;
  }

  .title-mobile span {
    display: block;
  }

  .title-mobile-top {
    font-family: "Clash Display", sans-serif;
    font-weight: 500;
  }

  .title-mobile-bottom {
    font-family: "Clash Display", sans-serif;
    font-style: normal;
    font-weight: 500;
  }

  @keyframes titleEnterRight {
    from {
      opacity: 0;
      filter: blur(18px);
      transform: translate3d(calc(var(--title-x, 0px) + 42px), -50%, 0);
    }
    to {
      opacity: 1;
      filter: blur(0);
      transform: translate3d(var(--title-x, 0px), -50%, 0);
    }
  }

  @keyframes titleEnterMobile {
    from {
      opacity: 0;
      filter: blur(18px);
      transform: translate3d(-50%, 26px, 0);
    }
    to {
      opacity: 1;
      filter: blur(0);
      transform: translate3d(-50%, 0, 0);
    }
  }

  @media (max-width: 900px) {
    .scroll-hint {
      display: none !important;
    }

    .pin-section {
      height: 235vh;
    }

    .title-left,
    .title-right {
      font-size: clamp(2.2rem, 9vw, 5rem);
    }

    .after-grid {
      width: min(94%, 760px);
      grid-template-columns: 1fr 0.82fr;
      gap: 0.8rem;
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
    .hero-join-clean::before {
      opacity: 1;
    }

    .hero-dark-layer {
      background:
        linear-gradient(
          to top,
          rgba(0, 0, 0, 0.98) 0%,
          rgba(0, 0, 0, 0.9) 24%,
          rgba(0, 0, 0, 0.66) 42%,
          rgba(0, 0, 0, 0.28) 58%,
          rgba(0, 0, 0, 0) 68%
        ),
        radial-gradient(
          circle at 50% 50%,
          rgba(0, 0, 0, 0) 0%,
          rgba(0, 0, 0, 0.03) 40%,
          rgba(0, 0, 0, 0.12) 68%,
          rgba(0, 0, 0, 0.42) 100%
        );
    }

    .pin-section {
      height: auto;
      min-height: 100svh;
    }

    .sticky-stage {
      position: relative;
      height: auto;
      min-height: 100svh;
    }

    .titles-layer {
      position: relative;
      min-height: 100svh;
    }

    .title-left,
    .title-right {
      display: none;
    }

    .title-mobile {
      display: block;
      top: auto;
      left: 50%;
      transform: translate3d(-50%, 0, 0);
      width: min(92vw, 500px);
      margin: 0;
      padding-top: 79vh;
     
    }

    .title-mobile.intro-visible {
      animation: titleEnterMobile 1.25s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }

    .title-mobile-top {
      font-size: clamp(2.6rem, 10.6vw, 3.95rem);
      line-height: 0.92;
       font-weight: 200;
    }

    .title-mobile-bottom {
      font-size: clamp(4rem, 17.2vw, 6.3rem);
      line-height: 0.86;
       font-weight: 200;
    }

    .after-section {
      padding: 11vh 0 12vh;
    }

    .after-grid {
      width: min(94%, 520px);
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .after-text {
      width: 78%;
      justify-self: start;
    }

    .after-text h2 {
      font-size: clamp(1.15rem, 6.4vw, 1.95rem);
      line-height: 1.04;
      max-width: none;
    }

    .after-image {
      width: min(78%, 340px);
      justify-self: end;
      aspect-ratio: 1.6 / 1;
      margin-top: 3.5rem;
    }

    .scroll-hint {
      bottom: 1.05rem;
      font-size: 0.78rem;
      letter-spacing: 0.03em;
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
    .hero-dark-layer,
    .title-left,
    .title-right,
    .scroll-hint,
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

    .after-image-incoming {
      transition: none !important;
    }
  }
</style>
