<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { reveal } from "$lib/actions/reveal.js";

  const mail = "contact@agence3terres.fr";

  // Arrivée de l'image de fond (fondu + léger dézoom) — comme les hero du site.
  let bgVisible = false;
  let fallbackTimer;

  onMount(() => {
    if (!browser) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) {
      bgVisible = true;
      return;
    }

    const start = () => {
      requestAnimationFrame(() => requestAnimationFrame(() => (bgVisible = true)));
    };

    // Sur le premier chargement, on attend que le preloader révèle le contenu ;
    // sinon (navigation interne) on lance directement.
    const onReveal = () => {
      clearTimeout(fallbackTimer);
      start();
    };

    if (document.getElementById("site-intro-loader")) {
      window.addEventListener("preloader:content-reveal", onReveal, { once: true });
      window.addEventListener("preloader:done", onReveal, { once: true });
      fallbackTimer = setTimeout(start, 8000);
    } else {
      start();
    }

    return () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener("preloader:content-reveal", onReveal);
      window.removeEventListener("preloader:done", onReveal);
    };
  });

  const socialLinks = [
    { href: "/", label: "Instagram", icon: "/images/instagram.png", className: "icon-instagram" },
    { href: "/", label: "Facebook", icon: "/images/facebook.png", className: "icon-facebook" },
    { href: "/", label: "X", icon: "/images/X.png", className: "icon-x" }
  ];

  function handleButtonMove(event) {
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }
</script>

<h1 class="seo-page-title">Contact - Agence 3 Terres</h1>

