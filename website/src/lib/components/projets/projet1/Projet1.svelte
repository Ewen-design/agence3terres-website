<script>
  // ── Serein Design — l'identité et le site de Carousel, un objet de bureau ──
  //  Même trame que les autres pages projet. Réécrite le 2026-11-19 : ce que
  //  nous avons fait (le logo, la charte graphique, le site) passe devant, et
  //  l'objet n'est présenté qu'en quelques lignes. Les textes ne décrivent plus
  //  les photos : ce sont les photos qui illustrent le texte. La charte vient
  //  du brandbook (`serein design/DA/Serein Design — Brandbook.pdf`).
  //
  //  Les médias :
  //   • vidéos — `media-source/encode-serein.sh` : depuis le 2026-11-19, les
  //     nouveaux plans Serein du reel de la home (le hero, le duo d'ouverture) ;
  //   • images — `media-source/serein-visuels.py` : les mockups de la marque
  //     (`serein design/logo sd/`) et les photographies de l'objet
  //     (`visuels/new/`, converties de Display P3 en sRGB).
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
  import ProjectFigures from "$lib/components/projets/blocks/ProjectFigures.svelte";
  import ProjectActionDuo from "$lib/components/projets/blocks/ProjectActionDuo.svelte";
  import ProjectQuote from "$lib/components/projets/blocks/ProjectQuote.svelte";

  import { videoSources, videoPoster } from "$lib/components/shared/media/videoSources.js";

  // Jeton de cache des vidéos Serein : elles sont réencodées SOUS LE MÊME NOM
  // (le 2026-10-20, puis le 2026-11-19 avec les plans du reel). Sans lui, une
  // navigation interne ressert l'ancien poster. À changer à chaque passage de
  // `encode-serein.sh` — et dans `projets.js` (posters du hero) aussi.
  const V = { version: "3" };
</script>

