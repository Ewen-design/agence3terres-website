<script>
  // ───────────────────────────────────────────────────────────────────────────
  //  ProjectCaptionCards — trois grandes cartes-images à légende.
  //
  //  « Trois cartes à légende » de la librairie, passé aux règles du site : le
  //  titre centré sur deux lignes suit le gabarit d'accroche (première ligne en
  //  pleine encre, seconde en gris) et passe par l'arrivée mot à mot, les cartes
  //  prennent l'arrondi des médias des pages projet, et les couleurs viennent
  //  des jetons de la bande — jamais écrites en dur.
  //
  //  Trois arguments, pas plus : le bloc tire sa force de la symétrie. Les trois
  //  images doivent partager la même lumière pour que la rangée respire comme un
  //  ensemble.
  // ───────────────────────────────────────────────────────────────────────────
  //  ── Arrivées : celles de la home ──────────────────────────────────────────
  //  Les blocs entrent par `revealBlock` (flou + montée, l'action `reveal` du
  //  site) plutôt que par une cascade écrite à la main : c'est la même arrivée
  //  que partout ailleurs, réglée au même endroit (`.reveal` dans `app.css`),
  //  et qui sait déjà se taire sous `prefers-reduced-motion` comme alléger son
  //  flou sur téléphone. La cascade se fait par le décalage passé à l'action.
  import { reveal, revealBlock } from "$lib/actions/reveal.js";
  import AutoVideo from "$lib/components/shared/media/AutoVideo.svelte";

  /** Première ligne du titre — pleine encre. */
  export let titleMain = "";
  /** Seconde ligne du titre — en gris. */
  export let titleMuted = "";
  /** `[{ image | video, mobileImage, poster, alt, title, text, position }]` */
  export let cards = [];

</script>

<section class="capcards">
  {#if titleMain || titleMuted}
    <h2 class="capcards__title" use:reveal>
      {#if titleMain}<span class="capcards__line">{titleMain}</span>{/if}
      {#if titleMuted}<span class="capcards__line capcards__line--muted">{titleMuted}</span>{/if}
    </h2>
  {/if}

  <div class="capcards__grid">
    {#each cards as card, i (card.title)}
      <article class="capcards__card" use:revealBlock={{ delay: i * 110 }}>
        {#if card.video}
          <AutoVideo
            sources={card.video}
            mobileSources={card.mobileVideo ?? []}
            poster={card.poster}
            label={card.alt ?? card.title}
            objectFit="cover"
            objectPosition={card.position ?? "center"}
          />
        {:else}
          <picture>
            {#if card.mobileImage}
              <source media="(max-width: 640px)" srcset={card.mobileImage} />
            {/if}
            <img
              src={card.image}
              alt={card.alt ?? ""}
              style:object-position={card.position ?? "center"}
              loading="lazy"
              decoding="async"
            />
          </picture>
        {/if}

        <span class="capcards__shade" aria-hidden="true"></span>

        <div class="capcards__copy">
          <h3>{card.title}</h3>
          {#if card.text}<p>{@html card.text}</p>{/if}
        </div>
      </article>
    {/each}
  </div>
</section>

<style>
  .capcards {
    padding:
      clamp(6rem, 11vw, 10rem)
      var(--project-side-padding, 1.25rem)
      clamp(6rem, 11vw, 10rem);
    background: transparent;
    color: var(--project-surface-ink, #f4efe6);
    transition: color var(--project-theme-transition);
  }

  /* Le gabarit d'accroche du site : deux lignes, la seconde en gris. */
  .capcards__title {
    margin: 0 auto clamp(2.4rem, 5vw, 4rem);
    max-width: 22ch;
    font-family: var(--site-font);
    font-weight: var(--site-weight-display);
    font-size: var(--project-display-size, clamp(2.1rem, 3vw, 3.45rem));
    line-height: var(--project-lead-line-height, 1.2);
    letter-spacing: var(--project-lead-tracking, -0.01em);
    text-align: center;
    text-wrap: balance;
  }

  .capcards__line {
    display: block;
  }

  .capcards__line--muted {
    color: color-mix(in srgb, var(--project-surface-ink, #f4efe6) 45%, transparent);
  }

  .capcards__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: clamp(0.5rem, 1vw, 0.85rem);
  }

  .capcards__card {
    position: relative;
    aspect-ratio: 1 / 1.14;
    border-radius: var(--project-media-radius, 22px);
    overflow: hidden;
    background: var(--project-surface-card, #0a0e12);
    transition: background-color var(--project-theme-transition);
  }

  .capcards__card picture {
    display: block;
    width: 100%;
    height: 100%;
  }

  .capcards__card :global(img),
  .capcards__card :global(video) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .capcards__shade {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(var(--shade-rgb, 0, 0, 0), 0.82) 0%,
      rgba(var(--shade-rgb, 0, 0, 0), 0.44) 26%,
      rgba(var(--shade-rgb, 0, 0, 0), 0.06) 54%,
      rgba(var(--shade-rgb, 0, 0, 0), 0) 72%
    );
    pointer-events: none;
  }

  .capcards__copy {
    position: absolute;
    inset-inline: 0;
    bottom: 0;
    padding: clamp(1rem, 1.9vw, 1.5rem);
    /* Texte posé SUR la photo, sous le dégradé : blanc, quel que soit le
       thème de la bande. */
    color: #fff;
  }

  .capcards__copy h3 {
    margin: 0;
    font-family: var(--site-font);
    font-weight: var(--site-weight-display);
    font-size: var(--project-subtitle-size, clamp(1.3rem, 1.9vw, 2rem));
    line-height: 1.05;
    letter-spacing: -0.03em;
  }

  .capcards__copy p {
    margin: clamp(0.45rem, 0.9vw, 0.7rem) 0 0;
    max-width: 34ch;
    font-family: var(--site-font);
    font-size: var(--project-body-size, 1rem);
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.76);
    text-wrap: pretty;
  }

  .capcards__copy p :global(.hl) {
    color: #fff;
  }

  @media (max-width: 900px) {
    .capcards {
      padding:
        clamp(4.5rem, 15vw, 7rem)
        var(--project-side-padding, 0.9rem)
        clamp(4.5rem, 15vw, 7rem);
    }

    .capcards__title {
      max-width: 24ch;
      margin-bottom: clamp(1.8rem, 7vw, 2.6rem);
    }

    .capcards__grid {
      grid-template-columns: 1fr;
      gap: clamp(0.5rem, 2vw, 0.8rem);
    }

    .capcards__card {
      aspect-ratio: 1 / 0.96;
    }
  }


  /*  ── Téléphone en PAYSAGE ──
   *  Une colonne de cartes presque carrées ferait deux écrans par carte : elles
   *  passent à deux colonnes, en format paysage. */
  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .capcards__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .capcards__card {
      aspect-ratio: 1.34;
    }
  }
</style>
