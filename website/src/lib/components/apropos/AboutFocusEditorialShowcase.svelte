<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { reveal } from "$lib/actions/reveal.js";

  // ─────────────────────────────────────────────────────────────────────────
  //  AboutFocusEditorialShowcase
  //
  //  Un seul bloc : l'image occupe tout le cadre, et la colonne de gauche est
  //  un ACCORDÉON — chaque volet est une pastille de verre qui s'ouvre SUR
  //  PLACE pour livrer son texte, sur le modèle des fiches techniques d'Apple.
  //  (Refonte du 2026-09-03. Avant, les noms n'étaient que des onglets et le
  //  texte se posait dans le coin bas droit, sur un voile ; les deux ont
  //  disparu — le texte vit maintenant dans la pastille, et le voile n'avait
  //  plus rien à assombrir.)
  //
  //  ── Pourquoi l'ouverture n'est pas animée en hauteur ─────────────────────
  //  `height: auto` ne s'interpole pas, et mesurer le contenu en JS pour poser
  //  une hauteur en pixels re-déclenche une mise en page à chaque image — sur
  //  un panneau posé au-dessus d'une photo en `backdrop-filter`, ça saccade.
  //  On anime donc `grid-template-rows` de `0fr` à `1fr` : c'est le navigateur
  //  qui interpole la hauteur, sans que rien ne soit mesuré ni réécrit.
  //
  //  Lecture automatique toutes les 10 s (et swipe, et flèches). Un clic sur un
  //  nom ne la coupe pas : il la repousse de `SELECT_HOLD`, le temps de lire le
  //  volet choisi sans que le texte bouge sous les yeux. Comme avant, la
  //  rotation s'arrête d'elle-même sur le dernier volet.
  // ─────────────────────────────────────────────────────────────────────────

  export let slides = [];
  export let interval = 8000; // durée par slide en lecture auto (ms)
  // Réglages visuels repris tels quels d'AboutEditorialSingleShowcase.
  export let imageFit = "cover";
  export let imagePosition = "center";

  const N = slides.length;
  const INPUT_COOLDOWN = 900;  // pause de la lecture auto après un swipe / une flèche
  const SELECT_HOLD = 20000;   // … et après un clic sur un nom (le temps de lire)
  const SWIPE_MIN = 42;       // px min pour valider un swipe horizontal
  const SWIPE_RATIO = 1.25;   // dx doit dépasser dy d'autant → geste horizontal

  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  const now = () =>
    typeof performance !== "undefined" ? performance.now() : Date.now();

  // ── État slider ────────────────────────────────────────────────────────────
  let activeIndex = 0;
  let playing = true;

  let autoTimer = null;
  let cooldownUntil = 0;
  let reduceMotion = false;
  let sectionInView = false;
  let sectionEl;
  let io;

  const atEnd = () => N > 1 && activeIndex >= N - 1;

  // ── Lecture automatique ──────────────────────────────────────────────────
  function pauseAuto() {
    if (autoTimer) {
      clearTimeout(autoTimer);
      autoTimer = null;
    }
  }
  function scheduleAuto() {
    pauseAuto();
    if (!playing || reduceMotion || !sectionInView || N <= 1) return;
    const wait = Math.max(interval, cooldownUntil - now());
    autoTimer = setTimeout(autoAdvance, wait);
  }
  function autoAdvance() {
    autoTimer = null;
    if (!playing || reduceMotion || !sectionInView) return;
    if (atEnd()) {
      playing = false; // s'arrête sur le dernier slide (bouton rejouer)
      return;
    }
    activeIndex += 1;
    scheduleAuto();
  }

  // ── Navigation manuelle (points, swipe, clavier) ───────────────────────────
  function goTo(i) {
    activeIndex = clamp(i, 0, N - 1);
    cooldownUntil = now() + INPUT_COOLDOWN;
    scheduleAuto();
  }

  // Choix explicite dans la colonne : on laisse le temps de lire avant que la
  // lecture auto ne reprenne la main.
  function select(i) {
    activeIndex = clamp(i, 0, N - 1);
    if (!reduceMotion) playing = true;
    cooldownUntil = now() + SELECT_HOLD;
    scheduleAuto();
  }
  function next() {
    if (N > 1) goTo(Math.min(activeIndex + 1, N - 1));
  }
  function prev() {
    if (N > 1) goTo(Math.max(activeIndex - 1, 0));
  }
  function togglePlay() {
    if (playing) {
      playing = false;
      pauseAuto();
      return;
    }
    playing = true;
    if (atEnd()) activeIndex = 0;
    scheduleAuto();
  }

  // ── Swipe horizontal (mobile) ──────────────────────────────────────────────
  let tsX = 0;
  let tsY = 0;
  let touching = false;
  let swiped = false;

  function onTouchStart(e) {
    const t = e.touches && e.touches[0];
    if (!t) return;
    tsX = t.clientX;
    tsY = t.clientY;
    touching = true;
    swiped = false;
  }
  function onTouchMove(e) {
    if (!touching || swiped || reduceMotion) return;
    const t = e.touches && e.touches[0];
    if (!t) return;
    const dx = t.clientX - tsX;
    const dy = t.clientY - tsY;
    if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy) * SWIPE_RATIO) {
      swiped = true;
      pauseAuto();
      cooldownUntil = now() + INPUT_COOLDOWN;
      if (dx < 0) next();
      else prev();
    }
  }
  function onTouchEnd() {
    touching = false;
  }

  // ── Clavier (flèches ← → quand le slider est visible) ──────────────────────
  function onKeydown(e) {
    if (!sectionInView) return;
    if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
  }

  function updateMotionMode() {
    if (!browser) return;
    reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }

  onMount(() => {
    if (!browser || N === 0) return;

    updateMotionMode();
    if (reduceMotion) playing = false;

    if (sectionEl) {
      sectionEl.addEventListener("touchstart", onTouchStart, { passive: true });
      sectionEl.addEventListener("touchmove", onTouchMove, { passive: true });
      sectionEl.addEventListener("touchend", onTouchEnd, { passive: true });

      io = new IntersectionObserver(
        ([entry]) => {
          sectionInView = entry.isIntersecting;
          if (sectionInView) scheduleAuto();
          else pauseAuto();
        },
        { threshold: 0.35 }
      );
      io.observe(sectionEl);
    }

    window.addEventListener("keydown", onKeydown, { passive: true });
  });

  onDestroy(() => {
    if (!browser) return;
    pauseAuto();
    if (sectionEl) {
      sectionEl.removeEventListener("touchstart", onTouchStart);
      sectionEl.removeEventListener("touchmove", onTouchMove);
      sectionEl.removeEventListener("touchend", onTouchEnd);
    }
    window.removeEventListener("keydown", onKeydown);
    io?.disconnect();
  });
