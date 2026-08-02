<script>
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import { browser } from "$app/environment";

  // Dock de pagination réutilisable (style Apple) : pilule de points (le point
  // actif s'allonge), + bouton play/pause qui devient « rejouer » à la fin.
  // Contrôlé : le parent passe `count` + `active` et écoute `goto`. Le dock gère
  // sa lecture auto (timer), son apparition et son sticky.
  export let count = 0;
  export let active = 0;
  export let interval = 4200;   // durée par slide en lecture auto (ms)
  export let loop = false;      // boucler ou s'arrêter (→ bouton « rejouer »)
  export let label = "diapositives";
  // true : dock épinglé (grandes sections). false : dock en flux, simplement
  // sous le slider (sections courtes → évite le conteneur 100lvh trop haut).
  export let sticky = true;
  // Force le mode « flux » sur mobile (où une section pleine hauteur laisserait
  // trop de vide), tout en gardant l'épinglage sur desktop.
  export let flowOnMobile = false;
  // Démarre la lecture automatique dès que le dock entre à l'écran (sauf
  // « mouvement réduit »). L'utilisateur garde la main via le bouton play/pause.
  export let autoplay = false;

  const dispatch = createEventDispatcher();

  let playing = false;
  let visible = false;          // apparition déclenchée
  let autoStarted = false;      // l'auto-lecture n'est armée qu'une fois
  let prefersReduced = false;
  let dockEl;
  let io;
  let timer = null;

  const clearTimer = () => { if (timer) { clearTimeout(timer); timer = null; } };

  function schedule() {
    clearTimer();
    if (!playing || count <= 1) return;
    timer = setTimeout(() => {
      if (active >= count - 1) {
        if (loop) dispatch("goto", 0);
        else { playing = false; }        // fin → bouton « rejouer »
      } else {
        dispatch("goto", active + 1);
      }
    }, interval);
  }

  // À chaque changement de slide (ou d'état lecture), on relance le minuteur.
  $: (active, playing, count), browser && schedule();

  const atEnd = () => !loop && count > 1 && active >= count - 1;

  function togglePlay() {
    if (!playing && atEnd()) {
      dispatch("goto", 0);   // rejouer depuis le début
      playing = true;
    } else {
      playing = !playing;
    }
  }

  function goTo(i) {
    if (i === active) return;
    playing = false;         // navigation manuelle → on met en pause
    dispatch("goto", i);
  }

  onMount(() => {
    if (!browser || !dockEl) return;
    prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        visible = true;
        // Lecture auto par défaut : armée une seule fois, à la première apparition.
        if (autoplay && !autoStarted && !prefersReduced && count > 1) {
          autoStarted = true;
          playing = true;
        }
        io.disconnect();
      },
      { rootMargin: "0px 0px 14% 0px", threshold: 0.01 }
    );
    io.observe(dockEl);
  });

  onDestroy(() => { clearTimer(); io?.disconnect(); });
</script>

