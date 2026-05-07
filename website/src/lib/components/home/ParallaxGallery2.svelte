<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { navigate } from "$lib/navigate.js";

  const items = [
    {
      title: "Identite visuelle et strategie",
      image: "/images/carte_visite_desktop.webp",
      mobileImage: "/images/carte_visite_mobile.webp"
    },
    {
      title: "Conception de site web",
      image: "/images/telephone_parfum.webp"
    },
    {
      title: "Creation de logo",
      image: "/images/creation_logo_desktop.webp",
      mobileImage: "/images/creation_logo_mobile.webp"
    },
    {
      title: "Gestion des reseaux sociaux",
      image: "/images/telephone_main.webp"
    },
    {
      title: "Couverture d'evenements",
      image: "/images/appareil_photo.webp"
    },
    {
      title: "Suivi strategique",
      image: "/images/parfum_ordinateur.webp"
    }
  ];

  let resizeTimer;
  let prefersReduced = false;
  let removeMotionListener;
  let isMobile = false;
  let galleryEl;
  let visibilityObserver;
  let isInView = false;

  let desktopRailEl;
  let mobileRailEl;
  let desktopCardEls = [];
  let mobileCardEls = [];

  let activeDesktopIndex = 0;
  let activeMobileIndex = 0;
  let desktopScrollRaf = null;
  let mobileScrollRaf = null;
  let desktopAutoAdvanceTimer = null;
  let desktopAutoResumeTimer = null;
  let mobileAutoAdvanceTimer = null;
  let mobileAutoResumeTimer = null;
  let isAutoScrollingDesktop = false;
  let isAutoScrollingMobile = false;

  function measure() {
    if (!browser) return;
    isMobile = window.innerWidth <= 900;
  }

  function updateDesktopActive() {
    if (!desktopRailEl) return;

    const cards = desktopRailEl.querySelectorAll(".desktop-card");
    if (!cards.length) return;

    const centerX = desktopRailEl.scrollLeft + desktopRailEl.clientWidth * 0.5;
    let nearest = 0;
    let nearestDistance = Infinity;

    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft + card.offsetWidth * 0.5 - centerX);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = index;
      }
    });

    activeDesktopIndex = nearest;
  }

  function updateMobileActive() {
    if (!mobileRailEl) return;

    const cards = mobileRailEl.querySelectorAll(".mobile-card");
    if (!cards.length) return;

    const centerX = mobileRailEl.scrollLeft + mobileRailEl.clientWidth * 0.5;
    let nearest = 0;
    let nearestDistance = Infinity;

    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft + card.offsetWidth * 0.5 - centerX);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = index;
      }
    });

    activeMobileIndex = nearest;
  }

  function handleDesktopRailScroll() {
    if (!isAutoScrollingDesktop) {
      pauseAndResumeDesktopAutoAdvance();
    }
    if (desktopScrollRaf) cancelAnimationFrame(desktopScrollRaf);

    desktopScrollRaf = requestAnimationFrame(() => {
      updateDesktopActive();
      desktopScrollRaf = null;
    });
  }

  function handleMobileRailScroll() {
    if (!isAutoScrollingMobile) {
      pauseAndResumeMobileAutoAdvance();
    }
    if (mobileScrollRaf) cancelAnimationFrame(mobileScrollRaf);

    mobileScrollRaf = requestAnimationFrame(() => {
      updateMobileActive();
      mobileScrollRaf = null;
    });
  }

  function scrollToDesktopCard(index, behavior = "smooth") {
    const card = desktopCardEls[index];
    if (!desktopRailEl || !card) return;

    const targetLeft = card.offsetLeft - (desktopRailEl.clientWidth - card.offsetWidth) * 0.5;

    activeDesktopIndex = index;
    isAutoScrollingDesktop = true;
    desktopRailEl.scrollTo({
      left: Math.max(0, targetLeft),
      behavior
    });

    window.setTimeout(() => {
      isAutoScrollingDesktop = false;
      updateDesktopActive();
    }, behavior === "smooth" ? 900 : 0);
  }

  function scrollToMobileCard(index, behavior = "smooth") {
    const card = mobileCardEls[index];
    if (!mobileRailEl || !card) return;

    const targetLeft = card.offsetLeft - (mobileRailEl.clientWidth - card.offsetWidth) * 0.5;

    activeMobileIndex = index;
    isAutoScrollingMobile = true;
    mobileRailEl.scrollTo({
      left: Math.max(0, targetLeft),
      behavior
    });

    window.setTimeout(() => {
      isAutoScrollingMobile = false;
      updateMobileActive();
    }, behavior === "smooth" ? 900 : 0);
  }

  function clearDesktopAutoTimers() {
    clearInterval(desktopAutoAdvanceTimer);
    clearTimeout(desktopAutoResumeTimer);
    desktopAutoAdvanceTimer = null;
    desktopAutoResumeTimer = null;
  }

  function clearMobileAutoTimers() {
    clearInterval(mobileAutoAdvanceTimer);
    clearTimeout(mobileAutoResumeTimer);
    mobileAutoAdvanceTimer = null;
    mobileAutoResumeTimer = null;
  }

  function startDesktopAutoAdvance() {
    clearDesktopAutoTimers();
    if (!isInView || isMobile || !desktopRailEl || prefersReduced || items.length < 2) return;

    desktopAutoAdvanceTimer = setInterval(() => {
      const nextIndex = (activeDesktopIndex + 1) % items.length;
      scrollToDesktopCard(nextIndex, "smooth");
    }, 5000);
  }

  function pauseAndResumeDesktopAutoAdvance() {
    clearDesktopAutoTimers();
    if (!isInView || isMobile || prefersReduced || items.length < 2) return;

    desktopAutoResumeTimer = setTimeout(() => {
      startDesktopAutoAdvance();
    }, 7000);
  }

  function startMobileAutoAdvance() {
    clearMobileAutoTimers();
    if (!isInView || !isMobile || !mobileRailEl || prefersReduced || items.length < 2) return;

    mobileAutoAdvanceTimer = setInterval(() => {
      const nextIndex = (activeMobileIndex + 1) % items.length;
      scrollToMobileCard(nextIndex, "smooth");
    }, 5000);
  }

  function pauseAndResumeMobileAutoAdvance() {
    clearMobileAutoTimers();
    if (!isInView || !isMobile || prefersReduced || items.length < 2) return;

    mobileAutoResumeTimer = setTimeout(() => {
      startMobileAutoAdvance();
    }, 7000);
  }

  function handleButtonMove(event) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    button.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    button.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      measure();
      scrollToDesktopCard(activeDesktopIndex, "auto");
      scrollToMobileCard(activeMobileIndex, "auto");
      startDesktopAutoAdvance();
      startMobileAutoAdvance();
    }, 80);
  }

  onMount(() => {
    if (!browser) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReduced = mq.matches;

    const onMotion = (event) => {
      prefersReduced = event.matches;
      startDesktopAutoAdvance();
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
      requestAnimationFrame(() => {
        measure();
        updateDesktopActive();
        updateMobileActive();
        startDesktopAutoAdvance();
        startMobileAutoAdvance();
      });
    });

    visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isInView = !!entry?.isIntersecting;

        if (isInView) {
          startDesktopAutoAdvance();
          startMobileAutoAdvance();
          return;
        }

        clearDesktopAutoTimers();
        clearMobileAutoTimers();
      },
      { rootMargin: "-10% 0px -10% 0px", threshold: 0.15 }
    );

    visibilityObserver.observe(galleryEl);

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });
    desktopRailEl?.addEventListener("scroll", handleDesktopRailScroll, { passive: true });
    mobileRailEl?.addEventListener("scroll", handleMobileRailScroll, { passive: true });

    return () => {
      removeMotionListener?.();
      visibilityObserver?.disconnect();
      clearDesktopAutoTimers();
      clearMobileAutoTimers();
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      desktopRailEl?.removeEventListener("scroll", handleDesktopRailScroll);
      mobileRailEl?.removeEventListener("scroll", handleMobileRailScroll);
    };
  });

  onDestroy(() => {
    if (!browser) return;

    removeMotionListener?.();
    visibilityObserver?.disconnect();
    clearDesktopAutoTimers();
    clearMobileAutoTimers();
    clearTimeout(resizeTimer);
    desktopRailEl?.removeEventListener("scroll", handleDesktopRailScroll);
    mobileRailEl?.removeEventListener("scroll", handleMobileRailScroll);
    if (desktopScrollRaf) cancelAnimationFrame(desktopScrollRaf);
    if (mobileScrollRaf) cancelAnimationFrame(mobileScrollRaf);
  });
