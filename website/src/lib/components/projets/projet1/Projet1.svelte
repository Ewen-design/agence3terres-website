<script>
  // ── Serein Design — la marque et le site de Carousel, un objet de bureau ──
  //  Même trame que les autres pages projet (refaite le 2026-10-20 ; c'était
  //  la page la plus courte, faute de visuels). Les textes reprennent ce que
  //  dit serein-design.fr, ramené à l'essentiel.
  //
  //  Les médias :
  //   • vidéos — `media-source/encode-serein.sh` : quatre mockups livrés SANS
  //     FOND, posés sur un fond studio (dégradé linéaire #60151c →
  //     #0d0906) ; les mêmes masters fournissent deux plans au reel de la home ;
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
  import ProjectCaptionCards from "$lib/components/projets/blocks/ProjectCaptionCards.svelte";
  import ProjectActionDuo from "$lib/components/projets/blocks/ProjectActionDuo.svelte";
  import ProjectQuote from "$lib/components/projets/blocks/ProjectQuote.svelte";

  import { videoSources, videoPoster } from "$lib/components/shared/media/videoSources.js";

  // Jeton de cache des vidéos Serein : elles ont été réencodées SOUS LE MÊME
  // NOM le 2026-10-20 (nouveau fond studio rouge). Sans lui, une navigation
  // interne ressert l'ancien poster. À changer à chaque passage de
  // `encode-serein.sh` — et dans `projets.js` (posters du hero) aussi.
  const V = { version: "2" };
</script>

