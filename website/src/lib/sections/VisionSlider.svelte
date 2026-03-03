<script>
  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";

  const quotes = [
    { text: "Créer avec intention, toujours.", author: "Aboreto" },
    { text: "La vision précède la matière.", author: "Aboreto" },
    { text: "Chaque détail raconte une histoire.", author: "Aboreto" },
    { text: "Le silence est une forme de design.", author: "Aboreto" },
    { text: "Je ne perds jamais, soit je gagne, soit j'apprends.", author: "Neson Mandela" },
    { text: "La profondeur crée l'émotion.", author: "Aboreto" }
  ];

  let current = 0;
  const angleStep = 360 / quotes.length;
  let radius = 540;

  let sectionEl;
  let bgEl;

  let isMobile = false;
const radiusDesktop = radius;

let startX = 0;
let deltaX = 0;

  function next() {
    current = (current + 1) % quotes.length;
  }

  function prev() {
    current = (current - 1 + quotes.length) % quotes.length;
  }

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

  /* === PARALLAX IDENTIQUE A TON AUTRE COMPOSANT === */

  function clamp(v, min, max) {
    return Math.max(min, Math.min(v, max));
  }

  function updateParallax() {
    if (!sectionEl || !bgEl) return;

    const winH = window.innerHeight;
    const rect = sectionEl.getBoundingClientRect();
    const center = rect.top + rect.height / 2;

    const screenProgress = center / winH;
    let opacity;

    if (screenProgress > 0.85) {
      opacity = 1 - (screenProgress - 0.85) * 6;
    } else if (screenProgress < 0.15) {
      opacity = screenProgress * 6;
    } else {
      opacity = 1;
    }

    bgEl.style.opacity = clamp(opacity, 0, 1);

    const speed = -4;
    const offset = rect.top * speed * 0.08;
    bgEl.style.transform = `translate3d(0, ${offset}px, 0)`;
  }

  onMount(() => {
  const checkMobile = () => {
    isMobile = window.innerWidth <= 768;
    radius = isMobile ? 260 : radiusDesktop;
  };

  checkMobile();
  window.addEventListener("resize", checkMobile);

  registerParallax(updateParallax);
});

  onDestroy(() => {
    unregisterParallax(updateParallax);
  });

  function touchStart(e) {
  if (!isMobile) return;
  startX = e.touches[0].clientX;
}

function touchMove(e) {
  if (!isMobile) return;
  deltaX = e.touches[0].clientX - startX;
}

function touchEnd() {
  if (!isMobile) return;

  if (deltaX > 60) prev();
  if (deltaX < -60) next();

  deltaX = 0;
}

</script>

<section
  class="vision-section"
  bind:this={sectionEl}
  on:touchstart={touchStart}
  on:touchmove={touchMove}
  on:touchend={touchEnd}
>

  <!-- Background parallax -->
  <div
    class="bg"
    bind:this={bgEl}
    style="background-image:url('/images/livre.png')"
  ></div>

  <div class="overlay"></div>

  <div class="vision-header">
    <h2>Notre vision</h2>
    <div class="line"></div>
    <p>Une collection de principes qui guident chacune de nos créations.</p>
  </div>

  <div class="carousel-wrapper">
    <div
      class="carousel"
      style="transform: rotateY({-current * angleStep}deg)"
    >
      {#each quotes as quote, i}
        <div
          class="card"
          style="
            transform: rotateY({i * angleStep}deg) translateZ({radius}px);
            opacity: {getOpacity(i)};
          "
          on:mousemove={handleMove}
        >
          <div class="quote">
            <span class="mark top">“</span>
            <p>{quote.text}</p>
            <span class="mark bottom">”</span>
          </div>
          <div class="author">{quote.author}</div>
        </div>
      {/each}
    </div>
  </div>

  <div class="controls">
    <button on:click={prev}>←</button>
    <button on:click={next}>→</button>
  </div>

</section>

<style>
.vision-section {
  position: relative;
  height: 140vh;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  background: black;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* PARALLAX BG */
.bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  will-change: transform, opacity;
  transform: translate3d(0,0,0);
  z-index: 1;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.65);
  z-index: 2;
}

/* HEADER */
.vision-header {
  text-align: center;
  z-index: 3;
  margin-bottom: 0rem;
}

.vision-header h2 {
  font-family: "Aboreto", serif;
  font-size: clamp(2.5rem, 4vw, 4rem);
  letter-spacing: 0.2em;
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

/* CAROUSEL */
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

/* CARDS */
.card {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 500px;
  padding: 5.5rem;
  translate: -50% -50%;

  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  border-radius: 3px;

  box-shadow: 0 40px 80px rgba(0,0,0,0.65);

  transition: transform 1.6s cubic-bezier(.22,.61,.36,1),
              opacity 1.2s ease;
}

/* === GLOW AMÉLIORÉ === */
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

/* QUOTE */
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

/* CONTROLS */
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

/* ===========================
   RESPONSIVE TELEPHONE
=========================== */

@media (max-width: 768px) {

  .carousel-wrapper {
    height: 520px; /* plus haut pour format vertical */
  }

  .card {
    width: 68vw;          /* moins large */
    padding: 3.5rem 2.5rem;
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