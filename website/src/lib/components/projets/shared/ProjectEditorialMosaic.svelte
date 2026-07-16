<script>
  import { reveal } from "$lib/actions/reveal.js";

  export let text = "";
  export let feature = { src: "", alt: "" };
  export let items = [];
</script>

<section class="project-editorial-mosaic">
  <div class="project-editorial-mosaic__grid">
    <figure class="project-editorial-mosaic__media project-editorial-mosaic__media--feature" use:reveal>
      <img src={feature.src} alt={feature.alt} loading="lazy" decoding="async" />
    </figure>

    {#each items.slice(0, 2) as item, i}
      <figure class="project-editorial-mosaic__media" use:reveal={{ delay: i * 90 + 90 }}>
        <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
      </figure>
    {/each}
  </div>

  {#if text}
    <p class="project-editorial-mosaic__text" use:reveal>{@html text}</p>
  {/if}
</section>

<style>
  .project-editorial-mosaic {
    padding:
      clamp(4.5rem, 7vw, 7rem)
      max(0.45rem, calc(var(--project-side-padding, 1.25rem) * 0.55))
      clamp(5rem, 8vw, 8rem);
    background: transparent;
    color: var(--project-surface-ink, #f4efe6);
    transition: color var(--project-theme-transition);
  }

  .project-editorial-mosaic__grid {
    --mosaic-tile-height: min(98vh, 76rem);
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(0.45rem, 0.8vw, 0.7rem);
  }

  .project-editorial-mosaic__media {
    position: relative;
    height: var(--mosaic-tile-height);
    margin: 0;
    overflow: hidden;
    border-radius: 2px;
    background: var(--project-surface-card, #121212);
  }

  .project-editorial-mosaic__media--feature {
    grid-column: 1 / -1;
  }

  .project-editorial-mosaic__media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .project-editorial-mosaic__text {
    max-width: 21ch;
    margin: clamp(1.35rem, 2vw, 1.8rem) 0 0;
    padding-inline: var(--project-text-inset, 0);
    font-family: "Inter", sans-serif;
    font-weight: 300;
    font-size: var(--project-lead-size, clamp(1.35rem, 2.7vw, 2.8rem));
    line-height: 0.98;
    letter-spacing: -0.05em;
  }

  /* Texte gris + mots importants (.hl) en pleine encre. */
  .project-editorial-mosaic__text:has(:global(.hl)) {
    color: color-mix(in srgb, var(--project-surface-ink, #f4efe6) 50%, transparent);
  }

  .project-editorial-mosaic__text :global(.hl) {
    color: var(--project-surface-ink, #f4efe6);
  }

  @media (max-width: 900px) {
    .project-editorial-mosaic {
      padding:
        clamp(3.6rem, 12vw, 5rem)
        clamp(0.35rem, 1.8vw, 0.45rem)
        clamp(3.8rem, 12vw, 5rem);
    }

    .project-editorial-mosaic__grid {
      grid-template-columns: 1fr;
    }

    .project-editorial-mosaic__media,
    .project-editorial-mosaic__media--feature {
      grid-column: auto;
      height: auto;
      aspect-ratio: 0.74;
    }

    .project-editorial-mosaic__media--feature {
      aspect-ratio: 0.82;
    }

    .project-editorial-mosaic__text {
      max-width: 12ch;
      margin-top: 1rem;
      font-size: clamp(1.7rem, 8.5vw, 2.55rem);
    }
  }

  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .project-editorial-mosaic__grid { --mosaic-tile-height: min(78vh, 30rem); }
  }
</style>
