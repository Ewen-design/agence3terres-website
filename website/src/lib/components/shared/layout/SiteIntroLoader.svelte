<script>
  import { onDestroy, onMount } from "svelte";

  // ---------------------------------------------------------------------------
  // Intro du site, en deux temps et sans transition entre eux :
  //   1. un plan 3D serré du logo, en mouvement très lent
  //   2. coupe franche → la phrase sur fond noir
  //
  // Le plan est une vidéo pré-rendue (carrée, recadrée en `cover`) : ~740 Ko,
  // contre plusieurs centaines de kilo-octets de moteur 3D qu'il faudrait
  // charger AVANT de pouvoir masquer le chargement. Un preloader ne doit pas
  // être ce qui ralentit la page.
  //
  // Le contrat d'événements avec le reste du site est inchangé :
  // preloader:header-reveal, preloader:content-reveal, preloader:done,
  // et l'écoute de header:intro-done.
  // ---------------------------------------------------------------------------

  const SHOT_A_MS = 3600;   // plan 3D
  const TEXT_MS = 2300;     // phrase (arrivée + tenue)
  const VIDEO_READY_TIMEOUT = 1200;   // au-delà, on démarre sans attendre
  const SAFETY_MS = 9000;   // filet : l'intro se termine quoi qu'il arrive

  let visible = true;
  let hidden = false;
  let backgroundVisible = true;
  let phase = "a";          // "a" | "text"
  let textVisible = false;
  let textClearing = false;
  let finished = false;

  let videoA;
  let reduceMotion = false;

  const timers = new Set();
  let removeHeaderIntroDone;
  let removeSkip;
  let contentRevealDispatched = false;
  let backgroundDoneTimer;
  // Le header est réveillé dès le début du plan 2 pour qu'il soit prêt quand
  // le site apparaît — mais son `header:intro-done` revient AVANT la fin de
  // notre séquence. Sans ce verrou, il couperait le plan 3D en cours.
  let sequenceComplete = false;

  const WORDS = ["Née", "pour", "créer."];

  function later(fn, ms) {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
    return id;
  }

  function clearTimers() {
    for (const id of timers) clearTimeout(id);
    timers.clear();
  }

  function dispatch(name) {
    window.dispatchEvent(new CustomEvent(name));
  }

  function lockViewport() {
    document.documentElement.classList.add("site-intro-active");
    document.body.classList.add("site-intro-active");
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  function unlockViewport() {
    document.documentElement.classList.remove("site-intro-active");
    document.body.classList.remove("site-intro-active");
  }

  /** Attend qu'une vidéo soit jouable, sans jamais bloquer plus que le délai. */
  function whenReady(video) {
    return new Promise((resolve) => {
      if (!video) return resolve(false);
      if (video.readyState >= 3) return resolve(true);

      let settled = false;
      const done = (ok) => {
        if (settled) return;
        settled = true;
        video.removeEventListener("canplaythrough", onReady);
        video.removeEventListener("error", onError);
        resolve(ok);
      };
      const onReady = () => done(true);
      const onError = () => done(false);

      video.addEventListener("canplaythrough", onReady, { once: true });
      video.addEventListener("error", onError, { once: true });
      later(() => done(false), VIDEO_READY_TIMEOUT);
    });
  }

  async function play(video) {
    if (!video) return false;
    try {
      video.currentTime = 0;
      await video.play();
      return true;
    } catch {
      // Lecture refusée (politique d'autoplay, économiseur de batterie…) :
      // on n'insiste pas, la séquence continue sur son minutage.
      return false;
    }
  }

  function hideBackground() {
    if (finished) return;
    finished = true;
    clearTimers();
    backgroundVisible = false;

    backgroundDoneTimer = window.setTimeout(() => {
      hidden = true;
      unlockViewport();
      dispatch("preloader:done");
      window.setTimeout(() => (visible = false), 40);
    }, reduceMotion ? 160 : 520);
  }

  function finishIntro() {
    if (!contentRevealDispatched) {
      contentRevealDispatched = true;
      dispatch("preloader:content-reveal");
    }
    requestAnimationFrame(hideBackground);
  }

  /** Sortie anticipée : clic, touche, ou geste. L'intro ne doit jamais piéger. */
  function skip() {
    if (finished) return;
    sequenceComplete = true;
    clearTimers();
    videoA?.pause?.();
    dispatch("preloader:header-reveal");
    finishIntro();
  }

  async function runSequence() {
    // --- 1. plan 3D ---------------------------------------------------------
    phase = "a";
    await whenReady(videoA);
    if (finished) return;
    await play(videoA);
    await new Promise((r) => later(r, SHOT_A_MS));
    if (finished) return;

    // --- 2. coupe franche vers la phrase ------------------------------------
    phase = "text";
    videoA?.pause?.();
    // Un tick avant d'armer l'animation, sinon l'état initial n'est pas
    // enregistré et les mots apparaissent d'un bloc.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => (textVisible = true));
    });
    dispatch("preloader:header-reveal");
    await new Promise((r) => later(r, TEXT_MS));
    if (finished) return;

    textClearing = true;
    sequenceComplete = true;
    finishIntro();
  }

  onMount(() => {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lockViewport();

    removeHeaderIntroDone = () => {};
    const onHeaderIntroDone = () => {
      if (sequenceComplete) finishIntro();
    };
    window.addEventListener("header:intro-done", onHeaderIntroDone, { once: true });
    removeHeaderIntroDone = () =>
      window.removeEventListener("header:intro-done", onHeaderIntroDone);

    const onSkip = (event) => {
      if (event.type === "keydown" && !["Escape", "Enter", " "].includes(event.key)) return;
      skip();
    };
    window.addEventListener("pointerdown", onSkip, { passive: true });
    window.addEventListener("keydown", onSkip);
    removeSkip = () => {
      window.removeEventListener("pointerdown", onSkip);
      window.removeEventListener("keydown", onSkip);
    };

    if (reduceMotion) {
      // Version courte : la phrase seule, sans mouvement.
      phase = "text";
      textVisible = true;
      dispatch("preloader:header-reveal");
      later(finishIntro, 900);
      return;
    }

    // Filet de sécurité : quoi qu'il arrive côté réseau ou décodage,
    // l'intro se termine.
    later(() => {
      if (!finished) {
        sequenceComplete = true;
        dispatch("preloader:header-reveal");
        finishIntro();
      }
    }, SAFETY_MS);

    runSequence();
  });

  onDestroy(() => {
    if (typeof window === "undefined") return;
    clearTimers();
    clearTimeout(backgroundDoneTimer);
    removeHeaderIntroDone?.();
    removeSkip?.();
    unlockViewport();
  });
