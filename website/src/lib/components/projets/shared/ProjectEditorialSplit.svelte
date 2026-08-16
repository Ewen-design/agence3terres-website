<script>
  import { reveal } from "$lib/actions/reveal.js";
  import AutoVideo from "$lib/components/shared/media/AutoVideo.svelte";

  export let title = "";
  export let text = "";
  export let image = "";
  export let alt = "";
  /**
   * Si renseigné, le média devient une vidéo en autoplay.
   * Format : liste `[{ src, type }]` — voir `videoSources.js`.
   */
  export let video = [];
  export let videoPoster = "";
  export let reverse = false;
  export let mediaMinHeight = "38rem";
  export let mediaAspectRatio = "";
  /**
   * Cadre sur mobile. Par défaut 0.82 (portrait) quel que soit le média : c'est
   * le format des visuels de la page. À renseigner pour un média paysage, sinon
   * `contain` le laisse flotter entre deux grosses bandes vides.
   */
  export let mediaMobileAspectRatio = "";
  export let mediaFit = "cover";
</script>

<section class="editorial-split" class:editorial-split--reverse={reverse}>
  <div class="editorial-split__copy">
    <h2 use:reveal>{title}</h2>
    <p use:reveal={{ delay: 90 }}>{text}</p>
  </div>

  <figure
    class="editorial-split__media"
    class:editorial-split__media--ratio={!!mediaAspectRatio}
    style={`--editorial-split-media-min-height:${mediaMinHeight}; --editorial-split-media-fit:${mediaFit}; ${mediaAspectRatio ? `--editorial-split-media-aspect-ratio:${mediaAspectRatio};` : ""} ${mediaMobileAspectRatio ? `--editorial-split-media-aspect-ratio-mobile:${mediaMobileAspectRatio};` : ""}`}
    use:reveal={{ delay: 120 }}
  >
    {#if video.length}
      <AutoVideo sources={video} poster={videoPoster} label={alt} objectFit={mediaFit} />
    {:else}
      <img src={image} alt={alt} loading="lazy" decoding="async" />
    {/if}
  </figure>
</section>

<style>
  .editorial-split {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1fr);
    gap: 2.2rem;
    align-items: start;
    padding: 0 var(--project-side-padding, 1.25rem) 6.5rem;
    background: transparent;
    color: var(--project-surface-ink, #121212);
  }

  .editorial-split--reverse .editorial-split__copy {
    order: 2;
  }

  .editorial-split--reverse .editorial-split__media {
    order: 1;
  }

  .editorial-split__copy {
    max-width: 31rem;
    padding-inline: var(--project-text-inset, 0);
  }

  .editorial-split__copy h2 {
    margin: 0;
    font-family: "Inter", sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: var(--project-title-size, clamp(1.8rem, 2.45vw, 2.7rem));
    line-height: 0.98;
    letter-spacing: -0.03em;
  }

  .editorial-split__copy p {
    margin: 1rem 0 0;
    max-width: 26rem;
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: var(--project-body-size, clamp(0.98rem, 1.04vw, 1.08rem));
    line-height: var(--project-body-line-height, 1.52);
    color: var(--project-surface-muted, rgba(18, 18, 18, 0.5));
  }

  .editorial-split__media {
    margin: 0;
    height: var(--editorial-split-media-min-height, 38rem);
    overflow: hidden;
    border-radius: 0.35rem;
    background: var(--project-surface-bg-soft, #ded8cf);
  }

  .editorial-split__media--ratio {
    height: auto;
    aspect-ratio: var(--editorial-split-media-aspect-ratio, 1);
  }

  .editorial-split__media img {
    width: 100%;
    height: 100%;
    object-fit: var(--editorial-split-media-fit, cover);
    display: block;
  }

  @media (max-width: 900px) {
    .editorial-split {
      grid-template-columns: 1fr;
      gap: 1.1rem;
      padding: 0 var(--project-side-padding, 0.8rem) 4rem;
    }

    .editorial-split__media {
      height: auto;
      min-height: auto;
      aspect-ratio: var(--editorial-split-media-aspect-ratio-mobile, 0.82);
    }

    .editorial-split__copy {
      max-width: 28rem;
    }
  }
</style>
