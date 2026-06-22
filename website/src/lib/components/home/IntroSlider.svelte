<script>
  export let main = "Chaque projet,";

  export let muted = "une signature.";
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

  .story-slider-intro__text {
    margin: 0;
    max-width: 22ch;
    font-family: "Inter", sans-serif;
    font-weight: 300;
    font-size: clamp(1.4rem, 2.5vw, 2.8rem);
    line-height: 1.1;
    letter-spacing: -0.015em;
    text-align: left;
  }

  .story-slider-intro__text::before {
    content: "";
    display: block;
    width: 24px;
    height: 1px;
    background: #5768ff;
    margin-bottom: 1.2rem;
  }

  .story-slider-intro__main {
    color: #f5f1e8;
  }

  .story-slider-intro__muted {
    display: block;
    color: rgba(245, 241, 232, 0.35);
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

    .story-slider-intro__text {
      font-size: clamp(1.3rem, 5.5vw, 2.2rem);
      line-height: 1.12;
      max-width: 18ch;
    }
  }

  @media (max-width: 640px) {
    .story-slider-intro__text-wrap {
      padding: 3.5rem 1.1rem 3.5rem;
    }

    .story-slider-intro__card {
      width: min(88vw, 480px);
    }

    .story-slider-intro__text {
      font-size: clamp(1.2rem, 6vw, 2rem);
    }
  }

  @media (max-width: 420px) {
    .story-slider-intro__card {
      width: min(90vw, 18rem);
    }

    .story-slider-intro__text {
      font-size: clamp(1.1rem, 5.8vw, 1.6rem);
    }
  }

</style>
