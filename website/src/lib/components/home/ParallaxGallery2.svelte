<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { navigate } from "$lib/navigate.js";

  const items = [
    {
      title: "Création de logo",
      date: "2024",
      desc: "Refonte complète de l'identité visuelle et création d'un système graphique minimaliste.",
      image: "images/telephone3.webp"
    },
    {
      title: "Identité visuelle et stratégie",
      date: "2023",
      desc: "Développement d'une plateforme de marque et direction artistique globale.",
      image: "images/telephone2.webp"
    },
    {
      title: "Couverture d'événements",
      date: "2024",
      desc: "Conception d'interfaces modernes axées sur l'expérience utilisateur.",
      image: "images/appareil_photo.webp"
    },
    {
      title: "Conception de site web",
      date: "2022",
      desc: "Études utilisateurs et architecture d'information pour application mobile.",
      image: "images/telephone_parfum.webp"
    },
    {
      title: "Accompagnement",
      date: "2023",
      desc: "Supervision créative et mise en place d'un univers visuel premium.",
      image: "images/parfum_ordinateur.webp"
    },
    {
      title: "Gestion des réseaux sociaux",
      date: "2024",
      desc: "Concept motion design pour lancement de produit digital.",
      image: "images/telephone_main.webp"
    }
  ];

  let gallerySectionEl;
  let galleryIntroGroupEl;
  let galleryContentGroupEl;
  let galleryGridEl;
  let introCardEl;

  let isMobile = $state(false);
  let activeMobileIndex = $state(0);

  let prefersReduced = false;

  let resizeTimer = null;
  let scrollRaf = null;
  let mobileScrollRaf = null;
  let mobileAutoAdvanceTimer = null;
  let mobileAutoResumeTimer = null;
  let isAutoScrollingMobile = false;
  let removeMotionListener;
  let introOpacity = -1;
  let introY = -999;

  function handleButtonMove(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  function updateDevice() {
    isMobile = window.innerWidth <= 900;
  }

  function updateGalleryFlowMotion() {
    if (!gallerySectionEl || !galleryIntroGroupEl || !galleryContentGroupEl) return;

    galleryIntroGroupEl.style.transform = "translate3d(0,0,0)";
    galleryContentGroupEl.style.transform = "translate3d(0,0,0)";
  }

  function updateIntro() {
    if (!introCardEl) return;

    const op = 1;
    const y = 0;

    if (op !== introOpacity) {
      introCardEl.style.opacity = `${op}`;
      introOpacity = op;
    }
    if (y !== introY) {
      introCardEl.style.transform = `translate3d(0,${y}px,0)`;
      introY = y;
    }
  }

  function updateMobileActive() {
    if (!isMobile || !galleryGridEl) return;
    const cards = galleryGridEl.querySelectorAll(".card");
    if (!cards.length) return;

    const centerX = galleryGridEl.scrollLeft + galleryGridEl.clientWidth * .5;
    let nearest = 0;
    let nearestD = Infinity;

    cards.forEach((card, i) => {
      const dist = Math.abs(card.offsetLeft + card.offsetWidth * .5 - centerX);
      if (dist < nearestD) { nearestD = dist; nearest = i; }
    });

    activeMobileIndex = nearest;
  }

  function scrollToMobileIndex(index, behavior = "smooth") {
    if (!galleryGridEl || !isMobile) return;
    const cards = galleryGridEl.querySelectorAll(".card");
    const target = cards[index];
    if (!target) return;

    const left =
      target.offsetLeft - (galleryGridEl.clientWidth - target.offsetWidth) * 0.5;

    isAutoScrollingMobile = true;
    galleryGridEl.scrollTo({
      left: Math.max(0, left),
      behavior
    });

    window.setTimeout(() => {
      isAutoScrollingMobile = false;
    }, behavior === "smooth" ? 900 : 0);
  }

  function clearMobileAutoTimers() {
    clearInterval(mobileAutoAdvanceTimer);
    clearTimeout(mobileAutoResumeTimer);
    mobileAutoAdvanceTimer = null;
    mobileAutoResumeTimer = null;
  }

  function startMobileAutoAdvance() {
    clearMobileAutoTimers();
    if (!isMobile || !galleryGridEl || prefersReduced) return;

    mobileAutoAdvanceTimer = setInterval(() => {
      const nextIndex = (activeMobileIndex + 1) % items.length;
      scrollToMobileIndex(nextIndex, "smooth");
    }, 5000);
  }

  function pauseAndResumeMobileAutoAdvance() {
    clearMobileAutoTimers();
    if (!isMobile || prefersReduced) return;

    mobileAutoResumeTimer = setTimeout(() => {
      startMobileAutoAdvance();
    }, 7000);
  }

  function scheduleIntroUpdate() {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      updateIntro();
      updateGalleryFlowMotion();
      scrollRaf = null;
    });
  }

  function handleMobileGridScroll() {
    if (!isMobile) return;
    if (!isAutoScrollingMobile) {
      pauseAndResumeMobileAutoAdvance();
    }
    if (mobileScrollRaf) cancelAnimationFrame(mobileScrollRaf);
    mobileScrollRaf = requestAnimationFrame(() => {
      updateMobileActive();
      mobileScrollRaf = null;
    });
  }

  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateDevice();
      updateIntro();
      updateGalleryFlowMotion();
      updateMobileActive();
      startMobileAutoAdvance();
    }, 70);
  }

  onMount(() => {
    if (!browser) return;

    updateDevice();

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReduced = mq.matches;

    const onMotion = (e) => {
      prefersReduced = e.matches;
      updateIntro();
      updateGalleryFlowMotion();
      startMobileAutoAdvance();
    };
    if (mq.addEventListener) {
      mq.addEventListener("change", onMotion);
      removeMotionListener = () => mq.removeEventListener("change", onMotion);
    } else {
      mq.addListener(onMotion);
      removeMotionListener = () => mq.removeListener(onMotion);
    }

    requestAnimationFrame(() => {
      updateIntro();
      updateGalleryFlowMotion();
      updateMobileActive();
      startMobileAutoAdvance();
    });

    window.addEventListener("scroll", scheduleIntroUpdate, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });
    galleryGridEl?.addEventListener("scroll", handleMobileGridScroll, { passive: true });
  });

  onDestroy(() => {
    if (!browser) return;

    window.removeEventListener("scroll", scheduleIntroUpdate);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("orientationchange", handleResize);
    galleryGridEl?.removeEventListener("scroll", handleMobileGridScroll);

    removeMotionListener?.();
    clearMobileAutoTimers();
    clearTimeout(resizeTimer);
    if (scrollRaf) cancelAnimationFrame(scrollRaf);
    if (mobileScrollRaf) cancelAnimationFrame(mobileScrollRaf);
  });
