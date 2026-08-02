<script>
  import { reveal } from "$lib/actions/reveal.js";
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import SliderDock from "$lib/components/shared/SliderDock.svelte";
  import { animateScrollLeft } from "$lib/scroll/smoothScrollLeft.js";

  // Carrousel « cartes » (façon Apple Cards Carousel) — MÊME mécanisme de
  // mouvement ET DE NAVIGATION que ParallaxGallery2 : conteneur à SCROLL NATIF
  // (fluide, compositeur, stable), scroll-snap, navigation du dock via
  // `animateScrollLeft`. La navigation raisonne en PAGES = positions de scroll
  // réellement atteignables (dédupliquées) : sur desktop deux cartes (46vw) sont
  // visibles, la ou les dernières butent donc sur la même position finale → le
  // dock affiche exactement le bon nombre de points et le clic tombe toujours
  // sur un cran atteignable (plus de dernier point « mort » qui saccadait).
  export let title = "";
  export let slides = [];

  let track;
  let active = 0;
  const cardEls = [];

  let isMobile = false;
  let mqMobile;
  const onMq = (e) => (isMobile = e.matches);

  let prefersReduced = false;
  let supportsScrollEnd = false;
  let sectionEl;
  let pagesObserver;

  // Positions de scroll atteignables (une par cran), croissantes et dédupliquées.
  let pageTargets = [0];
  // Filet de sécurité : tant que la mesure des crans n'a pas donné plus d'un
  // cran (avant `computePages`, ou si la mesure a échoué), on retombe sur le
  // nombre de slides → le dock ne disparaît jamais.
  $: dockCount = pageTargets.length > 1 ? pageTargets.length : slides.length;

  // Décalage gauche d'alignement = offsetLeft de la 1ʳᵉ carte (inclut le
  // scroll-padding). Mesuré sur le DOM → pas de parsing de style fragile.
  const scrollPad = () => (cardEls[0] ? cardEls[0].offsetLeft : 0);

  function computePages() {
    if (!track || !cardEls.length) {
      pageTargets = [0];
      return;
    }
    const maxScroll = Math.max(0, Math.round(track.scrollWidth - track.clientWidth));
    const pad = scrollPad();
    const targets = [];
    for (const card of cardEls) {
      if (!card) continue;
      const t = Math.min(Math.max(0, Math.round(card.offsetLeft - pad)), maxScroll);
      // Croissant → comparer au dernier retenu suffit à fusionner les cartes qui
      // butent toutes sur maxScroll (un seul cran final).
      if (targets.length && Math.abs(t - targets[targets.length - 1]) < 8) continue;
      targets.push(t);
    }
    let pages = targets.length ? targets : [0];

    // Desktop « deux cartes visibles » : la dernière carte est souvent déjà
    // largement à l'écran au cran précédent → le tout dernier cran (butée droite)
    // ferait double emploi (le « point de cran en trop »). On le fusionne, comme
    // ParallaxGallery2. Sur mobile (une carte à la fois) la dernière carte n'est
    // quasi pas visible au cran précédent → chaque carte garde son point.
    const last = cardEls[cardEls.length - 1];
    if (last && pages.length > 2) {
      const cw = track.clientWidth;
      const cardW = last.offsetWidth;
      const cardLeft = last.offsetLeft;
      const cardRight = cardLeft + cardW;
      const visibleRatioAt = (sl) => {
        if (!cardW) return 0;
        const l = Math.max(cardLeft, sl);
        const r = Math.min(cardRight, sl + cw);
        return Math.max(0, r - l) / cardW;
      };
      // Retire l'avant-dernier cran tant que la dernière carte y est déjà
      // majoritairement visible (le dernier cran = butée suffit à la montrer).
      while (pages.length > 2 && visibleRatioAt(pages[pages.length - 2]) >= 0.6) {
        pages = [...pages.slice(0, -2), pages[pages.length - 1]];
      }
    }

    pageTargets = pages;
    if (active > pageTargets.length - 1) active = pageTargets.length - 1;
  }

  function updateActive() {
    if (!track || !pageTargets.length) return;
    const sl = track.scrollLeft;
    let nearest = 0;
    let best = Infinity;
    for (let i = 0; i < pageTargets.length; i++) {
      const d = Math.abs(pageTargets[i] - sl);
      if (d < best) {
        best = d;
        nearest = i;
      }
    }
    if (nearest !== active) active = nearest;
  }

  // ── Navigation + stabilisation ──
  let isAutoScrolling = false;
  let scrollCtrl = null;
  let activeRaf = 0;
  let scrollEndFallback = 0;

  function onScroll() {
    if (isAutoScrolling) return; // pendant une nav programmatique, l'index est déjà connu
    if (activeRaf) cancelAnimationFrame(activeRaf);
    activeRaf = requestAnimationFrame(() => {
      updateActive();
      activeRaf = 0;
    });
  }

  // `scrollend` (quand supporté) clôt proprement une nav programmatique : l'index
  // est recalé une fois le mouvement réellement terminé, sans dépendre d'un timer.
  function onScrollEnd() {
    if (!isAutoScrolling) return;
    clearTimeout(scrollEndFallback);
    isAutoScrolling = false;
    updateActive();
  }

  function goTo(i) {
    if (!track || !pageTargets.length) return;
    const clamped = Math.max(0, Math.min(i, pageTargets.length - 1));
    const targetLeft = pageTargets[clamped];
    // L'index actif est posé AVANT le mouvement → le dock répond instantanément
    // au clic (pas d'attente de fin de scroll).
    active = clamped;

    scrollCtrl?.cancel();
    if (prefersReduced) {
      isAutoScrolling = false;
      track.style.scrollSnapType = "";
      track.scrollTo({ left: targetLeft, behavior: "auto" });
      updateActive();
      return;
    }
    isAutoScrolling = true;
    // Filet : si `scrollend`/`onDone` manquait, on relâche le verrou.
    clearTimeout(scrollEndFallback);
    scrollEndFallback = setTimeout(() => {
      isAutoScrolling = false;
      updateActive();
    }, 900);
    scrollCtrl = animateScrollLeft(track, targetLeft, {
      onDone: () => {
        clearTimeout(scrollEndFallback);
        isAutoScrolling = false;
        updateActive();
      }
    });
  }

  let resizeTimer = 0;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (mqMobile) isMobile = mqMobile.matches;
      computePages();
      // Recale sans animation sur le cran courant (les positions ont changé).
      if (track && pageTargets[active] != null) {
        track.scrollTo({ left: pageTargets[active], behavior: "auto" });
      }
      updateActive();
    }, 90);
  }

  onMount(() => {
    if (!browser) return;
    mqMobile = window.matchMedia("(max-width: 768px)");
    isMobile = mqMobile.matches;
    mqMobile.addEventListener?.("change", onMq);

    prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    supportsScrollEnd = "onscrollend" in window;

    if (track) {
      track.addEventListener("scroll", onScroll, { passive: true });
      if (supportsScrollEnd) track.addEventListener("scrollend", onScrollEnd, { passive: true });
      // Deux rAF : le layout (largeurs en vw) est stable avant la 1ʳᵉ mesure.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          computePages();
          updateActive();
        })
      );
    }

    // Filet : (re)mesure les crans quand la section entre dans le viewport. La
    // 1ʳᵉ mesure onMount peut tomber avant que le layout soit parfaitement posé
    // (loader d'intro, sections déportées) → une mesure « au moment vu » garantit
    // un dock au bon nombre de points et une navigation juste. Auto-corrige.
    if (sectionEl && "IntersectionObserver" in window) {
      pagesObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            computePages();
            updateActive();
          }
        },
        { rootMargin: "25% 0px 25% 0px", threshold: 0 }
      );
      pagesObserver.observe(sectionEl);
    }

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
  });

  onDestroy(() => {
    if (!browser) return;
    mqMobile?.removeEventListener?.("change", onMq);
    if (track) {
      track.removeEventListener("scroll", onScroll);
      track.removeEventListener("scrollend", onScrollEnd);
    }
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onResize);
    pagesObserver?.disconnect();
    if (activeRaf) cancelAnimationFrame(activeRaf);
    clearTimeout(scrollEndFallback);
    clearTimeout(resizeTimer);
    scrollCtrl?.cancel();
  });
