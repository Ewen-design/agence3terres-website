<svelte:head>
  <title>Projet 2 | Agence 3 Terres</title>
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
    title="Hansatsu"
    image="/images/parfum_rouge.webp"
    metaBlocks={[
      { label: "Date", value: "2025 - Present" },
      { label: "Localisation", value: "Digital" },
      {
        label: "Services",
        value: ["Direction artistique", "Narration", "UI Design"]
      }
    ]}
    ctaLabel="Visiter le site"
  />

  <ProjectScrollScaleReveal
    image="/images/parfum2.webp"
    alt="Image immersive du projet 2"
    startScale={0.84}
    endScale={1.02}
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
      { src: "/images/parfum4.webp", alt: "Composition visuelle large du projet 2" },
      { src: "/images/parfum2.webp", alt: "Univers principal du projet 2" }
    ]}
    items={[
      {
        title: "Direction artistique",
        text: "Une ambiance plus dense, plus sensorielle, pensée pour faire ressentir avant d'expliquer."
      },
      {
        title: "Narration digitale",
        text: "Un rythme plus assumé entre images, espaces et points d'accroche éditoriaux."
      },
      {
        title: "Expérience mobile",
        text: "Un travail d'écran pensé pour prolonger l'intensité du projet sans perdre la lecture."
      }
    ]}
  />
</div>

<div class="project-theme-band theme-light">
  <ProjectEditorialSplit
    title="Interface mobile"
    text="Une présence plus dense et plus sensorielle. Le projet garde son intensité jusque dans les vues les plus rapprochées."
    image="/images/telephone_parfum.webp"
    alt="Vue mobile projet 2"
  />

  <ProjectEditorialStatement
    eyebrow="Mouvement et rythme"
    text="Le projet avance surtout par tension visuelle, densité maîtrisée et contraste entre grands vides et images très présentes."
  />

  <ProjectEditorialSplit
    title="Vue desktop"
    text="Sur desktop, le système reste net et immersif. Les rapports d'échelle et la densité d'image portent l'ensemble."
    image="/images/parfum_ordinateur.webp"
    alt="Vue desktop projet 2"
    reverse={true}
  />
</div>

<ProjectStorySlider
  on:slideractivechange={handleSliderActiveChange}
  slides={[
    {
      label: "Direction artistique",
      title: "Installer",
      text: "Une ambiance immédiate. Une image plus dense.",
      image: "/images/parfum2.webp"
    },
    {
      label: "Identité",
      title: "Tenir",
      text: "Un territoire plus singulier. Un rythme plus juste.",
      image: "/images/parfum3.webp"
    },
    {
      label: "UI design",
      title: "Prolonger",
      text: "L'intensité continue dans l'écran sans perdre la lecture.",
      image: "/images/parfum_ordinateur.webp"
    }
  ]}
/>

<div class="project-theme-band theme-light">
  <ProjectEditorialMobileShowcase
    text="L'expérience mobile devait porter le projet avec la même intensité, la même précision et la même sensation d'immersion."
    leftImage="/images/parfum3.webp"
    leftAlt="Interface projet 2 sur fond sombre"
    rightImage="/images/telephone_parfum.webp"
    rightAlt="Mise en situation mobile projet 2"
  />
</div>

<div class={`project-theme-band ${outroBandTheme}`}>
  <ProjectEditorialHoverMosaic
    text="Le premier visuel prend presque tout l'écran, puis deux plans gardent un rythme régulier avec un hover lent, sombre et plus sensoriel."
    feature={{
      src: "/images/parfum4.webp",
      alt: "Grand visuel projet 2",
      titleLeft: "Visual",
      titleRight: "Tension",
      hoverImages: [
        { src: "/images/parfum2.webp", alt: "Aperçu immersif projet 2" },
        { src: "/images/parfum3.webp", alt: "Aperçu sensoriel projet 2" },
        { src: "/images/parfum_ordinateur.webp", alt: "Aperçu desktop projet 2" }
      ]
    }}
    items={[
      {
        src: "/images/parfum_ordinateur.webp",
        alt: "Vue desktop projet 2",
        titleLeft: "Desktop",
        titleRight: "Scene",
        hoverImages: [
          { src: "/images/parfum3.webp", alt: "Détail visuel projet 2" },
          { src: "/images/telephone_parfum.webp", alt: "Vue mobile projet 2" },
          { src: "/images/parfum4.webp", alt: "Univers projet 2" }
        ]
      },
      {
        src: "/images/parfum3.webp",
        alt: "Composition visuelle projet 2",
        titleLeft: "Visual",
        titleRight: "Rhythm",
        hoverImages: [
          { src: "/images/parfum2.webp", alt: "Aperçu immersif projet 2" },
          { src: "/images/parfum_ordinateur.webp", alt: "Vue desktop projet 2" },
          { src: "/images/telephone_parfum.webp", alt: "Interface mobile projet 2" }
        ]
      }
    ]}
  />

  <ProjectScrollScaleReveal
    image="/images/parfum2.webp"
    alt="Transition de fin du projet 2"
    reverse={true}
    sectionHeight={168}
    startScale={0.84}
    endScale={1.02}
    startBackground="#f7f5f1"
    endBackground="#000"
    snapBackground={true}
    themeBeforeSwitch="light"
    themeAfterSwitch="dark"
    on:themechange={handleOutroThemeChange}
  />

  <ProjectLinksCarousel
    currentPage="projet2"
  />
</div>
