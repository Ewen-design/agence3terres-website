<script>
  // ───────────────────────────────────────────────────────────────────────────
  //  ProjectQuoteVideo — le témoignage EN VIDÉO, dans la carte plein écran
  //  (2026-10-17, Lybra)
  //
  //  Monté par `ProjectQuoteCard` à la place du texte, quand la page est au
  //  repos sous le panneau. La vidéo est un selfie vertical (9:16) : elle
  //  prend toute la hauteur, dans le cadre des médias du site (marges,
  //  arrondis). En écran vertical, le cadre commence SOUS le header : la croix
  //  blanche se perdait sinon dans le ciel clair du haut de l'image, et pas de
  //  voile pour la sauver (retirés du site à la demande du client).
  //
  //  ⚠️ L'ÉLÉMENT <video> N'EST PAS CRÉÉ ICI. `ProjectQuote` le fabrique DANS
  //  le clic du « + » et y lance une lecture muette aussitôt mise en pause :
  //  c'est ce qui autorise Safari à lancer le SON trois secondes plus tard, à
  //  l'ouverture de la carte. Safari attache l'autorisation à l'élément qui a
  //  reçu le geste, et ne garde la trace du geste qu'environ une seconde — un
  //  <video> créé ici naîtrait sans autorisation, et la lecture avec le son
  //  serait refusée. Ici, on ne fait que l'adopter.
  //
  //  Si la lecture est quand même refusée (mode économie d'énergie d'iOS), le
  //  poster reste posé PAR-DESSUS la vidéo — il masque le bouton lecture natif
  //  de Safari, qu'aucun CSS ne cache — et le grand bouton attend le doigt.
  // ───────────────────────────────────────────────────────────────────────────
  import { onMount, onDestroy } from "svelte";
  import { revealBlock } from "$lib/actions/reveal.js";

  /** L'élément préparé (et autorisé) par `ProjectQuote`. */
  export let video;
  export let poster = "";
  /** La carte se referme : le son s'éteint en fondu, puis pause. */
  export let stopping = false;

  let paused = true;
  let ended = false;
  let muted = false;
  /** La lecture a réellement avancé : le poster peut s'effacer. */
  let started = false;
  /** Lecture refusée : le grand bouton attend un geste. */
  let blocked = false;
  /** Souris immobile pendant la lecture : la barre s'efface. */
  let idle = false;
  let duration = 0;
  let current = 0;

  let trackEl;
  let fillEl;
  let raf = 0;
  let idleTimer = 0;
  let seeking = false;
  let fading = false;
  const offs = [];

  // Une simple pause n'a que la barre (et l'image qu'on touche pour relancer).
  $: showBig = blocked || ended;
  $: if (stopping) fadeOut();

  // La vidéo rejoint le cadre, débarrassée du rangement hors champ où
  // `ProjectQuote` la tenait depuis le clic.
  function adopt(node) {
    video.removeAttribute("style");
    video.classList.add("pqv-media");
    node.appendChild(video);
    return {};
  }

  function on(type, fn) {
    video.addEventListener(type, fn);
    offs.push(() => video.removeEventListener(type, fn));
  }

  function paint() {
    const d = video.duration;
    const ratio = d > 0 ? Math.min(1, video.currentTime / d) : 0;
    if (fillEl) fillEl.style.transform = `scaleX(${ratio})`;
  }

  // La barre suit à chaque image : `timeupdate` ne tombe que 4 fois par
  // seconde, elle avancerait par à-coups.
  function startLoop() {
    cancelAnimationFrame(raf);
    const step = () => {
      paint();
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  function stopLoop() {
    cancelAnimationFrame(raf);
    raf = 0;
    paint();
  }

  function play() {
    if (video.ended) {
      try {
        video.currentTime = 0;
      } catch {}
    }
    const attempt = video.play();
    attempt
      ?.then(() => {
        blocked = false;
      })
      .catch(() => {
        blocked = true;
      });
  }

  function toggle() {
    if (video.paused || video.ended) play();
    else video.pause();
    wake();
  }

  function toggleMute() {
    video.muted = !video.muted;
    wake();
  }

  async function start() {
    // La lecture d'amorçage (muette, dans le clic) ne doit plus mettre en
    // pause : sa promesse peut se résoudre APRÈS ce démarrage-ci.
    video.dataset.live = "";
    try {
      video.currentTime = 0;
    } catch {}
    video.defaultMuted = false;
    video.muted = false;
    try {
      await video.play();
      blocked = false;
    } catch {
      blocked = true;
    }
  }

  function fadeOut() {
    if (fading || !video) return;
    fading = true;
    const from = video.volume;
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 320);
      // En lecture seule sur iOS : la pause tombe simplement à la fin.
      try {
        video.volume = from * (1 - k);
      } catch {}
      if (k < 1) requestAnimationFrame(step);
      else video.pause();
    };
    requestAnimationFrame(step);
  }

  function wake() {
    idle = false;
    clearTimeout(idleTimer);
    if (video && !video.paused) {
      idleTimer = setTimeout(() => {
        if (!video.paused && !seeking) idle = true;
      }, 2600);
    }
  }

  // ── La barre de progression : clic, glisser, flèches ─────────────────────
  function seekTo(time) {
    const d = video.duration;
    if (!(d > 0)) return;
    try {
      video.currentTime = Math.min(d, Math.max(0, time));
    } catch {}
    current = video.currentTime;
    ended = video.ended;
    paint();
  }

  function seekFromPointer(event) {
    const rect = trackEl.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    seekTo(ratio * video.duration);
  }

  function onTrackDown(event) {
    if (event.button != null && event.button !== 0) return;
    seeking = true;
    trackEl.setPointerCapture?.(event.pointerId);
    seekFromPointer(event);
    wake();
  }

  function onTrackMove(event) {
    if (seeking) seekFromPointer(event);
  }

  function onTrackUp() {
    seeking = false;
    wake();
  }

  function onTrackKey(event) {
    const steps = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 };
    if (event.key in steps) seekTo(video.currentTime + steps[event.key]);
    else if (event.key === "Home") seekTo(0);
    else if (event.key === "End") seekTo(video.duration);
    else return;
    event.preventDefault();
    wake();
  }

  // Espace et « m » au clavier, sauf quand un contrôle a le focus (il gère
  // déjà sa touche).
  function onKeyDown(event) {
    const target = event.target;
    if (target instanceof Element && target.closest("button, [role='slider'], a, input")) return;
    if (event.key === " " || event.key === "k") {
      event.preventDefault();
      toggle();
    } else if (event.key === "m") {
      toggleMute();
    }
  }

  function handleButtonMove(event) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    button.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    button.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  const fmt = (s) => {
    const t = Math.max(0, Math.floor(s || 0));
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
  };

  onMount(() => {
    on("play", () => {
      paused = false;
      ended = false;
      startLoop();
      wake();
    });
    on("pause", () => {
      paused = true;
      idle = false;
      stopLoop();
    });
    on("ended", () => {
      ended = true;
      paused = true;
      idle = false;
      stopLoop();
    });
    on("timeupdate", () => {
      current = video.currentTime;
      if (!started && !video.paused && video.currentTime > 0.04) started = true;
    });
    on("seeked", () => {
      ended = video.ended;
      paint();
    });
    on("volumechange", () => {
      muted = video.muted;
    });
    on("durationchange", () => {
      duration = video.duration || 0;
    });

    duration = video.duration || 0;
    muted = video.muted;
    start();
  });

  onDestroy(() => {
    offs.forEach((off) => off());
    cancelAnimationFrame(raf);
    clearTimeout(idleTimer);
    video?.pause();
  });
