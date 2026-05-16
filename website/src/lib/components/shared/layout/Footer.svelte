<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";

  let footerEl;
  let footerReveal = 0;
  let scrollRaf = 0;
  let resizeObserver;

  const footerImages = {
    "/": "/images/telephone3.webp",
    "/services": "/images/creation_logo_desktop2.webp",
    "/travail": "/images/parfum4.webp",
    "/apropos": "/images/creation_logo_desktop.webp",
    "/contact": "/images/photo2.webp",
    "/projet1": "/images/parfum4.webp",
    "/projet2": "/images/telephone2_parfum.webp",
    "/projet3": "/images/telephone_main.webp",
    "/projet4": "/images/carte-copie.jpg"
  };

  $: pathname = $page.url.pathname.replace(/\/+$/, "") || "/";
  $: footerImage = footerImages[pathname] ?? footerImages["/"];
  $: footerThemeClass =
    pathname === "/services" ? "theme-services" :
    ["/travail", "/projet1", "/projet2", "/projet3", "/projet4"].includes(pathname) ? "theme-projets" :
    pathname === "/apropos" ? "theme-apropos" :
    pathname === "/contact" ? "theme-contact" :
    "theme-home";

  function handleButtonMove(event) {
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  function clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }

  function updateFooterMetrics() {
    if (!browser || !footerEl) return;

    const footerHeight = footerEl.offsetHeight;
    document.documentElement.style.setProperty("--footer-reserve", `${footerHeight}px`);

    const viewportHeight = document.documentElement.clientHeight || window.innerHeight || 0;
    const scrollTop = window.scrollY || window.pageYOffset || 0;
    const docHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );
    const revealStart = Math.max(docHeight - viewportHeight - footerHeight * 1.05, 0);
    const revealDistance = Math.max(footerHeight * 0.82, 1);
    const progress = (scrollTop - revealStart) / revealDistance;
    footerReveal = clamp01(progress);
  }

  function scheduleFooterReveal() {
    cancelAnimationFrame(scrollRaf);
    scrollRaf = requestAnimationFrame(() => {
      updateFooterMetrics();
    });
  }

  onMount(() => {
    if (!browser || !footerEl) return;

    resizeObserver = new ResizeObserver(() => {
      scheduleFooterReveal();
    });

    resizeObserver.observe(footerEl);

    updateFooterMetrics();
    window.addEventListener("scroll", scheduleFooterReveal, { passive: true });
    window.addEventListener("resize", scheduleFooterReveal, { passive: true });

    return () => {
      cancelAnimationFrame(scrollRaf);
      resizeObserver?.disconnect();
      document.documentElement.style.removeProperty("--footer-reserve");
      window.removeEventListener("scroll", scheduleFooterReveal);
      window.removeEventListener("resize", scheduleFooterReveal);
    };
  });
</script>

<footer
  class={`footer section-full ${footerThemeClass}`}
  bind:this={footerEl}
  style={`--footer-reveal:${footerReveal};`}
>
  <div class="footer-bg" style={`background-image: url('${footerImage}')`}></div>
  <div class="footer-overlay"></div>

  <div class="footer-content">
    <div class="footer-shell">
      <div class="hero-block">
        <div class="hero-copy">
          <h2>Parlons de votre projet.</h2>
          <a
            href="/contact"
            class="contact-button nav-btn"
            data-sveltekit-preload-data="hover"
            on:mousemove={handleButtonMove}
          >
            <span class="nav-btn-flip" data-text="Nous contacter">
              <span class="nav-btn-text">Nous contacter</span>
            </span>
          </a>
        </div>
      </div>

      <div class="footer-bar">
        <p class="legal">2026 Agence 3 Terres</p>
        <a
          class="legal legal-link legal-right"
          href="/mentions-legales"
          data-sveltekit-preload-data="hover"
        >
          Mentions légales
        </a>
      </div>
    </div>
  </div>
</footer>

