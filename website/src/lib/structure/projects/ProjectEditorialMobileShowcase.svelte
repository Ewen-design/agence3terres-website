<script>
  export let eyebrow = "";
  export let text = "";
  export let leftImage = "";
  export let leftAlt = "";
  export let rightImage = "";
  export let rightAlt = "";
  export let reverse = false;
</script>

<section class="editorial-mobile-showcase" class:editorial-mobile-showcase--reverse={reverse}>
  <div class="editorial-mobile-showcase__media-grid">
    <figure class="editorial-mobile-showcase__media editorial-mobile-showcase__media--dark">
      <img src={leftImage} alt={leftAlt} loading="lazy" />
    </figure>

    <figure class="editorial-mobile-showcase__media">
      <img src={rightImage} alt={rightAlt} loading="lazy" />
    </figure>
  </div>

  <div class="editorial-mobile-showcase__text-grid">
    <div class="editorial-mobile-showcase__eyebrow">{eyebrow}</div>
    <p>{text}</p>
  </div>
</section>

<style>
  .editorial-mobile-showcase {
    background: #f7f5f1;
    color: #121212;
  
    padding: 0 1.25rem 7rem;
  }

  .editorial-mobile-showcase__media-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .editorial-mobile-showcase__media {
    margin: 4rem 0 0;
    overflow: hidden;
    border-radius: 0.35rem;
    min-height: 32rem;
    background: #efe9df;
  }

  .editorial-mobile-showcase__media--dark {
    background: #040404;
  }

  .editorial-mobile-showcase__media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .editorial-mobile-showcase__text-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
    gap: 2rem;
    align-items: start;
    padding-top: 1rem;
  }

  .editorial-mobile-showcase__eyebrow {
    font-family: "Titre italic", serif;
    font-style: italic;
    font-size: clamp(1.4rem, 1.8vw, 2rem);
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .editorial-mobile-showcase__text-grid p {
    margin: 0;
    max-width: 23ch;
    font-family: "General Sans", sans-serif;
    font-weight: 300;
    font-size: clamp(1.3rem, 2.8vw, 2.8rem);
    line-height: 1;
    letter-spacing: -0.05em;
  }

  .editorial-mobile-showcase--reverse .editorial-mobile-showcase__media-grid figure:first-child {
    order: 2;
  }

  .editorial-mobile-showcase--reverse .editorial-mobile-showcase__media-grid figure:last-child {
    order: 1;
  }

  @media (max-width: 900px) {
    .editorial-mobile-showcase {
      padding: 0 0.8rem 4rem;
    }

    .editorial-mobile-showcase__media-grid,
    .editorial-mobile-showcase__text-grid {
      grid-template-columns: 1fr;
    }

    .editorial-mobile-showcase__media {
      min-height: 20rem;
    }

    .editorial-mobile-showcase__text-grid p {
      max-width: 14ch;
      font-size: clamp(1.6rem, 9vw, 2.8rem);
    }
  }
</style>
