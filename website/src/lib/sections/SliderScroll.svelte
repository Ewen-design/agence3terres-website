<script>
  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";
  import { sectionIsNearViewport } from "../scrollEngine.js";

  let section;

  const slides = [
    {
      number: "01",
      label: "Inspiration",
      title: "Pure – The First Impression.",
      text:
        "A refined opening shaped by contrast, clarity, and motion. Light introduces the form before the details fully emerge.",
      image:
        "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?q=80&w=2000&auto=format&fit=crop"
    },
    {
      number: "02",
      label: "Solid",
      title: "Solid – The Sculpted Surface.",
      text:
        "Structure becomes presence. Materials feel dense, precise, and architectural, with a calm sense of control.",
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=2000&auto=format&fit=crop"
    },
    {
      number: "03",
      label: "Soft",
      title: "Soft – The Embracing Interior.",
      text:
        "As energy softens, it becomes welcoming. Inside, materials flow with warmth and tactility — from gentle curves to harmonious textures.",
      image:
        "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=2000&auto=format&fit=crop"
    },
    {
      number: "04",
      label: "Particles",
      title: "Particles – The Final Atmosphere.",
      text:
        "The experience dissolves into subtle light, suspended details, and a quiet cinematic finish designed to linger.",
      image:
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2000&auto=format&fit=crop"
    }
  ];

  const clamp = (v, min, max) => Math.max(min, Math.min(v, max));

  let progress = 0;

  function updateSlider() {
    const rect = section.getBoundingClientRect();

if (!sectionIsNearViewport(rect)) return;
    if (!section) return;
    const total = section.offsetHeight - window.innerHeight;

    if (total <= 0) {
      progress = 0;
      return;
    }

    progress = clamp(-rect.top / total, 0, 1);
  }

  function onEngineUpdate() {
    updateSlider();
  }

  function activeIndex() {
    return Math.min(slides.length - 1, Math.floor(progress * slides.length));
  }

  function segmentFill(index) {
    const segmented = progress * slides.length;

    if (segmented <= index) return 0;
    if (segmented >= index + 1) return 100;

    return (segmented - index) * 100;
  }

  function handleResize() {
    updateSlider();
  }

  onMount(() => {
    updateSlider();
    registerParallax(onEngineUpdate);
    window.addEventListener("resize", handleResize);

    requestAnimationFrame(() => {
      updateSlider();
    });
  });

  onDestroy(() => {
    unregisterParallax(onEngineUpdate);
    window.removeEventListener("resize", handleResize);
  });
</script>

<section class="slider-section" bind:this={section}>
  <div class="slider-sticky">
  <div class="debug">{Math.round(progress * 100)}%</div>
    <div class="media-layer">
      {#each slides as slide, i}
        <div
          class="media"
          class:active={i === activeIndex()}
          style="
            background-image:
              linear-gradient(90deg, rgba(5,8,16,0.78) 0%, rgba(8,10,18,0.42) 35%, rgba(24,28,56,0.10) 100%),
              radial-gradient(circle at 72% 18%, rgba(255,255,255,0.18), transparent 28%),
              url('{slide.image}');
          "
        ></div>
      {/each}

      <div class="grain"></div>
      <div class="vignette"></div>
    </div>

    <div class="content">
      <div class="text-stack">
        {#each slides as slide, i}
          <div class="text-panel" class:text-active={i === activeIndex()}>
            <h2>{slide.title}</h2>
            <p>{slide.text}</p>
          </div>
        {/each}
      </div>
    </div>

    <div class="bottom-nav">
      {#each slides as slide, i}
        <div class="segment">
          <div class="segment-line">
            <div class="segment-fill" style="width: {segmentFill(i)}%"></div>
          </div>

          <div class="segment-label">
            <span class="num">{slide.number}</span>
            <span>{slide.label}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .slider-section {
    position: relative;
    height: 700vh;
    background: #06070b;
  }

  .slider-sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
    background: #06070b;
    color: white;
  }

  .media-layer {
    position: absolute;
    inset: 0;
  }

  .media {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    opacity: 0;
    transform: scale(1.035);
    transition: opacity 0.8s ease, transform 1s ease;
    will-change: opacity, transform;
  }

  .media.active {
    opacity: 1;
    transform: scale(1);
  }

  .grain {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.06;
    background-image:
      radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0 1px, transparent 1px),
      radial-gradient(circle at 80% 60%, rgba(255,255,255,0.06) 0 1px, transparent 1px),
      radial-gradient(circle at 50% 80%, rgba(255,255,255,0.04) 0 1px, transparent 1px);
    background-size: 180px 180px, 220px 220px, 260px 260px;
    mix-blend-mode: soft-light;
  }

  .vignette {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.28) 100%),
      linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 12%, transparent 88%, rgba(255,255,255,0.025) 100%);
  }

  .content {
    position: relative;
    z-index: 3;
    height: 100%;
    display: flex;
    align-items: flex-end;
    padding: 0 2.25rem 8.8rem;
    box-sizing: border-box;
  }

  .text-stack {
    position: relative;
    width: min(760px, 70vw);
    min-height: 260px;
  }

  .text-panel {
    position: absolute;
    inset: 0;
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.45s ease, transform 0.6s ease;
    pointer-events: none;
  }

  .text-panel.text-active {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  h2 {
    margin: 0 0 1.4rem 0;
    font-family: Aboreto, sans-serif;
    font-size: clamp(2.7rem, 5vw, 5rem);
    font-weight: 250;
    line-height: 1.08;
    letter-spacing: -0.04em;
    max-width: 10ch;
    color: rgba(255,255,255,0.96);
  }

  p {
    margin: 0;
    max-width: 36rem;
    font-family: Inter, Arial, sans-serif;
    font-size: clamp(1rem, 1.15vw, 1.2rem);
    line-height: 1.7;
    color: #9b9b9b;
  }

  .bottom-nav {
    position: absolute;
    left: 2.25rem;
    right: 2.25rem;
    bottom: 2rem;
    z-index: 4;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.8rem;
  }

  .segment {
    min-width: 0;
  }

  .segment-line {
    position: relative;
    height: 2px;
    background: rgba(255,255,255,0.16);
    overflow: hidden;
    margin-bottom: 0.8rem;
  }

  .segment-fill {
    position: absolute;
    inset: 0 auto 0 0;
    background: rgba(255,255,255,0.96);
    box-shadow: 0 0 12px rgba(255,255,255,0.2);
  }

  .segment-label {
    display: flex;
    gap: 0.35rem;
    align-items: center;
    font-family: Inter, Arial, sans-serif;
    font-size: 0.95rem;
    color: rgba(255,255,255,0.86);
    white-space: nowrap;
  }

  .num {
    opacity: 0.8;
  }

  @media (max-width: 900px) {
    .content {
      padding: 0 1rem 9.5rem;
    }

    .text-stack {
      width: 100%;
      min-height: 280px;
    }

    h2 {
      font-size: clamp(2.2rem, 9vw, 3.6rem);
      max-width: 12ch;
    }

    p {
      max-width: 100%;
      font-size: 1rem;
      line-height: 1.6;
    }

    .bottom-nav {
      left: 1rem;
      right: 1rem;
      bottom: 1.15rem;
      gap: 0.55rem;
    }

    .segment-label {
      font-size: 0.78rem;
    }
  }

  .debug {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 20;
  color: white;
  font: 14px/1 Inter, sans-serif;
}
</style>