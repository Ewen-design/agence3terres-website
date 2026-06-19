<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";

  // ── Data ───────────────────────────────────────────────────────────────────
  const quotes = [
    { text: "Créer avec intention, toujours.",                      author: "Agence 3 Terres" },
    { text: "La vision précède la matière.",                        author: "Agence 3 Terres" },
    { text: "Chaque détail raconte une histoire.",                  author: "Agence 3 Terres" },
    { text: "Le silence est une forme de design.",                  author: "Agence 3 Terres" },
    { text: "Je ne perds jamais, soit je gagne, soit j'apprends.",  author: "Nelson Mandela" },
    { text: "La profondeur crée l'émotion.",                        author: "Agence 3 Terres" },
  ];

  // ── Carousel — exactement ton original ────────────────────────────────────
  let section;
  let current = 0;
  const angleStep = 360 / quotes.length;
  let radius = 540;
  const radiusDesktop = 540;
  let isMobile = false;
  let startX = 0;
  let deltaX = 0;
  let dragRotation = 0;
  let isDragging = false;
  let dragStartCurrent = 0;
  const mobileDragDivider = 11;

  function next() { current = (current + 1) % quotes.length; }
  function prev() { current = (current - 1 + quotes.length) % quotes.length; }

  function handleMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mx", `${x}px`);
    e.currentTarget.style.setProperty("--my", `${y}px`);
  }

  function getOpacity(i) {
    const diff = Math.abs(i - current);
    if (diff === 0) return 1;
    if (diff === 1 || diff === quotes.length - 1) return 0.45;
    return 0;
  }

  function handleZoneMove(e) {
    if (isMobile) return;
    const rect = sectionEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const dir = x < rect.width / 2 ? "prev" : "next";
    window.dispatchEvent(new CustomEvent("carousel-direction", { detail: dir }));
  }

  function handleSectionClick(e) {
    if (isMobile) return;
    const rect = sectionEl.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (x < rect.width / 2) prev();
    else next();
  }

  function touchStart(e) {
    if (!isMobile) return;
    startX = e.touches[0].clientX;
    deltaX = 0;
    dragRotation = 0;
    dragStartCurrent = current;
    isDragging = true;
  }

  function touchMove(e)  {
    if (!isMobile || !isDragging) return;
    deltaX = e.touches[0].clientX - startX;
    dragRotation = deltaX / mobileDragDivider;
  }

  function touchEnd() {
    if (!isMobile) return;
    if (deltaX > 52) current = (dragStartCurrent - 1 + quotes.length) % quotes.length;
    else if (deltaX < -52) current = (dragStartCurrent + 1) % quotes.length;
    else current = dragStartCurrent;

    isDragging = false;
    dragRotation = 0;
    deltaX = 0;
  }

  // ── DOM refs ───────────────────────────────────────────────────────────────
  let sectionEl;
  let bgEl;

  // ── Background visibility ──────────────────────────────────────────────────
  let rafId = null;
  let sectionVisible = false;

  let curOpacity = 0;

  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  const lerp = (a, b, t) => a + (b - a) * t;
  const round3 = (v) => Math.round(v * 1000) / 1000;

  function tick() {
    if (!sectionVisible || !sectionEl || !bgEl) { rafId = null; return; }

    const winH = window.innerHeight;
    const rect = sectionEl.getBoundingClientRect();

    if (rect.bottom < -400 || rect.top > winH + 400) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    const center = rect.top + rect.height / 2;
    const screenProgress = center / winH;

    let tgtOpacity;
    if (screenProgress > 0.85) tgtOpacity = 1 - (screenProgress - 0.85) * 6;
    else if (screenProgress < 0.15) tgtOpacity = screenProgress * 6;
    else tgtOpacity = 1;
    tgtOpacity = clamp(tgtOpacity, 0, 1);

    const factor = isMobile ? 0.10 : 0.14;
    curOpacity = lerp(curOpacity, tgtOpacity, factor);

    bgEl.style.opacity = round3(curOpacity).toString();

    rafId = requestAnimationFrame(tick);
  }

  function startLoop() { if (!rafId) rafId = requestAnimationFrame(tick); }
  function stopLoop()  { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

  let resizeTimeout;
  function checkMobile() {
    isMobile = window.innerWidth <= 768;
    radius = isMobile ? 260 : radiusDesktop;
  }
  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(checkMobile, 120);
  }

  let resizeObserver;
  let intersectionObserver;
  let removeSectionClickListener;

  onMount(() => {
    checkMobile();

    sectionEl.addEventListener("click", handleSectionClick);
    removeSectionClickListener = () => sectionEl?.removeEventListener("click", handleSectionClick);

    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(sectionEl);

    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        sectionVisible = entry.isIntersecting;
        if (sectionVisible) startLoop();
        else stopLoop();
      },
      { rootMargin: "300px 0px 300px 0px" }
    );
    intersectionObserver.observe(sectionEl);
  });

  onDestroy(() => {
    if (!browser) return;
    stopLoop();
    removeSectionClickListener?.();
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    clearTimeout(resizeTimeout);
  });
</script>

<section
  class="vision-section"
  bind:this={sectionEl}
  data-cursor="carousel"
  role="group"
  aria-label="Carrousel de citations"
  on:mousemove={handleZoneMove}
  on:touchstart={touchStart}
  on:touchmove={touchMove}
  on:touchend={touchEnd}
  on:touchcancel={touchEnd}
