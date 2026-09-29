<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { reveal } from "$lib/actions/reveal.js";
  import { navigate } from "$lib/navigate.js";

  // ───────────────────────────────────────────────────────────────────────────
  //  AboutBentoWindows
  //
  //  Une bannière plein écran (100vh) PUIS une grille de cartes, aux mêmes
  //  marges et aux mêmes arrondis que le reste de la page. Tout ce bloc est
  //  percé dans UNE SEULE image posée derrière : la bannière en montre le
  //  haut, les cartes « fenêtre » en montrent le bas, et d'un trou à l'autre
  //  l'image continue. Les cartes pleines, elles, gardent leur fond.
  //
  //  Le raccord ne peut pas se faire en CSS seul (une fenêtre ne connaît pas
  //  sa position) : on mesure chaque `[data-window]` par rapport à l'empilement
  //  et on décale son image d'autant (--wx/--wy), en la dimensionnant à la
  //  taille de l'empilement (--gw/--gh). Avant la mesure, chaque fenêtre montre
  //  un cadrage plein — jamais de trou vide.
  // ───────────────────────────────────────────────────────────────────────────

  export let image = "/images/pexels-kristof-sass-kovan-64832383-8384482.webp";
  export let alt = "Arête d'une façade de verre vue du sol — Agence 3 Terres";
  // Titre d'introduction, au même gabarit que les autres accroches du site.
  export let lead = "";
  export let bannerLabel = "Du premier trait à la mise en ligne";
  export let bannerCopy =
    "Nous concevons des images et des interfaces qui donnent de la clarté, de la précision et du souffle à ce que votre marque a à dire.";

  const steps = [
    { index: "01", label: "Écoute & cadrage", pole: "Stratégie" },
    { index: "02", label: "Direction artistique", pole: "Design" },
    { index: "03", label: "Production & mise en ligne", pole: "Studio" }
  ];

  const mail = "contact@agence3terres.fr";

  let stackEl;
  let ro;
  let rafId = null;

  // ── Raccord des fenêtres ───────────────────────────────────────────────────
  function measure() {
    if (!browser || !stackEl) return;

    const stack = stackEl.getBoundingClientRect();
    if (!stack.width || !stack.height) return;

    stackEl.style.setProperty("--gw", `${stack.width}px`);
    stackEl.style.setProperty("--gh", `${stack.height}px`);

    for (const win of stackEl.querySelectorAll("[data-window]")) {
      const r = win.getBoundingClientRect();
      win.style.setProperty("--wx", `${r.left - stack.left}px`);
      win.style.setProperty("--wy", `${r.top - stack.top}px`);
    }
  }

  function scheduleMeasure() {
    if (!browser) return;
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      rafId = null;
      measure();
    });
  }

  onMount(() => {
    if (!browser || !stackEl) return;

    measure();
    // Deuxième passe après la mise en page finale (polices, images décodées).
    scheduleMeasure();

    ro = new ResizeObserver(scheduleMeasure);
    ro.observe(stackEl);

    window.addEventListener("resize", scheduleMeasure, { passive: true });
    window.addEventListener("orientationchange", scheduleMeasure, { passive: true });
  });

  onDestroy(() => {
    if (!browser) return;
    if (rafId !== null) cancelAnimationFrame(rafId);
    ro?.disconnect();
    window.removeEventListener("resize", scheduleMeasure);
    window.removeEventListener("orientationchange", scheduleMeasure);
  });
</script>

