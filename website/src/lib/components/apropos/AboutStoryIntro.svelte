<script>
  export let main =
    "Une histoire née de trois terres, entre intuition, exigence créative et sens du détail";

  export let muted =
    "pour raconter l'origine de la marque.";
</script>

<section class="story-slider-intro">
  <div class="story-slider-intro__text-wrap">
    <div class="story-slider-intro__card">
      <p class="story-slider-intro__text">
        <span class="story-slider-intro__main">{main}</span>
        <span class="story-slider-intro__muted"> {muted}</span>
      </p>
    </div>
  </div>
</section>

<style>
  .story-slider-intro {
    --section-bg: #000;
    --intro-text: rgba(17, 17, 17, 0.66);

    position: relative;
    z-index: 3;
    min-height: clamp(120px, 12vw, 180px);
    background: var(--section-bg);
    padding: 0;
    width: 100%;
  }

  .story-slider-intro__text-wrap {
    width: min(1500px, 100%);
    margin: 0 auto;
    display: flex;
    justify-content: flex-end;
    padding:
      clamp(2rem, 4vw, 4rem)
      clamp(1.5rem, 3vw, 3rem)
      clamp(1.5rem, 2.8vw, 2.4rem);
    align-self: start;
    min-width: 0;
  }

  .story-slider-intro__card {
    width: min(560px, 100%);
    padding: 0;
    min-width: 0;
  }

  .story-slider-intro__text {
    margin: 0;
    max-width: 30ch;
    font-family: "Inter", sans-serif;
    font-weight: 300;
    font-size: clamp(1.3rem, 2.8vw, 2.8rem);
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--intro-text);
  }

  .story-slider-intro__main {
    color: #f5f1e8;
  }

  .story-slider-intro__muted {
    color: rgb(157, 156, 156);
  }

  @media (max-width: 1100px) {
    .story-slider-intro {
      min-height: clamp(110px, 14vw, 170px);
    }

    .story-slider-intro__card {
      width: min(520px, 100%);
    }
  }

  @media (max-width: 900px) {
    .story-slider-intro {
      min-height: auto;
    }

    .story-slider-intro__text-wrap {
      width: min(100%, 760px);
      margin: 0 auto;
      display: flex;
      justify-content: flex-start;
      padding: 2.75rem var(--project-side-padding, 0.8rem) 2.4rem;
    }

    .story-slider-intro__card {
      width: 100%;
      padding: 0;
    }

    .story-slider-intro__text {
      max-width: 12ch;
      font-size: clamp(1.3rem, 6.8vw, 2.7rem);
      line-height: 1.04;
      padding-inline: var(--project-text-inset, 0);
    }
  }

  @media (max-width: 640px) {
    .story-slider-intro__text-wrap {
      padding: 2.4rem var(--project-side-padding, 0.8rem) 2.15rem;
    }
  }

  @media (max-width: 420px) {
    .story-slider-intro__text {
      font-size: clamp(1.15rem, 6.4vw, 1.95rem);
      line-height: 1.16;
    }
  }
</style>
