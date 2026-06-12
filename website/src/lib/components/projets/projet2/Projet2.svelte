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

  <ProjectThemeTrigger theme="light" offset={132} />

  <div class="project-theme-band">
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

  <div class="project-theme-band">
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

  <div class="project-theme-band">
    <ProjectEditorialMobileShowcase
      text="L'experience mobile devait porter le recit avec la meme precision, la meme tenue et la meme sensation d'immersion."
      leftImage="/images/parfum3.webp"
      leftAlt="Interface projet 2 sur fond sombre"
      rightImage="/images/telephone_parfum.webp"
      rightAlt="Mise en situation mobile projet 2"
    />
  </div>

  <ProjectThemeTrigger theme="dark" />

  <div class="project-theme-band">
    <ProjectEditorialMosaic
      text="Le premier visuel ouvre le recit, puis deux plans plus proches gardent une meme retenue."
      feature={{ src: "/images/parfum4.webp", alt: "Grand visuel projet 2" }}
      items={[
        { src: "/images/parfum_ordinateur.webp", alt: "Vue desktop projet 2" },
        { src: "/images/parfum3.webp", alt: "Composition visuelle projet 2" }
      ]}
    />

    <ProjectLinksCarousel currentPage="projet2" />
  </div>
</ProjectThemePage>
