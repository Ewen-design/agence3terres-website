<script>
  import { navigate } from "$lib/navigate.js";
  import { reveal } from "$lib/actions/reveal.js";

  export let excludePages = [];
  // Si fourni, n'affiche QUE ces pages (utilisé pour sortir la carte « Votre projet »).
  export let onlyPages = null;
  // Carte(s) en pleine largeur (bannière) plutôt qu'en grille 2 colonnes.
  export let full = false;

  const baseProjects = [
    {
      title: "Moovy",
      category: "Plateforme web",
      lead: "Une recommandation de films simple, directe et personnelle.",
      image: "/images/tel_moovy2.webp",
      page: "projet3",
      button: "Voir le projet"
    },
    {
      title: "JustX",
      category: "Marque de sport",
      lead: "Un univers sportif plus direct, plus fort et plus personnel.",
      image: "/images/justx-pub2.webp",
      page: "projet5",
      button: "Voir le projet"
    },
    {
      title: "JustX Fitness",
      category: "Application fitness",
      lead: "Programmes, suivi et progression dans une expérience directe.",
      image: "/images/justx_app.webp",
      page: "projet7",
      button: "Voir le projet"
    },
    {
      title: "Mission X",
      category: "Jeu social mobile",
      lead: "Des missions secrètes, un téléphone, deux camps.",
      image: "/images/missionX5.webp",
      page: "projet6",
      button: "Voir le projet"
    },
    {
      title: "Ludosphères",
      category: "Site d'artiste",
      lead: "Un site sobre pour laisser respirer les œuvres.",
      image: "/images/ludo.webp",
      page: "projet4",
      button: "Voir le projet"
    },
    {
      title: "Serein Design",
      category: "Identité produit",
      lead: "Un univers objet premium, calme et fonctionnel.",
      image: "/images/serein_design.webp",
      page: "projet1",
      button: "Voir le projet"
    },
    {
      title: "Votre projet ?",
      category: "Collaboration",
      lead: "Une vision à faire naître, clarifier ou amplifier.",
      image: "/images/agence.webp",
      page: "contact",
      button: "Nous contacter"
    }
  ];

  $: filteredProjects = baseProjects.filter(
    (p) => (onlyPages ? onlyPages.includes(p.page) : true) && !excludePages.includes(p.page)
  );

  function handleMove(event) {
    const btn = event.currentTarget.querySelector(".p-btn");
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }
</script>

