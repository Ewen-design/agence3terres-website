<script>
  const items = [
    {
      question: "Quels types de projets prenez-vous en charge ?",
      answer:
        "Nous intervenons sur l'identite visuelle, la direction artistique, la conception de sites web, les interfaces digitales et les univers de marque qui demandent une presence plus claire, plus forte et plus durable."
    },
    {
      question: "Avec quels secteurs travaillez-vous ?",
      answer:
        "Nous travaillons avec des marques, studios, independants et structures culturelles ou commerciales qui veulent un cadre visuel plus juste, plus singulier et plus coherent sur le fond comme sur la forme."
    },
    {
      question: "Comment fonctionne votre tarification ?",
      answer:
        "Chaque projet est chiffre selon son perimetre, son niveau d'exigence et le temps de conception necessaire. Nous preferons construire une proposition claire plutot qu'appliquer un forfait generique."
    },
    {
      question: "Prenez-vous aussi en charge le developpement ?",
      answer:
        "Oui, selon le projet. Nous pouvons concevoir l'experience, produire le systeme visuel et accompagner ou realiser l'integration pour garder une execution fidele jusqu'au rendu final."
    },
    {
      question: "A quoi ressemble votre processus de travail ?",
      answer:
        "Le travail avance en general par cadrage, direction, aller-retours puis affinage. L'objectif est de garder une lecture simple, des decisions solides et un niveau de finition eleve a chaque etape."
    },
    {
      question: "Combien de temps dure un projet type ?",
      answer:
        "Cela depend du format, mais un projet peut aller de quelques semaines a plusieurs mois. Le rythme est defini des le depart pour garder une progression nette et une execution stable."
    }
  ];

  let openIndex = -1;

  function toggleItem(index) {
    openIndex = openIndex === index ? -1 : index;
  }
</script>

