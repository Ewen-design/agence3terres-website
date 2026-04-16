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
      image: "/images/serein_design.webp",
      page: "projet1",
      button: "Voir projet 1"
    },
    {
      number: "02",
      title: "Hansatsu",
      category: "Narration visuelle",
      lead: "Une presence plus sensorielle, plus singuliere.",
      rest: "Un travail d'image et de narration concu pour installer une esthetique precise, immersive et raffinee autour du produit.",
      image: "/images/parfum_rouge.webp",
      page: "projet2",
      button: "Voir projet 2"
    }
  ];

  let sectionEl;
  let slideEls = [];
  let slideMetrics = [];
  let viewportH = 1;
  let measured = false;
  let resizeTimer;

  let scrollBlend = 0;
  let activeIndex = 0;

  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

  function smoother01(t) {
    const x = clamp(t, 0, 1);
    return x * x * x * (x * (x * 6 - 15) + 10);
  }

  function invLerp(a, b, v) {
    if (a === b) return 0;
    return clamp((v - a) / (b - a), 0, 1);
  }

  function measure() {
    if (!browser || !sectionEl) return;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    viewportH = Math.max(window.innerHeight, 1);
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

    if (slideMetrics.length === 1) {
      scrollBlend = 0;
      return;
    }

    const firstCenter = slideMetrics[0].center;
    const lastCenter = slideMetrics[slideMetrics.length - 1].center;
    scrollBlend = smoother01(invLerp(firstCenter, lastCenter, viewportMid));
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
      });
    });

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });

    return () => {
      unregisterParallax(handleParallax);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  });

  onDestroy(() => {
    if (!browser) return;
    unregisterParallax(handleParallax);
    clearTimeout(resizeTimer);
  });

  $: visualBlend = scrollBlend;
  $: activeProject = projects[activeIndex];
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
        <div class="visual-frame" style={`--blend:${visualBlend.toFixed(3)};`}>
          <div
            class="visual-base"
            style={`transform: scale(${(1.01 + visualBlend * 0.035).toFixed(4)}); filter: brightness(${(1 - visualBlend * 0.24).toFixed(4)});`}
          >
            <img src={projects[0].image} alt="" />
          </div>

          <div
            class="visual-next"
            style={`clip-path: inset(${((1 - visualBlend) * 100).toFixed(3)}% 0 0 0); -webkit-clip-path: inset(${((1 - visualBlend) * 100).toFixed(3)}% 0 0 0);`}
          >
            <img
              src={projects[1].image}
              alt=""
              style={`transform: scale(${(1.045 - visualBlend * 0.02).toFixed(4)});`}
            />
          </div>

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
              <p class="story-lead">{project.lead}</p>
              <p class="story-rest">{project.rest}</p>
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
            <p>{project.lead} {project.rest}</p>
            <button
              class="nav-btn"
              type="button"
              data-cursor="button"
              on:mousemove={handleButtonMove}
              on:click={() => navigate(project.page)}
            >
              <span class="nav-btn-flip" data-text={project.button}>
                <span class="nav-btn-text">{project.button}</span>
              </span>
            </button>
          </article>
        </div>
      </section>
    {/each}
  </div>

  <div class="mobile-stack">
    {#each projects as project}
      <article class="mobile-card">
        <div class="mobile-image">
          <img src={project.image} alt={project.title} />
        </div>
        <h2>{project.title}</h2>
        <p class="mobile-rest">{project.lead} {project.rest}</p>
        <button
          class="nav-btn"
          type="button"
          data-cursor="button"
          on:mousemove={handleButtonMove}
          on:click={() => navigate(project.page)}
        >
          <span class="nav-btn-flip" data-text={project.button}>
            <span class="nav-btn-text">{project.button}</span>
          </span>
        </button>
      </article>
    {/each}
  </div>
</section>

<style>
  .project-showcase {
    position: relative;
    background: #000;
    color: #f5f1e8;
    min-height: calc(var(--project-count, 2) * 100vh);
  }

  .sticky-shell {
    position: sticky;
    top: 0;
    height: 100vh;
    height: 100svh;
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

  .project-copy h2,
  .mobile-card h2 {
    margin: 0.35rem 0 0;
    font-family: "Titre italic", serif;
    font-style: italic;
    font-size: clamp(3.5rem, 5.4vw, 6.2rem);
    line-height: 0.9;
    letter-spacing: -0.055em;
    font-weight: 400;
  }

  .project-copy p,
  .mobile-card p {
    margin: 0.9rem 0 1.25rem;
    max-width: 28rem;
    font-family: "General Sans", sans-serif;
    font-size: 1.02rem;
    line-height: 1.62;
    color: rgba(245, 241, 232, 0.72);
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

  .visual-base,
  .visual-next {
    position: absolute;
    inset: 0;
    will-change: transform, clip-path, filter;
  }

  .visual-base img,
  .visual-next img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .visual-base img {
    transform: scale(1.01);
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
    min-height: 14rem;
  }

  .story-layer {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.7s ease;
  }

  .story-layer.is-active {
    opacity: 1;
  }

  .story-lead {
    margin: 0 0 0.9rem;
    font-family: "Titre", serif;
    font-size: clamp(1.35rem, 2vw, 2rem);
    line-height: 1.02;
    letter-spacing: -0.04em;
    color: #f5f1e8;
  }

  .story-rest {
    margin: 0;
    font-family: "General Sans", sans-serif;
    font-size: 1.02rem;
    line-height: 1.7;
    color: rgba(245, 241, 232, 0.78);
    max-width: 25rem;
  }

  .project-scroll-track {
    position: relative;
    z-index: 3;
    margin-top: -100vh;
    margin-top: -100svh;
    pointer-events: none;
  }

  .project-slide {
    min-height: 100vh;
    min-height: 100svh;
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
    opacity: 0.34;
    transform: translate3d(0, 32px, 0);
    transition:
      opacity 0.7s ease,
      transform 0.9s cubic-bezier(.22,1,.36,1);
  }

  .project-copy.is-active {
    opacity: 1;
    transform: translate3d(0, 0, 0);
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
      display: grid;
      gap: 3rem;
      width: min(92vw, 720px);
      margin: 0 auto;
    }

    .mobile-card {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .mobile-image {
      aspect-ratio: 1.12 / 1;
      overflow: hidden;
      background: #080808;
      margin-bottom: 1rem;
    }

    .mobile-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .mobile-card h2 {
      font-size: clamp(3rem, 11vw, 4.6rem);
      line-height: 0.9;
    }

    .mobile-rest {
      color: rgba(245, 241, 232, 0.74);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .project-copy,
    .story-layer,
    .nav-btn,
    .nav-btn-text,
    .nav-btn-flip::after {
      transition: none !important;
      animation: none !important;
    }
  }
</style>
