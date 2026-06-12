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
    title="Moovy"
    image="/images/moovy.webp"
    mobileImage="/images/moovy_mobile.webp"
    metaBlocks={[
      { label: "Date", value: "2025 - Present" },
      { label: "Localisation", value: "Digital" },
      {
        label: "Services",
        value: ["UX Design", "UI Design", "Site web"]
      }
    ]}
    ctaLabel="Visiter le site"
    ctaHref="https://moovy.agence3terres.fr"
    ctaExternal={true}
  />

  <ProjectThemeTrigger theme="light" offset={132} />

  <div class="project-theme-band">
    <ProjectEditorialRole
      title="Notre rôle"
      images={[
        { src: "/images/moovy.webp", alt: "Interface desktop de Moovy" },
        { src: "/images/moovy_mobile.webp", alt: "Interface mobile de Moovy" }
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

  <div class="project-theme-band">
    <ProjectEditorialSplit
      title="Interface mobile"
      text="Une presence plus simple et plus fluide. Le projet garde sa clarte jusque dans les vues les plus rapprochees."
      image="/images/moovy_mobile.webp"
      alt="Vue mobile du projet Moovy"
      mediaMinHeight="52.5rem"
    />

    <ProjectEditorialStatement
      eyebrow="Recommendation"
      text="Le projet repose sur une lecture immediate, quelques choix bien cadres et une recommandation qui arrive sans surcharge."
    />

    <ProjectEditorialSplit
      title="Vue desktop"
      text="Sur desktop, la plateforme ouvre davantage le catalogue tout en gardant un chemin tres lisible vers le bon film."
      image="/images/moovy.webp"
      alt="Vue desktop du projet Moovy"
      reverse={true}
    />
  </div>

  <ProjectStorySlider
    on:slideractivechange={handleSliderActiveChange}
    slides={[
      {
        label: "Identité",
        title: "Charte graphique",
        text: "Un langage visuel clair pour installer l'univers de Moovy.",
        image: "/images/moovy.webp",
        mobileImage: "/images/moovy_mobile.webp"
      },
      {
        label: "Logo",
        title: "Création de logo",
        text: "Un signe simple et reconnaissable, pensé pour tous les formats.",
        image: "/images/moovy_mobile.webp"
      },
      {
        label: "Digital",
        title: "Site web",
        text: "Une expérience fluide pour explorer et choisir sans surcharge.",
        image: "/images/moovy.webp",
        mobileImage: "/images/moovy_mobile.webp"
      }
    ]}
  />

  <div class="project-theme-band">
    <ProjectEditorialMobileShowcase
      text="Le mobile devait permettre de passer d'une envie vague a un choix concret avec le moins de friction possible."
      leftImage="/images/moovy_mobile.webp"
      leftAlt="Interface mobile verticale Moovy"
      rightImage="/images/moovy.webp"
      rightAlt="Interface desktop Moovy"
      mediaMinHeight="46.5rem"
    />
  </div>

  <ProjectThemeTrigger theme="dark" />

  <div class="project-theme-band">
    <ProjectEditorialMosaic
      text="Un premier plan large pour ouvrir l'univers, puis deux vues resserrees qui gardent la meme clarte."
      feature={{ src: "/images/moovy.webp", alt: "Grand visuel desktop de Moovy" }}
      items={[
        { src: "/images/moovy_mobile.webp", alt: "Vue mobile du projet Moovy" },
        { src: "/images/moovy.webp", alt: "Vue catalogue du projet Moovy" }
      ]}
    />

    <ProjectLinksCarousel currentPage="projet3" />
  </div>
</ProjectThemePage>
