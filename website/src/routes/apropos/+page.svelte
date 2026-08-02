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

  const showcaseSlides = [
    {
      label: "Un reflet",
      text: "Nous <span class='hl'>reflétons</span> l'identité de nos clients avec <span class='hl'>précision</span>, pour leur proposer les solutions les plus adaptées.",
      image: "/images/lac copie.webp",
      alt: "Reflet — identité de marque Agence 3 Terres"
    },
    {
      label: "Une création",
      text: "Nous concevons des <span class='hl'>expériences</span> de marque uniques, pensées pour <span class='hl'>durer</span> et faire la différence.",
      image: "/images/pexels-hikaique-5913599.webp",
      alt: "Création — expériences de marque Agence 3 Terres"
    },
    {
      label: "Une ambition",
      text: "Nous imaginons des <span class='hl'>stratégies</span> sur-mesure, pour accompagner chaque projet jusqu'au sommet de ses <span class='hl'>ambitions</span>.",
      image: "/images/pexels-jack-atkinson-1289771108-24356055.webp",
      alt: "Ambition — stratégie de marque Agence 3 Terres"
    }
  ];
</script>

<h1 class="seo-page-title">À propos - Vision et approche Agence 3 Terres</h1>
<HeroApropos />

<AboutFocusEditorialShowcase slides={showcaseSlides} interval={8000} />
<AboutValues />
<VisionSlider />
