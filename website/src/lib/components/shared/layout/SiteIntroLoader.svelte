<script>
  import { onDestroy, onMount } from "svelte";

  let visible = true;
  let logoVisible = false;
  let backgroundVisible = true;
  let backgroundHiding = false;
  let hidden = false;

  let logoOutTimer;
  let headerRevealTimer;
  let headerFallbackTimer;
  let backgroundDoneTimer;
  let removeTimer;
  let raf1;
  let raf2;
  let handleHeaderIntroDone;
  let contentRevealDispatched = false;

  const LOGO_FADE_DURATION = 420;
  const LOGO_HOLD_DURATION = 760;
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
      logoVisible = true;
      headerRevealTimer = window.setTimeout(() => {
        logoVisible = false;
        dispatch("preloader:header-reveal");
      }, 220);
      headerFallbackTimer = window.setTimeout(finishIntro, 1100);
      return;
    }

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        logoVisible = true;

        logoOutTimer = window.setTimeout(() => {
          logoVisible = false;

          headerRevealTimer = window.setTimeout(() => {
            dispatch("preloader:header-reveal");
            headerFallbackTimer = window.setTimeout(finishIntro, 1400);
          }, LOGO_FADE_DURATION);
        }, LOGO_FADE_DURATION + LOGO_HOLD_DURATION);
      });
    });
  });

  onDestroy(() => {
    if (typeof window === "undefined") return;

    cancelAnimationFrame(raf1);
    cancelAnimationFrame(raf2);
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
      class="site-intro-loader__logo"
      class:is-visible={logoVisible}
      viewBox="0 0 969 969"
      focusable="false"
    >
      <path d="M175.33,886.39L514.99,37c-34.84,220.59-70.34,441.09-105.93,661.57l-3.59,4.41-230.16,183.41Z" />
      <path d="M798,933l-620.99-45,6.07-4.42,222.26-137.39,74.3,37.67c90.86,42.77,182.96,82.91,273.39,126.61l23.97,10.52-1.27-8.22L514.94,55.52l2.07-19.52,280.99,897Z" />
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

  .site-intro-loader__logo {
    display: block;
    width: clamp(4.6rem, 8.2vw, 7.4rem);
    height: auto;
    fill: #f6f4ef;
    opacity: 0;
    transition: opacity 420ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .site-intro-loader__logo.is-visible {
    opacity: 1;
  }

  @media (max-width: 768px) {
    .site-intro-loader__logo {
      width: clamp(4.2rem, 20vw, 5.6rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .site-intro-loader,
    .site-intro-loader__logo {
      transition-duration: 160ms;
    }
  }
</style>
