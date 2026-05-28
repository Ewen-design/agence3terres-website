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
      { label: "Localisation", value: "Japon" },
      {
        label: "Services",
        value: ["Site web", "Narration", "Direction artistique"]
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
        title: "Conception du site web",
        text: "Nous avons structure le site pour retracer un fragment d'histoire japonaise avec une lecture plus claire et plus immersive."
      },
      {
        title: "Narration editoriale",
        text: "Le rythme entre textes, images et respirations sert le recit sans l'alourdir."
      },
      {
        title: "Experience mobile",
        text: "Chaque ecran prolonge l'histoire avec precision, tout en gardant une lecture simple et stable."
      }
    ]}
  />
</div>

<div class="project-theme-band theme-light">
  <ProjectEditorialSplit
    title="Interface mobile"
    text="Une lecture plus recueillie et plus nette. Le projet garde sa tenue jusque dans les vues les plus rapprochees."
    image="/images/telephone_parfum.webp"
    alt="Vue mobile projet 2"
  />

  <ProjectEditorialStatement
    eyebrow="Recit et rythme"
    text="Le projet avance par contraste mesure, par respiration editoriale et par une image qui soutient le recit sans le couvrir."
  />

  <ProjectEditorialSplit
    title="Vue desktop"
    text="Sur desktop, le site reste net et immersif. Les rapports d'echelle, les marges et la densite d'image portent l'ensemble."
    image="/images/parfum_ordinateur.webp"
    alt="Vue desktop projet 2"
    reverse={true}
  />
</div>

<ProjectStorySlider
  on:slideractivechange={handleSliderActiveChange}
  slides={[
    {
      label: "Site web",
      title: "Installer",
      text: "Une ambiance immediate. Une lecture plus recueillie.",
      image: "/images/parfum2.webp"
    },
    {
      label: "Narration",
      title: "Tenir",
      text: "Un fil editorial plus clair. Un rythme plus juste.",
      image: "/images/parfum3.webp"
    },
    {
      label: "Direction artistique",
      title: "Prolonger",
      text: "L'histoire continue dans l'ecran sans perdre la lisibilite.",
      image: "/images/parfum_ordinateur.webp"
    }
  ]}
/>

<div class="project-theme-band theme-light">
  <ProjectEditorialMobileShowcase
    text="L'experience mobile devait porter le recit avec la meme precision, la meme tenue et la meme sensation d'immersion."
    leftImage="/images/parfum3.webp"
    leftAlt="Interface projet 2 sur fond sombre"
    rightImage="/images/telephone_parfum.webp"
    rightAlt="Mise en situation mobile projet 2"
  />
</div>

<div class={`project-theme-band ${outroBandTheme}`}>
  <ProjectEditorialHoverMosaic
    text="Le premier visuel ouvre le recit, puis deux plans plus proches gardent une meme retenue avec un hover lent, sombre et immersif."
    startBackground="#f7f5f1"
    endBackground="#000"
    themeBeforeSwitch="light"
    themeAfterSwitch="dark"
    on:themechange={handleOutroThemeChange}
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

  <ProjectLinksCarousel
    currentPage="projet2"
  />
</div>
