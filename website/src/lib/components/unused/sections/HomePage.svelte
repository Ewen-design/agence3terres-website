<script>
  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax } from "$lib/scrollEngine.js";

  const sections = [
    {
      img:     "/images/photo2.webp",
      alt:     "Creative vision",
      title:   "Le reflet d'un art",
      text:    "Dans le silence apaisant d’un lac, chaque détail trouve son écho. Chez 3 Terres, nous nous plaçons comme la surface limpide où se reflète l’essence de votre marque.",
      reverse: false,
    },
    {
      img:     "/images/photo2.webp",
      alt:     "Artistic depth",
      title:   "Les lumières de la création",
      text:    "Cet univers urbain est le théâtre de notre créativité : élégant, moderne, vibrant. 3 Terres puise dans l’énergie de la ville l’audace d’inventer, de façonner des univers visuels qui marient esthétisme et ingéniosité.",
      reverse: true,
    },
    {
      img:     "/images/montagne.webp",
      alt:     "Emotional impact",
      title:   "Les sommets de l'ambition",
      text:    "La montangne est notre troisième terre, celle de l'ambition. Nous visons le sommet pour nos clients, en créant des expériences visuelles qui inspirent et marquent les esprits.",
      reverse: false,
    },
  ];

  const SPEEDS_DESKTOP = [120, 80, 100];
  const SPEEDS_MOBILE  = [ 55, 38,  48];

  let sectionEl;
  let bgTitleEl;
  let wrapperEls = [];

  let cardMetrics = [];
  let secTop = 0, secBottom = 0;
  let bgTop  = 0, bgHeight  = 0;
  let measured = false;

  let prevWrapperY = [];
  let prevBgY      = null;

  let sectionVisible = false;
  let isScrolling    = false;
  let scrollEndTimer = null;
  let isMobile       = false;
  let prefersReduced = false;
  let intersectionObs;
  let resizeObs;
  let resizeTimer;
  let mediaQuery;

  const clamp    = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  const Q        = 0.5;
  const quantize = (v) => Math.round(v / Q) * Q;

  function measure() {
    if (!sectionEl) return;
    const scrollY = (window.lenis?.animatedScroll ?? window.scrollY) || 0;

    const sr  = sectionEl.getBoundingClientRect();
    secTop    = sr.top + scrollY;
    secBottom = secTop + sr.height;

    if (bgTitleEl) {
      const br = bgTitleEl.getBoundingClientRect();
      bgTop    = br.top + scrollY;
      bgHeight = br.height;
    }

    cardMetrics = [];
    sectionEl.querySelectorAll(".visual").forEach((el) => {
      const r = el.getBoundingClientRect();
      cardMetrics.push({ top: r.top + scrollY, height: r.height });
    });

    prevWrapperY = new Array(sections.length).fill(null);
    prevBgY      = null;
    measured     = true;
  }

  function onScroll(scrollY, { vh, isMobile: mob }) {
    if (!sectionVisible || prefersReduced || !measured) return;
    if (secTop - scrollY > vh + 800 || secBottom - scrollY < -800) return;

    // Safari backdrop-filter — disable during scroll, re-enable after
    if (!isScrolling) {
      isScrolling = true;
      sectionEl.classList.add("is-scrolling");
    }
    clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(() => {
      isScrolling = false;
      sectionEl.classList.remove("is-scrolling");
    }, 150);

    const speeds = mob ? SPEEDS_MOBILE : SPEEDS_DESKTOP;

    for (let i = 0; i < sections.length; i++) {
      const wrapper = wrapperEls[i];
      if (!wrapper) continue;
      const m = cardMetrics[i];
      if (!m?.height) continue;

      const center   = m.top - scrollY + m.height * 0.5;
      const progress = clamp((center - vh * 0.5) / vh, -1, 1);
      const wY       = quantize(progress * speeds[i % 3] * -1);

      if (wY !== prevWrapperY[i]) {
        wrapper.style.transform = `translate3d(0,${wY}px,0)`;
        prevWrapperY[i] = wY;
      }
    }

    if (bgTitleEl && !mob) {
      const titleCenter = bgTop - scrollY + bgHeight * 0.5;
      const prog        = clamp((titleCenter - vh * 0.5) / vh, -1, 1);
      const bgY         = quantize(prog * -90);
      if (bgY !== prevBgY) {
        bgTitleEl.style.transform = `translate3d(0,${bgY}px,0)`;
        prevBgY = bgY;
      }
    }
  }

  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      isMobile = window.innerWidth <= 900;
      if (isMobile && bgTitleEl) { bgTitleEl.style.transform = ""; prevBgY = null; }
      measure();
    }, 100);
  }

  onMount(() => {
    isMobile = window.innerWidth <= 900;

    mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReduced = mediaQuery.matches;
    const onMotion = (e) => { prefersReduced = e.matches; };
    if (mediaQuery.addEventListener) mediaQuery.addEventListener("change", onMotion);
    else                             mediaQuery.addListener(onMotion);

    requestAnimationFrame(() => {
      measure();
      registerParallax(onScroll);
    });

    intersectionObs = new IntersectionObserver(([entry]) => {
      const was = sectionVisible;
      sectionVisible = entry.isIntersecting;
      if (sectionVisible && !was) measure();
    }, { rootMargin: "600px 0px 600px 0px", threshold: 0 });
    intersectionObs.observe(sectionEl);

    resizeObs = new ResizeObserver(handleResize);
    resizeObs.observe(sectionEl);
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });

    return () => {
      if (mediaQuery?.removeEventListener) mediaQuery.removeEventListener("change", onMotion);
      else if (mediaQuery?.removeListener)  mediaQuery.removeListener(onMotion);
    };
  });

  onDestroy(() => {
    unregisterParallax(onScroll);
    intersectionObs?.disconnect();
    resizeObs?.disconnect();
    clearTimeout(resizeTimer);
    clearTimeout(scrollEndTimer);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("orientationchange", handleResize);
  });
