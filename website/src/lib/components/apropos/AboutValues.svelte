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
      text: "Nous imaginons des idées qui prennent racine dans l'<span class='hl'>identité</span>, les valeurs et la vision de chaque projet afin d'en révéler toute la <span class='hl'>singularité</span>.",
      image: "/images/ipad-creation.webp",
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
      text: "Nous avançons aux côtés de nos clients avec écoute, <span class='hl'>transparence</span> et collaboration pour bâtir des relations solides et <span class='hl'>durables</span>.",
      image: "/images/visage.webp",
      alt: "Application JustX sur mobile",
      layout: "text-right",
      flushBottom: true,
      background: "#040404",
      ink: "#f4efe6",
      inkMuted: "rgba(245, 241, 232, 0.62)"
    },
    {
      label: "Excellence engagée",
      text: "Nous abordons chaque mission avec <span class='hl'>rigueur</span>, passion et authenticité afin de créer des <span class='hl'>résultats cohérents</span>, porteurs de sens et fidèles à l'image de ceux que nous accompagnons.",
      image: "/images/justx-ipads.webp",
      alt: "Application JustX sur iPad",
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
          <p class="value-copy">{@html part.text}</p>
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
    /* Garde-fou anti-scroll horizontal : posé sur le conteneur (et non sur
       chaque bloc) pour laisser la 3ᵉ image déborder en pleine largeur. */
    overflow-x: clip;
  }

  .value-part {
    width: 100%;
    background: var(--av-bg, #000);
    color: var(--av-ink, #f4efe6);
    padding: clamp(5rem, 12vh, 11rem) clamp(1.5rem, 3vw, 3rem);
  }

  .value-inner {
    width: min(1560px, 100%);
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: clamp(1.6rem, 3.5vw, 4rem);
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
    /* Un peu moins d'espace au-dessus du texte (entre l'image et le texte). */
    gap: clamp(1.5rem, 2.6vw, 2.4rem);
  }

  /* Un peu plus d'air sous le texte de la partie 3. */
  .value-part--stacked {
    padding-bottom: clamp(7rem, 15vh, 13.5rem);
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
    /* Texte en gris, mots importants (.hl) en blanc. */
    color: rgba(245, 241, 232, 0.5);
    text-wrap: pretty;
  }

  .value-copy :global(.hl) {
    color: var(--av-ink, #f4efe6);
  }

  .value-part--stacked .value-copy {
    max-width: 40ch;
    margin: 0 auto;
  }

  /* ── Grande image ─────────────────────────────────────────────────────
     Aucun cadre : ni fond, ni arrondi, ni hauteur fixe. L'image entière à sa
     hauteur naturelle, à la manière d'AboutEditorialSingleShowcase. */
  .value-media {
    /* Image nettement plus grande que le texte (parties 1 & 2). */
    flex: 2.6 1 0;
    min-width: 0;
    margin: 0;
  }

  .value-part--stacked .value-media {
    /* Pleine largeur bord à bord : 100vw, centré par la colonne (align-items:
       center) → déborde symétriquement jusqu'aux bords de l'écran. */
    flex: 0 0 auto;
    width: 100vw;
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

  /* Desktop : rapproche très légèrement les deux textes vers le centre
     (part 1 vers la droite, part 2 vers la gauche). */
  @media (min-width: 901px) {
    .value-part--text-left .value-text {
      margin-left: clamp(1rem, 2.2vw, 2.2rem);
    }

    .value-part--text-right .value-text {
      margin-right: clamp(1rem, 2.2vw, 2.2rem);
    }

    /* Part 1 : l'image colle au bord droit de l'écran (déborde du conteneur
       centré). 50% = moitié de la largeur du conteneur flex (.value-inner). */
    .value-part--text-left .value-media {
      margin-right: calc(50% - 50vw);
    }
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

    /* Un peu plus d'air au-dessus des textes des parties 1 & 2 (texte en haut). */
    .value-part--text-left,
    .value-part--text-right {
      padding-top: clamp(5.5rem, 13vh, 8.5rem);
    }

    /* Un peu plus d'air sous le texte de la partie 3 (le raccourci `padding`
       ci-dessus l'avait réécrit). */
    .value-part--stacked {
      padding-bottom: clamp(5rem, 11vh, 7.5rem);
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

    /* Part 2 (« Proximité et confiance ») : un peu plus d'air entre le texte
       et l'image sur mobile. */
    .value-part--text-right .value-inner {
      gap: clamp(3.2rem, 9vw, 4.5rem);
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

    /* Parties 1 & 2 (photos portrait) encore plus grandes : hauteur généreuse,
       image cadrée pour remplir tout le cadre (aucun cadre/fond visible). */
    .value-part--text-left .value-media,
    .value-part--text-right .value-media {
      height: 82vh;
    }

    .value-part--text-left .value-media img,
    .value-part--text-right .value-media img {
      height: 100%;
      object-fit: cover;
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
      width: 100vw;
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

  /* Phone in landscape. Neither the desktop (natural-height images that
     overflow a 400px viewport) nor the portrait-mobile column (a portrait photo
     squashed into a wide band) reads well here. Give landscape ONE coherent
     treatment: text beside the image (uses the wide, short frame), the image
     constrained to the viewport height and cropped with object-fit. */
  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .value-part {
      padding: 8svh clamp(1.25rem, 3vw, 2.5rem);
    }
    .value-part--flush-bottom {
      padding-bottom: 0;
    }

    .value-inner {
      gap: clamp(1.5rem, 4vw, 3rem);
      align-items: center;
    }
    .value-part--text-left .value-inner {
      flex-direction: row;
    }
    .value-part--text-right .value-inner {
      flex-direction: row-reverse;
    }

    .value-text {
      width: auto;
      flex: 1 1 40%;
    }

    .value-media {
      flex: 1 1 56%;
      width: auto;
      margin-inline: 0;
    }
    /* Kill the desktop full-bleed-right on part 1 so the image stays in its
       column at a controlled height. */
    .value-part--text-left .value-media {
      margin-right: 0;
    }
    .value-part--text-left .value-media,
    .value-part--text-right .value-media {
      height: min(80svh, 420px);
    }
    .value-part--text-left .value-media img,
    .value-part--text-right .value-media img {
      height: 100%;
      width: 100%;
      object-fit: cover;
      border-radius: 8px;
    }

    .value-label,
    .value-copy {
      max-width: 32ch;
      font-size: clamp(1.15rem, 3.1vw, 1.6rem);
      line-height: 1.2;
    }

    /* Part 3 stays image-over-text, but compact. */
    .value-part--stacked {
      padding-bottom: 8svh;
    }
    .value-part--stacked .value-inner {
      gap: clamp(1.2rem, 3vw, 2rem);
    }
    .value-part--stacked .value-media {
      width: 100vw;
    }
    .value-part--stacked .value-media img {
      max-height: 60svh;
      width: 100%;
      object-fit: cover;
    }
    .value-part--stacked .value-text {
      max-width: 62ch;
    }
  }
</style>
