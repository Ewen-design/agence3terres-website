<script>
  import ProjectThemePage from "$lib/components/projets/shared/ProjectThemePage.svelte";
  import ProjectHeroProjetsStyle from "$lib/components/projets/shared/ProjectHeroProjetsStyle.svelte";
  import ProjectBrief from "$lib/components/projets/shared/ProjectBrief.svelte";
  import ProjectInProgress from "$lib/components/projets/shared/ProjectInProgress.svelte";
</script>

<ProjectThemePage>
  <ProjectHeroProjetsStyle
    title="Ludosphères"
    image="/images/carte-copie.webp"
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
      "Ludosphères est un site vitrine d'artiste pensé pour laisser les œuvres peintes prendre toute la place.",
      "Une direction éditoriale sobre, beaucoup d'espace et un rythme juste entre images, titres et respirations."
    ]}
    images={[
      { src: "/images/carte_visite_desktop.webp", alt: "Univers éditorial de Ludosphères" },
      { src: "/images/carte_visite_desktop2.webp", alt: "Mise en page de Ludosphères" }
    ]}
  />

  <ProjectInProgress
    image="/images/carte.webp"
    alt="Univers visuel du projet Ludosphères"
  />
</ProjectThemePage>
