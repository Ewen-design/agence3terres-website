<script>
  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";

  let section;
  let scene;

  let progress = 0;
  let smoothProgress = 0;
  let visible = false;
  let textProgress = 0;
  let logoProgress = 0;

  let touchStartY = 0;
  let snapLocked = false;
  let unlockTimer = null;

  const words = ["Crafting", "Digital", "Experiences", "Elegantly"];
  const clamp = (v, min, max) => Math.max(min, Math.min(v, max));

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function getLenis() {
    return window.lenis;
  }

  function getTopY() {
    return window.scrollY + section.getBoundingClientRect().top;
  }

  function getBottomY() {
    return getTopY() + section.offsetHeight - window.innerHeight;
  }

  function getRawProgress() {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const max = rect.height - vh;
    return max > 0 ? clamp(-rect.top / max, 0, 1) : 0;
  }

  function introRunning() {
    return (
      document.body.classList.contains("intro-active") ||
      document.body.classList.contains("intro-draw") ||
      document.body.classList.contains("intro-leaving") ||
      document.body.classList.contains("intro-lock")
    );
  }

  function setSnapLock(state) {
    snapLocked = state;
    document.body.classList.toggle("hero-snap-lock", state);
  }

  function clearSnapTimer() {
    if (unlockTimer) {
      clearTimeout(unlockTimer);
      unlockTimer = null;
    }
  }

  function releaseSnap() {
    clearSnapTimer();
    getLenis()?.start();
    setSnapLock(false);
  }

  function snapTo(direction) {
    if (!section || snapLocked || introRunning()) return;

    const lenis = getLenis();
    if (!lenis) return;

    const raw = getRawProgress();

    if (direction === "down" && raw >= 0.985) return;
    if (direction === "up" && raw <= 0.015) return;

    const targetY = direction === "down" ? getBottomY() : getTopY();

    setSnapLock(true);
    clearSnapTimer();
    lenis.stop();

    lenis.scrollTo(targetY, {
      duration: direction === "down" ? 7.8 : 7.0,
      easing: (t) => 1 - Math.pow(1 - t, 2.85),
      immediate: false,
      force: true,
      lock: true,
      onComplete: () => {
        releaseSnap();
      }
    });

    unlockTimer = setTimeout(() => {
      releaseSnap();
    }, direction === "down" ? 8300 : 7600);
  }

  function handleWheel(e) {
    if (introRunning()) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (!section) return;

    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const inView = rect.top < vh && rect.bottom > 0;

    if (!inView) return;

    if (snapLocked) {
      e.preventDefault();
      return;
    }

    const raw = getRawProgress();

    if (e.deltaY > 8 && raw < 0.985) {
      e.preventDefault();
      snapTo("down");
      return;
    }

    if (e.deltaY < -8 && raw > 0.015) {
      e.preventDefault();
      snapTo("up");
    }
  }

  function handleTouchStart(e) {
    if (introRunning()) {
      touchStartY = 0;
      return;
    }

    touchStartY = e.touches[0]?.clientY ?? 0;
  }

  function handleTouchMove(e) {
    if (introRunning()) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (snapLocked) {
      e.preventDefault();
    }
  }

  function handleTouchEnd(e) {
    if (introRunning()) {
      touchStartY = 0;
      return;
    }

    if (!section || snapLocked) {
      touchStartY = 0;
      return;
    }

    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const inView = rect.top < vh && rect.bottom > 0;

    if (!inView) {
      touchStartY = 0;
      return;
    }

    const endY = e.changedTouches[0]?.clientY ?? 0;
    const delta = endY - touchStartY;
    const raw = getRawProgress();

    if (delta < -18 && raw < 0.985) {
      snapTo("down");
    }

    if (delta > 18 && raw > 0.015) {
      snapTo("up");
    }

    touchStartY = 0;
  }

  function scrollToEndDesktop() {
    if (introRunning()) return;
    if (snapLocked) return;

    const raw = getRawProgress();
    if (raw < 0.985) {
      snapTo("down");
    }
  }

  function updateHero() {
    if (!section || !scene) return;

    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const max = rect.height - vh;

    const raw = max > 0 ? clamp(-rect.top / max, 0, 1) : 0;

    const eased = easeOutCubic(raw);
    smoothProgress += (eased - smoothProgress) * 0.07;
    progress = smoothProgress;

    const isMobile = window.innerWidth <= 768;
    const logoWindow = isMobile ? 0.42 : 0.32;
    logoProgress = easeOutQuart(clamp(raw / logoWindow, 0, 1));

    const revealDelay = isMobile ? 0.32 : 0.24;
    textProgress = clamp((progress - revealDelay) / (1 - revealDelay), 0, 1);

    visible = rect.bottom > 0 && rect.top < vh;

    if (visible) {
      scene.style.position = "fixed";
      scene.style.top = "0";
      scene.style.left = "0";
      scene.style.width = "100%";
      scene.style.height = "100vh";
      scene.style.opacity = "1";
      scene.style.pointerEvents = "none";
    } else {
      scene.style.opacity = "0";
      scene.style.pointerEvents = "none";
    }
  }

  onMount(() => {
    registerParallax(updateHero);
    window.addEventListener("resize", updateHero);

    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false, capture: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true, capture: true });

    updateHero();

    return () => {
      unregisterParallax(updateHero);
      window.removeEventListener("resize", updateHero);
      window.removeEventListener("wheel", handleWheel, { capture: true });
      window.removeEventListener("touchstart", handleTouchStart, { capture: true });
      window.removeEventListener("touchmove", handleTouchMove, { capture: true });
      window.removeEventListener("touchend", handleTouchEnd, { capture: true });
      clearSnapTimer();
      setSnapLock(false);
    };
  });

  onDestroy(() => {
    unregisterParallax(updateHero);
    window.removeEventListener("resize", updateHero);
    clearSnapTimer();
    setSnapLock(false);
  });
