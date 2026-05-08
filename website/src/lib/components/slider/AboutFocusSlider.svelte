<script>
  import FocusZoneSlider from "$lib/components/slider/FocusZoneSlider.svelte";

  const slides = [
    {
      number: "01",
      title: "Un reflet",
      description: "Nous reflétons l'identité de nos clients avec précision afin de leur proposer les solutions les plus adaptées.",
      image: "/images/telephone2.webp"
    },
    {
      number: "02",
      title: "Une création",
      description: "Nous concevons des expériences de marque uniques, pensées pour durer et faire la différence.",
      image: "/images/creation_logo_desktop.webp"
    },
    {
      number: "03",
      title: "Une ambition",
      description: "Nous imaginons des stratégies adaptées à chaque projet, afin de l'accompagner jusqu'au sommet de leurs ambitions.",
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
