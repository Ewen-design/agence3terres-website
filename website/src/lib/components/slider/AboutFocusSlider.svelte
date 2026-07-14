<script>
  import ProjectScrollShowcase from "$lib/components/home/ProjectScrollShowcase.svelte";

  // Mêmes infos qu'avant, adaptées au nouveau principe (une image ~200vh par
  // slide, titre fixe en haut, texte + wipe gris→blanc en bas). Pas de lien →
  // pas de bouton (le composant l'omet quand `href` est absent).
  const slides = [
    {
      title: "Un reflet",
      description: "Nous reflétons l'identité de nos clients avec précision afin de leur proposer les solutions les plus adaptées.",
      images: ["/images/test.webp"]
    },
    {
      title: "Une création",
      description: "Nous concevons des expériences de marque uniques, pensées pour durer et faire la différence.",
      images: ["/images/creation_logo_desktop.webp"]
    },
    {
      title: "Une ambition",
      description: "Nous imaginons des stratégies adaptées à chaque projet, afin de l'accompagner jusqu'au sommet de leurs ambitions.",
      images: ["/images/appareil_photo.webp"]
    }
  ];
</script>

<ProjectScrollShowcase {slides} mobileCaptionBottom />
