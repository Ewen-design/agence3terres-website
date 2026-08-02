<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { reveal } from "$lib/actions/reveal.js";

  // ─────────────────────────────────────────────────────────────────────────
  //  AboutFocusEditorialShowcase
  //
  //  = AboutEditorialSingleShowcase À L'IDENTIQUE (même grille, image plein
  //    cadre, style de texte éditorial, scroll cue) + le principe de slider
  //    d'AboutFocusSlider / ProjectFocusReveal : l'image et le texte CHANGENT
  //    (fondu croisé), avec lecture auto, points de suivi, swipe et flèches.
  //    Aucun bouton — on réutilise simplement les textes.
  // ─────────────────────────────────────────────────────────────────────────

  export let slides = [];
  export let interval = 8000; // durée par slide en lecture auto (ms)
  // Réglages visuels repris tels quels d'AboutEditorialSingleShowcase.
  export let imageFit = "cover";
  export let imagePosition = "center";
  export let mediaMinHeight = "38rem";
  export let showCue = true;
  export let showGradient = true;
  export let background = "#000";
  export let ink = "#f4efe6";
  export let inkMuted = "rgba(245, 241, 232, 0.62)";

  const N = slides.length;
  const INPUT_COOLDOWN = 900; // pause de la lecture auto après une action
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

<section
  class="about-editorial-single-showcase"
  bind:this={sectionEl}
  style={`--ase-bg:${background}; --ase-ink:${ink}; --ase-muted:${inkMuted}; --ase-media-fit:${imageFit}; --ase-media-pos:${imagePosition};`}
  aria-roledescription="carrousel"
  aria-label="Notre approche"
