<script>
  import AboutStoryIntro from "$lib/components/apropos/AboutStoryIntro.svelte";
  import AboutFocusSlider from "$lib/components/slider/AboutFocusSlider.svelte";
  import VisionSlider from "$lib/components/apropos/VisionSlider.svelte";
  // AboutEditorialPrinciples retiré des composants actifs (fichier conservé)
  // au profit d'AboutValues (3 parties éditoriales sans slider).
  // import AboutEditorialPrinciples from "$lib/components/apropos/AboutEditorialPrinciples.svelte";
  import AboutValues from "$lib/components/apropos/AboutValues.svelte";
  import HeroApropos from "$lib/components/apropos/HeroApropos.svelte";
  import AboutEditorialSingleShowcase from "$lib/components/apropos/AboutEditorialSingleShowcase.svelte";
</script>

<h1 class="seo-page-title">À propos - Vision et approche Agence 3 Terres</h1>
<HeroApropos />




<AboutFocusSlider />
<div class="apropos-intro-showcase">
  <AboutEditorialSingleShowcase
    text="Organisée en <span class='hl'>trois pôles</span> complémentaires, l'agence accompagne chaque marque du <span class='hl'>conseil</span> stratégique à la <span class='hl'>création</span> digitale, jusqu'à la <span class='hl'>production</span> de contenus."
    image="/images/cartes-agence.webp"
    alt="Direction artistique Agence 3 Terres"
    mediaMinHeight="38rem"
    showAccent={false}
    ctaLabel="Découvrir"
    ctaHref="services"
  />
</div>
<AboutValues />
<VisionSlider />

<style>
  /* Réduit le grand vide sous le texte : la section fait 220vh par défaut alors
     que l'image plein cadre n'en fait que 150vh. On ramène la hauteur juste
     au-dessus de l'image et on raccourcit la dernière rangée (vide) de la
     grille. Scopé à cette page : la page services n'est pas touchée. */
  .apropos-intro-showcase :global(.about-editorial-single-showcase) {
    min-height: 152vh;
  }

  .apropos-intro-showcase :global(.about-editorial-single-showcase__content) {
    grid-template-rows: 100vh auto 8vh;
  }

  /* Mobile : plus d'air sous le texte. */
  @media (max-width: 900px) {
    .apropos-intro-showcase :global(.about-editorial-single-showcase) {
      min-height: 182vh;
    }
  }

  @media (max-width: 640px) {
    .apropos-intro-showcase :global(.about-editorial-single-showcase) {
      min-height: 172vh;
    }
  }
</style>
