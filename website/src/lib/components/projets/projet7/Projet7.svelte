<script>
  import ProjectThemePage from "$lib/components/projets/shared/ProjectThemePage.svelte";
  import ProjectHeroProjetsStyle from "$lib/components/projets/shared/ProjectHeroProjetsStyle.svelte";
  import ProjectBrief from "$lib/components/projets/shared/ProjectBrief.svelte";
  import ProjectInProgress from "$lib/components/projets/shared/ProjectInProgress.svelte";

  const appPrimary = "/images/justx_fitness.webp";
  const appSecondary = "/images/justx.webp";
</script>

<ProjectThemePage>
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
    scrollToId="projet-en-cours"
  />

  <ProjectBrief
    lines={[
      "JustX Fitness prolonge la marque JustX en une application mobile pour planifier ses séances, suivre l'effort et mesurer sa progression.",
      "Chaque écran se concentre sur une action précise, dans un design system cohérent qui garde l'identité de la marque jusque dans le détail."
    ]}
    images={[
      { src: "/images/justx_textile.webp", alt: "Univers visuel de JustX Fitness" },
      { src: "/images/justx-couleurs.webp", alt: "Application JustX Fitness sur mobile" }
    ]}
  />

  <ProjectInProgress
    image={appPrimary}
    mobileImage={appSecondary}
    alt="Univers visuel de l'application JustX Fitness"
  />
</ProjectThemePage>
