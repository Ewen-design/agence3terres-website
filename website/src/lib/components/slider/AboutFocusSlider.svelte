<script>
  import FocusZoneSlider from "$lib/components/slider/FocusZoneSlider.svelte";

  const slides = [
    {
      number: "01",
      title: "Le reflet\nd'un art",
      description:
        "Dans le silence apaisant d'un lac, chaque détail trouve son écho. Chez 3 Terres, nous nous plaçons comme la surface limpide où se reflète l'essence de votre marque.",
      image: "/images/telephone2.webp"
    },
    {
      number: "02",
      title: "Les lumières\nde la création",
      description:
        "Cet univers urbain est le théâtre de notre créativité : élégant, moderne, vibrant. 3 Terres puise dans l'énergie de la ville l'audace d'inventer, de façonner des univers visuels qui marient esthétisme et ingéniosité.",
      image: "/images/creation_logo_desktop.webp"
    },
    {
      number: "03",
      title: "Les sommets\nde l'ambition",
      description:
        "La montagne est notre troisième terre, celle de l'ambition. Nous visons le sommet pour nos clients avec des expériences visuelles qui inspirent et marquent.",
      image: "/images/appareil_photo.webp"
    }
  ];
</script>

<FocusZoneSlider
  {slides}
  zoneHeight="33svh"
  itemHeightDesktop="53vh"
  itemHeightMobile="48svh"
/>
