<script>
  import BlurFocusSlider from "$lib/components/slider/BlurFocusSlider.svelte";

  const slides = [
    {
      number: "01",
      title: "Identite visuelle",
      description:
        "Une vision de marque claire et structurée pour poser un cadre juste, cohérent et durable. Nous définissons un territoire visuel complet — couleurs, typographies, principes de composition — qui donne à votre marque une présence immédiatement reconnaissable sur tous ses supports.",
      image: "/images/carte_visite_desktop.webp",
      mobileImage: "/images/carte_visite_mobile.webp"
    },
    {
      number: "02",
      title: "Site web",
      description:
        "Des expériences digitales sensibles, lisibles et construites pour prolonger l'univers de marque. Chaque page est pensée comme un parcours : une navigation fluide, un rythme maîtrisé et une mise en scène soignée qui guident naturellement le visiteur vers l'essentiel.",
      image: "/images/telephone_parfum.webp"
    },
    {
      number: "03",
      title: "Logo",
      description:
        "Des signes distinctifs forts, pensés pour installer une présence immédiate et mémorable. Nous concevons des symboles simples et durables, qui gardent toute leur force aussi bien sur une enseigne que sur un écran ou un détail imprimé.",
      image: "/images/creation_logo_desktop.webp",
      mobileImage: "/images/creation_logo_mobile.webp"
    },
    {
      number: "04",
      title: "Reseaux sociaux",
      description:
        "Des contenus et des prises de parole plus cohérents pour installer une présence régulière et désirable. Nous construisons une ligne éditoriale claire et des formats reconnaissables qui font vivre la marque au quotidien et renforcent le lien avec votre communauté.",
      image: "/images/telephone_main.webp"
    },
    {
      number: "05",
      title: "Evenements",
      description:
        "Des images et des récits captés avec justesse pour prolonger l'intensité d'un moment. De la captation à la mise en récit, nous transformons vos événements en contenus forts qui racontent votre marque et continuent de la faire rayonner bien après.",
      image: "/images/appareil_photo.webp"
    },
    {
      number: "06",
      title: "Suivi strategique",
      description:
        "Un regard stratégique et créatif pour faire évoluer la marque avec cohérence dans le temps. Nous vous accompagnons dans la durée, en ajustant les choix visuels et éditoriaux au fil de votre croissance pour garder un univers toujours juste et aligné.",
      image: "/images/parfum_ordinateur.webp"
    }
  ];
</script>

<BlurFocusSlider {slides} />
