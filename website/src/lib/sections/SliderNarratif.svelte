<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";

  const slides = [
    {
      title: "Serein Design",
      lead: "Un univers objet premium, calme et fonctionnel.",
      rest: "Une direction pensée pour traduire une élégance sobre, technologique et durable à travers une identité visuelle claire et sensible.",
      image: "/images/photo.webp"
    },
    {
      title: "Hansatsu",
      lead: "Une présence plus sensorielle, plus singulière.",
      rest: "Un travail d’image et de narration conçu pour installer une esthétique précise, immersive et raffinée autour du produit.",
      image: "/images/parfum2.webp"
    },
    {
      title: "Votre projet ?",
      lead: "Une approche sur mesure pour révéler votre singularité.",
      rest: "Identité, direction artistique, expérience visuelle ou territoire de marque : chaque projet est pensé avec exigence, cohérence et impact.",
      image: "/images/photo.webp"
    }
  ];

  const SLIDE_COUNT = slides.length;

  let sectionEl;
  let sectionVisible = false;

  let sectionTop = 0;
  let sectionHeight = 1;
  let viewportH = 1;

  let resizeObserver;
  let intersectionObserver;
  let resizeTimer = null;
  let preloadImages = [];

  let bgImgEls = [];
  let titleEl;
  let titleTextEl;
  let textEl;
  let leadEl;
  let restEl;
  let progressFillEl;
  let progressIndexEl;

  let currentIndex = -1;

  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

  function invLerp(a, b, v) {
    if (a === b) return 0;
    return clamp((v - a) / (b - a));
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function currentScrollY() {
    return window.lenis?.animatedScroll ?? window.scrollY ?? 0;
  }

  function warmImages() {
    if (!browser) return;

    preloadImages = slides.map((slide, i) => {
      const img = new Image();
      img.decoding = "async";
      img.loading = i < 2 ? "eager" : "lazy";
      if (i < 2) img.fetchPriority = "high";
      img.src = slide.image;
      if (img.decode) img.decode().catch(() => {});
      return img;
    });
  }

  function setSlideContent(index) {
    if (!titleTextEl || !leadEl || !restEl || !progressIndexEl) return;
    if (index === currentIndex) return;

    currentIndex = index;
    titleTextEl.textContent = slides[index].title;
    leadEl.textContent = slides[index].lead;
    restEl.textContent = ` ${slides[index].rest}`;
    progressIndexEl.textContent = String(index + 1).padStart(2, "0");
  }

  function setImagePair(index, fade) {
    if (!bgImgEls.length) return;

    for (let i = 0; i < bgImgEls.length; i++) {
      const el = bgImgEls[i];
      if (!el) continue;
      el.style.opacity = "0";
    }

    const currentEl = bgImgEls[index];
    if (currentEl) currentEl.style.opacity = `${1 - fade}`;

    const hasNext = index < SLIDE_COUNT - 1;
    if (hasNext) {
      const nextEl = bgImgEls[index + 1];
      if (nextEl) nextEl.style.opacity = `${fade}`;
    } else if (currentEl) {
      currentEl.style.opacity = "1";
    }
  }

  function applyFrame(frame) {
    if (!titleEl || !textEl || !progressFillEl) return;

    titleEl.style.opacity = `${frame.titleOpacity}`;
    titleEl.style.transform = `translate3d(0, ${frame.titleY}px, 0)`;

    textEl.style.opacity = `${frame.textOpacity}`;
    textEl.style.transform = `translate3d(0, ${frame.textY}px, 0)`;

    progressFillEl.style.transform = `scaleX(${frame.progress})`;
  }

  function compute(scrollY, vh = viewportH) {
    if (!sectionEl || !sectionVisible) return;

    const maxScroll = Math.max(sectionHeight - vh, 1);
    const overallProgress = clamp((scrollY - sectionTop) / maxScroll);

    const segment = 1 / SLIDE_COUNT;
    const raw = overallProgress / segment;
    const index = Math.min(SLIDE_COUNT - 1, Math.floor(raw));
    const local = clamp(raw - index, 0, 1);
    const hasNext = index < SLIDE_COUNT - 1;

    setSlideContent(index);

    const titleStart = 0.18;
    const titleEnd = 0.46;
    const textStart = 0.42;
    const textEnd = 0.74;
    const contentOutStart = 0.8;
    const contentOutEnd = 0.9;
    const imageFadeStart = 0.72;
    const imageFadeEnd = 0.98;

    const titleIn = easeOutQuart(invLerp(titleStart, titleEnd, local));
    const textIn = easeOutCubic(invLerp(textStart, textEnd, local));
    const contentOut = easeInOutCubic(invLerp(contentOutStart, contentOutEnd, local));

    const titleOpacity = titleIn * (1 - contentOut);
    const textOpacity = textIn * (1 - contentOut);

    const fade = hasNext
      ? easeInOutCubic(invLerp(imageFadeStart, imageFadeEnd, local))
      : 0;

    setImagePair(index, fade);

    applyFrame({
      titleOpacity,
      textOpacity,
      titleY: lerp(26, 0, titleOpacity),
      textY: lerp(20, 0, textOpacity),
      progress: hasNext
        ? clamp(invLerp(0, imageFadeStart, local))
        : clamp(invLerp(0, 0.985, local))
    });
  }

  function measure() {
    if (!browser || !sectionEl) return;

    const scrollY = currentScrollY();
    const rect = sectionEl.getBoundingClientRect();

    sectionTop = rect.top + scrollY;
    sectionHeight = Math.max(rect.height, 1);
    viewportH = Math.max(window.innerHeight, 1);

    compute(scrollY, viewportH);
  }

  function onScroll(scrollY, { vh }) {
    if (!sectionVisible) return;
    viewportH = Math.max(vh || window.innerHeight, 1);
    compute(scrollY, viewportH);
  }

  function handleResize() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      measure();
    }, 80);
  }

  onMount(() => {
    if (!browser) return;

    warmImages();

    requestAnimationFrame(() => {
      setSlideContent(0);
      setImagePair(0, 0);

      applyFrame({
        titleOpacity: 0,
        textOpacity: 0,
        titleY: 26,
        textY: 20,
        progress: 0
      });

      measure();
      registerParallax(onScroll, { priority: 2 });
    });

    resizeObserver = new ResizeObserver(handleResize);
    if (sectionEl) resizeObserver.observe(sectionEl);

    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = sectionVisible;
        sectionVisible = entry.isIntersecting;
        if (sectionVisible && !wasVisible) {
          measure();
        }
      },
      { rootMargin: "500px 0px 500px 0px", threshold: 0 }
    );

    if (sectionEl) intersectionObserver.observe(sectionEl);

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });
  });

  onDestroy(() => {
    if (!browser) return;

    unregisterParallax(onScroll);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();

    if (resizeTimer) clearTimeout(resizeTimer);

    window.removeEventListener("resize", handleResize);
    window.removeEventListener("orientationchange", handleResize);

    preloadImages = [];
  });
