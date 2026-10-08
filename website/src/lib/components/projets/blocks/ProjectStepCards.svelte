<script>
  // ───────────────────────────────────────────────────────────────────────────
  //  ProjectStepCards — le déroulé du projet, en trois cartes.
  //
  //  « Trois cartes journal à bouton + » de la librairie, détournée de son usage
  //  d'origine : dans une page projet il n'y a pas d'articles datés, il y a des
  //  ÉTAPES. La date devient donc un rang (« Étape 01 »), et la carte
  //  photographie qui ferme la rangée porte le lien vers le résultat.
  //
  //  Ce qui fait la carte, c'est la RÉSERVE D'AIR au centre : la vignette reste
  //  en haut, le texte est poussé en bas par une marge automatique, et deux
  //  résumés de longueurs différentes gardent donc leurs vignettes alignées.
  //  Ne pas remplir ce vide, sinon les cartes perdent leur air de fiches.
  //
  //  Passé aux règles du site : cartes sur le creux de la bande
  //  (`--project-surface-card`), arrondi des médias des pages projet, boutons
  //  « + » en verre, arrivée en cascade avec le flou du site.
  // ───────────────────────────────────────────────────────────────────────────
  //  ── Arrivées : celles de la home ──────────────────────────────────────────
  //  Les blocs entrent par `revealBlock` (flou + montée, l'action `reveal` du
  //  site) plutôt que par une cascade écrite à la main : c'est la même arrivée
  //  que partout ailleurs, réglée au même endroit (`.reveal` dans `app.css`),
  //  et qui sait déjà se taire sous `prefers-reduced-motion` comme alléger son
  //  flou sur téléphone. La cascade se fait par le décalage passé à l'action.
  import { reveal, revealBlock } from "$lib/actions/reveal.js";

  export let title = "";
  /** `[{ label, title, text, image, alt }]` — trois, pas plus. */
  export let steps = [];
  /** La carte photographie de clôture : `{ image, alt, brand, line1, line2, href, external }`. */
  export let closing = null;

  const rank = (i) => String(i + 1).padStart(2, "0");

</script>

