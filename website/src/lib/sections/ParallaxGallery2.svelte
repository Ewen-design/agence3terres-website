<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";
  import ProjectOffCanvas from "./ProjectOffCanvas.svelte";
  import { navigate } from "$lib/navigate.js";

  let selected = null;
  let gallerySection;
  let isMobile = false;
  let prefersReduced = false;

  const items = [
    { title: "Création de logo",     date: "2024", desc: "Refonte complète de l'identité visuelle et création d'un système graphique minimaliste.", image: "/images/photo.webp"  },
    { title: "Identité visuelle et stratégie",       date: "2023", desc: "Développement d'une plateforme de marque et direction artistique globale.",               image: "/images/photo2.webp" },
    { title: "Couverture d'événements",            date: "2024", desc: "Conception d'interfaces modernes axées sur l'expérience utilisateur.",                    image: "/images/photo.webp"  },
    { title: "Conception de site web",          date: "2022", desc: "Études utilisateurs et architecture d'information pour application mobile.",               image: "/images/photo.webp"  },
    { title: "Accompagnement", date: "2023", desc: "Supervision créative et mise en place d'un univers visuel premium.",                      image: "/images/photo2.webp" },
    { title: "Gestion des réseaux sociaux",       date: "2024", desc: "Concept motion design pour lancement de produit digital.",                                image: "/images/photo.webp"  },
  ];

  let cardEls = [];
  let wrapperEls = [];
  let infoEls = [];
  let imgEls = [];
  let servicesBtnEl;

  let cardMetrics = [];
  let secTop = 0, secBottom = 0;
  let measured = false;

  let prevWrapperY = [];
  let prevInfoOp = [];
  let prevInfoTY = [];
  let prevImgDark = [];
  let prevImgScaled = [];

  let sectionVisible = false;
  let intersectionObs;
  let resizeObs;
  let resizeTimer;
  let mediaQuery;

  const SPEED_DESKTOP = -132;
  const SPEED_MOBILE = -64;
  const Q = 0.5;
  const quantize = (v) => Math.round(v / Q) * Q;
  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

  function handleButtonMove(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  function measure() {
    if (!gallerySection) return;
    const scrollY = (window.lenis?.animatedScroll ?? window.scrollY) || 0;

    const sr = gallerySection.getBoundingClientRect();
    secTop = sr.top + scrollY;
    secBottom = secTop + sr.height;

    cardMetrics = [];
    for (let i = 0; i < items.length; i++) {
      const el = cardEls[i];
      if (!el) {
        cardMetrics.push({ top: 0, height: 0 });
        continue;
      }
      const r = el.getBoundingClientRect();
      cardMetrics.push({ top: r.top + scrollY, height: r.height });
    }

    prevWrapperY = new Array(items.length).fill(null);
    prevInfoOp = new Array(items.length).fill(null);
    prevInfoTY = new Array(items.length).fill(null);
    prevImgDark = new Array(items.length).fill(null);
    prevImgScaled = new Array(items.length).fill(null);
    measured = true;
  }

  function onScroll(scrollY, { vh, isMobile: mob }) {
    if (!sectionVisible || prefersReduced || !measured) return;
    if (secTop - scrollY > vh + 700 || secBottom - scrollY < -700) return;

    const speed = mob ? SPEED_MOBILE : SPEED_DESKTOP;

    for (let i = 0; i < items.length; i++) {
      const wrapper = wrapperEls[i];
      if (!wrapper) continue;
      const m = cardMetrics[i];
      if (!m?.height) continue;

      const center = m.top - scrollY + m.height * 0.5;
      const progress = clamp((center - vh * 0.5) / vh, -1, 1);
      const wY = quantize(progress * speed);

      if (wY !== prevWrapperY[i]) {
        wrapper.style.transform = `translate3d(0,${wY}px,0)`;
        prevWrapperY[i] = wY;
      }

      if (mob) {
        const info = infoEls[i];
        const img = imgEls[i];
        if (!info || !img) continue;

        const dist = Math.abs(center - vh * 0.5);
        const active = dist < m.height * 0.42;
        const tgtOp = active ? 1 : 0;
        const tgtTY = active ? 0 : -10;

        const curOp = prevInfoOp[i] !== null ? prevInfoOp[i] : tgtOp;
        const curTY = prevInfoTY[i] !== null ? prevInfoTY[i] : tgtTY;
        const newOp = curOp + (tgtOp - curOp) * 0.18;
        const newTY = curTY + (tgtTY - curTY) * 0.18;

        prevInfoOp[i] = newOp;
        prevInfoTY[i] = newTY;

        const qOp = Math.round(newOp * 40) / 40;
        const qTY = quantize(newTY);
        const dark = newOp > 0.5;

        info.style.opacity = qOp;
        info.style.transform = `translate3d(0,${qTY}px,0)`;

        if (dark !== prevImgDark[i]) {
          img.style.filter = dark ? "brightness(0.68)" : "";
          prevImgDark[i] = dark;
        }
        if (dark !== prevImgScaled[i]) {
          img.style.transform = dark ? "scale(1.035) translateZ(0)" : "translateZ(0)";
          prevImgScaled[i] = dark;
        }
      }
    }
  }

  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      isMobile = window.innerWidth <= 900;
      measure();
    }, 100);
  }

  function openProject(item) {
    selected = item;
    document.body.style.overflow = "hidden";
  }

  function closeProject() {
    selected = null;
    document.body.style.overflow = "";
  }

  onMount(() => {
    isMobile = window.innerWidth <= 900;

    mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReduced = mediaQuery.matches;

    const onMotion = (e) => {
      prefersReduced = e.matches;
    };

    if (mediaQuery.addEventListener) mediaQuery.addEventListener("change", onMotion);
    else mediaQuery.addListener(onMotion);

    requestAnimationFrame(() => {
      measure();
      registerParallax(onScroll);
    });

    intersectionObs = new IntersectionObserver(([entry]) => {
      const wasVisible = sectionVisible;
      sectionVisible = entry.isIntersecting;
      if (sectionVisible && !wasVisible) measure();
    }, { rootMargin: "500px 0px 500px 0px", threshold: 0 });

    intersectionObs.observe(gallerySection);

    resizeObs = new ResizeObserver(handleResize);
    resizeObs.observe(gallerySection);

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });

    return () => {
      if (mediaQuery?.removeEventListener) mediaQuery.removeEventListener("change", onMotion);
      else if (mediaQuery?.removeListener) mediaQuery.removeListener(onMotion);
    };
  });

  onDestroy(() => {
    if (!browser) return;
    unregisterParallax(onScroll);
    intersectionObs?.disconnect();
    resizeObs?.disconnect();
    clearTimeout(resizeTimer);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("orientationchange", handleResize);
    document.body.style.overflow = "";
  });
