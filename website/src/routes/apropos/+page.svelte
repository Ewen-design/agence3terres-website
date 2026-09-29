<script>
  import AboutStoryIntro from "$lib/components/apropos/AboutStoryIntro.svelte";
  import VisionSlider from "$lib/components/apropos/VisionSlider.svelte";
  // AboutEditorialPrinciples retiré des composants actifs (fichier conservé)
  // au profit d'AboutValues (3 parties éditoriales sans slider).
  // import AboutEditorialPrinciples from "$lib/components/apropos/AboutEditorialPrinciples.svelte";
  import AboutValues from "$lib/components/apropos/AboutValues.svelte";
  import HeroApropos from "$lib/components/apropos/HeroApropos.svelte";
  // Fusion des anciens AboutFocusSlider + AboutEditorialSingleShowcase :
  // un seul slider éditorial (look/texte du 2e, module de slider du 1er).
  import AboutFocusEditorialShowcase from "$lib/components/apropos/AboutFocusEditorialShowcase.svelte";
  // Sous le slider éditorial : une seule image, très grande, et la promesse
  // dans son coin. Remplace AboutBentoWindows (grille de six blocs percés dans
  // une image commune), retiré le 2026-09-03 — le fichier est conservé.
  import AboutBrandReveal from "$lib/components/apropos/AboutBrandReveal.svelte";
  // Juste avant le carrousel de citations : les marques accompagnées. Un visuel
  // encadré à gauche, la phrase à droite, et le logo de la marque en bas à
  // droite — visuel et logo basculent ensemble toutes les deux secondes.
  import AboutClients from "$lib/components/apropos/AboutClients.svelte";

  // Les trois volets de l'accordéon. Les textes sont plus longs qu'avant :
  // ils ne se posent plus sur la photo mais DANS la pastille, qui s'ouvre pour
  // les livrer — le format supporte deux ou trois lignes de plus.
  const showcaseSlides = [
    {
      label: "Un reflet",
      text: "Avant de dessiner quoi que ce soit, nous <span class='hl'>écoutons</span>. Une marque arrive rarement les mains vides : elle a ses mots, ses gestes, sa manière. Notre travail commence par les <span class='hl'>reconnaître</span>, pour que tout ce qui suivra lui ressemble vraiment.",
      image: "/images/lac copie.webp",
      alt: "Reflet — identité de marque Agence 3 Terres"
    },
    {
      label: "Une création",
      text: "Vient la forme. Identité, site, image : chaque pièce est <span class='hl'>dessinée pour cette marque-là</span>, jamais reprise d'un modèle. Et pensée pour <span class='hl'>tenir dans le temps</span>, pas pour une saison.",
      image: "/images/pexels-erich-naufal-52024210-7920814.webp",
      alt: "Tours de verre vues du sol — création Agence 3 Terres"
    },
    {
      label: "Une ambition",
      text: "Reste à viser juste. Nous bâtissons une <span class='hl'>stratégie sur mesure</span> et nous restons là pour la mener, jusqu'à ce que la marque occupe la <span class='hl'>place qu'elle mérite</span>.",
      image: "/images/pexels-jack-atkinson-1289771108-24356055.webp",
      alt: "Ambition — stratégie de marque Agence 3 Terres"
    }
  ];
</script>

<h1 class="seo-page-title">À propos - Vision et approche Agence 3 Terres</h1>
<HeroApropos />

<AboutFocusEditorialShowcase slides={showcaseSlides} interval={10000} />
<AboutBrandReveal
  lead="Notre façon de faire. <span class='dim'>Une méthode tenue d'un bout à l'autre du projet.</span>"
/>
<AboutValues />
<AboutClients />
<VisionSlider />