<section class="contact">
  <div
    class="contact-bg"
    class:is-visible={bgVisible}
    style="background-image: url('/images/agence.webp')"
  ></div>
  <div class="contact-overlay"></div>

  <div class="contact-content">
    <div class="contact-shell" use:reveal>
      <div class="hero-copy">
        <h2>Parlons <span class="muted">de votre projet.</span></h2>

        <a
          class="nav-btn contact-button"
          href={`mailto:${mail}`}
          on:mousemove={handleButtonMove}
        >
          <span class="nav-btn-flip" data-text="Écrire un message">
            <span class="nav-btn-text">{mail}</span>
          </span>
        </a>

        <div class="socials">
          {#each socialLinks as social}
            <a
              class="social"
              href={social.href}
              aria-label={social.label}
              data-cursor="button"
              on:mousemove={handleButtonMove}
              on:click|preventDefault
            >
              <img src={social.icon} alt={social.label} class={`icon ${social.className}`} />
            </a>
          {/each}
        </div>
      </div>

      <div class="footer-bar">
        <p class="legal">2026 Agence 3 Terres</p>
        <a class="legal legal-link legal-right" href="/mentions-legales" data-sveltekit-preload-data="hover">
          Mentions légales
        </a>
      </div>
    </div>
  </div>
</section>

<style>
  .contact {
    position: relative;
    min-height: 100svh;
    overflow: hidden;
    background: #070707;
    isolation: isolate;
  }

  .contact-bg,
  .contact-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .contact-bg {
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    filter: brightness(0.74) contrast(1.02) saturate(0.94);
    /* Arrivée : fondu + léger dézoom (comme les hero du site). */
    opacity: 0;
    transform: scale(1.08);
    transition:
      opacity 900ms cubic-bezier(0.22, 1, 0.36, 1),
      transform 1900ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: opacity, transform;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .contact-bg.is-visible {
    opacity: 1;
    transform: scale(1.03);
  }

  @media (prefers-reduced-motion: reduce) {
    .contact-bg {
      transition: none;
      opacity: 1;
      transform: scale(1.03);
    }
  }

  .contact-overlay {
    background: linear-gradient(
      to bottom,
      rgba(2, 4, 6, 0.52) 0%,
      rgba(4, 6, 9, 0.18) 34%,
      rgba(4, 6, 9, 0.1) 58%,
      rgba(2, 4, 6, 0.64) 100%
    );
  }

  .contact-content {
    position: relative;
    z-index: 2;
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: clamp(1.2rem, 2vw, 2rem);
  }

  .contact-shell {
    display: flex;
    flex-direction: column;
    gap: clamp(2rem, 5vw, 4rem);
    padding-bottom: max(clamp(1rem, 2vw, 1.8rem), var(--safe-bottom-offset));
  }

  .hero-copy {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: clamp(1.6rem, 3vw, 2.6rem);
    min-height: min(66lvh, 760px);
    justify-content: flex-end;
    max-width: min(52rem, 90vw);
    padding-bottom: clamp(1rem, 2.4vw, 2.2rem);
  }

  .hero-copy h2 {
    margin: 0;
    max-width: 10ch;
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: clamp(2.2rem, 5.5vw, 4.8rem);
    line-height: 0.96;
    letter-spacing: -0.04em;
    color: #fff;
    text-wrap: balance;
  }

  .muted {
    color: rgba(255, 255, 255, 0.42);
  }

  /* Bouton verre + glow + flip — identique au footer. */
  .nav-btn {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    color: #fff;
    text-decoration: none;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    border-radius: 10px;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.04);
    transition:
      color 220ms ease,
      transform 1.2s cubic-bezier(.22,.61,.36,1),
      box-shadow 1.2s cubic-bezier(.22,.61,.36,1),
      background 1.2s cubic-bezier(.22,.61,.36,1);
  }

  .contact-button {
    min-height: clamp(60px, 6.8vw, 78px);
    padding: 0 clamp(1.4rem, 2.4vw, 2.2rem);
    font-size: clamp(1.05rem, 1.5vw, 1.28rem);
    font-weight: 300;
  }

  .contact-button:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.17);
  }

  .nav-btn-flip {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
  }

  .nav-btn-text {
    display: block;
    transform: translateY(0%);
    transition: transform 0.45s cubic-bezier(.22,.61,.36,1);
  }

  .nav-btn-flip::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition: transform 0.45s cubic-bezier(.22,.61,.36,1);
    white-space: nowrap;
    color: inherit;
  }

  .nav-btn:hover .nav-btn-text { transform: translateY(-100%); }
  .nav-btn:hover .nav-btn-flip::after { transform: translateY(0%); }

  .nav-btn::before,
  .nav-btn::after {
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

  .nav-btn::before {
    background: radial-gradient(
      128px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-strong) 0%,
      var(--site-glow-mid) 26%,
      var(--site-glow-soft) 52%,
      var(--site-glow-fade) 70%,
      transparent 86%
    );
  }

  .nav-btn::after {
    background: radial-gradient(
      156px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-ambient) 0%,
      var(--site-glow-outer) 48%,
      transparent 82%
    );
    filter: blur(3px);
  }

  .nav-btn:hover::before,
  .nav-btn:hover::after { opacity: 1; }

  /* Réseaux sociaux — petits, discrets. */
  .socials {
    display: flex;
    align-items: center;
    gap: clamp(0.6rem, 1vw, 0.9rem);
  }

  .social {
    position: relative;
    width: clamp(2.8rem, 3.2vw, 3.3rem);
    height: clamp(2.8rem, 3.2vw, 3.3rem);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    border-radius: 10px;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.04);
  }

  /* Glow qui s'illumine sur le contour au survol — comme les autres boutons. */
  .social::before,
  .social::after {
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
  .social::before {
    background: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-strong) 0%,
      var(--site-glow-mid) 22%,
      var(--site-glow-soft) 45%,
      var(--site-glow-fade) 62%,
      transparent 78%
    );
  }
  .social::after {
    background: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-ambient) 0%,
      var(--site-glow-outer) 42%,
      transparent 72%
    );
    filter: blur(2px);
  }
  .social:hover::before,
  .social:hover::after { opacity: 1; }
  .icon {
    display: block;
    object-fit: contain;
    filter: brightness(0) invert(1);
  }
  .icon-instagram { width: clamp(1.25rem, 1.6vw, 1.5rem); height: clamp(1.25rem, 1.6vw, 1.5rem); }
  .icon-facebook { width: clamp(1.15rem, 1.5vw, 1.4rem); height: clamp(1.15rem, 1.5vw, 1.4rem); }
  .icon-x { width: clamp(1.1rem, 1.45vw, 1.35rem); height: clamp(1.1rem, 1.45vw, 1.35rem); }

  /* Barre légale — identique au footer. */
  .footer-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 1.1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }

  .legal {
    margin: 0;
    font-family: "Inter", sans-serif;
    font-weight: 300;
    font-size: 0.76rem;
    color: rgba(255, 255, 255, 0.44);
    line-height: 1.4;
    text-decoration: none;
  }
  .legal-right { text-align: right; }
  .legal-link { transition: color 220ms ease; }
  .legal-link:hover { color: rgba(255, 255, 255, 0.78); }

  @media (max-width: 768px) {
    .nav-btn,
    .social {
      backdrop-filter: blur(12px) saturate(130%);
      -webkit-backdrop-filter: blur(12px) saturate(130%);
    }

    .hero-copy h2 {
      max-width: 9ch;
      font-size: clamp(1.9rem, 9.5vw, 3.2rem);
    }

    .contact-button {
      width: min(100%, 320px);
    }
  }
</style>
