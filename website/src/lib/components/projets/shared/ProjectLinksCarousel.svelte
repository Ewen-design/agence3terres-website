<script>
  import { navigate } from "$lib/navigate.js";

  export let title = "";
  export let text = "";
  export let href = "/";
  export let label = "Voir le projet";
</script>

<section class="project-next-link">
  <div class="project-next-link__intro">
    {#if title}
      <h2>{title}</h2>
    {/if}

    <div class="project-next-link__body">
      {#if text}
        <p>{text}</p>
      {/if}

      <button type="button" class="project-next-link__button" on:click={() => navigate(href)}>
        {label}
      </button>
    </div>
  </div>
</section>

<style>
  .project-next-link {
    padding: 0 1.25rem 7rem;
    background: #f7f5f1;
    color: #121212;
  }

  .project-next-link__intro {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
    gap: 2rem;
    align-items: start;
  }

  .project-next-link__intro h2 {
    margin: 0;
    font-family: "Clash Display", sans-serif;
    font-size: clamp(1.4rem, 1.8vw, 2rem);
    line-height: 1;
    letter-spacing: -0.02em;
    font-weight: 400;
  }

  .project-next-link__body {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1.4rem;
  }

  .project-next-link__body p {
    margin: 0;
    max-width: 21ch;
    font-family: "Clash Display", sans-serif;
    font-weight: 300;
    font-size: clamp(1.3rem, 2.8vw, 2.8rem);
    line-height: 1;
    letter-spacing: -0.05em;
    text-align: right;
  }

  .project-next-link__button {
    appearance: none;
    border: 1px solid rgba(18, 18, 18, 0.18);
    background: transparent;
    color: #121212;
    padding: 0.95rem 1.35rem;
    font-family: "Clash Display", sans-serif;
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    transition:
      background-color 0.25s ease,
      color 0.25s ease,
      border-color 0.25s ease,
      transform 0.25s ease;
  }

  .project-next-link__button:hover,
  .project-next-link__button:focus-visible {
    background: #121212;
    color: #f7f5f1;
    border-color: #121212;
    transform: translateY(-1px);
  }

  @media (max-width: 900px) {
    .project-next-link {
      padding: 0 0.8rem 4rem;
    }

    .project-next-link__intro {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .project-next-link__body {
      align-items: flex-start;
    }

    .project-next-link__body p {
      max-width: 14ch;
      font-size: clamp(1.6rem, 9vw, 2.8rem);
      text-align: left;
    }
  }
</style>
