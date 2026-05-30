<script>
  import FocusZoneSlider from "$lib/components/slider/FocusZoneSlider.svelte";

  const slides = [
    {
      number: "01",
      title: "Serein\nDesign",
      description:
        "Un univers premium, calme et fonctionnel, porté par une identité claire et sensible.",
      image: "/images/telephone3.webp"
    },
    {
      number: "02",
      title: "Hansatsu",
      description:
        "Le site web d'un projet qui retrace un fragment d'histoire japonaise avec sobriete et precision.",
      image: "/images/parfum_rouge.webp"
    },
    {
      number: "03",
      title: "Moovy",
      description:
        "Une plateforme de recommandation de films qui aide a trouver rapidement le bon choix selon ses envies.",
      image: "/images/telephone_main.webp"
    },
    {
      number: "04",
      title: "Ludovic",
      description:
        "Un site d'artiste pense pour presenter des oeuvres peintes avec calme, texture et clarte.",
      image: "/images/carte-copie.jpg"
    },
    {
      number: "05",
      title: "JustX",
      description:
        "Une marque de sport portée par des programmes personnalisés de musculation, nutrition et une gamme textile.",
      image: "/images/logo_justx.webp"
    },
    {
      number: "06",
      title: "Votre\nprojet ?",
      description:
        "Une approche sur mesure pour révéler une singularité avec exigence et impact.",
      image: "/images/telephone2.webp"
    }
  ];

  const slideLinks = ["/projet1", "/projet2", "/projet3", "/projet4", "/projet5", "/contact"];
</script>

<FocusZoneSlider {slides} {slideLinks} zoneHeight="33svh" />
