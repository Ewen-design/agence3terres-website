<script>
  // ── Ludosphères — le site, la galerie 3D et l'identité d'un peintre ───────
  //  Même trame que les autres pages projet. Réécrite le 2026-11-19 : ce que
  //  nous avons fait (le logo, la charte graphique, le site complet et sa
  //  galerie en 3D) passe devant, et les textes ne décrivent plus les photos.
  //  Les trois cartes à légende (« l'accrochage, le geste, la matière ») ont
  //  été retirées : la page Œuvres filmée est devenue le quatrième volet.
  //
  //  Les vidéos sortent de `media-source/encode-ludospheres-galerie.sh`, qui
  //  dit pourquoi chaque plan est là (hero : le reel des toiles en 3D ; volet
  //  « La galerie en 3D » : la page Œuvres filmée, entière sur téléphone).
  import ProjectThemePage from "$lib/components/projets/shared/ProjectThemePage.svelte";
  import ProjectHeroProjetsStyle from "$lib/components/projets/shared/ProjectHeroProjetsStyle.svelte";
  import ProjectEditorialStatement from "$lib/components/projets/shared/ProjectEditorialStatement.svelte";
  import ProjectEditorialMobileShowcase from "$lib/components/projets/shared/ProjectEditorialMobileShowcase.svelte";
  import ProjectEditorialMosaic from "$lib/components/projets/shared/ProjectEditorialMosaic.svelte";

  import ProjectEditoBadge from "$lib/components/projets/blocks/ProjectEditoBadge.svelte";
  // « Notre rôle » en volets : c'est le composant de la HOME, réutilisé tel
  // quel. Une copie vivait un temps dans `blocks/` et tremblait sur Safari là
  // où l'original ne tremble pas — elle a été jetée plutôt que rafistolée.
  import ProjectFlaps from "$lib/components/home/HomeFeatureCards.svelte";
  import ProjectActionDuo from "$lib/components/projets/blocks/ProjectActionDuo.svelte";
  import ProjectQuote from "$lib/components/projets/blocks/ProjectQuote.svelte";

  import { videoSources, videoPoster } from "$lib/components/shared/media/videoSources.js";

  // Le hero TÉLÉPHONE a été remonté sous le même nom le 2026-11-19 (la macro
  // seule, en aller-retour) : jeton de cache, à reporter sur le `?v=` de
  // `hero.mobileImage` dans `projets.js`.
  const HERO_MOBILE = { version: "2" };
</script>