</script>

<section class="home-showcase" bind:this={sectionEl}>

  <div class="header-stage">
    <div class="bg-title" bind:this={bgTitleEl} aria-hidden="true">
      <span>NOS</span>
      <span>TERRES</span>
    </div>
    <div class="gallery-header">
      <div class="intro-card">
        <p>
          Notre agence repose sur 3 piliers fondamentaux : les sommets de l'ambition,
          le reflet d'un art et les lumières de la création.
        </p>
      </div>
    </div>
  </div>

  {#each sections as s, i}
    <div class="split {s.reverse ? 'reverse' : ''}">
      <div class="visual">
        <div class="parallax-wrapper" bind:this={wrapperEls[i]}>
          <!--
            Première image eagerly chargée (above-the-fold).
            Les suivantes lazy — mais avec un rootMargin généreux sur l'IO
            elles démarrent avant d'entrer dans le viewport donc pas de saut.
          -->
          <img
            src={s.img}
            alt={s.alt}
            loading={i === 0 ? "eager" : "lazy"}
            decoding={i === 0 ? "sync" : "async"}
            fetchpriority={i === 0 ? "high" : "low"}
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
    background: #000;
    color: #fff;
    padding: 0 0 10rem 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: clip;
  }

  /* ── Header ── */
  .header-stage {
    position: relative;
    width: 100%;
    min-height: 108vh;
    display: flex;
    align-items: center;
    overflow: hidden;
    z-index: 1;
  }

  .bg-title {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    pointer-events: none;
    width: min(1500px, 94%);
    left: 0; right: 0;
    margin: 0 auto;
    padding-left: 3%;
    will-change: transform;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .bg-title span {
    display: block;
    font-family: "Inter", sans-serif;
  font-weight: 500;
    font-style: normal;
    font-size: clamp(4.8rem, 13vw, 12rem);
    line-height: 0.88;
    letter-spacing: 0.04em;
    color: rgba(255, 255, 255, 0.14);
    white-space: nowrap;
  }

  .gallery-header {
    position: relative;
    z-index: 3;
    width: min(1500px, 92%);
    margin: 0 auto;
    display: flex;
    justify-content: flex-end;
  }

  .intro-card {
    width: min(560px, 100%);
    background: #111;
    padding: 2.5rem 2.3rem;
    box-shadow: 0 18px 60px rgba(0, 0, 0, 0.28);
  }

  .intro-card p {
    margin: 0;
    font-family: "Inter", sans-serif;
    font-size: 1rem;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.62);
  }

  /* ── Splits ── */
  .split {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    align-items: center;
    gap: 6vw;
    padding: 14vh 10vw;
    width: 100%;
  }

  .split.reverse { grid-template-columns: 1fr 1.1fr; }
  .split.reverse .visual  { order: 2; }
  .split.reverse .content { order: 1; }

  .visual {
    height: 520px;
    overflow: hidden;
    position: relative;
    background: #161616;
    /*
     * translateZ(0) promotes to its own layer without will-change overhead.
     * No contain here — parallax wrapper overflows intentionally.
     */
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .parallax-wrapper {
    position: absolute;
    inset-inline: 0;
    top: -14%;
    height: 128%;
    will-change: transform;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
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
    font-family: "Inter", sans-serif;
  font-weight: 500;
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
    font-family: "Inter", sans-serif;
    font-size: 0.8rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    transition: background 0.4s ease, color 0.4s ease;
  }

  .services-btn:hover { background: #fff; color: #111; }

  /* ── Breakpoints ── */
  @media (max-width: 1100px) {
    .header-stage { min-height: 92vh; }
    .bg-title span { font-size: clamp(4rem, 12vw, 8rem); }
    .intro-card { width: min(520px, 100%); }
  }

  @media (max-width: 900px) {
    .home-showcase { padding: 0 0 8rem 0; }
    .header-stage { min-height: auto; padding: 7rem 0 3rem 0; display: block; }
    .bg-title {
      position: relative; inset: auto;
      width: min(92%, 760px);
      left: auto; right: auto;
      margin: 0 0 2rem 0; padding-left: 0;
      transform: none !important;
    }
    .bg-title span { font-size: clamp(2.6rem, 13vw, 4.8rem); line-height: 0.92; color: rgba(255,255,255,0.16); }
    .gallery-header { width: min(92%, 760px); margin: 0 auto; display: block; }
    .intro-card { width: 100%; padding: 1.6rem 1.4rem; }
    .intro-card p { font-size: 0.95rem; line-height: 1.65; }
    .split { grid-template-columns: 1fr; padding: 10vh 6vw; gap: 2.75rem; }
    .split.reverse .visual, .split.reverse .content { order: initial; }
    .visual { width: 100%; max-width: 760px; height: min(68vw, 460px); margin: 0 auto; }
    .parallax-wrapper { top: -9%; height: 118%; }
    .content { max-width: 760px; }
    .content h2 { font-size: clamp(2rem, 7vw, 3.3rem); margin-bottom: 1.4rem; }
    .content p { font-size: 0.98rem; line-height: 1.62; max-width: 38rem; }
    .gallery-footer { margin-top: 4rem; }
  }

  @media (max-width: 640px) {
    .home-showcase { padding: 0 0 6.5rem 0; }
    .header-stage { padding: 6rem 0 2.4rem 0; }
    .bg-title { width: min(92%, 560px); margin-bottom: 1.5rem; }
    .bg-title span { font-size: clamp(2.15rem, 14vw, 3.4rem); }
    .gallery-header { width: min(92%, 560px); }
    .intro-card { padding: 1.6rem 1.4rem; }
    .split { padding: 7vh 5vw; gap: 1.9rem; }
    .visual { height: min(78vw, 360px); }
    .parallax-wrapper { top: -7%; height: 114%; }
    .content h2 { font-size: clamp(1.65rem, 8vw, 2.35rem); line-height: 1.08; margin-bottom: 1rem; }
    .content p { font-size: 0.92rem; line-height: 1.56; }
    .gallery-footer { margin-top: 3rem; }
    .services-btn { padding: 12px 24px; font-size: 0.72rem; letter-spacing: 0.14em; }
  }

  @media (max-width: 420px) {
    .home-showcase { padding: 0 0 5.5rem 0; }
    .header-stage { padding: 5.4rem 0 2rem 0; }
    .bg-title { width: min(94%, 420px); }
    .bg-title span { font-size: clamp(1.8rem, 13vw, 2.6rem); }
    .gallery-header { width: min(94%, 420px); }
    .intro-card { padding: 1.25rem 1.05rem; }
    .intro-card p { font-size: 0.88rem; line-height: 1.55; }
    .split { padding: 6vh 4.5vw; gap: 1.5rem; }
    .visual { height: min(84vw, 300px); }
    .parallax-wrapper { top: -6%; height: 112%; }
    .content h2 { font-size: clamp(1.45rem, 7.8vw, 1.95rem); margin-bottom: 0.85rem; }
    .content p { font-size: 0.88rem; line-height: 1.5; }
    .gallery-footer { margin-top: 2.4rem; }
    .services-btn { padding: 11px 20px; font-size: 0.68rem; letter-spacing: 0.12em; }
  }

  @media (prefers-reduced-motion: reduce) {
    .bg-title, .parallax-wrapper { transform: none !important; }
  }
</style>