</script>

<section class="story-slider" bind:this={sectionEl}>
  <div class="story-slider__intro">
    <div class="story-slider__intro-title-wrap">
      <h2 class="story-slider__intro-title">Nos services</h2>
    </div>

    <div class="story-slider__intro-text-wrap">
      <div class="story-slider__intro-card">
        <p class="story-slider__intro-text">
          <span class="story-slider__intro-main">
            Nous imaginons des identités fortes, des expériences digitales immersives
          </span>
          <span class="story-slider__intro-muted">
            {" "}et des directions artistiques pensées pour laisser une empreinte durable.
          </span>
        </p>
      </div>
    </div>
  </div>

  <div class="story-slider__sticky">
    <div class="story-slider__bg">
      {#each slides as slide, i}
        <img
          class="story-slider__bg-layer"
          bind:this={bgImgEls[i]}
          src={slide.image}
          alt=""
          aria-hidden="true"
          decoding="async"
          fetchpriority={i < 2 ? "high" : "auto"}
          loading={i < 2 ? "eager" : "lazy"}
          draggable="false"
        />
      {/each}

      <div class="story-slider__bg-overlay"></div>
      <div class="story-slider__bottom-gradient"></div>
    </div>

    <div class="story-slider__content">
      <div class="story-slider__slide-title-wrap">
        <h3 class="story-slider__slide-title" bind:this={titleEl}>
          <span bind:this={titleTextEl}>{slides[0].title}</span>
        </h3>
      </div>

      <div class="story-slider__slide-text-wrap">
        <p class="story-slider__slide-text" bind:this={textEl}>
          <span class="story-slider__slide-text-lead" bind:this={leadEl}>{slides[0].lead}</span>
          <span class="story-slider__slide-text-rest" bind:this={restEl}> {slides[0].rest}</span>
        </p>
      </div>

      <div class="story-slider__progress">
        <div class="story-slider__progress-index" bind:this={progressIndexEl}>01</div>
        <div class="story-slider__progress-track">
          <div class="story-slider__progress-fill" bind:this={progressFillEl}></div>
        </div>
      </div>

      <div class="story-slider__arrow" aria-hidden="true">
        <span class="arrow-flip">
          <span class="arrow-face arrow-current">
            <svg viewBox="0 0 24 24" class="arrow">
              <path d="M12 19V5M12 19l-6-6M12 19l6-6" />
            </svg>
          </span>

          <span class="arrow-face arrow-next">
            <svg viewBox="0 0 24 24" class="arrow">
              <path d="M12 19V5M12 19l-6-6M12 19l6-6" />
            </svg>
          </span>
        </span>
      </div>
    </div>
  </div>
</section>

<style>
  .story-slider {
    --section-bg: #000;
    --intro-title: #111;
    --intro-text: rgba(17, 17, 17, 0.66);
    --intro-main: #111;
    --intro-muted: rgba(17, 17, 17, 0.56);

    position: relative;
    height: 900vh;
    background: var(--section-bg);
    overflow: clip;
    isolation: isolate;
  }

  .story-slider__intro {
    position: relative;
    z-index: 3;
    min-height: clamp(120px, 16vw, 210px);
    display: grid;
    grid-template-columns: 52% 48%;
    align-items: start;
    background: var(--section-bg);
    padding: 0;
  }

  .story-slider__intro-title-wrap {
    padding:
      clamp(2rem, 4vw, 4rem)
      clamp(1.5rem, 3vw, 3rem)
      clamp(1.2rem, 2vw, 1.8rem);
    display: flex;
    justify-content: flex-start;
  }

  .story-slider__intro-title {
    margin: 0;
    font-family: "Titre italic", serif;
    font-style: italic;
    font-weight: 100;
    font-size: clamp(2.5rem, 5vw, 5.5rem);
    line-height: 0.95;
    letter-spacing: -0.045em;
    color: #f5f1e8;
    text-align: left;
  }

  .story-slider__intro-text-wrap {
    width: min(1500px, 92%);
    margin: 0 auto;
    display: flex;
    justify-content: flex-end;
    padding-top: clamp(5rem, 10vw, 9rem);
    padding-bottom: clamp(1.5rem, 2.8vw, 2.4rem);
    align-self: start;
  }

  .story-slider__intro-card {
    width: min(560px, 100%);
    padding: 0;
  }

  .story-slider__intro-text {
    margin: 0;
    max-width: 30ch;
    font-family: "General Sans", sans-serif;
    font-weight: 300;
    font-size: clamp(1.2rem, 2.25vw, 2.3rem);
    line-height: 1.08;
    letter-spacing: -0.02em;
    color: var(--intro-text);
  }

  .story-slider__intro-main {
    color: #f5f1e8;
  }

  .story-slider__intro-muted {
    color: rgb(157, 156, 156);
  }

  .story-slider__sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .story-slider__bg {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: var(--section-bg);
    transform: translateZ(0);
  }

  .story-slider__bg-layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    transform: translate3d(0, 0, 0) scale(1.01);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    opacity: 0;
    pointer-events: none;
    user-select: none;
    will-change: opacity;
  }

  .story-slider__bg-overlay {
    position: absolute;
    inset: 0;
    z-index: 5;
    background:
      linear-gradient(to bottom, rgba(5, 7, 10, 0.04), rgba(5, 7, 10, 0.12)),
      rgba(5, 7, 10, 0.14);
    pointer-events: none;
  }

  .story-slider__bottom-gradient {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 6;
    height: 42vh;
    background:
      linear-gradient(
        to top,
        rgba(5, 7, 10, 0.99) 0%,
        rgba(5, 7, 10, 0.95) 10%,
        rgba(5, 7, 10, 0.84) 24%,
        rgba(5, 7, 10, 0.58) 42%,
        rgba(5, 7, 10, 0.22) 68%,
        rgba(5, 7, 10, 0) 100%
      );
    pointer-events: none;
  }

  .story-slider__content {
    position: relative;
    z-index: 7;
    width: 100%;
    height: 100%;
    padding: clamp(1rem, 2.4vw, 2rem);
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
    transform: translateZ(0);
  }

  .story-slider__slide-title-wrap {
    align-self: center;
    width: min(92vw, 1400px);
    padding-left: clamp(0rem, 1vw, 1rem);
  }

  .story-slider__slide-title {
    margin: 0;
    color: #f5f1e8;
    font-family: "Titre italic", serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(3.5rem, 8vw, 8.4rem);
    line-height: 0.94;
    letter-spacing: -0.045em;
    opacity: 0;
    transform: translate3d(0, 26px, 0);
    transition:
      opacity 140ms linear,
      transform 140ms linear;
    will-change: opacity, transform;
  }

  .story-slider__slide-title span {
    display: inline-block;
    white-space: nowrap;
  }

  .story-slider__slide-text-wrap {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    padding-right: clamp(0rem, 1vw, 1rem);
    padding-bottom: clamp(3.1rem, 4.8vw, 4.7rem);
  }

  .story-slider__slide-text {
    width: min(34rem, 42vw);
    max-width: 30ch;
    margin: 0;
    color: rgba(255, 255, 255, 0.72);
    font-family: "General Sans", sans-serif;
    font-size: clamp(1.15rem, 2.12vw, 2.15rem);
    font-weight: 300;
    line-height: 1.08;
    letter-spacing: -0.022em;
    opacity: 0;
    transform: translate3d(0, 20px, 0);
    transition:
      opacity 140ms linear,
      transform 140ms linear;
    will-change: opacity, transform;
  }

  .story-slider__slide-text-lead {
    color: #f5f1e8;
  }

  .story-slider__slide-text-rest {
    color: rgba(255, 255, 255, 0.72);
  }

  .story-slider__progress {
    position: absolute;
    left: clamp(1rem, 2vw, 2rem);
    bottom: clamp(3rem, 4.6vw, 4rem);
    z-index: 8;
    display: flex;
    align-items: center;
    gap: 0.9rem;
    width: min(240px, 34vw);
    pointer-events: none;
  }

  .story-slider__progress-index {
    flex: 0 0 auto;
    color: #f5f1e8;
    font-family: "Titre italic", serif;
    font-style: italic;
    font-size: 0.95rem;
    line-height: 1;
    letter-spacing: 0.02em;
  }

  .story-slider__progress-track {
    position: relative;
    flex: 1 1 auto;
    height: 1px;
    background: rgba(255, 255, 255, 0.22);
    overflow: hidden;
    transform: translateY(1px);
  }

  .story-slider__progress-fill {
    position: absolute;
    inset: 0;
    background: rgba(245, 241, 232, 0.95);
    transform-origin: left center;
    transform: scaleX(0);
  }

  .story-slider__arrow {
    position: absolute;
    left: clamp(1rem, 2vw, 2rem);
    bottom: clamp(1.2rem, 2.2vw, 2rem);
    z-index: 8;
    opacity: 0.92;
    pointer-events: none;
  }

  .arrow-flip {
    position: relative;
    display: block;
    width: 20px;
    height: 20px;
    overflow: hidden;
  }

  .arrow-face {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    transition:
      transform 0.45s cubic-bezier(.22, .61, .36, 1),
      opacity 0.28s ease;
  }

  .arrow-current {
    transform: translateY(0%);
    opacity: 1;
  }

  .arrow-next {
    transform: translateY(-100%);
    opacity: 1;
  }

  .arrow {
    width: 20px;
    height: 20px;
    stroke-width: 1.5;
    fill: none;
    stroke: rgba(255, 255, 255, 0.9);
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  @media (max-width: 1100px) {
    .story-slider {
      height: 980vh;
    }

    .story-slider__intro {
      min-height: clamp(110px, 14vw, 170px);
    }

    .story-slider__intro-title {
      font-size: clamp(4rem, 12vw, 8rem);
    }

    .story-slider__intro-card {
      width: min(520px, 100%);
    }

    .story-slider__slide-title {
      font-size: clamp(3.1rem, 10vw, 6.2rem);
    }

    .story-slider__slide-text {
      width: min(32rem, 64vw);
    }
  }

  @media (max-width: 900px) {
    .story-slider__intro {
      grid-template-columns: 1fr;
      min-height: auto;
    }

    .story-slider__intro-title-wrap {
      padding: 1.5rem 1rem 1rem;
    }

    .story-slider__intro-title {
      font-size: clamp(2.4rem, 11vw, 4rem);
    }

    .story-slider__intro-text-wrap {
      width: min(92%, 760px);
      margin: 0 auto;
      display: block;
      padding-top: 1.15rem;
      padding-bottom: 1.2rem;
    }

    .story-slider__intro-card {
      width: 100%;
      padding: 0;
    }

    .story-slider__intro-text {
      font-size: clamp(1.2rem, 5vw, 1.55rem);
      line-height: 1.08;
      max-width: 30ch;
    }
  }

  @media (max-width: 820px) {
    .story-slider {
      height: 1040vh;
    }

    .story-slider__content {
      padding: 1.1rem 1rem 1.1rem;
    }

    .story-slider__slide-title-wrap {
      width: 100%;
      padding-left: 0;
    }

    .story-slider__slide-title {
      font-size: clamp(2.5rem, 12vw, 4.7rem);
      line-height: 0.98;
      max-width: 95%;
    }

    .story-slider__slide-title span {
      white-space: normal;
    }

    .story-slider__slide-text-wrap {
      justify-content: flex-start;
      padding-right: 0;
      padding-bottom: 4.2rem;
    }

    .story-slider__slide-text {
      width: min(28rem, 92vw);
      max-width: 24ch;
      font-size: clamp(1rem, 4.3vw, 1.28rem);
      line-height: 1.15;
    }

    .story-slider__progress {
      left: 1rem;
      bottom: 2.9rem;
      width: min(200px, 58vw);
      gap: 0.7rem;
    }

    .story-slider__arrow {
      left: 1rem;
      bottom: 1rem;
    }

    .story-slider__bottom-gradient {
      height: 48vh;
    }
  }

  @media (max-width: 640px) {
    .story-slider__intro-title-wrap {
      padding: 1.3rem 1rem 0.9rem;
    }
  }

  @media (max-width: 420px) {
    .story-slider__intro-title-wrap {
      padding: 1.1rem 1rem 0.85rem;
    }

    .story-slider__intro-card {
      padding: 0;
    }

    .story-slider__intro-text {
      font-size: clamp(1.15rem, 5vw, 1.35rem);
      line-height: 1.08;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .story-slider__slide-title,
    .story-slider__slide-text,
    .arrow-face {
      transition: none !important;
      animation: none !important;
    }
  }
</style>