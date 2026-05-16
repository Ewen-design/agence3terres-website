<svelte:head>
  <title>Ludovic | Agence 3 Terres</title>
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
    title="Ludovic"
    image="/images/carte-copie.jpg"
    metaBlocks={[
      { label: "Date", value: "2025 - Present" },
      { label: "Localisation", value: "France" },
      {
        label: "Services",
        value: ["Site web", "Direction visuelle", "Editorial"]
      }
    ]}
    ctaLabel="Visiter le site"
  />

  <ProjectScrollScaleReveal
    image="/images/photo.webp"
    alt="Image immersive du projet Ludovic"
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
      { src: "/images/photo.webp", alt: "Composition visuelle large du projet Ludovic" },
      { src: "/images/carte-copie.jpg", alt: "Univers principal du projet Ludovic" }
    ]}
    items={[
      {
        title: "Site vitrine artiste",
        text: "Une structure sobre pour presenter les oeuvres peintes de Ludovic avec davantage d'espace et de tenue."
      },
      {
        title: "Direction editoriale",
        text: "Le rythme entre images, titres et respirations laisse la peinture prendre naturellement le premier plan."
      },
      {
        title: "Experience mobile",
        text: "Chaque oeuvre garde sa presence sur mobile grace a une lecture plus aeree et plus directe."
      }
    ]}
  />
</div>

<div class="project-theme-band theme-light">
  <ProjectEditorialSplit
    title="Interface mobile"
    text="Une presence plus calme et plus sensible. Le projet garde son espace jusque dans les vues les plus rapprochees."
    image="/images/carte-copie.jpg"
    alt="Vue mobile projet Ludovic"
    mediaMinHeight="52.5rem"
  />

  <ProjectEditorialStatement
    eyebrow="Matiere et respiration"
    text="Le projet avance surtout par contraste doux, par espaces justes et par une mise en page qui laisse les oeuvres respirer."
  />

  <ProjectEditorialSplit
    title="Vue desktop"
    text="Sur desktop, la structure reste volontairement retenue pour donner plus de place aux peintures et a leur detail."
    image="/images/livre.png"
    alt="Vue desktop projet Ludovic"
    reverse={true}
  />
</div>

<ProjectStorySlider
  on:slideractivechange={handleSliderActiveChange}
  slides={[
    {
      label: "Direction artistique",
      title: "Epurer",
      text: "Moins d'effets. Plus de respiration.",
      image: "/images/carte-copie.jpg"
    },
    {
      label: "Editorial",
      title: "Cadencer",
      text: "Un rythme plus juste entre image, texte et vide.",
      image: "/images/livre.png"
    },
    {
      label: "Site web",
      title: "Presenter",
      text: "Une vitrine claire pour laisser la peinture prendre la place.",
      image: "/images/photo.webp"
    }
  ]}
/>

<div class="project-theme-band theme-light">
  <ProjectEditorialMobileShowcase
    text="Le mobile devait rester discret pour que la matiere des oeuvres et la lecture des series gardent toute leur presence."
    leftImage="/images/photo.webp"
    leftAlt="Interface mobile verticale Ludovic"
    rightImage="/images/carte-copie.jpg"
    rightAlt="Mise en situation mobile Ludovic"
    mediaMinHeight="46.5rem"
  />
</div>

<div class={`project-theme-band ${outroBandTheme}`}>
  <ProjectEditorialHoverMosaic
    text="Un premier visuel plus ouvert, puis deux plans plus proches qui gardent le meme calme avec une interaction lente et discrete au survol."
    feature={{
      src: "/images/photo.webp",
      alt: "Grand visuel projet Ludovic",
      titleLeft: "Art",
      titleRight: "Space",
      hoverImages: [
        { src: "/images/carte-copie.jpg", alt: "Apercu oeuvre Ludovic" },
        { src: "/images/livre.png", alt: "Apercu editorial Ludovic" },
        { src: "/images/photo.webp", alt: "Apercu grand format Ludovic" }
      ]
    }}
    items={[
      {
        src: "/images/carte-copie.jpg",
        alt: "Vue oeuvre projet Ludovic",
        titleLeft: "Paint",
        titleRight: "Detail",
        hoverImages: [
          { src: "/images/photo.webp", alt: "Detail oeuvre Ludovic" },
          { src: "/images/livre.png", alt: "Vue editoriale Ludovic" },
          { src: "/images/carte-copie.jpg", alt: "Hero projet Ludovic" }
        ]
      },
      {
        src: "/images/livre.png",
        alt: "Vue desktop projet Ludovic",
        titleLeft: "Studio",
        titleRight: "Flow",
        hoverImages: [
          { src: "/images/carte-copie.jpg", alt: "Détail oeuvre Ludovic" },
          { src: "/images/photo.webp", alt: "Vue large Ludovic" },
          { src: "/images/livre.png", alt: "Autre vue editoriale Ludovic" }
        ]
      }
    ]}
  />

  <ProjectScrollScaleReveal
    image="/images/carte-copie.jpg"
    alt="Transition de fin du projet Ludovic"
    reverse={true}
    sectionHeight={168}
    startBackground="#f7f5f1"
    endBackground="#000"
    snapBackground={true}
    themeBeforeSwitch="light"
    themeAfterSwitch="dark"
    on:themechange={handleOutroThemeChange}
  />

  <ProjectLinksCarousel currentPage="projet4" />
</div>
