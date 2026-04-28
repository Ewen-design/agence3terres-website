<script>
  import FocusZoneSlider from "$lib/components/slider/FocusZoneSlider.svelte";

  const slides = [
    {
      number: "01",
      title: "Création\nde logo",
      description:
        "Des identités fortes, nettes et mémorables, pensées pour durer.",
      image: "/images/telephone2_parfum.webp"
    },
    {
      number: "02",
      title: "Brand\nidentity",
      description:
        "Un système de marque cohérent pour aligner vision, ton et image.",
      image: "/images/telephone2.webp"
    },
    {
      number: "03",
      title: "Ui\ndesign",
      description:
        "Des interfaces lisibles et sensibles, pensées pour prolonger une marque.",
      image: "/images/telephone3.webp"
    },
    {
      number: "04",
      title: "Ux\nresearch",
      description:
        "Des parcours plus justes, fondés sur les usages et les points de friction.",
      image: "/images/telephone2.webp"
    },
    {
      number: "05",
      title: "Direction\nartistique",
      description:
        "Une direction visuelle claire pour installer une présence désirable et cohérente.",
      image: "/images/telephone3.webp"
    },
    {
      number: "06",
      title: "Motion\nconcept",
      description:
        "Du mouvement pensé pour renforcer le rythme et l’impact d’une identité.",
      image: "/images/telephone2.webp"
    }
  ];
</script>

<FocusZoneSlider {slides} headerTone="light" zoneHeight="33svh" />
