<script>
  export let topImage = "";
  export let topAlt = "";
  export let bottomLeftImage = "";
  export let bottomLeftAlt = "";
  export let bottomRightImage = "";
  export let bottomRightAlt = "";
</script>

<section class="project-editorial-triptych">
  <div class="project-editorial-triptych__grid">
    <figure class="project-editorial-triptych__item project-editorial-triptych__item--top">
      <img src={topImage} alt={topAlt} loading="lazy" />
    </figure>

    <figure class="project-editorial-triptych__item project-editorial-triptych__item--bottom">
      <img src={bottomLeftImage} alt={bottomLeftAlt} loading="lazy" />
    </figure>

    <figure class="project-editorial-triptych__item project-editorial-triptych__item--bottom">
      <img src={bottomRightImage} alt={bottomRightAlt} loading="lazy" />
    </figure>
  </div>
</section>

<style>
  .project-editorial-triptych {
    padding: 1.1rem 0.45rem 7rem;
    background: #f7f5f1;
  }

  .project-editorial-triptych__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.45rem;
  }

  .project-editorial-triptych__item {
    margin: 0;
    overflow: hidden;
    border-radius: 4px;
    background: #ebe5da;
  }

  .project-editorial-triptych__item img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .project-editorial-triptych__item--top {
    grid-column: 1 / -1;
    aspect-ratio: 2.66;
  }

  .project-editorial-triptych__item--bottom {
    aspect-ratio: 1.28;
  }

  @media (max-width: 900px) {
    .project-editorial-triptych {
      padding: 0.8rem 0.35rem 4rem;
    }

    .project-editorial-triptych__grid {
      grid-template-columns: 1fr;
      gap: 0.35rem;
    }

    .project-editorial-triptych__item {
      border-radius: 4px;
    }

    .project-editorial-triptych__item--top,
    .project-editorial-triptych__item--bottom {
      grid-column: auto;
      aspect-ratio: 1.18;
    }
  }
</style>
