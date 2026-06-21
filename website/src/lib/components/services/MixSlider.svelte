<script>
  import FocusZoneSlider from "$lib/components/slider/FocusZoneSlider.svelte";

  const slides = [
    {
      number: "01",
      title: "Logo",
      description:
        "Nous révélons l’essence des marques et façonnons des identités fortes, cohérentes et mémorables. De la stratégie à l’identité visuelle, chaque élément est pensé pour créer une marque singulière et durable.",
      image: "/images/telephone2_parfum.webp"
    },
    {
      number: "02",
      title: "Identité",
      description:
        "Nous structurons des identités de marque complètes, capables d’aligner vision, ton, image et système visuel dans une direction claire et durable.",
      image: "/images/telephone2.webp"
    },
    {
      number: "03",
      title: "UI design",
      description:
        "Nous concevons des interfaces élégantes, lisibles et sensibles, pensées pour traduire l’univers d’une marque dans des expériences digitales fluides et immersives.",
      image: "/images/telephone3.webp"
    },
    {
      number: "04",
      title: "UX",
      description:
        "Nous analysons les usages, les parcours et les points de friction pour construire des expériences utiles, intuitives et ancrées dans les attentes réelles des publics.",
      image: "/images/telephone2.webp"
    },
    {
      number: "05",
      title: "Direction artistique",
      description:
        "Nous définissons des directions artistiques fortes pour donner aux marques une présence cohérente, désirable et reconnaissable sur tous leurs supports.",
      image: "/images/telephone3.webp"
    },
    {
      number: "06",
      title: "Motion",
      description:
        "Nous imaginons des principes de mouvement et des récits visuels animés qui renforcent l’impact d’une identité et prolongent son expression dans le digital.",
      image: "/images/telephone2.webp"
    }
  ];
</script>

<FocusZoneSlider {slides} headerTone="light" zoneHeight="34svh" />
