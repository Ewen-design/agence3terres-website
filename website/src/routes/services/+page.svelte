<script>
  import PolesHero from "$lib/components/poles/PolesHero.svelte";
  import ProjectShowcase from "$lib/components/travail/ProjectShowcase.svelte";

  // Les 3 pôles présentés comme la grille de la page Travail : un bloc par pôle,
  // phrase grise = mots-clés du pôle, bouton vers la page pôle dédiée.
  const poles = [
    {
      title: "3 Terres Digital",
      category: "Pôle digital",
      lead: "Sites web · Applications · Design d'interface · Développement · Responsive.",
      image: "/images/montre-justx.webp",
      page: "services/digital",
      button: "Découvrir le pôle"
    },
    {
      title: "3 Terres Design",
      category: "Pôle design",
      lead: "Logo · Charte · Typographie · Direction artistique · Naming · Stratégie.",
      image: "/images/ipad-logo.webp",
      page: "services/design",
      button: "Découvrir le pôle"
    },
    {
      title: "3 Terres Studio",
      category: "Pôle studio",
      lead: "Photo · Vidéo · Réseaux sociaux · Montage · Événementiel · Contenu.",
      image: "/images/mobile-photo.webp",
      page: "services/studio",
      button: "Découvrir le pôle"
    }
  ];
</script>

<h1 class="seo-page-title">Nos services - Agence 3 Terres</h1>

<PolesHero
  label="Services"
  finalText="Nos trois pôles, digital, design et studio, permettent d'offrir un <span class='hl'>accompagnement complet</span> et spécialisé à nos clients."
  showAfterImage={false}
/>

<ProjectShowcase projects={poles} />
