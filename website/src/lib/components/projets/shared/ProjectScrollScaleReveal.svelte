<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { browser } from "$app/environment";
  import {
    registerParallax,
    unregisterParallax,
    registerWrite,
    unregisterWrite,
    forceScrollEngineUpdate
  } from "$lib/scrollEngine.js";

  export let image = "";
  export let alt = "";
  export let sectionHeight = 185;
  export let startScale = 0.82;
  export let endScale = 1;
  export let startWidth = 72;
  export let endWidth = 88;
  export let startRadius = 0.5;
  export let endRadius = 0.18;
  export let reverse = false;
  export let startBackground = "#000";
  export let endBackground = "#f7f5f1";
  export let snapBackground = false;
  export let themeBeforeSwitch = null;
  export let themeAfterSwitch = null;

  let sectionEl;
  let frameEl;
  let imageEl;

  let sectionTop = 0;
  let sectionHeightPx = 1;

  let pendingFrame = null;
  let dirty = false;
  let currentTheme = null;

  const dispatch = createEventDispatcher();

  const applied = {
    progress: -1,
    scale: -1,
    width: -1,
    radius: -1
  };

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const q = (value, step) => Math.round(value / step) * step;

  function smoothstep(edge0, edge1, value) {
    const t = clamp((value - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
  }

  function getScrollY() {
    return window.scrollY || window.pageYOffset || 0;
  }

  function getAbsoluteTop(node) {
    const rect = node?.getBoundingClientRect();
    return rect ? rect.top + getScrollY() : 0;
  }

  function measureLayout() {
    sectionTop = getAbsoluteTop(sectionEl);
    sectionHeightPx = Math.max(sectionEl?.offsetHeight || 1, 1);
  }

  function computeFrame(y, ctx) {
    if (!sectionEl) return;

    const viewportH = ctx?.vh || window.innerHeight || 1;
    const rawProgress = (y + viewportH - sectionTop) / (sectionHeightPx + viewportH);
    const progress = clamp(rawProgress, 0, 1);
    const sectionMidViewport = sectionTop - y + sectionHeightPx * 0.5;

    const motionProgress = ctx?.prefersReducedMotion
      ? progress > 0.5
        ? 1
        : 0
      : smoothstep(0.08, 0.88, progress);
    const switchProgress = ctx?.prefersReducedMotion
      ? sectionMidViewport <= viewportH * 0.5
        ? 1
        : 0
      : snapBackground
        ? sectionMidViewport <= viewportH * 0.5
          ? 1
          : 0
        : smoothstep(0.4, 0.7, progress);

    const directionalMotion = reverse ? 1 - motionProgress : motionProgress;
    const imageScale = lerp(startScale, endScale, directionalMotion);
    const frameWidth = lerp(startWidth, endWidth, directionalMotion);
    const frameRadius = lerp(startRadius, endRadius, directionalMotion);

    pendingFrame = {
      progress: q(switchProgress, 0.001),
      scale: q(imageScale, 0.001),
      width: q(frameWidth, 0.1),
      radius: q(frameRadius, 0.01)
    };

    const nextTheme =
      themeBeforeSwitch && themeAfterSwitch
        ? switchProgress >= 0.5
          ? themeAfterSwitch
          : themeBeforeSwitch
        : null;

    if (nextTheme && nextTheme !== currentTheme) {
      currentTheme = nextTheme;
      dispatch("themechange", { theme: nextTheme, progress: switchProgress });
    }

    dirty = true;
  }

  function applyFrame() {
    if (!dirty || !pendingFrame) return;

    const frame = pendingFrame;

    if (sectionEl && frame.progress !== applied.progress) {
      sectionEl.style.setProperty("--bg-progress", `${frame.progress}`);
      applied.progress = frame.progress;
    }

    if (frameEl) {
      if (frame.width !== applied.width) {
        frameEl.style.setProperty("--frame-width", `${frame.width}%`);
        applied.width = frame.width;
      }

      if (frame.radius !== applied.radius) {
        frameEl.style.setProperty("--frame-radius", `${frame.radius}rem`);
        applied.radius = frame.radius;
      }
    }

    if (imageEl && frame.scale !== applied.scale) {
      imageEl.style.transform = `scale(${frame.scale})`;
      applied.scale = frame.scale;
    }

    dirty = false;
  }

  function handleParallax(y, ctx) {
    computeFrame(y, ctx);
  }

  function handleWrite() {
    applyFrame();
  }

  onMount(() => {
    if (!browser) return;

    let resizeObserver;
    let resizeTimer;

    const scheduleMeasure = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        measureLayout();
        forceScrollEngineUpdate();
      }, 60);
    };

    measureLayout();

    registerParallax(handleParallax, { priority: 3 });
    registerWrite(handleWrite, { priority: 3 });

    window.addEventListener("resize", scheduleMeasure, { passive: true });
    window.addEventListener("orientationchange", scheduleMeasure, { passive: true });
    window.addEventListener("load", scheduleMeasure);
    window.addEventListener("pageshow", scheduleMeasure);

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        scheduleMeasure();
      });

      if (sectionEl) resizeObserver.observe(sectionEl);
      if (frameEl) resizeObserver.observe(frameEl);
    }

    requestAnimationFrame(() => {
      measureLayout();
      forceScrollEngineUpdate();
    });

    return () => {
      unregisterParallax(handleParallax);
      unregisterWrite(handleWrite);
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("orientationchange", scheduleMeasure);
      window.removeEventListener("load", scheduleMeasure);
      window.removeEventListener("pageshow", scheduleMeasure);
      clearTimeout(resizeTimer);
      resizeObserver?.disconnect();
    };
  });
