<script>
  import { onMount } from "svelte";
  import { initScrollEngine } from "./lib/scrollEngine.js";

  import Header from "./lib/structure/Header.svelte";
  import Footer from "./lib/structure/Footer.svelte";
  import CustomCursor from "./lib/structure/CustomCursor.svelte";
  import IntroLoader from "./lib/structure/IntroLoader.svelte";

  // HOME
  import IconeFleche from "./lib/structure/IconeFleche.svelte";
  import HeroScroll from "./lib/sections/HeroScroll.svelte";
  import TextesIntro from "./lib/sections/TextesIntro.svelte";
  import HomePage from "./lib/sections/HomePage.svelte";
  import ParallaxGallery from "./lib/sections/ParallaxGallery.svelte";
   import ProjetsHighlight from "./lib/sections/ProjetsHighlight.svelte";
  import ParallaxTextes from "./lib/sections/ParallaxTextes.svelte";
  import BackgroundParallax from "./lib/sections/BackgroundParallax.svelte";

  // AUTRES PAGES
  import Travail from "./lib/structure/Travail.svelte";
  import Apropos from "./lib/structure/Apropos.svelte";
  import Services from "./lib/structure/Services.svelte";
  import Contact from "./lib/structure/Contact.svelte";

  let currentPage = "home";
  let nextPage = null;

  let isTransitioning = false;
  let isLoading = true;

  function navigate(page) {
    if (page === currentPage || isTransitioning) return;

    nextPage = page;
    isTransitioning = true;

    // Blur + fade out
    setTimeout(() => {
      currentPage = nextPage;
      window.scrollTo(0, 0);
    }, 600);

    // Fade in + unblur
    setTimeout(() => {
      isTransitioning = false;
      nextPage = null;
    }, 1300);
  }

  onMount(() => {
    initScrollEngine();

    window.addEventListener("load", () => {
      setTimeout(() => {
        isLoading = false;
      }, 1500);
    });
  });
</script>

<main>

  <!-- Custom cursor toujours présent -->
  <CustomCursor />

  <!-- Preloader -->
  {#if isLoading}
    <IntroLoader />
  {/if}

  <Header {navigate} />

  <div class="page-wrapper {isTransitioning ? 'blur-out' : ''}">

    {#if currentPage === "home"}
      <IconeFleche />
      <HeroScroll />
      <TextesIntro />
      <HomePage />
      <ParallaxGallery />
      <ProjetsHighlight />
      <ParallaxTextes />
      <BackgroundParallax />
    {:else if currentPage === "travail"}
      <Travail />
    {:else if currentPage === "apropos"}
      <Apropos />
    {:else if currentPage === "services"}
      <Services />
    {:else if currentPage === "contact"}
      <Contact />
    {/if}

  </div>

  <Footer />

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