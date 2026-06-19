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

  let sliderActive = false;

  function handleSliderActiveChange(event) {
    sliderActive = !!event.detail?.active;
  }
</script>

<ProjectThemePage headerToneOverride={sliderActive ? "light" : null}>
  <ProjectHeroProjetsStyle
    title="Mission X"
    image="/images/missionx-hero-agency.jpg"
    mobileImage="/images/missionx-hero-agency.jpg"
    metaBlocks={[
      { label: "Date", value: "2026" },
      { label: "Secteur", value: "Jeu social mobile" },
      {
        label: "Services",
        value: ["Game design", "Direction artistique", "Interface mobile"]
      }
    ]}
    ctaLabel="Découvrir la mission"
  />

  <ProjectThemeTrigger theme="light" offset={132} />

  <div class="project-theme-band">
    <ProjectEditorialRole
      title="Créer une tension lisible"
      images={[
        { src: "/images/missionx-voleur-universe.jpg", alt: "Univers du voleur dans Mission X" },
        { src: "/images/missionx-detective-universe.jpg", alt: "Univers du détective dans Mission X" }
      ]}
      items={[
        {
          title: "Règles",
          text: "Une partie se comprend vite : chaque joueur reçoit une mission, les détectives avancent et les voleurs tentent de voler une action sans être démasqués."
        },
        {
          title: "Expérience",
          text: "Le téléphone circule comme un dossier confidentiel. Chaque écran devait rester clair, spectaculaire et immédiatement jouable."
        },
        {
          title: "Identité",
          text: "Nous avons construit un langage rouge/bleu simple, opposant infiltration et enquête sans surcharger l'interface."
        }
      ]}
    />
  </div>

  <div class="project-theme-band">
    <ProjectEditorialSplit
      title="Un monde à explorer"
      text="Avant de lancer la partie, l'application installe les rôles, le nombre de joueurs et le principe central : chacun garde une information privée."
      image="/images/missionx3.webp"
      alt="Écran de création de partie Mission X"
      mediaAspectRatio="2250 / 2811"
      mediaFit="contain"
    />

    <ProjectEditorialStatement
      eyebrow="Système de jeu"
      text="Une mission réussie peut faire gagner les détectives. Un vol réussi peut tout renverser. Une accusation peut sauver la partie ou éliminer un allié."
    />

    <ProjectEditorialSplit
      title="Une progression tendue"
      text="Les états clés de la partie devaient être très lisibles : victoire, élimination, nouvelle manche, retour au plateau. La tension vient de la clarté."
      image="/images/missionx1.webp"
      alt="Écrans de victoire et d'élimination Mission X"
      mediaAspectRatio="2250 / 2811"
      mediaFit="contain"
      reverse={true}
    />
  </div>

  <ProjectStorySlider
    on:slideractivechange={handleSliderActiveChange}
    slides={[
      {
        label: "Univers",
        title: "Briefing",
        text: "Comprendre vite les camps, les objectifs et le rythme de la partie.",
        image: "/images/missionx-hero-agency.jpg",
        mobileImage: "/images/missionx3.webp"
      },
      {
        label: "Interface",
        title: "Composer",
        text: "Une galerie d'écrans pensée comme une direction artistique complète.",
        image: "/images/missionx4.webp"
      },
      {
        label: "Règles",
        title: "Jouer",
        text: "Le joueur sait toujours quoi faire, même quand son rôle reste secret.",
        image: "/images/missionx2.webp",
        mobileImage: "/images/missionx2.webp"
      },
      {
        label: "Progression",
        title: "Basculer",
        text: "Victoire, accusation ou élimination : chaque état donne du poids à l'action.",
        image: "/images/missionx1.webp",
        mobileImage: "/images/missionx1.webp"
      }
    ]}
  />

  <div class="project-theme-band">
    <ProjectEditorialMobileShowcase
      text="Deux camps, une même interface, une tension sociale qui se joue dans le réel."
      leftImage="/images/missionx-voleur-universe.jpg"
      leftAlt="Voleur dans l'univers Mission X"
      rightImage="/images/missionx-detective-universe.jpg"
      rightAlt="Détective dans l'univers Mission X"
      mediaMinHeight="46.5rem"
    />
  </div>

  <ProjectThemeTrigger theme="dark" />

  <div class="project-theme-band">
    <ProjectEditorialMosaic
      text="Une interface conçue pour faire comprendre les règles sans ralentir le jeu."
      feature={{ src: "/images/missionx4.webp", alt: "Panorama des écrans Mission X" }}
      items={[
        { src: "/images/missionx2.webp", alt: "Règles et tour de jeu Mission X" },
        { src: "/images/missionx1.webp", alt: "Résultats et progression Mission X" }
      ]}
    />

    <ProjectLinksCarousel currentPage="projet6" />
  </div>
</ProjectThemePage>
