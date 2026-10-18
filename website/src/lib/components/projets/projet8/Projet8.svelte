<script>
  // ── Lybra — identité de marque ────────────────────────────────────────────
  //  La page suit la trame commune aux pages projet : le hero, une accroche
  //  posée sur une grande image, « notre rôle » en volets à visuel collant,
  //  l'intention sur la bande sombre, la marque déclinée en onglets, ce qui a
  //  été livré en chiffres, la mosaïque finale, les deux sorties, et le mur des
  //  autres projets. Le pied de page « projet suivant » est monté par le layout.
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

  // Le témoignage vidéo de Thomas (reçu le 2026-10-16), produit par
  // `media-source/encode-lybra-temoignage.sh`. Un seul fichier H.264, son
  // compris. Jeton de cache à bumper après chaque réencodage (voir
  // `videoSources.js`).
  const TEMOIGNAGE_VERSION = "2026-10-17";
  const temoignage = {
    src: `/videos/lybra-temoignage.h264.mp4?v=${TEMOIGNAGE_VERSION}`,
    poster: videoPoster("lybra-temoignage", { version: TEMOIGNAGE_VERSION })
  };
</script>

<ProjectThemePage>
  <ProjectHeroProjetsStyle
    title="Lybra"
    image="/images/lybra-affichage.webp"
    mobileImage="/images/lybra-cartes.webp"
    metaBlocks={[
      { label: "Date", value: "2025" },
      { label: "Localisation", value: "France" },
      {
        label: "Services",
        value: ["Logo", "Identité visuelle", "Charte graphique"]
      }
    ]}
    ctaLabel="Visiter le site"
    ctaHref="https://lybrasystems.com"
    ctaExternal={true}
  />

  <div class="project-theme-band">
    <ProjectEditoBadge
      text="<span class='hl'>La marque avait déjà son colibri, mais un colibri daté.</span> Il fallait le moderniser sans le trahir, et lui donner tout ce qui lui manquait autour."
      image="/images/lybra-sac.webp"
      mobileImage="/images/lybra-sac-mobile.webp"
      alt="Un sac de voyage bleu Lybra, porté à bout de bras dans le ciel"
      aspect="1.6"
      mobileAspect="1.15"
    />

    <ProjectFlaps
      background="var(--project-surface-bg, var(--bg-deep, #050709))"
      title="Quatre chantiers, <br />un seul système."
      cards={[
        {
          title: "Un emblème modernisé",
          text: "Le colibri de la marque a été entièrement redessiné : des formes plus nettes, un geste plus franc, et une <span class='hl'>lisibilité tenue</span> jusqu'aux très petites tailles.",
          // L'enseigne lumineuse en cube (2026-10-10, mockup du client). Le
          // cadre va de 1,06:1 (bureau) à 0,48:1 (tablette verticale) : le
          // fichier est HAUT (2000×3250), resserré autour du cube et de sa
          // potence, son fond sombre PROLONGÉ en haut et en bas (les bandes de
          // bord de l'original sont unies : étirées, elles ne se voient pas).
          // En `cover` centré, le cube tient entier dans tous les formats et
          // reste grand en bureau ; seul du fond tombe hors cadre.
          image: "/images/lybra-enseigne-cube.webp",
          alt: "L'enseigne lumineuse en cube de Lybra, le colibri et le nom, de nuit"
        },
        {
          title: "Une identité complète",
          text: "Palette, contrastes, associations de couleurs et règles de composition : un <span class='hl'>système cohérent</span> de la carte de visite à l'affichage grand format.",
          // Le livre ouvert montre le système en vrai : bleu en couverture,
          // vert en pleine page, le colibri en blanc.
          image: "/images/lybra-livre.webp",
          position: "50% 50%",
          alt: "Un livre carré Lybra ouvert entre deux mains : pages bleue et verte"
        },
        {
          title: "Une charte livrée",
          text: "Versions monochromes, fonds autorisés, déclinaisons documentées et fichiers <span class='hl'>prêts à l'emploi</span> en SVG, PNG et WebP.",
          image: "/images/lybra-sachet.webp",
          position: "42% 50%",
          alt: "Un sac en dégradé bleu frappé du colibri, porté dans la rue"
        },
        {
          title: "Une marque en main",
          text: "Cartes gravées, coffret, papeterie : l'emblème quitte l'écran et garde exactement la <span class='hl'>même tenue</span> sur la matière.",
          image: "/images/lybra-cartes.webp",
          alt: "Cartes de visite Lybra"
        }
      ]}
    />
  </div>

  <div class="project-theme-band theme-deep">
    <ProjectEditorialStatement
      text="<span class='hl'>Un colibri en plein envol.</span> Comme l'élan que la marque donne à ses clients : de la liberté, de la confiance, et une proximité qui ne se perd jamais en route."
    />

    <ProjectImageTabs
      title="Un seul emblème —<br /><span class='dim'>autant de fonds qu'il en faut.</span>"
      // Les trois planches de fond sont en 16/9 : elles remplissent le cadre de
      // bureau sans perdre un pixel. Sur téléphone (cadre 4/3), les deux à
      // fond UNI restent entières (`contain`) et leur aplat, relevé au pixel,
      // remplit le reste : la bande ne se voit pas. Le DÉGRADÉ ne peut pas se
      // prolonger par un aplat — il a sa propre version 4/3, recomposée sur
      // un dégradé étiré (2026-10-09), et passe en `cover` : entre 641 et
      // 900 px, où le 16/9 occupe le cadre 4/3, seul le fond est rogné (le
      // logo tient dans les 75 % du milieu). La photo de rue se rogne comme
      // n'importe quelle photo.
      aspect="16 / 9"
      mobileAspect="4 / 3"
      tabs={[
        {
          label: "Bleu nuit",
          image: "/images/lybra-fond-degrade.webp",
          mobileImage: "/images/lybra-fond-degrade-4x3.webp",
          alt: "Logo Lybra sur un dégradé bleu nuit"
        },
        {
          label: "Bleu ciel",
          image: "/images/lybra-fond-ciel.webp",
          alt: "Logo Lybra en réserve sur fond bleu ciel",
          fit: "contain",
          bg: "#36a7ff"
        },
        {
          label: "Vert",
          image: "/images/lybra-fond-vert.webp",
          alt: "Logo Lybra en réserve sur fond vert",
          fit: "contain",
          bg: "#93ce6c"
        },
        {
          label: "Dans la rue",
          image: "/images/lybra-affichage.webp",
          alt: "Affichage Lybra grand format"
        }
      ]}
      note="Chaque teinte a sa version du logo et ses fonds autorisés. Le <span class='hl'>choix ne se discute plus</span> : il est écrit dans la charte."
    />
  </div>

  <div class="project-theme-band">
    <ProjectFigures
      title="La charte, en clair."
      items={[
        {
          label: "Teintes",
          figure: "3",
          text: "Un bleu nuit pour la <span class='hl'>confiance</span>, un bleu ciel pour l'envol, un vert pour la croissance."
        },
        {
          label: "Déclinaisons",
          figure: "8",
          text: "Emblème seul ou accompagné du nom, en blanc, bleu nuit, bleu ciel ou vert — chaque combinaison nommée et documentée."
        },
        {
          label: "Formats",
          figure: "3",
          text: "SVG, PNG et WebP, avec les fonds autorisés et les versions monochromes."
        }
      ]}
    />
  </div>

  <div class="project-theme-band theme-deep">
    <ProjectEditorialMosaic
      text="<span class='hl'>Une marque qui tient à l'écran</span>, sur le papier et en pleine rue."
      feature={{ src: "/images/lybra-macbook.webp", alt: "Identité Lybra appliquée sur un écran" }}
      items={[
        {
          video: videoSources("lybra-envol"),
          poster: "/videos/lybra-envol-poster.webp",
          alt: "Le colibri Lybra en volume, filmé en plein envol",
          // Format réel de la vidéo : la tuile s'y cale, la vidéo n'est donc
          // pas rognée. Les deux images de la mosaïque gardent leur cadre.
          mobileAspectRatio: "0.8"
        },
        {
          src: "/images/lybra-coffret-portrait.webp",
          alt: "Carte gravée à l'emblème Lybra, posée dans son coffret"
        }
      ]}
    />

    <ProjectActionDuo
      tint="#36a7ff"
      primary={{
        label: "En ligne",
        title: "Voir la marque là où elle travaille.",
        href: "https://lybrasystems.com",
        external: true,
        // Le fichier est en 16/9 : laissé ENTIER dans l'écran, avec sa propre
        // couleur autour, il y ressemble à un écran d'accueil.
        phone: { image: "/images/lybra-fond-ciel.webp", fit: "contain", bg: "#36a7ff" }
      }}
      secondary={{
        label: "Parlons-en",
        title: "Votre marque mérite la même tenue.",
        href: "/contact"
      }}
    />
  </div>

  <!-- Le mot du client, sur le NOIR de la palette (bande sombre), à la place
       du mur des autres projets — le pied de page « projet suivant » assure la
       suite de la visite.
       Le VRAI témoignage de Thomas, en vidéo (reçu le 2026-10-16). La page
       n'en garde qu'une phrase, sur la nouvelle direction artistique — le cœur
       du projet — sans signature, comme Ludosphères ; le « + » ouvre la vidéo,
       avec le son, en pleine hauteur dans la carte. Mots d'origine (vers
       0:27) : « on est très content de la nouvelle direction, franchement
       c'est beaucoup plus moderne, c'est beaucoup plus à jour et aligné avec
       ce que l'on fait aujourd'hui ». -->
  <div class="project-theme-band theme-deep">
    <ProjectQuote
      label="Le mot du client"
      quote="<span class='hl'>On est très contents de la nouvelle direction.</span> C’est beaucoup plus moderne, beaucoup plus à jour, et aligné avec ce que l’on fait aujourd’hui."
      video={temoignage}
    />
  </div>
</ProjectThemePage>
