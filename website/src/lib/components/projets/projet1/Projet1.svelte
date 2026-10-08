<script>
  // ── Serein Design — identité produit ──────────────────────────────────────
  //  La page la plus courte des cinq, et c'est volontaire : le projet est
  //  toujours en cours et il n'y a que trois visuels à montrer. Mieux vaut
  //  trois blocs justes qu'une page étirée sur des images répétées.
  import ProjectThemePage from "$lib/components/projets/shared/ProjectThemePage.svelte";
  import ProjectHeroProjetsStyle from "$lib/components/projets/shared/ProjectHeroProjetsStyle.svelte";
  import ProjectEditorialStatement from "$lib/components/projets/shared/ProjectEditorialStatement.svelte";

  import ProjectEditoBadge from "$lib/components/projets/blocks/ProjectEditoBadge.svelte";
  // « Notre rôle » en volets : c'est le composant de la HOME, réutilisé tel
  // quel. Une copie vivait un temps dans `blocks/` et tremblait sur Safari là
  // où l'original ne tremble pas — elle a été jetée plutôt que rafistolée.
  import ProjectFlaps from "$lib/components/home/HomeFeatureCards.svelte";
  import ProjectActionDuo from "$lib/components/projets/blocks/ProjectActionDuo.svelte";
  import ProjectQuote from "$lib/components/projets/blocks/ProjectQuote.svelte";

</script>

<ProjectThemePage>
  <ProjectHeroProjetsStyle
    title="Serein Design"
    image="/images/serein_design.webp"
    metaBlocks={[
      { label: "Date", value: "2025 - Present" },
      { label: "Localisation", value: "France" },
      {
        label: "Services",
        value: ["UI Design", "UX Design", "Direction visuelle"]
      }
    ]}
    ctaLabel="Découvrir le projet"
    scrollToId="projet-serein"
  />

  <div class="project-theme-band" id="projet-serein">
    <ProjectEditoBadge
      text="<span class='hl'>Serein Design cherchait une présence plus nette et résolument premium.</span> Nous avons clarifié son identité et son interface pour donner à l'ensemble plus d'air, de hiérarchie et de calme."
      image="/images/telephone2.webp"
      alt="Interface Serein Design sur mobile"
      aspect="1.6"
      mobileAspect="1.1"
    />

    <ProjectFlaps
      background="var(--project-surface-bg, var(--bg-deep, #050709))"
      title="Moins d'éléments,<br />plus de hiérarchie."
      cards={[
        {
          title: "Une direction visuelle sobre",
          text: "Une gamme resserrée, des contrastes tenus, un <span class='hl'>vocabulaire de formes</span> pensé pour durer plutôt que pour surprendre.",
          image: "/images/serein_design.webp",
          alt: "Univers visuel de Serein Design"
        },
        {
          title: "Une interface remise à plat",
          text: "Chaque écran ne porte plus qu'une intention. Ce qui restait dans l'image a été <span class='hl'>retiré</span>, pas déplacé.",
          image: "/images/telephone3.webp",
          alt: "Vue mobile de Serein Design"
        },
        {
          title: "Du desktop au mobile",
          text: "Le même système se déploie <span class='hl'>sans effort</span> d'un écran à l'autre : mêmes marges, mêmes rythmes, mêmes règles.",
          image: "/images/telephone2.webp",
          alt: "Interface Serein Design sur téléphone"
        }
      ]}
    />
  </div>

  <div class="project-theme-band theme-deep">
    <ProjectEditorialStatement
      text="<span class='hl'>Une direction visuelle sobre.</span> Pensée pour durer, et pour se déployer sans effort du bureau au téléphone."
    />

    <ProjectActionDuo
      tint="#3866b8"
      primary={{
        label: "Le travail",
        title: "Voir les projets déjà en ligne.",
        href: "/travail",
        phone: { image: "/images/telephone2.webp", position: "50% 42%" }
      }}
      secondary={{
        label: "Parlons-en",
        title: "Votre produit mérite plus d'air.",
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
