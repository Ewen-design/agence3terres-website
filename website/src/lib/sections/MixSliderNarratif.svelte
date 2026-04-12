<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";

  const slides = [
    {
      number: "01",
      navTitle: "SEREIN DESIGN",
      title: "SEREIN\nDESIGN",
      description:
        "Un univers objet premium, calme et fonctionnel. Une direction pensée pour traduire une élégance sobre, technologique et durable à travers une identité visuelle claire et sensible.",
      image: "/images/serein_design.webp"
    },
    {
      number: "02",
      navTitle: "HANSATSU",
      title: "HANSATSU",
      description:
        "Une présence plus sensorielle, plus singulière. Un travail d’image et de narration conçu pour installer une esthétique précise, immersive et raffinée autour du produit.",
      image: "/images/parfum_rouge.webp"
    },
    {
      number: "03",
      navTitle: "VOTRE PROJET ?",
      title: "VOTRE\nPROJET ?",
      description:
        "Une approche sur mesure pour révéler votre singularité. Identité, direction artistique, expérience visuelle ou territoire de marque : chaque projet est pensé avec exigence, cohérence et impact.",
      image: "/images/telephone2.webp"
    }
  ];

  let sections = [];
  let contentRefs = [];
  let activeIndex = 0;
  let fills = slides.map(() => 0);
  let contentVisibleHeights = slides.map(() => 0);
  let ticking = false;
  let observer;
  let maskAnchorEl;
  let sliderEl;

  const THRESHOLD = 0.6;
  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));

  function updateProgress() {
    const vh = window.innerHeight;
    const next = slides.map(() => 0);
    const nextVisibleHeights = slides.map(() => 0);
    const fallbackRevealLine = vh * 0.8;
    const revealLine = maskAnchorEl?.getBoundingClientRect().top ?? fallbackRevealLine;

    sections.forEach((section, i) => {
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const progress = clamp((-rect.top) / (vh * THRESHOLD), 0, 1);

      next[i] = progress * 100;
    });

    contentRefs.forEach((content, i) => {
      if (!content) return;

      const rect = content.getBoundingClientRect();
      nextVisibleHeights[i] = clamp(revealLine - rect.top, 0, rect.height);
    });

    fills = next;
    contentVisibleHeights = nextVisibleHeights;
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateProgress);
    }
  }

  onMount(() => {
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeIndex = Number(entry.target.dataset.index);
          }
        });
      },
      { threshold: THRESHOLD }
    );

    sections.forEach((section) => {
      if (section) observer.observe(section);
    });
  });

  onDestroy(() => {
    if (!browser) return;
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    if (observer) observer.disconnect();
  });
</script>

