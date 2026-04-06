<script>
  import { createEventDispatcher } from "svelte";
  import { onMount, onDestroy, tick } from "svelte";
  import { browser } from "$app/environment";

  export let selected;
  export let items = [];

  const dispatch = createEventDispatcher();

  let currentIndex = 0;
  let direction = 1;
  let prefersReduced = false;
  let mediaQuery;
  let removeMotionListener;

  let displayItem = null;
  let cardStage = "idle";
  let isSwitching = false;

  const DURATION = 820;
  const EXIT_DURATION = 520;

  $: if (selected && items.length) {
    currentIndex = items.findIndex((item) => item === selected);
  }

  $: if (selected && !displayItem) {
    displayItem = selected;
  }

  $: if (selected && displayItem && selected !== displayItem && !isSwitching) {
    switchItem(selected);
  }

  function close() {
    dispatch("close");
  }

  async function switchItem(nextItem) {
    if (!nextItem || prefersReduced) {
      displayItem = nextItem;
      cardStage = "idle";
      return;
    }

    isSwitching = true;
    cardStage = "is-exiting";
    await wait(EXIT_DURATION);

    displayItem = nextItem;
    cardStage = "is-enter-prep";
    await tick();

    requestAnimationFrame(() => {
      cardStage = "is-entering";
      requestAnimationFrame(() => {
        cardStage = "idle";
        isSwitching = false;
      });
    });
  }

  function prev() {
    if (currentIndex > 0) {
      direction = -1;
      selected = items[currentIndex - 1];
    }
  }

  function next() {
    if (currentIndex < items.length - 1) {
      direction = 1;
      selected = items[currentIndex + 1];
    }
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function handleButtonMove(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  function handleKeydown(e) {
    if (!selected) return;

    if (e.key === "Escape") {
      close();
    } else if (e.key === "ArrowLeft") {
      prev();
    } else if (e.key === "ArrowRight") {
      next();
    }
  }

  function preloadAdjacent() {
    if (!selected || !items.length || !browser) return;

    const index = items.findIndex((item) => item === selected);
    const sources = [];

    if (index > 0) sources.push(items[index - 1]?.image);
    if (index < items.length - 1) sources.push(items[index + 1]?.image);

    for (const src of sources) {
      if (!src) continue;
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    }
  }

  onMount(() => {
    if (!browser) return;

    mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReduced = mediaQuery.matches;

    const onMotion = (e) => {
      prefersReduced = e.matches;
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", onMotion);
      removeMotionListener = () => mediaQuery.removeEventListener("change", onMotion);
    } else {
      mediaQuery.addListener(onMotion);
      removeMotionListener = () => mediaQuery.removeListener(onMotion);
    }

    window.addEventListener("keydown", handleKeydown, { passive: false });
  });

  onDestroy(() => {
    if (!browser) return;
    window.removeEventListener("keydown", handleKeydown);
    removeMotionListener?.();
  });

  $: if (selected) preloadAdjacent();
</script>

{#if selected}
  <div class="overlay">
    <div class="panel">
      <button
        class="nav-btn close"
        data-cursor="close"
        type="button"
        aria-label="Fermer"
        on:mousemove={handleButtonMove}
        on:click={close}
      >
        <span class="btn-inner">
          <span class="nav-btn-flip" data-text="✕">
            <span class="nav-btn-text">✕</span>
          </span>
        </span>
      </button>

      {#if currentIndex > 0}
        <button
          class="nav-btn arrow left"
          type="button"
          aria-label="Projet précédent"
          on:mousemove={handleButtonMove}
          on:click={prev}
        >
          <span class="btn-inner">
            <span class="nav-btn-sideflip" data-text="←">
              <span class="nav-btn-side-text">←</span>
            </span>
          </span>
        </button>
      {/if}

      {#if currentIndex < items.length - 1}
        <button
          class="nav-btn arrow right"
          type="button"
          aria-label="Projet suivant"
          on:mousemove={handleButtonMove}
          on:click={next}
        >
          <span class="btn-inner">
            <span class="nav-btn-sideflip" data-text="→">
              <span class="nav-btn-side-text">→</span>
            </span>
          </span>
        </button>
      {/if}

      {#if displayItem}
        <div
          class="card animated {cardStage}"
          class:dir-left={direction < 0}
          class:dir-right={direction > 0}
          style={`--card-duration:${DURATION}ms; --card-exit-duration:${EXIT_DURATION}ms;`}
        >
          <div class="media-layer">
            <img
              class="background-img"
              src={displayItem.image || "/images/photo.webp"}
              alt={displayItem.title}
              decoding="async"
              draggable="false"
            />
            <div class="background-overlay"></div>
          </div>

          <div class="info">
            <span class="date">{displayItem.date}</span>
            <h2>{displayItem.title}</h2>
            <p>{displayItem.desc}</p>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    z-index: 1000;
    animation: overlayIn 340ms ease both;
  }

  .panel {
    position: fixed;
    inset: 0;
    padding: 5vw;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-btn {
    font-family: "General Sans", sans-serif;
    position: relative;
    width: 56px;
    height: 56px;
    min-width: 56px;
    min-height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    font-size: 1.1rem;
    color: white;
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
    isolation: isolate;
    transform: translateZ(0);
  }

  .btn-inner {
    position: relative;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    width: 1.3em;
    height: 1.3em;
  }

  .nav-btn::before,
  .nav-btn::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
    z-index: 2;
  }

  .nav-btn::before {
    border: 1px solid transparent;
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

  .nav-btn::after {
    border: 1px solid transparent;
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

  .nav-btn:hover::before,
  .nav-btn:hover::after {
    opacity: 1;
  }

  .nav-btn-flip {
    position: relative;
    display: block;
    overflow: hidden;
    width: 1.1em;
    height: 1.2em;
    line-height: 1.2em;
  }

  .nav-btn-text {
    display: block;
    transform: translateY(0%);
    transition:
      transform 0.45s cubic-bezier(.22,.61,.36,1),
      opacity 0.28s ease;
  }

  .nav-btn-flip::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    line-height: 1.2em;
    transform: translateY(100%);
    transition:
      transform 0.45s cubic-bezier(.22,.61,.36,1),
      opacity 0.28s ease;
    color: inherit;
  }

  .close:hover .nav-btn-text {
    transform: translateY(-100%);
  }

  .close:hover .nav-btn-flip::after {
    transform: translateY(0%);
  }

  .nav-btn-sideflip {
    position: relative;
    display: block;
    overflow: hidden;
    width: 1.1em;
    height: 1.2em;
    line-height: 1.2em;
  }

  .nav-btn-side-text {
    display: block;
    transition:
      transform 0.45s cubic-bezier(.22,.61,.36,1),
      opacity 0.28s ease;
  }

  .nav-btn-sideflip::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    line-height: 1.2em;
    color: inherit;
    transition:
      transform 0.45s cubic-bezier(.22,.61,.36,1),
      opacity 0.28s ease;
  }

  .arrow.left .nav-btn-side-text {
    transform: translateX(0%);
  }

  .arrow.left .nav-btn-sideflip::after {
    transform: translateX(120%);
  }

  .arrow.left:hover .nav-btn-side-text {
    transform: translateX(-120%);
  }

  .arrow.left:hover .nav-btn-sideflip::after {
    transform: translateX(0%);
  }

  .arrow.right .nav-btn-side-text {
    transform: translateX(0%);
  }

  .arrow.right .nav-btn-sideflip::after {
    transform: translateX(-120%);
  }

  .arrow.right:hover .nav-btn-side-text {
    transform: translateX(120%);
  }

  .arrow.right:hover .nav-btn-sideflip::after {
    transform: translateX(0%);
  }

  .close {
    position: absolute;
    top: 30px;
    right: 40px;
    z-index: 1002;
  }

  .arrow {
    position: absolute;
    top: 50%;
    z-index: 1002;
    transform: translateY(-50%);
  }

  .arrow:hover {
    transform: translateY(-50%) scale(1.06);
  }

  .arrow.left {
    left: 40px;
  }

  .arrow.right {
    right: 40px;
  }

  .card {
    position: relative;
    width: 80%;
    height: 80vh;
    background: #111;
    border-radius: 3px;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
    transform: translate3d(0, 0, 0);
    opacity: 1;
    will-change: transform, opacity;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .animated {
    position: absolute;
  }

  .media-layer {
    position: absolute;
    inset: -5%;
    overflow: hidden;
  }

  .background-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: right center;
    transform: scale(1.14);
    will-change: transform, opacity;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .background-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to left,
      rgba(17,17,17,0) 30%,
      rgba(17,17,17,0.95) 55%,
      rgba(17,17,17,1) 75%,
      #111 95%
    );
  }

  .info {
    position: relative;
    z-index: 2;
    color: white;
    padding: 4vw;
    max-width: 45%;
  }

  .info h2 {
    font-family: "Titre", serif;
    font-size: 2.6rem;
    margin: 10px 0 20px;
    letter-spacing: 0.5px;
    font-weight: 400;
  }

  .info p {
    font-family: "General Sans", sans-serif;
    line-height: 1.6;
    opacity: 0.9;
  }

  .date {
    font-family: "General Sans", sans-serif;
    font-size: 0.9rem;
    opacity: 0.7;
    letter-spacing: 1px;
  }

  .card.is-enter-prep.dir-right {
    transform: translate3d(7vw, 0, 0);
    opacity: 0.999;
  }

  .card.is-enter-prep.dir-left {
    transform: translate3d(-7vw, 0, 0);
    opacity: 0.999;
  }

  .card.is-enter-prep .background-img {
    transform: scale(1.14) translate3d(calc(var(--bg-shift, 0px) * -1), 0, 0);
  }

  .card.is-entering,
  .card.idle {
    transition:
      transform var(--card-duration) cubic-bezier(.22,.61,.36,1),
      opacity var(--card-duration) cubic-bezier(.22,.61,.36,1);
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }

  .card.is-entering .background-img,
  .card.idle .background-img {
    transition: transform var(--card-duration) cubic-bezier(.22,.61,.36,1);
    transform: scale(1.14) translate3d(0, 0, 0);
  }

  .card.is-exiting.dir-right {
    transform: translate3d(-7vw, 0, 0);
    opacity: 0.999;
    transition:
      transform var(--card-exit-duration) cubic-bezier(.22,.61,.36,1),
      opacity var(--card-exit-duration) cubic-bezier(.22,.61,.36,1);
  }

  .card.is-exiting.dir-left {
    transform: translate3d(7vw, 0, 0);
    opacity: 0.999;
    transition:
      transform var(--card-exit-duration) cubic-bezier(.22,.61,.36,1),
      opacity var(--card-exit-duration) cubic-bezier(.22,.61,.36,1);
  }

  .card.is-exiting.dir-right .background-img {
    transform: scale(1.14) translate3d(3vw, 0, 0);
    transition: transform var(--card-exit-duration) cubic-bezier(.22,.61,.36,1);
  }

  .card.is-exiting.dir-left .background-img {
    transform: scale(1.14) translate3d(-3vw, 0, 0);
    transition: transform var(--card-exit-duration) cubic-bezier(.22,.61,.36,1);
  }

  @keyframes overlayIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (max-width: 900px) {
    .card {
      width: 92%;
      height: 78vh;
    }

    .info {
      max-width: 75%;
      padding: 2rem;
    }

    .info h2 {
      font-size: 2rem;
    }

    .nav-btn {
      width: 50px;
      height: 50px;
      min-width: 50px;
      min-height: 50px;
    }

    .arrow.left {
      left: 18px;
    }

    .arrow.right {
      right: 18px;
    }

    .close {
      top: 18px;
      right: 18px;
    }
  }

  @media (max-width: 768px) {
    .info {
      max-width: 100%;
    }

    .background-overlay {
      background: linear-gradient(
        to top,
        rgba(17,17,17,1) 8%,
        rgba(17,17,17,0.88) 28%,
        rgba(17,17,17,0.35) 56%,
        rgba(17,17,17,0.08) 78%,
        rgba(17,17,17,0) 100%
      );
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .overlay,
    .card,
    .background-img,
    .nav-btn,
    .nav-btn-text,
    .nav-btn-flip::after,
    .nav-btn-side-text,
    .nav-btn-sideflip::after {
      transition: none !important;
      animation: none !important;
    }
  }
</style>