<script>
  import { reveal } from "$lib/actions/reveal.js";
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import SliderDock from "$lib/components/shared/SliderDock.svelte";
  import { animateScrollLeft } from "$lib/scroll/smoothScrollLeft.js";

  // Slider horizontal : grandes images, le texte EN DESSOUS de chaque image.
  // Navigation via le dock de pagination (points + lecture auto).
  export let title = "";
  export let slides = [];

  let track;
  let active = 0;
  const panelEls = [];
  let raf = 0;

  // Desktop : seul le dock est sticky (position: sticky; bottom → il flotte puis
  // se pose). Mobile : image plus courte (pour ne pas être trop haute), donc le
  // sticky-bottom ne pourrait pas flotter → on épingle le dock au bas de l'écran
  // (overlay 100lvh de SliderDock), qui fonctionne quelle que soit la hauteur.
  let isMobile = false;
  let mqMobile;
  const onMq = (e) => (isMobile = e.matches);

  const padLeft = () => (track ? parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0 : 0);

  function updateActive() {
    raf = 0;
    if (!track) return;
    // Dernier cran : la dernière image ne peut pas s'aligner complètement à gauche
    // (course de scroll insuffisante) → sans ce garde-fou le dock n'atteindrait
    // jamais le dernier point. Dès qu'on est en butée de scroll, on force le
    // dernier index.
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) {
      active = panelEls.length - 1;
      return;
    }
    const anchor = track.getBoundingClientRect().left + padLeft();
    let best = 0, bestD = Infinity;
    for (let i = 0; i < panelEls.length; i++) {
      if (!panelEls[i]) continue;
      const d = Math.abs(panelEls[i].getBoundingClientRect().left - anchor);
      if (d < bestD) { bestD = d; best = i; }
    }
    active = best;
  }

  function onScroll() {
    if (!raf) raf = requestAnimationFrame(updateActive);
  }

  // Défilement horizontal premium partagé (courbe douce, snap géré, stable).
  let scrollCtrl = null;

  function goTo(i) {
    if (!track || !panelEls[i]) return;
    const anchor = track.getBoundingClientRect().left + padLeft();
    const delta = panelEls[i].getBoundingClientRect().left - anchor;
    scrollCtrl?.cancel();
    scrollCtrl = animateScrollLeft(track, track.scrollLeft + delta);
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
      <article class="ms-panel" bind:this={panelEls[i]}>
        <div class="ms-media" use:reveal>
          <img src={slide.image} alt={slide.alt ?? slide.label ?? ""} loading={i < 2 ? "eager" : "lazy"} decoding="async" draggable="false" />
        </div>
        <div class="ms-cap" use:reveal={{ delay: 120 }}>
          {#if slide.label}<span class="ms-cap__label">{slide.label}</span>{/if}
          {#if slide.caption}<p class="ms-cap__text">{slide.caption}</p>{/if}
        </div>
      </article>
    {/each}
  </div>

  {#if isMobile}
    <!-- Mobile : dock épinglé au bas de l'écran (overlay), fonctionne avec une
         image de hauteur normale. -->
    <SliderDock
      count={slides.length}
      {active}
      interval={5200}
      label="visuels du pôle"
      on:goto={(e) => goTo(e.detail)}
    />
  {:else}
    <!-- Desktop : seul le dock est sticky (`position: sticky; bottom`) → il flotte
         en bas du viewport pendant qu'on scrolle le composant, puis se pose à sa
         position naturelle (sous les légendes). Le contenu défile normalement. -->
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

  /* SEUL le dock est sticky (desktop ET mobile) : `position: sticky; bottom` → le
     dock flotte au bas du viewport pendant qu'on scrolle le composant, puis se
     pose à sa position naturelle (sous les légendes) au bas du composant. Le
     contenu (rail + légendes) défile normalement. */
  .ms-dock {
    position: sticky;
    bottom: max(clamp(1.1rem, 3vh, 2rem), var(--safe-bottom-offset, 1rem));
    z-index: 5;
  }

  /* Desktop : image haute (le dock flotte par-dessus le média), section plus
     haute que le viewport (course du flottement), et `margin-top` pour rétablir
     l'espace au-dessus du slider entre les sections. */
  @media (min-width: 769px) {
    .ms {
      min-height: calc(100lvh + 24vh);
      margin-top: clamp(4rem, 9vh, 8rem);
    }
    .ms-track {
      grid-auto-columns: min(84%, 78rem);
    }
    .ms-media {
      aspect-ratio: auto;
      height: min(72vh, 760px);
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

  /* ── Track ── */
  .ms-track {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: min(60%, 56rem);
    /* Plus d'espace entre les images du slider. */
    gap: clamp(1.5rem, 3.5vw, 3.5rem);
    overflow-x: auto;
    /* Lock the track to horizontal scrolling only. Without an explicit
       overflow-y, `overflow-x: auto` forces overflow-y to compute to `auto`
       too (CSS spec), letting the track drift vertically. `hidden` removes that
       vertical scroll; touch-action is left at its default so the browser still
       routes vertical swipes to the page and horizontal swipes to the track. */
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    scroll-padding-left: max((100vw - min(1400px, 92%)) / 2, 4vw);
    padding: 0 max((100vw - min(1400px, 92%)) / 2, 4vw) 0.5rem;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
  }
  .ms-track::-webkit-scrollbar { display: none; }

  .ms-panel {
    scroll-snap-align: start;
    min-width: 0;
  }

  .ms-media {
    aspect-ratio: 16 / 11;
    border-radius: 16px;
    overflow: hidden;
    background: var(--project-surface-card, #121212);
    /* Reassert the full reveal transition alongside the theme colour fade — a
       scoped `transition: background-color` alone would out-specify the global
       `.reveal` rule and cancel the arrival animation. */
    transition:
      opacity 0.6s ease,
      filter 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      background-color var(--project-theme-transition, 920ms cubic-bezier(0.16, 1, 0.3, 1));
    transition-delay: var(--reveal-delay, 0ms);
  }

  .ms-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform: scale(1.05);
    transition: transform 1.2s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  /* Dé-zoom d'arrivée en un seul coup : pas de will-change permanent (sinon une
     couche GPU par image reste promue en permanence, hors écran compris). */
  .ms-media:global(.is-revealed) img { transform: scale(1); }

  /* Texte EN DESSOUS de l'image */
  .ms-cap {
    margin-top: clamp(1rem, 1.6vw, 1.4rem);
    max-width: 44ch;
  }

  .ms-cap__label {
    display: block;
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: clamp(1.1rem, 1.5vw, 1.35rem);
    letter-spacing: -0.02em;
    color: var(--project-surface-ink, #f4efe6);
    transition: color var(--project-theme-transition, 920ms cubic-bezier(0.16, 1, 0.3, 1));
  }

  .ms-cap__text {
    margin: 0.5rem 0 0;
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: clamp(0.98rem, 1.1vw, 1.1rem);
    line-height: 1.5;
    color: var(--project-surface-muted, rgba(244, 239, 230, 0.7));
    text-wrap: pretty;
    transition: color var(--project-theme-transition, 920ms cubic-bezier(0.16, 1, 0.3, 1));
  }

  /* Mobile : image de hauteur normale (pas trop haute) et contenu centré ; le
     dock est épinglé au bas de l'écran (overlay, cf. markup) tant qu'on parcourt
     le composant. La section est un peu plus haute que le viewport pour laisser
     l'épinglage jouer. */
  @media (max-width: 768px) {
    .ms {
      min-height: calc(100lvh + 14vh);
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .ms-track {
      grid-auto-columns: 86%;
    }
    .ms-media {
      aspect-ratio: auto;
      height: min(48vh, 420px);
    }
    /* Réglage du dock épinglé SANS toucher au contenu (l'overlay est en `absolute`,
       hors flux) :
       - `top` négatif → l'épinglage démarre plus tôt / plus haut dans le scroll ;
       - `bottom` positif → l'overlay se termine plus haut, donc le dock se pose plus
         près du bas des slides (moins de vide en fin de course). */
    .ms :global(.sd-overlay) {
      top: -42vh;
      bottom: 8vh;
    }
  }

  /* Mobile: drop the blur from the arrival (matches the global reveal rule,
     which our scoped transition above would otherwise re-enable). */
  @media (hover: none) and (pointer: coarse) {
    .ms-media.reveal {
      filter: none;
      transition:
        opacity 0.5s ease,
        transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1),
        background-color var(--project-theme-transition, 920ms cubic-bezier(0.16, 1, 0.3, 1));
      transition-delay: var(--reveal-delay, 0ms);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ms-media.reveal {
      transition: background-color var(--project-theme-transition, 920ms cubic-bezier(0.16, 1, 0.3, 1));
    }
    .ms-media img,
    .ms-media:global(.is-revealed) img {
      transition: none;
      transform: none;
    }
  }
</style>
