<script>
  export let title = "";
  export let text = "";
  export let image = "";
  export let alt = "";
  export let reverse = false;
</script>

<section class="editorial-split" class:editorial-split--reverse={reverse}>
  <div class="editorial-split__copy">
    <h2>{title}</h2>
    <p>{text}</p>
  </div>

  <figure class="editorial-split__media">
    <img src={image} alt={alt} loading="lazy" />
  </figure>
</section>

<style>
  .editorial-split {
    display: grid;
    grid-template-columns: minmax(0, 0.92fr) minmax(0, 1fr);
    gap: 2rem;
    align-items: start;
    padding: 0 1.25rem 7rem;
    background: #f7f5f1;
    color: #121212;
  }

  .editorial-split--reverse .editorial-split__copy {
    order: 2;
  }

  .editorial-split--reverse .editorial-split__media {
    order: 1;
  }

  .editorial-split__copy {
    max-width: 31rem;
  }

  .editorial-split__copy h2 {
    margin: 0;
    font-family: "Titre italic", serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(1.7rem, 2.2vw, 2.5rem);
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .editorial-split__copy p {
    margin: 1rem 0 0;
    max-width: 26rem;
    font-family: "General Sans", sans-serif;
    font-size: clamp(0.98rem, 1.05vw, 1.06rem);
    line-height: 1.5;
    color: rgba(18, 18, 18, 0.5);
  }

  .editorial-split__media {
    margin: 0;
    overflow: hidden;
    border-radius: 0.35rem;
    min-height: 38rem;
    background: #ded8cf;
  }

  .editorial-split__media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  @media (max-width: 900px) {
    .editorial-split {
      grid-template-columns: 1fr;
      gap: 1.2rem;
      padding: 0 0.8rem 4rem;
    }

    .editorial-split__media {
      min-height: 22rem;
    }
  }
</style>