<style>
  .footer {
    --footer-reveal: 0;
    position: fixed;
    inset: auto 0 0 0;
    bottom: 0;
    overflow: hidden;
    background: #070707;
    isolation: isolate;
    z-index: 0;
    opacity: var(--footer-reveal);
    transition: opacity 0.35s linear;
  }

  .footer-bg,
  .footer-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .footer-bg {
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    filter: brightness(0.56) contrast(1.02) saturate(0.92);
    opacity: calc(0.12 + (0.88 * var(--footer-reveal)));
    transition:
      opacity 0.95s cubic-bezier(.22,.61,.36,1),
      transform 0.95s cubic-bezier(.22,.61,.36,1);
    will-change: opacity;
    transform: scale(1.03);
  }

  .footer-overlay {
    background: linear-gradient(
      to bottom,
      rgba(2, 4, 6, 0.9) 0%,
      rgba(4, 6, 9, 0.46) 34%,
      rgba(4, 6, 9, 0.22) 58%,
      rgba(2, 4, 6, 0.9) 100%
    );
    opacity: calc(0.2 + (0.8 * var(--footer-reveal)));
    transition: opacity 0.95s cubic-bezier(.22,.61,.36,1);
    will-change: opacity;
  }

  .footer-content {
    position: relative;
    z-index: 2;
    min-height: 100lvh;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: clamp(1.2rem, 2vw, 2rem);
  }

  .footer-shell {
    display: flex;
    flex-direction: column;
    gap: clamp(2rem, 5vw, 4rem);
    padding-bottom: max(clamp(1rem, 2vw, 1.8rem), var(--safe-bottom-offset));
    opacity: 0;
    transform: translate3d(0, 18px, 0);
    transition:
      opacity 0.95s cubic-bezier(.22,.61,.36,1) 0.08s,
      transform 0.95s cubic-bezier(.22,.61,.36,1) 0.08s;
    will-change: opacity, transform;
  }

  .hero-block {
    min-height: min(74lvh, 860px);
    display: flex;
    align-items: end;
    gap: clamp(1.4rem, 4vw, 4rem);
  }

  .hero-copy {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: clamp(1.5rem, 3vw, 2.8rem);
    max-width: min(44rem, 78vw);
    padding-bottom: clamp(1rem, 2.4vw, 2.2rem);
    width: 100%;
  }

  .hero-copy h2 {
    margin: 0;
    max-width: 10ch;
    font-family: "Clash Display", sans-serif;
    font-weight: 200;
    font-size: clamp(2.8rem, 7.1vw, 6.2rem);
    line-height: 0.96;
    letter-spacing: -0.05em;
    color: #fff;
    text-wrap: balance;
  }

  .nav-btn {
    font-family: "Clash Display", sans-serif;
    font-weight: 400;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    color: inherit;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    will-change: transform, opacity, backdrop-filter, -webkit-backdrop-filter;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.04);
    transition:
      color 220ms ease,
      transform 1.2s cubic-bezier(.22,.61,.36,1),
      box-shadow 1.2s cubic-bezier(.22,.61,.36,1),
      background 1.2s cubic-bezier(.22,.61,.36,1);
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
    transition:
      transform 0.45s cubic-bezier(.22,.61,.36,1),
      opacity 0.28s ease;
  }

  .nav-btn-flip::after {
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

  .nav-btn:hover .nav-btn-text {
    transform: translateY(-100%);
  }

  .nav-btn:hover .nav-btn-flip::after {
    transform: translateY(0%);
  }

  .nav-btn::before,
  .nav-btn::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
  }

  .nav-btn::before {
    border: 1px solid transparent;
    border-radius: inherit;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      128px circle at var(--mx, 50%) var(--my, 50%),
      var(--footer-glow-strong, rgba(255, 225, 140, 1)) 0%,
      var(--footer-glow-mid, rgba(212, 175, 55, 0.95)) 26%,
      var(--footer-glow-soft, rgba(212, 102, 55, 0.55)) 52%,
      var(--footer-glow-fade, rgba(212, 102, 55, 0.12)) 70%,
      transparent 86%
    );
    transition: opacity 0.25s ease;
  }

  .nav-btn::after {
    border: 1px solid transparent;
    border-radius: inherit;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      156px circle at var(--mx, 50%) var(--my, 50%),
      var(--footer-glow-ambient, rgba(212, 175, 55, 0.55)) 0%,
      var(--footer-glow-outer, rgba(212, 102, 55, 0.22)) 48%,
      transparent 82%
    );
    filter: blur(3px);
    transition: opacity 0.25s ease;
  }

  .nav-btn:hover::before,
  .nav-btn:hover::after {
    opacity: 1;
  }

  .contact-button {
    min-width: clamp(180px, 20vw, 260px);
    min-height: clamp(60px, 6.8vw, 78px);
    padding: 0 2rem;
    margin-top: clamp(0.35rem, 1vw, 0.8rem);
    border: 0 solid rgba(255, 255, 255, 0.15);
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    text-decoration: none;
    font-size: clamp(1.08rem, 1.5vw, 1.26rem);
  }

  .contact-button:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.15);
  }

  .theme-home,
  .theme-apropos {
    --footer-glow-strong: rgba(255, 225, 140, 1);
    --footer-glow-mid: rgba(212, 175, 55, 0.95);
    --footer-glow-soft: rgba(212, 102, 55, 0.55);
    --footer-glow-fade: rgba(212, 102, 55, 0.12);
    --footer-glow-ambient: rgba(212, 175, 55, 0.55);
    --footer-glow-outer: rgba(212, 102, 55, 0.22);
  }

  .theme-services,
  .theme-projets {
    --footer-glow-strong: rgba(220, 240, 255, 1);
    --footer-glow-mid: rgba(145, 205, 255, 0.98);
    --footer-glow-soft: rgba(74, 140, 255, 0.62);
    --footer-glow-fade: rgba(18, 45, 120, 0.14);
    --footer-glow-ambient: rgba(95, 165, 255, 0.42);
    --footer-glow-outer: rgba(74, 140, 255, 0.18);
  }

  .theme-contact {
    --footer-glow-strong: rgba(235, 232, 255, 1);
    --footer-glow-mid: rgba(210, 210, 230, 0.98);
    --footer-glow-soft: rgba(130, 110, 220, 0.62);
    --footer-glow-fade: rgba(35, 30, 95, 0.14);
    --footer-glow-ambient: rgba(150, 140, 230, 0.42);
    --footer-glow-outer: rgba(130, 110, 220, 0.18);
  }

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
    font-family: "Clash Display", sans-serif;
    font-weight: 300;
    font-size: 0.76rem;
    color: rgba(255, 255, 255, 0.44);
    line-height: 1.4;
  }

  .legal-right {
    text-align: right;
  }

  .legal-link {
    transition: color 220ms ease, opacity 220ms ease;
  }

  .legal-link:hover {
    color: rgba(255, 255, 255, 0.78);
  }

  .footer-bg {
    transform: scale(1);
  }

  .footer-shell {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  @media (max-width: 768px) {
    .footer {
      inset: auto 0 auto 0;
      top: 30lvh;
      bottom: auto;
      height: 70lvh;
      min-height: 70lvh;
    }

    .footer-bg {
      filter: brightness(0.52) contrast(1.02) saturate(0.92);
    }

    .footer-content {
      height: 70lvh;
      min-height: 70lvh;
      padding-bottom: max(clamp(2.1rem, 6.8vw, 2.7rem), env(safe-area-inset-bottom, 0px));
    }

    .hero-block {
      min-height: calc(70lvh - clamp(5.5rem, 10vw, 7rem));
      align-items: end;
    }

    .hero-copy {
      max-width: 100%;
      gap: clamp(1.8rem, 5vw, 2.5rem);
    }

    .hero-copy h2 {
      max-width: 9ch;
      font-size: clamp(2.4rem, 11.5vw, 4rem);
    }

    .contact-button {
      width: min(100%, 260px);
      min-height: 64px;
      margin-top: 0;
      margin-left: 0;
      align-self: flex-start;
    }

    .footer-bar {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      flex-wrap: nowrap;
    }

    .legal {
      font-size: 0.72rem;
      max-width: none;
      white-space: nowrap;
    }

    .legal-right {
      text-align: right;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .footer-bg,
    .footer-overlay,
    .footer-shell,
    .contact-button,
    .nav-btn,
    .nav-btn-text,
    .nav-btn-flip::after {
      transition: none;
    }

    .footer-bg,
    .footer-overlay,
    .footer-shell {
      opacity: 1;
      transform: none;
    }

    .nav-btn:hover .nav-btn-text {
      transform: translateY(0%);
    }

    .nav-btn:hover .nav-btn-flip::after,
    .nav-btn::before,
    .nav-btn::after {
      opacity: 0;
      transform: translateY(100%);
    }
  }
</style>
