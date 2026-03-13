<script>
  import { onMount } from "svelte";

  let section;
  let progress = 0;
  let scrollRaf = null;

  const clamp = (v, min, max) => Math.max(min, Math.min(v, max));

  function updateProgress() {
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const maxScroll = section.offsetHeight - viewportH;

    const scrolled = clamp(-rect.top, 0, maxScroll);
    progress = maxScroll > 0 ? clamp(scrolled / maxScroll, 0, 1) : 0;
  }

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function smoothScrollToSlider() {
    const target = document.querySelector("section.slider");
    if (!target) return;

    if (scrollRaf) cancelAnimationFrame(scrollRaf);

    const startY = window.scrollY;
    const targetY = target.getBoundingClientRect().top + window.scrollY;
    const distance = targetY - startY;
    const duration = 1800;
    const startTime = performance.now();

    function animate(now) {
      const elapsed = now - startTime;
      const t = clamp(elapsed / duration, 0, 1);
      const eased = easeInOutCubic(t);

      window.scrollTo(0, startY + distance * eased);

      if (t < 1) {
        scrollRaf = requestAnimationFrame(animate);
      } else {
        scrollRaf = null;
      }
    }

    scrollRaf = requestAnimationFrame(animate);
  }

  onMount(() => {
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
    };
  });

  $: leftWidth = 40 - 40 * progress;
  $: imageWidth = 60 + 40 * progress;

  $: textFade = clamp(1 - progress * 8, 0, 1);
  $: textBlur = progress * 16;

  $: imageScale = 1 + progress * 0.04;
</script>

<section class="scroll-section" bind:this={section}>
  <div class="sticky-scene">
    <div class="left-panel" style={`width:${leftWidth}%;`}></div>

    <div class="image-panel" style={`width:${imageWidth}%;`}>
      <img
        src="images/parfum4.webp"
        alt="Beauty portrait"
        style={`transform: scale(${imageScale});`}
      />
    </div>

    <div
      class="text-overlay"
      style={`opacity:${textFade}; filter: blur(${textBlur}px);`}
    >
      <div class="eyebrow-wrap">
        <span class="eyebrow-line"></span>
        <span class="eyebrow">Premium experiences</span>
      </div>

      <h1>Services</h1>

      <p>
        Chez 3 Terres, nous sommes passionnés par la création d'expériences de marque uniques et mémorables. 
        Nous sommes expert en design et stratégie pour donner vie à votre vision et créer des expériences qui résonnent avec votre audience.
      </p>

      <div class="actions">
        <button class="discover-btn" on:click={smoothScrollToSlider}>
          Découvrir
        </button>
      </div>

      <div class="side-mark">
        <span></span>
        <small>Scroll</small>
      </div>
    </div>
  </div>
</section>

<style>
  .scroll-section {
    position: relative;
    height: 240vh;
    background: #111;
  }

  .sticky-scene {
    position: sticky;
    top: 0;
    height: 100vh;
    display: flex;
    overflow: hidden;
    background: #111;
  }

  .left-panel {
    height: 100%;
    flex: 0 0 auto;
    background: #111;
    will-change: width;
    z-index: 1;
  }

  .image-panel {
    position: relative;
    height: 100%;
    flex: 0 0 auto;
    overflow: hidden;
    will-change: width;
    z-index: 1;
  }

  .image-panel img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform-origin: center center;
    will-change: transform;
  }

  .text-overlay {
    position: absolute;
    inset: 0;
    z-index: 3;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding-left: 4.5vw;
    padding-right: 4vw;
    max-width: 52rem;
    will-change: opacity, filter;
  }

  .text-overlay > * {
    pointer-events: auto;
  }

  .eyebrow-wrap {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    margin-bottom: 1.2rem;
  }

  .eyebrow-line {
    width: 52px;
    height: 1px;
    background: rgba(255, 255, 255, 0.3);
    display: block;
  }

  .eyebrow {
    font-size: 0.85rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
  }

  h1 {
    margin: 0 0 2rem 0;
    font-family: "Aboreto", serif;
    font-size: clamp(4rem, 8vw, 6rem);
    line-height: 0.95;
    font-weight: 400;
    letter-spacing: 0;
    color: #fff;
    white-space: nowrap;
  }

  p {
    margin: 0;
    max-width: 28rem;
    font-size: clamp(1rem, 1.1vw, 1.2rem);
    line-height: 1.65;
    color: rgba(255, 255, 255, 0.5);
  }

  .actions {
    margin-top: 2rem;
  }

  .discover-btn {
    appearance: none;
    border: 0.5px solid #fff;
    background: #111;
    color: #fff;
    font-size: 0.80rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.95rem 1.4rem;
    border-radius: 3px;
    cursor: pointer;
    transition:
      background 0.3s ease,
      border-color 0.3s ease,
      transform 0.3s ease;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .discover-btn:hover {
    background: #fff;
    border-color: #fff;
     color: #111;
    transform: translateY(-1px);
  }

  .side-mark {
    position: absolute;
    left: 2rem;
    bottom: 2.2rem;
    display: flex;
    align-items: center;
    gap: 0.7rem;
    transform: rotate(-90deg);
    transform-origin: left bottom;
    opacity: 0.75;
  }

  .side-mark span {
    width: 40px;
    height: 1px;
    background: rgba(255, 255, 255, 0.35);
    display: block;
  }

  .side-mark small {
    font-size: 0.72rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.55);
  }

  @media (max-width: 900px) {
    .scroll-section {
      height: 210vh;
    }

    .text-overlay {
      justify-content: flex-end;
      padding: 0 1.5rem 4rem 1.5rem;
      max-width: 100%;
    }

    .eyebrow-wrap {
      margin-bottom: 0.9rem;
    }

    .eyebrow-line {
      width: 34px;
    }

    .eyebrow {
      font-size: 0.68rem;
      letter-spacing: 0.18em;
    }

    h1 {
      white-space: normal;
      font-size: clamp(2.8rem, 12vw, 4.8rem);
      margin-bottom: 1rem;
    }

    p {
      max-width: 18rem;
      font-size: 0.95rem;
      line-height: 1.6;
    }

    .actions {
      margin-top: 1.4rem;
    }

    .discover-btn {
      font-size: 0.82rem;
      padding: 0.85rem 1.15rem;
    }

    .side-mark {
      display: none;
    }
  }
</style>