<ProjectThemePage>
  <!-- Le téléphone qui pivote sur le fond studio : beaucoup d'air autour de
       l'appareil, le titre se pose sur le fond et jamais sur l'écran. -->
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
        value: ["Identité visuelle", "Site web", "Direction artistique"]
      }
    ]}
    ctaLabel="Visiter le site"
    ctaHref="https://serein-design.fr"
    ctaExternal={true}
  />

  <div class="project-theme-band">
    <!-- Gros plan sur le hero du site, l'écran de l'objet déjà retourné (le
         geste de la main est laissé au reel de la home, voir encode-serein.sh).
         Le rendu portrait est recadré en 4/5, le format du cadre sous 900 px. -->
    <ProjectEditoBadge
      text="<span class='hl'>Carousel est un objet de bureau qui n'affiche que les données qu'on a choisies.</span> Pas de fil, pas de notification : un panneau de LED, un socle en noyer, et une marque qui devait dire le calme avant la technique."
      video={videoSources("serein-objet", V)}
      mobileVideo={videoSources("serein-objet-mobile", V)}
      poster={videoPoster("serein-objet", V)}
      mobilePoster={videoPoster("serein-objet-mobile", V)}
      alt="Le site Serein Design sur un iPhone : « The data you care about, on a desk object. »"
      aspect="1.78"
      mobileAspect="0.8"
    />

    <ProjectFlaps
      background="var(--project-surface-bg, var(--bg-deep, #050709))"
      title="Une marque, un site,<br />un objet."
      cards={[
        {
          title: "Un monogramme",
          text: "Les lettres <span class='hl'>s, e, d, e</span> tracées d'un seul fil, qui se croise et revient sur lui-même : le calme du nom, dessiné.",
          // Le monogramme à plat sur son aplat (#60151c, relevé au pixel) :
          // sur téléphone, `contain` le montre entier et l'aplat prolonge
          // le fond sans raccord visible.
          image: "/images/serein-monogramme.webp",
          mobileFit: "contain",
          bg: "#60151c",
          alt: "Le monogramme Serein Design, en crème sur bordeaux"
        },
        {
          title: "Un site qui parle objet",
          text: "« The data you care about, on a desk object. » La page s'ouvre sur l'objet allumé, et le texte <span class='hl'>s'efface</span> devant lui.",
          // Recadré autour du téléphone (5:6) : ~75 % de la hauteur du volet
          // en bureau, ~60 % de la largeur sur téléphone.
          image: "/images/serein-telephone-bois.webp",
          alt: "Le site Serein Design sur un iPhone posé sur une table en bois, dans un rai de lumière"
        },
        {
          title: "Une marque à l'affiche",
          text: "Bordeaux profond, crème, bois : la marque <span class='hl'>quitte l'écran</span> et tient au mur comme sur le bureau.",
          // Toute la toile : l'affiche (x 0,37-0,63) tient du cadre presque
          // carré du bureau au plein écran du téléphone.
          image: "/images/serein-affiche.webp",
          alt: "Une affiche Serein Design encadrée sur un mur en bois, un passant au premier plan"
        },
        {
          title: "L'objet, au centre",
          text: "Socle en noyer massif, coque en aluminium anodisé, écran de 64 × 32 LED : chaque image montre l'objet <span class='hl'>tel qu'il est</span>.",
          image: "/images/serein-objectif.webp",
          alt: "Carousel allumé sur une table : l'objectif « Redbull, 1,80 € » en pixels"
        }
      ]}
    />
  </div>

  <div class="project-theme-band theme-deep">
    <ProjectEditorialStatement
      text="<span class='hl'>Le calme comme fonction.</span> Un objet qui n'affiche que ce qu'on a choisi, et une marque assez discrète pour lui laisser toute la place."
    />

    <!-- Les photographies de l'objet, une par usage : chacune en 16/10 pour
         le bureau et en 4/5 pour le téléphone. -->
    <ProjectImageTabs
      title="Un seul écran,<br /><span class='dim'>ce qu'on choisit d'y voir.</span>"
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
      note="Neuf applications, <span class='hl'>une seule molette</span> : on la tourne pour changer d'écran, on appuie pour valider. Aucun menu."
    />
  </div>

  <div class="project-theme-band">
    <ProjectFigures
      title="L'objet, en clair."
      items={[
        {
          label: "Panneau",
          figure: "64 × 32",
          text: "LED adressables, et <span class='hl'>rien d'autre</span> à l'écran."
        },
        {
          label: "Applications",
          figure: "9",
          text: "Horloge, météo, Pomodoro, Spotify, marchés, tâches Notion… et le jeu de la vie."
        },
        {
          label: "Fait en France",
          figure: "78 %",
          text: "Le noyer et l'anodisation confiés à des fournisseurs voisins de l'atelier."
        }
      ]}
    />
  </div>

  <div class="project-theme-band">
    <!-- Les trois principes de serein-design.fr, sur trois photos de la même
         série (même lumière, même table). -->
    <ProjectCaptionCards
      titleMain="Fait pour durer,"
      titleMuted="pas pour être remplacé."
      cards={[
        {
          title: "Réparable",
          text: "Un tournevis Torx et un fer à souder suffisent ; les pièces détachées sont vendues sur le site.",
          image: "/images/serein-reparable.webp",
          position: "47% 50%",
          alt: "Carousel sur une table, l'écran basculé à la verticale"
        },
        {
          title: "Sans compte",
          text: "Au premier démarrage, un QR code connecte le Wi-Fi. Pas d'application, pas de cloud.",
          image: "/images/serein-sans-compte.webp",
          position: "47% 50%",
          alt: "Carousel allumé dans un bureau de nuit"
        },
        {
          title: "Durable",
          text: "Mises à jour par USB-C, et des fichiers confiés à la communauté si la campagne le permet.",
          image: "/images/serein-durable.webp",
          alt: "Carousel en contre-plongée, la lampe allumée au-dessus de l'écran"
        }
      ]}
    />
  </div>

  <div class="project-theme-band theme-deep">
    <ProjectEditorialMosaic
      text="<span class='hl'>Une marque qui se tient,</span> en volume comme à l'écran."
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
        title: "Découvrir Carousel tel qu'on le rencontre.",
        href: "https://serein-design.fr",
        external: true,
        // Capture du site sur iPhone (2026-10-20), au format de l'écran.
        phone: { image: "/images/serein-tel-accueil.webp", position: "50% 50%" }
      }}
      secondary={{
        label: "Parlons-en",
        title: "Votre objet mérite la même tenue.",
        href: "/contact"
      }}
    />
  </div>

  <!-- Le mot du client, sur le NOIR de la palette (bande sombre), à la place
       du mur des autres projets — le pied de page « projet suivant » assure la
       suite de la visite.
       ⚠️ TEXTE PROVISOIRE : remplacer `quote`, `author` et `role` par la vraie
       citation du client. -->
  <div class="project-theme-band theme-deep">
    <ProjectQuote
      quote="<span class='hl'>La citation du client prendra place ici.</span> Une ou deux phrases, dans ses mots."
      author="Prénom Nom"
      role="Fonction, Serein Design"
    />
  </div>
</ProjectThemePage>
