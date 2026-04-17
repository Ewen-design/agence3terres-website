<script>
  export let title = "";
  export let main = "";
  export let muted = "";
  export let meta = [];
</script>

<section class="project-intro">
  <div class="project-intro__title-wrap">
    <h2 class="project-intro__title">{title}</h2>
  </div>

  <div class="project-intro__text-wrap">
    <div class="project-intro__copy">
      <p class="project-intro__text">
        <span class="project-intro__main">{main}</span>
        {#if muted}
          <span class="project-intro__muted"> {muted}</span>
        {/if}
      </p>

      {#if meta.length}
        <div class="project-intro__meta">
          {#each meta as item}
            <div class="project-intro__meta-item">
              <span class="project-intro__meta-label">{item.label}</span>
              <span class="project-intro__meta-value">{item.value}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</section>

<style>
  .project-intro {
    display: grid;
    grid-template-columns: 52% 48%;
    align-items: start;
    background: #000;
    padding: 0;
  }

  .project-intro__title-wrap {
    padding: clamp(2rem, 4vw, 4rem) clamp(1.2rem, 3vw, 3rem) clamp(1rem, 2vw, 1.8rem);
  }

  .project-intro__title {
    margin: 0;
    font-family: "Titre italic", serif;
    font-style: italic;
    font-weight: 100;
    font-size: clamp(2.5rem, 4.4vw, 4.9rem);
    line-height: 0.96;
    letter-spacing: -0.05em;
    color: #f5f1e8;
    max-width: 9ch;
  }

  .project-intro__text-wrap {
    width: min(1500px, 92%);
    margin: 0 auto;
    display: flex;
    justify-content: flex-end;
    padding-top: clamp(6rem, 11vw, 10rem);
    padding-bottom: clamp(3rem, 5vw, 4rem);
  }

  .project-intro__copy {
    width: min(520px, 100%);
  }

  .project-intro__text {
    margin: 0;
    max-width: 28ch;
    font-family: "General Sans", sans-serif;
    font-weight: 300;
    font-size: clamp(1.15rem, 2vw, 1.9rem);
    line-height: 1.14;
    letter-spacing: -0.02em;
    color: rgba(157, 156, 156, 1);
  }

  .project-intro__main {
    color: #f5f1e8;
  }

  .project-intro__muted {
    color: rgb(157, 156, 156);
  }

  .project-intro__meta {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem;
    margin-top: 2.4rem;
    padding-top: 1.25rem;
    border-top: 1px solid rgba(245, 241, 232, 0.12);
  }

  .project-intro__meta-item {
    display: grid;
    gap: 0.4rem;
  }

  .project-intro__meta-label {
    font-family: "General Sans", sans-serif;
    font-size: 0.88rem;
    line-height: 1.4;
    color: rgba(245, 241, 232, 0.46);
  }

  .project-intro__meta-value {
    font-family: "General Sans", sans-serif;
    font-size: 1rem;
    line-height: 1.55;
    color: rgba(245, 241, 232, 0.84);
  }

  @media (max-width: 900px) {
    .project-intro {
      grid-template-columns: 1fr;
    }

    .project-intro__title-wrap {
      padding: 1.4rem 1rem 0.8rem;
    }

    .project-intro__title {
      font-size: clamp(2.6rem, 12vw, 4.5rem);
    }

    .project-intro__text-wrap {
      width: min(92%, 760px);
      padding-top: 1.2rem;
      padding-bottom: 1.4rem;
      justify-content: flex-start;
    }

    .project-intro__copy {
      width: 100%;
    }

    .project-intro__text {
      max-width: 30ch;
      font-size: clamp(1.12rem, 5vw, 1.55rem);
    }

    .project-intro__meta {
      grid-template-columns: 1fr;
      gap: 0.9rem;
    }
  }
</style>
