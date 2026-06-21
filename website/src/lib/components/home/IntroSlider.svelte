<script>
  export let main = "Des signatures,";

  export let muted = "marques désirables.";
</script>

<section class="story-slider-intro">
  <div class="story-slider-intro__text-wrap">
    <div class="story-slider-intro__card">
      <p class="story-slider-intro__text">
        <span class="story-slider-intro__main">{main}</span><span class="story-slider-intro__muted">{muted}</span>
      </p>
    </div>
  </div>
</section>

<style>
  .story-slider-intro {
    --section-bg: #000;
    --intro-text: var(--lead-blue-pale);

    position: relative;
    z-index: 3;
    background: var(--section-bg);
    padding: 0;
    width: 100%;
  }

  .story-slider-intro__text-wrap {
    width: min(1500px, 100%);
    margin: 0 auto;
    display: flex;
    justify-content: center;
    padding:
      clamp(5rem, 10vw, 10rem)
      clamp(1.5rem, 3vw, 3rem)
      clamp(5rem, 10vw, 10rem);
    align-self: start;
    min-width: 0;
  }

  .story-slider-intro__card {
    width: min(400px, 100%);
    padding: 0;
    min-width: 0;
  }

  .story-slider-intro__text {
    margin: 0 auto;
    max-width: 14ch;
    font-family: "Inter", sans-serif;
    font-weight: 300;
    font-size: clamp(1rem, 1.8vw, 1.8rem);
    line-height: 1.2;
    letter-spacing: -0.01em;
    color: var(--intro-text);
    text-align: center;
  }

  .story-slider-intro__main {
    color: #f5f1e8;
  }

  .story-slider-intro__muted {
    display: block;
    color: rgba(245, 241, 232, 0.5);
  }

  @media (max-width: 1100px) {
    .story-slider-intro__card {
      width: min(400px, 100%);
    }
  }

  @media (max-width: 900px) {
    .story-slider-intro__text-wrap {
      width: min(100%, 760px);
      margin: 0 auto;
      display: flex;
      justify-content: center;
      padding: 4rem 1.25rem 4rem;
    }

    .story-slider-intro__card {
      width: min(72vw, 24rem);
      padding: 0;
    }

    .story-slider-intro__text {
      font-size: clamp(1rem, 4.5vw, 1.6rem);
      line-height: 1.2;
      max-width: 12ch;
    }
  }

  @media (max-width: 640px) {
    .story-slider-intro__text-wrap {
      padding: 3.5rem 1.1rem 3.5rem;
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
      font-size: clamp(0.95rem, 4.8vw, 1.4rem);
      line-height: 1.2;
    }
  }

</style>
