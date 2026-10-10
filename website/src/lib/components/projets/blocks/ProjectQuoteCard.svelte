<script>
  // ───────────────────────────────────────────────────────────────────────────
  //  ProjectQuoteCard — le témoignage EN ENTIER, en carte plein écran (2026-10-09)
  //
  //  Ouvert par le « + » de `ProjectQuote`. Le panneau ne s'anime pas lui-même :
  //  c'est la PAGE qui recule et se voile au noir (le geste de la transition de
  //  page, joué par `FullscreenMenu` via `$lib/pageCard.js`), puis la carte
  //  revient plein écran en restant noire. Ce panneau, du même noir, est posé à
  //  cet instant précis : on ne le voit pas arriver, seuls ses textes arrivent.
  //
  //  Le texte garde la taille de la citation de la page, en haut et centré : il
  //  est long, on défile DANS le panneau (le document, lui, est tenu). Photo en
  //  petit au-dessus, signature à la fin, logo de la marque en filigrane.
  //
  //  Il vit hors de `.page-stage` (déplacé dans `<main>` par `ProjectQuote`) :
  //  la page recule sous lui pendant les deux gestes, il ne doit pas suivre.
  //
  //  ── L'ARRIVÉE DU TEXTE, STABILISÉE (2026-10-09) ───────────────────────────
  //  Le texte est long : à l'ouverture, une soixantaine de mots à l'écran.
  //  - Il n'est monté qu'à `ready` — quand la page est rendue à plat DESSOUS et
  //    au repos. Lancée pendant qu'elle se redessinait, l'arrivée accrochait.
  //  - Chaque PARAGRAPHE arrive d'un bloc, sur place (fondu, et flou sur grand
  //    écran), jamais mot à mot : soixante mots qui animent chacun flou,
  //    montée et couleur, c'est soixante textes repeints à chaque image — sur
  //    téléphone l'animation accrochait — et, dans le Safari du client, des
  //    mots qui « se replaçaient » (voir `ProjectQuote`). Couche gardée après
  //    l'arrivée (`keepLayer`), même raison.
  // ───────────────────────────────────────────────────────────────────────────
  import { revealBlock } from "$lib/actions/reveal.js";

  /** Les paragraphes du témoignage (HTML), guillemets déjà posés. */
  export let paragraphs = [];
  export let photo = "";
  export let photoAlt = "";
  export let photoPosition = "50% 30%";
  /** Le logo de la marque, en filigrane sous la signature. */
  export let logo = "";
  /** `{ name, org }` */
  export let signature = null;
  /** La page est au repos sous le panneau : les textes peuvent arriver. */
  export let ready = false;
  /** Le contenu s'efface (premier temps de la fermeture). */
  export let contentHidden = false;
  /** Pas de geste possible (mouvement réduit…) : le panneau arrive en fondu. */
  export let fadeIn = false;
  /** Et repart en fondu. */
  export let leaving = false;
  /** Le panneau lui-même, pour lui donner le focus. */
  export let el = null;

  // Les deux premiers paragraphes sont à l'écran ensemble : le second attend
  // que le premier soit lancé. Les suivants arrivent quand on les fait défiler.
  const paraDelay = (i) => (i === 0 ? 140 : i === 1 ? 420 : 0);

</script>

<div
  class="pcard"
  class:is-fade-in={fadeIn}
  class:is-leaving={leaving}
  class:is-content-hidden={contentHidden}
  role="dialog"
  aria-modal="true"
  aria-label={signature?.name ? `Le témoignage de ${signature.name}` : "Le témoignage en entier"}
  tabindex="-1"
  data-scroll-lock-owner
  data-lenis-prevent
  bind:this={el}
