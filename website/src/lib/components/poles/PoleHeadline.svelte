<script>
  import { reveal } from "$lib/actions/reveal.js";

  // Grand titre éditorial (façon accroche Apple) : petit surtitre (nom du pôle)
  // au-dessus, puis un gros titre gras centré sur ~3 lignes. Pas d'image
  // derrière. Remplace l'ancien titre de pôle (SectionLead lead="3 Terres …").
  export let label = "";
  export let text = "";
</script>

<section class="pole-headline">
  <div class="pole-headline__inner">
    {#if label}
      <p class="pole-headline__eyebrow" use:reveal>{label}</p>
    {/if}
    <h2 class="pole-headline__title" use:reveal={{ delay: label ? 90 : 0 }}>{@html text}</h2>
  </div>
</section>

<style>
  .pole-headline {
    background: transparent;
    padding: clamp(5rem, 10vw, 9rem) 0 clamp(2.5rem, 5vw, 4rem);
  }

  .pole-headline__inner {
    width: min(1400px, 92%);
    margin: 0 auto;
    text-align: center;
  }

  /* Ligne au-dessus : le nom du pôle. ~1/3 de la taille du titre, pleine encre
     (pas de gris), avec un espacement généreux avant le titre — comme la réf. */
  .pole-headline__eyebrow {
    margin: 0 0 clamp(1.2rem, 2.2vw, 2rem);
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: clamp(1.15rem, 2vw, 1.85rem);
    line-height: 1.2;
    letter-spacing: -0.015em;
    color: var(--project-surface-ink, #f4efe6);
    transition:
      opacity 0.6s ease,
      filter 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      color var(--project-theme-transition, 920ms cubic-bezier(0.16, 1, 0.3, 1));
    transition-delay: var(--reveal-delay, 0ms);
  }

  .pole-headline__title {
    margin: 0 auto;
    /* Retours à la ligne explicites (<br>) → 3 lignes comme la référence. */
    font-family: "Inter", sans-serif;
    font-weight: 600;
    font-size: clamp(2.8rem, 6.8vw, 6rem);
    line-height: 1.05;
    letter-spacing: -0.035em;
    color: var(--project-surface-ink, #f4efe6);
    transition:
      opacity 0.6s ease,
      filter 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      color var(--project-theme-transition, 920ms cubic-bezier(0.16, 1, 0.3, 1));
    transition-delay: var(--reveal-delay, 0ms);
  }
</style>