<section class="bento" aria-label="L'agence en bref">
  {#if lead}
    <h2 class="bento__lead" use:reveal>{@html lead}</h2>
  {/if}

  <div class="bento__stack" bind:this={stackEl}>
    <!-- Bannière plein écran : le haut de l'image commune. -->
    <figure class="bento__banner" data-window>
      <img class="bento__window-img" src={image} {alt} loading="eager" decoding="async" draggable="false" />
      <div class="bento__banner-veil" aria-hidden="true"></div>

      <figcaption class="bento__banner-foot">
        <p class="bento__banner-label" use:reveal>{bannerLabel}</p>
        <p class="bento__banner-copy" use:reveal={{ delay: 90 }}>{bannerCopy}</p>
      </figcaption>
    </figure>

    <div class="bento__grid">
    <!-- Colonne 1 — fenêtre haute : la méthode -->
    <article class="bento__card bento__card--window bento__card--method" data-window>
      <img class="bento__window-img" src={image} {alt} loading="lazy" decoding="async" draggable="false" />
      <div class="bento__shade" aria-hidden="true"></div>

      <div class="bento__body">
        <h3 class="bento__title" use:reveal>
          Méthode
        </h3>

        <ul class="bento__steps">
          {#each steps as step}
            <li class="bento__step">
              <span class="bento__step-index">{step.index}</span>
              <span class="bento__step-label">{step.label}</span>
              <span class="bento__step-pole">{step.pole}</span>
            </li>
          {/each}
        </ul>
      </div>
    </article>

    <!-- Colonne 2 -->
    <div class="bento__col bento__col--a">
      <article class="bento__card bento__card--solid bento__card--promise">
        <div class="bento__body bento__body--center">
          <h3 class="bento__title" use:reveal>
            Notre promesse
          </h3>

          <blockquote class="bento__quote" use:reveal={{ delay: 90 }}>
            « Pas de gabarit, pas de recette. Chaque projet repart d'une page blanche,
            d'une écoute, et d'une intention tenue jusqu'au dernier pixel. »
          </blockquote>
          <p class="bento__author">Agence 3 Terres</p>
        </div>
      </article>

      <article class="bento__card bento__card--window bento__card--figure" data-window>
        <img class="bento__window-img" src={image} alt="" loading="lazy" decoding="async" draggable="false" />
        <div class="bento__shade" aria-hidden="true"></div>

        <div class="bento__body bento__body--center bento__body--middle">
          <strong class="bento__figure">100%</strong>
          <span class="bento__figure-caption">sur-mesure</span>
        </div>
      </article>
    </div>

    <!-- Colonne 3 -->
    <div class="bento__col bento__col--b">
      <article class="bento__card bento__card--window bento__card--tools" data-window>
        <img class="bento__window-img" src={image} alt="" loading="lazy" decoding="async" draggable="false" />
        <div class="bento__shade" aria-hidden="true"></div>

        <div class="bento__body bento__body--center">
          <h3 class="bento__title" use:reveal>
            Nos terrains
          </h3>

          <ul class="bento__tools" aria-label="Nos terrains">
            <li class="bento__tool" title="Identité">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" /><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none" /></svg>
              <span class="bento__tool-name">Identité</span>
            </li>
            <li class="bento__tool" title="Interfaces">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4.5" width="16" height="15" rx="2.5" /><path d="M12 4.5v15" /></svg>
              <span class="bento__tool-name">Interfaces</span>
            </li>
            <li class="bento__tool" title="Motion">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.4l1.9 5.3 5.3 1.9-5.3 1.9L12 17.8l-1.9-5.3-5.3-1.9 5.3-1.9z" /><path d="M18.2 15.4l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></svg>
              <span class="bento__tool-name">Motion</span>
            </li>
            <li class="bento__tool" title="Image">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.6l8.4 8.4-8.4 8.4L3.6 12z" /></svg>
              <span class="bento__tool-name">Image</span>
            </li>
          </ul>
        </div>
      </article>

      <article class="bento__card bento__card--solid bento__card--contact">
        <div class="bento__body bento__body--center">
          <h3 class="bento__title" use:reveal>
            Contact
          </h3>

          <p class="bento__contact">
            <a class="bento__mail" href={`mailto:${mail}`} data-cursor="button">{mail}</a>
            <span class="bento__dot" aria-hidden="true">•</span>
            <button type="button" class="bento__link" data-cursor="button" onclick={() => navigate("contact")}>
              Démarrer un projet
            </button>
          </p>
        </div>
      </article>
      </div>
    </div>
  </div>
</section>

<style>
  /* ── Cadre : mêmes marges / arrondis que le composant du dessus ─────────── */
  .bento {
    --bt-bg: var(--bg-deep, #000);
    --bt-card: var(--bg-panel, #161617);
    --bt-ink: #f4efe6;
    --bt-muted: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.52);
    --bt-gap: clamp(0.7rem, 1vw, 1.2rem);
    --bt-radius: 22px;
    --bt-inset: var(--site-inset);

    width: 100%;
    background: var(--bt-bg);
    color: var(--bt-ink);
    padding: clamp(5rem, 13vh, 11rem) var(--bt-inset) clamp(9rem, 21vh, 19rem);
    overflow-x: clip;
  }

  /* Même gabarit que les autres accroches du site : centré, 45rem, medium, la
     phrase d'ouverture en encre pleine et la suite à 50 %. */
  .bento__lead {
    /* Même écart que le titre du hero au-dessus du slider : sa marge basse
       (4vh) plus le padding haut de la section suivante — repris tel quel pour
       que les deux titres soient posés pareil au-dessus de leur bloc. */
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

  .bento__lead :global(.dim) {
    color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.5);
  }

  /* L'empilement bannière + grille : c'est LUI qui porte l'image commune, donc
     lui qu'on mesure. */
  .bento__stack {
    /* Valeurs de repli avant la mesure : chaque fenêtre montre un cadrage plein. */
    --gw: 100%;
    --gh: 100%;

    position: relative;
    display: grid;
    gap: clamp(2rem, 5vh, 4.5rem);
  }

  /* ── Bannière plein écran ───────────────────────────────────────────────── */
  .bento__banner {
    position: relative;
    margin: 0;
    width: 100%;
    height: var(--viewport-height, 100svh);
    border-radius: var(--bt-radius);
    overflow: hidden;
    background: var(--bg-raised, #080808);
    isolation: isolate;
  }

  /* Assombrissement du bas : le filet et les deux textes restent lisibles. */
  .bento__banner-veil {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: linear-gradient(
      to top,
      rgba(var(--shade-rgb, 0, 0, 0), 0.62) 0%,
      rgba(var(--shade-rgb, 0, 0, 0), 0.24) 22%,
      rgba(var(--shade-rgb, 0, 0, 0), 0) 46%
    );
  }

  .bento__banner-foot {
    position: absolute;
    z-index: 2;
    /* Le filet s'arrête avant les bords de l'image (il n'est pas pleine
       largeur) : ce sont les côtés du bloc qui le retiennent, pas un padding —
       sinon la bordure irait, elle, jusqu'au bord. */
    left: clamp(1.4rem, 3vw, 3rem);
    right: clamp(1.4rem, 3vw, 3rem);
    bottom: clamp(2.5rem, 9vh, 7rem);
    border-top: 1px solid rgba(255, 255, 255, 0.34);
    padding: clamp(1.3rem, 2.4vw, 2.4rem) 0 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.62fr);
    align-items: start;
    gap: clamp(1.2rem, 3vw, 3rem);
  }

  .bento__banner-label {
    margin: 0;
    font-family: var(--site-font);
    font-size: clamp(0.9rem, 1.05vw, 1.08rem);
    font-weight: var(--site-weight);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    line-height: 1.35;
    color: #ffffff;
  }

  .bento__banner-copy {
    margin: 0;
    max-width: 46ch;
    font-family: var(--site-font);
    font-size: clamp(0.95rem, 1.18vw, 1.22rem);
    font-weight: var(--site-weight);
    letter-spacing: -0.008em;
    line-height: 1.42;
    color: #ffffff;
    text-wrap: pretty;
  }

  .bento__grid {
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--bt-gap);
    height: min(88vh, 940px);
  }

  .bento__col {
    display: grid;
    gap: var(--bt-gap);
    min-height: 0;
  }

  /* Colonne 2 : citation courte au-dessus, chiffre plus haut en dessous.
     Colonne 3 : proportions inversées — c'est ce décalage qui donne au bloc son
     rythme (les cartes ne s'alignent pas d'une colonne à l'autre). */
  .bento__col--a {
    grid-template-rows: minmax(0, 0.68fr) minmax(0, 1fr);
  }

  .bento__col--b {
    grid-template-rows: minmax(0, 1fr) minmax(0, 0.86fr);
  }

  .bento__card {
    position: relative;
    min-height: 0;
    border-radius: var(--bt-radius);
    overflow: hidden;
    /* Contexte isolé : l'image de la fenêtre reste sous le contenu. */
    isolation: isolate;
  }

  .bento__card--solid {
    background: var(--bt-card);
  }

  /* ── Fenêtres : un trou sur l'image posée derrière la grille ────────────── */
  .bento__card--window {
    --wx: 0px;
    --wy: 0px;
    background: var(--bg-raised, #080808);
  }

  .bento__window-img {
    position: absolute;
    left: calc(-1 * var(--wx));
    top: calc(-1 * var(--wy));
    width: var(--gw);
    height: var(--gh);
    max-width: none;
    object-fit: cover;
    object-position: center;
    display: block;
    z-index: 0;
  }

  .bento__shade {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background:
      linear-gradient(to top, rgba(var(--shade-rgb, 0, 0, 0), 0.62) 0%, rgba(var(--shade-rgb, 0, 0, 0), 0.12) 46%, rgba(var(--shade-rgb, 0, 0, 0), 0) 72%),
      linear-gradient(to bottom, rgba(var(--shade-rgb, 0, 0, 0), 0.42) 0%, rgba(var(--shade-rgb, 0, 0, 0), 0) 38%);
  }

  /* ── Contenu des cartes ─────────────────────────────────────────────────── */
  .bento__body {
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: clamp(1.5rem, 3vw, 2.5rem);
    padding: clamp(1.3rem, 1.9vw, 2rem);
  }

  .bento__body--center {
    align-items: center;
    text-align: center;
  }

  .bento__body--middle {
    justify-content: center;
    gap: clamp(0.3rem, 0.6vw, 0.5rem);
  }

  .bento__title {
    margin: 0;
    align-self: center;
    font-family: var(--site-font);
    font-size: clamp(0.95rem, 1.12vw, 1.15rem);
    font-weight: var(--site-weight);
    letter-spacing: -0.01em;
    color: var(--bt-ink);
  }

  /* Méthode : lignes en bas de la fenêtre. */
  .bento__steps {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .bento__step {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: baseline;
    gap: clamp(0.8rem, 2vw, 1.6rem);
    padding: clamp(0.85rem, 1.5vw, 1.25rem) 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.16);
    font-family: var(--site-font);
    font-size: clamp(0.88rem, 1.02vw, 1.05rem);
    letter-spacing: -0.008em;
  }

  .bento__step:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  .bento__step-index {
    color: rgba(255, 255, 255, 0.62);
    font-variant-numeric: tabular-nums;
  }

  .bento__step-label {
    color: #ffffff;
    text-align: center;
  }

  .bento__step-pole {
    color: rgba(255, 255, 255, 0.82);
    white-space: nowrap;
  }

  /* Promesse. */
  .bento__quote {
    margin: 0;
    max-width: 34ch;
    font-family: var(--site-font);
    font-size: clamp(1rem, 1.22vw, 1.24rem);
    font-weight: var(--site-weight);
    line-height: 1.42;
    letter-spacing: -0.012em;
    color: var(--bt-ink);
    text-wrap: pretty;
  }

  .bento__author {
    margin: 0;
    font-family: var(--site-font);
    font-size: clamp(0.86rem, 0.98vw, 1rem);
    color: var(--bt-muted);
  }

  /* Chiffre. */
  .bento__figure {
    font-family: var(--site-font);
    font-size: clamp(3.2rem, 5.4vw, 5.4rem);
    font-weight: var(--site-weight-display);
    line-height: 1;
    letter-spacing: var(--site-display-letter-spacing, -0.028em);
    color: #ffffff;
  }

  .bento__figure-caption {
    font-family: var(--site-font);
    font-size: clamp(1rem, 1.35vw, 1.35rem);
    font-weight: var(--site-weight);
    color: rgba(255, 255, 255, 0.9);
  }

  /* Terrains : pastilles de verre posées sur la fenêtre. */
  .bento__tools {
    list-style: none;
    margin: 0 0 clamp(0.3rem, 1.5vw, 1.2rem);
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: center;
    gap: clamp(0.5rem, 0.9vw, 0.8rem);
  }

  .bento__tool {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .bento__tool svg {
    width: clamp(2.9rem, 3.6vw, 3.5rem);
    height: clamp(2.9rem, 3.6vw, 3.5rem);
    padding: clamp(0.6rem, 0.9vw, 0.85rem);
    box-sizing: border-box;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.9);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.9);
    fill: none;
    stroke: #ffffff;
    stroke-width: 1.5;
    stroke-linejoin: round;
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  .bento__tool-name {
    font-family: var(--site-font);
    font-size: clamp(0.72rem, 0.82vw, 0.84rem);
    letter-spacing: 0.02em;
    color: rgba(255, 255, 255, 0.86);
  }

  /* Contact. */
  .bento__contact {
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: clamp(0.5rem, 1vw, 0.9rem);
    font-family: var(--site-font);
    font-size: clamp(0.95rem, 1.12vw, 1.15rem);
  }

  .bento__mail,
  .bento__link {
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    color: var(--bt-ink);
    text-decoration: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: color 0.4s ease;
  }

  .bento__dot {
    color: var(--bt-muted);
  }

  @media (hover: hover) {
    .bento__mail:hover,
    .bento__link:hover {
      color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.62);
    }
  }

  .bento__mail:focus-visible,
  .bento__link:focus-visible {
    outline: 2px solid var(--lead-blue, #5768ff);
    outline-offset: 3px;
    border-radius: 4px;
  }

  /* ── Tablette : 2 colonnes, hauteur libre ───────────────────────────────── */
  @media (max-width: 1100px) {
    .bento__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-auto-rows: minmax(15rem, auto);
      height: auto;
    }

    .bento__card--method {
      grid-row: span 2;
      min-height: 32rem;
    }

    .bento__col {
      grid-template-rows: minmax(15rem, 1fr) minmax(15rem, 1fr);
    }

    .bento__col--a,
    .bento__col--b {
      grid-template-rows: minmax(15rem, 1fr) minmax(15rem, 1fr);
    }
  }

  /* ── Mobile : une colonne, l'image continue d'une carte à l'autre ───────── */
  @media (max-width: 760px) {
    .bento {
      padding: clamp(3rem, 8vh, 5rem) 1rem clamp(6rem, 14vh, 10rem);
    }

    .bento__grid {
      grid-template-columns: minmax(0, 1fr);
      grid-auto-rows: auto;
    }

    .bento__banner {
      border-radius: 18px;
    }

    .bento__banner-foot {
      grid-template-columns: minmax(0, 1fr);
      gap: clamp(0.9rem, 3vw, 1.4rem);
      bottom: clamp(2rem, 7vh, 4rem);
      left: 1.1rem;
      right: 1.1rem;
    }

    .bento__banner-copy {
      font-size: 1rem;
      max-width: none;
    }

    .bento__card {
      border-radius: 18px;
    }

    /* Cartes plus courtes et image beaucoup plus zoomée (l'empilement est très
       étroit et très haut) : le voile doit remonter plus haut pour que les
       lignes de la carte Méthode restent lisibles sur le ciel clair. */
    .bento__shade {
      background:
        linear-gradient(to top, rgba(var(--shade-rgb, 0, 0, 0), 0.74) 0%, rgba(var(--shade-rgb, 0, 0, 0), 0.34) 52%, rgba(var(--shade-rgb, 0, 0, 0), 0) 88%),
        linear-gradient(to bottom, rgba(var(--shade-rgb, 0, 0, 0), 0.5) 0%, rgba(var(--shade-rgb, 0, 0, 0), 0) 34%);
    }

    .bento__card--solid,
    .bento__card--window {
      min-height: 17rem;
    }

    .bento__card.bento__card--method {
      grid-row: auto;
      min-height: 26rem;
    }

    .bento__col {
      display: contents;
    }

    .bento__step {
      grid-template-columns: auto minmax(0, 1fr);
      row-gap: 0.2rem;
    }

    .bento__step-pole {
      grid-column: 2;
      text-align: left;
      color: rgba(255, 255, 255, 0.6);
    }

    .bento__step-label {
      text-align: left;
    }

    .bento__card--contact .bento__body {
      justify-content: center;
      gap: clamp(1.4rem, 5vw, 2.2rem);
    }
  }

  /* ── Téléphone en paysage ──────────────────────────────────────────────── */
  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .bento {
      padding: 8svh 1.25rem 12svh;
    }

    .bento__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-auto-rows: minmax(13rem, auto);
      height: auto;
    }

    .bento__banner-foot {
      grid-template-columns: minmax(0, 1fr) minmax(0, 0.7fr);
      bottom: clamp(1.2rem, 6svh, 2.4rem);
      padding-top: clamp(0.8rem, 2vw, 1.2rem);
    }

    .bento__banner-label,
    .bento__banner-copy {
      font-size: clamp(0.82rem, 2.2vw, 0.98rem);
    }

    .bento__card--method {
      grid-row: span 2;
      min-height: 27rem;
    }

    .bento__col {
      display: grid;
      grid-template-rows: minmax(13rem, 1fr) minmax(13rem, 1fr);
    }
  }
</style>
