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
    background: transparent;
    color: var(--project-surface-ink, #121212);
    padding: 1.25rem var(--project-side-padding, 1.25rem) 6.5rem;
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
    border-radius: 3px;
    aspect-ratio: 1.55;
    background: var(--project-surface-card, #d9dfd6);
  }

  .editorial-role__media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .editorial-role__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    align-items: start;
  }

  .editorial-role__title-wrap h2 {
    margin: 0;
    padding-inline: var(--project-text-inset, 0);
    font-family: "Inter", sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: var(--project-display-size, clamp(2.1rem, 3vw, 3.45rem));
    line-height: 0.94;
    letter-spacing: -0.04em;
  }

  .editorial-role__list {
    padding-right: clamp(1.4rem, 4vw, 4.5rem);
    border-top: 1px solid var(--project-surface-border, rgba(18, 18, 18, 0.1));
  }

  .editorial-role__item {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1fr);
    gap: 1.4rem;
    padding: 1.35rem 0;
    border-bottom: 1px solid var(--project-surface-border, rgba(18, 18, 18, 0.1));
  }

  .editorial-role__item h3 {
    margin: 0;
    font-family: "Inter", sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: var(--project-subtitle-size, clamp(1.3rem, 1.9vw, 2rem));
    line-height: 1.04;
    letter-spacing: -0.03em;
  }

  .editorial-role__item p {
    margin: 0;
    max-width: 22rem;
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: var(--project-body-size, clamp(0.98rem, 1.04vw, 1.08rem));
    line-height: var(--project-body-line-height, 1.52);
    color: var(--project-surface-muted, rgba(18, 18, 18, 0.48));
  }

  @media (max-width: 900px) {
    .editorial-role {
      padding: 0.9rem var(--project-side-padding, 0.8rem) 4rem;
    }

    .editorial-role__media-row,
    .editorial-role__grid,
    .editorial-role__item {
      grid-template-columns: 1fr;
    }

    .editorial-role__list,
    .editorial-role__title-wrap h2 {
      padding-inline: var(--project-text-inset, 0);
    }

    .editorial-role__list {
      padding-right: var(--project-text-inset, 0);
    }

    .editorial-role__media-row {
      gap: 0.7rem;
      margin-bottom: 1rem;
    }

    .editorial-role__media:nth-child(1) {
      aspect-ratio: 0.88;
    }

    .editorial-role__media:nth-child(2) {
      aspect-ratio: 0.74;
    }

    .editorial-role__title-wrap h2 {
      max-width: 8ch;
    }

    .editorial-role__item {
      gap: 0.7rem;
    }
  }
</style>
