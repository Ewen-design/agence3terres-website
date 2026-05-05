<svelte:head>
  <title>Projet 1 | Agence 3 Terres</title>
</svelte:head>

<script>
  import { onDestroy, onMount } from "svelte";
  import { browser } from "$app/environment";
  import ProjectHeroProjetsStyle from "$lib/components/projets/shared/ProjectHeroProjetsStyle.svelte";
  import ProjectScrollScaleReveal from "$lib/components/projets/shared/ProjectScrollScaleReveal.svelte";
  import ProjectEditorialRole from "$lib/components/projets/shared/ProjectEditorialRole.svelte";
  import ProjectStorySlider from "$lib/components/projets/shared/ProjectStorySlider.svelte";
  import ProjectEditorialSplit from "$lib/components/projets/shared/ProjectEditorialSplit.svelte";
  import ProjectEditorialStatement from "$lib/components/projets/shared/ProjectEditorialStatement.svelte";
  import ProjectEditorialMobileShowcase from "$lib/components/projets/shared/ProjectEditorialMobileShowcase.svelte";
  import ProjectEditorialHoverMosaic from "$lib/components/projets/shared/ProjectEditorialHoverMosaic.svelte";
  import ProjectLinksCarousel from "$lib/components/projets/shared/ProjectLinksCarousel.svelte";

  let introBandTheme = "theme-dark";
  let outroBandTheme = "theme-light";
  let firstRevealReached = false;
  let sliderActive = false;
  let lastRevealReached = false;

  function syncHeaderTone() {
    if (!browser) return;

    const tone = sliderActive
      ? "light"
      : lastRevealReached
        ? "light"
        : firstRevealReached
          ? "dark"
          : "light";

    window.dispatchEvent(
      new CustomEvent("project-header-tone", {
        detail: { tone }
      })
    );
  }

  function handleIntroThemeChange(event) {
    introBandTheme = event.detail?.theme === "light" ? "theme-light" : "theme-dark";
    firstRevealReached = introBandTheme === "theme-light";
    syncHeaderTone();
  }

  function handleOutroThemeChange(event) {
    outroBandTheme = event.detail?.theme === "dark" ? "theme-dark" : "theme-light";
    lastRevealReached = outroBandTheme === "theme-dark";
    syncHeaderTone();
  }

  function handleSliderActiveChange(event) {
    sliderActive = !!event.detail?.active;
    syncHeaderTone();
  }

  onMount(() => {
    syncHeaderTone();
  });

  onDestroy(() => {
    if (!browser) return;
    window.dispatchEvent(new CustomEvent("project-header-tone", { detail: { tone: null } }));
  });
</script>

<div class={`project-theme-band ${introBandTheme}`}>
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
  />

  <ProjectScrollScaleReveal
    image="/images/telephone2.webp"
    alt="Image immersive du projet 1"
    startBackground="#000"
    endBackground="#f7f5f1"
    snapBackground={true}
    themeBeforeSwitch="dark"
    themeAfterSwitch="light"
    on:themechange={handleIntroThemeChange}
  />

  <ProjectEditorialRole
    title="Notre rôle"
    images={[
      { src: "/images/telephone2.webp", alt: "Composition visuelle large du projet 1" },
      { src: "/images/serein_design.webp", alt: "Univers principal du projet 1" }
    ]}
    items={[
      {
        title: "Website UX et UI Design",
        text: "Un parcours plus clair, plus direct et plus calme, pensé pour mieux guider la lecture."
      },
      {
        title: "Direction visuelle",
        text: "Un langage plus net, plus premium, avec davantage d'air et une hiérarchie plus juste."
      },
      {
        title: "Déploiement mobile",
        text: "Une adaptation précise pour garder la même tenue sur des surfaces plus serrées."
      }
    ]}
  />
</div>

