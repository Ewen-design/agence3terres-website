<script>
  import { onMount } from "svelte";

  export let src = "images/photo.webp";
  export let alt = "";

  export let sectionHeight = 170;

  export let startWidth = 88;
  export let endWidth = 66;

  export let startHeight = 92;
  export let endHeight = 72;

  export let startScale = 1.12;
  export let endScale = 1.02;

  export let title = "Une esthétique pensée avec précision";
  export let text =
    "Nous concevons des identités et des expériences visuelles où l’élégance, la clarté et le détail construisent une présence contemporaine forte et durable.";

  let section;

  let frameWidth = startWidth;
  let frameHeight = startHeight;
  let imageScale = startScale;

  let introOpacity = 0;
  let introY = 36;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(v, max));
  }

  function easeOutSoft(t) {
    return 1 - Math.pow(1 - t, 2);
  }

  function updateMask() {
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const viewportH = window.innerHeight;

    const rawProgress = (viewportH - rect.top) / (viewportH + rect.height * 0.65);
    const progress = clamp(rawProgress, 0, 1);
    const eased = easeOutSoft(progress);

    frameWidth = startWidth + (endWidth - startWidth) * eased;
    frameHeight = startHeight + (endHeight - startHeight) * eased;
    imageScale = startScale + (endScale - startScale) * eased;

    const textProgress = clamp((progress - 0.38) / 0.32, 0, 1);
    const textEased = easeOutSoft(textProgress);
    introOpacity = textEased;
    introY = 36 * (1 - textEased);
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
  class="reveal-section"
  bind:this={section}
  style={`--section-height:${sectionHeight}vh;`}
>
  <div class="stage">
    <div
      class="frame"
      style={`width:${frameWidth}vw; height:${frameHeight}vh;`}
    >
      <img
        src={src}
        alt={alt}
        draggable="false"
        style={`transform:scale(${imageScale});`}
      />
      <div class="overlay"></div>
      <div class="vignette"></div>
    </div>

    <div
      class="intro"
      style={`opacity:${introOpacity.toFixed(3)}; transform:translate3d(0, ${introY.toFixed(1)}px, 0);`}
    >
      <h2>{title}</h2>
      <p class="text">{text}</p>
    </div>
  </div>
</section>

<style>
  .reveal-section {
    position: relative;
     min-height: var(--section-height);
    background:
      radial-gradient(circle at 50% 0%, rgba(255,255,255,0.05), transparent 36%),
      linear-gradient(180deg, #050505 0%, #0a0a0a 48%, #070809 100%);
    overflow: clip;
  }

  .stage {
    position: relative;
    width: 100%;
    padding-top: clamp(1.5rem, 2vw, 2rem);
    padding-bottom: clamp(2rem, 3vw, 3rem);
  }

  .frame {
    position: relative;
    margin: 0 auto;
    overflow: hidden;
    background: #111;
    will-change: width, height;
    box-shadow:
      0 24px 70px rgba(0, 0, 0, 0.34),
      0 6px 24px rgba(0, 0, 0, 0.18),
      inset 0 0 0 1px rgba(255,255,255,0.06);
  }

  .frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform-origin: center center;
    user-select: none;
    pointer-events: none;
    will-change: transform;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0,0,0,0.14) 0%,
      rgba(0,0,0,0.03) 24%,
      rgba(0,0,0,0.18) 100%
    );
  }

  .vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 50%, transparent 48%, rgba(0,0,0,0.22) 100%);
  }

  .intro {
    width: min(720px, calc(100% - 2rem));
    margin: clamp(2rem, 4vw, 3rem) auto 0; /* ✅ espace réduit */
    text-align: center;
    will-change: transform, opacity;
  }

  h2 {
    margin: 0 auto;
    max-width: 11ch;
    font-family: "Aboreto", sans-serif;
    font-weight: 300;
    font-size: clamp(2.3rem, 4.6vw, 5rem);
    line-height: 0.95;
    letter-spacing: -0.045em;
    color: rgba(255,255,255,0.98);
    text-wrap: balance;
  }

  .text {
    margin: 1rem auto 0; /* ✅ réduit */
    max-width: 40rem;
    font-family: "General Sans", sans-serif;
    font-weight: 300;
    font-size: clamp(0.95rem, 1vw, 1.05rem);
    line-height: 1.65;
    color: rgba(255,255,255,0.72);
  }

  @media (max-width: 768px) {
    .intro {
      margin-top: 1.8rem;
    }

    h2 {
      font-size: clamp(1.9rem, 10vw, 3.2rem);
      max-width: 100%;
    }

    .text {
      max-width: 22rem;
      font-size: 0.92rem;
    }
  }
</style>