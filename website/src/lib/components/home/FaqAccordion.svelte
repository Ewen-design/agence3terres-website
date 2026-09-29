<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { reveal } from "$lib/actions/reveal.js";

  const items = [
    {
      question: "Quels types de projets prenez-vous en charge ?",
      answer:
        "De la jeune marque qui démarre au projet le plus ambitieux, chaque idée nous intéresse. Nous intervenons sur l'identité visuelle, la direction artistique, les sites web, les interfaces digitales et les univers de marque qui veulent une présence plus claire, plus forte et plus durable."
    },
    {
      question: "Avec quels secteurs travaillez-vous ?",
      answer:
        "Avec tous ceux qui ont une vraie histoire à raconter : marques, studios, indépendants, structures culturelles ou commerciales. Ce qui nous guide n'est pas le secteur mais l'exigence du projet et l'envie d'aller au bout d'une vision."
    },
    {
      question: "Comment fonctionne votre tarification ?",
      answer:
        "Chaque projet est unique, notre tarification l'est aussi. Nous construisons un devis sur mesure, calibré selon vos besoins réels, le périmètre à couvrir et le temps de conception nécessaire. Vous payez pour un travail pensé pour vous, jamais pour un forfait standard."
    },
    {
      question: "Comment démarrer un projet avec vous ?",
      answer:
        "Écrivez-nous en quelques lignes : qui vous êtes, votre projet et vos objectifs. Nous fixons ensuite un premier échange pour cerner vos besoins, puis nous vous envoyons une proposition détaillée avec les grandes étapes, un calendrier et un devis sur mesure. Dès votre accord, le travail commence."
    },
    {
      question: "À quoi ressemble votre processus de travail ?",
      answer:
        "Tout commence par un échange, pour comprendre qui vous êtes et faire en sorte que le projet vous ressemble vraiment. Vient ensuite un vrai travail de recherche et de création, où nous avançons main dans la main avec vous à chaque étape, du premier cadrage jusqu'à la finition."
    },
    {
      question: "Combien de temps dure un projet ?",
      answer:
        "Le plus souvent entre deux semaines et deux mois, selon l'ampleur du travail et vos besoins : nous savons livrer vite quand il le faut, sans jamais rogner sur la qualité. Et lorsque le projet le demande, la collaboration se prolonge sur le long terme, avec un véritable accompagnement pour faire grandir votre marque étape après étape."
    }
  ];

  // Arrivée des cartes : montée + fondu en cascade, déclenchée à l'entrée de la
  // liste dans l'écran. L'arrivée en bloc de `use:reveal` posait un flou de
  // 12 px sur des cartes de 1180 px de large — c'est ce qui rendait leur
  // apparition sale. Ici, aucun flou : elles se déposent, l'une après l'autre.
  let listEl;
  let listIn = false;
  let io;

  let openIndex = -1;

  function toggleItem(index) {
    openIndex = openIndex === index ? -1 : index;
  }

  onMount(() => {
    if (!browser || !listEl) return;

    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (reduce) {
      listIn = true;
      return;
    }

    io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        listIn = true;
        io?.disconnect();
        io = null;
      },
      { threshold: 0.12 }
    );
    io.observe(listEl);
  });

  onDestroy(() => {
    io?.disconnect();
    io = null;
  });
</script>

