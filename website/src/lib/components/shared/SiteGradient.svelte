<script>
  // ───────────────────────────────────────────────────────────────────────────
  //  SiteGradient — les fonds dégradés de la librairie, repeints à la palette.
  //
  //  Cinq dégradés portés depuis `Librairie/src/lib/degrades.js` : leurs
  //  déclarations ont été RENDUES par les fonctions de la librairie elle-même,
  //  avec la palette du site en entrée — jamais retapées à la main. Pour en
  //  changer les couleurs, rejouer la génération plutôt que corriger ici :
  //  chaque rampe compte des dizaines d'arrêts.
  //
  //  La palette passée : `fond` = le noir du site, `accent` = l'indigo du halo
  //  des boutons, `nuance` = son bleu très pâle, `second` = le violet entre les
  //  deux. Seul « Aura spectre » garde ses couleurs d'origine.
  //
  //  ⚠️ Le composant ne fait QUE le fond : il se pose en absolu dans un parent
  //  positionné, derrière le contenu. C'est à l'appelant de gérer l'empilement
  //  (`z-index`) et, s'il en faut un, le voile de lisibilité par-dessus.
  // ───────────────────────────────────────────────────────────────────────────

  /** `aura-spectre` | `halo-bleu` | `arete` | `dunes` | `ellipses` */
  export let nom = "halo-bleu";
  /** Opacité du calque — pour le poser en retrait sous un texte. */
  export let opacity = 1;
  /** Classe supplémentaire, si l'appelant veut le cadrer autrement. */
  let extra = "";
  export { extra as class };

  /*  La dérive lente des peints. Elle est en `transform`, pas en
   *  `background-position` comme dans la librairie : déplacer un fond REPEINT la
   *  couche à chaque image, et ces fonds sont chers (plusieurs dégradés plus un
   *  grain fondu en `overlay`). Mesuré sur Firefox : 12 ms par image rien que
   *  pour eux. En `transform`, la couche est peinte UNE FOIS et le compositeur
   *  ne fait plus que la déplacer. */
  const PEINTS = new Set(["arete", "dunes", "ellipses"]);
  $: derive = PEINTS.has(nom);
</script>

<div class={`grad-wrap ${extra}`} style={opacity === 1 ? undefined : `opacity:${opacity};`} aria-hidden="true">
  <div class={`grad grad--${nom}`} class:grad--derive={derive}></div>
</div>

