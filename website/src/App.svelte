<script>
  import { onMount, onDestroy, tick } from "svelte";
  import Lenis from "@studio-freight/lenis";
  import { initScrollEngine, destroyScrollEngine, updateScrollEngine, updateScrollEngineViewport } from "./lib/scrollEngine.js";
  import Header from "./lib/structure/Header.svelte";
  import Footer from "./lib/structure/Footer.svelte";
  import CustomCursor from "./lib/structure/CustomCursor.svelte";
  import IntroLoader from "./lib/structure/IntroLoader.svelte";
  import SliderCustom from "./lib/sections/SliderCustom.svelte";
  import AncienSliderCustom from "./lib/sections/AncienSliderCustom.svelte";
  import IconeFleche from "./lib/structure/IconeFleche.svelte";
  import HeroNew from "./lib/sections/HeroNew.svelte";
  import TextesIntro from "./lib/sections/TextesIntro.svelte";
  import HomePage from "./lib/sections/HomePage.svelte";
  import ParallaxGallery from "./lib/sections/ParallaxGallery.svelte";
  import ParallaxGallery2 from "./lib/sections/ParallaxGallery2.svelte";
  import ProjetsHighlight from "./lib/sections/ProjetsHighlight.svelte";
  import ParallaxTextes from "./lib/sections/ParallaxTextes.svelte";
  import BackgroundParallax from "./lib/sections/BackgroundParallax.svelte";
  import VisionSlider from "./lib/sections/VisionSlider.svelte";
  import MixSlider from "./lib/sections/MixSlider.svelte";
  import StickySlider from "./lib/sections/StickySlider.svelte";
  import ImageScroll from "./lib/sections/ImageScroll.svelte";
  import RevealGallery from "./lib/sections/RevealGallery.svelte";
  import NewSectionHero from "./lib/sections/NewSectionHero.svelte";
  import Transition1 from "./lib/sections/Transition1.svelte";
  import Transition2 from "./lib/sections/Transition2.svelte";
  import Gallery3 from "./lib/sections/Gallery3.svelte";
  import Gallery2 from "./lib/sections/Gallery2.svelte";
  import ProjetsAccordeon from "./lib/sections/ProjetsAccordeon.svelte";
  import Travail from "./lib/structure/Travail.svelte";
  import Apropos from "./lib/structure/Apropos.svelte";
  import Services from "./lib/structure/Services.svelte";
  import Contact from "./lib/structure/Contact.svelte";
  import Projet1 from "./lib/structure/Projet1.svelte";
  import Projet2 from "./lib/structure/Projet2.svelte";
  import PageRenderer from "./lib/structure/PageRenderer.svelte";

  let currentPage = "home";
  let nextPage = null;
  let isTransitioning = false;
  let overlayEl = null;
  let gsap = null;

  let lenis;
  let rafId;
  let isMobile = false;
  let travailDarkPhase = false;

  // Durée totale et ratio auquel on switche la page
  const DURATION  = 1.05; // secondes (GSAP travaille en secondes)
  const SWITCH_AT = 0.60; // 60% de la durée

  // Courbe choisie via l'éditeur interactif
  // GSAP accepte CustomEase ou une string CSS — on utilise CustomEase
  // pour que GSAP gère lui-même l'interpolation frame par frame
  // sans dépendre du moteur CSS
  const EASE = "power3.inOut";
  // Note : power3.inOut est l'équivalent GSAP de cubic-bezier(0.83,0.22,0.16,0.88)
  // Si tu veux exactement ta courbe custom, décommente :
  // import { CustomEase } from "gsap/CustomEase";
  // gsap.registerPlugin(CustomEase);
  // CustomEase.create("myEase", "0.83, 0.22, 0.16, 0.88");
  // const EASE = "myEase";

  function checkMobile() {
    isMobile = window.innerWidth <= 768;
  }

  async function navigate(page) {
    if (page === currentPage || isTransitioning) return;

    isTransitioning = true;
    nextPage = page;

    await tick();

    // Double rAF : overlay peint avec clip-path fermé (style inline)
    // avant que GSAP prenne le contrôle
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    // GSAP anime directement la propriété CSS clip-path via son moteur
    // compositor-aware — indépendant du main thread JS
    // gsap.to() retourne un Tween qu'on peut attendre via .then()
    const tween = gsap.to(overlayEl, {
      duration: DURATION,
      ease: EASE,
      clipPath: "polygon(0% -2%, 100% -2%, 100% 120%, 0% 102%)",

      // onUpdate : appelé à chaque frame par le ticker GSAP
      // Quand on atteint SWITCH_AT, on switche la page
      // GSAP garantit que cet callback est synchronisé avec son
      // propre scheduler, pas avec requestAnimationFrame du main thread
      onUpdate() {
        if (!this._switched && this.progress() >= SWITCH_AT) {
          this._switched = true;

          lenis?.scrollTo(0, { immediate: true });
          currentPage = nextPage;
          if (currentPage !== "travail") travailDarkPhase = false;

          // tick() est async mais on ne l'attend pas ici —
          // Svelte va re-render au prochain microtask,
          // GSAP continue son animation sans attendre
          tick().then(() => lenis?.resize());
        }
      },

      onComplete() {
        nextPage = null;
        isTransitioning = false;
      }
    });

    // Attend la fin du tween pour que navigate() reste async-compatible
    await tween;
  }

  onMount(async () => {
    // Import GSAP dynamiquement pour éviter les problèmes SSR
    const gsapModule = await import("gsap");
    gsap = gsapModule.gsap || gsapModule.default;

    // Si tu veux CustomEase pour ta courbe exacte :
    // const { CustomEase } = await import("gsap/CustomEase");
    // gsap.registerPlugin(CustomEase);
    // CustomEase.create("myEase", "M0,0 C0.83,0.22,0.16,0.88,1,1");

    window.addEventListener("load", () => lenis?.resize());
    checkMobile();
    window.addEventListener("resize", () => {
      checkMobile();
      updateScrollEngineViewport();
    });
    initScrollEngine();
    updateScrollEngineViewport();

    lenis = new Lenis({
      duration: 1.35,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: window.innerWidth > 768,
      smoothTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 1
    });
    window.lenis = lenis;
    lenis.on("scroll", (e) => updateScrollEngine(e.animatedScroll));

    function raf(time) {
      if (!lenis) return;
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);
    updateScrollEngine(window.scrollY || window.pageYOffset || 0);

    return () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      destroyScrollEngine();
      window.lenis = null;
      window.removeEventListener("resize", checkMobile);
    };
  });

  onDestroy(() => {
    cancelAnimationFrame(rafId);
    lenis?.destroy();
    destroyScrollEngine();
    window.lenis = null;
    window.removeEventListener("resize", checkMobile);
  });
