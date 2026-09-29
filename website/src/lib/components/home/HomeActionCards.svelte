<script>
  import { reveal } from "$lib/actions/reveal.js";
  import BlueGrainBackground from "$lib/components/shared/BlueGrainBackground.svelte";

  // Le halo de contour du « + » suit le curseur, comme le bouton du header.
  //
  //  Deux différences avec le header : le survol se fait sur TOUTE la carte (le
  //  bouton n'est qu'un rond de 3 rem dans un coin), et les coordonnées sont
  //  donc bornées à la boîte du bouton. Sans ce bornage, le dégradé radial
  //  partirait à plusieurs centaines de pixels dès que le curseur s'éloigne et
  //  le liseré resterait éteint ; borné, il s'allume du côté d'où l'on vient.
  function handlePlusMove(e) {
    const plus = e.currentTarget.querySelector(".action-card__plus");
    if (!plus) return;
    const r = plus.getBoundingClientRect();
    const hold = (v, max) => Math.max(-24, Math.min(max + 24, v));
    plus.style.setProperty("--mx", `${hold(e.clientX - r.left, r.width)}px`);
    plus.style.setProperty("--my", `${hold(e.clientY - r.top, r.height)}px`);
  }

  export let supportTitle = "De la première idée à une direction claire.";
  export let supportHref = "/apropos";
  export let contactTitle = "Votre prochain projet commence ici.";
  export let contactHref = "/contact";
</script>

<section class="action-cards" aria-label="Accompagnement et prise de contact">
  <a
    class="action-card action-card--support"
    href={supportHref}
    aria-label="Découvrir notre accompagnement"
    data-cursor="button"
    data-sveltekit-preload-data="hover"
    on:mousemove={handlePlusMove}
  >
    <BlueGrainBackground />
    <div class="action-card__phone" aria-hidden="true">
      <img
        class="action-card__image"
        src="/images/iphone-ambition.webp"
        alt=""
        width="1600"
        height="3202"
        loading="lazy"
        decoding="async"
        draggable="false"
      />
    </div>
    <div class="action-card__body">
      <span class="action-card__label">Accompagnement</span>
      <h2 class="action-card__title" use:reveal>{supportTitle}</h2>
    </div>
    <span class="action-card__plus card-plus" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" /></svg>
    </span>
  </a>

  <a
    class="action-card action-card--contact"
    href={contactHref}
    aria-label="Parlons de votre projet"
    data-cursor="button"
    data-sveltekit-preload-data="hover"
    on:mousemove={handlePlusMove}
  >
    <div class="action-card__body">
      <span class="action-card__label">Parlons-en</span>
      <h2 class="action-card__title" use:reveal={{ delay: 100 }}>{contactTitle}</h2>
    </div>
    <span class="action-card__plus card-plus" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" /></svg>
    </span>
  </a>
</section>

