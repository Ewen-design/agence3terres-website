<script>
  import ProjectThemePage from "$lib/components/projets/shared/ProjectThemePage.svelte";
  import ProjectThemeTrigger from "$lib/components/projets/shared/ProjectThemeTrigger.svelte";
  import ProjectHeroProjetsStyle from "$lib/components/projets/shared/ProjectHeroProjetsStyle.svelte";
  import ProjectEditorialRole from "$lib/components/projets/shared/ProjectEditorialRole.svelte";
  import ProjectStorySlider from "$lib/components/projets/shared/ProjectStorySlider.svelte";
  import ProjectEditorialSplit from "$lib/components/projets/shared/ProjectEditorialSplit.svelte";
  import ProjectEditorialStatement from "$lib/components/projets/shared/ProjectEditorialStatement.svelte";
  import ProjectEditorialMobileShowcase from "$lib/components/projets/shared/ProjectEditorialMobileShowcase.svelte";
  import ProjectEditorialMosaic from "$lib/components/projets/shared/ProjectEditorialMosaic.svelte";
  import ProjectLinksCarousel from "$lib/components/projets/shared/ProjectLinksCarousel.svelte";

  const logo = "/images/logo_justx.webp";
  const appPrimary = "/images/telephone3.webp";
  const appSecondary = "/images/telephone2.webp";
  let sliderActive = false;

  function handleSliderActiveChange(event) {
    sliderActive = !!event.detail?.active;
  }
</script>

<ProjectThemePage headerToneOverride={sliderActive ? "light" : null}>
  <ProjectHeroProjetsStyle
    title="JustX Fitness"
    image={appPrimary}
    mobileImage={appSecondary}
    metaBlocks={[
      { label: "Date", value: "2026 - Present" },
      { label: "Produit", value: "Application mobile" },
      {
        label: "Services",
        value: ["Product design", "UX/UI", "Design system"]
      }
    ]}
    ctaLabel="Découvrir l'application"
  />

  <ProjectThemeTrigger theme="light" offset={132} />

  <div class="project-theme-band">
    <ProjectEditorialRole
      title="Notre rôle"
      images={[
        { src: appPrimary, alt: "Expérience mobile JustX Fitness" },
        { src: logo, alt: "Identité JustX Fitness" }
      ]}
      items={[
        {
          title: "Parcours d'entraînement",
          text: "Des séances structurées pour comprendre rapidement l'objectif, le rythme et la prochaine action."
        },
        {
          title: "Suivi personnel",
          text: "Une lecture claire de la progression pour garder les données utiles accessibles sans surcharge."
        },
        {
          title: "Design system",
          text: "Une interface cohérente qui prolonge l'identité JustX dans chaque écran de l'application."
        }
      ]}
    />
  </div>

  <div class="project-theme-band">
    <ProjectEditorialSplit
      title="L'entraînement au premier plan"
      text="L'application concentre chaque écran sur une action précise : préparer une séance, suivre l'effort ou mesurer la progression."
      image={appPrimary}
      alt="Interface mobile de suivi JustX Fitness"
      mediaMinHeight="52.5rem"
    />

    <ProjectEditorialStatement
      eyebrow="Progression"
      text="Un accompagnement quotidien, lisible et personnel, pensé pour transformer les objectifs en actions concrètes."
    />

    <ProjectEditorialSplit
      title="Une expérience continue"
      text="Programmes, nutrition et historique restent connectés dans un parcours simple qui accompagne l'utilisateur avant, pendant et après chaque séance."
      image={logo}
      alt="Univers visuel de l'application JustX Fitness"
      reverse={true}
    />
  </div>

  <ProjectStorySlider
    on:slideractivechange={handleSliderActiveChange}
    slides={[
      {
        title: "Planifier",
        text: "Des objectifs clairs et un programme toujours accessible.",
        image: appPrimary
      },
      {
        title: "S'entraîner",
        text: "Chaque exercice guide l'effort sans détour.",
        image: appSecondary
      },
      {
        title: "Progresser",
        text: "Les résultats essentiels restent visibles au bon moment.",
        image: logo
      }
    ]}
  />

  <div class="project-theme-band">
    <ProjectEditorialMobileShowcase
      text="JustX Fitness transforme l'accompagnement de la marque en un outil mobile direct, personnel et disponible au quotidien."
      leftImage={appSecondary}
      leftAlt="Application JustX Fitness sur mobile"
      rightImage={logo}
      rightAlt="Identité visuelle JustX Fitness"
      mediaMinHeight="46.5rem"
    />
  </div>

  <ProjectThemeTrigger theme="dark" />

  <div class="project-theme-band">
    <ProjectEditorialMosaic
      text="Une application construite pour garder l'effort, les objectifs et la progression dans un même rythme."
      feature={{ src: appPrimary, alt: "Expérience principale JustX Fitness" }}
      items={[
        { src: appSecondary, alt: "Vue mobile JustX Fitness" },
        { src: logo, alt: "Logo JustX Fitness" }
      ]}
    />

    <ProjectLinksCarousel currentPage="projet7" />
  </div>
</ProjectThemePage>
