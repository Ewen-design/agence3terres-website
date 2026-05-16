<svelte:head>
  <title>Moovy | Agence 3 Terres</title>
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
    title="Moovy"
    image="/images/telephone_main.webp"
    metaBlocks={[
      { label: "Date", value: "2025 - Present" },
      { label: "Localisation", value: "Digital" },
      {
        label: "Services",
        value: ["UX Design", "UI Design", "Site web"]
      }
    ]}
    ctaLabel="Visiter le site"
  />

  <ProjectScrollScaleReveal
    image="/images/ordinateur.webp"
    alt="Image immersive du projet Moovy"
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
      { src: "/images/ordinateur.webp", alt: "Composition visuelle large de Moovy" },
      { src: "/images/telephone_main.webp", alt: "Univers principal de Moovy" }
    ]}
    items={[
      {
        title: "Architecture de parcours",
        text: "Une structure plus directe pour naviguer entre large selection de films et recommandation guidee."
      },
      {
        title: "Recommendation film",
        text: "Un questionnaire simple aide a faire ressortir rapidement le bon film selon l'envie du moment."
      },
      {
        title: "Experience mobile",
        text: "Le projet garde la meme fluidite sur mobile pour consulter, filtrer et choisir sans friction."
      }
    ]}
  />
</div>

<div class="project-theme-band theme-light">
  <ProjectEditorialSplit
    title="Interface mobile"
    text="Une presence plus simple et plus fluide. Le projet garde sa clarte jusque dans les vues les plus rapprochees."
    image="/images/telephone2.webp"
    alt="Vue mobile projet Moovy"
    mediaMinHeight="52.5rem"
  />

  <ProjectEditorialStatement
    eyebrow="Recommendation"
    text="Le projet repose sur une lecture immediate, quelques choix bien cadres et une recommandation qui arrive sans surcharge."
  />

  <ProjectEditorialSplit
    title="Vue desktop"
    text="Sur desktop, la plateforme ouvre davantage le catalogue tout en gardant un chemin tres lisible vers le bon film."
    image="/images/ordinateur.webp"
    alt="Vue desktop projet Moovy"
    reverse={true}
  />
</div>

<ProjectStorySlider
  on:slideractivechange={handleSliderActiveChange}
  slides={[
    {
      label: "Catalogue",
      title: "Ouvrir",
      text: "Une selection large. Une lecture immediate.",
      image: "/images/ordinateur.webp"
    },
    {
      label: "Recommendation",
      title: "Qualifier",
      text: "Quelques questions. Une orientation plus juste.",
      image: "/images/telephone_main.webp"
    },
    {
      label: "Interface",
      title: "Aboutir",
      text: "Un parcours rapide. Une decision sans surcharge.",
      image: "/images/telephone2.webp"
    }
  ]}
/>

<div class="project-theme-band theme-light">
  <ProjectEditorialMobileShowcase
    text="Le mobile devait permettre de passer d'une envie vague a un choix concret avec le moins de friction possible."
    leftImage="/images/telephone_main.webp"
    leftAlt="Interface mobile verticale Moovy"
    rightImage="/images/telephone2.webp"
    rightAlt="Mise en situation mobile Moovy"
    mediaMinHeight="46.5rem"
  />
</div>

<div class={`project-theme-band ${outroBandTheme}`}>
  <ProjectEditorialHoverMosaic
    text="Un premier plan plus large pour ouvrir l'univers, puis deux vues resserrees qui gardent la meme clarte avec une interaction discrete au survol."
    feature={{
      src: "/images/ordinateur.webp",
      alt: "Grand visuel projet Moovy",
      titleLeft: "Movie",
      titleRight: "Flow",
      hoverImages: [
        { src: "/images/telephone_main.webp", alt: "Apercu mobile Moovy" },
        { src: "/images/ordinateur.webp", alt: "Apercu catalogue Moovy" },
        { src: "/images/telephone2.webp", alt: "Apercu questionnaire Moovy" }
      ]
    }}
    items={[
      {
        src: "/images/telephone_main.webp",
        alt: "Vue mobile projet Moovy",
        titleLeft: "Mobile",
        titleRight: "Choice",
        hoverImages: [
          { src: "/images/telephone2.webp", alt: "Detail mobile Moovy" },
          { src: "/images/ordinateur.webp", alt: "Vue desktop Moovy" },
          { src: "/images/telephone_main.webp", alt: "Hero projet Moovy" }
        ]
      },
      {
        src: "/images/telephone2.webp",
        alt: "Questionnaire projet Moovy",
        titleLeft: "Smart",
        titleRight: "Pick",
        hoverImages: [
          { src: "/images/ordinateur.webp", alt: "Vue catalogue Moovy" },
          { src: "/images/telephone_main.webp", alt: "Vue mobile Moovy" },
          { src: "/images/telephone2.webp", alt: "Autre vue mobile Moovy" }
        ]
      }
    ]}
  />

  <ProjectScrollScaleReveal
    image="/images/telephone_main.webp"
    alt="Transition de fin du projet Moovy"
    reverse={true}
    sectionHeight={168}
    startBackground="#f7f5f1"
    endBackground="#000"
    snapBackground={true}
    themeBeforeSwitch="light"
    themeAfterSwitch="dark"
    on:themechange={handleOutroThemeChange}
  />

  <ProjectLinksCarousel currentPage="projet3" />
</div>
