<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";
  import ProjectOffCanvas from "./ProjectOffCanvas.svelte";
  import { navigate } from "$lib/navigate.js";

  let selected = null;
  let gallerySection;
  let galleryGridEl;
  let isMobile = false;
  let prefersReduced = false;
  let activeMobileIndex = 0;

  const items = [
    { title: "Création de logo", date: "2024", desc: "Refonte complète de l'identité visuelle et création d'un système graphique minimaliste.", image: "/images/photo.webp" },
    { title: "Identité visuelle et stratégie", date: "2023", desc: "Développement d'une plateforme de marque et direction artistique globale.", image: "/images/photo2.webp" },
    { title: "Couverture d'événements", date: "2024", desc: "Conception d'interfaces modernes axées sur l'expérience utilisateur.", image: "/images/photo.webp" },
    { title: "Conception de site web", date: "2022", desc: "Études utilisateurs et architecture d'information pour application mobile.", image: "/images/photo.webp" },
    { title: "Accompagnement", date: "2023", desc: "Supervision créative et mise en place d'un univers visuel premium.", image: "/images/photo2.webp" },
    { title: "Gestion des réseaux sociaux", date: "2024", desc: "Concept motion design pour lancement de produit digital.", image: "/images/photo.webp" },
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
  let mobileScrollRaf = null;

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

  function updateMobileActiveCard() {
    if (!isMobile || !galleryGridEl || !cardEls.length) return;

    const centerX = galleryGridEl.scrollLeft + galleryGridEl.clientWidth * 0.5;
    let nearest = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < cardEls.length; i++) {
      const el = cardEls[i];
      if (!el) continue;
      const cardCenter = el.offsetLeft + el.offsetWidth * 0.5;
      const dist = Math.abs(cardCenter - centerX);

      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    }

    activeMobileIndex = nearest;
  }

  function handleMobileGridScroll() {
    if (!isMobile) return;
    if (mobileScrollRaf) cancelAnimationFrame(mobileScrollRaf);
    mobileScrollRaf = requestAnimationFrame(() => {
      updateMobileActiveCard();
    });
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

      if (mob && !galleryGridEl) {
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
      requestAnimationFrame(() => {
        updateMobileActiveCard();
      });
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
      updateMobileActiveCard();
    });

    intersectionObs = new IntersectionObserver(([entry]) => {
      const wasVisible = sectionVisible;
      sectionVisible = entry.isIntersecting;
      if (sectionVisible && !wasVisible) {
        measure();
        requestAnimationFrame(() => {
          updateMobileActiveCard();
        });
      }
    }, { rootMargin: "500px 0px 500px 0px", threshold: 0 });

    intersectionObs.observe(gallerySection);

    resizeObs = new ResizeObserver(handleResize);
    resizeObs.observe(gallerySection);

    galleryGridEl?.addEventListener("scroll", handleMobileGridScroll, { passive: true });

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
    if (mobileScrollRaf) cancelAnimationFrame(mobileScrollRaf);
    galleryGridEl?.removeEventListener("scroll", handleMobileGridScroll);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("orientationchange", handleResize);
    document.body.style.overflow = "";
  });
</script>

