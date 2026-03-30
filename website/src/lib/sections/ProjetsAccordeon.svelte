<script>
  import { navigate } from "$lib/navigate.js";

  let hoveredIndex = 0;

  const projects = [
    {
      number: "01",
      title: "Serein design",
      description:
        "Great products don’t just happen, they’re shaped by insight. We dig into research, audits and user testing to understand what people need, then translate those findings into clear, intuitive UX solutions where every decision has purpose.",
      image: "images/photo2.webp",
      alt: "Laptop premium interface design"
    },
    {
      number: "02",
      title: "Hansatsu",
      description:
        "We think outside the box to make sure your product sets itself apart and sets the bar. We build beautiful, intuitive interfaces that are compelling and consistent, powered by scalable design systems.",
      image: "images/photo2.webp",
      alt: "Mobile app premium showcase"
    },
    {
      number: "03",
      title: "Bientôt votre projet ?",
      description:
        "Construisons une identité forte, désirable et durable, pensée pour marquer les esprits sur chaque point de contact.",
      image: "images/photo2.webp",
      alt: "Brand identity premium card mockup"
    }
  ];

  function handleGlowMove(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }
</script>

<section class="services-accordion">
  <div class="top-header">
    <div class="header-title-wrap">
      <h2>Nos projets</h2>
    </div>
    <div class="header-spacer"></div>
  </div>

  <div class="accordion">
    {#each projects as project, index}
      <article
        class="accordion-item"
        class:active={hoveredIndex === index}
        on:mouseenter={() => (hoveredIndex = index)}
        on:mousemove={handleGlowMove}
      >
        <div class="visual">
          <img
            src={project.image}
            alt={project.alt}
            loading={index === 0 ? "eager" : "lazy"}
            fetchpriority={index === 0 ? "high" : "auto"}
            decoding="async"
            draggable="false"
          />
        </div>

        <div class="content">
          <div class="title-row">
            <h3>{project.title}</h3>
            <span class="number">{project.number}</span>
          </div>

          {#if index === 0}
            <div class="cta-row">
              <p class="cta-text">{project.description}</p>

              <button
                class="nav-btn cta-btn"
                type="button"
                on:mousemove={handleGlowMove}
                on:click={() => navigate("projet1")}
              >
                <span class="nav-btn-flip" data-text="Voir le projet">
                  <span class="nav-btn-text">Voir le projet</span>
                </span>
              </button>
            </div>
          {:else if index === 1}
            <div class="cta-row">
              <p class="cta-text">{project.description}</p>

              <button
                class="nav-btn cta-btn"
                type="button"
                on:mousemove={handleGlowMove}
                on:click={() => navigate("projet2")}
              >
                <span class="nav-btn-flip" data-text="Voir le projet">
                  <span class="nav-btn-text">Voir le projet</span>
                </span>
              </button>
            </div>
          {:else}
            <div class="cta-row">
              <p class="cta-text">{project.description}</p>

              <button
                class="nav-btn cta-btn"
                type="button"
                on:mousemove={handleGlowMove}
                on:click={() => navigate("contact")}
              >
                <span class="nav-btn-flip" data-text="Contactez-nous">
                  <span class="nav-btn-text">Contactez-nous</span>
                </span>
              </button>
            </div>
          {/if}
        </div>
      </article>
    {/each}
  </div>
</section>

<style>
  .services-accordion {
    width: 100%;
    background: #000;
    color: #f4efe6;
    overflow: hidden;
    contain: layout paint;
    isolation: isolate;
  }

  .top-header {
    width: 100%;
    min-height: clamp(120px, 16vw, 210px);
    display: grid;
    grid-template-columns: 48% 52%;
    align-items: end;
    background: #000;
  }

  .header-spacer {
    min-height: 1px;
  }

  .header-title-wrap {
    padding: clamp(2rem, 4vw, 4rem) clamp(1.5rem, 3vw, 3rem)
      clamp(1.2rem, 2vw, 1.8rem);
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
  }

  .header-title-wrap h2 {
    margin: 0;
    font-family: "Titre italic", serif;
    font-weight: 100;
    font-style: italic;
    font-synthesis: none;
    font-size: clamp(2.5rem, 5vw, 5.5rem);
    line-height: 0.98;
    letter-spacing: -0.03em;
    color: #f4efe6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: geometricPrecision;
    text-align: left;
  }

  .accordion {
    width: 100%;
    contain: layout paint;
  }

  .accordion-item {
    position: relative;
    width: 100%;
    display: grid;
    grid-template-columns: 48% 52%;
    align-items: stretch;
    min-height: clamp(120px, 11vw, 170px);
    height: clamp(120px, 11vw, 170px);
    overflow: hidden;
    contain: layout paint;
    transition:
      height 920ms cubic-bezier(0.22, 1, 0.36, 1),
      background-color 360ms ease;
  }

  .accordion-item:nth-child(1) {
    background: #151515;
  }

  .accordion-item:nth-child(2) {
    background: #111;
  }

  .accordion-item:nth-child(3) {
    background: #000;
  }

  .accordion-item.active {
    height: clamp(260px, 28vw, 430px);
  }

  .accordion-item::before {
    content: "";
    position: absolute;
    inset: 0;
    padding: 1px;
    background: radial-gradient(
      80px circle at var(--mx, 50%) var(--my, 50%),
      rgba(212, 175, 55, 0.95),
      rgba(212, 102, 55, 0.45) 40%,
      transparent 75%
    );
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.22s ease;
    pointer-events: none;
    filter: drop-shadow(0 0 3px rgba(212, 175, 55, 0.35));
    z-index: 3;
  }

  .accordion-item:hover::before {
    opacity: 1;
  }

  .visual {
    position: relative;
    height: 100%;
    padding: clamp(1.4rem, 2.4vw, 2.2rem) 0 0 clamp(1.4rem, 3vw, 3rem);
    overflow: hidden;
  }

  .visual img {
    width: calc(100% - clamp(1.4rem, 3vw, 3rem));
    height: calc(100% - clamp(1.4rem, 2.4vw, 2.2rem));
    object-fit: cover;
    object-position: top;
    display: block;
    transform: none !important;
    scale: 1 !important;
    opacity: 1 !important;
    filter: none !important;
    transition: none !important;
    animation: none !important;
    box-shadow: none !important;
    will-change: auto !important;
  }

  .accordion-item.active .visual img,
  .accordion-item:hover .visual img {
    transform: none !important;
    scale: 1 !important;
    opacity: 1 !important;
    filter: none !important;
  }

  .content {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: clamp(1.4rem, 2.4vw, 2.2rem) clamp(1.4rem, 3vw, 3rem);
  }

  .title-row {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: start;
    gap: 1.2rem;
  }

  .title-row h3 {
    margin: 0;
    font-family: "Titre", serif;
    font-weight: 400;
    font-size: clamp(1.8rem, 3vw, 4rem);
    line-height: 0.96;
    letter-spacing: -0.045em;
    color: #f4efe6;
  }

  .number {
    font-family: "Titre italic", serif;
    font-style: italic;
    font-size: clamp(1.6rem, 2.4vw, 3rem);
    line-height: 1;
    letter-spacing: -0.04em;
    color: #5f6771;
    opacity: 0.95;
    padding-top: 0.08em;
  }

  .cta-row {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    opacity: 0;
    transform: translateY(14px);
    transition:
      opacity 280ms ease,
      transform 620ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .accordion-item.active .cta-row {
    opacity: 1;
    transform: translateY(0);
    transition-delay: 90ms;
  }

  .cta-text {
    margin: 0;
    max-width: 32rem;
    font-family: "General Sans", sans-serif;
    font-size: clamp(0.98rem, 1.08vw, 1.15rem);
    line-height: 1.48;
    color: rgba(244, 239, 230, 0.72);
  }

  .nav-btn {
    position: relative;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 1.5rem;
    font-size: 0.9rem;
    font-family: "General Sans", sans-serif;
    white-space: nowrap;
    color: inherit;
    border: none;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    border-radius: 3px;
    box-shadow:
      0 6px 8px rgba(0, 0, 0, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      inset 0 -1px 1px rgba(0, 0, 0, 0.08);
    transition:
      transform 1.2s cubic-bezier(.22,.61,.36,1),
      box-shadow 1.2s cubic-bezier(.22,.61,.36,1),
      background 1.2s cubic-bezier(.22,.61,.36,1);
  }

  .nav-btn-flip {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
  }

  .nav-btn-text {
    display: block;
    transform: translateY(0%);
    transition: transform 0.45s cubic-bezier(.22,.61,.36,1);
  }

  .nav-btn-flip::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition: transform 0.45s cubic-bezier(.22,.61,.36,1);
    white-space: nowrap;
    color: inherit;
  }

  .nav-btn:hover .nav-btn-text {
    transform: translateY(-100%);
  }

  .nav-btn:hover .nav-btn-flip::after {
    transform: translateY(0%);
  }

  .nav-btn::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: radial-gradient(
      80px circle at var(--mx, 50%) var(--my, 50%),
      rgba(212, 175, 55, 0.95),
      rgba(212, 102, 55, 0.45) 40%,
      transparent 75%
    );
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.22s ease;
    pointer-events: none;
    filter: drop-shadow(0 0 3px rgba(212, 175, 55, 0.35));
  }

  .nav-btn:hover::before {
    opacity: 1;
  }

  .cta-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 1100px) {
    .top-header,
    .accordion-item {
      grid-template-columns: 42% 58%;
    }
  }

  @media (max-width: 900px) {
    .top-header {
      grid-template-columns: 1fr;
      min-height: auto;
    }

    .header-title-wrap {
      padding: 1.5rem 1rem 1rem;
    }

    .header-title-wrap h2 {
      font-size: clamp(2.4rem, 11vw, 4rem);
    }

    .accordion-item,
    .accordion-item.active {
      grid-template-columns: 1fr;
      height: auto;
    }

    .accordion-item {
      min-height: unset;
    }

    .visual {
      padding: 1rem 1rem 0 1rem;
    }

    .visual img {
      width: 100%;
      height: auto;
      max-height: none;
    }

    .content {
      padding: 1rem 1rem 1.2rem;
    }

    .title-row h3 {
      font-size: clamp(1.55rem, 7vw, 2.4rem);
    }

    .number {
      font-size: clamp(1.3rem, 5.2vw, 2rem);
    }

    .cta-row {
      opacity: 1;
      transform: none;
      margin-top: 0.85rem;
      align-items: flex-start;
    }

    .cta-text {
      width: 100%;
      max-width: 100%;
      font-size: 0.98rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .accordion-item,
    .cta-row,
    .nav-btn,
    .nav-btn-text,
    .nav-btn-flip::after {
      transition: none !important;
    }
  }
</style>