</script>

<section class="gallery" bind:this={galleryEl}>
  <div class="gallery-intro-group">
    <div class="gallery-header">
      <div class="intro-card">
        <p>
          <span class="intro-main">Nous imaginons des identites fortes, des experiences digitales immersives</span>
          <span class="intro-muted"> et des directions artistiques pensees pour laisser une empreinte durable.</span>
        </p>
      </div>
    </div>
  </div>

  <div class="gallery-content-group">
    <div class="desktop-stack">
      <div class="desktop-rail" bind:this={desktopRailEl}>
        {#each items as item, index}
          <a
            class="desktop-card"
            class:is-active={activeDesktopIndex === index}
            bind:this={desktopCardEls[index]}
            href="/services"
            data-cursor="view"
            aria-label={`Voir le service ${item.title}`}
            draggable="false"
          >
            <div class="desktop-image">
              <picture>
                {#if item.mobileImage}
                  <source media="(max-width: 900px)" srcset={item.mobileImage} />
                {/if}
                <img
                  src={item.image}
                  alt={item.title}
                  loading={index < 2 ? "eager" : "lazy"}
                  fetchpriority={index < 2 ? "high" : "auto"}
                  decoding="async"
                  draggable="false"
                />
              </picture>
              <div class="desktop-image-shade" aria-hidden="true"></div>
            </div>

            <div class="desktop-card-overlay">
              <div class="desktop-card-title-wrap" aria-hidden="true">
                <span class="desktop-card-title">{item.title}</span>
              </div>
            </div>
          </a>
        {/each}
      </div>

      <div class="desktop-nav-shell" aria-label="Navigation services desktop">
        <button
          class="desktop-nav-btn desktop-nav-prev"
          class:is-hidden={activeDesktopIndex === 0}
          type="button"
          aria-label="Service precedent"
          onclick={() => {
            pauseAndResumeDesktopAutoAdvance();
            scrollToDesktopCard(Math.max(activeDesktopIndex - 1, 0), prefersReduced ? "auto" : "smooth");
          }}
        >
          <span class="desktop-nav-chevron" aria-hidden="true"></span>
        </button>

        <button
          class="desktop-nav-btn desktop-nav-next"
          class:is-hidden={activeDesktopIndex === items.length - 1}
          type="button"
          aria-label="Service suivant"
          onclick={() => {
            pauseAndResumeDesktopAutoAdvance();
            scrollToDesktopCard(Math.min(activeDesktopIndex + 1, items.length - 1), prefersReduced ? "auto" : "smooth");
          }}
        >
          <span class="desktop-nav-chevron" aria-hidden="true"></span>
        </button>
      </div>
    </div>

    <div class="mobile-stack">
      <div class="mobile-rail" bind:this={mobileRailEl}>
        {#each items as item, index}
          <a
            class="mobile-card"
            class:is-active={activeMobileIndex === index}
            bind:this={mobileCardEls[index]}
            href="/services"
            data-cursor="view"
            aria-label={`Voir le service ${item.title}`}
            draggable="false"
          >
            <div class="mobile-card-title-wrap" aria-hidden="true">
              <span class="mobile-card-title">{item.title}</span>
            </div>

            <div class="mobile-image">
              <picture>
                {#if item.mobileImage}
                  <source media="(max-width: 900px)" srcset={item.mobileImage} />
                {/if}
                <img
                  src={item.image}
                  alt={item.title}
                  loading={index < 2 ? "eager" : "lazy"}
                  fetchpriority={index < 2 ? "high" : "auto"}
                  decoding="async"
                  draggable="false"
                />
              </picture>
            </div>
          </a>
        {/each}
      </div>

      <div class="mobile-nav-shell" aria-label="Navigation services mobile">
        <button
          class="mobile-nav-btn mobile-nav-prev"
          class:is-hidden={activeMobileIndex === 0}
          type="button"
          aria-label="Service precedent"
          onclick={() => {
            pauseAndResumeMobileAutoAdvance();
            scrollToMobileCard(Math.max(activeMobileIndex - 1, 0), prefersReduced ? "auto" : "smooth");
          }}
        >
          <span class="mobile-nav-chevron" aria-hidden="true"></span>
        </button>

        <button
          class="mobile-nav-btn mobile-nav-next"
          class:is-hidden={activeMobileIndex === items.length - 1}
          type="button"
          aria-label="Service suivant"
          onclick={() => {
            pauseAndResumeMobileAutoAdvance();
            scrollToMobileCard(Math.min(activeMobileIndex + 1, items.length - 1), prefersReduced ? "auto" : "smooth");
          }}
        >
          <span class="mobile-nav-chevron" aria-hidden="true"></span>
        </button>
      </div>
    </div>

    <div class="gallery-footer">
      <button
        class="services-btn"
        type="button"
        data-cursor="button"
        onmousemove={handleButtonMove}
        onclick={() => navigate("services")}
      >
        <span class="services-btn-flip" data-text="Decouvrir tous les services">
          <span class="services-btn-text">Decouvrir tous les services</span>
        </span>
      </button>
    </div>
  </div>
</section>

<style>
  .gallery {
    --section-bg: #000;
    --intro-body: rgba(255,255,255,.64);
    --intro-main: #fff;
    --intro-muted: rgba(255,255,255,.70);
    --desktop-title-color: rgba(255,255,255,.96);
    --services-btn-text: #fff;
    --services-btn-border: rgba(255,255,255,.15);
    --services-btn-bg: rgba(255,255,255,.10);
    position: relative;
    z-index: 0;
    width: 100%;
    background: var(--section-bg);
    padding: 0 0 10rem 0;
    overflow: clip;
    isolation: isolate;
  }

  .gallery-intro-group,
  .gallery-content-group {
    position: relative;
    z-index: 1;
  }

  .gallery-header {
    position: relative;
    z-index: 2;
    width: min(1500px,100%);
    margin: 0 auto;
    display: flex;
    justify-content: flex-end;
    padding:
      clamp(2rem,4vw,4rem)
      clamp(1.5rem,3vw,3rem)
      clamp(1.6rem,2.8vw,2.6rem);
  }

  .intro-card {
    position: relative;
    z-index: 2;
    width: min(560px,100%);
  }

  .intro-card p {
    margin: 0;
    max-width: 30ch;
    font-family: "Clash Display", sans-serif;
    font-weight: 200;
    font-size: clamp(1.3rem,2.8vw,2.8rem);
    line-height: 1;
    color: var(--intro-body);
  }

  .intro-main { color: var(--intro-main); }
  .intro-muted { color: var(--intro-muted); }

  .desktop-stack {
    display: block;
    width: 100%;
    margin: 0 auto;
    padding: clamp(5.8rem, 9vh, 7rem) 0 clamp(2.2rem, 5vh, 3.4rem);
    position: relative;
  }

  .desktop-rail {
    width: 100%;
    margin: 0;
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    overflow-y: visible;
    padding: 0 9vw 2rem;
    scroll-snap-type: x mandatory;
    scroll-snap-stop: always;
    scroll-padding-left: 9vw;
    scroll-padding-right: 9vw;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
  }

  .desktop-rail::-webkit-scrollbar {
    display: none;
  }

  .desktop-card {
    position: relative;
    flex: 0 0 min(70vw, 1040px);
    width: min(70vw, 1040px);
    display: block;
    scroll-snap-align: center;
    scroll-snap-stop: always;
    border-radius: 3px;
    text-decoration: none;
    color: inherit;
    -webkit-tap-highlight-color: transparent;
    overflow: hidden;
  }

  .desktop-image {
    position: relative;
    aspect-ratio: 1.64 / 1;
    min-height: min(62vh, 680px);
    overflow: hidden;
    background: #080808;
    border-radius: 3px;
  }

  .desktop-image img,
  .desktop-image picture,
  .mobile-image picture,
  .mobile-image img {
    width: 100%;
    height: 100%;
    display: block;
  }

  .desktop-image img,
  .mobile-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: translateZ(0);
    transition: transform .56s cubic-bezier(.22,.61,.36,1);
    will-change: transform;
  }

  .desktop-image-shade {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      72% 64% at 13% 88%,
      rgba(0, 0, 0, 0.82) 0%,
      rgba(0, 0, 0, 0.5) 34%,
      rgba(0, 0, 0, 0.2) 62%,
      rgba(0, 0, 0, 0) 100%
    );
    pointer-events: none;
  }

  .desktop-card-overlay {
    position: absolute;
    left: clamp(1.1rem,2vw,1.7rem);
    right: clamp(1.1rem,2vw,1.7rem);
    bottom: clamp(1rem,1.8vw,1.5rem);
    z-index: 8;
    pointer-events: none;
  }

  .desktop-card-title-wrap,
  .mobile-card-title-wrap {
    overflow: hidden;
  }

  .desktop-card-title {
    display: block;
    font-family: "Clash Display", sans-serif;
    font-size: clamp(2rem,3.7vw,3.35rem);
    font-weight: 200;
    line-height: .96;
    max-width: 12ch;
    color: var(--desktop-title-color);
    text-shadow: 0 1px 12px rgba(0,0,0,.38);
    opacity: 0;
    transform: translate3d(0,-115%,0);
    transition:
      transform .42s cubic-bezier(.22,.61,.36,1),
      opacity .32s ease;
  }

  .desktop-card.is-active .desktop-image img,
  .mobile-card.is-active .mobile-image img {
    transform: scale(1.045) translateZ(0);
  }

  .desktop-card.is-active .desktop-card-title,
  .mobile-card.is-active .mobile-card-title {
    opacity: 1;
    transform: translate3d(0,0,0);
  }

  .desktop-nav-shell {
    position: absolute;
    top: clamp(5.8rem, 9vh, 7rem);
    left: 0;
    right: 0;
    height: min(62vh, 680px);
    pointer-events: none;
  }

  .desktop-nav-btn {
    position: absolute;
    top: 50%;
    width: 3.8rem;
    height: 3.8rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transform: translateY(-50%);
    border: 0;
    background: transparent;
    color: #fff;
    cursor: pointer;
    z-index: 10;
    pointer-events: auto;
    padding: 0;
    transition: opacity .35s ease;
  }

  .desktop-nav-prev { left: 1rem; }
  .desktop-nav-next { right: 1rem; }

  .desktop-nav-chevron,
  .mobile-nav-chevron {
    display: block;
    width: 1.6rem;
    height: 1.6rem;
    border-top: 1.5px solid currentColor;
    border-right: 1.5px solid currentColor;
    filter: drop-shadow(0 1px 8px rgba(0,0,0,.34));
  }

  .desktop-nav-prev .desktop-nav-chevron,
  .mobile-nav-prev .mobile-nav-chevron { transform: rotate(-135deg); }
  .desktop-nav-next .desktop-nav-chevron,
  .mobile-nav-next .mobile-nav-chevron { transform: rotate(45deg); }

  .desktop-nav-btn.is-hidden,
  .mobile-nav-btn.is-hidden {
    opacity: 0;
    pointer-events: none;
  }

  .mobile-stack {
    display: none;
  }

  .gallery-footer {
    text-align: center;
    margin-top: 6rem;
  }

  .services-btn {
    font-family: "Clash Display", sans-serif;
    font-weight: 400;
    position: relative;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 1.5rem;
    font-size: .9rem;
    white-space: nowrap;
    color: var(--services-btn-text);
    border: 0px solid var(--services-btn-border);
    cursor: pointer;
    background: var(--services-btn-bg);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 2px;
    box-shadow: 0 6px 8px rgba(0,0,0,.04);
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
    transition: transform .45s cubic-bezier(.22,.61,.36,1);
  }

  .services-btn-flip::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition: transform .45s cubic-bezier(.22,.61,.36,1);
    white-space: nowrap;
    color: inherit;
  }

  .services-btn:hover .services-btn-text { transform: translateY(-100%); }
  .services-btn:hover .services-btn-flip::after { transform: translateY(0%); }

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
    border-image-slice: 1;
    border-image-source: radial-gradient(
      68px circle at var(--mx,50%) var(--my,50%),
      rgba(255,225,140,1) 0%,
      rgba(212,175,55,.95) 22%,
      rgba(212,102,55,.55) 45%,
      rgba(212,102,55,.12) 62%,
      transparent 78%
    );
    transition: opacity .25s ease;
  }

  .services-btn::after {
    border: 1px solid transparent;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      78px circle at var(--mx,50%) var(--my,50%),
      rgba(212,175,55,.55) 0%,
      rgba(212,102,55,.22) 42%,
      transparent 72%
    );
    filter: blur(2px);
    transition: opacity .25s ease;
  }

  .services-btn:hover::before,
  .services-btn:hover::after {
    opacity: 1;
  }

  @media (max-width: 900px) {
    .gallery { padding: 0 0 8rem 0; }

    .gallery-header {
      width: min(100%,760px);
      margin: 0 auto;
      justify-content: center;
      padding: 2.75rem 1.25rem 2.4rem;
    }

    .intro-card { width: min(72vw,24rem); }

    .intro-card p {
      font-size: clamp(1.3rem,6.8vw,2.7rem);
      max-width: 18ch;
      line-height: 1.04;
    }

    .desktop-stack {
      display: none;
    }

    .mobile-stack {
      display: block;
      width: 100%;
      margin: 0 auto;
      position: relative;
    }

    .mobile-rail {
      width: 100%;
      margin: 2.8rem 0 0;
      display: flex;
      gap: .95rem;
      overflow-x: auto;
      overflow-y: visible;
      padding-bottom: 2.6rem;
      padding-left: calc((100vw - clamp(258px,74vw,324px)) / 2);
      padding-right: calc((100vw - clamp(258px,74vw,324px)) / 2);
      scroll-snap-type: x mandatory;
      scroll-snap-stop: always;
      scroll-padding-left: calc((100vw - clamp(258px,74vw,324px)) / 2);
      scroll-padding-right: calc((100vw - clamp(258px,74vw,324px)) / 2);
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-x: contain;
      scrollbar-width: none;
    }

    .mobile-rail::-webkit-scrollbar {
      display: none;
    }

    .mobile-card {
      position: relative;
      flex: 0 0 clamp(258px,74vw,324px);
      width: clamp(258px,74vw,324px);
      display: block;
      scroll-snap-align: center;
      scroll-snap-stop: always;
      text-decoration: none;
      color: inherit;
      -webkit-tap-highlight-color: transparent;
    }

    .mobile-card-title-wrap {
      position: absolute;
      left: 14px;
      right: 14px;
      bottom: 1.2rem;
      z-index: 8;
      pointer-events: none;
    }

    .mobile-card-title {
      display: block;
      font-family: "Clash Display", sans-serif;
      font-size: 1.28rem;
      font-weight: 300;
      line-height: 1.04;
      max-width: 12ch;
      color: rgba(255,255,255,.98);
      text-shadow: 0 1px 10px rgba(0,0,0,.34);
      opacity: 0;
      transform: translate3d(0,-115%,0);
      transition:
        transform .42s cubic-bezier(.22,.61,.36,1),
        opacity .32s ease;
    }

    .mobile-image {
      position: relative;
      aspect-ratio: .82 / 1.52;
      overflow: hidden;
      background: #080808;
      border-radius: 3px;
    }

    .mobile-nav-shell {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .mobile-nav-btn {
      position: absolute;
      top: calc(2.8rem + (clamp(258px,74vw,324px) * 1.52 / 0.82) * 0.5);
      width: 3rem;
      height: 3rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transform: translateY(-50%);
      z-index: 10;
      border: 0;
      background: transparent;
      padding: 0;
      color: #fff;
      cursor: pointer;
      pointer-events: auto;
    }

    .mobile-nav-prev { left: .4rem; }
    .mobile-nav-next { right: .4rem; }

    .gallery-footer { margin-top: 2.75rem; }
  }

  @media (max-width: 640px) {
    .gallery { padding: 1.75rem 0 8rem 0; }

    .gallery-header { padding: 2.4rem 1.1rem 2.15rem; }
    .intro-card { width: min(76vw,21rem); }

    .mobile-rail {
      gap: .8rem;
      padding-left: calc((100vw - clamp(244px,78vw,300px)) / 2);
      padding-right: calc((100vw - clamp(244px,78vw,300px)) / 2);
      scroll-padding-left: calc((100vw - clamp(244px,78vw,300px)) / 2);
      scroll-padding-right: calc((100vw - clamp(244px,78vw,300px)) / 2);
    }

    .mobile-card {
      flex-basis: clamp(244px,78vw,300px);
      width: clamp(244px,78vw,300px);
    }

    .mobile-card-title { font-size: 1.14rem; }

    .mobile-nav-btn {
      width: 2.65rem;
      height: 2.65rem;
    }

    .mobile-nav-chevron {
      width: 1.18rem;
      height: 1.18rem;
      border-top-width: 1.4px;
      border-right-width: 1.4px;
    }

    .gallery-footer { margin-top: 2.85rem; }
    .services-btn { padding: 0 1.2rem; font-size: .8rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    .desktop-image img,
    .mobile-image img,
    .desktop-card-title,
    .mobile-card-title,
    .services-btn-text,
    .services-btn-flip::after {
      transition: none;
    }
  }

</style>
