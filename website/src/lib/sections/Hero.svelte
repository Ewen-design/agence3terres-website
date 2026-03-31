<script>
  import { onMount, onDestroy } from "svelte";

  let pinSection;
  let afterSection;
  let leftTitleEl;
  let rightTitleEl;

  let heroProgress = 0;
  let textReveal = 0;

  let vw = 0;
  let leftW = 0;
  let rightW = 0;

  let ticking = false;

  const finalText =
    "Nous concevons des identités, des expériences et des univers visuels pensés pour marquer durablement les esprits.";

  const letters = finalText.split("");

  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  function easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function measureTitles() {
    vw = window.innerWidth || 0;
    leftW = leftTitleEl?.offsetWidth || 0;
    rightW = rightTitleEl?.offsetWidth || 0;
  }

  function updateScrollState() {
    ticking = false;
    if (!pinSection || !afterSection) return;

    const vh = window.innerHeight;

    const pinRect = pinSection.getBoundingClientRect();
    const pinScrollable = Math.max(pinSection.offsetHeight - vh, 1);
    const pinRaw = clamp(-pinRect.top / pinScrollable, 0, 1);
    heroProgress = pinRaw;

    const afterRect = afterSection.getBoundingClientRect();
    const revealStart = vh * 0.92;
    const revealEnd = vh * 0.18;
    const rawReveal = clamp(
      (revealStart - afterRect.top) / (revealStart - revealEnd),
      0,
      1
    );
    textReveal = easeOutCubic(rawReveal);
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScrollState);
  }

  onMount(() => {
    const updateAll = () => {
      measureTitles();
      updateScrollState();
    };

    updateAll();

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", updateAll, { passive: true });
    window.addEventListener("orientationchange", updateAll, { passive: true });

    requestAnimationFrame(updateAll);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", updateAll);
      window.removeEventListener("orientationchange", updateAll);
    };
  });

  $: mergeProgress = clamp(heroProgress / 0.9, 0, 1);
  $: smoothMerge = easeInOutSine(mergeProgress);

  $: darkProgress = easeInOutSine(clamp(heroProgress / 0.96, 0, 1));
  $: imageDark = lerp(0, 0.93, darkProgress);
  $: imageScale = lerp(1.06, 1.01, darkProgress);

  $: sideMargin = Math.min(vw * 0.085, 118);
  $: joinGap = Math.min(vw * 0.012, 14);

  $: leftStartX = sideMargin;
  $: leftEndX = vw * 0.5 - leftW - joinGap * 0.5;

  $: rightStartX = vw - rightW - sideMargin;
  $: rightEndX = vw * 0.5 + joinGap * 0.5;

  $: leftX = lerp(leftStartX, leftEndX, smoothMerge);
  $: rightX = lerp(rightStartX, rightEndX, smoothMerge);

  function letterOpacity(i) {
    return clamp(textReveal * 1.16 - i * 0.022, 0, 1);
  }

  function letterY(i) {
    return (1 - letterOpacity(i)) * 14;
  }
</script>

<section class="hero-join-clean">
  <section class="pin-section" bind:this={pinSection}>
    <div class="sticky-stage">
      <div class="hero-media">
        <img
          src="images/photo.webp"
          alt="Agence 3 Terres"
          style={`transform: scale(${imageScale}); filter: brightness(${1 - imageDark});`}
        />
        <div class="hero-dark-layer" style={`opacity:${imageDark};`}></div>
      </div>

      <div class="titles-layer">
        <span
          class="title-left"
          bind:this={leftTitleEl}
          style={`transform: translate3d(${leftX}px,-50%,0);`}
        >
          Agence
        </span>

        <span
          class="title-right"
          bind:this={rightTitleEl}
          style={`transform: translate3d(${rightX}px,-50%,0);`}
        >
          3 Terres
        </span>
      </div>
    </div>
  </section>

  <section class="after-section" bind:this={afterSection}>
    <div class="after-grid">
     <div
  class="after-text"
  style={`opacity:${lerp(0.18, 1, textReveal)}; transform: translate3d(${lerp(24, 0, textReveal)}px,0,0);`}
