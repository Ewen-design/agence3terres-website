<script>
  import ProjectThemePage from "$lib/components/projets/shared/ProjectThemePage.svelte";
  import PolesHero from "$lib/components/poles/PolesHero.svelte";
  import SectionLead from "$lib/components/poles/SectionLead.svelte";
  import PoleHeadline from "$lib/components/poles/PoleHeadline.svelte";
  import ShowcaseCards from "$lib/components/poles/ShowcaseCards.svelte";
  import MediaSlider from "$lib/components/poles/MediaSlider.svelte";
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
    { image: "/images/justx-pub2.webp", alt: "Projet JustX", title: "JustX", subtitle: "Gestion des réseaux sociaux", href: "projet5", tags: ["Réseaux sociaux", "Contenu & montage"] },
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
    { image: "/images/ipad-logo.webp", alt: "Logo", label: "Logo", caption: "Création de logo cohérent et déclinable, pensé pour installer une présence immédiate et mémorable." },
    { image: "/images/justx_couleurs.webp", alt: "Identité visuelle", label: "Identité visuelle", caption: "De la palette de couleurs, aux typographies, nous concevons un univers visuel cohérent, répondant aux valeurs de la marque." },
    { image: "/images/charte-typo.webp", alt: "Présentation de la typographie", label: "Charte éditoriale", caption: "Une nouvelle manière de communiquer en adaptant le ton et l'expérience." },
    { image: "/images/parfum_ordinateur.webp", alt: "Suivi stratégique", label: "Suivi & stratégie", caption: "Un accompagnement dans la durée mêlant stratégie, suivi détaillé et reportings, pour faire évoluer la marque avec cohérence." }
  ];

  // Studio — toute l'image de la marque : captation, DA, réseaux, contenu, 3D.
  const studioSlides = [
    { image: "/images/mobile-photo.webp", alt: "Captation photo et vidéo", label: "Captation & événements", caption: "Une présence événementielle plus forte afin de faire durer un moment inoubliable." },
    { image: "/images/justx-rs.webp", alt: "Réseaux sociaux", label: "Réseaux sociaux", caption: "Une présence sur les réseaux sociaux posant un univers en faisant connaître la marque." },
    { image: "/images/justx_textile.webp", alt: "Contenu et montage", label: "Contenu & montage", caption: "Nous créons des contenus vidéos et photos adaptables à chaque marque et à chaque cible." },
    { image: "/images/apple_justx.webp", alt: "Photo produit", label: "Photo produit", caption: "Des visuels soignés qui subliment produits et supports." }
  ];
</script>

<h1 class="seo-page-title">Nos services - Agence 3 Terres</h1>

<PolesHero
  label="Services"
  finalText="Nos trois pôles, digital, design et studio, permettent d'offrir un <span class='hl'>accompagnement complet</span> et spécialisé à nos clients."
/>

<ProjectThemePage>
  <!-- ───────── Pôle 01 — Digital (fond noir) ───────── -->
  <div class="project-theme-band band-nuance-dark theme-dark">
    <PoleHeadline label="3 Terres Digital" text="Des expériences<br>digitales<br>qui captivent." />
    <ShowcaseCards cards={digitalCards} showSubtitle={false} />
    <SectionLead
      text="Des <span class='hl'>sites web</span> et des applications sur mesure, du design d'interface au <span class='hl'>développement</span>, pensés pour toucher durablement votre cible."
    />
    <div class="digital-showcase">
      <AboutEditorialSingleShowcase
        showCue={false}
        showAccent={false}
        background="#040404"
        text="Nos projets sont pensés pour <span class='hl'>s'adapter sur tous les supports</span>, de manière à répondre aux besoins de nos clients."
        image="/images/apple_justx.webp"
        alt="Application JustX Fitness"
      />
    </div>
    <MediaSlider slides={digitalSlides} />
  </div>

  <!-- ───────── Pôle 02 — Design (fond blanc) ───────── -->
  <div class="project-theme-band band-nuance-light theme-light">
    <PoleHeadline label="3 Terres Design" text="Une identité<br>qui marque<br>les esprits." />
    <ShowcaseCards cards={designCards} showSubtitle={false} />
    <SectionLead
      text="Nous façonnons l'<span class='hl'>identité visuelle</span> de la marque, du logo à la charte et la typographie, pour lui donner une <span class='hl'>présence claire et durable</span>."
    />
    <div class="design-showcase">
      <AboutEditorialSingleShowcase
        showCue={false}
        showGradient={false}
        showAccent={false}
        background="#f4f6fc"
        ink="#121212"
        inkMuted="rgba(18, 18, 18, 0.66)"
        text="Nous concevons des <span class='hl'>systèmes visuels complets</span>, pensés pour représenter la marque dans un univers global cohérent et moderne."
        image="/images/main-justx.webp"
        imageDesktop="/images/main-justx-desktop.webp"
        alt="Création de logo et d'identité"
      />
    </div>
    <MediaSlider slides={designSlides} />
  </div>

  <!-- ───────── Pôle 03 — Studio (reprend la 1ʳᵉ config : fond noir/dark) ───────── -->
  <div class="project-theme-band band-nuance-dark theme-dark">
    <PoleHeadline label="3 Terres Studio" text="Des contenus<br>qui font vivre<br>la marque." />
    <ShowcaseCards cards={studioCards} showSubtitle={false} />
    <SectionLead
      text="Nous produisons toute l'image de la marque : captation, réseaux sociaux, montage et contenu, au service d'une <span class='hl'>direction artistique durable</span>."
    />
    <div class="studio-showcase">
      <AboutEditorialSingleShowcase
        showCue={false}
        showAccent={false}
        background="#040404"
        imageFit="contain"
        imagePosition="right top"
        text="Chaque contenu est produit avec le même soin, pour <span class='hl'>prolonger l'expérience</span> de la marque et renforcer sa présence, de l'événement aux réseaux."
        image="/images/justx-ipads.webp"
        alt="Contenu et réseaux sociaux JustX"
      />
    </div>
    <MediaSlider slides={studioSlides} />
  </div>
