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
  let sectionTop = 0;
  let sectionHeight = 1;
  let viewportH = 1;
  let measured = false;
  let resizeTimer;

  let scrollBlend = 0;
  let hoveredIndex = null;

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
    const rect = sectionEl.getBoundingClientRect();
    sectionTop = rect.top + scrollY;
    sectionHeight = Math.max(rect.height, 1);
    viewportH = Math.max(window.innerHeight, 1);
    measured = true;
  }

  function handleParallax(y) {
    if (!measured) return;
    const maxScroll = Math.max(sectionHeight - viewportH, 1);
    const overall = clamp((y - sectionTop) / maxScroll, 0, 1);
    scrollBlend = smoother01(invLerp(0.18, 0.82, overall));
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

  $: visualBlend = hoveredIndex === null ? scrollBlend : hoveredIndex;
  $: activeIndex = visualBlend >= 0.5 ? 1 : 0;
  $: activeProject = projects[activeIndex];
</script>

<section class="project-showcase" bind:this={sectionEl}>
  <div class="sticky-shell">
    <div class="backdrop"></div>

    <div class="showcase-grid">
      <div class="project-rail">
        {#each projects as project, i}
          <article
            class="rail-item"
            class:is-active={activeIndex === i}
            on:mouseenter={() => (hoveredIndex = i)}
            on:mouseleave={() => (hoveredIndex = null)}
            on:focusin={() => (hoveredIndex = i)}
            on:focusout={() => (hoveredIndex = null)}
          >
            <div class="rail-meta">{project.number} / {project.category}</div>
            <h2>{project.title}</h2>
            <p>{project.lead}</p>
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

      <div class="visual-stage" aria-hidden="true">
        <div class="visual-frame">
          <div
            class="visual-base"
            style={`opacity:${(1 - visualBlend).toFixed(3)}; transform: scale(${(1.02 - visualBlend * 0.02).toFixed(4)});`}
          >
            <img src={projects[0].image} alt="" />
          </div>

          <div
            class="visual-next"
            style={`opacity:${visualBlend.toFixed(3)}; clip-path: inset(${((1 - visualBlend) * 100).toFixed(3)}% 0 0 0); -webkit-clip-path: inset(${((1 - visualBlend) * 100).toFixed(3)}% 0 0 0);`}
          >
            <img
              src={projects[1].image}
              alt=""
              style={`transform: scale(${(1.045 - visualBlend * 0.03).toFixed(4)});`}
            />
          </div>

          <div class="visual-shade"></div>
          <div class="visual-line"></div>
        </div>
      </div>

      <div class="story-panel">
        <div class="story-kicker">{activeProject.number} / {activeProject.category}</div>
        <div class="story-copy">
          {#each projects as project, i}
            <div
              class="story-layer"
              class:is-active={activeIndex === i}
              aria-hidden={activeIndex !== i}
            >
              <h3>{project.title}</h3>
              <p class="story-lead">{project.lead}</p>
              <p class="story-rest">{project.rest}</p>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <div class="mobile-stack">
    {#each projects as project}
      <article class="mobile-card">
        <div class="mobile-image">
          <img src={project.image} alt={project.title} />
        </div>
        <div class="mobile-meta">{project.number} / {project.category}</div>
        <h2>{project.title}</h2>
        <p class="mobile-lead">{project.lead}</p>
        <p class="mobile-rest">{project.rest}</p>
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
    min-height: 240vh;
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
    background:
      radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.04), transparent 26%),
      radial-gradient(circle at 82% 84%, rgba(255, 255, 255, 0.03), transparent 30%),
      linear-gradient(180deg, #050505 0%, #000 100%);
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

  .project-rail {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1.3rem;
    min-width: 0;
  }

  .rail-item {
    padding: 0.25rem 0;
    opacity: 0.34;
    transition:
      opacity 0.7s ease,
      transform 0.8s cubic-bezier(.22,1,.36,1);
  }

  .rail-item.is-active {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  .rail-meta,
  .mobile-meta,
  .story-kicker {
    font-family: "General Sans", sans-serif;
    font-size: 0.72rem;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: rgba(245, 241, 232, 0.46);
  }

  .rail-item h2,
  .mobile-card h2,
  .story-layer h3 {
    margin: 0.35rem 0 0;
    font-family: "Titre", serif;
    font-size: clamp(2.8rem, 4vw, 4.9rem);
    line-height: 0.9;
    letter-spacing: -0.055em;
    font-weight: 400;
  }

  .rail-item p,
  .mobile-card p {
    margin: 0.9rem 0 1.25rem;
    max-width: 24rem;
    font-family: "General Sans", sans-serif;
    font-size: 0.98rem;
    line-height: 1.5;
    color: rgba(245, 241, 232, 0.66);
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
    will-change: opacity, transform, clip-path;
  }

  .visual-base img,
  .visual-next img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .visual-base img {
    transform: scale(1.02);
  }

  .visual-shade {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.28) 100%),
      linear-gradient(90deg, rgba(0, 0, 0, 0.24) 0%, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0.18) 100%);
    pointer-events: none;
  }

  .visual-line {
    position: absolute;
    left: 0;
    right: 0;
    top: calc((1 - var(--blend, 0)) * 100%);
    height: 1px;
    background: rgba(245, 241, 232, 0.34);
    opacity: 0.7;
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
    min-height: 16rem;
    margin-top: 1rem;
  }

  .story-layer {
    position: absolute;
    inset: 0;
    opacity: 0;
    transform: translate3d(0, 20px, 0);
    filter: blur(10px);
    transition:
      opacity 0.8s ease,
      transform 0.9s cubic-bezier(.22,1,.36,1),
      filter 0.9s cubic-bezier(.22,1,.36,1);
  }

  .story-layer.is-active {
    opacity: 1;
    transform: translate3d(0, 0, 0);
    filter: blur(0);
  }

  .story-lead {
    margin: 0.8rem 0 0;
    font-family: "Titre", serif;
    font-size: clamp(1.35rem, 2vw, 2rem);
    line-height: 1.02;
    letter-spacing: -0.04em;
    color: #f5f1e8;
  }

  .story-rest {
    margin: 1rem 0 0;
    font-family: "General Sans", sans-serif;
    font-size: 1rem;
    line-height: 1.55;
    color: rgba(245, 241, 232, 0.68);
    max-width: 28rem;
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
      font-size: clamp(2.6rem, 10vw, 4rem);
      line-height: 0.9;
    }

    .mobile-lead {
      font-family: "Titre", serif;
      font-size: clamp(1.2rem, 5.6vw, 1.8rem);
      line-height: 1.02;
      letter-spacing: -0.04em;
      color: #f5f1e8;
    }

    .mobile-rest {
      color: rgba(245, 241, 232, 0.7);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .rail-item,
    .story-layer,
    .nav-btn,
    .nav-btn-text,
    .nav-btn-flip::after {
      transition: none !important;
      animation: none !important;
    }
  }
</style>
