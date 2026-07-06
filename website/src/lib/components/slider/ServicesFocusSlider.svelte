<script>
  import BlurFocusSlider from "$lib/components/slider/BlurFocusSlider.svelte";

  const slides = [
    {
      number: "01",
      title: "Identite visuelle",
      description:
        "Un territoire visuel complet — couleurs, typographies, compositions — pour une marque cohérente et reconnaissable.",
      image: "/images/carte_visite_desktop.webp",
      mobileImage: "/images/carte_visite_mobile.webp"
    },
    {
      number: "02",
      title: "Site web",
      description:
        "Des expériences digitales lisibles et sensibles, pensées comme un parcours fluide qui guide vers l'essentiel.",
      image: "/images/telephone_parfum.webp"
    },
    {
      number: "03",
      title: "Logo",
      description:
        "Des signes simples et durables, pensés pour installer une présence immédiate et mémorable.",
      image: "/images/creation_logo_desktop.webp",
      mobileImage: "/images/creation_logo_mobile.webp"
    },
    {
      number: "04",
      title: "Reseaux sociaux",
      description:
        "Une ligne éditoriale claire et des formats reconnaissables pour faire vivre la marque au quotidien.",
      image: "/images/telephone_main.webp"
    },
    {
      number: "05",
      title: "Evenements",
      description:
        "Des images et des récits captés avec justesse pour prolonger l'intensité d'un moment.",
      image: "/images/appareil_photo.webp"
    },
    {
      number: "06",
      title: "Suivi strategique",
      description:
        "Un accompagnement dans la durée pour faire évoluer la marque avec cohérence dans le temps.",
      image: "/images/parfum_ordinateur.webp"
    }
  ];
</script>

<BlurFocusSlider slides={slides.map((s) => ({ ...s, href: "/services" }))} ctaLabel="Découvrir" />