<section class="slider" bind:this={sliderEl}>
  <div class="sticky">
    <div class="backgrounds">
      <div class="bottom-shade" aria-hidden="true"></div>

      <div class="progress-nav">
        {#each slides as slide, i}
          <div class="segment">
            <div class="segment-line">
              <div class="segment-fill" style="width:{fills[i]}%"></div>
            </div>

            <div class="segment-label">
              <span class="num">{slide.number}</span>
              <span class="segment-title">{slide.navTitle}</span>
            </div>
          </div>
        {/each}
      </div>

      <div class="mobile-progress" aria-hidden="true">
        <div class="segment-line mobile-progress-line">
          <div class="segment-fill" style="width:{fills[activeIndex]}%"></div>
        </div>

        {#key activeIndex}
          <div class="mobile-progress-meta">
            <span class="mobile-progress-num">{slides[activeIndex].number}</span>
            <span class="mobile-progress-title">{slides[activeIndex].navTitle}</span>
          </div>
        {/key}
      </div>

      {#each slides as slide, i}
        <div class="bg" class:active={activeIndex === i}>
          <img src={slide.image} alt="" />
        </div>
      {/each}
    </div>
  </div>

  <div class="slides">
    <div class="mask-anchor" bind:this={maskAnchorEl} aria-hidden="true"></div>

    {#each slides as slide, i}
      <section class="slide" bind:this={sections[i]} data-index={i}>
        <div class="content-clip" style={`height:${contentVisibleHeights[i]}px;`}>
          <div class="content" bind:this={contentRefs[i]}>
            <div class="number">{slide.number}</div>
            <h2>{slide.title}</h2>
            <p>{slide.description}</p>
          </div>
        </div>
      </section>
    {/each}

    <div class="tail" aria-hidden="true"></div>
  </div>
</section>

<style>
  .slider {
    position: relative;
    width: 100%;
    min-height: 360vh;
  }

  .sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    height: 100svh;
    overflow: hidden;
    background: #050b14;
    isolation: isolate;
    z-index: 0;
  }

  .sticky::before {
    content: "";
    position: absolute;
    inset: 0;
    background: #050b14;
    z-index: 0;
  }

  .backgrounds {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: #050b14;
  }

  .bottom-shade {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 32vh;
    height: 32svh;
    z-index: 3;
    pointer-events: none;
    background: linear-gradient(
      to top,
      rgba(5, 11, 20, 0.9) 0%,
      rgba(5, 11, 20, 0.72) 28%,
      rgba(5, 11, 20, 0.38) 58%,
      rgba(5, 11, 20, 0) 100%
    );
  }

  .bg {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 900ms ease;
    z-index: 1;
    background: #050b14;
  }

  .bg.active {
    opacity: 1;
    z-index: 2;
  }

  .bg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    inset: 0;
    display: block;
  }

  .slides {
    position: relative;
    z-index: 3;
  }

  .mask-anchor {
    position: sticky;
    top: 80vh;
    top: 80svh;
    height: 0;
    pointer-events: none;
  }

  .slide {
    min-height: 100vh;
    display: flex;
    align-items: center;
    padding: 8rem 4rem;
    position: relative;
  }

  .tail {
    height: 60vh;
  }

  .content-clip {
    max-width: 70%;
    overflow: hidden;
    position: relative;
    z-index: 5;
  }

  .content {
    position: relative;
    z-index: 5;
  }

  .number {
    opacity: 0.7;
    margin-bottom: 1rem;
    font-size: 1.2rem;
    position: relative;
    z-index: 5;
    font-family: "Titre italic", serif;
    font-style: italic;
  }

  h2 {
    font-family: "Titre italic", serif;
    font-style: italic;
    font-size: clamp(4rem, 7vw, 8rem);
    line-height: 0.95;
    font-weight: 100;
    white-space: pre-line;
    margin: 0;
    color: #f5f1e8;
    letter-spacing: 0em;
    position: relative;
    z-index: 5;
  }

  p {
    margin-top: 2rem;
    font-size: 1.2rem;
    max-width: 520px;
    opacity: 0.9;
    position: relative;
    z-index: 5;
    color: rgba(244, 244, 244, 0.86);
  }

  .progress-nav {
    position: absolute;
    left: 2rem;
    right: 2rem;
    bottom: 2rem;
    z-index: 4;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.7rem;
  }

  .segment-line {
    position: relative;
    height: 2px;
    background: rgba(255, 255, 255, 0.16);
    overflow: hidden;
    margin-bottom: 0.7rem;
  }

  .segment-fill {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 0%;
    background: white;
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.2);
    transition: width 80ms linear;
  }

  .segment-label {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    font-size: 0.9rem;
    opacity: 0.85;
    line-height: 1.05;
    min-width: 0;
  }

  .segment-label .num {
    flex: 0 0 auto;
    opacity: 0.72;
    font-family: "Titre italic", serif;
    font-style: italic;
  }

  .segment-title {
    display: block;
    min-width: 0;
    font-family: "General Sans", sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: clamp(0.62rem, 0.82vw, 0.78rem);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    max-width: none;
    white-space: nowrap;
  }

  .mobile-progress {
    display: none;
    position: absolute;
    left: 1.25rem;
    right: 1.25rem;
    bottom: 1rem;
    z-index: 4;
  }

  .mobile-progress-line {
    margin-bottom: 0.55rem;
  }

  .mobile-progress-meta {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    animation: mobileWipeFlipUp 0.48s cubic-bezier(0.22, 1, 0.36, 1);
    transform-origin: center bottom;
  }

  .mobile-progress-num {
    flex: 0 0 auto;
    opacity: 0.72;
    font-size: 0.92rem;
    font-family: "Titre italic", serif;
    font-style: italic;
  }

  .mobile-progress-title {
    min-width: 0;
    font-family: "General Sans", sans-serif;
    font-size: 0.72rem;
    font-weight: 400;
    letter-spacing: 0.04em;
    line-height: 1.1;
    text-transform: uppercase;
  }

  @keyframes mobileWipeFlipUp {
    0% {
      opacity: 0;
      transform: translate3d(0, 14px, 0) rotateX(-68deg);
      clip-path: inset(100% 0 0 0);
    }
    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0) rotateX(0deg);
      clip-path: inset(0 0 0 0);
    }
  }

  @media (max-width: 900px) {
    .slider {
      min-height: 360vh;
    }

    .slide {
      min-height: 100svh;
      padding: 7rem 2rem 11rem;
      align-items: center;
    }

    .content-clip {
      max-width: 100%;
    }

    .progress-nav {
      grid-template-columns: repeat(3, 1fr);
      left: 1.25rem;
      right: 1.25rem;
      bottom: 1.5rem;
      gap: 0.85rem;
    }

    h2 {
      font-size: clamp(3rem, 15vw, 5rem);
    }

    p {
      font-size: 1rem;
    }

    .segment-title {
      font-size: 0.66rem;
    }
  }

  @media (max-width: 700px) {
    .slider {
      min-height: 390vh;
    }

    .bottom-shade {
      height: 38vh;
      height: 38svh;
    }

    .slide {
      padding: 6.5rem 1.25rem 10rem;
      min-height: 100svh;
      align-items: center;
    }

    .progress-nav {
      display: none;
    }

    .mobile-progress {
      display: block;
    }

    h2 {
      font-size: clamp(2.7rem, 13vw, 4.2rem);
    }

    p {
      margin-top: 1.25rem;
      font-size: 0.96rem;
      max-width: 100%;
    }
  }
</style>
