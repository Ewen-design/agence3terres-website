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
        "Une présence plus sensorielle, construite par l’image et la narration.",
      image: "/images/parfum_rouge.webp"
    },
    {
      number: "03",
      title: "Votre\nprojet ?",
      description:
        "Une approche sur mesure pour révéler une singularité avec exigence et impact.",
      image: "/images/telephone2.webp"
    }
  ];
</script>

<FocusZoneSlider {slides} zoneHeight="33svh" />
