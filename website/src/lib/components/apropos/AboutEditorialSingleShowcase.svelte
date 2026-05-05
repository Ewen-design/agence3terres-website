<script>
  export let text = "";
  export let image = "";
  export let alt = "";
  export let mediaMinHeight = "32rem";
</script>

<section class="about-editorial-single-showcase">
  <div class="about-editorial-single-showcase__media-grid">
    <figure
      class="about-editorial-single-showcase__media"
      style={`--about-editorial-single-showcase-media-min-height:${mediaMinHeight};`}
    >
      <img src={image} alt={alt} loading="lazy" />
    </figure>
  </div>

  <div class="about-editorial-single-showcase__text-grid">
    <p>{text}</p>
  </div>
</section>

<style>
  .about-editorial-single-showcase {
    background: #000;
    color: #f5f1e8;
    padding: 0 var(--project-side-padding, 1.25rem) 6.5rem;
  }

  .about-editorial-single-showcase__media-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .about-editorial-single-showcase__media {
    grid-column: 1 / -1;
    margin: 4rem 0 0;
    height: var(--about-editorial-single-showcase-media-min-height, 32rem);
    overflow: hidden;
    border-radius: 0.35rem;
    background: #050505;
  }

  .about-editorial-single-showcase__media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .about-editorial-single-showcase__text-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    align-items: start;
    padding-top: 1.35rem;
  }

  .about-editorial-single-showcase__text-grid p {
    margin: 0;
    grid-column: 2;
    max-width: 22ch;
    font-family: "Clash Display", sans-serif;
    font-weight: 300;
    font-size: var(--project-lead-size, clamp(1.35rem, 2.7vw, 2.8rem));
    line-height: 0.98;
  }

  @media (max-width: 900px) {
    .about-editorial-single-showcase {
      padding: 0 var(--project-side-padding, 0.8rem) 4rem;
    }

    .about-editorial-single-showcase__media-grid,
    .about-editorial-single-showcase__text-grid {
      grid-template-columns: 1fr;
    }

    .about-editorial-single-showcase__media {
      height: auto;
      min-height: auto;
      margin-top: 1.85rem;
      aspect-ratio: 0.86;
    }

    .about-editorial-single-showcase__text-grid {
      padding-top: 1.15rem;
    }

    .about-editorial-single-showcase__text-grid p {
      max-width: 12ch;
      grid-column: auto;
      font-size: clamp(1.7rem, 8.5vw, 2.55rem);
      padding-inline: var(--project-text-inset, 0);
    }
  }
</style>