<ProjectThemePage>
  <!-- Bureau : le téléphone de trois quarts puis le haut de son écran, le
       grand titre posé à gauche sur le noir studio. Téléphone : le duo d'abord
       (le titre, en bas, tombe sur la table sombre), puis la main qui retourne
       l'écran. Le détail est dans `encode-serein.sh`. -->
  <ProjectHeroProjetsStyle
    title="Serein Design"
    image={videoPoster("serein-hero", V)}
    mobileImage={videoPoster("serein-hero-mobile", V)}
    video={videoSources("serein-hero", V)}
    mobileVideo={videoSources("serein-hero-mobile", V)}
    videoPoster={videoPoster("serein-hero", V)}
    mobileVideoPoster={videoPoster("serein-hero-mobile", V)}
    metaBlocks={[
      { label: "Date", value: "2026" },
      { label: "Localisation", value: "France" },
      {
        label: "Services",
        value: ["Logo", "Charte graphique", "Site web"]
      }
    ]}
    ctaLabel="Visiter le site"
    ctaHref="https://serein-design.fr"
    ctaExternal={true}
  />

  <div class="project-theme-band">
    <!-- Bureau : le duo du reel, le téléphone devant le portable. Téléphone
         (cadre 4/5 sous 900 px) : le haut du téléphone, le site qui défile.
         Les deux bouclés par un fondu sur eux-mêmes. -->
    <ProjectEditoBadge
      text="<span class='hl'>Serein Design lance Carousel, un objet de bureau qui n'affiche que ce qu'on a choisi d'y voir.</span> Nous avons créé l'identité complète de la marque, du logo à la charte graphique, puis le site qui présente l'objet avant sa campagne Kickstarter."
      video={videoSources("serein-objet", V)}
      mobileVideo={videoSources("serein-objet-mobile", V)}
      poster={videoPoster("serein-objet", V)}
      mobilePoster={videoPoster("serein-objet-mobile", V)}
      alt="Le site Serein Design sur un iPhone posé devant un MacBook : « The data you care about, on a desk object. »"
      aspect="1.78"
      mobileAspect="0.8"
    />

    <ProjectFlaps
      continu
      background="var(--project-surface-bg, var(--bg-deep, #050709))"
      title="Une identité complète,<br />puis le site."
      cards={[
        {
          title: "Le logo",
          text: "Un logotype en minuscules et un symbole qui pose « se » sur « de ». <span class='hl'>Les deux partagent les mêmes courbes</span> : le symbole prend le relais là où le nom ne tient pas, en favicon ou en photo de profil.",
          // Le monogramme à plat sur son aplat (#60151c, relevé au pixel) :
          // sur téléphone, `contain` le montre entier et l'aplat prolonge
          // le fond sans raccord visible.
          image: "/images/serein-monogramme.webp",
          mobileFit: "contain",
          bg: "#60151c",
          alt: "Le monogramme Serein Design, en crème sur bordeaux"
        },
        {
          title: "La charte graphique",
          text: "Un bordeaux profond, un crème et un brun presque noir. Chillax pour les titres, Switzer pour le texte : <span class='hl'>des titres doux, des textes sobres</span>.",
          // Toute la toile : l'affiche (x 0,37-0,63) tient du cadre presque
          // carré du bureau au plein écran du téléphone.
          image: "/images/serein-affiche.webp",
          alt: "Une affiche Serein Design encadrée sur un mur en bois, un passant au premier plan"
        },
        {
          title: "Le site",
          text: "Une seule page, en anglais pour la campagne. Elle suit les questions qu'on se pose avant d'acheter : <span class='hl'>ce que c'est, ce que ça affiche, ce qu'il y a dedans et quand ça arrive</span>.",
          // Recadré autour du téléphone (5:6) : ~75 % de la hauteur du volet
          // en bureau, ~60 % de la largeur sur téléphone.
          image: "/images/serein-telephone-bois.webp",
          alt: "Le site Serein Design sur un iPhone posé sur une table en bois, dans un rai de lumière"
        },
        {
          title: "L'objet d'abord",
          text: "C'est la dernière règle de la charte, et celle qui compte le plus. <span class='hl'>Le décor accompagne l'objet sans passer devant</span> : fonds sombres, lumière franche, et le panneau allumé au centre.",
          image: "/images/serein-objectif.webp",
          alt: "Carousel allumé sur une table : l'objectif « Redbull, 1,80 € » en pixels"
        }
      ]}
    />
  </div>

  <div class="project-theme-band theme-deep">
    <ProjectEditorialStatement
      text="<span class='hl'>Une modernité chaleureuse, une présence calme dans l'espace de vie.</span> C'est la phrase qui ouvre la charte. Carousel est un objet électronique, mais il vit sur un bureau ou dans un salon, et sa marque devait s'y sentir chez elle."
    />

    <!-- L'objet, en quelques lignes : trois écrans, une photo par usage, en
         16/10 pour le bureau et en 4/5 pour le téléphone. -->
    <ProjectImageTabs
      title="Carousel, en deux mots :<br /><span class='dim'>un écran et une molette.</span>"
      aspect="16 / 10"
      mobileAspect="4 / 5"
      tabs={[
        {
          label: "Un objectif",
          image: "/images/serein-ecran-objectif-large.webp",
          mobileImage: "/images/serein-ecran-objectif-mobile.webp",
          alt: "Carousel affiche la progression vers un objectif : une canette en pixels, remplie à 46 %"
        },
        {
          label: "Les vacances",
          image: "/images/serein-ecran-vacances-large.webp",
          mobileImage: "/images/serein-ecran-vacances-mobile.webp",
          alt: "Carousel sur une table de réunion : « Vacances, 1,55 € sur 1 500 € »"
        },
        {
          label: "À la seconde",
          image: "/images/serein-ecran-seconde-large.webp",
          mobileImage: "/images/serein-ecran-seconde-mobile.webp",
          alt: "Le panneau compte ce qui est gagné à la seconde : 0,0091 € par seconde"
        }
      ]}
      note="Un panneau de LED sur un socle en noyer, neuf applications au choix. <span class='hl'>On tourne la molette pour changer d'écran</span>, on appuie pour valider, et c'est tout."
    />
  </div>

  <div class="project-theme-band">
    <!-- L'inventaire de ce qui a été livré (règle des pages projet : jamais de
         performance commerciale, invérifiable). -->
    <ProjectFigures
      title="Ce que nous avons livré."
      items={[
        {
          label: "Versions du logo",
          figure: "3",
          text: "Le logotype complet, le symbole carré et une version horizontale pour les formats allongés."
        },
        {
          label: "Typographies",
          figure: "2",
          text: "Chillax pour les titres, avec ses arrondis, et Switzer pour le texte courant."
        },
        {
          label: "Parties du site",
          figure: "5",
          text: "L'objet, ses applications, ses principes, sa fiche technique et le calendrier de la campagne."
        }
      ]}
    />
  </div>

  <div class="project-theme-band theme-deep">
    <ProjectEditorialMosaic
      text="<span class='hl'>Le symbole a aussi sa version en volume</span>, rendue en 3D pour les visuels de la marque, à côté des photos de l'objet."
      feature={{
        // Le site sur l'ordinateur, posé sur un arc de bois (x 0,11-0,82).
        src: "/images/serein-ordinateur.webp",
        position: "46% center",
        alt: "Le site Serein Design sur un ordinateur portable posé sur un arc de bois, sur fond noir",
        mobileAspectRatio: "1.6"
      }}
      items={[
        {
          src: "/images/serein-monogramme-volume.webp",
          alt: "Le monogramme Serein Design en volume, rose, sous un projecteur",
          mobileAspectRatio: "0.8"
        },
        {
          src: "/images/serein-monogramme-face.webp",
          alt: "Le monogramme Serein Design en volume, bordeaux sur bordeaux",
          mobileAspectRatio: "0.8"
        }
      ]}
    />

    <ProjectActionDuo
      tint="#60151c"
      primary={{
        label: "En ligne",
        title: "Voir le site de Carousel.",
        href: "https://serein-design.fr",
        external: true,
        // Capture du site sur iPhone (2026-10-20), au format de l'écran.
        phone: { image: "/images/serein-tel-accueil.webp", position: "50% 50%" }
      }}
      secondary={{
        label: "Parlons-en",
        title: "Un produit à lancer ? Parlons de sa marque.",
        href: "/contact"
      }}
    />
  </div>

  <!-- Le mot du client, sur le NOIR de la palette (bande sombre), à la place
       du mur des autres projets — le pied de page « projet suivant » assure la
       suite de la visite.
       Même tenue que Ludosphères, Lybra et Harmonia : surtitre, une phrase,
       pas de signature.
       ⚠️ TEXTE RÉDIGÉ PAR NOUS (2026-11-02), le client n'a rien écrit : à faire
       valider par Dimitry Siebert avant la mise en ligne. -->
  <div class="project-theme-band theme-deep">
    <ProjectQuote
      label="Le mot du client"
      quote="<span class='hl'>Ils ont compris l’objet avant de dessiner la marque.</span> Du monogramme au site, tout dit le calme qu’on voulait y mettre."
    />
  </div>
</ProjectThemePage>
