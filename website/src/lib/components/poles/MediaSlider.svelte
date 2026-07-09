<script>
  import { reveal } from "$lib/actions/reveal.js";

  // Slider horizontal : grandes images, le texte EN DESSOUS de chaque image,
  // commandes rondes (← / →). Défilement par scroll-snap.
  export let title = "";
  export let slides = [];

  let track;

  function panelStep() {
    if (!track) return 0;
    const panel = track.querySelector(".ms-panel");
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
    return panel ? panel.getBoundingClientRect().width + gap : track.clientWidth * 0.6;
  }

  function move(dir) {
    if (!track) return;
    track.scrollBy({ left: dir * panelStep(), behavior: "smooth" });
  }

  // Glow qui suit la souris — même effet que les autres boutons du site.
  function handleMove(event) {
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }
</script>

{#if slides.length}
<section class="ms">
  <div class="ms-head" use:reveal>
    {#if title}<h3 class="ms-title">{title}</h3>{/if}
    {#if slides.length > 1}
      <div class="ms-ctrl">
        <button type="button" class="ms-round ms-round--prev" data-no-wipe on:click={() => move(-1)} on:mousemove={handleMove} aria-label="Précédent">
          <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="20" y1="12" x2="4" y2="12"/><polyline points="11 5 4 12 11 19"/></svg>
        </button>
        <button type="button" class="ms-round ms-round--next" data-no-wipe on:click={() => move(1)} on:mousemove={handleMove} aria-label="Suivant">
          <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="12" x2="20" y2="12"/><polyline points="13 5 20 12 13 19"/></svg>
        </button>
      </div>
    {/if}
  </div>

  <div class="ms-track" bind:this={track}>
    {#each slides as slide, i}
      <article class="ms-panel">
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

  .ms-ctrl {
    display: flex;
    gap: 0.6rem;
    flex: 0 0 auto;
  }

  /* Mêmes boutons que le reste du site : verre dépoli + bordure qui s'illumine. */
  .ms-round {
    position: relative;
    width: clamp(2.8rem, 3.6vw, 3.3rem);
    height: clamp(2.8rem, 3.6vw, 3.3rem);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
    border: 0;
    border-radius: 999px;
    color: #f4efe6;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition:
      background 0.3s ease,
      color var(--project-theme-transition, 920ms cubic-bezier(0.16, 1, 0.3, 1)),
      transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .ms-round:hover { background: rgba(255, 255, 255, 0.18); }
  .ms-round--prev:hover { transform: translateX(-2px); }
  .ms-round--next:hover { transform: translateX(2px); }
  .ms-round:focus-visible { outline: 2px solid var(--lead-blue, #5768ff); outline-offset: 3px; }

  /* Glow border (mask) qui suit la souris — identique aux boutons du site. */
  .ms-round::before,
  .ms-round::after {
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
  .ms-round::before {
    background: radial-gradient(
      64px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-strong) 0%,
      var(--site-glow-mid) 22%,
      var(--site-glow-soft) 45%,
      var(--site-glow-fade) 62%,
      transparent 78%
    );
  }
  .ms-round::after {
    background: radial-gradient(
      74px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-ambient) 0%,
      var(--site-glow-outer) 42%,
      transparent 72%
    );
    filter: blur(2px);
  }
  .ms-round:hover::before,
  .ms-round:hover::after { opacity: 1; }

  /* Sur fond blanc (pôle Conseil) : verre teinté sombre pour rester lisible. */
  :global(.project-theme-page.theme-light) .ms-round {
    color: #14151a;
    background: rgba(20, 21, 26, 0.06);
  }
  :global(.project-theme-page.theme-light) .ms-round:hover {
    background: rgba(20, 21, 26, 0.1);
  }

  @media (max-width: 768px) {
    .ms-round {
      backdrop-filter: blur(12px) saturate(130%);
      -webkit-backdrop-filter: blur(12px) saturate(130%);
    }
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
