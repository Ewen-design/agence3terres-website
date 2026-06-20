<script>
  export let title = "";
  export let text = "";
</script>

<section class="project-text-block">
  <div class="project-text-block__title-wrap">
    <h2>{title}</h2>
  </div>

  <div class="project-text-block__content">
    <p>{text}</p>
  </div>
</section>

<style>
  .project-text-block {
    display: grid;
    grid-template-columns: 50% 50%;
    gap: clamp(2rem, 5vw, 6rem);
    padding: clamp(5rem, 9vw, 8rem) clamp(1.2rem, 3vw, 2.2rem);
    background: #050505;
    color: #f5f1e8;
  }

  .project-text-block__title-wrap h2 {
    margin: 0;
    max-width: 8ch;
    font-family: "Inter", sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: clamp(2.8rem, 5vw, 5.2rem);
    line-height: 0.92;
    letter-spacing: -0.06em;
  }

  .project-text-block__content {
    display: flex;
    justify-content: flex-end;
  }

  .project-text-block__content p {
    margin: 0;
    max-width: 20ch;
    font-family: "Inter", sans-serif;
    font-size: clamp(1.08rem, 1.5vw, 1.3rem);
    line-height: 1.5;
    color: rgba(245, 241, 232, 0.8);
  }

  @media (max-width: 900px) {
    .project-text-block {
      grid-template-columns: 1fr;
      gap: 1.2rem;
      padding: 3.4rem 1rem;
    }

    .project-text-block__title-wrap h2 {
      font-size: clamp(2.3rem, 12vw, 4rem);
    }

    .project-text-block__content {
      justify-content: flex-start;
    }

    .project-text-block__content p {
      font-size: 1rem;
      max-width: 24ch;
    }
  }
</style>
