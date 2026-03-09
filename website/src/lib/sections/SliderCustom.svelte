<script>
  import { tick } from "svelte";
  import { onMount } from "svelte";

  let index = 0;
  let animating = false;
  let slider;
  let transitionLayer;
  let section;

  let layerImage = null;
  let layerStyle = "";

  let overlayOpacity = 0;
  let introOpacity = 0;
  let introBlur = 18;
  let introY = 60;

  const images = [
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2070",
    "https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=2070",
    "images/photo.webp",
  ];

  $: nextIndex = (index + 1) % images.length;
  $: prevIndex = (index - 1 + images.length) % images.length;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(v, max));
  }

  function mapProgress(value, start, end) {
    return clamp((value - start) / (end - start), 0, 1);
  }

  function updateScroll() {
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const maxScroll = Math.max(section.offsetHeight - window.innerHeight, 1);
    const progress = clamp(-rect.top / maxScroll, 0, 1);

    // assombrissement plus rapide, presque total mais pas complet
    const darkProgress = mapProgress(progress, 0.03, 0.36);
    overlayOpacity = darkProgress * 0.9;

    // intro
    const introProgress = mapProgress(progress, 0.26, 0.5);
    introOpacity = introProgress;
    introBlur = (1 - introProgress) * 18;
    introY = (1 - introProgress) * 60;
  }

  onMount(() => {
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll);

    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  });

  function handleClick(e) {
    if (animating) return;

    const zone = e.target.closest("[data-cursor]");
    if (!zone) return;

    const direction = zone.dataset.cursor;
    const targetIndex = direction === "prev" ? prevIndex : nextIndex;

    const rect = slider.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    animating = true;
    layerImage = images[targetIndex];

    layerStyle = `
      left:${x - 70}px;
      top:${y - 70}px;
      width:140px;
      height:140px;
      border-radius:3px;
    `;

    tick().then(() => {
      transitionLayer.getBoundingClientRect();

      layerStyle = `
        left:0;
        top:0;
        width:100%;
        height:100%;
        border-radius:0;
        transition: all 0.85s cubic-bezier(.22,1,.36,1);
      `;

      transitionLayer.addEventListener(
        "transitionend",
        () => {
          index = targetIndex;
          window.dispatchEvent(new Event("slider-index-changed"));
          layerImage = null;
          animating = false;
        },
        { once: true }
      );
    });
  }
</script>

<section class="services-section" bind:this={section}>
  <div class="sticky-bg">
    <div class="slider" bind:this={slider} on:click={handleClick}>
      <div
        class="zone left"
        data-cursor="prev"
        data-image={images[prevIndex]}
      ></div>

      <div
        class="zone right"
        data-cursor="next"
        data-image={images[nextIndex]}
      ></div>

      <img src={images[index]} alt="" draggable="false" />

      {#if layerImage}
        <div
          class="transition-layer"
          bind:this={transitionLayer}
          style={layerStyle}
        >
          <img src={layerImage} alt="" draggable="false" />
        </div>
      {/if}

      <div
        class="dark-overlay"
        style={`opacity:${overlayOpacity};`}
      ></div>
    </div>
  </div>

  <div class="hero-title">
    <h1>Services</h1>
  </div>

  <div class="intro-wrap">
    <p
      style={`opacity:${introOpacity}; filter:blur(${introBlur}px); transform:translate3d(0, ${introY}px, 0);`}
    >
      We help brands launch next-generation digital experiences with end-to-end capabilities.
    </p>

    <div
      class="arrow"
      style={`opacity:${introOpacity}; transform:translate3d(0, ${introY}px, 0);`}
    >
      ↓
    </div>
  </div>
</section>

<style>
  .services-section {
    position: relative;
    min-height: 170vh;
    width: 100%;
    background: #000;
  }

  .sticky-bg {
    position: sticky;
    top: 0;
    width: 100%;
    height: 100vh;
    z-index: 1;
    overflow: hidden;
  }

  .hero-title {
    position: relative;
    z-index: 10;
    margin-top: -16rem;
    padding: 0 0 0 2.5rem;
    pointer-events: none;
  }

  .hero-title h1 {
    margin: 0;
    font-family: Aboreto, sans-serif;
    font-size:clamp(4rem,4vw,8rem);
    font-weight: 700;
    line-height: 0.9;
    color: white;
    letter-spacing: -0.07em;
  }

  .intro-wrap {
    position: relative;
    z-index: 10;
    min-height: 78vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
    padding: 0 0 4rem 2.5rem;
    box-sizing: border-box;
    pointer-events: none;
  }

  

  .intro-wrap p {
    max-width: 1100px;
    margin: 0;
  font-size:1.2rem;
    max-width:480px;
    color:#9b9b9b;
    line-height: 1.04;
    font-weight: 500;
    will-change: transform, filter, opacity;
  }

  .arrow {
    margin-top: 2rem;
    font-size: 2rem;
    color: white;
    will-change: transform, opacity;
  }

  .slider {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .slider img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
    user-select: none;
  }

  .zone {
    position: absolute;
    top: 0;
    width: 50%;
    height: 100%;
    z-index: 5;
  }

  .zone.left {
    left: 0;
  }

  .zone.right {
    right: 0;
  }

  .transition-layer {
    position: absolute;
    z-index: 6;
    overflow: hidden;
  }

  .transition-layer img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .dark-overlay {
    position: absolute;
    inset: 0;
    background: #000;
    z-index: 8;
    pointer-events: none;
  }

  @media (max-width: 768px) {
    .services-section {
      min-height: 160vh;
    }

    .hero-title {
      margin-top: -8rem;
      padding: 0 0 0 1rem;
    }

    .hero-title h1 {
      font-size: clamp(4rem, 23vw, 7rem);
    }

    .intro-wrap {
      min-height: 68vh;
      padding: 0 1rem 2.5rem 1rem;
    }

    .intro-wrap p {
      max-width: 100%;
      font-size: clamp(1.4rem, 8vw, 2.6rem);
      line-height: 1.08;
    }

    .arrow {
      margin-top: 1.25rem;
      font-size: 1.5rem;
    }
  }
</style>