<div class="project-theme-band theme-light">
  <ProjectEditorialSplit
    title="Interface mobile"
    text="Une présence plus simple et plus lisible. Le projet garde sa clarté jusque dans les vues les plus rapprochées."
    image="/images/telephone3.webp"
    alt="Vue mobile projet 1"
    mediaMinHeight="52.5rem"
  />

  <ProjectEditorialStatement
    eyebrow="Système visuel"
    text="Le projet repose surtout sur les rapports d'échelle, la respiration entre les blocs et une lecture plus ouverte."
  />

  <ProjectEditorialSplit
    title="Vue desktop"
    text="Sur desktop, le système reste sobre et très lisible. Les espacements et les rapports de taille portent l'ensemble."
    image="/images/telephone2.webp"
    alt="Vue desktop projet 1"
    reverse={true}
  />
</div>

<ProjectStorySlider
  on:slideractivechange={handleSliderActiveChange}
  slides={[
    {
      label: "Identité",
      title: "Clarifier",
      text: "Une base plus nette. Une hiérarchie plus calme.",
      image: "/images/telephone3.webp"
    },
    {
      label: "Direction artistique",
      title: "Cadrer",
      text: "Des images plus ouvertes. Un territoire plus précis.",
      image: "/images/serein_design.webp"
    },
    {
      label: "UI design",
      title: "Déployer",
      text: "Une interface simple. Une continuité sans surcharge.",
      image: "/images/telephone2.webp"
    }
  ]}
/>

<div class="project-theme-band theme-light">
  <ProjectEditorialMobileShowcase
    text="Le mobile devient ici un vrai support d'expression, pas une simple adaptation plus compacte."
    leftImage="/images/telephone2.webp"
    leftAlt="Interface mobile verticale projet 1"
    rightImage="/images/telephone3.webp"
    rightAlt="Mise en situation mobile projet 1"
    mediaMinHeight="46.5rem"
  />
</div>

<div class={`project-theme-band ${outroBandTheme}`}>
  <ProjectEditorialHoverMosaic
    text="Un grand plan d'ouverture, puis deux vues plus proches qui gardent le même calme visuel avec une interaction discrète au survol."
    feature={{
      src: "/images/serein_design.webp",
      alt: "Grand visuel projet 1",
      titleLeft: "Serein",
      titleRight: "Design",
      hoverImages: [
        { src: "/images/telephone3.webp", alt: "Aperçu mobile projet 1" },
        { src: "/images/serein_design.webp", alt: "Aperçu identité projet 1" },
        { src: "/images/telephone2.webp", alt: "Aperçu desktop projet 1" }
      ]
    }}
    items={[
      {
        src: "/images/telephone3.webp",
        alt: "Vue mobile projet 1",
        titleLeft: "Mobile",
        titleRight: "System",
        hoverImages: [
          { src: "/images/telephone2.webp", alt: "Détail mobile projet 1" },
          { src: "/images/serein_design.webp", alt: "Univers projet 1" },
          { src: "/images/serein_design.webp", alt: "Hero projet 1" }
        ]
      },
      {
        src: "/images/telephone2.webp",
        alt: "Vue desktop projet 1",
        titleLeft: "Desktop",
        titleRight: "Flow",
        hoverImages: [
          { src: "/images/serein_design.webp", alt: "Détail identité projet 1" },
          { src: "/images/telephone3.webp", alt: "Vue mobile projet 1" },
          { src: "/images/telephone2.webp", alt: "Autre vue mobile projet 1" }
        ]
      }
    ]}
  />

  <ProjectScrollScaleReveal
    image="/images/telephone2.webp"
    alt="Transition de fin du projet 1"
    reverse={true}
    sectionHeight={168}
    startBackground="#f7f5f1"
    endBackground="#000"
    snapBackground={true}
    themeBeforeSwitch="light"
    themeAfterSwitch="dark"
    on:themechange={handleOutroThemeChange}
  />

  <ProjectLinksCarousel
    currentPage="projet1"
  />
</div>
