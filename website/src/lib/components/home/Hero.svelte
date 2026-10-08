<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import AutoVideo from "$lib/components/shared/media/AutoVideo.svelte";
  import { videoSources, videoPoster } from "$lib/components/shared/media/videoSources.js";
  import { heroFrame } from "$lib/actions/heroFrame.js";

  // ───────────────────────────────────────────────────────────────────────────
  //  Hero de la home — version simple (2026-09-01)
  //
  //  Un cadre d'une hauteur d'écran, aux marges et à l'arrondi du site, la
  //  bande-annonce dedans, l'accroche dans le coin bas gauche et le bouton de
  //  contact dans le coin bas droit. C'est tout.
  //
  //  Ce qui a disparu, et pourquoi : le média n'est plus ÉPINGLÉ sur une scène
  //  de 132svh, et il n'est plus assombri image par image au défilement. Tout
  //  cet appareillage (moteur de scroll, mesures de position, voiles pilotés en
  //  JS) tenait pour un hero qui se traversait ; il n'a plus lieu d'être pour un
  //  cadre qui tient dans un écran. Reste du JS : l'arrivée en fondu et le
  //  retrait du calque poster — deux choses que le CSS ne sait pas faire seul.
  // ───────────────────────────────────────────────────────────────────────────

  // ── Quelle coupe du reel est en ligne ────────────────────────────────────
  //  Les fichiers du reel gardent un nom stable d'un montage à l'autre, et
  //  c'est voulu (voir videoSources.js). Ce jeton est ce qui les distingue aux
  //  yeux du navigateur. Sans lui : on réencode, on revient sur la home par une
  //  navigation interne, et le poster de l'ANCIEN montage s'affiche un instant
  //  par-dessus la nouvelle vidéo — rien n'a été redemandé au serveur.
  //
  //  À CHANGER À CHAQUE PASSAGE DE media-source/encode-home-hero-reel.sh.
  const REEL_VERSION = "2026-10-02";

  // Le point de rupture desktop/portrait, écrit UNE seule fois et partagé avec
  // AutoVideo. Les deux doivent basculer au même pixel : le calque poster était
  // resté en CSS à 900px quand la vidéo bascule à 640px, si bien qu'entre les
  // deux le calque montrait le poster PORTRAIT au-dessus de la vidéo PAYSAGE —
  // et téléchargeait les deux posters au passage.
  const HERO_MOBILE_QUERY = "(max-width: 640px)";

  const REEL = { version: REEL_VERSION };
  const heroSources = videoSources("home-hero-reel", REEL);
  const heroMobileSources = videoSources("home-hero-reel-mobile", REEL);
  const heroPosterDesktop = videoPoster("home-hero-reel", REEL);
  const heroPosterMobile = videoPoster("home-hero-reel-mobile", REEL);

  let heroMediaEl;

  // Vide dans le HTML prérendu, posé au montage une fois la rendition connue.
  // Une image de fond écrite en dur serait téléchargée sur TOUS les formats, y
  // compris ceux qui ne la joueront jamais : c'est exactement la raison pour
  // laquelle AutoVideo retire aussi l'attribut `poster` du HTML prérendu.
  let heroPoster = "";

  let introStarted = false;
  let heroMediaVisible = false;
  let titleVisible = false;
  let heroPosterHidden = false;
  let removeHeroPlayWatch;

  let fallbackTimeout;
  let mediaIntroTimeout;
  let titleIntroTimeout;

  // Le halo du contour des boutons suit le curseur (comme dans le header).
  function handleButtonMove(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  function startIntro(withDelay = true) {
    if (introStarted) return;
    introStarted = true;

    if (typeof window !== "undefined") window.__homeHeroIntroPlayed = true;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
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

  onMount(() => {
    if (!browser) return;

    // Le calque poster suit la MÊME rendition que la vidéo, à tout moment :
    // franchir le point de rupture (rotation, redimensionnement) change les
    // deux ensemble, jamais l'un sans l'autre.
    const mobileMedia = window.matchMedia(HERO_MOBILE_QUERY);
    const syncHeroPoster = () => {
      heroPoster = mobileMedia.matches ? heroPosterMobile : heroPosterDesktop;
    };
    syncHeroPoster();
    mobileMedia.addEventListener?.("change", syncHeroPoster);

    const shouldDelayIntro = shouldDelayIntroForSession();

    const handlePreloaderReveal = () => {
      clearTimeout(fallbackTimeout);
      startIntro(false);
    };

    if (shouldDelayIntro) {
      window.addEventListener("preloader:content-reveal", handlePreloaderReveal);
      window.addEventListener("preloader:done", handlePreloaderReveal);
      fallbackTimeout = setTimeout(() => {
        startIntro(true);
      }, document.getElementById("site-intro-loader") ? 8000 : 1800);
    } else {
      startIntro(false);
    }

    return () => {
      mobileMedia.removeEventListener?.("change", syncHeroPoster);
      if (shouldDelayIntro) {
        window.removeEventListener("preloader:content-reveal", handlePreloaderReveal);
        window.removeEventListener("preloader:done", handlePreloaderReveal);
      }
      clearTimeout(fallbackTimeout);
      clearTimeout(mediaIntroTimeout);
      clearTimeout(titleIntroTimeout);
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
    href={heroPosterDesktop}
    media="(min-width: 641px)"
    fetchpriority="high"
  />
  <link
    rel="preload"
    as="image"
    href={heroPosterMobile}
    media="(max-width: 640px)"
    fetchpriority="high"
  />
</svelte:head>

<section class="hero" use:heroFrame>
  <div class="hero__frame">
    <div class="hero__media" class:media-visible={heroMediaVisible}>
      <!-- Bande-annonce de fond : un seul fichier qui boucle, montage des plans
           du dossier /videos/ (voir media-source/remotion-3terres). Tout le
           séquençage est cuit dans le média : rien à synchroniser en JS, donc
           rien qui puisse décrocher. `eager` car on est au-dessus de la ligne
           de flottaison, et le poster (photogramme 0 du montage) tient le cadre
           tant que la lecture n'a pas démarré. -->
      <AutoVideo
        bind:element={heroMediaEl}
        sources={heroSources}
        mobileSources={heroMobileSources}
        poster={heroPosterDesktop}
        mobilePoster={heroPosterMobile}
        mobileQuery={HERO_MOBILE_QUERY}
        eager
        posterLayer={false}
      />
      <!-- Le poster, en couche AU-DESSUS de la vidéo, retiré à la première
           image réellement affichée.
           En mode économie d'énergie, Safari iOS refuse le démarrage
           automatique et pose un gros bouton de lecture sur la vidéo. Ce bouton
           n'est pas stylable : un calque par-dessus, lui, le cache toujours —
           et il n'a rien de superflu, puisqu'il montre exactement l'image que la
           vidéo va afficher. -->
      <div
        class="hero__poster"
        class:is-hidden={heroPosterHidden}
        style:background-image={heroPoster ? `url("${heroPoster}")` : null}
        aria-hidden="true"
      ></div>
    </div>

    <div class="hero__veil" aria-hidden="true"></div>
  </div>

  <!-- Le bouton vit HORS du cadre : celui-ci est refermé par un `clip-path`,
       qui le rognerait. Cette couche est posée à la place qu'elle occupe cadre
       fermé, et elle n'en bouge plus. -->
  <div class="hero__ui">
    <a
      class="hero__cta nav-btn"
      class:is-in={titleVisible}
      href="/contact"
      data-cursor="button"
      data-sveltekit-preload-data="hover"
      on:mousemove={handleButtonMove}
    >
      <span class="nav-btn-flip" data-text="Nous contacter">
        <span class="nav-btn-text">Nous contacter</span>
      </span>
    </a>
  </div>
</section>
<style>
  /* ── Le cadre ─────────────────────────────────────────────────────────────
     Une hauteur d'écran, les marges et l'arrondi des blocs du site, et le fond
     sombre de la palette autour. */
  .hero {
    /* `--hero-t` : 0 en haut de page (plein écran), 1 une fois la marge et
       l'arrondi installés. Écrit image par image par le moteur de scroll. */
    --hero-t: 0;
    --hero-inset: var(--site-inset);
    --hero-radius: 22px;
    /* Sert au seul découpage du cadre. */
    --hero-cut: calc(var(--hero-inset) * var(--hero-t));

    position: relative;
    box-sizing: border-box;
    width: 100%;
    /* `svh` et jamais `vh` : sur iOS, `vh` se mesure sur l'écran SANS la barre
       d'outils, et le cadre déborderait par le bas tant qu'elle est affichée. */
    height: 100svh;
    background: var(--bg-deep, #050709);
    color: #f4efe6;
    overflow: clip;
  }

  /* Le cadre occupe TOUT l'écran ; c'est le découpage qui le referme. Un
     `clip-path` ne refait aucune mise en page — contrairement à une marge ou à
     une hauteur animées, qui redimensionneraient la vidéo à chaque image. */
  .hero__frame {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: var(--bg-deep, #000);
    clip-path: inset(var(--hero-cut) round calc(var(--hero-radius) * var(--hero-t)));
    /* C'est CETTE transition qui fait toute l'animation : `--hero-t` bascule de
       0 à 1 d'un coup, le navigateur mène le reste. Aucune mise en page n'est
       refaite — la vidéo garde sa taille et sa place, seul le découpage bouge. */
    transition: clip-path 820ms cubic-bezier(0.22, 1, 0.36, 1);
    /* Contexte isolé : la vidéo et son voile restent sous le contenu. */
    isolation: isolate;
  }

  /* La couche des textes est posée à la place qu'elle occupe CADRE FERMÉ, et
     elle n'en bouge plus : le cadre s'ouvre et se referme autour d'elle. */
  .hero__ui {
    position: absolute;
    inset: var(--hero-inset);
    z-index: 3;
    pointer-events: none;
  }

  .hero__media {
    position: absolute;
    inset: 0;
    z-index: 0;
    opacity: 0;
    /* Léger dézoom d'arrivée, qui se pose en même temps que le fondu. */
    transform: translateZ(0) scale(1.06);
    transition:
      opacity 760ms cubic-bezier(0.22, 1, 0.36, 1),
      transform 1800ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: opacity, transform;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .hero__media.media-visible {
    opacity: 1;
    transform: translateZ(0) scale(1);
  }

  /* `:global` car l'élément est rendu par AutoVideo. On ne redéclare surtout
     pas `object-fit` ici : AutoVideo le porte déjà (cover par défaut) avec la
     même spécificité, et l'ordre d'injection des styles entre composants n'est
     pas garanti — deux règles à égalité laisseraient le cadrage au hasard. */
  .hero__media :global(video) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }

  /* Même cadrage que la vidéo (`cover`, même centre) : l'effacement du calque
     ne doit produire aucun glissement d'image.
     L'IMAGE elle-même n'est pas ici, elle est posée en JS (voir `heroPoster`).
     Elle l'était en CSS, avec son propre point de rupture — qui avait dérivé de
     celui de la vidéo : entre 641 et 900px le calque montrait le poster
     portrait au-dessus de la vidéo paysage, et les deux fichiers partaient au
     téléchargement. Une seule décision, en JS, pour le calque comme pour la
     vidéo : ils ne peuvent plus se désaccorder. */
  .hero__poster {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 1;
    transition: opacity 380ms ease;
    pointer-events: none;
  }

  .hero__poster.is-hidden {
    opacity: 0;
  }

  /* Voile du bas : le bouton se pose sur des plans qui bougent, il lui faut un
     socle. Paliers rapprochés pour qu'aucune arête ne se voie. */
  /* Le voile est VIDE sur desktop, et c'est voulu (2026-09-02) : plus aucun
     assombrissement des bords, ni ici ni dans le layout — les deux vignettes
     fixes du site ont été retirées le même jour. Il ne reste qu'une bande
     basse, sur mobile seulement, plus bas dans ce fichier. L'élément est
     conservé : il porte cette bande, et il est le seul calque disponible entre
     la vidéo et l'interface si un besoin de contraste revient. */
  .hero__veil {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
  }

  /* ── Le bouton, coin bas droit ────────────────────────────────────────────
     C'est le bouton du menu du header, à l'identique : même verre, même
     arrondi, même bascule du libellé au survol. */
  /* À GAUCHE, sur tous les formats (2026-09-02 pour le desktop, qui l'avait à
     droite) : c'est le bord où commence la lecture, et sur téléphone c'est
     aussi le coin le plus loin du pouce. */
  .hero__cta {
    position: absolute;
    z-index: 3;
    left: clamp(1.1rem, 2.4vw, 2.6rem);
    bottom: clamp(1.1rem, 2.4vw, 2.6rem);
    /* Le gabarit du bouton du footer, pas celui du header : c'est l'appel à
       l'action principal de la page. */
    min-width: clamp(180px, 20vw, 260px);
    min-height: clamp(60px, 6.8vw, 78px);
    padding: 0 2rem;
    font-size: clamp(1.08rem, 1.5vw, 1.26rem);
    color: #fff;
    text-decoration: none;
    pointer-events: auto;
    opacity: 0;
    transition:
      opacity 900ms cubic-bezier(0.22, 1, 0.36, 1),
      color 220ms ease,
      transform 1.2s cubic-bezier(.22, .61, .36, 1),
      background 1.2s cubic-bezier(.22, .61, .36, 1);
  }

  .hero__cta.is-in {
    opacity: 1;
  }

  .nav-btn {
    font-family: var(--site-font);
    font-weight: var(--site-weight);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    cursor: pointer;
    border: 0;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    will-change: transform, opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 10px;
    box-shadow: 0 6px 8px rgba(var(--shade-rgb, 0, 0, 0), 0.04);
  }

  .nav-btn:hover {
    background: rgba(255, 255, 255, 0.18);
    transform: translateZ(0) translateY(-2px);
  }

  .nav-btn-flip {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
  }

  .nav-btn-text {
    display: block;
    transform: translateY(0%);
    transition: transform 0.45s cubic-bezier(.22, .61, .36, 1);
  }

  .nav-btn-flip::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition: transform 0.45s cubic-bezier(.22, .61, .36, 1);
    white-space: nowrap;
    color: inherit;
  }

  .nav-btn:hover .nav-btn-text {
    transform: translateY(-100%);
  }

  .nav-btn:hover .nav-btn-flip::after {
    transform: translateY(0%);
  }

  /* Halo de contour au survol : un liseré d'un pixel, allumé par un dégradé
     radial qui suit le curseur. Le masque `xor` ne garde que le contour, ce qui
     respecte l'arrondi — un `border-image` ne saurait pas le faire. Rayons du
     bouton du footer, puisque c'est son gabarit. */
  .nav-btn::before,
  .nav-btn::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  .nav-btn::before {
    background: radial-gradient(
      128px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-strong) 0%,
      var(--site-glow-mid) 26%,
      var(--site-glow-soft) 52%,
      var(--site-glow-fade) 70%,
      transparent 86%
    );
  }

  .nav-btn::after {
    background: radial-gradient(
      156px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-ambient) 0%,
      var(--site-glow-outer) 48%,
      transparent 82%
    );
    filter: blur(3px);
  }

  .nav-btn:hover::before,
  .nav-btn:hover::after {
    opacity: 1;
  }

  .nav-btn:focus-visible {
    outline: 2px solid var(--lead-blue, #5768ff);
    outline-offset: 3px;
  }

  /* ── Écrans étroits ───────────────────────────────────────────────────── */
  @media (max-width: 900px) {
    .hero {
      --hero-inset: 1rem;
      --hero-radius: 18px;
    }

    /* Voile du bas renforcé sur mobile. Le montage vertical garde 5 à 10 % d'air
       sous le sujet — c'est inhérent : un mockup couché ne remplit pas un cadre
       9:20 sans être charcuté (voir la note de cadrage en mémoire). Le voile
       absorbe cet air : la coupe du plan tombe dans sa partie dense, et plus
       aucune arête ne se lit. */
    .hero__veil {
      background:
        linear-gradient(to top,
          rgba(var(--shade-rgb, 0, 0, 0), 1) 0%,
          rgba(var(--shade-rgb, 0, 0, 0), 0.96) 8%,
          rgba(var(--shade-rgb, 0, 0, 0), 0.82) 15%,
          rgba(var(--shade-rgb, 0, 0, 0), 0.6) 22%,
          rgba(var(--shade-rgb, 0, 0, 0), 0.38) 30%,
          rgba(var(--shade-rgb, 0, 0, 0), 0.2) 38%,
          rgba(var(--shade-rgb, 0, 0, 0), 0.08) 46%,
          rgba(var(--shade-rgb, 0, 0, 0), 0.02) 54%,
          rgba(var(--shade-rgb, 0, 0, 0), 0) 62%);
    }

  }

  @media (prefers-reduced-motion: reduce) {
    .hero__frame {
      transition-duration: 0.2s;
    }

    .hero__media,
    .hero__cta {
      transition-duration: 0.25s;
      transform: none;
    }
  }
</style>