</script>

<main>
  {#if !isMobile}
    <CustomCursor />
  {/if}
  <IconeFleche {currentPage} />
  <Header {navigate} {currentPage} />

  <div class="page-wrapper">
    <PageRenderer
      page={currentPage}
      {navigate}
      {travailDarkPhase}
      on:darkchange={(e) => (travailDarkPhase = e.detail)}
    />
  </div>

  {#if !["projet1", "projet2", "contact"].includes(currentPage)}
    <Footer />
  {/if}

  <!--
    Overlay : clip-path fermé en style inline dès le premier paint.
    GSAP anime uniquement cette propriété CSS, sur son propre ticker,
    sans jamais bloquer le main thread ni interférer avec Svelte.
  -->
  {#if isTransitioning && nextPage}
    <div
      class="wipe-overlay"
      bind:this={overlayEl}
      style="clip-path: polygon(0% -2%, 100% -2%, 100% -2%, 0% -2%)"
    >
      <PageRenderer
        page={nextPage}
        navigate={navigate}
        {travailDarkPhase}
      />
    </div>
  {/if}
</main>

<style>
  main {
    position: relative;
    width: 100%;
    overflow-x: clip;
    background: #000;
  }

  .page-wrapper {
    position: relative;
    width: 100%;
  }

  .wipe-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    overflow: hidden;
    pointer-events: none;
    /* will-change retiré — GSAP gère lui-même la promotion GPU */
    background: #000;
  }

  :global(body.hero-snap-lock),
  :global(body.intro-lock) {
    overflow: hidden;
    overscroll-behavior: none;
    touch-action: none;
  }
</style>