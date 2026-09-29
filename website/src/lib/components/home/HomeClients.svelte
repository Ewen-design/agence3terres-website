<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { reveal } from "$lib/actions/reveal.js";

  // ───────────────────────────────────────────────────────────────────────────
  //  HomeClients — troisième bloc du trio de la home (2026-09-10)
  //
  //  Il ferme la série ouverte par `HomeActionCards` : deux cartes côte à côte,
  //  puis celle-ci sur toute la largeur. Même cadre, même pastille, même bouton
  //  « + » — seul le contenu change.
  //
  //  Le principe est repris de `AboutClients` (page à propos), en plus court :
  //  la phrase à deux tons à gauche, et à droite le visuel d'un projet avec LE
  //  LOGO DE LA MARQUE DANS LE COIN. Les deux basculent EN MÊME TEMPS : un logo
  //  qui tournerait seul au-dessus d'une image fixe ne dirait rien, alors que la
  //  paire « voilà la marque, voilà ce qu'on a fait pour elle » se lit sans
  //  légende.
  //
  //  ── Les logos sont des fichiers à part, en blanc et sans fond ────────────
  //  Aucun n'est utilisable tel que le client l'a livré (deux SVG bleu nuit, un
  //  aplat bleu posé sur du noir). Ils sont convertis une fois pour toutes par
  //  `media-source/logos-clients.sh` vers `/images/logos-clients/`. Ne pas
  //  pointer sur les fichiers d'origine.
  //
  //  ── L'échelle des logos est réglée UN PAR UN ─────────────────────────────
  //  Lybra est un mot large et bas, Ludosphères un monogramme carré, Moovy une
  //  lettre. À hauteur égale le monogramme écrase le mot ; à largeur égale il
  //  disparaît. Chaque logo porte donc son `scale`, réglé à l'œil. Les valeurs
  //  sont les mêmes que sur la page à propos, à garder en phase.
  // ───────────────────────────────────────────────────────────────────────────

  /** La phrase à deux tons. Même principe que la page à propos, en plus court. */
  export let title =
    "Les marques nous confient leur image. <span class='dim'>Nous lui donnons une présence.</span>";

  export let label = "Nos clients";
  export let href = "/travail";

  /** Durée d'affichage d'une marque, en millisecondes. */
  export let interval = 2600;

  export let brands = [
    {
      name: "Lybra",
      logo: "/images/logos-clients/lybra.svg",
      scale: 1,
      image: "/images/lybra-affichage.webp",
      alt: "Affichage urbain Lybra — Agence 3 Terres"
    },
    {
      name: "Ludosphères",
      logo: "/images/logos-clients/ludospheres.svg",
      // Un monogramme carré : à hauteur égale il paraît deux fois plus lourd
      // qu'un mot, on le rentre.
      scale: 0.62,
      image: "/images/ludo-drapeau.webp",
      alt: "Bannière Ludosphères sur une façade — Agence 3 Terres"
    },
    {
      name: "Moovy",
      logo: "/images/logos-clients/moovy.webp",
      scale: 0.78,
      image: "/images/moovy-phone.webp",
      alt: "Interface Moovy sur téléphone — Agence 3 Terres"
    }
  ];

  // Le halo de contour du « + » suit le curseur, comme le bouton du header.
  // Le survol se fait sur toute la carte, donc les coordonnées sont bornées à
  // la boîte du bouton — même raison que dans `HomeActionCards`.
  function handlePlusMove(e) {
    const plus = e.currentTarget.querySelector(".home-clients__plus");
    if (!plus) return;
    const r = plus.getBoundingClientRect();
    const hold = (v, max) => Math.max(-24, Math.min(max + 24, v));
    plus.style.setProperty("--mx", `${hold(e.clientX - r.left, r.width)}px`);
    plus.style.setProperty("--my", `${hold(e.clientY - r.top, r.height)}px`);
  }

  let active = 0;
  let sectionEl;
  let timer;
  let observer;

  // Le compteur ne tourne QUE quand le bloc est à l'écran. Un `setInterval` qui
  // tourne toute la page durant réveille le fil principal pour rien, et Chrome
  // le bride de toute façon hors écran — le retour se ferait alors sur une
  // marque prise au hasard, avec un saut visible.
  function start() {
    stop();
    if (brands.length < 2) return;
    timer = setInterval(() => {
      active = (active + 1) % brands.length;
    }, interval);
  }

  function stop() {
    clearInterval(timer);
    timer = undefined;
  }

  onMount(() => {
    if (!browser) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

    observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.15 }
    );
    if (sectionEl) observer.observe(sectionEl);

    return () => {
      observer?.disconnect();
      stop();
    };
  });