<section class="faq" aria-label="Questions fréquentes">
  <h2 class="faq__title" use:reveal>Nous sommes là pour répondre à toutes vos questions</h2>

  <div class="faq__list" class:is-in={listIn} bind:this={listEl}>
    {#each items as item, index}
      <article
        class="faq__item"
        class:is-open={openIndex === index}
        style={`--i:${index}`}
      >
        <button
          class="faq__trigger"
          type="button"
          data-cursor="button"
          aria-expanded={openIndex === index}
          aria-controls={`faq-panel-${index}`}
          on:click={() => toggleItem(index)}
        >
          <span class="faq__question">{item.question}</span>
          <span class="faq__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M12 4.5v15" />
              <path d="M5.5 13.2 12 19.7l6.5-6.5" />
            </svg>
          </span>
        </button>

        <div class="faq__panel" class:is-open={openIndex === index} id={`faq-panel-${index}`}>
          <div class="faq__panel-inner">
            <p class="faq__answer">{item.answer}</p>
          </div>
        </div>
      </article>
    {/each}
  </div>
</section>

<style>
  /* Fond noir du site, blocs en gris foncé, mêmes marges et mêmes arrondis que
     les blocs de la page à propos. */
  .faq {
    --faq-inset: var(--site-inset);
    --faq-card: var(--bg-panel, #161617);
    --faq-radius: 22px;
    --faq-ink: #f4efe6;

    position: relative;
    width: 100%;
    background: var(--bg-deep, #000);
    color: var(--faq-ink);
    padding: clamp(4.5rem, 11vh, 9rem) var(--faq-inset) clamp(6rem, 14vh, 12rem);
    overflow-x: clip;
  }

  .faq__title {
    margin: 0 auto clamp(2.2rem, 5vh, 3.8rem);
    max-width: 26ch;
    font-family: var(--site-font);
    font-size: clamp(1.85rem, 3.5vw, 3.3rem);
    font-weight: var(--site-weight-display);
    line-height: 1.06;
    letter-spacing: var(--site-display-letter-spacing, -0.028em);
    text-align: center;
    color: #ffffff;
    text-wrap: balance;
  }

  .faq__list {
    width: min(1180px, 100%);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: clamp(0.55rem, 0.8vw, 0.85rem);
  }

  /* Le bloc grandit à l'ouverture : la réponse vit dedans, et c'est la ligne de
     grille (0fr → 1fr) qui l'ouvre — pas une hauteur fixe à deviner. */
  .faq__item {
    background: var(--faq-card);
    border-radius: var(--faq-radius);
    overflow: hidden;
    transition: background 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);

    /* Au repos avant l'arrivée. */
    opacity: 0;
    transform: translate3d(0, 26px, 0);
  }

  .faq__list.is-in .faq__item {
    animation: faqCardIn 0.85s cubic-bezier(0.16, 1, 0.3, 1) both;
    animation-delay: calc(var(--i, 0) * 70ms);
  }

  @keyframes faqCardIn {
    from {
      opacity: 0;
      transform: translate3d(0, 26px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .faq__item {
      opacity: 1;
      transform: none;
    }

    .faq__list.is-in .faq__item {
      animation: none;
    }
  }

  @media (hover: hover) {
    .faq__item:hover {
      background: var(--bg-panel-hi, #1b1b1c);
    }
  }

  .faq__trigger {
    width: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: clamp(1rem, 2vw, 2rem);
    padding: clamp(1.25rem, 2vw, 1.75rem) clamp(1.3rem, 2.2vw, 2rem);
    background: transparent;
    border: 0;
    color: inherit;
    text-align: left;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .faq__question {
    display: block;
    font-family: var(--site-font);
    font-size: clamp(1rem, 1.25vw, 1.26rem);
    font-weight: var(--site-weight);
    line-height: 1.3;
    letter-spacing: -0.012em;
    color: var(--faq-ink);
    text-wrap: pretty;
  }

  .faq__icon {
    flex: 0 0 auto;
    width: clamp(1.25rem, 1.6vw, 1.6rem);
    height: clamp(1.25rem, 1.6vw, 1.6rem);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.9);
  }

  .faq__icon svg {
    width: 100%;
    height: 100%;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    transform: rotate(0deg);
    transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .faq__item.is-open .faq__icon svg {
    transform: rotate(180deg);
  }

  .faq__panel {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.72s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .faq__panel.is-open {
    grid-template-rows: 1fr;
  }

  .faq__panel-inner {
    min-height: 0;
    overflow: hidden;
  }

  .faq__answer {
    margin: 0;
    max-width: 76ch;
    padding: 0 clamp(1.3rem, 2.2vw, 2rem) clamp(1.4rem, 2.2vw, 1.9rem);
    font-family: var(--site-font);
    font-size: clamp(0.95rem, 1.08vw, 1.1rem);
    font-weight: var(--site-weight);
    line-height: 1.55;
    letter-spacing: -0.006em;
    color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.58);
    text-wrap: pretty;
    opacity: 0;
    transform: translate3d(0, -10px, 0);
    transition:
      opacity 0.42s ease,
      transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .faq__panel.is-open .faq__answer {
    opacity: 1;
    transform: translate3d(0, 0, 0);
    transition-delay: 0.1s;
  }

  @media (max-width: 760px) {
    .faq {
      padding: clamp(3.5rem, 9vh, 6rem) 1rem clamp(4.5rem, 11vh, 8rem);
    }

    .faq__title {
      max-width: 18ch;
      font-size: clamp(1.6rem, 7vw, 2.3rem);
    }

    .faq__item {
      border-radius: 18px;
    }

    .faq__trigger {
      padding: 1.15rem 1.15rem;
      gap: 1rem;
    }

    .faq__question {
      font-size: 1.02rem;
    }

    .faq__answer {
      padding: 0 1.15rem 1.3rem;
      font-size: 0.98rem;
    }
  }

  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .faq {
      padding: 8svh 1.25rem 10svh;
    }

    .faq__title {
      font-size: clamp(1.5rem, 4vw, 2.2rem);
      margin-bottom: 2rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .faq__icon svg,
    .faq__panel,
    .faq__answer,
    .faq__item {
      transition: none;
    }
  }
</style>
