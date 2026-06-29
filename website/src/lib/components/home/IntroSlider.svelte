<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  // Présenté comme les textes des pages projet (ProjectBrief) :
  // un paragraphe léger, aligné à gauche.
  export let lead =
    "Chaque projet devient une signature : une direction claire, un univers singulier et une exécution soignée qui le distingue durablement.";

  let pEl;
  let revealed = false;
  let obs;

  onMount(() => {
    if (!browser || !pEl) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      revealed = true;
      return;
    }
    obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { revealed = true; obs.disconnect(); } },
      { rootMargin: "0px 0px -10% 0px", threshold: 0 }
    );
    obs.observe(pEl);
    return () => obs?.disconnect();
  });
</script>

<section class="story-slider-intro">
  <div class="story-slider-intro__text-wrap">
    <div class="story-slider-intro__card">
      <p class="story-slider-intro__lead" class:is-revealed={revealed} bind:this={pEl}>{lead}</p>
    </div>
  </div>
</section>

<style>
  .story-slider-intro {
    position: relative;
    z-index: 3;
    background: #000;
    padding: 0;
    width: 100%;
  }

  .story-slider-intro__text-wrap {
    width: min(1500px, 100%);
    margin: 0 auto;
    display: flex;
    justify-content: flex-start;
    padding:
      clamp(5rem, 10vw, 10rem)
      clamp(1.5rem, 3vw, 3rem)
      clamp(5rem, 10vw, 10rem);
    align-self: start;
    min-width: 0;
  }

  .story-slider-intro__card {
    width: min(640px, 100%);
    padding: 0;
    min-width: 0;
  }

  .story-slider-intro__lead {
    margin: 0;
    max-width: 24ch;
    font-family: "Inter", sans-serif;
    font-weight: 300;
    font-size: clamp(1.5rem, 2.5vw, 2.55rem);
    line-height: 1.18;
    letter-spacing: -0.025em;
    color: #f4efe6;
    text-align: left;
    text-wrap: pretty;
    opacity: 0;
    filter: blur(12px);
    transform: translate3d(0, 18px, 0);
    transition:
      opacity 0.6s ease,
      filter 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.85s cubic-bezier(0.22, 0.61, 0.36, 1);
    will-change: opacity, filter, transform;
    backface-visibility: hidden;
  }

  .story-slider-intro__lead.is-revealed {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
  }

  @media (prefers-reduced-motion: reduce) {
    .story-slider-intro__lead {
      transition: none;
      opacity: 1;
      filter: none;
      transform: none;
    }
  }

  @media (max-width: 900px) {
    .story-slider-intro__text-wrap {
      width: min(100%, 760px);
      margin: 0 auto;
      display: flex;
      justify-content: flex-start;
      padding: 4rem 1.25rem 4rem;
    }

    .story-slider-intro__card {
      width: min(90vw, 560px);
      padding: 0;
    }

    .story-slider-intro__lead {
      font-size: clamp(1.5rem, 6.6vw, 2rem);
      line-height: 1.2;
      max-width: 26ch;
    }
  }

  @media (max-width: 640px) {
    .story-slider-intro__text-wrap {
      padding: 3.5rem 1.1rem 3.5rem;
    }

    .story-slider-intro__card {
      width: min(88vw, 480px);
    }

    .story-slider-intro__lead {
      font-size: clamp(1.4rem, 6.6vw, 1.9rem);
    }
  }

  @media (max-width: 420px) {
    .story-slider-intro__card {
      width: min(90vw, 18rem);
    }

    .story-slider-intro__lead {
      font-size: clamp(1.3rem, 5.8vw, 1.6rem);
    }
  }
</style>
