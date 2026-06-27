<script>
  import ProjectThemePage from "$lib/components/projets/shared/ProjectThemePage.svelte";
  import ProjectHeroProjetsStyle from "$lib/components/projets/shared/ProjectHeroProjetsStyle.svelte";
  import ProjectBrief from "$lib/components/projets/shared/ProjectBrief.svelte";
  import ProjectInProgress from "$lib/components/projets/shared/ProjectInProgress.svelte";

  const brand = "/images/justx.webp";
  const product = "/images/apple_justx.webp";
</script>

<ProjectThemePage>
  <ProjectHeroProjetsStyle
    title="JustX"
    image={product}
    metaBlocks={[
      { label: "Date", value: "2026 - Present" },
      { label: "Secteur", value: "Sport" },
      {
        label: "Services",
        value: ["Identité visuelle", "Direction artistique", "Expérience digitale"]
      }
    ]}
    ctaLabel="Découvrir JustX"
    scrollToId="projet-en-cours"
  />

  <ProjectBrief
    lines={[
      "JustX est une marque sport qui réunit entraînement, nutrition et gamme textile dans un même univers.",
      "Une identité directe et énergique, un symbole fort pensé pour garder la même présence sur les interfaces, les contenus et les vêtements."
    ]}
    images={[
      { src: "/images/justx_textile.webp", alt: "Gamme textile JustX" },
      { src: "/images/tel_justx.webp", alt: "Expérience mobile JustX" }
    ]}
  />

  <ProjectInProgress
    image={brand}
    alt="Univers visuel de la marque JustX"
  />
</ProjectThemePage>
