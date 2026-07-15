<script>
  import { reveal } from "$lib/actions/reveal.js";

  // Titre du pôle + un seul paragraphe en dessous.
  export let lead = "";
  export let text = "";

  // "3 Terres Digital" → marque « 3 Terres » (gras) + pôle « Digital » (fin).
  $: leadWords = lead ? lead.trim().split(/\s+/) : [];
  $: leadBrand = leadWords.slice(0, 2).join(" ");
  $: leadPole = leadWords.slice(2).join(" ");
</script>

<section class="sl" class:sl--text-only={!lead}>
  <div class="sl-inner">
    {#if lead}
      <h2 class="sl-head" use:reveal>
        <span class="sl-brand">{leadBrand}</span>
        {#if leadPole}<span class="sl-pole">{leadPole}</span>{/if}
      </h2>
    {/if}
    {#if text}
      <p class="sl-text" use:reveal={{ delay: lead ? 90 : 0 }}>{@html text}</p>
    {/if}
  </div>
</section>

<style>
  .sl {
    background: transparent;
    padding: clamp(4rem, 8vw, 8rem) 0 clamp(2rem, 4vw, 3.5rem);
  }

  .sl-inner {
    width: min(1400px, 92%);
    margin: 0 auto;
  }

  /* Titre du pôle : « 3 Terres » et le nom du pôle à la MÊME taille, seule la
     graisse change (3 Terres en gras, le pôle en fin), et les deux lignes
     rapprochées. */
  .sl-head {
    margin: 0 auto;
    width: 100%;
    text-align: center;
    font-family: "Inter", sans-serif;
    letter-spacing: -0.03em;
    color: var(--project-surface-ink, #f4efe6);
    font-size: clamp(1.5rem, 3.4vw, 3.2rem);
    transition:
      opacity 0.6s ease,
      filter 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      color var(--project-theme-transition, 920ms cubic-bezier(0.16, 1, 0.3, 1));
    transition-delay: var(--reveal-delay, 0ms);
  }

  .sl-brand {
    display: block;
    font-weight: 700;
    line-height: 1.05;
  }

  .sl-pole {
    display: block;
    font-weight: 300;
    line-height: 1.05;
  }

  /* Quand le paragraphe est seul (titre affiché plus haut, avant les cartes),
     la marge haute prévue sous le titre n'a plus lieu d'être. */
  .sl--text-only .sl-text {
    margin-top: 0;
  }

  .sl-text {
    margin: clamp(1.6rem, 2.8vw, 2.4rem) 0 0;
    /* Même style que le texte des showcases (AboutEditorialSingleShowcase) :
       grande taille, léger, pleine encre du pôle. */
    max-width: 32ch;
    font-family: "Inter", sans-serif;
    font-weight: 300;
    font-size: clamp(1.5rem, 2.5vw, 2.55rem);
    line-height: 1.18;
    letter-spacing: -0.025em;
    color: var(--project-surface-ink, #f4efe6);
    text-wrap: pretty;
    transition:
      opacity 0.6s ease,
      filter 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      color var(--project-theme-transition, 920ms cubic-bezier(0.16, 1, 0.3, 1));
    transition-delay: var(--reveal-delay, 0ms);
  }

  /* Texte gris + mots importants (.hl) en pleine encre — n'agit que si le texte
     contient des <span class="hl"> (adaptatif fond sombre/clair). */
  .sl-text:has(:global(.hl)) {
    color: color-mix(in srgb, var(--project-surface-ink, #f4efe6) 50%, transparent);
  }

  .sl-text :global(.hl) {
    color: var(--project-surface-ink, #f4efe6);
  }
</style>
