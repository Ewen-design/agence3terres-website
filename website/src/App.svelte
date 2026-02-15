<script>
  import { onMount } from "svelte";
  import { initScrollEngine } from "./lib/scrollEngine.js";

  import Header from "./lib/structure/Header.svelte";
  import Textes from "./lib/sections/Textes.svelte";
  import Slider from "./lib/sections/Slider.svelte";
  import HeroScroll from "./lib/sections/HeroScroll.svelte";
  import HeroParallax from "./lib/sections/HeroParallax.svelte";
  import TextesIntro from "./lib/sections/TextesIntro.svelte";
  import ParallaxTextes from "./lib/sections/ParallaxTextes.svelte";
  import Footer from "./lib/structure/Footer.svelte";
  import IconeFleche from "./lib/structure/IconeFleche.svelte";
  import IntroLoader from "./lib/structure/IntroLoader.svelte";
  import HomePage from "./lib/sections/HomePage.svelte";
  import ParallaxGallery from "./lib/sections/ParallaxGallery.svelte";
  import CustomCursor from "./lib/structure/CustomCursor.svelte";
  import ParallaxGallery2 from "./lib/sections/ParallaxGallery2.svelte";
  import BackgroundParallax from "./lib/sections/BackgroundParallax.svelte";
import ScrollSlider from "./lib/sections/ScrollSlider.svelte";  
  // 🔥 Initialise le moteur de scroll global UNE SEULE FOIS
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
