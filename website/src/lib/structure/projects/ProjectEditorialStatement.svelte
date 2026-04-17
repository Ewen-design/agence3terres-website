<script>
  export let eyebrow = "";
  export let text = "";
</script>

<section class="editorial-statement">
  <div class="editorial-statement__eyebrow">{eyebrow}</div>
  <div class="editorial-statement__body">
    <p>{text}</p>
  </div>
</section>

<style>
  .editorial-statement {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
    gap: 2rem;
    align-items: start;
    padding: 0 1.25rem 7rem;
    background: #f7f5f1;
    color: #121212;
  }

  .editorial-statement__eyebrow {
    font-family: "Titre italic", serif;
    font-style: italic;
    font-size: clamp(1.4rem, 1.8vw, 2rem);
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .editorial-statement__body {
    display: flex;
    justify-content: flex-end;
  }

  .editorial-statement__body p {
    margin: 0;
    max-width: 21ch;
    font-family: "General Sans", sans-serif;
    font-weight: 300;
    font-size: clamp(1.3rem, 2.8vw, 2.8rem);
    line-height: 1;
    letter-spacing: -0.05em;
  }

  @media (max-width: 900px) {
    .editorial-statement {
      grid-template-columns: 1fr;
      gap: 1rem;
      padding: 0 0.8rem 4rem;
    }

    .editorial-statement__body {
      justify-content: flex-start;
    }

    .editorial-statement__body p {
      max-width: 14ch;
      font-size: clamp(1.6rem, 9vw, 2.8rem);
    }
  }
</style>