>
  <div class="pcard__inner">
    {#if ready}
      {#if photo}
        <img
          class="pcard__photo"
          src={photo}
          alt={photoAlt}
          style:object-position={photoPosition}
          decoding="async"
          draggable="false"
          use:revealBlock
        />
      {/if}

      <blockquote class="pcard__text">
        {#each paragraphs as para, i}
          <p use:revealBlock={{ delay: paraDelay(i), keepLayer: true }}>{@html para}</p>
        {/each}
      </blockquote>

      {#if signature}
        <p class="pcard__cite" use:revealBlock={{ keepLayer: true }}>
          {#if signature.name}<span class="pcard__author">{signature.name}</span>{/if}
          {#if signature.org}<span class="pcard__org">{signature.org}</span>{/if}
        </p>
      {/if}

      {#if logo}
        <!-- L'arrivée sur l'ENVELOPPE, pas sur le logo : l'opacité du filigrane
             (0,16) l'emportait sur l'état caché de l'arrivée — le logo était
             visible avant d'arriver, s'éteignait d'un coup, puis revenait. -->
        <div class="pcard__mark" use:revealBlock={{ delay: 120 }}>
          <img class="pcard__logo" src={logo} alt="" aria-hidden="true" draggable="false" />
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .pcard {
    position: fixed;
    inset: 0;
    /* Au-dessus de la page et de ses voiles, sous le curseur (10000) et le
       header (600000), dont le bouton sert à refermer. */
    z-index: 9000;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    /* Le noir exact du voile de la transition : le panneau se pose dessus sans
       qu'on le voie. */
    background: var(--bg-deep, #050709);
    color: #f4efe6;
    outline: none;
    scrollbar-width: none;
  }

  .pcard::-webkit-scrollbar {
    display: none;
  }

  .pcard.is-fade-in {
    animation: pcardFade 0.4s ease both;
  }

  .pcard.is-leaving {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.38s ease;
  }

  @keyframes pcardFade {
    from {
      opacity: 0;
    }
  }

  /* En haut et centré, sous le header ; de l'air en bas pour le filigrane. */
  .pcard__inner {
    box-sizing: border-box;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding:
      clamp(6.5rem, 15vh, 9.5rem)
      var(--project-side-padding, var(--site-inset))
      clamp(5rem, 12vh, 8rem);
    text-align: center;
    transition: opacity 0.35s ease;
  }

  .pcard.is-content-hidden .pcard__inner {
    opacity: 0;
  }

  .pcard__photo {
    display: block;
    width: clamp(4.25rem, 5.6vw, 5.75rem);
    aspect-ratio: 1;
    margin-bottom: clamp(2rem, 5vh, 3.25rem);
    border-radius: 50%;
    object-fit: cover;
  }

  /* La taille de la citation de la page (`.pquote__text`). */
  /* Sur place, comme la citation de la page (voir `ProjectQuote`). */
  .pcard__text p,
  .pcard__cite {
    --reveal-shift: 0px;
  }

  .pcard__text {
    width: min(100%, 58rem);
    margin: 0;
    font-family: var(--site-font);
    font-weight: var(--site-weight-display, 500);
    font-size: clamp(1.7rem, 3.6vw, 3.6rem);
    line-height: 1.14;
    letter-spacing: -0.015em;
  }

  .pcard__text p {
    margin: 0;
    text-wrap: pretty;
  }

  .pcard__text p + p {
    margin-top: 0.7em;
  }

  /* La signature de la carte : le gabarit de `.pquote__cite`. */
  .pcard__cite {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    margin: clamp(2.5rem, 6vh, 3.75rem) 0 0;
    font-family: var(--site-font);
    font-size: clamp(0.95rem, 1.1vw, 1.1rem);
    line-height: 1.4;
  }

  .pcard__author {
    font-weight: var(--site-weight-display, 500);
  }

  .pcard__org {
    color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.5);
  }

  /* Le filigrane : ni timbre-poste, ni second titre. */
  .pcard__mark {
    margin-top: clamp(3.5rem, 9vh, 6rem);
  }

  .pcard__logo {
    display: block;
    width: clamp(5.5rem, 9vw, 8rem);
    height: auto;
    opacity: 0.16;
  }

  @media (prefers-reduced-motion: reduce) {
    .pcard.is-fade-in {
      animation: none;
    }
  }
</style>
