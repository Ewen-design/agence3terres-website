<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { navigate } from "$lib/navigate.js";
  import {
    registerParallax,
    unregisterParallax,
    forceScrollEngineUpdate
  } from "$lib/scrollEngine.js";

  const projects = [
    {
      number: "01",
      title: "Serein Design",
      category: "Identite produit",
      lead: "Un univers objet premium, calme et fonctionnel.",
      rest: "Une direction pensée pour traduire une elegance sobre, technologique et durable a travers une identite visuelle claire et sensible.",
      image: "/images/telephone3.webp",
      previewImages: [
        { src: "/images/telephone2.webp", alt: "Apercu mobile Serein Design" },
        { src: "/images/telephone_main.webp", alt: "Detail interface Serein Design" },
        { src: "/images/telephone2_parfum.webp", alt: "Composition visuelle Serein Design" }
      ],
      page: "projet1",
      button: "Voir le projet",
      mobileInfo: ["Serein Design", "Identite", "Direction", "Branding", "UI design"]
    },
    {
      number: "02",
      title: "Hansatsu",
      category: "Narration visuelle",
      lead: "Une presence plus sensorielle, plus singuliere.",
      rest: "Un travail d'image et de narration concu pour installer une esthetique precise, immersive et raffinee autour du produit.",
      image: "/images/parfum_rouge.webp",
      previewImages: [
        { src: "/images/parfum2.webp", alt: "Apercu immersif Hansatsu" },
        { src: "/images/parfum3.webp", alt: "Detail Hansatsu" },
        { src: "/images/telephone_parfum.webp", alt: "Interface mobile Hansatsu" }
      ],
      page: "projet2",
      button: "Voir le projet",
      mobileInfo: ["Hansatsu", "Narration", "Image", "DA", "Contenu"]
    },
    {
      number: "03",
      title: "Votre projet ?",
      category: "Collaboration",
      lead: "Une vision a faire naitre, clarifier ou amplifier.",
      rest: "Identite, direction artistique, site web ou experience digitale : construisons ensemble une presence forte, juste et memorable.",
      image: "/images/telephone2.webp",
      previewImages: [
        { src: "/images/telephone_main.webp", alt: "Projet digital" },
        { src: "/images/parfum_ordinateur.webp", alt: "Direction web" },
        { src: "/images/photo.webp", alt: "Univers de marque" }
      ],
      page: "contact",
      button: "Nous contacter",
      mobileInfo: ["Votre projet ?", "Site web", "Identite", "Strategie", "Motion"]
    }
  ];

  let sectionEl;
  let slideEls = [];
  let slideMetrics = [];
  let viewportH = 1;
  let measured = false;
  let resizeTimer;

  let activeIndex = 0;
  let isMobile = false;
  let mobileRailEl;
  let mobileCardEls = [];
  let mobileScrollRaf;
  let mobileTweenRaf;
  let activeMobileIndex = 0;
  let desktopScrollProgress = 0;

  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

  function measure() {
    if (!browser || !sectionEl) return;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    viewportH = Math.max(window.innerHeight, 1);
    isMobile = window.innerWidth <= 900;
    slideMetrics = slideEls
      .map((slide) => {
        if (!slide) return null;
        const rect = slide.getBoundingClientRect();
        const top = rect.top + scrollY;
        const height = Math.max(rect.height, 1);

        return {
          top,
          height,
          center: top + height * 0.5
        };
      })
      .filter(Boolean);
    measured = true;
  }

  function handleParallax(y) {
    if (!measured || slideMetrics.length === 0) return;

    const viewportMid = y + viewportH * 0.5;
    let nextActiveIndex = activeIndex;
    let closestDistance = Number.POSITIVE_INFINITY;

    slideMetrics.forEach((metric, index) => {
      const distance = Math.abs(metric.center - viewportMid);
      if (distance < closestDistance) {
        closestDistance = distance;
        nextActiveIndex = index;
      }
    });

    activeIndex = nextActiveIndex;
    const firstCenter = slideMetrics[0]?.center ?? viewportMid;
    const lastCenter = slideMetrics[slideMetrics.length - 1]?.center ?? viewportMid;
    desktopScrollProgress = clamp((viewportMid - firstCenter) / Math.max(lastCenter - firstCenter, 1), 0, 1);
  }

  function updateMobileActive() {
    if (!mobileRailEl) return;

    const cards = mobileRailEl.querySelectorAll(".mobile-card");
    if (!cards.length) return;

    const centerX = mobileRailEl.scrollLeft + mobileRailEl.clientWidth * 0.5;
    let nearest = 0;
    let nearestDistance = Infinity;

    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft + card.offsetWidth * 0.5 - centerX);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = index;
      }
    });

    activeMobileIndex = nearest;
  }

  function handleMobileRailScroll() {
    if (mobileScrollRaf) cancelAnimationFrame(mobileScrollRaf);
    mobileScrollRaf = requestAnimationFrame(() => {
      updateMobileActive();
      mobileScrollRaf = null;
    });
  }

  function scrollToMobileCard(index) {
    const card = mobileCardEls[index];
    if (!mobileRailEl || !card) return;

    if (mobileTweenRaf) cancelAnimationFrame(mobileTweenRaf);

    const target =
      card.offsetLeft - (mobileRailEl.clientWidth - card.offsetWidth) * 0.5;

    const start = mobileRailEl.scrollLeft;
    const delta = target - start;
    const duration = 840;
    const startTime = performance.now();
    mobileRailEl.classList.add("is-programmatic-scrolling");

    function easeInOutSine(t) {
      return -(Math.cos(Math.PI * t) - 1) / 2;
    }

    function frame(now) {
      const progress = clamp((now - startTime) / duration, 0, 1);
      const eased = easeInOutSine(progress);
      mobileRailEl.scrollLeft = start + delta * eased;
      updateMobileActive();

      if (progress < 1) {
        mobileTweenRaf = requestAnimationFrame(frame);
        return;
      }

      mobileRailEl.scrollLeft = target;
      updateMobileActive();
      mobileRailEl.classList.remove("is-programmatic-scrolling");
      mobileTweenRaf = null;
    }

    mobileTweenRaf = requestAnimationFrame(frame);
  }

  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      measure();
      forceScrollEngineUpdate();
    }, 80);
  }

  function handleButtonMove(event) {
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  onMount(() => {
    if (!browser) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        measure();
        registerParallax(handleParallax, { priority: 2 });
        forceScrollEngineUpdate();
        updateMobileActive();
      });
    });

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });
    mobileRailEl?.addEventListener("scroll", handleMobileRailScroll, { passive: true });

    return () => {
      unregisterParallax(handleParallax);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      mobileRailEl?.removeEventListener("scroll", handleMobileRailScroll);
    };
  });

  onDestroy(() => {
    if (!browser) return;
    unregisterParallax(handleParallax);
    clearTimeout(resizeTimer);
    mobileRailEl?.removeEventListener("scroll", handleMobileRailScroll);
    if (mobileScrollRaf) cancelAnimationFrame(mobileScrollRaf);
    if (mobileTweenRaf) cancelAnimationFrame(mobileTweenRaf);
  });
