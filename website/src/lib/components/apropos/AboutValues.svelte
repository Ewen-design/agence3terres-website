<script>
  import { reveal } from "$lib/actions/reveal.js";

  // ───────────────────────────────────────────────────────────────────────────
  //  AboutValues — refonte
  //
  //  Un seul grand bloc (noir foncé, arrondi) posé sur le fond noir clair de la
  //  section : l'image de la valeur courante vit DANS le fond du bloc, le texte
  //  est posé par-dessus, et les noms des trois valeurs sont listés à droite,
  //  cliquables. Un clic change l'image et le texte en fondu.
  //
  //  Les images sont détourées (fond transparent) : elles se posent donc sur le
  //  noir du bloc sans cadre — d'où le `contain` plutôt qu'un `cover`.
  // ───────────────────────────────────────────────────────────────────────────

  // Un masque par bord : le noir est gardé, le transparent s'efface — l'image
  // se dissout donc dans le noir du bloc au lieu de s'arrêter net. Les deux
  // masques d'une valeur sont croisés (`mask-composite: intersect`).
  const FADE = {
    bottom: "linear-gradient(to top, rgba(0,0,0,0) 0%, #000 26%)",
    top: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, #000 26%)",
    left: "linear-gradient(to right, rgba(0,0,0,0) 0%, #000 24%)",
    right: "linear-gradient(to left, rgba(0,0,0,0) 0%, #000 24%)"
  };

  const parts = [
    {
      label: "Créativité enracinée",
      text: "Nous imaginons des idées qui prennent racine dans l'<span class='hl'>identité</span>, les valeurs et la vision de chaque projet afin d'en révéler toute la <span class='hl'>singularité</span>.",
      image: "/images/ipad-creation.webp",
      alt: "Création graphique sur tablette — Agence 3 Terres",
      // Bords où l'image se dissout dans le noir du bloc : bas + droite.
      fade: [FADE.bottom, FADE.right]
    },
    {
      label: "Proximité et confiance",
      text: "Nous avançons aux côtés de nos clients avec écoute, <span class='hl'>transparence</span> et collaboration pour bâtir des relations solides et <span class='hl'>durables</span>.",
      image: "/images/visage.webp",
      alt: "Portrait de profil — Agence 3 Terres",
      fade: [FADE.bottom, FADE.left]
    },
    {
      label: "Excellence engagée",
      text: "Nous abordons chaque mission avec <span class='hl'>rigueur</span>, passion et authenticité afin de créer des <span class='hl'>résultats cohérents</span>, porteurs de sens et fidèles à l'image de ceux que nous accompagnons.",
      image: "/images/justx-ipads.webp",
      alt: "Interfaces JustX sur iPad — Agence 3 Terres",
      fade: [FADE.left, FADE.right]
    }
  ];

  let active = 0;

  function select(i) {
    active = i;
  }
</script>

