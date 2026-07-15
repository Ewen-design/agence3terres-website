<script>
  import ProjectThemePage from "$lib/components/projets/shared/ProjectThemePage.svelte";
  import ProjectHeroProjetsStyle from "$lib/components/projets/shared/ProjectHeroProjetsStyle.svelte";
  import ProjectBrief from "$lib/components/projets/shared/ProjectBrief.svelte";
  import ProjectInProgress from "$lib/components/projets/shared/ProjectInProgress.svelte";
</script>

<ProjectThemePage>
  <ProjectHeroProjetsStyle
    title="Ludosphères"
    image="/images/ludo.webp"
    metaBlocks={[
      { label: "Date", value: "2025 - Present" },
      { label: "Localisation", value: "France" },
      {
        label: "Services",
        value: ["Site web", "Direction visuelle", "Editorial"]
      }
    ]}
    ctaLabel="Visiter le site"
    scrollToId="projet-en-cours"
  />

  <ProjectBrief
    lines={[
      "<span class='hl'>Ludosphères</span> est un <span class='hl'>site vitrine d'artiste</span> pensé pour laisser les <span class='hl'>œuvres peintes</span> prendre toute la place.",
      "Une <span class='hl'>direction éditoriale</span> sobre, beaucoup d'<span class='hl'>espace</span> et un <span class='hl'>rythme juste</span> entre images, titres et respirations."
    ]}
    images={[
      { src: "/images/ludo.webp", alt: "Univers éditorial de Ludosphères" },
      { src: "/images/ludo.webp", alt: "Mise en page de Ludosphères" }
    ]}
  />

  <ProjectInProgress
    image="/images/ludo.webp"
    alt="Univers visuel du projet Ludosphères"
  />
</ProjectThemePage>
