<script>
  // ───────────────────────────────────────────────────────────────────────────
  //  ProjectActionDuo — les deux sorties d'une page projet.
  //
  //  « Duo de cartes dégradées à bouton + » de la librairie, monté sur le
  //  gabarit que le site emploie déjà pour ce geste (`home/HomeActionCards`) :
  //  une carte large qui porte un téléphone débordant par la gauche, une carte
  //  étroite à côté, et dans chaque coin le « + » en verre du site.
  //
  //  ── UNE SEULE TEINTE, CELLE DU PROJET ─────────────────────────────────────
  //  La page ne donne qu'une couleur : celle de la marque dont elle parle. Les
  //  deux cartes en sont dérivées — la première la porte franchement, la
  //  seconde en est une version très assombrie. C'est ce qui manquait : deux
  //  teintes choisies à la main donnaient un duo qui n'appartenait à personne.
  //  Le lavis descend vers le NOIR DU SITE, jamais vers le blanc : sur une page
  //  sombre, un dégradé qui s'éclaircit vire au pastel et l'encre blanche y
  //  devient illisible à mi-course.
  //
  //  ── LE TÉLÉPHONE ─────────────────────────────────────────────────────────
  //  Cadre et encoche sont DESSINÉS EN CSS ; seul l'écran porte une image. Il
  //  déborde par le bord gauche et la carte le coupe. `fit` et `bg` servent aux
  //  visuels qu'il ne faut pas rogner (un logo sur aplat, par exemple) : l'image
  //  reste entière et sa propre couleur remplit l'écran autour.
  //
  //  ⚠️ LE VERRE DU « + » : la carte porte `isolation: isolate`, donc son lavis
  //  est dans la MÊME racine d'arrière-plan que le bouton — c'est ce qui lui
  //  donne de quoi flouter. Ne poser ni `filter`, ni `opacity`, ni `use:reveal`
  //  sur un parent du bouton, sinon le verre redevient un aplat.
  // ───────────────────────────────────────────────────────────────────────────
  import { reveal } from "$lib/actions/reveal.js";

  /** La couleur de la marque du projet. Les deux cartes en découlent. */
  export let tint = "#26408f";
  /** `{ label, title, href, external, phone: { image, fit, bg, position } }` */
  export let primary = {};
  /** La carte étroite, même forme sans téléphone. */
  export let secondary = {};

  //  Le halo de contour du « + » suit le curseur. Deux différences avec le
  //  header : le survol se fait sur TOUTE la carte, et les coordonnées sont
  //  bornées à la boîte du bouton — sans ce bornage le dégradé radial partirait
  //  à plusieurs centaines de pixels et le liseré resterait éteint.
  function handlePlusMove(event) {
    const plus = event.currentTarget.querySelector(".duo__plus");
    if (!plus) return;
    const r = plus.getBoundingClientRect();
    const hold = (v, max) => Math.max(-24, Math.min(max + 24, v));
    plus.style.setProperty("--mx", `${hold(event.clientX - r.left, r.width)}px`);
    plus.style.setProperty("--my", `${hold(event.clientY - r.top, r.height)}px`);
  }

  const NOIR = "var(--bg-deep, #050709)";
  const lueur =
    "radial-gradient(120% 100% at 12% 6%, rgba(255,255,255,0.16), rgba(255,255,255,0) 58%)";

  $: fondPrimaire =
    `${lueur}, linear-gradient(118deg,` +
    ` color-mix(in srgb, ${tint} 82%, ${NOIR}) 0%,` +
    ` color-mix(in srgb, ${tint} 34%, ${NOIR}) 100%)`;

  $: fondSecondaire =
    `${lueur}, linear-gradient(118deg,` +
    ` color-mix(in srgb, ${tint} 26%, ${NOIR}) 0%,` +
    ` color-mix(in srgb, ${tint} 10%, ${NOIR}) 100%)`;
</script>

