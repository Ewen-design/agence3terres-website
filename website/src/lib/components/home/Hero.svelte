<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import AutoVideo from "$lib/components/shared/media/AutoVideo.svelte";
  import { videoSources } from "$lib/components/shared/media/videoSources.js";
  import {
    registerParallax,
    unregisterParallax,
    registerWrite,
    unregisterWrite,
    forceScrollEngineUpdate
  } from "$lib/scrollEngine.js";

  let heroSection;
  let heroStage;
  let afterTextEl;
  let heroMediaEl;
  let heroBrightEl;
  let heroDarkLayerEl;

  let h2TextEl;
  let textRevealed  = false;
  let textObserver;

  let introStarted = false;
  let introVisible = true;
  let heroMediaVisible = false;
  let titleVisible = false;
  let heroPosterHidden = false;
  let removeHeroPlayWatch;

  let fallbackTimeout;
  let mediaIntroTimeout;
  let titleIntroTimeout;
  let resizeObserver;
  let resizeTimer;

  let vh = 1;
  let isMobile = false;
  let heroTop = 0;
  let heroHeight = 1;
  let afterTextTop = 0;

  let pendingFrame = null;
  let dirty = false;

  let applied = {
    imageScale: -1,
    imageBrightness: -1,
    imageOpacity: -1,
    imageDark: -1
  };

  // Le texte est découpé en mots pour que chacun arrive séparément, comme dans
  // l'intro du site. `h` marque les passages mis en avant — la ponctuation
  // reste collée à son mot, sinon les blancs se dédoublent à la césure.
  const LEAD = [
    {t: "Nous"}, {t: "sommes"}, {t: "3", h: 1}, {t: "Terres,", h: 1},
    {t: "l\u2019agence"}, {t: "dans"}, {t: "l\u2019ombre"}, {t: "des"},
    {t: "projets"}, {t: "qui"}, {t: "durent."}, {t: "De"}, {t: "l\u2019identit\u00e9"},
    {t: "au"}, {t: "digital,"}, {t: "nous"}, {t: "fa\u00e7onnons"}, {t: "des"},
    {t: "marques"}, {t: "fortes,"}, {t: "pens\u00e9es"}, {t: "pour"},
    {t: "traverser", h: 1}, {t: "le", h: 1}, {t: "temps.", h: 1}
  ];

  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const q = (v, step) => Math.round(v / step) * step;

  function getScrollY() {
    return window.scrollY || window.pageYOffset || 0;
  }

  function getAbsoluteTop(el) {
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return rect.top + getScrollY();
  }

  function measureLayout() {
    vh = window.innerHeight || 1;
    isMobile = (window.innerWidth || 0) <= 640;
    heroTop = getAbsoluteTop(heroSection);
    heroHeight = Math.max(heroSection?.offsetHeight || 1, 1);
    afterTextTop = getAbsoluteTop(afterTextEl);
  }

  function getLocalRevealFromAbsolute(scrollY, absTop, startMul = 0.9, endMul = 0.2) {
    const topInViewport = absTop - scrollY;
    const start = vh * startMul;
    const end = vh * endMul;
    return clamp((start - topInViewport) / Math.max(start - end, 1), 0, 1);
  }

  function computeFrame(y) {
    if (!afterTextEl) return;

    const heroScrollable = Math.max(heroHeight - vh, 1);
    const imageFadeProgress = clamp((y - heroTop) / heroScrollable, 0, 1);
    const globalFade = imageFadeProgress * imageFadeProgress * (3 - 2 * imageFadeProgress);

    const localTextReveal = getLocalRevealFromAbsolute(y, afterTextTop, 0.92, 0.16);
    pendingFrame = {
      imageScale: q(lerp(1.05, 1.0, globalFade), 0.0001),
      imageBrightness: isMobile ? 1 : q(lerp(1, 0.62, globalFade), 0.001),
      imageOpacity: isMobile ? 1 : q(lerp(1, 0, globalFade), 0.001),
      imageDark: isMobile ? 0 : q(lerp(0.08, 0.62, globalFade), 0.001)
    };

    dirty = true;
  }

  function applyFrame() {
    if (!dirty || !pendingFrame) return;

    const f = pendingFrame;

    if (heroMediaEl) {
      if (
        f.imageScale !== applied.imageScale ||
        f.imageBrightness !== applied.imageBrightness ||
        f.imageOpacity !== applied.imageOpacity
      ) {
        heroMediaEl.style.transform = `scale(${f.imageScale})`;
        heroMediaEl.style.opacity = `${f.imageOpacity}`;
        // L'assombrissement passe par un voile noir, PAS par un filtre CSS sur
        // la balise <video> : en Safari, un filtre sort la vidéo du chemin de
        // composition matériel — d'où les gels, écrans noirs et images
        // fantômes après un redimensionnement ou un retour sur la page.
        // Un noir à l'opacité (1 - b) est l'exact équivalent de brightness(b).
        if (heroBrightEl) heroBrightEl.style.opacity = `${1 - f.imageBrightness}`;
        applied.imageScale = f.imageScale;
        applied.imageBrightness = f.imageBrightness;
        applied.imageOpacity = f.imageOpacity;
      }
    }

    if (heroDarkLayerEl && f.imageDark !== applied.imageDark) {
      heroDarkLayerEl.style.opacity = `${f.imageDark}`;
      applied.imageDark = f.imageDark;
    }

    dirty = false;
  }

  function handleParallax(y, ctx) {
    computeFrame(ctx?.motionY ?? y);
  }

  function handleWrite() {
    applyFrame();
  }

  function startIntro(withDelay = true) {
    if (introStarted) return;
    introStarted = true;

    if (typeof window !== "undefined") {
      window.__homeHeroIntroPlayed = true;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        introVisible = true;
        clearTimeout(mediaIntroTimeout);
        mediaIntroTimeout = setTimeout(() => {
          heroMediaVisible = true;
          clearTimeout(titleIntroTimeout);
          titleIntroTimeout = setTimeout(() => {
            titleVisible = true;
          }, 360);
        }, withDelay ? 120 : 0);
      });
    });
  }

  function shouldDelayIntroForSession() {
    if (typeof window === "undefined") return false;
    return !window.__homeHeroIntroPlayed;
  }

  // Le calque poster ne se retire pas sur `play` ni sur `playing` : ces
  // événements arrivent avant la première image décodée, et le retirer là
  // découvrirait la vidéo encore vide. On attend que le temps ait réellement
  // avancé — donc qu'une image soit à l'écran.
  function watchHeroPlayback(video) {
    if (!video || removeHeroPlayWatch) return;

    const onTick = () => {
      if (video.currentTime <= 0.04) return;
      heroPosterHidden = true;
      removeHeroPlayWatch?.();
    };

    video.addEventListener("timeupdate", onTick);
    removeHeroPlayWatch = () => {
      video.removeEventListener("timeupdate", onTick);
      removeHeroPlayWatch = null;
    };
    onTick();
  }

  $: if (browser && heroMediaEl) watchHeroPlayback(heroMediaEl);

  function scheduleResizeUpdate() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      measureLayout();
      forceScrollEngineUpdate();
    }, 70);
  }

  onMount(() => {
    if (!browser) return;

    let destroyed = false;
    const shouldDelayIntro = shouldDelayIntroForSession();

    const handlePreloaderReveal = () => {
      clearTimeout(fallbackTimeout);
      startIntro(false);
    };

    const handleWindowLoad = () => {
      measureLayout();
      forceScrollEngineUpdate();
    };

    const handlePageShow = () => {
      measureLayout();
      forceScrollEngineUpdate();
    };

    const boot = async () => {
      measureLayout();

      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch {}
      }

      if (destroyed) return;

      requestAnimationFrame(() => {
        measureLayout();
        requestAnimationFrame(() => {
          measureLayout();
          forceScrollEngineUpdate();
        });
      });
    };

    boot();

    registerParallax(handleParallax, { priority: 2 });
    registerWrite(handleWrite, { priority: 2 });

    // Word-by-word opacity reveal on scroll-into-view
    if (!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches && h2TextEl) {
      textObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) { textRevealed = true; textObserver.disconnect(); }
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0 }
      );
      textObserver.observe(h2TextEl);
    } else {
      textRevealed = true;
    }

    window.addEventListener("resize", scheduleResizeUpdate, { passive: true });
    window.addEventListener("orientationchange", scheduleResizeUpdate, { passive: true });
    window.addEventListener("load", handleWindowLoad);
    window.addEventListener("pageshow", handlePageShow);
    if (shouldDelayIntro) {
      window.addEventListener("preloader:content-reveal", handlePreloaderReveal);
      window.addEventListener("preloader:done", handlePreloaderReveal);
    }

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        scheduleResizeUpdate();
      });

      if (heroSection) resizeObserver.observe(heroSection);
      if (heroStage) resizeObserver.observe(heroStage);
      if (afterTextEl) resizeObserver.observe(afterTextEl);
    }

    if (shouldDelayIntro) {
      fallbackTimeout = setTimeout(() => {
        startIntro(true);
      }, document.getElementById("site-intro-loader") ? 8000 : 1800);
    } else {
      startIntro(false);
    }

    return () => {
      destroyed = true;
      unregisterParallax(handleParallax);
      unregisterWrite(handleWrite);
      window.removeEventListener("resize", scheduleResizeUpdate);
      window.removeEventListener("orientationchange", scheduleResizeUpdate);
      window.removeEventListener("load", handleWindowLoad);
      window.removeEventListener("pageshow", handlePageShow);
      if (shouldDelayIntro) {
        window.removeEventListener("preloader:content-reveal", handlePreloaderReveal);
        window.removeEventListener("preloader:done", handlePreloaderReveal);
      }
      clearTimeout(fallbackTimeout);
      clearTimeout(mediaIntroTimeout);
      clearTimeout(titleIntroTimeout);
      clearTimeout(resizeTimer);
      resizeObserver?.disconnect();
      textObserver?.disconnect();
      removeHeroPlayWatch?.();
    };
  });
