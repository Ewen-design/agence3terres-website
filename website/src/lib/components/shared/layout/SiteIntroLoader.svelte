<script>
  import { onDestroy, onMount } from "svelte";

  let visible = true;
  let compassVisible = false;
  let compassClearing = false;
  let logoVisible = false;
  let backgroundVisible = true;
  let backgroundHiding = false;
  let hidden = false;

  let logoInTimer;
  let compassOutTimer;
  let logoOutTimer;
  let headerRevealTimer;
  let headerFallbackTimer;
  let backgroundDoneTimer;
  let removeTimer;
  let raf1;
  let raf2;
  let handleHeaderIntroDone;
  let contentRevealDispatched = false;

  const LOGO_IN_DELAY = 540;
  const COMPASS_CLEAR_DELAY = 1960;
  const COMPASS_CLEAR_DURATION = 680;
  const LOGO_HOLD_DURATION = 420;
  const HEADER_REVEAL_DELAY = 260;
  const BACKGROUND_FADE_DURATION = 560;
  let backgroundFadeDuration = BACKGROUND_FADE_DURATION;

  function dispatch(name) {
    window.dispatchEvent(new CustomEvent(name));
  }

  function lockViewport() {
    document.documentElement.classList.add("site-intro-active");
    document.body.classList.add("site-intro-active");
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  function unlockViewport() {
    document.documentElement.classList.remove("site-intro-active");
    document.body.classList.remove("site-intro-active");
  }

  function hideBackground() {
    if (backgroundHiding) return;
    backgroundHiding = true;

    clearTimeout(headerFallbackTimer);
    backgroundVisible = false;

    backgroundDoneTimer = window.setTimeout(() => {
      hidden = true;
      unlockViewport();
      dispatch("preloader:done");

      removeTimer = window.setTimeout(() => {
        visible = false;
      }, 40);
    }, backgroundFadeDuration);
  }

  function finishIntro() {
    if (!contentRevealDispatched) {
      contentRevealDispatched = true;
      dispatch("preloader:content-reveal");
    }

    requestAnimationFrame(hideBackground);
  }

  onMount(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    lockViewport();

    handleHeaderIntroDone = () => {
      finishIntro();
    };

    window.addEventListener("header:intro-done", handleHeaderIntroDone, { once: true });

    if (reduceMotion) {
      backgroundFadeDuration = 160;
      compassVisible = true;
      logoVisible = true;
      compassOutTimer = window.setTimeout(() => {
        compassClearing = true;
      }, 120);
      logoOutTimer = window.setTimeout(() => {
        logoVisible = false;
      }, 320);
      headerRevealTimer = window.setTimeout(() => {
        dispatch("preloader:header-reveal");
      }, 480);
      headerFallbackTimer = window.setTimeout(finishIntro, 1100);
      return;
    }

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        compassVisible = true;

        logoInTimer = window.setTimeout(() => {
          logoVisible = true;
        }, LOGO_IN_DELAY);

        compassOutTimer = window.setTimeout(() => {
          compassClearing = true;
        }, COMPASS_CLEAR_DELAY);

        logoOutTimer = window.setTimeout(() => {
          logoVisible = false;

          headerRevealTimer = window.setTimeout(() => {
            dispatch("preloader:header-reveal");
            headerFallbackTimer = window.setTimeout(finishIntro, 1400);
          }, HEADER_REVEAL_DELAY);
        }, COMPASS_CLEAR_DELAY + COMPASS_CLEAR_DURATION + LOGO_HOLD_DURATION);
      });
    });
  });

  onDestroy(() => {
    if (typeof window === "undefined") return;

    cancelAnimationFrame(raf1);
    cancelAnimationFrame(raf2);
    clearTimeout(logoInTimer);
    clearTimeout(compassOutTimer);
    clearTimeout(logoOutTimer);
    clearTimeout(headerRevealTimer);
    clearTimeout(headerFallbackTimer);
    clearTimeout(backgroundDoneTimer);
    clearTimeout(removeTimer);

    if (handleHeaderIntroDone) {
      window.removeEventListener("header:intro-done", handleHeaderIntroDone);
    }

    unlockViewport();
  });
</script>

