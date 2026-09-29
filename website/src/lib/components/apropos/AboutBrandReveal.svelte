<script>
  import { reveal } from "$lib/actions/reveal.js";

  // ─────────────────────────────────────────────────────────────────────────
  //  AboutBrandReveal
  //
  //  Remplace AboutBentoWindows (grille de six blocs percés dans une image
  //  commune), supprimé le 2026-09-03. Une seule image, très grande, et la
  //  promesse posée dans son coin bas droit. Rien d'autre.
  //
  //  L'image porte le propos à elle seule : une main sort du noir en tenant le
  //  site d'un client. C'est très exactement ce que dit la promesse — la marque
  //  n'est pas inventée, elle est amenée à la lumière — donc le bloc n'a besoin
  //  ni de cartes, ni de chiffres, ni de liste d'étapes pour l'expliquer.
  //
  //  ── Pleine largeur, sans cadre ──────────────────────────────────────────
  //  Contrairement aux autres blocs de la page, celui-ci n'est pas posé dans un
  //  cadre arrondi aux marges du site : l'image déborde jusqu'aux deux bords.
  //  C'est possible parce que ses quatre coins sont d'un noir presque pur —
  //  la jonction avec le fond de section ne se voit pas, et un cadre arrondi
  //  n'aurait rien à délimiter. Le fond de section reste celui de l'ancien
  //  bloc (`--bg-deep`), donc rien ne bouge dans l'enchaînement des sections.
  // ─────────────────────────────────────────────────────────────────────────

  /** L'accroche au-dessus de l'image (HTML, `.dim` pour la seconde phrase). */
  export let lead = "";
  export let image = "/images/mockup-ludo.webp";
  export let alt =
    "Le site d'une marque cliente, tenu à bout de bras et sortant de l'ombre";
  /**
   * La promesse, dans le coin bas droit.
   *
   * Même gabarit que l'accroche au-dessus : première phrase en encre pleine,
   * la suite en `.dim` à 50 %. C'est la convention d'accroche du site, et elle
   * s'applique ici pour que les deux textes du bloc se répondent.
   *
   * Attention à la ponctuation collée à un `.dim` : `use:reveal` découpe le
   * texte en un `<span>` par mot, et un point posé JUSTE APRÈS un `</span>`
   * devient un mot à lui seul — donc un point de coupure. On a eu « nous la
   * révélons » en fin de ligne et « . Tout est déjà là » au début de la
   * suivante. La ponctuation qui suit une mise en forme va DEDANS.
   */
  export let quote =
    "Nous n'inventons pas une marque. <span class='dim'>Nous révélons la vôtre.</span>";
</script>

