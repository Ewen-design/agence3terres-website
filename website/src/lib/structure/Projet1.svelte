<svelte:head>
  <title>Projet 1 | Agence 3 Terres</title>
</svelte:head>

<script>
  import ProjectHeroProjetsStyle from "$lib/structure/projects/ProjectHeroProjetsStyle.svelte";
  import ProjectScrollScaleReveal from "$lib/structure/projects/ProjectScrollScaleReveal.svelte";
  import ProjectEditorialRole from "$lib/structure/projects/ProjectEditorialRole.svelte";
  import ProjectEditorialSplit from "$lib/structure/projects/ProjectEditorialSplit.svelte";
  import ProjectEditorialStatement from "$lib/structure/projects/ProjectEditorialStatement.svelte";
  import ProjectEditorialMobileShowcase from "$lib/structure/projects/ProjectEditorialMobileShowcase.svelte";
  import ProjectFullscreenTitleImage from "$lib/structure/projects/ProjectFullscreenTitleImage.svelte";
  import ProjectEditorialTriptych from "$lib/structure/projects/ProjectEditorialTriptych.svelte";
  import ProjectLinksCarousel from "$lib/structure/projects/ProjectLinksCarousel.svelte";
</script>

<ProjectHeroProjetsStyle
  title="Projet 1"
  image="/images/serein_design.webp"
  finalText="Une page projet pensée pour montrer le travail avec plus de clarté, de tenue et de précision visuelle."
/>

<ProjectScrollScaleReveal
  image="/images/telephone2.webp"
  alt="Image immersive du projet 1"
/>

<ProjectEditorialRole
  title="Notre rôle"
  images={[
    { src: "/images/photo.webp", alt: "Composition visuelle large du projet 1" },
    { src: "/images/serein_design.webp", alt: "Univers principal du projet 1" }
  ]}
  items={[
    {
      title: "Website UX et UI Design",
      text: "Un parcours plus clair, plus direct et plus calme, pensé pour mieux guider la lecture."
    },
    {
      title: "Direction visuelle",
      text: "Un langage plus net, plus premium, avec davantage d'air et une hiérarchie plus juste."
    },
    {
      title: "Déploiement mobile",
      text: "Une adaptation précise pour garder la même tenue sur des surfaces plus serrées."
    }
  ]}
/>

<ProjectEditorialSplit
  title="Interface mobile"
  text="Une présence plus simple et plus lisible. Le projet garde sa clarté jusque dans les vues les plus rapprochées."
  image="/images/telephone_main.webp"
  alt="Vue mobile projet 1"
/>

<ProjectEditorialStatement
  eyebrow="Système visuel"
  text="Le projet repose surtout sur les rapports d'échelle, la respiration entre les blocs et une lecture plus ouverte."
/>

<ProjectEditorialMobileShowcase
  eyebrow="Mobile first"
  text="Le mobile devient ici un vrai support d'expression, pas une simple adaptation plus compacte."
  leftImage="/images/telephone2.webp"
  leftAlt="Interface mobile verticale projet 1"
  rightImage="/images/photo2.webp"
  rightAlt="Mise en situation mobile projet 1"
/>

<ProjectEditorialSplit
  title="Vue desktop"
  text="Sur desktop, le système reste sobre et très lisible. Les espacements et les rapports de taille portent l'ensemble."
  image="/images/ordinateur.webp"
  alt="Vue desktop projet 1"
  reverse={true}
/>

<ProjectFullscreenTitleImage
  image="/images/serein_design.webp"
  alt="Vue plein écran du projet 1"
  title="Une présence calme."
/>

<ProjectEditorialTriptych
  topImage="/images/telephone_main.webp"
  topAlt="Image large projet 1"
  bottomLeftImage="/images/photo2.webp"
  bottomLeftAlt="Portrait ambiance projet 1"
  bottomRightImage="/images/photo.webp"
  bottomRightAlt="Texture visuelle projet 1"
/>

<ProjectScrollScaleReveal
  image="/images/telephone2.webp"
  alt="Transition de fin du projet 1"
  reverse={true}
  sectionHeight={168}
/>

<ProjectLinksCarousel
  title="Continuer"
  intro="Une suite de pages à parcourir ensuite : l'autre projet, les services de l'agence et la prise de contact."
  items={[
    {
      href: "/projet2",
      image: "/images/parfum_rouge.webp",
      alt: "Aperçu du projet 2",
      eyebrow: "Projet",
      kicker: "02",
      title: "Projet 2",
      text: "Une direction plus sensorielle, plus dense et plus narrative."
    },
    {
      href: "/services",
      image: "/images/appareil_photo.webp",
      alt: "Aperçu de la page services",
      eyebrow: "Page",
      kicker: "Services",
      title: "Services",
      text: "Identité, direction artistique, site web et accompagnement."
    },
    {
      href: "/contact",
      image: "/images/photo2.webp",
      alt: "Aperçu de la page contact",
      eyebrow: "Page",
      kicker: "Contact",
      title: "Contact",
      text: "Ouvrir une discussion, cadrer un projet ou demander un devis."
    }
  ]}
/>
