<script>
  // ── Centre Harmonia — le site et la charte d'un centre de médecine esthétique ──
  //  Même trame que les autres pages projet. Réécrite le 2026-11-19 : le
  //  travail était la REFONTE DU SITE (centreharmonia.fr) et la charte
  //  graphique, et c'est ce que racontent les textes ; ils ne décrivent plus
  //  les photos. Les faits viennent du site en ligne et du dépôt du projet
  //  (`agence/projets/Harmonia`, couleurs et typographies dans `src/app.css`).
  //  Les trois cartes « Ce que soigne le centre » ont été retirées : elles
  //  parlaient de l'offre du centre, pas de notre travail.
  //
  //  Les médias viennent de `media-source/encode-harmonia.sh` (mockups du
  //  client sur le dégradé de la charte) et `encode-harmonia-visuels.sh`
  //  (mockup sur l'eau, captures du site en ligne, photographies du centre).
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
        value: ["Refonte du site", "Charte graphique"]
      }
    ]}
    ctaLabel="Visiter le site"
    ctaHref="https://centreharmonia.fr"
    ctaExternal={true}
  />

  <div class="project-theme-band">
    <ProjectEditoBadge
      text="<span class='hl'>Le Centre Harmonia réunit médecine esthétique, anti-âge et médecine du cheveu.</span> Nous avons refait son site entièrement, et posé la charte graphique qui l'accompagne : les couleurs, les typographies et la façon de présenter les soins."
      image="/images/harmonia-carte-eau.webp"
      mobileImage="/images/harmonia-carte-eau-mobile.webp"
      alt="Une carte Centre Harmonia flotte à la surface d'une piscine : un visage qui sourit, les yeux fermés"
      aspect="1.78"
      mobileAspect="1.3"
    />

    <ProjectFlaps
      continu
      background="var(--project-surface-bg, var(--bg-deep, #050709))"
      title="Le site d'abord,<br />et sa charte."
      cards={[
        {
          title: "La charte graphique",
          text: "Beaucoup de blanc, un bleu marine pour le texte, un bleu brume pour les fonds et une touche d'or, rare. <span class='hl'>Les titres sont en Erode</span>, une typographie à empattements qui donne au centre un ton posé.",
          // L'affiche grand format : le logotype et la typographie de la
          // marque d'un seul regard. Paysage : le cadre presque carré du
          // bureau garde tout le panneau, la carte plein écran du téléphone se
          // centre sur le logotype.
          image: "/images/harmonia-affiche.webp",
          position: "47% 50%",
          mobilePosition: "50% 45%",
          alt: "Affiche Harmonia grand format : le logotype posé sur un visage, en plein ciel"
        },
        {
          title: "La page d'accueil",
          text: "Elle présente le lieu, puis les cinq univers de soins, puis l'équipe médicale. <span class='hl'>Le rendez-vous reste à un clic sur toutes les pages</span>, et se prend directement sur Doctolib.",
          video: videoSources("harmonia-ouverture"),
          poster: "/videos/harmonia-ouverture-poster.webp",
          alt: "Ouverture du site Centre Harmonia sur mobile"
        },
        {
          title: "Cinq univers",
          text: "Visage, corps, intime, cheveux, vitalité : toute l'offre du centre est rangée en cinq univers. <span class='hl'>Chacun a sa page, ses soins et ses tarifs</span>, pour trouver le bon soin sans en connaître le nom.",
          video: videoSources("harmonia-univers"),
          poster: "/videos/harmonia-univers-poster.webp",
          alt: "Le carrousel des cinq univers du Centre Harmonia"
        },
        {
          title: "Le diagnostic en ligne",
          text: "Quelques questions pour savoir par où commencer. <span class='hl'>Les réponses restent dans la page</span> : rien n'est envoyé, rien n'est conservé. Pour un centre médical, ce n'était pas un détail.",
          // L'iPad en paysage : sur téléphone, la carte plein écran n'en
          // garderait qu'un bout, d'où le recadrage 4/5 qui le garde entier.
          image: "/images/harmonia-diagnostic-ipad-large.webp",
          mobileImage: "/images/harmonia-diagnostic-ipad-mobile.webp",
          alt: "« Commencez par votre diagnostic » : l'accueil du diagnostic en ligne sur iPad"
        }
      ]}
    />
  </div>

  <div class="project-theme-band theme-deep">
    <ProjectEditorialStatement
      text="<span class='hl'>Un site médical doit d'abord rassurer.</span> Les diplômes des médecins, les règles du centre et les tarifs y sont écrits en clair, au même niveau que les soins."
    />

    <ProjectImageTabs
      title="Le site,<br /><span class='dim'>page après page.</span>"
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
          label: "Le lieu",
          image: "/images/harmonia-macbook.webp",
          mobileImage: "/images/harmonia-macbook-mobile.webp",
          alt: "La section « L'harmonie débute par le lieu » sur ordinateur portable"
        },
        // Des mockups livrés par le client (2026-10-10), chacun en deux
        // fichiers — 16/10 pour le bureau et le téléphone couché, 4/5 pour le
        // téléphone et la tablette verticale.
        {
          label: "Un univers",
          image: "/images/harmonia-univers-ecrans-large.webp",
          mobileImage: "/images/harmonia-univers-ecrans-mobile.webp",
          alt: "Les univers « Luminothérapie & bilan capillaire » et « Immunité & hydratation » sur MacBook Air et iPad Pro"
        },
        {
          label: "Les tarifs",
          image: "/images/harmonia-tarifs-macbook-large.webp",
          mobileImage: "/images/harmonia-tarifs-macbook-mobile.webp",
          alt: "La page des tarifs du Centre Harmonia sur un MacBook, posé sur les genoux"
        }
      ]}
      note="Les tarifs sont publiés en entier, univers par univers. <span class='hl'>On sait ce que coûte un soin avant de réserver.</span>"
    />
  </div>

  <div class="project-theme-band">
    <ProjectEditorialMobileShowcase
      text="<span class='hl'>Sur téléphone, rien ne manque.</span> Les cinq univers, le diagnostic et la prise de rendez-vous y fonctionnent comme sur ordinateur."
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

  <div class="project-theme-band theme-deep">
    <ProjectEditorialMosaic
      text="Les salles du centre portent des noms de figures grecques. <span class='hl'>Le site reprend l'idée</span> : ses cinq univers s'appellent Aphrodite, Iris, Hygie, Apollon et Artémis."
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
        title: "Voir le site du centre.",
        href: "https://centreharmonia.fr",
        external: true,
        // Une capture du site sur iPhone (2026-10-09), au format de l'écran.
        phone: { image: "/images/harmonia-tel-accueil.webp?v=2", position: "50% 50%" }
      }}
      secondary={{
        label: "Parlons-en",
        title: "Votre site a besoin d'une refonte ? Écrivez-nous.",
        href: "/contact"
      }}
    />
  </div>

  <!-- Le mot du client, sur le NOIR de la palette (bande sombre), à la place
       du mur des autres projets — le pied de page « projet suivant » assure la
       suite de la visite.
       Le témoignage du centre (reçu le 2026-10-27), écrit d'un seul bloc :
       la page en garde une phrase, le « + » ouvre le texte entier, coupé en
       paragraphes sans toucher aux mots. Comme pour Ludosphères, une photo en
       haut de la carte — ici le centre lui-même, sa façade — et le logo en
       filigrane. -->
  <div class="project-theme-band theme-deep">
    <ProjectQuote
      label="Le mot du client"
      quote="<span class='hl'>Le résultat final est tout simplement parfait,</span> à la hauteur de nos exigences et même au-delà."
      full={[
        "Une excellente expérience de collaboration pour la création du site internet du Centre HARMONIA&nbsp;!",
        "Une équipe professionnelle, à l’écoute, très réactive et toujours attentive à nos attentes. Chacune de nos demandes a été prise en compte avec soin et précision.",
        "Le résultat final est tout simplement parfait, à la hauteur de nos exigences et même au-delà.",
        "Un grand merci pour ce magnifique travail&nbsp;!"
      ]}
      photo="/images/harmonia-centre-rond.webp"
      photoAlt="La façade du Centre Harmonia, son enseigne au-dessus de la vitrine"
      photoPosition="50% 50%"
      signature={{ name: "Centre Harmonia", org: "Médecine esthétique" }}
      logo="/images/logos-clients/harmonia.webp"
    />
  </div>
</ProjectThemePage>
