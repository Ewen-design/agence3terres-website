<script>
  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";

  // ── Data ───────────────────────────────────────────────────────────────────
  const sections = [
    {
      img:     "/images/photo2.webp",
      alt:     "Creative vision",
      title:   "Discover our creative VISION",
      text:    "We shape visual universes where form, texture and motion create immersive brand experiences.",
      reverse: false,
    },
    {
      img:     "/images/photo2.webp",
      alt:     "Artistic depth",
      title:   "Crafted interactions with artistic DEPTH",
      text:    "Every motion, contrast and transition is designed to create rhythm and harmony.",
      reverse: true,
    },
    {
      img:     "/images/photo2.webp",
      alt:     "Emotional impact",
      title:   "Where design meets emotional IMPACT",
      text:    "We blend minimalism, sculpture-like compositions and cinematic pacing.",
      reverse: false,
    },
  ];

  // Vitesses parallaxe par index — identiques à l'original
  const SPEEDS_DESKTOP = [120, 80, 100];
  const SPEEDS_MOBILE  = [ 55, 38,  48];

  // ── DOM refs ───────────────────────────────────────────────────────────────
  let sectionEl;
  let headerEl;
  let lineEl;

  // ── Parallax state ─────────────────────────────────────────────────────────
  let cardData = [];  // { top, height, wrapper, curOffset, tgtOffset }
  let sectionTop    = 0;
  let sectionHeight = 0;
  let headerTop     = 0;

  let currentScrollY = 0;
  let isMobile       = false;
  let rafId          = null;
  let sectionVisible = false;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const clamp  = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  const lerp   = (a, b, t)   => a + (b - a) * t;
  const round2 = (v)         => Math.round(v * 100) / 100;

  // ── Mesures DOM (batch read) ───────────────────────────────────────────────
  function measure() {
    if (!sectionEl) return;
    const scrollY = window.scrollY;

    const sr = sectionEl.getBoundingClientRect();
    sectionTop    = sr.top  + scrollY;
    sectionHeight = sr.height;

    if (headerEl) {
      headerTop = headerEl.getBoundingClientRect().top + scrollY;
    }

    const visuals = [...sectionEl.querySelectorAll(".visual")];
    cardData = visuals.map((card) => {
      const r = card.getBoundingClientRect();
      return {
        top:       r.top + scrollY,
        height:    r.height,
        wrapper:   card.querySelector(".parallax-wrapper"),
        curOffset: 0,
        tgtOffset: 0,
      };
    });
  }

  // ── Callback scrollEngine : stocke uniquement ──────────────────────────────
  function updateParallax(scrollY) {
    currentScrollY = scrollY;
  }

  // ── rAF loop : lerp + writes ───────────────────────────────────────────────
  function tick() {
    if (!sectionVisible) { rafId = null; return; }

    const scrollY = currentScrollY;
    const winH    = window.innerHeight;

    // Culling section
    const secTopVP = sectionTop - scrollY;
    if (secTopVP > winH + 800 || secTopVP + sectionHeight < -800) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    const lerpFactor = isMobile ? 0.10 : 0.16;
    const speeds     = isMobile ? SPEEDS_MOBILE : SPEEDS_DESKTOP;

    // ── BATCH READ ──────────────────────────────────────────────────────────
    const targets = cardData.map((c, i) => {
      const center   = c.top - scrollY + c.height / 2;
      const progress = clamp((center - winH / 2) / winH, -1, 1);
      return round2(progress * speeds[i % 3] * -1);
    });

    const headerTopVP = headerTop - scrollY;
    const headerProg  = clamp(1 - headerTopVP / winH, 0, 1);

    // ── LERP + BATCH WRITE ──────────────────────────────────────────────────
    cardData.forEach((c, i) => {
      c.curOffset = lerp(c.curOffset, targets[i], lerpFactor);
      if (c.wrapper) {
        c.wrapper.style.transform = `translate3d(0,${round2(c.curOffset)}px,0)`;
      }
    });

    if (headerEl && lineEl) {
      headerEl.style.opacity   = round2(headerProg).toString();
      headerEl.style.transform = `translate3d(0,${round2(32 - headerProg * 32)}px,0)`;
      lineEl.style.transform   = `scaleX(${round2(headerProg)})`;
    }

    rafId = requestAnimationFrame(tick);
  }

  function startLoop() { if (!rafId) rafId = requestAnimationFrame(tick); }
  function stopLoop()  { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

  // ── Resize ─────────────────────────────────────────────────────────────────
  let resizeObserver;
  let resizeTimeout;

  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      isMobile = window.innerWidth <= 900;
      measure();
    }, 120);
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  let intersectionObserver;

  onMount(() => {
    isMobile = window.innerWidth <= 900;

    requestAnimationFrame(() => {
      measure();
      startLoop();
    });

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

<section class="home-showcase" bind:this={sectionEl}>

  <div class="gallery-header" bind:this={headerEl}>
    <h2>Découvrez nos terres</h2>
    <div class="line" bind:this={lineEl}></div>
    <p>
      Notre agence repose sur 3 piliers fondamentaux : les sommets de l'ambition,
      le reflet d'un art et les lumières de la création.
    </p>
  </div>

  {#each sections as s}
    <div class="split {s.reverse ? 'reverse' : ''}">
      <div class="visual">
        <div class="parallax-wrapper">
          <img
            src={s.img}
            alt={s.alt}
            loading="lazy"
            decoding="async"
            fetchpriority="low"
            draggable="false"
          />
        </div>
      </div>
      <div class="content">
        <h2>{s.title}</h2>
        <p>{s.text}</p>
      </div>
    </div>
  {/each}

  <div class="gallery-footer">
    <a href="/services" class="services-btn">Découvrir nos terres</a>
  </div>

</section>

<style>
.home-showcase {
width: 100vw;
margin-left: 50%;
transform: translateX(-50%);
background: #111;
color: #fff;
padding: 12vh 0;
display: flex;
flex-direction: column;
align-items: center;
overflow: clip;
}
.gallery-header {
width: min(900px, 90%);
margin-bottom: 6rem;
text-align: center;
color: #fff;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
opacity: 0;
transform: translate3d(0, 40px, 0);
will-change: transform, opacity;
backface-visibility: hidden;
-webkit-backface-visibility: hidden;
}
.gallery-header h2 {
font-family: "Aboreto", serif;
font-size: clamp(2.5rem, 4vw, 4rem);
letter-spacing: 0.2em;
margin-bottom: 1.5rem;
}
.gallery-header p {
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
transform: scaleX(0);
transform-origin: center;
will-change: transform;
backface-visibility: hidden;
-webkit-backface-visibility: hidden;
}
.split {
display: grid;
grid-template-columns: 1.1fr 1fr;
align-items: center;
gap: 6vw;
padding: 14vh 10vw;
width: 100%;
}
.split.reverse {
grid-template-columns: 1fr 1.1fr;
}
.split.reverse .visual { order: 2; }
.split.reverse .content { order: 1; }
.visual {
height: 520px;
overflow: hidden;
position: relative;
contain: paint;
background: #161616;
}
.parallax-wrapper {
height: 128%;
transform: translate3d(0, 0, 0);
will-change: transform;
backface-visibility: hidden;
-webkit-backface-visibility: hidden;
transform-origin: center center;
}
img {
width: 100%;
height: 100%;
object-fit: cover;
display: block;
transform: translateZ(0);
backface-visibility: hidden;
-webkit-backface-visibility: hidden;
user-select: none;
pointer-events: none;
}
.content {
display: flex;
flex-direction: column;
align-items: center;
text-align: center;
max-width: 720px;
margin: 0 auto;
}
.content h2 {
font-family: 'Aboreto', serif;
font-size: clamp(2.5rem, 4vw, 4.5rem);
line-height: 1.05;
margin-bottom: 2rem;
width: 100%;
}
.content p {
font-size: 1.05rem;
color: #9b9b9b;
line-height: 1.65;
max-width: 620px;
}
.gallery-footer {
text-align: center;
margin-top: 6rem;
display: flex;
flex-direction: column;
align-items: center;
}
.services-btn {
display: inline-block;
padding: 14px 36px;
border: 1px solid #fff;
color: #fff;
text-decoration: none;
font-family: "Manrope", sans-serif;
font-size: 0.8rem;
letter-spacing: 0.2em;
text-transform: uppercase;
transition: all 0.4s ease;
}
.services-btn:hover {
background: #fff;
color: #111;
}
@media (max-width: 900px) {
.home-showcase { padding: 10vh 0; }
.gallery-header { width: min(92%, 720px); margin-bottom: 4rem; }
.gallery-header h2 { font-size: clamp(2.2rem, 6vw, 3.4rem); letter-spacing: 0.14em; }
.gallery-header p { font-size: 0.98rem; line-height: 1.6; max-width: 42rem; }
.line { width: 100px; margin-bottom: 1.6rem; }
.split { grid-template-columns: 1fr; padding: 10vh 6vw; gap: 2.75rem; }
.split.reverse .visual,
.split.reverse .content { order: initial; }
.visual { width: 100%; max-width: 760px; height: min(68vw, 460px); margin: 0 auto; }
.parallax-wrapper { height: 118%; }
.content { max-width: 760px; }
.content h2 { font-size: clamp(2rem, 7vw, 3.3rem); margin-bottom: 1.4rem; }
.content p { font-size: 0.98rem; line-height: 1.62; max-width: 38rem; }
.gallery-footer { margin-top: 4rem; }
}
@media (max-width: 640px) {
.home-showcase { padding: 8vh 0; }
.gallery-header { width: min(92%, 560px); margin-bottom: 3rem; padding: 0 0.25rem; }
.gallery-header h2 { font-size: clamp(1.8rem, 8.5vw, 2.6rem); letter-spacing: 0.08em; margin-bottom: 1rem; }
.gallery-header p { font-size: 0.92rem; line-height: 1.55; max-width: 32rem; }
.line { width: 84px; margin-bottom: 1.3rem; }
.split { padding: 7vh 5vw; gap: 1.9rem; }
.visual { height: min(78vw, 360px); }
.parallax-wrapper { height: 114%; }
.content { max-width: 100%; }
.content h2 { font-size: clamp(1.65rem, 8vw, 2.35rem); line-height: 1.08; margin-bottom: 1rem; }
.content p { font-size: 0.92rem; line-height: 1.56; max-width: 100%; padding: 0 0.15rem; }
.gallery-footer { margin-top: 3rem; }
.services-btn { padding: 12px 24px; font-size: 0.72rem; letter-spacing: 0.14em; }
}
@media (max-width: 420px) {
.home-showcase { padding: 7vh 0; }
.gallery-header { width: min(94%, 420px); margin-bottom: 2.4rem; }
.gallery-header h2 { font-size: clamp(1.55rem, 8.4vw, 2.1rem); letter-spacing: 0.06em; margin-bottom: 0.9rem; }
.gallery-header p { font-size: 0.88rem; line-height: 1.52; }
.line { width: 72px; margin-bottom: 1.1rem; }
.split { padding: 6vh 4.5vw; gap: 1.5rem; }
.visual { height: min(84vw, 300px); }
.parallax-wrapper { height: 112%; }
.content h2 { font-size: clamp(1.45rem, 7.8vw, 1.95rem); line-height: 1.1; margin-bottom: 0.85rem; }
.content p { font-size: 0.88rem; line-height: 1.5; }
.gallery-footer { margin-top: 2.4rem; }
.services-btn { padding: 11px 20px; font-size: 0.68rem; letter-spacing: 0.12em; }
}
@media (prefers-reduced-motion: reduce) {
.gallery-header { opacity: 1 !important; transform: none !important; }
.line { transform: scaleX(1) !important; }
}
</style>