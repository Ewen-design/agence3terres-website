<script>
  import FocusZoneSlider from "$lib/components/slider/FocusZoneSlider.svelte";

  const slides = [
    {
      number: "01",
      title: "Un reflet",
      description: "L'essentiel prend forme sans bruit inutile.",
      image: "/images/telephone2.webp"
    },
    {
      number: "02",
      title: "Une creation",
      description: "Chaque projet gagne en rythme, en tenue et en clarté.",
      image: "/images/creation_logo_desktop.webp"
    },
    {
      number: "03",
      title: "Une ambition",
      description: "Nous visons plus haut avec precision et constance.",
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
