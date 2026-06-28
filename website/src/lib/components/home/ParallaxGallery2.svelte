<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { navigate } from "$lib/navigate.js";
  import { reveal } from "$lib/actions/reveal.js";

  // Reusable: the home page uses the defaults; project pages pass their own
  // `items`, `href`, `ctaLabel` and intro copy while keeping the exact same UI.
  export let href = "/services";
  export let ctaLabel = "Decouvrir";
  export let ariaLabelPrefix = "Voir le service";
  export let introMain = "De l'identité";
  export let introMuted = "à l'expérience complète.";

  // items: {title, image, mobileImage?, href?, cta?, ariaLabel?, subtitle?}[]
  export let items = [
    {
      title: "Identite de marque",
      subtitle: "Du systeme visuel a l'identite complete, pensee pour durer.",
      image: "/images/carte_visite_desktop.webp",
      mobileImage: "/images/carte_visite_mobile.webp"
    },
    {
      title: "Site web",
      subtitle: "Des interfaces fluides, desirables et precises.",
      image: "/images/tel_moovy2.webp"
    },
    {
      title: "Logo",
      subtitle: "Des sigles memorables qui incarnent une vision.",
      image: "/images/creation_logo_desktop.webp",
      mobileImage: "/images/creation_logo_mobile.webp"
    },
    {
      title: "Reseaux sociaux",
      subtitle: "Une presence visuelle forte sur toutes les plateformes.",
      image: "/images/moovy2.webp"
    },
    {
      title: "Photo & evenements",
      subtitle: "Couverture photo de qualite pour vos evenements.",
      image: "/images/justx.webp"
    },
    {
      title: "Accompagnement",
      subtitle: "Iterations precises et execution soignee a chaque etape.",
      image: "/images/justx_fitness.webp"
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
  let supportsScrollEnd = false;
  let desktopScrollEndFallback = null;
  let mobileScrollEndFallback = null;

  function handleDesktopScrollEnd() {
    if (!isAutoScrollingDesktop) return;
    clearTimeout(desktopScrollEndFallback);
    isAutoScrollingDesktop = false;
    updateDesktopActive();
  }

  function handleMobileScrollEnd() {
    if (!isAutoScrollingMobile) return;
    clearTimeout(mobileScrollEndFallback);
    isAutoScrollingMobile = false;
    updateMobileActive();
  }

  function handleCardMove(event) {
    const btn = event.currentTarget.querySelector(".dc-btn");
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  function measure() {
    if (!browser) return;
    isMobile = window.innerWidth <= 900;
  }

  function updateDesktopActive() {
    if (!desktopRailEl) return;

    const cards = desktopRailEl.querySelectorAll(".desktop-card");
    if (!cards.length) return;

    // Find the card whose left edge is snapped to the scroll-padding position
    const scrollPad = desktopCardEls[0] ? desktopCardEls[0].offsetLeft : 0;
    const targetLeft = desktopRailEl.scrollLeft + scrollPad;
    let nearest = 0;
    let nearestDistance = Infinity;

    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - targetLeft);
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
    if (isAutoScrollingDesktop) return;
    pauseAndResumeDesktopAutoAdvance();
    if (desktopScrollRaf) cancelAnimationFrame(desktopScrollRaf);
    desktopScrollRaf = requestAnimationFrame(() => {
      updateDesktopActive();
      desktopScrollRaf = null;
    });
  }

  function handleMobileRailScroll() {
    if (isAutoScrollingMobile) return;
    pauseAndResumeMobileAutoAdvance();
    if (mobileScrollRaf) cancelAnimationFrame(mobileScrollRaf);
    mobileScrollRaf = requestAnimationFrame(() => {
      updateMobileActive();
      mobileScrollRaf = null;
    });
  }

  function scrollToDesktopCard(index, behavior = "smooth") {
    const card = desktopCardEls[index];
    if (!desktopRailEl || !card) return;

    const scrollPad = desktopCardEls[0] ? desktopCardEls[0].offsetLeft : 0;
    const targetLeft = card.offsetLeft - scrollPad;

    activeDesktopIndex = index;

    if (behavior === "smooth") {
      isAutoScrollingDesktop = true;
      desktopRailEl.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
      if (!supportsScrollEnd) {
        clearTimeout(desktopScrollEndFallback);
        desktopScrollEndFallback = window.setTimeout(handleDesktopScrollEnd, 950);
      }
    } else {
      desktopRailEl.scrollTo({ left: Math.max(0, targetLeft), behavior: "instant" });
      updateDesktopActive();
    }
  }

  function scrollToMobileCard(index, behavior = "smooth") {
    const card = mobileCardEls[index];
    if (!mobileRailEl || !card) return;

    const targetLeft = card.offsetLeft - (mobileRailEl.clientWidth - card.offsetWidth) * 0.5;

    activeMobileIndex = index;

    if (behavior === "smooth") {
      isAutoScrollingMobile = true;
      mobileRailEl.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
      if (!supportsScrollEnd) {
        clearTimeout(mobileScrollEndFallback);
        mobileScrollEndFallback = window.setTimeout(handleMobileScrollEnd, 950);
      }
    } else {
      mobileRailEl.scrollTo({ left: Math.max(0, targetLeft), behavior: "instant" });
      updateMobileActive();
    }
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
      const nextIndex = activeDesktopIndex + 2 >= items.length ? 0 : activeDesktopIndex + 2;
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
      scrollToDesktopCard(activeDesktopIndex, "instant");
      scrollToMobileCard(activeMobileIndex, "instant");
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

    supportsScrollEnd = "onscrollend" in window;

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
    if (supportsScrollEnd) {
      desktopRailEl?.addEventListener("scrollend", handleDesktopScrollEnd, { passive: true });
      mobileRailEl?.addEventListener("scrollend", handleMobileScrollEnd, { passive: true });
    }

    return () => {
      removeMotionListener?.();
      visibilityObserver?.disconnect();
      clearDesktopAutoTimers();
      clearMobileAutoTimers();
      clearTimeout(resizeTimer);
      clearTimeout(desktopScrollEndFallback);
      clearTimeout(mobileScrollEndFallback);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      desktopRailEl?.removeEventListener("scroll", handleDesktopRailScroll);
      mobileRailEl?.removeEventListener("scroll", handleMobileRailScroll);
      desktopRailEl?.removeEventListener("scrollend", handleDesktopScrollEnd);
      mobileRailEl?.removeEventListener("scrollend", handleMobileScrollEnd);
    };
  });

  onDestroy(() => {
    if (!browser) return;

    removeMotionListener?.();
    visibilityObserver?.disconnect();
    clearDesktopAutoTimers();
    clearMobileAutoTimers();
    clearTimeout(resizeTimer);
    clearTimeout(desktopScrollEndFallback);
    clearTimeout(mobileScrollEndFallback);
    desktopRailEl?.removeEventListener("scroll", handleDesktopRailScroll);
    mobileRailEl?.removeEventListener("scroll", handleMobileRailScroll);
    desktopRailEl?.removeEventListener("scrollend", handleDesktopScrollEnd);
    mobileRailEl?.removeEventListener("scrollend", handleMobileScrollEnd);
    if (desktopScrollRaf) cancelAnimationFrame(desktopScrollRaf);
    if (mobileScrollRaf) cancelAnimationFrame(mobileScrollRaf);
  });
</script>

<section class="gallery" bind:this={galleryEl}>
  <div class="gallery-intro-group">
    <div class="gallery-header">
      <div class="intro-card">
        <p class="intro-headline" use:reveal>
          <span class="intro-main">{introMain}</span><span class="intro-muted">{introMuted}</span>
        </p>
      </div>
    </div>
  </div>

  <div class="gallery-content-group">
    <div class="desktop-stack">
      <div class="desktop-rail" bind:this={desktopRailEl} data-native-wheel="true">
        {#each items as item, index}
          <a
            class="desktop-card"
            class:is-active={activeDesktopIndex === index || activeDesktopIndex + 1 === index}
            bind:this={desktopCardEls[index]}
            href={item.href ?? href}
            data-cursor="view"
            aria-label={item.ariaLabel ?? `${ariaLabelPrefix} ${item.title}`}
            draggable="false"
            onmousemove={handleCardMove}
          >
            <div class="desktop-card-img">
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
            <div class="desktop-card-shade" aria-hidden="true"></div>

            <div class="desktop-card-content">
              <div class="desktop-card-title-wrap" aria-hidden="true">
                <span class="desktop-card-title">{item.title}</span>
              </div>
              <span class="dc-btn">
                <span class="dc-btn-flip" data-text={item.cta ?? ctaLabel}>
                  <span class="dc-btn-text">{item.cta ?? ctaLabel}</span>
                </span>
              </span>
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
            scrollToDesktopCard(Math.max(activeDesktopIndex - 2, 0), prefersReduced ? "auto" : "smooth");
          }}
        >
          <span class="desktop-nav-chevron" aria-hidden="true"></span>
        </button>

        <button
          class="desktop-nav-btn desktop-nav-next"
          class:is-hidden={activeDesktopIndex >= items.length - 2}
          type="button"
          aria-label="Service suivant"
          onclick={() => {
            pauseAndResumeDesktopAutoAdvance();
            scrollToDesktopCard(Math.min(activeDesktopIndex + 2, items.length - 1), prefersReduced ? "auto" : "smooth");
          }}
        >
          <span class="desktop-nav-chevron" aria-hidden="true"></span>
        </button>
      </div>
    </div>

    <div class="mobile-stack">
      <div class="mobile-rail" bind:this={mobileRailEl} data-native-wheel="true">
        {#each items as item, index}
          <a
            class="mobile-card"
            class:is-active={activeMobileIndex === index}
            bind:this={mobileCardEls[index]}
            href={item.href ?? href}
            data-cursor="view"
            aria-label={item.ariaLabel ?? `${ariaLabelPrefix} ${item.title}`}
            draggable="false"
          >
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
            <div class="mobile-card-shade" aria-hidden="true"></div>

            <div class="mobile-card-content">
              <div class="mobile-card-title-wrap" aria-hidden="true">
                <span class="mobile-card-title">{item.title}</span>
              </div>
              <span class="mc-btn">
                <span class="mc-btn-flip" data-text={item.cta ?? ctaLabel}>
                  <span class="mc-btn-text">{item.cta ?? ctaLabel}</span>
                </span>
              </span>
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

  </div>
</section>

<style>
  .gallery {
    --section-bg: #000;
    --intro-body: rgba(255,255,255,.64);
    --intro-main: #fff;
    --intro-muted: rgba(255,255,255,.70);
    --desktop-title-color: rgba(255,255,255,.96);
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
    justify-content: flex-start;
    padding:
      clamp(5rem,10vw,10rem)
      clamp(1.5rem,3vw,3rem)
      clamp(5rem,10vw,10rem);
  }

  .intro-card {
    position: relative;
    z-index: 2;
    width: min(640px, 100%);
  }

  .intro-headline {
    margin: 0;
    max-width: 22ch;
    font-family: "Inter", sans-serif;
    font-weight: 300;
    font-size: clamp(1.4rem, 2.5vw, 2.8rem);
    line-height: 1.1;
    letter-spacing: -0.015em;
    color: var(--intro-body);
    text-align: left;
  }

  .intro-headline::before {
    content: "";
    display: block;
    width: 24px;
    height: 1px;
    background: #5768ff;
    margin-bottom: 1.2rem;
  }

  .intro-main { color: #f5f1e8; }
  .intro-muted {
    display: block;
    color: rgba(245, 241, 232, 0.35);
  }

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
    gap: 2px;
    overflow-x: auto;
    overflow-y: visible;
    padding: 0 9vw 2rem;
    scroll-snap-type: x mandatory;
    scroll-snap-stop: always;
    scroll-padding-left: 9vw;
    scroll-padding-right: 9vw;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-x pan-y pinch-zoom;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
  }

  .desktop-rail::-webkit-scrollbar {
    display: none;
  }

  .desktop-card {
    position: relative;
    flex: 0 0 calc(41vw - 0.5rem);
    width: calc(41vw - 0.5rem);
    aspect-ratio: 1 / 1;
    display: block;
    scroll-snap-align: start;
    scroll-snap-stop: always;
    border-radius: 14px;
    text-decoration: none;
    color: inherit;
    -webkit-tap-highlight-color: transparent;
    overflow: hidden;
    background: #080808;
  }

  .desktop-card-img {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    border-radius: 14px;
    background: #080808;
  }

  .desktop-card-img picture,
  .mobile-image picture {
    width: 100%;
    height: 100%;
    display: block;
  }

  .desktop-card-img img,
  .mobile-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: translateZ(0);
    transition: transform .56s cubic-bezier(.22,.61,.36,1);
    will-change: transform;
  }

  .desktop-card-shade {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.76) 0%,
      rgba(0, 0, 0, 0.32) 50%,
      rgba(0, 0, 0, 0.16) 100%
    );
    pointer-events: none;
    border-radius: 14px;
  }

  .desktop-card-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: clamp(1.4rem, 2.8vw, 2.6rem) clamp(1rem, 2vw, 2rem);
    gap: 0;
    pointer-events: none;
  }

  .desktop-card-title-wrap,
  .mobile-card-title-wrap {
    overflow: hidden;
  }

  .desktop-card-title {
    display: block;
    font-family: "Inter", sans-serif;
    font-size: clamp(1.3rem, 2.8vw, 2.8rem);
    font-weight: 500;
    line-height: 1.05;
    max-width: 14ch;
    color: var(--desktop-title-color);
    text-shadow: 0 1px 12px rgba(0,0,0,.38);
    opacity: 0;
    filter: blur(14px);
    transform: translate3d(0, -115%, 0);
    transition:
      transform .42s cubic-bezier(.22,.61,.36,1),
      filter .57s cubic-bezier(.22,.61,.36,1),
      opacity .32s ease;
  }

  .desktop-card.is-active .desktop-card-title {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
  }

  .dc-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 1.1rem;
    height: 36px;
    padding: 0 1.2rem;
    font-size: 0.82rem;
    font-weight: 400;
    white-space: nowrap;
    color: #fff;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    border-radius: 10px;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.08);
    opacity: 0;
    transform: translate3d(0, 4px, 0);
    transition:
      transform .52s cubic-bezier(.22,.61,.36,1),
      opacity .38s ease,
      background .3s ease;
  }

  .dc-btn::before,
  .dc-btn::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0;
  }

  .dc-btn::before {
    background: radial-gradient(
      96px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-strong) 0%,
      var(--site-glow-mid) 26%,
      var(--site-glow-soft) 52%,
      var(--site-glow-fade) 70%,
      transparent 86%
    );
    transition: opacity .25s ease;
  }

  .dc-btn::after {
    background: radial-gradient(
      120px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-ambient) 0%,
      var(--site-glow-outer) 48%,
      transparent 82%
    );
    filter: blur(3px);
    transition: opacity .25s ease;
  }

  .desktop-card.is-active:hover .dc-btn::before,
  .desktop-card.is-active:hover .dc-btn::after {
    opacity: 1;
  }

  .dc-btn-flip {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
  }

  .dc-btn-text {
    display: block;
    transform: translateY(0%);
    transition: transform .42s cubic-bezier(.22,.61,.36,1);
  }

  .dc-btn-flip::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition: transform .42s cubic-bezier(.22,.61,.36,1);
    white-space: nowrap;
    color: inherit;
  }

  .desktop-card.is-active .dc-btn {
    opacity: 1;
    transform: translate3d(0, 0, 0);
    transition-delay: .08s;
  }

  .desktop-card.is-active .dc-btn:hover { background: rgba(255, 255, 255, 0.18); }
  .desktop-card.is-active:hover .dc-btn-text { transform: translateY(-100%); }
  .desktop-card.is-active:hover .dc-btn-flip::after { transform: translateY(0%); }

  .desktop-card.is-active .desktop-card-img img,
  .mobile-card.is-active .mobile-image img {
    transform: scale(1.045) translateZ(0);
  }

  .mobile-card.is-active .mobile-card-title {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
  }

  .desktop-nav-shell {
    position: absolute;
    top: clamp(5.8rem, 9vh, 7rem);
    left: 0;
    right: 0;
    height: clamp(280px, 41vw, 680px);
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

  @media (max-width: 900px) {
    .gallery { padding: 0 0 8rem 0; }

    .gallery-header {
      width: min(100%,760px);
      margin: 0 auto;
      justify-content: flex-start;
      padding: 4rem 1.25rem 4rem;
    }

    .intro-card { width: min(90vw, 560px); }

    .intro-headline {
      font-size: clamp(1.3rem, 5.5vw, 2.2rem);
      max-width: 18ch;
      line-height: 1.12;
    }

    .desktop-stack {
      display: none;
    }

    .mobile-stack {
      display: flow-root;
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
      touch-action: pan-x pan-y pinch-zoom;
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
      overflow: hidden;
      border-radius: 14px;
    }

    .mobile-image {
      position: relative;
      aspect-ratio: .82 / 1.52;
      overflow: hidden;
      background: #080808;
      border-radius: 14px;
    }

    .mobile-card-shade {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 70%;
      z-index: 1;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.76) 0%,
        rgba(0, 0, 0, 0.32) 60%,
        rgba(0, 0, 0, 0) 100%
      );
      pointer-events: none;
      border-radius: 14px 14px 0 0;
    }

    .mobile-card-content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 1.25rem 1rem 0;
      pointer-events: none;
    }

    .mobile-card-title-wrap {
      overflow: hidden;
    }

    .mobile-card-title {
      display: block;
      font-family: "Inter", sans-serif;
      font-size: clamp(1.3rem, 6.8vw, 2.7rem);
      font-weight: 500;
      line-height: 1.1;
      color: rgba(255,255,255,.98);
      text-shadow: 0 1px 10px rgba(0,0,0,.34);
      opacity: 0;
      filter: blur(14px);
      transform: translate3d(0, -115%, 0);
      transition:
        transform .42s cubic-bezier(.22,.61,.36,1),
        filter .57s cubic-bezier(.22,.61,.36,1),
        opacity .32s ease;
    }

    .mc-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-top: 0.9rem;
      height: 34px;
      padding: 0 1rem;
      font-size: 0.78rem;
      font-weight: 400;
      white-space: nowrap;
      color: #fff;
      background: rgba(255, 255, 255, 0.11);
      backdrop-filter: blur(12px) saturate(130%);
      -webkit-backdrop-filter: blur(12px) saturate(130%);
      border-radius: 10px;
      opacity: 0;
      transform: translate3d(0, 4px, 0);
      transition:
        transform .5s cubic-bezier(.22,.61,.36,1),
        opacity .36s ease;
    }

    .mc-btn-flip {
      position: relative;
      display: block;
      overflow: hidden;
      height: 1.2em;
      line-height: 1.2em;
    }

    .mc-btn-text {
      display: block;
    }

    .mobile-card.is-active .mc-btn {
      opacity: 1;
      transform: translate3d(0, 0, 0);
      transition-delay: .12s;
    }

    .mobile-nav-shell {
      position: absolute;
      top: 2.8rem;
      left: 0;
      right: 0;
      height: calc(clamp(258px,74vw,324px) * 1.52 / 0.82);
      pointer-events: none;
    }

    .mobile-nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 3rem;
      height: 3rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
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

  }

  @media (max-width: 640px) {
    .gallery { padding: 1.75rem 0 8rem 0; }

    .gallery-header { padding: 3.5rem 1.1rem 3.5rem; }
    .intro-card { width: min(88vw, 480px); }

    .intro-headline {
      font-size: clamp(1.2rem, 6vw, 2rem);
    }

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

    .mobile-nav-shell {
      height: calc(clamp(244px,78vw,300px) * 1.52 / 0.82);
    }

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

  }

  @media (prefers-reduced-motion: reduce) {
    .desktop-card-img img,
    .mobile-image img,
    .desktop-card-title,
    .mobile-card-title,
    .dc-btn-text,
    .dc-btn-flip::after {
      transition: none;
    }
  }

</style>