</script>

<section class="afe" bind:this={sectionEl} aria-roledescription="carrousel" aria-label="Notre approche">
  <div class="afe__inner">
    <!-- Le bloc : image plein cadre, noms dedans à gauche, texte à droite. -->
    <div class="afe__panel">
      {#each slides as slide, i}
        <img
          class="afe__img"
          class:is-shown={activeIndex === i}
          src={slide.image}
          alt={activeIndex === i ? slide.alt : ""}
          loading={i < 2 ? "eager" : "lazy"}
          decoding="async"
          draggable="false"
          style={`object-fit:${imageFit}; object-position:${imagePosition};`}
        />
      {/each}

      <!-- L'accordéon. Chaque volet garde sa tête cliquable ; seul le corps
           s'ouvre en dessous, si bien que le nom ne bouge jamais d'un pixel
           pendant l'animation. -->
      <nav class="afe__nav" aria-label="Choisir un volet">
        {#each slides as slide, i}
          <div class="afe__item" class:is-open={activeIndex === i}>
            <button
              type="button"
              class="afe__head"
              data-cursor="button"
              aria-expanded={activeIndex === i}
              aria-controls={`afe-body-${i}`}
              on:click={() => select(i)}
            >
              <span class="afe__sign" aria-hidden="true"></span>
              <span class="afe__label">{slide.label}</span>
            </button>

            <div class="afe__reveal" id={`afe-body-${i}`} aria-hidden={activeIndex !== i ? "true" : undefined}>
              <div class="afe__reveal-in">
                <p class="afe__text">{@html slide.text}</p>
              </div>
            </div>
          </div>
        {/each}
      </nav>

    </div>
  </div>
</section>

<style>
  /* Même gabarit qu'AboutValues, en miroir. */
  .afe {
    --afe-bg: var(--bg-deep, #000);         /* le noir du site */
    --afe-panel: var(--bg-deep, #040404);   /* noir foncé — le bloc */
    --afe-ink: #f4efe6;
    --afe-muted: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.84);
    --afe-radius: 22px;
    /* L'arrondi des pastilles, et la courbe unique de toute l'ouverture. */
    --afe-pill: 14px;
    --afe-ease: cubic-bezier(0.22, 0.61, 0.36, 1);

    width: 100%;
    background: var(--afe-bg);
    color: var(--afe-ink);
    padding: clamp(4.5rem, 11vh, 9rem) var(--site-inset) clamp(5.5rem, 13vh, 11rem);
    overflow-x: clip;
    touch-action: pan-y;
  }

  .afe__inner {
    display: block;
  }

  /* ── Le bloc ────────────────────────────────────────────────────────────── */
  .afe__panel {
    position: relative;
    height: min(86vh, 960px);
    border-radius: var(--afe-radius);
    overflow: hidden;
    background: var(--afe-panel);
    isolation: isolate;
  }

  /* Les photographies remplissent le cadre, en fondu croisé d'un volet à l'autre. */
  .afe__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    z-index: 0;
    opacity: 0;
    transform: scale(1.04);
    backface-visibility: hidden;
    transition:
      opacity 0.9s ease,
      transform 1.4s var(--afe-ease);
  }

  .afe__img.is-shown {
    opacity: 1;
    transform: scale(1);
    z-index: 1;
  }

  /* ── L'accordéon, dans le bloc, à gauche ────────────────────────────────── */
  .afe__nav {
    position: absolute;
    z-index: 4;
    left: clamp(1.1rem, 2.1vw, 2.2rem);
    /* Centrage vertical SANS `transform` : un parent transformé casse le
       backdrop-filter de ses enfants (le header porte la même mise en garde),
       et c'est lui qui donne aux pastilles leur verre dépoli. */
    top: clamp(1.1rem, 2.1vw, 2.2rem);
    bottom: clamp(1.1rem, 2.1vw, 2.2rem);
    width: clamp(15rem, 26vw, 22rem);
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: clamp(0.4rem, 0.6vw, 0.6rem);
  }

  .afe__item {
    position: relative;
    border-radius: var(--afe-pill);
    /* Indispensable : c'est lui qui rogne le corps qui s'ouvre sur l'arrondi. */
    overflow: hidden;
  }

  /* Le verre. Un calque à part, pour pouvoir se renforcer en opacité à
     l'ouverture : allumer un backdrop-filter d'un coup « saute », et animer son
     rayon de flou le recalcule à chaque image.
     
     Il est FUMÉ, et pas teinté de blanc comme les boutons du header. Ces
     pastilles-là se posent sur trois photos dont une aube très claire, et il
     n'y a plus de voile sur l'image pour les rattraper : un verre clair y
     rendait le texte illisible.
     
     La teinte est celle du FOND DE SECTION, prise au jeton `--shade-rgb`
     (5, 7, 9 — soit `--bg-deep`) et non un noir pur inventé pour l'occasion :
     la pastille est le fond de la page posé devant la photo, pas un calque
     étranger. Sans contour, et volontairement peu dense — elle doit se fondre,
     pas se découper. */
  .afe__item::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    border-radius: inherit;
    background: rgba(var(--shade-rgb, 5, 7, 9), 0.34);
    backdrop-filter: blur(26px) saturate(135%) brightness(0.6);
    -webkit-backdrop-filter: blur(26px) saturate(135%) brightness(0.6);
    box-shadow: 0 4px 16px rgba(var(--shade-rgb, 0, 0, 0), 0.16);
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    opacity: 0.72;
    transition: opacity 0.55s var(--afe-ease);
    pointer-events: none;
  }

  .afe__item.is-open::before {
    opacity: 1;
  }

  /* ── La tête cliquable ──────────────────────────────────────────────────── */
  .afe__head {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: clamp(0.5rem, 0.8vw, 0.72rem);
    width: 100%;
    padding: clamp(0.72rem, 1.1vw, 0.95rem) clamp(0.85rem, 1.3vw, 1.15rem);
    border: 0;
    background: transparent;
    font-family: var(--site-font);
    font-size: clamp(0.95rem, 1.12vw, 1.15rem);
    font-weight: var(--site-weight);
    letter-spacing: -0.012em;
    line-height: 1.25;
    text-align: left;
    color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.72);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: color 0.45s var(--afe-ease);
  }

  @media (hover: hover) {
    .afe__head:hover {
      color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.9);
    }
  }

  .afe__item.is-open .afe__head {
    color: #ffffff;
    /* Le nom devient l'amorce du paragraphe : il se resserre sur lui. */
    padding-bottom: clamp(0.35rem, 0.5vw, 0.5rem);
  }

  .afe__head:focus-visible {
    outline: 2px solid var(--lead-blue, #5768ff);
    outline-offset: 3px;
  }

  /* Le « + » : deux barres dans un carré arrondi, la verticale disparaît à
     l'ouverture, ce qui laisse un « − ». Dessiné plutôt qu'écrit — un glyphe
     « + » ne se centre jamais tout à fait dans sa case, et son épaisseur suit
     la graisse de la police. Le carré ne tourne PAS : à 45° la barre restante
     devient une diagonale, et une case barrée en diagonale se lit « interdit ».
     L'arrondi est plus serré que celui de la pastille — un carré qui reprend le
     rayon de son conteneur se lit comme un trou dedans, pas comme un bouton. */
  .afe__sign {
    position: relative;
    flex: 0 0 auto;
    width: 1.2em;
    height: 1.2em;
    border-radius: 6px;
    border: 1px solid rgba(var(--ink-muted-rgb, 245, 241, 232), 0.34);
    transition: border-color 0.45s var(--afe-ease);
  }

  .afe__sign::before,
  .afe__sign::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0.5em;
    height: 1px;
    background: currentColor;
    translate: -50% -50%;
    transition: opacity 0.4s var(--afe-ease);
  }

  .afe__sign::after {
    rotate: 90deg;
  }

  .afe__item.is-open .afe__sign {
    border-color: rgba(255, 255, 255, 0.55);
  }

  .afe__item.is-open .afe__sign::after {
    opacity: 0;
  }

  /* ── Le corps qui s'ouvre ───────────────────────────────────────────────── */
  .afe__reveal {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.62s var(--afe-ease);
  }

  .afe__item.is-open .afe__reveal {
    grid-template-rows: 1fr;
  }

  /* `min-height: 0` + `overflow: hidden` : sans les deux, la ligne de grille
     refuse de descendre sous la hauteur de son contenu et rien ne s'anime. */
  .afe__reveal-in {
    min-height: 0;
    overflow: hidden;
    opacity: 0;
    transition: opacity 0.45s var(--afe-ease);
  }

  .afe__item.is-open .afe__reveal-in {
    opacity: 1;
    /* Le texte n'apparaît qu'une fois la place faite : sinon il se lit à
       travers sa propre coupe pendant toute l'ouverture. */
    transition-delay: 0.14s;
  }

  .afe__text {
    margin: 0;
    padding: 0 clamp(0.85rem, 1.3vw, 1.15rem) clamp(0.9rem, 1.3vw, 1.15rem);
    font-family: var(--site-font);
    font-size: clamp(0.92rem, 1.02vw, 1.02rem);
    font-weight: var(--site-weight);
    line-height: 1.5;
    letter-spacing: -0.008em;
    color: var(--afe-muted);
    text-wrap: pretty;
  }

  .afe__text :global(.hl) {
    color: var(--afe-ink);
  }

  @media (prefers-reduced-motion: reduce) {
    .afe__img {
      transform: none;
      transition: opacity 0.25s ease;
    }

    .afe__reveal,
    .afe__reveal-in,
    .afe__sign {
      transition-duration: 0.001s;
    }
  }

  /* ── Écrans étroits : l'accordéon s'assoit au bas du bloc ───────────────── */
  @media (max-width: 900px) {
    .afe {
      padding: clamp(3.5rem, 9vh, 6rem) 1rem clamp(4rem, 10vh, 7rem);
    }

    /* Plus haut qu'avant (2026-09-03) : l'accordéon ouvert occupe le bas du
       cadre, et à 78vh il ne restait presque plus de photo à voir au-dessus. */
    .afe__panel {
      height: min(86vh, 820px);
      border-radius: 18px;
    }

    /* Il reste en COLONNE — un accordéon couché n'existe pas. Ancré en bas, il
       pousse vers le haut en s'ouvrant, donc la pastille cliquée ne se dérobe
       jamais sous le doigt. */
    .afe__nav {
      left: clamp(0.8rem, 3vw, 1.2rem);
      right: clamp(0.8rem, 3vw, 1.2rem);
      top: clamp(0.8rem, 3vw, 1.2rem);
      bottom: clamp(0.8rem, 3vw, 1.2rem);
      width: auto;
      justify-content: flex-end;
    }

    /* Même flou allégé que le bouton du header sur petit écran. */
    .afe__item::before {
      backdrop-filter: blur(12px) saturate(130%) brightness(0.5);
      -webkit-backdrop-filter: blur(12px) saturate(130%) brightness(0.5);
    }

    .afe__head {
      font-size: 0.98rem;
      padding: 0.78rem 1.05rem;
    }

    .afe__text {
      font-size: 0.95rem;
      padding: 0 1.05rem 0.95rem;
    }
  }

  /* ── Téléphone en paysage ──────────────────────────────────────────────── */
  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .afe {
      padding: 8svh 1.25rem;
    }

    .afe__panel {
      height: min(84svh, 420px);
    }

    /* Boîte large et courte : la colonne revient à gauche, centrée. */
    .afe__nav {
      left: clamp(0.8rem, 2vw, 1.2rem);
      right: auto;
      top: clamp(0.7rem, 2vw, 1rem);
      bottom: clamp(0.7rem, 2vw, 1rem);
      width: clamp(13rem, 34vw, 18rem);
      justify-content: center;
      gap: 0.35rem;
    }

    .afe__head {
      font-size: 0.9rem;
      padding: 0.55rem 0.85rem;
    }

    .afe__text {
      font-size: 0.85rem;
      line-height: 1.45;
      padding: 0 0.85rem 0.75rem;
    }
  }
</style>
