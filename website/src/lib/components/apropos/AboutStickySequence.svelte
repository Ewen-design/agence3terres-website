<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { reveal } from "$lib/actions/reveal.js";
  import {
    registerParallax,
    unregisterParallax,
    registerWrite,
    unregisterWrite,
    forceScrollEngineUpdate
  } from "$lib/scrollEngine.js";

  // ─────────────────────────────────────────────────────────────────────────
  //  AboutStickySequence — « Slider séquence collée » de la librairie.
  //
  //  La scène reste COLLÉE le temps que la séquence se déroule : chaque tour
  //  d'écran change d'image (le fondu croisé d'AboutValues, plus bas sur la
  //  page), la phrase se recompose (arrivée mot à mot du site, pas les lignes
  //  de la librairie) et une jauge verticale avance le long des noms des
  //  volets. Remonter rejoue la séquence à l'envers.
  //
  //  LES NOMS SONT POSÉS SUR LA JAUGE, là où le volet change : la pointe de la
  //  jauge atteint un nom exactement quand son volet arrive. La jauge suit
  //  toute la course (`p`), découpée en n segments égaux, et chaque nom est au
  //  MILIEU du sien — à `(i + 0,5) / n`, soit 1/6, 1/2 et 5/6 pour trois. Aux
  //  deux bouts, un demi-segment : à l'entrée, le cadre s'ouvre sur la première
  //  image et la jauge descend vers le premier nom, qui allume sa phrase ; à la
  //  sortie, elle finit sa course pendant le dernier volet, puis le cadre se
  //  referme. Aucun défilement ne tombe dans le vide (des noms aux extrémités
  //  laissaient la jauge pleine pendant tout le dernier volet). Un clic sur un
  //  nom défile jusqu'au point où son volet arrive.
  //
  //  L'ENTRÉE ET LA SORTIE sont celles du hero de la page, prises à l'envers :
  //  là-bas le cadre part plein écran et se referme au premier cran ; ici il
  //  arrive REFERMÉ (marge du site, arrondi), s'ouvre en plein écran quand la
  //  scène se colle, et se referme quand elle se décolle. Même mécanique :
  //  une bascule de `--seq-t` lue sur le défilement, un `clip-path` et une
  //  `transition` CSS qui mène l'animation. Les repères entrent et sortent avec
  //  lui.
  //
  //  Les règles du collant (voir le mémo « défilement de bureau ») :
  //    • aucune couche forcée ni isolation sur `.seq__scene` ;
  //    • rien à `opacity: 0` dedans une fois le fondu fini — les images
  //      éteintes et les repères repliés passent en `visibility: hidden` ;
  //    • lecture dans la phase de LECTURE du moteur, écriture dans la sienne,
  //      jamais d'écouteur `scroll` à soi.
  // ─────────────────────────────────────────────────────────────────────────

  /** `{ label, text (HTML, `.hl` en pleine encre), image, alt }` */
  export let slides = [];
  /** Course de défilement par slide, en hauteurs d'écran. */
  export let step = 1;

  //  Deux seuils asymétriques, comme `heroFrame` : s'ouvrir un peu plus loin
  //  qu'on ne se referme évite le clignotement quand on s'arrête sur la limite.
  const OPEN_AT = 16; // px de course déjà parcourue (ou restante) : le cadre s'ouvre
  const CLOSE_AT = 4; // px du bord de la course : il se referme
  //  Où un clic sur un nom pose le lecteur : juste après l'arrivée du volet, et
  //  au-delà d'`OPEN_AT` pour que le premier garde son cadre ouvert.
  const LAND_AT = 24;

  let trackEl;
  let sceneEl;
  let gaugeEl;

  /** Le volet atteint ; -1 avant le premier nom (l'entrée : image seule). */
  let active = -1;
  let near = false;
  let needMeasure = true;
  let course = 1;

  let open = false;
  let openApplied = false;
  let progress = 0;
  let gauge = 0;
  let gaugeApplied = -1;

  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));

  $: count = Math.max(slides.length, 1);
  $: current = active >= 0 ? slides[Math.min(active, slides.length - 1)] : null;
  // La première image est déjà là pendant l'entrée, avant son nom.
  $: shown = Math.max(active, 0);

  function handleRead(y, ctx) {
    if (!near || !trackEl || !sceneEl) {
      open = false;
      return;
    }

    if (needMeasure) {
      needMeasure = false;
      course = Math.max(trackEl.offsetHeight - sceneEl.offsetHeight, 1);
    }

    const trackTop = trackEl.getBoundingClientRect().top + y;

    // Le cadre suit la position RÉELLE, comme celui du hero : c'est une bascule,
    // l'animation est portée par la transition CSS.
    const inside = Math.min(y - trackTop, trackTop + course - y);
    if (!open && inside >= OPEN_AT) open = true;
    else if (open && inside <= CLOSE_AT) open = false;

    // La séquence suit la position lissée à la molette (sinon la jauge avance
    // par crans), la position réelle au doigt (le lissage n'y serait qu'un retard).
    const motion = ctx?.isTouch ? y : ctx?.motionY ?? y;
    progress = clamp((motion - trackTop) / course);

    // Le volet i arrive au milieu de son segment, à `(i + 0,5) / n`.
    const next = clamp(Math.floor(progress * count - 0.5), -1, count - 1);
    if (next !== active) active = next;

    gauge = progress;
  }

  function handleWrite() {
    if (open !== openApplied && sceneEl) {
      sceneEl.style.setProperty("--seq-t", open ? "0" : "1");
      sceneEl.classList.toggle("is-open", open);
      openApplied = open;
    }

    if (gaugeEl && Math.abs(gauge - gaugeApplied) > 0.0005) {
      gaugeEl.style.transform = `scaleY(${gauge.toFixed(4)})`;
      gaugeApplied = gauge;
    }
  }

  //  Hors image : un clic, une lecture de géométrie, puis le défilement natif
  //  fait le reste — la séquence suit comme si on avait défilé à la main.
  function goTo(i) {
    if (!trackEl || !sceneEl) return;
    const y = window.scrollY || window.pageYOffset || 0;
    const trackTop = trackEl.getBoundingClientRect().top + y;
    const total = Math.max(trackEl.offsetHeight - sceneEl.offsetHeight, 1);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    window.scrollTo({
      top: Math.round(trackTop + (total * (i + 0.5)) / count + LAND_AT),
      behavior: reduce ? "auto" : "smooth"
    });
  }

  onMount(() => {
    if (!browser) return;

    const scheduleMeasure = () => {
      needMeasure = true;
      forceScrollEngineUpdate();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        scheduleMeasure();
      },
      { rootMargin: "100% 0px 100% 0px" }
    );
    io.observe(trackEl);

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(scheduleMeasure) : null;
    ro?.observe(trackEl);
    ro?.observe(sceneEl);

    registerParallax(handleRead, { priority: 2 });
    registerWrite(handleWrite, { priority: 2 });
    forceScrollEngineUpdate();

    return () => {
      io.disconnect();
      ro?.disconnect();
      unregisterParallax(handleRead);
      unregisterWrite(handleWrite);
    };
  });
