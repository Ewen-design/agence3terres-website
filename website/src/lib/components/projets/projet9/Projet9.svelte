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
  import ProjectWall from "$lib/components/projets/blocks/ProjectWall.svelte";

  import { videoSources } from "$lib/components/shared/media/videoSources.js";
  import { autresProjets } from "$lib/data/projets.js";
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
          image: "/images/harmonia-moodboard.webp",
          alt: "Planche d'identité du Centre Harmonia : palette, logotype, lieu"
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
          image: "/images/harmonia-site-accueil.webp",
          alt: "La page d'accueil du Centre Harmonia : « L'harmonie comme signature »"
        },
        {
          label: "Le récit",
          image: "/images/harmonia-site-naturel.webp",
          alt: "La section « Le naturel prend tout son sens au Centre Harmonia »"
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
    <ProjectCaptionCards
      titleMain="L'identité ne s'arrête pas"
      titleMuted="à l'écran."
      cards={[
        {
          title: "La brochure",
          text: "Le bleu nuit, la typographie classique, le même souffle que le site.",
          image: "/images/harmonia-brochure.webp",
          position: "30% center",
          alt: "La brochure du Centre Harmonia posée sur une table en bois"
        },
        {
          title: "Le textile",
          text: "Peignoir et accessoires de soin, marqués au même logotype.",
          image: "/images/harmonia-accessoires.webp",
          alt: "Peignoir et accessoires à l'identité du Centre Harmonia"
        },
        {
          title: "L'enseigne",
          text: "Posée sur la pierre, elle dit le centre avant qu'on entre.",
          image: "/images/harmonia-enseigne.webp",
          position: "26% center",
          alt: "L'enseigne du Centre Harmonia sur la façade en pierre"
        }
      ]}
    />
  </div>

  <div class="project-theme-band theme-deep">
    <ProjectEditorialMosaic
      text="<span class='hl'>Une marque de santé</span>, qui tient à l'écran comme dans la main."
      feature={{
        src: "/images/harmonia-mockup-large.webp",
        alt: "Le site du Centre Harmonia sur ordinateur, posé sur l'eau",
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
        // Le poster de l'ouverture est le photogramme 0, donc l'écran de
        // chargement : presque blanc. Celui des univers montre une vraie page.
        phone: { image: "/videos/harmonia-univers-poster.webp", position: "50% 50%" }
      }}
      secondary={{
        label: "Parlons-en",
        title: "Votre pratique mérite la même tenue.",
        href: "/contact"
      }}
    />
  </div>

  <!-- Le mur vit sur le NOIR de la palette, pas sur le gris de la page :
       sans sa bande, ses marges laisseraient voir le gris tout autour. -->
  <div class="project-theme-band theme-deep">
    <ProjectWall projects={autresProjets("projet9")} />
  </div>
</ProjectThemePage>