<style>
  /* ── Le trio de blocs de la home ───────────────────────────────────────────
     Ces deux cartes et `HomeClients` juste dessous forment UNE série : le pas
     entre les trois est celui du `gap` (une marge de site), et l'air se met
     autour du trio, pas entre ses membres. La marge du haut se pose ici, celle
     du bas dans `HomeClients` — les toucher séparément désaligne la série. */
  .action-cards {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
    gap: var(--site-inset);
    padding: clamp(9rem, 20vh, 16rem) var(--site-inset) 0;
    background: var(--bg-deep, #050709);
  }

  .action-card {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    min-height: clamp(22rem, 28vw, 34rem);
    padding: clamp(2rem, 4vw, 4rem) clamp(1.5rem, 3vw, 3rem) 5.5rem;
    overflow: hidden;
    isolation: isolate;
    border-radius: var(--project-media-radius, 22px);
    color: #f4efe6;
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
  }

  .action-card--support {
    background: #5663ed;
    padding-left: 33%;
  }

  .action-card--contact {
    background: var(--bg-panel, #171b21);
  }

  .action-card__phone {
    position: absolute;
    z-index: 3;
    top: 13%;
    left: -13%;
    width: 43%;
    height: auto;
    pointer-events: none;
    isolation: isolate;
    overflow: visible;
    transform: rotate(-5deg);
    transition: transform 650ms cubic-bezier(0.22, 0.61, 0.36, 1);
  }

  /* L'ombre est portée par une silhouette arrondie indépendante du bitmap :
     Safari ne peut plus la rogner aux limites de la couche de l'image.
     (Le WebP portait AUSSI une ombre cuite, coupée net au bord du fichier —
     elle en a été retirée le 2026-09-10, l'ombre est maintenant celle-ci.)

     ── Deux mesures à ne pas bricoler séparément ──────────────────────────
     Le corps opaque du téléphone commence à 1,7 % du bord du fichier et son
     arrondi vaut ~15,6 % de la largeur. La silhouette doit rester ENTIÈREMENT
     dessous : plus rentrée (4 %) ET plus arrondie (18 %) que lui. Sinon son
     coin dépasse de l'arrondi du téléphone, et comme une ombre portée s'arrête
     net au bord de sa boîte, on voit un angle droit sortir de l'appareil.

     Et l'écart (22, 30) est plus grand que la moitié du flou (55/2) : l'ombre
     est ainsi entièrement déportée en bas à droite, donc rien ne dépasse en
     haut ni à gauche, là où le téléphone ne la couvrirait pas. */
  .action-card__phone::before {
    content: "";
    position: absolute;
    inset: 4% 4.5% 4%;
    z-index: -1;
    border-radius: 18% / 9%;
    box-shadow: 22px 30px 55px rgba(5, 7, 9, 0.45);
  }

  .action-card__image {
    display: block;
    width: 100%;
    height: auto;
  }

  .action-card__body {
    position: relative;
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(1.1rem, 2vw, 1.8rem);
    width: 100%;
    text-align: center;
  }

  .action-card__label {
    display: inline-block;
    padding: 0.4rem 0.8rem;
    border-radius: 999px;
    background: rgba(5, 7, 9, 0.18);
    font-family: var(--site-font);
    font-size: clamp(0.78rem, 0.95vw, 0.95rem);
    font-weight: 500;
    line-height: 1.2;
  }

  .action-card--contact .action-card__label {
    background: rgba(232, 239, 249, 0.08);
  }

  .action-card__title {
    max-width: 17ch;
    margin: 0;
    font-family: var(--site-font);
    font-size: clamp(1.65rem, 2.35vw, 2.9rem);
    font-weight: var(--site-weight-display, 500);
    line-height: 1.12;
    letter-spacing: var(--site-display-letter-spacing, -0.028em);
    text-wrap: balance;
  }

  /* ── Le « + » au gabarit de bouton du site ────────────────────────────────
     Même recette que le bouton du header et que celui de `ContactBlock`, juste
     ramenée au rond : verre flouté au repos (`rgba(255,255,255,.11)` +
     `backdrop-filter`), et au survol un liseré d'un pixel allumé par un dégradé
     radial qui suit le curseur. Le masque `xor` des pseudo-éléments ne garde
     que le contour, ce qui respecte le cercle. Les rayons 68/78 px sont ceux du
     petit gabarit (header) — voir `shared/layout/Header.svelte`.

     Le flou a de quoi mordre : la carte porte `isolation: isolate`, donc le
     fond bleu (ou l'aplat gris de la carte contact) est DANS la même racine
     d'arrière-plan que le bouton. Ne pas poser de `filter`, d'`opacity` ni de
     `use:reveal` sur un parent du bouton, sinon le verre redevient un aplat. */
  .action-card__plus {
    position: absolute;
    right: clamp(1.2rem, 2.2vw, 2.3rem);
    bottom: clamp(1.2rem, 2.2vw, 2.3rem);
    z-index: 3;
    display: grid;
    place-items: center;
    width: clamp(2.9rem, 3.5vw, 3.8rem);
    aspect-ratio: 1;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    will-change: transform, opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transition:
      transform 1.2s cubic-bezier(0.22, 0.61, 0.36, 1),
      background 1.2s cubic-bezier(0.22, 0.61, 0.36, 1);
  }

  .action-card__plus::before,
  .action-card__plus::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  .action-card__plus::before {
    background: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-strong) 0%,
      var(--site-glow-mid) 22%,
      var(--site-glow-soft) 45%,
      var(--site-glow-fade) 62%,
      transparent 78%
    );
  }

  .action-card__plus::after {
    background: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-ambient) 0%,
      var(--site-glow-outer) 42%,
      transparent 72%
    );
    filter: blur(2px);
  }

  .action-card__plus svg {
    width: 1.35rem;
    height: 1.35rem;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
  }

  .action-card:focus-visible {
    outline: 2px solid #f4efe6;
    outline-offset: 5px;
  }

  .action-card:focus-visible .action-card__plus::before,
  .action-card:focus-visible .action-card__plus::after {
    opacity: 1;
  }

  @media (hover: hover) {
    .action-card:hover .action-card__plus {
      background: rgba(255, 255, 255, 0.18);
      transform: translateZ(0) translateY(-2px);
    }

    .action-card:hover .action-card__plus::before,
    .action-card:hover .action-card__plus::after {
      opacity: 1;
    }

    .action-card--support:hover .action-card__phone {
      transform: translateX(8px) rotate(-3deg);
    }
  }

  @media (max-width: 760px) {
    .action-cards {
      grid-template-columns: minmax(0, 1fr);
      padding-top: clamp(7rem, 16vh, 10rem);
    }

    .action-card {
      min-height: 23rem;
      padding: 3rem 1.5rem 5.5rem;
    }

    .action-card--support {
      padding-left: 32%;
    }

    .action-card__phone {
      top: 20%;
      left: -19%;
      width: 52%;
    }

    /* Le téléphone fait un peu plus de la moitié de sa taille de bureau ;
       l'ombre est en pixels, elle doit suivre. */
    .action-card__phone::before {
      box-shadow: 12px 17px 31px rgba(5, 7, 9, 0.45);
    }

    .action-card__title {
      font-size: clamp(1.55rem, 5.8vw, 2.1rem);
    }

    .action-card--contact {
      min-height: 20rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .action-card__phone,
    .action-card__plus,
    .action-card__plus::before,
    .action-card__plus::after {
      transition: none;
    }

    .action-card--support:hover .action-card__phone {
      transform: rotate(-5deg);
    }
  }
</style>
