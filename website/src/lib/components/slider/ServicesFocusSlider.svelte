<script>
  import FocusZoneSlider from "$lib/components/slider/FocusZoneSlider.svelte";

  const slides = [
    {
      number: "01",
      title: "Identite visuelle",
      description:
        "Une vision de marque claire pour poser un cadre juste, coherent et durable.",
      image: "/images/carte_visite_desktop.webp",
      mobileImage: "/images/carte_visite_mobile.webp"
    },
    {
      number: "02",
      title: "Site web",
      description:
        "Des experiences digitales sensibles, lisibles et construites pour prolonger l'univers de marque.",
      image: "/images/telephone_parfum.webp"
    },
    {
      number: "03",
      title: "Logo",
      description:
        "Des signes distinctifs forts, pensés pour installer une presence immediate et memorable.",
      image: "/images/creation_logo_desktop.webp",
      mobileImage: "/images/creation_logo_mobile.webp"
    },
    {
      number: "04",
      title: "Reseaux sociaux",
      description:
        "Des contenus et des prises de parole plus coherents pour installer une presence reguliere et desirables.",
      image: "/images/telephone_main.webp"
    },
    {
      number: "05",
      title: "Evenements",
      description:
        "Des images et recits captes avec justesse pour prolonger l'intensite d'un moment.",
      image: "/images/appareil_photo.webp"
    },
    {
      number: "06",
      title: "Suivi strategique",
      description:
        "Un regard strategique et creatif pour faire evoluer la marque avec coherence dans le temps.",
      image: "/images/parfum_ordinateur.webp"
    }
  ];
</script>

<FocusZoneSlider {slides} headerTone="light" zoneHeight="33svh" itemHeightDesktop="47vh" />
