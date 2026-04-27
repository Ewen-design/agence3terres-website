<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { navigate } from "$lib/navigate.js";

  const items = [
    {
      title: "Création de logo",
      date: "2024",
      desc: "Refonte complète de l'identité visuelle et création d'un système graphique minimaliste.",
      image: "images/appareil_photo.webp",
      images: [
        "images/appareil_photo.webp",
        "images/telephone2.webp",
        "images/telephone_parfum.webp"
      ],
      hoverInfo: ["Création de logo", "Direction artistique", "Identité visuelle"]
    },
    {
      title: "Identité visuelle et stratégie",
      date: "2023",
      desc: "Développement d'une plateforme de marque et direction artistique globale.",
      image: "images/telephone2.webp",
      images: [
        "images/telephone2.webp",
        "images/appareil_photo.webp",
        "images/parfum_ordinateur.webp"
      ],
      hoverInfo: ["Identité & stratégie", "Brand platform", "Direction créative"]
    },
    {
      title: "Couverture d'événements",
      date: "2024",
      desc: "Conception d'interfaces modernes axées sur l'expérience utilisateur.",
      image: "images/appareil_photo.webp",
      images: [
        "images/appareil_photo.webp",
        "images/telephone_main.webp",
        "images/telephone2.webp"
      ],
      hoverInfo: ["Événementiel", "Captation & contenu", "Déploiement visuel"]
    },
    {
      title: "Conception de site web",
      date: "2022",
      desc: "Études utilisateurs et architecture d'information pour application mobile.",
      image: "images/telephone_parfum.webp",
      images: [
        "images/telephone_parfum.webp",
        "images/telephone_main.webp",
        "images/parfum_ordinateur.webp"
      ],
      hoverInfo: ["Site web", "UI Design", "UX Design"]
    },
    {
      title: "Accompagnement",
      date: "2023",
      desc: "Supervision créative et mise en place d'un univers visuel premium.",
      image: "images/parfum_ordinateur.webp",
      images: [
        "images/parfum_ordinateur.webp",
        "images/telephone_parfum.webp",
        "images/appareil_photo.webp"
      ],
      hoverInfo: ["Accompagnement", "Conseil créatif", "Suivi de marque"]
    },
    {
      title: "Gestion des réseaux sociaux",
      date: "2024",
      desc: "Concept motion design pour lancement de produit digital.",
      image: "images/telephone_main.webp",
      images: [
        "images/telephone_main.webp",
        "images/telephone2.webp",
        "images/parfum_ordinateur.webp"
      ],
      hoverInfo: ["Réseaux sociaux", "Contenus premium", "Stratégie éditoriale"]
    }
  ];

  let gallerySectionEl;
  let galleryIntroGroupEl;
  let galleryContentGroupEl;
  let galleryGridEl;
  let introCardEl;

  let isMobile = $state(false);
  let activeMobileIndex = $state(0);
  let displayedCardImages = $state(items.map((item) => item.image));
  let incomingCardImages = $state(items.map((item) => item.image));
  let overlayVisible = $state(items.map(() => false));

  let prefersReduced = false;

  let resizeTimer = null;
  let scrollRaf = null;
  let mobileScrollRaf = null;
  let removeMotionListener;
  let hoverTimers = [];
  let hoverFadeTimers = [];
  let hoverIndexes = items.map(() => 0);
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

  function preloadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };

      img.onload = finish;
      img.onerror = finish;
      img.src = src;

      if (img.complete) {
        finish();
      }
    });
  }

  function clearHoverTimer(index) {
    if (!hoverTimers[index]) return;
    clearInterval(hoverTimers[index]);
    hoverTimers[index] = null;
  }

  function clearHoverFadeTimer(index) {
    if (!hoverFadeTimers[index]) return;
    clearTimeout(hoverFadeTimers[index]);
    hoverFadeTimers[index] = null;
  }

  function transitionCardImage(index, nextImage) {
    clearHoverFadeTimer(index);

    incomingCardImages[index] = nextImage;
    overlayVisible[index] = true;
    incomingCardImages = [...incomingCardImages];
    overlayVisible = [...overlayVisible];

    hoverFadeTimers[index] = setTimeout(() => {
      displayedCardImages[index] = nextImage;
      incomingCardImages[index] = nextImage;
      overlayVisible[index] = false;
      displayedCardImages = [...displayedCardImages];
      incomingCardImages = [...incomingCardImages];
      overlayVisible = [...overlayVisible];
      hoverFadeTimers[index] = null;
    }, 220);
  }

  function handleCardEnter(index) {
    if (isMobile || prefersReduced) return;

    const variants = items[index].images || [items[index].image];
    if (variants.length < 2) return;

    clearHoverTimer(index);
    hoverIndexes[index] = 0;

    hoverTimers[index] = setInterval(() => {
      hoverIndexes[index] = (hoverIndexes[index] + 1) % variants.length;
      transitionCardImage(index, variants[hoverIndexes[index]]);
    }, 440);
  }

  function handleCardLeave(index) {
    clearHoverTimer(index);
    clearHoverFadeTimer(index);
    hoverIndexes[index] = 0;
    displayedCardImages[index] = items[index].image;
    incomingCardImages[index] = items[index].image;
    overlayVisible[index] = false;
    displayedCardImages = [...displayedCardImages];
    incomingCardImages = [...incomingCardImages];
    overlayVisible = [...overlayVisible];
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
    }, 70);
  }

  onMount(() => {
    if (!browser) return;

    updateDevice();

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReduced = mq.matches;

    Promise.allSettled(items.flatMap((item) => item.images || [item.image]).map(preloadImage));

    const onMotion = (e) => {
      prefersReduced = e.matches;
      updateIntro();
      updateGalleryFlowMotion();
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
    hoverTimers.forEach((_, index) => clearHoverTimer(index));
    hoverFadeTimers.forEach((_, index) => clearHoverFadeTimer(index));
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
          onmouseenter={() => handleCardEnter(i)}
          onmouseleave={() => handleCardLeave(i)}
        >
          <div
            class="card-index-wrap"
            class:index-top={!isMobile && i < 3}
            class:index-bottom={!isMobile && i >= 3}
            class:index-mobile={isMobile}
            aria-hidden="true"
          >
            <span class="card-index-inner">{String(i + 1).padStart(2, "0")}</span>
          </div>

          <div class="card-media">
            <div class="card-image-wrapper">
              <img
                class="card-image card-image-base"
                src={displayedCardImages[i]}
                alt={item.title}
                loading={i < 2 ? "eager" : "lazy"}
                fetchpriority={i < 2 ? "high" : "auto"}
                decoding="async"
                draggable="false"
              />
              <img
                class="card-image card-image-overlay"
                class:is-visible={overlayVisible[i]}
                src={incomingCardImages[i]}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                draggable="false"
              />

              {#if item.images?.length}
                <div class="mobile-preview-card" aria-hidden="true">
                  <div class="mobile-preview-slideshow">
                    {#each item.images as image, slideIndex}
                      <img
                        src={image}
                        alt=""
                        class="mobile-preview-slide"
                        loading="lazy"
                        style={`--slide-index:${slideIndex}; --slide-count:${item.images.length};`}
                      />
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          </div>

          <div class="info" aria-hidden="true">
            <span class="info-chip info-primary">{item.hoverInfo[0]}</span>
            <span class="info-chip info-secondary">{item.hoverInfo[1]}</span>
            <span class="info-chip info-secondary">{item.hoverInfo[2]}</span>
          </div>
        </div>
      {/each}
    </div>

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
      transform .42s ease,
      opacity   .34s ease;
    user-select:    none;
    pointer-events: none;
    will-change:    transform, filter;
    outline:        1px solid transparent;
  }

  .card-image-overlay {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition:
      opacity .22s ease,
      filter .34s ease,
      transform .42s ease;
  }

  .card-image-overlay.is-visible { opacity: 1; }

  .card:hover .card-image { filter: brightness(.68); transform: scale(1.02) translateZ(0); }

  .info {
    position:  absolute;
    top:       10px;
    left:      10px;
    display:   flex;
    flex-direction: column;
    align-items: flex-start;
    gap:       8px;
    opacity:   0;
    transform: translate3d(0,-10px,0);
    transition: opacity .28s ease, transform .28s ease;
    z-index:   2;
    pointer-events: none;
  }

  .info-chip {
    display:    inline-flex;
    align-items: center;
    min-height: 30px;
    padding:    .38rem .9rem .42rem;
    border:     1px solid rgba(255,255,255,.08);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    background: rgba(255,255,255,.14);
    color:      #fff;
    border-radius: 3px;
    line-height:   1;
    white-space:   nowrap;
    transform:  translate3d(0,10px,0);
    opacity:    0;
    transition:
      opacity   .34s ease,
      transform .42s cubic-bezier(.22,.61,.36,1),
      background .28s ease;
  }

  .info-primary {
    font-family:    "Clash Display", sans-serif;
    font-style:     normal;
    font-weight:    300;
    font-size:      clamp(1.5rem,1.8vw,1.95rem);
   
    min-height:     48px;
    padding:        .45rem 1.15rem .52rem;
  }

  .info-secondary {
    font-family:    "Clash Display", sans-serif;
    font-size:      clamp(.82rem,.9vw,.98rem);
    font-weight:    300;
   
  }

  .card:hover .info                   { opacity: 1; transform: translate3d(0,0,0); }
  .card:hover .info-chip              { opacity: 1; transform: translate3d(0,0,0); }
  .card:hover .info-chip:nth-child(1) { transition-delay: .02s; }
  .card:hover .info-chip:nth-child(2) { transition-delay: .06s; }
  .card:hover .info-chip:nth-child(3) { transition-delay: .10s; }

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
    font-weight:    500;
    font-size:      1.05rem;
    line-height:    1;
    letter-spacing: -0.02em;
    color:          var(--index-color);
    opacity:        0;
    transition:
      transform .42s cubic-bezier(.22,.61,.36,1),
      opacity   .32s ease;
  }

  .index-top    .card-index-inner { transform: translate3d(0, 115%,0); }
  .index-bottom .card-index-inner,
  .index-mobile .card-index-inner { transform: translate3d(0,-115%,0); }

  .card:hover .card-index-inner,
  .card.mobile-active .card-index-inner {
    transform: translate3d(0,0,0);
    opacity:   1;
  }

  .gallery-footer { text-align: center; margin-top: 6rem; }

  .services-btn {
    font-family: "Clash Display", sans-serif;
    font-weight: 300;
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
      margin:     2rem 0 0;
      display:    flex;
      grid-template-columns: none;
      grid-template-rows:    none;
      grid-template-areas:   none;
      gap:        .95rem;
      overflow-x: auto;
      overflow-y: visible;
      padding-top:    0;
      padding-bottom: 2.6rem;
      padding-left:  calc((100vw - clamp(285px,82vw,360px)) / 2);
      padding-right: calc((100vw - clamp(285px,82vw,360px)) / 2);
      scroll-snap-type:  x mandatory;
      scroll-snap-stop:  always;
      scroll-padding-left:  calc((100vw - clamp(285px,82vw,360px)) / 2);
      scroll-padding-right: calc((100vw - clamp(285px,82vw,360px)) / 2);
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

    .card:nth-child(3) .card-index-wrap,
    .card:nth-child(4) .card-index-wrap {
      bottom: -30px;
      left: 0;
      height: 1.15em;
    }

    .card {
      flex:             0 0 clamp(285px,82vw,360px);
      width:            clamp(285px,82vw,360px);
      aspect-ratio:     .84 / 1.4;
      scroll-snap-align: center;
      scroll-snap-stop:  always;
      overflow:         visible;
    }

    .card:hover .card-image { filter: none; transform: translateZ(0); }
    .card:hover .info      { opacity: 0; transform: translate3d(0,-10px,0); }
    .card:hover .info-chip { opacity: 0; transform: translate3d(0,10px,0); }

    .card.mobile-active .card-image-base { filter: brightness(.68); transform: scale(1.02) translateZ(0); }
    .card.mobile-active .info            { opacity: 1; transform: translate3d(0,0,0); }
    .card.mobile-active .info-chip       { opacity: 1; transform: translate3d(0,0,0); }
    .card.mobile-active .info-chip:nth-child(1) { transition-delay: .02s; }
    .card.mobile-active .info-chip:nth-child(2) { transition-delay: .06s; }
    .card.mobile-active .info-chip:nth-child(3) { transition-delay: .10s; }
    .card.mobile-active .mobile-preview-card {
      opacity: 1;
      transform: translate3d(0,0,0) scale(1);
      transition-delay: .18s;
    }

    .card-index-wrap,
    .index-mobile { z-index: 8; overflow: hidden; width: max-content; height: 1.15em; }

    .index-mobile { top: auto; bottom: -30px; left: 0; }

    .mobile-preview-card {
      position: absolute;
      right: 12px;
      bottom: 12px;
      z-index: 2;
      width: clamp(5.5rem, 23vw, 7rem);
      aspect-ratio: 0.88;
      overflow: hidden;
      border-radius: 2px;
      background: rgba(255,255,255,.94);
      box-shadow: 0 18px 48px rgba(11, 8, 5, 0.28);
      opacity: 0;
      transform: translate3d(0,10px,0) scale(0.985);
      transition:
        opacity .34s ease,
        transform .42s cubic-bezier(.22,.61,.36,1);
      pointer-events: none;
    }

    .mobile-preview-slideshow {
      position: relative;
      width: 100%;
      height: 100%;
      background: #111;
    }

    .mobile-preview-slide {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      animation-name: parallax-gallery-mobile-slideshow;
      animation-duration: calc(var(--slide-count) * 1.95s);
      animation-timing-function: ease-in-out;
      animation-iteration-count: infinite;
      animation-delay: calc(var(--slide-index) * 1.95s);
      animation-fill-mode: both;
    }

    .gallery-footer { margin-top: 4rem; }
  }

  @media (max-width: 640px) {
    .gallery              { padding: 0 0 6.8rem 0; }
    .gallery-header       { padding: 2.4rem 1.1rem 2.15rem; }
    .intro-card           { width: min(76vw,21rem); }

    .gallery-grid {
      gap:          .8rem;
      padding-bottom: 2.45rem;
      padding-left:  calc((100vw - clamp(270px,82vw,330px)) / 2);
      padding-right: calc((100vw - clamp(270px,82vw,330px)) / 2);
      scroll-padding-left:  calc((100vw - clamp(270px,82vw,330px)) / 2);
      scroll-padding-right: calc((100vw - clamp(270px,82vw,330px)) / 2);
    }

    .card           { flex-basis: clamp(270px,82vw,330px); width: clamp(270px,82vw,330px); }
    .mobile-preview-card { right: 10px; bottom: 10px; width: clamp(5.1rem, 23vw, 6.3rem); }
    .info           { top: 12px; left: 12px; gap: 7px; }
    .info-primary   { font-size: clamp(1.3rem,6vw,1.7rem); min-height: 42px; padding: .42rem 1rem .48rem; }
    .info-secondary { font-size: .78rem; }
    .info-chip      { padding: .36rem .78rem .4rem; }
    .card-index-wrap,
    .index-mobile   { bottom: -28px; }
    .gallery-footer { margin-top: 4rem; }
    .services-btn   { padding: 0 1.2rem; font-size: .8rem; }

  }

  @media (max-width: 420px) {
    .gallery           { padding: 0 0 5.8rem 0; }
    .intro-card        { width: min(80vw,18rem); }
    .intro-card p      { font-size: clamp(1.15rem,6.4vw,1.95rem); line-height: 1.16; }

    .gallery-grid {
      gap:          .75rem;
      padding-bottom: 2.3rem;
      padding-left:  calc((100vw - 84vw) / 2);
      padding-right: calc((100vw - 84vw) / 2);
      scroll-padding-left:  calc((100vw - 84vw) / 2);
      scroll-padding-right: calc((100vw - 84vw) / 2);
    }

    .card           { flex-basis: 84vw; width: 84vw; }
    .info           { top: 10px; left: 10px; gap: 6px; }
    .info-primary   { min-height: 38px; padding: .36rem .9rem .42rem; }
    .info-secondary { font-size: .72rem; }
    .info-chip      { padding: .32rem .72rem .36rem; }
    .card-index-wrap,
    .index-mobile   { bottom: -26px; }
    .mobile-preview-card { right: 9px; bottom: 9px; width: clamp(4.8rem, 22vw, 5.8rem); }
    .gallery-footer { margin-top: 3rem; }
    .services-btn   { padding: 0 1rem; font-size: .72rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    .card img,
    .info,
    .info-chip,
    .card-index-inner,
    .intro-card,
    .services-btn,
    .services-btn-text,
    .services-btn-flip::after,
    .mobile-preview-card,
    .mobile-preview-slide { transition: none; animation: none; }

    .intro-card { transform: none !important; opacity: 1 !important; }
    .gallery,
    .gallery-intro-group,
    .gallery-content-group { transform: none !important; }
  }

  @keyframes parallax-gallery-mobile-slideshow {
    0% {
      opacity: 0;
      transform: scale(1.02);
    }

    8%,
    40% {
      opacity: 1;
      transform: scale(1);
    }

    56%,
    100% {
      opacity: 0;
      transform: scale(0.985);
    }
  }
</style>
