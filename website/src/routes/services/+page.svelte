<script>
  import ProjectThemePage from "$lib/components/projets/shared/ProjectThemePage.svelte";
  import ProjectThemeTrigger from "$lib/components/projets/shared/ProjectThemeTrigger.svelte";
  import PolesHero from "$lib/components/poles/PolesHero.svelte";
  import SectionLead from "$lib/components/poles/SectionLead.svelte";
  import ShowcaseCards from "$lib/components/poles/ShowcaseCards.svelte";
  import MediaSlider from "$lib/components/poles/MediaSlider.svelte";
  import EditorialFeature from "$lib/components/poles/EditorialFeature.svelte";
  import AboutEditorialSingleShowcase from "$lib/components/apropos/AboutEditorialSingleShowcase.svelte";

  const digitalCards = [
    { image: "/images/tel_moovy.webp", alt: "Plateforme Moovy", title: "Moovy", subtitle: "Plateforme web", href: "projet3", tags: ["Site web", "Design d'interface", "Développement"] },
    { image: "/images/app-justx.webp", alt: "Application JustX Fitness", title: "JustX Fitness", subtitle: "Application mobile", href: "projet7", tags: ["Application mobile", "Design d'interface", "Développement"] }
  ];

  const designCards = [
    { image: "/images/ludo.webp", alt: "Projet Ludosphères", title: "Ludosphères", subtitle: "Identité & charte", href: "projet4", tags: ["Logo & charte", "Direction artistique", "Naming"] },
    { image: "/images/justx_textile.webp", alt: "Projet JustX", title: "JustX", subtitle: "Identité de marque", href: "projet5", tags: ["Logo & charte", "Naming", "Stratégie"] }
  ];

  const studioCards = [
    { image: "/images/justx_app.webp", alt: "Projet JustX", title: "JustX", subtitle: "Gestion des réseaux sociaux", href: "projet5", tags: ["Réseaux sociaux", "Contenu & montage"] },
    { image: "/images/ludo.webp", alt: "Projet Ludosphères", title: "Ludosphères", subtitle: "Gestion des réseaux sociaux et montage vidéo", href: "projet4", tags: ["Événementiel", "Réseaux sociaux"] }
  ];

  // Digital — sites web & applications : parcours, interface, responsive, dev.
  const digitalSlides = [
    { image: "/images/moovy-ordi.webp", alt: "Site web desktop", label: "Site web", caption: "Des expériences digitales modernes, pensées comme un parcours fluide qui guide vers l'essentiel." },
    { image: "/images/moovy_page.webp", alt: "Design d'interface", label: "Design d'interface", caption: "Chaque écran est composé pour hiérarchiser l'information et guider le regard sans effort." },
    { image: "/images/justx-tel.webp", alt: "Vue mobile responsive", label: "Responsive & mobile", caption: "La même clarté et la même fluidité, du grand écran adapté à tous les supports." },
    { image: "/images/moovy_recherche.webp", alt: "Parcours et recherche", label: "Parcours & recherche", caption: "Des parcours stratégiques pensés pour guider l'utilisateur vers ses objectifs." },
    { image: "/images/app-justx.webp", alt: "Application mobile", label: "Application mobile", caption: "Des expériences d'application mobiles fluides et intuitives, pensées pour marquer et capter l'attention de l'utilisateur." },
  ];

  // Design — identité visuelle : logo, charte, typographie, système cohérent (+ naming & stratégie).
  const designSlides = [
     { image: "/images/naming.webp", alt: "Naming et fondations", label: "Naming & fondations", caption: "Un nom, un ton et des repères qui posent des bases solides pour la marque." },
    { image: "/images/logo-creation.webp", alt: "Logo", label: "Logo", caption: "Création de logo cohérent et déclinable, pensé pour installer une présence immédiate et mémorable." },
    { image: "/images/justx_couleurs.webp", alt: "Identité visuelle", label: "Identité visuelle", caption: "De la palette de couleurs, aux typographies, nous concevons un univers visuel cohérent, répondant aux valeurs de la marque." },
    { image: "/images/charte-typo.webp", alt: "Présentation de la typographie", label: "Charte éditoriale", caption: "Une nouvelle manière de communiquer en adaptant le ton et l'expérience." },
    { image: "/images/parfum_ordinateur.webp", alt: "Suivi stratégique", label: "Suivi & stratégie", caption: "Un accompagnement dans la durée mêlant stratégie, suivi détaillé et reportings, pour faire évoluer la marque avec cohérence." }
  ];

  // Studio — toute l'image de la marque : captation, DA, réseaux, contenu, 3D.
  const studioSlides = [
    { image: "/images/appareil_photo.webp", alt: "Captation photo et vidéo", label: "Captation & événements", caption: "Une présence événementielle plus forte afin de faire durer un moment inoubliable." },
    { image: "/images/justx-rs.webp", alt: "Réseaux sociaux", label: "Réseaux sociaux", caption: "Une présence sur les réseaux sociaux posant un univers en faisant connaître la marque." },
    { image: "/images/justx_textile.webp", alt: "Contenu et montage", label: "Contenu & montage", caption: "Nous créons des contenus vidéos et photos adaptables à chaque marque et à chaque cible." },
    { image: "/images/apple_justx.webp", alt: "Photo produit", label: "Photo produit", caption: "Des visuels soignés qui subliment produits et supports." }
  ];