</script>

<section class="home-clients" bind:this={sectionEl} aria-label="Les marques accompagnées">
  <a
    class="home-clients__frame"
    {href}
    aria-label="Découvrir nos réalisations"
    data-cursor="button"
    data-sveltekit-preload-data="hover"
    on:mousemove={handlePlusMove}
  >
    <div class="home-clients__content">
      <span class="home-clients__label">{label}</span>
      <h2 class="home-clients__title" use:reveal>{@html title}</h2>
      <span class="home-clients__plus card-plus" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" /></svg>
      </span>
    </div>

    <!-- Toutes les images sont empilées au même endroit et c'est l'opacité qui
         décide : un `{#key}` qui remonterait l'élément relancerait un
         chargement à chaque bascule, et la première boucle clignoterait. -->
    <div class="home-clients__media">
      {#each brands as brand, i}
        <img
          class="home-clients__shot"
          class:is-on={i === active}
          src={brand.image}
          alt={brand.alt}
          loading="lazy"
          decoding="async"
          draggable="false"
        />
      {/each}

      <!-- Le logo, dans le coin du visuel. La boîte garde une hauteur fixe :
           sans elle, le passage d'un mot large à un monogramme carré
           déplacerait la ligne de base et le coin sauterait à chaque bascule. -->
      <div class="home-clients__brand">
        <div class="home-clients__logos">
          {#each brands as brand, i}
            <img
              class="home-clients__logo"
              class:is-on={i === active}
              style:--logo-scale={brand.scale ?? 1}
              src={brand.logo}
              alt={brand.name}
              loading="lazy"
              decoding="async"
              draggable="false"
            />
          {/each}
        </div>
      </div>
    </div>
  </a>
</section>

<style>
  .home-clients {
    /* En haut, le pas de la série : la même valeur que le `gap` des deux cartes
       au-dessus. En bas, l'air du trio — le pendant de la marge posée sur
       `.action-cards` (voir le commentaire qui s'y trouve). */
    padding: var(--site-inset) var(--site-inset) clamp(7rem, 15vh, 12rem);
    background: var(--bg-deep, #050709);
    color: #f4efe6;
  }

  .home-clients__frame {
    display: grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.55fr);
    min-height: calc(clamp(22rem, 28vw, 34rem) + 3rem);
    overflow: hidden;
    border-radius: var(--project-media-radius, 22px);
    background: var(--bg-panel, #171b21);
    color: inherit;
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
  }

  .home-clients__content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(1.1rem, 2vw, 1.8rem);
    padding: clamp(2rem, 4vw, 4rem) clamp(1.5rem, 3vw, 3rem) 5.5rem;
    min-width: 0;
    text-align: center;
  }

  .home-clients__label {
    padding: 0.4rem 0.8rem;
    border-radius: 999px;
    background: rgba(232, 239, 249, 0.08);
    font-family: var(--site-font);
    font-size: clamp(0.78rem, 0.95vw, 0.95rem);
    font-weight: 500;
    line-height: 1.2;
  }

  .home-clients__title {
    /* Un peu plus large que les deux cartes du dessus (17ch) : la phrase compte
       deux propositions, à 17ch elle tomberait sur six lignes. */
    max-width: 20ch;
    margin: 0;
    font-family: var(--site-font);
    font-size: clamp(1.5rem, 2.1vw, 2.6rem);
    font-weight: var(--site-weight-display, 500);
    line-height: 1.12;
    letter-spacing: var(--site-display-letter-spacing, -0.028em);
    text-wrap: balance;
  }

  /* La demi-encre du site : la même valeur que les autres grands titres à deux
     tons de la home et de la page à propos. */
  .home-clients__title :global(.dim) {
    color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.5);
  }

  /* Le « + » au gabarit de bouton du site : verre flouté au repos, liseré d'un
     pixel allumé par un dégradé radial qui suit le curseur au survol. Recette
     complète et pièges du flou : voir `HomeActionCards.svelte`. */
  .home-clients__plus {
    position: absolute;
    right: clamp(1.2rem, 2.2vw, 2.3rem);
    bottom: clamp(1.2rem, 2.2vw, 2.3rem);
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

  .home-clients__plus::before,
  .home-clients__plus::after {
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

  .home-clients__plus::before {
    background: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-strong) 0%,
      var(--site-glow-mid) 22%,
      var(--site-glow-soft) 45%,
      var(--site-glow-fade) 62%,
      transparent 78%
    );
  }

  .home-clients__plus::after {
    background: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-ambient) 0%,
      var(--site-glow-outer) 42%,
      transparent 72%
    );
    filter: blur(2px);
  }

  .home-clients__plus svg {
    width: 1.35rem;
    height: 1.35rem;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
  }

  .home-clients__media {
    position: relative;
    overflow: hidden;
    border-radius: var(--project-media-radius, 22px);
    background: var(--bg-raised, #0a0e12);
  }

  .home-clients__shot {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    opacity: 0;
    /* Un fondu long : la bascule tombe toutes les deux secondes et demie, un
       fondu court se lirait comme un clignotement. */
    transition: opacity 760ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .home-clients__shot.is-on {
    opacity: 1;
  }

  /* Un voile de coin sous le logo : les trois visuels n'ont pas le même bas —
     une façade claire, un ciel, un écran — et un logo blanc posé nu s'y perdrait
     une fois sur trois. */
  .home-clients__brand {
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 2;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    padding: clamp(1.2rem, 2.2vw, 2.3rem);
    background: radial-gradient(
      120% 140% at 100% 100%,
      rgba(5, 7, 9, 0.62),
      rgba(5, 7, 9, 0) 72%
    );
    pointer-events: none;
  }

  /* La boîte des logos : une hauteur imposée, et tous les logos empilés dedans.
     `--logo-h` est la seule mesure à toucher pour les grossir ou les réduire
     ensemble ; `--logo-scale`, porté par chaque image, règle les écarts de
     forme entre eux. */
  .home-clients__logos {
    --logo-h: clamp(1.6rem, 2.6vw, 2.5rem);
    position: relative;
    height: var(--logo-h);
    width: min(14rem, 46vw);
  }

  .home-clients__logo {
    position: absolute;
    right: 0;
    top: 50%;
    max-width: 100%;
    max-height: calc(var(--logo-h) * var(--logo-scale, 1));
    width: auto;
    height: auto;
    opacity: 0;
    transform: translateY(-50%);
    transition: opacity 620ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .home-clients__logo.is-on {
    opacity: 0.94;
  }

  .home-clients__frame:focus-visible {
    outline: 2px solid #f4efe6;
    outline-offset: 5px;
  }

  .home-clients__frame:focus-visible .home-clients__plus::before,
  .home-clients__frame:focus-visible .home-clients__plus::after {
    opacity: 1;
  }

  @media (hover: hover) {
    .home-clients__frame:hover .home-clients__plus {
      background: rgba(255, 255, 255, 0.18);
      transform: translateZ(0) translateY(-2px);
    }

    .home-clients__frame:hover .home-clients__plus::before,
    .home-clients__frame:hover .home-clients__plus::after {
      opacity: 1;
    }
  }

  @media (max-width: 760px) {
    .home-clients__frame {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: auto 17rem;
      min-height: 0;
    }

    .home-clients__content {
      gap: 0.8rem;
      padding: 1.6rem 4.8rem 1.6rem 1.4rem;
      align-items: flex-start;
      text-align: left;
    }

    .home-clients__title {
      max-width: 22ch;
      font-size: clamp(1.4rem, 5.2vw, 1.95rem);
    }

    .home-clients__plus {
      /* Le visuel occupe tout le bas de la carte : le bouton remonte dans la
         bande de texte, sinon il se poserait au milieu de l'image. */
      top: 1.4rem;
      right: 1.2rem;
      bottom: auto;
      width: 2.9rem;
    }

    .home-clients__logos {
      --logo-h: 1.5rem;
      width: min(11rem, 52vw);
    }
  }

  /* ── Téléphone en paysage ───────────────────────────────────────────────────
     L'écran fait moins de 760 px de large, donc tout est empilé — mais il ne
     fait que 390 px de haut : un visuel de 17 rem sous le texte ferait deux
     écrans à lui seul. On repasse aux deux colonnes. */
  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .home-clients__frame {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.35fr);
      grid-template-rows: auto;
      min-height: 20rem;
    }

    .home-clients__content {
      align-items: center;
      text-align: center;
      padding: 1.6rem 1.4rem 4.6rem;
    }

    .home-clients__plus {
      top: auto;
      bottom: 1.2rem;
    }
  }

  /* Sans mouvement, le compteur ne démarre jamais (voir `onMount`) : seule la
     première marque s'affiche, et les fondus n'ont plus de raison d'être. */
  @media (prefers-reduced-motion: reduce) {
    .home-clients__shot,
    .home-clients__logo,
    .home-clients__plus,
    .home-clients__plus::before,
    .home-clients__plus::after {
      transition: none;
    }
  }
</style>
