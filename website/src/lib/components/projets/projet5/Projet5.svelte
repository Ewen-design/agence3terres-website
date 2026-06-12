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

  const image = "/images/logo_justx.webp";
  let sliderActive = false;

  function handleSliderActiveChange(event) {
    sliderActive = !!event.detail?.active;
  }
</script>

<ProjectThemePage headerToneOverride={sliderActive ? "light" : null}>
  <ProjectHeroProjetsStyle
    title="JustX"
    {image}
    metaBlocks={[
      { label: "Date", value: "2026 - Present" },
      { label: "Secteur", value: "Sport" },
      {
        label: "Services",
        value: ["Identité visuelle", "Direction artistique", "Expérience digitale"]
      }
    ]}
    ctaLabel="Découvrir JustX"
  />

  <ProjectThemeTrigger theme="light" offset={132} />

  <div class="project-theme-band">
    <ProjectEditorialRole
      title="Notre rôle"
      images={[
        { src: image, alt: "Identité visuelle JustX" },
        { src: image, alt: "Symbole de la marque JustX" }
      ]}
      items={[
        {
          title: "Plateforme de marque",
          text: "Une identité sportive directe pour réunir l'entraînement, la nutrition et la gamme textile."
        },
        {
          title: "Programmes personnalisés",
          text: "Une expérience pensée pour rendre chaque accompagnement plus clair, plus lisible et plus personnel."
        },
        {
          title: "Déploiement visuel",
          text: "Un symbole fort qui garde sa présence sur les interfaces, les contenus et les vêtements."
        }
      ]}
    />
  </div>

  <div class="project-theme-band">
    <ProjectEditorialSplit
      title="Programmes sportifs"
      text="L'univers JustX accompagne des parcours personnalisés de musculation avec une lecture nette et immédiatement identifiable."
      {image}
      alt="Identité JustX pour les programmes sportifs"
      mediaMinHeight="52.5rem"
    />

    <ProjectEditorialStatement
      eyebrow="Progression personnelle"
      text="La marque réunit entraînement, nutrition et vêtements dans un langage simple, énergique et cohérent."
    />

    <ProjectEditorialSplit
      title="Nutrition et textile"
      text="L'identité se prolonge naturellement dans les contenus nutrition et dans une gamme de vêtements pensée comme une extension de la marque."
      {image}
      alt="Univers nutrition et textile JustX"
      reverse={true}
    />
  </div>

  <ProjectStorySlider
    on:slideractivechange={handleSliderActiveChange}
    slides={[
      {
        label: "Musculation",
        title: "Personnaliser",
        text: "Des programmes construits autour de chaque objectif.",
        image
      },
      {
        label: "Nutrition",
        title: "Accompagner",
        text: "Une approche cohérente pour soutenir la progression.",
        image
      },
      {
        label: "Textile",
        title: "Prolonger",
        text: "Une gamme de vêtements qui donne corps à l'univers JustX.",
        image
      }
    ]}
  />

  <div class="project-theme-band">
    <ProjectEditorialMobileShowcase
      text="Le symbole JustX reste net et immédiatement reconnaissable sur chaque point de contact de la marque."
      leftImage={image}
      leftAlt="Logo JustX en format vertical"
      rightImage={image}
      rightAlt="Identité sportive JustX"
      mediaMinHeight="46.5rem"
    />
  </div>

  <ProjectThemeTrigger theme="dark" />

  <div class="project-theme-band">
    <ProjectEditorialMosaic
      text="Un signe direct, sportif et précis, pensé pour garder la même énergie sur les programmes, les contenus et les vêtements."
      feature={{ src: image, alt: "Grand visuel JustX" }}
      items={[
        { src: image, alt: "Programmes JustX" },
        { src: image, alt: "Gamme textile JustX" }
      ]}
    />

    <ProjectLinksCarousel currentPage="projet5" />
  </div>
</ProjectThemePage>
