<script>
  // ───────────────────────────────────────────────────────────────────────────
  //  ProjectWall — le mur des autres projets.
  //
  //  Repris du « Mur de projets — Metalab » de la librairie. Ce qui en a été
  //  RETIRÉ : la barre de navigation et le pied de page du document d'origine
  //  (le site a les siens), et le vocabulaire anglais de démonstration.
  //  Ce qui a été REFAIT aux règles du site : les noms sont les boutons de verre
  //  du site (fond translucide, flou 20 px + saturation, arrondi 10 px, halo de
  //  contour au survol piloté par `--mx`/`--my`), l'arrivée est celle du site
  //  (flou + montée, en cascade), et les visuels prennent l'arrondi des médias
  //  des pages projet.
  //
  //  ── Comment ça marche ──
  //  Le mur DÉFILE TOUT SEUL : il passe d'un projet au suivant à intervalle
  //  régulier, et chaque projet occupe tout le cadre en pleine image. Survoler
  //  un nom prend la main — la rotation se met en pause et reprend là où on
  //  l'a laissée dès qu'on relâche. Il n'y a plus ni voile, ni vignette, ni
  //  titre par-dessus : le visuel du projet est le sujet, la colonne des noms
  //  est la seule chose posée dessus.
  //
  //  ── Téléphone ──
  //  Il n'y a pas de survol sur un écran tactile : la composition n'y aurait
  //  aucun déclencheur. Le mur y devient donc une simple pile de cartes — la
  //  vignette, le nom, l'intitulé — qui mènent au projet d'une pression.
  // ───────────────────────────────────────────────────────────────────────────
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { revealBlock } from "$lib/actions/reveal.js";
  
  /** Les projets à montrer — voir `$lib/data/projets.js`. */
  export let projects = [];
  /** Libellé accessible du bloc — jamais affiché. */
  export let label = "Nos autres projets";

  /** Temps d'affichage de chaque projet, en millisecondes. */
  export let interval = 3600;

  /*  Au repos, le mur montre DÉJÀ la composition du premier projet — il ne
   *  part pas d'un panneau vide. Sans ça, qui ne survole rien ne voit qu'une
   *  colonne de noms sur du noir, et rien n'invite à survoler.
   *  `survol` est suivi à part : c'est lui, et non l'index, qui décide si
   *  l'en-tête doit s'effacer — sinon il s'effacerait dès l'arrivée. */
  let active = 0;
  let survol = false;
  let shown = false;
  let visible = false;
  let root;
  let minuteur = 0;

  /*  La rotation ne tourne que si elle sert : à l'écran, et personne sur un
   *  nom. Hors champ elle est arrêtée net — un minuteur qui change une image
   *  de fond dans une section qu'on ne regarde pas ne fait que réveiller le
   *  moteur de rendu. */
  function rythme() {
    clearInterval(minuteur);
    if (!browser || reduit || !visible || survol || projects.length < 2) return;
    minuteur = setInterval(() => {
      active = (active + 1) % projects.length;
    }, Math.max(1200, interval));
  }

  let reduit = false;

  function entrer(i) {
    active = i;
    survol = true;
    rythme();
  }

  /*  On NE REVIENT PAS au premier projet en quittant un nom : la rotation
   *  reprend là où le survol l'a laissée, sinon le mur sautait en arrière à
   *  chaque fois que la souris sortait. */
  function sortir() {
    survol = false;
    rythme();
  }

  function handleMove(event) {
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  onMount(() => {
    if (!browser || !root) return;

    reduit = !!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (reduit) {
      shown = true;
      return;
    }

    //  Le même observateur sert deux fois : il déclenche l'arrivée des noms la
    //  première fois, puis continue de dire si le mur est à l'écran — c'est ce
    //  qui met la rotation en marche et à l'arrêt.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) shown = true;
        rythme();
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    io.observe(root);

    return () => {
      io.disconnect();
      clearInterval(minuteur);
    };
  });
</script>

<!--  L'enveloppe n'est pas décorative : elle PEINT le noir derrière l'air qui
      entoure le mur. Une marge verticale posée sur le mur lui-même remonte au
      parent (fusion des marges) et sort donc de la bande sombre — on voyait
      alors deux bandeaux gris clair, au-dessus et en dessous du panneau. -->
<div class="wall-shell">
<section
  class="wall"
  class:is-shown={shown}
  bind:this={root}
  aria-label={label}
>
  <!-- ── Les fonds plein cadre, empilés : seule l'opacité change ──────────── -->
  <div class="wall__bg" aria-hidden="true">
    {#each projects as project, i (project.slug)}
      <img
        class="wall__bg-img"
        class:is-on={i === active}
        src={project.mur ?? project.hero?.image ?? project.vignette}
        alt=""
        loading="lazy"
        decoding="async"
        draggable="false"
      />
    {/each}
  </div>

  <!-- ── La liste des noms ─────────────────────────────────────────────────── -->
  <nav class="wall__names" aria-label={label}>
    <ul>
      {#each projects as project, i (project.slug)}
        <li style={`--i:${i};`}>
          <a
            class="wall__name nav-btn"
            href={`/${project.slug}`}
            data-cursor="button"
            data-sveltekit-preload-data="hover"
            on:mouseenter={() => entrer(i)}
            on:mouseleave={sortir}
            on:focus={() => entrer(i)}
            on:blur={sortir}
            on:mousemove={handleMove}
          >
            <span class="nav-btn-flip" data-text={project.title}>
              <span class="nav-btn-text">{project.title}</span>
            </span>
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <!-- ── Téléphone : la pile de cartes ────────────────────────────────────── -->
  <ul class="wall__stack">
    {#each projects as project, i (project.slug)}
      <li>
        <a
          class="wall__tile"
          href={`/${project.slug}`}
          data-sveltekit-preload-data="hover"
          use:revealBlock={{ delay: i * 110 }}
        >
          <img src={project.vignette} alt="" loading="lazy" decoding="async" />
          <span class="wall__tile-shade" aria-hidden="true"></span>
          <span class="wall__tile-copy">
            <span class="wall__tile-title">{project.title}</span>
          </span>
        </a>
      </li>
    {/each}
  </ul>
</section>
</div>

<style>
  .wall-shell {
    background: var(--bg-deep, #050709);
  }

  .wall {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    background: var(--bg-deep, #050709);
    color: #f4efe6;
  }

  /* ═══════════════════ GRAND ÉCRAN ═══════════════════ */
  @media (min-width: 901px) {
    .wall {
      height: 100svh;
      min-height: 40rem;
      padding: var(--site-inset, 1.2rem);
      border-radius: var(--project-media-radius, 22px);
      margin-inline: var(--site-inset, 1.2rem);
    }

    .wall-shell {
      padding-block: clamp(5rem, 10vw, 9rem);
    }

  }

  .wall__bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .wall__bg-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transform: scale(1.06);
    transition:
      opacity 700ms cubic-bezier(0.22, 1, 0.36, 1),
      transform 1600ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .wall__bg-img.is-on {
    /*  Le visuel du projet N'EST PLUS un décor : le voile et la composition
     *  posés par-dessus ont sauté, c'est lui qui porte le bloc, et il est donc
     *  rendu TEL QUEL — pas d'opacité partielle, qui n'était qu'un voile de
     *  plus. Les noms tiennent leur lisibilité par leur propre verre, assombri
     *  pour ça juste en dessous. */
    opacity: 1;
    transform: scale(1);
  }

  /* ── La colonne des noms ── */
  .wall__names {
    position: absolute;
    top: 0;
    bottom: 0;
    left: clamp(1.4rem, 3vw, 2.6rem);
    z-index: 4;
    display: flex;
    align-items: center;
    /* Pas de `top: 50%` + `translateY(-50%)` : un parent transformé casse le
       `backdrop-filter` des boutons qu'il contient. */
  }

  .wall__names ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: clamp(0.35rem, 0.7vw, 0.55rem);
  }

  /*  ⚠️ OPACITÉ SEULE, jamais un flou ni une translation.
   *  Chaque nom est un bouton de VERRE : un ancêtre porteur de `filter` ou de
   *  `transform` devient une racine de fond, et le bouton n'a alors plus rien
   *  à flouter — même `blur(0)` au repos suffit à casser l'effet, parce que
   *  c'est une valeur non-`none`. C'est aussi pour ça que ces lignes ne
   *  passent pas par l'action `reveal` du site, qui pose exactement ça. */
  .wall__names li {
    opacity: 0;
    transition: opacity 0.7s cubic-bezier(0.22, 0.61, 0.36, 1);
    transition-delay: calc(140ms + var(--i) * 80ms);
  }

  .wall.is-shown .wall__names li {
    opacity: 1;
  }

  /*  Le bouton du site, en trois morceaux : le verre, la bascule du libellé, et
   *  le halo de contour (`::before`/`::after` masqués en `xor`, centrés sur
   *  `--mx`/`--my` — d'où le `on:mousemove`). */
  .wall__name {
    position: relative;
    display: inline-flex;
    align-items: center;
    min-height: clamp(2.6rem, 3.1vw, 3.1rem);
    padding: 0 clamp(0.95rem, 1.4vw, 1.35rem);
    border-radius: 10px;
    /*  Verre SOMBRE, et non le verre clair du reste du site : le mur montre
     *  maintenant le visuel du projet en pleine lumière, et ces visuels vont
     *  du bleu nuit au gris très pâle. Un verre clair disparaissait sur les
     *  seconds. Assombrir le fond de la pastille plutôt que voiler toute
     *  l'image garde le visuel intact et les noms lisibles partout. */
    background: rgba(8, 10, 14, 0.28);
    backdrop-filter: blur(20px) saturate(150%) brightness(0.55);
    -webkit-backdrop-filter: blur(20px) saturate(150%) brightness(0.55);
    box-shadow: 0 6px 8px rgba(var(--shade-rgb, 5, 7, 9), 0.06);
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    font-family: var(--site-font);
    font-size: clamp(1rem, 1.35vw, 1.28rem);
    font-weight: var(--site-weight);
    color: rgba(255, 255, 255, 0.78);
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
    transition:
      color 300ms ease,
      background 700ms cubic-bezier(0.22, 0.61, 0.36, 1);
  }

  .wall__name:hover,
  .wall__name:focus-visible {
    background: rgba(8, 10, 14, 0.42);
    color: #fff;
  }

  .wall__name:focus-visible {
    outline: 2px solid var(--lead-blue, #5768ff);
    outline-offset: 3px;
  }

  .nav-btn-flip {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.25em;
    line-height: 1.25em;
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
    line-height: 1.25em;
    transform: translateY(100%);
    transition: transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1);
    white-space: nowrap;
    color: inherit;
  }

  .wall__name:hover .nav-btn-text {
    transform: translateY(-100%);
  }

  .wall__name:hover .nav-btn-flip::after {
    transform: translateY(0%);
  }

  .wall__name::before,
  .wall__name::after {
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

  .wall__name::before {
    background: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-strong) 0%,
      var(--site-glow-mid) 26%,
      var(--site-glow-soft) 52%,
      var(--site-glow-fade) 70%,
      transparent 86%
    );
  }

  .wall__name::after {
    background: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-ambient) 0%,
      var(--site-glow-outer) 48%,
      transparent 82%
    );
    filter: blur(3px);
  }

  .wall__name:hover::before,
  .wall__name:hover::after {
    opacity: 1;
  }

  /* ═══════════════════ TÉLÉPHONE ═══════════════════ */
  /*  ⚠️ La pile part de `display: none` et ne s'allume que dans la requête
   *  mobile ci-dessous. L'inverse — `grid` ici, `none` dans la requête bureau —
   *  a déjà cassé une fois : à spécificité égale c'est la DERNIÈRE règle du
   *  fichier qui gagne, la pile restait donc affichée sur grand écran, sans
   *  aucun de ses styles (ils vivent dans la requête mobile), et ses images
   *  sortaient à taille naturelle par-dessus tout le reste. */
  .wall__stack {
    display: none;
    position: relative;
    z-index: 3;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: clamp(0.5rem, 2vw, 0.8rem);
  }

  @media (max-width: 900px) {
    .wall__stack {
      display: grid;
    }

    .wall {
      padding:
        clamp(3rem, 10vw, 4.5rem)
        var(--project-side-padding, 0.9rem)
        clamp(3rem, 10vw, 4.5rem);
    }

    .wall__bg,
    .wall__names {
      display: none;
    }




    .wall__tile {
      position: relative;
      display: block;
      aspect-ratio: 1.42;
      overflow: hidden;
      border-radius: var(--project-media-radius, 18px);
      background: var(--bg-raised, #0a0e12);
      -webkit-tap-highlight-color: transparent;
    }

    .wall__tile img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .wall__tile-shade {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to top,
        rgba(var(--shade-rgb, 5, 7, 9), 0.84) 0%,
        rgba(var(--shade-rgb, 5, 7, 9), 0.34) 38%,
        rgba(var(--shade-rgb, 5, 7, 9), 0) 68%
      );
    }

    .wall__tile-copy {
      position: absolute;
      left: 1rem;
      right: 1rem;
      bottom: 0.95rem;
      display: flex;
      flex-direction: column;
      gap: 0.18rem;
      color: #fff;
    }

    .wall__tile-title {
      font-family: var(--site-font);
      font-weight: var(--site-weight-display);
      font-size: clamp(1.35rem, 6vw, 1.75rem);
      line-height: 1.04;
      letter-spacing: -0.03em;
    }

  }

  @media (prefers-reduced-motion: reduce) {
    .wall__bg-img,
    .wall__names li,
    .wall__name,
    .nav-btn-text,
    .nav-btn-flip::after {
      transition: none;
    }

    .wall__names li {
      opacity: 1;
    }
  }

  /*  ── Téléphone en PAYSAGE ──
   *  Le point de rupture canonique du site (voir `app.css`). Les tuiles en une
   *  colonne feraient une fois et demie la hauteur de l'écran : elles passent à
   *  deux, en format paysage. Et sur les grands téléphones qui dépassent 900 px
   *  en paysage, c'est le mur de bureau qui s'applique : sa hauteur plancher et
   *  sa vignette, taillées pour un écran haut, y sont ramenées à l'écran. */
  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .wall__stack {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .wall__tile {
      aspect-ratio: 1.6;
    }

    .wall {
      min-height: 0;
    }

    .wall-shell {
      padding-block: clamp(3rem, 7vw, 4.5rem);
    }

  }
</style>