</script>

<section class="seq" aria-label="Notre approche">
  <div
    class="seq__track"
    bind:this={trackEl}
    style={`--seq-course: ${100 + count * Math.max(0.6, step) * 100};`}
  >
    <div class="seq__scene" bind:this={sceneEl}>
      <!-- Le cadre : images empilées et voile. C'est lui qu'on découpe. -->
      <div class="seq__frame">
        {#each slides as slide, i (slide.image)}
          <img
            class="seq__img"
            class:is-shown={i === shown}
            src={slide.image}
            alt={i === shown ? slide.alt : ""}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            draggable="false"
          />
        {/each}
        <span class="seq__shade" aria-hidden="true"></span>
      </div>

      <!-- Le texte et les repères vivent HORS du cadre — dedans, le découpage
           les rognerait — et sont posés à la marge du cadre refermé : il
           s'ouvre et se referme autour d'eux sans qu'ils bougent. -->
      <div class="seq__content">
        <div class="seq__phrase" aria-live="polite">
          {#key active}
            {#if current}
              <p use:reveal>{@html current.text}</p>
            {/if}
          {/key}
        </div>

        <nav class="seq__marks" aria-label="Choisir un volet">
          <div class="seq__bar" aria-hidden="true">
            <span class="seq__gauge" bind:this={gaugeEl}></span>
          </div>

          {#each slides as slide, i (slide.image)}
            <button
              type="button"
              class="seq__name"
              class:is-active={i === active}
              style={`--seq-at: ${(i + 0.5) / count};`}
              data-cursor="button"
              aria-current={i === active ? "step" : undefined}
              on:click={() => goTo(i)}
            >
              {slide.label}
            </button>
          {/each}
        </nav>
      </div>
    </div>
  </div>
</section>

<style>
  .seq {
    --seq-inset: var(--site-inset);
    --seq-radius: 22px;
    --seq-ink: #ffffff;
    --seq-muted: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.68);

    width: 100%;
    background: var(--bg-deep, #000);
    padding: clamp(4.5rem, 11vh, 9rem) 0 clamp(5.5rem, 13vh, 11rem);
  }

  /* La piste : un écran d'entrée pour la scène, puis un tour par slide. */
  .seq__track {
    position: relative;
    height: calc(var(--seq-course) * 1svh);
  }

  /* La scène collée. `--seq-t` : 1 cadre refermé (marge + arrondi), 0 plein
     écran — basculé par `handleWrite`, jamais réécrit image par image. */
  .seq__scene {
    --seq-t: 1;
    position: sticky;
    top: 0;
    height: 100svh;
    color: var(--seq-ink);
  }

  /* Le cadre. Il occupe TOUTE la scène ; c'est le découpage qui le referme et
     une `transition` qui l'anime — la même que celle du hero. Aucune mise en
     page n'est refaite : les images gardent leur taille, seul le contour bouge. */
  .seq__frame {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: var(--bg-deep, #000);
    clip-path: inset(
      calc(var(--seq-inset) * var(--seq-t))
      round calc(var(--seq-radius) * var(--seq-t))
    );
    transition: clip-path 820ms cubic-bezier(0.22, 1, 0.36, 1);
    pointer-events: none;
  }

  /* Le changement d'image d'AboutValues : fondu croisé, la nouvelle se pose
     de 1,05 à 1 pendant que l'ancienne s'efface. Une image éteinte passe en
     `visibility: hidden` une fois son fondu fini. */
  .seq__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    opacity: 0;
    visibility: hidden;
    transform: scale(1.05);
    backface-visibility: hidden;
    transition:
      opacity 0.9s ease,
      transform 1.4s cubic-bezier(0.22, 0.61, 0.36, 1),
      visibility 0s linear 0.9s;
    will-change: opacity, transform;
  }

  .seq__img.is-shown {
    z-index: 1;
    opacity: 1;
    visibility: visible;
    transform: scale(1);
    transition:
      opacity 0.9s ease,
      transform 1.4s cubic-bezier(0.22, 0.61, 0.36, 1),
      visibility 0s linear 0s;
  }

  /* Le voile : une base légère, plus dense du côté de la phrase, et un peu
     sur le bord droit pour les repères — le ciel du deuxième volet est clair. */
  .seq__shade {
    position: absolute;
    inset: 0;
    z-index: 50;
    background:
      linear-gradient(
        to right,
        rgba(var(--shade-rgb, 0, 0, 0), 0.56) 0%,
        rgba(var(--shade-rgb, 0, 0, 0), 0.24) 48%,
        rgba(var(--shade-rgb, 0, 0, 0), 0) 70%,
        rgba(var(--shade-rgb, 0, 0, 0), 0) 78%,
        rgba(var(--shade-rgb, 0, 0, 0), 0.34) 100%
      ),
      rgba(var(--shade-rgb, 0, 0, 0), 0.22);
  }

  /* Posé à la marge du cadre REFERMÉ, comme `.hero-stage-content` : l'inset est
     fixe, c'est le cadre qui vient à lui. */
  .seq__content {
    position: absolute;
    inset: var(--seq-inset);
    z-index: 2;
  }

  /* ── La phrase ── */
  .seq__phrase {
    position: absolute;
    top: 50%;
    left: clamp(1rem, 2.2vw, 2.2rem);
    width: min(48%, 44rem);
    transform: translateY(-50%);
  }

  .seq__phrase p {
    margin: 0;
    font-family: var(--site-font);
    font-size: clamp(1.375rem, 2.6vw, 2.25rem);
    font-weight: var(--site-weight-display, 500);
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: var(--seq-muted);
    text-wrap: pretty;
  }

  .seq__phrase :global(.hl) {
    color: var(--seq-ink);
  }

  /* ── Les repères : la jauge et les noms des volets, posés dessus ──
     Ils entrent quand le cadre s'ouvre et sortent quand il se referme. Repliés,
     ils passent en `visibility: hidden` (règle du collant). La boîte n'a que la
     largeur de la jauge : les noms débordent à sa gauche. */
  .seq__marks {
    position: absolute;
    top: 50%;
    right: clamp(1rem, 2.2vw, 2.2rem);
    width: 1px;
    height: clamp(240px, 40vh, 420px);
    opacity: 0;
    visibility: hidden;
    transform: translate3d(0, calc(-50% + 10px), 0);
    transition:
      opacity 420ms cubic-bezier(0.4, 0, 0.2, 1),
      transform 520ms cubic-bezier(0.22, 1, 0.36, 1),
      visibility 0s linear 520ms;
  }

  .seq__scene:global(.is-open) .seq__marks {
    opacity: 1;
    visibility: visible;
    transform: translate3d(0, -50%, 0);
    transition:
      opacity 620ms cubic-bezier(0.22, 1, 0.36, 1) 260ms,
      transform 760ms cubic-bezier(0.22, 1, 0.36, 1) 260ms,
      visibility 0s linear 0s;
  }

  .seq__bar {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.3);
  }

  /* `scaleY` écrit par `handleWrite`, directement sur la jauge. */
  .seq__gauge {
    position: absolute;
    top: 0;
    left: -1px;
    width: 3px;
    height: 100%;
    background: var(--seq-ink);
    transform: scaleY(0);
    transform-origin: top;
    will-change: transform;
  }

  /* Centré sur SON point de la jauge (`--seq-at`, de 0 à 1) : le volet change
     quand la pointe y arrive. Taille et couleurs des noms d'AboutValues. */
  .seq__name {
    position: absolute;
    top: calc(var(--seq-at) * 100%);
    right: clamp(1.1rem, 1.5vw, 1.5rem);
    transform: translateY(-50%);
    padding: 0.5rem 0;
    border: 0;
    background: none;
    font-family: var(--site-font);
    font-size: clamp(0.95rem, 1.15vw, 1.18rem);
    font-weight: var(--site-weight);
    line-height: 1.25;
    letter-spacing: -0.012em;
    white-space: nowrap;
    text-align: right;
    color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.58);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: color 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
  }

  @media (hover: hover) {
    .seq__name:hover {
      color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.82);
    }
  }

  .seq__name.is-active {
    color: #ffffff;
  }

  .seq__name:focus-visible {
    outline: 2px solid var(--lead-blue, #5768ff);
    outline-offset: 3px;
    border-radius: 4px;
  }

  /* ── Écrans étroits : la marge et l'arrondi du hero, la phrase en haut, les
     repères en bas à droite ── */
  @media (max-width: 900px) {
    .seq {
      --seq-inset: 1rem;
      --seq-radius: 18px;
      padding: clamp(3.5rem, 9vh, 6rem) 0 clamp(4rem, 10vh, 7rem);
    }

    .seq__shade {
      background:
        linear-gradient(
          to bottom,
          rgba(var(--shade-rgb, 0, 0, 0), 0.5) 0%,
          rgba(var(--shade-rgb, 0, 0, 0), 0.22) 52%,
          rgba(var(--shade-rgb, 0, 0, 0), 0.32) 100%
        ),
        rgba(var(--shade-rgb, 0, 0, 0), 0.18);
    }

    .seq__phrase {
      top: clamp(4.5rem, 11vh, 7rem);
      right: 1rem;
      left: 1rem;
      width: auto;
      transform: none;
    }

    .seq__phrase p {
      font-size: clamp(1.3rem, 5.4vw, 1.9rem);
    }

    .seq__marks {
      top: auto;
      right: 1rem;
      bottom: clamp(1.6rem, 4.5vh, 2.8rem);
      height: clamp(150px, 22vh, 210px);
      transform: translate3d(0, 10px, 0);
    }

    .seq__name {
      font-size: 0.95rem;
    }

    .seq__scene:global(.is-open) .seq__marks {
      transform: translate3d(0, 0, 0);
    }
  }

  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .seq__phrase {
      top: 50%;
      width: min(56%, 30rem);
      transform: translateY(-50%);
    }

    .seq__phrase p {
      font-size: clamp(1.05rem, 2.6vw, 1.4rem);
    }

    .seq__marks {
      top: 50%;
      bottom: auto;
      height: 52svh;
      transform: translate3d(0, calc(-50% + 10px), 0);
    }

    .seq__name {
      font-size: 0.92rem;
    }

    .seq__scene:global(.is-open) .seq__marks {
      transform: translate3d(0, -50%, 0);
    }
  }

  /* Mouvement réduit : le collage reste (c'est la lecture, pas une animation),
     les fondus et le cadre changent d'un coup. */
  @media (prefers-reduced-motion: reduce) {
    .seq__frame,
    .seq__img,
    .seq__img.is-shown,
    .seq__marks,
    .seq__scene:global(.is-open) .seq__marks,
    .seq__name {
      transition: none;
    }

    .seq__img {
      transform: none;
    }
  }
</style>
