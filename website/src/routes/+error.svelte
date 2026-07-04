<script>
  import { page } from "$app/stores";

  $: status = $page.status ?? 404;
  $: isNotFound = status === 404;
  $: title = isNotFound ? "Page introuvable" : "Une erreur est survenue";

  // Cursor-tracked glow border — same system as the rest of the site's buttons.
  function handleButtonMove(event) {
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }
</script>

<svelte:head>
  <title>{status} — {title} · Agence 3 Terres</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<section class="err">
  <div class="err__media" aria-hidden="true">
    <img src="/images/agence2.webp" alt="" fetchpriority="high" decoding="async" />
    <div class="err__shade"></div>
  </div>

  <div class="err__content">
    <span class="err__code">{status}</span>
    <h1 class="err__title">{title}</h1>

    <a class="err__cta" href="/" data-cursor="button" on:mousemove={handleButtonMove}>
      <span class="err__cta-flip" data-text="Retour à l'accueil">
        <span class="err__cta-text">Retour à l'accueil</span>
      </span>
    </a>
  </div>
</section>

<style>
  .err {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100svh;
    width: 100%;
    overflow: clip;
    background: #05060a;
    color: #f4efe6;
    isolation: isolate;
    text-align: center;
  }

  .err__media {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .err__media img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    /* Sharp (no blur) — darkened just enough for the text to read cleanly. */
    filter: saturate(112%) brightness(0.5) contrast(1.02);
    transform: translateZ(0) scale(1.03);
  }

  .err__shade {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        120% 90% at 50% 42%,
        rgba(5, 6, 10, 0) 0%,
        rgba(5, 6, 10, 0.35) 55%,
        rgba(5, 6, 10, 0.72) 100%
      ),
      linear-gradient(
        to bottom,
        rgba(5, 6, 10, 0.55) 0%,
        rgba(5, 6, 10, 0.2) 34%,
        rgba(5, 6, 10, 0.2) 66%,
        rgba(5, 6, 10, 0.7) 100%
      );
    pointer-events: none;
  }

  .err__content {
    position: relative;
    z-index: 2;
    width: min(680px, 90%);
    padding: 2rem 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .err__code {
    font-family: var(--site-font, "Inter", sans-serif);
    font-weight: 500;
    font-size: clamp(1.4rem, 2.4vw, 2.1rem);
    letter-spacing: 0.14em;
    color: #f7f3ea;
    margin-bottom: clamp(1rem, 2vw, 1.5rem);
  }

  .err__title {
    margin: 0;
    font-family: var(--site-font, "Inter", sans-serif);
    font-weight: 600;
    font-size: clamp(2.8rem, 7vw, 5.6rem);
    line-height: 1;
    letter-spacing: var(--site-display-letter-spacing, -0.028em);
    color: #f7f3ea;
    text-wrap: balance;
    text-shadow: 0 8px 40px rgba(0, 0, 0, 0.35);
  }

  .err__text {
    margin: clamp(1.4rem, 2.6vw, 2rem) 0 0;
    max-width: 42ch;
    font-family: var(--site-font, "Inter", sans-serif);
    font-weight: 300;
    font-size: clamp(1rem, 1.35vw, 1.2rem);
    line-height: 1.55;
    color: rgba(244, 239, 230, 0.82);
    text-wrap: pretty;
  }

  /* Glass CTA — same language / glow as the rest of the site's buttons. */
  .err__cta {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: clamp(3.1rem, 3.8vw, 3.6rem);
    margin-top: clamp(2.2rem, 3.6vw, 3rem);
    padding: 0 1.8rem;
    font-family: var(--site-font, "Inter", sans-serif);
    font-weight: 400;
    font-size: clamp(0.95rem, 1.05vw, 1.08rem);
    color: #f7f2e8;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    border-radius: 12px;
    box-shadow: 0 6px 22px rgba(0, 0, 0, 0.28);
  }

  .err__cta:focus-visible {
    outline: 2px solid rgba(245, 241, 232, 0.9);
    outline-offset: 3px;
  }

  /* Glowing border on hover — same mask + glow variables as the site buttons. */
  .err__cta::before,
  .err__cta::after {
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
    transition: opacity 0.25s ease;
  }

  .err__cta::before {
    background: radial-gradient(
      128px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-strong) 0%,
      var(--site-glow-mid) 26%,
      var(--site-glow-soft) 52%,
      var(--site-glow-fade) 70%,
      transparent 86%
    );
  }

  .err__cta::after {
    background: radial-gradient(
      156px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-ambient) 0%,
      var(--site-glow-outer) 48%,
      transparent 82%
    );
    filter: blur(3px);
  }

  .err__cta:hover::before,
  .err__cta:hover::after { opacity: 1; }

  .err__cta-flip {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
  }

  .err__cta-text {
    display: block;
    transform: translateY(0%);
    transition: transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1);
  }

  .err__cta-flip::after {
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

  .err__cta:hover .err__cta-text { transform: translateY(-100%); }
  .err__cta:hover .err__cta-flip::after { transform: translateY(0%); }

  @media (prefers-reduced-motion: reduce) {
    .err__cta-text,
    .err__cta-flip::after { transition: none; }
  }
</style>