</script>

<svelte:window on:keydown={onKeyDown} />

<div class="pqv" class:is-idle={idle}>
  <div
    class="pqv__frame"
    role="group"
    aria-label="Lecteur vidéo"
    use:revealBlock={{ delay: 140 }}
    on:mousemove={wake}
  >
    <div class="pqv__media" use:adopt></div>

    {#if poster}
      <img class="pqv__poster" class:is-gone={started} src={poster} alt="" aria-hidden="true" draggable="false" />
    {/if}

    <!-- Toute l'image met en pause et relance ; au clavier, c'est le bouton de
         la barre (et Espace). -->
    <button
      class="pqv__surface"
      type="button"
      tabindex="-1"
      aria-label={paused ? "Lire" : "Mettre en pause"}
      data-no-wipe
      on:click={toggle}
    ></button>

    <button
      class="pqv__btn pqv__big"
      class:is-shown={showBig}
      type="button"
      tabindex={showBig ? 0 : -1}
      aria-hidden={!showBig}
      aria-label={ended ? "Revoir le témoignage" : "Lire le témoignage"}
      data-cursor="button"
      data-no-wipe
      on:click={play}
      on:mousemove={handleButtonMove}
    >
      {#if ended}
        <svg viewBox="0 0 24 24" aria-hidden="true" class="is-stroke"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" /><path d="M4.5 4.5v4h4" /></svg>
      {:else}
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.6v12.8a.8.8 0 0 0 1.2.7l10.2-6.4a.8.8 0 0 0 0-1.4L9.2 4.9a.8.8 0 0 0-1.2.7Z" /></svg>
      {/if}
    </button>

    <div class="pqv__bar">
      <button
        class="pqv__btn"
        type="button"
        aria-label={ended ? "Revoir" : paused ? "Lire" : "Mettre en pause"}
        data-cursor="button"
        data-no-wipe
        on:click={toggle}
        on:mousemove={handleButtonMove}
      >
        {#if ended}
          <svg viewBox="0 0 24 24" aria-hidden="true" class="is-stroke"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" /><path d="M4.5 4.5v4h4" /></svg>
        {:else if paused}
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.6v12.8a.8.8 0 0 0 1.2.7l10.2-6.4a.8.8 0 0 0 0-1.4L9.2 4.9a.8.8 0 0 0-1.2.7Z" /></svg>
        {:else}
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="3.6" height="14" rx="1" /><rect x="13.9" y="5" width="3.6" height="14" rx="1" /></svg>
        {/if}
      </button>

      <div
        class="pqv__track"
        role="slider"
        tabindex="0"
        aria-label="Position dans la vidéo"
        aria-valuemin="0"
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(current)}
        aria-valuetext={`${fmt(current)} sur ${fmt(duration)}`}
        bind:this={trackEl}
        on:pointerdown={onTrackDown}
        on:pointermove={onTrackMove}
        on:pointerup={onTrackUp}
        on:pointercancel={onTrackUp}
        on:keydown={onTrackKey}
      >
        <span class="pqv__rail"><span class="pqv__fill" bind:this={fillEl}></span></span>
      </div>

      <button
        class="pqv__btn"
        type="button"
        aria-label={muted ? "Activer le son" : "Couper le son"}
        data-cursor="button"
        data-no-wipe
        on:click={toggleMute}
        on:mousemove={handleButtonMove}
      >
        {#if muted}
          <svg viewBox="0 0 24 24" aria-hidden="true" class="is-stroke"><path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" class="is-filled" /><path d="m16 9.5 5 5M21 9.5l-5 5" /></svg>
        {:else}
          <svg viewBox="0 0 24 24" aria-hidden="true" class="is-stroke"><path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" class="is-filled" /><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.2 6.5a7.8 7.8 0 0 1 0 11" /></svg>
        {/if}
      </button>
    </div>
  </div>
</div>

<style>
  /* La zone de la vidéo : tout l'écran moins les marges du site. Conteneur de
     taille, pour que le cadre se cale sur la hauteur (unités `cq*`). */
  .pqv {
    --pqv-head: calc(1rem + 40px);
    position: absolute;
    inset: var(--site-inset);
    bottom: max(var(--site-inset), env(safe-area-inset-bottom, 0px));
    display: grid;
    place-items: center;
    container-type: size;
  }

  /* Écran vertical : le cadre serait sous la croix du header. Il commence
     sous lui (mêmes valeurs que `Header.svelte` : top 1rem / 0,85rem, 40 px). */
  @media (max-aspect-ratio: 5/4) {
    .pqv {
      top: calc(var(--pqv-head) + var(--site-inset));
    }
  }

  @media (max-width: 768px) {
    .pqv {
      --pqv-head: calc(0.85rem + 40px);
    }
  }

  /* Pleine hauteur, au format de la vidéo (9:16). Si la largeur manque
     (téléphone), le cadre se resserre et la vidéo est rognée sur les côtés —
     le visage est au centre. */
  .pqv__frame {
    position: relative;
    width: min(100cqw, 100cqh * 9 / 16);
    height: 100cqh;
    overflow: hidden;
    border-radius: var(--project-media-radius, 22px);
    background: #0d1014;
    --reveal-shift: 0px;
  }

  .pqv__media,
  .pqv__poster,
  .pqv__surface {
    position: absolute;
    inset: 0;
  }

  .pqv__media :global(.pqv-media) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 40%;
  }

  /* Filet pour les navigateurs où ce bouton se masque encore (voir
     `AutoVideo`) ; le poster par-dessus fait le reste. */
  .pqv__media :global(.pqv-media::-webkit-media-controls-start-playback-button) {
    display: none !important;
    -webkit-appearance: none;
  }

  .pqv__poster {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 40%;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .pqv__poster.is-gone {
    opacity: 0;
  }

  .pqv__surface {
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .pqv__surface:focus {
    outline: none;
  }

  /*  ── Les boutons ─────────────────────────────────────────────────────────
   *  Le verre du « + » qui ouvre la carte (`ProjectQuote`, `.pquote__more`) :
   *  blanc à 11 % sur un fond flouté, arrondi de 10 px, et le liseré qui suit
   *  le curseur au survol. Pas de balayage au clic (`data-no-wipe`) : ce sont
   *  des contrôles qu'on presse plusieurs fois de suite. */
  .pqv__btn {
    position: relative;
    z-index: 2;
    flex: none;
    display: inline-grid;
    place-items: center;
    width: 2.75rem;
    aspect-ratio: 1;
    padding: 0;
    border: 0;
    border-radius: 10px;
    color: #f7f2e8;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    box-shadow: 0 6px 8px rgba(var(--shade-rgb, 0, 0, 0), 0.04);
    -webkit-tap-highlight-color: transparent;
  }

  .pqv__btn svg {
    width: 17px;
    height: 17px;
    fill: currentColor;
  }

  .pqv__btn svg.is-stroke {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .pqv__btn svg .is-filled {
    fill: currentColor;
    stroke: none;
  }

  .pqv__btn::before,
  .pqv__btn::after {
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
  }

  .pqv__btn::before {
    background: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-strong) 0%,
      var(--site-glow-mid) 22%,
      var(--site-glow-soft) 45%,
      var(--site-glow-fade) 62%,
      transparent 78%
    );
    transition: opacity 0.25s ease;
  }

  .pqv__btn::after {
    background: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-ambient) 0%,
      var(--site-glow-outer) 42%,
      transparent 72%
    );
    filter: blur(2px);
    transition: opacity 0.25s ease;
  }

  @media (hover: hover) and (pointer: fine) {
    .pqv__btn:hover::before,
    .pqv__btn:hover::after {
      opacity: 1;
    }
  }

  .pqv__btn:focus-visible,
  .pqv__track:focus-visible {
    outline: 1px solid rgba(255, 255, 255, 0.6);
    outline-offset: 3px;
  }

  /* Le grand bouton : le gabarit exact du « + ». Seulement quand la lecture
     a été refusée, ou qu'elle est terminée. Centré en largeur mais posé sur le
     buste, pas au milieu : au milieu d'un selfie, il couvrait les yeux. */
  .pqv__big {
    position: absolute;
    top: 78%;
    left: 50%;
    width: clamp(3.15rem, 4vw, 3.9rem);
    margin: calc(clamp(3.15rem, 4vw, 3.9rem) / -2) 0 0 calc(clamp(3.15rem, 4vw, 3.9rem) / -2);
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.3s ease,
      visibility 0s linear 0.3s;
  }

  .pqv__big.is-shown {
    opacity: 1;
    visibility: visible;
    transition: opacity 0.3s ease;
  }

  .pqv__big svg {
    width: 20px;
    height: 20px;
  }

  /* ── La barre : lecture, progression, son ──────────────────────────────── */
  .pqv__bar {
    position: absolute;
    left: 0.75rem;
    right: 0.75rem;
    bottom: 0.75rem;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: opacity 0.4s ease;
  }

  @media (hover: hover) and (pointer: fine) {
    .pqv.is-idle .pqv__bar {
      opacity: 0;
    }
  }

  /* Zone de saisie haute (le doigt), trait fin au milieu. */
  .pqv__track {
    position: relative;
    flex: 1;
    height: 2.75rem;
    display: flex;
    align-items: center;
    cursor: pointer;
    touch-action: none;
    border-radius: 6px;
    outline: none;
  }

  .pqv__rail {
    position: relative;
    width: 100%;
    height: 3px;
    overflow: hidden;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.28);
  }

  .pqv__fill {
    position: absolute;
    inset: 0;
    background: #f7f2e8;
    transform: scaleX(0);
    transform-origin: left center;
  }

  /* Petit cadre (téléphone couché : ~200 px de large) : des contrôles plus
     serrés, sinon les deux boutons mangent la barre. */
  @container (max-height: 520px) {
    .pqv__bar {
      left: 0.5rem;
      right: 0.5rem;
      bottom: 0.5rem;
      gap: 0.5rem;
    }

    .pqv__bar .pqv__btn,
    .pqv__track {
      width: 2.25rem;
      height: 2.25rem;
    }

    .pqv__track {
      width: auto;
    }

    .pqv__btn svg {
      width: 15px;
      height: 15px;
    }
  }

  @media (max-width: 900px) {
    /* Le verre mobile du site, comme `.pquote__more`. */
    .pqv__btn {
      backdrop-filter: blur(12px) saturate(130%);
      -webkit-backdrop-filter: blur(12px) saturate(130%);
    }

    .pqv__big {
      width: 3.45rem;
      margin: -1.725rem 0 0 -1.725rem;
    }
  }
</style>
