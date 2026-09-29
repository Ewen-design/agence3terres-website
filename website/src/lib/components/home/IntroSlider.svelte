<script>
  import { reveal } from "$lib/actions/reveal.js";

  // Une seule phrase, centrée, dans le même gabarit que les titres des hero.
  export let lead = "Chaque projet devient une signature.";
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
    background: var(--bg-deep, #000);
    padding: 0;
    width: 100%;
  }

  .story-slider-intro__text-wrap {
    width: min(1500px, 100%);
    margin: 0 auto;
    display: flex;
    justify-content: center;
    /* Beaucoup d'air AU-DESSUS, presque rien en dessous : le texte se pose
       juste avant le bloc des projets. */
    padding:
      clamp(6rem, 12vw, 12rem)
      var(--site-inset)
      clamp(1rem, 2vw, 2rem);
    align-self: start;
    min-width: 0;
  }

  .story-slider-intro__card {
    width: min(900px, 100%);
    padding: 0;
    min-width: 0;
  }

  .story-slider-intro__lead {
    margin: 0 auto;
    width: 45rem;
    max-width: 100%;
    font-family: var(--site-font);
    font-weight: 500;
    font-size: clamp(1.375rem, 2.9vw, 2.25rem);
    line-height: 1.2;
    letter-spacing: -0.01em;
    color: #f4efe6;
    text-align: center;
    text-wrap: balance;
  }

  .story-slider-intro__lead :global(.dim) {
    color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.5);
  }

  .story-slider-intro__lead :global(.hl) {
    color: #f4efe6;
  }

  @media (max-width: 900px) {
    .story-slider-intro__text-wrap {
      width: min(100%, 760px);
      margin: 0 auto;
      display: flex;
      justify-content: center;
      padding: 5rem 1.25rem 1rem;
    }

    .story-slider-intro__card {
      width: min(90vw, 560px);
      padding: 0;
    }
  }

  @media (max-width: 640px) {
    .story-slider-intro__text-wrap {
      padding: 4.5rem 1.1rem 0.9rem;
    }

    .story-slider-intro__card {
      width: min(88vw, 480px);
    }
  }

  @media (max-width: 420px) {
    .story-slider-intro__card {
      width: min(90vw, 18rem);
    }
  }
</style>
