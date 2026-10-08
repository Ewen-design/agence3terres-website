<script>
  //  Le surtitre (« Intention », « Recommandation ») a été RETIRÉ : il annonçait
  //  une phrase qui se suffit à elle-même, et la grille en deux colonnes qu'il
  //  imposait bridait la largeur du texte. Le bloc est maintenant une seule
  //  colonne, et la phrase peut respirer.
  //
  //  La couleur suit la convention du site : ce qui est enveloppé dans
  //  `<span class="hl">` reste en pleine encre, le reste passe en gris. Pour ce
  //  gabarit, on enveloppe la PREMIÈRE PHRASE — pas des mots isolés : c'est
  //  l'ouverture qui doit porter, la suite se lit en retrait.
  //  ── Arrivées : celles de la home ──────────────────────────────────────────
  //  Les TEXTES passent par `reveal` — la cascade mot à mot, l'effet de
  //  référence du site (le paragraphe d'ouverture de la home). Les MÉDIAS et
  //  les blocs passent par `revealBlock` — flou + montée, d'un seul tenant.
  //  Ce composant employait `revealBlock` pour tout, textes compris : ses
  //  grandes phrases arrivaient donc en bloc alors que les mêmes gabarits, sur
  //  la home, se déposent mot à mot.
  import { reveal } from "$lib/actions/reveal.js";

  export let text = "";
</script>

<section class="editorial-statement">
  <p class="editorial-statement__text" use:reveal>{@html text}</p>
</section>

<style>
  .editorial-statement {
    padding:
      clamp(6rem, 11vw, 10rem)
      var(--project-side-padding, 1.25rem)
      clamp(6rem, 11vw, 10rem);
    background: transparent;
    color: var(--project-surface-ink, #121212);
  }

  /*  Le bloc n'est plus une grille en deux colonnes (le surtitre est parti),
   *  mais la phrase ne revient pas pour autant coller au bord : elle garde le
   *  retrait qu'elle avait quand elle occupait la seconde colonne — un peu
   *  moins, pour ne pas l'écraser contre la marge droite. */
  .editorial-statement__text {
    margin: 0 0 0 clamp(0rem, 18vw, 16rem);
    /* Bien plus large qu'avant (21ch) : la phrase tenait sur six lignes très
       courtes, ce qui la faisait lire comme une liste. */
    max-width: 36ch;
    padding-inline: var(--project-text-inset, 0);
    font-family: var(--site-font);
    font-weight: var(--site-weight-display);
    font-size: var(--project-lead-size, clamp(1.35rem, 2.7vw, 2.8rem));
    line-height: var(--project-lead-line-height, 1.2);
    letter-spacing: var(--project-lead-tracking, -0.01em);
    text-wrap: pretty;
  }

  /* Première phrase en pleine encre (elle porte `.hl`), la suite en gris. */
  .editorial-statement__text:has(:global(.hl)) {
    color: color-mix(in srgb, var(--project-surface-ink, #121212) 50%, transparent);
  }

  .editorial-statement__text :global(.hl) {
    color: var(--project-surface-ink, #121212);
  }

  @media (max-width: 900px) {
    .editorial-statement {
      padding:
        clamp(4.5rem, 15vw, 7rem)
        var(--project-side-padding, 0.9rem)
        clamp(4.5rem, 15vw, 7rem);
    }

    .editorial-statement__text {
      margin-left: 0;
      max-width: none;
    }
  }
</style>