<section class="reveal-block" aria-label="Notre promesse">
  {#if lead}
    <h2 class="reveal-block__lead" use:reveal>{@html lead}</h2>
  {/if}

  <figure class="reveal-block__figure">
    <img
      class="reveal-block__img"
      src={image}
      {alt}
      loading="lazy"
      decoding="async"
      draggable="false"
    />

    <figcaption class="reveal-block__note">
      <p class="reveal-block__quote" use:reveal>{@html quote}</p>
    </figcaption>
  </figure>
</section>

<style>
  .reveal-block {
    --rb-ink: #f4efe6;
    --rb-muted: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.52);

    width: 100%;
    background: var(--bg-deep, #000);
    color: var(--rb-ink);
    /* Les marges latérales ne servent plus qu'à l'accroche : l'image passe
       par-dessous. Bien moins d'air en bas que dans le bloc remplacé : l'image se termine
       elle-même sur un noir plein sur toute sa largeur, elle fournit déjà la
       respiration que ce padding devait créer. */
    padding: clamp(5rem, 13vh, 11rem) var(--site-inset) clamp(4.5rem, 10vh, 9rem);
    overflow-x: clip;
  }

  /* Le gabarit d'accroche du site, repris tel quel de l'ancien bloc : centré,
     45 rem, la première phrase en encre pleine et la suite à 50 %. */
  .reveal-block__lead {
    margin: 0 auto calc(4vh + clamp(4.5rem, 11vh, 9rem));
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

  .reveal-block__lead :global(.dim) {
    color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.5);
  }

  /* L'image ressort des marges de la section pour toucher les deux bords.
     `100vw` et non `100%` : la largeur de la fenêtre, sans compter la barre de
     défilement — d'où le recentrage par la moitié de l'écart. */
  .reveal-block__figure {
    position: relative;
    margin: 0 calc(50% - 50vw);
    width: 100vw;
    display: block;
  }

  .reveal-block__img {
    display: block;
    width: 100%;
    height: auto;
  }

  /* Repère de cadrage : le téléphone occupe la bande 42–77 % de la largeur du
     master, son centre est donc à ~60 % et non au milieu. Toute recadrage doit
     partir de là, pas du centre géométrique. */

  /* La promesse, dans le coin bas droit, légèrement POSÉE SUR l'image : le bas
     du cadre est d'un noir pur sur toute sa largeur, le texte y tient sans
     voile. C'est aussi pour ça qu'il n'y en a pas — un dégradé n'aurait rien à
     assombrir, et le site n'en veut plus (voir la note en mémoire). */
  .reveal-block__note {
    position: absolute;
    right: var(--site-inset);
    /* Posée tout en bas du cadre : le noir plein du bas de l'image lui laisse
       la place, et l'écart au-dessus la détache nettement de la main. */
    bottom: clamp(0.5rem, 1.2vw, 1.1rem);
    /* Étroite : la phrase est courte, et sur deux ou trois lignes serrées elle
       tient mieux le coin qu'étalée sur toute la moitié droite. */
    width: min(28rem, 36vw);
  }

  /* Exactement le gabarit de l'accroche du dessus — même graisse, même échelle,
     même resserrement — pour que les deux textes du bloc se lisent comme une
     seule voix. Seul l'alignement change : ferré à gauche dans un pavé poussé à
     droite, et non centré. */
  .reveal-block__quote {
    margin: 0;
    font-family: var(--site-font);
    font-weight: 500;
    font-size: clamp(1.375rem, 2.9vw, 2.25rem);
    line-height: 1.2;
    letter-spacing: -0.01em;
    color: #f4efe6;
    text-wrap: balance;
  }

  .reveal-block__quote :global(.dim) {
    color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.5);
  }

  /* ── Écrans étroits ─────────────────────────────────────────────────────── */
  @media (max-width: 900px) {
    .reveal-block {
      padding: clamp(3.5rem, 9vh, 6rem) 1rem clamp(3rem, 8vh, 5rem);
    }

    /* En portrait, la main occupe presque tout le cadre : la promesse ne tient
       plus dedans sans marcher dessus. Elle repasse SOUS l'image, toujours
       ferrée à droite. */
    /* Ferrée à DROITE en portrait aussi, comme en desktop. L'image est pleine
       largeur, la note non — le padding lui rend la marge de la section, sinon
       le texte se calerait 1 rem plus à droite que le reste de la page. */
    .reveal-block__note {
      position: static;
      width: 100%;
      max-width: 20rem;
      margin: clamp(1.4rem, 6vw, 2.4rem) 0 0 auto;
      padding: 0 1rem;
    }

    /* En portrait, l'image posée à sa taille naturelle ne fait qu'un tiers de
       hauteur d'écran : le téléphone y devient minuscule. On lui impose donc
       une hauteur et on la recadre en `cover`, centrée sur l'appareil (60 % de
       la largeur du master). Le noir vide de la gauche part au recadrage —
       c'est tout ce qu'on y perd. */
    .reveal-block__img {
      height: min(76svh, 640px);
      object-fit: cover;
      object-position: 60% center;
    }

    .reveal-block__quote {
      font-size: clamp(1.2rem, 5.4vw, 1.6rem);
    }
  }
</style>
