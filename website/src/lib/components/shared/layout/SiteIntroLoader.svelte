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

  const SHOT_A_MS = 3600;   // plan 3D, tenu à partir du DÉBUT RÉEL de la lecture
  const TEXT_MS = 2300;     // phrase (arrivée + tenue)
  const PLAY_START_MS = 2500;   // lecture acceptée mais qui ne démarre pas : on renonce
  const FALLBACK_LOAD_MS = 2500; // idem pour le chargement de l'image animée
  const SAFETY_MS = 12000;  // filet : l'intro se termine quoi qu'il arrive

  let visible = true;
  let hidden = false;
  let backgroundVisible = true;
  let phase = "a";          // "a" | "text"
  let textVisible = false;
  let textClearing = false;
  let finished = false;

  let videoA;
  let reduceMotion = false;
  // Repli quand le navigateur refuse la lecture (voir runSequence) : le plan
  // rejoué en image animée. Rendu par `{#if}`, donc jamais téléchargé tant
  // qu'on n'en a pas besoin.
  let useFallback = false;
  let fallbackImg;

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

  /**
   * Réaffirme en JS les propriétés dont dépend l'autoplay mobile.
   *
   * Les attributs `muted` / `playsinline` ne suffisent pas : le contenu de
   * `muted` n'alimente que `defaultMuted`, et la propriété `muted` n'en hérite
   * qu'à la CRÉATION de l'élément. Un élément repris à l'hydratation, ou
   * restauré depuis le bfcache, peut donc porter l'attribut sans être muet —
   * et iOS refuse alors l'autoplay d'une vidéo qui a une piste audio.
   */
  function armVideo(video) {
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "true");
  }

  /**
   * Attend que la lecture DÉMARRE VRAIMENT, sans jamais bloquer plus que le
   * délai. On ne guette surtout pas `canplaythrough` : sur mobile il n'arrive
   * souvent jamais (le préchargement y est bridé), et attendre un événement
   * qui ne vient pas revenait à jouer le plan sur un écran noir.
   */
  function whenPlaying(video, timeout) {
    return new Promise((resolve) => {
      if (!video) return resolve(false);
      if (!video.paused && video.readyState >= 2 && video.currentTime > 0) return resolve(true);

      let settled = false;
      const done = (ok) => {
        if (settled) return;
        settled = true;
        video.removeEventListener("playing", onPlaying);
        video.removeEventListener("timeupdate", onTick);
        video.removeEventListener("error", onError);
        resolve(ok);
      };
      const onPlaying = () => done(true);
      const onTick = () => {
        if (video.currentTime > 0) done(true);
      };
      const onError = () => done(false);

      video.addEventListener("playing", onPlaying);
      video.addEventListener("timeupdate", onTick);
      video.addEventListener("error", onError);
      later(() => done(false), timeout);
    });
  }

  async function play(video) {
    if (!video) return false;
    armVideo(video);
    try {
      // Surtout PAS de `currentTime = 0` ici : avant que les métadonnées ne
      // soient là, l'affectation lève une InvalidStateError — et le play() qui
      // suivait n'était alors jamais appelé. C'est ce qui laissait l'intro sur
      // un écran noir sur mobile, où le décodage arrive toujours plus tard.
      await video.play();
      return true;
    } catch (error) {
      // Un AbortError ne dit pas que la lecture est refusée : il dit qu'un
      // load() ou l'attribut `autoplay` a pris la main entre-temps. On laisse
      // sa chance à la lecture. Toute autre erreur (NotAllowedError) est un
      // vrai refus de politique.
      return error?.name === "AbortError";
    }
  }

  /**
   * Rejoue le plan sans vidéo, quand la lecture est refusée.
   *
   * En mode économie d'énergie, Safari iOS refuse le démarrage automatique de
   * TOUTE vidéo, même muette et sans piste audio — et affiche un bouton de
   * lecture par-dessus. C'est une décision d'Apple, aucun attribut ni aucune
   * règle CSS ne l'outrepasse.
   *
   * ── Une image FIXE, animée en CSS, et non une image animée ───────────────
   * Le plan est un gros plan sur les arêtes chromées du prisme : des bords
   * DROITS sur du noir, le pire cas pour un codec avec perte. Une première
   * version en WebP animé sortait des macroblocs très visibles sur ces arêtes
   * — un codec d'image n'a pas de filtre anti-blocs, contrairement à un codec
   * vidéo. Monter la définition n'y changeait rien : à 1024 px le fichier
   * pesait 500 Ko et bloquait toujours.
   *
   * Or le mouvement du plan est minuscule : mesuré, le sujet dérive de 3 % et
   * change d'échelle de 2 % sur toute sa durée. Une image fixe à laquelle on
   * applique la même dérive en CSS est donc indiscernable de l'original — et
   * elle est nette, puisqu'elle est rendue depuis la composition 3D à trois
   * fois la définition de sortie. 30 Ko au lieu de 500, sans un seul bloc.
   *
   * Elle n'est demandée qu'ici : les navigateurs qui lisent la vidéo ne la
   * téléchargent jamais.
   */
  function startFallbackShot() {
    // Le fichier est recadré sur la zone qu'un téléphone montre réellement du
    // plan carré. Sur un écran large il faudrait l'agrandir démesurément : là,
    // mieux vaut enchaîner directement sur la phrase.
    if (window.innerHeight < window.innerWidth) return Promise.resolve(false);

    useFallback = true;
    return new Promise((resolve) => {
      let settled = false;
      const done = (ok) => {
        if (settled) return;
        settled = true;
        resolve(ok);
      };
      later(() => done(false), FALLBACK_LOAD_MS);
      // L'élément n'existe qu'après le prochain rendu.
      requestAnimationFrame(() => {
        if (!fallbackImg) return;
        if (fallbackImg.complete && fallbackImg.naturalWidth) return done(true);
        fallbackImg.addEventListener("load", () => done(true), { once: true });
        fallbackImg.addEventListener("error", () => done(false), { once: true });
      });
    });
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
    // On lance la lecture tout de suite — `play()` sur une vidéo pas encore
    // décodée est parfaitement légal, elle démarre dès qu'elle le peut — puis
    // on compte les 3,6 s À PARTIR DU DÉBUT RÉEL. Le plan est donc vu en
    // entier, que le décodage prenne 50 ms ou 1 s.
    phase = "a";
    const accepted = await play(videoA);
    // Refus net : on ne perd pas une seconde à attendre un démarrage qui
    // n'arrivera pas, on bascule tout de suite sur l'image animée.
    let rolling = accepted && (await whenPlaying(videoA, PLAY_START_MS));
    if (finished) return;

    let seen = 0;
    if (rolling) {
      // On tient jusqu'à la 3,6ᵉ seconde DU PLAN, pas 3,6 s à partir d'ici :
      // l'attribut `autoplay` peut avoir démarré la vidéo bien avant que ce
      // code ne tourne, et un délai fixe dépasserait alors la fin du fichier —
      // la coupe se ferait sur une image figée.
      seen = videoA?.currentTime ? videoA.currentTime * 1000 : 0;
    } else {
      rolling = await startFallbackShot();
      if (finished) return;
    }

    if (rolling) {
      await new Promise((r) => later(r, Math.max(0, SHOT_A_MS - seen)));
      if (finished) return;
    }
    // Ni vidéo ni image : on enchaîne sur la phrase sans attendre. Mieux vaut
    // une intro plus courte qu'un écran noir tenu pendant tout le plan.

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
    armVideo(videoA);
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
    <!-- Plan 3D, en mouvement très lent.
         `autoplay` en plus du play() piloté : le navigateur démarre alors le
         plan dès qu'il en est capable, sans attendre l'hydratation. Les deux
         voies visent le même résultat, la première qui aboutit gagne. -->
    <video
      bind:this={videoA}
      class="intro-shot"
      class:is-live={phase === "a" && !useFallback}
      src="/videos/intro-logo-1.mp4"
      autoplay
      muted
      playsinline
      webkit-playsinline="true"
      preload="auto"
      disablepictureinpicture
      disableremoteplayback
    ></video>

    <!-- Le même plan, en image animée, pour les navigateurs qui refusent la
         lecture automatique. Posé APRÈS la vidéo pour passer devant elle. -->
    {#if useFallback}
      <img
        bind:this={fallbackImg}
        class="intro-shot intro-shot-still"
        class:is-live={phase === "a"}
        src="/images/intro-logo-plan.webp"
        alt=""
        decoding="async"
        fetchpriority="high"
      />
    {/if}

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

  /* Le repli : une image fixe à laquelle on rend son mouvement. Les valeurs
     reprennent celles mesurées sur la vidéo — le sujet dérive vers le bas et
     recule très légèrement. `linear` parce qu'un travelling de caméra est à
     vitesse constante ; une courbe d'accélération se verrait. La durée dépasse
     celle du plan (3,6 s) pour que l'image ne se fige jamais à l'écran. */
  .intro-shot-still.is-live {
    animation:
      introStillIn 620ms ease both,
      introStillDrift 4200ms linear both;
  }

  @keyframes introStillIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes introStillDrift {
    from { transform: scale(1.06) translate3d(0.8%, -1.6%, 0); }
    to { transform: scale(1.02) translate3d(0, 1.2%, 0); }
  }

  /* iOS pose un gros bouton « lecture » sur toute vidéo en ligne qu'il n'a pas
     démarrée lui-même (mode économie d'énergie, notamment). Le plan est un
     décor : il ne doit jamais proposer de commande. */
  .intro-shot::-webkit-media-controls,
  .intro-shot::-webkit-media-controls-start-playback-button {
    display: none !important;
    -webkit-appearance: none;
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
