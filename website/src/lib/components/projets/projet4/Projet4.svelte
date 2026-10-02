<script>
  // ── Ludosphères — identité et site d'artiste ──────────────────────────────
  //  Même trame que les autres pages projet. Les deux blocs qui lui sont
  //  propres : les trois cartes à légende (l'accrochage, le geste, la matière)
  //  et la double vue mobile, qui montre le site en mouvement.
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
  import ProjectCaptionCards from "$lib/components/projets/blocks/ProjectCaptionCards.svelte";
  import ProjectActionDuo from "$lib/components/projets/blocks/ProjectActionDuo.svelte";
  import ProjectWall from "$lib/components/projets/blocks/ProjectWall.svelte";

  import { videoSources } from "$lib/components/shared/media/videoSources.js";
  import { autresProjets } from "$lib/data/projets.js";
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
    <ProjectEditoBadge
      text="<span class='hl'>Ludovic Cocqueret peint depuis des années sans vitrine à lui.</span> Il fallait une marque et un site capables de montrer les toiles telles qu'elles sont : en grand, sans décor, sans bruit autour."
      image="/images/ludo-drapeau.webp"
      alt="Bannière Ludosphères accrochée à la façade d'un bâtiment"
      aspect="1.6"
      mobileAspect="1.1"
      position="62% 60%"
    />

    <ProjectFlaps
      background="var(--project-surface-bg, var(--bg-deep, #050709))"
      title="Une marque faite de<br />l'œuvre, pas posée dessus."
      cards={[
        {
          title: "Un emblème taillé dans la matière",
          text: "Les initiales de Ludovic tiennent dans un carré plein, <span class='hl'>découpé directement</span> dans ses coulées de peinture. La forme tient en favicon comme en grand, et son remplissage change avec les toiles.",
          image: "/images/ludo-logo-peintures.webp",
          alt: "L'emblème Ludosphères rempli par les toiles"
        },
        {
          title: "Trois teintes, pas une de plus",
          text: "Un blanc cassé pour laisser la <span class='hl'>peinture</span> parler, un beige rosé pour la chaleur, un bleu profond pour tenir l'ensemble. Aucune ne vient concurrencer les toiles.",
          image: "/images/ludo-couleurs.webp",
          alt: "Nuancier Ludosphères : blanc cassé, beige rosé, bleu nuit"
        },
        {
          title: "Un site pensé comme un accrochage",
          text: "Les toiles occupent le centre, le texte se retire sur les bords. On avance d'une collection à l'autre <span class='hl'>comme on traverse une salle</span>.",
          video: videoSources("ludo-site"),
          poster: "/videos/ludo-site-poster.webp",
          alt: "Défilement de la collection Ondes sur le site Ludosphères"
        },
        {
          title: "Des contenus pour la suite",
          text: "Photos, mockups et posts déclinés depuis le même système, pour que la marque <span class='hl'>continue de vivre</span> une fois le site en ligne.",
          image: "/images/carte-ludo.webp",
          alt: "Cartes de visite Ludosphères, bleu nuit et kraft gaufré"
        }
      ]}
    />
  </div>

  <div class="project-theme-band theme-deep">
    <ProjectEditorialStatement
      text="<span class='hl'>L'art comme empreinte du vivant.</span> Une identité qui ne raconte rien d'autre que la matière, la couleur et le geste qui l'ont produite."
    />

    <ProjectCaptionCards
      titleMain="Trois façons de"
      titleMuted="regarder une toile."
      cards={[
        {
          title: "L'accrochage",
          text: "Le site montre l'œuvre en grand avant d'en dire un mot. Le texte attend son tour.",
          image: "/images/ludo-tablette.webp",
          alt: "Le site Ludosphères affiché sur une tablette"
        },
        {
          title: "Le geste",
          text: "Derrière chaque collection, une main, un atelier et des années de matière accumulée.",
          image: "/images/ludo-artiste.webp",
          alt: "Ludovic Cocqueret devant deux de ses toiles",
          position: "50% 32%"
        },
        {
          title: "La matière",
          text: "Kraft gaufré, cire, bleu profond : l'identité se touche autant qu'elle se regarde.",
          image: "/images/ludo-cartes.webp",
          alt: "Papeterie Ludosphères"
        }
      ]}
    />
  </div>

  <div class="project-theme-band">
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
      text="<span class='hl'>Une marque qui tient à l'écran</span>, sur le papier et sur la toile."
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

    <ProjectActionDuo
      tint="#3c5473"
      primary={{
        label: "En ligne",
        title: "Traverser les collections, une à une.",
        href: "https://ludospheres.fr",
        external: true,
        phone: { image: "/images/ludo.webp", fit: "contain", bg: "#f3f1ee" }
      }}
      secondary={{
        label: "Parlons-en",
        title: "Votre travail mérite d'être vu en grand.",
        href: "/contact"
      }}
    />
  </div>

  <!-- Le mur vit sur le NOIR de la palette, pas sur le gris de la page :
       sans sa bande, ses marges laisseraient voir le gris tout autour. -->
  <div class="project-theme-band theme-deep">
    <ProjectWall
      title="Le reste du <span class='dim'>travail.</span>"
      projects={autresProjets("projet4")}
    />
  </div>
</ProjectThemePage>
