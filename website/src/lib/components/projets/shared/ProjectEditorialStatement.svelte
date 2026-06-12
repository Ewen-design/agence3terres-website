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
    padding: 0 var(--project-side-padding, 1.25rem) 6.5rem;
    background: transparent;
    color: var(--project-surface-ink, #121212);
  }

  .editorial-statement__eyebrow {
    padding-inline: var(--project-text-inset, 0);
    font-family: "Clash Display", sans-serif;
    font-style: normal;
    font-size: var(--project-overline-size, clamp(1.08rem, 1.45vw, 1.5rem));
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .editorial-statement__body {
    display: flex;
    justify-content: flex-start;
  }

  .editorial-statement__body p {
    margin: 0;
    max-width: 21ch;
    font-family: "Clash Display", sans-serif;
    font-weight: 300;
    font-size: var(--project-lead-size, clamp(1.35rem, 2.7vw, 2.8rem));
    line-height: 0.98;
    letter-spacing: -0.05em;
  }

  @media (max-width: 900px) {
    .editorial-statement {
      grid-template-columns: 1fr;
      gap: 1rem;
      padding: 0 var(--project-side-padding, 0.8rem) 4rem;
    }

    .editorial-statement__body {
      justify-content: flex-start;
    }

    .editorial-statement__body p {
      max-width: 12ch;
      padding-inline: var(--project-text-inset, 0);
      font-size: clamp(1.7rem, 8.5vw, 2.55rem);
    }
  }
</style>