</script>

<!-- Les deux renditions n'ont pas le même cadrage : chacune a donc son poster,
     et c'est `media` qui décide — un seul des deux fichiers est téléchargé.
     C'est la première image du hero, et donc le LCP de la home, d'où la
     priorité haute. Le poster n'est pas dans l'attribut `poster` du HTML
     prérendu : celui-ci est unique et imposerait le cadrage desktop aux
     téléphones (voir AutoVideo). -->
<svelte:head>
  <link
    rel="preload"
    as="image"
    href="/videos/home-hero-reel-poster.webp"
    media="(min-width: 641px)"
    fetchpriority="high"
  />
  <link
    rel="preload"
    as="image"
    href="/videos/home-hero-reel-mobile-poster.webp"
    media="(max-width: 640px)"
    fetchpriority="high"
  />
</svelte:head>

<section class="hero-join-clean" bind:this={heroSection}>
  <section class="hero-stage">
    <div class="hero-media-sticky" aria-hidden="true">
      <div class="hero-media" class:media-visible={heroMediaVisible} bind:this={heroStage}>
        <!-- Bande-annonce de fond : un seul fichier qui boucle, montage des 5
             plans du dossier /videos/ suivi de la carte signature (voir
             media-source/encode-home-hero-reel.sh). Tout le séquençage est cuit
             dans le média : rien à synchroniser en JS, donc rien qui puisse
             décrocher. `eager` car on est au-dessus de la ligne de flottaison,
             et le poster (photogramme 0 du montage) tient le cadre tant que la
             lecture n'a pas démarré. -->
        <AutoVideo
          bind:element={heroMediaEl}
          sources={videoSources("home-hero-reel")}
          mobileSources={videoSources("home-hero-reel-mobile")}
          poster="/videos/home-hero-reel-poster.webp"
          mobilePoster="/videos/home-hero-reel-mobile-poster.webp"
          eager
        />
        <!-- Le poster, en couche AU-DESSUS de la vidéo, retiré à la première
             image réellement affichée.
             En mode économie d'énergie, Safari iOS refuse le démarrage
             automatique et pose un gros bouton de lecture sur la vidéo. Ce
             bouton n'est pas stylable : `::-webkit-media-controls-start-playback-button`
             ne le masque plus. Un calque par-dessus, lui, le cache toujours —
             et il n'a rien de superflu, puisqu'il montre exactement l'image que
             la vidéo va afficher. La lecture démarre alors au premier geste
             (voir AutoVideo), et le calque s'efface à ce moment-là. -->
        <div class="hero-poster" class:is-hidden={heroPosterHidden} aria-hidden="true"></div>
        <div class="hero-brightness-veil" bind:this={heroBrightEl} aria-hidden="true"></div>
        <div class="hero-dark-layer" bind:this={heroDarkLayerEl}></div>
        <div class="hero-bottom-veil" aria-hidden="true"></div>
      </div>
    </div>

    <div class="hero-stage-content">
      <div class="hero-scroll-cue" class:intro-visible={introVisible} class:title-visible={titleVisible} aria-hidden="true">
        <span class="hero-scroll-arrow">↓</span>
      </div>
    </div>
  </section>

  <section class="after-section">
    <div class="after-grid">
      <div class="after-text" bind:this={afterTextEl}>
        <h2
          class="after-lead"
          bind:this={h2TextEl}
          class:is-text-revealed={textRevealed}
        >{#each LEAD as w, i}<span class="lead-word" class:hl={w.h} style="--i:{i}"
            >{w.t}</span>{" "}{/each}</h2>
      </div>
    </div>
  </section>

  <div class="hero-scroll-cue-mobile" class:title-visible={titleVisible} aria-hidden="true">
    <span class="hero-scroll-arrow">↓</span>
  </div>
</section>

<style>
  .hero-join-clean {
    position: relative;
    width: 100%;
    background: #000;
    color: #f4efe6;
    overflow: clip;
  }

  .hero-stage {
    position: relative;
    min-height: 132svh;
    z-index: 0;
  }

  .hero-media-sticky {
    position: sticky;
    top: 0;
    height: var(--viewport-height);
    margin-bottom: calc(-1 * var(--viewport-height));
    z-index: 0;
    pointer-events: none;
  }

  .hero-media {
    position: absolute;
    inset: 0;
    height: var(--viewport-height);
    background: #000;
    opacity: 0;
    /* Gentle zoom-in on arrival (settles together with the fade-in). */
    transform: translateZ(0) scale(1.07);
    transition:
      opacity 760ms cubic-bezier(0.22, 1, 0.36, 1),
      transform 1800ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: opacity, transform;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .hero-media.media-visible {
    opacity: 1;
    transform: translateZ(0) scale(1);
  }

  .hero-media::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 22vh;
    height: 22svh;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.88) 0%,
      rgba(0, 0, 0, 0.58) 34%,
      rgba(0, 0, 0, 0.2) 68%,
      rgba(0, 0, 0, 0) 100%
    );
    pointer-events: none;
    z-index: 1;
  }

  /* `:global` car l'élément est rendu par AutoVideo. On ne redéclare surtout pas
     `object-fit` ici : AutoVideo le porte déjà (cover par défaut) avec la même
     spécificité, et l'ordre d'injection des styles entre composants n'est pas
     garanti — deux règles à égalité laisseraient le cadrage au hasard. */
  .hero-media :global(video) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    /* opacity / transform / brightness sont pilotés image par image par le
       moteur de scroll (voir applyFrame). Aucune transition CSS ici volontairement :
       une transition traînerait derrière le scroll et, pendant le dézoom d'arrivée
       du parent .hero-media, produirait un « zoom→dézoom » composite instable.
       Le dézoom d'arrivée est géré uniquement par le parent (one-shot) ; la vidéo
       se contente de suivre le scroll de façon nette. */
    opacity: 1;
    transform: scale(1.05);
    will-change: transform, opacity;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  /* Même cadrage que la vidéo (`cover`, même centre) : l'effacement du calque
     ne doit produire aucun glissement d'image. C'est un fond CSS et non un
     attribut `poster`, pour que `media` choisisse la bonne des deux renditions
     — un attribut est unique, il imposerait le cadrage desktop aux téléphones. */
  .hero-poster {
    position: absolute;
    inset: 0;
    background-image: url("/videos/home-hero-reel-poster.webp");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 1;
    transition: opacity 380ms ease;
    pointer-events: none;
  }

  .hero-poster.is-hidden {
    opacity: 0;
  }

  .hero-brightness-veil {
    position: absolute;
    inset: 0;
    background: #000;
    opacity: 0;
    pointer-events: none;
  }

  .hero-dark-layer {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(
        to top,
        rgba(0, 0, 0, 1) 0%,
        rgba(0, 0, 0, 0.96) 16%,
        rgba(0, 0, 0, 0.78) 34%,
        rgba(0, 0, 0, 0.42) 52%,
        rgba(0, 0, 0, 0.12) 66%,
        rgba(0, 0, 0, 0) 78%
      ),
      radial-gradient(
        circle at 50% 50%,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.03) 44%,
        rgba(0, 0, 0, 0.12) 72%,
        rgba(0, 0, 0, 0.34) 100%
      );
    pointer-events: none;
    opacity: 0.08;
    will-change: opacity;
  }

  /* Only used on mobile (see the max-width: 640px block). */
  .hero-bottom-veil {
    display: none;
  }

  .hero-stage-content {
    position: relative;
    min-height: 100svh;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }

  .hero-scroll-cue {
    position: absolute;
    left: clamp(1rem, 2vw, 1.8rem);
    bottom: max(clamp(1rem, 2.2vw, 1.6rem), var(--safe-bottom-offset));
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    gap: 0.45rem;
    color: #fff;
    z-index: 4;
    opacity: 1;
    transform: none;
  }

  .hero-scroll-cue-mobile {
    display: none;
  }

  .hero-scroll-arrow {
    display: block;
    font-family: "Inter", sans-serif;
    font-size: clamp(1.1rem, 1.1vw, 1.2rem);
    line-height: 1;
    font-weight: 300;
    color: #fff;
  }

  .after-section {
    position: relative;
    z-index: 3;
    background: transparent;
    padding: 22vh 0 28vh;
  }

  .after-grid {
    width: min(1400px, 92%);
    margin: 0 auto;
    display: block;
  }

  .after-text {
    will-change: transform, opacity;
    width: 100%;
    min-width: 0;
    opacity: 1;
    transform: none;
  }

  /* Même présentation que les textes des pages projet (ProjectBrief) :
     un paragraphe léger, aligné à gauche, sans trait ni découpe muted. */
  .after-text h2 {
    margin: 0;
    max-width: 24ch;
    font-family: "Inter", sans-serif;
    font-weight: 300;
    font-size: clamp(1.5rem, 2.5vw, 2.55rem);
    line-height: 1.18;
    letter-spacing: -0.025em;
    text-align: left;
    color: rgba(245, 241, 232, 0.5);
    text-wrap: pretty;
  }

  /* Arrivée mot par mot, reprise de l'intro du site : chaque mot se dépose en
     flou et traverse le violet profond puis l'indigo de la charte avant de
     rejoindre sa couleur définitive. Le dégradé de l'intro n'est PAS repris
     ici : il éteint le bas des lettres, ce qui gênerait la lecture sur un
     paragraphe de plusieurs lignes. */
  .lead-word {
    display: inline-block;
    opacity: 0;
    --lead-final: rgba(245, 241, 232, 0.5);
    will-change: opacity, filter, transform;
  }

  .lead-word.hl {
    --lead-final: #f4efe6;
  }

  @keyframes leadIn {
    0% {
      opacity: 0;
      filter: blur(12px);
      transform: translateY(0.24em);
      color: #17052f;
    }
    38% {
      color: #5768ff;
    }
    100% {
      opacity: 1;
      filter: blur(0);
      transform: translateY(0);
      color: var(--lead-final);
    }
  }

  .after-lead.is-text-revealed .lead-word {
    animation: leadIn 0.9s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    animation-delay: calc(var(--i) * 38ms);
  }

  @media (prefers-reduced-motion: reduce) {
    .lead-word {
      opacity: 1;
      color: var(--lead-final);
    }

    .after-lead.is-text-revealed .lead-word {
      animation: none;
    }
  }

  @media (max-width: 900px) {
    .after-grid {
      width: min(100%, 760px);
      padding-inline: var(--project-side-padding, 0.8rem);
      box-sizing: border-box;
    }

    .after-text h2 {
      font-size: clamp(1.5rem, 6.6vw, 2rem);
      max-width: 26ch;
      line-height: 1.2;
    }
  }

  @media (max-width: 640px) {
    .hero-media::after {
      display: none;
    }

    .hero-media :global(video),
    .hero-poster,
    .hero-dark-layer {
      inset: 0 0 -12svh 0;
      height: calc(100% + 12svh);
    }

    .hero-poster {
      background-image: url("/videos/home-hero-reel-mobile-poster.webp");
    }

    .hero-dark-layer {
      background: none;
      opacity: 0 !important;
    }

    /* Solid-black bottom veil for the home hero on mobile. The shared hero
       gradients only half-cover the lower edge here (leaving the pinned image
       faintly visible as a line/strip in the svh↔lvh overscan zone); this veil
       guarantees a clean black base that fades up, killing that seam. It spans
       down past the image's -12svh extension so no strip is ever exposed. */
    .hero-bottom-veil {
      display: block;
      position: absolute;
      left: 0;
      right: 0;
      bottom: -12svh;
      height: 48svh;
      background: linear-gradient(
        to top,
        #000 0%,
        #000 28%,
        rgba(0, 0, 0, 0.92) 44%,
        rgba(0, 0, 0, 0.6) 62%,
        rgba(0, 0, 0, 0.28) 80%,
        rgba(0, 0, 0, 0) 100%
      );
      z-index: 1;
      pointer-events: none;
    }

    .hero-scroll-cue {
      display: none;
    }

    .hero-scroll-cue-mobile {
      position: absolute;
      left: 1rem;
      top: calc(100svh - max(4.8rem, calc(var(--safe-bottom-offset) + 4rem)));
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-end;
      gap: 0.42rem;
      color: #fff;
      z-index: 20;
      pointer-events: none;
    }

    .hero-scroll-arrow {
      font-size: 1.05rem;
    }

    .after-section {
      padding: 26vh 0 28vh;
      background: #000;
    }

    .after-section::before {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: -48rem;
      height: 48rem;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.01) 16%,
        rgba(0, 0, 0, 0.03) 32%,
        rgba(0, 0, 0, 0.08) 48%,
        rgba(0, 0, 0, 0.18) 64%,
        rgba(0, 0, 0, 0.38) 78%,
        rgba(0, 0, 0, 0.68) 90%,
        rgba(0, 0, 0, 0.92) 97%,
        rgba(0, 0, 0, 1) 100%
      );
      pointer-events: none;
      z-index: 0;
    }

    .after-grid {
      width: min(100%, 520px);
      padding-inline: var(--project-side-padding, 0.8rem);
      box-sizing: border-box;
      margin-top: -3rem;
      position: relative;
      z-index: 1;
    }

    .after-text {
      width: 100%;
      justify-self: start;
    }

    .after-text h2 {
      max-width: 26ch;
      font-size: clamp(1.4rem, 6.6vw, 1.9rem);
      line-height: 1.2;
      padding-inline: var(--project-text-inset, 0);
    }

    .after-text {
      transition: none !important;
      animation: none !important;
      filter: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-media :global(video),
    .hero-scroll-cue,
    .after-text {
      transition: none !important;
      animation: none !important;
      filter: none !important;
      opacity: 1 !important;
      -webkit-mask-image: none !important;
      mask-image: none !important;
      transform: none !important;
    }

    .after-text h2 {
      transition: none !important;
      opacity: 1 !important;
      filter: none !important;
      transform: none !important;
    }

    .hero-dark-layer {
      opacity: 0.22 !important;
    }
  }
</style>
