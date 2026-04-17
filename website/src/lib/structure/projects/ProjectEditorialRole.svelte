<script>
  export let title = "";
  export let items = [];
  export let images = [];
</script>

<section class="editorial-role">
  {#if images.length}
    <div class="editorial-role__media-row">
      {#each images as image}
        <figure class="editorial-role__media">
          <img src={image.src} alt={image.alt} loading="lazy" />
        </figure>
      {/each}
    </div>
  {/if}

  <div class="editorial-role__grid">
    <div class="editorial-role__title-wrap">
      <h2>{title}</h2>
    </div>

    <div class="editorial-role__list">
      {#each items as item}
        <article class="editorial-role__item">
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>
      {/each}
    </div>
  </div>
</section>

<style>
  .editorial-role {
    background: #f7f5f1;
    color: #121212;
    padding: 1.25rem 1.25rem 7rem;
  }

  .editorial-role__media-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin-bottom: 1.3rem;
  }

  .editorial-role__media {
    margin: 0;
    overflow: hidden;
    border-radius: 0.35rem;
    aspect-ratio: 1.9;
    background: #d9dfd6;
  }

  .editorial-role__media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .editorial-role__grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
    gap: 1.2rem;
    align-items: start;
  }

  .editorial-role__title-wrap h2 {
    margin: 0;
    font-family: "Titre italic", serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(2rem, 3vw, 3.2rem);
    line-height: 0.95;
    letter-spacing: -0.04em;
  }

  .editorial-role__list {
    border-top: 1px solid rgba(18, 18, 18, 0.1);
  }

  .editorial-role__item {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1fr);
    gap: 1.2rem;
    padding: 1.35rem 0;
    border-bottom: 1px solid rgba(18, 18, 18, 0.1);
  }

  .editorial-role__item h3 {
    margin: 0;
    font-family: "Titre italic", serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(1.3rem, 2vw, 2rem);
    line-height: 1.05;
    letter-spacing: -0.03em;
  }

  .editorial-role__item p {
    margin: 0;
    max-width: 22rem;
    font-family: "General Sans", sans-serif;
    font-size: clamp(0.98rem, 1.1vw, 1.1rem);
    line-height: 1.48;
    color: rgba(18, 18, 18, 0.48);
  }

  @media (max-width: 900px) {
    .editorial-role {
      padding: 0.8rem 0.8rem 4rem;
    }

    .editorial-role__media-row,
    .editorial-role__grid,
    .editorial-role__item {
      grid-template-columns: 1fr;
    }
  }
</style>
