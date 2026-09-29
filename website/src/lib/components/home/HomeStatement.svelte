<script>
  import { reveal } from "$lib/actions/reveal.js";

  // ───────────────────────────────────────────────────────────────────────────
  //  HomeStatement — la phrase d'ouverture et le mockup, juste sous le hero.
  //
  //  Le fond sombre uni prolonge celui du hero et du bloc suivant.
  // ───────────────────────────────────────────────────────────────────────────

  export let title =
    "Nous sommes 3 Terres, <span class='dim'>l'agence dans l'ombre des projets qui durent.</span>";
  export let image = "/images/iphone-ambition.webp";
  export let alt = "Écran d'application dessiné par l'agence, sur iPhone";
</script>

<section class="hstmt">
  <div class="hstmt__inner">
    <h2 class="hstmt__title" use:reveal>{@html title}</h2>

    <!-- Le mockup est détouré : aucune dimension imposée, seulement deux
         plafonds. Un élément remplacé dont `width` ET `height` valent `auto` se
         réduit dans la boîte en gardant son rapport, et sa boîte colle
         exactement au visuel — c'est ce qui garde l'ombre portée juste. -->
    <img
      class="hstmt__img"
      src={image}
      {alt}
      loading="lazy"
      decoding="async"
      draggable="false"
    />
  </div>
</section>

<style>
  .hstmt {
    box-sizing: border-box;
    width: 100%;
    background: var(--bg-deep, #050709);
    color: #f4efe6;
    padding: clamp(3.5rem, 9vh, 7rem) var(--site-inset) clamp(3rem, 8vh, 6.5rem);
    overflow-x: clip;
  }

  .hstmt__inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(2.6rem, 6vh, 4.6rem);
  }

  /* Même gabarit que la phrase d'accroche du bloc suivant. */
  .hstmt__title {
    margin: 0;
    width: 45rem;
    max-width: 100%;
    font-family: var(--site-font);
    font-weight: 500;
    font-size: clamp(1.375rem, 2.9vw, 2.25rem);
    line-height: 1.2;
    letter-spacing: -0.01em;
    text-align: center;
    color: #f4efe6;
    text-wrap: balance;
  }

  .hstmt__title :global(.dim) {
    color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.5);
  }

  .hstmt__img {
    display: block;
    width: auto;
    height: auto;
    max-width: 100%;
    /* L'image est recadrée au ras de l'appareil ET centrée sur lui : le fichier
       d'origine portait 18 % de vide transparent en haut, et son ombre portée
       débordait à droite — l'appareil se retrouvait 120 px à gauche du centre.
       Ce plafond est donc bien la hauteur RÉELLE du téléphone à l'écran, et son
       milieu tombe pile sur celui du titre. */
    max-height: min(88svh, 58rem);
    /* L'appareil est détouré : une ombre douce le décolle du fond. */
    filter: drop-shadow(0 32px 60px rgba(var(--shade-rgb, 0, 0, 0), 0.55));
  }

  @media (max-width: 900px) {
    .hstmt {
      padding: clamp(3rem, 8vh, 5rem) 1rem clamp(2.5rem, 7vh, 5rem);
    }

    .hstmt__inner {
      gap: clamp(2rem, 4.4vh, 3rem);
    }

    .hstmt__img {
      max-height: min(72svh, 40rem);
    }
  }
</style>
