<script>
  import PoleHeadline from "$lib/components/poles/PoleHeadline.svelte";
  import ShowcaseCards from "$lib/components/poles/ShowcaseCards.svelte";
  import SectionLead from "$lib/components/poles/SectionLead.svelte";
  import MediaSlider from "$lib/components/poles/MediaSlider.svelte";
  import AboutEditorialSingleShowcase from "$lib/components/apropos/AboutEditorialSingleShowcase.svelte";

  export let id = "pole-design";

  const designCards = [
    { image: "/images/ludo.webp", alt: "Projet Ludosphères", title: "Ludosphères", subtitle: "Identité & charte", href: "projet4", tags: ["Logo & charte", "Direction artistique", "Naming"] },
    { image: "/images/justx_textile.webp", alt: "Projet JustX", title: "JustX", subtitle: "Identité de marque", href: "projet5", tags: ["Logo & charte", "Naming", "Stratégie"] }
  ];

  // Design — identité visuelle : logo, charte, typographie, système cohérent (+ naming & stratégie).
  const designSlides = [
     { image: "/images/naming.webp", alt: "Naming et fondations", label: "Naming & fondations", caption: "Un nom et un ton qui posent des bases solides." },
    { image: "/images/ipad-logo.webp", alt: "Logo", label: "Logo", caption: "Un logo cohérent, pensé pour marquer les esprits." },
    { image: "/images/justx-couleurs2.webp", alt: "Identité visuelle", label: "Identité visuelle", caption: "Un univers visuel cohérent, fidèle à vos valeurs." },
    { image: "/images/carte-ludo.webp", alt: "Présentation de la typographie", label: "Charte éditoriale", caption: "Une manière singulière de communiquer." },
    { image: "/images/ipad-ludo.webp", alt: "Suivi stratégique", label: "Suivi & stratégie", caption: "Un accompagnement stratégique dans la durée." }
  ];
</script>

<div class="project-theme-band band-nuance-dark theme-dark" {id}>
  <PoleHeadline text="Une identité<br>qui marque<br>les esprits." />
  <ShowcaseCards cards={designCards} showSubtitle={false} />
  <SectionLead
    text="Nous façonnons l'<span class='hl'>identité visuelle</span> de la marque, du logo à la charte et la typographie, pour lui donner une <span class='hl'>présence claire et durable</span>."
  />
  <div class="design-showcase">
    <AboutEditorialSingleShowcase
      showCue={false}
      showAccent={false}
      background="#040404"
      text="Nous concevons des <span class='hl'>systèmes visuels complets</span>, pensés pour représenter la marque dans un univers global cohérent et moderne."
      image="/images/main-justx.webp"
      imageDesktop="/images/main-justx-desktop.webp"
      alt="Création de logo et d'identité"
    />
  </div>
  <MediaSlider slides={designSlides} />
</div>

<style>
  /* Espacements & nuances repris de l'ancienne page services (scopés au pôle). */
  .band-nuance-dark {
    background: var(--nuance-dark);
  }
  .band-nuance-dark :global(.ms) {
    background: var(--nuance-dark);
  }

  .project-theme-band :global(.sl:not(.sl--text-only)) {
    padding-bottom: clamp(3.5rem, 6vw, 6rem);
  }
  .project-theme-band :global(.sl--text-only) {
    padding-bottom: clamp(3rem, 5vw, 5rem);
  }

  .design-showcase :global(.about-editorial-single-showcase) {
    min-height: 0;
  }
  .design-showcase :global(.about-editorial-single-showcase__content) {
    grid-template-rows: 100vh auto 16vh;
    min-height: 0;
  }

  /* Mobile : texte du showcase design légèrement descendu. */
  @media (max-width: 900px) {
    .design-showcase :global(.about-editorial-single-showcase__text-block) {
      margin-top: 5vh;
    }
  }

  /* ── Desktop : la photo (200vh) occupe toute la 1ʳᵉ rangée ; le texte passe
     juste en dessous, à gauche, avec un léger chevauchement. ──────────────── */
  @media (min-width: 901px) {
    .design-showcase :global(.about-editorial-single-showcase__media) {
      height: 200vh;
    }
    .design-showcase :global(.about-editorial-single-showcase__floor) {
      top: 200vh;
    }
    .design-showcase :global(.about-editorial-single-showcase__content) {
      grid-template-rows: 200vh auto 16vh;
    }
    .design-showcase :global(.about-editorial-single-showcase__text-block) {
      grid-column: 1 / -1;
      justify-self: start;
      margin-left: clamp(1.5rem, 5.5vw, 5.5rem);
      padding-top: 0;
      margin-top: -38vh;
    }
    .design-showcase :global(.about-editorial-single-showcase__text) {
      max-width: 32ch;
    }
  }
</style>
