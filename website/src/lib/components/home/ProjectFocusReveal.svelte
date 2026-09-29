<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import AutoVideo from "$lib/components/shared/media/AutoVideo.svelte";

  // ─────────────────────────────────────────────────────────────────────────
  //  ProjectFocusReveal — les projets dans un bloc encadré.
  //
  //  Même principe qu'AboutValues (page à propos) : un grand bloc arrondi qui
  //  porte le visuel du projet, et les noms des projets cliquables à côté — ici
  //  à GAUCHE. Dans le bloc : le module de suivi (pilule de points +
  //  lecture/pause) qui vivait à droite de l'écran, et dans le coin bas gauche
  //  un dégradé discret sur lequel se posent le petit texte puis le bouton.
  //
  //  Rotation automatique conservée, comme le swipe horizontal (mobile) et les
  //  flèches du clavier. Le scroll vertical de la page reste natif.
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
  <div class="fr__inner">
    <!-- Les noms des projets, cliquables, à gauche. -->
    <nav class="fr__nav" aria-label="Choisir un projet">
      {#each slides as slide, i}
        <button
          type="button"
          class="fr__name"
          class:is-active={activeIndex === i}
          data-cursor="button"
          aria-current={activeIndex === i ? "true" : undefined}
          on:click={() => goTo(i)}
        >
          {slide.title.replace(/\n/g, " ")}
        </button>
      {/each}
    </nav>

    <!-- Le bloc image. -->
    <div class="fr__panel">
      <div class="fr__bg" aria-hidden="true">
        {#each slides as slide, i}
          {#if slide.video}
            <!-- Toutes les slides sont empilées : la vidéo reste « visible » pour
                 l'IntersectionObserver même à opacité nulle. D'où le verrou
                 `active`, qui ne la laisse jouer que quand sa slide est à
                 l'écran. -->
            <div class="fr__bg-media" class:is-shown={activeIndex === i}>
              <AutoVideo
                sources={slide.video}
                mobileSources={slide.mobileVideo ?? []}
                mobileQuery="(max-width: 900px) and (orientation: portrait)"
                poster={slide.poster}
                active={activeIndex === i && sectionInView}
              />
            </div>
          {:else}
            <img
              class="fr__bg-img"
              class:is-shown={activeIndex === i}
              src={slide.images[0]}
              alt=""
              loading={i < 2 ? "eager" : "lazy"}
              decoding="async"
              draggable="false"
            />
          {/if}
        {/each}
      </div>

      <!-- Dégradé de coin : juste ce qu'il faut pour poser le texte. -->
      <div class="fr__corner" aria-hidden="true"></div>

      <!-- Petit texte + bouton, dans le coin bas gauche du bloc. -->
      <div class="fr__focus">
        <div class="fr__copy">
          {#each slides as slide, i}
            <div
              class="fr__focus-slot"
              class:is-active={activeIndex === i}
              aria-hidden={activeIndex !== i ? "true" : undefined}
            >
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

      <!-- Le module de suivi, désormais DANS le bloc image. -->
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
    </div>
  </div>
</section>
{/if}

<style>
  /* Mêmes marges et mêmes arrondis que les blocs de la page à propos. */
  .fr {
    --fr-inset: var(--site-inset);
    --fr-radius: 22px;
    --fr-ink: #f4efe6;
    --fr-ease: cubic-bezier(0.16, 1, 0.3, 1);
    --fr-ease-soft: cubic-bezier(0.22, 0.61, 0.36, 1);
    --fr-dur-img: 0.85s; /* fondu entre deux projets */

    position: relative;
    z-index: 2;
    width: 100%;
    background: var(--bg-deep, #000);
    color: var(--fr-ink);
    padding: clamp(1rem, 2vh, 2rem) var(--fr-inset) clamp(4.5rem, 10vh, 9rem);
    overflow-x: clip;
    /* On ne change de slide qu'au swipe horizontal / points / lecture auto :
       le scroll vertical de la page reste totalement natif. */
    touch-action: pan-y;
  }

  .fr__inner {
    display: grid;
    grid-template-columns: minmax(190px, 16vw) minmax(0, 1fr);
    gap: clamp(1.2rem, 2.5vw, 2.6rem);
    align-items: stretch;
  }

  /* ── Noms cliquables (à gauche) ─────────────────────────────────────────── */
  .fr__nav {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: clamp(0.25rem, 0.5vw, 0.45rem);
  }

  .fr__name {
    display: block;
    width: 100%;
    padding: clamp(0.7rem, 1.1vw, 0.95rem) clamp(0.9rem, 1.4vw, 1.3rem);
    border: 0;
    /* Même arrondi que le bouton menu du header. */
    border-radius: 10px;
    background: transparent;
    font-family: var(--site-font);
    font-size: clamp(0.95rem, 1.12vw, 1.15rem);
    font-weight: var(--site-weight);
    letter-spacing: -0.012em;
    line-height: 1.25;
    text-align: left;
    color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.44);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition:
      background-color 0.5s var(--fr-ease-soft),
      color 0.5s var(--fr-ease-soft);
  }

  @media (hover: hover) {
    .fr__name:hover {
      color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.78);
    }
  }

  /*  Ces pastilles sont posées sur le FOND DE PAGE, pas sur une photo : un voile
   *  blanc y donne un gris NEUTRE (blanc à 7 % sur le noir bleuté = rgb(23,24,26)),
   *  qui jure avec les cartes de la palette. Elles prennent donc directement la
   *  couleur des cartes — même clarté, mais la teinte de la palette. Ailleurs sur
   *  le site, le repli garde le voile blanc d'origine.
   *  (Les boutons posés sur les photos, eux — « Voir le projet », le module de
   *  suivi — restent en verre : là, le voile blanc est le bon outil.) */
  .fr__name.is-active {
    background: var(--bg-panel, rgba(255, 255, 255, 0.07));
    color: #ffffff;
  }

  .fr__name:focus-visible {
    outline: 2px solid var(--lead-blue, #5768ff);
    outline-offset: 3px;
  }

  /* ── Bloc image ─────────────────────────────────────────────────────────── */
  .fr__panel {
    position: relative;
    height: min(80vh, 880px);
    border-radius: var(--fr-radius);
    overflow: hidden;
    background: var(--bg-raised, #080808);
    /* Contexte isolé : les boutons verre du bloc floutent le visuel qui est
       DEDANS (sinon ils n'auraient rien à flouter). */
    isolation: isolate;
  }

  .fr__bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    background: var(--bg-raised, #080808);
  }

  /* Les sept visuels sont empilés dans le même bloc. Ceux qui ne sont pas à
     l'écran passent en `visibility: hidden` une fois le fondu terminé : le
     compositeur cesse alors de les peindre, et le navigateur peut relâcher
     leur décodage — sur un mobile, sept grandes images peintes en même temps
     dépassent le budget d'images décodées et le bloc vire au noir. Le retard
     (`0s ... var(--fr-dur-img)`) laisse le fondu sortant se jouer entièrement
     avant la bascule. */
  .fr__bg-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    opacity: 0;
    visibility: hidden;
    backface-visibility: hidden;
    transition:
      opacity var(--fr-dur-img) var(--fr-ease-soft),
      visibility 0s linear var(--fr-dur-img);
  }

  .fr__bg-img.is-shown {
    z-index: 1;
    opacity: 1;
    visibility: visible;
    transition:
      opacity var(--fr-dur-img) var(--fr-ease-soft),
      visibility 0s linear 0s;
  }

  /* Même boîte et même fondu que .fr__bg-img — c'est ce conteneur qui porte
     l'opacité, la vidéo à l'intérieur se contente de remplir le cadre. */
  .fr__bg-media {
    position: absolute;
    inset: 0;
    opacity: 0;
    /* Même bascule que les images : `visibility` ne change rien à
       l'IntersectionObserver d'AutoVideo (il ne regarde que la géométrie), et
       la lecture est déjà coupée par `active`. */
    visibility: hidden;
    backface-visibility: hidden;
    transition:
      opacity var(--fr-dur-img) var(--fr-ease-soft),
      visibility 0s linear var(--fr-dur-img);
  }

  .fr__bg-media.is-shown {
    z-index: 1;
    opacity: 1;
    visibility: visible;
    transition:
      opacity var(--fr-dur-img) var(--fr-ease-soft),
      visibility 0s linear 0s;
  }

  /* Dégradé de coin : discret, et fondu jusqu'à rien avant le milieu du bloc. */
  .fr__corner {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    /* Assez dense au ras du coin pour tenir sur un visuel clair (les cartes
       Lybra), et éteint bien avant le milieu du bloc pour rester discret. */
    background: radial-gradient(
      84% 80% at 0% 100%,
      rgba(var(--shade-rgb, 0, 0, 0), 0.82) 0%,
      rgba(var(--shade-rgb, 0, 0, 0), 0.5) 24%,
      rgba(var(--shade-rgb, 0, 0, 0), 0.18) 46%,
      rgba(var(--shade-rgb, 0, 0, 0), 0) 72%
    );
  }

  /* ── Petit texte + bouton, coin bas gauche ──────────────────────────────── */
  .fr__focus {
    position: absolute;
    z-index: 3;
    left: clamp(1.3rem, 2.4vw, 2.4rem);
    right: clamp(1.3rem, 2.4vw, 2.4rem);
    bottom: clamp(1.3rem, 2.4vw, 2.4rem);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: clamp(0.9rem, 1.5vw, 1.3rem);
    pointer-events: none;
  }

  .fr__copy {
    display: grid;
  }

  .fr__focus-slot {
    grid-area: 1 / 1;
    opacity: 0;
    transform: translate3d(0, 18px, 0);
    transition:
      opacity 0.85s var(--fr-ease-soft),
      transform 0.95s var(--fr-ease);
    backface-visibility: hidden;
    pointer-events: none;
  }

  .fr__focus-slot.is-active {
    opacity: 1;
    transform: translate3d(0, 0, 0);
    pointer-events: auto;
  }

  .fr__desc {
    margin: 0;
    max-width: 30ch;
    font-family: var(--site-font);
    font-weight: var(--site-weight);
    font-size: clamp(1rem, 1.22vw, 1.28rem);
    line-height: 1.42;
    letter-spacing: -0.012em;
    color: #ffffff;
    white-space: pre-line;
    text-wrap: pretty;
    text-shadow: 0 4px 24px rgba(var(--shade-rgb, 0, 0, 0), 0.45);
  }

  /* ── Bouton verre (identique aux autres boutons du site) ─────────────────── */
  .fr__btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 42px;
    padding: 0 1.6rem;
    font-family: var(--site-font);
    font-weight: var(--site-weight);
    font-size: 0.92rem;
    color: #fff;
    text-decoration: none;
    white-space: nowrap;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    border-radius: 10px;
    box-shadow: 0 6px 8px rgba(var(--shade-rgb, 0, 0, 0), 0.08);
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

  /* ── Module de suivi : pilule verticale, à droite DANS le bloc ───────────── */
  .fr__rail {
    position: absolute;
    right: clamp(0.9rem, 1.8vw, 1.7rem);
    top: 50%;
    transform: translateY(-50%);
    z-index: 6;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(0.7rem, 1.2vw, 1rem);
    pointer-events: auto;
  }
  .fr__pill,
  .fr__pp {
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    box-shadow: 0 6px 8px rgba(var(--shade-rgb, 0, 0, 0), 0.08);
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
  .fr__pill {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(0.8rem, 1.4vh, 1.15rem);
    width: clamp(2.4rem, 2.8vw, 2.9rem);
    padding: clamp(0.9rem, 1.5vw, 1.25rem) 0;
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
    height: clamp(24px, 3vh, 34px);
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
    width: clamp(2.4rem, 2.8vw, 2.9rem);
    height: clamp(2.4rem, 2.8vw, 2.9rem);
    border: 0;
    border-radius: 999px;
    color: #f4efe6;
    font-size: 1.1rem;
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

  /* ── Mobile : le bloc d'abord, les noms en dessous ───────────────────────── */
  @media (max-width: 900px) {
    .fr {
      padding: clamp(0.8rem, 2vh, 1.5rem) 1rem clamp(3.5rem, 9vh, 6.5rem);
    }

    .fr__inner {
      grid-template-columns: minmax(0, 1fr);
      gap: clamp(1rem, 3vw, 1.6rem);
    }

    /* Le DOM garde les noms en premier (colonne de gauche sur grand écran) :
       sur mobile, c'est l'ordre de grille qui remet le bloc au-dessus. */
    .fr__panel {
      order: 1;
      height: min(72vh, 620px);
      border-radius: 18px;
    }

    .fr__nav {
      order: 2;
      flex-direction: row;
      justify-content: flex-start;
      gap: 0.5rem;
      overflow-x: auto;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      /* Les pastilles peuvent filer d'un bord à l'autre de l'écran. */
      margin-inline: -1rem;
      padding-inline: 1rem;
    }

    .fr__nav::-webkit-scrollbar {
      display: none;
    }

    .fr__name {
      width: auto;
      flex: 0 0 auto;
      white-space: nowrap;
      background: var(--bg-raised, rgba(255, 255, 255, 0.04));
      font-size: 0.95rem;
      padding: 0.72rem 1.15rem;
    }

    .fr__name.is-active {
      background: var(--bg-panel, rgba(255, 255, 255, 0.11));
    }

    /* Le coin bas gauche est pris par le texte : le module de suivi passe en
       haut à droite du bloc, à l'horizontale. */
    .fr__rail {
      top: clamp(0.9rem, 3vw, 1.4rem);
      right: clamp(0.9rem, 3vw, 1.4rem);
      transform: none;
      flex-direction: row;
      gap: clamp(0.5rem, 2vw, 0.7rem);
    }
    .fr__pill {
      flex-direction: row;
      width: auto;
      height: clamp(2.4rem, 8vw, 2.8rem);
      padding: 0 clamp(1rem, 4vw, 1.3rem);
      gap: clamp(0.65rem, 2.6vw, 0.9rem);
    }
    .fr__dot {
      width: clamp(8px, 2.2vw, 9px);
      height: clamp(8px, 2.2vw, 9px);
      transition:
        width 0.5s cubic-bezier(0.22, 0.61, 0.36, 1),
        background 0.35s ease;
    }
    .fr__dot.is-active {
      width: clamp(22px, 6.5vw, 30px);
      height: clamp(8px, 2.2vw, 9px);
    }
    .fr__pp {
      width: clamp(2.4rem, 8vw, 2.8rem);
      height: clamp(2.4rem, 8vw, 2.8rem);
    }

    .fr__desc {
      font-size: 1.02rem;
      max-width: 26ch;
    }
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

  /* ── Téléphone en paysage : boîte large et courte, on garde deux colonnes ── */
  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .fr {
      padding: 8svh 1.25rem;
    }

    .fr__inner {
      grid-template-columns: minmax(150px, 24vw) minmax(0, 1fr);
      gap: 1rem;
    }

    .fr__panel {
      order: 0;
      height: min(84svh, 420px);
    }

    .fr__nav {
      order: 0;
      flex-direction: column;
      overflow: visible;
      margin-inline: 0;
      padding-inline: 0;
      /* La colonne passe sous le bouton de menu du site. */
      padding-top: clamp(2rem, 14svh, 3.5rem);
    }

    .fr__name {
      width: 100%;
      font-size: 0.9rem;
      padding: 0.6rem 0.9rem;
      background: transparent;
    }

    .fr__rail {
      top: 50%;
      right: clamp(0.8rem, 2vw, 1.2rem);
      transform: translateY(-50%);
      flex-direction: column;
    }
    .fr__pill {
      flex-direction: column;
      width: 2.4rem;
      height: auto;
      padding: 0.8rem 0;
    }
    .fr__dot.is-active {
      width: clamp(7px, 0.9vw, 9px);
      height: 22px;
    }

    .fr__desc {
      font-size: 0.95rem;
      max-width: 30ch;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .fr__bg-img,
    .fr__bg-media,
    .fr__focus-slot {
      transition-duration: 0.25s;
    }
    .fr__focus-slot { transform: none; }
  }
</style>