<section class="values" aria-label="Nos valeurs">
  <div class="values__inner">
    <!-- Le bloc : noir foncé, image au fond, texte par-dessus. -->
    <div class="values__panel">
      {#each parts as part, i}
        <img
          class="values__img"
          class:is-shown={active === i}
          src={part.image}
          alt={active === i ? part.alt : ""}
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          draggable="false"
          style={`--mask-a:${part.fade[0]}; --mask-b:${part.fade[1]}`}
        />
      {/each}

      <div class="values__scrim" aria-hidden="true"></div>

      <div class="values__stage">
        <div class="values__copy">
          {#each parts as part, i}
            <div
              class="values__slot"
              class:is-active={active === i}
              aria-hidden={active !== i ? "true" : undefined}
            >
              <h2 class="values__label" use:reveal>{part.label}</h2>
              <p class="values__text" use:reveal={{ delay: 90 }}>{@html part.text}</p>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Les noms, cliquables, à droite. -->
    <nav class="values__nav" aria-label="Choisir une valeur">
      {#each parts as part, i}
        <button
          type="button"
          class="values__name"
          class:is-active={active === i}
          data-cursor="button"
          aria-current={active === i ? "true" : undefined}
          onclick={() => select(i)}
        >
          {part.label}
        </button>
      {/each}
    </nav>
  </div>
</section>

<style>
  /* ── Fond de section : le noir clair ────────────────────────────────────── */
  .values {
    --vl-bg: var(--bg-panel, #161617);      /* noir clair — le fond de la section */
    --vl-panel: var(--bg-deep, #040404);   /* noir foncé — le bloc */
    --vl-ink: #f4efe6;
    --vl-muted: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.5);
    --vl-radius: 22px;
    --vl-inset: var(--site-inset);

    width: 100%;
    background: var(--vl-bg);
    color: var(--vl-ink);
    padding: clamp(4.5rem, 11vh, 9rem) var(--vl-inset) clamp(5.5rem, 13vh, 11rem);
    overflow-x: clip;
  }

  .values__inner {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(200px, 17vw);
    gap: clamp(1.2rem, 2.5vw, 2.6rem);
    align-items: stretch;
  }

  /* ── Le bloc ────────────────────────────────────────────────────────────── */
  .values__panel {
    position: relative;
    height: min(78vh, 860px);
    border-radius: var(--vl-radius);
    overflow: hidden;
    background: var(--vl-panel);
    isolation: isolate;
  }

  /* Images au fond, en fondu croisé. Détourées → `contain`, jamais rognées. */
  /* Aucune dimension imposée, seulement deux plafonds : un élément remplacé
     dont `width` ET `height` valent `auto` est alors réduit dans la boîte en
     gardant son rapport, et sa boîte colle EXACTEMENT au visuel. C'est ce qui
     rend les masques de bord justes — avec une largeur imposée + `contain`,
     l'image serait centrée dans une boîte plus grande et les masques
     tomberaient dans le vide. Ne jamais poser les quatre côtés à la place :
     `width: auto` reprendrait alors la taille naturelle de l'image. */
  .values__img {
    position: absolute;
    top: 50%;
    right: clamp(1.2rem, 3vw, 3.2rem);
    left: auto;
    bottom: auto;
    width: auto;
    height: auto;
    max-width: 54%;
    max-height: 84%;
    object-fit: contain;
    object-position: center;
    display: block;
    z-index: 0;
    filter: brightness(1.08);
    opacity: 0;
    transform: translateY(-50%) scale(1.05);
    transition:
      opacity 0.9s ease,
      transform 1.4s cubic-bezier(0.22, 0.61, 0.36, 1);

    /* Fondu des deux bords, croisé : un pixel n'est gardé que s'il l'est par
       les deux masques. */
    -webkit-mask-image: var(--mask-a), var(--mask-b);
    mask-image: var(--mask-a), var(--mask-b);
    -webkit-mask-composite: source-in;
    mask-composite: intersect;
  }

  .values__img.is-shown {
    opacity: 1;
    transform: translateY(-50%) scale(1);
  }

  @media (prefers-reduced-motion: reduce) {
    .values__img,
    .values__img.is-shown {
      transform: translateY(-50%);
      transition: opacity 0.25s ease;
    }
  }

  /* Voile : garde le texte lisible quelle que soit l'image derrière. */
  .values__scrim {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background:
      linear-gradient(to right, rgba(4, 4, 4, 0.92) 0%, rgba(4, 4, 4, 0.68) 34%, rgba(4, 4, 4, 0.12) 62%, rgba(4, 4, 4, 0) 82%),
      linear-gradient(to top, rgba(4, 4, 4, 0.34) 0%, rgba(4, 4, 4, 0) 34%);
  }

  .values__stage {
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: clamp(1.3rem, 2vw, 2.1rem);
  }

  /* Textes empilés dans la même cellule → fondu croisé au clic. */
  .values__copy {
    flex: 1 1 auto;
    display: grid;
    place-items: center start;
    min-height: 0;
    padding: 0 clamp(0.5rem, 2vw, 2.6rem) clamp(1rem, 3vh, 2.5rem);
  }

  .values__slot {
    grid-area: 1 / 1;
    max-width: 34ch;
    text-align: left;
    opacity: 0;
    transform: translate3d(0, 18px, 0);
    transition:
      opacity 0.75s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;
  }

  .values__slot.is-active {
    opacity: 1;
    transform: translate3d(0, 0, 0);
    pointer-events: auto;
  }

  @media (prefers-reduced-motion: reduce) {
    .values__slot {
      transform: none;
      transition-duration: 0.25s;
    }
  }

  .values__label {
    margin: 0 0 clamp(0.8rem, 1.4vw, 1.2rem);
    font-family: var(--site-font);
    font-size: clamp(1.8rem, 3.2vw, 3.3rem);
    font-weight: var(--site-weight-display);
    line-height: 1.08;
    letter-spacing: var(--site-display-letter-spacing, -0.028em);
    color: #ffffff;
  }

  .values__text {
    margin: 0;
    max-width: 32ch;
    font-family: var(--site-font);
    font-size: clamp(1rem, 1.28vw, 1.32rem);
    font-weight: var(--site-weight);
    line-height: 1.5;
    letter-spacing: -0.012em;
    color: var(--vl-muted);
    text-wrap: pretty;
  }

  .values__text :global(.hl) {
    color: var(--vl-ink);
  }

  /* ── Les noms cliquables ────────────────────────────────────────────────── */
  .values__nav {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: clamp(0.3rem, 0.6vw, 0.5rem);
  }

  .values__name {
    display: block;
    width: 100%;
    padding: clamp(0.85rem, 1.3vw, 1.1rem) clamp(1rem, 1.6vw, 1.5rem);
    border: 0;
    /* Même arrondi que le bouton menu du header. */
    border-radius: 10px;
    background: transparent;
    font-family: var(--site-font);
    font-size: clamp(0.95rem, 1.15vw, 1.18rem);
    font-weight: var(--site-weight);
    letter-spacing: -0.012em;
    line-height: 1.25;
    text-align: center;
    color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.44);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition:
      background-color 0.5s cubic-bezier(0.22, 0.61, 0.36, 1),
      color 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
  }

  @media (hover: hover) {
    .values__name:hover {
      color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.78);
    }
  }

  .values__name.is-active {
    background: rgba(255, 255, 255, 0.07);
    color: #ffffff;
  }

  .values__name:focus-visible {
    outline: 2px solid var(--lead-blue, #5768ff);
    outline-offset: 3px;
  }

  /* ── Mobile : le bloc, puis les noms en dessous ─────────────────────────── */
  @media (max-width: 900px) {
    .values {
      padding: clamp(3.5rem, 9vh, 6rem) 1rem clamp(4rem, 10vh, 7rem);
    }

    .values__inner {
      grid-template-columns: minmax(0, 1fr);
      gap: clamp(1rem, 3vw, 1.6rem);
    }

    .values__panel {
      height: min(72vh, 620px);
      border-radius: 18px;
    }

    /* L'image descend au bas du bloc et le texte occupe le haut : sur un écran
       étroit, un visuel centré passerait pile derrière le texte. */
    /* Les quatre côtés sont posés : la boîte occupe le bas du bloc et
       `contain` centre le visuel dedans, quelle que soit sa forme (l'iPad
       debout comme la rangée d'écrans très large). */
    .values__img {
      top: auto;
      bottom: clamp(1rem, 4vw, 1.8rem);
      left: 50%;
      right: auto;
      width: auto;
      height: auto;
      max-width: calc(100% - 2 * clamp(1rem, 4vw, 2rem));
      max-height: 46%;
      transform: translateX(-50%) scale(1.05);
    }

    .values__img.is-shown {
      transform: translateX(-50%) scale(1);
    }

    .values__scrim {
      background:
        linear-gradient(to bottom, rgba(4, 4, 4, 0.86) 0%, rgba(4, 4, 4, 0.5) 34%, rgba(4, 4, 4, 0) 62%),
        linear-gradient(to top, rgba(4, 4, 4, 0.34) 0%, rgba(4, 4, 4, 0) 26%);
    }

    .values__copy {
      place-items: start center;
      padding: clamp(1.2rem, 5vw, 2.2rem) 0 0;
    }

    .values__slot {
      text-align: center;
      max-width: 30ch;
    }

    .values__text {
      margin: 0 auto;
    }

    .values__nav {
      flex-direction: row;
      justify-content: flex-start;
      gap: 0.5rem;
      overflow-x: auto;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      /* Les pastilles peuvent filer d'un bord à l'autre de l'écran. */
      margin-inline: -1rem;
      padding-inline: 1rem;
    }

    .values__nav::-webkit-scrollbar {
      display: none;
    }

    .values__name {
      width: auto;
      flex: 0 0 auto;
      white-space: nowrap;
      background: rgba(255, 255, 255, 0.04);
      font-size: 0.95rem;
      padding: 0.8rem 1.25rem;
    }

    .values__name.is-active {
      background: rgba(255, 255, 255, 0.11);
    }

    .values__label {
      font-size: clamp(1.6rem, 7vw, 2.3rem);
    }

    .values__text {
      font-size: clamp(0.98rem, 4vw, 1.1rem);
      max-width: 32ch;
    }
  }

  /* ── Téléphone en paysage ──────────────────────────────────────────────── */
  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .values {
      padding: 8svh 1.25rem;
    }

    .values__inner {
      grid-template-columns: minmax(0, 1fr) minmax(160px, 26vw);
      gap: 1rem;
    }

    .values__panel {
      height: min(84svh, 420px);
    }

    .values__nav {
      flex-direction: column;
      overflow: visible;
      margin-inline: 0;
      padding-inline: 0;
      /* En paysage, la colonne des noms passe sous le bouton de menu du site :
         on la décale vers le bas pour dégager le coin haut-droit. */
      padding-top: clamp(2rem, 14svh, 3.5rem);
    }

    .values__name {
      width: 100%;
      font-size: 0.92rem;
      padding: 0.7rem 1rem;
      background: transparent;
    }

    /* Boîte large et courte : on reprend la composition du bureau (texte à
       gauche, image à droite) — la version « image en bas » n'a pas la place. */
    .values__img {
      top: 50%;
      bottom: auto;
      left: auto;
      right: clamp(0.8rem, 2vw, 1.6rem);
      width: auto;
      height: auto;
      max-width: 48%;
      max-height: 84%;
      transform: translateY(-50%) scale(1.05);
    }

    .values__img.is-shown {
      transform: translateY(-50%) scale(1);
    }

    .values__scrim {
      background:
        linear-gradient(to right, rgba(4, 4, 4, 0.92) 0%, rgba(4, 4, 4, 0.66) 38%, rgba(4, 4, 4, 0.1) 66%, rgba(4, 4, 4, 0) 84%),
        linear-gradient(to top, rgba(4, 4, 4, 0.3) 0%, rgba(4, 4, 4, 0) 30%);
    }

    .values__copy {
      place-items: center start;
      padding: 0 clamp(0.4rem, 2vw, 1.4rem) 0 0;
    }

    .values__slot {
      text-align: left;
      max-width: 30ch;
    }

    .values__label {
      font-size: clamp(1.4rem, 4vw, 2rem);
    }

    .values__text {
      margin: 0;
      font-size: clamp(0.9rem, 2.4vw, 1.05rem);
      max-width: 34ch;
    }
  }
</style>
