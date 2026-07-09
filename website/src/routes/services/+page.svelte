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
    { image: "/images/serein_design.webp", alt: "Projet Serein Design", title: "Serein Design", subtitle: "Identité & charte", href: "projet1", tags: ["Logo & charte", "Direction artistique"] },
    { image: "/images/justx.webp", alt: "Projet JustX", title: "JustX", subtitle: "Identité de marque", href: "projet5", tags: ["Logo & charte", "Naming", "Stratégie"] }
  ];

  const studioCards = [
    { image: "/images/missionX5.webp", alt: "Projet Mission X", title: "Mission X", subtitle: "Univers & 3D", href: "projet6", tags: ["Univers 3D", "Direction artistique"] },
    { image: "/images/apple_justx.webp", alt: "Projet Ludosphères", title: "Ludosphères", subtitle: "Site d'artiste", href: "projet4", tags: ["Site d'artiste", "Direction artistique"] }
  ];

  // Digital — sites web & applications : parcours, interface, responsive, dev.
  const digitalSlides = [
    { image: "/images/moovy_mac.webp", alt: "Site web desktop", label: "Site web", caption: "Des expériences digitales lisibles et sensibles, pensées comme un parcours fluide qui guide vers l'essentiel." },
    { image: "/images/moovy_page.webp", alt: "Design d'interface", label: "Design d'interface", caption: "Chaque écran est composé pour hiérarchiser l'information et guider le regard sans effort." },
    { image: "/images/tel_moovy2.webp", alt: "Vue mobile responsive", label: "Responsive & mobile", caption: "La même clarté et la même fluidité, du grand écran jusqu'aux vues les plus rapprochées." },
    { image: "/images/moovy_recherche.webp", alt: "Parcours et recherche", label: "Parcours & recherche", caption: "Une navigation directe : on trouve l'essentiel sans se perdre dans les menus." },
    { image: "/images/justx_fitness.webp", alt: "Application mobile", label: "Application mobile", caption: "Programmes, suivi et progression réunis dans une application claire et directe." },
    { image: "/images/moovy.webp", alt: "Recommandation produit", label: "Recommandation produit", caption: "Un moteur de recommandation qui arrive au bon moment, sans surcharge." }
  ];

  // Design — identité visuelle : logo, charte, typographie, système cohérent (+ naming & stratégie).
  const designSlides = [
    { image: "/images/creation_logo_desktop.webp", alt: "Logo et signe", label: "Logo & signe", caption: "Des signes simples et durables, pensés pour installer une présence immédiate et mémorable." },
    { image: "/images/justx_couleurs.webp", alt: "Identité visuelle", label: "Identité visuelle", caption: "Un territoire visuel complet — couleurs, typographies, compositions — pour une marque cohérente et reconnaissable." },
    { image: "/images/carte_visite_desktop.webp", alt: "Charte et papeterie", label: "Charte & papeterie", caption: "Du digital à l'imprimé, une même signature visuelle déclinée sur tous les supports." },
    { image: "/images/serein_design.webp", alt: "Univers de marque", label: "Univers de marque", caption: "Une identité calme, cohérente et fonctionnelle, pensée pour durer." },
    { image: "/images/logo_justx.webp", alt: "Naming et fondations", label: "Naming & fondations", caption: "Un nom, un ton et des repères clairs qui posent des bases solides pour la marque." },
    { image: "/images/parfum_ordinateur.webp", alt: "Suivi stratégique", label: "Suivi & stratégie", caption: "Un accompagnement dans la durée — stratégie, suivi détaillé et reportings — pour faire évoluer la marque avec cohérence." }
  ];

  // Studio — toute l'image de la marque : captation, DA, réseaux, contenu, 3D.
  const studioSlides = [
    { image: "/images/appareil_photo.webp", alt: "Captation photo et vidéo", label: "Captation & événements", caption: "Des images et des récits captés avec justesse pour prolonger l'intensité d'un moment." },
    { image: "/images/justx.webp", alt: "Direction artistique", label: "Direction artistique", caption: "Une image forte et parfaitement cohérente, au service de la marque." },
    { image: "/images/telephone_main.webp", alt: "Réseaux sociaux", label: "Réseaux sociaux", caption: "Une ligne éditoriale claire et des formats reconnaissables pour faire vivre la marque au quotidien." },
    { image: "/images/justx_textile.webp", alt: "Contenu et montage", label: "Contenu & montage", caption: "Des contenus réguliers, montés et diffusés pour engager la communauté." },
    { image: "/images/missionX5.webp", alt: "Univers 3D", label: "Univers · 3D", caption: "Des univers immersifs déclinés en 3D pour marquer les esprits." },
    { image: "/images/apple_justx.webp", alt: "Photo produit", label: "Photo produit", caption: "Des visuels soignés qui subliment produits et supports." }
  ];
</script>

<h1 class="seo-page-title">Nos services - Agence 3 Terres</h1>

<PolesHero
  label="Services"
  finalText="Design, création digitale et studio : trois territoires complémentaires, réunis sous une même direction artistique."
/>

<ProjectThemePage>
  <!-- ───────── Pôle 01 — Digital (fond noir) ───────── -->
  <div class="project-theme-band">
    <SectionLead lead="3 Terres Digital" />
    <ShowcaseCards cards={digitalCards} />
    <SectionLead
      text="Notre pôle digital conçoit des sites web et des applications sur mesure. De l'architecture de l'information au design d'interface jusqu'au développement, chaque projet est pensé pour être rapide, clair et désirable — et pour durer dans le temps."
    />
    <AboutEditorialSingleShowcase
      showCue={false}
      background="#040404"
      text="Du premier écran jusqu'aux vues les plus rapprochées, la même clarté et la même fluidité, sur desktop comme sur mobile."
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
      text="Notre pôle design façonne l'identité visuelle de la marque : logo, charte graphique, typographie et système visuel cohérent, du premier signe jusqu'à chacune de ses déclinaisons. Une démarche à la fois créative et stratégique — nous conseillons et accompagnons chaque marque, du naming au pilotage, pour lui donner une présence claire et durable."
    />
    <EditorialFeature
      image="/images/creation_logo_desktop.webp"
      alt="Création de logo et d'identité"
      secondaryImage="/images/carte_visite_desktop.webp"
      secondaryAlt="Papeterie et supports de marque"
      label="Logo, charte & typographie"
      text="Un système visuel complet — logo, palette, typographie — qui donne à la marque une présence cohérente et immédiatement reconnaissable, du digital à l'imprimé."
    />
    <MediaSlider slides={designSlides} />
  </div>

  <!-- ───────── Pôle 03 — Studio (fond bleu) ───────── -->
  <ProjectThemeTrigger theme="night" />

  <div class="project-theme-band">
    <SectionLead lead="3 Terres Studio" />
    <ShowcaseCards cards={studioCards} />
    <SectionLead
      text="Notre studio produit et orchestre toute l'image de la marque : captation photo et vidéo, couverture d'événements, création et gestion des réseaux sociaux, montage et création de contenu. Le tout au service d'une direction artistique claire et constante."
    />
    <EditorialFeature
      reverse={true}
      image="/images/appareil_photo.webp"
      alt="Captation photo et vidéo en studio"
      secondaryImage="/images/justx.webp"
      secondaryAlt="Direction artistique de contenu"
      label="Photo & vidéo"
      text="On produit et on orchestre tout le contenu d'une marque, du tournage au montage, jusqu'à la diffusion sur les réseaux sociaux."
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
