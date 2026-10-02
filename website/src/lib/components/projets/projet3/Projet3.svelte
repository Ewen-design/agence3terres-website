<script>
  // ── Moovy — plateforme de recommandation de films ─────────────────────────
  //  Même trame que les autres pages projet, avec deux blocs qui lui sont
  //  propres : les onglets d'image (une plateforme, quatre écrans) et le
  //  déroulé en trois étapes, qui se referme sur la carte du site en ligne.
  import ProjectThemePage from "$lib/components/projets/shared/ProjectThemePage.svelte";
  import ProjectHeroProjetsStyle from "$lib/components/projets/shared/ProjectHeroProjetsStyle.svelte";
  import ProjectEditorialStatement from "$lib/components/projets/shared/ProjectEditorialStatement.svelte";
  import ProjectEditorialMosaic from "$lib/components/projets/shared/ProjectEditorialMosaic.svelte";

  import ProjectEditoBadge from "$lib/components/projets/blocks/ProjectEditoBadge.svelte";
  // « Notre rôle » en volets : c'est le composant de la HOME, réutilisé tel
  // quel. Une copie vivait un temps dans `blocks/` et tremblait sur Safari là
  // où l'original ne tremble pas — elle a été jetée plutôt que rafistolée.
  import ProjectFlaps from "$lib/components/home/HomeFeatureCards.svelte";
  import ProjectImageTabs from "$lib/components/projets/blocks/ProjectImageTabs.svelte";
  import ProjectStepCards from "$lib/components/projets/blocks/ProjectStepCards.svelte";
  import ProjectActionDuo from "$lib/components/projets/blocks/ProjectActionDuo.svelte";
  import ProjectWall from "$lib/components/projets/blocks/ProjectWall.svelte";

  import { videoSources } from "$lib/components/shared/media/videoSources.js";
  import { autresProjets } from "$lib/data/projets.js";
</script>

