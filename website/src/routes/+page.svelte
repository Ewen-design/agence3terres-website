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
  import ProjectScrollShowcase from "$lib/components/home/ProjectScrollShowcase.svelte";

  const hsliderSlides = [
    {
      title: "Moovy",
      description: "Recommandation de films\nselon ses envies.",
      images: ["/images/moovy_mac.webp", "/images/tel_moovy2.webp", "/images/moovy_recherche.webp"],
      href: "/projet3"
    },
    {
      title: "JustX",
      description: "Marque sport, programmes\net gamme textile.",
      images: ["/images/justx-pub2.webp", "/images/apple_justx.webp", "/images/tel_justx.webp"],
      href: "/projet5"
    },
    {
      title: "JustX\nFitness",
      description: "Planifier séances, suivre\neffort et progression.",
      images: ["/images/justx_app.webp", "/images/justx-tel.webp", "/images/justx_couleurs.webp"],
      href: "/projet7"
    },
    {
      title: "Mission X",
      description: "Jeu mobile, détectives\ncontre voleurs.",
      images: ["/images/jeu_mockup.webp", "/images/missionX5.webp", "/images/missionx1.webp"],
      href: "/projet6"
    },
    {
      title: "Ludosphères",
      description: "Site d'artiste pour\noeuvres peintes.",
      images: ["/images/ludo.webp", "/images/ludo.webp", "/images/ludo.webp"],
      href: "/projet4"
    },
    {
      title: "Votre\nprojet ?",
      description: "Approche sur mesure,\nsingularité et impact.",
      images: ["/images/agence.webp"],
      full: true,
      href: "/contact",
      cta: "Nous contacter"
    }
  ];
</script>

<h1 class="seo-page-title">Agence 3 Terres - Sites web, identité et direction artistique</h1>
<Hero />
<GalleryColonnes />
<ParallaxGallery2
  introLead="<span class='hl'>Trois pôles spécialisés</span> réunis sous une même <span class='hl'>direction artistique</span> pour construire chaque marque de bout en bout."
/>

<IntroSlider />
<ProjectScrollShowcase slides={hsliderSlides} />
<FaqAccordion />
