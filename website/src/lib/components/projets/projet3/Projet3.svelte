<script>
  // ── Moovy — plateforme de recommandation de films ─────────────────────────
  //  Même trame que les autres pages projet, avec deux blocs qui lui sont
  //  propres : les onglets d'image (une plateforme, quatre écrans) et le
  //  déroulé en trois étapes, qui se referme sur la carte du site en ligne.
  //  Textes repris le 2026-11-19 (« un peu trop IA ») : plus courts, plus
  //  parlés, et un projet de l'agence qui ne dit pas tout de la suite.
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

  import { videoSources } from "$lib/components/shared/media/videoSources.js";
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
      { label: "Date", value: "Depuis 2025" },
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
      text="<span class='hl'>Ce soir, on regarde quoi ?</span> Moovy part de cette question et y répond en quelques écrans. C'est un projet de l'agence, qu'on fait grandir à notre rythme."
      image="/images/moovy_page.webp"
      alt="Interface desktop de Moovy"
      aspect="1.6"
      mobileAspect="1.15"
    />

    <ProjectFlaps
      continu
      background="var(--project-surface-bg, var(--bg-deep, #050709))"
      title="Quelques questions,<br />un film."
      cards={[
        {
          title: "Deux façons d'entrer",
          text: "On peut fouiller tout le catalogue, ou répondre à quelques questions et se laisser guider. <span class='hl'>On passe de l'un à l'autre quand on veut.</span>",
          image: "/images/moovy_mac.webp",
          alt: "Vue desktop du catalogue Moovy"
        },
        {
          title: "Pour ce soir",
          text: "La durée qu'on a devant soi, l'époque, le genre, l'humeur. <span class='hl'>Quelques réponses, et une courte liste</span> de films à lancer tout de suite, pas ceux que tout le monde regarde cette semaine.",
          video: videoSources("moovy-parcours"),
          poster: "/videos/moovy-parcours-poster.webp",
          alt: "Parcours de recommandation de Moovy sur mobile"
        },
        {
          title: "La fiche film",
          text: "L'affiche, la durée, le synopsis, le casting. <span class='hl'>De quoi se décider sans ouvrir un autre onglet</span>, et si ça ne plaît pas, le film suivant est juste à côté.",
          video: videoSources("moovy-fiche-film"),
          poster: "/videos/moovy-fiche-film-poster.webp",
          alt: "Fiche film de Moovy sur mobile"
        },
        {
          title: "Sur le téléphone",
          text: "Moovy s'installe sur l'écran d'accueil comme une application, sans passer par un store. <span class='hl'>Pratique quand le choix se fait depuis le canapé.</span>",
          image: "/images/moovy_recherche.webp",
          alt: "Vue mobile de la recherche Moovy"
        }
      ]}
    />
  </div>

  <div class="project-theme-band theme-deep">
    <ProjectEditorialStatement
      text="<span class='hl'>Moins de films à l'écran, et de meilleurs.</span> C'est le pari de Moovy depuis le premier croquis."
    />

    <ProjectImageTabs
      title="Le même Moovy,<br /><span class='dim'>d'un écran à l'autre.</span>"
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
      note="La promesse tient en une ligne, <span class='hl'>le film idéal en quelques clics</span>, et c'est la même sur l'affiche que dans l'application."
    />
  </div>

  <div class="project-theme-band">
    <ProjectStepCards
      title="Comment Moovy<br />s'est construit."
      steps={[
        {
          label: "Étape 01",
          title: "Le parcours d'abord",
          text: "Avant de dessiner un écran, on a cherché ce qui bloque, le soir, devant un catalogue. <span class='hl'>Le parcours est venu en premier</span>, l'interface après.",
          image: "/images/moovy_page.webp",
          alt: "Structure de la page d'accueil de Moovy"
        },
        {
          label: "Étape 02",
          title: "Une interface en retrait",
          text: "Fond sombre, typographie discrète. <span class='hl'>Ce sont les affiches qui donnent la couleur</span>, l'interface se fait oublier.",
          image: "/images/moovy_recherche.webp",
          alt: "Écran de recherche de Moovy"
        },
        {
          label: "Étape 03",
          title: "L'essayer pour de vrai",
          text: "On l'a testé là où il sert : <span class='hl'>sur un téléphone, le soir</span>, avec des gens qui n'avaient aucune envie de chercher.",
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
      text="<span class='hl'>Moovy continue d'avancer.</span> D'autres choses sont en préparation, on en reparlera le moment venu."
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
        // Capture du site sur iPhone (2026-10-09), au format de l'écran.
        phone: { image: "/images/moovy-tel-joker.webp?v=2", position: "50% 50%" }
      }}
      secondary={{
        label: "Parlons-en",
        title: "Une idée de produit ? Parlons-en.",
        href: "/contact"
      }}
    />
  </div>
</ProjectThemePage>
