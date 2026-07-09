<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { navigate } from "$lib/navigate.js";
  import { reveal } from "$lib/actions/reveal.js";

  // Reusable: the home page presents the 3 poles with the defaults; project
  // pages pass their own `items`, `href`, `ctaLabel` and intro copy while
  // keeping the exact same card UI (name bottom-left, service chips top-right,
  // hover/arrival de-zoom + "+" reveal + wipe-flip of the title into ctaLabel).
  export let href = "/services";
  export let ctaLabel = "Découvrir";
  export let ariaLabelPrefix = "Voir le pôle";
  export let introMain = "Trois pôles,";
  export let introMuted = "une même exigence.";
  // Si fourni, l'intro s'affiche comme un texte de page projet (style ProjectBrief :
  // paragraphe léger aligné à gauche) au lieu du couple main/muted à puce bleue.
  export let introLead = "";

  // items: {title, subtitle?, tags?[], image, mobileImage?, href?, cta?, ariaLabel?}[]
  export let items = [
    {
      title: "3 Terres Digital",
      subtitle: "Sites web & applications sur mesure",
      tags: ["Sites web", "Applications", "Développement"],
      image: "/images/moovy_mac.webp",
      mobileImage: "/images/tel_moovy2.webp"
    },
    {
      title: "3 Terres Design",
      subtitle: "Logo, charte & identité visuelle",
      tags: ["Logo & charte", "Typographie", "Stratégie"],
      image: "/images/creation_logo_desktop.webp",
      mobileImage: "/images/creation_logo_mobile.webp"
    },
    {
      title: "3 Terres Studio",
      subtitle: "Photo, vidéo & contenu",
      tags: ["Photo & vidéo", "Réseaux sociaux", "Événements"],
      image: "/images/tel_moovy3.webp"
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

  // Glow de la molecule "+" qui suit le curseur, comme les boutons du site.
  function handleCardMove(event) {
    const btn = event.currentTarget.querySelector(".pc-plus");
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
        {#if introLead}
          <p class="intro-lead" use:reveal>{introLead}</p>
        {:else}
          <p class="intro-headline" use:reveal>
            <span class="intro-main">{introMain}</span><span class="intro-muted">{introMuted}</span>
          </p>
        {/if}
      </div>
    </div>
  </div>

  <div class="gallery-content-group">
    <div class="desktop-stack">
      <div class="desktop-rail" bind:this={desktopRailEl} data-native-wheel="true">
        {#each items as item, index}
          <a
            class="pole-card desktop-card"
            bind:this={desktopCardEls[index]}
            href={item.href ?? href}
            data-cursor="view"
            aria-label={item.ariaLabel ?? `${ariaLabelPrefix} ${item.title}`}
            draggable="false"
            onmousemove={handleCardMove}
          >
            <div class="pc-img">
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
            <div class="pc-shade" aria-hidden="true"></div>

            {#if item.tags?.length}
              <div class="pc-tags" aria-hidden="true">
                {#each item.tags.slice(0, 3) as tag}
                  <span class="pc-tag">{tag}</span>
                {/each}
              </div>
            {/if}

            <div class="pc-foot">
              <span class="pc-title-flip" data-text={item.cta ?? ctaLabel} aria-hidden="true">
                <span class="pc-title-text">{item.title}</span>
              </span>
              {#if item.subtitle}
                <span class="pc-subtitle">{item.subtitle}</span>
              {/if}
            </div>

            <span class="pc-plus" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </span>
          </a>
        {/each}
      </div>

      <div class="desktop-nav-shell" aria-label="Navigation pôles desktop">
        <button
          class="desktop-nav-btn desktop-nav-prev"
          class:is-hidden={activeDesktopIndex === 0}
          type="button"
          aria-label="Pôle précédent"
          onclick={() => {
            pauseAndResumeDesktopAutoAdvance();
            scrollToDesktopCard(Math.max(activeDesktopIndex - 1, 0), prefersReduced ? "auto" : "smooth");
          }}
        >
          <span class="desktop-nav-chevron" aria-hidden="true"></span>
        </button>

        <button
          class="desktop-nav-btn desktop-nav-next"
          class:is-hidden={activeDesktopIndex >= items.length - 1}
          type="button"
          aria-label="Pôle suivant"
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
      <div class="mobile-rail" bind:this={mobileRailEl} data-native-wheel="true">
        {#each items as item, index}
          <a
            class="pole-card mobile-card"
            class:is-active={activeMobileIndex === index}
            bind:this={mobileCardEls[index]}
            href={item.href ?? href}
            data-cursor="view"
            aria-label={item.ariaLabel ?? `${ariaLabelPrefix} ${item.title}`}
            draggable="false"
          >
            <div class="pc-img">
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
            <div class="pc-shade" aria-hidden="true"></div>

            {#if item.tags?.length}
              <div class="pc-tags" aria-hidden="true">
                {#each item.tags.slice(0, 3) as tag}
                  <span class="pc-tag">{tag}</span>
                {/each}
              </div>
            {/if}

            <div class="pc-foot">
              <span class="pc-title-flip" data-text={item.cta ?? ctaLabel} aria-hidden="true">
                <span class="pc-title-text">{item.title}</span>
              </span>
              {#if item.subtitle}
                <span class="pc-subtitle">{item.subtitle}</span>
              {/if}
            </div>

            <span class="pc-plus" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </span>
          </a>
        {/each}
      </div>

      <div class="mobile-nav-shell" aria-label="Navigation pôles mobile">
        <button
          class="mobile-nav-btn mobile-nav-prev"
          class:is-hidden={activeMobileIndex === 0}
          type="button"
          aria-label="Pôle précédent"
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
          aria-label="Pôle suivant"
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
    /* Même taille que le texte juste au-dessus (ProjectEditorialMosaic). */
    font-size: var(--project-lead-size, clamp(1.35rem, 2.7vw, 2.8rem));
    line-height: 0.98;
    letter-spacing: -0.05em;
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

  .intro-main { color: #f4efe6; }
  .intro-muted {
    display: block;
    color: #f4efe6;
  }

  /* Style identique aux textes des pages projet (ProjectBrief). */
  .intro-lead {
    margin: 0;
    max-width: 24ch;
    font-family: "Inter", sans-serif;
    font-weight: 300;
    font-size: clamp(1.5rem, 2.5vw, 2.55rem);
    line-height: 1.18;
    letter-spacing: -0.025em;
    color: #f4efe6;
    text-align: left;
    text-wrap: pretty;
  }

  .desktop-stack {
    display: block;
    width: 100%;
    margin: 0 auto;
    padding: clamp(1.5rem, 3vh, 3rem) 0 clamp(2rem, 4vh, 3rem);
    position: relative;
  }

  .desktop-rail {
    width: 100%;
    margin: 0;
    display: flex;
    gap: clamp(0.7rem, 1vw, 1.1rem);
    overflow-x: auto;
    overflow-y: visible;
    padding: 0 2.5vw 1.5rem;
    scroll-snap-type: x mandatory;
    scroll-snap-stop: always;
    scroll-padding-left: 2.5vw;
    scroll-padding-right: 2.5vw;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-x pan-y pinch-zoom;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
  }

  .desktop-rail::-webkit-scrollbar {
    display: none;
  }

  /* ─────────── Carte pôle (base partagée desktop + mobile) ─────────── */
  .pole-card {
    position: relative;
    display: block;
    text-decoration: none;
    color: inherit;
    -webkit-tap-highlight-color: transparent;
    overflow: hidden;
    border-radius: 22px;
    background: #080808;
  }

  .desktop-card {
    flex: 0 0 46vw;
    width: 46vw;
    height: min(86vh, 920px);
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }

  .pc-img {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    border-radius: inherit;
    background: #080808;
  }

  .pc-img picture {
    width: 100%;
    height: 100%;
    display: block;
  }

  .pc-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* Image légèrement zoomée au repos → dézoom doux au survol / à l'arrivée. */
    transform: scale(1.08) translateZ(0);
    transition: transform 1s cubic-bezier(.22,.61,.36,1);
    will-change: transform;
  }

  .pc-shade {
    position: absolute;
    inset: 0;
    z-index: 1;
    background:
      linear-gradient(to top, rgba(0,0,0,.78) 0%, rgba(0,0,0,.30) 32%, rgba(0,0,0,0) 62%),
      linear-gradient(to bottom, rgba(0,0,0,.42) 0%, rgba(0,0,0,0) 26%);
    pointer-events: none;
    border-radius: inherit;
  }

  /* Chips services : en haut à droite */
  .pc-tags {
    position: absolute;
    top: clamp(1rem, 1.6vw, 1.5rem);
    right: clamp(1rem, 1.6vw, 1.5rem);
    z-index: 2;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: .5rem;
    max-width: 80%;
    pointer-events: none;
  }

  .pc-tag {
    display: inline-flex;
    align-items: center;
    height: clamp(36px, 3vw, 42px);
    padding: 0 1.15rem;
    font-family: "Inter", sans-serif;
    font-size: clamp(.85rem, .95vw, .96rem);
    font-weight: 500;
    letter-spacing: -0.01em;
    white-space: nowrap;
    color: #f7f2e8;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    border-radius: 10px;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.04);
  }

  /* Titre + sous-titre : en bas à gauche */
  .pc-foot {
    position: absolute;
    left: clamp(1.3rem, 2vw, 2.2rem);
    right: clamp(1.3rem, 2vw, 2.2rem);
    bottom: clamp(1.3rem, 2vw, 2.2rem);
    z-index: 2;
    pointer-events: none;
  }

  /* Wipe-flip du titre → ctaLabel : même mécanique que les boutons du site
     (conteneur overflow:hidden a hauteur fixe, texte qui glisse). */
  .pc-title-flip {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
    font-family: "Inter", sans-serif;
    font-size: clamp(2rem, 2.9vw, 3.1rem);
    font-weight: 500;
    letter-spacing: -0.03em;
    color: #fff;
    text-shadow: 0 1px 14px rgba(0,0,0,.42);
  }

  .pc-title-text {
    display: block;
    white-space: nowrap;
    transform: translateY(0%);
    transition: transform .45s cubic-bezier(.22,.61,.36,1);
  }

  .pc-title-flip::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    line-height: 1.2em;
    white-space: nowrap;
    color: inherit;
    transform: translateY(100%);
    transition: transform .45s cubic-bezier(.22,.61,.36,1);
  }

  /* Sous-titre : fixe, ne bouge pas au survol / à l'arrivée. */
  .pc-subtitle {
    display: block;
    margin-top: .55rem;
    font-family: "Inter", sans-serif;
    font-size: clamp(.92rem, 1vw, 1.06rem);
    font-weight: 400;
    letter-spacing: -0.01em;
    color: rgba(255,255,255,.6);
    text-shadow: 0 1px 12px rgba(0,0,0,.4);
  }

  /* Bouton "+" : en bas à droite, arrive au survol / à l'arrivée */
  .pc-plus {
    position: absolute;
    right: clamp(1.3rem, 2vw, 2.2rem);
    bottom: clamp(1.3rem, 2vw, 2.2rem);
    z-index: 3;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: clamp(44px, 3.4vw, 54px);
    height: clamp(44px, 3.4vw, 54px);
    color: #f7f2e8;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    border: 0;
    border-radius: 999px;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.04);
    opacity: 0;
    transform: translateY(10px) scale(.85);
    transition:
      opacity .4s ease,
      transform .5s cubic-bezier(.22,.61,.36,1);
    pointer-events: none;
  }

  .pc-plus svg { display: block; }

  /* Glow qui suit le curseur, comme les boutons du site. */
  .pc-plus::before,
  .pc-plus::after {
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

  .pc-plus::before {
    background: radial-gradient(
      70px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-strong) 0%,
      var(--site-glow-mid) 26%,
      var(--site-glow-soft) 52%,
      var(--site-glow-fade) 70%,
      transparent 86%
    );
    transition: opacity .25s ease;
  }

  .pc-plus::after {
    background: radial-gradient(
      90px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-ambient) 0%,
      var(--site-glow-outer) 48%,
      transparent 82%
    );
    filter: blur(3px);
    transition: opacity .25s ease;
  }

  /* ─────────── État actif : survol (desktop) / arrivée (mobile) ─────────── */
  .desktop-card:hover .pc-img img,
  .mobile-card.is-active .pc-img img {
    transform: scale(1) translateZ(0);
  }

  /* Desktop : wipe-flip du titre → ctaLabel au survol. */
  .desktop-card:hover .pc-title-text {
    transform: translateY(-100%);
  }

  .desktop-card:hover .pc-title-flip::after {
    transform: translateY(0%);
  }

  .desktop-card:hover .pc-plus,
  .mobile-card.is-active .pc-plus {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .desktop-card:hover .pc-plus { background: rgba(255,255,255,.2); }

  .desktop-card:hover .pc-plus::before,
  .desktop-card:hover .pc-plus::after {
    opacity: 1;
  }

  /* ─────────── Navigation flèches ─────────── */
  .desktop-nav-shell {
    position: absolute;
    top: clamp(1.5rem, 3vh, 3rem);
    left: 0;
    right: 0;
    height: min(86vh, 920px);
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
      font-size: clamp(1.7rem, 8.5vw, 2.55rem);
      max-width: 18ch;
      line-height: 1;
    }

    .intro-lead {
      font-size: clamp(1.5rem, 6.6vw, 2rem);
      max-width: 26ch;
      line-height: 1.2;
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
      margin: 2.4rem 0 0;
      display: flex;
      gap: .9rem;
      overflow-x: auto;
      overflow-y: visible;
      padding-bottom: 2.4rem;
      padding-left: calc((100vw - clamp(300px,88vw,440px)) / 2);
      padding-right: calc((100vw - clamp(300px,88vw,440px)) / 2);
      scroll-snap-type: x mandatory;
      scroll-snap-stop: always;
      scroll-padding-left: calc((100vw - clamp(300px,88vw,440px)) / 2);
      scroll-padding-right: calc((100vw - clamp(300px,88vw,440px)) / 2);
      -webkit-overflow-scrolling: touch;
      touch-action: pan-x pan-y pinch-zoom;
      overscroll-behavior-x: contain;
      scrollbar-width: none;
    }

    .mobile-rail::-webkit-scrollbar {
      display: none;
    }

    /* Carte quasi plein écran : hauteur pilotée par la fenêtre (plus d'aspect-ratio
       qui débordait), largeur qui laisse un léger aperçu de la carte suivante. */
    .mobile-card {
      flex: 0 0 clamp(300px,88vw,440px);
      width: clamp(300px,88vw,440px);
      height: min(72vh, 660px);
      scroll-snap-align: center;
      scroll-snap-stop: always;
    }

    /* Titre sur une ligne + chips compactes : pas de chevauchement sur carte étroite. */
    .pc-title-flip { font-size: clamp(1.5rem, 6.2vw, 2.1rem); }
    .pc-subtitle { font-size: clamp(.92rem, 3.6vw, 1.05rem); }

    /* Mobile : pas de flip vers "Découvrir" — simple wipe d'arrivée du nom du pôle
       quand la carte devient active. Le "Découvrir" (::after) reste masqué. */
    .pc-title-text { transform: translateY(105%); }
    .mobile-card.is-active .pc-title-text { transform: translateY(0%); }
    .pc-title-flip::after { display: none; }

    .pc-tags {
      max-width: 86%;
      gap: .45rem;
    }

    .pc-tag {
      height: clamp(32px, 8.2vw, 38px);
      padding: 0 .95rem;
      font-size: clamp(.8rem, 3.4vw, .9rem);
    }

    .mobile-nav-shell {
      position: absolute;
      top: 2.4rem;
      left: 0;
      right: 0;
      height: min(72vh, 660px);
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

    .intro-lead {
      font-size: clamp(1.4rem, 6.6vw, 1.9rem);
    }

    .mobile-rail {
      gap: .7rem;
      padding-left: calc((100vw - clamp(270px,90vw,380px)) / 2);
      padding-right: calc((100vw - clamp(270px,90vw,380px)) / 2);
      scroll-padding-left: calc((100vw - clamp(270px,90vw,380px)) / 2);
      scroll-padding-right: calc((100vw - clamp(270px,90vw,380px)) / 2);
    }

    .mobile-card {
      flex-basis: clamp(270px,90vw,380px);
      width: clamp(270px,90vw,380px);
      height: min(74vh, 620px);
    }

    .pc-title-flip { font-size: clamp(1.5rem, 7vw, 2.05rem); }

    .mobile-nav-shell {
      height: min(74vh, 620px);
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
    .pc-img img,
    .pc-title-text,
    .pc-title-flip::after,
    .pc-plus {
      transition: none;
    }
  }

</style>
