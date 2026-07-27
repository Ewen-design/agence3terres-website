<script>
  import PoleHeadline from "$lib/components/poles/PoleHeadline.svelte";
  import ShowcaseCards from "$lib/components/poles/ShowcaseCards.svelte";
  import SectionLead from "$lib/components/poles/SectionLead.svelte";
  import MediaSlider from "$lib/components/poles/MediaSlider.svelte";
  import AboutEditorialSingleShowcase from "$lib/components/apropos/AboutEditorialSingleShowcase.svelte";

  export let id = "pole-studio";

  const studioCards = [
    { image: "/images/justx-pub2.webp", alt: "Projet JustX", title: "JustX", subtitle: "Gestion des réseaux sociaux", href: "projet5", tags: ["Réseaux sociaux", "Contenu & montage"] },
    { image: "/images/ludo.webp", alt: "Projet Ludosphères", title: "Ludosphères", subtitle: "Gestion des réseaux sociaux et montage vidéo", href: "projet4", tags: ["Événementiel", "Réseaux sociaux"] }
  ];

  // Studio — toute l'image de la marque : captation, DA, réseaux, contenu, 3D.
  const studioSlides = [
    { image: "/images/mobile-photo.webp", alt: "Captation photo et vidéo", label: "Captation & événements", caption: "Une présence événementielle plus forte afin de faire durer un moment inoubliable." },
    { image: "/images/justx-rs.webp", alt: "Réseaux sociaux", label: "Réseaux sociaux", caption: "Une présence sur les réseaux sociaux posant un univers en faisant connaître la marque." },
    { image: "/images/justx_textile.webp", alt: "Contenu et montage", label: "Contenu & montage", caption: "Nous créons des contenus vidéos et photos adaptables à chaque marque et à chaque cible." },
    { image: "/images/apple_justx.webp", alt: "Photo produit", label: "Photo produit", caption: "Des visuels soignés qui subliment produits et supports." }
  ];
</script>

<div class="project-theme-band band-nuance-dark theme-dark" {id}>
  <PoleHeadline text="Des contenus<br>qui font vivre<br>la marque." />
  <ShowcaseCards cards={studioCards} showSubtitle={false} />
  <SectionLead
    text="Nous produisons toute l'image de la marque : captation, réseaux sociaux, montage et contenu, au service d'une <span class='hl'>direction artistique durable</span>."
  />
  <div class="studio-showcase">
    <AboutEditorialSingleShowcase
      showCue={false}
      showAccent={false}
      background="#040404"
      imageFit="contain"
      imagePosition="right top"
      text="Chaque contenu est produit avec le même soin, pour <span class='hl'>prolonger l'expérience</span> de la marque et renforcer sa présence, de l'événement aux réseaux."
      image="/images/justx-ipads.webp"
      alt="Contenu et réseaux sociaux JustX"
    />
  </div>
  <MediaSlider slides={studioSlides} />
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

  .studio-showcase :global(.about-editorial-single-showcase) {
    min-height: 0;
  }
  .studio-showcase :global(.about-editorial-single-showcase__content) {
    grid-template-rows: 100vh auto 16vh;
    min-height: 0;
  }

  /* ── Desktop : image portrait agrandie, collée à droite ; texte à gauche
     décalé, un peu plus bas, sur 2 colonnes. ──────────────────────────────── */
  @media (min-width: 901px) {
    .studio-showcase :global(.about-editorial-single-showcase__media) {
      height: 168vh;
    }
    .studio-showcase :global(.about-editorial-single-showcase__floor) {
      top: 168vh;
    }
    .studio-showcase :global(.about-editorial-single-showcase__media img) {
      object-position: right center;
    }
    .studio-showcase :global(.about-editorial-single-showcase__text-block) {
      grid-column: 1 / 3;
      justify-self: start;
      margin-left: clamp(3rem, 8vw, 9rem);
      padding-top: clamp(16rem, 26vh, 24rem);
    }
    .studio-showcase :global(.about-editorial-single-showcase__text) {
      max-width: 27ch;
    }
  }

  /* Mobile : l'image (contain) est courte → on remonte le texte pour combler. */
  @media (max-width: 900px) {
    .studio-showcase :global(.about-editorial-single-showcase__text-block) {
      margin-top: -56vh;
    }
  }
</style>
