<script>
  import ProjectThemePage from "$lib/components/projets/shared/ProjectThemePage.svelte";
  import ProjectThemeTrigger from "$lib/components/projets/shared/ProjectThemeTrigger.svelte";
  import ProjectHeroProjetsStyle from "$lib/components/projets/shared/ProjectHeroProjetsStyle.svelte";
  import ProjectEditorialRole from "$lib/components/projets/shared/ProjectEditorialRole.svelte";
  import ProjectEditorialSplit from "$lib/components/projets/shared/ProjectEditorialSplit.svelte";
  import ProjectEditorialStatement from "$lib/components/projets/shared/ProjectEditorialStatement.svelte";
  import ProjectEditorialMobileShowcase from "$lib/components/projets/shared/ProjectEditorialMobileShowcase.svelte";
  import ProjectEditorialMosaic from "$lib/components/projets/shared/ProjectEditorialMosaic.svelte";
  import ParallaxGallery2 from "$lib/components/home/ParallaxGallery2.svelte";

  // Mêmes visuels (optimisés .webp) que la page Travail, en excluant Moovy
  // (le projet courant). Évite aussi les .jpg lourds qui chargeaient mal ici.
  const otherProjects = [
    { title: "JustX", image: "/images/justx.webp", href: "/projet5" },
    { title: "JustX Fitness", image: "/images/justx_app.webp", href: "/projet7" },
    { title: "Mission X", image: "/images/missionX5.webp", href: "/projet6" },
    { title: "Ludosphères", image: "/images/ludo.webp", href: "/projet4" },
    { title: "Serein Design", image: "/images/serein_design.webp", href: "/projet1" },
    { title: "Votre projet ?", image: "/images/agence.webp", href: "/contact", cta: "Nous contacter" }
  ];
</script>

<ProjectThemePage>
  <ProjectHeroProjetsStyle
    title="Moovy"
    image="/images/tel_moovy2.webp"
    mobileImage="/images/tel_moovy2.webp"
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
        { src: "/images/moovy_page.webp", alt: "Interface desktop de Moovy" },
        { src: "/images/tel_moovy3.webp", alt: "Interface mobile de Moovy" }
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
      image="/images/moovy_recherche.webp"
      alt="Vue mobile du projet Moovy"
      mediaMinHeight="52.5rem"
    />

    <ProjectEditorialStatement
      eyebrow="Recommendation"
      text="Le projet repose sur une <span class='hl'>lecture immediate</span>, quelques choix bien cadres et une <span class='hl'>recommandation</span> qui arrive sans surcharge."
    />

    <ProjectEditorialSplit
      title="Vue desktop"
      text="Sur desktop, la plateforme ouvre davantage le catalogue tout en gardant un chemin tres lisible vers le bon film."
      image="/images/moovy_mac.webp"
      alt="Vue desktop du projet Moovy"
      reverse={true}
    />
  </div>

  <div class="project-theme-band">
    <ProjectEditorialMobileShowcase
      text="Le mobile devait permettre de passer d'une envie vague a un <span class='hl'>choix concret</span> avec le <span class='hl'>moins de friction</span> possible."
      leftImage="/images/moovy_ipad.webp"
      leftAlt="Interface mobile verticale Moovy"
      rightImage="/images/tel_moovy3.webp"
      rightAlt="Interface desktop Moovy"
      mediaMinHeight="46.5rem"
    />
  </div>

  <ProjectThemeTrigger theme="dark" />

  <div class="project-theme-band">
    <ProjectEditorialMosaic
      text="Un <span class='hl'>premier plan large</span> pour ouvrir l'univers, puis deux vues resserrees qui gardent la meme <span class='hl'>clarte</span>."
      feature={{ src: "/images/affiche-moovy.webp", alt: "Grand visuel desktop de Moovy" }}
      items={[
        { src: "/images/moovy_mobile.webp", alt: "Vue mobile du projet Moovy" },
        { src: "/images/moovy-ordi.webp", alt: "Vue catalogue du projet Moovy" }
      ]}
    />

    <ParallaxGallery2
      items={otherProjects}
      ctaLabel="Voir le projet"
      ariaLabelPrefix="Voir le projet"
      introMain="Découvrez"
      introMuted="nos autres projets."
    />
  </div>
</ProjectThemePage>
