<script>
  import { reveal } from "$lib/actions/reveal.js";
  import { navigate } from "$lib/navigate.js";

  // Deux grandes cartes : l'image remplit tout le cadre, titre + sous-titre
  // incrustés en bas. Pas de chips, pas de bouton flèche.
  export let cards = [];

  function open(href) {
    if (href) navigate(href);
  }
</script>

<section class="sc">
  <div class="sc-grid">
    {#each cards as card, i}
      <svelte:element
        this={card.href ? "button" : "div"}
        class="sc-card"
        type={card.href ? "button" : undefined}
        data-cursor={card.href ? "view" : undefined}
        aria-label={card.href ? `Voir ${card.title}` : undefined}
        on:click={() => open(card.href)}
        use:reveal={{ delay: (i % 2) * 90 }}
      >
        <img class="sc-img" src={card.image} alt={card.alt ?? card.title ?? ""} loading="lazy" decoding="async" draggable="false" />
        <div class="sc-shade" aria-hidden="true"></div>
        <div class="sc-foot">
          <span class="sc-title">{card.title}</span>
          {#if card.subtitle}<span class="sc-subtitle">{card.subtitle}</span>{/if}
        </div>
      </svelte:element>
    {/each}
  </div>
</section>

<style>
  .sc {
    background: transparent;
    padding: clamp(1rem, 2vw, 2rem) 0 clamp(3rem, 6vw, 6rem);
  }

  .sc-grid {
    width: min(1400px, 92%);
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(1rem, 1.6vw, 1.4rem);
  }

  .sc-card {
    position: relative;
    display: block;
    aspect-ratio: 5 / 6;
    border-radius: 24px;
    overflow: hidden;
    border: 0;
    padding: 0;
    width: 100%;
    background: var(--project-surface-card, #121212);
  }

  button.sc-card { cursor: pointer; }
  button.sc-card:focus-visible { outline: 2px solid var(--lead-blue, #5768ff); outline-offset: 4px; }

  .sc-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform: scale(1);
    transition: transform 0.9s cubic-bezier(0.22, 0.61, 0.36, 1);
    will-change: transform;
  }

  button.sc-card:hover .sc-img { transform: scale(1.045); }

  .sc-shade {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.62) 0%,
      rgba(0, 0, 0, 0.18) 34%,
      rgba(0, 0, 0, 0) 62%
    );
    pointer-events: none;
  }

  .sc-foot {
    position: absolute;
    left: clamp(1.3rem, 2.2vw, 2.2rem);
    bottom: clamp(1.3rem, 2.2vw, 2.2rem);
    right: clamp(1.3rem, 2.2vw, 2.2rem);
  }

  .sc-title {
    display: block;
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: clamp(1.6rem, 2.4vw, 2.3rem);
    line-height: 1.02;
    letter-spacing: -0.025em;
    color: #fff;
    text-shadow: 0 1px 16px rgba(0, 0, 0, 0.4);
  }

  .sc-subtitle {
    display: block;
    margin-top: 0.35rem;
    font-family: "Inter", sans-serif;
    font-size: clamp(0.92rem, 1vw, 1.05rem);
    color: rgba(255, 255, 255, 0.78);
    text-shadow: 0 1px 12px rgba(0, 0, 0, 0.4);
  }

  @media (max-width: 900px) {
    .sc-grid { grid-template-columns: 1fr; }
    .sc-card { aspect-ratio: 4 / 5; }
  }

  @media (prefers-reduced-motion: reduce) {
    .sc-img { transition: none; }
    button.sc-card:hover .sc-img { transform: none; }
  }
</style>