<section class="gallery" bind:this={gallerySection}>
  <div class="top-header">
    <div class="header-title-wrap">
      <h2>Nos services</h2>
    </div>
    <div class="header-spacer"></div>
  </div>

  <div class="gallery-header">
    <div class="intro-card">
      <p>
        <span class="intro-main">Nous imaginons des identités fortes, des expériences digitales immersives</span>
        <span class="intro-muted"> et des directions artistiques pensées pour laisser une empreinte durable.</span>
      </p>
    </div>
  </div>

  <div class="gallery-grid" bind:this={galleryGridEl}>
    {#each items as item, i}
      <div
        class="card"
        class:mobile-active={isMobile && i === activeMobileIndex}
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
    grid-template-columns: 52% 48%;
    align-items: end;
    background: #000;
  }

  .header-spacer {
    min-height: 1px;
  }

  .header-title-wrap {
    padding: clamp(2rem, 4vw, 4rem) clamp(1.5rem, 3vw, 3rem)
      clamp(1.2rem, 2vw, 1.8rem);
    display: flex;
    justify-content: flex-start;
  }

  .header-title-wrap h2 {
    margin: 0;
    font-family: "Titre italic", serif;
    font-style: italic;
    font-weight: 100;
    font-size: clamp(2.5rem, 5vw, 5.5rem);
    line-height: 0.95;
    letter-spacing: -0.045em;
    color: #f5f1e8;
    text-align: left;
  }

  .gallery-header {
    position: relative;
    z-index: 2;
    width: min(1500px, 92%);
    margin: 0 auto;
    display: flex;
    justify-content: flex-end;
    padding-top: clamp(1rem, 1.8vw, 1.6rem);
  }

  .intro-card {
    width: min(560px, 100%);
    padding: 0;
    box-shadow: none;
    contain: layout paint;
  }

  .intro-card p {
    margin: 0;
    max-width: 30ch;
    font-family: "General Sans", sans-serif;
    font-weight: 300;
    font-size: clamp(1.2rem, 2.25vw, 2.3rem);
    line-height: 1.08;
    letter-spacing: -0.02em;
    color: #fff;
  }

  .intro-main {
    color: #fff;
  }

  .intro-muted {
    color: rgba(255, 255, 255, 0.7);
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
    font-family: "General Sans", sans-serif;
    position: relative;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 1.5rem;
    font-size: 0.9rem;
    white-space: nowrap;
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.15);
    cursor: pointer;
    background: rgba(255, 255, 255, 0.10);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 2px;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.04);
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

  .services-btn::before,
  .services-btn::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
  }

  .services-btn::before {
    border: 1px solid transparent;
    border-radius: inherit;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      rgba(255, 225, 140, 1) 0%,
      rgba(212, 175, 55, 0.95) 22%,
      rgba(212, 102, 55, 0.55) 45%,
      rgba(212, 102, 55, 0.12) 62%,
      transparent 78%
    );
    transition: opacity 0.25s ease;
  }

  .services-btn::after {
    border: 1px solid transparent;
    border-radius: inherit;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      rgba(212, 175, 55, 0.55) 0%,
      rgba(212, 102, 55, 0.22) 42%,
      transparent 72%
    );
    filter: blur(2px);
    transition: opacity 0.25s ease;
  }

  .services-btn:hover::before,
  .services-btn:hover::after {
    opacity: 1;
  }

  @media (max-width: 1100px) {
    .top-header { min-height: 92vh; min-height: clamp(110px, 14vw, 170px); }
    .header-title-wrap h2 { font-size: clamp(4rem, 12vw, 8rem); }
    .gallery-grid { grid-template-rows: repeat(4, minmax(120px, 15vw)); }
    .intro-card { width: min(520px, 100%); }
  }

  @media (max-width: 900px) {
    .gallery {
      padding: 0 0 8rem 0;
    }

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
      padding-top: 1.15rem;
    }

    .intro-card {
      width: 100%;
      padding: 0;
    }

    .intro-card p {
      font-size: clamp(1.2rem, 5vw, 1.55rem);
      line-height: 1.08;
      max-width: 30ch;
      color: rgba(255, 255, 255, 0.64);
    }

    .intro-main,
    .intro-muted {
      color: rgba(255, 255, 255, 0.64);
    }

    .gallery-grid {
      width: 100%;
      margin: 2rem 0 0 0;
      display: flex;
      grid-template-columns: none;
      grid-template-rows: none;
      grid-template-areas: none;
      gap: 0.95rem;
      overflow-x: auto;
      overflow-y: visible;
      padding-top: 0;
      padding-bottom: 0.2rem;
      padding-left: calc((100vw - clamp(285px, 82vw, 360px)) / 2);
      padding-right: calc((100vw - clamp(285px, 82vw, 360px)) / 2);
      scroll-snap-type: x mandatory;
      scroll-snap-stop: always;
      scroll-padding-left: calc((100vw - clamp(285px, 82vw, 360px)) / 2);
      scroll-padding-right: calc((100vw - clamp(285px, 82vw, 360px)) / 2);
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-x: contain;
      scroll-behavior: smooth;
    }

    .gallery-grid::-webkit-scrollbar {
      display: none;
    }

    .gallery-grid {
      scrollbar-width: none;
    }

    .card:nth-child(1),
    .card:nth-child(2),
    .card:nth-child(3),
    .card:nth-child(4),
    .card:nth-child(5),
    .card:nth-child(6) {
      grid-area: auto;
    }

    .card {
      flex: 0 0 clamp(285px, 82vw, 360px);
      width: clamp(285px, 82vw, 360px);
      aspect-ratio: 0.84 / 1.22;
      scroll-snap-align: center;
      scroll-snap-stop: always;
    }

    .card-image-wrapper,
    .card:nth-child(1) .card-image-wrapper,
    .card:nth-child(5) .card-image-wrapper {
      top: -12%;
      height: 124%;
    }

    .card:hover img {
      filter: none;
      transform: translateZ(0);
    }

    .card:hover .info {
      opacity: 0;
      transform: translate3d(0, -10px, 0);
    }

    .card:hover .card-plus {
      transform: none;
      background: rgba(255, 255, 255, 0.14);
    }

    .card.mobile-active img {
      filter: brightness(0.68);
      transform: scale(1.035) translateZ(0);
    }

    .card.mobile-active .info {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }

    .card.mobile-active .card-index {
      color: rgba(255, 255, 255, 0.58);
    }

    .card.mobile-active .card-plus {
      transform: scale(1.1);
      background: rgba(255, 255, 255, 0.22);
    }

    .gallery-footer {
      margin-top: 4rem;
    }
  }

  @media (max-width: 640px) {
    .gallery {
      padding: 0 0 6.5rem 0;
    }

    .header-title-wrap {
      padding: 1.3rem 1rem 0.9rem;
    }

    .gallery-grid {
      gap: 0.8rem;
      padding-left: calc((100vw - clamp(270px, 82vw, 330px)) / 2);
      padding-right: calc((100vw - clamp(270px, 82vw, 330px)) / 2);
      scroll-padding-left: calc((100vw - clamp(270px, 82vw, 330px)) / 2);
      scroll-padding-right: calc((100vw - clamp(270px, 82vw, 330px)) / 2);
    }

    .card {
      flex-basis: clamp(270px, 82vw, 330px);
      width: clamp(270px, 82vw, 330px);
    }

    .card-image-wrapper,
    .card:nth-child(1) .card-image-wrapper,
    .card:nth-child(5) .card-image-wrapper {
      top: -11%;
      height: 122%;
    }

    .info {
      top: 14px;
      left: 14px;
      padding: 9px 12px;
      font-size: 0.74rem;
    }

    .card-plus {
      bottom: 14px;
      left: 14px;
      width: 38px;
      height: 38px;
      font-size: 1rem;
    }

    .card-index {
      top: 14px;
      right: 14px;
    }

    .services-btn {
      padding: 0 1.2rem;
      font-size: 0.8rem;
    }
  }

  @media (max-width: 420px) {
    .gallery {
      padding: 0 0 5.5rem 0;
    }

    .header-title-wrap {
      padding: 1.1rem 1rem 0.85rem;
    }

    .intro-card {
      padding: 0;
    }

    .intro-card p {
      font-size: clamp(1.15rem, 5vw, 1.35rem);
      line-height: 1.08;
    }

    .gallery-grid {
      gap: 0.75rem;
      padding-left: calc((100vw - 84vw) / 2);
      padding-right: calc((100vw - 84vw) / 2);
      scroll-padding-left: calc((100vw - 84vw) / 2);
      scroll-padding-right: calc((100vw - 84vw) / 2);
    }

    .card {
      flex-basis: 84vw;
      width: 84vw;
    }

    .card-image-wrapper,
    .card:nth-child(1) .card-image-wrapper,
    .card:nth-child(5) .card-image-wrapper {
      top: -10%;
      height: 120%;
    }

    .info {
      top: 12px;
      left: 12px;
      padding: 8px 11px;
      font-size: 0.7rem;
    }

    .card-plus {
      bottom: 12px;
      left: 12px;
      width: 34px;
      height: 34px;
      font-size: 0.95rem;
    }

    .card-index {
      top: 12px;
      right: 12px;
    }

    .gallery-footer {
      margin-top: 3rem;
    }

    .services-btn {
      padding: 0 1rem;
      font-size: 0.72rem;
    }
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

    .card-image-wrapper {
      transform: none !important;
    }

    .gallery-grid {
      scroll-behavior: auto;
    }
  }
</style>