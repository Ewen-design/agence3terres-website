<script>
  // ───────────────────────────────────────────────────────────────────────────
  //  ProjectImageTabs — une seule image, plusieurs états.
  //
  //  « Onglets d'image en fondu » de la librairie, passé aux règles du site :
  //  les pilules deviennent les BOUTONS DE VERRE du site (fond translucide,
  //  flou 20 px, arrondi 10 px, halo de contour au survol piloté par
  //  `--mx`/`--my`), l'image prend l'arrondi des médias des pages projet, et le
  //  titre passe par l'arrivée mot à mot.
  //
  //  Le titre NE CHANGE PAS d'un onglet à l'autre : c'est ce qui fait la
  //  démonstration — une seule marque, plusieurs terrains — pendant que le
  //  décor défile derrière. Il est POSÉ AU-DESSUS de l'image et non dessus,
  //  contrairement à la capture d'origine : nos visuels de projet ont presque
  //  tous leur sujet au centre (un logo, un écran), et un titre centré s'y
  //  posait en plein dessus — illisible. Au-dessus, il suit en plus le rythme
  //  des autres en-têtes du site.
  //
  //  ⚠️ TOUTES LES IMAGES SONT DANS LE DOM dès le départ (la première
  //  prioritaire, les autres paresseuses). Les charger au clic ouvrirait un trou
  //  le temps du téléchargement.
  //
  //  ⚠️ LE VERRE DES ONGLETS ne floute que ce qui vit dans sa racine de fond :
  //  les images doivent rester DANS `.tabs__scene`, qui porte le `filter` de
  //  l'arrivée. Ne pas sortir les onglets de la scène.
  // ───────────────────────────────────────────────────────────────────────────
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { reveal, revealBlock } from "$lib/actions/reveal.js";

  /** Titre posé au milieu de l'image. Il ne change jamais d'onglet à onglet. */
  export let title = "";
  /**
   * `[{ label, image, mobileImage, alt, position, fit, bg }]`
   *
   * `fit: "contain"` pour un visuel qu'il ne faut pas rogner — un logotype très
   * large, par exemple ; `bg` donne alors la couleur qui remplit le reste du
   * cadre, et le fondu reste invisible d'un onglet à l'autre.
   */
  export let tabs = [];
  /** La ligne sous l'image (facultative). Accepte des `<span class="hl">`. */
  export let note = "";
  /** Cadre de la scène. Le format téléphone se règle à part : un 16/9 y serait
   *  une bande, un 4/5 rognerait un visuel large de moitié. */
  export let aspect = "16 / 9";
  export let mobileAspect = "4 / 5";

  let index = 0;
  let sceneEl;

  // Le titre porte des balises (une coupure de ligne, un `.dim`) : un libellé
  // accessible doit être du texte nu.
  $: titreNu = String(title || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  // Garde-index : si la liste rétrécit sous l'index courant, on revient au début.
  $: if (index > tabs.length - 1) index = 0;

  function handleMove(event) {
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  function handleKey(event) {
    if (!tabs.length) return;
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const step = event.key === "ArrowRight" ? 1 : -1;
    index = (index + step + tabs.length) % tabs.length;
    const next = sceneEl?.querySelectorAll(".tabs__tab")?.[index];
    next?.focus();
  }

  // Préchauffage du `backdrop-filter` : sur certains WebKit la première image
  // d'un élément flouté sort blanche. Un jumeau hors écran, monté au même
  // moment, force la couche à exister avant que les onglets n'entrent.
  let blurWarm = false;
  let warmTimer;

  onMount(() => {
    if (!browser) return;
    blurWarm = true;
    warmTimer = setTimeout(() => (blurWarm = false), 10000);
    return () => clearTimeout(warmTimer);
  });
</script>

<section class="tabs" style={`--tabs-aspect:${aspect}; --tabs-aspect-mobile:${mobileAspect};`}>
  {#if title}
    <header class="tabs__head">
      <h2 class="tabs__title" use:reveal>{@html title}</h2>
    </header>
  {/if}

  <div class="tabs__scene" bind:this={sceneEl} use:revealBlock>
    <div class="tabs__images">
      {#each tabs as tab, i (tab.label)}
        <picture
          class="tabs__picture"
          class:is-on={i === index}
          aria-hidden={i !== index}
          style={tab.bg ? `background:${tab.bg};` : undefined}
        >
          <!-- L'image mobile suit le FORMAT du cadre, pas un point de rupture à
               part : le cadre passe au format mobile sous 900 px (voir
               `.tabs__scene`), l'image doit basculer au même pixel — elle
               basculait à 640 px, et entre les deux l'image large était
               rognée dans le cadre mobile. Le téléphone couché reprend le
               format large : il garde l'image large (première source qui
               correspond). -->
          {#if tab.mobileImage}
            <source
              media="(pointer: coarse) and (orientation: landscape) and (max-height: 600px)"
              srcset={tab.image}
            />
            <source media="(max-width: 900px)" srcset={tab.mobileImage} />
          {/if}
          <img
            class="tabs__image"
            style:object-fit={tab.fit ?? "cover"}
            style:object-position={tab.position ?? "center"}
            src={tab.image}
            alt={i === index ? (tab.alt ?? tab.label) : ""}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
          />
        </picture>
      {/each}
      <span class="tabs__veil" aria-hidden="true"></span>
    </div>

    <div class="tabs__row" role="group" aria-label={titreNu || "Vues du projet"}>
      {#each tabs as tab, i (tab.label)}
        <button
          class="tabs__tab nav-btn"
          class:is-active={i === index}
          type="button"
          aria-pressed={i === index}
          on:click={() => (index = i)}
          on:keydown={handleKey}
          on:mousemove={handleMove}
        >
          <span class="nav-btn-flip" data-text={tab.label}>
            <span class="nav-btn-text">{tab.label}</span>
          </span>
        </button>
      {/each}
    </div>

    {#if blurWarm}
      <span class="tabs__blur-prewarm" aria-hidden="true"></span>
    {/if}
  </div>

  {#if note}
    <p class="tabs__note" use:reveal={{ delay: 120 }}>{@html note}</p>
  {/if}
</section>

<style>
  .tabs {
    padding:
      clamp(6rem, 11vw, 10rem)
      var(--project-side-padding, 1.25rem)
      clamp(5rem, 9vw, 8rem);
    background: transparent;
    color: var(--project-surface-ink, #f4efe6);
    transition: color var(--project-theme-transition);
  }

  .tabs__head {
    margin-bottom: clamp(1.5rem, 3vw, 2.6rem);
  }


  /* La scène porte l'arrondi, le découpage ET le `filter` de l'arrivée : c'est
     donc elle la racine de fond des onglets — les images sont dedans, les
     onglets ont bien quelque chose à flouter. */
  .tabs__scene {
    position: relative;
    aspect-ratio: var(--tabs-aspect, 16 / 9);
    border-radius: var(--project-media-radius, 22px);
    overflow: hidden;
    background: var(--project-surface-card, #0a0e12);
    transition: background-color var(--project-theme-transition);
  }

  .tabs__images {
    position: absolute;
    inset: 0;
  }

  .tabs__picture {
    position: absolute;
    inset: 0;
    display: block;
    opacity: 0;
    /* L'image sortante s'agrandit d'un cheveu : le fondu a une direction, il ne
       clignote pas. */
    transform: scale(1.045);
    transition:
      opacity 820ms cubic-bezier(0.22, 1, 0.36, 1),
      transform 1400ms cubic-bezier(0.22, 1, 0.36, 1),
      filter 820ms cubic-bezier(0.22, 1, 0.36, 1);
    filter: blur(10px);
  }

  .tabs__picture.is-on {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }

  .tabs__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Le voile : le titre et les onglets sont blancs, ils ont besoin d'un appui
     quel que soit le décor. Mêmes teintes que l'ombre du site. */
  .tabs__veil {
    position: absolute;
    inset: 0;
    /* Le bas est franc : les onglets doivent rester lisibles même quand l'image
       y est claire (un fond vert clair, un dégradé qui finit blanc). */
    background:
      linear-gradient(
        to top,
        rgba(var(--shade-rgb, 0, 0, 0), 0.74) 0%,
        rgba(var(--shade-rgb, 0, 0, 0), 0.34) 26%,
        rgba(var(--shade-rgb, 0, 0, 0), 0) 54%
      ),
      linear-gradient(
        to bottom,
        rgba(var(--shade-rgb, 0, 0, 0), 0.18) 0%,
        rgba(var(--shade-rgb, 0, 0, 0), 0) 32%
      );
    pointer-events: none;
  }

  .tabs__title {
    margin: 0;
    max-width: 20ch;
    padding-inline: var(--project-text-inset, 0);
    font-family: var(--site-font);
    font-weight: var(--site-weight-display);
    font-size: var(--project-display-size, clamp(2.1rem, 3vw, 3.45rem));
    line-height: var(--project-lead-line-height, 1.2);
    letter-spacing: var(--project-lead-tracking, -0.01em);
    text-wrap: balance;
  }

  .tabs__title :global(.dim) {
    color: color-mix(in srgb, var(--project-surface-ink, #f4efe6) 45%, transparent);
  }

  /* ── La rangée d'onglets ──
     Tendue d'un bord à l'autre plutôt que centrée par `left: 50%` : posée à
     mi-largeur, elle n'aurait que la moitié de l'image pour s'étendre et le
     dernier onglet passerait à la ligne sans raison. */
  .tabs__row {
    position: absolute;
    inset-inline: clamp(0.7rem, 1.8vw, 1.3rem);
    bottom: clamp(0.7rem, 1.8vw, 1.3rem);
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: clamp(0.35rem, 0.7vw, 0.55rem);
    z-index: 2;
  }

  /*  Le bouton du site, en TROIS morceaux — les trois, sinon il paraît mort :
   *  (1) le verre ; (2) la bascule du libellé au survol (`.nav-btn-flip` en
   *  `overflow: hidden` + doublon en `::after`) ; (3) le halo de contour
   *  (`::before`/`::after` masqués en `xor`, allumés en opacité, centrés sur
   *  `--mx`/`--my` — d'où le `on:mousemove`). */
  .tabs__tab {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: clamp(2.5rem, 3vw, 2.95rem);
    padding: 0 clamp(0.85rem, 1.3vw, 1.25rem);
    border: 0;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    box-shadow: 0 6px 8px rgba(var(--shade-rgb, 0, 0, 0), 0.06);
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    font-family: var(--site-font);
    font-size: clamp(0.84rem, 1vw, 0.96rem);
    font-weight: var(--site-weight);
    color: rgba(255, 255, 255, 0.72);
    white-space: nowrap;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition:
      color 300ms ease,
      background 700ms cubic-bezier(0.22, 0.61, 0.36, 1);
  }

  /*  L'onglet courant passe en APLAT CLAIR plutôt qu'en verre un peu plus
   *  dense : posé sur une image, un verre à 22 % ne se distingue plus dès que
   *  le décor s'éclaircit — et le bas d'une photo l'est souvent. */
  .tabs__tab.is-active {
    background: rgba(255, 255, 255, 0.94);
    color: var(--bg-deep, #050709);
  }

  .tabs__tab.is-active:hover {
    background: #fff;
  }

  .tabs__tab:focus-visible {
    outline: 2px solid var(--lead-blue, #5768ff);
    outline-offset: 3px;
  }

  .nav-btn-flip {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
  }

  .nav-btn-text {
    display: block;
    transform: translateY(0%);
    transition: transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1);
  }

  .nav-btn-flip::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition: transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1);
    white-space: nowrap;
    color: inherit;
  }

  .tabs__tab:hover .nav-btn-text {
    transform: translateY(-100%);
  }

  .tabs__tab:hover .nav-btn-flip::after {
    transform: translateY(0%);
  }

  /* Le halo de contour : `inset: -1px` + `padding: 1px` + masque `xor` ne garde
     que le liseré, et respecte donc l'arrondi. */
  .tabs__tab::before,
  .tabs__tab::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  .tabs__tab::before {
    background: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-strong) 0%,
      var(--site-glow-mid) 26%,
      var(--site-glow-soft) 52%,
      var(--site-glow-fade) 70%,
      transparent 86%
    );
  }

  .tabs__tab::after {
    background: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-ambient) 0%,
      var(--site-glow-outer) 48%,
      transparent 82%
    );
    filter: blur(3px);
  }

  .tabs__tab:hover::before,
  .tabs__tab:hover::after {
    opacity: 1;
  }

  .tabs__blur-prewarm {
    position: absolute;
    top: -200px;
    left: -200px;
    width: 80px;
    height: 40px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    pointer-events: none;
  }

  .tabs__note {
    max-width: 44ch;
    margin: clamp(1.3rem, 2.4vw, 2rem) 0 0;
    padding-inline: var(--project-text-inset, 0);
    font-family: var(--site-font);
    font-size: var(--project-body-size, 1.05rem);
    line-height: var(--project-body-line-height, 1.52);
    color: var(--project-surface-muted, rgba(232, 239, 249, 0.72));
    text-wrap: pretty;
  }

  .tabs__note :global(.hl) {
    color: var(--project-surface-ink, #f4efe6);
  }

  @media (max-width: 900px) {
    .tabs {
      padding:
        clamp(4.5rem, 15vw, 7rem)
        var(--project-side-padding, 0.9rem)
        clamp(3.5rem, 12vw, 5.5rem);
    }

    .tabs__scene {
      aspect-ratio: var(--tabs-aspect-mobile, 4 / 5);
    }

    .tabs__title {
      max-width: 24ch;
    }

    .tabs__row {
      justify-content: flex-start;
    }

    .tabs__tab {
      min-height: 2.5rem;
      font-size: 0.84rem;
      backdrop-filter: blur(12px) saturate(130%);
      -webkit-backdrop-filter: blur(12px) saturate(130%);
    }
  }

  /* Tactile : pas de survol, donc ni bascule de libellé ni halo. */
  @media (hover: none) and (pointer: coarse) {
    .tabs__tab::before,
    .tabs__tab::after {
      display: none;
    }

    .tabs__tab:hover .nav-btn-text {
      transform: translateY(0%);
    }

    .tabs__tab:hover .nav-btn-flip::after {
      transform: translateY(100%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .tabs__picture,
    .tabs__tab,
    .nav-btn-text,
    .nav-btn-flip::after {
      transition: none;
    }

    .tabs__picture {
      filter: none;
      transform: none;
    }
  }

  /*  ── Téléphone en PAYSAGE ──
   *  Le cadre portrait ferait trois fois la hauteur de l'écran : il reprend son
   *  format large, comme sur grand écran. */
  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .tabs__scene {
      aspect-ratio: 16 / 9;
    }

    .tabs__row {
      justify-content: center;
    }
  }
</style>
