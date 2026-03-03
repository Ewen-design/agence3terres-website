<script>
  import { onMount } from "svelte";
  import { initScrollEngine } from "./lib/scrollEngine.js";
  import Lenis from "@studio-freight/lenis";

  import Header from "./lib/structure/Header.svelte";
  import Footer from "./lib/structure/Footer.svelte";
  import CustomCursor from "./lib/structure/CustomCursor.svelte";
  import IntroLoader from "./lib/structure/IntroLoader.svelte";
  import SliderCustom from "./lib/sections/SliderCustom.svelte";

  // HOME
  import IconeFleche from "./lib/structure/IconeFleche.svelte";
  import HeroScroll from "./lib/sections/HeroScroll.svelte";
  import TextesIntro from "./lib/sections/TextesIntro.svelte";
  import HomePage from "./lib/sections/HomePage.svelte";
  import ParallaxGallery from "./lib/sections/ParallaxGallery.svelte";
  import ProjetsHighlight from "./lib/sections/ProjetsHighlight.svelte";
  import ParallaxTextes from "./lib/sections/ParallaxTextes.svelte";
  import BackgroundParallax from "./lib/sections/BackgroundParallax.svelte";
  import VisionSlider from "./lib/sections/VisionSlider.svelte";

  // AUTRES PAGES
  import Travail from "./lib/structure/Travail.svelte";
  import Apropos from "./lib/structure/Apropos.svelte";
  import Services from "./lib/structure/Services.svelte";
  import Contact from "./lib/structure/Contact.svelte";

  // PROJETS
  import Projet1 from "./lib/structure/Projet1.svelte";
  import Projet2 from "./lib/structure/Projet2.svelte";

  let currentPage = "home";
  let nextPage = null;

  let isTransitioning = false;
  let isLoading = true;

  let lenis;

  function navigate(page) {
    if (page === currentPage || isTransitioning) return;

    nextPage = page;
    isTransitioning = true;

    setTimeout(() => {
      currentPage = nextPage;
      window.scrollTo(0, 0);
    }, 600);

    setTimeout(() => {
      isTransitioning = false;
      nextPage = null;
    }, 1300);
  }

  onMount(() => {
    initScrollEngine();

    // LENIS SMOOTH SCROLL
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smooth: true,
      direction: "vertical",
      gestureDirection: "vertical",
      smoothTouch: false
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    window.addEventListener("load", () => {
      setTimeout(() => {
        isLoading = false;
      }, 15000);
    });
  });
</script>

<main>

  <CustomCursor />
  <IconeFleche />

  {#if isLoading}
    <IntroLoader />
  {/if}

  <!-- HEADER TOUJOURS VISIBLE -->
  <Header {navigate} />

  <div class="page-wrapper {isTransitioning ? 'blur-out' : ''}">

    {#if currentPage === "home"}
      <HeroScroll />
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

  <!-- FOOTER MASQUÉ SUR LES PAGES PROJET -->
  {#if !["projet1", "projet2"].includes(currentPage)}
    <Footer />
  {/if}

</main>

<style>
main {
  position: relative;
  width: 100%;
  overflow-x: hidden;
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
</style>