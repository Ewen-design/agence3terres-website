<script>
  export let title = "Nos projets";

  export let main =
    "Nous imaginons des identités fortes, des expériences digitales immersives";

  export let muted =
    "et des directions artistiques pensées pour laisser une empreinte durable.";
</script>

<section class="story-slider-intro">
  <div class="story-slider-intro__title-wrap">
    <h2 class="story-slider-intro__title">{title}</h2>
  </div>

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
    min-height: clamp(120px, 16vw, 210px);
    display: grid;
    grid-template-columns: 52% 48%;
    align-items: start;
    background: var(--section-bg);
    padding: 0;
    width: 100%;
  }

  .story-slider-intro__title-wrap {
    padding:
      clamp(2rem, 4vw, 4rem)
      clamp(1.5rem, 3vw, 3rem)
      clamp(1.2rem, 2vw, 1.8rem);
    display: flex;
    justify-content: flex-start;
    min-width: 0;
  }

  .story-slider-intro__title {
    margin: 0;
    font-family: "Titre italic", serif;
    font-style: italic;
    font-weight: 100;
    font-size: clamp(2.5rem, 5vw, 5.5rem);
    line-height: 0.95;
    letter-spacing: -0.045em;
    color: #f5f1e8;
    text-align: left;
  }

  .story-slider-intro__text-wrap {
    width: min(1500px, 92%);
    margin: 0 auto;
    display: flex;
    justify-content: flex-end;
    padding-top: clamp(5rem, 10vw, 9rem);
    padding-bottom: clamp(1.5rem, 2.8vw, 2.4rem);
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
    font-family: "General Sans", sans-serif;
    font-weight: 300;
    font-size: clamp(1.2rem, 2.25vw, 2.3rem);
    line-height: 1.08;
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

    .story-slider-intro__title {
      font-size: clamp(4rem, 12vw, 8rem);
    }

    .story-slider-intro__card {
      width: min(520px, 100%);
    }
  }

  @media (max-width: 900px) {
    .story-slider-intro {
      grid-template-columns: 1fr;
      min-height: auto;
    }

    .story-slider-intro__title-wrap {
      padding: 1.5rem 1rem 1rem;
    }

    .story-slider-intro__title {
      font-size: clamp(2.4rem, 11vw, 4rem);
    }

    .story-slider-intro__text-wrap {
      width: min(92%, 760px);
      margin: 0 auto;
      display: block;
      padding-top: 1.15rem;
      padding-bottom: 1.2rem;
    }

    .story-slider-intro__card {
      width: 100%;
      padding: 0;
    }

    .story-slider-intro__text {
      font-size: clamp(1.2rem, 5vw, 1.55rem);
      line-height: 1.08;
      max-width: 30ch;
    }
  }

  @media (max-width: 640px) {
    .story-slider-intro__title-wrap {
      padding: 1.3rem 1rem 0.9rem;
    }
  }

  @media (max-width: 420px) {
    .story-slider-intro__title-wrap {
      padding: 1.1rem 1rem 0.85rem;
    }

    .story-slider-intro__card {
      padding: 0;
    }

    .story-slider-intro__text {
      font-size: clamp(1.15rem, 5vw, 1.35rem);
      line-height: 1.08;
    }
  }
</style>