<script>
  import { onMount, onDestroy } from "svelte";

  export let src = "images/photo.webp";
  export let alt = "";

  export let startInset = 28;
  export let endInset = 0;

  export let startScale = 1;      // taille normale
  export let endScale = 1.18;     // zoom au scroll

  export let sectionHeight = 180;

  let section;
  let inset = startInset;
  let scale = startScale;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(v, max));
  }

  function updateMask() {
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const viewportH = window.innerHeight;

    const rawProgress = (viewportH - rect.top) / (viewportH + rect.height * 0.35);
    const progress = clamp(rawProgress, 0, 1);

    inset = startInset + (endInset - startInset) * progress;
    scale = startScale + (endScale - startScale) * progress;
  }

  onMount(() => {
    updateMask();
    window.addEventListener("scroll", updateMask, { passive: true });
    window.addEventListener("resize", updateMask);

    return () => {
      window.removeEventListener("scroll", updateMask);
      window.removeEventListener("resize", updateMask);
    };
  });
</script>

<section
  class="mask-section"
  bind:this={section}
  style={`--section-height:${sectionHeight}vh; --inset:${inset}%; --scale:${scale};`}
>
  <div class="sticky-stage">
    <div class="mask-frame">
      <img src={src} alt={alt} draggable="false" />
    </div>
  </div>
</section>

<style>
  .mask-section {
    position: relative;
    height: var(--section-height);
    background: #000;
  }

  .sticky-stage {
    position: sticky;
    top: 0;
    height: 100vh;
    display: grid;
    place-items: center;
    overflow: hidden;
  }

  .mask-frame {
    width: 100vw;
    height: 100vh;
    overflow: hidden;

    clip-path: inset(var(--inset) round 6px);

    will-change: clip-path;
  }

  .mask-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;

    transform: scale(var(--scale));

    user-select: none;
    pointer-events: none;

    will-change: transform;
  }

  @media (max-width: 768px) {
    .mask-frame {
      clip-path: inset(calc(var(--inset) * 1.1) round 4px);
    }
  }
</style>