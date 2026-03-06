<script>
  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";

  let phase = "draw";

  let heroVisible = true;
  let heroSection = null;
  let resizeTimeout;
  let observer;

  let logoMover;
  let logoScaler;

  let viewportH = 0;

  let targetMove = 0;
  let targetScale = 1;

  let currentMove = 0;
  let currentScale = 1;

  let rafId;
  let drawReady = false;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(v, max));
  }

  function getHero() {
    if (heroSection && document.body.contains(heroSection)) {
      return heroSection;
    }

    heroSection = document.querySelector('[data-hero="intro"]');
    return heroSection;
  }

  function syncViewport() {
    viewportH = window.innerHeight || 0;
  }

  function setTargetFromProgress(progress) {
    const isMobile = window.innerWidth <= 768;

    const maxMovePx = isMobile ? viewportH * 0.135 : viewportH * 0.215;
    targetMove = maxMovePx * progress;

    targetScale = 1 - (isMobile ? 0.39 : 0.58) * progress;
  }

  function renderLogo() {
    if (!logoMover || !logoScaler) return;

    logoMover.style.transform =
      `translate3d(-50%, calc(-50% - ${currentMove}px), 0)`;

    logoScaler.style.transform = `scale(${currentScale})`;
  }

  function animateLogo() {
    const isMobile = window.innerWidth <= 768;

    const easeMove = isMobile ? 0.235 : 0.13;
    const easeScale = isMobile ? 0.215 : 0.115;

    currentMove += (targetMove - currentMove) * easeMove;
    currentScale += (targetScale - currentScale) * easeScale;

    if (Math.abs(targetMove - currentMove) < 0.015) currentMove = targetMove;
    if (Math.abs(targetScale - currentScale) < 0.00045) currentScale = targetScale;

    renderLogo();
    rafId = requestAnimationFrame(animateLogo);
  }

  function updateLogoState() {
    const hero = getHero();

    if (!hero) {
      heroVisible = false;
      targetMove = 0;
      targetScale = 1;
      currentMove = 0;
      currentScale = 1;
      renderLogo();
      return;
    }

    syncViewport();

    const rect = hero.getBoundingClientRect();
    const max = rect.height - viewportH;
    const raw = max > 0 ? clamp(-rect.top / max, 0, 1) : 0;

    heroVisible = rect.bottom > 0 && rect.top < viewportH;

    const moveWindow = window.innerWidth <= 768 ? 0.185 : 0.2;
    let logoProgress = phase === "done" ? clamp(raw / moveWindow, 0, 1) : 0;

    if (logoProgress <= 0.0001) {
      logoProgress = 0;
      currentMove = 0;
      currentScale = 1;
      setTargetFromProgress(0);
      renderLogo();
      return;
    }

    setTargetFromProgress(logoProgress);
  }

  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      heroSection = null;
      syncViewport();
      updateLogoState();
    }, 80);
  }

  onMount(() => {
    const isMobile = window.innerWidth <= 768;

    syncViewport();
    setTargetFromProgress(0);

    observer = new MutationObserver(() => {
      heroSection = null;
      updateLogoState();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    registerParallax(updateLogoState);

    // démarre le dessin après que le navigateur ait bien peint la page
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          drawReady = true;
        }, isMobile ? 180 : 80);
      });
    });

    // un peu plus long sur mobile, mais sans être trop long
    const doneDelay = isMobile ? 5900 : 5200;

    const timer = setTimeout(() => {
      phase = "done";
      updateLogoState();
    }, doneDelay);

    renderLogo();
    rafId = requestAnimationFrame(animateLogo);
    updateLogoState();

    return () => {
      clearTimeout(timer);
      clearTimeout(resizeTimeout);
      observer?.disconnect();
      unregisterParallax(updateLogoState);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      cancelAnimationFrame(rafId);
    };
  });

  onDestroy(() => {
    observer?.disconnect();
    unregisterParallax(updateLogoState);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("orientationchange", handleResize);
    cancelAnimationFrame(rafId);
  });
</script>

<div class="background {phase}">
  <div class="progress-container">
    <div class="progress-bar {drawReady ? 'play' : ''}"></div>
  </div>
</div>

<div
  class="logo-wrapper {phase}"
  style="opacity:{phase === 'done' && !heroVisible ? 0 : 1};"
