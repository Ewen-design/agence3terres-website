<script>
  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";

  // ── Data ───────────────────────────────────────────────────────────────────
  const quotes = [
    { text: "Créer avec intention, toujours.",                       author: "Aboreto" },
    { text: "La vision précède la matière.",                         author: "Aboreto" },
    { text: "Chaque détail raconte une histoire.",                   author: "Aboreto" },
    { text: "Le silence est une forme de design.",                   author: "Aboreto" },
    { text: "Je ne perds jamais, soit je gagne, soit j'apprends.",  author: "Nelson Mandela" },
    { text: "La profondeur crée l'émotion.",                        author: "Aboreto" },
  ];

  // ── Carousel — exactement ton original ────────────────────────────────────
  let section;          // div vide bind (utilisé par ton original pour sectionIsNearViewport)
  let current   = 0;
  const angleStep = 360 / quotes.length;
  let radius    = 540;
  const radiusDesktop = 540;
  let isMobile  = false;
  let startX    = 0;
  let deltaX    = 0;

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

  function handleZoneClick(e) {
    if (isMobile) return;
    const rect = sectionEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) prev(); else next();
  }

  function touchStart(e) { if (!isMobile) return; startX = e.touches[0].clientX; }
  function touchMove(e)  { if (!isMobile) return; deltaX = e.touches[0].clientX - startX; }
  function touchEnd() {
    if (!isMobile) return;
    if (deltaX >  60) prev();
    if (deltaX < -60) next();
    deltaX = 0;
  }

  // ── DOM refs ───────────────────────────────────────────────────────────────
  let sectionEl;
  let bgEl;

  // ── Parallax engine (rAF + lerp — seule modification vs ton original) ─────
  let currentScrollY = 0;
  let rafId          = null;
  let sectionVisible = false;

  // lerp state
  let curOffset  = 0;
  let curOpacity = 0;

  const clamp  = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  const lerp   = (a, b, t)   => a + (b - a) * t;
  const round3 = (v)         => Math.round(v * 1000) / 1000;

  // Callback scrollEngine : stocke uniquement, zéro DOM write
  function updateParallax(scrollY) {
    currentScrollY = scrollY;
  }

  function tick() {
    if (!sectionVisible || !sectionEl || !bgEl) { rafId = null; return; }

    const winH = window.innerHeight;
    const rect = sectionEl.getBoundingClientRect();

    // Culling
    if (rect.bottom < -400 || rect.top > winH + 400) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    // Cibles — logique identique à ton updateParallax original
    const center         = rect.top + rect.height / 2;
    const screenProgress = center / winH;

    let tgtOpacity;
    if      (screenProgress > 0.85) tgtOpacity = 1 - (screenProgress - 0.85) * 6;
    else if (screenProgress < 0.15) tgtOpacity = screenProgress * 6;
    else                            tgtOpacity = 1;
    tgtOpacity = clamp(tgtOpacity, 0, 1);

    const tgtOffset = rect.top * -4 * 0.08;

    // Lerp
    const factor = isMobile ? 0.10 : 0.14;
    curOpacity = lerp(curOpacity, tgtOpacity, factor);
    curOffset  = lerp(curOffset,  tgtOffset,  factor);

    // Batch write
    bgEl.style.opacity   = round3(curOpacity).toString();
    bgEl.style.transform = `translate3d(0,${round3(curOffset)}px,0)`;

    rafId = requestAnimationFrame(tick);
  }

  function startLoop() { if (!rafId) rafId = requestAnimationFrame(tick); }
  function stopLoop()  { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

  // ── Resize — ton original + debounce ──────────────────────────────────────
  let resizeTimeout;
  function checkMobile() {
    isMobile = window.innerWidth <= 768;
    radius   = isMobile ? 260 : radiusDesktop;
  }
  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(checkMobile, 120);
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  let resizeObserver;
  let intersectionObserver;

  onMount(() => {
    checkMobile();

    registerParallax(updateParallax);

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
    stopLoop();
    unregisterParallax(updateParallax);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    clearTimeout(resizeTimeout);
  });
</script>

<!-- Template 100% identique à ton original -->
<section
  class="vision-section"
  bind:this={sectionEl}
  data-cursor="carousel"
  on:mousemove={handleZoneMove}
  on:click={handleZoneClick}
  on:touchstart={touchStart}
  on:touchmove={touchMove}
  on:touchend={touchEnd}
>
  <div class="bg" bind:this={bgEl} style="background-image:url('/images/photo.webp')"></div>
  <div class="overlay"></div>

  <div class="vision-header">
    <h2>Notre vision</h2>
    <div class="line"></div>
    <p>Une collection de principes qui guident chacune de nos créations.</p>
  </div>

  <div bind:this={section}></div>

  <div class="carousel-wrapper">
    <div class="carousel" style="transform: rotateY({-current * angleStep}deg)">
      {#each quotes as quote, i}
        <div
          class="card"
          style="transform: rotateY({i * angleStep}deg) translateZ({radius}px); opacity: {getOpacity(i)};"
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

<!-- Style 100% identique à ton original -->
<style>
.vision-section {
position: relative;
height: 140vh;
width: 100vw;
margin-left: calc(50% - 50vw);
background: linear-gradient(
to top,
#000 0%,
#111 100%
);
overflow: hidden;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
}
.bg {
position: absolute;
inset: 0;
background-size: cover;
background-position: right center;
opacity: 0;
will-change: transform, opacity;
transform: translate3d(0,0,0);
z-index: 1;
}
.vision-header {
text-align: center;
z-index: 3;
margin-bottom: 0rem;
}
.vision-header h2 {
font-family: "Aboreto", serif;
font-size: clamp(2.5rem, 4vw, 4rem);
letter-spacing: 0.05em;
margin-bottom: 1.5rem;
}
.vision-header p {
font-family: "Manrope", sans-serif;
font-size: 1rem;
opacity: 0.65;
line-height: 1.6;
}
.line {
width: 120px;
height: 1px;
background: #fff;
margin: 0 auto 2rem auto;
}
.carousel-wrapper {
perspective: 2000px;
width: 100%;
height: 550px;
position: relative;
z-index: 3;
}
.carousel {
width: 100%;
height: 100%;
position: absolute;
transform-style: preserve-3d;
transition: transform 1.6s cubic-bezier(.22,.61,.36,1);
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
rgba(212,175,55,0.95),
rgba(212,102,55,0.5) 40%,
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
filter: drop-shadow(0 0 12px rgba(212,175,55,0.5));
}
.card:hover::before {
opacity: 1;
}
.quote {
position: relative;
text-align: center;
}
.quote p {
font-family: "Manrope", sans-serif;
font-style: italic;
font-size: 1.5rem;
color: #fff;
line-height: 1.6;
}
.mark {
position: absolute;
font-family: "Aboreto", serif;
font-size: 3rem;
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
font-family: "Manrope", sans-serif;
font-size: 0.95rem;
color: #9b9b9b;
}
.controls {
margin-top: 1rem;
display: flex;
gap: 1rem;
z-index: 3;
}
.controls button {
background: rgba(255,255,255,0.15);
backdrop-filter: blur(10px);
border: none;
padding: 0.8rem 1.2rem;
color: #fff;
border-radius: 3px;
cursor: pointer;
font-family: "Manrope", sans-serif;
transition: transform 0.4s ease;
}
.controls button:hover {
transform: scale(1.1);
}
@media (max-width: 768px) {
.carousel-wrapper {
height: 520px;
  }
.card {
width: 62vw;
padding: 6rem 2.5rem;
  }
.quote p {
font-size: 1.25rem;
  }
.controls {
display: none;
  }
.card::before {
display: none;
  }
}
</style>