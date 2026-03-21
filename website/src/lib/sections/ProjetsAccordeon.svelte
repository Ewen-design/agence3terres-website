<script>
  export let navigate;

  let hoveredIndex = 0;

  const projects = [
    {
      number: "01",
      title: "Serein design",
      description:
        "Great products don’t just happen, they’re shaped by insight. We dig into research, audits and user testing to understand what people need, then translate those findings into clear, intuitive UX solutions where every decision has purpose.",
      image:
        "images/photo2.webp",
      alt: "Laptop premium interface design"
    },
    {
      number: "02",
      title: "Hansatsu",
      description:
        "We think outside the box to make sure your product sets itself apart and sets the bar. We build beautiful, intuitive interfaces that are compelling and consistent, powered by scalable design systems.",
      image:
        "images/photo2.webp",
      alt: "Mobile app premium showcase"
    },
    {
      number: "03",
      title: "Bientôt votre projet ?",
      description:
        "Construisons une identité forte, désirable et durable, pensée pour marquer les esprits sur chaque point de contact.",
      image:
        "images/photo2.webp",
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
    <div class="header-spacer"></div>
    <div class="header-title-wrap">
      <h2>What we do</h2>
    </div>
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
          <img src={project.image} alt={project.alt} loading="lazy" />
          <div class="visual-overlay"></div>
        </div>

        <div class="content">
          <div class="title-row">
            <h3>{project.title}</h3>
            <span class="number">{project.number}</span>
          </div>

          {#if index !== 2}
            <div class="copy">
              <p>{project.description}</p>
            </div>
          {:else}
            <div class="cta-row">
              <p class="cta-text">{project.description}</p>

              <button
                class="nav-btn cta-btn"
                type="button"
                on:mousemove={handleGlowMove}
                on:click={() => navigate && navigate("contact")}
              >
                Contactez-nous
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
    color: #f5f1e8;
    overflow: hidden;
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
  }

  .header-title-wrap h2 {
    margin: 0;
    font-family: "Iowan Old Style", "Georgia", "Times New Roman", serif;
    font-weight: 500;
    font-size: clamp(2.5rem, 5vw, 5.5rem);
    line-height: 0.95;
    letter-spacing: -0.045em;
    color: #f5f1e8;
  }

  .accordion {
    width: 100%;
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
    transition:
      height 800ms cubic-bezier(0.22, 1, 0.36, 1),
      background-color 500ms ease;
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

  /* Glow border identique à l'esprit du header */
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
    transition: opacity 0.25s ease;
    pointer-events: none;
    filter: drop-shadow(0 0 3px rgba(212, 175, 55, 0.35));
    z-index: 3;
  }

  .accordion-item:hover::before {
    opacity: 1;
  }

  .visual {
    position: relative;
    overflow: hidden;
    height: 100%;
    background: #0a0a0a;
  }

  .visual img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.14);
    opacity: 0.82;
    filter: brightness(0.72) saturate(0.88) contrast(1.04);
    transition:
      transform 1100ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 700ms ease,
      filter 700ms ease;
    will-change: transform;
  }

  .accordion-item.active .visual img {
    transform: scale(1);
    opacity: 1;
    filter: brightness(0.92) saturate(1) contrast(1.06);
  }

  .visual-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, rgba(0, 0, 0, 0.18) 0%, transparent 36%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, transparent 30%),
      linear-gradient(0deg, rgba(0, 0, 0, 0.12) 0%, transparent 35%);
    pointer-events: none;
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
    font-family: "Iowan Old Style", "Georgia", "Times New Roman", serif;
    font-weight: 500;
    font-size: clamp(1.8rem, 3vw, 4rem);
    line-height: 0.96;
    letter-spacing: -0.045em;
    color: #f5f1e8;
  }

  .number {
    font-family: "Iowan Old Style", "Georgia", "Times New Roman", serif;
    font-size: clamp(1.6rem, 2.4vw, 3rem);
    line-height: 1;
    letter-spacing: -0.04em;
    color: #f5f1e8;
    opacity: 0.95;
    padding-top: 0.08em;
  }

  .copy {
    max-width: 42rem;
    overflow: hidden;
    margin-top: auto;
  }

  .copy p {
    margin: 1rem 0 0;
    font-size: clamp(0.98rem, 1.08vw, 1.22rem);
    line-height: 1.48;
    color: rgba(245, 241, 232, 0.72);
    opacity: 0;
    transform: translateY(18px);
    transition:
      opacity 480ms ease,
      transform 780ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .accordion-item.active .copy p {
    opacity: 1;
    transform: translateY(0);
    transition-delay: 90ms;
  }

  .cta-row {
    margin-top: auto;
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    opacity: 0;
    transform: translateY(18px);
    transition:
      opacity 480ms ease,
      transform 780ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .accordion-item.active .cta-row {
    opacity: 1;
    transform: translateY(0);
    transition-delay: 90ms;
  }

  .cta-text {
    margin: 0;
    max-width: 32rem;
    font-size: clamp(0.98rem, 1.08vw, 1.15rem);
    line-height: 1.48;
    color: rgba(245, 241, 232, 0.72);
  }

  /* Bouton copié dans l'esprit du header */
  .nav-btn {
    position: relative;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 1.5rem;
    font-size: 0.9rem;
    font-family: inherit;
    white-space: nowrap;
    color: inherit;
    border: none;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 3px;
    box-shadow:
      0 8px 10px rgba(0, 0, 0, 0.06),
      inset 0 0 0 0px rgba(255, 255, 255, 0.4);
    transition:
      transform 1.2s cubic-bezier(.22,.61,.36,1),
      box-shadow 1.2s cubic-bezier(.22,.61,.36,1),
      background 1.2s cubic-bezier(.22,.61,.36,1);
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
    transition: opacity 0.25s ease;
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
      height: 220px;
    }

    .accordion-item.active .visual {
      height: 280px;
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

    .copy p,
    .cta-row {
      opacity: 1;
      transform: none;
      margin-top: 0.85rem;
    }

    .cta-row {
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
    .visual img,
    .copy p,
    .cta-row,
    .nav-btn {
      transition: none !important;
    }
  }
</style>