>
  <div class="logo-mover" bind:this={logoMover}>
    <div class="logo-scaler" bind:this={logoScaler}>
      <div class="eagle-container">
        <svg viewBox="0 0 623.51 321.98" class="eagle {drawReady ? 'play' : ''}">
          <path d="M353.01,17.99c2.41-.29,6.21-1.87,8.49-3,1.66,2.25-5.21,7.4-6.48,9.01l-14.5,4.98c11.36,3.02,21.53,6.9,33.52,7.03,1.65.02,4.31-2.15,3.99.99l-5.5,3.51-14.01,4.47c11.39,3.89,21.28,12.94,33.99,12.02.79,5.23-17.19,5.25-20.99,5,38.7,35.04,16.07,65.2-23.99,82.98,30.78,6.37,53.58,31.95,54.98,63.52,3.7,73.03-68.92,108.86-131.99,113.48l33.68-10.81c82.76-30.32,80.62-167.84-23.68-148.18l1.12-14.87c26.26-5.08,64.04-16.17,72.17-45.33,5.49-16.96-1.79-32.4-16.3-41.8l13.99,2.5c-6.79-8.37-16.78-12.09-25.99-17.01,4.39-4.46,17.07,2.17,17.99-1.48-11.11-5-22.7-7.85-34.99-7.02-1.37-3.75,11.36-4.84,13.99-5-23.21-5.56-44.92-1.59-64.33,12.18-7.28,5.21-18.89,19.26-29.45,14.11-2.82-1.38-2-4.05-2.23-4.27-1.25-1.21-6.67,5.16-9.48-1.03-2.46-5.42,4.62-13.91,8.48-17.48,11.52-10.65,28.28-14.19,38.47-26.54.59-.71,2.93-7.55,3.56-2.45.38,3.1-.56,5.04-1.24,7.78-.32,1.29-1.93,1.9.7,1.7L296.01,0l-.62,4.38-6.38,9.62L324.5,1c.77.74-4.63,8.93-5.55,9.94-2.12,2.32-4.78,2.86-6.44,5.06h20.5c2.14,0,9.21-4.69,12.5-3.99l-7,5.99c4.62-.4,9.99.55,14.5,0Z"/><path d="M27.51,201c.6-1.11,17.77,7.69,16.99,4.01-6.43-2.58-30.56-16.17-31.98-22.01,20.92,7.24,46.25,14.69,68.46,16.04,1.08.07,3.79.64,3.52-1.03C51.42,185.09,18.67,159.31,0,131c53.86,44.56,134.59,37.5,180.5,92.48-41.5,14.71-123,14.59-152.99-22.48Z"/><path d="M623.51,132c-23.27,28.1-53.4,53.35-87.99,66-.25,1.71,2.38,1.06,3.48.98,23.64-1.84,46.83-8.74,69.52-14.98-8.26,7.9-18.04,16-28.99,20,.49,3.87,19.54-5.92,21.5-8.01,1.51,1.47-1.57,3.66-2.49,4.51-39.86,40.78-91.26,31.51-137.92,7.4,5.28-24.45,56.67-29.4,77.67-37.64,31.47-9.17,57.07-23.02,85.24-38.25Z"/><path d="M617.5,26c-5.57,34.79-21.26,68.59-44.99,94.5,1.07,1.68,2.19-.41,2.98-1.02,17.29-13.52,34.33-29.47,44-49.49.19,67.69-67.56,99.31-126.5,102.99-2.89.13-11.51,1.3-10.01-2.99,3.08-8.78,45.05-35.59,54.99-44.03,26.39-22.41,64.26-65.83,77.28-97.77.61-1.5-.6-2.71,2.25-2.2Z"/><path d="M138.5,171.99C74.48,173.32-.32,142.48,1.01,69c7.67,18.94,26.98,37.33,42.49,50.5.79.65,1.99,2.64,3,1C23.02,94.97,6.61,60.77,3.52,26c18.62,40.91,49.84,78.59,84.53,106.95,13.55,10.69,33.87,20.38,45.48,31.52.98.94,6.01,6.62,4.97,7.52Z"/><path d="M610.5,241c-39.91,31.47-161.42,30.86-198.01-7.49,29.82-19.4,62.67-6.36,92.59,3.41,33.29,8.68,71.72,11.56,105.42,4.08Z"/><path d="M410.51,198.98c49.41-45.57.74-77.54,31.76-82.73,59.28-3.63,113.72-39.54,159.23-75.26-25.15,34.93-79.23,83.17-123.5,87.99-6.55.53-20.43-1.75-25,2-5.45,4.48-1.19,9.57-.57,14.59,1.87,23.12-24.25,43.41-41.92,53.41Z"/><path d="M211.51,202.98c-15.48-6.17-42.09-31.17-45.76-47.72-1.7-9.93,8.35-22.99-7.83-25.18-56.77,3.78-104.85-47.73-139.41-87.08,38.94,29.76,97.53,67.65,147.62,75.86,5.32.89,18.36-.42,20.86,5.14s-2.96,15.91-3.46,22.5c-1.79,23.36,11.63,41.67,27.98,56.48Z"/><path d="M42.51,249c72.17,20.61,132.38-32.75,192.28-17.8,3.42,1.2,11.76,5.06,4.27,5.84-16.26,1.68-24.45,9.96-38.88,16.12-46.54,18.73-113.3,21.08-157.67-4.16Z"/><path d="M222.47,59.02c2.09,16.23,40.96-2.31,48.04,15.96-15.99-1.32-38.33,30.98-43.94,19.39,3.65-8.83,22.54-16.36,30.94-20.37-17.56,3.16-39.99,16.84-37.49,36.98-12.36-8.03-20.21-23.26-13.68-37.67,1.37-3.01,13.18-16.92,16.13-14.3Z"/><path d="M286.5,101.99c-4.64-4.44-9.22-7.75-15.99-7.99,8.75,9.28,9.3,21.18,5.99,32.98-2.31-7.08-3.99-19.81-10.98-23.99,4.72,16.87-6.89,31.94-20,41,7.13-13.86,15.63-32.04,6.43-46.94-1.55-2.06-6.21-3.69-4.47-5.58,10.11-10.9,35.95-5.31,39.01,10.52Z"/><path d="M247.51,56c1.01-1.06,16.14,9.25,12.57-3.1-.48-1.66-7.05-5.31-1.08-5.96,9.48-1.03,11.69,21.09-5.53,16.58-2.43-.64-8.37-5.01-5.96-7.52Z"/>
        </svg>
      </div>
    </div>
  </div>