>
  <h2 aria-label={finalText}>
    {#each letters as letter, i}
      <span
        class:muted={i >= Math.ceil(letters.length / 2)}
        style={`opacity:${clamp(0.14 + letterOpacity(i), 0, 1)}; transform: translate3d(0,${letterY(i)}px,0);`}
      >
        {letter === " " ? "\u00A0" : letter}
      </span>
    {/each}
  </h2>
</div>

      <div
        class="after-image"
        style={`opacity:${textReveal}; transform: translate3d(0,${lerp(26, 0, textReveal)}px,0);`}
      >
        <img src="images/photo.webp" alt="Visuel 3 Terres" />
      </div>
    </div>
  </section>
</section>

<style>
  .hero-join-clean {
    position: relative;
    width: 100%;
    background: #000;
    color: #fff;
    overflow: clip;
  }

  .pin-section {
    position: relative;
    height: 265vh;
  }

  .sticky-stage {
    position: sticky;
    top: 0;
    height: 100vh;
    height: 100svh;
    overflow: hidden;
    background: #000;
  }

  .hero-media {
    position: absolute;
    inset: 0;
    background: #000;
  }

  .hero-media img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    will-change: transform, filter;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .hero-dark-layer {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        circle at 50% 50%,
        rgba(0, 0, 0, 0.01) 0%,
        rgba(0, 0, 0, 0.08) 38%,
        rgba(0, 0, 0, 0.22) 62%,
        rgba(0, 0, 0, 0.84) 100%
      );
    pointer-events: none;
    will-change: opacity;
  }

  .titles-layer {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
  }

  .title-left,
  .title-right {
    position: absolute;
    top: 50%;
    line-height: 0.94;
    letter-spacing: -0.05em;
    white-space: nowrap;
    will-change: transform;
    font-size: clamp(2.9rem, 7.8vw, 8.8rem);
    transform: translate3d(0, -50%, 0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .title-left {
    font-family: "Titre", serif;
    font-weight: 400;
  }

  .title-right {
    font-family: "Titre italic", serif;
    font-style: italic;
    font-weight: 100;
  }

  .after-section {
    position: relative;
    z-index: 3;
    background: #000;
    padding: 16vh 0 18vh;
  }

  .after-grid {
    width: min(1400px, 92%);
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.78fr);
    gap: clamp(1.4rem, 4vw, 4.5rem);
    align-items: start;
  }

  .after-text {
    will-change: transform, opacity;
    width: 100%;
  min-width: 0;
  }

.after-text h2 {
  margin: 0;
  width: 100%;
  max-width: 13ch;
  font-family: "General Sans", sans-serif;
  font-weight: 400;
  font-size: clamp(1.9rem, 4.3vw, 4.8rem);
  line-height: 0.98;
  letter-spacing: -0.05em;
  color: #fff;
}

  .after-text h2 span {
    display: inline-block;
    color: #fff;
    will-change: transform, opacity;
  }

  .after-text h2 span.muted {
    color: rgba(255, 255, 255, 0.42);
  }

  .after-image {
    justify-self: end;
    width: min(100%, 400px);
    aspect-ratio: 0.82 / 1;
    overflow: hidden;
    background: #0b0b0b;
    will-change: transform, opacity;
  }

  .after-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform: translateZ(0);
  }

  @media (max-width: 900px) {
    .pin-section {
      height: 235vh;
    }

    .title-left,
    .title-right {
      font-size: clamp(2.2rem, 9vw, 5rem);
    }

    .after-grid {
      width: min(94%, 760px);
      grid-template-columns: 1fr 0.82fr;
      gap: 0.8rem;
    }

    .after-text h2 {
      font-size: clamp(1.3rem, 6.8vw, 2.7rem);
      max-width: 11ch;
    }
  }

  @media (max-width: 640px) {
    .pin-section {
      height: 220vh;
    }

    .title-left,
    .title-right {
      font-size: clamp(1.85rem, 10vw, 3.3rem);
    }

    .after-section {
      padding: 11vh 0 12vh;
    }

    .after-grid {
      width: min(94%, 520px);
      grid-template-columns: 1fr 0.8fr;
      gap: 0.65rem;
    }

    .after-text h2 {
      font-size: clamp(1.12rem, 6.6vw, 2rem);
      line-height: 1.02;
      max-width: 12ch;
    }

    .after-image {
      aspect-ratio: 0.82 / 1.04;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-media img,
    .hero-dark-layer,
    .title-left,
    .title-right,
    .after-text,
    .after-image,
    .after-text h2 span {
      transition: none !important;
      animation: none !important;
    }
  }
</style>