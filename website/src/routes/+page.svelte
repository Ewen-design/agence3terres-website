<script>
  import TexteIntro2 from "$lib/components/home/TexteIntro2.svelte";
  import Fonts from "$lib/components/home/Fonts.svelte";
  import StickySlider from "$lib/components/home/StickySlider.svelte";
  import ParallaxGallery2 from "$lib/components/home/ParallaxGallery2.svelte";
  import ProjetsAccordeon from "$lib/components/home/ProjetsAccordeon.svelte";
  
    import GalleryColonnes from "$lib/components/home/GalleryColonnes.svelte";
    import Hero from "$lib/components/home/Hero.svelte";
    import HomeScrollScaleReveal from "$lib/components/home/HomeScrollScaleReveal.svelte";
    import MixSliderNarratif from "$lib/components/home/MixSliderNarratif.svelte";
    import IntroSlider from "$lib/components/home/IntroSlider.svelte";
    import FaqAccordion from "$lib/components/home/FaqAccordion.svelte";
</script>

<Hero />
<HomeScrollScaleReveal
  image="/images/telephone2.webp"
  alt="Révélation visuelle en pleine largeur"
/>
<GalleryColonnes />
<ParallaxGallery2 />

<IntroSlider />
<MixSliderNarratif />
<FaqAccordion />

