<script>
  import AboutStoryIntro from "$lib/components/apropos/AboutStoryIntro.svelte";
  import VisionSlider from "$lib/components/apropos/VisionSlider.svelte";
  // AboutEditorialPrinciples retiré des composants actifs (fichier conservé)
  // au profit d'AboutValues (3 parties éditoriales sans slider).
  // import AboutEditorialPrinciples from "$lib/components/apropos/AboutEditorialPrinciples.svelte";
  import AboutValues from "$lib/components/apropos/AboutValues.svelte";
  import HeroApropos from "$lib/components/apropos/HeroApropos.svelte";
  // Reflet / Création / Ambition : le « Slider séquence collée » de la
  // librairie (2026-10-08). Il remplace l'accordéon de verre
  // AboutFocusEditorialShowcase — fichier conservé.
  import AboutStickySequence from "$lib/components/apropos/AboutStickySequence.svelte";
  // Sous le slider éditorial : une seule image, très grande, et la promesse
  // dans son coin. Remplace AboutBentoWindows (grille de six blocs percés dans
  // une image commune), retiré le 2026-09-03 — le fichier est conservé.
  import AboutBrandReveal from "$lib/components/apropos/AboutBrandReveal.svelte";
  // Juste avant le carrousel de citations : les marques accompagnées. Un visuel
  // encadré à gauche, la phrase à droite, et le logo de la marque en bas à
  // droite — visuel et logo basculent ensemble toutes les deux secondes.
  import AboutClients from "$lib/components/apropos/AboutClients.svelte";

  // Les trois volets de la séquence : une image et une phrase par tour
  // d'écran. Le libellé nomme le volet dans la colonne de repères, à droite.
  // Environ DEUX LIGNES ET DEMIE en pleine encre (mesuré en 1440), coupées à
  // une articulation de la phrase, la suite en gris. La ponctuation de la
  // coupe va DANS le `.hl` : laissée après `</span>`, elle deviendrait un mot
  // à part à l'arrivée mot à mot.
  const showcaseSlides = [
    {
      label: "Un reflet",
      text: "<span class='hl'>Avant de dessiner quoi que ce soit, nous écoutons. Une marque arrive rarement les mains vides :</span> elle a ses mots, ses gestes, sa manière. Notre travail commence par les reconnaître, pour que tout ce qui suivra lui ressemble vraiment.",
      image: "/images/lac copie.webp",
      alt: "Reflet — identité de marque Agence 3 Terres"
    },
    {
      label: "Une création",
      text: "<span class='hl'>Vient la forme. Identité, site, image : chaque pièce est dessinée pour cette marque-là,</span> jamais reprise d'un modèle. Et pensée pour tenir dans le temps, pas pour une saison.",
      image: "/images/pexels-erich-naufal-52024210-7920814.webp",
      alt: "Tours de verre vues du sol — création Agence 3 Terres"
    },
    {
      label: "Une ambition",
      text: "<span class='hl'>Reste à viser juste. Nous bâtissons une stratégie sur mesure et nous restons là pour la mener,</span> jusqu'à ce que la marque occupe la place qu'elle mérite.",
      image: "/images/pexels-jack-atkinson-1289771108-24356055.webp",
      alt: "Ambition — stratégie de marque Agence 3 Terres"
    }
  ];
</script>

<h1 class="seo-page-title">À propos - Vision et approche Agence 3 Terres</h1>
<HeroApropos />

<AboutStickySequence slides={showcaseSlides} />
<AboutBrandReveal
  lead="Notre façon de faire. <span class='dim'>Une méthode tenue d'un bout à l'autre du projet.</span>"
/>
<AboutValues />
<AboutClients />
<VisionSlider />
