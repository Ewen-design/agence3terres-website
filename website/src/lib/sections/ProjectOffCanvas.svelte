<script>
  import { createEventDispatcher } from "svelte";
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { fade, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  export let selected;
  export let items = [];

  const dispatch = createEventDispatcher();

  let currentIndex = 0;
  let direction = 1;

  $: if (selected && items.length) {
    currentIndex = items.findIndex((item) => item === selected);
  }

  function close() {
    dispatch("close");
  }

  function prev() {
    if (currentIndex > 0) {
      direction = -1.5;
      selected = items[currentIndex - 1];
    }
  }

  function next() {
    if (currentIndex < items.length - 1) {
      direction = 1.5;
      selected = items[currentIndex + 1];
    }
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

  onMount(() => {
    if (!browser) return;
    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  });

  onDestroy(() => {
    if (!browser) return;
    window.removeEventListener("keydown", handleKeydown);
  });
</script>

{#if selected}
  <div class="overlay" transition:fade>
    <div class="panel" in:fly={{ x: 200, duration: 500 }} out:fly={{ x: 200, duration: 400 }}>
      
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
          transition:fade
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
          transition:fade
        >
          <span class="btn-inner">
            <span class="nav-btn-sideflip" data-text="→">
              <span class="nav-btn-side-text">→</span>
            </span>
          </span>
        </button>
      {/if}

      {#key selected}
        <div
          class="card animated"
          in:fly|local={{ x: direction * 1200, duration: 900, opacity: 1, easing: cubicOut }}
          out:fly|local={{ x: direction * -1200, duration: 900, opacity: 1, easing: cubicOut }}
        >
          <div
            class="background parallax-bg"
            style="background-image: url({selected.image || '/images/photo.webp'})"
            in:fly|local={{
              x: direction * -700,
              duration: 900,
              opacity: 1,
              easing: cubicOut
            }}
            out:fly|local={{
              x: direction * 700,
              duration: 900,
              opacity: 1,
              easing: cubicOut
            }}
          ></div>

          <div class="info">
            <span class="date">{selected.date}</span>
            <h2>{selected.title}</h2>
            <p>{selected.desc}</p>
          </div>
        </div>
      {/key}
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(0, 0, 0, 0.4);
    z-index: 1000;
  }

  .panel {
    position: fixed;
    inset: 0;
    padding: 5vw;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ── Boutons ─────────────────────────────────────────────────────────── */
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

  .nav-btn::after {
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
    transform: translateY(-50%);
    z-index: 1002;
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

  .card.animated {
    position: absolute;
    width: 80%;
    height: 80vh;
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
  }

  .parallax-bg {
    will-change: transform;
    transform: scale(1.15);
  }

  .background {
    position: absolute;
    inset: -5%;
    background-size: cover;
    background-position: right center;
  }

  .background::after {
    content: "";
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

  @media (max-width: 900px) {
    .card,
    .card.animated {
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

    .background::after {
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
    .nav-btn,
    .nav-btn-text,
    .nav-btn-flip::after,
    .nav-btn-side-text,
    .nav-btn-sideflip::after {
      transition: none;
    }
  }
</style>