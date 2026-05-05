<script>
  import AboutStoryIntro from "$lib/components/apropos/AboutStoryIntro.svelte";
  import AboutFocusSlider from "$lib/components/slider/AboutFocusSlider.svelte";
  import VisionSlider from "$lib/components/apropos/VisionSlider.svelte";
  import HeroApropos from "$lib/components/apropos/HeroApropos.svelte";
  import AboutEditorialPrinciples from "$lib/components/apropos/AboutEditorialPrinciples.svelte";
  import AboutEditorialSingleShowcase from "$lib/components/apropos/AboutEditorialSingleShowcase.svelte";
</script>
<HeroApropos />

<AboutEditorialSingleShowcase
  text="Une direction artistique pensee pour donner plus de presence, de coherence et d'intensite"
  mutedText="a chaque prise de parole."
  image="/images/creation_logo_desktop.webp"
  alt="Direction artistique Agence 3 Terres"
  mediaMinHeight="38rem"
/>
<AboutEditorialPrinciples />
<AboutStoryIntro />
<AboutFocusSlider />
<VisionSlider />