</script>

<h1 class="seo-page-title">Nos services - Agence 3 Terres</h1>

<PolesHero
  label="Services"
  finalText="Nos trois pôles, digital, design et studio, permettent d'offrir un accompagnement complet et spécialisé à nos clients."
/>

<ProjectThemePage>
  <!-- ───────── Pôle 01 — Digital (fond noir) ───────── -->
  <div class="project-theme-band">
    <SectionLead lead="3 Terres Digital" />
    <ShowcaseCards cards={digitalCards} />
    <SectionLead
      text="Notre pôle digital conçoit des sites web et des applications sur mesure. De l'architecture de l'information au design d'interface jusqu'au développement, chaque projet est pensé pour toucher durablement une cible précise."
    />
    <AboutEditorialSingleShowcase
      showCue={false}
      background="#040404"
      text="Nos projets sont pensés pour s'adapter sur tous les supports, de manière à répondre aux besoins de nos clients."
      image="/images/justx_app.webp"
      alt="Application JustX Fitness"
      accentImage="/images/tel_moovy3.webp"
      accentAlt="Vue mobile Moovy"
    />
    <MediaSlider slides={digitalSlides} />
  </div>

  <!-- ───────── Pôle 02 — Design (fond blanc) ───────── -->
  <ProjectThemeTrigger theme="light" />

  <div class="project-theme-band">
    <SectionLead lead="3 Terres Design" />
    <ShowcaseCards cards={designCards} />
    <SectionLead
      text="Notre pôle design façonne l'identité visuelle de la marque : logo, charte graphique, typographie et système visuel cohérent. Une démarche à la fois créative et stratégique. Nous conseillons et accompagnons chaque marque, du naming au pilotage, pour lui donner une présence claire et durable."
    />
    <EditorialFeature
      image="/images/creation_logo_desktop.webp"
      alt="Création de logo et d'identité"
      secondaryImage="/images/carte_visite_desktop.webp"
      secondaryAlt="Papeterie et supports de marque"
      label="Système visuel complet"
      text="Nous concevons des systèmes visuels complets, pensés pour représenter la marque dans un univers global cohérent et moderne."
    />
    <MediaSlider slides={designSlides} />
  </div>

  <!-- ───────── Pôle 03 — Studio (fond bleu) ───────── -->
  <ProjectThemeTrigger theme="night" />

  <div class="project-theme-band">
    <SectionLead lead="3 Terres Studio" />
    <ShowcaseCards cards={studioCards} />
    <SectionLead
      text="Notre studio produit et orchestre toute l'image de la marque : captation photo et vidéo, couverture d'événements, création et gestion des réseaux sociaux, montage et création de contenu. Le tout au service d'une direction artistique claire et durable."
    />
    <EditorialFeature
      reverse={true}
      image="/images/appareil_photo.webp"
      alt="Captation photo et vidéo en studio"
      secondaryImage="/images/justx.webp"
      secondaryAlt="Direction artistique de contenu"
      label="Production de contenu"
      text="Une nouvelle manière de toucher un public ciblé, en produisant des contenus qui prolongent l'expérience de la marque, et intensifient une présence événementielle."
    />
    <MediaSlider slides={studioSlides} />
  </div>
</ProjectThemePage>

<style>
  /* Espacements propres à la page services (scopés : les composants partagés
     avec les pages projet ne sont pas affectés). */

  /* Plus de respiration entre les pôles : gros espace en tête des pôles 2 et 3. */
  .project-theme-band:not(:first-of-type) {
    padding-top: clamp(5rem, 9vw, 11rem);
  }

  /* Un peu plus d'air sous le grand titre du pôle, avant les deux cartes. */
  .project-theme-band :global(.sl:not(.sl--text-only)) {
    padding-bottom: clamp(3.5rem, 6vw, 6rem);
  }

  /* Un peu plus d'air sous le paragraphe d'intro, avant le bloc suivant. */
  .project-theme-band :global(.sl--text-only) {
    padding-bottom: clamp(3rem, 5vw, 5rem);
  }
</style>
