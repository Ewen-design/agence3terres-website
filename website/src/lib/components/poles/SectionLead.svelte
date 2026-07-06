<script>
  import { reveal } from "$lib/actions/reveal.js";

  // Grand titre (pleine intensité) + un seul paragraphe en dessous.
  export let lead = "";
  export let text = "";
</script>

<section class="sl" class:sl--text-only={!lead}>
  <div class="sl-inner">
    {#if lead}
      <h2 class="sl-head" use:reveal>{lead}</h2>
    {/if}
    {#if text}
      <p class="sl-text" use:reveal={{ delay: lead ? 90 : 0 }}>{text}</p>
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

  .sl-head {
    margin: 0 auto;
    /* Grand titre quasi pleine largeur, centré : taille fluide très généreuse en
       vw. Le titre passe sur deux lignes (« 3 Terres » / le pôle), ce qui laisse
       chaque ligne s'étendre sur ~90 % de la largeur — mobile comme desktop.
       Le plafond en rem borne la taille sur très grand écran. */
    max-width: none;
    width: 100%;
    font-family: "Inter", sans-serif;
    font-weight: 600;
    font-size: clamp(2.6rem, 19vw, 18rem);
    line-height: 0.9;
    letter-spacing: -0.045em;
    text-wrap: balance;
    text-align: center;
    /* Dégradé vertical : teinte visible en haut → couleur du fond en bas, si bien
       que le bas des lettres se fond dans le fond du pôle. */
    background: linear-gradient(
      to bottom,
      var(--pole-title-top, #4a4a4a) 8%,
      var(--project-surface-bg, #040404) 104%
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
    transition:
      opacity 0.6s ease,
      filter 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.85s cubic-bezier(0.22, 0.61, 0.36, 1);
    transition-delay: var(--reveal-delay, 0ms);
  }

  /* Quand le paragraphe est seul (titre affiché plus haut, avant les cartes),
     la marge haute prévue sous le titre n'a plus lieu d'être. */
  .sl--text-only .sl-text {
    margin-top: 0;
  }

  .sl-text {
    margin: clamp(1.6rem, 2.8vw, 2.4rem) 0 0;
    max-width: 58ch;
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: clamp(1.05rem, 1.35vw, 1.35rem);
    line-height: 1.5;
    color: var(--project-surface-muted, rgba(244, 239, 230, 0.7));
    text-wrap: pretty;
    transition:
      opacity 0.6s ease,
      filter 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      color var(--project-theme-transition, 920ms cubic-bezier(0.16, 1, 0.3, 1));
    transition-delay: var(--reveal-delay, 0ms);
  }
</style>
