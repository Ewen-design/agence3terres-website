<script>
  import { reveal } from "$lib/actions/reveal.js";
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import SliderDock from "$lib/components/shared/SliderDock.svelte";

  // Slider horizontal : grandes images, le texte EN DESSOUS de chaque image.
  // Navigation via le dock de pagination (points + lecture auto).
  export let title = "";
  export let slides = [];

  let track;
  let active = 0;
  const panelEls = [];
  let raf = 0;

  const padLeft = () => (track ? parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0 : 0);

  function updateActive() {
    raf = 0;
    if (!track) return;
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

  // Scroll horizontal animé maison : mouvement lent, doux et premium (le smooth
  // natif est trop rapide/sec). On coupe le scroll-snap le temps de l'anim.
  let scrollRaf = 0;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function animateScrollTo(toLeft, duration = 1150) {
    if (!track) return;
    cancelAnimationFrame(scrollRaf);
    const from = track.scrollLeft;
    const dist = toLeft - from;
    if (Math.abs(dist) < 1) return;
    track.style.scrollSnapType = "none";
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      track.scrollLeft = from + dist * easeInOut(p);
      if (p < 1) scrollRaf = requestAnimationFrame(step);
      else track.style.scrollSnapType = "";
    };
    scrollRaf = requestAnimationFrame(step);
  }

  function goTo(i) {
    if (!track || !panelEls[i]) return;
    const anchor = track.getBoundingClientRect().left + padLeft();
    const delta = panelEls[i].getBoundingClientRect().left - anchor;
    animateScrollTo(track.scrollLeft + delta);
  }

  onMount(() => {
    if (!browser || !track) return;
    track.addEventListener("scroll", onScroll, { passive: true });
    requestAnimationFrame(updateActive);
  });
  onDestroy(() => {
    if (browser && track) track.removeEventListener("scroll", onScroll);
    if (raf) cancelAnimationFrame(raf);
    if (scrollRaf) cancelAnimationFrame(scrollRaf);
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

  <SliderDock
    count={slides.length}
    {active}
    interval={5200}
    label="visuels du pôle"
    on:goto={(e) => goTo(e.detail)}
  />
</section>
{/if}

<style>
  .ms {
    background: transparent;
    padding: clamp(2rem, 4vw, 4rem) 0 clamp(3rem, 6vw, 6rem);
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
    gap: clamp(1rem, 1.8vw, 1.6rem);
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

  @media (max-width: 768px) {
    .ms-track {
      grid-auto-columns: 86%;
    }
    .ms-media {
      aspect-ratio: 4 / 3;
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
