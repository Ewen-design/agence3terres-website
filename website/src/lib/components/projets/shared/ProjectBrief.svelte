<script>
  import { reveal } from "$lib/actions/reveal.js";

  export let text = "";
  export let lines = [];
  export let images = [];

  $: paragraphs = lines.length ? lines : text ? [text] : [];
  $: media = images.slice(0, 2);
  $: single = media.length <= 1;
</script>

<section class="project-brief" class:project-brief--single={single}>
  {#if paragraphs[0]}
    <p class="project-brief__lead project-brief__lead--top" use:reveal>{@html paragraphs[0]}</p>
  {/if}

  {#each media as image, i}
    <figure
      class="project-brief__figure"
      class:project-brief__figure--a={i === 0}
      class:project-brief__figure--b={i === 1}
      use:reveal={{ delay: i * 110 }}
    >
      <img src={image.src} alt={image.alt || ""} loading="lazy" decoding="async" />
    </figure>
  {/each}

  {#if paragraphs[1]}
    <p class="project-brief__lead project-brief__lead--bottom" use:reveal>{@html paragraphs[1]}</p>
  {/if}
</section>

<style>
  .project-brief {
    width: min(1400px, 92%);
    margin: 0 auto;
    padding: clamp(4rem, 9vh, 9rem) 0 clamp(5rem, 11vh, 11rem);
    color: var(--project-surface-ink, #f4efe6);
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: clamp(0.7rem, 1.4vw, 1.2rem);
  }

  .project-brief__lead {
    margin: 0;
    font-family: "Inter", sans-serif;
    font-weight: 300;
    font-size: clamp(1.5rem, 2.5vw, 2.55rem);
    line-height: 1.18;
    letter-spacing: -0.025em;
    color: var(--project-surface-ink, #f4efe6);
    text-wrap: pretty;
  }

  /* Texte gris + mots importants (.hl) en pleine encre. */
  .project-brief__lead:has(:global(.hl)) {
    color: color-mix(in srgb, var(--project-surface-ink, #f4efe6) 50%, transparent);
  }

  .project-brief__lead :global(.hl) {
    color: var(--project-surface-ink, #f4efe6);
  }

  /* First text — above the images, spanning exactly the first image's column
     (aligned to both its left and right edges). */
  .project-brief__lead--top {
    grid-column: 1 / 2;
    margin-bottom: clamp(2rem, 4vw, 3.5rem);
  }

  .project-brief--single .project-brief__lead--top {
    grid-column: 1 / -1;
  }

  /* Second text — below the images, aligned to the left edge of the second image. */
  .project-brief__lead--bottom {
    grid-column: 2 / -1;
    justify-self: start;
    max-width: 46ch;
    margin-top: clamp(2rem, 4vw, 3.5rem);
  }

  .project-brief--single .project-brief__lead--bottom {
    grid-column: 1 / -1;
  }

  .project-brief__figure {
    position: relative;
    margin: 0;
    overflow: hidden;
    border-radius: 4px;
    height: clamp(26rem, 60vh, 50rem);
    background: var(--project-surface-card, #121212);
  }

  .project-brief__figure--a {
    grid-column: 1;
  }

  .project-brief__figure--b {
    grid-column: 2;
  }

  .project-brief--single .project-brief__figure--a {
    grid-column: 1 / -1;
    height: clamp(30rem, 78vh, 62rem);
  }

  .project-brief__figure img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  @media (max-width: 900px) {
    .project-brief {
      width: min(94%, 760px);
      grid-template-columns: 1fr;
      padding: clamp(3rem, 7vh, 5rem) 0 clamp(3.5rem, 8vh, 6rem);
    }

    .project-brief__lead {
      font-size: clamp(1.5rem, 6.6vw, 2rem);
    }

    .project-brief__lead--top,
    .project-brief__lead--bottom {
      grid-column: 1 / -1;
      max-width: 100%;
      margin-bottom: 1.6rem;
      margin-top: 1.6rem;
    }

    .project-brief__lead--top {
      margin-top: 0;
    }

    .project-brief__figure,
    .project-brief--single .project-brief__figure--a {
      grid-column: 1 / -1;
      height: clamp(22rem, 52vh, 34rem);
    }
  }

  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .project-brief__figure { height: clamp(14rem, 62vh, 22rem); }
    .project-brief--single .project-brief__figure--a { height: clamp(15rem, 68vh, 24rem); }
  }
</style>
