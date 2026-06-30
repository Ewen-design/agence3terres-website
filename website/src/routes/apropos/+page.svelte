<script>
  import AboutStoryIntro from "$lib/components/apropos/AboutStoryIntro.svelte";
  import AboutFocusSlider from "$lib/components/slider/AboutFocusSlider.svelte";
  import VisionSlider from "$lib/components/apropos/VisionSlider.svelte";
  import HeroApropos from "$lib/components/apropos/HeroApropos.svelte";
  import AboutEditorialPrinciples from "$lib/components/apropos/AboutEditorialPrinciples.svelte";
  import AboutEditorialSingleShowcase from "$lib/components/apropos/AboutEditorialSingleShowcase.svelte";
</script>

<h1 class="seo-page-title">À propos - Vision et approche Agence 3 Terres</h1>
<HeroApropos />




<AboutFocusSlider />
<AboutEditorialSingleShowcase
  text="Organisée en trois pôles complémentaires, l'agence accompagne chaque marque du conseil stratégique à la création digitale, jusqu'à la production de contenus."
  image="/images/justx.webp"
  alt="Direction artistique Agence 3 Terres"
  mediaMinHeight="38rem"
  ctaLabel="Découvrir"
  ctaHref="poles"
/>
<AboutEditorialPrinciples />
