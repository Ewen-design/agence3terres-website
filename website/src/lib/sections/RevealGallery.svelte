<script>
  import { onMount, onDestroy } from "svelte";

  const HERO_SRC =
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80";

  const LEFT_IMGS = [
    "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=80",
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&q=80",
    "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800&q=80"
  ];

  const CENTER_IMGS = [
    "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=80",
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80",
    "https://images.unsplash.com/photo-1477322524744-0eece9e79640?w=800&q=80"
  ];

  const RIGHT_IMGS = [
    "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&q=80",
    "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800&q=80",
    "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80"
  ];

  let sectionEl;
  let placeholderEl;

  const SHRINK_PX = 1760;

  let p1 = 0;

  let targetWidth = 0;
  let targetHeight = 0;
  let targetLeft = 0;
  let targetTop = 0;
  let galleryPadTop = 0;
  let centerOffset = -90;

  const clamp = (v, min, max) => Math.max(min, Math.min(v, max));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function computeLayout() {
    if (!placeholderEl) return;

    const isMobile = window.innerWidth <= 900;

    // desktop = décalage fort
    // mobile = décalage plus léger mais visible
    centerOffset = isMobile ? -52 : -90;

    const rect = placeholderEl.getBoundingClientRect();

    targetWidth = rect.width;
    targetHeight = rect.height;
    targetLeft = rect.left;

    targetTop = (window.innerHeight - targetHeight) * 0.5;
    galleryPadTop = targetTop - centerOffset;
  }

  function onScroll() {
    if (!sectionEl) return;

    const sectionTop = sectionEl.getBoundingClientRect().top + window.scrollY;
    const localScroll = window.scrollY - sectionTop;

    p1 = clamp(localScroll / SHRINK_PX, 0, 1);
  }

  function handleResize() {
    computeLayout();
    onScroll();
  }

  $: ep1 = ease(p1);

  // Hero : plein écran -> carte du haut au centre
  $: heroLeft = lerp(0, targetLeft, ep1);
  $: heroTop = lerp(0, targetTop, ep1);
  $: heroWidth = lerp(window.innerWidth, targetWidth, ep1);
  $: heroHeight = lerp(window.innerHeight, targetHeight, ep1);
  $: heroRadius = lerp(0, 4, ep1);
  $: heroScale = lerp(1, 1.02, ep1);

  // apparition de la galerie
  $: galleryOpacity = lerp(0, 1, clamp(p1 * 1.6, 0, 1));
  $: galleryLift = lerp(70, 0, ep1);

  // diagonales latérales
  $: sideX = lerp(1170, 0, ep1);
  $: sideY = lerp(1240, 0, ep1);

  // centre (hors image 1)
  $: centerY = lerp(90, 0, ep1);

  // handoff ultra doux, sans démontage brutal
  $: handoffStart = 0.99999;
  $: handoffProgress = clamp((p1 - handoffStart) / (1 - handoffStart), 0, 1);

  $: heroOpacity = 1 - handoffProgress;
  $: placeholderOpacity = handoffProgress;

  onMount(() => {
    requestAnimationFrame(() => {
      computeLayout();
      onScroll();
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", handleResize);
    };
  });

  onDestroy(() => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", handleResize);
  });
</script>

<div
  class="sg-root"
  bind:this={sectionEl}
  style={`--gallery-pad-top:${galleryPadTop}px; --center-offset:${centerOffset}px;`}
