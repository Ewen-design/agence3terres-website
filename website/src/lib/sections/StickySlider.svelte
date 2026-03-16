<script>
  import { onMount } from "svelte";

  const slides = [
    {
      number: "01",
      title: "AI Strategy\n& Execution",
      description:
        "We design AI systems, products, and execution frameworks that move from vision to real-world adoption with elegance and precision.",
      image: "images/photo.webp",
      eyebrow: "Data so accurate",
      accent: "it’s personal",
      stats: [
        { value: "99%", label: "Strategic Clarity", note: "vision aligned across teams" },
        { value: "96%", label: "Execution Accuracy", note: "from plan to delivery" },
        { value: "91%", label: "Operational Readiness", note: "systems designed to scale" },
        { value: "84%", label: "Adoption Potential", note: "built for real use" }
      ]
    },
    {
      number: "02",
      title: "Product\nInnovation",
      description:
        "We craft digital products and flagship experiences with a balance of utility, clarity, and emotional impact for ambitious brands.",
      image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2000&q=80",
      eyebrow: "Innovation with intent",
      accent: "built to matter",
      stats: [
        { value: "98%", label: "Experience Precision", note: "designed around real behavior" },
        { value: "94%", label: "Innovation Impact", note: "new ideas with clear value" },
        { value: "89%", label: "Interface Quality", note: "refined across every layer" },
        { value: "81%", label: "Launch Confidence", note: "ready for flagship release" }
      ]
    },
    {
      number: "03",
      title: "Brand\nExperiences",
      description:
        "From identity to immersive storytelling, we create brand worlds that feel elevated, coherent, and deeply memorable.",
      image: "images/photo.webp",
      eyebrow: "Presence with meaning",
      accent: "designed to stay",
      stats: [
        { value: "97%", label: "Brand Consistency", note: "across every touchpoint" },
        { value: "93%", label: "Creative Distinction", note: "crafted to stand apart" },
        { value: "88%", label: "Narrative Strength", note: "clear emotional resonance" },
        { value: "79%", label: "Cultural Recall", note: "made to be remembered" }
      ]
    }
  ];

  let sections = [];
  let activeIndex = 0;

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeIndex = Number(entry.target.dataset.index);
          }
        });
      },
      { threshold: 0.6 }
    );

    sections.forEach((section) => section && observer.observe(section));

    return () => observer.disconnect();
  });
</script>

