<script>
import { fade, fly } from "svelte/transition";
  import { onMount } from "svelte";
  import { initScrollEngine } from "./lib/scrollEngine.js";

  import Header from "./lib/structure/Header.svelte";
  import Footer from "./lib/structure/Footer.svelte";
  import CustomCursor from "./lib/structure/CustomCursor.svelte";
  import IntroLoader from "./lib/structure/IntroLoader.svelte";

  // PAGE HOME
  import IconeFleche from "./lib/structure/IconeFleche.svelte";
  import HeroScroll from "./lib/sections/HeroScroll.svelte";
  import TextesIntro from "./lib/sections/TextesIntro.svelte";
  import HomePage from "./lib/sections/HomePage.svelte";
  import ParallaxGallery from "./lib/sections/ParallaxGallery.svelte";
  import ParallaxTextes from "./lib/sections/ParallaxTextes.svelte";
  import BackgroundParallax from "./lib/sections/BackgroundParallax.svelte";

  // AUTRES PAGES
  import Travail from "./lib/structure/Travail.svelte";
  import Apropos from "./lib/structure/Apropos.svelte";
  import Services from "./lib/structure/Services.svelte";
  import Contact from "./lib/structure/Contact.svelte";

  let currentPage = "home";

  function navigate(page) {
    currentPage = page;
    window.scrollTo(0, 0);
  }

  onMount(() => {
    initScrollEngine();
  });
</script>

<main>
  <CustomCursor />
  <IntroLoader />

  <Header {navigate} />

 {#key currentPage}
  <div
    in:fade={{ duration: 400 }}
    out:fade={{ duration: 300 }}
    

  >
    {#if currentPage === "home"}
      <IconeFleche />
      <HeroScroll />
      <TextesIntro />
      <HomePage />
      <ParallaxGallery />
      <ParallaxTextes />
      <BackgroundParallax />
    {/if}

    {#if currentPage === "travail"}
      <Travail />
    {/if}

    {#if currentPage === "apropos"}
      <Apropos />
    {/if}

    {#if currentPage === "services"}
      <Services />
    {/if}

    {#if currentPage === "contact"}
      <Contact />
    {/if}
  </div>
{/key}

  <Footer />
</main>