<script>
  import ProjectThemePage from "$lib/components/projets/shared/ProjectThemePage.svelte";
  import PolesHero from "$lib/components/poles/PolesHero.svelte";
  import PoleStudioSection from "$lib/components/poles/PoleStudioSection.svelte";
  import ParallaxGallery2 from "$lib/components/home/ParallaxGallery2.svelte";

  // Slider bas de page : les deux autres pôles + la page contact.
  const otherPoles = [
    { title: "3 Terres Digital", subtitle: "Sites web, applications & développement sur mesure", image: "/images/montre-justx.webp", href: "/services/digital" },
    { title: "3 Terres Design", subtitle: "Logo, charte, typographie & stratégie de marque", image: "/images/ipad-logo.webp", href: "/services/design" },
    { title: "Votre projet ?", subtitle: "Une vision à faire naître, clarifier ou amplifier", image: "/images/agence.webp", href: "/contact", cta: "Nous contacter" }
  ];
</script>

<h1 class="seo-page-title">Pôle Studio - Agence 3 Terres</h1>

<ProjectThemePage>
  <PolesHero
    label="Studio"
    image="/images/mobile-photo.webp"
    finalText="Photo, vidéo, réseaux sociaux et événements : toute l'<span class='hl'>image de la marque</span>, en mouvement."
    showAfterImage={false}
  />

  <PoleStudioSection />

  <ParallaxGallery2
    items={otherPoles}
    href="/services"
    ctaLabel="Découvrir"
    ariaLabelPrefix="Voir le pôle"
    introMain="Explorez"
    introMuted="nos autres pôles."
  />
</ProjectThemePage>