<section class="slider">
  <div class="sticky">
    <div class="backgrounds">
      {#each slides as slide, i}
        <div class="bg" class:active={activeIndex === i}>
          <img src={slide.image} alt="" />
          <div class="overlay"></div>
          <div class="vignette"></div>
        </div>
      {/each}
    </div>

    <!-- couche fixe inspirée du visuel -->
    <div class="fixed-ui">
       <div class="bottom-left">
        <div class="fixed-number">{slides[activeIndex].number}</div>
        <p>{slides[activeIndex].description}</p>
      </div>

      <div class="stats-panel" aria-hidden="true">
        {#each slides[activeIndex].stats as stat, j}
          <div
            class="stat-card"
            style="transition-delay: {j * 60}ms"
          >
            <div class="stat-value">{stat.value}</div>
            <div class="stat-label">{stat.label}</div>
            <div class="stat-note">{stat.note}</div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <div class="slides">
    {#each slides as slide, i}
      <section class="slide" bind:this={sections[i]} data-index={i}>
        <div class="content">
          <h2>{slide.title}</h2>
        </div>
      </section>
    {/each}
  </div>
</section>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Aboreto&family=Cormorant+Garamond:ital,wght@1,400&display=swap");

  :global(body) {
    margin: 0;
    background: #050b14;
    color: white;
    font-family: Inter, sans-serif;
  }

  :global(*) {
    box-sizing: border-box;
  }

  .slider {
    position: relative;
    width: 100%;
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
    transform: scale(1.02);
  }

  .overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(
        to right,
        rgba(0, 0, 0, 0.84) 0%,
        rgba(0, 0, 0, 0.56) 28%,
        rgba(0, 0, 0, 0.18) 58%,
        rgba(0, 0, 0, 0.42) 100%
      );
  }

  .vignette {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.14) 100%);
    pointer-events: none;
  }

  .fixed-ui {
    position: absolute;
    inset: 0;
    z-index: 4;
    pointer-events: none;
  }

  .bottom-left {
    position: absolute;
    left: clamp(1.25rem, 3vw, 2.4rem);
    bottom: clamp(1.25rem, 3vw, 2.4rem);
    width: min(34rem, calc(100vw - 7rem));
    transition: opacity 400ms ease;
  }

  .fixed-number {
    margin-bottom: 0.7rem;
    font-size: 0.8rem;
    letter-spacing: 0.16em;
    opacity: 0.62;
  }

  .bottom-left p {
    margin: 0;
    font-size: clamp(0.95rem, 1.1vw, 1.12rem);
    line-height: 1.45;
    color: rgba(255, 255, 255, 0.88);
    max-width: 31rem;
  }

  .stats-panel {
    position: absolute;
    top: clamp(2rem, 4vw, 2.5rem);
    right: clamp(1rem, 2.4vw, 2rem);
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    width: min(12.5rem, 24vw);
  }

  .stat-card {
    position: relative;
    padding: 1rem 1rem 0.95rem;
    border-radius: 2px;
    background: rgba(196, 180, 162, 0.22);
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow:
      0 10px 24px rgba(0, 0, 0, 0.14),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
    transition:
      transform 550ms cubic-bezier(.22,.61,.36,1),
      opacity 550ms ease,
      background 550ms ease;
  }

  .bg.active ~ .fixed-ui .stat-card {
    transform: translateX(0);
    opacity: 1;
  }

  .stat-value {
    font-size: clamp(2rem, 3vw, 2.7rem);
    line-height: 0.9;
    font-weight: 300;
    letter-spacing: -0.04em;
    color: rgba(255, 255, 255, 0.95);
  }

  .stat-label {
    margin-top: 0.8rem;
    font-size: 0.72rem;
    line-height: 1.2;
    color: rgba(255, 255, 255, 0.78);
  }

  .stat-note {
    margin-top: 0.2rem;
    font-size: 0.64rem;
    line-height: 1.2;
    color: rgba(255, 255, 255, 0.52);
  }

  .slides {
    position: relative;
    z-index: 3;
  }

  .slide {
    min-height: 100vh;
    min-height: 100svh;
    display: flex;
    align-items: center;
    padding: clamp(4rem, 7vw, 8rem) clamp(1.25rem, 5vw, 4.5rem);
    position: relative;
  }

  .content {
    position: relative;
    z-index: 5;
    width: min(100%, 760px);
    padding-top: clamp(5rem, 8vw, 7rem);
  }

  h2 {
    font-family: "Aboreto", serif;
    font-size: clamp(3.5rem, 6vw, 8rem);
    line-height: 0.92;
    white-space: pre-line;
    margin: 0;
    color: white;
    letter-spacing: 0.02em;
    position: relative;
    z-index: 5;
    max-width: 10ch;
    text-wrap: balance;
    text-shadow: 0 10px 40px rgba(0, 0, 0, 0.22);
  }

  @media (min-width: 1440px) {
    .content {
      width: min(100%, 820px);
    }
  }

  @media (max-width: 1024px) {
    .slide {
      padding: 5rem 2.25rem;
    }

    .content {
      width: min(100%, 680px);
      padding-top: 6rem;
    }

    h2 {
      font-size: clamp(3rem, 8vw, 5.5rem);
      max-width: 11ch;
    }

    .stats-panel {
      width: 11rem;
      gap: 0.7rem;
    }

    .stat-card {
      padding: 0.85rem 0.85rem 0.8rem;
    }

    .stat-value {
      font-size: 2.1rem;
    }
  }

  @media (max-width: 800px) {
    .overlay {
      background:
        linear-gradient(
          to top,
          rgba(0, 0, 0, 0.8) 0%,
          rgba(0, 0, 0, 0.56) 28%,
          rgba(0, 0, 0, 0.24) 56%,
          rgba(0, 0, 0, 0.44) 100%
        );
    }

    .slide {
      align-items: flex-end;
      padding: 0 1.25rem 7.6rem;
    }

    .content {
      width: 100%;
      max-width: 100%;
      padding-top: 0;
    }

    h2 {
      font-size: clamp(2.3rem, 12vw, 4.2rem);
      line-height: 0.94;
      max-width: 100%;
      margin-bottom: 7rem;
    }

    .bottom-left {
      left: 1rem;
      right: 1rem;
      bottom: 1rem;
      width: auto;
    }

    .bottom-left p {
      max-width: 22rem;
      font-size: 0.94rem;
      line-height: 1.42;
    }

    .stats-panel {
      top: auto;
      bottom: 1rem;
      right: 1rem;
      width: 7.1rem;
      gap: 0.45rem;
    }

    .stat-card {
      padding: 0.55rem 0.55rem 0.5rem;
      min-height: 4.6rem;
      background: rgba(196, 180, 162, 0.18);
    }

    .stat-value {
      font-size: 1.35rem;
    }

    .stat-label {
      margin-top: 0.35rem;
      font-size: 0.56rem;
    }

    .stat-note {
      display: none;
    }
  }

  @media (max-width: 480px) {
    .slide {
      padding: 0 1rem 7rem;
    }

    h2 {
      font-size: clamp(2rem, 13vw, 3.2rem);
      line-height: 0.96;
      letter-spacing: 0.01em;
      margin-bottom: 6.8rem;
    }


    .bottom-left p {
      font-size: 0.88rem;
      max-width: 16rem;
      color: rgba(255, 255, 255, 0.84);
    }

    .stats-panel {
      width: 6rem;
      gap: 0.35rem;
    }

    .stat-card {
      padding: 0.5rem 0.45rem;
      min-height: 4rem;
    }

    .stat-value {
      font-size: 1.15rem;
    }

    .stat-label {
      font-size: 0.52rem;
      line-height: 1.15;
    }
  }
</style>