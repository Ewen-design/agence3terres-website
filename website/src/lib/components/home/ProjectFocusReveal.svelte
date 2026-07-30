<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";

  // ─────────────────────────────────────────────────────────────────────────
  //  ProjectFocusReveal — slider plein écran (100vh) des projets.
  //
  //  Rotation AUTOMATIQUE (lecture auto), agencement identique à avant : image
  //  du projet en plein écran + titre / texte centrés + bouton verre, plus le
  //  module de suivi (pilule de points + lecture/pause) à DROITE (desktop) ou en
  //  BAS (mobile).
  //
  //  Le scroll vertical NE change PLUS les slides : le composant est un simple
  //  bloc de 100vh dans le flux de la page. Sur mobile, on change de slide en
  //  SWIPANT horizontalement — la transition reste le même fondu doux qu'avant
  //  (fondu de l'image + arrivée du titre), sans jamais capturer le scroll de la
  //  page.
  // ─────────────────────────────────────────────────────────────────────────

  export let slides = [];
  export let ctaLabel = "Voir le projet";
  export let interval = 4800; // durée par slide en lecture auto (ms)

  const N = slides.length;
  const INPUT_COOLDOWN = 900; // pause de la lecture auto après une action
  const SWIPE_MIN = 42;       // px min pour valider un swipe horizontal
  const SWIPE_RATIO = 1.25;   // dx doit dépasser dy d'autant → geste horizontal

  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  const now = () =>
    typeof performance !== "undefined" ? performance.now() : Date.now();

  // ── État réactif ─────────────────────────────────────────────────────────
  let activeIndex = 0;
  let playing = true;

  // Préchauffage du backdrop-filter (même technique que header/contact) : évite
  // que le flou des boutons verre apparaisse en retard au premier rendu.
  let blurWarm = false;
  let blurWarmTimer;

  // ── État interne ───────────────────────────────────────────────────────────
  let autoTimer = null;
  let cooldownUntil = 0;
  let reduceMotion = false;
  let sectionInView = false;
  let sectionEl;
  let io;

  const atEnd = () => N > 1 && activeIndex >= N - 1;

  // Bouton PERSISTANT : un seul élément dont le lien/label change réactivement au
  // fil des slides (pas de re-montage → le backdrop-filter ne se réinitialise
  // pas, donc plus d'« effet d'apparition » du flou à chaque changement).
  $: activeSlide = slides[activeIndex] ?? {};
  $: activeHref = activeSlide.href;
  $: activeCta = activeSlide.cta ?? ctaLabel;
  $: activeTitle = (activeSlide.title ?? "").replace(/\n/g, " ");

  // Glow qui suit le curseur — même effet que les autres boutons du site.
  function handleGlowMove(event) {
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

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
      playing = false; // s'arrête sur le dernier projet (comme avant → bouton rejouer)
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
  //  On détecte un geste dominant horizontal (dx > dy) et on avance / recule
  //  d'un slide → la transition reste le fondu doux habituel. On n'appelle jamais
  //  preventDefault (écouteurs passifs) : le scroll vertical de la page reste
  //  100% natif, seuls les gestes franchement horizontaux changent de slide.
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

  // ── Cycle de vie ───────────────────────────────────────────────────────────
  function updateMotionMode() {
    if (!browser) return;
    reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }

  onMount(() => {
    if (!browser || N === 0) return;

    updateMotionMode();
    if (reduceMotion) playing = false;

    // Préchauffage du flou des boutons (retiré après ~9 s).
    requestAnimationFrame(() => requestAnimationFrame(() => (blurWarm = true)));
    blurWarmTimer = setTimeout(() => (blurWarm = false), 9000);

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
    clearTimeout(blurWarmTimer);
    if (sectionEl) {
      sectionEl.removeEventListener("touchstart", onTouchStart);
      sectionEl.removeEventListener("touchmove", onTouchMove);
      sectionEl.removeEventListener("touchend", onTouchEnd);
    }
    window.removeEventListener("keydown", onKeydown);
    io?.disconnect();
  });
</script>

{#if N > 0}
{#if blurWarm}
  <div class="fr__blur-prewarm" aria-hidden="true">
    <span></span>
    <span></span>
  </div>
{/if}
<section
  class="fr"
  bind:this={sectionEl}
  style="--n:{N}"
  aria-roledescription="carrousel"
  aria-label="Sélection de projets"
>
  <!-- Fond : images plein écran en fondu doux (piloté par le slide actif) -->
  <div class="fr__bg" aria-hidden="true">
    {#each slides as slide, i}
      <img
        class="fr__bg-img"
        class:is-shown={activeIndex === i}
        src={slide.images[0]}
        alt=""
        loading={i < 2 ? "eager" : "lazy"}
        decoding="async"
        draggable="false"
      />
    {/each}
  </div>

  <!-- Overlay : halo radial dans le coin du texte (desktop) / voile doux (mobile) -->
  <div class="fr__focus-overlay" aria-hidden="true"></div>

  <!-- Bloc texte + bouton (coin bas gauche desktop / centré mobile) -->
  <div class="fr__focus">
    <div class="fr__content">
      <div class="fr__copy">
        {#each slides as slide, i}
          <div
            class="fr__focus-slot"
            class:is-active={activeIndex === i}
            aria-hidden={activeIndex !== i ? "true" : undefined}
          >
            <h2 class="fr__title">{slide.title}</h2>
            {#if slide.description}
              <p class="fr__desc">{slide.description}</p>
            {/if}
          </div>
        {/each}
      </div>

      {#if activeHref}
        <a
          href={activeHref}
          class="fr__btn"
          data-cursor="button"
          on:mousemove={handleGlowMove}
          aria-label={activeCta + " — " + activeTitle}
        >
          <span class="fr__btn-inner" data-text={activeCta}>
            <span class="fr__btn-text">{activeCta}</span>
          </span>
        </a>
      {/if}
    </div>
  </div>

  <!-- Barre de suivi — pilule à points + lecture/pause (droite desktop / bas mobile) -->
  <div class="fr__rail" role="group" aria-label="Progression des projets">
    <div class="fr__pill" role="tablist" aria-label="projets">
      {#each slides as slide, i}
        <button
          type="button"
          class="fr__dot"
          class:is-active={activeIndex === i}
          role="tab"
          aria-selected={activeIndex === i}
          aria-label={"Projet " + (i + 1) + " : " + slide.title.replace(/\n/g, " ")}
          on:click={() => goTo(i)}
        ></button>
      {/each}
    </div>

    {#if N > 1}
      <button
        type="button"
        class="fr__pp"
        data-no-wipe
        on:click={togglePlay}
        aria-label={playing ? "Pause de la lecture automatique" : atEnd() ? "Rejouer la lecture automatique" : "Lecture automatique"}
      >
        {#if playing}
          <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><rect x="7" y="6" width="3.4" height="12" rx="1.1" fill="currentColor"/><rect x="13.6" y="6" width="3.4" height="12" rx="1.1" fill="currentColor"/></svg>
        {:else if atEnd()}
          <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-.6 4"/><polyline points="20 5 20 11 14 11"/></svg>
        {:else}
          <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>
        {/if}
      </button>
    {/if}
  </div>
</section>
{/if}

<style>
  .fr {
    position: relative;
    width: 100%;
    height: 100vh;
    height: 100lvh;
    overflow: hidden;
    background: #000;
    isolation: isolate;
    z-index: 2;
    /* Le slider ne change de slide qu'au swipe horizontal / points / lecture
       auto : on laisse le scroll vertical de la page totalement natif. */
    touch-action: pan-y;
    --fr-ease: cubic-bezier(0.16, 1, 0.3, 1);
    --fr-ease-soft: cubic-bezier(0.22, 0.61, 0.36, 1);
    --fr-dur-img: 0.85s;   /* fondu entre deux projets */
    --bar-inset: 0px;
    --bar-inset: calc(100lvh - 100svh);
  }

  /* ── Fond : images plein écran en fondu ────────────────────────────────────── */
  .fr__bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    background: #000;
  }
  .fr__bg-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    opacity: 0;
    backface-visibility: hidden;
    transition: opacity var(--fr-dur-img) var(--fr-ease-soft);
  }
  .fr__bg-img.is-shown {
    z-index: 1;
    opacity: 1;
  }

  /* ── Overlay ────────────────────────────────────────────────────────────────
     Desktop : UNIQUEMENT un halo radial dans le coin du texte (bas gauche).
     Mobile (plus bas) : un voile doux, pas trop fort, sur toute l'image. */
  .fr__focus-overlay {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    background: radial-gradient(
      125% 105% at 0% 100%,
      rgba(2, 5, 10, 0.74) 0%,
      rgba(2, 5, 10, 0.44) 24%,
      rgba(2, 5, 10, 0.16) 44%,
      rgba(2, 5, 10, 0) 64%
    );
  }

  /* ── Focus : titre + texte + bouton (coin bas gauche sur desktop) ───────────── */
  .fr__focus {
    position: absolute;
    inset: 0;
    z-index: 3;
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
    text-align: left;
    padding: clamp(2.2rem, 5vw, 5.5rem);
    padding-bottom: clamp(2.6rem, 6vh, 5.5rem);
    pointer-events: none;
  }
  .fr__content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: clamp(1.4rem, 2.4vw, 2.1rem);
    max-width: 42rem;
  }
  .fr__copy {
    display: grid;
  }
  .fr__focus-slot {
    grid-area: 1 / 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    opacity: 0;
    transform: translate3d(0, 26px, 0) scale(0.985);
    transition: opacity 0.9s var(--fr-ease-soft),
      transform 1s var(--fr-ease);
    backface-visibility: hidden;
    pointer-events: none;
  }
  .fr__focus-slot.is-active {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
    pointer-events: auto;
  }

  .fr__title {
    margin: 0;
    font-family: var(--site-font, "Inter", sans-serif);
    font-weight: 600;
    font-size: clamp(3.2rem, 6.4vw, 7.6rem);
    line-height: 0.94;
    letter-spacing: -0.03em;
    color: #fff;
    white-space: pre-line;
    text-wrap: balance;
    text-shadow: 0 8px 42px rgba(0, 0, 0, 0.4);
  }
  .fr__desc {
    margin: clamp(1rem, 2vw, 1.6rem) 0 0;
    max-width: 34ch;
    font-family: var(--site-font, "Inter", sans-serif);
    font-weight: 300;
    font-size: clamp(1rem, 1.2vw, 1.25rem);
    line-height: 1.55;
    color: rgba(255, 255, 255, 0.9);
    white-space: pre-line;
    text-wrap: pretty;
    text-shadow: 0 4px 24px rgba(0, 0, 0, 0.45);
  }

  /* ── Bouton verre (identique aux autres boutons du site) ───────────────────── */
  .fr__btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 42px;
    padding: 0 1.6rem;
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 0.92rem;
    color: #fff;
    text-decoration: none;
    white-space: nowrap;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    border-radius: 10px;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.08);
    pointer-events: auto;
    will-change: transform, opacity;
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    transition: background 0.3s ease, transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .fr__btn:hover { background: rgba(255, 255, 255, 0.18); }
  .fr__btn:focus-visible {
    outline: 2px solid var(--lead-blue, #5768ff);
    outline-offset: 3px;
  }
  .fr__btn::before,
  .fr__btn::after {
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
  .fr__btn::before {
    background: radial-gradient(
      96px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-strong) 0%,
      var(--site-glow-mid) 26%,
      var(--site-glow-soft) 52%,
      var(--site-glow-fade) 70%,
      transparent 86%
    );
  }
  .fr__btn::after {
    background: radial-gradient(
      120px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-ambient) 0%,
      var(--site-glow-outer) 48%,
      transparent 82%
    );
    filter: blur(3px);
  }
  .fr__btn:hover::before,
  .fr__btn:hover::after { opacity: 1; }
  .fr__btn-inner {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
  }
  .fr__btn-text { display: block; transition: transform 0.42s cubic-bezier(0.22, 0.61, 0.36, 1); }
  .fr__btn-inner::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition: transform 0.42s cubic-bezier(0.22, 0.61, 0.36, 1);
    white-space: nowrap;
    color: inherit;
  }
  .fr__btn:hover .fr__btn-text { transform: translateY(-100%); }
  .fr__btn:hover .fr__btn-inner::after { transform: translateY(0); }

  /* ── Barre de suivi (droite) — pilule verticale à points, façon dock ───────── */
  .fr__rail {
    position: absolute;
    right: clamp(1rem, 3vw, 2.6rem);
    top: 50%;
    transform: translateY(-50%);
    z-index: 6;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(0.8rem, 1.4vw, 1.1rem);
    pointer-events: auto;
  }
  .fr__pill,
  .fr__pp {
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.08);
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
  .fr__pill {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(0.85rem, 1.5vh, 1.25rem);
    width: clamp(2.5rem, 3vw, 3rem);
    padding: clamp(1rem, 1.6vw, 1.35rem) 0;
    border-radius: 999px;
  }
  .fr__dot {
    width: clamp(7px, 0.9vw, 9px);
    height: clamp(7px, 0.9vw, 9px);
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.42);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition:
      height 0.5s cubic-bezier(0.22, 0.61, 0.36, 1),
      width 0.5s cubic-bezier(0.22, 0.61, 0.36, 1),
      background 0.35s ease;
  }
  @media (hover: hover) {
    .fr__dot:hover { background: rgba(255, 255, 255, 0.7); }
  }
  .fr__dot.is-active {
    height: clamp(26px, 3.4vh, 38px);
    background: #ffffff;
  }
  .fr__dot:focus-visible {
    outline: 2px solid var(--lead-blue, #5768ff);
    outline-offset: 3px;
  }
  .fr__pp {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: clamp(2.5rem, 3vw, 3rem);
    height: clamp(2.5rem, 3vw, 3rem);
    border: 0;
    border-radius: 999px;
    color: #f4efe6;
    font-size: 1.15rem;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background 0.3s ease;
  }
  .fr__pp:hover { background: rgba(255, 255, 255, 0.18); }
  .fr__pp:focus-visible {
    outline: 2px solid var(--lead-blue, #5768ff);
    outline-offset: 3px;
  }
  .fr__pp svg { display: block; }

  /* Préchauffage hors-écran du backdrop-filter (même technique que header/contact). */
  .fr__blur-prewarm {
    position: fixed;
    top: -200px;
    left: -200px;
    z-index: -1;
    display: flex;
    gap: 0.6rem;
    opacity: 0;
    pointer-events: none;
  }
  .fr__blur-prewarm span {
    display: block;
    height: 60px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
  .fr__blur-prewarm span:nth-child(1) { width: 200px; }
  .fr__blur-prewarm span:nth-child(2) { width: 56px; }

  /* ── Responsive : barre HORIZONTALE en bas ─────────────────────────────────── */
  @media (max-width: 900px), (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    /* Mobile : voile doux (pas trop fort) sur toute l'image. */
    .fr__focus-overlay {
      background: linear-gradient(
        to bottom,
        rgba(3, 6, 12, 0.32) 0%,
        rgba(3, 6, 12, 0.12) 34%,
        rgba(3, 6, 12, 0.16) 60%,
        rgba(3, 6, 12, 0.5) 100%
      );
    }
    /* Mobile : on recentre le bloc texte + bouton (le coin bas gauche reste
       desktop). */
    .fr__focus {
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: clamp(2.4rem, 12vw, 5rem);
      padding-bottom: clamp(5rem, 16vh, 8rem);
    }
    .fr__content {
      align-items: center;
      max-width: 46rem;
    }
    .fr__focus-slot { align-items: center; }

    .fr__rail {
      left: 50%;
      right: auto;
      top: auto;
      bottom: calc(max(clamp(1.1rem, 4vw, 1.8rem), var(--safe-bottom-offset)) + var(--bar-inset));
      transform: translateX(-50%);
      flex-direction: row;
      gap: 0;
    }
    .fr__pill {
      flex-direction: row;
      width: auto;
      height: clamp(2.6rem, 8.5vw, 3rem);
      padding: 0 clamp(1.05rem, 4.5vw, 1.4rem);
      gap: clamp(0.7rem, 3vw, 1rem);
    }
    .fr__dot {
      width: clamp(8px, 2.2vw, 9px);
      height: clamp(8px, 2.2vw, 9px);
      transition:
        width 0.5s cubic-bezier(0.22, 0.61, 0.36, 1),
        background 0.35s ease;
    }
    /* Point actif : s'allonge horizontalement. */
    .fr__dot.is-active {
      width: clamp(24px, 7vw, 32px);
      height: clamp(8px, 2.2vw, 9px);
    }
  }

  @media (max-width: 480px) {
    .fr__title { font-size: clamp(2.6rem, 13vw, 4.2rem); }
  }

  @media (max-width: 768px) {
    .fr__btn,
    .fr__pill,
    .fr__pp,
    .fr__blur-prewarm span {
      backdrop-filter: blur(12px) saturate(130%);
      -webkit-backdrop-filter: blur(12px) saturate(130%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .fr__bg-img,
    .fr__focus-slot {
      transition-duration: 0.25s;
    }
    .fr__focus-slot { transform: none; }
  }
</style>
