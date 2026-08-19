<script>
  import { reveal } from "$lib/actions/reveal.js";

  // Présenté comme les textes des pages projet (ProjectBrief) :
  // un paragraphe léger, aligné à gauche.
  export let lead =
    "Chaque projet devient une <span class='hl'>signature</span> : une direction claire, un <span class='hl'>univers singulier</span> et une exécution soignée qui le distingue durablement.";
</script>

<section class="story-slider-intro">
  <div class="story-slider-intro__text-wrap">
    <div class="story-slider-intro__card">
      <p class="story-slider-intro__lead" use:reveal>{@html lead}</p>
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
    color: rgba(245, 241, 232, 0.5);
    text-align: left;
    text-wrap: pretty;
  }

  .story-slider-intro__lead :global(.hl) {
    color: #f4efe6;
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