<ProjectThemePage>
  <ProjectHeroProjetsStyle
    title="Moovy"
    image="/images/tel_moovy2.webp"
    mobileImage="/images/tel_moovy2.webp"
    video={videoSources("moovy-hero")}
    mobileVideo={videoSources("moovy-hero-mobile")}
    videoPoster="/videos/moovy-hero-poster.webp"
    mobileVideoPoster="/videos/moovy-hero-mobile-poster.webp"
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
    <ProjectEditoBadge
      text="<span class='hl'>Un catalogue de films ne manque jamais de titres, il manque de chemin.</span> Moovy part d'une envie vague et la mène jusqu'à un choix, en quelques écrans."
      image="/images/moovy_page.webp"
      alt="Interface desktop de Moovy"
      aspect="1.6"
      mobileAspect="1.15"
    />

    <ProjectFlaps
      background="var(--project-surface-bg, var(--bg-deep, #050709))"
      title="De l'envie au film,<br />sans détour."
      cards={[
        {
          title: "Architecture de parcours",
          text: "Une structure plus directe pour naviguer entre <span class='hl'>large sélection</span> et recommandation guidée, sans jamais avoir à choisir entre les deux.",
          image: "/images/moovy_mac.webp",
          alt: "Vue desktop du catalogue Moovy"
        },
        {
          title: "Une recommandation guidée",
          text: "Un questionnaire court fait ressortir le <span class='hl'>bon film selon l'envie du moment</span>, plutôt que selon ce qui sort cette semaine.",
          video: videoSources("moovy-parcours"),
          poster: "/videos/moovy-parcours-poster.webp",
          alt: "Parcours de recommandation de Moovy sur mobile"
        },
        {
          title: "Une fiche qui suffit",
          text: "Affiche, durée, genre, synopsis : tout ce qu'il faut pour <span class='hl'>décider</span>, et rien de plus. La recommandation suivante n'est jamais qu'à un geste.",
          video: videoSources("moovy-fiche-film"),
          poster: "/videos/moovy-fiche-film-poster.webp",
          alt: "Fiche film de Moovy sur mobile"
        },
        {
          title: "La même aisance sur mobile",
          text: "Consulter, filtrer et choisir <span class='hl'>sans friction</span>, dans la main comme sur grand écran.",
          image: "/images/moovy_recherche.webp",
          alt: "Vue mobile de la recherche Moovy"
        }
      ]}
    />
  </div>

  <div class="project-theme-band theme-deep">
    <ProjectEditorialStatement
      text="<span class='hl'>Une lecture immédiate.</span> Quelques choix bien cadrés, et une recommandation qui arrive sans jamais surcharger l'écran."
    />

    <ProjectImageTabs
      title="Une seule plateforme —<br /><span class='dim'>quatre façons d'y entrer.</span>"
      tabs={[
        {
          label: "Le catalogue",
          image: "/images/moovy-ordi.webp",
          alt: "Le catalogue Moovy sur ordinateur"
        },
        {
          label: "La recherche",
          image: "/images/moovy_ipad.webp",
          alt: "La recherche Moovy sur tablette"
        },
        {
          label: "La fiche film",
          image: "/images/moovy_mobile.webp",
          alt: "Une fiche film Moovy sur mobile"
        },
        {
          label: "Hors de l'écran",
          image: "/images/affiche-moovy.webp",
          alt: "Panneau publicitaire Moovy : le film idéal, en quelques clics"
        }
      ]}
      note="Le même système, du panneau de rue à la fiche film : <span class='hl'>une seule promesse</span>, tenue partout."
    />
  </div>

  <div class="project-theme-band">
    <ProjectStepCards
      title="Trois étapes,<br />un parcours."
      steps={[
        {
          label: "Étape 01",
          title: "Cadrer le chemin",
          text: "Avant les écrans, la question : qu'est-ce qui empêche de choisir ? Le parcours a été <span class='hl'>dessiné d'abord</span>, l'interface ensuite.",
          image: "/images/moovy_page.webp",
          alt: "Structure de la page d'accueil de Moovy"
        },
        {
          label: "Étape 02",
          title: "Dessiner l'interface",
          text: "Une grille, une typographie, un rythme d'images. Les <span class='hl'>affiches portent la couleur</span> — l'interface reste en retrait.",
          image: "/images/moovy_recherche.webp",
          alt: "Écran de recherche de Moovy"
        },
        {
          label: "Étape 03",
          title: "Tenir sur tous les écrans",
          text: "Le mobile n'est pas une version réduite : c'est le terrain principal. Tout y a été <span class='hl'>vérifié en usage</span>.",
          image: "/images/tel_moovy2.webp",
          alt: "Moovy sur téléphone"
        }
      ]}
      closing={{
        image: "/images/moovy-salon.webp",
        alt: "Moovy affiché sur un écran de salon",
        brand: "Moovy",
        line1: "Le film idéal,",
        line2: "en quelques clics.",
        href: "https://moovy.agence3terres.fr",
        external: true
      }}
    />
  </div>

  <div class="project-theme-band theme-deep">
    <ProjectEditorialMosaic
      text="<span class='hl'>Un premier plan large pour ouvrir l'univers</span>, puis deux vues resserrées qui gardent la même clarté."
      feature={{ src: "/images/moovy2.webp", alt: "Grand visuel de la plateforme Moovy" }}
      items={[
        { src: "/images/moovy-ordi-bleu.webp", alt: "Moovy sur un ordinateur portable dans un décor bleu" },
        { src: "/images/moovy-phone.webp", alt: "Moovy dans la main, sur téléphone" }
      ]}
    />

    <ProjectActionDuo
      tint="#2e6bfe"
      primary={{
        label: "En ligne",
        title: "Essayer la recommandation.",
        href: "https://moovy.agence3terres.fr",
        external: true,
        phone: { image: "/images/moovy_mobile.webp", position: "50% 46%" }
      }}
      secondary={{
        label: "Parlons-en",
        title: "Votre produit mérite un chemin clair.",
        href: "/contact"
      }}
    />
  </div>

  <!-- Le mur vit sur le NOIR de la palette, pas sur le gris de la page :
       sans sa bande, ses marges laisseraient voir le gris tout autour. -->
  <div class="project-theme-band theme-deep">
    <ProjectWall
      title="Le reste du <span class='dim'>travail.</span>"
      projects={autresProjets("projet3")}
    />
  </div>
</ProjectThemePage>
