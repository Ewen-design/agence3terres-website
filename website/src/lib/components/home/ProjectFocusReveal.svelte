<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import {
    registerParallax,
    unregisterParallax,
    getScrollEngineState
  } from "$lib/scrollEngine.js";

  // ─────────────────────────────────────────────────────────────────────────
  //  ProjectFocusReveal — grand slider « focus / aperçus »
  //
  //  État de repos (focus) : l'image du projet actif en plein écran, son titre
  //  + son texte centrés, une barre de suivi (pilule verticale à points, façon
  //  dock) à gauche, et une lecture automatique douce qui enchaîne les projets.
  //
  //  Au scroll (browse) : le fond s'assombrit, se floute et dézoome ; les
  //  projets apparaissent en colonne d'aperçus au centre (le plus proche du
  //  centre est le plus grand). On slide dans les aperçus au scroll, les images
  //  changent EN FOND derrière le flou. À l'arrêt (ou au clic), un snap doux
  //  ramène sur le projet visé et tout l'effet s'inverse en douceur.
  //
  //  Perf (fluidité mobile) : le fond est fait de DEUX couches — une nette et
  //  une pré-floutée. Passer en browse fait juste apparaître la couche floutée
  //  en OPACITÉ (opération compositor, gratuite) : on n'anime jamais le rayon de
  //  flou et le fond ne se re-floute pas à chaque frame. Le fondu entre images
  //  est discret (piloté par le slide actif via CSS). Seuls les aperçus (des
  //  transforms GPU) sont mis à jour par frame → aucune saccade.
  // ─────────────────────────────────────────────────────────────────────────

  export let slides = [];
  export let ctaLabel = "Voir le projet";
  export let interval = 4800;        // durée par slide en lecture auto (ms)

  const N = slides.length;
  const MOBILE_SEG_LVH = 56;

  // ── Tunables ───────────────────────────────────────────────────────────────
  const IDLE_MS = 260;               // délai avant snap après l'arrêt du scroll
  const TOUCH_IDLE_MS = 560;         // mobile : évite les bascules focus/browse pendant l'inertie
  const BROWSE_MIN_MS = 520;         // évite les flashes si le scroll s'arrête aussitôt
  const INPUT_COOLDOWN = 900;        // pause de la lecture auto après une action
  const PROG_RELEASE_MS = 160;       // garde après un scroll programmatique
  const SNAP_EPS = 0.02;             // en-deçà, pas de snap (déjà centré)
  const TOUCH_SETTLE_EPS = 0.8;      // px entre scroll natif et motionY avant retour focus
  const MOBILE_ACTIVE_HYST = 0.58;   // évite le flicker image près du milieu entre deux slides
  const BROWSE_EDGE_EPS = 1;         // marge px pour éviter les oscillations au bord du sticky

  const PREV_GAP = 0.34;             // espace vertical entre aperçus (× vh)
  const PREV_SCALE_FALLOFF = 0.17;   // rétrécissement par unité d'écart au centre
  const PREV_MIN_SCALE = 0.52;
  const PREV_OP_FALLOFF = 0.46;      // fondu des aperçus par unité d'écart
  const PREV_CULL = 2.5;             // au-delà, aperçu masqué

  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  const now = () =>
    typeof performance !== "undefined" ? performance.now() : Date.now();

  // Glow qui suit le curseur — même effet que les autres boutons du site.
  function handleGlowMove(event) {
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  // ── Refs ────────────────────────────────────────────────────────────────────
  let sectionEl;
  let panelEl;
  const cardEls = new Array(N).fill(null);
  const zPrev = new Int16Array(N).fill(-999); // évite de ré-écrire le z-index inutilement
  const opPrev = new Float32Array(N).fill(-1);
  const transformPrev = new Array(N).fill("");

  // ── État réactif (peu fréquent) ──────────────────────────────────────────────
  let activeIndex = 0;
  let isBrowsing = false;
  let playing = true;

  // ── État interne (non réactif) ────────────────────────────────────────────────
  let measured = false;
  let sectionTop = 0;
  let maxScroll = 1;
  let viewportH = 1;
  let fCur = 0;
  let inRange = false;
  let inBrowseWindow = false;
  let lastPaintF = -1;
  let wasBrowsing = false;
  let browseStartedAt = 0;

  let programmatic = false;
  let progTargetY = 0;
  let progReleaseT = 0;

  let idleTimer = null;
  let autoTimer = null;
  let cooldownUntil = 0;
  let lastMoveT = 0;

  let sectionInView = false;
  let reduceMotion = false;
  let isCoarse = false; // tactile : on ne snappe pas (scroll 100% natif)
  let enableBlurLayer = false;
  let useMobilePreviewFlow = false;

  function updateMotionMode() {
    if (!browser) return;
    reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    isCoarse = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
    useMobilePreviewFlow =
      window.matchMedia?.("(max-width: 900px)")?.matches ||
      window.matchMedia?.("(hover: none) and (pointer: coarse)")?.matches ||
      window.matchMedia?.("(pointer: coarse) and (orientation: landscape) and (max-height: 600px)")?.matches;
    enableBlurLayer = !useMobilePreviewFlow && !reduceMotion;
  }

  // ── Géométrie ─────────────────────────────────────────────────────────────────
  function readPanelHeight() {
    return Math.max(
      1,
      Math.round(
        panelEl?.offsetHeight ||
          panelEl?.clientHeight ||
          window.innerHeight ||
          1
      )
    );
  }

  function measure() {
    if (!browser || !sectionEl) return;
    const sy = window.scrollY || 0;
    const r = sectionEl.getBoundingClientRect();
    viewportH = readPanelHeight();
    sectionTop = r.top + sy;
    maxScroll = Math.max(1, sectionEl.offsetHeight - viewportH);
    measured = true;
  }

  const anchorY = (i) =>
    sectionTop + (N > 1 ? (clamp(i, 0, N - 1) / (N - 1)) * maxScroll : 0);

  const atEnd = () => N > 1 && activeIndex >= N - 1;
  const isInteractionRangeScroll = (y) => {
    if (!measured) return false;
    const localVh = viewportH || window.innerHeight || 1;
    const scrolled = y - sectionTop;
    return scrolled >= -localVh * 0.25 && scrolled <= maxScroll + localVh * 0.25;
  };
  const isBrowseWindowScroll = (y) => {
    if (!measured) return false;
    const scrolled = y - sectionTop;
    return scrolled >= -BROWSE_EDGE_EPS && scrolled <= maxScroll + BROWSE_EDGE_EPS;
  };

  function setMobileFocusSlide(i) {
    const target = clamp(i, 0, N - 1);
    activeIndex = target;
    fCur = target;
    setBrowsing(false);
    programmatic = false;
    progReleaseT = now();
  }

  function setBrowsing(next) {
    if (isBrowsing === next) return;
    isBrowsing = next;
    if (next) {
      browseStartedAt = now();
      pauseAuto();
    }
  }

  function getStableActiveIndex(f) {
    const nearest = clamp(Math.round(f), 0, N - 1);
    if (!useMobilePreviewFlow || programmatic || Math.abs(nearest - activeIndex) > 1) {
      return nearest;
    }
    if (nearest === activeIndex) return activeIndex;

    const threshold =
      nearest > activeIndex
        ? activeIndex + MOBILE_ACTIVE_HYST
        : activeIndex - MOBILE_ACTIVE_HYST;

    if (nearest > activeIndex) return f >= threshold ? nearest : activeIndex;
    return f <= threshold ? nearest : activeIndex;
  }

  // ── Rendu impératif d'une frame ───────────────────────────────────────────────
  //  On décide d'abord le mode (browse/focus), PUIS on positionne les aperçus —
  //  et UNIQUEMENT en mode browse (en focus ils sont invisibles → aucune écriture
  //  de style, donc le scroll de la page à travers la section ne coûte rien). Le
  //  z-index n'est réécrit que lorsqu'il change (sinon l'arbre de couches se
  //  re-trie à chaque frame = saccade mobile).
  function frame(y, vh, delta, settling = false) {
    const t = now();
    const localVh = viewportH || vh || window.innerHeight || 1;
    const scrolled = y - sectionTop;
    const prog = clamp(scrolled / maxScroll, 0, 1);
    const f = N > 1 ? prog * (N - 1) : 0;
    fCur = f;

    inRange = scrolled >= -localVh * 0.25 && scrolled <= maxScroll + localVh * 0.25;
    inBrowseWindow =
      scrolled >= -BROWSE_EDGE_EPS && scrolled <= maxScroll + BROWSE_EDGE_EPS;

    // Décision du mode.
    const moving = Math.abs(delta) > (isCoarse ? 0.05 : 0.15) || settling;
    const settled = t - progReleaseT > PROG_RELEASE_MS;
    if (inBrowseWindow && moving && !programmatic && settled) {
      setBrowsing(true);
      lastMoveT = t;
      armIdle();
    } else if (!inBrowseWindow && isBrowsing) {
      setBrowsing(false);
    }

    if (!useMobilePreviewFlow || isBrowsing || programmatic) {
      const nextActive = getStableActiveIndex(f);
      if (nextActive !== activeIndex) activeIndex = nextActive;
    }

    // À l'entrée en browse, on force un rendu même si f a peu bougé.
    if (isBrowsing && !wasBrowsing) lastPaintF = -999;
    wasBrowsing = isBrowsing;

    if (!isBrowsing || useMobilePreviewFlow) return; // mobile : aperçus dans le flux natif
    if (Math.abs(f - lastPaintF) < 0.0006) return;
    lastPaintF = f;

    const gap = localVh * PREV_GAP;
    for (let i = 0; i < N; i++) {
      const el = cardEls[i];
      if (!el) continue;
      const d = i - f;
      const ad = Math.abs(d);
      let op = clamp(1 - ad * PREV_OP_FALLOFF, 0, 1);
      if (ad > PREV_CULL) op = 0;
      if (Math.abs(op - opPrev[i]) > 0.002) {
        el.style.opacity = op.toFixed(3);
        opPrev[i] = op;
      }
      if (op > 0.001) {
        const scale = clamp(1 - ad * PREV_SCALE_FALLOFF, PREV_MIN_SCALE, 1);
        const ty = d * gap;
        const transform = `translate3d(-50%, calc(-50% + ${ty.toFixed(1)}px), 0) scale(${scale.toFixed(3)})`;
        if (transform !== transformPrev[i]) {
          el.style.transform = transform;
          transformPrev[i] = transform;
        }
      }
      const z = 200 - Math.round(ad * 10);
      if (z !== zPrev[i]) {
        el.style.zIndex = String(z);
        zPrev[i] = z;
      }
    }
  }

  // ── Moteur de scroll ────────────────────────────────────────────────────────────
  function onScroll(y, ctx) {
    if (!measured || N === 0) return;
    const vh = viewportH || ctx?.vh || window.innerHeight || 1;

    if (programmatic && Math.abs(y - progTargetY) < 3) {
      programmatic = false;
      progReleaseT = now();
      maybeScheduleAuto();
    }

    const visualY = y;
    const settling =
      isCoarse && Math.abs((ctx?.motionY ?? y) - y) > TOUCH_SETTLE_EPS;
    frame(visualY, vh, ctx?.delta || 0, settling);
  }

  function onUserInput() {
    if (!measured) measure();
    const y = window.scrollY || 0;
    if (!isInteractionRangeScroll(y) || reduceMotion) return;
    const t = now();
    programmatic = false;
    cooldownUntil = t + INPUT_COOLDOWN;
    lastMoveT = t;
    pauseAuto();
    if (!isBrowseWindowScroll(y)) {
      armIdle();
      return;
    }
    setBrowsing(true);
    armIdle();
  }

  function onTouchInput() {
    if (!measured) measure();
    const y = window.scrollY || 0;
    if (!isInteractionRangeScroll(y) || reduceMotion) return;
    programmatic = false;
    cooldownUntil = now() + INPUT_COOLDOWN * 1.8;
    lastMoveT = now();
    pauseAuto();
    armIdle();
  }

  const getIdleDelay = () => (isCoarse ? TOUCH_IDLE_MS : IDLE_MS);

  function armIdle() {
    if (idleTimer) return;
    idleTimer = setTimeout(onIdle, getIdleDelay());
  }

  function onIdle() {
    idleTimer = null;
    const delay = getIdleDelay();
    const elapsed = now() - lastMoveT;
    if (elapsed < delay) {
      idleTimer = setTimeout(onIdle, delay - elapsed);
      return;
    }

    if (!inBrowseWindow) {
      setBrowsing(false);
      maybeScheduleAuto();
      return;
    }

    const browseAge = now() - browseStartedAt;
    if (isBrowsing && browseAge < BROWSE_MIN_MS) {
      idleTimer = setTimeout(onIdle, BROWSE_MIN_MS - browseAge);
      return;
    }

    if (isCoarse) {
      const st = getScrollEngineState();
      if (Math.abs((st.motionY ?? st.y) - st.y) > TOUCH_SETTLE_EPS) {
        armIdle();
        return;
      }
    }

    setBrowsing(false);
    // Tactile : PAS de snap programmatique — le scroll reste totalement natif et
    // le focus retombe visuellement sur le projet le plus proche (`activeIndex`),
    // sans déplacer la page. Snap doux uniquement sur desktop (souris/pavé).
    const target = clamp(Math.round(fCur), 0, N - 1);
    if (!isCoarse && Math.abs(fCur - target) > SNAP_EPS) {
      goProgrammatic(target);
    } else {
      maybeScheduleAuto();
    }
  }

  // ── Déplacement programmatique (snap, lecture auto, clic) ─────────────────────────
  function goProgrammatic(i) {
    if (!browser) return;
    measure();
    const target = clamp(i, 0, N - 1);
    progTargetY = Math.max(0, Math.round(anchorY(target)));
    programmatic = true;
    window.scrollTo({
      top: progTargetY,
      behavior: reduceMotion ? "auto" : "smooth"
    });
    setTimeout(() => {
      if (programmatic && Math.abs((window.scrollY || 0) - progTargetY) < 4) {
        programmatic = false;
        progReleaseT = now();
        maybeScheduleAuto();
      }
    }, 1100);
  }

  function goTo(i) {
    setBrowsing(false);
    cooldownUntil = now() + INPUT_COOLDOWN;
    pauseAuto();
    if (useMobilePreviewFlow) {
      setMobileFocusSlide(i);
      return;
    }
    goProgrammatic(i);
  }

  // ── Lecture automatique ─────────────────────────────────────────────────────────
  function pauseAuto() {
    if (autoTimer) {
      clearTimeout(autoTimer);
      autoTimer = null;
    }
  }

  function maybeScheduleAuto() {
    pauseAuto();
    if (
      !playing ||
      reduceMotion ||
      !sectionInView ||
      !measured ||
      !isBrowseWindowScroll(window.scrollY || 0) ||
      isBrowsing ||
      programmatic ||
      N <= 1
    )
      return;
    const wait = Math.max(interval, cooldownUntil - now());
    autoTimer = setTimeout(autoAdvance, wait);
  }

  function autoAdvance() {
    autoTimer = null;
    if (!playing || reduceMotion || !sectionInView || isBrowsing || programmatic)
      return;
    if (atEnd()) {
      playing = false;
      return;
    }

    const target = activeIndex + 1;
    if (useMobilePreviewFlow) {
      setMobileFocusSlide(target);
      maybeScheduleAuto();
      return;
    }
    goProgrammatic(target);
  }

  function togglePlay() {
    if (playing) {
      playing = false;
      pauseAuto();
      return;
    }

    playing = true;
    if (atEnd()) {
      if (useMobilePreviewFlow) {
        setMobileFocusSlide(0);
        maybeScheduleAuto();
      } else {
        goProgrammatic(0);
      }
    } else {
      maybeScheduleAuto();
    }
  }

  // ── Cycle de vie ──────────────────────────────────────────────────────────────────
  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateMotionMode();
      measure();
      const st = getScrollEngineState();
      frame(st.y, st.vh || window.innerHeight, 0);
    }, 120);
  }

  let io;
  const navKeys = new Set([
    "ArrowUp",
    "ArrowDown",
    "PageUp",
    "PageDown",
    "Home",
    "End",
    " "
  ]);
  function onKeydown(e) {
    if (navKeys.has(e.key)) onUserInput();
  }

  onMount(() => {
    if (!browser || N === 0) return;

    updateMotionMode();
    if (reduceMotion) playing = false;

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        measure();
        const st = getScrollEngineState();
        lastPaintF = -1;
        frame(st.y ?? 0, st.vh || window.innerHeight, 0);
        registerParallax(onScroll);
      })
    );

    window.addEventListener("wheel", onUserInput, { passive: true });
    window.addEventListener("touchstart", onTouchInput, { passive: true });
    window.addEventListener("touchmove", onTouchInput, { passive: true });
    window.addEventListener("keydown", onKeydown, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
    window.addEventListener("load", measure, { passive: true });
    window.addEventListener("pageshow", measure, { passive: true });

    if (sectionEl) {
      io = new IntersectionObserver(
        ([entry]) => {
          sectionInView = entry.isIntersecting;
          if (sectionInView) maybeScheduleAuto();
          else {
            pauseAuto();
            setBrowsing(false);
          }
        },
        { threshold: 0 }
      );
      io.observe(sectionEl);
    }
  });

  onDestroy(() => {
    if (!browser) return;
    unregisterParallax(onScroll);
    pauseAuto();
    if (idleTimer) clearTimeout(idleTimer);
    clearTimeout(resizeTimer);
    window.removeEventListener("wheel", onUserInput);
    window.removeEventListener("touchstart", onTouchInput);
    window.removeEventListener("touchmove", onTouchInput);
    window.removeEventListener("keydown", onKeydown);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onResize);
    window.removeEventListener("load", measure);
    window.removeEventListener("pageshow", measure);
    io?.disconnect();
  });
