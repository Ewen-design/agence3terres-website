<script>
  // ───────────────────────────────────────────────────────────────────────────
  //  ProjectQuote — le mot du client, en fin de page projet (2026-10-09)
  //
  //  Remplace le mur des autres projets (`ProjectWall`) juste avant le pied de
  //  page : un écran entier (~100svh), rien d'autre qu'une phrase centrée, en
  //  grand, et sa signature dessous. Le pied de page « projet suivant » prend
  //  ensuite le relais pour la suite de la visite.
  //
  //  La phrase arrive mot à mot (`reveal`, l'effet de référence du site), la
  //  signature en léger différé. Même convention de couleur que les autres
  //  textes des pages projet : ce qui est dans `<span class="hl">` reste en
  //  pleine encre ; sans `.hl`, toute la phrase est en pleine encre.
  //
  //  Les guillemets français sont posés ici, avec des espaces insécables :
  //  l'arrivée mot à mot les garde collés au premier et au dernier mot.
  // ───────────────────────────────────────────────────────────────────────────
  import { reveal } from "$lib/actions/reveal.js";

  /** La citation. HTML autorisé (`.hl`), sans guillemets. */
  export let quote = "";
  /** Qui parle. */
  export let author = "";
  /** Sa fonction, sa structure. */
  export let role = "";
</script>

<section class="pquote" aria-label="Le mot du client">
  <figure class="pquote__figure">
    <blockquote class="pquote__text" use:reveal>«&nbsp;{@html quote}&nbsp;»</blockquote>
    {#if author || role}
      <figcaption class="pquote__cite" use:reveal={{ delay: 160 }}>
        {#if author}<span class="pquote__author">{author}</span>{/if}
        {#if role}<span class="pquote__role">{role}</span>{/if}
      </figcaption>
    {/if}
  </figure>
</section>

<style>
  .pquote {
    display: grid;
    place-items: center;
    min-height: 100svh;
    padding: clamp(5rem, 12vh, 9rem) var(--project-side-padding, var(--site-inset));
    color: var(--project-surface-ink, #f4efe6);
    overflow-x: clip;
  }

  .pquote__figure {
    margin: 0;
    width: min(100%, 58rem);
    text-align: center;
  }

  /* Plus grand que les accroches de la page (36 px au repos) : c'est le seul
     texte de l'écran. Mais sans retomber dans les 45 px+ qu'on vient de
     quitter sur téléphone — 27 px à 390 px de large. */
  .pquote__text {
    margin: 0;
    font-family: var(--site-font);
    font-weight: var(--site-weight-display, 500);
    font-size: clamp(1.7rem, 3.6vw, 3.6rem);
    line-height: 1.14;
    letter-spacing: -0.015em;
    text-wrap: balance;
  }

  .pquote__text:has(:global(.hl)) {
    color: color-mix(in srgb, var(--project-surface-ink, #f4efe6) 50%, transparent);
  }

  .pquote__text :global(.hl) {
    color: var(--project-surface-ink, #f4efe6);
  }

  .pquote__cite {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    margin-top: clamp(2rem, 5vh, 3.25rem);
    font-family: var(--site-font);
    font-size: clamp(0.95rem, 1.1vw, 1.1rem);
    line-height: 1.4;
  }

  .pquote__author {
    font-weight: var(--site-weight-display, 500);
  }

  .pquote__role {
    color: color-mix(in srgb, var(--project-surface-ink, #f4efe6) 50%, transparent);
  }

  @media (max-width: 900px) {
    .pquote {
      padding: clamp(4rem, 10vh, 6rem) var(--project-side-padding, 1rem);
    }
  }

  /* Téléphone couché : un écran fait 390 px de haut, la citation n'a pas
     besoin d'en occuper un entier pour respirer. */
  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .pquote {
      min-height: auto;
    }
  }
</style>
