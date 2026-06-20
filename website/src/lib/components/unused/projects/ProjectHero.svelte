<script>
  export let title = "";
  export let category = "";
  export let year = "";
  export let summaryMain = "";
  export let summaryMuted = "";
  export let image = "";
  export let alt = "";
  export let meta = [];
</script>

<section class="project-hero">
  <div class="project-hero__media">
    <img class="project-hero__image" src={image} alt={alt} />
    <div class="project-hero__shade"></div>

    <div class="project-hero__headline">
      <div class="project-hero__topline">
        <span>{category}</span>
        <span>{year}</span>
      </div>

      <h1>{title}</h1>

      {#if meta.length}
        <div class="project-hero__meta">
          {#each meta as item}
            <span>{item}</span>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <div class="project-hero__after">
    <div class="project-hero__after-title-wrap">
      <h2>{title}</h2>
    </div>

    <div class="project-hero__after-text-wrap">
      <p class="project-hero__after-text">
        <span class="project-hero__after-main">{summaryMain}</span>
        {#if summaryMuted}
          <span class="project-hero__after-muted"> {summaryMuted}</span>
        {/if}
      </p>
    </div>
  </div>
</section>

<style>
  .project-hero {
    background: #050505;
  }

  .project-hero__media {
    position: relative;
    min-height: 100vh;
    min-height: 100svh;
    overflow: hidden;
  }

  .project-hero__image,
  .project-hero__shade {
    position: absolute;
    inset: 0;
  }

  .project-hero__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .project-hero__shade {
    background:
      linear-gradient(180deg, rgba(0, 0, 0, 0.06) 0%, rgba(0, 0, 0, 0.04) 28%, rgba(0, 0, 0, 0.42) 100%),
      linear-gradient(90deg, rgba(0, 0, 0, 0.18) 0%, rgba(0, 0, 0, 0.04) 42%, rgba(0, 0, 0, 0.16) 100%);
  }

  .project-hero__headline {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    min-height: 100svh;
    display: grid;
    align-content: space-between;
    padding: clamp(6rem, 8vw, 7.8rem) clamp(1.2rem, 3vw, 2.2rem) clamp(1.5rem, 3vw, 2rem);
  }

  .project-hero__topline {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-family: "Inter", sans-serif;
    font-size: 0.86rem;
    color: rgba(245, 241, 232, 0.88);
  }

  .project-hero__headline h1 {
    margin: 0;
    max-width: 10ch;
    font-family: "Inter", sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: clamp(4.3rem, 8.6vw, 9rem);
    line-height: 0.88;
    letter-spacing: -0.07em;
    color: #f5f1e8;
  }

  .project-hero__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
    align-self: end;
  }

  .project-hero__meta span {
    padding: 0.52rem 0.82rem;
    border: 1px solid rgba(245, 241, 232, 0.14);
    border-radius: 999px;
    font-family: "Inter", sans-serif;
    font-size: 0.8rem;
    color: rgba(245, 241, 232, 0.82);
    background: rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .project-hero__after {
    display: grid;
    grid-template-columns: 52% 48%;
    align-items: start;
    padding: clamp(2.4rem, 4vw, 3.4rem) 0 clamp(5rem, 9vw, 8rem);
  }

  .project-hero__after-title-wrap {
    padding: 0 clamp(1.2rem, 3vw, 2.2rem);
  }

  .project-hero__after-title-wrap h2 {
    margin: 0;
    font-family: "Inter", sans-serif;
    font-style: normal;
    font-weight: 500;
    font-size: clamp(2.8rem, 5vw, 5.6rem);
    line-height: 0.94;
    letter-spacing: -0.05em;
    color: #f5f1e8;
  }

  .project-hero__after-text-wrap {
    width: min(92%, 48rem);
    margin: 0 auto;
    display: flex;
    justify-content: flex-end;
    padding-top: clamp(4rem, 7vw, 7rem);
  }

  .project-hero__after-text {
    margin: 0;
    max-width: 26ch;
    font-family: "Inter", sans-serif;
    font-weight: 300;
    font-size: clamp(1.25rem, 2.25vw, 2.35rem);
    line-height: 1.06;
    letter-spacing: -0.025em;
  }

  .project-hero__after-main {
    color: #f5f1e8;
  }

  .project-hero__after-muted {
    color: rgba(245, 241, 232, 0.42);
  }

  @media (max-width: 900px) {
    .project-hero__headline {
      padding: 6rem 1rem 1.2rem;
    }

    .project-hero__headline h1 {
      font-size: clamp(3.2rem, 16vw, 5.2rem);
    }

    .project-hero__topline {
      font-size: 0.8rem;
    }

    .project-hero__after {
      grid-template-columns: 1fr;
      padding-top: 1.5rem;
      padding-bottom: 3.6rem;
    }

    .project-hero__after-title-wrap {
      padding: 0 1rem;
    }

    .project-hero__after-title-wrap h2 {
      font-size: clamp(2.4rem, 11vw, 4rem);
    }

    .project-hero__after-text-wrap {
      width: min(92%, 760px);
      justify-content: flex-start;
      padding-top: 1.2rem;
    }

    .project-hero__after-text {
      font-size: clamp(1.16rem, 5vw, 1.55rem);
      line-height: 1.08;
      max-width: 24ch;
    }
  }
</style>