{#if count > 1}
<div class="sd-overlay" class:sd-overlay--flow={!sticky} class:sd-overlay--flow-mobile={flowOnMobile} aria-hidden="false">
  <div class="sd-sticky">
    <div class="sd-anchor">
      <div class="sd" class:is-in={visible} bind:this={dockEl} role="group" aria-label="Navigation {label}">
    <span class="sd__blob" aria-hidden="true"></span>
    <div class="sd__pill" role="tablist" aria-label={label}>
      {#each Array(count) as _, i}
        <button
          type="button"
          class="sd__dot"
          class:is-active={i === active}
          role="tab"
          aria-selected={i === active}
          aria-label="Diapositive {i + 1}"
          on:click={() => goTo(i)}
        ></button>
      {/each}
    </div>

    <button
      type="button"
      class="sd__pp"
      data-no-wipe
      on:click={togglePlay}
      aria-label={playing ? "Pause" : atEnd() ? "Rejouer" : "Lecture automatique"}
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
    </div>
  </div>
</div>
{/if}

<style>
  /* Le dock est ancré au bas d'un conteneur ÉPINGLÉ PAR LE HAUT (sticky top:0,
     hauteur 100lvh) : c'est stable (le haut du viewport ne bouge pas quand la
     barre Safari du bas se rétracte), contrairement à `sticky bottom`. L'overlay
     absolu couvre la section (qui doit être `position: relative`) sans affecter
     sa mise en page. */
  .sd-overlay {
    position: absolute;
    inset: 0;
    z-index: 30;
    pointer-events: none;
  }
  .sd-sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    height: 100lvh;
    pointer-events: none;
  }
  .sd-anchor {
    position: absolute;
    left: 0;
    right: 0;
    /* Décalage constant (--bar-inset) → reste au-dessus de la barre, sans unité
       qui varie avec sa rétractation. */
    bottom: calc(max(clamp(1.1rem, 4vw, 2rem), var(--safe-bottom-offset, 1rem)) + var(--bar-inset, 0px));
    display: flex;
    justify-content: center;
  }

  /* Mode « en flux » (sections courtes, ex. MediaSlider) : dock simplement posé
     sous le slider, centré, sans épinglage 100lvh → stable vs barre Safari. */
  .sd-overlay--flow {
    position: static;
    z-index: auto;
  }
  .sd-overlay--flow .sd-sticky {
    position: static;
    height: auto;
  }
  .sd-overlay--flow .sd-anchor {
    position: static;
    bottom: auto;
    margin: clamp(2rem, 5vw, 4rem) 0 clamp(0.5rem, 2vw, 1.4rem);
  }

  /* Mode flux forcé sur mobile (garde l'épinglage sur desktop). */
  @media (max-width: 768px) {
    .sd-overlay--flow-mobile {
      position: static;
      z-index: auto;
    }
    .sd-overlay--flow-mobile .sd-sticky {
      position: static;
      height: auto;
    }
    .sd-overlay--flow-mobile .sd-anchor {
      position: static;
      bottom: auto;
      margin: clamp(1.6rem, 5vw, 3rem) 0 clamp(0.4rem, 2vw, 1.2rem);
    }
  }

  .sd {
    position: relative;
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: clamp(0.6rem, 1.1vw, 0.9rem);
    isolation: isolate;
  }
  /* Apparition : un rond (centré) qui zoome à l'agrandissement, puis s'étale en
     pilule, puis disparaît pendant que les éléments apparaissent. */
  .sd__blob {
    position: absolute;
    inset: 0;
    z-index: 0;
    border-radius: 999px;
    transform-origin: center center;
    transform: scale(0.5) scaleX(0.2);
    opacity: 0;
    pointer-events: none;
  }
  .sd.is-in .sd__blob {
    animation: sd-blob 0.92s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
  }
  @keyframes sd-blob {
    0%   { opacity: 0; transform: scale(0.5) scaleX(0.2); filter: blur(12px); }
    38%  { opacity: 1; transform: scale(1)   scaleX(0.2); filter: blur(2px); }
    74%  { opacity: 1; transform: scale(1)   scaleX(1);   filter: blur(0); }
    100% { opacity: 0; transform: scale(1)   scaleX(1);   filter: blur(0); }
  }

  /* Verre dépoli — identique aux boutons du site. */
  .sd__pill,
  .sd__pp,
  .sd__blob {
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.08);
  }

  .sd__pill {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: clamp(0.6rem, 1.1vw, 0.9rem);
    height: clamp(2.9rem, 3.5vw, 3.5rem);
    padding: 0 clamp(1.05rem, 1.6vw, 1.4rem);
    border-radius: 999px;
    /* Le contenu (points) n'apparaît qu'après le blob. */
    opacity: 0;
  }
  .sd__pp {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: clamp(2.9rem, 3.5vw, 3.5rem);
    height: clamp(2.9rem, 3.5vw, 3.5rem);
    border: 0;
    border-radius: 999px;
    color: #f4efe6;
    font-size: clamp(1.15rem, 1.5vw, 1.4rem);
    cursor: pointer;
    opacity: 0;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .sd.is-in .sd__pill { animation: sd-fade 0.42s ease 0.6s forwards; }
  .sd.is-in .sd__pp   { animation: sd-fade 0.42s ease 0.68s forwards; }
  @keyframes sd-fade { to { opacity: 1; } }

  /* Aucun effet au survol/clic/focus sur le bouton play (ni contour, ni pop). */
  .sd__pp:hover,
  .sd__pp:active,
  .sd__pp:focus,
  .sd__pp:focus-visible {
    outline: none;
    transform: none;
  }
  .sd__pp svg { display: block; }

  /* Points : petits ronds ; le point actif s'allonge en pilule. */
  .sd__dot {
    width: clamp(7px, 0.95vw, 9px);
    height: clamp(7px, 0.95vw, 9px);
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
    .sd__dot:hover { background: rgba(255, 255, 255, 0.7); }
  }
  .sd__dot.is-active {
    width: clamp(24px, 3.4vw, 36px);
    background: #ffffff;
  }
  .sd__dot:focus-visible { outline: 2px solid var(--lead-blue, #5768ff); outline-offset: 3px; }

  /* Sur fond clair (thème light) : verre teinté sombre + points sombres. */
  :global(.project-theme-page.theme-light) .sd__pill,
  :global(.project-theme-page.theme-light) .sd__pp,
  :global(.project-theme-page.theme-light) .sd__blob,
  :global(.band-nuance-light) .sd__pill,
  :global(.band-nuance-light) .sd__pp,
  :global(.band-nuance-light) .sd__blob {
    background: rgba(20, 21, 26, 0.08);
  }
  :global(.project-theme-page.theme-light) .sd__pp,
  :global(.band-nuance-light) .sd__pp { color: #14151a; }
  :global(.project-theme-page.theme-light) .sd__dot,
  :global(.band-nuance-light) .sd__dot { background: rgba(20, 21, 26, 0.32); }
  :global(.project-theme-page.theme-light) .sd__dot.is-active,
  :global(.band-nuance-light) .sd__dot.is-active { background: #14151a; }

  @media (max-width: 768px) {
    .sd__pill,
    .sd__pp {
      backdrop-filter: blur(12px) saturate(130%);
      -webkit-backdrop-filter: blur(12px) saturate(130%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sd__blob { display: none; }
    .sd__pill, .sd__pp { opacity: 1; }
    .sd.is-in .sd__pill, .sd.is-in .sd__pp { animation: none; opacity: 1; }
    .sd__dot { transition: background 0.3s ease; }
  }
</style>
