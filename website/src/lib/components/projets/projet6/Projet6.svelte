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
    image="/images/imageterres.jpg"
    mobileImage="/images/montagne.webp"
    metaBlocks={[
      { label: "Date", value: "2026" },
      { label: "Secteur", value: "Jeu vidéo" },
      {
        label: "Services",
        value: ["Game design", "Direction artistique", "Expérience interactive"]
      }
    ]}
    ctaLabel="Découvrir la mission"
  />

  <ProjectThemeTrigger theme="light" offset={132} />

  <div class="project-theme-band">
    <ProjectEditorialRole
      title="Notre rôle"
      images={[
        { src: "/images/missionx_strategy.png", alt: "Échiquier stratégique de Mission X" },
        { src: "/images/montagne.webp", alt: "Relief vertical de Mission X" }
      ]}
      items={[
        {
          title: "Game design",
          text: "Une boucle de jeu construite autour de l'observation, de la décision et des conséquences."
        },
        {
          title: "Univers narratif",
          text: "Un territoire hybride où la nature, la ville et les missions forment un récit en mouvement."
        },
        {
          title: "Direction artistique",
          text: "Des contrastes nets, une lumière cinématographique et un langage visuel immédiatement identifiable."
        }
      ]}
    />
  </div>

  <div class="project-theme-band">
    <ProjectEditorialSplit
      title="Un monde à explorer"
      text="Mission X fait dialoguer reliefs sauvages et architecture urbaine pour créer un terrain de jeu vaste, lisible et imprévisible."
      image="/images/imageterres.jpg"
      alt="Paysage hybride du jeu Mission X"
      mediaMinHeight="52.5rem"
    />

    <ProjectEditorialStatement
      eyebrow="Stratégie narrative"
      text="Chaque décision ouvre une route, ferme une possibilité et transforme la manière d'aborder la mission suivante."
    />

    <ProjectEditorialSplit
      title="Une progression tendue"
      text="Le joueur avance avec des objectifs clairs, mais conserve plusieurs façons de lire le terrain, de prendre position et d'atteindre sa cible."
      image="/images/aigleciel.jpg"
      alt="Horizon et aigle dans l'univers Mission X"
      reverse={true}
    />
  </div>

  <ProjectStorySlider
    on:slideractivechange={handleSliderActiveChange}
    slides={[
      {
        label: "Univers",
        title: "Explorer",
        text: "Lire le relief. Repérer les chemins. Comprendre le monde.",
        image: "/images/imageterres.jpg",
        mobileImage: "/images/montagne.webp"
      },
      {
        label: "Stratégie",
        title: "Décider",
        text: "Chaque mouvement engage la suite de la mission.",
        image: "/images/missionx_strategy.png"
      },
      {
        label: "Progression",
        title: "Atteindre",
        text: "Avancer, s'adapter et ouvrir une nouvelle trajectoire.",
        image: "/images/aigleciel.jpg",
        mobileImage: "/images/montagne.webp"
      }
    ]}
  />

  <div class="project-theme-band">
    <ProjectEditorialMobileShowcase
      text="Le X agit comme un signal : une cible, un point de bascule et la promesse d'une mission à accomplir."
      leftImage="/images/X.png"
      leftAlt="Monogramme X de Mission X"
      rightImage="/images/missionx_strategy.png"
      rightAlt="Univers stratégique de Mission X"
      mediaMinHeight="46.5rem"
    />
  </div>

  <ProjectThemeTrigger theme="dark" />

  <div class="project-theme-band">
    <ProjectEditorialMosaic
      text="Un univers construit sur la tension entre échelle, silence et décision."
      feature={{ src: "/images/imageterres.jpg", alt: "Grand paysage de Mission X" }}
      items={[
        { src: "/images/montagne.webp", alt: "Sommet de Mission X" },
        { src: "/images/aigleciel.jpg", alt: "Ciel de Mission X" }
      ]}
    />

    <ProjectLinksCarousel currentPage="projet6" />
  </div>
</ProjectThemePage>
