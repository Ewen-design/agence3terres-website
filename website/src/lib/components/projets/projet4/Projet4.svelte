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
  import ProjectQuote from "$lib/components/projets/blocks/ProjectQuote.svelte";

  import { videoSources } from "$lib/components/shared/media/videoSources.js";
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
          // Le livret ouvert porte les trois teintes d'un coup : couverture
          // bleu profond, pages blanc cassé, fond beige rosé.
          image: "/images/ludo-magazine.webp",
          position: "50% 50%",
          mobilePosition: "47% 50%",
          alt: "Livret Ludosphères ouvert : couverture bleu profond, toile Cosmos en pleine page"
        },
        {
          title: "Un site pensé comme un accrochage",
          text: "Les toiles occupent le centre, le texte se retire sur les bords. On avance d'une collection à l'autre <span class='hl'>comme on traverse une salle</span>.",
          image: "/images/ludo-iphone.webp",
          position: "56% 50%",
          mobilePosition: "57% 50%",
          alt: "Le site Ludosphères sur un iPhone tenu à la main, une toile au centre de l'écran"
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
          // La toile seule au mur, comme on la découvre : le mockup des deux
          // tablettes revenait déjà dans le hero et la mosaïque.
          image: "/images/ludo.webp",
          alt: "Une toile rouge et rose de Ludovic Cocqueret, accrochée sur un mur blanc"
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
        // Le défilement du site (déplacé depuis les volets, où l'iPhone a
        // pris sa place). Format réel de la vidéo sur mobile : rien de rogné.
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
        title: "Traverser les collections, une à une.",
        href: "https://ludospheres.fr",
        external: true,
        // Une capture du site sur iPhone (2026-10-09), au format de l'écran.
        phone: { image: "/images/ludo-tel-cosmos.webp", position: "50% 50%" }
      }}
      secondary={{
        label: "Parlons-en",
        title: "Votre travail mérite d'être vu en grand.",
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
      role="Fonction, Ludosphères"
    />
  </div>
</ProjectThemePage>
