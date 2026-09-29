<script>
  import ProjectThemePage from "$lib/components/projets/shared/ProjectThemePage.svelte";
  import ProjectHeroProjetsStyle from "$lib/components/projets/shared/ProjectHeroProjetsStyle.svelte";
  import ProjectEditorialRole from "$lib/components/projets/shared/ProjectEditorialRole.svelte";
  import ProjectEditorialSplit from "$lib/components/projets/shared/ProjectEditorialSplit.svelte";
  import ProjectEditorialStatement from "$lib/components/projets/shared/ProjectEditorialStatement.svelte";
  import ProjectEditorialMobileShowcase from "$lib/components/projets/shared/ProjectEditorialMobileShowcase.svelte";
  import ProjectEditorialMosaic from "$lib/components/projets/shared/ProjectEditorialMosaic.svelte";
  // L'accordéon de verre de la page à propos, réutilisé tel quel.
  import EditorialAccordionShowcase from "$lib/components/apropos/AboutFocusEditorialShowcase.svelte";
  import ParallaxGallery2 from "$lib/components/home/ParallaxGallery2.svelte";
  import { videoSources } from "$lib/components/shared/media/videoSources.js";

  // Mêmes visuels (optimisés .webp) que la page Travail, en excluant
  // Ludosphères (le projet courant).
  const otherProjects = [
    { title: "Moovy", image: "/images/tel_moovy2.webp", href: "/projet3" },
    { title: "Lybra", image: "/images/lybra-cartes.webp", href: "/projet8" },
    { title: "JustX", image: "/images/justx.webp", href: "/projet5" },
    { title: "JustX Fitness", image: "/images/justx_app.webp", href: "/projet7" },
    { title: "Mission X", image: "/images/missionX5.webp", href: "/projet6" },
    { title: "Serein Design", image: "/images/serein_design.webp", href: "/projet1" },
    { title: "Votre projet ?", image: "/images/agence.webp", href: "/contact", cta: "Nous contacter" }
  ];
</script>

<ProjectThemePage>
  <ProjectHeroProjetsStyle
    title="Ludosphères"
    image="/images/ludo-site-desktop.webp"
    mobileImage="/images/ludo-hero-mobile.webp"
    metaBlocks={[
      { label: "Date", value: "2026" },
      { label: "Localisation", value: "France" },
      {
        label: "Services",
        value: ["Identité visuelle", "Site web", "Direction artistique", "Réseaux sociaux"]
      }
    ]}
    ctaLabel="Visiter le site"
    ctaHref="https://ludospheres.fr"
    ctaExternal={true}
  />


  <div class="project-theme-band">
    <ProjectEditorialRole
      title="Notre rôle"
      images={[
        {
          src: "/images/ludo-logo-peintures.webp",
          alt: "Toiles de Ludosphères accrochées autour de l'emblème gravé",
          mobileAspectRatio: "1.6"
        },
        {
          src: "/images/carte-ludo.webp",
          alt: "Cartes de visite Ludosphères, bleu nuit et kraft gaufré",
          mobileAspectRatio: "1.53"
        }
      ]}
      items={[
        {
          title: "Un emblème taillé dans la matière",
          text: "Les initiales de Ludovic Cocqueret tiennent dans un carré plein, découpé directement dans ses coulées de peinture. La marque est faite de l'œuvre, pas posée dessus."
        },
        {
          title: "Un site pensé comme un accrochage",
          text: "Les toiles occupent le centre, le texte se retire sur les bords. On avance d'une collection à l'autre comme on traverse une salle."
        },
        {
          title: "Des contenus pour la suite",
          text: "Photos, mockups et posts déclinés depuis le même système, pour que la marque continue de vivre une fois le site en ligne."
        }
      ]}
    />
  </div>

  <div class="project-theme-band theme-deep">
    <ProjectEditorialSplit
      title="La demande"
      text="Ludovic Cocqueret peint depuis des années sans vitrine à lui. Il fallait une marque et un site capables de montrer les toiles telles qu'elles sont : en grand, sans décor, sans bruit autour."
      image="/images/ludo-artiste.webp"
      alt="Ludovic Cocqueret devant deux de ses toiles"
      mediaAspectRatio="0.707"
    />

    <ProjectEditorialStatement
      eyebrow="Intention"
      text="« L'art comme <span class='hl'>empreinte du vivant</span> » : une identité qui ne raconte rien d'autre que la <span class='hl'>matière</span>, la <span class='hl'>couleur</span> et le <span class='hl'>geste</span> qui l'ont produite."
    />

  </div>

  <!-- Trois volets d'identité qui s'enchaînaient en autant de blocs bâtis
       pareil : ils passent dans l'accordéon de la page à propos, une photo par
       volet et le texte qui s'ouvre sur place. -->
  <div class="project-theme-band">
    <EditorialAccordionShowcase
      interval={11000}
      slides={[
        {
          label: "L'emblème",
          text: "Un L et un S enlacés dans un carré. La forme tient en <span class='hl'>favicon</span> comme en grand, et son remplissage change avec les toiles : un seul signe, autant de variations qu'il y a d'œuvres.",
          image: "/images/ludo-logo-peintures.webp",
          alt: "L'emblème Ludosphères rempli par les toiles"
        },
        {
          label: "Les couleurs",
          text: "Un blanc cassé pour laisser la <span class='hl'>peinture</span> parler, un beige rosé pour la chaleur, un bleu profond pour tenir l'ensemble. Trois teintes seulement, dont aucune ne vient concurrencer les toiles.",
          image: "/images/ludo-couleurs.webp",
          alt: "Nuancier Ludosphères : blanc cassé, beige rosé, bleu nuit"
        },
        {
          label: "Hors de l'écran",
          text: "L'emblème ne dépend pas de son fond. Sur une bannière de rue comme sur une carte gaufrée, il reste <span class='hl'>lisible</span> et reconnaissable au premier coup d'œil.",
          image: "/images/ludo-drapeau.webp",
          alt: "Bannière Ludosphères accrochée à la façade d'un bâtiment"
        }
      ]}
    />
  </div>

  <div class="project-theme-band">
    <ProjectEditorialSplit
      title="Le site en mouvement"
      text="Chaque collection s'ouvre sur son nom en très grand, puis les toiles défilent et viennent se poser. Le titre se lit d'abord, l'œuvre s'installe ensuite."
      video={videoSources("ludo-site")}
      videoPoster="/videos/ludo-site-poster.webp"
      alt="Défilement de la collection Ondes sur le site Ludosphères"
      mediaAspectRatio="1.6"
      mediaMobileAspectRatio="1.6"
      reverse={true}
    />

    <ProjectEditorialMobileShowcase
      text="Sur téléphone, l'œuvre garde <span class='hl'>toute la largeur</span> : on la voit avant de la lire."
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
      text="Une <span class='hl'>marque</span> qui tient à l'écran, sur le papier et sur la toile."
      feature={{
        src: "/images/ipad-ludo.webp",
        alt: "Le site Ludosphères affiché sur deux tablettes",
        mobileAspectRatio: "1.333"
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

    <ParallaxGallery2
      items={otherProjects}
      ctaLabel="Voir le projet"
      ariaLabelPrefix="Voir le projet"
      introMain="Découvrez "
      introMuted={"nos<br>autres projets."}
      strongIntro
    />
  </div>
</ProjectThemePage>
