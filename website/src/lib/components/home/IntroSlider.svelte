<script>
  export let main =
    "Des projets conçus comme des signatures, où chaque détail sert une vision claire";

  export let muted =
    "et donne à chaque marque une présence plus juste, plus désirable.";
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
    font-family: "Clash Display", sans-serif;
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
      justify-content: center;
      padding: 2.75rem 1.25rem 2.4rem;
    }

    .story-slider-intro__card {
      width: min(72vw, 24rem);
      padding: 0;
    }

    .story-slider-intro__text {
      font-size: clamp(1.3rem, 6.8vw, 2.7rem);
      line-height: 1.04;
      max-width: 18ch;
    }
  }

  @media (max-width: 640px) {
    .story-slider-intro__text-wrap {
      padding: 2.4rem 1.1rem 2.15rem;
    }

    .story-slider-intro__card {
      width: min(76vw, 21rem);
    }
  }

  @media (max-width: 420px) {
    .story-slider-intro__card {
      width: min(80vw, 18rem);
    }

    .story-slider-intro__text {
      font-size: clamp(1.15rem, 6.4vw, 1.95rem);
      line-height: 1.16;
    }
  }

</style>