</div>

<style>
  .background {
    position: fixed;
    inset: 0;
    background: #111;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9998;
    transition:
      opacity 1s cubic-bezier(.22,.61,.36,1),
      visibility 1s cubic-bezier(.22,.61,.36,1);
  }

  .background.done {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }

  .logo-wrapper {
    position: fixed;
    inset: 0;
    z-index: 9999;
    pointer-events: none;
    transition: opacity 0.9s cubic-bezier(.22,.61,.36,1);
  }

  .logo-mover {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
    will-change: transform;
    backface-visibility: hidden;
    transform-style: preserve-3d;
  }

  .logo-scaler {
    transform: scale(1);
    will-change: transform;
    backface-visibility: hidden;
    transform-style: preserve-3d;
  }

  .eagle-container {
    color: white;
  }

  .eagle {
    width: 250px;
    display: block;
    backface-visibility: hidden;
  }

  .eagle path {
    fill: transparent;
    stroke: currentColor;
    stroke-width: 2;
    stroke-dasharray: 15000;
    stroke-dashoffset: 15000;
  }

  .eagle.play path {
    animation: draw 4.8s cubic-bezier(.7,0,.3,1) forwards;
  }

  @keyframes draw {
    to {
      stroke-dashoffset: 0;
    }
  }

  .progress-container {
    width: 200px;
    height: 1px;
    background: rgba(255,255,255,0.15);
    overflow: hidden;
    position: absolute;
    bottom: 35%;
  }

  .progress-bar {
    height: 100%;
    width: 0%;
    background: white;
  }

  .progress-bar.play {
    animation: loading 5s cubic-bezier(.7,0,.3,1) forwards;
  }

  @keyframes loading {
    to {
      width: 100%;
    }
  }

  @media (max-width: 768px) {
    .eagle {
      width: 172px;
    }

    .eagle.play path {
      animation: draw 5.45s cubic-bezier(.7,0,.3,1) forwards;
    }

    .progress-container {
      width: 150px;
      bottom: 31%;
    }

    .progress-bar.play {
      animation: loading 5.55s cubic-bezier(.7,0,.3,1) forwards;
    }
  }
</style>