<script>
  import ProjectThemePage from "$lib/components/projets/shared/ProjectThemePage.svelte";
  import PolesHero from "$lib/components/poles/PolesHero.svelte";
  import PoleDesignSection from "$lib/components/poles/PoleDesignSection.svelte";
  import ParallaxGallery2 from "$lib/components/home/ParallaxGallery2.svelte";

  // Slider bas de page : les deux autres pôles + la page contact.
  const otherPoles = [
    { title: "3 Terres Digital", subtitle: "Sites web, applications & développement sur mesure", image: "/images/montre-justx.webp", href: "/services/digital" },
    { title: "3 Terres Studio", subtitle: "Photo, vidéo, réseaux sociaux & événements", image: "/images/mobile-photo.webp", href: "/services/studio" },
    { title: "Votre projet ?", subtitle: "Une vision à faire naître, clarifier ou amplifier", image: "/images/agence.webp", href: "/contact", cta: "Nous contacter" }
  ];
</script>

<h1 class="seo-page-title">Pôle Design - Agence 3 Terres</h1>

<ProjectThemePage>
  <PolesHero
    label="Design"
    image="/images/ipad-logo.webp"
    finalText="Logo, charte et typographie : une <span class='hl'>identité claire et durable</span> pour votre marque."
    showAfterImage={false}
  />

  <PoleDesignSection />

  <ParallaxGallery2
    items={otherPoles}
    href="/services"
    ctaLabel="Découvrir"
    ariaLabelPrefix="Voir le pôle"
    introMain="Explorez"
    introMuted="nos autres pôles."
  />
</ProjectThemePage>