</script>

<section
  bind:this={section}
  class="hero"
  data-hero="intro"
  data-cursor="down"
  style="--p:{progress}; --tp:{textProgress}; --lp:{logoProgress};"
  on:click={scrollToEndDesktop}
  role="button"
  tabindex="0"
  on:keydown={(e) => (e.key === "Enter" || e.key === " ") && scrollToEndDesktop()}
>
  <div class="scene" bind:this={scene}>
    <div class="base-gradient"></div>
    <div class="ambient ambient-1"></div>
    <div class="ambient ambient-2"></div>
    <div class="ambient ambient-3"></div>
    <div class="vignette"></div>
    <div class="dark-cover"></div>
    <div class="center-glow"></div>
    <div class="warm-ring"></div>
    <div class="white-lift"></div>

    <div class="hero-logo">
      <div class="hero-logo-anchor">
        <div class="hero-logo-mover">
          <div class="hero-logo-scaler">
            <svg viewBox="0 0 623.51 321.98" class="hero-eagle">
              <path d="M353.01,17.99c2.41-.29,6.21-1.87,8.49-3,1.66,2.25-5.21,7.4-6.48,9.01l-14.5,4.98c11.36,3.02,21.53,6.9,33.52,7.03,1.65.02,4.31-2.15,3.99.99l-5.5,3.51-14.01,4.47c11.39,3.89,21.28,12.94,33.99,12.02.79,5.23-17.19,5.25-20.99,5,38.7,35.04,16.07,65.2-23.99,82.98,30.78,6.37,53.58,31.95,54.98,63.52,3.7,73.03-68.92,108.86-131.99,113.48l33.68-10.81c82.76-30.32,80.62-167.84-23.68-148.18l1.12-14.87c26.26-5.08,64.04-16.17,72.17-45.33,5.49-16.96-1.79-32.4-16.3-41.8l13.99,2.5c-6.79-8.37-16.78-12.09-25.99-17.01,4.39-4.46,17.07,2.17,17.99-1.48-11.11-5-22.7-7.85-34.99-7.02-1.37-3.75,11.36-4.84,13.99-5-23.21-5.56-44.92-1.59-64.33,12.18-7.28,5.21-18.89,19.26-29.45,14.11-2.82-1.38-2-4.05-2.23-4.27-1.25-1.21-6.67,5.16-9.48-1.03-2.46-5.42,4.62-13.91,8.48-17.48,11.52-10.65,28.28-14.19,38.47-26.54.59-.71,2.93-7.55,3.56-2.45.38,3.1-.56,5.04-1.24,7.78-.32,1.29-1.93,1.9.7,1.7L296.01,0l-.62,4.38-6.38,9.62L324.5,1c.77.74-4.63,8.93-5.55,9.94-2.12,2.32-4.78,2.86-6.44,5.06h20.5c2.14,0,9.21-4.69,12.5-3.99l-7,5.99c4.62-.4,9.99.55,14.5,0Z"/><path d="M27.51,201c.6-1.11,17.77,7.69,16.99,4.01-6.43-2.58-30.56-16.17-31.98-22.01,20.92,7.24,46.25,14.69,68.46,16.04,1.08.07,3.79.64,3.52-1.03C51.42,185.09,18.67,159.31,0,131c53.86,44.56,134.59,37.5,180.5,92.48-41.5,14.71-123,14.59-152.99-22.48Z"/><path d="M623.51,132c-23.27,28.1-53.4,53.35-87.99,66-.25,1.71,2.38,1.06,3.48.98,23.64-1.84,46.83-8.74,69.52-14.98-8.26,7.9-18.04,16-28.99,20,.49,3.87,19.54-5.92,21.5-8.01,1.51,1.47-1.57,3.66-2.49,4.51-39.86,40.78-91.26,31.51-137.92,7.4,5.28-24.45,56.67-29.4,77.67-37.64,31.47-9.17,57.07-23.02,85.24-38.25Z"/><path d="M617.5,26c-5.57,34.79-21.26,68.59-44.99,94.5,1.07,1.68,2.19-.41,2.98-1.02,17.29-13.52,34.33-29.47,44-49.49.19,67.69-67.56,99.31-126.5,102.99-2.89.13-11.51,1.3-10.01-2.99,3.08-8.78,45.05-35.59,54.99-44.03,26.39-22.41,64.26-65.83,77.28-97.77.61-1.5-.6-2.71,2.25-2.2Z"/><path d="M138.5,171.99C74.48,173.32-.32,142.48,1.01,69c7.67,18.94,26.98,37.33,42.49,50.5.79.65,1.99,2.64,3,1C23.02,94.97,6.61,60.77,3.52,26c18.62,40.91,49.84,78.59,84.53,106.95,13.55,10.69,33.87,20.38,45.48,31.52.98.94,6.01,6.62,4.97,7.52Z"/><path d="M610.5,241c-39.91,31.47-161.42,30.86-198.01-7.49,29.82-19.4,62.67-6.36,92.59,3.41,33.29,8.68,71.72,11.56,105.42,4.08Z"/><path d="M410.51,198.98c49.41-45.57.74-77.54,31.76-82.73,59.28-3.63,113.72-39.54,159.23-75.26-25.15,34.93-79.23,83.17-123.5,87.99-6.55.53-20.43-1.75-25,2-5.45,4.48-1.19,9.57-.57,14.59,1.87,23.12-24.25,43.41-41.92,53.41Z"/><path d="M211.51,202.98c-15.48-6.17-42.09-31.17-45.76-47.72-1.7-9.93,8.35-22.99-7.83-25.18-56.77,3.78-104.85-47.73-139.41-87.08,38.94,29.76,97.53,67.65,147.62,75.86,5.32.89,18.36-.42,20.86,5.14s-2.96,15.91-3.46,22.5c-1.79,23.36,11.63,41.67,27.98,56.48Z"/><path d="M42.51,249c72.17,20.61,132.38-32.75,192.28-17.8,3.42,1.2,11.76,5.06,4.27,5.84-16.26,1.68-24.45,9.96-38.88,16.12-46.54,18.73-113.3,21.08-157.67-4.16Z"/><path d="M222.47,59.02c2.09,16.23,40.96-2.31,48.04,15.96-15.99-1.32-38.33,30.98-43.94,19.39,3.65-8.83,22.54-16.36,30.94-20.37-17.56,3.16-39.99,16.84-37.49,36.98-12.36-8.03-20.21-23.26-13.68-37.67,1.37-3.01,13.18-16.92,16.13-14.3Z"/><path d="M286.5,101.99c-4.64-4.44-9.22-7.75-15.99-7.99,8.75,9.28,9.3,21.18,5.99,32.98-2.31-7.08-3.99-19.81-10.98-23.99,4.72,16.87-6.89,31.94-20,41,7.13-13.86,15.63-32.04,6.43-46.94-1.55-2.06-6.21-3.69-4.47-5.58,10.11-10.9,35.95-5.31,39.01,10.52Z"/><path d="M247.51,56c1.01-1.06,16.14,9.25,12.57-3.1-.48-1.66-7.05-5.31-1.08-5.96,9.48-1.03,11.69,21.09-5.53,16.58-2.43-.64-8.37-5.01-5.96-7.52Z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div class="content">
      <h1>
        {#each words as word, i}
          <span
            class="word"
            style="
              opacity:{textProgress > i * 0.18 ? 1 : 0};
              filter:blur({textProgress > i * 0.18 ? 0 : 14}px);
              transform:translate3d(0,{textProgress > i * 0.18 ? 0 : 28}px,0);
            "
          >
            {word}
          </span>
        {/each}
      </h1>

      <div class="scroll-indicator" style="opacity:{Math.max(0, 1 - textProgress * 2)}">
        Faites défiler pour découvrir
      </div>
    </div>
  </div>
</section>

<style>
  :global(body.hero-snap-lock),
  :global(body.intro-lock) {
    overflow: hidden;
    overscroll-behavior: none;
    touch-action: none;
  }

  .hero {
    position: relative;
    height: 400vh;
    background: #111;
    isolation: isolate;
    cursor: none;
    touch-action: pan-y;
  }

  :global(body.intro-active) .hero,
  :global(body.intro-draw) .hero,
  :global(body.intro-leaving) .hero {
    z-index: 9999;
  }

  .scene {
    position: fixed;
    inset: 0;
    opacity: 0;
    overflow: hidden;
    z-index: 0;
    will-change: opacity;
    backface-visibility: hidden;
    transform: translateZ(0);
  }

  :global(body.intro-active) .scene,
  :global(body.intro-draw) .scene,
  :global(body.intro-leaving) .scene {
    opacity: 1 !important;
    z-index: 9999 !important;
  }

  .base-gradient,
  .ambient,
  .vignette,
  .dark-cover,
  .center-glow,
  .warm-ring,
  .white-lift {
    position: absolute;
    inset: -4%;
  }

  .base-gradient {
    background:
      radial-gradient(
        118% 86% at 50% 92%,
        rgba(255, 249, 240, calc(0.18 + var(--p) * 0.82)) 0%,
        rgba(255, 235, 214, calc(0.17 + var(--p) * 0.74)) 18%,
        rgba(239, 197, 146, calc(0.15 + var(--p) * 0.60)) 38%,
        rgba(214, 126, 60, calc(0.18 + var(--p) * 0.48)) 58%,
        rgba(108, 40, 12, calc(0.42 + var(--p) * 0.28)) 78%,
        rgba(5, 2, 2, 1) 100%
      );
    animation: baseDrift 40s ease-in-out infinite alternate;
    will-change: transform;
  }

  .ambient {
    opacity: calc(0.025 + var(--p) * 0.045);
    will-change: transform, opacity;
  }

  .ambient-1 {
    background: radial-gradient(28% 28% at 34% 42%, rgba(243,212,166,.34) 0%, rgba(219,158,92,.12) 42%, rgba(255,255,255,0) 76%);
    filter: blur(34px);
    animation: ambientOne 48s ease-in-out infinite alternate;
  }

  .ambient-2 {
    background: radial-gradient(24% 24% at 66% 36%, rgba(255,240,220,.22) 0%, rgba(220,170,102,.09) 44%, rgba(255,255,255,0) 78%);
    filter: blur(38px);
    animation: ambientTwo 58s ease-in-out infinite alternate;
  }

  .ambient-3 {
    background: radial-gradient(30% 30% at 52% 64%, rgba(198,110,44,.16) 0%, rgba(228,170,106,.07) 44%, rgba(255,255,255,0) 80%);
    filter: blur(42px);
    animation: ambientThree 54s ease-in-out infinite alternate;
  }

  .vignette {
    background: radial-gradient(92% 92% at 50% 50%, rgba(0,0,0,0) 54%, rgba(0,0,0,calc(0.16 - var(--p) * 0.07)) 78%, rgba(0,0,0,calc(0.48 - var(--p) * 0.16)) 100%);
  }

  .dark-cover {
    background: radial-gradient(64% 64% at 50% 50%, rgba(0,0,0,calc(0.92 - var(--p) * 0.74)) 0%, rgba(0,0,0,calc(0.97 - var(--p) * 0.58)) 36%, rgba(0,0,0,calc(1 - var(--p) * 0.20)) 100%);
  }

  .center-glow {
    background: radial-gradient(42% 28% at 50% 88%, rgba(255,248,238,calc(var(--p) * 0.44)) 0%, rgba(255,230,198,calc(var(--p) * 0.22)) 36%, rgba(222,170,92,calc(var(--p) * 0.10)) 60%, rgba(255,255,255,0) 82%);
    filter: blur(24px);
  }

  .warm-ring {
    background: radial-gradient(68% 44% at 50% 96%, rgba(255,255,255,0) 0%, rgba(214,166,94,calc(var(--p) * 0.07)) 44%, rgba(170,92,34,calc(var(--p) * 0.12)) 60%, rgba(255,255,255,0) 80%);
    filter: blur(30px);
  }

  .white-lift {
    background: radial-gradient(58% 36% at 50% 100%, rgba(255,252,246,calc(max(0, (var(--p) - 0.52)) * 1.85)) 0%, rgba(255,242,222,calc(max(0, (var(--p) - 0.52)) * 1.02)) 24%, rgba(255,255,255,0) 66%);
    filter: blur(13px);
  }

  .hero-logo {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
  }

  .hero-logo-anchor {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
  }

  .hero-logo-mover {
    transform: translate3d(0, calc(-1 * var(--lp) * 21vh), 0);
    will-change: transform;
  }

  .hero-logo-scaler {
    transform: scale(calc(1 - var(--lp) * 0.41));
    transform-origin: center center;
    will-change: transform;
  }

  :global(body.intro-active) .hero-logo-mover,
  :global(body.intro-active) .hero-logo-scaler,
  :global(body.intro-draw) .hero-logo-mover,
  :global(body.intro-draw) .hero-logo-scaler,
  :global(body.intro-leaving) .hero-logo-mover,
  :global(body.intro-leaving) .hero-logo-scaler {
    transform: none !important;
  }

  .hero-eagle {
    width: 196px;
    display: block;
    color: white;
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  .hero-eagle path {
    fill: transparent;
    stroke: currentColor;
    stroke-width: 1.45;
    vector-effect: non-scaling-stroke;
  }

  :global(body.intro-active) .hero-eagle path {
    stroke-dasharray: 15000;
    stroke-dashoffset: 15000;
  }

  :global(body.intro-draw) .hero-eagle path {
    animation: heroDraw 4.8s cubic-bezier(.7,0,.3,1) forwards;
  }

  :global(body.intro-leaving) .hero-eagle path,
  :global(body.intro-complete) .hero-eagle path {
    stroke-dashoffset: 0;
  }

  @keyframes heroDraw {
    to { stroke-dashoffset: 0; }
  }

  .content {
    position: relative;
    z-index: 3;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 6vw;
    text-align: center;
  }

  :global(body.intro-active) .content,
  :global(body.intro-draw) .content,
  :global(body.intro-leaving) .content {
    opacity: 0;
  }

  h1 {
    margin: 0;
    margin-top: 8vh;
    font-family: "Aboreto", serif;
    font-size: clamp(2.8rem, 6vw, 6.2rem);
    line-height: 1.1;
    letter-spacing: 0.08em;
    color: rgba(255, 248, 238, calc(0.78 + var(--tp) * 0.22));
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.48em;
    text-shadow: 0 0 22px rgba(255, 240, 215, 0.08);
  }

  .word {
    display: inline-block;
    will-change: transform, opacity, filter;
    transition:
      opacity 2s cubic-bezier(.22,.61,.36,1),
      transform 2s cubic-bezier(.22,.61,.36,1),
      filter 2s cubic-bezier(.22,.61,.36,1);
  }

  .scroll-indicator {
    position: absolute;
    bottom: 8vh;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.8rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(255,240,220,0.65);
    font-family: "Aboreto", serif;
    pointer-events: none;
    transition: opacity 0.6s ease;
    white-space: nowrap;
  }

  @keyframes baseDrift {
    0% { transform: scale(1) translate3d(-0.6%, -0.4%, 0); }
    100% { transform: scale(1.04) translate3d(0.6%, 0.4%, 0); }
  }

  @keyframes ambientOne {
    0% { transform: translate3d(-1.2%, -0.9%, 0) scale(1.01); }
    100% { transform: translate3d(1.3%, 0.9%, 0) scale(1.04); }
  }

  @keyframes ambientTwo {
    0% { transform: translate3d(1.1%, -1.1%, 0) scale(1.01); }
    100% { transform: translate3d(-1.3%, 1.1%, 0) scale(1.04); }
  }

  @keyframes ambientThree {
    0% { transform: translate3d(-0.9%, 1.1%, 0) scale(1.02); }
    100% { transform: translate3d(1%, -1.2%, 0) scale(1.05); }
  }

  @media (max-width: 768px) {
    .hero {
      height: 520vh;
    }

    .base-gradient {
      background:
        radial-gradient(
          112% 88% at 50% 92%,
          rgba(255, 249, 240, calc(0.18 + var(--p) * 0.84)) 0%,
          rgba(255, 236, 214, calc(0.18 + var(--p) * 0.74)) 18%,
          rgba(241, 199, 146, calc(0.16 + var(--p) * 0.62)) 38%,
          rgba(214, 126, 60, calc(0.18 + var(--p) * 0.50)) 58%,
          rgba(108, 40, 12, calc(0.42 + var(--p) * 0.28)) 78%,
          rgba(5, 2, 2, 1) 100%
        );
    }

    .ambient-1 {
      background: radial-gradient(48% 42% at 30% 88%, rgba(243,212,166,.28) 0%, rgba(219,158,92,.10) 44%, rgba(255,255,255,0) 78%);
      filter: blur(42px);
    }

    .ambient-2 {
      background: radial-gradient(44% 38% at 72% 86%, rgba(255,240,220,.18) 0%, rgba(220,170,102,.08) 46%, rgba(255,255,255,0) 80%);
      filter: blur(46px);
    }

    .ambient-3 {
      background: radial-gradient(54% 42% at 50% 96%, rgba(198,110,44,.14) 0%, rgba(228,170,106,.06) 46%, rgba(255,255,255,0) 82%);
      filter: blur(50px);
    }

    .dark-cover {
      background: radial-gradient(118% 92% at 50% 94%, rgba(0,0,0,calc(0.94 - var(--p) * 0.74)) 0%, rgba(0,0,0,calc(0.98 - var(--p) * 0.60)) 36%, rgba(0,0,0,calc(1 - var(--p) * 0.20)) 100%);
    }

    .center-glow {
      background: radial-gradient(72% 56% at 50% 96%, rgba(255,248,238,calc(var(--p) * 0.42)) 0%, rgba(255,230,198,calc(var(--p) * 0.22)) 36%, rgba(222,170,92,calc(var(--p) * 0.10)) 60%, rgba(255,255,255,0) 82%);
      filter: blur(34px);
    }

    .warm-ring {
      background: radial-gradient(96% 70% at 50% 100%, rgba(255,255,255,0) 0%, rgba(214,166,94,calc(var(--p) * 0.06)) 42%, rgba(170,92,34,calc(var(--p) * 0.11)) 58%, rgba(255,255,255,0) 80%);
      filter: blur(36px);
    }

    .white-lift {
      background: radial-gradient(82% 62% at 50% 100%, rgba(255,252,246,calc(max(0, (var(--p) - 0.52)) * 1.8)) 0%, rgba(255,242,222,calc(max(0, (var(--p) - 0.52)) * 1.0)) 24%, rgba(255,255,255,0) 66%);
      filter: blur(18px);
    }

    .hero-logo-mover {
      transform: translate3d(0, calc(-1 * var(--lp) * 21vh), 0);
    }

    .hero-logo-scaler {
      transform: scale(calc(1 - var(--lp) * 0.58));
    }

    .hero-eagle {
      width: 196px;
      height: auto;
    }

    :global(body.intro-draw) .hero-eagle path {
      animation: heroDraw 5.35s cubic-bezier(.7,0,.3,1) forwards;
    }

    h1 {
      margin-top: 10vh;
      gap: 0.28em;
      font-size: clamp(2.2rem, 10vw, 4.2rem);
    }

    .ambient {
      opacity: calc(0.015 + var(--p) * 0.03);
    }

    .scroll-indicator {
      bottom: 7vh;
      font-size: 0.68rem;
      letter-spacing: 0.18em;
    }
  }
</style>