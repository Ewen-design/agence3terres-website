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
      "<span class='hl'>Mission X</span> est un <span class='hl'>jeu social mobile</span> qui oppose <span class='hl'>détectives et voleurs</span> autour d'un téléphone qui circule comme un <span class='hl'>dossier confidentiel</span>.",
      "Un <span class='hl'>langage rouge / bleu</span> simple et une <span class='hl'>interface lisible</span>, pensés pour rendre chaque partie immédiatement <span class='hl'>jouable</span> et <span class='hl'>spectaculaire</span>."
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
