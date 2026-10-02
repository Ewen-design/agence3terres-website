<script>
  // ───────────────────────────────────────────────────────────────────────────
  //  ProjectFigures — ce que le projet a produit, en chiffres.
  //
  //  « Résultats clients en cartes » de la librairie, remis au service d'une
  //  page projet : les logotypes clients laissent la place à un intitulé de
  //  livrable, et le chiffre dit ce qui a été FAIT — pas une performance
  //  commerciale qu'on ne peut pas prouver.
  //
  //  Le vide entre le chiffre et sa phrase est le sujet : c'est lui qui donne à
  //  la carte son air de fiche plutôt que de statistique décorative. Ne pas le
  //  remplir.
  // ───────────────────────────────────────────────────────────────────────────
  //  ── Arrivées : celles de la home ──────────────────────────────────────────
  //  Les blocs entrent par `revealBlock` (flou + montée, l'action `reveal` du
  //  site) plutôt que par une cascade écrite à la main : c'est la même arrivée
  //  que partout ailleurs, réglée au même endroit (`.reveal` dans `app.css`),
  //  et qui sait déjà se taire sous `prefers-reduced-motion` comme alléger son
  //  flou sur téléphone. La cascade se fait par le décalage passé à l'action.
  import { reveal, revealBlock } from "$lib/actions/reveal.js";

  export let title = "";
  /** `[{ label, figure, text }]` — trois, quatre au maximum. */
  export let items = [];

</script>

<section class="figures">
  {#if title}
    <header class="figures__head">
      <h2 class="figures__title" use:reveal>{@html title}</h2>
    </header>
  {/if}

  <div class="figures__row">
    {#each items as item, i (item.label)}
      <article class="figures__card" use:revealBlock={{ delay: i * 110 }}>
        <p class="figures__label">{item.label}</p>
        <p class="figures__figure">{item.figure}</p>
        <p class="figures__text">{@html item.text}</p>
      </article>
    {/each}
  </div>
</section>

<style>
  .figures {
    padding:
      clamp(6rem, 11vw, 10rem)
      var(--project-side-padding, 1.25rem)
      clamp(6rem, 11vw, 10rem);
    background: transparent;
    color: var(--project-surface-ink, #f4efe6);
    transition: color var(--project-theme-transition);
  }

  .figures__head {
    margin-bottom: clamp(1.8rem, 3.5vw, 3rem);
    padding-inline: var(--project-text-inset, 0);
  }


  .figures__title {
    margin: 0;
    max-width: 20ch;
    font-family: var(--site-font);
    font-weight: var(--site-weight-display);
    font-size: var(--project-display-size, clamp(2.1rem, 3vw, 3.45rem));
    line-height: 1;
    letter-spacing: -0.04em;
    text-wrap: balance;
  }

  .figures__row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
    gap: clamp(0.5rem, 1vw, 0.85rem);
  }

  /* La carte est une colonne dont la phrase est poussée en bas. */
  .figures__card {
    display: flex;
    flex-direction: column;
    min-height: clamp(16rem, 34vh, 22rem);
    padding: clamp(1.3rem, 2.4vw, 2.1rem);
    border-radius: var(--project-media-radius, 22px);
    background: var(--project-surface-card, #0a0e12);
    transition: background-color var(--project-theme-transition);
  }

  .figures__label {
    margin: 0;
    font-family: var(--site-font);
    font-size: clamp(0.88rem, 1.05vw, 1.02rem);
    font-weight: var(--site-weight-display);
    letter-spacing: 0.005em;
    color: var(--project-surface-muted, rgba(232, 239, 249, 0.72));
  }

  .figures__figure {
    margin: clamp(1.3rem, 4vh, 2.6rem) 0 auto;
    font-family: var(--site-font);
    font-weight: var(--site-weight);
    font-size: clamp(2.8rem, 1.5rem + 4vw, 5.2rem);
    line-height: 0.92;
    letter-spacing: -0.05em;
    color: var(--project-surface-ink, #f4efe6);
    font-variant-numeric: tabular-nums;
  }

  .figures__text {
    margin: clamp(1.6rem, 5vh, 3rem) 0 0;
    max-width: 24ch;
    font-family: var(--site-font);
    font-size: var(--project-body-size, 1rem);
    line-height: var(--project-body-line-height, 1.52);
    color: var(--project-surface-muted, rgba(232, 239, 249, 0.72));
    text-wrap: pretty;
  }

  .figures__text :global(.hl) {
    color: var(--project-surface-ink, #f4efe6);
  }

  @media (max-width: 900px) {
    .figures {
      padding:
        clamp(4.5rem, 15vw, 7rem)
        var(--project-side-padding, 0.9rem)
        clamp(4.5rem, 15vw, 7rem);
    }

    .figures__title {
      max-width: 13ch;
      font-size: clamp(1.9rem, 9vw, 2.8rem);
    }

    .figures__card {
      min-height: clamp(13rem, 42vw, 17rem);
    }
  }

</style>
