<script>
  import ProjectFocusReveal from "$lib/components/home/ProjectFocusReveal.svelte";

  // Mêmes infos qu'avant, adaptées au nouveau principe (une image ~200vh par
  // slide, titre fixe en haut, texte + wipe gris→blanc en bas). Pas de lien →
  // pas de bouton (le composant l'omet quand `href` est absent).
  const slides = [
    {
      title: "Un reflet",
      description: "Nous reflétons l'identité de nos clients avec précision afin de leur proposer les solutions les plus adaptées.",
      images: ["/images/lac copie.webp"]
    },
    {
      title: "Une création",
      description: "Nous concevons des expériences de marque uniques, pensées pour durer et faire la différence.",
      images: ["/images/pexels-hikaique-5913599.webp"]
    },
    {
      title: "Une ambition",
      description: "Nous imaginons des stratégies adaptées à chaque projet, afin de l'accompagner jusqu'au sommet de leurs ambitions.",
      images: ["/images/pexels-jack-atkinson-1289771108-24356055.webp"]
    }
  ];
</script>

<!-- Sur la page à propos, les slides défilent plus lentement (autoplay allongé). -->
<ProjectFocusReveal {slides} interval={8000} />