>
  <div class="bg" bind:this={bgEl} style="background-image:url('/images/telephone3.webp')"></div>
  <div class="overlay"></div>
  <div class="nav-zones" aria-hidden={isMobile}>
    <button
      class="nav-zone"
      type="button"
      aria-label="Citation precedente"
      on:click|stopPropagation={prev}
    ></button>
    <button
      class="nav-zone"
      type="button"
      aria-label="Citation suivante"
      on:click|stopPropagation={next}
    ></button>
  </div>

  <div class="vision-header">
    <h2>Notre vision</h2>
    <p>Une collection de principes qui guident chacune de nos créations.</p>
  </div>

  <div bind:this={section}></div>

  <div class="carousel-wrapper">
    <div
      class="carousel"
      class:is-dragging={isDragging}
      style="transform: rotateY({-current * angleStep + dragRotation}deg)"
    >
      {#each quotes as quote, i}
        <div
          class="card"
          style="transform: rotateY({i * angleStep}deg) translateZ({radius}px); opacity: {getOpacity(i)};"
          role="group"
          on:mousemove={handleMove}
        >
          <div class="quote">
            <span class="mark top">"</span>
            <p>{quote.text}</p>
            <span class="mark bottom">"</span>
          </div>
          <div class="author">{quote.author}</div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .vision-section {
    position: relative;
    height: 140vh;
    width: 100vw;
    margin-left: calc(50% - 50vw);
    background: #000;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    touch-action: pan-y;
  }

  .bg {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: right center;
    opacity: 0;
    will-change: opacity;
    z-index: 1;
  }

  .overlay {
    position: absolute;
    inset: 0;
    z-index: 2;
    background: rgba(0, 0, 0, 0.42);
    pointer-events: none;
  }

  .nav-zones {
    position: absolute;
    inset: 0;
    z-index: 3;
    display: grid;
    grid-template-columns: 1fr 1fr;
    pointer-events: none;
  }

  .nav-zone {
    appearance: none;
    border: 0;
    background: transparent;
    cursor: default;
    pointer-events: auto;
  }

  .vision-section {
    cursor: default;
  }

  .nav-zone:focus-visible {
    outline: 2px solid rgba(244, 239, 230, 0.9);
    outline-offset: -2px;
  }

  .vision-header {
    text-align: center;
    z-index: 4;
    margin-bottom: 0rem;
  }

  .vision-header h2 {
    font-family: "Clash Display", sans-serif;
    font-size: clamp(2.5rem, 4vw, 4rem);
    font-weight: 200;
    margin-bottom: 1.5rem;
    line-height: 0.96;
    letter-spacing: -0.04em;
    color: #f4efe6;
  }

  .vision-header p {
    font-family: "Clash Display", sans-serif;
    font-size: 1rem;
    font-weight: 300;
    opacity: 0.65;
    line-height: 1.6;
    color: #fff;
  }

  .carousel-wrapper {
    perspective: 2000px;
    width: 100%;
    height: 550px;
    position: relative;
    z-index: 4;
  }

  .carousel {
    width: 100%;
    height: 100%;
    position: absolute;
    transform-style: preserve-3d;
    transition: transform 1.6s cubic-bezier(.22,.61,.36,1);
    will-change: transform;
  }

  .carousel.is-dragging {
    transition: none;
  }

  .card {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 500px;
    padding: 5.5rem;
    translate: -50% -50%;
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 3px;
    box-shadow:
      0 8px 10px rgba(0,0,0,0.06),
      inset 0 0 0 0px rgba(255,255,255,0.4);
    transition: transform 1.6s cubic-bezier(.22,.61,.36,1),
                opacity 1.2s ease;
  }

  .card::before {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    padding: 1px;
    background:
      radial-gradient(
        220px circle at var(--mx) var(--my),
        var(--site-glow-mid),
        var(--site-glow-soft) 40%,
        transparent 75%
      );
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;
    filter: drop-shadow(0 0 12px var(--site-glow-ambient));
  }

  .card:hover::before {
    opacity: 1;
  }

  .quote {
    position: relative;
    text-align: center;
  }

  .quote p {
    font-family: "Clash Display", sans-serif;
    font-style: normal;
    font-weight: 300;
    font-size: 1.5rem;
    color: #fff;
    line-height: 1.6;
  }

  .mark {
    position: absolute;
    font-family: "Clash Display", sans-serif;
    font-size: 3rem;
    font-weight: 400;
    opacity: 0.35;
    color: white;
  }

  .mark.top {
    top: -30px;
    left: -20px;
  }

  .mark.bottom {
    bottom: -40px;
    right: -20px;
  }

  .author {
    margin-top: 2rem;
    text-align: center;
    font-family: "Clash Display", sans-serif;
    font-size: 0.95rem;
    font-weight: 300;
    color: #9b9b9b;
  }

  @media (max-width: 768px) {
    .nav-zones {
      display: none;
    }

    .carousel-wrapper {
      height: 520px;
    }

    .carousel {
      transition: transform 0.9s cubic-bezier(.22,.61,.36,1);
    }

    .card {
      width: 62vw;
      padding: 6rem 2.5rem;
    }

    .quote p {
      font-size: 1.25rem;
    }

    .card::before {
      display: none;
    }
  }
</style>