<section class="duo" aria-label="Poursuivre">
  <a
    class="duo__card duo__card--primary"
    class:has-phone={Boolean(primary.phone)}
    href={primary.href}
    target={primary.external ? "_blank" : undefined}
    rel={primary.external ? "noopener noreferrer" : undefined}
    aria-label={primary.title}
    data-cursor="button"
    data-sveltekit-preload-data={primary.external ? undefined : "hover"}
    style={`background-image:${fondPrimaire};`}
    on:mousemove={handlePlusMove}
  >
    {#if primary.phone}
      <div class="duo__phone" aria-hidden="true">
        <div class="duo__screen" style={primary.phone.bg ? `background:${primary.phone.bg};` : undefined}>
          <img
            src={primary.phone.image}
            alt=""
            style:object-fit={primary.phone.fit ?? "cover"}
            style:object-position={primary.phone.position ?? "center"}
            loading="lazy"
            decoding="async"
            draggable="false"
          />
        </div>
        <span class="duo__notch"></span>
      </div>
    {/if}

    <div class="duo__body">
      {#if primary.label}<span class="duo__label">{primary.label}</span>{/if}
      <h2 class="duo__title" use:reveal>{primary.title}</h2>
    </div>

    <span class="duo__plus" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" /></svg>
    </span>
  </a>

  <a
    class="duo__card duo__card--secondary"
    href={secondary.href}
    target={secondary.external ? "_blank" : undefined}
    rel={secondary.external ? "noopener noreferrer" : undefined}
    aria-label={secondary.title}
    data-cursor="button"
    data-sveltekit-preload-data={secondary.external ? undefined : "hover"}
    style={`background-image:${fondSecondaire};`}
    on:mousemove={handlePlusMove}
  >
    <div class="duo__body">
      {#if secondary.label}<span class="duo__label">{secondary.label}</span>{/if}
      <h2 class="duo__title" use:reveal={{ delay: 100 }}>{secondary.title}</h2>
    </div>

    <span class="duo__plus" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" /></svg>
    </span>
  </a>
</section>

<style>
  .duo {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
    gap: var(--site-inset);
    padding:
      clamp(5rem, 9vw, 8rem)
      var(--project-side-padding, var(--site-inset))
      clamp(5rem, 9vw, 8rem);
    background: transparent;
  }

  .duo__card {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    min-height: clamp(21rem, 27vw, 32rem);
    padding: clamp(2rem, 4vw, 4rem) clamp(1.5rem, 3vw, 3rem) 5.5rem;
    overflow: hidden;
    isolation: isolate;
    border-radius: var(--project-media-radius, 22px);
    background-color: var(--project-surface-card, #0a0e12);
    color: #f4efe6;
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
  }

  .duo__card--primary.has-phone {
    padding-left: 34%;
  }

  /* ── Le téléphone ──
     Un cadre sombre, un écran arrondi, une encoche : rien d'autre. Il est posé
     en absolu et sort par la gauche, la carte le rogne. */
  .duo__phone {
    position: absolute;
    z-index: 3;
    left: -5.5%;
    top: 12%;
    width: clamp(8.5rem, 23%, 13.5rem);
    aspect-ratio: 9 / 19;
    padding: 0.5rem;
    border-radius: clamp(1.6rem, 2.6vw, 2.5rem);
    background: #0b0d11;
    transform: rotate(-4deg);
    transition: transform 650ms cubic-bezier(0.22, 0.61, 0.36, 1);
  }

  /* L'ombre est portée par une silhouette indépendante du cadre : une ombre
     portée s'arrête net au bord de sa boîte, et l'écart (18, 26) dépasse la
     moitié du flou, donc elle est entièrement déportée en bas à droite. */
  .duo__phone::before {
    content: "";
    position: absolute;
    inset: 2%;
    z-index: -1;
    border-radius: inherit;
    box-shadow: 18px 26px 52px rgba(var(--shade-rgb, 5, 7, 9), 0.5);
  }

  .duo__screen {
    width: 100%;
    height: 100%;
    border-radius: clamp(1.15rem, 2.1vw, 2.05rem);
    overflow: hidden;
    background: var(--bg-deep, #050709);
  }

  .duo__screen img {
    display: block;
    width: 100%;
    height: 100%;
  }

  .duo__notch {
    position: absolute;
    left: 50%;
    top: 0.95rem;
    transform: translateX(-50%);
    width: 30%;
    height: 0.72rem;
    border-radius: 999px;
    background: #0b0d11;
  }

  .duo__body {
    position: relative;
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(1.1rem, 2vw, 1.8rem);
    width: 100%;
    text-align: center;
  }

  .duo__label {
    display: inline-block;
    padding: 0.4rem 0.8rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.14);
    font-family: var(--site-font);
    font-size: clamp(0.78rem, 0.95vw, 0.95rem);
    font-weight: 500;
    line-height: 1.2;
  }

  .duo__card--secondary .duo__label {
    background: rgba(232, 239, 249, 0.09);
  }

  .duo__title {
    max-width: 17ch;
    margin: 0;
    font-family: var(--site-font);
    font-size: clamp(1.55rem, 2.2vw, 2.7rem);
    font-weight: var(--site-weight-display, 500);
    line-height: 1.12;
    letter-spacing: var(--site-display-letter-spacing, -0.028em);
    text-wrap: balance;
  }

  /* ── Le « + », au gabarit de bouton du site ──
     Verre flouté au repos, puis au survol un liseré d'un pixel allumé par un
     dégradé radial qui suit le curseur. Le masque `xor` ne garde que le
     contour, ce qui respecte le cercle. Rayons 68/78 px : le petit gabarit. */
  .duo__plus {
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

  .duo__plus::before,
  .duo__plus::after {
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

  .duo__plus::before {
    background: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-strong) 0%,
      var(--site-glow-mid) 22%,
      var(--site-glow-soft) 45%,
      var(--site-glow-fade) 62%,
      transparent 78%
    );
  }

  .duo__plus::after {
    background: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-ambient) 0%,
      var(--site-glow-outer) 42%,
      transparent 72%
    );
    filter: blur(2px);
  }

  .duo__plus svg {
    width: 1.35rem;
    height: 1.35rem;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
  }

  .duo__card:focus-visible {
    outline: 2px solid #f4efe6;
    outline-offset: 5px;
  }

  .duo__card:focus-visible .duo__plus::before,
  .duo__card:focus-visible .duo__plus::after {
    opacity: 1;
  }

  @media (hover: hover) {
    .duo__card:hover .duo__plus {
      background: rgba(255, 255, 255, 0.18);
      transform: translateZ(0) translateY(-2px);
    }

    .duo__card:hover .duo__plus::before,
    .duo__card:hover .duo__plus::after {
      opacity: 1;
    }

    .duo__card--primary:hover .duo__phone {
      transform: translateX(8px) rotate(-2deg);
    }
  }

  @media (max-width: 760px) {
    .duo {
      grid-template-columns: minmax(0, 1fr);
      padding:
        clamp(4rem, 13vw, 6rem)
        var(--project-side-padding, 0.9rem)
        clamp(4rem, 13vw, 6rem);
    }

    .duo__card {
      min-height: 22rem;
      padding: 3rem 1.4rem 5.5rem;
    }

    .duo__card--primary.has-phone {
      padding-left: 34%;
    }

    .duo__phone {
      top: 15%;
      left: -10%;
      width: 42%;
    }

    .duo__phone::before {
      box-shadow: 10px 15px 30px rgba(var(--shade-rgb, 5, 7, 9), 0.5);
    }

    .duo__notch {
      top: 0.7rem;
      height: 0.55rem;
    }

    .duo__title {
      font-size: clamp(1.45rem, 5.6vw, 2rem);
    }

    .duo__card--secondary {
      min-height: 19rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .duo__phone,
    .duo__plus,
    .duo__plus::before,
    .duo__plus::after {
      transition: none;
    }

    .duo__card--primary:hover .duo__phone {
      transform: rotate(-4deg);
    }
  }
</style>
