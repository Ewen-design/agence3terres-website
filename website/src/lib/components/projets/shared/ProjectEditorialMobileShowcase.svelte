<script>
  import { revealBlock as reveal } from "$lib/actions/reveal.js";
  import AutoVideo from "$lib/components/shared/media/AutoVideo.svelte";

  export let text = "";
  export let leftImage = "";
  export let leftAlt = "";
  export let rightImage = "";
  export let rightAlt = "";
  /**
   * Renseigner `*Video` remplace l'image du côté correspondant.
   * Format : liste `[{ src, type }]` — voir `videoSources.js`.
   */
  export let leftVideo = [];
  export let leftPoster = "";
  export let rightVideo = [];
  export let rightPoster = "";
  export let reverse = false;
  export let mediaMinHeight = "32rem";
  /**
   * Cadre du média visible sur mobile (celui de droite y est masqué). Par
   * défaut 0.86 (portrait) : à renseigner avec le format réel du média pour le
   * montrer entier plutôt que recadré.
   */
  export let mediaMobileAspectRatio = "";
</script>

<section class="editorial-mobile-showcase" class:editorial-mobile-showcase--reverse={reverse}>
  <div class="editorial-mobile-showcase__media-grid">
    <figure
      class="editorial-mobile-showcase__media editorial-mobile-showcase__media--dark"
      style={`--editorial-mobile-showcase-media-min-height:${mediaMinHeight};${mediaMobileAspectRatio ? `--editorial-mobile-showcase-media-aspect-mobile:${mediaMobileAspectRatio};` : ""}`}
      use:reveal
    >
      {#if leftVideo.length}
        <AutoVideo sources={leftVideo} poster={leftPoster} label={leftAlt} />
      {:else}
        <img src={leftImage} alt={leftAlt} loading="lazy" decoding="async" />
      {/if}
    </figure>

    <figure
      class="editorial-mobile-showcase__media"
      style={`--editorial-mobile-showcase-media-min-height:${mediaMinHeight};${mediaMobileAspectRatio ? `--editorial-mobile-showcase-media-aspect-mobile:${mediaMobileAspectRatio};` : ""}`}
      use:reveal={{ delay: 100 }}
    >
      {#if rightVideo.length}
        <AutoVideo sources={rightVideo} poster={rightPoster} label={rightAlt} />
      {:else}
        <img src={rightImage} alt={rightAlt} loading="lazy" decoding="async" />
      {/if}
    </figure>
  </div>

  <div class="editorial-mobile-showcase__text-grid">
    <p use:reveal>{@html text}</p>
  </div>
</section>

<style>
  .editorial-mobile-showcase {
    background: transparent;
    color: var(--project-surface-ink, #121212);
    padding: 0 var(--project-side-padding, 1.25rem) 6.5rem;
  }

  .editorial-mobile-showcase__media-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .editorial-mobile-showcase__media {
    margin: 4rem 0 0;
    height: var(--editorial-mobile-showcase-media-min-height, 32rem);
    overflow: hidden;
    border-radius: 0.35rem;
    background: var(--project-surface-bg-alt, #efe9df);
  }

  .editorial-mobile-showcase__media--dark {
    background: var(--project-surface-card-strong, #040404);
  }

  .editorial-mobile-showcase__media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .editorial-mobile-showcase__text-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    align-items: start;
    padding-top: 1.35rem;
  }

  .editorial-mobile-showcase__text-grid p {
    margin: 0;
    grid-column: 2;
    max-width: 13ch;
    font-family: "Inter", sans-serif;
    font-weight: 300;
    font-size: var(--project-lead-size, clamp(1.35rem, 2.7vw, 2.8rem));
    line-height: 0.98;
    letter-spacing: -0.05em;
  }

  /* Texte gris + mots importants (.hl) en pleine encre. */
  .editorial-mobile-showcase__text-grid p:has(:global(.hl)) {
    color: color-mix(in srgb, var(--project-surface-ink, #121212) 50%, transparent);
  }

  .editorial-mobile-showcase__text-grid p :global(.hl) {
    color: var(--project-surface-ink, #121212);
  }

  .editorial-mobile-showcase--reverse .editorial-mobile-showcase__media-grid figure:first-child {
    order: 2;
  }

  .editorial-mobile-showcase--reverse .editorial-mobile-showcase__media-grid figure:last-child {
    order: 1;
  }

  @media (max-width: 900px) {
    .editorial-mobile-showcase {
      padding: 0 var(--project-side-padding, 0.8rem) 4rem;
    }

    .editorial-mobile-showcase__media-grid,
    .editorial-mobile-showcase__text-grid {
      grid-template-columns: 1fr;
    }

    .editorial-mobile-showcase__media {
      height: auto;
      min-height: auto;
      margin-top: 1.85rem;
    }

    .editorial-mobile-showcase__media-grid {
      gap: 0.75rem;
    }

    .editorial-mobile-showcase__media-grid figure:first-child {
      aspect-ratio: var(--editorial-mobile-showcase-media-aspect-mobile, 0.86);
    }

    .editorial-mobile-showcase__media-grid figure:last-child {
      display: none;
    }

    .editorial-mobile-showcase__text-grid {
      padding-top: 1.15rem;
    }

    .editorial-mobile-showcase__text-grid p {
      max-width: 12ch;
      grid-column: auto;
      font-size: clamp(1.7rem, 8.5vw, 2.55rem);
      padding-inline: var(--project-text-inset, 0);
    }
  }
</style>
