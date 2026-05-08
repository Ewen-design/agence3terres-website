<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import {
    registerParallax,
    unregisterParallax,
    forceScrollEngineUpdate
  } from "$lib/scrollEngine.js";

  const leftImages = [
    {
      src: "images/telephone3.webp",
      alt: "",
      ratio: "portrait",
      height: 38
    },
    {
      src: "images/parfum_ordinateur.webp",
      alt: "",
      ratio: "landscape",
      height: 23
    },
    {
      src: "images/telephone_parfum.webp",
      alt: "",
      ratio: "portrait",
      height: 34
    }
  ];

  const centerImages = [
    {
      src: "images/telephone_parfum.webp",
      alt: "",
      ratio: "landscape",
      height: 28
    },
    {
      src: "images/telephone2.webp",
      alt: "",
      ratio: "portrait",
      height: 42
    },
    {
      src: "images/appareil_photo.webp",
      alt: "",
      ratio: "portrait",
      height: 36
    }
  ];

  const rightImages = [
    {
      src: "images/telephone2.webp",
      alt: "",
      ratio: "portrait",
      height: 38
    },
    {
      src: "images/appareil_photo.webp",
      alt: "",
      ratio: "landscape",
      height: 23
    },
    {
      src: "images/telephone3.webp",
      alt: "",
      ratio: "portrait",
      height: 34
    }
  ];

  let sectionEl;
  let galleryShellEl;
  let galleryCueEl;

  let resizeObserver;
  let intersectionObserver;
  let resizeTimer = null;

  let isMobile = false;
  let isActive = false;

  let sectionTop = 0;
  let sectionHeight = 1;
  let mobileRevealVisible = false;

  let applied = {
    cueOpacity: -1,
    galleryOpacity: -1,
    galleryExitCut: -999,
    galleryExitFeather: -999
  };

  const DESKTOP_GALLERY_CENTER = 0.58;
  const DESKTOP_GALLERY_RANGE = 0.72;

  const MOBILE_REVEAL_ENTER_TOP = 0.62;
  const MOBILE_REVEAL_EXIT_BOTTOM = 0.74;
  const CUE_ENTER_START = 0.88;
  const CUE_ENTER_END = 0.62;

  const DESKTOP_EXIT_START = 1.12;
  const DESKTOP_EXIT_END = 0.08;
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function mix(a, b, t) {
    return a + (b - a) * t;
  }

  function q(value, step) {
    return Math.round(value / step) * step;
  }

  function smoother01(t) {
    const x = clamp(t, 0, 1);
    return x * x * x * (x * (x * 6 - 15) + 10);
  }

  function getScrollY() {
    return window.scrollY || window.pageYOffset || 0;
  }

  function updateDeviceState(vw = window.innerWidth || 0) {
    isMobile = vw <= 640;
  }

  function measure() {
    if (!sectionEl) return;

    const scrollY = getScrollY();
    const rect = sectionEl.getBoundingClientRect();

    sectionTop = rect.top + scrollY;
    sectionHeight = Math.max(rect.height, 1);
  }

  function computeFromScroll(y, ctx) {
    if (!sectionEl || !isActive || !sectionHeight) return;

    const vh = ctx?.vh || window.innerHeight || 1;

    const topInViewport = sectionTop - y;
    const bottomInViewport = topInViewport + sectionHeight;

    let galleryOpacity = 1;
    let galleryExitCut = 0;
    let galleryExitFeather = isMobile ? 21 : 20;
    let cueOpacity = 1;
    if (isMobile) {
      const cueStartY = vh * CUE_ENTER_START;
      const cueEndY = vh * CUE_ENTER_END;
      const cueRaw = clamp((cueStartY - topInViewport) / Math.max(cueStartY - cueEndY, 1), 0, 1);
      cueOpacity = smoother01(cueRaw);

      const revealEnterY = vh * MOBILE_REVEAL_ENTER_TOP;
      const revealExitY = vh * MOBILE_REVEAL_EXIT_BOTTOM;
      const shouldReveal = topInViewport <= revealEnterY && bottomInViewport >= revealExitY;

      mobileRevealVisible = shouldReveal;
      galleryOpacity = shouldReveal ? 1 : 0;
    } else {
      const cueStartY = vh * 1.02;
      const cueEndY = vh * 0.72;
      const cueRaw = clamp((cueStartY - topInViewport) / Math.max(cueStartY - cueEndY, 1), 0, 1);
      cueOpacity = smoother01(cueRaw);

      const galleryCenterY = vh * DESKTOP_GALLERY_CENTER;
      const galleryRange = vh * DESKTOP_GALLERY_RANGE;

      const gEnterRaw = (galleryCenterY - topInViewport) / Math.max(galleryRange, 1);
      const gLeaveRaw = (bottomInViewport - galleryCenterY) / Math.max(galleryRange, 1);

      const galleryEnter = smoother01(gEnterRaw);
      const galleryLeave = smoother01(gLeaveRaw);
      const galleryProgress = galleryEnter * galleryLeave;

      const exitStart = vh * DESKTOP_EXIT_START;
      const exitEnd = vh * DESKTOP_EXIT_END;

      const rawExit = clamp(
        (exitStart - bottomInViewport) / Math.max(exitStart - exitEnd, 1),
        0,
        1
      );

      const exitEaseA = Math.pow(rawExit, 1.85);
      const exitEaseB = 1 - Math.pow(1 - rawExit, 2.8);
      const blendedExit = mix(exitEaseA, exitEaseB, 0.34);

      galleryOpacity = galleryProgress;
      galleryExitCut = q(blendedExit * 74, 0.1);
      galleryExitFeather = q(20 + blendedExit * 20, 0.1);
    }

    const pending = {
      cueOpacity: q(cueOpacity, 0.001),
      galleryOpacity: q(galleryOpacity, 0.001),
      galleryExitCut,
      galleryExitFeather
    };

    if (galleryCueEl && pending.cueOpacity !== applied.cueOpacity) {
      galleryCueEl.style.opacity = `${pending.cueOpacity}`;
      applied.cueOpacity = pending.cueOpacity;
    }

    if (galleryShellEl) {
      if (pending.galleryOpacity !== applied.galleryOpacity) {
        galleryShellEl.style.opacity = `${pending.galleryOpacity}`;
        applied.galleryOpacity = pending.galleryOpacity;
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

      if (galleryShellEl) {
        galleryShellEl.style.opacity = "0";
        galleryShellEl.style.setProperty("--exit-cut", "0%");
        galleryShellEl.style.setProperty("--exit-feather", isMobile ? "21%" : "20%");
      }

      if (galleryCueEl) {
        galleryCueEl.style.opacity = "0";
      }

      forceScrollEngineUpdate();
    });

    registerParallax(computeFromScroll, { priority: 2 });

    resizeObserver = new ResizeObserver(handleResize);
    if (sectionEl) resizeObserver.observe(sectionEl);

    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isActive =
          entry.isIntersecting ||
          entry.boundingClientRect.top < window.innerHeight + 260;

        if (isActive) {
          measure();
          forceScrollEngineUpdate();
        }
      },
      {
        rootMargin: "260px 0px 260px 0px",
        threshold: 0
      }
    );

    if (sectionEl) intersectionObserver.observe(sectionEl);

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });
  });

  onDestroy(() => {
    if (!browser) return;

    unregisterParallax(computeFromScroll);

    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();

    if (resizeTimer) clearTimeout(resizeTimer);

    window.removeEventListener("resize", handleResize);
    window.removeEventListener("orientationchange", handleResize);
  });
