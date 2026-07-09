<script>
  import { onDestroy, onMount } from "svelte";

  let visible = true;
  let logoVisible = false;
  let logoClearing = false;
  let backgroundVisible = true;
  let backgroundHiding = false;
  let hidden = false;

  let logoInTimer;
  let logoOutTimer;
  let headerRevealTimer;
  let headerFallbackTimer;
  let backgroundDoneTimer;
  let removeTimer;
  let raf1;
  let raf2;
  let handleHeaderIntroDone;
  let contentRevealDispatched = false;

  // Intro : la phrase « Né pour créer. » arrive mot par mot (blur → net), tient,
  // puis tous les mots disparaissent EN MÊME TEMPS en blur.
  const LOGO_IN_DELAY = 220;        // avant que les mots commencent à arriver
  const LOGO_HOLD_DURATION = 2000;  // temps d'affichage avant la disparition
  const HEADER_REVEAL_DELAY = 240;  // after the logo starts clearing → reveal header
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
      logoOutTimer = window.setTimeout(() => {
        logoClearing = true;
      }, 220);
      headerRevealTimer = window.setTimeout(() => {
        dispatch("preloader:header-reveal");
      }, 420);
      headerFallbackTimer = window.setTimeout(finishIntro, 1000);
      return;
    }

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        logoInTimer = window.setTimeout(() => {
          logoVisible = true;
        }, LOGO_IN_DELAY);

        logoOutTimer = window.setTimeout(() => {
          logoClearing = true;

          headerRevealTimer = window.setTimeout(() => {
            dispatch("preloader:header-reveal");
            headerFallbackTimer = window.setTimeout(finishIntro, 1400);
          }, HEADER_REVEAL_DELAY);
        }, LOGO_IN_DELAY + LOGO_HOLD_DURATION);
      });
    });
  });

  onDestroy(() => {
    if (typeof window === "undefined") return;

    cancelAnimationFrame(raf1);
    cancelAnimationFrame(raf2);
    clearTimeout(logoInTimer);
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
    <div class="intro-logo-scene">
      <p
        class="intro-phrase"
        class:is-visible={logoVisible}
        class:is-clearing={logoClearing}
      >
        <span class="intro-word">Né</span>
        <span class="intro-word">pour</span>
        <span class="intro-word">créer.</span>
      </p>
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

  .intro-logo-scene {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: #f6f4ef;
    padding: 1.5rem;
  }

  .intro-phrase {
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.32em;
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: clamp(1.5rem, 3.4vw, 2.6rem);
    line-height: 1.1;
    letter-spacing: -0.02em;
    text-align: center;
    color: #f6f4ef;
  }

  /* Chaque mot arrive en blur doux (focus-pull). */
  .intro-word {
    display: inline-block;
    opacity: 0;
    filter: blur(14px);
    transform: translate3d(0, 0.22em, 0);
    transition:
      opacity 0.7s ease,
      filter 0.9s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.9s cubic-bezier(0.22, 0.61, 0.36, 1);
    will-change: opacity, filter, transform;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  /* Arrivée mot par mot (décalée). */
  .intro-phrase.is-visible .intro-word {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
  }
  .intro-phrase.is-visible .intro-word:nth-child(1) { transition-delay: 0ms; }
  .intro-phrase.is-visible .intro-word:nth-child(2) { transition-delay: 240ms; }
  .intro-phrase.is-visible .intro-word:nth-child(3) { transition-delay: 480ms; }

  /* Sortie : tous les mots disparaissent EN MÊME TEMPS, en blur. */
  .intro-phrase.is-clearing .intro-word {
    opacity: 0;
    filter: blur(18px);
    transform: translate3d(0, -0.12em, 0);
    transition:
      opacity 0.55s ease,
      filter 0.75s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.75s cubic-bezier(0.22, 0.61, 0.36, 1);
    transition-delay: 0ms !important;
  }

  @media (prefers-reduced-motion: reduce) {
    .site-intro-loader {
      transition-duration: 160ms;
    }

    .intro-word {
      filter: none;
      transform: none;
      transition-duration: 160ms;
    }

    .intro-phrase.is-clearing .intro-word {
      filter: none;
      transform: none;
    }
  }
</style>
