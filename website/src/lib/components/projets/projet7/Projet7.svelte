<script>
  import ProjectThemePage from "$lib/components/projets/shared/ProjectThemePage.svelte";
  import ProjectHeroProjetsStyle from "$lib/components/projets/shared/ProjectHeroProjetsStyle.svelte";
  import ProjectBrief from "$lib/components/projets/shared/ProjectBrief.svelte";
  import ProjectInProgress from "$lib/components/projets/shared/ProjectInProgress.svelte";

  const appPrimary = "/images/justx_fitness.webp";
  const appSecondary = "/images/justx_app.webp";
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
      "<span class='hl'>JustX Fitness</span> prolonge la marque <span class='hl'>JustX</span> en une <span class='hl'>application mobile</span> pour <span class='hl'>planifier ses séances</span>, suivre l'effort et mesurer sa <span class='hl'>progression</span>.",
      "Chaque écran se concentre sur une <span class='hl'>action précise</span>, dans un <span class='hl'>design system</span> cohérent qui garde l'<span class='hl'>identité</span> de la marque jusque dans le détail."
    ]}
    images={[
      { src: "/images/justx-tel.webp", alt: "Univers visuel de JustX Fitness" },
      { src: "/images/justx_couleurs.webp", alt: "Application JustX Fitness sur mobile" }
    ]}
  />

  <ProjectInProgress
    image={appPrimary}
    mobileImage={appSecondary}
    alt="Univers visuel de l'application JustX Fitness"
  />
</ProjectThemePage>
