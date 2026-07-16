<script>
  import { reveal } from "$lib/actions/reveal.js";
  import { navigate } from "$lib/navigate.js";

  // Deux grandes cartes présentées comme la galerie d'accueil (ParallaxGallery),
  // mais en grille statique : image plein cadre, titre qui bascule vers un CTA au
  // survol, bouton "+" avec glow, dézoom doux. Pas de slider, pas de texte au-dessus.
  export let cards = [];
  export let ctaLabel = "Découvrir";
  export let showSubtitle = true;

  function open(href) {
    if (href) navigate(href);
  }

  // Glow du "+" qui suit le curseur — même effet que les boutons du site.
  function handleCardMove(event) {
    const btn = event.currentTarget.querySelector(".pc-plus");
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }
</script>

<section class="sc">
  <div class="sc-grid">
    {#each cards as card, i}
      <svelte:element
        this={card.href ? "button" : "div"}
        class="pole-card"
        type={card.href ? "button" : undefined}
        data-cursor={card.href ? "view" : undefined}
        aria-label={card.href ? `Voir ${card.title}` : undefined}
        on:click={() => open(card.href)}
        on:mousemove={handleCardMove}
        use:reveal={{ delay: (i % 2) * 90 }}
      >
        <div class="pc-img">
          <img
            src={card.image}
            alt={card.alt ?? card.title ?? ""}
            loading="lazy"
            decoding="async"
            draggable="false"
          />
        </div>
        <div class="pc-shade" aria-hidden="true"></div>

        {#if card.tags?.length}
          <div class="pc-tags" aria-hidden="true">
            {#each card.tags.slice(0, 3) as tag}
              <span class="pc-tag">{tag}</span>
            {/each}
          </div>
        {/if}

        <div class="pc-foot">
          <span class="pc-title-flip" data-text={card.cta ?? ctaLabel} aria-hidden="true">
            <span class="pc-title-text">{card.title}</span>
          </span>
          {#if showSubtitle && card.subtitle}<span class="pc-subtitle">{card.subtitle}</span>{/if}
        </div>

        <span class="pc-plus" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        </span>
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
    gap: clamp(0.7rem, 1vw, 1.1rem);
  }

  /* ─────────── Carte (reprise du visuel ET des dimensions ParallaxGallery) ─────────── */
  .pole-card {
    position: relative;
    display: block;
    /* Même hauteur que les cartes de la galerie d'accueil. */
    height: min(86vh, 920px);
    width: 100%;
    padding: 0;
    border: 0;
    text-decoration: none;
    color: inherit;
    -webkit-tap-highlight-color: transparent;
    overflow: hidden;
    border-radius: 22px;
    background: var(--project-surface-card, #080808);
  }

  button.pole-card { cursor: pointer; }
  button.pole-card:focus-visible { outline: 2px solid var(--lead-blue, #5768ff); outline-offset: 4px; }

  .pc-img {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    border-radius: inherit;
    background: #080808;
  }

  .pc-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    /* Image légèrement zoomée au repos → dézoom doux au survol. */
    transform: scale(1.08) translateZ(0);
    transition: transform 1s cubic-bezier(.22,.61,.36,1);
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

  /* Chips services : en haut à droite (repris de la galerie d'accueil) */
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
    text-align: left;
  }

  /* Wipe-flip du titre → ctaLabel au survol (même mécanique que les boutons). */
  .pc-title-flip {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
    font-family: "Inter", sans-serif;
    font-size: clamp(1.6rem, 2.4vw, 2.4rem);
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

  /* Bouton "+" : en bas à droite, arrive au survol */
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

  /* ─────────── État survol ─────────── */
  button.pole-card:hover .pc-img img {
    transform: scale(1) translateZ(0);
    will-change: transform;
  }

  button.pole-card:hover .pc-title-text { transform: translateY(-100%); }
  button.pole-card:hover .pc-title-flip::after { transform: translateY(0%); }

  button.pole-card:hover .pc-plus {
    opacity: 1;
    transform: translateY(0) scale(1);
    background: rgba(255,255,255,.2);
  }

  button.pole-card:hover .pc-plus::before,
  button.pole-card:hover .pc-plus::after { opacity: 1; }

  @media (max-width: 900px) {
    .sc-grid { grid-template-columns: 1fr; gap: 1rem; }
    /* Même hauteur que les cartes mobile de la galerie d'accueil. */
    .pole-card { height: min(72vh, 660px); }
    .pc-title-flip { font-size: clamp(1.5rem, 6.2vw, 2.1rem); }
    .pc-tags { max-width: 86%; gap: .45rem; }
    .pc-tag {
      height: clamp(32px, 8.2vw, 38px);
      padding: 0 .95rem;
      font-size: clamp(.8rem, 3.4vw, .9rem);
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

  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .pole-card { height: min(78vh, 460px); }
  }
</style>
