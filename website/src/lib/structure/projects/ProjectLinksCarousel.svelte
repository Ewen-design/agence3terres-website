<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";

  export let title = "Continuer";
  export let intro = "";
  export let items = [];

  let stageEl;
  let introCardEl;
  let trackEl;
  let cardEls = [];

  let isMobile = false;
  let prefersReduced = false;
  let activeIndex = 0;

  let resizeTimer = null;
  let scrollRaf = null;
  let trackScrollRaf = null;
  let removeMotionListener;

  let introOpacity = -1;
  let introY = -999;

  function clamp(v, lo = 0, hi = 1) {
    return Math.max(lo, Math.min(hi, v));
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function updateDevice() {
    isMobile = window.innerWidth <= 900;
  }

  function updateIntro() {
    if (!introCardEl) return;

    if (prefersReduced) {
      if (introOpacity !== 1) {
        introCardEl.style.opacity = "1";
        introCardEl.style.transform = "translate3d(0,0,0)";
        introOpacity = 1;
        introY = 0;
      }
      return;
    }

    const rect = introCardEl.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const raw = clamp((vh * 0.92 - rect.top) / Math.max(vh * 0.72, 1), 0, 1);
    const reveal = isMobile ? raw : easeOutCubic(raw);
    const op = Math.round((0.18 + 0.82 * reveal) * 1000) / 1000;
    const y = isMobile ? 0 : Math.round(18 * (1 - reveal) * 100) / 100;

    if (op !== introOpacity) {
      introCardEl.style.opacity = `${op}`;
      introOpacity = op;
    }

    if (y !== introY) {
      introCardEl.style.transform = `translate3d(0,${y}px,0)`;
      introY = y;
    }
  }

  function scheduleIntroUpdate() {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      updateIntro();
      scrollRaf = null;
    });
  }

  function updateActiveFromScroll() {
    if (!trackEl || !cardEls.length) return;

    const centerX = trackEl.scrollLeft + trackEl.clientWidth * 0.5;
    let nearest = 0;
    let nearestDistance = Infinity;

    cardEls.forEach((card, index) => {
      if (!card) return;
      const distance = Math.abs(card.offsetLeft + card.offsetWidth * 0.5 - centerX);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = index;
      }
    });

    activeIndex = nearest;
  }

  function scheduleTrackUpdate() {
    if (trackScrollRaf) cancelAnimationFrame(trackScrollRaf);
    trackScrollRaf = requestAnimationFrame(() => {
      updateActiveFromScroll();
      trackScrollRaf = null;
    });
  }

  function scrollToIndex(index, behavior = "smooth") {
    const target = cardEls[index];
    if (!target) return;
    target.scrollIntoView({ behavior, inline: "center", block: "nearest" });
  }

  function prev() {
    const nextIndex = (activeIndex - 1 + items.length) % items.length;
    scrollToIndex(nextIndex);
  }

  function next() {
    const nextIndex = (activeIndex + 1) % items.length;
    scrollToIndex(nextIndex);
  }

  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateDevice();
      updateIntro();
      updateActiveFromScroll();
      scrollToIndex(activeIndex, "auto");
    }, 70);
  }

  function handleZoneMove(e) {
    if (isMobile || !stageEl) return;
    const rect = stageEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const dir = x < rect.width / 2 ? "prev" : "next";
    window.dispatchEvent(new CustomEvent("carousel-direction", { detail: dir }));
  }

  function handleCardClick(item, index) {
    if (activeIndex === index) {
      goto(item.href);
      return;
    }

    scrollToIndex(index);
  }

  onMount(() => {
    if (!browser) return;

    updateDevice();

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReduced = mq.matches;

    const onMotion = (e) => {
      prefersReduced = e.matches;
      updateIntro();
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
      updateActiveFromScroll();
      scrollToIndex(0, "auto");
    });

    window.addEventListener("scroll", scheduleIntroUpdate, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });
    trackEl?.addEventListener("scroll", scheduleTrackUpdate, { passive: true });
  });

  onDestroy(() => {
    if (!browser) return;

    window.removeEventListener("scroll", scheduleIntroUpdate);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("orientationchange", handleResize);
    trackEl?.removeEventListener("scroll", scheduleTrackUpdate);

    removeMotionListener?.();
    clearTimeout(resizeTimer);
    if (scrollRaf) cancelAnimationFrame(scrollRaf);
    if (trackScrollRaf) cancelAnimationFrame(trackScrollRaf);
  });
</script>