<ProjectThemePage>
  <ProjectHeroProjetsStyle
    title="Ludosphères"
    image="/videos/ludo-hero-poster.webp"
    mobileImage={videoPoster("ludo-hero-mobile", HERO_MOBILE)}
    video={videoSources("ludo-hero")}
    mobileVideo={videoSources("ludo-hero-mobile", HERO_MOBILE)}
    videoPoster="/videos/ludo-hero-poster.webp"
    mobileVideoPoster={videoPoster("ludo-hero-mobile", HERO_MOBILE)}
    metaBlocks={[
      { label: "Date", value: "2026" },
      { label: "Localisation", value: "France" },
      {
        label: "Services",
        value: ["Site web", "Galerie 3D", "Logo", "Charte graphique"]
      }
    ]}
    ctaLabel="Visiter le site"
    ctaHref="https://ludospheres.fr"
    ctaExternal={true}
  />

  <div class="project-theme-band">
    <ProjectEditoBadge
      text="<span class='hl'>Ludovic Cocqueret peint à l'acrylique fluide. Ludosphères, c'est son univers.</span> Nous lui avons tout créé : le logo, la charte graphique et le site, avec une galerie en 3D où l'on se promène devant ses toiles."
      image="/images/ludo-drapeau.webp"
      alt="Bannière Ludosphères accrochée à la façade d'un bâtiment"
      aspect="1.6"
      mobileAspect="1.1"
      position="62% 60%"
    />

    <ProjectFlaps
      continu
      background="var(--project-surface-bg, var(--bg-deep, #050709))"
      title="Une marque et un site,<br />partis de zéro."
      cards={[
        {
          title: "Le logo",
          text: "Un L et un S enlacés dans un carré, pour Ludosphères. <span class='hl'>Le carré peut se remplir d'une toile</span> : le signe reste le même et prend la couleur de chaque collection.",
          image: "/images/ludo-logo-peintures.webp",
          alt: "L'emblème Ludosphères, entouré de quatre toiles"
        },
        {
          title: "La charte graphique",
          text: "Un blanc cassé, un beige rosé et un bleu profond. <span class='hl'>Des couleurs calmes, pour que la peinture reste la seule à parler fort.</span>",
          // Le livret ouvert porte les trois teintes d'un coup : couverture
          // bleu profond, pages blanc cassé, fond beige rosé.
          image: "/images/ludo-magazine.webp",
          position: "50% 50%",
          mobilePosition: "47% 50%",
          alt: "Livret Ludosphères ouvert : couverture bleu profond, toile Cosmos en pleine page"
        },
        {
          title: "Le site",
          text: "Deux collections, Apesanteur et Ondes, de quatre toiles chacune. <span class='hl'>On les découvre en défilant, une toile à la fois</span>, et la démarche de Ludovic est racontée à côté, en quelques lignes.",
          image: "/images/ludo-iphone.webp",
          position: "56% 50%",
          mobilePosition: "57% 50%",
          alt: "Le site Ludosphères sur un iPhone tenu à la main, une toile au centre de l'écran"
        },
        {
          title: "La galerie en 3D",
          text: "La page Œuvres accroche toutes les toiles sur un même mur, en trois dimensions. <span class='hl'>On le parcourt à la souris ou du doigt</span>, comme on longe une cimaise, et un clic sur une toile ouvre sa fiche.",
          // La page Œuvres filmée (capture TÉLÉPHONE) : recadrée au format du
          // cadre en bureau, ENTIÈRE sur téléphone, où la carte plein écran
          // est presque à son format (2026-11-19 : le carré pris au milieu
          // coupait les toiles de tous côtés).
          video: videoSources("ludo-accrochage"),
          mobileVideo: videoSources("ludo-accrochage-mobile"),
          poster: "/videos/ludo-accrochage-poster.webp",
          mobilePoster: "/videos/ludo-accrochage-mobile-poster.webp",
          alt: "La page Œuvres de Ludosphères : les toiles accrochées sur un mur en 3D, qui défile"
        }
      ]}
    />
  </div>

  <div class="project-theme-band theme-deep">
    <ProjectEditorialStatement
      text="<span class='hl'>Sur le site, la peinture passe avant le texte.</span> Les toiles s'affichent en grand, les mots restent rares, et le fond crème laisse toute la couleur aux œuvres."
    />
  </div>

  <div class="project-theme-band">
    <ProjectEditorialMobileShowcase
      text="<span class='hl'>Sur téléphone, chaque toile prend tout l'écran.</span> On passe d'une collection à l'autre en faisant défiler, et la fiche d'une œuvre s'ouvre d'un geste."
      leftVideo={videoSources("ludo-collections")}
      leftPoster="/videos/ludo-collections-poster.webp"
      leftAlt="Navigation entre les collections de Ludosphères sur mobile"
      rightVideo={videoSources("ludo-oeuvre")}
      rightPoster="/videos/ludo-oeuvre-poster.webp"
      rightAlt="Fiche de l'œuvre « Entre terre et mer » sur mobile"
      mediaMinHeight="54rem"
      mediaMobileAspectRatio="0.8"
    />
  </div>

  <div class="project-theme-band theme-deep">
    <ProjectEditorialMosaic
      text="<span class='hl'>La charte ne s'arrête pas au site.</span> Le monogramme et les trois couleurs sont prévus pour le papier aussi, jusqu'au cachet de cire."
      feature={{
        // Le défilement du site. Format réel de la vidéo sur mobile : rien de
        // rogné.
        video: videoSources("ludo-site"),
        poster: "/videos/ludo-site-poster.webp",
        alt: "Défilement de la collection Ondes sur le site Ludosphères",
        mobileAspectRatio: "1.6"
      }}
      items={[
        {
          video: videoSources("ludo-demarche"),
          poster: "/videos/ludo-demarche-poster.webp",
          alt: "La section « Ma démarche » de Ludosphères parcourue sur mobile",
          // Format réel du mockup : la tuile s'y cale sur mobile, la vidéo
          // n'est donc pas rognée.
          mobileAspectRatio: "0.8"
        },
        {
          src: "/images/ludo-cachets.webp",
          alt: "Cachets de cire à l'emblème Ludosphères sur des enveloppes",
          mobileAspectRatio: "0.8"
        }
      ]}
    />

    <ProjectActionDuo
      tint="#3c5473"
      primary={{
        label: "En ligne",
        title: "Visiter la galerie de Ludovic.",
        href: "https://ludospheres.fr",
        external: true,
        // Une capture du site sur iPhone (2026-10-09), au format de l'écran.
        phone: { image: "/images/ludo-tel-cosmos.webp?v=2", position: "50% 50%" }
      }}
      secondary={{
        label: "Parlons-en",
        title: "Vous exposez votre travail ? Parlons-en.",
        href: "/contact"
      }}
    />
  </div>

  <!-- Le mot du client, sur le NOIR de la palette (bande sombre), à la place
       du mur des autres projets — le pied de page « projet suivant » assure la
       suite de la visite.
       Le VRAI témoignage de Ludovic Cocqueret (reçu le 2026-10-09). Trop long
       pour un écran : la page n'en garde que la dernière phrase (sans son
       « donc »), sans signature ; le « + » ouvre le texte entier, signé, dans
       une carte plein écran. -->
  <div class="project-theme-band theme-deep">
    <ProjectQuote
      label="Le mot du client"
      quote="<span class='hl'>Je recommande vivement l’agence 3&nbsp;Terres</span> à toutes celles et ceux qui recherchent un accompagnement de grande qualité et une véritable sensibilité créative."
      full={[
        "Je tiens à remercier chaleureusement l’agence 3&nbsp;Terres et tout particulièrement Ewen, pour la grande qualité du travail réalisé dans le cadre de la création de mon site internet «&nbsp;Ludosphères&nbsp;».",
        "Ewen a su parfaitement comprendre mes attentes et donner naissance à un univers à la fois élégant, cohérent et singulier, reflétant pleinement ma sensibilité artistique.",
        "J’ai particulièrement apprécié la justesse de ses choix, son sens du détail, ainsi que sa capacité à transformer un univers artistique en une expérience digitale esthétique, intuitive, moderne et résolument professionnelle.",
        "Au-delà de la qualité technique de la réalisation, Ewen a su insuffler une véritable identité à «&nbsp;Ludosphères&nbsp;» et mettre en valeur mon travail d’artiste avec beaucoup de finesse et de sensibilité.",
        "Un immense merci pour son écoute, son implication et son talent, qui ont permis de donner vie à ce beau projet.",
        "Je recommande donc vivement l’agence 3&nbsp;Terres à toutes celles et ceux qui recherchent un accompagnement de grande qualité et une véritable sensibilité créative."
      ]}
      photo="/images/ludo-artiste.webp"
      photoAlt="Ludovic Cocqueret"
      photoPosition="50% 28%"
      signature={{ name: "Ludovic Cocqueret", org: "Ludosphères" }}
      logo="/images/logos-clients/ludospheres.svg"
    />
  </div>
</ProjectThemePage>