</script>

<section class="gallery" bind:this={gallerySection}>
  <div class="top-header">
    <div class="header-spacer"></div>
    <div class="header-title-wrap">
      <h2>Nos services</h2>
    </div>
  </div>

  <div class="gallery-header">
    <div class="intro-card">
      <p>
        Nous imaginons des identités fortes, des expériences digitales immersives
        et des directions artistiques pensées pour laisser une empreinte durable.
      </p>
    </div>
  </div>

  <div class="gallery-grid">
    {#each items as item, i}
      <div
        class="card"
        bind:this={cardEls[i]}
        data-cursor="view"
        role="button"
        tabindex="0"
        on:click={() => openProject(item)}
        on:keydown={(e) => e.key === "Enter" && openProject(item)}
      >
        <div class="card-image-wrapper" bind:this={wrapperEls[i]}>
          <img
            bind:this={imgEls[i]}
            src={item.image}
            alt={item.title}
            loading={i < 2 ? "eager" : "lazy"}
            fetchpriority={i < 2 ? "high" : "auto"}
            decoding="async"
            draggable="false"
          />
        </div>

        <div class="info" bind:this={infoEls[i]}>
          <span class="date">{item.date}</span>
          <span class="title">{item.title}</span>
        </div>

        <span class="card-index" aria-hidden="true">
          {String(i + 1).padStart(2, "0")}
        </span>

        <div class="card-plus">+</div>
      </div>
    {/each}
  </div>

  <div class="gallery-footer">
    <button
      class="services-btn"
      bind:this={servicesBtnEl}
      type="button"
      data-cursor="button"
      on:mousemove={handleButtonMove}
      on:click={() => navigate("services")}
    >
      <span class="services-btn-flip" data-text="Découvrir tous les services">
        <span class="services-btn-text">Découvrir tous les services</span>
      </span>
    </button>
  </div>
</section>

<ProjectOffCanvas {selected} {items} on:close={closeProject} />

<style>
  .gallery {
    position: relative;
    width: 100%;
    background: #000;
    padding: 0 0 10rem 0;
    overflow: clip;
    contain: layout paint;
    isolation: isolate;
  }

  .top-header {
    width: 100%;
    min-height: clamp(120px, 16vw, 210px);
    display: grid;
    grid-template-columns: 48% 52%;
    align-items: end;
    background: #000;
  }

  .header-spacer {
    min-height: 1px;
  }

  .header-title-wrap {
    padding: clamp(2rem, 4vw, 4rem) clamp(1.5rem, 3vw, 3rem)
      clamp(1.2rem, 2vw, 1.8rem);
  }

  .header-title-wrap h2 {
    margin: 0;
    font-family: "Aboreto", serif;
    font-weight: 400;
    font-size: clamp(2.5rem, 5vw, 5.5rem);
    line-height: 0.95;
    letter-spacing: -0.045em;
    color: #f5f1e8;
  }

  .gallery-header {
    position: relative;
    z-index: 2;
    width: min(1500px, 92%);
    margin: 0 auto;
    display: flex;
    justify-content: flex-end;
    padding-top: 0.5rem;
  }

  .intro-card {
    width: min(560px, 100%);
    background: #111;
    padding: 2.5rem 2.3rem;
    box-shadow: 0 14px 38px rgba(0, 0, 0, 0.22);
    contain: layout paint;
  }

  .intro-card p {
    margin: 0;
    font-family: "General Sans", sans-serif;
    font-size: 1rem;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.62);
  }

  .gallery-grid {
    position: relative;
    z-index: 3;
    width: min(1500px, 92%);
    margin: 3rem auto 0 auto;
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    grid-template-rows: repeat(4, minmax(150px, 12vw));
    gap: 1rem;
    grid-template-areas:
      "card1 card1 card2 card2 card3 card3"
      "card4 card4 card2 card2 card3 card3"
      "card4 card4 card2 card2 card6 card6"
      "card4 card4 card5 card5 card6 card6";
    contain: layout paint;
  }

  .card {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    background: #161616;
    min-height: 0;
    contain: layout paint;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .card:nth-child(1) { grid-area: card1; }
  .card:nth-child(2) { grid-area: card2; }
  .card:nth-child(3) { grid-area: card3; }
  .card:nth-child(4) { grid-area: card4; }
  .card:nth-child(5) { grid-area: card5; }
  .card:nth-child(6) { grid-area: card6; }

  .card-image-wrapper {
    position: absolute;
    inset-inline: 0;
    top: -14%;
    height: 128%;
    will-change: transform;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .card:nth-child(1) .card-image-wrapper,
  .card:nth-child(5) .card-image-wrapper {
    top: -28%;
    height: 158%;
  }

  .card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform: translateZ(0);
    will-change: transform, filter;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transition: filter 0.34s ease, transform 0.42s ease;
    user-select: none;
    pointer-events: none;
  }

  .card:hover img {
    filter: brightness(0.68);
    transform: scale(1.035) translateZ(0);
  }

  .info {
    position: absolute;
    top: 16px;
    left: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 14px;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    background: rgba(255, 255, 255, 0.14);
    color: #fff;
    font-size: 0.8rem;
    opacity: 0;
    transform: translate3d(0, -10px, 0);
    transition: opacity 0.28s ease, transform 0.28s ease;
    z-index: 2;
    will-change: opacity, transform;
    contain: paint;
  }

  .card:hover .info {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  .date { opacity: 0.7; }
  .title { font-family: "General Sans", sans-serif; }

  .card-index {
    position: absolute;
    top: 16px;
    right: 16px;
    font-family: "General Sans", sans-serif;
    font-size: 0.65rem;
    letter-spacing: 0.18em;
    color: rgba(255, 255, 255, 0.3);
    z-index: 2;
    pointer-events: none;
    transition: color 0.28s ease;
  }

  .card:hover .card-index {
    color: rgba(255, 255, 255, 0.58);
  }

  .card-plus {
    position: absolute;
    bottom: 16px;
    left: 16px;
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: #fff;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    background: rgba(255, 255, 255, 0.14);
    transition: transform 0.28s ease, background 0.28s ease;
    z-index: 2;
    will-change: transform;
    contain: paint;
  }

  .card:hover .card-plus {
    transform: scale(1.1);
    background: rgba(255, 255, 255, 0.22);
  }

  .gallery-footer {
    text-align: center;
    margin-top: 6rem;
  }

  .services-btn {
    position: relative;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 1.5rem;
    font-size: 0.9rem;
    font-family: "General Sans", sans-serif;
    white-space: nowrap;
    color: #fff;
    border: none;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    border-radius: 3px;
    box-shadow:
      0 6px 8px rgba(0, 0, 0, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      inset 0 -1px 1px rgba(0, 0, 0, 0.08);
    transition:
      transform 1.2s cubic-bezier(.22,.61,.36,1),
      box-shadow 1.2s cubic-bezier(.22,.61,.36,1),
      background 1.2s cubic-bezier(.22,.61,.36,1);
  }

  .services-btn-flip {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
  }

  .services-btn-text {
    display: block;
    transform: translateY(0%);
    transition: transform 0.45s cubic-bezier(.22,.61,.36,1);
  }

  .services-btn-flip::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition: transform 0.45s cubic-bezier(.22,.61,.36,1);
    white-space: nowrap;
    color: inherit;
  }

  .services-btn:hover .services-btn-text {
    transform: translateY(-100%);
  }

  .services-btn:hover .services-btn-flip::after {
    transform: translateY(0%);
  }

  .services-btn::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: radial-gradient(
      80px circle at var(--mx, 50%) var(--my, 50%),
      rgba(212, 175, 55, 0.95),
      rgba(212, 102, 55, 0.45) 40%,
      transparent 75%
    );
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.22s ease;
    pointer-events: none;
    filter: drop-shadow(0 0 3px rgba(212, 175, 55, 0.35));
  }

  .services-btn:hover::before {
    opacity: 1;
  }

  @media (max-width: 1100px) {
    .top-header { min-height: 92vh; min-height: clamp(110px, 14vw, 170px); }
    .header-title-wrap h2 { font-size: clamp(4rem, 12vw, 8rem); }
    .gallery-grid { grid-template-rows: repeat(4, minmax(120px, 15vw)); }
    .intro-card { width: min(520px, 100%); }
  }

  @media (max-width: 900px) {
    .gallery { padding: 0 0 8rem 0; }

    .top-header {
      grid-template-columns: 1fr;
      min-height: auto;
    }

    .header-title-wrap {
      padding: 1.5rem 1rem 1rem;
    }

    .header-title-wrap h2 {
      font-size: clamp(2.4rem, 11vw, 4rem);
    }

    .gallery-header {
      width: min(92%, 760px);
      margin: 0 auto;
      display: block;
      padding-top: 0;
    }

    .intro-card { width: 100%; padding: 1.6rem 1.4rem; }
    .intro-card p { font-size: 0.95rem; line-height: 1.65; }

    .gallery-grid {
      width: min(94%, 760px);
      margin: 2rem auto 0 auto;
      grid-template-columns: 1fr;
      grid-template-rows: none;
      grid-template-areas: none;
      gap: 0.9rem;
    }

    .card:nth-child(1),
    .card:nth-child(2),
    .card:nth-child(3),
    .card:nth-child(4),
    .card:nth-child(5),
    .card:nth-child(6) {
      grid-area: auto;
    }

    .card:nth-child(1) { aspect-ratio: 1.45/1; }
    .card:nth-child(2) { aspect-ratio: 0.92/1.18; }
    .card:nth-child(3) { aspect-ratio: 1.1/1; }
    .card:nth-child(4) { aspect-ratio: 0.92/1.22; }
    .card:nth-child(5) { aspect-ratio: 1.5/1; }
    .card:nth-child(6) { aspect-ratio: 1.08/1; }

    .card-image-wrapper { top: -10%; height: 120%; }
    .card:nth-child(1) .card-image-wrapper,
    .card:nth-child(5) .card-image-wrapper { top: -22%; height: 144%; }

    .card:hover img { filter: none; transform: translateZ(0); }
    .card:hover .info { opacity: 0; transform: translate3d(0, -10px, 0); }
    .card:hover .card-plus { transform: none; background: rgba(255, 255, 255, 0.14); }

    .gallery-footer { margin-top: 4rem; }
  }

  @media (max-width: 640px) {
    .gallery { padding: 0 0 6.5rem 0; }
    .header-title-wrap { padding: 1.3rem 1rem 0.9rem; }
    .gallery-grid { width: min(94%, 560px); gap: 0.75rem; }
    .card-image-wrapper { top: -9%; height: 118%; }
    .card:nth-child(1) .card-image-wrapper,
    .card:nth-child(5) .card-image-wrapper { top: -18%; height: 138%; }
    .info { top: 14px; left: 14px; padding: 9px 12px; font-size: 0.74rem; }
    .card-plus { bottom: 14px; left: 14px; width: 38px; height: 38px; font-size: 1rem; }
    .card-index { top: 14px; right: 14px; }
    .services-btn { padding: 0 1.2rem; font-size: 0.8rem; }
  }

  @media (max-width: 420px) {
    .gallery { padding: 0 0 5.5rem 0; }
    .header-title-wrap { padding: 1.1rem 1rem 0.85rem; }
    .intro-card { padding: 1.25rem 1.05rem; }
    .intro-card p { font-size: 0.86rem; line-height: 1.55; }
    .gallery-grid { width: min(94%, 420px); gap: 0.65rem; }
    .card-image-wrapper { top: -8%; height: 116%; }
    .card:nth-child(1) .card-image-wrapper,
    .card:nth-child(5) .card-image-wrapper { top: -16%; height: 132%; }
    .info { top: 12px; left: 12px; padding: 8px 11px; font-size: 0.7rem; }
    .card-plus { bottom: 12px; left: 12px; width: 34px; height: 34px; font-size: 0.95rem; }
    .card-index { top: 12px; right: 12px; }
    .gallery-footer { margin-top: 3rem; }
    .services-btn { padding: 0 1rem; font-size: 0.72rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    .card img,
    .info,
    .card-plus,
    .services-btn,
    .services-btn-text,
    .services-btn-flip::after {
      transition: none;
    }

    .card-image-wrapper { transform: none !important; }
  }
</style>