<style>
  /*  L'enveloppe rogne et ISOLE la peinture : `contain: paint` dit au navigateur
   *  que rien n'en sort, donc qu'il peut garder la couche en cache au lieu de la
   *  repeindre dès que la page bouge autour. */
  .grad-wrap {
    position: absolute;
    inset: 0;
    overflow: hidden;
    contain: paint;
    pointer-events: none;
  }

  /*  Le fond déborde de six pour cent : c'est la réserve dans laquelle la dérive
   *  se déplace sans jamais découvrir un bord. */
  .grad {
    position: absolute;
    inset: -6%;
    transform: translateZ(0);
    backface-visibility: hidden;
    will-change: transform;
  }

  .grad--derive {
    animation: deg-derive-peint 29s ease-in-out infinite;
  }

  /*  « Aura spectre » — Relevé sur une photographie d’écran (IMG_2556)
   *  Gardé dans ses couleurs d'origine : c'est un spectre, le repeindre en bleu le viderait de ce qui en fait un spectre. */
  .grad:global(.grad--aura-spectre) {
    --deg-fond: #020202;
    --deg-1: #0936b7;
    --deg-2: #f3986b;
    --deg-3: #ed5b92;
    background-color: var(--deg-fond);
    background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='linear' slope='0.5'/></feComponentTransfer></filter><rect width='200' height='200' filter='url(%23g)'/></svg>"), linear-gradient(90deg, color-mix(in srgb, var(--deg-fond) 100.0%, transparent) 0.0%, color-mix(in srgb, var(--deg-fond) 95.7%, transparent) 0.5%, color-mix(in srgb, var(--deg-fond) 84.4%, transparent) 1.0%, color-mix(in srgb, var(--deg-fond) 68.4%, transparent) 1.5%, color-mix(in srgb, var(--deg-fond) 50.0%, transparent) 2.0%, color-mix(in srgb, var(--deg-fond) 31.6%, transparent) 2.5%, color-mix(in srgb, var(--deg-fond) 15.6%, transparent) 3.0%, color-mix(in srgb, var(--deg-fond) 4.3%, transparent) 3.5%, color-mix(in srgb, var(--deg-fond) 0.0%, transparent) 4.0%, color-mix(in srgb, var(--deg-fond) 0.0%, transparent) 96.0%, color-mix(in srgb, var(--deg-fond) 4.3%, transparent) 96.5%, color-mix(in srgb, var(--deg-fond) 15.6%, transparent) 97.0%, color-mix(in srgb, var(--deg-fond) 31.6%, transparent) 97.5%, color-mix(in srgb, var(--deg-fond) 50.0%, transparent) 98.0%, color-mix(in srgb, var(--deg-fond) 68.4%, transparent) 98.5%, color-mix(in srgb, var(--deg-fond) 84.4%, transparent) 99.0%, color-mix(in srgb, var(--deg-fond) 95.7%, transparent) 99.5%, color-mix(in srgb, var(--deg-fond) 100.0%, transparent) 100.0%), radial-gradient(ellipse 74% 68% at 50% 50%, color-mix(in srgb, var(--deg-fond) 0.0%, transparent) 28.0%, color-mix(in srgb, var(--deg-fond) 4.3%, transparent) 37.0%, color-mix(in srgb, var(--deg-fond) 15.6%, transparent) 46.0%, color-mix(in srgb, var(--deg-fond) 31.6%, transparent) 55.0%, color-mix(in srgb, var(--deg-fond) 50.0%, transparent) 64.0%, color-mix(in srgb, var(--deg-fond) 68.4%, transparent) 73.0%, color-mix(in srgb, var(--deg-fond) 84.4%, transparent) 82.0%, color-mix(in srgb, var(--deg-fond) 95.7%, transparent) 91.0%, color-mix(in srgb, var(--deg-fond) 100.0%, transparent) 100.0%), linear-gradient(180deg, var(--deg-fond) 0.0%, #122a72 4.5%, #4b36aa 9.0%, #200932 15.0%, #0d0619 20.0%, #08072e 25.0%, #050c5e 30.0%, #071b94 35.0%, #0936b7 40.0%, #2558c8 45.0%, #5873d0 50.0%, #827fcf 55.0%, #ae87c4 60.0%, #d388a2 65.0%, #e98c67 70.0%, #f3986b 75.0%, #f09ab8 80.0%, #ed95e6 85.0%, #ed5b92 90.0%, #7d2440 95.0%, var(--deg-fond) 100.0%);
    background-size: 220px 220px, auto, auto, auto;
    background-blend-mode: overlay, normal, normal, normal;
  }

  /*  « Halo bleu » — Relevé sur une photographie d’écran (IMG_2557)
   *  Palette et intensité propres — voir la note au-dessus : sur un pied de page pleine largeur, la nuance pâle du site y faisait un anneau gris. */
  .grad:global(.grad--halo-bleu) {
    --deg-fond: #050709;
    --deg-1: #3f51e8;
    --deg-2: #101a4d;
    --deg-3: #6f79ff;
    background-color: var(--deg-fond);
    background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='linear' slope='0.5'/></feComponentTransfer></filter><rect width='200' height='200' filter='url(%23g)'/></svg>"), linear-gradient(90deg, color-mix(in srgb, var(--deg-fond) 100.0%, transparent) 0.0%, color-mix(in srgb, var(--deg-fond) 95.7%, transparent) 3.0%, color-mix(in srgb, var(--deg-fond) 84.4%, transparent) 5.9%, color-mix(in srgb, var(--deg-fond) 68.4%, transparent) 8.9%, color-mix(in srgb, var(--deg-fond) 50.0%, transparent) 11.8%, color-mix(in srgb, var(--deg-fond) 31.6%, transparent) 14.8%, color-mix(in srgb, var(--deg-fond) 15.6%, transparent) 17.8%, color-mix(in srgb, var(--deg-fond) 4.3%, transparent) 20.7%, color-mix(in srgb, var(--deg-fond) 0.0%, transparent) 23.7%, color-mix(in srgb, var(--deg-fond) 0.0%, transparent) 76.3%, color-mix(in srgb, var(--deg-fond) 4.3%, transparent) 79.3%, color-mix(in srgb, var(--deg-fond) 15.6%, transparent) 82.2%, color-mix(in srgb, var(--deg-fond) 31.6%, transparent) 85.2%, color-mix(in srgb, var(--deg-fond) 50.0%, transparent) 88.2%, color-mix(in srgb, var(--deg-fond) 68.4%, transparent) 91.1%, color-mix(in srgb, var(--deg-fond) 84.4%, transparent) 94.1%, color-mix(in srgb, var(--deg-fond) 95.7%, transparent) 97.0%, color-mix(in srgb, var(--deg-fond) 100.0%, transparent) 100.0%), linear-gradient(180deg, color-mix(in srgb, var(--deg-fond) 100.0%, transparent) 0.0%, color-mix(in srgb, var(--deg-fond) 95.7%, transparent) 2.5%, color-mix(in srgb, var(--deg-fond) 84.4%, transparent) 5.1%, color-mix(in srgb, var(--deg-fond) 68.4%, transparent) 7.6%, color-mix(in srgb, var(--deg-fond) 50.0%, transparent) 10.2%, color-mix(in srgb, var(--deg-fond) 31.6%, transparent) 12.7%, color-mix(in srgb, var(--deg-fond) 15.6%, transparent) 15.3%, color-mix(in srgb, var(--deg-fond) 4.3%, transparent) 17.8%, color-mix(in srgb, var(--deg-fond) 0.0%, transparent) 20.4%, color-mix(in srgb, var(--deg-fond) 0.0%, transparent) 79.6%, color-mix(in srgb, var(--deg-fond) 4.3%, transparent) 82.2%, color-mix(in srgb, var(--deg-fond) 15.6%, transparent) 84.7%, color-mix(in srgb, var(--deg-fond) 31.6%, transparent) 87.3%, color-mix(in srgb, var(--deg-fond) 50.0%, transparent) 89.8%, color-mix(in srgb, var(--deg-fond) 68.4%, transparent) 92.4%, color-mix(in srgb, var(--deg-fond) 84.4%, transparent) 94.9%, color-mix(in srgb, var(--deg-fond) 95.7%, transparent) 97.5%, color-mix(in srgb, var(--deg-fond) 100.0%, transparent) 100.0%), radial-gradient(ellipse 56% 49% at 50% 50%, color-mix(in oklab, var(--deg-1) 55%, #000) 0.0%, color-mix(in oklab, var(--deg-1) 55%, #000) 30.0%, var(--deg-1) 55.0%, var(--deg-3) 72.0%, var(--deg-2) 86.0%, var(--deg-fond) 100.0%);
    background-size: 220px 220px, auto, auto, auto;
    background-blend-mode: overlay, normal, normal, normal;
  }

  /*  « Arête » — FeralUI gradient studio — « Edge »
   *  Peinture recolorée par la TEINTE seule (background-blend-mode: hue) : le modelé reste, la couleur devient celle du site. */
  .grad:global(.grad--arete) {
    --deg-fond: #050709;
    --deg-1: #5768ff;
    --deg-2: #d0dbff;
    --deg-3: #8f93ff;
    --deg-peint-fond: var(--bg-deep, #050709);
    background-color: var(--deg-peint-fond, color-mix(in oklab, var(--deg-1) 55%, #000));
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-image: linear-gradient(155deg, color-mix(in srgb, var(--deg-1) 100%, transparent) 0%, color-mix(in srgb, color-mix(in oklab, var(--deg-3) 35%, var(--deg-1)) 100%, transparent) 50%, color-mix(in srgb, var(--deg-1) 100%, transparent) 100%), url(/degrades/arete-1.webp), url(/degrades/arete-2.webp);
    background-blend-mode: hue, normal, normal;
  }

  /*  « Dunes » — FeralUI gradient studio — « Dunes »
   *  Idem — la peinture garde ses ombres, sa teinte passe au bleu du site. */
  .grad:global(.grad--dunes) {
    --deg-fond: #050709;
    --deg-1: #5768ff;
    --deg-2: #d0dbff;
    --deg-3: #8f93ff;
    --deg-peint-fond: var(--bg-deep, #050709);
    background-color: var(--deg-peint-fond, color-mix(in oklab, var(--deg-1) 55%, #000));
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-image: linear-gradient(155deg, color-mix(in srgb, var(--deg-1) 100%, transparent) 0%, color-mix(in srgb, color-mix(in oklab, var(--deg-3) 35%, var(--deg-1)) 100%, transparent) 50%, color-mix(in srgb, var(--deg-1) 100%, transparent) 100%), url(/degrades/dunes-1.webp), url(/degrades/dunes-2.webp);
    background-blend-mode: hue, normal, normal;
  }

  /*  « Ellipses » — FeralUI gradient studio — « Ellipses »
   *  Idem. */
  .grad:global(.grad--ellipses) {
    --deg-fond: #050709;
    --deg-1: #5768ff;
    --deg-2: #d0dbff;
    --deg-3: #8f93ff;
    --deg-peint-fond: var(--bg-deep, #050709);
    background-color: var(--deg-peint-fond, color-mix(in oklab, var(--deg-1) 55%, #000));
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-image: linear-gradient(155deg, color-mix(in srgb, var(--deg-1) 100%, transparent) 0%, color-mix(in srgb, color-mix(in oklab, var(--deg-3) 35%, var(--deg-1)) 100%, transparent) 50%, color-mix(in srgb, var(--deg-1) 100%, transparent) 100%), url(/degrades/ellipses-1.webp), url(/degrades/ellipses-2.webp);
    background-blend-mode: hue, normal, normal;
  }

  @media (prefers-reduced-motion: reduce) {
    .grad {
      animation: none !important;
    }
  }
</style>
