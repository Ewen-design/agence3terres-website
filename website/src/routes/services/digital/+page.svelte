<script>
  import ProjectThemePage from "$lib/components/projets/shared/ProjectThemePage.svelte";
  import PolesHero from "$lib/components/poles/PolesHero.svelte";
  import PoleDigitalSection from "$lib/components/poles/PoleDigitalSection.svelte";
  import ParallaxGallery2 from "$lib/components/home/ParallaxGallery2.svelte";

  // Slider bas de page : les deux autres pôles + la page contact.
  const otherPoles = [
    { title: "3 Terres Design", subtitle: "Logo, charte, typographie & stratégie de marque", image: "/images/ipad-logo.webp", href: "/services/design" },
    { title: "3 Terres Studio", subtitle: "Photo, vidéo, réseaux sociaux & événements", image: "/images/mobile-photo.webp", href: "/services/studio" },
    { title: "Votre projet ?", subtitle: "Une vision à faire naître, clarifier ou amplifier", image: "/images/agence.webp", href: "/contact", cta: "Nous contacter" }
  ];
</script>

<h1 class="seo-page-title">Pôle Digital - Agence 3 Terres</h1>

<ProjectThemePage>
  <PolesHero
    label="Digital"
    image="/images/montre-justx.webp"
    finalText="Sites web, applications et développement sur mesure, pensés pour <span class='hl'>toucher durablement</span> votre cible."
    showAfterImage={false}
  />

  <PoleDigitalSection />

  <ParallaxGallery2
    items={otherPoles}
    href="/services"
    ctaLabel="Découvrir"
    ariaLabelPrefix="Voir le pôle"
    introMain="Explorez"
    introMuted="nos autres pôles."
  />
</ProjectThemePage>