<section class="project-links-carousel">
  <div class="project-links-carousel__header">
    <div class="project-links-carousel__title-wrap">
      <h2>{title}</h2>
    </div>

    <div class="project-links-carousel__intro" bind:this={introCardEl}>
      <p>{intro}</p>
    </div>
  </div>

  <div
    class="project-links-carousel__stage"
    class:project-links-carousel__stage--desktop={!isMobile}
    class:project-links-carousel__stage--mobile={isMobile}
    bind:this={stageEl}
    data-cursor={!isMobile ? "carousel" : undefined}
    role={!isMobile ? "group" : undefined}
    aria-label={!isMobile ? "Navigation entre les pages suggérées" : undefined}
    on:mousemove={handleZoneMove}
  >
    {#if !isMobile}
      <div class="project-links-carousel__nav-zones" aria-hidden="true">
        <button
          class="project-links-carousel__nav-zone"
          type="button"
          aria-label="Carte précédente"
          on:click={prev}
        ></button>
        <button
          class="project-links-carousel__nav-zone"
          type="button"
          aria-label="Carte suivante"
          on:click={next}
        ></button>
      </div>
    {/if}

    <div class="project-links-carousel__track" bind:this={trackEl}>
      {#each items as item, index}
        <button
          class="project-links-carousel__card"
          class:is-active={activeIndex === index}
          bind:this={cardEls[index]}
          type="button"
          on:click={() => handleCardClick(item, index)}
        >
          <div
            class="project-links-carousel__index-wrap"
            class:project-links-carousel__index-wrap--active={activeIndex === index}
            aria-hidden="true"
          >
            <span class="project-links-carousel__index-inner">{String(index + 1).padStart(2, "0")}</span>
          </div>

          <div class="project-links-carousel__media">
            <div class="project-links-carousel__image-wrap">
              <img src={item.image} alt={item.alt} loading="lazy" draggable="false" />
            </div>
          </div>

          <div class="project-links-carousel__info" aria-hidden="true">
            <span class="project-links-carousel__chip project-links-carousel__chip--primary">{item.title}</span>
            <span class="project-links-carousel__chip">{item.eyebrow}</span>
            <span class="project-links-carousel__chip">{item.kicker}</span>
          </div>

          <div class="project-links-carousel__copy">
            <div class="project-links-carousel__meta">
              <span>{item.eyebrow}</span>
              <span>{item.kicker}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        </button>
      {/each}
    </div>
  </div>
</section>

<style>
  .project-links-carousel {
    position: relative;
    padding: clamp(4.5rem, 8vw, 7rem) 0 0;
    background: #050505;
    color: #f5f1e8;
    overflow: clip;
    isolation: isolate;
  }

  .project-links-carousel__header {
    display: grid;
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
    gap: clamp(1rem, 3vw, 2rem);
    padding: 0 clamp(1rem, 2.6vw, 2rem) clamp(2rem, 4vw, 3.4rem);
  }

  .project-links-carousel__title-wrap h2 {
    margin: 0;
    font-family: "Titre italic", serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(3rem, 6vw, 6.7rem);
    line-height: 0.9;
    letter-spacing: -0.07em;
    color: #f5f1e8;
  }

  .project-links-carousel__intro {
    max-width: 28rem;
    justify-self: end;
    opacity: 0.18;
    transform: translate3d(0, 18px, 0);
    will-change: transform, opacity;
  }

  .project-links-carousel__intro p {
    margin: 0;
    font-family: "General Sans", sans-serif;
    font-size: clamp(1rem, 1.2vw, 1.08rem);
    line-height: 1.55;
    color: rgba(245, 241, 232, 0.68);
  }

  .project-links-carousel__stage {
    position: relative;
    padding-bottom: 5rem;
  }

  .project-links-carousel__stage--desktop {
    overflow: hidden;
  }

  .project-links-carousel__nav-zones {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    pointer-events: none;
  }

  .project-links-carousel__nav-zone {
    appearance: none;
    border: 0;
    background: transparent;
    cursor: inherit;
    pointer-events: auto;
  }

  .project-links-carousel__nav-zone:focus-visible {
    outline: 2px solid rgba(245, 241, 232, 0.9);
    outline-offset: -2px;
  }

  .project-links-carousel__track {
    position: relative;
    z-index: 2;
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    overflow-y: visible;
    scrollbar-width: none;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }

  .project-links-carousel__track::-webkit-scrollbar {
    display: none;
  }

  .project-links-carousel__stage--desktop .project-links-carousel__track {
    padding-left: calc((100vw - min(74vw, 78rem)) / 2);
    padding-right: calc((100vw - min(74vw, 78rem)) / 2);
  }

  .project-links-carousel__stage--mobile .project-links-carousel__track {
    padding-left: calc((100vw - clamp(285px, 82vw, 360px)) / 2);
    padding-right: calc((100vw - clamp(285px, 82vw, 360px)) / 2);
    padding-bottom: 2.6rem;
    gap: 0.95rem;
  }

  .project-links-carousel__card {
    position: relative;
    display: grid;
    gap: 1rem;
    padding: 0;
    margin: 0;
    border: 0;
    background: transparent;
    color: inherit;
    text-align: left;
    scroll-snap-align: center;
    cursor: pointer;
    opacity: 0.42;
    transition: opacity 0.35s ease, transform 0.45s ease;
  }

  .project-links-carousel__stage--desktop .project-links-carousel__card {
    flex: 0 0 min(74vw, 78rem);
    grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.8fr);
    align-items: end;
    transform: scale(0.93);
  }

  .project-links-carousel__stage--mobile .project-links-carousel__card {
    flex: 0 0 clamp(285px, 82vw, 360px);
  }

  .project-links-carousel__card.is-active {
    opacity: 1;
    transform: scale(1);
  }

  .project-links-carousel__media {
    position: relative;
    overflow: hidden;
    border-radius: 4px;
    background: #161616;
  }

  .project-links-carousel__stage--desktop .project-links-carousel__media {
    aspect-ratio: 1.72;
  }

  .project-links-carousel__stage--mobile .project-links-carousel__media {
    aspect-ratio: 1.08;
  }

  .project-links-carousel__image-wrap {
    position: absolute;
    inset: 0;
  }

  .project-links-carousel__image-wrap img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    transition: filter 0.34s ease, transform 0.42s ease, opacity 0.34s ease;
    user-select: none;
    pointer-events: none;
    will-change: transform, filter;
  }

  .project-links-carousel__card:hover .project-links-carousel__image-wrap img,
  .project-links-carousel__card.is-active .project-links-carousel__image-wrap img {
    transform: scale(1.02);
    filter: brightness(0.72);
  }

  .project-links-carousel__info {
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    opacity: 0;
    transform: translate3d(0, -10px, 0);
    transition: opacity 0.28s ease, transform 0.28s ease;
    z-index: 3;
    pointer-events: none;
  }

  .project-links-carousel__chip {
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding: 0.38rem 0.9rem 0.42rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.14);
    color: #fff;
    border-radius: 3px;
    line-height: 1;
    white-space: nowrap;
    transform: translate3d(0, 10px, 0);
    opacity: 0;
    transition: opacity 0.34s ease, transform 0.42s cubic-bezier(.22, .61, .36, 1);
  }

  .project-links-carousel__chip--primary {
    font-family: "Titre italic", serif;
    font-style: italic;
    font-weight: 100;
    font-size: clamp(1.5rem, 1.8vw, 1.95rem);
    letter-spacing: -0.035em;
    min-height: 48px;
    padding: 0.45rem 1.15rem 0.52rem;
  }

  .project-links-carousel__card:hover .project-links-carousel__info,
  .project-links-carousel__card.is-active .project-links-carousel__info {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  .project-links-carousel__card:hover .project-links-carousel__chip,
  .project-links-carousel__card.is-active .project-links-carousel__chip {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  .project-links-carousel__copy {
    display: grid;
    gap: 0.8rem;
    align-content: end;
  }

  .project-links-carousel__stage--mobile .project-links-carousel__copy {
    padding: 0.8rem 0.1rem 0;
  }

  .project-links-carousel__meta {
    display: flex;
    justify-content: space-between;
    gap: 0.8rem;
    font-family: "General Sans", sans-serif;
    font-size: 0.76rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(245, 241, 232, 0.54);
  }

  .project-links-carousel__copy h3 {
    margin: 0;
    font-family: "Titre italic", serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(2.5rem, 4vw, 4.5rem);
    line-height: 0.92;
    letter-spacing: -0.06em;
    color: #f5f1e8;
  }

  .project-links-carousel__copy p {
    margin: 0;
    max-width: 24ch;
    font-family: "General Sans", sans-serif;
    font-size: clamp(0.98rem, 1.08vw, 1.04rem);
    line-height: 1.55;
    color: rgba(245, 241, 232, 0.68);
  }

  .project-links-carousel__index-wrap {
    position: absolute;
    left: 0;
    bottom: -30px;
    z-index: 6;
    overflow: hidden;
    height: 1.1em;
    pointer-events: none;
    width: max-content;
  }

  .project-links-carousel__index-inner {
    display: block;
    font-family: "Titre italic", serif;
    font-style: italic;
    font-weight: 100;
    font-size: 1.05rem;
    line-height: 1;
    letter-spacing: -0.02em;
    color: #fff;
    opacity: 0;
    transform: translate3d(0, -115%, 0);
    transition: transform 0.42s cubic-bezier(.22, .61, .36, 1), opacity 0.32s ease;
  }

  .project-links-carousel__index-wrap--active .project-links-carousel__index-inner,
  .project-links-carousel__card:hover .project-links-carousel__index-inner {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }

  @media (max-width: 900px) {
    .project-links-carousel {
      padding-top: 3.8rem;
    }

    .project-links-carousel__header {
      grid-template-columns: 1fr;
      padding-left: 0.8rem;
      padding-right: 0.8rem;
      padding-bottom: 1.6rem;
    }

    .project-links-carousel__title-wrap h2 {
      font-size: clamp(2.8rem, 13vw, 4.8rem);
    }

    .project-links-carousel__intro {
      justify-self: start;
      max-width: 22rem;
    }

    .project-links-carousel__copy h3 {
      font-size: clamp(2.2rem, 10vw, 3.3rem);
    }
  }
</style>
