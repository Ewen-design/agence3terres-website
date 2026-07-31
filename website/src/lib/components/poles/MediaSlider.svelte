<script>
  import { reveal } from "$lib/actions/reveal.js";
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import SliderDock from "$lib/components/shared/SliderDock.svelte";
  import { animateScrollLeft } from "$lib/scroll/smoothScrollLeft.js";

  // Carrousel « cartes » (façon Apple Cards Carousel) — MÊME mécanisme de
  // mouvement que ParallaxGallery2 : conteneur à SCROLL NATIF (fluide, compositeur,
  // stable), scroll-snap, et la navigation par le dock utilise `animateScrollLeft`
  // (défilement doux natif, snap géré). L'index actif est déduit de `offsetLeft`
  // (aucun reflow forcé pendant le scroll → stable). Pas de flèches, pas de
  // panneau au clic : les cartes sont de simples visuels.
  export let title = "";
  export let slides = [];

  let track;
  let active = 0;
  const cardEls = [];
  let raf = 0;
  let isAutoScrolling = false;
  let scrollCtrl = null;

  let isMobile = false;
  let mqMobile;
  const onMq = (e) => (isMobile = e.matches);

  const padLeft = () =>
    track ? parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0 : 0;

  function updateActive() {
    raf = 0;
    if (!track) return;
    // Dernier cran : en butée de scroll, on force le dernier index (la dernière
    // carte ne peut pas s'aligner complètement à gauche).
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) {
      active = cardEls.length - 1;
      return;
    }
    const anchor = track.scrollLeft + padLeft();
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < cardEls.length; i++) {
      const c = cardEls[i];
      if (!c) continue;
      const d = Math.abs(c.offsetLeft - anchor);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    active = best;
  }

  function onScroll() {
    if (isAutoScrolling) return; // pendant une nav programmatique, l'index est déjà connu
    if (!raf) raf = requestAnimationFrame(updateActive);
  }

  function goTo(i) {
    if (!track || !cardEls[i]) return;
    const targetLeft = Math.max(0, cardEls[i].offsetLeft - padLeft());
    active = i;
    scrollCtrl?.cancel();
    isAutoScrolling = true;
    scrollCtrl = animateScrollLeft(track, targetLeft, {
      onDone: () => {
        isAutoScrolling = false;
        updateActive();
      }
    });
  }

  onMount(() => {
    if (!browser) return;
    mqMobile = window.matchMedia("(max-width: 768px)");
    isMobile = mqMobile.matches;
    mqMobile.addEventListener?.("change", onMq);
    if (track) {
      track.addEventListener("scroll", onScroll, { passive: true });
      requestAnimationFrame(updateActive);
    }
  });
  onDestroy(() => {
    if (!browser) return;
    mqMobile?.removeEventListener?.("change", onMq);
    if (track) track.removeEventListener("scroll", onScroll);
    if (raf) cancelAnimationFrame(raf);
    scrollCtrl?.cancel();
  });
</script>

{#if slides.length}
<section class="ms">
  {#if title}
    <div class="ms-head" use:reveal>
      <h3 class="ms-title">{title}</h3>
    </div>
  {/if}

  <div class="ms-track" bind:this={track}>
    {#each slides as slide, i}
      <div class="ms-card" bind:this={cardEls[i]}>
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
      count={slides.length}
      {active}
      interval={5200}
      label="visuels du pôle"
      on:goto={(e) => goTo(e.detail)}
    />
  {:else}
    <div class="ms-dock">
      <SliderDock
        count={slides.length}
        {active}
        interval={5200}
        label="visuels du pôle"
        sticky={false}
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
    /* Cartes 1,5× plus larges (desktop). */
    grid-auto-columns: clamp(30rem, 39vw, 36rem);
    gap: clamp(1rem, 1.6vw, 1.5rem);
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
    aspect-ratio: 9 / 10;
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
    transform: scale(1.06);
    transition: transform 1.2s cubic-bezier(0.22, 0.61, 0.36, 1);
    backface-visibility: hidden;
  }
  /* Dé-zoom d'arrivée (reveal), puis état stable à scale(1). */
  .ms-card__media:global(.is-revealed) .ms-card__img {
    transform: scale(1);
  }
  @media (hover: hover) {
    .ms-card:hover .ms-card__img {
      transform: scale(1.06);
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
    .ms :global(.sd-overlay) {
      top: -42vh;
      bottom: 8vh;
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
    .ms-card__img,
    .ms-card__media:global(.is-revealed) .ms-card__img {
      transition: transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ms-card__img,
    .ms-card__media:global(.is-revealed) .ms-card__img {
      transition: none;
      transform: scale(1);
    }
  }
</style>
