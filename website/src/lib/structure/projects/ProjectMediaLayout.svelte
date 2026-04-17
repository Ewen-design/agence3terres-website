<script>
  export let title = "";
  export let text = "";
  export let images = [];
</script>

<section class="project-media-layout">
  {#if title || text}
    <div class="project-media-layout__head">
      {#if title}
        <h2>{title}</h2>
      {/if}
      {#if text}
        <p>{text}</p>
      {/if}
    </div>
  {/if}

  <div class="project-media-layout__grid">
    {#each images as image}
      <figure class={`project-media-layout__item project-media-layout__item--${image.layout || "square"}`}>
        <img src={image.src} alt={image.alt} loading="lazy" />
      </figure>
    {/each}
  </div>
</section>

<style>
  .project-media-layout {
    display: grid;
    gap: clamp(2rem, 4vw, 3rem);
    padding: clamp(3rem, 7vw, 5rem) clamp(0.5rem, 1vw, 0.5rem) clamp(5rem, 9vw, 8rem);
    background: #050505;
  }

  .project-media-layout__head {
    display: grid;
    gap: 0.8rem;
    padding: 0 clamp(1rem, 2.5vw, 1.8rem);
    max-width: 26rem;
  }

  .project-media-layout__head h2 {
    margin: 0;
    font-family: "Titre italic", serif;
    font-style: italic;
    font-size: clamp(2rem, 4vw, 3.8rem);
    line-height: 0.92;
    letter-spacing: -0.05em;
    color: #f5f1e8;
  }

  .project-media-layout__head p {
    margin: 0;
    max-width: 22ch;
    font-family: "General Sans", sans-serif;
    font-size: clamp(0.98rem, 1.2vw, 1.05rem);
    line-height: 1.55;
    color: rgba(245, 241, 232, 0.72);
  }

  .project-media-layout__grid {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: clamp(0.45rem, 0.9vw, 0.7rem);
    align-items: start;
  }

  .project-media-layout__item {
    margin: 0;
    overflow: hidden;
    border-radius: clamp(1rem, 2vw, 1.9rem);
    background: #0a0a0a;
  }

  .project-media-layout__item img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    transition: transform 1.4s cubic-bezier(.22, .61, .36, 1);
  }

  .project-media-layout__item:hover img {
    transform: scale(1.025);
  }

  .project-media-layout__item--panorama {
    grid-column: 1 / -1;
    aspect-ratio: 2.55;
  }

  .project-media-layout__item--wide {
    grid-column: span 8;
    aspect-ratio: 1.52;
  }

  .project-media-layout__item--portrait {
    grid-column: span 4;
    aspect-ratio: 0.76;
  }

  .project-media-layout__item--square {
    grid-column: span 6;
    aspect-ratio: 1.05;
  }

  .project-media-layout__item--full {
    grid-column: 1 / -1;
    aspect-ratio: 2.12;
  }

  @media (max-width: 900px) {
    .project-media-layout {
      padding-top: 1.6rem;
      padding-left: 0.25rem;
      padding-right: 0.25rem;
      gap: 1.2rem;
    }

    .project-media-layout__head {
      padding: 0 0.75rem;
    }

    .project-media-layout__grid {
      grid-template-columns: 1fr;
    }

    .project-media-layout__item--panorama,
    .project-media-layout__item--wide,
    .project-media-layout__item--portrait,
    .project-media-layout__item--square,
    .project-media-layout__item--full {
      grid-column: auto;
      aspect-ratio: auto;
      min-height: 16rem;
    }
  }
</style>
