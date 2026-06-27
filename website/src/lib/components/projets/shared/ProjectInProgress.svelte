<script>
  import { reveal } from "$lib/actions/reveal.js";

  export let id = "projet-en-cours";
  export let image = "";
  export let mobileImage = "";
  export let alt = "";
  export let title = "Projet en cours\nde création";
  export let ctaLabel = "Voir tous les projets";
  export let ctaHref = "/travail";

  function handleButtonMove(event) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    button.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    button.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }
</script>

<section class="pip" {id}>
  <div class="pip__media" aria-hidden="true">
    <picture>
      {#if mobileImage}
        <source media="(max-width: 640px)" srcset={mobileImage} />
      {/if}
      <img src={image} alt={alt} loading="lazy" decoding="async" />
    </picture>
    <div class="pip__shade"></div>
  </div>

  <div class="pip__content">
    <h2 class="pip__title" use:reveal>{title}</h2>

    {#if ctaHref}
      <a
        class="pip__cta"
        href={ctaHref}
        data-cursor="button"
        use:reveal={{ delay: 160 }}
        on:mousemove={handleButtonMove}
      >
        <span class="pip__cta-flip" data-text={ctaLabel}>
          <span class="pip__cta-text">{ctaLabel}</span>
        </span>
      </a>
    {/if}
  </div>
</section>

<style>
  .pip {
    position: relative;
    min-height: 100svh;
    display: flex;
    align-items: flex-end;
    overflow: clip;
    background: #000;
    isolation: isolate;
  }

  .pip__media {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .pip__media img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    transform: scale(1.06);
  }

  /* Clean black fade — just a thin black anchor at the very bottom so the edge
     melts into the page, then a light, quick dissolve so the image stays visible. */
  .pip__shade {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(
        to top,
        #000 0%,
        rgba(0, 0, 0, 0.86) 6%,
        rgba(0, 0, 0, 0.52) 16%,
        rgba(0, 0, 0, 0.28) 28%,
        rgba(0, 0, 0, 0.1) 44%,
        rgba(0, 0, 0, 0) 64%
      ),
      linear-gradient(
        90deg,
        rgba(0, 0, 0, 0.34) 0%,
        rgba(0, 0, 0, 0.1) 36%,
        rgba(0, 0, 0, 0) 66%
      );
    pointer-events: none;
  }

  .pip__content {
    position: relative;
    z-index: 2;
    width: min(1400px, 92%);
    margin: 0 auto;
    padding: 0 0 clamp(3.5rem, 9vh, 7rem);
    color: #f5f1e8;
  }

  .pip__title {
    margin: 0;
    max-width: 14ch;
    font-family: "Inter", sans-serif;
    font-weight: 500;
    /* Same size as the project hero title (.hero-scroll-label). */
    font-size: clamp(5.8rem, 5vw, 18rem);
    line-height: 1;
    letter-spacing: 0.02em;
    white-space: pre-line;
    text-wrap: balance;
    color: #f7f3ea;
    text-shadow: 0 8px 40px rgba(0, 0, 0, 0.32);
  }

  .pip__cta {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: clamp(3.1rem, 3.6vw, 3.6rem);
    margin-top: clamp(2rem, 3.4vw, 2.8rem);
    padding: 0 1.6rem;
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: clamp(0.95rem, 1.05vw, 1.08rem);
    color: #f5f1e8;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    border-radius: 12px;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.04);
  }

  .pip__cta-flip {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
  }

  .pip__cta-text {
    display: block;
    transform: translateY(0%);
    transition: transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1);
  }

  .pip__cta-flip::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition: transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1);
    white-space: nowrap;
    color: inherit;
  }

  .pip__cta:hover .pip__cta-text {
    transform: translateY(-100%);
  }

  .pip__cta:hover .pip__cta-flip::after {
    transform: translateY(0%);
  }

  .pip__cta::before,
  .pip__cta::after {
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

  .pip__cta::before {
    background: radial-gradient(
      128px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-strong) 0%,
      var(--site-glow-mid) 26%,
      var(--site-glow-soft) 52%,
      var(--site-glow-fade) 70%,
      transparent 86%
    );
    transition: opacity 0.25s ease;
  }

  .pip__cta::after {
    background: radial-gradient(
      156px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-ambient) 0%,
      var(--site-glow-outer) 48%,
      transparent 82%
    );
    filter: blur(3px);
    transition: opacity 0.25s ease;
  }

  .pip__cta:hover::before,
  .pip__cta:hover::after {
    opacity: 1;
  }

  @media (max-width: 900px) {
    .pip__title {
      font-size: clamp(4rem, 10vw, 7rem);
      max-width: 12ch;
    }
  }

  @media (max-width: 640px) {
    .pip__media img {
      transform: scale(1.04);
    }

    .pip__title {
      font-size: clamp(2.9rem, 13vw, 4.8rem);
      max-width: 11ch;
    }

    .pip__cta {
      width: 100%;
    }
  }
</style>