</ProjectThemePage>

<style>
  /* Espacements propres à la page services (scopés : les composants partagés
     avec les pages projet ne sont pas affectés). */

  /* Nuances de fond (façon Apple) : les pôles sombres reçoivent un noir non-plat,
     le pôle clair une variante de blanc. On l'applique aussi aux petits sliders
     (MediaSlider) qui, transparents, prennent leur propre nuance. */
  .band-nuance-dark {
    background: var(--nuance-dark);
  }
  .band-nuance-light {
    background: var(--nuance-light);
  }
  .band-nuance-dark :global(.ms) {
    background: var(--nuance-dark);
  }
  .band-nuance-light :global(.ms) {
    background: var(--nuance-light);
  }

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

  /* ── Showcase du pôle Studio (image portrait affichée en entier) ──────────
     Desktop : on agrandit le cadre média pour que l'image portrait (collée à
     gauche via imagePosition) soit plus grande. */
  @media (min-width: 901px) {
    .studio-showcase :global(.about-editorial-single-showcase__media) {
      height: 168vh;
    }
    .studio-showcase :global(.about-editorial-single-showcase__floor) {
      top: 168vh;
    }
    /* Image bien collée au bord droit. */
    .studio-showcase :global(.about-editorial-single-showcase__media img) {
      object-position: right center;
    }
    /* Texte à gauche mais décalé vers la droite (dans la bande noire), un peu
       plus bas. On l'étale sur 2 colonnes et on élargit sa largeur max. */
    .studio-showcase :global(.about-editorial-single-showcase__text-block) {
      grid-column: 1 / 3;
      justify-self: start;
      margin-left: clamp(3rem, 8vw, 9rem);
      padding-top: clamp(16rem, 26vh, 24rem);
    }
    .studio-showcase :global(.about-editorial-single-showcase__text) {
      max-width: 27ch;
    }
  }

  /* Mobile : l'image (contain) est pleine largeur mais plus courte → on remonte
     le bloc de texte pour qu'il rechevauche la photo. */
  @media (max-width: 900px) {
    /* L'image (contain, ratio paysage) n'occupe que ~30vh en haut du cadre média :
       on remonte davantage le texte pour supprimer le grand vide sous la photo. */
    .studio-showcase :global(.about-editorial-single-showcase__text-block) {
      margin-top: -56vh;
    }
    /* Texte du showcase design légèrement descendu sur mobile. */
    .design-showcase :global(.about-editorial-single-showcase__text-block) {
      margin-top: 5vh;
    }
    /* Photo du showcase digital décalée un peu vers la droite sur mobile. */
    .digital-showcase :global(.about-editorial-single-showcase__media img) {
      object-position: 35% center;
    }
  }

  /* Même espace vide sous les trois textes de showcase : chaque section se cale
     sur son contenu avec la même rangée basse (16vh). */
  .digital-showcase :global(.about-editorial-single-showcase),
  .design-showcase :global(.about-editorial-single-showcase),
  .studio-showcase :global(.about-editorial-single-showcase) {
    min-height: 0;
  }
  .digital-showcase :global(.about-editorial-single-showcase__content),
  .design-showcase :global(.about-editorial-single-showcase__content),
  .studio-showcase :global(.about-editorial-single-showcase__content) {
    grid-template-rows: 100vh auto 16vh;
    min-height: 0;
  }

  /* ── Showcase du pôle Digital (desktop) : texte plutôt à gauche, largeur
     inchangée (on étale le bloc pour ne pas le rogner à la colonne 1). ─────── */
  @media (min-width: 901px) {
    .digital-showcase :global(.about-editorial-single-showcase__text-block) {
      grid-column: 1 / -1;
      justify-self: start;
      margin-left: clamp(1.5rem, 5.5vw, 5.5rem);
    }
  }

  /* ── Showcase du pôle Design (desktop) : la photo (200vh, cadrage inchangé)
     occupe toute la 1ʳᵉ rangée ; le texte passe juste en dessous, à gauche,
     sans chevauchement. ──────────────────────────────────────────────────── */
  @media (min-width: 901px) {
    .design-showcase :global(.about-editorial-single-showcase__media) {
      height: 200vh;
    }
    .design-showcase :global(.about-editorial-single-showcase__floor) {
      top: 200vh;
    }
    .design-showcase :global(.about-editorial-single-showcase__content) {
      grid-template-rows: 200vh auto 16vh;
    }
    .design-showcase :global(.about-editorial-single-showcase__text-block) {
      /* On étale le bloc sur toute la largeur pour que le `max-width` du texte
         (ci-dessous) pilote réellement sa largeur (sinon il reste bloqué à la
         largeur de la colonne 1). */
      grid-column: 1 / -1;
      justify-self: start;
      margin-left: clamp(1.5rem, 5.5vw, 5.5rem);
      /* Texte remonté : superposition sur le bas de la photo. */
      padding-top: 0;
      margin-top: -38vh;
    }
    /* Texte plus large (desktop uniquement). */
    .design-showcase :global(.about-editorial-single-showcase__text) {
      max-width: 32ch;
    }
  }
</style>
