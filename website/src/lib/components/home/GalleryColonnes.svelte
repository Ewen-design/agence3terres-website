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

  const leftImages = [
    {
      src: "images/appareil_photo.webp",
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
      src: "images/parfum_ordinateur.webp",
      alt: "",
      ratio: "portrait",
      height: 34
    }
  ];

  const text = "Les lumières de la création".split("");

  let sectionEl;
  let fixedTextEl;
  let galleryShellEl;

  let resizeObserver;
  let intersectionObserver;
  let revealObserver;
  let resizeTimer = null;

  let isMobile = false;
  let isActive = false;

  let sectionTop = 0;
  let sectionHeight = 1;

  let pending = null;
  let dirty = false;

  const revealNodes = new Set();

  let applied = {
    textOpacity: -1,
    galleryOpacity: -1,
    galleryExitCut: -999,
    galleryExitFeather: -999
  };

  const DESKTOP_TEXT_CENTER = 0.56;
  const DESKTOP_TEXT_ENTER_RANGE = 0.5;
  const DESKTOP_TEXT_LEAVE_RANGE = 1.18;
  const DESKTOP_GALLERY_CENTER = 0.58;
  const DESKTOP_GALLERY_RANGE = 0.72;

  const MOBILE_TEXT_CENTER = 0.57;
  const MOBILE_TEXT_ENTER_RANGE = 0.42;
  const MOBILE_TEXT_LEAVE_RANGE = 0.84;
  const MOBILE_GALLERY_CENTER = 0.82;
  const MOBILE_GALLERY_RANGE = 0.34;

  const DESKTOP_EXIT_START = 1.12;
  const DESKTOP_EXIT_END = 0.08;
  const MOBILE_EXIT_START = 0.92;
  const MOBILE_EXIT_END = 0.2;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function mix(a, b, t) {
    return a + (b - a) * t;
  }

  function q(value, step) {
    return Math.round(value / step) * step;
  }

  function smooth01(t) {
    const x = clamp(t, 0, 1);
    return x * x * (3 - 2 * x);
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

    const textCenterY = vh * (isMobile ? MOBILE_TEXT_CENTER : DESKTOP_TEXT_CENTER);
    const textEnterRange = vh * (isMobile ? MOBILE_TEXT_ENTER_RANGE : DESKTOP_TEXT_ENTER_RANGE);
    const textLeaveRange = vh * (isMobile ? MOBILE_TEXT_LEAVE_RANGE : DESKTOP_TEXT_LEAVE_RANGE);

    const enterRaw = (textCenterY - topInViewport) / Math.max(textEnterRange, 1);
    const leaveRaw = (bottomInViewport - textCenterY) / Math.max(textLeaveRange, 1);

    const textEnter = smoother01(enterRaw);
    const textLeave = smoother01(leaveRaw);
    const textVisibility = textEnter * textLeave;

    const galleryCenterY = vh * (isMobile ? MOBILE_GALLERY_CENTER : DESKTOP_GALLERY_CENTER);
    const galleryRange = vh * (isMobile ? MOBILE_GALLERY_RANGE : DESKTOP_GALLERY_RANGE);

    const gEnterRaw = (galleryCenterY - topInViewport) / Math.max(galleryRange, 1);
    const gLeaveRaw = (bottomInViewport - galleryCenterY) / Math.max(galleryRange, 1);

    const galleryEnter = smoother01(gEnterRaw);
    const galleryLeave = smoother01(gLeaveRaw);
    const galleryProgress = galleryEnter * galleryLeave;

    const exitStart = vh * (isMobile ? MOBILE_EXIT_START : DESKTOP_EXIT_START);
    const exitEnd = vh * (isMobile ? MOBILE_EXIT_END : DESKTOP_EXIT_END);

    const rawExit = clamp(
      (exitStart - bottomInViewport) / Math.max(exitStart - exitEnd, 1),
      0,
      1
    );

    const exitEaseA = Math.pow(rawExit, 1.85);
    const exitEaseB = 1 - Math.pow(1 - rawExit, 2.8);
    const blendedExit = mix(exitEaseA, exitEaseB, 0.34);

    pending = {
      textOpacity: q(textVisibility, 0.001),
      galleryOpacity: q(galleryProgress, 0.001),
      galleryExitCut: q(blendedExit * (isMobile ? 70 : 74), 0.1),
      galleryExitFeather: q((isMobile ? 21 : 20) + blendedExit * (isMobile ? 18 : 20), 0.1)
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

      fixedTextEl.style.visibility = pending.textOpacity > 0.008 ? "visible" : "hidden";
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

  function revealCard(node) {
    node.classList.add("is-reveal-init");
    revealNodes.add(node);

    if (revealObserver) {
      revealObserver.observe(node);
    }

    return {
      destroy() {
        revealObserver?.unobserve(node);
        revealNodes.delete(node);
      }
    };
  }

  onMount(() => {
    if (!browser) return;

    requestAnimationFrame(() => {
      updateDeviceState();
      measure();

      if (fixedTextEl) {
        fixedTextEl.style.opacity = "0";
        fixedTextEl.style.visibility = "hidden";
        fixedTextEl.style.transform = "translate3d(0, 0, 0)";
      }

      if (galleryShellEl) {
        galleryShellEl.style.opacity = "0";
        galleryShellEl.style.setProperty("--exit-cut", "0%");
        galleryShellEl.style.setProperty("--exit-feather", isMobile ? "21%" : "20%");
      }

      forceScrollEngineUpdate();
    });

    registerParallax(computeFromScroll, { priority: 2 });
    registerWrite(applyPending, { priority: 2 });

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

    revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        }
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.12
      }
    );

    revealNodes.forEach((node) => revealObserver.observe(node));

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });
  });

  onDestroy(() => {
    if (!browser) return;

    unregisterParallax(computeFromScroll);
    unregisterWrite(applyPending);

    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    revealObserver?.disconnect();

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
            <figure
              use:revealCard
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
              use:revealCard
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
              use:revealCard
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
    position: relative;
    width: 100%;
    background: var(--section-bg);
    overflow: hidden;
    color: var(--section-text);
  }

  .fixed-text {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: var(--viewport-height);
    display: grid;
    place-items: center;
    z-index: 999;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transform: translate3d(0, 34px, 0);
    will-change: opacity;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .title {
    margin: 0;
    font-family: "Clash Display", sans-serif;
    font-style: light;
    font-size: clamp(2.5rem, 6vw, 6rem);
    font-weight: 300;
    line-height: 0.95;
    text-align: center;
    color: var(--section-text);
    text-wrap: balance;
    text-shadow:
      0 26px 56px rgba(0, 0, 0, 0.72),
      0 12px 28px rgba(0, 0, 0, 0.6),
      0 4px 10px rgba(0, 0, 0, 0.5);
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
    will-change: opacity;
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
    opacity: 0.001;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    contain: paint;
    will-change: opacity;
    transition: opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .card img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    transform: translateZ(0) scale(1.045);
    transform-origin: center center;
    transition: transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    user-select: none;
    -webkit-user-drag: none;
    will-change: transform;
  }

  .card.is-visible {
    opacity: 1;
  }

  .card.is-visible img {
    transform: translateZ(0) scale(1);
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

    .title {
      font-size: clamp(1.6rem, 7vw, 2.6rem);
    }
  }

  @media (max-width: 640px) {
    .gallery-track {
      min-height: 138vh;
    }

    .gallery-shell {
      width: 154vw;
      margin-left: 50%;
      transform: translate3d(-50%, 0, 0);
      padding: 6vh 0 1vh;
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

    .title {
      font-size: clamp(2rem, 9vw, 3.1rem);
      line-height: 0.92;
    }

    .card.portrait {
      height: calc(var(--h) * 1.84);
    }

    .card.landscape {
      height: calc(var(--h) * 1.36);
    }

    .card.square {
      height: calc(var(--h) * 1.42);
    }

    .col-center .card.portrait {
      height: calc(var(--h) * 1.98);
    }

    .col-center .card.landscape {
      height: calc(var(--h) * 1.42);
    }

    .col-center .card.square {
      height: calc(var(--h) * 1.48);
    }
  }

  @media (max-width: 420px) {
    .gallery-track {
      min-height: 142vh;
    }

    .gallery-shell {
      width: 160vw;
    }
  }
</style>