</script>

<section
  class="project-showcase"
  bind:this={sectionEl}
  style={`--project-count:${projects.length};`}
>
  <div class="sticky-shell">
    <div class="backdrop"></div>

    <div class="showcase-grid">
      <div class="rail-spacer" aria-hidden="true"></div>

      <div class="visual-stage" aria-hidden="true">
        <div class="visual-frame" style={`--desktop-zoom:${desktopScrollProgress.toFixed(3)};`}>
          {#each projects as project, i}
            <div class="visual-layer" class:is-active={activeIndex === i}>
              <img src={project.image} alt="" />
              {#if project.previewImages?.length}
                <div class="visual-floating-card">
                  <div class="visual-slideshow">
                    {#each project.previewImages as image, slideIndex}
                      <img
                        src={image.src}
                        alt={image.alt || ""}
                        class="visual-slide"
                        loading="lazy"
                        style={`--slide-index:${slideIndex}; --slide-count:${project.previewImages.length};`}
                      />
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          {/each}
          <div class="visual-shade"></div>
        </div>
      </div>

      <div class="story-panel">
        <div class="story-copy">
          {#each projects as project, i}
            <div
              class="story-layer"
              class:is-active={activeIndex === i}
              aria-hidden={activeIndex !== i}
            >
              <p class="story-rest">{project.rest}</p>
              <button
                class="nav-btn story-btn"
                type="button"
                data-cursor="button"
                on:mousemove={handleButtonMove}
                on:click={() => navigate(project.page)}
              >
                <span class="nav-btn-flip" data-text={project.button}>
                  <span class="nav-btn-text">{project.button}</span>
                </span>
              </button>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <div class="project-scroll-track">
    {#each projects as project, i}
      <section class="project-slide">
        <div class="project-slide-grid">
          <article
            class="project-copy"
            bind:this={slideEls[i]}
            class:is-active={activeIndex === i}
          >
            <h2>{project.title}</h2>
          </article>
        </div>
      </section>
    {/each}
  </div>

  <div class="mobile-stack">
    <div class="mobile-rail" bind:this={mobileRailEl}>
    {#each projects as project, i}
      <button
        class="mobile-card"
        class:is-active={activeMobileIndex === i}
        bind:this={mobileCardEls[i]}
        data-cursor="button"
        aria-label={project.button}
        type="button"
        on:mousemove={handleButtonMove}
        on:click={() => navigate(project.page)}
      >
        <div class="mobile-image">
          <img src={project.image} alt={project.title} />
          {#if project.previewImages?.length}
            <div class="mobile-preview-card" aria-hidden="true">
              <div class="mobile-preview-slideshow">
                {#each project.previewImages as image, slideIndex}
                  <img
                    src={image.src}
                    alt=""
                    class="mobile-preview-slide"
                    loading="lazy"
                    style={`--slide-index:${slideIndex}; --slide-count:${project.previewImages.length};`}
                  />
                {/each}
              </div>
            </div>
          {/if}
          <div class="mobile-card-info" aria-hidden="true">
            <span class="mobile-info-chip mobile-info-title">{project.mobileInfo[0]}</span>
            {#each project.mobileInfo.slice(1) as info}
              <span class="mobile-info-chip">{info}</span>
            {/each}
          </div>
          <div
            class="mobile-card-cta"
            aria-hidden="true"
          >
            {project.button}
          </div>
        </div>
        <div class="mobile-card-index-wrap" aria-hidden="true">
          <span class="mobile-card-index-inner">{project.number}</span>
        </div>
      </button>
    {/each}
    </div>

    <div class="mobile-nav" aria-label="Navigation projets mobile">
      <button
        class="mobile-nav-btn mobile-nav-prev"
        class:is-hidden={activeMobileIndex === 0}
        type="button"
        aria-label="Projet précédent"
        on:mousemove={handleButtonMove}
        on:click={() => scrollToMobileCard(Math.max(activeMobileIndex - 1, 0))}
      >
        <span aria-hidden="true">←</span>
      </button>

      <button
        class="mobile-nav-btn mobile-nav-next"
        class:is-hidden={activeMobileIndex === projects.length - 1}
        type="button"
        aria-label="Projet suivant"
        on:mousemove={handleButtonMove}
        on:click={() => scrollToMobileCard(Math.min(activeMobileIndex + 1, projects.length - 1))}
      >
        <span aria-hidden="true">→</span>
      </button>
    </div>
  </div>
</section>

<style>
  .project-showcase {
    position: relative;
    background: #000;
    color: #f5f1e8;
    min-height: calc(var(--project-count, 2) * var(--viewport-height));
  }

  .sticky-shell {
    position: sticky;
    top: 0;
    height: var(--viewport-height);
    overflow: hidden;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    background: #000;
  }

  .showcase-grid {
    position: relative;
    z-index: 2;
    height: 100%;
    display: grid;
    grid-template-columns: minmax(280px, 0.95fr) minmax(340px, 1.05fr) minmax(280px, 0.82fr);
    gap: clamp(1.2rem, 2vw, 2rem);
    padding: clamp(5.8rem, 10vh, 7rem) clamp(1.2rem, 2.5vw, 2rem) clamp(1.4rem, 2.5vw, 2rem);
    align-items: stretch;
  }

  .rail-spacer {
    min-width: 0;
  }

  .project-copy h2 {
    margin: 0.35rem 0 0;
    font-family: "Clash Display", sans-serif;
    font-style: normal;
    font-size: clamp(3.5rem, 5.4vw, 6.2rem);
    line-height: 0.9;
    letter-spacing: -0.055em;
    font-weight: 400;
  }

  .visual-stage {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
  }

  .visual-frame {
    position: relative;
    width: min(100%, 700px);
    height: min(76vh, 860px);
    overflow: hidden;
    background: #080808;
  }

  .visual-layer {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 1.35s cubic-bezier(.22,.61,.36,1);
    will-change: opacity;
    pointer-events: none;
  }

  .visual-layer img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform: scale(1.11);
    filter: brightness(0.78);
    transition:
      transform 2.2s cubic-bezier(.22,.61,.36,1),
      filter 1.35s cubic-bezier(.22,.61,.36,1);
    will-change: transform, filter;
  }

  .visual-layer.is-active {
    opacity: 1;
    pointer-events: auto;
  }

  .visual-layer.is-active img {
    transform: scale(calc(1.03 + var(--desktop-zoom, 0) * 0.035));
    filter: brightness(0.86);
  }

  .visual-floating-card {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 3;
    width: clamp(11rem, 23vw, 18rem);
    aspect-ratio: 1.02;
    border-radius: 2px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 25px 80px rgba(11, 8, 5, 0.28);
    opacity: 0;
    transform: translate(-50%, calc(-50% + 16px)) scale(0.985);
    transition:
      opacity 0.45s ease,
      transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;
  }

  .visual-slideshow {
    position: relative;
    width: 100%;
    height: 100%;
    background: #111;
  }

  .visual-slide {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    animation-name: project-showcase-slideshow;
    animation-duration: calc(var(--slide-count) * 1.85s);
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    animation-delay: calc(var(--slide-index) * 1.85s);
    animation-fill-mode: both;
  }

  .visual-layer.is-active:hover img,
  .visual-layer.is-active:focus-within img {
    transform: scale(calc(1.05 + var(--desktop-zoom, 0) * 0.04));
    filter: saturate(0.95) brightness(0.82);
  }

  .visual-layer.is-active:hover .visual-floating-card,
  .visual-layer.is-active:focus-within .visual-floating-card {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  .visual-shade {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(0, 0, 0, 0.06) 0%, rgba(0, 0, 0, 0.22) 100%),
      linear-gradient(90deg, rgba(0, 0, 0, 0.18) 0%, rgba(0, 0, 0, 0) 32%, rgba(0, 0, 0, 0.12) 100%);
    pointer-events: none;
  }

  .story-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding-bottom: clamp(1rem, 3vh, 2rem);
    min-width: 0;
  }

  .story-copy {
    position: relative;
    min-height: 18rem;
  }

  .story-layer {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.7s ease;
    pointer-events: none;
  }

  .story-layer.is-active {
    opacity: 1;
    pointer-events: auto;
  }

  .story-rest {
    margin: 0;
    font-family: "Clash Display", sans-serif;
    font-size: 1.02rem;
    line-height: 1.7;
    color: rgba(245, 241, 232, 0.78);
    max-width: 25rem;
  }

  .story-btn {
    margin-top: 1.4rem;
  }

  .project-scroll-track {
    position: relative;
    z-index: 3;
    margin-top: calc(-1 * var(--viewport-height));
    pointer-events: none;
  }

  .project-slide {
    min-height: var(--viewport-height);
    display: flex;
    align-items: center;
  }

  .project-slide-grid {
    width: 100%;
    display: grid;
    grid-template-columns: minmax(280px, 0.95fr) minmax(340px, 1.05fr) minmax(280px, 0.82fr);
    gap: clamp(1.2rem, 2vw, 2rem);
    padding: clamp(5.8rem, 10vh, 7rem) clamp(1.2rem, 2.5vw, 2rem) clamp(1.4rem, 2.5vw, 2rem);
    align-items: center;
  }

  .project-copy {
    grid-column: 1;
    align-self: center;
    pointer-events: auto;
    max-width: 26rem;
  }

  .project-copy h2 {
    font-size: clamp(5.3rem, 8.2vw, 9.4rem);
    line-height: 0.82;
  }

  .nav-btn {
    font-family: "Clash Display", sans-serif;
    position: relative;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 1.5rem;
    font-size: 0.9rem;
    white-space: nowrap;
    color: inherit;
    border: 1px solid rgba(255, 255, 255, 0.15);
    cursor: pointer;
    background: rgba(255, 255, 255, 0.10);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 2px;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.04);
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
      rgba(220, 240, 255, 1) 0%,
      rgba(145, 205, 255, 0.98) 22%,
      rgba(74, 140, 255, 0.62) 45%,
      rgba(18, 45, 120, 0.14) 62%,
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
      rgba(95, 165, 255, 0.42) 0%,
      rgba(74, 140, 255, 0.18) 42%,
      transparent 72%
    );
    filter: blur(2px);
    transition: opacity 0.25s ease;
  }

  .nav-btn:hover::before,
  .nav-btn:hover::after {
    opacity: 1;
  }

  .mobile-stack {
    display: none;
  }

  @media (max-width: 900px) {
    .project-showcase {
      min-height: auto;
      padding: 6rem 0 4rem;
    }

    .sticky-shell {
      display: none;
    }

    .project-scroll-track {
      display: none;
    }

    .mobile-stack {
      display: block;
      width: 100%;
      margin: 0 auto;
    }

    .mobile-rail {
      width: 100%;
      margin: 0;
      display: flex;
      gap: 0.95rem;
      overflow-x: auto;
      overflow-y: visible;
      padding-top: 0;
      padding-bottom: 2.6rem;
      padding-left: calc((100vw - clamp(304px, 84vw, 388px)) / 2);
      padding-right: calc((100vw - clamp(304px, 84vw, 388px)) / 2);
      scroll-snap-type: x mandatory;
      scroll-snap-stop: always;
      scroll-padding-left: calc((100vw - clamp(304px, 84vw, 388px)) / 2);
      scroll-padding-right: calc((100vw - clamp(304px, 84vw, 388px)) / 2);
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-x: contain;
      scrollbar-width: none;
    }

    :global(.mobile-rail.is-programmatic-scrolling) {
      scroll-snap-type: none;
    }

    .mobile-rail::-webkit-scrollbar {
      display: none;
    }

    .mobile-card {
      position: relative;
      flex: 0 0 clamp(304px, 84vw, 388px);
      width: clamp(304px, 84vw, 388px);
      display: block;
      scroll-snap-align: center;
      scroll-snap-stop: always;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      border: 0;
      outline: none;
      border-radius: 0;
      padding: 0;
      background: transparent;
      text-align: left;
      box-shadow: none;
      font: inherit;
      color: inherit;
      line-height: inherit;
      -webkit-tap-highlight-color: transparent;
    }

    .mobile-image {
      position: relative;
      aspect-ratio: 0.88 / 1.34;
      overflow: hidden;
      background: #080808;
      border-radius: 3px;
    }

    .mobile-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transform: translateZ(0);
      transition:
        filter .34s ease,
        transform .42s ease;
      will-change: transform, filter;
    }

    .mobile-card-info {
      position: absolute;
      top: 12px;
      left: 12px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 7px;
      opacity: 0;
      transform: translate3d(0, -10px, 0);
      transition: opacity .28s ease, transform .28s ease;
      z-index: 2;
      pointer-events: none;
    }

    .mobile-preview-card {
      position: absolute;
      left: 12px;
      bottom: 12px;
      z-index: 2;
      width: clamp(5.7rem, 24vw, 7.3rem);
      aspect-ratio: 0.88;
      overflow: hidden;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.94);
      box-shadow: 0 18px 48px rgba(11, 8, 5, 0.28);
      opacity: 0;
      transform: translate3d(0, 10px, 0) scale(0.985);
      transition:
        opacity .34s ease,
        transform .42s cubic-bezier(.22,.61,.36,1);
      pointer-events: none;
    }

    .mobile-preview-slideshow {
      position: relative;
      width: 100%;
      height: 100%;
      background: #111;
    }

    .mobile-preview-slide {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      animation-name: project-showcase-slideshow;
      animation-duration: calc(var(--slide-count) * 1.85s);
      animation-timing-function: ease-in-out;
      animation-iteration-count: infinite;
      animation-delay: calc(var(--slide-index) * 1.85s);
      animation-fill-mode: both;
    }

    .mobile-card-index-wrap {
      position: absolute;
      left: 0;
      bottom: -30px;
      z-index: 6;
      overflow: hidden;
      width: max-content;
      height: 1.1em;
      pointer-events: none;
    }

    .mobile-card-index-inner {
      display: block;
      font-family: "Clash Display", sans-serif;
      font-style: normal;
      font-weight: 500;
      font-size: 1.05rem;
      line-height: 1;
      letter-spacing: -0.02em;
      color: rgba(245, 241, 232, 0.8);
      opacity: 0;
      transform: translate3d(0, -115%, 0);
      transition:
        transform .42s cubic-bezier(.22,.61,.36,1),
        opacity .32s ease;
    }

    .mobile-info-chip {
      display: inline-flex;
      align-items: center;
      min-height: 30px;
      padding: .36rem .78rem .4rem;
      border: 1px solid rgba(255, 255, 255, .08);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      background: rgba(255, 255, 255, .14);
      color: #fff;
      border-radius: 3px;
      line-height: 1;
      white-space: nowrap;
      transform: translate3d(0, 10px, 0);
      opacity: 0;
      transition:
        opacity .34s ease,
        transform .42s cubic-bezier(.22,.61,.36,1),
        background .28s ease;
      font-family: "Clash Display", sans-serif;
      font-size: .78rem;
      font-weight: 400;
      letter-spacing: -0.02em;
    }

    .mobile-info-title {
      font-family: "Clash Display", sans-serif;
      font-style: normal;
      font-weight: 500;
      font-size: clamp(1.3rem, 6vw, 1.7rem);
      letter-spacing: -0.035em;
      min-height: 42px;
      padding: .42rem 1rem .48rem;
    }

    .mobile-card.is-active .mobile-image img {
      filter: brightness(.68);
      transform: scale(1.02) translateZ(0);
    }

    .mobile-card.is-active .mobile-card-info {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }

    .mobile-card.is-active .mobile-card-index-inner {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }

    .mobile-card.is-active .mobile-preview-card {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1);
      transition-delay: .18s;
    }

    .mobile-card.is-active .mobile-info-chip {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }

    .mobile-card.is-active .mobile-info-chip:nth-child(1) {
      transition-delay: .02s;
    }

    .mobile-card.is-active .mobile-info-chip:nth-child(2) {
      transition-delay: .06s;
    }

    .mobile-card.is-active .mobile-info-chip:nth-child(3) {
      transition-delay: .10s;
    }

    .mobile-card.is-active .mobile-info-chip:nth-child(4) {
      transition-delay: .14s;
    }

    .mobile-card.is-active .mobile-info-chip:nth-child(5) {
      transition-delay: .18s;
    }

    .mobile-card-cta {
      position: absolute;
      right: 12px;
      bottom: 12px;
      display: inline-flex;
      align-items: center;
      min-height: 42px;
      padding: .42rem 1rem .48rem;
      border: 1px solid rgba(255, 255, 255, .08);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      background: rgba(255, 255, 255, .14);
      color: #fff;
      border-radius: 3px;
      line-height: 1;
      white-space: nowrap;
      font-family: "Clash Display", sans-serif;
      font-style: normal;
      font-weight: 500;
      font-size: clamp(1.3rem, 6vw, 1.7rem);
      letter-spacing: -0.035em;
      z-index: 3;
      transform: translate3d(0, 10px, 0);
      opacity: 0;
      transition:
        opacity .34s ease,
        transform .42s cubic-bezier(.22,.61,.36,1);
    }

    .mobile-card.is-active .mobile-card-cta {
      opacity: 1;
      transform: translate3d(0, 0, 0);
      transition-delay: .22s;
    }

    .mobile-nav {
      width: min(92vw, 520px);
      margin: 0.2rem auto 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.65rem;
    }

    .mobile-nav-btn {
      position: relative;
      width: 42px;
      height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255, 255, 255, .12);
      border-radius: 2px;
      background: rgba(255, 255, 255, .08);
      color: #fff;
      font-family: "Clash Display", sans-serif;
      font-size: 1rem;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      outline: none;
      -webkit-tap-highlight-color: transparent;
      transition:
        opacity .32s ease,
        transform .32s ease;
    }

    .mobile-nav-btn::before,
    .mobile-nav-btn::after {
      content: "";
      position: absolute;
      inset: -1px;
      border-radius: inherit;
      pointer-events: none;
      opacity: 0;
    }

    .mobile-nav-btn::before {
      border: 1px solid transparent;
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

    .mobile-nav-btn::after {
      border: 1px solid transparent;
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

    .mobile-nav-btn:hover::before,
    .mobile-nav-btn:hover::after {
      opacity: 1;
    }

    .mobile-nav-btn.is-hidden {
      opacity: 0;
      transform: translate3d(0, 6px, 0);
      pointer-events: none;
    }
  }

  @media (max-width: 640px) {
    .mobile-rail {
      gap: .8rem;
      padding-bottom: 2.45rem;
      padding-left: calc((100vw - clamp(292px, 84vw, 360px)) / 2);
      padding-right: calc((100vw - clamp(292px, 84vw, 360px)) / 2);
      scroll-padding-left: calc((100vw - clamp(292px, 84vw, 360px)) / 2);
      scroll-padding-right: calc((100vw - clamp(292px, 84vw, 360px)) / 2);
    }

    .mobile-card {
      flex-basis: clamp(292px, 84vw, 360px);
      width: clamp(292px, 84vw, 360px);
    }
  }

  @media (max-width: 420px) {
    .mobile-rail {
      gap: .75rem;
      padding-bottom: 2.3rem;
      padding-left: calc((100vw - 84vw) / 2);
      padding-right: calc((100vw - 84vw) / 2);
      scroll-padding-left: calc((100vw - 84vw) / 2);
      scroll-padding-right: calc((100vw - 84vw) / 2);
    }

    .mobile-card {
      flex-basis: 86vw;
      width: 86vw;
    }

    .mobile-card-info {
      top: 10px;
      left: 10px;
      gap: 6px;
    }

    .mobile-preview-card {
      left: 10px;
      bottom: 10px;
      width: clamp(5.2rem, 24vw, 6.5rem);
    }

    .mobile-card-index-wrap {
      bottom: -26px;
    }

    .mobile-info-title {
      min-height: 38px;
      padding: .36rem .9rem .42rem;
    }

    .mobile-info-chip {
      padding: .32rem .72rem .36rem;
      font-size: .72rem;
    }

    .mobile-card-cta {
      right: 10px;
      bottom: 10px;
      min-height: 38px;
      padding: .36rem .9rem .42rem;
      font-size: 1.15rem;
    }

    .mobile-nav {
      gap: 0.55rem;
    }

    .mobile-nav-btn {
      width: 40px;
      height: 40px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .project-copy,
    .story-layer,
    .nav-btn,
    .nav-btn-text,
    .nav-btn-flip::after,
    .visual-floating-card,
    .mobile-preview-card {
      transition: none !important;
      animation: none !important;
    }
  }

  @keyframes project-showcase-slideshow {
    0% {
      opacity: 0;
    }

    8%,
    42% {
      opacity: 1;
    }

    58%,
    100% {
      opacity: 0;
    }
  }
</style>
