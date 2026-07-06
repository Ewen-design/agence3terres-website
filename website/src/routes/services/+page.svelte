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
    { image: "/images/tel_moovy.webp", alt: "Plateforme Moovy", title: "Moovy", subtitle: "Plateforme web", href: "projet3" },
    { image: "/images/justx_fitness.webp", alt: "Application JustX Fitness", title: "JustX Fitness", subtitle: "Application mobile", href: "projet7" }
  ];

  const conseilCards = [
    { image: "/images/serein_design.webp", alt: "Projet Serein Design", title: "Serein Design", subtitle: "Identité produit", href: "projet1" },
    { image: "/images/justx.webp", alt: "Projet JustX", title: "JustX", subtitle: "Identité de marque", href: "projet5" }
  ];

  const studioCards = [
    { image: "/images/missionX5.webp", alt: "Projet Mission X", title: "Mission X", subtitle: "Univers & 3D", href: "projet6" },
    { image: "/images/apple_justx.webp", alt: "Projet Ludosphères", title: "Ludosphères", subtitle: "Site d'artiste", href: "projet4" }
  ];

  const digitalSlides = [
    { image: "/images/moovy_mac.webp", alt: "Vue desktop", label: "Vues desktop", caption: "Des interfaces larges, lisibles et soignées." },
    { image: "/images/tel_moovy2.webp", alt: "Vue mobile", label: "Expérience mobile", caption: "La même fluidité, jusque dans les vues les plus rapprochées." },
    { image: "/images/moovy.webp", alt: "Parcours produit", label: "Parcours produit", caption: "Une recommandation claire, qui arrive sans surcharge." },
    { image: "/images/justx_fitness.webp", alt: "Application fitness", label: "Application", caption: "Programmes, suivi et progression dans une app directe." }
  ];

  const conseilSlides = [
    { image: "/images/creation_logo_desktop.webp", alt: "Système de marque", label: "Système de marque", caption: "Un symbole simple et mémorable, décliné partout." },
    { image: "/images/carte_visite_desktop.webp", alt: "Papeterie", label: "Papeterie & supports", caption: "Du digital à l'imprimé, une même signature visuelle." },
    { image: "/images/serein_design.webp", alt: "Univers premium", label: "Univers premium", caption: "Une identité calme, cohérente et fonctionnelle." }
  ];

  const studioSlides = [
    { image: "/images/justx.webp", alt: "Direction artistique", label: "Direction artistique", caption: "Une image forte, parfaitement cohérente." },
    { image: "/images/justx_textile.webp", alt: "Contenu de marque", label: "Contenu de marque", caption: "Des contenus réguliers, pensés pour engager." },
    { image: "/images/appareil_photo.webp", alt: "Captation", label: "Captation", caption: "Photo et vidéo soignées pour le web et les réseaux." },
    { image: "/images/missionX5.webp", alt: "Univers 3D", label: "Univers · 3D", caption: "Des univers immersifs déclinés en 3D." }
  ];
</script>

<h1 class="seo-page-title">Nos pôles - Agence 3 Terres</h1>

<PolesHero
  label="Pôles"
  finalText="Conseil, création digitale et studio : trois territoires complémentaires, réunis sous une même direction artistique."
/>

<ProjectThemePage>
  <!-- ───────── Pôle 01 — Digital (fond noir) ───────── -->
  <div class="project-theme-band">
    <SectionLead
      lead="3 Terres Digital"
      text="Notre pôle digital conçoit des sites web et des applications sur mesure. De l'architecture de l'information au design d'interface jusqu'au développement, chaque projet est pensé pour être rapide, clair et désirable — et pour durer dans le temps."
    />
    <ShowcaseCards cards={digitalCards} />
    <AboutEditorialSingleShowcase
      showCue={false}
      background="#040404"
      text="Du premier écran jusqu'aux vues les plus rapprochées, la même clarté et la même fluidité, sur desktop comme sur mobile."
      image="/images/moovy_mac.webp"
      alt="Vue desktop Moovy"
      accentImage="/images/tel_moovy3.webp"
      accentAlt="Vue mobile Moovy"
    />
    <MediaSlider slides={digitalSlides} />
  </div>

  <!-- ───────── Pôle 02 — Conseil (fond blanc) ───────── -->
  <ProjectThemeTrigger theme="light" />

  <div class="project-theme-band">
    <SectionLead
      lead="3 Terres Conseil"
      text="Notre pôle conseil construit la marque, de sa création à son pilotage. Identité visuelle, charte graphique, logo et naming posent des fondations solides ; puis nous accompagnons dans le temps avec une stratégie de communication, un suivi détaillé et des reportings réguliers."
    />
    <ShowcaseCards cards={conseilCards} />
    <EditorialFeature
      intro="Logo, couleurs et typographies réunis dans une charte claire, déclinée sur tous les supports."
      image="/images/creation_logo_desktop.webp"
      alt="Création de logo et d'identité"
      secondaryImage="/images/carte_visite_desktop.webp"
      secondaryAlt="Papeterie et supports de marque"
      label="Identité & charte graphique"
      text="Un système visuel complet — palette, typographie, logo — qui donne à la marque une présence immédiatement reconnaissable, du digital à l'imprimé."
    />
    <MediaSlider slides={conseilSlides} />
  </div>

  <!-- ───────── Pôle 03 — Studio (fond bleu) ───────── -->
  <ProjectThemeTrigger theme="night" />

  <div class="project-theme-band">
    <SectionLead
      lead="3 Terres Studio"
      text="Notre studio produit et orchestre toute l'image de la marque : captation photo et vidéo, couverture d'événements, création et gestion des réseaux sociaux, montage et création de contenu. Le tout au service d'une direction artistique claire et constante."
    />
    <ShowcaseCards cards={studioCards} />
    <EditorialFeature
      reverse={true}
      intro="Captation, montage et diffusion — une image nette à chaque prise de parole."
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