</script>

<section class="gallery-section" bind:this={sectionEl}>
  <div class="gallery-track">
    <div class="gallery-overlay-wrap" aria-hidden="true">
      <div class="gallery-sticky-overlay">
        <div class="gallery-sticky-cue" bind:this={galleryCueEl}>
          <span class="gallery-scroll-label">Scroll pour découvrir</span>
          <span class="gallery-scroll-arrow">↓</span>
        </div>

        <div class="gallery-bottom-shade"></div>
      </div>
    </div>

    <div class="gallery-shell" class:mobile-reveal-visible={mobileRevealVisible} bind:this={galleryShellEl}>
      <div class="gallery-grid">
        <div class="col col-left">
          {#each leftImages as image}
            <figure
              class={`card ${image.ratio}`}
              style={`--h:${image.height}vw`}
            >
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                decoding="async"
                draggable="false"
              />
            </figure>
          {/each}
        </div>

        <div class="col col-center">
          {#each centerImages as image}
            <figure
              class={`card ${image.ratio}`}
              style={`--h:${image.height}vw`}
            >
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                decoding="async"
                draggable="false"
              />
            </figure>
          {/each}
        </div>

        <div class="col col-right">
          {#each rightImages as image}
            <figure
              class={`card ${image.ratio}`}
              style={`--h:${image.height}vw`}
            >
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                decoding="async"
                draggable="false"
              />
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
    --card-bg: #000;
    --mobile-card-scale: 2.05;
    --sticky-lead: 100vh;
    position: relative;
    z-index: 0;
    isolation: isolate;
    width: 100%;
    background: var(--section-bg);
    overflow-x: clip;
    overflow-y: visible;
    color: var(--section-text);
  }

  .gallery-track {
    min-height: 182vh;
    position: relative;
    z-index: 0;
  }

  .gallery-overlay-wrap {
    position: absolute;
    top: calc(-1 * var(--sticky-lead));
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    pointer-events: none;
  }

  .gallery-sticky-overlay {
    position: sticky;
    top: 0;
    height: var(--viewport-height);
    pointer-events: none;
  }

  .gallery-sticky-cue {
    position: absolute;
    left: clamp(1rem, 2vw, 1.8rem);
    bottom: max(clamp(1rem, 2.2vw, 1.6rem), var(--safe-bottom-offset));
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    gap: 0.45rem;
    color: #fff;
  }

  .gallery-scroll-label {
    font-family: "Clash Display", sans-serif;
    font-size: clamp(0.82rem, 0.95vw, 0.98rem);
    font-weight: 300;
    line-height: 1;
    letter-spacing: 0.02em;
    text-align: left;
  }

  .gallery-scroll-arrow {
    display: block;
    font-family: "Clash Display", sans-serif;
    font-size: clamp(1.1rem, 1.1vw, 1.2rem);
    line-height: 1;
    font-weight: 300;
    color: #fff;
  }

  .gallery-bottom-shade {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    height: 38svh;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.1) 18%,
      rgba(0, 0, 0, 0.28) 34%,
      rgba(0, 0, 0, 0.6) 54%,
      rgba(0, 0, 0, 0.84) 72%,
      rgba(0, 0, 0, 0.96) 88%,
      rgba(0, 0, 0, 1) 100%
    );
  }

  .gallery-shell {
    position: relative;
    z-index: 0;
    width: 120vw;
    margin-left: 50%;
    transform: translate3d(-50%, 0, 0);
    padding: 10vh 0;
    opacity: 0;
    will-change: opacity, transform;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    contain: layout paint;
    -webkit-mask-image: linear-gradient(
      to top,
      transparent 0%,
      transparent var(--exit-cut, 0%),
      rgba(0, 0, 0, 0.1) calc(var(--exit-cut, 0%) + calc(var(--exit-feather, 20%) * 0.14)),
      rgba(0, 0, 0, 0.28) calc(var(--exit-cut, 0%) + calc(var(--exit-feather, 20%) * 0.34)),
      rgba(0, 0, 0, 0.56) calc(var(--exit-cut, 0%) + calc(var(--exit-feather, 20%) * 0.58)),
      rgba(0, 0, 0, 0.82) calc(var(--exit-cut, 0%) + calc(var(--exit-feather, 20%) * 0.82)),
      #000 calc(var(--exit-cut, 0%) + var(--exit-feather, 20%)),
      #000 100%
    );
    mask-image: linear-gradient(
      to top,
      transparent 0%,
      transparent var(--exit-cut, 0%),
      rgba(0, 0, 0, 0.1) calc(var(--exit-cut, 0%) + calc(var(--exit-feather, 20%) * 0.14)),
      rgba(0, 0, 0, 0.28) calc(var(--exit-cut, 0%) + calc(var(--exit-feather, 20%) * 0.34)),
      rgba(0, 0, 0, 0.56) calc(var(--exit-cut, 0%) + calc(var(--exit-feather, 20%) * 0.58)),
      rgba(0, 0, 0, 0.82) calc(var(--exit-cut, 0%) + calc(var(--exit-feather, 20%) * 0.82)),
      #000 calc(var(--exit-cut, 0%) + var(--exit-feather, 20%)),
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
    opacity: 1;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    contain: paint;
  }

  .card img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    transform: translateZ(0) scale(1);
    transform-origin: center center;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    user-select: none;
    -webkit-user-drag: none;
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

  @media (prefers-reduced-motion: reduce) {
    .card,
    .card img {
      transition: none;
    }

    .card {
      opacity: 1;
    }

    .card img {
      transform: translateZ(0) scale(1);
    }
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
  }

  @media (max-width: 640px) {
    .gallery-track {
      min-height: 120vh;
    }

    .gallery-shell {
      width: 154vw;
      margin-left: 50%;
      transform: translate3d(-50%, 0, 0);
      padding: 6vh 0 1vh;
      transition: opacity 1800ms cubic-bezier(0.19, 1, 0.22, 1);
      -webkit-mask-image: none;
      mask-image: none;
    }

    .gallery-shell:not(.mobile-reveal-visible) {
      transition: opacity 480ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .gallery-grid {
      grid-template-columns: 0.9fr 1.14fr 0.9fr;
      column-gap: 0.12rem;
      align-items: center;
    }

    .col {
      gap: 0.5rem;
      justify-content: center;
      align-self: center;
    }

    .col-left,
    .col-right,
    .col-center {
      transform: none;
    }

    .gallery-sticky-cue {
      left: 1rem;
      bottom: max(0.95rem, var(--safe-bottom-offset));
      gap: 0.42rem;
    }

    .gallery-scroll-label {
      font-size: 0.78rem;
      letter-spacing: 0.03em;
    }

    .gallery-scroll-arrow {
      font-size: 1.05rem;
    }

    .gallery-bottom-shade {
      bottom: -12svh;
      height: 58svh;
    }

    .card.portrait {
      height: calc(var(--h) * var(--mobile-card-scale));
    }

    .card.landscape {
      height: calc(var(--h) * 0.8 * var(--mobile-card-scale));
    }

    .card.square {
      height: calc(var(--h) * 0.95 * var(--mobile-card-scale));
    }

    .col-center .card.portrait {
      height: calc(var(--h) * 1.08 * var(--mobile-card-scale));
    }

    .col-center .card.landscape {
      height: calc(var(--h) * 0.86 * var(--mobile-card-scale));
    }

    .col-center .card.square {
      height: calc(var(--h) * 1.02 * var(--mobile-card-scale));
    }
  }

  @media (max-width: 420px) {
    .gallery-track {
      min-height: 124vh;
    }

    .gallery-shell {
      width: 160vw;
    }
  }
</style>
