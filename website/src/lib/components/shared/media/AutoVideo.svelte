<script>
  /**
   * Vidéo décorative en autoplay, pensée pour être fiable partout
   * (Safari iOS inclus) plutôt que pour être riche en fonctionnalités.
   *
   * Règles d'autoplay respectées :
   *   - `muted` (posé aussi en propriété JS, l'attribut seul ne suffit pas
   *      quand l'élément est créé/hydraté par le framework)
   *   - `playsinline` sinon iOS bascule en lecteur plein écran
   *   - aucune piste audio dans les fichiers → jamais bloqué par la politique
   *     "media engagement" des navigateurs
   *
   * Chargement :
   *   Le `src` n'est JAMAIS dans le HTML prérendu. Il est posé en JS au bon
   *   moment. Ça donne quatre choses d'un coup :
   *     1. vrai lazy-load (rien ne part avant que la vidéo approche du viewport)
   *     2. choix desktop/mobile sans double téléchargement (un `<source media>`
   *        est ignoré par les navigateurs sur `<video>`, contrairement à `<picture>`)
   *     3. choix du codec par `canPlayType` plutôt que par l'ordre des `<source>`,
   *        avec repli automatique si le fichier retenu échoue à l'exécution
   *     4. rien ne se charge si l'utilisateur a demandé moins d'animations
   *   Le `poster` reste dans le HTML : il s'affiche immédiatement et sert de
   *   repli permanent si la lecture est refusée.
   */
  import { onMount } from "svelte";

  /**
   * Sources du plus léger au plus universel : `[{ src, type }]`, où `type`
   * porte la chaîne `codecs`. Voir `videoSources.js`.
   */
  export let sources = [];
  /** Rendition portrait, utilisée quand `mobileQuery` matche. */
  export let mobileSources = [];
  export let mobileQuery = "(max-width: 640px)";
  export let poster = "";
  /** Texte alternatif. Vide = média purement décoratif (masqué aux lecteurs d'écran). */
  export let label = "";
  /** true pour un média au-dessus de la ligne de flottaison (hero) : charge au montage. */
  export let eager = false;
  /**
   * Verrou de lecture tenu par le parent. À passer à `false` pour un média
   * présent dans le DOM mais pas réellement montré — une slide inactive d'un
   * carrousel, par exemple : elle reste « visible » pour l'IntersectionObserver
   * puisqu'une opacité nulle n'empêche pas l'intersection. Ne bloque que la
   * lecture, pas le chargement : le fichier reste prêt pour son tour.
   */
  export let active = true;
  export let objectFit = "cover";
  export let objectPosition = "center";
  /** Marge de pré-chargement autour du viewport. */
  export let rootMargin = "300px";
  /** Exposé pour que le parent puisse animer/mesurer l'élément. */
  export let element = null;

  let videoEl;
  let currentSrc = "";
  let inView = false;
  let reduceMotion = false;
  let gestureArmed = false;

  /** Sources retenues pour ce navigateur, dans l'ordre à essayer. */
  let candidates = [];
  let candidateIndex = 0;

  // Chien de garde. Safari peut laisser l'élément dans un état « ni en pause
  // ni en train d'avancer » après un redimensionnement, un retour sur la page
  // ou une recomposition de couche. On le détecte au temps qui ne bouge plus,
  // et on relance — d'abord par un simple play(), puis par un rechargement.
  let watchdog;
  let lastTime = -1;
  let stuckTicks = 0;

  $: element = videoEl;

  const GESTURE_EVENTS = ["pointerdown", "touchstart", "keydown", "wheel"];

  // On classe par réponse de canPlayType plutôt que de prendre bêtement la
  // première source : un navigateur qui répond "" pour l'AV1 saute directement
  // au H.264, et un "probably" passe devant un "maybe".
  function refreshCandidates() {
    if (!videoEl) return;

    const list =
      mobileSources.length && window.matchMedia(mobileQuery).matches ? mobileSources : sources;

    candidates = list
      .map((source, order) => {
        const verdict = videoEl.canPlayType(source.type || "video/mp4");
        return { ...source, order, rank: verdict === "probably" ? 0 : verdict === "maybe" ? 1 : 2 };
      })
      .filter((source) => source.rank < 2)
      .sort((a, b) => a.rank - b.rank || a.order - b.order);

    candidateIndex = 0;
  }

  function wantedSrc() {
    return candidates[candidateIndex]?.src || "";
  }

  // Le fichier retenu peut malgré tout échouer (décodeur absent alors que
  // canPlayType était optimiste, fichier manquant, réseau) : on descend d'un cran.
  function handleError() {
    if (candidateIndex >= candidates.length - 1) return;
    candidateIndex += 1;
    currentSrc = "";
    loadSource();
  }

  function loadSource() {
    if (!videoEl || reduceMotion) return;

    const next = wantedSrc();
    if (!next || next === currentSrc) return;

    // Un changement de rendition (rotation, redimensionnement) reprend là où on
    // en était : les deux rendus sont issus du même master, même durée.
    const resumeAt = currentSrc ? videoEl.currentTime : 0;

    currentSrc = next;
    videoEl.src = next;
    videoEl.load();

    if (resumeAt) {
      videoEl.addEventListener(
        "loadedmetadata",
        () => {
          if (Number.isFinite(videoEl.duration)) {
            videoEl.currentTime = resumeAt % videoEl.duration;
          }
        },
        { once: true }
      );
    }
  }

  function tryPlay() {
    if (!videoEl || reduceMotion || !currentSrc) return;

    // Certains navigateurs remettent `muted` à false en restaurant l'élément
    // depuis le bfcache : on le réaffirme avant chaque tentative.
    videoEl.muted = true;

    const attempt = videoEl.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.then(disarmGesture).catch((error) => {
        // AbortError = un load() a interrompu la lecture, `canplay` relancera.
        if (error?.name !== "AbortError") armGesture();
      });
    }
  }

  // iOS en mode économie d'énergie (et quelques navigateurs stricts) refusent
  // l'autoplay même muet. On relance alors à la première interaction, quelle
  // qu'elle soit — l'utilisateur n'a rien à cliquer volontairement.
  function onGesture() {
    disarmGesture();
    tryPlay();
  }

  function armGesture() {
    if (gestureArmed) return;
    gestureArmed = true;
    for (const type of GESTURE_EVENTS) {
      window.addEventListener(type, onGesture, { passive: true, once: true });
    }
  }

  function disarmGesture() {
    if (!gestureArmed) return;
    gestureArmed = false;
    for (const type of GESTURE_EVENTS) {
      window.removeEventListener(type, onGesture);
    }
  }

  function mayPlay() {
    return inView && active && !document.hidden && !reduceMotion;
  }

  function recover() {
    if (!videoEl || !mayPlay()) return;
    stuckTicks += 1;
    if (stuckTicks <= 2) {
      tryPlay();
      return;
    }
    // Toujours bloqué : on recharge la source en reprenant au même endroit.
    const at = Number.isFinite(videoEl.currentTime) ? videoEl.currentTime : 0;
    const src = currentSrc;
    currentSrc = "";
    if (src) {
      videoEl.src = src;
      videoEl.load();
      videoEl.addEventListener(
        "loadedmetadata",
        () => {
          if (Number.isFinite(videoEl.duration)) videoEl.currentTime = at % videoEl.duration;
          tryPlay();
        },
        { once: true }
      );
      currentSrc = src;
    }
    stuckTicks = 0;
  }

  function tick() {
    if (!videoEl || !mayPlay() || !currentSrc) {
      lastTime = -1;
      stuckTicks = 0;
      return;
    }
    if (videoEl.readyState < 2) return;
    const t = videoEl.currentTime;
    if (t === lastTime) recover();
    else stuckTicks = 0;
    lastTime = t;
  }

  function syncPlayback() {
    if (!videoEl) return;
    if (mayPlay()) {
      loadSource();
      tryPlay();
    } else if (!videoEl.paused) {
      videoEl.pause();
    }
  }

  // L'attribut `autoplay` est conservé comme filet : il démarre la lecture même
  // si un play() piloté en JS est refusé. Mais il démarre AUSSI de lui-même dès
  // que le src est posé, sans repasser par syncPlayback — donc une vidéo hors
  // tour (slide inactive) se mettrait à jouer. On revérifie à chaque démarrage.
  function enforceGate() {
    if (videoEl && !mayPlay()) videoEl.pause();
  }

  // Le parent peut basculer `active` à tout moment (changement de slide).
  let mounted = false;
  $: if (mounted) {
    void active;
    syncPlayback();
  }

  onMount(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileMedia = mobileSources.length ? window.matchMedia(mobileQuery) : null;

    reduceMotion = motionQuery.matches;
    refreshCandidates();

    const onMotionChange = () => {
      reduceMotion = motionQuery.matches;
      if (reduceMotion) {
        videoEl?.pause();
      } else {
        syncPlayback();
      }
    };

    // Franchir le point de rupture change de fichier ; hors de vue on se
    // contente d'oublier le src courant, il sera re-choisi au retour.
    const onBreakpointChange = () => {
      const wasLoaded = Boolean(currentSrc);
      refreshCandidates();
      if (!wasLoaded) return;
      if (inView) loadSource();
      else currentSrc = "";
    };

    const onVisibility = () => syncPlayback();
    const onPageShow = () => syncPlayback();

    // Un redimensionnement (passage plein écran → fenêtré) recompose la couche
    // vidéo : on réaffirme la lecture une fois le geste terminé.
    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        stuckTicks = 0;
        syncPlayback();
      }, 180);
    };

    // Deux seuils : on charge en avance (rootMargin), on ne joue qu'à l'écran.
    const loadObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            loadSource();
            loadObserver.disconnect();
          }
        }
      },
      { rootMargin }
    );

    const playObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) inView = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.01 }
    );

    if (eager) loadSource();
    else if (videoEl) loadObserver.observe(videoEl);

    if (videoEl) playObserver.observe(videoEl);
    mounted = true;

    motionQuery.addEventListener?.("change", onMotionChange);
    mobileMedia?.addEventListener?.("change", onBreakpointChange);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
    watchdog = window.setInterval(tick, 1200);

    return () => {
      mounted = false;
      loadObserver.disconnect();
      playObserver.disconnect();
      disarmGesture();
      motionQuery.removeEventListener?.("change", onMotionChange);
      mobileMedia?.removeEventListener?.("change", onBreakpointChange);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      clearTimeout(resizeTimer);
      clearInterval(watchdog);
    };
  });
</script>

<!-- svelte-ignore a11y-media-has-caption (aucune piste audio : rien à sous-titrer) -->
<video
  bind:this={videoEl}
  {poster}
  autoplay
  muted
  loop
  playsinline
  webkit-playsinline="true"
  preload="auto"
  disablepictureinpicture
  disableremoteplayback
  tabindex="-1"
  aria-hidden={label ? undefined : "true"}
  aria-label={label || undefined}
  role={label ? "img" : undefined}
  style={`--auto-video-fit:${objectFit};--auto-video-position:${objectPosition};`}
  on:canplay={syncPlayback}
  on:stalled={recover}
  on:emptied={syncPlayback}
  on:play={enforceGate}
  on:error={handleError}
></video>

<style>
  video {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: var(--auto-video-fit, cover);
    object-position: var(--auto-video-position, center);
    /* Le poster occupe déjà tout le cadre ; pas de fond propre pour laisser la
       couleur de section transparaître pendant le chargement. */
    background: transparent;
    pointer-events: none;
    /* Couche propre : évite que Safari recompose la vidéo avec ses voisins
       lors d'un redimensionnement. */
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
</style>
