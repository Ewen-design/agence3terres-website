<script>
  export let text = "";
  export let mutedText = "";
  export let image = "";
  export let alt = "";
  export let accentImage = "/images/moovy2.webp";
  export let accentAlt = "Visuel 3 Terres";
  export let mediaMinHeight = "32rem";
</script>

<section class="about-editorial-single-showcase">
  <figure
    class="about-editorial-single-showcase__media"
    style={`--about-editorial-single-showcase-media-min-height:${mediaMinHeight};`}
  >
    <img src={image} alt={alt} loading="lazy" />
    <div class="about-editorial-single-showcase__gradient" aria-hidden="true"></div>
  </figure>

  <div class="about-editorial-single-showcase__content">
    <div class="about-editorial-single-showcase__scroll-cue" aria-hidden="true">
      <span class="about-editorial-single-showcase__scroll-arrow">↓</span>
    </div>

    <figure class="about-editorial-single-showcase__accent">
      <img src={accentImage} alt={accentAlt} loading="lazy" />
    </figure>

    <p class="about-editorial-single-showcase__text">
      <span>{text}</span>
      {#if mutedText}
        <span class="about-editorial-single-showcase__muted"> {mutedText}</span>
      {/if}
    </p>
  </div>
</section>

<style>
  .about-editorial-single-showcase {
    position: relative;
    width: 100%;
    min-height: max(220vh, var(--about-editorial-single-showcase-media-min-height, 32rem));
    background: #000;
    color: #f5f1e8;
    overflow: clip;
  }

  .about-editorial-single-showcase__media {
    position: absolute;
    inset: 0 0 auto;
    height: 150vh;
    margin: 0;
    overflow: hidden;
    background: #050505;
  }

  .about-editorial-single-showcase__media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .about-editorial-single-showcase__gradient {
    position: absolute;
    inset: auto 0 0;
    height: 56vh;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 0.98) 18%,
      rgba(0, 0, 0, 0.88) 38%,
      rgba(0, 0, 0, 0.62) 62%,
      rgba(0, 0, 0, 0.26) 82%,
      rgba(0, 0, 0, 0) 100%
    );
    pointer-events: none;
  }

  .about-editorial-single-showcase__content {
    position: relative;
    z-index: 1;
    min-height: inherit;
    padding: clamp(1rem, 2vw, 1.8rem);
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(320px, 460px) minmax(0, 1.05fr);
    grid-template-rows: 100vh auto 40vh;
    align-items: start;
    gap: clamp(1.4rem, 4vw, 4.5rem);
  }

  .about-editorial-single-showcase__scroll-cue {
    grid-column: 1;
    grid-row: 1;
    align-self: end;
    justify-self: start;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    gap: 0.45rem;
    color: #fff;
    padding-bottom: max(clamp(2rem, 3.2vw, 2.8rem), calc(var(--safe-bottom-offset) + 1rem));
  }

  .about-editorial-single-showcase__scroll-arrow {
    display: block;
    font-family: "Inter", sans-serif;
    font-size: clamp(1.1rem, 1.1vw, 1.2rem);
    font-weight: 300;
    line-height: 1;
    color: #fff;
  }

  .about-editorial-single-showcase__text {
    margin: 0;
    grid-column: 3;
    grid-row: 2;
    justify-self: start;
    align-self: start;
    max-width: 23ch;
    font-size: clamp(1.3rem, 2.8vw, 2.8rem);
    font-weight: 300;
    line-height: 1.1;
    color: rgba(245, 241, 232, 0.35);
    padding-top: clamp(8rem, 14vh, 12rem);
    margin-left: clamp(-8.75rem, -6.2vw, -4.4rem);
  }

  .about-editorial-single-showcase__text::before {
    content: "";
    display: block;
    width: 24px;
    height: 1px;
    background: #5768ff;
    margin-bottom: 1.2rem;
  }

  .about-editorial-single-showcase__accent {
    grid-column: 2;
    grid-row: 2;
    justify-self: start;
    align-self: start;
    width: min(100%, 460px);
    aspect-ratio: 1.45 / 1;
    overflow: hidden;
    margin: 0;
    background: #0b0b0b;
    margin-top: clamp(31rem, 48vh, 40rem);
    margin-left: clamp(-24rem, -21vw, -12rem);
  }

  .about-editorial-single-showcase__accent img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .about-editorial-single-showcase__muted {
    display: block;
    color: rgba(245, 241, 232, 0.35);
  }

  @media (max-width: 900px) {
    .about-editorial-single-showcase__content {
      grid-template-columns: 1fr;
      grid-template-rows: 100vh auto 34vh;
      padding: 1rem 0.8rem;
      box-sizing: border-box;
    }

    .about-editorial-single-showcase__scroll-cue {
      grid-row: 1;
      padding-bottom: 0;
    }

    .about-editorial-single-showcase__text {
      grid-column: 1;
      grid-row: 2;
      max-width: 15ch;
      justify-self: start;
      font-size: clamp(1.3rem, 6.8vw, 2.7rem);
      padding-inline: var(--project-text-inset, 0);
      line-height: 1.04;
      padding-top: 6rem;
      margin-left: 0;
    }

    .about-editorial-single-showcase__accent {
      grid-column: 1;
      grid-row: 2;
      width: min(78%, 340px);
      justify-self: start;
      margin-top: 18rem;
      margin-left: -0.8rem;
    }
  }

  @media (max-width: 640px) {
    .about-editorial-single-showcase {
      min-height: max(194vh, var(--about-editorial-single-showcase-media-min-height, 32rem));
    }

    .about-editorial-single-showcase__media {
      height: 138vh;
    }

    .about-editorial-single-showcase__gradient {
      height: 52vh;
      background: linear-gradient(
        to top,
        rgba(0, 0, 0, 1) 0%,
        rgba(0, 0, 0, 1) 28%,
        rgba(0, 0, 0, 0.95) 56%,
        rgba(0, 0, 0, 0.6) 80%,
        rgba(0, 0, 0, 0) 100%
      );
    }

    .about-editorial-single-showcase__content {
      grid-template-rows: 100vh auto 32vh;
      gap: 0;
      padding: 1rem 0.8rem 0;
    }

    .about-editorial-single-showcase__scroll-cue {
      padding-bottom: max(7rem, calc(var(--safe-bottom-offset) + 5rem));
    }

    .about-editorial-single-showcase__text {
      grid-row: 2;
      align-self: start;
      max-width: 14ch;
      font-size: clamp(1.2rem, 6.9vw, 2.15rem);
      line-height: 1.04;
      padding-inline: var(--project-text-inset, 0);
      padding-top: 0;
      padding-bottom: 0;
      margin-top: -2vh;
      margin-left: 0;
      position: relative;
      z-index: 2;
    }

    .about-editorial-single-showcase__accent {
      grid-row: 3;
      width: min(72%, 300px);
      justify-self: end;
      margin-top: -4.5rem;
      margin-left: 0;
      margin-right: -0.8rem;
    }
  }
</style>
