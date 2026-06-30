<script>
  import { reveal } from "$lib/actions/reveal.js";

  // Bloc éditorial asymétrique : grande image + média secondaire + légende.
  export let intro = "";
  export let image = "";
  export let alt = "";
  export let secondaryImage = "";
  export let secondaryAlt = "";
  export let label = "";
  export let text = "";
  export let reverse = false;
</script>

<section class="ef" class:ef--reverse={reverse}>
  <div class="ef-inner">
    {#if intro}
      <p class="ef-intro" use:reveal>{intro}</p>
    {/if}

    <div class="ef-grid">
      <figure class="ef-main" use:reveal>
        <img src={image} {alt} loading="lazy" decoding="async" />
      </figure>

      <div class="ef-side">
        {#if secondaryImage}
          <figure class="ef-second" use:reveal={{ delay: 90 }}>
            <img src={secondaryImage} alt={secondaryAlt} loading="lazy" decoding="async" />
          </figure>
        {/if}
        <div class="ef-copy" use:reveal={{ delay: 150 }}>
          {#if label}<span class="ef-label">{label}</span>{/if}
          {#if text}<p class="ef-text">{text}</p>{/if}
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .ef {
    background: transparent;
    padding: clamp(2.5rem, 5vw, 5rem) 0;
  }

  .ef-inner {
    width: min(1400px, 92%);
    margin: 0 auto;
  }

  .ef-intro {
    margin: 0 0 clamp(2.4rem, 4.5vw, 4rem);
    max-width: 56ch;
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: clamp(1.05rem, 1.4vw, 1.3rem);
    line-height: 1.5;
    color: var(--project-surface-muted, rgba(244, 239, 230, 0.7));
    transition:
      opacity 0.6s ease,
      filter 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      color var(--project-theme-transition, 920ms cubic-bezier(0.16, 1, 0.3, 1));
    transition-delay: var(--reveal-delay, 0ms);
  }

  .ef-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
    gap: clamp(1.2rem, 2.4vw, 2.4rem);
    align-items: start;
  }

  .ef--reverse .ef-main { order: 2; }
  .ef--reverse .ef-side { order: 1; }

  .ef-main {
    margin: 0;
    aspect-ratio: 3 / 4;
    border-radius: 16px;
    overflow: hidden;
    background: var(--project-surface-card, #121212);
    transition:
      opacity 0.6s ease,
      filter 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      background-color var(--project-theme-transition, 920ms cubic-bezier(0.16, 1, 0.3, 1));
    transition-delay: var(--reveal-delay, 0ms);
  }

  .ef-main img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform: scale(1.05);
    transition: transform 1.2s cubic-bezier(0.22, 0.61, 0.36, 1);
    will-change: transform;
  }
  .ef-main:global(.is-revealed) img { transform: scale(1); }

  .ef-side {
    display: flex;
    flex-direction: column;
    gap: clamp(1.4rem, 2.6vw, 2.4rem);
  }

  .ef-second {
    margin: 0;
    aspect-ratio: 4 / 3;
    border-radius: 14px;
    overflow: hidden;
    background: var(--project-surface-card, #121212);
    transition:
      opacity 0.6s ease,
      filter 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      background-color var(--project-theme-transition, 920ms cubic-bezier(0.16, 1, 0.3, 1));
    transition-delay: var(--reveal-delay, 0ms);
  }

  .ef-second img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform: scale(1.05);
    transition: transform 1.2s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .ef-second:global(.is-revealed) img { transform: scale(1); }

  .ef-copy {
    max-width: 40ch;
  }

  .ef-label {
    display: block;
    margin-bottom: 0.7rem;
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: clamp(1.1rem, 1.5vw, 1.4rem);
    letter-spacing: -0.02em;
    color: var(--project-surface-ink, #f4efe6);
    transition: color var(--project-theme-transition, 920ms cubic-bezier(0.16, 1, 0.3, 1));
  }

  .ef-text {
    margin: 0;
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: clamp(1.05rem, 1.4vw, 1.3rem);
    line-height: 1.5;
    color: var(--project-surface-muted, rgba(244, 239, 230, 0.7));
    text-wrap: pretty;
    transition: color var(--project-theme-transition, 920ms cubic-bezier(0.16, 1, 0.3, 1));
  }

  @media (max-width: 900px) {
    .ef-grid {
      grid-template-columns: 1fr;
    }
    .ef--reverse .ef-main,
    .ef--reverse .ef-side { order: 0; }
    .ef-side { padding-top: 0; }
    .ef-main { aspect-ratio: 4 / 5; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ef-main img,
    .ef-second img {
      transition: none;
      transform: none;
    }
  }
</style>