<section class="steps">
  {#if title}
    <header class="steps__head">
      <h2 class="steps__title" use:reveal>{@html title}</h2>
    </header>
  {/if}

  <div class="steps__row">
    {#each steps as step, i (step.title)}
      <article class="steps__card" use:revealBlock={{ delay: i * 110 }}>
        <div class="steps__top">
          <figure class="steps__thumb">
            <img src={step.image} alt={step.alt ?? ""} loading="lazy" decoding="async" />
          </figure>
          <span class="steps__rank" aria-hidden="true">{step.label ?? rank(i)}</span>
        </div>

        <div class="steps__bottom">
          <h3 class="steps__card-title">{step.title}</h3>
          <p class="steps__text">{@html step.text}</p>
        </div>
      </article>
    {/each}

    {#if closing}
      <article class="steps__card steps__card--photo" use:revealBlock={{ delay: steps.length * 110 }}>
        <img class="steps__bg" src={closing.image} alt={closing.alt ?? ""} loading="lazy" decoding="async" />
        <span class="steps__bg-shade" aria-hidden="true"></span>

        <div class="steps__top">
          <p class="steps__brand">{closing.brand}</p>
          <a
            class="steps__plus"
            href={closing.href}
            target={closing.external ? "_blank" : undefined}
            rel={closing.external ? "noopener noreferrer" : undefined}
            aria-label={`${closing.line1} ${closing.line2 ?? ""}`.trim()}
            data-sveltekit-preload-data={closing.external ? undefined : "hover"}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="1.8" />
            </svg>
          </a>
        </div>

        <p class="steps__photo-title">
          {closing.line1}{#if closing.line2}<br />{closing.line2}{/if}
        </p>
      </article>
    {/if}
  </div>
</section>

<style>
  .steps {
    padding:
      clamp(6rem, 11vw, 10rem)
      var(--project-side-padding, 1.25rem)
      clamp(6rem, 11vw, 10rem);
    background: transparent;
    color: var(--project-surface-ink, #f4efe6);
    transition: color var(--project-theme-transition);
  }

  .steps__head {
    margin-bottom: clamp(1.8rem, 3.5vw, 3rem);
    padding-inline: var(--project-text-inset, 0);
  }


  .steps__title {
    margin: 0;
    max-width: 20ch;
    font-family: var(--site-font);
    font-weight: var(--site-weight-display);
    font-size: var(--project-display-size, clamp(2.1rem, 3vw, 3.45rem));
    line-height: var(--project-lead-line-height, 1.2);
    letter-spacing: var(--project-lead-tracking, -0.01em);
    text-wrap: balance;
  }

  .steps__row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
    gap: clamp(0.5rem, 1vw, 0.85rem);
    align-items: stretch;
  }

  /* La carte est une colonne : la vignette reste en haut, le texte est poussé
     en bas par la marge automatique du bloc du bas. */
  .steps__card {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: clamp(21rem, 52vh, 30rem);
    padding: clamp(1rem, 1.8vw, 1.5rem);
    border-radius: var(--project-media-radius, 22px);
    background: var(--project-surface-card, #0a0e12);
    overflow: hidden;
    transition: background-color var(--project-theme-transition);
  }

  .steps__top {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .steps__thumb {
    margin: 0;
    width: clamp(3.6rem, 6vw, 5rem);
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: calc(var(--project-media-radius, 22px) * 0.5);
    background: var(--project-surface-bg-alt, #0a0e12);
  }

  .steps__thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .steps__rank {
    font-family: var(--site-font);
    font-size: clamp(0.8rem, 0.92vw, 0.95rem);
    font-weight: var(--site-weight-display);
    letter-spacing: 0.04em;
    font-variant-numeric: tabular-nums;
    color: color-mix(in srgb, var(--project-surface-ink, #f4efe6) 42%, transparent);
  }

  /* La marge automatique pousse tout le texte au bas de la carte — voir
     l'en-tête du composant. */
  .steps__bottom {
    margin-top: auto;
    padding-top: clamp(3rem, 12vh, 7rem);
  }

  .steps__card-title {
    margin: 0 0 0.6rem;
    font-family: var(--site-font);
    font-weight: var(--site-weight-display);
    font-size: clamp(1.1rem, 1.35vw, 1.45rem);
    line-height: 1.18;
    letter-spacing: -0.025em;
    color: var(--project-surface-ink, #f4efe6);
  }

  .steps__text {
    margin: 0;
    font-family: var(--site-font);
    font-size: var(--project-body-size, 1rem);
    line-height: var(--project-body-line-height, 1.52);
    color: var(--project-surface-muted, rgba(232, 239, 249, 0.72));
    text-wrap: pretty;
  }

  .steps__text :global(.hl) {
    color: var(--project-surface-ink, #f4efe6);
  }

  /* ── La carte photographie qui ferme la rangée ── */
  .steps__card--photo {
    color: #fff;
  }

  .steps__bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 1.4s cubic-bezier(0.22, 0.61, 0.36, 1);
  }

  .steps__bg-shade {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(var(--shade-rgb, 5, 7, 9), 0.6) 0%,
      rgba(var(--shade-rgb, 5, 7, 9), 0.14) 52%,
      rgba(var(--shade-rgb, 5, 7, 9), 0.28) 100%
    );
  }

  .steps__brand {
    position: relative;
    margin: 0;
    font-family: var(--site-font);
    font-size: clamp(0.85rem, 1vw, 1.02rem);
    font-weight: var(--site-weight-display);
    color: #fff;
  }

  /* Le « + » en verre du site, ramené au rond. Son libellé accessible reprend
     le titre de la carte : sans ça le lien serait annoncé sans nom. */
  .steps__plus {
    position: relative;
    z-index: 1;
    display: grid;
    place-items: center;
    width: clamp(2.1rem, 2.6vw, 2.5rem);
    aspect-ratio: 1;
    flex: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    transform: translateZ(0);
    color: #fff;
    transition:
      transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1),
      background 0.45s ease;
  }

  .steps__plus svg {
    width: 58%;
    height: 58%;
  }

  .steps__plus:hover,
  .steps__plus:focus-visible {
    transform: translateZ(0) rotate(90deg);
    background: rgba(255, 255, 255, 0.24);
  }

  .steps__photo-title {
    position: relative;
    z-index: 1;
    margin: auto 0 0;
    text-align: right;
    font-family: var(--site-font);
    font-weight: var(--site-weight-display);
    font-size: clamp(1.3rem, 1.1rem + 1vw, 2.1rem);
    line-height: 1.08;
    letter-spacing: -0.035em;
  }

  @media (hover: hover) {
    .steps__card--photo:hover .steps__bg {
      transform: scale(1.04);
    }
  }

  @media (max-width: 900px) {
    .steps {
      padding:
        clamp(4.5rem, 15vw, 7rem)
        var(--project-side-padding, 0.9rem)
        clamp(4.5rem, 15vw, 7rem);
    }

    .steps__title {
      max-width: 24ch;
    }
  }

  /* Écrans étroits : la réserve d'air se réduit, sans quoi chaque carte ferait
     un écran à elle seule. */
  @media (max-width: 700px) {
    .steps__card {
      min-height: 0;
    }

    .steps__bottom {
      padding-top: clamp(2rem, 8vh, 4rem);
    }

    .steps__card--photo {
      min-height: clamp(15rem, 44vh, 21rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .steps__plus,
    .steps__bg {
      transform: none;
      transition: none;
    }
  }
</style>