{#if visible}
  <div
    id="site-intro-loader"
    class="site-intro-loader"
    class:is-hidden={hidden}
    class:background-visible={backgroundVisible}
    aria-hidden="true"
  >
    <div class="compass-scene">
      <svg
        class="compass-instrument"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid meet"
        shape-rendering="geometricPrecision"
        focusable="false"
      >
        <g
          class="compass-geometry"
          class:is-visible={compassVisible}
          class:is-clearing={compassClearing}
        >
          <g class="compass-arcs compass-arcs--outer">
            <path pathLength="1" d="M127 344A405 405 0 0 1 416 104" />
            <path pathLength="1" d="M584 104A405 405 0 0 1 873 344" />
            <path pathLength="1" d="M873 656A405 405 0 0 1 584 896" />
            <path pathLength="1" d="M416 896A405 405 0 0 1 127 656" />
          </g>

          <g class="compass-arcs compass-arcs--inner">
            <path pathLength="1" d="M242 406A275 275 0 0 1 406 242" />
            <path pathLength="1" d="M594 242A275 275 0 0 1 758 406" />
            <path pathLength="1" d="M758 594A275 275 0 0 1 594 758" />
            <path pathLength="1" d="M406 758A275 275 0 0 1 242 594" />
          </g>

          <g class="compass-center-arcs">
            <path pathLength="1" d="M392 458A116 116 0 0 1 472 388" />
            <path pathLength="1" d="M608 542A116 116 0 0 1 528 612" />
          </g>

          <g class="compass-bearing compass-bearing--north">
            <path pathLength="1" d="M500 225V365" />
            <circle cx="500" cy="216" r="2.5" />
            <text x="500" y="194">N</text>
          </g>

          <g class="compass-bearing compass-bearing--east">
            <path pathLength="1" d="M635 500H775" />
            <circle cx="784" cy="500" r="2.5" />
            <text x="806" y="500">E</text>
          </g>

          <g class="compass-bearing compass-bearing--south">
            <path pathLength="1" d="M500 635V775" />
            <circle cx="500" cy="784" r="2.5" />
            <text x="500" y="807">S</text>
          </g>

          <g class="compass-bearing compass-bearing--west">
            <path pathLength="1" d="M225 500H365" />
            <circle cx="216" cy="500" r="2.5" />
            <text x="194" y="500">W</text>
          </g>
        </g>

        <svg
          class="site-intro-loader__logo"
          class:is-visible={logoVisible}
          x="453"
          y="451"
          width="94"
          height="94"
          viewBox="0 0 969 969"
          focusable="false"
        >
          <path d="M175.33,886.39L514.99,37c-34.84,220.59-70.34,441.09-105.93,661.57l-3.59,4.41-230.16,183.41Z" />
          <path d="M798,933l-620.99-45,6.07-4.42,222.26-137.39,74.3,37.67c90.86,42.77,182.96,82.91,273.39,126.61l23.97,10.52-1.27-8.22L514.94,55.52l2.07-19.52,280.99,897Z" />
        </svg>
      </svg>
    </div>
  </div>
{/if}

<style>
  :global(html.site-intro-active),
  :global(body.site-intro-active) {
    overflow: hidden !important;
    overscroll-behavior: none;
  }

  .site-intro-loader {
    position: fixed;
    inset: 0;
    z-index: 350000;
    display: grid;
    place-items: center;
    background: #000;
    opacity: 0;
    pointer-events: auto;
    transition: opacity 560ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .site-intro-loader.background-visible {
    opacity: 1;
  }

  .compass-scene {
    position: absolute;
    inset: 0;
    overflow: hidden;
    color: #f6f4ef;
  }

  .compass-instrument {
    position: absolute;
    left: 50%;
    top: 50%;
    display: block;
    width: clamp(52rem, 100vmax, 100rem);
    height: clamp(52rem, 100vmax, 100rem);
    overflow: visible;
    transform: translate3d(-50%, -50%, 0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .compass-geometry {
    opacity: 0;
    transform: rotate(-1.2deg) scale(0.985);
    transform-box: view-box;
    transform-origin: 500px 500px;
    transition:
      opacity 680ms cubic-bezier(0.33, 0, 0.67, 1),
      transform 1250ms cubic-bezier(0.16, 1, 0.3, 1),
      filter 680ms cubic-bezier(0.4, 0, 0.2, 1);
    will-change: opacity, transform, filter;
  }

  .compass-geometry.is-visible {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }

  .compass-geometry.is-clearing {
    opacity: 0;
    transform: rotate(0.7deg) scale(1.035);
    filter: blur(1.5px);
  }

  .compass-arcs path,
  .compass-center-arcs path,
  .compass-bearing path {
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    vector-effect: non-scaling-stroke;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    transition:
      stroke-dashoffset 760ms cubic-bezier(0.33, 0, 0.67, 1),
      opacity 520ms ease,
      transform 760ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .compass-arcs--outer {
    opacity: 0.24;
  }

  .compass-arcs--outer path {
    stroke-width: 0.8;
    transition-delay: 30ms;
  }

  .compass-arcs--inner {
    opacity: 0.12;
  }

  .compass-arcs--inner path {
    stroke-width: 0.6;
    transition-delay: 120ms;
  }

  .compass-center-arcs {
    opacity: 0.32;
  }

  .compass-center-arcs path {
    stroke-width: 0.7;
    transition-delay: 220ms;
  }

  .compass-bearing {
    transform-box: view-box;
    transform-origin: 500px 500px;
  }

  .compass-bearing path {
    stroke-width: 0.65;
    opacity: 0.2;
  }

  .compass-bearing--north path {
    transition-delay: 300ms;
  }

  .compass-bearing--east path {
    transition-delay: 360ms;
  }

  .compass-bearing--south path {
    transition-delay: 420ms;
  }

  .compass-bearing--west path {
    transition-delay: 360ms;
  }

  .compass-bearing circle {
    fill: currentColor;
    opacity: 0.36;
  }

  .compass-bearing text {
    fill: currentColor;
    font-family: "Clash Display", sans-serif;
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0.12em;
    opacity: 0.56;
    text-anchor: middle;
    dominant-baseline: middle;
  }

  .compass-bearing--north text {
    opacity: 0.92;
  }

  .compass-geometry.is-visible .compass-arcs path,
  .compass-geometry.is-visible .compass-center-arcs path,
  .compass-geometry.is-visible .compass-bearing path {
    stroke-dashoffset: 0;
  }

  .site-intro-loader__logo {
    display: block;
    fill: currentColor;
    opacity: 0;
    transition: opacity 520ms cubic-bezier(0.33, 0, 0.67, 1);
    will-change: opacity;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .site-intro-loader__logo.is-visible {
    opacity: 1;
  }

  @media (max-aspect-ratio: 3 / 4) {
    .compass-bearing--west {
      transform: translateX(90px);
    }

    .compass-bearing--east {
      transform: translateX(-90px);
    }
  }

  @media (min-width: 900px) and (min-aspect-ratio: 4 / 3) {
    .compass-instrument {
      width: min(92vw, 92vh);
      height: min(92vw, 92vh);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .site-intro-loader,
    .site-intro-loader__logo,
    .compass-geometry {
      transition-duration: 160ms;
      animation: none !important;
    }
  }
</style>
