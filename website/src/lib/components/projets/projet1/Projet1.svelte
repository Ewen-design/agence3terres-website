<script>
  import ProjectThemePage from "$lib/components/projets/shared/ProjectThemePage.svelte";
  import ProjectHeroProjetsStyle from "$lib/components/projets/shared/ProjectHeroProjetsStyle.svelte";
  import ProjectBrief from "$lib/components/projets/shared/ProjectBrief.svelte";
  import ProjectInProgress from "$lib/components/projets/shared/ProjectInProgress.svelte";
</script>

<ProjectThemePage>
  <ProjectHeroProjetsStyle
    title="Serein Design"
    image="/images/serein_design.webp"
    metaBlocks={[
      { label: "Date", value: "2025 - Present" },
      { label: "Localisation", value: "France" },
      {
        label: "Services",
        value: ["UI Design", "UX Design", "Direction visuelle"]
      }
    ]}
    ctaLabel="Visiter le site"
    scrollToId="projet-en-cours"
  />

  <ProjectBrief
    lines={[
      "Serein Design cherchait une présence plus nette et résolument premium. Nous avons clarifié son identité et son interface pour donner à l'ensemble plus d'air, de hiérarchie et de calme.",
      "Une direction visuelle sobre, pensée pour durer et se déployer sans effort du desktop au mobile."
    ]}
    images={[
      { src: "/images/telephone2.webp", alt: "Interface Serein Design" },
      { src: "/images/telephone3.webp", alt: "Vue mobile de Serein Design" }
    ]}
  />

  <ProjectInProgress
    image="/images/serein_design.webp"
    alt="Univers visuel de Serein Design"
  />
</ProjectThemePage>
