<script>
  import PoleHeadline from "$lib/components/poles/PoleHeadline.svelte";
  import ShowcaseCards from "$lib/components/poles/ShowcaseCards.svelte";
  import SectionLead from "$lib/components/poles/SectionLead.svelte";
  import MediaSlider from "$lib/components/poles/MediaSlider.svelte";
  import AboutEditorialSingleShowcase from "$lib/components/apropos/AboutEditorialSingleShowcase.svelte";

  export let id = "pole-digital";

  const digitalCards = [
    { image: "/images/tel_moovy.webp", alt: "Plateforme Moovy", title: "Moovy", subtitle: "Plateforme web", href: "projet3", tags: ["Site web", "Design d'interface", "Développement"] },
    { image: "/images/app-justx.webp", alt: "Application JustX Fitness", title: "JustX Fitness", subtitle: "Application mobile", href: "projet7", tags: ["Application mobile", "Design d'interface", "Développement"] }
  ];

  // Digital — sites web & applications : parcours, interface, responsive, dev.
  const digitalSlides = [
    { image: "/images/moovy-ordi.webp", alt: "Site web desktop", label: "Site web", caption: "Des expériences digitales modernes, pensées comme un parcours fluide qui guide vers l'essentiel." },
    { image: "/images/moovy_page.webp", alt: "Design d'interface", label: "Design d'interface", caption: "Chaque écran est composé pour hiérarchiser l'information et guider le regard sans effort." },
    { image: "/images/justx-tel.webp", alt: "Vue mobile responsive", label: "Responsive & mobile", caption: "La même clarté et la même fluidité, du grand écran adapté à tous les supports." },
    { image: "/images/moovy_recherche.webp", alt: "Parcours et recherche", label: "Parcours & recherche", caption: "Des parcours stratégiques pensés pour guider l'utilisateur vers ses objectifs." },
    { image: "/images/app-justx.webp", alt: "Application mobile", label: "Application mobile", caption: "Des expériences d'application mobiles fluides et intuitives, pensées pour marquer et capter l'attention de l'utilisateur." },
  ];
</script>

<div class="project-theme-band band-nuance-dark theme-dark" {id}>
  <PoleHeadline text="Des expériences<br>digitales<br>qui captivent." />
  <ShowcaseCards cards={digitalCards} showSubtitle={false} />
  <SectionLead
    text="Des <span class='hl'>sites web</span> et des applications sur mesure, du design d'interface au <span class='hl'>développement</span>, pensés pour toucher durablement votre cible."
  />
  <div class="digital-showcase">
    <AboutEditorialSingleShowcase
      showCue={false}
      showAccent={false}
      background="#040404"
      text="Nos projets sont pensés pour <span class='hl'>s'adapter sur tous les supports</span>, de manière à répondre aux besoins de nos clients."
      image="/images/apple_justx.webp"
      alt="Application JustX Fitness"
    />
  </div>
  <MediaSlider slides={digitalSlides} />
</div>

<style>
  /* Espacements & nuances repris de l'ancienne page services (scopés au pôle). */
  .band-nuance-dark {
    background: var(--nuance-dark);
  }
  .band-nuance-dark :global(.ms) {
    background: var(--nuance-dark);
  }

  /* Un peu plus d'air sous le grand titre du pôle, avant les deux cartes. */
  .project-theme-band :global(.sl:not(.sl--text-only)) {
    padding-bottom: clamp(3.5rem, 6vw, 6rem);
  }
  /* Un peu plus d'air sous le paragraphe d'intro, avant le bloc suivant. */
  .project-theme-band :global(.sl--text-only) {
    padding-bottom: clamp(3rem, 5vw, 5rem);
  }

  /* Même espace vide sous le texte de showcase (rangée basse 16vh). */
  .digital-showcase :global(.about-editorial-single-showcase) {
    min-height: 0;
  }
  .digital-showcase :global(.about-editorial-single-showcase__content) {
    grid-template-rows: 100vh auto 16vh;
    min-height: 0;
  }

  /* Desktop : texte plutôt à gauche, largeur inchangée. */
  @media (min-width: 901px) {
    .digital-showcase :global(.about-editorial-single-showcase__text-block) {
      grid-column: 1 / -1;
      justify-self: start;
      margin-left: clamp(1.5rem, 5.5vw, 5.5rem);
    }
  }

  /* Mobile : photo décalée un peu vers la droite. */
  @media (max-width: 900px) {
    .digital-showcase :global(.about-editorial-single-showcase__media img) {
      object-position: 35% center;
    }
  }
</style>
