<script>
  import FocusZoneSlider from "$lib/components/slider/FocusZoneSlider.svelte";

  const slides = [
    {
      number: "01",
      title: "Moovy",
      description: "Recommandation de films selon ses envies.",
      image: "/images/moovy2.webp"
    },
    {
      number: "02",
      title: "JustX",
      description: "Marque sport, programmes et gamme textile.",
      image: "/images/justx.webp"
    },
    {
      number: "03",
      title: "JustX\nFitness",
      description: "Planifier séances, suivre effort et progression.",
      image: "/images/justx_fitness.webp"
    },
    {
      number: "04",
      title: "Mission X",
      description: "Jeu mobile, détectives contre voleurs.",
      image: "/images/jeu_mockup.webp"
    },
    {
      number: "05",
      title: "Ludosphères",
      description: "Site d'artiste pour oeuvres peintes.",
      image: "/images/apple_justx.webp"
    },
    {
      number: "06",
      title: "Serein\nDesign",
      description: "Univers premium, identité claire et sensible.",
      image: "/images/serein_design.webp"
    },
    {
      number: "07",
      title: "Votre\nprojet ?",
      description: "Approche sur mesure, singularité et impact.",
      image: "/images/tel_moovy.webp"
    }
  ];

  const slideLinks = ["/projet3", "/projet5", "/projet7", "/projet6", "/projet4", "/projet1", "/contact"];
</script>

<FocusZoneSlider {slides} {slideLinks} zoneHeight="33svh" variant="home" />