</script>

{#if slides.length}
<section class="ms" bind:this={sectionEl}>
  {#if title}
    <div class="ms-head" use:reveal>
      <h3 class="ms-title">{title}</h3>
    </div>
  {/if}

  <div class="ms-track" bind:this={track}>
    {#each slides as slide, i}
      <div class="ms-card" class:is-active={active === i} bind:this={cardEls[i]}>
        <span class="ms-card__media" use:reveal>
          <img
            class="ms-card__img"
            src={slide.image}
            alt={slide.alt ?? slide.label ?? ""}
            loading={i < 2 ? "eager" : "lazy"}
            decoding="async"
            draggable="false"
          />
        </span>
        <span class="ms-card__grad" aria-hidden="true"></span>
        <span class="ms-card__text">
          {#if slide.label}<span class="ms-card__cat">{slide.label}</span>{/if}
          {#if slide.caption}<span class="ms-card__title">{slide.caption}</span>{/if}
        </span>
      </div>
    {/each}
  </div>

  {#if isMobile}
    <SliderDock
      count={dockCount}
      {active}
      interval={5200}
      label="visuels du pôle"
      autoplay
      loop
      on:goto={(e) => goTo(e.detail)}
    />
  {:else}
    <div class="ms-dock">
      <SliderDock
        count={dockCount}
        {active}
        interval={5200}
        label="visuels du pôle"
        sticky={false}
        autoplay
        loop
        on:goto={(e) => goTo(e.detail)}
      />
    </div>
  {/if}
</section>
{/if}

<style>
  .ms {
    position: relative;
    background: transparent;
    padding: clamp(2rem, 4vw, 4rem) 0 clamp(3rem, 6vw, 6rem);
  }

  .ms-dock {
    position: sticky;
    bottom: max(clamp(1.1rem, 3vh, 2rem), var(--safe-bottom-offset, 1rem));
    z-index: 5;
  }

  @media (min-width: 769px) {
    .ms {
      min-height: calc(100lvh + 24vh);
      margin-top: clamp(4rem, 9vh, 8rem);
    }
  }

  .ms-head {
    width: min(1400px, 92%);
    margin: 0 auto clamp(1.4rem, 2.4vw, 2rem);
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
  }
  .ms-title {
    margin: 0;
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: clamp(1.3rem, 2vw, 1.8rem);
    letter-spacing: -0.025em;
    color: var(--project-surface-ink, #f4efe6);
    transition: color var(--project-theme-transition, 920ms cubic-bezier(0.16, 1, 0.3, 1));
  }

  /* ── Piste : scroll natif (comme ParallaxGallery2) ── */
  .ms-track {
    display: grid;
    grid-auto-flow: column;
    /* Mêmes tailles de cartes que ParallaxGallery2 (desktop) : 46vw de large →
       deux cartes visibles à la fois, avec un aperçu de la suivante. */
    grid-auto-columns: 46vw;
    gap: clamp(0.7rem, 1vw, 1.1rem);
    overflow-x: auto;
    /* Verrouille au scroll horizontal (sinon `overflow-x:auto` force overflow-y à
       `auto` aussi → dérive verticale). Le tactile vertical scrolle donc la page. */
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    scroll-padding-left: max((100vw - min(1400px, 92%)) / 2, 4vw);
    padding: 0 max((100vw - min(1400px, 92%)) / 2, 4vw) 0.5rem;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
  }
  .ms-track::-webkit-scrollbar { display: none; }

  /* ── Carte (façon Apple Cards Carousel) ── */
  .ms-card {
    scroll-snap-align: start;
    position: relative;
    min-width: 0;
    /* Hauteur pilotée par la fenêtre, comme ParallaxGallery2 (desktop). */
    height: min(86vh, 920px);
    border-radius: 24px;
    overflow: hidden;
    background: var(--project-surface-card, #121212);
  }
  /* Média + zoom : SEULE l'image zoome au survol (aucun effet sur le rayon, la
     position de la carte ou les textes). Le zoom est clippé par la carte. */
  .ms-card__media {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    display: block;
  }
  .ms-card__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    /* Repos = légèrement zoomé ; dé-zoom d'ARRIVÉE quand la carte devient active
       (même principe que ParallaxGallery2). Sur mobile l'effet se rejoue donc à
       chaque slide (la carte centrée dé-zoome, l'ancienne re-zoome). */
    transform: scale(1.08);
    transition: transform 1.1s cubic-bezier(0.22, 0.61, 0.36, 1);
    will-change: transform;
    backface-visibility: hidden;
  }
  /* Carte active (centrée) = état stable dézoomé. Sur desktop, le survol dé-zoome
     aussi la carte pointée (deux cartes visibles à la fois). */
  .ms-card.is-active .ms-card__img {
    transform: scale(1);
  }
  @media (hover: hover) {
    .ms-card:hover .ms-card__img {
      transform: scale(1);
    }
  }
  .ms-card__grad {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.55) 0%,
      rgba(0, 0, 0, 0.16) 28%,
      rgba(0, 0, 0, 0) 55%
    );
  }
  .ms-card__text {
    position: absolute;
    z-index: 2;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: clamp(1.5rem, 2vw, 2rem);
    text-align: left;
    pointer-events: none;
  }
  /* Petit titre = le label. */
  .ms-card__cat {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: clamp(0.9rem, 1vw, 1.05rem);
    letter-spacing: 0.01em;
    color: rgba(255, 255, 255, 0.92);
    text-shadow: 0 2px 14px rgba(0, 0, 0, 0.4);
  }
  /* Gros titre = le petit texte (caption), court et un peu moins large. */
  .ms-card__title {
    max-width: 25rem;
    font-family: "Inter", sans-serif;
    font-weight: 600;
    font-size: clamp(1.4rem, 2vw, 1.85rem);
    line-height: 1.14;
    letter-spacing: -0.02em;
    color: #fff;
    text-wrap: balance;
    text-shadow: 0 4px 24px rgba(0, 0, 0, 0.42);
  }

  /* ── Très grands écrans (moniteurs externes) ── Les cartes font 46vw : sur un
     grand écran elles deviennent énormes, alors que le texte est figé par le max
     des clamp (≈ dès 1480px). On laisse donc le texte grandir avec l'écran pour
     rester proportionné (les portables ≤ 1600px ne sont pas touchés). */
  @media (min-width: 1600px) {
    .ms-card__text {
      gap: 0.5rem;
      padding: clamp(2rem, 2.4vw, 3rem);
    }
    .ms-card__cat {
      font-size: clamp(1.05rem, 1.15vw, 1.5rem);
    }
    .ms-card__title {
      max-width: 34rem;
      font-size: clamp(1.85rem, 2.35vw, 3rem);
    }
  }

  /* ── Mobile ── (mêmes tailles de cartes que ParallaxGallery2 : quasi plein
     écran, hauteur pilotée par la fenêtre, un léger aperçu de la suivante). */
  @media (max-width: 768px) {
    .ms {
      min-height: calc(100lvh + 14vh);
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .ms-track {
      grid-auto-columns: clamp(300px, 88vw, 440px);
      gap: clamp(0.9rem, 3vw, 1.2rem);
    }
    .ms-card {
      aspect-ratio: auto;
      height: min(72vh, 660px);
      border-radius: 22px;
    }
    .ms-card__title {
      max-width: none;
      font-size: clamp(1.45rem, 6vw, 1.85rem);
    }
    /* Le dock se pose plus bas (bottom plus petit = point d'ancrage plus proche
       du bas de la section) pour ne plus être collé aux slides en état final. */
    .ms :global(.sd-overlay) {
      top: -42vh;
      bottom: 3vh;
    }
  }

  @media (max-width: 640px) {
    .ms-track {
      grid-auto-columns: clamp(270px, 90vw, 380px);
    }
    .ms-card {
      height: min(74vh, 620px);
    }
  }

  @media (hover: none) and (pointer: coarse) {
    /* Dé-zoom d'arrivée plus court sur tactile (rejoué à chaque slide). */
    .ms-card__img {
      transition: transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ms-card__img {
      transition: none;
      transform: scale(1);
    }
  }
</style>
