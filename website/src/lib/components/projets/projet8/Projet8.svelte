<script>
  import ProjectThemePage from "$lib/components/projets/shared/ProjectThemePage.svelte";
  import ProjectThemeTrigger from "$lib/components/projets/shared/ProjectThemeTrigger.svelte";
  import ProjectHeroProjetsStyle from "$lib/components/projets/shared/ProjectHeroProjetsStyle.svelte";
  import ProjectEditorialRole from "$lib/components/projets/shared/ProjectEditorialRole.svelte";
  import ProjectEditorialSplit from "$lib/components/projets/shared/ProjectEditorialSplit.svelte";
  import ProjectEditorialStatement from "$lib/components/projets/shared/ProjectEditorialStatement.svelte";
  import ProjectEditorialMobileShowcase from "$lib/components/projets/shared/ProjectEditorialMobileShowcase.svelte";
  import ProjectEditorialMosaic from "$lib/components/projets/shared/ProjectEditorialMosaic.svelte";
  import ParallaxGallery2 from "$lib/components/home/ParallaxGallery2.svelte";
  import { videoSources } from "$lib/components/shared/media/videoSources.js";

  // Mêmes visuels (optimisés .webp) que la page Travail, en excluant Lybra
  // (le projet courant).
  const otherProjects = [
    { title: "Moovy", image: "/images/tel_moovy2.webp", href: "/projet3" },
    { title: "JustX", image: "/images/justx.webp", href: "/projet5" },
    { title: "JustX Fitness", image: "/images/justx_app.webp", href: "/projet7" },
    { title: "Mission X", image: "/images/missionX5.webp", href: "/projet6" },
    { title: "Ludosphères", image: "/images/ludo.webp", href: "/projet4" },
    { title: "Votre projet ?", image: "/images/agence.webp", href: "/contact", cta: "Nous contacter" }
  ];
</script>

<ProjectThemePage>
  <ProjectHeroProjetsStyle
    title="Lybra"
    image="/images/lybra-affichage.webp"
    mobileImage="/images/lybra-cartes.webp"
    metaBlocks={[
      { label: "Date", value: "2025" },
      { label: "Localisation", value: "France" },
      {
        label: "Services",
        value: ["Logo", "Identité visuelle", "Charte graphique"]
      }
    ]}
    ctaLabel="Visiter le site"
    ctaHref="https://lybrasystems.com"
    ctaExternal={true}
  />

  <ProjectThemeTrigger theme="light" offset={132} />

  <div class="project-theme-band">
    <ProjectEditorialRole
      title="Notre rôle"
      images={[
        { src: "/images/lybra-logo.webp", alt: "Logo Lybra sur fond bleu nuit" },
        { src: "/images/lybra-cartes.webp", alt: "Cartes de visite Lybra" }
      ]}
      items={[
        {
          title: "Un emblème modernisé",
          text: "Le colibri de la marque a été entièrement redessiné : des formes plus nettes, un geste plus franc, une lisibilité tenue jusqu'aux très petites tailles."
        },
        {
          title: "Une identité complète",
          text: "Palette, contrastes, associations de couleurs et règles de composition, pour un système cohérent de la carte de visite à l'affichage."
        },
        {
          title: "Une charte livrée",
          text: "Versions monochromes, fonds autorisés, déclinaisons documentées et fichiers prêts à l'emploi en SVG, PNG et WebP."
        }
      ]}
    />
  </div>

  <div class="project-theme-band">
    <ProjectEditorialSplit
      title="La demande"
      text="Lybra Systems prend en charge la prospection commerciale de ses clients, de la liste de prospects jusqu'aux rendez-vous qualifiés. La marque avait déjà son colibri, mais un colibri daté. Il fallait le moderniser sans le trahir."
      image="/images/lybra-coffret.webp"
      alt="Coffret Lybra et carte gravée à l'emblème"
      mediaAspectRatio="1.333"
      mediaMobileAspectRatio="1.333"
      mediaFit="contain"
    />

    <ProjectEditorialStatement
      eyebrow="Intention"
      text="Un colibri en plein <span class='hl'>envol</span>, comme l'élan que la marque donne à ses clients : de la <span class='hl'>liberté</span>, de la <span class='hl'>confiance</span>, et une <span class='hl'>proximité</span> qui ne se perd jamais en route."
    />

    <ProjectEditorialSplit
      title="L'emblème"
      text="Quelques traits, une silhouette. Le colibri final tient dans une forme simple qui reste reconnaissable en favicon comme sur une façade, en aplat comme en réserve."
      video={videoSources("lybra-embleme")}
      videoPoster="/videos/lybra-embleme-poster.webp"
      alt="L'emblème colibri de Lybra qui se dessine, suivi de la signature"
      mediaAspectRatio="0.8"
      mediaFit="contain"
      reverse={true}
    />

    <ProjectEditorialSplit
      title="Les couleurs"
      text="Un bleu nuit pour la confiance, un bleu ciel pour l'envol, un vert pour la croissance. Chaque teinte a sa version du logo et ses fonds autorisés."
      image="/images/lybra-planche.webp"
      alt="Planche de marque Lybra : nuancier, applications écran et papier"
      mediaAspectRatio="0.8"
      mediaFit="contain"
    />
  </div>

  <div class="project-theme-band">
    <ProjectEditorialMobileShowcase
      text="Le même colibri, en <span class='hl'>réserve</span> sur chaque fond de la charte."
      leftImage="/images/lybra-fond-vert.webp"
      leftAlt="Logo Lybra en réserve sur fond vert"
      rightImage="/images/lybra-fond-ciel.webp"
      rightAlt="Logo Lybra en réserve sur fond bleu ciel"
      mediaMinHeight="26rem"
    />

    <ProjectEditorialSplit
      title="Le système"
      text="Emblème seul ou accompagné du nom, en blanc, en bleu nuit, en bleu ciel ou en vert : chaque combinaison est déclinée, nommée et documentée."
      image="/images/lybra-declinaisons.webp"
      alt="Planche des déclinaisons du logo Lybra"
      mediaAspectRatio="0.583"
      mediaFit="contain"
      reverse={true}
    />
  </div>

  <ProjectThemeTrigger theme="dark" />

  <div class="project-theme-band">
    <ProjectEditorialMosaic
      text="Une <span class='hl'>marque</span> qui tient à l'écran, sur le papier et en pleine rue."
      feature={{ src: "/images/lybra-macbook.webp", alt: "Identité Lybra appliquée sur un écran" }}
      items={[
        {
          video: videoSources("lybra-envol"),
          poster: "/videos/lybra-envol-poster.webp",
          alt: "Le colibri Lybra en volume, filmé en plein envol"
        },
        {
          src: "/images/lybra-coffret-portrait.webp",
          alt: "Carte gravée à l'emblème Lybra, posée dans son coffret"
        }
      ]}
    />

    <ParallaxGallery2
      items={otherProjects}
      ctaLabel="Voir le projet"
      ariaLabelPrefix="Voir le projet"
      introMain="Découvrez "
      introMuted={"nos<br>autres projets."}
      strongIntro
    />
  </div>
</ProjectThemePage>
