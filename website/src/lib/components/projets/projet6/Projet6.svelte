<script>
  import ProjectThemePage from "$lib/components/projets/shared/ProjectThemePage.svelte";
  import ProjectHeroProjetsStyle from "$lib/components/projets/shared/ProjectHeroProjetsStyle.svelte";
  import ProjectBrief from "$lib/components/projets/shared/ProjectBrief.svelte";
  import ProjectInProgress from "$lib/components/projets/shared/ProjectInProgress.svelte";
</script>

<ProjectThemePage>
  <ProjectHeroProjetsStyle
    title="Mission X"
    image="/images/jeu_mockup.webp"
    mobileImage="/images/jeu_mockup.webp"
    metaBlocks={[
      { label: "Date", value: "2026" },
      { label: "Secteur", value: "Jeu social mobile" },
      {
        label: "Services",
        value: ["Game design", "Direction artistique", "Interface mobile"]
      }
    ]}
    ctaLabel="Découvrir le projet"
    scrollToId="projet-en-cours"
  />

  <ProjectBrief
    lines={[
      "Mission X est un jeu social mobile qui oppose détectives et voleurs autour d'un téléphone qui circule comme un dossier confidentiel.",
      "Un langage rouge / bleu simple et une interface lisible, pensés pour rendre chaque partie immédiatement jouable et spectaculaire."
    ]}
    images={[
      { src: "/images/missionX5.webp", alt: "Univers du détective dans Mission X" },
      { src: "/images/missionx1.webp", alt: "Univers du voleur dans Mission X" }
    ]}
  />

  <ProjectInProgress
    image="/images/missionx4.webp"
    alt="Univers visuel du jeu Mission X"
  />
</ProjectThemePage>
