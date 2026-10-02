<script>
  import TexteIntro2 from "$lib/components/home/TexteIntro2.svelte";
  import Fonts from "$lib/components/home/Fonts.svelte";
  import StickySlider from "$lib/components/home/StickySlider.svelte";
  import ParallaxGallery2 from "$lib/components/home/ParallaxGallery2.svelte";
  import ProjetsAccordeon from "$lib/components/home/ProjetsAccordeon.svelte";
  import Hero from "$lib/components/home/Hero.svelte";
  import HomeStatement from "$lib/components/home/HomeStatement.svelte";
  import HomeLead from "$lib/components/home/HomeLead.svelte";
  import HomeFeatureCards from "$lib/components/home/HomeFeatureCards.svelte";
  import HomeActionCards from "$lib/components/home/HomeActionCards.svelte";
  import HomeClients from "$lib/components/home/HomeClients.svelte";
  import IntroSlider from "$lib/components/home/IntroSlider.svelte";
  import FaqAccordion from "$lib/components/home/FaqAccordion.svelte";
  import ContactBlock from "$lib/components/home/ContactBlock.svelte";
  import ProjectFocusReveal from "$lib/components/home/ProjectFocusReveal.svelte";
  import { videoSources } from "$lib/components/shared/media/videoSources.js";


  // ── Les quatre cartes qui suivent le texte d'ouverture ───────────────────
  //
  //  Chacune porte un numéro (donné par sa place dans la liste), un titre, une
  //  phrase et un visuel. Sur grand écran le visuel vit dans un cadre presque
  //  carré à gauche, le texte à sa droite ; sur téléphone il occupe le haut de
  //  la carte et la phrase se pose en bas. Voir `HomeFeatureCards.svelte`.
  //
  //  Les quatre photos portent leur propre décor. Elles REMPLISSENT leur cadre
  //  sur les deux mises en page (sur téléphone, à franc-bord depuis le
  //  2026-10-02) : `position` est le point de cadrage, et `mobilePosition` le
  //  remplace sur téléphone quand le cadre n'a plus le même format. Les trois
  //  formats paysage y perdent un peu de leurs bords, jamais leur sujet —
  //  l'ordinateur, le coffret et le panneau restent dans le champ.
  const featureCards = [
    {
      icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.3 6.5 6.5 2.3-6.5 2.3L12 20.8l-2.3-6.5L3.2 12l6.5-2.3z"/></svg>`,
      title: "L'identité",
      text: "Logo, charte, typographie, naming : une identité qui tient debout et se reconnaît partout où la marque passe.",
      image: "/images/ludo-drapeau.webp",
      alt: "Identité Ludosphères sur une bannière suspendue à une façade",
      position: "62% 70%",
      mobilePosition: "65% 58%"
    },
    {
      icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="2.8" width="11" height="18.4" rx="2.4"/><path d="M10.6 5.4h2.8"/></svg>`,
      title: "Le digital",
      text: "Sites et applications sur mesure, du design d'interface au développement, pensés pour durer et tenir sur tous les écrans.",
      image: "/images/moovy-ordi-bleu.webp",
      alt: "Site Moovy sur un ordinateur portable dans un décor bleu",
      position: "54% 55%"
    },
    {
      icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.6" y="6.4" width="13" height="11.2" rx="2.2"/><path d="M15.6 11.2l5.8-3v7.6l-5.8-3z"/></svg>`,
      title: "L'image",
      text: "Photo, vidéo, montage, réseaux sociaux : l'image de la marque produite chez nous, du tournage à la diffusion.",
      image: "/images/lybra-coffret.webp",
      alt: "Vue d'ensemble du coffret Lybra et de son identité visuelle",
      position: "58% 50%"
    },
    {
      icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.6"/><path d="M3.6 12h16.8M12 3.4c2.2 2.4 3.3 5.3 3.3 8.6s-1.1 6.2-3.3 8.6c-2.2-2.4-3.3-5.3-3.3-8.6S9.8 5.8 12 3.4z"/></svg>`,
      title: "L'accompagnement",
      text: "Clarifier votre positionnement, définir vos priorités et construire une stratégie sur mesure : nous vous accompagnons dans vos choix et leur mise en œuvre, à chaque étape du projet.",
      image: "/images/affiche-moovy.webp",
      alt: "Panneau publicitaire Moovy : Le film idéal, en quelques clics",
      position: "54% 42%"
    }
  ];

  const hsliderSlides = [
    {
      title: "Harmonia",
      description: "Médecine esthétique,\nidentité et site.",
      images: [
        "/videos/harmonia-univers-poster.webp",
        "/images/harmonia-vitrine.webp",
        "/images/harmonia-moodboard.webp"
      ],
      href: "/projet9"
    },
    {
      title: "Lybra",
      description: "Identité de marque,\ncolibri et charte.",
      images: ["/images/lybra-cartes.webp", "/images/lybra-macbook.webp", "/images/lybra-affichage.webp"],
      href: "/projet8"
    },
    {
      title: "Ludosphères",
      description: "Site d'artiste pour\noeuvres peintes.",
      images: ["/images/ipad-ludo.webp", "/images/ludo-site-desktop.webp", "/images/ludo-drapeau.webp"],
      href: "/projet4"
    },
    {
      title: "Moovy",
      description: "Recommandation de films\nselon ses envies.",
      images: ["/images/moovy-phone.webp", "/images/tel_moovy2.webp", "/images/moovy_recherche.webp"],
      // Fond animé : le plan « parcours » de la page projet, remonté au cadre
      // du slider (bien plus haut) et repassé en portrait sur mobile.
      video: videoSources("moovy-parcours-slider"),
      mobileVideo: videoSources("moovy-parcours-slider-mobile"),
      poster: "/videos/moovy-parcours-poster.webp",
      href: "/projet3"
    },
    {
      title: "Mission X",
      description: "Jeu mobile, détectives\ncontre voleurs.",
      images: ["/images/jeu_mockup.webp", "/images/missionX5.webp", "/images/missionx1.webp"],
      href: "/projet6"
    },
    {
      title: "Votre\nprojet ?",
      description: "Approche sur mesure,\nsingularité et impact.",
      images: ["/images/agence.webp"],
      full: true,
      href: "/contact",
      cta: "Nous contacter"
    }
  ];
</script>

<h1 class="seo-page-title">Agence 3 Terres - Sites web, identité et direction artistique</h1>
<Hero />
<HomeStatement />
<HomeLead />
<HomeFeatureCards cards={featureCards} />
<ParallaxGallery2
  layout="grid"
  introLead="Trois pôles spécialisés. <span class='dim'>Une même direction artistique.</span>"
/>
<HomeActionCards />
<HomeClients />

<IntroSlider />
<ProjectFocusReveal slides={hsliderSlides} />
<FaqAccordion />
<ContactBlock />
