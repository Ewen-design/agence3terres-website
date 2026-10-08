<script>
  import { reveal } from "$lib/actions/reveal.js";

  // ───────────────────────────────────────────────────────────────────────────
  //  HomeStatement — la phrase d'ouverture et le mockup, juste sous le hero.
  //
  //  Le fond sombre uni prolonge celui du hero et du bloc suivant.
  // ───────────────────────────────────────────────────────────────────────────

  export let title =
    "Nous sommes 3 Terres, <span class='dim'>l'agence dans l'ombre des projets qui durent.</span>";
  // La main en silhouette qui tient un téléphone couché (2026-10-09). Le fichier
  // garde TOUTE la largeur de sa toile : le téléphone y est centré et le bras
  // sort par le bord droit — posée en pleine largeur d'écran, l'image garde
  // donc le téléphone au milieu de la page et le bras qui file hors champ.
  // Seul le vide transparent du haut et du bas a été retiré.
  // Téléphone (≤ 640px) : même image recadrée serré autour du téléphone, sinon
  // la pleine largeur d'un écran étroit le ramène à 190 px de haut.
  export let image = "/images/statement-silhouette-1600.webp";
  export let srcset =
    "/images/statement-silhouette-960.webp 960w, /images/statement-silhouette-1600.webp 1600w, /images/statement-silhouette-2560.webp 2560w";
  export let mobileSrcset =
    "/images/statement-silhouette-mobile-800.webp 800w, /images/statement-silhouette-mobile-1200.webp 1200w";
  export let alt = "Une main tient un téléphone couché, l'écran affiche « Née pour briller »";
</script>

<section class="hstmt">
  <div class="hstmt__inner">
    <h2 class="hstmt__title" use:reveal>{@html title}</h2>

    <!-- Pleine largeur d'ÉCRAN, quel que soit l'écran : l'image sort des
         marges du bloc (voir `.hstmt__img`). -->
    <picture class="hstmt__picture">
      <source media="(max-width: 640px)" srcset={mobileSrcset} sizes="100vw" />
      <img
        class="hstmt__img"
        src={image}
        {srcset}
        sizes="100vw"
        {alt}
        loading="lazy"
        decoding="async"
        draggable="false"
      />
    </picture>
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

  /* Pleine largeur d'écran : l'image ignore les marges du bloc
     (`margin-inline` négatif jusqu'aux bords de la fenêtre ; les barres de
     défilement du site sont masquées, donc 100vw est bien la largeur visible,
     et `.hstmt` rogne tout débordement horizontal). La hauteur suit. */
  .hstmt__picture {
    display: contents;
  }

  .hstmt__img {
    display: block;
    width: 100vw;
    max-width: none;
    height: auto;
    margin-inline: calc(50% - 50vw);
    aspect-ratio: 2560 / 1252;
  }

  @media (max-width: 640px) {
    .hstmt__img {
      aspect-ratio: 1200 / 960;
    }
  }

  @media (max-width: 900px) {
    .hstmt {
      padding: clamp(3rem, 8vh, 5rem) 1rem clamp(2.5rem, 7vh, 5rem);
    }

    .hstmt__inner {
      gap: clamp(2rem, 4.4vh, 3rem);
    }
  }
</style>
