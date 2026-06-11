<script>
  import { onDestroy, onMount } from "svelte";

  let visible = true;
  let compassVisible = false;
  let compassClearing = false;
  let logoVisible = false;
  let logoArriving = false;
  let backgroundVisible = true;
  let backgroundHiding = false;
  let hidden = false;

  let logoInTimer;
  let logoSettleTimer;
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

  const LOGO_IN_DELAY = 620;
  const LOGO_IN_DURATION = 820;
  const COMPASS_CLEAR_DELAY = 1420;
  const COMPASS_CLEAR_DURATION = 520;
  const LOGO_HOLD_DURATION = 460;
  const LOGO_FADE_DURATION = 420;
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
          logoArriving = true;
          logoVisible = true;

          logoSettleTimer = window.setTimeout(() => {
            logoArriving = false;
          }, LOGO_IN_DURATION);
        }, LOGO_IN_DELAY);

        compassOutTimer = window.setTimeout(() => {
          compassClearing = true;
        }, COMPASS_CLEAR_DELAY);

        logoOutTimer = window.setTimeout(() => {
          logoVisible = false;

          headerRevealTimer = window.setTimeout(() => {
            dispatch("preloader:header-reveal");
            headerFallbackTimer = window.setTimeout(finishIntro, 1400);
          }, LOGO_FADE_DURATION);
        }, COMPASS_CLEAR_DELAY + COMPASS_CLEAR_DURATION + LOGO_HOLD_DURATION);
      });
    });
  });

  onDestroy(() => {
    if (typeof window === "undefined") return;

    cancelAnimationFrame(raf1);
    cancelAnimationFrame(raf2);
    clearTimeout(logoInTimer);
    clearTimeout(logoSettleTimer);
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
    <svg
      class="site-intro-loader__mark"
      viewBox="0 0 240 240"
      focusable="false"
    >
      <g
        class="compass-art"
        class:is-visible={compassVisible}
        class:is-clearing={compassClearing}
      >
        <circle class="compass-ring compass-ring--outer" cx="120" cy="120" r="98" />
        <circle class="compass-ring compass-ring--edge" cx="120" cy="120" r="92" />
        <circle class="compass-ring compass-ring--middle" cx="120" cy="120" r="78" />
        <circle class="compass-ring compass-ring--inner" cx="120" cy="120" r="65" />

        <g class="compass-ticks">
          {#each Array(48) as _, i}
            <line
              class="compass-tick"
              class:compass-tick--major={i % 12 === 0}
              class:compass-tick--medium={i % 6 === 0 && i % 12 !== 0}
              x1="120"
              y1={i % 12 === 0 ? 22 : i % 6 === 0 ? 24 : 26}
              x2="120"
              y2={i % 12 === 0 ? 34 : i % 6 === 0 ? 32 : 30}
              style={`--tick-index:${i}; transform:rotate(${i * 7.5}deg);`}
            />
          {/each}
        </g>

        <g class="compass-axes">
          <path d="M120 42V82M120 158V198" />
          <path d="M42 120H82M158 120H198" />
          <path class="compass-axis--fine" d="M67 67L91 91M149 149L173 173" />
          <path class="compass-axis--fine" d="M173 67L149 91M91 149L67 173" />
        </g>

        <g class="compass-rose">
          <path d="M120 44L124 75L120 69L116 75Z" />
          <path d="M196 120L165 124L171 120L165 116Z" />
          <path d="M120 196L116 165L120 171L124 165Z" />
          <path d="M44 120L75 116L69 120L75 124Z" />
        </g>

        <g class="compass-logo-seat">
          <circle class="compass-logo-seat__plate" cx="120" cy="120" r="38" />
          <circle class="compass-logo-seat__ring" cx="120" cy="120" r="35" />
          <circle class="compass-logo-seat__ring compass-logo-seat__ring--inner" cx="120" cy="120" r="29" />
          <path d="M120 75V84M156 120H165M120 156V165M75 120H84" />
          <circle cx="120" cy="82" r="1.4" />
          <circle cx="158" cy="120" r="1.4" />
          <circle cx="120" cy="158" r="1.4" />
          <circle cx="82" cy="120" r="1.4" />
        </g>

        <g class="compass-cardinals">
          <text class="compass-cardinal compass-cardinal--north" x="120" y="16">N</text>
          <text class="compass-cardinal" x="224" y="120">E</text>
          <text class="compass-cardinal" x="120" y="230">S</text>
          <text class="compass-cardinal" x="16" y="120">W</text>
        </g>

        <circle class="compass-index-dot" cx="120" cy="38" r="1.7" />
        <circle class="compass-index-dot" cx="202" cy="120" r="1.7" />
        <circle class="compass-index-dot" cx="120" cy="202" r="1.7" />
        <circle class="compass-index-dot" cx="38" cy="120" r="1.7" />
        <line class="compass-sweep" x1="120" y1="120" x2="120" y2="28" />
      </g>

      <svg
        class="site-intro-loader__logo"
        class:is-visible={logoVisible}
        class:is-arriving={logoArriving}
        x="74"
        y="74"
        width="92"
        height="92"
        viewBox="0 0 969 969"
      >
        <path d="M175.33,886.39L514.99,37c-34.84,220.59-70.34,441.09-105.93,661.57l-3.59,4.41-230.16,183.41Z" />
        <path d="M798,933l-620.99-45,6.07-4.42,222.26-137.39,74.3,37.67c90.86,42.77,182.96,82.91,273.39,126.61l23.97,10.52-1.27-8.22L514.94,55.52l2.07-19.52,280.99,897Z" />
      </svg>
    </svg>
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

  .site-intro-loader__mark {
    display: block;
    width: clamp(15rem, 21vw, 19rem);
    height: auto;
    overflow: visible;
    color: #f6f4ef;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .compass-art {
    opacity: 1;
    transform-origin: center;
    transform-box: fill-box;
    transition:
      opacity 520ms cubic-bezier(0.4, 0, 0.2, 1),
      transform 680ms cubic-bezier(0.22, 1, 0.36, 1),
      filter 520ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .compass-art.is-clearing {
    opacity: 0;
    transform: scale(1.075);
    filter: blur(2px);
  }

  .compass-ring,
  .compass-tick,
  .compass-axes path,
  .compass-rose path,
  .compass-logo-seat__ring,
  .compass-logo-seat path,
  .compass-sweep {
    fill: none;
    stroke: currentColor;
    vector-effect: non-scaling-stroke;
  }

  .compass-ring {
    stroke-linecap: round;
    stroke-dasharray: 640;
    stroke-dashoffset: 640;
    transition: stroke-dashoffset 980ms cubic-bezier(0.65, 0, 0.35, 1);
  }

  .compass-ring--outer {
    stroke-width: 0.75;
    opacity: 0.72;
    transition-delay: 40ms;
  }

  .compass-ring--edge {
    stroke-width: 0.35;
    opacity: 0.36;
    transition-delay: 130ms;
  }

  .compass-ring--middle {
    stroke-width: 0.45;
    opacity: 0.26;
    transition-delay: 210ms;
  }

  .compass-ring--inner {
    stroke-width: 0.35;
    opacity: 0.18;
    transition-delay: 280ms;
  }

  .compass-art.is-visible .compass-ring {
    stroke-dashoffset: 0;
  }

  .compass-tick {
    stroke-width: 0.6;
    stroke-linecap: round;
    stroke-dasharray: 14;
    stroke-dashoffset: 14;
    opacity: 0.42;
    transform-origin: 120px 120px;
    transition:
      stroke-dashoffset 340ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 340ms ease;
    transition-delay: calc(140ms + var(--tick-index) * 10ms);
  }

  .compass-tick--medium {
    stroke-width: 0.8;
    opacity: 0.62;
  }

  .compass-tick--major {
    stroke-width: 1.1;
    opacity: 0.9;
  }

  .compass-art.is-visible .compass-tick {
    stroke-dashoffset: 0;
  }

  .compass-axes path,
  .compass-rose path {
    stroke-dasharray: 180;
    stroke-dashoffset: 180;
    transition: stroke-dashoffset 820ms cubic-bezier(0.65, 0, 0.35, 1);
  }

  .compass-axes path {
    stroke-width: 0.45;
    opacity: 0.28;
    transition-delay: 320ms;
  }

  .compass-axes .compass-axis--fine {
    stroke-width: 0.3;
    opacity: 0.15;
    transition-delay: 430ms;
  }

  .compass-rose path {
    stroke-width: 0.55;
    opacity: 0.28;
    transition-delay: 390ms;
  }

  .compass-logo-seat {
    opacity: 0;
    transition: opacity 480ms ease 520ms;
  }

  .compass-logo-seat__plate {
    fill: #000;
    opacity: 0.96;
  }

  .compass-logo-seat__ring {
    stroke-width: 0.5;
    opacity: 0.42;
  }

  .compass-logo-seat__ring--inner {
    stroke-width: 0.3;
    stroke-dasharray: 2 3;
    opacity: 0.24;
  }

  .compass-logo-seat path {
    stroke-width: 0.5;
    stroke-linecap: round;
    opacity: 0.42;
  }

  .compass-logo-seat circle:not(.compass-logo-seat__plate):not(.compass-logo-seat__ring) {
    fill: currentColor;
    opacity: 0.46;
  }

  .compass-art.is-visible .compass-axes path,
  .compass-art.is-visible .compass-rose path {
    stroke-dashoffset: 0;
  }

  .compass-art.is-visible .compass-logo-seat {
    opacity: 1;
  }

  .compass-cardinal {
    fill: currentColor;
    font-family: "Clash Display", sans-serif;
    font-size: 7px;
    font-weight: 400;
    letter-spacing: 0.08em;
    text-anchor: middle;
    dominant-baseline: middle;
    opacity: 0;
    transition: opacity 480ms ease 620ms;
  }

  .compass-cardinal--north {
    font-size: 8px;
    opacity: 0;
  }

  .compass-art.is-visible .compass-cardinal {
    opacity: 0.48;
  }

  .compass-art.is-visible .compass-cardinal--north {
    opacity: 0.92;
  }

  .compass-index-dot {
    fill: currentColor;
    opacity: 0;
    transition: opacity 420ms ease 680ms;
  }

  .compass-art.is-visible .compass-index-dot {
    opacity: 0.38;
  }

  .compass-sweep {
    stroke-width: 0.45;
    stroke-linecap: round;
    opacity: 0;
    transform-origin: 120px 120px;
  }

  .compass-art.is-visible .compass-sweep {
    animation: compassSweep 1120ms cubic-bezier(0.4, 0, 0.2, 1) 180ms both;
  }

  .site-intro-loader__logo {
    display: block;
    fill: currentColor;
    opacity: 0;
    transition: opacity 420ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: opacity;
    transform-origin: center;
    transform-box: fill-box;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .site-intro-loader__logo.is-visible {
    opacity: 1;
  }

  .site-intro-loader__logo.is-arriving {
    animation: compassNeedleIn 820ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes compassSweep {
    0% {
      opacity: 0;
      transform: rotate(-110deg);
    }
    18% {
      opacity: 0.34;
    }
    76% {
      opacity: 0.16;
    }
    100% {
      opacity: 0;
      transform: rotate(250deg);
    }
  }

  @keyframes compassNeedleIn {
    0% {
      opacity: 0;
      transform: translate3d(0, 12px, 0) rotate(-68deg) scale(0.42);
    }
    58% {
      opacity: 1;
      transform: translate3d(0, -1.5px, 0) rotate(3deg) scale(1.035);
    }
    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
    }
  }

  @media (max-width: 768px) {
    .site-intro-loader__mark {
      width: clamp(14rem, 62vw, 15.5rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .site-intro-loader,
    .site-intro-loader__logo,
    .compass-art,
    .compass-ring,
    .compass-tick,
    .compass-axes path,
    .compass-rose path,
    .compass-logo-seat,
    .compass-cardinal {
      transition-duration: 160ms;
      animation: none !important;
    }
  }
</style>
