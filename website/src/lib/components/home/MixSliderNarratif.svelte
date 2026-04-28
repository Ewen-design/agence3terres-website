<script>
  import FocusZoneSlider from "$lib/components/slider/FocusZoneSlider.svelte";

  const slides = [
    {
      number: "01",
      title: "Serein\nDesign",
      description:
        "Un univers objet premium, calme et fonctionnel. Une direction pensée pour traduire une élégance sobre, technologique et durable à travers une identité visuelle claire et sensible.",
      image: "/images/telephone3.webp"
    },
    {
      number: "02",
      title: "Hansatsu",
      description:
        "Une présence plus sensorielle, plus singulière. Un travail d’image et de narration conçu pour installer une esthétique précise, immersive et raffinée autour du produit.",
      image: "/images/parfum_rouge.webp"
    },
    {
      number: "03",
      title: "Votre\nprojet ?",
      description:
        "Une approche sur mesure pour révéler votre singularité. Identité, direction artistique ou territoire de marque : chaque projet est pensé avec exigence, cohérence et impact.",
      image: "/images/telephone2.webp"
    }
  ];
</script>

<FocusZoneSlider {slides} zoneHeight="34svh" />
