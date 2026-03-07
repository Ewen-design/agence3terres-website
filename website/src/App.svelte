<script>
  import { onMount, onDestroy } from "svelte";
  import { initScrollEngine, destroyScrollEngine, updateScrollEngine } from "./lib/scrollEngine.js";
  import Lenis from "@studio-freight/lenis";

  import Header from "./lib/structure/Header.svelte";
  import Footer from "./lib/structure/Footer.svelte";
  import CustomCursor from "./lib/structure/CustomCursor.svelte";
  import IntroLoader from "./lib/structure/IntroLoader.svelte";
  import SliderCustom from "./lib/sections/SliderCustom.svelte";

  import IconeFleche from "./lib/structure/IconeFleche.svelte";
  import HeroNew from "./lib/sections/HeroNew.svelte";
  import TextesIntro from "./lib/sections/TextesIntro.svelte";
  import HomePage from "./lib/sections/HomePage.svelte";
  import ParallaxGallery from "./lib/sections/ParallaxGallery.svelte";
  import ProjetsHighlight from "./lib/sections/ProjetsHighlight.svelte";
  import ParallaxTextes from "./lib/sections/ParallaxTextes.svelte";
  import BackgroundParallax from "./lib/sections/BackgroundParallax.svelte";
  import VisionSlider from "./lib/sections/VisionSlider.svelte";

  import Travail from "./lib/structure/Travail.svelte";
  import Apropos from "./lib/structure/Apropos.svelte";
  import Services from "./lib/structure/Services.svelte";
  import Contact from "./lib/structure/Contact.svelte";

  import Projet1 from "./lib/structure/Projet1.svelte";
  import Projet2 from "./lib/structure/Projet2.svelte";

  let currentPage = "home";
  let nextPage = null;

  let isTransitioning = false;
  let isLoading = true;

  let lenis;
  let rafId;

  function navigate(page) {
    if (page === currentPage || isTransitioning) return;

    nextPage = page;
    isTransitioning = true;

    setTimeout(() => {
      currentPage = nextPage;
      lenis?.scrollTo(0, { immediate: true });
    }, 600);

    setTimeout(() => {
      isTransitioning = false;
      nextPage = null;
    }, 1300);
  }

  onMount(() => {
    initScrollEngine();

    lenis = new Lenis({
      duration: 1.35,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 1
    });

    // accès global pour les composants
    window.lenis = lenis;

    lenis.on("scroll", (e) => {
      updateScrollEngine(e.animatedScroll);
    });

    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    updateScrollEngine(window.scrollY || window.pageYOffset || 0);

    const onLoad = () => {
      setTimeout(() => {
        isLoading = false;
      }, 15000);
    };

    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      destroyScrollEngine();
      window.lenis = null;
    };
  });

  onDestroy(() => {
    cancelAnimationFrame(rafId);
    lenis?.destroy();
    destroyScrollEngine();
    window.lenis = null;
  });
</script>

<main>
  <CustomCursor />
  <IconeFleche />
  <IntroLoader />

  <Header {navigate} />

  <div class="page-wrapper {isTransitioning ? 'blur-out' : ''}">
    {#if currentPage === "home"}
      <HeroNew />
      <TextesIntro />
      <HomePage />
      <ParallaxGallery />
      <ProjetsHighlight />
      <VisionSlider />

    {:else if currentPage === "travail"}
      <Travail {navigate} />

    {:else if currentPage === "apropos"}
      <Apropos />
      <ParallaxTextes />
      <BackgroundParallax />

    {:else if currentPage === "services"}
      <SliderCustom />
      <Services />

    {:else if currentPage === "contact"}
      <Contact />

    {:else if currentPage === "projet1"}
      <Projet1 {navigate} />

    {:else if currentPage === "projet2"}
      <Projet2 {navigate} />
    {/if}
  </div>

  {#if !["projet1", "projet2"].includes(currentPage)}
    <Footer />
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
    transition:
      filter 0.8s cubic-bezier(.22,.61,.36,1),
      opacity 0.8s cubic-bezier(.22,.61,.36,1);
  }

  .blur-out {
    filter: blur(18px);
    opacity: 0;
  }

  :global(body.hero-snap-lock) {
    overflow: hidden;
    overscroll-behavior: none;
    touch-action: none;
  }
</style>