</script>

<section
  class="project-scroll-reveal"
  bind:this={sectionEl}
  style={`--section-height:${sectionHeight}vh; --start-bg:${startBackground}; --end-bg:${endBackground};`}
  aria-label={alt}
>
  <div class="project-scroll-reveal__light-layer" aria-hidden="true"></div>

  <div class="project-scroll-reveal__inner">
    <figure class="project-scroll-reveal__frame" bind:this={frameEl}>
      <img bind:this={imageEl} src={image} alt={alt} loading="lazy" draggable="false" />
    </figure>
  </div>
</section>

<style>
  .project-scroll-reveal {
    --bg-progress: 0;
    --frame-width: 72%;
    --frame-radius: 0.5rem;
    position: relative;
    min-height: var(--section-height);
    overflow: clip;
    background: var(--start-bg);
    isolation: isolate;
  }

  .project-scroll-reveal__light-layer {
    position: absolute;
    inset: 0;
    background: var(--end-bg);
    opacity: var(--bg-progress);
    will-change: opacity;
    pointer-events: none;
    transition: opacity 520ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .project-scroll-reveal__inner {
    position: relative;
    min-height: var(--section-height);
    display: grid;
    place-items: center;
    padding: clamp(5rem, 8vw, 7rem) 0;
  }

  .project-scroll-reveal__frame {
    position: relative;
    z-index: 1;
    width: min(var(--frame-width), 88rem);
    aspect-ratio: 1.62;
    overflow: hidden;
    border-radius: var(--frame-radius);
    will-change: width, border-radius;
  }

  .project-scroll-reveal__frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    user-select: none;
    pointer-events: none;
    will-change: transform;
    transform-origin: 50% 50%;
  }

  @media (max-width: 900px) {
    .project-scroll-reveal {
      --frame-width: 88%;
    }

    .project-scroll-reveal__inner {
      padding: 4rem 0;
    }

    .project-scroll-reveal__frame {
      aspect-ratio: 0.82;
      width: min(var(--frame-width), calc(100vw - 1.6rem));
    }
  }
</style>