<section class="projects-grid" class:is-full={full}>
  <div class="grid-inner">
    {#each filteredProjects as p, i}
      <button
        class="p-card"
        type="button"
        data-cursor="view"
        use:reveal={{ delay: (i % 2) * 100 }}
        on:mousemove={handleMove}
        on:click={() => navigate(p.page)}
      >
        <div class="p-card-img">
          <img src={p.image} alt={p.title} loading="lazy" decoding="async" />
        </div>
        <div class="p-shade"></div>

        <div class="p-content">
          <h2 class="p-title">{p.title}</h2>
          <p class="p-lead">{p.lead}</p>
          <span class="p-btn">
            <span class="p-btn-flip" data-text={p.button}>
              <span class="p-btn-text">{p.button}</span>
            </span>
          </span>
        </div>
      </button>
    {/each}
  </div>
</section>

<style>
  .projects-grid {
    width: 100%;
    background: #000;
    padding: clamp(4rem, 8vw, 8rem) 0;
  }

  .grid-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
    max-width: 1800px;
    margin: 0 auto;
  }

  .p-card {
    position: relative;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    cursor: pointer;
    border: none;
    padding: 0;
    background: #0a0a0a;
    text-align: left;
    display: block;
    -webkit-tap-highlight-color: transparent;
    border-radius: 14px;
  }

  .p-card-img {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .p-card-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform: scale(1);
    transition: transform 0.9s cubic-bezier(0.22, 0.61, 0.36, 1);
    will-change: transform;
  }

  .p-card:hover .p-card-img img {
    transform: scale(1.046);
  }

  .p-shade {
    position: absolute;
    inset: 0;
    z-index: 1;
    background:
      linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.78) 0%,
        rgba(0, 0, 0, 0.34) 48%,
        rgba(0, 0, 0, 0.18) 100%
      );
  }

  .p-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: clamp(3.5rem, 7vw, 7rem) clamp(1rem, 2vw, 2rem) clamp(1.4rem, 2.8vw, 2.6rem);
    gap: 0;
  }

  .p-title {
    margin: 0 0 0.65rem;
    font-size: clamp(1.9rem, 3.2vw, 3.2rem);
    font-weight: 600;
    line-height: 0.96;
    color: #fff;
    letter-spacing: -0.02em;
  }

  .p-lead {
    margin: 0 0 1.4rem;
    max-width: 28ch;
    font-size: clamp(0.88rem, 1.1vw, 1.04rem);
    font-weight: 400;
    line-height: 1.48;
    color: rgba(245, 241, 232, 0.62);
  }

  .p-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    height: 40px;
    padding: 0 1.4rem;
    font-size: 0.88rem;
    font-weight: 400;
    white-space: nowrap;
    color: #fff;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    border-radius: 10px;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.08);
    transition:
      background 0.3s ease,
      transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
    cursor: pointer;
  }

  .p-card:hover .p-btn {
    background: rgba(255, 255, 255, 0.18);
    transform: translateY(-2px);
  }

  .p-btn::before,
  .p-btn::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0;
    transition: opacity .25s ease;
  }

  .p-btn::before {
    background: radial-gradient(
      96px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-strong) 0%,
      var(--site-glow-mid) 26%,
      var(--site-glow-soft) 52%,
      var(--site-glow-fade) 70%,
      transparent 86%
    );
  }

  .p-btn::after {
    background: radial-gradient(
      120px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-ambient) 0%,
      var(--site-glow-outer) 48%,
      transparent 82%
    );
    filter: blur(3px);
  }

  .p-card:hover .p-btn::before,
  .p-card:hover .p-btn::after {
    opacity: 1;
  }

  .p-btn-flip {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
  }

  .p-btn-text {
    display: block;
    transform: translateY(0%);
    transition: transform 0.42s cubic-bezier(0.22, 0.61, 0.36, 1);
  }

  .p-btn-flip::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition: transform 0.42s cubic-bezier(0.22, 0.61, 0.36, 1);
    white-space: nowrap;
    color: inherit;
  }

  .p-card:hover .p-btn-text {
    transform: translateY(-100%);
  }

  .p-card:hover .p-btn-flip::after {
    transform: translateY(0%);
  }

  .p-card:last-child:nth-child(odd) {
    grid-column: 1 / -1;
    justify-self: center;
    width: calc(50% - 1px);
  }

  /* Bannière pleine largeur (ex. bloc « Votre projet »). */
  .projects-grid.is-full .grid-inner {
    grid-template-columns: 1fr;
  }

  .projects-grid.is-full .p-card,
  .projects-grid.is-full .p-card:last-child:nth-child(odd) {
    grid-column: 1 / -1;
    justify-self: stretch;
    width: 100%;
    /* Pleine largeur en conservant la hauteur d'origine : la carte faisait 50 %
       de large en carré (1/1) → hauteur = 50 % de la largeur. En pleine largeur,
       un ratio 2/1 donne exactement la même hauteur. */
    aspect-ratio: 2 / 1;
  }

  /* Pas de vide sous le bloc pleine largeur. */
  .projects-grid.is-full {
    padding-bottom: 0;
  }

  @media (max-width: 768px) {
    .grid-inner {
      grid-template-columns: 1fr;
      gap: 2px;
    }

    /* Moins de vide entre le dernier projet et la partie contact sur mobile. */
    .projects-grid:not(.is-full) {
      padding-bottom: clamp(1.4rem, 4vw, 2.5rem);
    }
    .projects-grid.is-full {
      padding-top: clamp(1.4rem, 4vw, 2.5rem);
    }

    .p-card {
      aspect-ratio: 3 / 4;
    }

    .p-card:last-child:nth-child(odd) {
      grid-column: auto;
      justify-self: auto;
      width: auto;
    }

    .projects-grid.is-full .p-card,
    .projects-grid.is-full .p-card:last-child:nth-child(odd) {
      aspect-ratio: 3 / 4;
    }

    .p-btn {
      backdrop-filter: blur(12px) saturate(130%);
      -webkit-backdrop-filter: blur(12px) saturate(130%);
    }
  }

  @media (max-width: 480px) {
    .p-title {
      font-size: clamp(2rem, 10vw, 2.8rem);
    }

    .p-lead {
      font-size: 0.9rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .p-card-img img,
    .p-btn-text,
    .p-btn-flip::after {
      transition: none;
    }
  }
</style>
