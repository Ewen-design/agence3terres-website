<script>
  import ProjectThemePage from "$lib/components/projets/shared/ProjectThemePage.svelte";
  import ProjectHeroProjetsStyle from "$lib/components/projets/shared/ProjectHeroProjetsStyle.svelte";
  import ProjectEditorialRole from "$lib/components/projets/shared/ProjectEditorialRole.svelte";
  import ProjectEditorialSplit from "$lib/components/projets/shared/ProjectEditorialSplit.svelte";
  import ProjectEditorialStatement from "$lib/components/projets/shared/ProjectEditorialStatement.svelte";
  import ProjectEditorialMobileShowcase from "$lib/components/projets/shared/ProjectEditorialMobileShowcase.svelte";
  import ProjectEditorialMosaic from "$lib/components/projets/shared/ProjectEditorialMosaic.svelte";
  // L'accordéon de verre de la page à propos, réutilisé tel quel.
  import EditorialAccordionShowcase from "$lib/components/apropos/AboutFocusEditorialShowcase.svelte";
  import ParallaxGallery2 from "$lib/components/home/ParallaxGallery2.svelte";
  import { videoSources } from "$lib/components/shared/media/videoSources.js";

  // Mêmes visuels (optimisés .webp) que la page Travail, en excluant Moovy
  // (le projet courant). Évite aussi les .jpg lourds qui chargeaient mal ici.
  const otherProjects = [
    { title: "Lybra", image: "/images/lybra-cartes.webp", href: "/projet8" },
    { title: "JustX", image: "/images/justx.webp", href: "/projet5" },
    { title: "JustX Fitness", image: "/images/justx_app.webp", href: "/projet7" },
    { title: "Mission X", image: "/images/missionX5.webp", href: "/projet6" },
    { title: "Ludosphères", image: "/images/ludo-tablette.webp", href: "/projet4" },
    { title: "Serein Design", image: "/images/serein_design.webp", href: "/projet1" },
    { title: "Votre projet ?", image: "/images/agence.webp", href: "/contact", cta: "Nous contacter" }
  ];
</script>

<ProjectThemePage>
  <ProjectHeroProjetsStyle
    title="Moovy"
    image="/images/tel_moovy2.webp"
    mobileImage="/images/tel_moovy2.webp"
    video={videoSources("moovy-hero")}
    mobileVideo={videoSources("moovy-hero-mobile")}
    videoPoster="/videos/moovy-hero-poster.webp"
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


  <div class="project-theme-band">
    <ProjectEditorialRole
      title="Notre rôle"
      images={[
        { src: "/images/moovy_page.webp", alt: "Interface desktop de Moovy" },
        {
          video: videoSources("moovy-parcours"),
          poster: "/videos/moovy-parcours-poster.webp",
          alt: "Parcours de recommandation de Moovy sur mobile"
        }
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

  <div class="project-theme-band theme-deep">
    <ProjectEditorialStatement
      eyebrow="Recommandation"
      text="Le projet repose sur une <span class='hl'>lecture immédiate</span>, quelques choix bien cadrés et une <span class='hl'>recommandation</span> qui arrive sans surcharge."
    />
  </div>

  <!-- Les vues mobile et desktop s'enchaînaient en deux blocs bâtis pareil :
       elles passent dans l'accordéon de la page à propos, une capture par
       volet et le texte qui s'ouvre sur place. -->
  <div class="project-theme-band">
    <EditorialAccordionShowcase
      interval={11000}
      slides={[
        {
          label: "Interface mobile",
          text: "Une présence plus <span class='hl'>simple</span> et plus fluide. Le projet garde sa clarté jusque dans les vues les plus rapprochées.",
          image: "/images/moovy_recherche.webp",
          alt: "Vue mobile du projet Moovy"
        },
        {
          label: "Vue desktop",
          text: "Sur desktop, la plateforme ouvre davantage le <span class='hl'>catalogue</span> tout en gardant un chemin très lisible vers le bon film.",
          image: "/images/moovy_mac.webp",
          alt: "Vue desktop du projet Moovy"
        },
        {
          label: "La fiche film",
          text: "Affiche, durée, genre, synopsis : tout ce qu'il faut pour <span class='hl'>décider</span>, et rien de plus. La recommandation suivante n'est jamais qu'à un geste.",
          image: "/images/tel_moovy2.webp",
          alt: "Fiche film de Moovy sur mobile"
        }
      ]}
    />
  </div>

  <div class="project-theme-band">
    <ProjectEditorialMobileShowcase
      text="Le mobile devait permettre de passer d'une envie vague a un <span class='hl'>choix concret</span> avec le <span class='hl'>moins de friction</span> possible."
      leftImage="/images/moovy_ipad.webp"
      leftAlt="Interface mobile verticale Moovy"
      rightVideo={videoSources("moovy-fiche-film")}
      rightPoster="/videos/moovy-fiche-film-poster.webp"
      rightAlt="Fiche film de Moovy sur mobile"
      mediaMinHeight="46.5rem"
    />
  </div>


  <div class="project-theme-band theme-deep">
    <ProjectEditorialMosaic
      text="Un <span class='hl'>premier plan large</span> pour ouvrir l'univers, puis deux vues resserrees qui gardent la meme <span class='hl'>clarte</span>."
      feature={{ src: "/images/affiche-moovy.webp", alt: "Grand visuel desktop de Moovy" }}
      items={[
        { src: "/images/moovy-ordi-bleu.webp", alt: "Vue mobile du projet Moovy" },
        { src: "/images/moovy-ordi.webp", alt: "Vue catalogue du projet Moovy" }
      ]}
    />

    <ParallaxGallery2
      items={otherProjects}
      ctaLabel="Voir le projet"
      ariaLabelPrefix="Voir le projet"
      introMain="Découvrez "
      introMuted={"nos<br>autres projets."}
      strongIntro
    />
  </div>
</ProjectThemePage>
