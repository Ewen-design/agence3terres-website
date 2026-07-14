<script>
  import { reveal } from "$lib/actions/reveal.js";

  // Trois valeurs présentées en éditorial (une grande image + un texte par
  // partie), dans la même veine que AboutEditorialSingleShowcase de la page
  // services — mais sans slider. Remplace l'ancien VisionSlider.
  //
  // layout (desktop) :
  //   "text-left"  → texte à gauche, image à droite
  //   "text-right" → image à gauche, texte à droite
  //   "stacked"    → image centrée au-dessus, texte centré en dessous
  //
  // Fonds : « noir clair » → foncé → clair.
  const parts = [
    {
      label: "Créativité enracinée",
      text: "Nous imaginons des idées qui prennent racine dans l'identité, les valeurs et la vision de chaque projet afin d'en révéler toute la singularité.",
      image: "/images/tel-justx.webp",
      alt: "Application JustX sur mobile",
      layout: "text-left",
      // Image ancrée au bas du bloc (façon téléphone qui remonte du bord bas).
      flushBottom: true,
      background: "#161617",
      ink: "#f4efe6",
      inkMuted: "rgba(245, 241, 232, 0.62)"
    },
    {
      label: "Proximité et confiance",
      text: "Nous avançons aux côtés de nos clients avec écoute, transparence et collaboration pour bâtir des relations solides et durables.",
      image: "/images/tel-justx.webp",
      alt: "Application JustX sur mobile",
      layout: "text-right",
      flushBottom: true,
      background: "#040404",
      ink: "#f4efe6",
      inkMuted: "rgba(245, 241, 232, 0.62)"
    },
    {
      label: "Excellence engagée",
      text: "Nous abordons chaque mission avec rigueur, passion et authenticité afin de créer des résultats cohérents, porteurs de sens et fidèles à l'image de ceux que nous accompagnons.",
      image: "/images/tel-justx.webp",
      alt: "Application JustX sur mobile",
      layout: "stacked",
      background: "#161617",
      ink: "#f4efe6",
      inkMuted: "rgba(245, 241, 232, 0.62)"
    }
  ];
</script>

<section class="about-values" aria-label="Nos valeurs">
  {#each parts as part}
    <div
      class="value-part value-part--{part.layout}"
      class:value-part--flush-bottom={part.flushBottom}
      style={`--av-bg:${part.background}; --av-ink:${part.ink}; --av-muted:${part.inkMuted};`}
    >
      <div class="value-inner">
        <div class="value-text" use:reveal>
          <h2 class="value-label">{part.label}</h2>
          <p class="value-copy">{part.text}</p>
        </div>

        <figure class="value-media" use:reveal={{ delay: 120 }}>
          <img
            src={part.image}
            alt={part.alt}
            loading="lazy"
            decoding="async"
          />
        </figure>
      </div>
    </div>
  {/each}
</section>

<style>
  .about-values {
    width: 100%;
  }

  .value-part {
    width: 100%;
    background: var(--av-bg, #000);
    color: var(--av-ink, #f4efe6);
    padding: clamp(5rem, 12vh, 11rem) clamp(1.5rem, 3vw, 3rem);
    overflow-x: clip;
  }

  .value-inner {
    width: min(1400px, 100%);
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: clamp(2rem, 5vw, 6rem);
  }

  /* ── Layouts desktop ──────────────────────────────────────────────── */
  /* DOM = [texte][image]. On réordonne uniquement en flex. */
  .value-part--text-left .value-inner {
    flex-direction: row;
  }

  .value-part--text-right .value-inner {
    flex-direction: row-reverse;
  }

  .value-part--stacked .value-inner {
    flex-direction: column-reverse;
    align-items: center;
    gap: clamp(2.4rem, 4vw, 3.6rem);
  }

  /* ── Bloc texte ───────────────────────────────────────────────────── */
  .value-text {
    flex: 1 1 0;
    min-width: 0;
  }

  .value-part--stacked .value-text {
    flex: 0 0 auto;
    max-width: 46ch;
    text-align: center;
  }

  /* Titre à la même taille que le texte (plus de trait bleu au-dessus). */
  .value-label {
    margin: 0 0 clamp(0.7rem, 1.2vw, 1.1rem);
    font-family: "Inter", sans-serif;
    font-size: clamp(1.5rem, 2.5vw, 2.55rem);
    font-weight: 400;
    line-height: 1.18;
    letter-spacing: -0.025em;
    color: var(--av-ink, #f4efe6);
  }

  .value-copy {
    margin: 0;
    max-width: 26ch;
    font-family: "Inter", sans-serif;
    font-size: clamp(1.5rem, 2.5vw, 2.55rem);
    font-weight: 300;
    line-height: 1.18;
    letter-spacing: -0.025em;
    color: var(--av-ink, #f4efe6);
    text-wrap: pretty;
  }

  .value-part--stacked .value-copy {
    max-width: 40ch;
    margin: 0 auto;
  }

  /* ── Grande image ─────────────────────────────────────────────────────
     Aucun cadre : ni fond, ni arrondi, ni hauteur fixe. L'image entière à sa
     hauteur naturelle, à la manière d'AboutEditorialSingleShowcase. */
  .value-media {
    /* Image plus grande que le texte (parties 1 & 2). */
    flex: 1.6 1 0;
    min-width: 0;
    margin: 0;
  }

  .value-part--stacked .value-media {
    flex: 0 0 auto;
    width: min(820px, 100%);
  }

  .value-media img {
    width: 100%;
    height: auto;
    display: block;
  }

  /* Partie 1 : le bas de l'image épouse le bas du bloc (plus de padding bas,
     image ancrée tout en bas). */
  .value-part--flush-bottom {
    padding-bottom: 0;
  }

  .value-part--flush-bottom .value-media {
    align-self: flex-end;
  }

  /* ── Mobile ───────────────────────────────────────────────────────── */
  @media (max-width: 900px) {
    .value-part {
      padding: clamp(4rem, 9vh, 6rem) 1.25rem;
    }

    /* Le raccourci `padding` ci-dessus réécrit le bas : on le remet à 0 pour que
       l'image reste collée au bas du bloc (parties 1 & 2). */
    .value-part--flush-bottom {
      padding-bottom: 0;
    }

    .value-inner {
      gap: clamp(1.8rem, 6vw, 2.6rem);
    }

    /* Parties 1 & 2 : texte au-dessus, image en dessous. */
    .value-part--text-left .value-inner,
    .value-part--text-right .value-inner {
      flex-direction: column;
      align-items: stretch;
    }

    /* Partie 3 : image au-dessus, texte en dessous. */
    .value-part--stacked .value-inner {
      flex-direction: column-reverse;
    }

    .value-text {
      width: 100%;
    }

    /* Images plus grandes sur mobile : pleine largeur, bord à bord (elles
       débordent du padding latéral du bloc). */
    .value-media {
      width: calc(100% + 2.5rem);
      margin-inline: -1.25rem;
    }

    .value-label,
    .value-copy {
      max-width: 24ch;
      font-size: clamp(1.5rem, 6.6vw, 2rem);
      line-height: 1.2;
    }

    .value-part--stacked .value-text {
      max-width: none;
    }

    .value-part--stacked .value-media {
      width: calc(100% + 2.5rem);
      margin-inline: 0;
    }

    /* Partie 1 : image pleine largeur, non ancrée à droite en colonne. */
    .value-part--flush-bottom .value-media {
      align-self: stretch;
    }
  }

  @media (max-width: 640px) {
    .value-label,
    .value-copy {
      font-size: clamp(1.4rem, 6.6vw, 1.9rem);
    }
  }
</style>
