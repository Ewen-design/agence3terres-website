export const projectPages = {
  projet1: {
    slug: "projet1",
    title: "Serein Design",
    category: "Identité produit",
    year: "2025",
    hero: {
      image: "/images/serein_design.webp",
      alt: "Hero Serein Design",
      summaryMain: "Une identité plus nette, plus calme, plus précise.",
      summaryMuted: "Pensée pour donner plus de tenue à la marque sur chaque support.",
      meta: ["Identité", "Direction artistique", "UI"]
    },
    intro: {
      title: "Une base plus claire.",
      text: "Clarifier la marque. Ouvrir la lecture. Faire tenir l'ensemble dans l'écran."
    },
    slider: {
      title: "Le projet se construit en trois gestes.",
      slides: [
        {
          number: "01",
          label: "Identité",
          title: "Clarifier",
          text: "Une base plus nette. Une hiérarchie plus calme.",
          image: "/images/ordinateur.webp"
        },
        {
          number: "02",
          label: "Direction artistique",
          title: "Cadrer",
          text: "Des images plus ouvertes. Un territoire plus précis.",
          image: "/images/photo.webp"
        },
        {
          number: "03",
          label: "UI design",
          title: "Déployer",
          text: "Une interface simple. Une continuité sans surcharge.",
          image: "/images/telephone2.webp"
        }
      ]
    },
    galleryPrimary: {
      title: "Un système qui tient en grand.",
      text: "De grands formats pour poser l'univers, puis des vues plus serrées pour montrer la précision.",
      images: [
        { src: "/images/photo.webp", alt: "Visuel large Serein Design", layout: "panorama" },
        { src: "/images/telephone_main.webp", alt: "Détail mobile Serein Design", layout: "square" },
        { src: "/images/telephone2.webp", alt: "Autre vue mobile Serein Design", layout: "square" }
      ]
    },
    fullscreen: {
      image: "/images/ordinateur.png",
      alt: "Vue immersive Serein Design",
      title: "Peu d'effets.",
      text: "Juste les bons rapports."
    },
    detail: {
      title: "Une lecture plus stable.",
      text: "Chaque écran garde la même logique visuelle. L'ensemble reste léger, lisible et tenu."
    },
    gallerySecondary: {
      title: "Ensuite, le détail.",
      text: "Quelques vues suffisent pour montrer comment le projet vit réellement.",
      images: [
        { src: "/images/ordinateur.webp", alt: "Vue desktop Serein Design", layout: "wide" },
        { src: "/images/telephone2.webp", alt: "Vue mobile Serein Design", layout: "portrait" },
        { src: "/images/serein_design.webp", alt: "Visuel hero Serein Design", layout: "full" }
      ]
    }
  },
  projet2: {
    slug: "projet2",
    title: "Hansatsu",
    category: "Narration visuelle",
    year: "2025",
    hero: {
      image: "/images/parfum_rouge.webp",
      alt: "Hero Hansatsu",
      summaryMain: "Une présence plus dense, plus sensorielle, plus marquante.",
      summaryMuted: "Un langage visuel pensé pour faire ressentir avant d'expliquer.",
      meta: ["Direction artistique", "Narration", "UI"]
    },
    intro: {
      title: "Créer une tension.",
      text: "Moins de démonstration. Plus de sensation. Une image qui tient immédiatement."
    },
    slider: {
      title: "Trois mouvements, une même intensité.",
      slides: [
        {
          number: "01",
          label: "Direction artistique",
          title: "Installer",
          text: "Une ambiance immédiate. Une image plus dense.",
          image: "/images/parfum2.webp"
        },
        {
          number: "02",
          label: "Identité",
          title: "Tenir",
          text: "Un territoire plus singulier. Un rythme plus juste.",
          image: "/images/parfum3.webp"
        },
        {
          number: "03",
          label: "UI design",
          title: "Prolonger",
          text: "L'intensité continue dans l'écran sans perdre la lecture.",
          image: "/images/parfum_ordinateur.webp"
        }
      ]
    },
    galleryPrimary: {
      title: "Un rythme plus cinématographique.",
      text: "L'image mène le projet. Le texte reste au second plan.",
      images: [
        { src: "/images/parfum4.webp", alt: "Visuel large Hansatsu", layout: "panorama" },
        { src: "/images/telephone_parfum.webp", alt: "Vue mobile Hansatsu", layout: "square" },
        { src: "/images/parfum3.webp", alt: "Composition visuelle Hansatsu", layout: "square" }
      ]
    },
    fullscreen: {
      image: "/images/parfum2.webp",
      alt: "Vue immersive Hansatsu",
      title: "L'image suffit presque.",
      text: "Le reste accompagne."
    },
    detail: {
      title: "Tout repose sur le rythme.",
      text: "Les rapports d'échelle, la matière et l'air entre les éléments portent l'ensemble."
    },
    gallerySecondary: {
      title: "Puis quelques vues plus proches.",
      text: "Le projet garde la même tension sur desktop, mobile et image pleine largeur.",
      images: [
        { src: "/images/parfum_ordinateur.webp", alt: "Vue desktop Hansatsu", layout: "wide" },
        { src: "/images/telephone_parfum.webp", alt: "Vue mobile Hansatsu", layout: "portrait" },
        { src: "/images/parfum_rouge.webp", alt: "Visuel hero Hansatsu", layout: "full" }
      ]
    }
  }
};