</script>

{#if visible}
  <div
    id="site-intro-loader"
    class="site-intro-loader"
    class:is-hidden={hidden}
    class:background-visible={backgroundVisible}
    aria-hidden="true"
  >
    <!-- Plan 3D, en mouvement très lent -->
    <video
      bind:this={videoA}
      class="intro-shot"
      class:is-live={phase === "a"}
      src="/videos/intro-logo-1.mp4"
      muted
      playsinline
      preload="auto"
      disablepictureinpicture
    ></video>

    <!-- Phrase, sur fond noir, sans transition avec les plans -->
    <div class="intro-text-scene" class:is-live={phase === "text"}>
      <p class="intro-phrase" class:is-visible={textVisible} class:is-clearing={textClearing}>
        {#each WORDS as word, i}
          <span class="intro-word" style={`--i:${i}`}>
            <span class="intro-word-solid">{word}</span>
            <span class="intro-word-grad" aria-hidden="true">{word}</span>
          </span>
        {/each}
      </p>
    </div>
  </div>
{/if}

<style>
  :global(html.site-intro-active),
  :global(body.site-intro-active) {
    overflow: hidden !important;
    overscroll-behavior: none;
  }

  .site-intro-loader {
    position: fixed;
    inset: 0;
    z-index: 350000;
    background: #000;
    opacity: 0;
    pointer-events: auto;
    transition: opacity 520ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    overflow: hidden;
  }

  .site-intro-loader.background-visible {
    opacity: 1;
  }

  /* Les plans sont des carrés recadrés en `cover` : ils remplissent aussi bien
     un écran large qu'un écran de téléphone. Le sujet du second plan tient
     dans les 56 % centraux, seule zone commune aux deux recadrages. */
  .intro-shot {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    /* Coupe franche : aucune transition entre les plans et la phrase. */
    transition: none;
    pointer-events: none;
    background: #000;
  }

  .intro-shot.is-live {
    opacity: 1;
  }


  .intro-text-scene {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: clamp(1.2rem, 5vw, 3rem);
    background: #000;
    opacity: 0;
    transition: none;
  }

  .intro-text-scene.is-live {
    opacity: 1;
  }

  .intro-phrase {
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0 0.26em;
    font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
    font-weight: 600;
    font-size: clamp(1.35rem, 4.3vw, 3.15rem);
    line-height: 1.07;
    letter-spacing: -0.028em;
    text-align: center;
  }

  /* Chaque mot arrive séparément : flou qui se résout, opacité, remontée. */
  .intro-word {
    position: relative;
    display: inline-block;
    opacity: 0;
    filter: blur(16px);
    transform: translate3d(0, 0.2em, 0);
    transition:
      opacity 0.62s ease,
      filter 0.86s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.86s cubic-bezier(0.22, 0.61, 0.36, 1);
    will-change: opacity, filter, transform;
  }

  /* Couche pleine : traverse le violet profond puis l'indigo de la charte. */
  .intro-word-solid {
    display: inline-block;
    color: #17052f;
    transition: color 0.34s cubic-bezier(0.33, 0, 0.2, 1);
  }

  /* Couche finale : blanc en haut, lavande en bas, et l'alpha qui décroît
     pour que le bas des lettres se fonde dans le noir. */
  .intro-word-grad {
    position: absolute;
    inset: 0;
    display: inline-block;
    opacity: 0;
    background-image: linear-gradient(
      180deg,
      #ffffff 0%,
      #f6f8ff 22%,
      #dde4ff 48%,
      rgba(208, 219, 255, 0.94) 70%,
      rgba(208, 219, 255, 0.62) 88%,
      rgba(208, 219, 255, 0.36) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    transition: opacity 0.34s cubic-bezier(0.33, 0, 0.2, 1);
    pointer-events: none;
  }

  /* Décalage entre les mots : une vague, pas une énumération. */
  .intro-phrase.is-visible .intro-word {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
    transition-delay: calc(var(--i) * 110ms);
  }

  .intro-phrase.is-visible .intro-word-solid {
    color: #5768ff;
    transition-delay: calc(var(--i) * 110ms);
  }

  /* Le dégradé prend le relais une fois l'indigo atteint. */
  .intro-phrase.is-visible .intro-word-grad {
    opacity: 1;
    transition-delay: calc(var(--i) * 110ms + 300ms);
  }

  /* Sortie : tous les mots partent ensemble, en flou. */
  .intro-phrase.is-clearing .intro-word {
    opacity: 0;
    filter: blur(18px);
    transform: translate3d(0, -0.1em, 0);
    transition:
      opacity 0.34s ease,
      filter 0.42s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.42s cubic-bezier(0.22, 0.61, 0.36, 1);
    transition-delay: 0ms !important;
  }

  @media (prefers-reduced-motion: reduce) {
    .site-intro-loader {
      transition-duration: 160ms;
    }

    .intro-word,
    .intro-word-solid,
    .intro-word-grad {
      filter: none;
      transform: none;
      transition-duration: 160ms;
      transition-delay: 0ms !important;
    }

    .intro-phrase.is-visible .intro-word-grad {
      opacity: 1;
    }

    .intro-phrase.is-clearing .intro-word {
      filter: none;
      transform: none;
    }
  }
</style>
