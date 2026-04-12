<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";
  import { navigate } from "$lib/navigate.js";
  import { sharedLightPhase, setExitedLightZone } from "$lib/sectionThemeSync.js";

  let hoveredIndex = 0;
  let sectionEl;
  let sectionTop = 0;
  let sectionHeight = 0;
  let resizeObserver;
  let resizeTimer = null;
  let sectionVisible = false;
  let intersectionObserver;

  let hoverIntentTimer = null;
  let leaveIntentTimer = null;

  const HOVER_OPEN_DELAY = 90;
  const HOVER_CLOSE_DELAY = 120;

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

  function clearHoverTimers() {
    if (hoverIntentTimer) {
      clearTimeout(hoverIntentTimer);
      hoverIntentTimer = null;
    }
    if (leaveIntentTimer) {
      clearTimeout(leaveIntentTimer);
      leaveIntentTimer = null;
    }
  }

  function handleItemEnter(index) {
    if (!browser) return;

    if (leaveIntentTimer) {
      clearTimeout(leaveIntentTimer);
      leaveIntentTimer = null;
    }

    if (hoveredIndex === index) return;

    if (hoverIntentTimer) clearTimeout(hoverIntentTimer);

    hoverIntentTimer = setTimeout(() => {
      hoveredIndex = index;
      hoverIntentTimer = null;
    }, HOVER_OPEN_DELAY);
  }

  function handleAccordionLeave() {
    if (!browser) return;

    if (hoverIntentTimer) {
      clearTimeout(hoverIntentTimer);
      hoverIntentTimer = null;
    }

    if (leaveIntentTimer) clearTimeout(leaveIntentTimer);

    leaveIntentTimer = setTimeout(() => {
      hoveredIndex = 0;
      leaveIntentTimer = null;
    }, HOVER_CLOSE_DELAY);
  }

  function measure() {
    if (!sectionEl) return;
    const scrollY = window.lenis?.animatedScroll ?? window.scrollY ?? 0;
    const rect = sectionEl.getBoundingClientRect();
    sectionTop = rect.top + scrollY;
    sectionHeight = rect.height;
  }

  function onScroll(scrollY, { vh }) {
    if (!sectionVisible || !sectionHeight) return;

    const sectionBottom = sectionTop + sectionHeight;
    const revertTrigger = sectionBottom - vh * 1.16;
    setExitedLightZone(scrollY >= revertTrigger);
  }

  function handleResize() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      measure();
    }, 80);
  }

  onMount(() => {
    requestAnimationFrame(() => {
      measure();
      registerParallax(onScroll, { priority: 2 });
    });

    resizeObserver = new ResizeObserver(() => handleResize());
    if (sectionEl) resizeObserver.observe(sectionEl);

    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        sectionVisible = entry.isIntersecting;
        if (sectionVisible) measure();
      },
      { rootMargin: "400px 0px 400px 0px" }
    );

    if (sectionEl) intersectionObserver.observe(sectionEl);

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });
  });

  onDestroy(() => {
    if (!browser) return;
    unregisterParallax(onScroll);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    if (resizeTimer) clearTimeout(resizeTimer);
    clearHoverTimers();
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("orientationchange", handleResize);
    setExitedLightZone(false);
  });
</script>

<section
  class="services-accordion"
  class:light-phase={$sharedLightPhase}
  bind:this={sectionEl}
