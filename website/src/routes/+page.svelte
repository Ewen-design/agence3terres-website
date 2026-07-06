<script>
  import TexteIntro2 from "$lib/components/home/TexteIntro2.svelte";
  import Fonts from "$lib/components/home/Fonts.svelte";
  import StickySlider from "$lib/components/home/StickySlider.svelte";
  import ParallaxGallery2 from "$lib/components/home/ParallaxGallery2.svelte";
  import ProjetsAccordeon from "$lib/components/home/ProjetsAccordeon.svelte";
  import GalleryColonnes from "$lib/components/home/GalleryColonnes.svelte";
  import Hero from "$lib/components/home/Hero.svelte";
  import IntroSlider from "$lib/components/home/IntroSlider.svelte";
  import FaqAccordion from "$lib/components/home/FaqAccordion.svelte";
  import BlurFocusSlider from "$lib/components/slider/BlurFocusSlider.svelte";

  const hsliderSlides = [
    {
      title: "Moovy",
      description: "Recommandation de films\nselon ses envies.",
      image: "/images/tel_moovy2.webp",
      href: "/projet3"
    },
    {
      title: "JustX",
      description: "Marque sport, programmes\net gamme textile.",
      image: "/images/justx_textile.webp",
      href: "/projet5"
    },
    {
      title: "JustX\nFitness",
      description: "Planifier séances, suivre\neffort et progression.",
      image: "/images/justx_app.webp",
      href: "/projet7"
    },
    {
      title: "Mission X",
      description: "Jeu mobile, détectives\ncontre voleurs.",
      image: "/images/jeu_mockup.webp",
      href: "/projet6"
    },
    {
      title: "Ludosphères",
      description: "Site d'artiste pour\noeuvres peintes.",
      image: "/images/apple_justx.webp",
      href: "/projet4"
    },
    {
      title: "Serein\nDesign",
      description: "Univers premium, identité\nclaire et sensible.",
      image: "/images/serein_design.webp",
      href: "/projet1"
    },
    {
      title: "Votre\nprojet ?",
      description: "Approche sur mesure,\nsingularité et impact.",
      image: "/images/agence.webp",
      href: "/contact"
    }
  ];
</script>

<h1 class="seo-page-title">Agence 3 Terres - Sites web, identité et direction artistique</h1>
<Hero />
<GalleryColonnes />
<ParallaxGallery2
  introLead="Trois pôles spécialisés réunis sous une même direction artistique pour construire chaque marque de bout en bout."
/>

<IntroSlider />
<BlurFocusSlider slides={hsliderSlides} />
<FaqAccordion />
