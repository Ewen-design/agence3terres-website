<script>
  // ── Centre Harmonia — identité et site d'un centre de médecine esthétique ──
  //  Même trame que les autres pages projet. Les médias viennent de
  //  `media-source/encode-harmonia.sh` : trois mockups livrés par le client, déjà
  //  posés sur le dégradé de la charte (blanc → #cadce6), plus un plan large
  //  composé sur le même dégradé depuis un rendu sans fond.
  //
  //  Deuxième série (`encode-harmonia-visuels.sh`) : le mockup sur l'eau livré
  //  par le client, des CAPTURES DU SITE EN LIGNE (centreharmonia.fr) et les
  //  photographies du centre reprises du projet Harmonia lui-même.
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
  import ProjectImageTabs from "$lib/components/projets/blocks/ProjectImageTabs.svelte";
  import ProjectCaptionCards from "$lib/components/projets/blocks/ProjectCaptionCards.svelte";
  import ProjectActionDuo from "$lib/components/projets/blocks/ProjectActionDuo.svelte";
  import ProjectQuote from "$lib/components/projets/blocks/ProjectQuote.svelte";

  import { videoSources } from "$lib/components/shared/media/videoSources.js";
</script>

<ProjectThemePage>
  <ProjectHeroProjetsStyle
    title="Harmonia"
    image="/images/harmonia-mockup-large.webp"
    mobileImage="/images/harmonia-mockup-tel.webp"
    metaBlocks={[
      { label: "Date", value: "2026" },
      { label: "Localisation", value: "Paris" },
      {
        label: "Services",
        value: ["Identité visuelle", "Site web", "Direction artistique"]
      }
    ]}
    ctaLabel="Visiter le site"
    ctaHref="https://centreharmonia.fr"
    ctaExternal={true}
  />

  <div class="project-theme-band">
    <ProjectEditoBadge
      text="<span class='hl'>Un centre de médecine esthétique se juge d'abord sur la confiance qu'il inspire.</span> Il fallait une marque qui tienne le médical et le soin dans le même geste, sans jamais verser dans la promesse."
      video={videoSources("harmonia-signature")}
      poster="/videos/harmonia-signature-poster.webp"
      alt="Le site du Centre Harmonia sur téléphone"
      aspect="1.78"
      mobileAspect="1.3"
    />

    <ProjectFlaps
      background="var(--project-surface-bg, var(--bg-deep, #050709))"
      title="Une marque, un site,<br />cinq univers."
      cards={[
        {
          title: "Une identité médicale",
          text: "Un bleu nuit pour l'<span class='hl'>autorité</span>, un bleu pâle pour le soin, une typographie classique pour la durée. Rien de cosmétique : c'est une marque de santé.",
          // L'affiche grand format : le logotype, la typographie classique et
          // la lumière douce de la marque, d'un seul regard. Paysage : le
          // cadre presque carré du bureau garde tout le panneau, la carte
          // plein écran du téléphone se centre sur le logotype.
          image: "/images/harmonia-affiche.webp",
          position: "47% 50%",
          mobilePosition: "50% 45%",
          alt: "Affiche Harmonia grand format : le logotype posé sur un visage, en plein ciel"
        },
        {
          title: "Un site qui respire",
          text: "La page s'ouvre sur un visage, pas sur un menu. Le texte arrive <span class='hl'>après</span> l'image, et chaque section laisse le temps de se poser.",
          video: videoSources("harmonia-ouverture"),
          poster: "/videos/harmonia-ouverture-poster.webp",
          alt: "Ouverture du site Centre Harmonia sur mobile"
        },
        {
          title: "Cinq univers nommés",
          text: "Aphrodite, Iris, Hygie, Apollon, Artémis : les cinq expertises du centre portent des noms qui se retiennent, et chacune a <span class='hl'>son visage</span>.",
          video: videoSources("harmonia-univers"),
          poster: "/videos/harmonia-univers-poster.webp",
          alt: "Le carrousel des cinq univers du Centre Harmonia"
        },
        {
          title: "La marque imprimée",
          text: "Brochure, peignoir, signalétique : l'identité <span class='hl'>quitte l'écran</span> et se retrouve dans la main du patient, au même diapason.",
          image: "/images/harmonia-imprime.webp",
          alt: "Brochure et textile à l'identité du Centre Harmonia"
        }
      ]}
    />
  </div>

  <div class="project-theme-band theme-deep">
    <ProjectEditorialStatement
      text="<span class='hl'>L'harmonie comme signature.</span> Une expertise médicale qui ne cherche pas à transformer un visage, mais à lui rendre son équilibre — assez discrètement pour qu'on ne voie jamais le geste."
    />

    <ProjectImageTabs
      title="Un même soin,<br /><span class='dim'>quatre façons de l'approcher.</span>"
      aspect="16 / 10"
      mobileAspect="4 / 5"
      tabs={[
        {
          label: "L'accueil",
          // Toute la largeur de la source : l'iPad garde de l'air autour et
          // ne touche plus le haut du cadre (il en sortait en bureau).
          image: "/images/harmonia-ipad-large.webp",
          mobileImage: "/images/harmonia-ipad-mobile.webp",
          alt: "La page d'accueil du Centre Harmonia sur tablette : « L'harmonie comme signature »"
        },
        {
          label: "Le récit",
          image: "/images/harmonia-macbook.webp",
          mobileImage: "/images/harmonia-macbook-mobile.webp",
          alt: "La section « L'harmonie débute par le lieu » sur ordinateur portable"
        },
        {
          label: "Un univers",
          image: "/images/harmonia-site-visage.webp",
          alt: "La page Visage, sous le nom d'Aphrodite"
        },
        {
          label: "Le diagnostic",
          image: "/images/harmonia-site-diagnostic.webp",
          alt: "Le diagnostic en ligne du Centre Harmonia"
        }
      ]}
      note="Le même système, de l'écran d'accueil à la brochure : <span class='hl'>une seule promesse</span>, tenue partout."
    />
  </div>

  <div class="project-theme-band">
    <ProjectEditorialMobileShowcase
      text="Sur téléphone, le <span class='hl'>récit</span> garde son rythme : une idée par écran, et l'image qui la porte."
      leftVideo={videoSources("harmonia-recit")}
      leftPoster="/videos/harmonia-recit-poster.webp"
      leftAlt="La section éditoriale du Centre Harmonia sur mobile"
      rightVideo={videoSources("harmonia-univers")}
      rightPoster="/videos/harmonia-univers-poster.webp"
      rightAlt="Le carrousel des cinq univers sur mobile"
      mediaMinHeight="50rem"
      mediaMobileAspectRatio="0.8"
    />
  </div>

  <div class="project-theme-band">
    <!-- Ce que fait le centre, en trois soins (photos et textes repris du
         site du Centre Harmonia, ramenés à l'essentiel). -->
    <ProjectCaptionCards
      titleMain="Ce que soigne"
      titleMuted="le centre."
      cards={[
        {
          title: "Le cheveu",
          text: "Greffe FUE et DHI, médecine du cheveu : tout commence par un bilan trichologique.",
          image: "/images/harmonia-soin-cheveux.webp",
          position: "50% 24%",
          alt: "Portrait d'homme aux cheveux mouillés, en lumière douce"
        },
        {
          title: "Les technologies",
          text: "LED, HIFU, HydraFacial : des appareils médicaux en complément du geste.",
          image: "/images/harmonia-soin-led.webp",
          position: "46% 50%",
          alt: "Séance de luminothérapie LED du visage, lumière rouge"
        },
        {
          title: "L'épilation",
          text: "Définitive : le laser pour les poils foncés, l'électrolyse pour les clairs.",
          image: "/images/harmonia-soin-epilation.webp",
          position: "50% 55%",
          alt: "Jambes au repos dans une lumière rasante, deux carnations"
        }
      ]}
    />
  </div>

  <div class="project-theme-band theme-deep">
    <ProjectEditorialMosaic
      text="<span class='hl'>Une marque de santé</span>, qui tient à l'écran comme dans la main."
      feature={{
        // L'enseigne plutôt que le mockup sur l'eau, déjà en tête de page.
        src: "/images/harmonia-enseigne.webp",
        position: "26% center",
        alt: "L'enseigne du Centre Harmonia sur la façade en pierre",
        mobileAspectRatio: "1.6"
      }}
      items={[
        {
          src: "/images/harmonia-accueil-lieu.webp",
          alt: "L'accueil du Centre Harmonia",
          mobileAspectRatio: "0.8"
        },
        {
          src: "/images/harmonia-signaletique.webp",
          position: "58% center",
          alt: "La signalétique des cabinets, au nom des figures grecques",
          mobileAspectRatio: "0.8"
        }
      ]}
    />

    <ProjectActionDuo
      tint="#203a5d"
      primary={{
        label: "En ligne",
        title: "Voir le centre tel qu'on le découvre.",
        href: "https://centreharmonia.fr",
        external: true,
        // Une capture du site sur iPhone (2026-10-09), au format de l'écran.
        phone: { image: "/images/harmonia-tel-accueil.webp", position: "50% 50%" }
      }}
      secondary={{
        label: "Parlons-en",
        title: "Votre pratique mérite la même tenue.",
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
      role="Fonction, Centre Harmonia"
    />
  </div>
</ProjectThemePage>
