<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  let footerEl;
  let isVisible = false;

  onMount(() => {
    if (!browser || !footerEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    observer.observe(footerEl);

    return () => {
      observer.disconnect();
    };
  });
</script>

<footer class="footer section-full" class:is-visible={isVisible} bind:this={footerEl}>
  <div class="footer-bg"></div>
  <div class="footer-overlay"></div>

  <div class="footer-content">
    <div class="bottom-block">
      <img src="/images/logo_prisme.png" alt="Logo Agence 3 Terres" class="logo" />

      <div class="contact-block">
        <span class="contact-title">Contact</span>

        <div class="icons">
          <a href="/" class="icon-link" aria-label="Instagram">
            <span class="icon-box">
              <img src="/images/instagram.png" alt="Instagram" class="icon icon-instagram" />
            </span>
          </a>

          <a href="/" class="icon-link" aria-label="Facebook">
            <span class="icon-box">
              <img src="/images/facebook.png" alt="Facebook" class="icon icon-facebook" />
            </span>
          </a>

          <a href="/" class="icon-link" aria-label="X">
            <span class="icon-box">
              <img src="/images/X.png" alt="X" class="icon icon-x" />
            </span>
          </a>

          <a href="/contact" class="icon-link" aria-label="Mail">
            <span class="icon-box">
              <img src="/images/mail.png" alt="Mail" class="icon icon-mail" />
            </span>
          </a>
        </div>
      </div>

      <p class="legal">
      Agence 3 Terres — Tous droits réservés — Mentions légales
      </p>
    </div>
  </div>
</footer>

<style>
  .footer {
    position: relative;
    overflow: hidden;
    background: #070707;
    isolation: isolate;
  }

  .footer-bg,
  .footer-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .footer-bg {
    background-image: url("/images/telephone3.webp");
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center bottom;
    filter: brightness(0.58) contrast(1.02) saturate(0.94);
    opacity: 0.22;
    transition: opacity 0.95s cubic-bezier(.22,.61,.36,1);
    will-change: opacity;
  }

  .footer-overlay {
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.58) 0%,
      rgba(0, 0, 0, 0.22) 34%,
      rgba(0, 0, 0, 0.22) 62%,
      rgba(0, 0, 0, 0.56) 100%
    );
    opacity: 0.45;
    transition: opacity 0.95s cubic-bezier(.22,.61,.36,1);
    will-change: opacity;
  }

  .footer-content {
    position: relative;
    z-index: 2;
    min-height: var(--viewport-height);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: clamp(1.2rem, 2vw, 2rem);
  }

  .bottom-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.95rem;
    padding-bottom: max(clamp(1rem, 2vw, 1.8rem), var(--safe-bottom-offset));
    opacity: 0;
    transform: translate3d(0, 18px, 0);
    transition:
      opacity 0.95s cubic-bezier(.22,.61,.36,1) 0.08s,
      transform 0.95s cubic-bezier(.22,.61,.36,1) 0.08s;
    will-change: opacity, transform;
  }

  .logo {
    width: clamp(64px, 5.2vw, 86px);
    height: auto;
    display: block;
    object-fit: contain;
  }

  .contact-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.7rem;
  }

  .contact-title {
    font-family: "Clash Display", sans-serif;
    font-weight: 400;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .icons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.95rem;
  }

  .icon-link {
    text-decoration: none;
    opacity: 0.9;
    transition:
      transform 0.35s cubic-bezier(.22,.61,.36,1),
      opacity 0.35s ease;
  }

  .icon-link:hover {
    transform: translateY(-2px);
    opacity: 1;
  }

  .icon-box {
    width: 26px;
    height: 26px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .icon {
    display: block;
    object-fit: contain;
    filter: brightness(0) invert(1);
  }

  .icon-instagram {
    width: 22px;
    height: 22px;
  }

  .icon-facebook {
    width: 20px;
    height: 20px;
  }

  .icon-x {
    width: 21px;
    height: 21px;
  }

  .icon-mail {
    width: 21px;
    height: 21px;
  }

  .legal {
    margin: 0;
    font-family: "Clash Display", sans-serif;
    font-weight: 300;
    font-size: 0.76rem;
    color: rgba(255, 255, 255, 0.42);
    text-align: center;
    line-height: 1.4;
  }

  .footer.is-visible .footer-bg {
    opacity: 1;
  }

  .footer.is-visible .footer-overlay {
    opacity: 1;
  }

  .footer.is-visible .bottom-block {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  @media (max-width: 768px) {
    .footer-bg {
      filter: brightness(0.52) contrast(1.02) saturate(0.92);
    }

    .icon-box {
      width: 24px;
      height: 24px;
    }

    .icon-instagram {
      width: 20px;
      height: 20px;
    }

    .icon-facebook {
      width: 18px;
      height: 18px;
    }

    .icon-x,
    .icon-mail {
      width: 19px;
      height: 19px;
    }

    .legal {
      font-size: 0.72rem;
      max-width: 90%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .footer-bg,
    .footer-overlay,
    .bottom-block,
    .icon-link {
      transition: none;
    }

    .footer-bg,
    .footer-overlay,
    .bottom-block {
      opacity: 1;
      transform: none;
    }
  }
</style>
