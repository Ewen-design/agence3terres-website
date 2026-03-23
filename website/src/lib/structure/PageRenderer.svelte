<script>
  import TextesIntro from "../sections/TextesIntro.svelte";
  import StickySlider from "../sections/StickySlider.svelte";
  import ParallaxGallery2 from "../sections/ParallaxGallery2.svelte";
  import ProjetsAccordeon from "../sections/ProjetsAccordeon.svelte";
  import VisionSlider from "../sections/VisionSlider.svelte";
  import Gallery2 from "../sections/Gallery2.svelte";
  import Gallery3 from "../sections/Gallery3.svelte";
  import Apropos from "../structure/Apropos.svelte";
  import ParallaxTextes from "../sections/ParallaxTextes.svelte";
  import BackgroundParallax from "../sections/BackgroundParallax.svelte";
  import NewSectionHero from "../sections/NewSectionHero.svelte";
  import Transition1 from "../sections/Transition1.svelte";
  import MixSlider from "../sections/MixSlider.svelte";
  import Transition2 from "../sections/Transition2.svelte";
  import ImageScroll from "../sections/ImageScroll.svelte";
  import AncienSliderCustom from "../sections/AncienSliderCustom.svelte";
  import Contact from "../structure/Contact.svelte";
  import Projet1 from "../structure/Projet1.svelte";
  import Projet2 from "../structure/Projet2.svelte";

  export let page;
  export let navigate;
  export let travailDarkPhase = false;

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
</script>

{#if page === "home"}
  <TextesIntro />
  <StickySlider />
  <ParallaxGallery2 {navigate} />
  <ProjetsAccordeon {navigate} />
  <VisionSlider />
{:else if page === "travail"}
  <Gallery2 {navigate} darkPhase={travailDarkPhase} />
  <Gallery3
    {navigate}
    darkPhase={travailDarkPhase}
    on:darkchange={(e) => dispatch("darkchange", e.detail)}
  />
{:else if page === "apropos"}
  <Apropos />
  <ParallaxTextes />
  <BackgroundParallax />
{:else if page === "services"}
  <NewSectionHero />
  <Transition1 />
  <MixSlider />
  <Transition2 />
  <ImageScroll src="images/photo.webp" alt="Description de l'image" />
  <AncienSliderCustom />
{:else if page === "contact"}
  <Contact />
{:else if page === "projet1"}
  <Projet1 {navigate} />
{:else if page === "projet2"}
  <Projet2 {navigate} />
{/if}