>
  <!-- Phase 1 + 2 : image 1 sticky -->
  <div class="sg-hero-spacer" style={`height:${SHRINK_PX}px;`}>
    <div class="sg-sticky-stage">
      <div
        class="sg-hero-box"
        style={`
          left:${heroLeft}px;
          top:${heroTop}px;
          width:${heroWidth}px;
          height:${heroHeight}px;
          border-radius:${heroRadius}px;
          opacity:${heroOpacity};
        `}
      >
        <img
          class="sg-hero-img"
          src={HERO_SRC}
          alt="Hero"
          style={`transform:scale(${heroScale});`}
        />
      </div>
    </div>
  </div>

  <!-- Phase 2 + 3 : galerie -->
  <div
    class="sg-gallery"
    style={`
      opacity:${galleryOpacity};
      transform:translateY(${galleryLift}px);
    `}
  >
    <div class="sg-grid">
      <!-- Gauche -->
      <div
        class="sg-col sg-col--left"
        style={`transform:translate3d(${-sideX}px, ${sideY}px, 0);`}
      >
        {#each LEFT_IMGS as src, i}
          <div class="sg-cell">
            <img {src} alt={`left ${i}`} loading="lazy" />
          </div>
        {/each}
      </div>

      <!-- Centre -->
      <div class="sg-col sg-col--center">
        <!-- image 1 finale -->
        <div class="sg-cell sg-hero-slot" bind:this={placeholderEl}>
          <img
            src={HERO_SRC}
            alt="hero final"
            loading="lazy"
            style={`opacity:${placeholderOpacity};`}
          />
        </div>

        <div
          class="sg-center-stack"
          style={`transform:translate3d(0, ${centerY}px, 0); opacity:${galleryOpacity};`}
        >
          {#each CENTER_IMGS as src, i}
            <div class="sg-cell">
              <img {src} alt={`center ${i}`} loading="lazy" />
            </div>
          {/each}
        </div>
      </div>

      <!-- Droite -->
      <div
        class="sg-col sg-col--right"
        style={`transform:translate3d(${sideX}px, ${sideY}px, 0);`}
      >
        {#each RIGHT_IMGS as src, i}
          <div class="sg-cell">
            <img {src} alt={`right ${i}`} loading="lazy" />
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .sg-root {
    position: relative;
    background: #000;
    isolation: isolate;
    overflow: clip;
  }

  .sg-hero-spacer {
    position: relative;
    width: 100%;
  }

  .sg-sticky-stage {
    position: sticky;
    top: 0;
    height: 100vh;
    height: 100svh;
    z-index: 30;
    pointer-events: none;
    overflow: hidden;
  }

  .sg-hero-box {
    position: fixed;
    overflow: hidden;
    z-index: 30;
    will-change: left, top, width, height, border-radius, opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
    pointer-events: none;
  }

  .sg-hero-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    will-change: transform;
    transform-origin: center center;
    user-select: none;
    pointer-events: none;
  }

  .sg-gallery {
    position: relative;
    z-index: 20;
    padding:
      var(--gallery-pad-top)
      clamp(10px, 2vw, 24px)
      clamp(48px, 6vw, 96px);
    will-change: transform, opacity;
  }

  .sg-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: clamp(8px, 1vw, 18px);
    max-width: 1400px;
    margin: 0 auto;
    align-items: start;
  }

  .sg-col {
    display: flex;
    flex-direction: column;
    gap: clamp(8px, 1vw, 18px);
    will-change: transform;
    min-width: 0;
  }

  .sg-col--center {
    margin-top: var(--center-offset);
    margin-bottom: calc(var(--center-offset) * -1);
  }

  .sg-center-stack {
    display: flex;
    flex-direction: column;
    gap: clamp(8px, 1vw, 18px);
    will-change: transform, opacity;
  }

  .sg-cell {
    width: 100%;
    overflow: hidden;
    border-radius: 4px;
    line-height: 0;
    background: #000;
  }

  .sg-cell img {
    width: 100%;
    height: auto;
    display: block;
    aspect-ratio: 3 / 4;
    object-fit: cover;
  }

  .sg-hero-slot img {
    display: block;
    will-change: opacity;
  }

  @media (max-width: 900px) {
    .sg-gallery {
      padding:
        var(--gallery-pad-top)
        10px
        32px;
    }

    .sg-grid {
      grid-template-columns: 0.92fr 1.16fr 0.92fr;
      gap: 8px;
    }

    .sg-col {
      gap: 8px;
    }

    .sg-center-stack {
      gap: 8px;
    }
  }

  @media (max-width: 640px) {
    .sg-gallery {
      padding:
        var(--gallery-pad-top)
        8px
        24px;
    }

    .sg-grid {
      grid-template-columns: 0.9fr 1.18fr 0.9fr;
      gap: 6px;
    }

    .sg-col,
    .sg-center-stack {
      gap: 6px;
    }

    .sg-cell {
      border-radius: 3px;
    }
  }

  @media (max-width: 420px) {
    .sg-gallery {
      padding:
        var(--gallery-pad-top)
        6px
        18px;
    }

    .sg-grid {
      gap: 5px;
    }

    .sg-col,
    .sg-center-stack {
      gap: 5px;
    }

    .sg-cell {
      border-radius: 2px;
    }
  }
</style>