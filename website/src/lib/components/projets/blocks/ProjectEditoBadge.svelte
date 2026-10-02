<script>
  // ───────────────────────────────────────────────────────────────────────────
  //  ProjectEditoBadge — l'ouverture d'une page projet : une phrase, une image.
  //
  //  Repris de « Édito + image à badge » de la librairie, ramené aux règles du
  //  site : la phrase passe par l'arrivée mot à mot (`use:reveal`) plutôt que
  //  par la cascade maison du composant d'origine, les mots importants sont
  //  marqués `.hl` comme partout ailleurs, l'image prend l'arrondi des médias
  //  des pages projet, et le badge est un bouton de verre du site — pas la
  //  pilule sombre de la capture.
  //
  //  Le badge de la capture d'origine a été RETIRÉ : posé dans le coin, il
  //  ressemblait à une pastille d'information flottante et alourdissait
  //  l'ouverture. L'image parle seule.
  // ───────────────────────────────────────────────────────────────────────────
  import { reveal, revealBlock } from "$lib/actions/reveal.js";
  import AutoVideo from "$lib/components/shared/media/AutoVideo.svelte";

  /** La phrase d'ouverture. Accepte des `<span class="hl">` (pleine encre). */
  export let text = "";
  export let image = "";
  export let mobileImage = "";
  export let alt = "";
  /** Liste `[{ src, type }]` — voir `videoSources.js`. Prend le pas sur `image`. */
  export let video = [];
  export let mobileVideo = [];
  export let poster = "";
  /** Cadre de l'image : 16/10 par défaut, comme la capture d'origine. */
  export let aspect = "1.6";
  export let mobileAspect = "1.1";
  /** Cadrage de l'image dans son cadre (`cover` par défaut). */
  export let fit = "cover";
  export let position = "center";
</script>

<section
  class="edito-badge"
  style={`--eb-aspect:${aspect}; --eb-aspect-mobile:${mobileAspect};`}
>
  {#if text}
    <p class="edito-badge__lead" use:reveal>{@html text}</p>
  {/if}

  <figure class="edito-badge__figure" use:revealBlock={{ delay: 160 }}>
    {#if video.length}
      <AutoVideo
        sources={video}
        mobileSources={mobileVideo}
        poster={poster || image}
        label={alt}
        objectFit={fit}
        objectPosition={position}
      />
    {:else}
      <picture>
        {#if mobileImage}
          <source media="(max-width: 640px)" srcset={mobileImage} />
        {/if}
        <img
          src={image}
          {alt}
          style:object-fit={fit}
          style:object-position={position}
          loading="lazy"
          decoding="async"
        />
      </picture>
    {/if}
  </figure>
</section>

<style>
  .edito-badge {
    padding:
      clamp(6rem, 11vw, 10rem)
      var(--project-side-padding, 1.25rem)
      clamp(4rem, 7vw, 6.5rem);
    background: transparent;
    color: var(--project-surface-ink, #f4efe6);
    transition: color var(--project-theme-transition);
  }

  /* Le gabarit d'accroche du site : grande phrase, graisse d'affichage, très
     resserrée. Même échelle que `ProjectEditorialStatement` pour que les deux
     blocs se répondent d'une section à l'autre. */
  .edito-badge__lead {
    max-width: 36ch;
    margin: 0 0 clamp(2rem, 4vw, 3.4rem);
    padding-inline: var(--project-text-inset, 0);
    font-family: var(--site-font);
    font-weight: var(--site-weight-display);
    font-size: var(--project-lead-size, clamp(1.35rem, 2.7vw, 2.8rem));
    line-height: 1.02;
    letter-spacing: -0.045em;
    text-wrap: pretty;
  }

  /* Texte gris + mots importants (.hl) en pleine encre — la convention du site. */
  .edito-badge__lead:has(:global(.hl)) {
    color: color-mix(in srgb, var(--project-surface-ink, #f4efe6) 50%, transparent);
  }

  .edito-badge__lead :global(.hl) {
    color: var(--project-surface-ink, #f4efe6);
  }

  .edito-badge__figure {
    position: relative;
    margin: 0;
    aspect-ratio: var(--eb-aspect, 1.6);
    overflow: hidden;
    border-radius: var(--project-media-radius, 22px);
    background: var(--project-surface-card, #0a0e12);
    transition: background-color var(--project-theme-transition);
  }

  .edito-badge__figure :global(img),
  .edito-badge__figure :global(video) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .edito-badge__figure picture {
    display: block;
    width: 100%;
    height: 100%;
  }

  @media (max-width: 900px) {
    .edito-badge {
      padding:
        clamp(4.5rem, 15vw, 7rem)
        var(--project-side-padding, 0.9rem)
        clamp(3rem, 10vw, 4.5rem);
    }

    .edito-badge__lead {
      max-width: 18ch;
      font-size: clamp(1.7rem, 8.5vw, 2.55rem);
    }

    .edito-badge__figure {
      aspect-ratio: var(--eb-aspect-mobile, 1.1);
    }
  }

  /*  ── Téléphone en PAYSAGE ──
   *  Le cadre presque carré du régime portrait y ferait deux écrans de haut. */
  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .edito-badge__figure {
      aspect-ratio: 1.9;
    }
  }
</style>