<section class="faq-section">
  <div class="faq-title-wrap">
    <h2 class="faq-title">FAQs</h2>
  </div>

  <div class="faq-list">
    {#each items as item, index}
      <article class="faq-item" class:is-open={openIndex === index}>
        <button
          class="faq-trigger"
          type="button"
          aria-expanded={openIndex === index}
          aria-controls={`faq-panel-${index}`}
          on:click={() => toggleItem(index)}
        >
          <span class="faq-question">{item.question}</span>
          <span class="faq-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path class="faq-icon-horizontal" d="M5 12H19" />
              <path class="faq-icon-vertical" d="M12 5V19" />
            </svg>
          </span>
        </button>

        <div
          class="faq-panel"
          class:is-open={openIndex === index}
          id={`faq-panel-${index}`}
        >
          <div class="faq-panel-inner">
            <div class="faq-answer-spacer" aria-hidden="true"></div>
            <p class="faq-answer">{item.answer}</p>
          </div>
        </div>
      </article>
    {/each}
  </div>
</section>

<style>
  .faq-section {
    position: relative;
    background: #000;
    color: #f5f1e8;
    padding: clamp(2.6rem, 5vw, 4.5rem) 0 clamp(5.4rem, 10vw, 8.8rem);
  }

  .faq-title-wrap {
    padding:
      clamp(2rem, 4vw, 4rem)
      clamp(1.5rem, 3vw, 3rem)
      clamp(1.5rem, 2vw, 2.2rem);
    display: flex;
    justify-content: flex-start;
  }

  .faq-title {
    margin: 0;
    font-family: "Clash Display", sans-serif;
    font-style: normal;
    font-weight: 700;
    font-size: clamp(2.5rem, 5vw, 5.5rem);
    line-height: 0.95;
    color: #f5f1e8;
    text-align: left;
  }

  .faq-list {
    width: min(1220px, calc(100% - 3rem));
    margin: 0 auto;
    border-top: 1px solid rgba(255, 255, 255, 0.13);
  }

  .faq-item {
    position: relative;
    border-bottom: 1px solid rgba(255, 255, 255, 0.13);
  }

  .faq-item::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: -1px;
    height: 1px;
    background: #ffffff;
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;
    z-index: 2;
  }

  .faq-item.is-open::after {
    transform: scaleX(1);
  }

  .faq-trigger {
    width: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 2rem;
    padding: 1.55rem 0 1.6rem;
    background: transparent;
    border: 0;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .faq-question {
    display: block;
    margin: 0;
    font-family: "Clash Display", sans-serif;
    font-weight: 300;
    font-size: clamp(1.2rem, 2.25vw, 2.3rem);
    line-height: 1.08;
    letter-spacing: -0.02em;
    color: #f5f1e8;
  }

  .faq-icon {
    width: 2rem;
    height: 2rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 0.05rem;
    color: rgba(245, 241, 232, 0.96);
  }

  .faq-icon svg {
    width: 100%;
    height: 100%;
    overflow: visible;
    transform: rotate(0deg);
    transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .faq-icon path {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.45;
    stroke-linecap: round;
    transform-origin: center;
  }

  .faq-icon-vertical {
    transform: scaleY(1);
    opacity: 1;
    transition:
      transform 0.55s cubic-bezier(0.16, 1, 0.3, 1),
      opacity 0.35s ease;
  }

  .faq-item.is-open .faq-icon svg {
    transform: rotate(180deg);
  }

  .faq-item.is-open .faq-icon-vertical {
    transform: scaleY(0);
    opacity: 0;
  }

  .faq-panel {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.78s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .faq-panel.is-open {
    grid-template-rows: 1fr;
  }

  .faq-panel-inner {
    min-height: 0;
    overflow: hidden;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.95fr);
    gap: 2rem;
    padding: 0 0 1.75rem;
  }

  .faq-answer-spacer {
    min-width: 0;
  }

  .faq-answer {
    margin: 0;
    max-width: 32ch;
    font-family: "Clash Display", sans-serif;
    font-weight: 300;
    font-size: clamp(1rem, 1.45vw, 1.55rem);
    line-height: 1.12;
    letter-spacing: -0.02em;
    color: rgba(245, 241, 232, 0.82);
    opacity: 0;
    transform: translate3d(0, -12px, 0);
    transition:
      opacity 0.42s ease,
      transform 0.72s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .faq-panel.is-open .faq-answer {
    opacity: 1;
    transform: translate3d(0, 0, 0);
    transition-delay: 0.08s;
  }

  @media (max-width: 1100px) {
    .faq-title {
      font-size: clamp(4rem, 12vw, 8rem);
    }

    .faq-list {
      width: min(1220px, calc(100% - 2rem));
    }
  }

  @media (max-width: 900px) {
    .faq-section {
      padding: 8.5rem 0 13rem;
    }

    .faq-title-wrap {
      padding: 1.5rem 1rem 1rem;
    }

    .faq-title {
      font-size: clamp(2.4rem, 11vw, 4rem);
    }

    .faq-list {
      width: calc(100% - 9.5rem);
    }

    .faq-trigger {
      gap: 1rem;
      padding: 1.1rem 0 1.15rem;
    }

    .faq-question {
      font-size: clamp(1.2rem, 5vw, 1.55rem);
      line-height: 1.08;
    }

    .faq-icon {
      width: 1.55rem;
      height: 1.55rem;
      margin-top: 0.02rem;
    }

    .faq-panel-inner {
      grid-template-columns: 1fr;
      gap: 0;
      padding: 0 0 1.2rem;
    }

    .faq-answer-spacer {
      display: none;
    }

    .faq-answer {
      max-width: 28ch;
      font-size: clamp(1.02rem, 4.1vw, 1.2rem);
      line-height: 1.12;
      color: rgba(245, 241, 232, 0.82);
      padding-right: 2rem;
    }
  }

  @media (max-width: 640px) {
    .faq-title-wrap {
      padding: 1.3rem 1rem 0.9rem;
    }
  }

  @media (max-width: 420px) {
    .faq-title-wrap {
      padding: 1.1rem 1rem 0.85rem;
    }

    .faq-list {
      width: calc(100% - 7rem);
    }

    .faq-trigger {
      padding: 1rem 0 1.05rem;
    }

    .faq-answer {
      padding-right: 1rem;
      max-width: 26ch;
      font-size: clamp(1rem, 4vw, 1.12rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .faq-item::after,
    .faq-icon svg,
    .faq-icon-vertical,
    .faq-panel,
    .faq-answer {
      transition: none;
    }
  }
</style>
