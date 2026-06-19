<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { navigate } from "$lib/navigate.js";

  export let title = "Donnons une forme claire a votre prochain projet.";
  export let buttonLabel = "Nous contacter";

  let sectionEl;
  let visibilityObserver;
  let isFullyVisible = false;

  function handleButtonMove(event) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    button.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    button.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  onMount(() => {
    if (!browser || !sectionEl) return;

    visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isFullyVisible = (entry?.intersectionRatio ?? 0) >= 0.99;
      },
      {
        threshold: [0, 0.99, 1]
      }
    );

    visibilityObserver.observe(sectionEl);

    return () => {
      visibilityObserver?.disconnect();
    };
  });

  onDestroy(() => {
    if (!browser) return;
    visibilityObserver?.disconnect();
  });
</script>

<section
  class="premium-contact-cta"
  class:is-light={isFullyVisible}
  bind:this={sectionEl}
>
  <div class="premium-contact-cta__inner">
    <span class="premium-contact-cta__eyebrow">"</span>

    <div class="premium-contact-cta__content">
      <div class="premium-contact-cta__copy">
        <h2>{title}</h2>
      </div>

      <div class="premium-contact-cta__action">
      <button
        class="premium-contact-cta__button"
        type="button"
        data-cursor="button"
        onmousemove={handleButtonMove}
        onclick={() => navigate("contact")}
      >
        <span class="premium-contact-cta__button-flip" data-text={buttonLabel}>
          <span class="premium-contact-cta__button-text">{buttonLabel}</span>
        </span>
      </button>
      </div>
    </div>
  </div>
</section>

<style>
  .premium-contact-cta {
    --cta-bg: #000;
    --cta-fg: #fff;
    --cta-muted: rgba(255,255,255,.48);
    --cta-button-bg: rgba(255, 255, 255, 0.11);
    --cta-button-border: rgba(255,255,255,.15);
    position: relative;
    background: var(--cta-bg);
    color: var(--cta-fg);
    overflow: clip;
    transition:
      background-color 1s cubic-bezier(.22,.61,.36,1),
      color 1s cubic-bezier(.22,.61,.36,1);
  }

  .premium-contact-cta.is-light {
    --cta-bg: #f3f0e8;
    --cta-fg: #111;
    --cta-muted: rgba(17,17,17,.52);
    --cta-button-bg: rgba(17, 17, 17, 0.18);
    --cta-button-border: rgba(17,17,17,.14);
  }

  .premium-contact-cta::before {
    content: none;
  }

  .premium-contact-cta__inner {
    position: relative;
    z-index: 1;
    width: min(1520px, 100%);
    min-height: 82svh;
    margin: 0 auto;
    padding:
      clamp(2.5rem, 4vw, 4rem)
      clamp(1.4rem, 4vw, 4.5rem)
      clamp(2.5rem, 4vw, 4rem);
    display: grid;
    grid-template-rows: auto 1fr;
    gap: clamp(2rem, 5vw, 4rem);
  }

  .premium-contact-cta__eyebrow {
    font-family: "Clash Display", sans-serif;
    font-size: clamp(2.2rem, 3vw, 3rem);
    line-height: 1;
    color: var(--cta-muted);
    transition: color 1s cubic-bezier(.22,.61,.36,1);
  }

  .premium-contact-cta__content {
    display: grid;
    grid-template-columns: minmax(0, 1fr) clamp(15rem, 19vw, 18.5rem);
    align-items: center;
    gap: clamp(2rem, 6vw, 6rem);
  }

  .premium-contact-cta__copy {
    max-width: min(64rem, 68vw);
  }

  .premium-contact-cta__copy h2 {
    margin: 0;
    font-family: "Clash Display", sans-serif;
    font-size: clamp(3rem, 5.8vw, 6rem);
    font-weight: 300;
    line-height: .98;
    letter-spacing: -0.055em;
    max-width: 12ch;
    color: var(--cta-fg);
    transition:
      color 1s cubic-bezier(.22,.61,.36,1),
      opacity .8s ease;
  }

  .premium-contact-cta__action {
    display: flex;
    justify-content: flex-end;
    align-self: end;
    padding-top: clamp(4rem, 10vh, 7rem);
  }

  .premium-contact-cta__button {
    font-family: "Clash Display", sans-serif;
    position: relative;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 1.5rem;
    font-size: 0.9rem;
    white-space: nowrap;
    border: 1px solid var(--cta-button-border);
    background: var(--cta-button-bg);
    color: var(--cta-fg);
    cursor: pointer;
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    will-change: transform, opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 10px;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.04);
    transition:
      color 220ms ease,
      background-color .7s cubic-bezier(.22,.61,.36,1),
      border-color .7s cubic-bezier(.22,.61,.36,1),
      transform 1.2s cubic-bezier(.22,.61,.36,1),
      box-shadow 1.2s cubic-bezier(.22,.61,.36,1),
      background 1.2s cubic-bezier(.22,.61,.36,1);
  }

  .premium-contact-cta__button-flip {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
  }

  .premium-contact-cta__button-text {
    display: block;
    transform: translateY(0%);
    transition:
      transform 0.45s cubic-bezier(.22,.61,.36,1),
      opacity 0.28s ease;
  }

  .premium-contact-cta__button-flip::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition:
      transform 0.45s cubic-bezier(.22,.61,.36,1),
      opacity 0.28s ease;
    white-space: nowrap;
    color: inherit;
  }

  .premium-contact-cta__button:hover .premium-contact-cta__button-text {
    transform: translateY(-100%);
  }

  .premium-contact-cta__button:hover .premium-contact-cta__button-flip::after {
    transform: translateY(0%);
  }

  .premium-contact-cta__button::before,
  .premium-contact-cta__button::after {
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

  .premium-contact-cta__button::before {
    background: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-strong) 0%,
      var(--site-glow-mid) 22%,
      var(--site-glow-soft) 45%,
      var(--site-glow-fade) 62%,
      transparent 78%
    );
    transition: opacity 0.25s ease;
  }

  .premium-contact-cta__button::after {
    background: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-ambient) 0%,
      var(--site-glow-outer) 42%,
      transparent 72%
    );
    filter: blur(2px);
    transition: opacity 0.25s ease;
  }

  .premium-contact-cta__button:hover::before,
  .premium-contact-cta__button:hover::after {
    opacity: 1;
  }

  @media (max-width: 900px) {
    .premium-contact-cta__button {
      backdrop-filter: blur(12px) saturate(130%);
      -webkit-backdrop-filter: blur(12px) saturate(130%);
    }

    .premium-contact-cta__inner {
      min-height: auto;
      padding:
        1.6rem
        1.1rem
        2rem;
      gap: 1.8rem;
    }

    .premium-contact-cta__content {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .premium-contact-cta__copy h2 {
      font-size: clamp(2.35rem, 11.5vw, 4rem);
      line-height: .95;
      max-width: 11ch;
    }

    .premium-contact-cta__action {
      justify-content: flex-start;
      padding-top: 0;
    }
  }
</style>
