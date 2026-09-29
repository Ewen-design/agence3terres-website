<script>
  import { reveal } from "$lib/actions/reveal.js";
</script>

<section class="process" aria-label="Notre savoir-faire">
  <a class="process__frame" href="/travail" aria-label="Découvrir nos réalisations" data-cursor="button" data-sveltekit-preload-data="hover">
    <div class="process__content">
      <span class="process__label">Notre savoir-faire</span>
      <h2 class="process__title" use:reveal>Des idées qui prennent forme.</h2>
      <span class="process__plus" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" /></svg>
      </span>
    </div>
    <div class="process__media">
      <img src="/images/ludo-site-desktop.webp" alt="Site Ludosphères présentant une œuvre peinte, sur un fond aux couleurs de l’artiste" width="1920" height="1200" loading="lazy" decoding="async" draggable="false" />
    </div>
  </a>
</section>

<style>
  .process {
    /* Même espacement vertical que le gap entre les deux cartes au-dessus. */
    padding: var(--site-inset) var(--site-inset) 0;
    background: var(--bg-deep, #050709);
    color: #f4efe6;
  }

  .process__frame {
    display: grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.55fr);
    min-height: calc(clamp(22rem, 28vw, 34rem) + 3rem);
    overflow: hidden;
    border-radius: var(--project-media-radius, 22px);
    background: var(--bg-panel, #171b21);
    color: inherit;
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
  }

  .process__content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(1.1rem, 2vw, 1.8rem);
    padding: clamp(2rem, 4vw, 4rem) clamp(1.5rem, 3vw, 3rem) 5.5rem;
    min-width: 0;
    text-align: center;
  }

  .process__label {
    padding: 0.4rem 0.8rem;
    border-radius: 999px;
    background: rgba(232, 239, 249, 0.08);
    font-family: var(--site-font);
    font-size: clamp(0.78rem, 0.95vw, 0.95rem);
    font-weight: 500;
    line-height: 1.2;
  }

  .process__title {
    max-width: 17ch;
    margin: 0;
    font-family: var(--site-font);
    font-size: clamp(1.65rem, 2.35vw, 2.9rem);
    font-weight: var(--site-weight-display, 500);
    line-height: 1.12;
    letter-spacing: var(--site-display-letter-spacing, -0.028em);
    text-wrap: balance;
  }

  .process__plus {
    position: absolute;
    right: clamp(1.2rem, 2.2vw, 2.3rem);
    bottom: clamp(1.2rem, 2.2vw, 2.3rem);
    display: grid;
    place-items: center;
    width: clamp(2.9rem, 3.5vw, 3.8rem);
    aspect-ratio: 1;
    border-radius: 50%;
    background: rgba(5, 7, 9, 0.72);
    transition: transform 300ms ease;
  }

  .process__plus svg {
    width: 1.35rem;
    height: 1.35rem;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
  }

  .process__media {
    position: relative;
    overflow: hidden;
    border-radius: var(--project-media-radius, 22px);
    background: var(--bg-raised, #0a0e12);
  }

  .process__media img {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .process__frame:focus-visible {
    outline: 2px solid #f4efe6;
    outline-offset: 5px;
  }

  .process__frame:focus-visible .process__plus {
    transform: scale(1.08);
  }

  @media (hover: hover) {
    .process__frame:hover .process__plus {
      transform: scale(1.08);
    }
  }

  @media (max-width: 760px) {
    .process__frame {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: auto minmax(0, 1fr);
      height: 26rem;
      min-height: 0;
    }

    .process__content {
      gap: 0.8rem;
      padding: 1.6rem 4.8rem 1.6rem 1.4rem;
    }

    .process__title {
      font-size: clamp(1.55rem, 5.8vw, 2.1rem);
    }

    .process__media img {
      object-fit: contain;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .process__plus { transition: none; }
  }
</style>