>
  <div class="top-header">
    <div class="header-title-wrap">
      <h2>Nos projets</h2>
    </div>
    <div class="header-spacer"></div>
  </div>

  <div class="accordion" role="presentation" on:pointerleave={handleAccordionLeave}>
    {#each projects as project, index}
      <article
        class="accordion-item"
        class:active={hoveredIndex === index}
        on:pointerenter={() => handleItemEnter(index)}
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
    --section-bg: #000;
    --section-text: #f4efe6;
    --item-1: #151515;
    --item-2: #111;
    --item-3: #000;
    --project-title: #f4efe6;
    --number-color: #5f6771;
    --cta-text-color: rgba(244, 239, 230, 0.72);
    --btn-text: #f4efe6;
    --btn-border: rgba(255, 255, 255, 0.15);
    --btn-bg: rgba(255, 255, 255, 0.10);

    width: 100%;
    background: var(--section-bg);
    color: var(--section-text);
    overflow: hidden;
    contain: layout paint;
    isolation: isolate;
    transition:
      background-color 620ms cubic-bezier(0.22, 1, 0.36, 1),
      color 620ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .services-accordion.light-phase {
    --section-bg: #f5f1e8;
    --section-text: #111;
    --item-1: #e7dfd3;
    --item-2: #e1d9cd;
    --item-3: #d9d0c3;
    --project-title: #111;
    --number-color: #756c60;
    --cta-text-color: rgba(17, 17, 17, 0.68);
    --btn-text: #111;
    --btn-border: rgba(17, 17, 17, 0.14);
    --btn-bg: rgba(17, 17, 17, 0.06);
  }

  .top-header {
    width: 100%;
    min-height: clamp(120px, 16vw, 210px);
    display: grid;
    grid-template-columns: 48% 52%;
    align-items: end;
    background: var(--section-bg);
    transition: background-color 620ms cubic-bezier(0.22, 1, 0.36, 1);
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
    color: var(--project-title);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: geometricPrecision;
    text-align: left;
    transition: color 620ms cubic-bezier(0.22, 1, 0.36, 1);
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
    will-change: height;
    transition:
      height 760ms cubic-bezier(0.22, 1, 0.36, 1),
      background-color 620ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .accordion-item:nth-child(1) {
    background: var(--item-1);
  }

  .accordion-item:nth-child(2) {
    background: var(--item-2);
  }

  .accordion-item:nth-child(3) {
    background: var(--item-3);
  }

  .accordion-item.active {
    height: clamp(260px, 28vw, 430px);
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
    color: var(--project-title);
    transition: color 620ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .number {
    font-family: "Titre italic", serif;
    font-style: italic;
    font-size: clamp(1.6rem, 2.4vw, 3rem);
    line-height: 1;
    letter-spacing: -0.04em;
    color: var(--number-color);
    opacity: 0.95;
    padding-top: 0.08em;
    transition: color 620ms cubic-bezier(0.22, 1, 0.36, 1);
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
    color: var(--cta-text-color);
    transition: color 620ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .nav-btn {
    font-family: "General Sans", sans-serif;
    position: relative;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 1.5rem;
    font-size: 0.9rem;
    white-space: nowrap;
    color: var(--btn-text);
    border: 1px solid var(--btn-border);
    cursor: pointer;
    background: var(--btn-bg);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 2px;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.04);
    transition:
      transform 1.2s cubic-bezier(.22,.61,.36,1),
      box-shadow 1.2s cubic-bezier(.22,.61,.36,1),
      background 1.2s cubic-bezier(.22,.61,.36,1),
      color 620ms cubic-bezier(0.22, 1, 0.36, 1),
      border-color 620ms cubic-bezier(0.22, 1, 0.36, 1);
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
    transition:
      transform 0.45s cubic-bezier(.22,.61,.36,1),
      opacity 0.28s ease;
  }

  .nav-btn-flip::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition:
      transform 0.45s cubic-bezier(.22,.61,.36,1),
      opacity 0.28s ease;
    white-space: nowrap;
    color: inherit;
  }

  .nav-btn:hover .nav-btn-text {
    transform: translateY(-100%);
  }

  .nav-btn:hover .nav-btn-flip::after {
    transform: translateY(0%);
  }

  .nav-btn::before,
  .nav-btn::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
  }

  .nav-btn::before {
    border: 1px solid transparent;
    border-radius: inherit;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      rgba(255, 225, 140, 1) 0%,
      rgba(212, 175, 55, 0.95) 22%,
      rgba(212, 102, 55, 0.55) 45%,
      rgba(212, 102, 55, 0.12) 62%,
      transparent 78%
    );
    transition: opacity 0.25s ease;
  }

  .nav-btn::after {
    border: 1px solid transparent;
    border-radius: inherit;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      rgba(212, 175, 55, 0.55) 0%,
      rgba(212, 102, 55, 0.22) 42%,
      transparent 72%
    );
    filter: blur(2px);
    transition: opacity 0.25s ease;
  }

  .nav-btn:hover::before,
  .nav-btn:hover::after {
    opacity: 1;
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
