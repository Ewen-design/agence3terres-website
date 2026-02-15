<script>
  import { onMount } from "svelte";
  import { initScrollEngine } from "./lib/scrollEngine.js";

  import Header from "./lib/structure/Header.svelte";
  import HeroScroll from "./lib/sections/HeroScroll.svelte";
  import TextesIntro from "./lib/sections/TextesIntro.svelte";
  import ParallaxTextes from "./lib/sections/ParallaxTextes.svelte";
  import Footer from "./lib/structure/Footer.svelte";
  import IconeFleche from "./lib/structure/IconeFleche.svelte";
  import IntroLoader from "./lib/structure/IntroLoader.svelte";
  import HomePage from "./lib/sections/HomePage.svelte";
  import ParallaxGallery from "./lib/sections/ParallaxGallery.svelte";
  import CustomCursor from "./lib/structure/CustomCursor.svelte";
  import BackgroundParallax from "./lib/sections/BackgroundParallax.svelte";

  // Initialise le moteur de scroll global UNE SEULE FOIS
  onMount(() => {
    initScrollEngine();
  });
</script>

<main>
  <CustomCursor />
  <IntroLoader />
  <Header />
  <IconeFleche />
  <HeroScroll />
  <TextesIntro />
  <HomePage />
  <ParallaxGallery />
  <ParallaxTextes />
  <BackgroundParallax />
  <Footer />
</main>