</script>

{#if N > 0}
<section
  class="fr"
  class:is-browsing={isBrowsing}
  bind:this={sectionEl}
  style="--n:{N}; --mobile-seg:{MOBILE_SEG_LVH}lvh"
  aria-label="Sélection de projets"
>
  <div class="fr__panel" bind:this={panelEl}>
    <!-- Fond : deux couches (nette + pré-floutée). Passer en browse fait juste
         apparaître la couche floutée en opacité → aucun re-flou par frame. -->
    <div class="fr__bg" aria-hidden="true">
      <div class="fr__bg-layer">
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
      {#if enableBlurLayer}
        <div class="fr__bg-layer fr__bg-layer--blur">
          {#each slides as slide, i}
            <img
              class="fr__bg-img"
              class:is-shown={activeIndex === i}
              src={slide.images[0]}
              alt=""
              loading="lazy"
              decoding="async"
              draggable="false"
            />
          {/each}
        </div>
      {/if}
    </div>

    <!-- Assombrissement global (léger au repos, fort en browse) -->
    <div class="fr__scrim" aria-hidden="true"></div>

    <!-- Titre + texte centrés (état focus) -->
    <div class="fr__focus">
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
          {#if slide.href}
            <a
              href={slide.href}
              class="fr__btn"
              data-cursor="button"
              on:mousemove={handleGlowMove}
              tabindex={activeIndex === i ? 0 : -1}
              aria-label={(slide.cta ?? ctaLabel) + " — " + slide.title.replace(/\n/g, " ")}
            >
              <span class="fr__btn-inner" data-text={slide.cta ?? ctaLabel}>
                <span class="fr__btn-text">{slide.cta ?? ctaLabel}</span>
              </span>
            </a>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Colonne d'aperçus (état browse) -->
    <div class="fr__previews">
      {#each slides as slide, i}
        <button
          type="button"
          class="fr__card"
          class:is-center={activeIndex === i}
          bind:this={cardEls[i]}
          on:click={() => goTo(i)}
          tabindex={isBrowsing ? 0 : -1}
          aria-label={"Aller au projet " + slide.title.replace(/\n/g, " ")}
          style="opacity:0"
        >
          <img
            src={slide.images[0]}
            alt=""
            loading="lazy"
            decoding="async"
            draggable="false"
          />
        </button>
      {/each}
    </div>

    <!-- Assombrissement fort haut + bas, AU-DESSUS des aperçus (browse) -->
    <div class="fr__edge fr__edge--top" aria-hidden="true"></div>
    <div class="fr__edge fr__edge--bottom" aria-hidden="true"></div>

    <!-- Barre de suivi (gauche) — pilule verticale à points, façon dock -->
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

  <div class="fr__mobile-flow" aria-hidden={!isBrowsing ? "true" : undefined}>
    {#each slides as slide, i}
      <button
        type="button"
        class="fr__card fr__mobile-card"
        style="top:calc(50lvh + {i * MOBILE_SEG_LVH}lvh)"
        on:click={() => goTo(i)}
        tabindex={isBrowsing && useMobilePreviewFlow ? 0 : -1}
        aria-label={"Aller au projet " + slide.title.replace(/\n/g, " ")}
      >
        <img
          src={slide.images[0]}
          alt=""
          loading={i < 3 ? "eager" : "lazy"}
          decoding="async"
          draggable="false"
        />
      </button>
    {/each}
  </div>

  <div class="fr__mobile-overlay">
    <div class="fr__mobile-overlay-frame">
      <div class="fr__mobile-edge fr__mobile-edge--top" aria-hidden="true"></div>
      <div class="fr__mobile-edge fr__mobile-edge--bottom" aria-hidden="true"></div>

      <div class="fr__mobile-rail" role="group" aria-label="Progression des projets">
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
  .fr {
    position: relative;
    width: 100%;
    background: #000;
    z-index: 2;
    touch-action: pan-y;
    /* Distance de scroll par projet (pilote la vitesse de défilement des aperçus). */
    --seg: 70vh;
    min-height: calc(100lvh + (var(--n) - 1) * var(--seg));
    --bar-inset: 0px;
    --bar-inset: calc(100lvh - 100svh);
    /* Réglages d'ambiance (browse) — --bg-scale > 1 = ZOOM au scroll, retour à 1
       (dézoom) au repos. */
    --bg-blur: 26px;
    --bg-scale: 1.12;
    --scrim-focus: 0.14;
    --scrim-browse: 0.5;
    --fr-ease: cubic-bezier(0.16, 1, 0.3, 1);
    --fr-ease-soft: cubic-bezier(0.22, 0.61, 0.36, 1);
    /* Sous-échantillonnage du flou : la couche floutée est rendue à 1/ds de la
       résolution puis agrandie ×ds → fillrate GPU ÷ ds². Mobile pousse plus fort. */
    --blur-ds: 2;
  }

  .fr__panel {
    position: sticky;
    top: 0;
    height: 100vh;
    height: 100lvh;
    overflow: hidden;
    isolation: isolate;
    pointer-events: none;
    /* Pas de `will-change`/`transform` ici : sur mobile, promouvoir tout le
       panneau 100lvh en couche crée une énorme texture (coûteuse en bande
       passante). Le cache du flou est assuré uniquement par `.fr__bg-layer--blur`
       (promue, non-sticky). */
  }

  /* ── Fond : couche nette + couche pré-floutée ────────────────────────────────── */
  .fr__bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    background: #000;
    transform: scale(1);
    transform-origin: 50% 50%;
    transition: transform 0.92s var(--fr-ease);
  }
  .fr.is-browsing .fr__bg {
    transform: scale(var(--bg-scale));
  }
  .fr__bg-layer {
    position: absolute;
    inset: 0;
  }
  /* Couche floutée : pré-calculée, on ne fait que la faire apparaître en opacité.
     Astuce perf : elle est rendue en DEMI-RÉSOLUTION (50% × 50%) puis agrandie
     ×2. Le flou est donc rasterisé sur 4× moins de pixels (fillrate GPU divisé
     par ~4) — invisible à l'œil puisque c'est justement flou. */
  .fr__bg-layer--blur {
    inset: 0 auto auto 0;
    width: calc(100% / var(--blur-ds));
    height: calc(100% / var(--blur-ds));
    opacity: 0;
    filter: blur(calc(var(--bg-blur) / var(--blur-ds)));
    transform: scale(var(--blur-ds)) translateZ(0);
    transform-origin: 0 0;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    will-change: opacity;
    transition: opacity 0.84s var(--fr-ease);
  }
  .fr.is-browsing .fr__bg-layer--blur {
    opacity: 1;
  }
  .fr__bg-img {
    position: absolute;
    inset: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    opacity: 0;
    /* Fondu discret entre projets (piloté par le slide actif). */
    backface-visibility: hidden;
    transition: opacity 0.72s var(--fr-ease-soft);
  }
  .fr__bg-img.is-shown {
    z-index: 1;
    opacity: 1;
  }

  /* ── Assombrissement global ─────────────────────────────────────────────────── */
  .fr__scrim {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: #03070d;
    opacity: var(--scrim-focus);
    pointer-events: none;
    will-change: opacity;
    transition: opacity 0.88s var(--fr-ease);
  }
  .fr.is-browsing .fr__scrim {
    opacity: var(--scrim-browse);
  }

  /* ── Focus : titre + texte centrés ──────────────────────────────────────────── */
  .fr__focus {
    position: absolute;
    inset: 0;
    z-index: 3;
    display: grid;
    place-items: center;
    text-align: center;
    padding-inline: clamp(3.5rem, 10vw, 8rem);
    opacity: 1;
    backface-visibility: hidden;
    transition: opacity 0.72s var(--fr-ease),
      filter 0.84s var(--fr-ease),
      transform 0.92s var(--fr-ease);
  }
  .fr.is-browsing .fr__focus {
    opacity: 0;
    filter: blur(12px);
    transform: scale(1.04);
    pointer-events: none;
  }

  .fr__focus-slot {
    grid-area: 1 / 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 46rem;
    opacity: 0;
    filter: blur(16px);
    transform: translate3d(0, 22px, 0);
    transition: opacity 0.68s var(--fr-ease-soft),
      filter 0.9s var(--fr-ease),
      transform 0.9s var(--fr-ease);
    backface-visibility: hidden;
    pointer-events: none;
  }
  .fr__focus-slot.is-active {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
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

  /* ── Bouton verre (identique aux autres boutons du site) ────────────────────── */
  .fr__btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: clamp(1.6rem, 2.6vw, 2.4rem);
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

  /* ── Aperçus (colonne centrale) ─────────────────────────────────────────────── */
  .fr__previews {
    position: absolute;
    inset: 0;
    z-index: 4;
    opacity: 0;
    pointer-events: none;
    transform: translateZ(0);
    will-change: opacity;
    transition: opacity 0.82s var(--fr-ease);
  }
  .fr.is-browsing .fr__previews {
    opacity: 1;
    pointer-events: auto;
  }
  .fr__mobile-flow {
    display: none;
  }
  .fr__mobile-overlay {
    display: none;
  }
  .fr__card {
    position: absolute;
    left: 50%;
    top: 50%;
    width: min(46vw, 480px);
    aspect-ratio: 16 / 10;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 14px;
    overflow: hidden;
    background: #0a0d12;
    cursor: pointer;
    transform: translate3d(-50%, -50%, 0) scale(1);
    will-change: transform, opacity;
    contain: layout paint style;
    backface-visibility: hidden;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    -webkit-tap-highlight-color: transparent;
    outline: none;
  }
  .fr__card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform: translateZ(0);
    backface-visibility: hidden;
  }
  .fr__card:focus-visible {
    outline: 2px solid var(--lead-blue, #5768ff);
    outline-offset: 3px;
  }

  /* ── Assombrissement fort haut / bas (au-dessus des aperçus) ─────────────────── */
  .fr__edge {
    position: absolute;
    left: 0;
    right: 0;
    z-index: 5;
    height: 30vh;
    pointer-events: none;
    opacity: 0;
    will-change: opacity;
    transition: opacity 0.82s var(--fr-ease);
  }
  .fr__edge--top {
    top: 0;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0.55) 40%, rgba(0, 0, 0, 0) 100%);
  }
  .fr__edge--bottom {
    bottom: calc(-1 * var(--bar-inset));
    height: calc(32vh + var(--bar-inset));
    background: linear-gradient(to top, rgba(0, 0, 0, 0.94) 0%, rgba(0, 0, 0, 0.6) 42%, rgba(0, 0, 0, 0) 100%);
  }
  .fr.is-browsing .fr__edge { opacity: 1; }

  /* ── Barre de suivi (gauche) — pilule verticale à points, façon dock ─────────── */
  .fr__rail {
    position: absolute;
    left: clamp(1rem, 3vw, 2.6rem);
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

  /* ── Responsive ─────────────────────────────────────────────────────────────── */
  @media (max-width: 900px), (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .fr {
      --seg: var(--mobile-seg);
      --bg-scale: 1.09;
      --mobile-bottom-bleed: max(7rem, var(--bar-inset), var(--dyn-bar));
      /* Sur mobile : PAS de flou plein écran (c'est lui qui forçait le scroll sur
         le thread principal = « pas fluide »). On compense par un assombrissement
         FORT + le dézoom → le fond recule dans le noir, effet stable et 100%
         composité. Le flou reste full qualité sur desktop. */
      --scrim-browse: 0.68;
      min-height: calc(100lvh + (var(--n) - 1) * var(--seg));
    }
    .fr__panel {
      height: 100lvh;
    }
    /* On supprime carrément la couche floutée sur mobile : aucun filtre plein
       écran dans le flux de scroll → scroll natif fluide. */
    .fr__bg-layer--blur {
      display: none;
    }
    .fr__previews {
      display: none;
    }
    .fr__edge,
    .fr__rail {
      display: none;
    }
    .fr__mobile-flow {
      display: block;
      position: absolute;
      inset: 0;
      z-index: 4;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.48s var(--fr-ease);
      will-change: opacity;
    }
    .fr.is-browsing .fr__mobile-flow {
      opacity: 1;
    }
    .fr__mobile-overlay {
      display: block;
      position: absolute;
      inset: 0;
      z-index: 7;
      pointer-events: none;
    }
    .fr__mobile-overlay-frame {
      position: sticky;
      top: 0;
      height: 100lvh;
      overflow: hidden;
      pointer-events: none;
      isolation: isolate;
    }
    .fr__mobile-edge {
      position: absolute;
      left: 0;
      right: 0;
      z-index: 1;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.58s var(--fr-ease);
    }
    .fr__mobile-edge--top {
      top: 0;
      height: 28svh;
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.5) 42%, rgba(0, 0, 0, 0) 100%);
    }
    .fr__mobile-edge--bottom {
      bottom: calc(-1 * var(--mobile-bottom-bleed));
      height: calc(48lvh + var(--mobile-bottom-bleed));
      background: linear-gradient(to top, rgba(0, 0, 0, 0.98) 0%, rgba(0, 0, 0, 0.96) 26%, rgba(0, 0, 0, 0.74) 46%, rgba(0, 0, 0, 0.42) 68%, rgba(0, 0, 0, 0) 100%);
    }
    .fr.is-browsing .fr__mobile-edge {
      opacity: 1;
    }
    .fr__mobile-rail {
      position: absolute;
      left: 50%;
      bottom: calc(max(clamp(1.1rem, 4vw, 1.8rem), var(--safe-bottom-offset)) + var(--bar-inset));
      z-index: 2;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: clamp(0.8rem, 3vw, 1rem);
      pointer-events: auto;
    }
    /* Focus-pull des titres/textes sans filtre `blur` sur mobile (opacité +
       glissement seulement) → un filtre de moins par bloc. */
    .fr__focus-slot,
    .fr__focus-slot.is-active {
      filter: none;
    }
    .fr__card {
      width: min(74vw, 460px);
      border-radius: 10px;
      box-shadow: 0 16px 38px rgba(0, 0, 0, 0.28);
      contain: layout paint style;
    }
    .fr__mobile-card {
      opacity: 1;
      transform: translate3d(-50%, -50%, 0);
      pointer-events: auto;
      will-change: transform, opacity;
    }
    @supports (animation-timeline: view()) {
      .fr__mobile-card {
        animation: fr-mobile-card-presence linear both;
        animation-timeline: view(block);
        animation-range: entry 6% exit 94%;
      }
    }
    .fr__card img {
      transform: translateZ(0);
    }
    .fr__focus { padding-inline: clamp(2.4rem, 12vw, 5rem); }

    .fr__bg-img {
      transform: translateZ(0);
      will-change: opacity;
      transition-duration: 0.84s;
      transition-timing-function: var(--fr-ease);
    }
    .fr__bg,
    .fr__scrim,
    .fr__focus,
    .fr__previews,
    .fr__edge {
      transition-duration: 0.64s;
    }

    /* Barre de suivi mobile : HORIZONTALE, centrée en bas (façon dock). */
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
    /* Point actif : s'allonge horizontalement (et non plus verticalement). */
    .fr__dot.is-active {
      width: clamp(24px, 7vw, 32px);
      height: clamp(8px, 2.2vw, 9px);
    }
    .fr__pill,
    .fr__pp {
      background: rgba(255, 255, 255, 0.11);
      backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
      -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    }
    /* On n'anime pas de flou plein écran sur le focus (fondu en opacité seul)
       pour ne pas coûter en fillrate pendant le scroll. */
    .fr.is-browsing .fr__focus {
      filter: none;
      transform: none;
    }
  }

  @keyframes fr-mobile-card-presence {
    0% {
      opacity: 0.28;
      transform: translate3d(-50%, -45.5%, 0) scale(0.9);
    }
    22% {
      opacity: 0.72;
      transform: translate3d(-50%, -48.6%, 0) scale(0.95);
    }
    42%,
    60% {
      opacity: 1;
      transform: translate3d(-50%, -50%, 0) scale(0.995);
    }
    82% {
      opacity: 0.74;
      transform: translate3d(-50%, -51.8%, 0) scale(0.95);
    }
    100% {
      opacity: 0.32;
      transform: translate3d(-50%, -54.5%, 0) scale(0.91);
    }
  }

  @media (max-width: 480px) {
    .fr__title { font-size: clamp(2.6rem, 13vw, 4.2rem); }
    .fr__card { width: 80vw; }
  }

  /* Paysage téléphone (viewport court, parfois > 900px de large) : on garde la
     barre HORIZONTALE en bas + réglages courts. */
  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .fr__card { width: min(46vw, 360px); }
    .fr__mobile-edge--top { height: 22lvh; }
    .fr__mobile-edge--bottom { height: calc(34lvh + var(--mobile-bottom-bleed)); }

    .fr__mobile-rail {
      left: 50%;
      right: auto;
      top: auto;
      bottom: calc(max(clamp(0.9rem, 3vw, 1.4rem), var(--safe-bottom-offset)) + var(--bar-inset));
      transform: translateX(-50%);
      flex-direction: row;
      gap: 0;
    }
    .fr__pill {
      flex-direction: row;
      width: auto;
      height: clamp(2.4rem, 6vw, 2.9rem);
      padding: 0 clamp(1rem, 3vw, 1.35rem);
      gap: clamp(0.6rem, 1.8vw, 0.9rem);
    }
    .fr__dot { width: 8px; height: 8px; }
    .fr__dot.is-active { width: 26px; height: 8px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .fr__bg,
    .fr__bg-layer--blur,
    .fr__scrim,
    .fr__focus,
    .fr__focus-slot,
    .fr__previews,
    .fr__edge,
    .fr__mobile-flow,
    .fr__mobile-edge {
      transition-duration: 0.25s;
    }
    .fr__mobile-card {
      animation: none !important;
    }
    .fr.is-browsing .fr__bg { transform: none; }
    .fr__focus-slot,
    .fr__focus-slot.is-active { filter: none; transform: none; }
  }
</style>