>
  <figure
    class="about-editorial-single-showcase__media"
    style={`--about-editorial-single-showcase-media-min-height:${mediaMinHeight};`}
  >
    <!-- Images plein cadre en fondu croisé (pilotées par le slide actif) -->
    {#each slides as slide, i}
      <img
        class="about-editorial-single-showcase__media-img"
        class:is-shown={activeIndex === i}
        src={slide.image}
        alt={activeIndex === i ? slide.alt : ""}
        loading={i < 2 ? "eager" : "lazy"}
        decoding="async"
        draggable="false"
      />
    {/each}
    {#if showGradient}
      <div class="about-editorial-single-showcase__gradient" aria-hidden="true"></div>
    {/if}
  </figure>

  <!-- Backstop opaque qui chevauche le bord bas de l'image (anti-couture iOS). -->
  <div class="about-editorial-single-showcase__floor" aria-hidden="true"></div>

  <div class="about-editorial-single-showcase__content">
    {#if showCue}
      <div class="about-editorial-single-showcase__scroll-cue" aria-hidden="true">
        <span class="about-editorial-single-showcase__scroll-arrow">↓</span>
      </div>
    {/if}

    <div class="about-editorial-single-showcase__text-block">
      <!-- Textes en fondu croisé (réutilisés tels quels, un par slide).
           use:reveal est ici (pas sur .text-block) pour que .text-block ne porte
           PAS de transform/filter : le rail en absolute (desktop) se réfère alors
           à .content (l'image), pas au texte. -->
      <div class="aess__copy" use:reveal>
        {#each slides as slide, i}
          <div
            class="aess__slot"
            class:is-active={activeIndex === i}
            aria-hidden={activeIndex !== i ? "true" : undefined}
          >
            {#if slide.label}
              <h2 class="about-editorial-single-showcase__label">{slide.label}</h2>
            {/if}
            <p class="about-editorial-single-showcase__text">{@html slide.text}</p>
          </div>
        {/each}
      </div>

      <!-- Module de passage de slide (points + lecture/pause).
           Mobile : juste sous le texte (flux). Desktop : absolute → milieu image. -->
      {#if N > 1}
        <div class="aess__rail" role="group" aria-label="Progression">
          <div class="aess__pill" role="tablist" aria-label="slides">
            {#each slides as slide, i}
              <button
                type="button"
                class="aess__dot"
                class:is-active={activeIndex === i}
                role="tab"
                aria-selected={activeIndex === i}
                aria-label={"Slide " + (i + 1) + (slide.label ? " : " + slide.label : "")}
                on:click={() => goTo(i)}
              ></button>
            {/each}
          </div>

          <button
            type="button"
            class="aess__pp"
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
        </div>
      {/if}
    </div>
  </div>
</section>

<style>
  /* ==========================================================================
     STYLE REPRIS À L'IDENTIQUE D'AboutEditorialSingleShowcase.
     Seuls ajouts : fondu croisé des images (.media-img.is-shown), fondu des
     textes (.aess__copy/.aess__slot) et le module de passage (.aess__rail…).
     Réglage de hauteur : valeurs déjà utilisées sur la page à propos
     (152/182/172vh) pour éviter le grand vide sous le texte.
     ========================================================================== */
  .about-editorial-single-showcase {
    position: relative;
    width: 100%;
    min-height: max(152vh, var(--about-editorial-single-showcase-media-min-height, 32rem));
    background: var(--ase-bg, #000);
    color: var(--ase-ink, #f5f1e8);
    overflow: clip;
    touch-action: pan-y;
  }

  .about-editorial-single-showcase__media {
    position: absolute;
    inset: 0 0 auto;
    height: 150vh;
    margin: 0;
    overflow: hidden;
    background: var(--ase-bg, #000);
    /* Contexte d'empilement isolé : les z-index internes (image / dégradé) ne
       débordent pas → le contenu (.content, z-index:1) reste toujours devant. */
    z-index: 0;
    isolation: isolate;
  }

  /* Images empilées en fondu croisé. */
  .about-editorial-single-showcase__media-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: var(--ase-media-fit, cover);
    object-position: var(--ase-media-pos, center);
    display: block;
    opacity: 0;
    transform: scale(1.04);
    backface-visibility: hidden;
    transition:
      opacity 0.9s ease,
      transform 1.4s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .about-editorial-single-showcase__media-img.is-shown {
    opacity: 1;
    transform: scale(1);
    z-index: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .about-editorial-single-showcase__media-img {
      transform: none;
      transition: opacity 0.25s ease;
    }
  }

  .about-editorial-single-showcase__gradient {
    position: absolute;
    inset: auto 0 0;
    height: 56vh;
    z-index: 2;
    background: linear-gradient(
      to top,
      var(--ase-bg, #000) 0%,
      var(--ase-bg, #000) 30%,
      transparent 100%
    );
    pointer-events: none;
  }

  .about-editorial-single-showcase__floor {
    position: absolute;
    left: 0;
    right: 0;
    top: 150vh;
    height: 8vh;
    margin-top: -4vh;
    background: var(--ase-bg, #000);
    z-index: 0;
    pointer-events: none;
  }

  .about-editorial-single-showcase__content {
    position: relative;
    z-index: 1;
    min-height: inherit;
    padding: clamp(1rem, 2vw, 1.8rem);
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(320px, 460px) minmax(0, 1.05fr);
    grid-template-rows: 100vh auto 8vh;
    align-items: start;
    gap: clamp(1.4rem, 4vw, 4.5rem);
  }

  .about-editorial-single-showcase__scroll-cue {
    grid-column: 1;
    grid-row: 1;
    align-self: end;
    justify-self: start;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    gap: 0.45rem;
    color: #fff;
    padding-bottom: max(clamp(2rem, 3.2vw, 2.8rem), calc(var(--safe-bottom-offset) + 1rem));
  }

  .about-editorial-single-showcase__scroll-arrow {
    display: block;
    font-family: "Inter", sans-serif;
    font-size: clamp(1.1rem, 1.1vw, 1.2rem);
    font-weight: 300;
    line-height: 1;
    color: #fff;
  }

  .about-editorial-single-showcase__text-block {
    grid-column: 3;
    grid-row: 2;
    justify-self: start;
    align-self: start;
    padding-top: clamp(1.5rem, 3.5vh, 4rem);
    margin-left: clamp(-8.75rem, -6.2vw, -4.4rem);
  }

  /* Fondu croisé des textes (slots empilés dans la même cellule). */
  .aess__copy {
    display: grid;
  }
  .aess__slot {
    grid-area: 1 / 1;
    opacity: 0;
    transform: translate3d(0, 22px, 0);
    transition:
      opacity 0.9s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 1s cubic-bezier(0.16, 1, 0.3, 1);
    backface-visibility: hidden;
    pointer-events: none;
  }
  .aess__slot.is-active {
    opacity: 1;
    transform: translate3d(0, 0, 0);
    pointer-events: auto;
  }
  @media (prefers-reduced-motion: reduce) {
    .aess__slot {
      transform: none;
      transition-duration: 0.25s;
    }
  }

  .about-editorial-single-showcase__label {
    margin: 0 0 clamp(0.9rem, 1.6vw, 1.3rem);
    font-family: "Inter", sans-serif;
    /* Même taille que le texte, en blanc. */
    font-size: clamp(1.5rem, 2.5vw, 2.55rem);
    font-weight: 300;
    line-height: 1.18;
    letter-spacing: -0.025em;
    color: #ffffff;
  }

  .about-editorial-single-showcase__text {
    margin: 0;
    max-width: 23ch;
    font-size: clamp(1.5rem, 2.5vw, 2.55rem);
    font-weight: 300;
    line-height: 1.18;
    letter-spacing: -0.025em;
    color: var(--ase-ink, #f4efe6);
    text-wrap: pretty;
  }

  .about-editorial-single-showcase__text:has(:global(.hl)) {
    color: var(--ase-muted, rgba(245, 241, 232, 0.62));
  }

  .about-editorial-single-showcase__text :global(.hl) {
    color: var(--ase-ink, #f4efe6);
  }

  /* ── Module de passage de slide (points + lecture/pause) ───────────────────
     Base = mobile (sous le texte, horizontal). Desktop = vertical à droite,
     défini APRÈS en @media (min-width:901px) pour bien surcharger la base. */
  .aess__rail {
    margin-top: clamp(1.6rem, 5vw, 2.2rem);
    display: flex;
    align-items: center;
    gap: clamp(0.6rem, 1.1vw, 0.85rem);
    pointer-events: auto;
  }
  .aess__pill,
  .aess__pp {
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.08);
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
  .aess__pill {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: clamp(0.7rem, 1vw, 0.95rem);
    height: clamp(2.5rem, 3vw, 2.9rem);
    padding: 0 clamp(1rem, 1.4vw, 1.3rem);
    border-radius: 999px;
  }
  .aess__dot {
    width: clamp(7px, 0.9vw, 9px);
    height: clamp(7px, 0.9vw, 9px);
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.42);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition:
      width 0.5s cubic-bezier(0.22, 0.61, 0.36, 1),
      background 0.35s ease;
  }
  @media (hover: hover) {
    .aess__dot:hover { background: rgba(255, 255, 255, 0.7); }
  }
  .aess__dot.is-active {
    width: clamp(24px, 3vw, 32px);
    background: #ffffff;
  }
  .aess__dot:focus-visible {
    outline: 2px solid var(--lead-blue, #5768ff);
    outline-offset: 3px;
  }
  .aess__pp {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: clamp(2.5rem, 3vw, 2.9rem);
    height: clamp(2.5rem, 3vw, 2.9rem);
    border: 0;
    border-radius: 999px;
    color: #f4efe6;
    font-size: 1.1rem;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  /* Aucun éclaircissement (blanc) au survol / clic / focus : fond figé. */
  .aess__pp:hover,
  .aess__pp:active,
  .aess__pp:focus,
  .aess__pp:focus-visible {
    background: rgba(255, 255, 255, 0.11);
    outline: none;
  }
  .aess__pp svg { display: block; }

  /* Desktop : rail VERTICAL à droite, ~milieu de l'image, au-dessus du texte
     (sorti du flux, positionné par rapport à .content). */
  @media (min-width: 901px) {
    .aess__rail {
      position: absolute;
      top: 66vh;              /* ~milieu de l'image (150vh) */
      right: clamp(1rem, 3vw, 2.6rem);
      transform: translateY(-50%);
      margin-top: 0;
      flex-direction: column;
      gap: clamp(0.8rem, 1.4vw, 1.1rem);
    }
    .aess__pill {
      flex-direction: column;
      width: clamp(2.5rem, 3vw, 3rem);
      height: auto;
      padding: clamp(1rem, 1.6vw, 1.35rem) 0;
      gap: clamp(0.85rem, 1.5vh, 1.25rem);
    }
    .aess__dot {
      transition:
        height 0.5s cubic-bezier(0.22, 0.61, 0.36, 1),
        background 0.35s ease;
    }
    .aess__dot.is-active {
      width: clamp(7px, 0.9vw, 9px);
      height: clamp(26px, 3.4vh, 38px);
    }
  }

  @media (max-width: 900px) {
    .about-editorial-single-showcase {
      min-height: max(182vh, var(--about-editorial-single-showcase-media-min-height, 32rem));
    }

    .about-editorial-single-showcase__content {
      grid-template-columns: 1fr;
      grid-template-rows: 100vh auto 8vh;
      padding: 1rem 0.8rem;
      box-sizing: border-box;
    }

    .about-editorial-single-showcase__scroll-cue {
      grid-row: 1;
      padding-bottom: 0;
    }

    .about-editorial-single-showcase__text-block {
      grid-column: 1;
      grid-row: 2;
      justify-self: start;
      padding-top: 6rem;
      margin-left: 0;
    }

    .about-editorial-single-showcase__label {
      font-size: clamp(1.5rem, 6.6vw, 2rem);
      line-height: 1.2;
    }

    .about-editorial-single-showcase__text {
      max-width: 18ch;
      font-size: clamp(1.5rem, 6.6vw, 2rem);
      padding-inline: var(--project-text-inset, 0);
      line-height: 1.2;
    }

    .aess__rail {
      padding-inline: var(--project-text-inset, 0);
    }
  }

  @media (max-width: 768px) {
    .aess__pill,
    .aess__pp {
      backdrop-filter: blur(12px) saturate(130%);
      -webkit-backdrop-filter: blur(12px) saturate(130%);
    }
  }

  @media (max-width: 640px) {
    .about-editorial-single-showcase {
      min-height: max(172vh, var(--about-editorial-single-showcase-media-min-height, 32rem));
    }

    .about-editorial-single-showcase__media {
      height: 138vh;
    }

    .about-editorial-single-showcase__floor {
      top: 138vh;
    }

    .about-editorial-single-showcase__gradient {
      height: 52vh;
      background: linear-gradient(
        to top,
        var(--ase-bg, #000) 0%,
        var(--ase-bg, #000) 34%,
        transparent 100%
      );
    }

    .about-editorial-single-showcase__content {
      grid-template-rows: 100vh auto 8vh;
      gap: 0;
      padding: 1rem 0.8rem 0;
    }

    .about-editorial-single-showcase__scroll-cue {
      padding-bottom: max(7rem, calc(var(--safe-bottom-offset) + 5rem));
    }

    .about-editorial-single-showcase__text-block {
      grid-row: 2;
      align-self: start;
      padding-top: 0;
      margin-top: -2vh;
      margin-left: 0;
      position: relative;
      z-index: 2;
    }

    .about-editorial-single-showcase__label {
      font-size: clamp(1.4rem, 6.6vw, 1.9rem);
      line-height: 1.2;
    }

    .about-editorial-single-showcase__text {
      max-width: 18ch;
      font-size: clamp(1.4rem, 6.6vw, 1.9rem);
      line-height: 1.2;
      padding-inline: var(--project-text-inset, 0);
    }
  }
</style>