</script>

<section class="gallery" bind:this={gallerySectionEl}>
  <div class="gallery-intro-group" bind:this={galleryIntroGroupEl}>
    <div class="gallery-header">
      <div class="intro-card" bind:this={introCardEl}>
        <p>
          <span class="intro-main">Nous imaginons des identités fortes, des expériences digitales immersives</span>
          <span class="intro-muted"> et des directions artistiques pensées pour laisser une empreinte durable.</span>
        </p>
      </div>
    </div>
  </div>

  <div class="gallery-content-group" bind:this={galleryContentGroupEl}>
    <div class="gallery-grid" bind:this={galleryGridEl}>
      {#each items as item, i}
        <div
          class="card"
          role="presentation"
          class:mobile-active={isMobile && i === activeMobileIndex}
          class:top-row={!isMobile && i < 3}
          class:bottom-row={!isMobile && i >= 3}
        >
          <div
            class="card-title-wrap"
            class:card-title-mobile={isMobile}
            class:card-title-overlay={!isMobile}
            class:stacked-meta={!isMobile && (i === 2 || i === 3)}
            aria-hidden="true"
          >
            <span class="card-title">{item.title}</span>
          </div>

          <div
            class="card-index-wrap"
            class:index-top={!isMobile && i < 3}
            class:index-bottom={!isMobile && i >= 3}
            class:index-mobile={isMobile}
            class:stacked-index={!isMobile && (i === 2 || i === 3)}
            aria-hidden="true"
          >
            <span class="card-index-inner">{String(i + 1).padStart(2, "0")}</span>
          </div>

          <div class="card-media">
            <div class="card-image-wrapper">
              <img
                class="card-image"
                src={item.image}
                alt={item.title}
                loading={i < 2 ? "eager" : "lazy"}
                fetchpriority={i < 2 ? "high" : "auto"}
                decoding="async"
                draggable="false"
              />
            </div>
          </div>
        </div>
      {/each}
    </div>

    {#if isMobile}
      <button
        class="mobile-nav mobile-nav-prev"
        class:is-hidden={activeMobileIndex === 0}
        type="button"
        aria-label="Carte précédente"
        onclick={() => {
          pauseAndResumeMobileAutoAdvance();
          scrollToMobileIndex(Math.max(0, activeMobileIndex - 1));
        }}
      >
        <span class="mobile-nav-chevron" aria-hidden="true"></span>
      </button>

      <button
        class="mobile-nav mobile-nav-next"
        class:is-hidden={activeMobileIndex === items.length - 1}
        type="button"
        aria-label="Carte suivante"
        onclick={() => {
          pauseAndResumeMobileAutoAdvance();
          scrollToMobileIndex(Math.min(items.length - 1, activeMobileIndex + 1));
        }}
      >
        <span class="mobile-nav-chevron" aria-hidden="true"></span>
      </button>
    {/if}

    <div class="gallery-footer">
      <button
        class="services-btn"
        type="button"
        data-cursor="button"
        onmousemove={handleButtonMove}
        onclick={() => navigate("services")}
      >
        <span class="services-btn-flip" data-text="Découvrir tous les services">
          <span class="services-btn-text">Découvrir tous les services</span>
        </span>
      </button>
    </div>
  </div>
</section>

<style>
  .gallery {
    --section-bg:          #000;
    --title-color:         #f5f1e8;
    --intro-body:          rgba(255,255,255,.64);
    --intro-main:          #fff;
    --intro-muted:         rgba(255,255,255,.70);
    --index-color:         #fff;
    --index-mobile-color:  #353535;
    --mobile-title-color:  #353535;
    --desktop-title-color: rgba(255,255,255,.96);
    --services-btn-text:   #fff;
    --services-btn-border: rgba(255,255,255,.15);
    --services-btn-bg:     rgba(255,255,255,.10);

    position:  relative;
    width:     100%;
    background: var(--section-bg);
    padding:   0 0 10rem 0;
    overflow:  clip;
    isolation: isolate;
    will-change: transform;
    transform: translate3d(0,0,0);
  }

  .gallery-intro-group,
  .gallery-content-group {
    position: relative;
    will-change: transform;
    transform: translate3d(0,0,0);
  }

  .gallery-header {
    position: relative;
    z-index:  2;
    width:    min(1500px,100%);
    margin:   0 auto;
    display:  flex;
    justify-content: flex-end;
    padding:
      clamp(2rem,4vw,4rem)
      clamp(1.5rem,3vw,3rem)
      clamp(1.6rem,2.8vw,2.6rem);
  }

  .intro-card {
    width:               min(560px,100%);
    opacity:             0.18;
    transform:           translate3d(0,18px,0);
    will-change:         transform, opacity;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .intro-card p {
    margin:         0;
    max-width:      30ch;
    font-family:    "Clash Display", sans-serif;
    font-weight:    200;
    font-size:      clamp(1.3rem,2.8vw,2.8rem);
    line-height:    1;
   
    color:          var(--intro-body);
  }

  .intro-main  { color: var(--intro-main); }
  .intro-muted { color: var(--intro-muted); }

  .gallery-grid {
    position: relative;
    z-index:  3;
    width:    min(2200px, 99vw);
    margin:   4.75rem auto 0;
    display:  grid;
    grid-template-columns: repeat(12,minmax(0,1fr));
    grid-template-rows:    repeat(13,minmax(114px,9.2vw));
    gap:      1.15rem;
    grid-template-areas:
      "card1 card1 card1 card1 card1 card1 card2 card2 card2 card2 card2 card2"
      "card1 card1 card1 card1 card1 card1 card2 card2 card2 card2 card2 card2"
      "card1 card1 card1 card1 card1 card1 card2 card2 card2 card2 card2 card2"
      "card1 card1 card1 card1 card1 card1 card3 card3 card3 card3 card3 card3"
      "card1 card1 card1 card1 card1 card1 card3 card3 card3 card3 card3 card3"
      "card4 card4 card4 card4 card4 card4 card4 card4 card4 card4 card4 card4"
      "card4 card4 card4 card4 card4 card4 card4 card4 card4 card4 card4 card4"
      "card4 card4 card4 card4 card4 card4 card4 card4 card4 card4 card4 card4"
      "card4 card4 card4 card4 card4 card4 card4 card4 card4 card4 card4 card4"
      "card4 card4 card4 card4 card4 card4 card4 card4 card4 card4 card4 card4"
      "card5 card5 card5 card5 card5 card5 card5 card6 card6 card6 card6 card6"
      "card5 card5 card5 card5 card5 card5 card5 card6 card6 card6 card6 card6"
      "card5 card5 card5 card5 card5 card5 card5 card6 card6 card6 card6 card6"
      "card5 card5 card5 card5 card5 card5 card5 card6 card6 card6 card6 card6";
    overflow: visible;
  }

  .card {
    position:  relative;
    overflow:  visible;
    cursor:    default;
    background: transparent;
    min-height: 0;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 3px;
  }

  .card:nth-child(1) { grid-area: card1; }
  .card:nth-child(2) { grid-area: card2; }
  .card:nth-child(3) { grid-area: card3; }
  .card:nth-child(4) { grid-area: card4; }
  .card:nth-child(5) { grid-area: card5; }
  .card:nth-child(6) { grid-area: card6; }

  .card:nth-child(3) .card-index-wrap,
  .card:nth-child(4) .card-index-wrap {
    top: auto;
    bottom: 14px;
    left: 14px;
    z-index: 7;
    height: auto;
  }

  .card:nth-child(3) .card-index-inner,
  .card:nth-child(4) .card-index-inner {
    transform: translate3d(0, 115%, 0);
  }

  .card-title-wrap {
    position: absolute;
    z-index: 7;
    pointer-events: none;
  }

  .card-title-overlay {
    left: 14px;
    bottom: 14px;
    max-width: min(70%, 20rem);
    overflow: hidden;
  }

  .card-title-mobile {
    left: 0;
    bottom: -56px;
    width: min(100%, 18rem);
    overflow: hidden;
  }

  .stacked-meta.card-title-overlay {
    bottom: 36px;
  }

  .card-title {
    display: block;
    font-family: "Clash Display", sans-serif;
    font-weight: 300;
    line-height: 1;
    letter-spacing: -0.02em;
    transition:
      transform .42s cubic-bezier(.22,.61,.36,1),
      opacity .32s ease;
  }

  .card-title-overlay .card-title {
    font-size: clamp(1rem, 1.2vw, 1.3rem);
    color: var(--desktop-title-color);
    text-shadow: 0 2px 12px rgba(0,0,0,.24);
    opacity: 0;
    transform: translate3d(0, 115%, 0);
  }

  .card-title-mobile .card-title {
    font-size: .76rem;
    color: var(--mobile-title-color);
    opacity: 0;
    transform: translate3d(0, -115%, 0);
  }

  .card:nth-child(3):hover .card-index-inner,
  .card:nth-child(4):hover .card-index-inner {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }

  .card-media {
    position:      absolute;
    inset:         0;
    overflow:      hidden;
    border-radius: 3px;
    background:    #161616;
  }

  .card-image-wrapper {
    position: absolute;
    inset: 0;
    overflow: hidden;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .card-image {
    width:               100%;
    height:              100%;
    object-fit:          cover;
    display:             block;
    transform:           translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transition:
      filter    .34s ease,
      transform .42s ease;
    user-select:    none;
    pointer-events: none;
    will-change:    transform, filter;
    outline:        1px solid transparent;
  }

  .card:hover .card-image { filter: brightness(.68); transform: scale(1.02) translateZ(0); }

  .card-index-wrap {
    position:       absolute;
    left:           0;
    z-index:        6;
    overflow:       hidden;
    height:         1.1em;
    pointer-events: none;
    width:          max-content;
  }

  .index-top    { top:    -30px; }
  .index-bottom { bottom: -30px; }

  .card-index-inner {
    display:        block;
    font-family:    "Clash Display", sans-serif;
    font-style:     normal;
    font-weight:    400;
    font-size:      1.34rem;
    line-height:    1;
    letter-spacing: -0.02em;
    color:          var(--index-mobile-color);
    opacity:        0;
    text-shadow:    0 1px 8px rgba(0,0,0,.18);
    transition:
      transform .42s cubic-bezier(.22,.61,.36,1),
      opacity   .32s ease;
  }

  .index-top    .card-index-inner { transform: translate3d(0, 115%,0); }
  .index-bottom .card-index-inner,
  .index-mobile .card-index-inner { transform: translate3d(0,-115%,0); }

  .card:hover .card-index-inner,
  .card:hover .card-title-overlay .card-title,
  .card.mobile-active .card-index-inner {
    transform: translate3d(0,0,0);
    opacity:   1;
  }

  .card.mobile-active .card-title-mobile .card-title {
    transform: translate3d(0,0,0);
    opacity: 1;
  }

  .gallery-footer { text-align: center; margin-top: 6rem; }

  .mobile-nav {
    display: none;
  }

  .services-btn {
    font-family: "Clash Display", sans-serif;
    font-weight: 400;
    position:   relative;
    height:     40px;
    display:    inline-flex;
    align-items: center;
    justify-content: center;
    padding:    0 1.5rem;
    font-size:  .9rem;
    white-space: nowrap;
    color:      var(--services-btn-text);
    border:     1px solid var(--services-btn-border);
    cursor:     pointer;
    background: var(--services-btn-bg);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 2px;
    box-shadow:  0 6px 8px rgba(0,0,0,.04);
    transition:
      transform  1.2s cubic-bezier(.22,.61,.36,1),
      box-shadow 1.2s cubic-bezier(.22,.61,.36,1),
      background 1.2s cubic-bezier(.22,.61,.36,1);
  }

  .services-btn-flip {
    position:    relative;
    display:     block;
    overflow:    hidden;
    height:      1.2em;
    line-height: 1.2em;
  }

  .services-btn-text {
    display:    block;
    transform:  translateY(0%);
    transition: transform .45s cubic-bezier(.22,.61,.36,1);
  }

  .services-btn-flip::after {
    content:    attr(data-text);
    position:   absolute;
    left:       0;
    top:        0;
    line-height: 1.2em;
    transform:  translateY(100%);
    transition: transform .45s cubic-bezier(.22,.61,.36,1);
    white-space: nowrap;
    color:      inherit;
  }

  .services-btn:hover .services-btn-text        { transform: translateY(-100%); }
  .services-btn:hover .services-btn-flip::after { transform: translateY(0%); }

  .services-btn::before,
  .services-btn::after {
    content:  "";
    position: absolute;
    inset:    -1px;
    border-radius: inherit;
    pointer-events: none;
    opacity:  0;
  }

  .services-btn::before {
    border:             1px solid transparent;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      68px circle at var(--mx,50%) var(--my,50%),
      rgba(255,225,140,1)    0%,
      rgba(212,175, 55,.95) 22%,
      rgba(212,102, 55,.55) 45%,
      rgba(212,102, 55,.12) 62%,
      transparent           78%
    );
    transition: opacity .25s ease;
  }

  .services-btn::after {
    border:             1px solid transparent;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      78px circle at var(--mx,50%) var(--my,50%),
      rgba(212,175,55,.55) 0%,
      rgba(212,102,55,.22) 42%,
      transparent          72%
    );
    filter:    blur(2px);
    transition: opacity .25s ease;
  }

  .services-btn:hover::before,
  .services-btn:hover::after { opacity: 1; }

  @media (max-width: 1100px) {
    .gallery-grid         { grid-template-rows: repeat(13,minmax(80px,8.9vw)); }
    .intro-card           { width: min(520px,100%); }
  }

  @media (max-width: 900px) {
    .gallery { padding: 0 0 8rem 0; }

    .gallery-header {
      width:       min(100%,760px);
      margin:      0 auto;
      display:     flex;
      justify-content: center;
      padding:     2.75rem 1.25rem 2.4rem;
    }

    .intro-card   { width: min(72vw,24rem); }
    .intro-card p { font-size: clamp(1.3rem,6.8vw,2.7rem); max-width: 18ch; line-height: 1.04; color: var(--intro-body); }

    .gallery-grid {
      width:      100%;
      margin:     2.8rem 0 0;
      display:    flex;
      grid-template-columns: none;
      grid-template-rows:    none;
      grid-template-areas:   none;
      gap:        .95rem;
      overflow-x: auto;
      overflow-y: visible;
      padding-top:    0;
      padding-bottom: 2.6rem;
      padding-left:  calc((100vw - clamp(292px,84vw,368px)) / 2);
      padding-right: calc((100vw - clamp(292px,84vw,368px)) / 2);
      scroll-snap-type:  x mandatory;
      scroll-snap-stop:  always;
      scroll-padding-left:  calc((100vw - clamp(292px,84vw,368px)) / 2);
      scroll-padding-right: calc((100vw - clamp(292px,84vw,368px)) / 2);
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-x:  contain;
      scrollbar-width: none;
    }

    .gallery-grid::-webkit-scrollbar { display: none; }

    .card:nth-child(1),
    .card:nth-child(2),
    .card:nth-child(3),
    .card:nth-child(4),
    .card:nth-child(5),
    .card:nth-child(6) { grid-area: auto; }

    .card-title-mobile {
      left: 14px;
      right: 14px;
      bottom: 2.45rem;
      width: auto;
      max-width: none;
    }

    .card {
      flex:             0 0 clamp(292px,84vw,368px);
      width:            clamp(292px,84vw,368px);
      aspect-ratio:     .8 / 1.76;
      scroll-snap-align: center;
      scroll-snap-stop:  always;
      overflow:         visible;
    }

    .card:hover .card-image { filter: none; transform: translateZ(0); }
    .card.mobile-active .card-image { filter: brightness(.68); transform: scale(1.02) translateZ(0); }

    .card-index-wrap,
    .index-mobile { z-index: 8; overflow: hidden; width: max-content; height: 1.15em; }

    .index-mobile { top: auto; bottom: 14px; left: 14px; }

    .card-index-inner {
      color: var(--index-mobile-color);
      font-size: .82rem;
      font-weight: 400;
      text-shadow: 0 1px 8px rgba(0,0,0,.32);
    }

    .card-title-mobile .card-title {
      font-size: 1.26rem;
      font-weight: 300;
      line-height: 1.04;
      max-width: 15ch;
      color: #FFF;
      text-shadow: 0 1px 10px rgba(0,0,0,.34);
    }

    .mobile-nav {
      position: absolute;
      top: calc(2rem + (clamp(292px,84vw,368px) * 1.76 / 0.8) * 0.5);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: 3rem;
      transform: translateY(-50%);
      z-index: 10;
      border: 0;
      background: transparent;
      padding: 0;
      color: #FFF;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      opacity: 1;
      transition: opacity .35s ease;
    }

    .mobile-nav-prev { left: .45rem; }
    .mobile-nav-next { right: .45rem; }

    .mobile-nav.is-hidden {
      opacity: 0;
      pointer-events: none;
    }

    .mobile-nav-chevron {
      display: block;
      width: 1.35rem;
      height: 1.35rem;
      border-top: 1.5px solid currentColor;
      border-right: 1.5px solid currentColor;
      filter: drop-shadow(0 1px 8px rgba(0,0,0,.34));
    }

    .mobile-nav-prev .mobile-nav-chevron {
      transform: rotate(-135deg);
    }

    .mobile-nav-next .mobile-nav-chevron {
      transform: rotate(45deg);
    }

    .gallery-footer { margin-top: 2.75rem; }
  }

  @media (max-width: 640px) {
    .gallery              { padding: 0 0 6.8rem 0; }
    .gallery-header       { padding: 2.4rem 1.1rem 2.15rem; }
    .intro-card           { width: min(76vw,21rem); }

    .gallery-grid {
      gap:          .8rem;
      padding-bottom: 2.45rem;
      padding-left:  calc((100vw - clamp(276px,84vw,338px)) / 2);
      padding-right: calc((100vw - clamp(276px,84vw,338px)) / 2);
      scroll-padding-left:  calc((100vw - clamp(276px,84vw,338px)) / 2);
      scroll-padding-right: calc((100vw - clamp(276px,84vw,338px)) / 2);
    }

    .card           { flex-basis: clamp(276px,84vw,338px); width: clamp(276px,84vw,338px); }
    .card-title-mobile { left: 12px; right: 12px; bottom: 2.3rem; }
    .card-index-wrap,
    .index-mobile   { bottom: 12px; left: 12px; }
    .card-title-mobile .card-title { font-size: 1.14rem; }
    .mobile-nav { width: 2.6rem; height: 2.6rem; }
    .mobile-nav-chevron {
      width: 1.18rem;
      height: 1.18rem;
      border-top-width: 1.4px;
      border-right-width: 1.4px;
    }
    .mobile-nav-prev { left: .3rem; }
    .mobile-nav-next { right: .3rem; }
    .gallery-footer { margin-top: 2.85rem; }
    .services-btn   { padding: 0 1.2rem; font-size: .8rem; }

  }

  @media (max-width: 420px) {
    .gallery           { padding: 0 0 5.8rem 0; }
    .intro-card        { width: min(80vw,18rem); }
    .intro-card p      { font-size: clamp(1.15rem,6.4vw,1.95rem); line-height: 1.16; }

    .gallery-grid {
      gap:          .75rem;
      padding-bottom: 2.3rem;
      padding-left:  calc((100vw - 86vw) / 2);
      padding-right: calc((100vw - 86vw) / 2);
      scroll-padding-left:  calc((100vw - 86vw) / 2);
      scroll-padding-right: calc((100vw - 86vw) / 2);
    }

    .card           { flex-basis: 86vw; width: 86vw; }
    .card-title-mobile { left: 10px; right: 10px; bottom: 2.15rem; }
    .card-index-wrap,
    .index-mobile   { bottom: 10px; left: 10px; }
    .card-title-mobile .card-title { font-size: 1.06rem; }
    .mobile-nav { width: 2.35rem; height: 2.35rem; }
    .mobile-nav-chevron {
      width: 1.06rem;
      height: 1.06rem;
      border-top-width: 1.3px;
      border-right-width: 1.3px;
    }
    .mobile-nav-prev { left: .18rem; }
    .mobile-nav-next { right: .18rem; }
    .gallery-footer { margin-top: 2.3rem; }
    .services-btn   { padding: 0 1rem; font-size: .72rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    .card img,
    .card-index-inner,
    .card-title,
    .intro-card,
    .services-btn,
    .services-btn-text,
    .services-btn-flip::after { transition: none; animation: none; }

    .intro-card { transform: none !important; opacity: 1 !important; }
    .gallery,
    .gallery-intro-group,
    .gallery-content-group { transform: none !important; }
  }
</style>
