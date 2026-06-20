<script>
  import FocusZoneSlider from "$lib/components/slider/FocusZoneSlider.svelte";

  const slides = [
    {
      number: "01",
      title: "Moovy",
      description:
        "Une plateforme de recommandation de films qui aide a trouver rapidement le bon choix selon ses envies.",
      image: "/images/moovy2.webp"
    },
    {
      number: "02",
      title: "JustX",
      description:
        "Une marque de sport portée par des programmes personnalisés de musculation, nutrition et une gamme textile.",
      image: "/images/justx.webp"
    },
    {
      number: "03",
      title: "JustX\nFitness",
      description:
        "L'application JustX pour planifier ses séances, suivre l'effort et mesurer sa progression.",
      image: "/images/justx_fitness.webp"
    },
    {
      number: "04",
      title: "Mission X",
      description:
        "Un jeu social mobile où détectives et voleurs s'affrontent à travers des missions secrètes.",
      image: "/images/missionX5.webp"
    },
    {
      number: "05",
      title: "Ludosphères",
      description:
        "Un site d'artiste pense pour presenter des oeuvres peintes avec calme, texture et clarte.",
      image: "/images/carte-copie.jpg"
    },
    {
      number: "06",
      title: "Serein\nDesign",
      description:
        "Un univers premium, calme et fonctionnel, porté par une identité claire et sensible.",
      image: "/images/serein_design.webp"
    },
    {
      number: "07",
      title: "Votre\nprojet ?",
      description:
        "Une approche sur mesure pour révéler une singularité avec exigence et impact.",
      image: "/images/telephone2.webp"
    }
  ];

  const slideLinks = ["/projet3", "/projet5", "/projet7", "/projet6", "/projet4", "/projet1", "/contact"];
</script>

<FocusZoneSlider {slides} {slideLinks} zoneHeight="33svh" />
