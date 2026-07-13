<script>
  import { onMount } from "svelte";
  import { reveal } from "$lib/actions/reveal.js";
  import { navigate } from "$lib/navigate.js";

  export let label = "";
  export let text = "";
  export let mutedText = "";
  export let image = "";
  // Image spécifique desktop (≥901px) ; si vide, on garde `image` partout.
  export let imageDesktop = "";
  export let alt = "";
  // "cover" (défaut, plein cadre rogné) ou "contain" (image entière visible).
  export let imageFit = "cover";
  // Position de l'image quand elle ne remplit pas tout le cadre (utile en contain).
  export let imagePosition = "center";
  export let accentImage = "/images/moovy2.webp";
  export let accentAlt = "Visuel 3 Terres";
  export let showAccent = true;
  export let mediaMinHeight = "32rem";
  export let ctaLabel = "";
  export let ctaHref = "";
  export let showCue = true;
  export let showGradient = true;
  export let background = "#000";
  export let ink = "#f4efe6";
  export let inkMuted = "rgba(245, 241, 232, 0.62)";

  // Fade the full-bleed media in once it has actually decoded, so a lazy image
  // deep in the page never pops in on top of the section background. Guard for
  // cached images that finished loading before hydration (the `load` event has
  // already fired and won't fire again).
  let mediaImgEl;
  let mediaLoaded = false;

  onMount(() => {
    if (mediaImgEl?.complete) mediaLoaded = true;
  });

  function handleButtonMove(event) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    button.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    button.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }
</script>

<section class="about-editorial-single-showcase" style={`--ase-bg:${background}; --ase-ink:${ink}; --ase-muted:${inkMuted}; --ase-media-fit:${imageFit}; --ase-media-pos:${imagePosition};`}>
  <figure
    class="about-editorial-single-showcase__media"
    style={`--about-editorial-single-showcase-media-min-height:${mediaMinHeight};`}
  >
    <picture>
      {#if imageDesktop}
        <source media="(min-width: 901px)" srcset={imageDesktop} />
      {/if}
      <img
        bind:this={mediaImgEl}
        src={image}
        alt={alt}
        loading="lazy"
        decoding="async"
        class:is-loaded={mediaLoaded}
        on:load={() => (mediaLoaded = true)}
      />
    </picture>
    {#if showGradient}
      <div class="about-editorial-single-showcase__gradient" aria-hidden="true"></div>
    {/if}
  </figure>

  <!-- Static solid backstop that OVERSHOOTS the media's bottom edge. The
       fullscreen media is absolutely positioned; on iOS Safari its clipped
       bottom edge (and the transformed gradient layer above it) can leave a 1px
       seam that flashes the image as a thin line. A non-transformed strip that
       straddles that edge removes any exact-edge alignment → no seam. -->
  <div class="about-editorial-single-showcase__floor" aria-hidden="true"></div>

  <div class="about-editorial-single-showcase__content">
    {#if showCue}
      <div class="about-editorial-single-showcase__scroll-cue" aria-hidden="true">
        <span class="about-editorial-single-showcase__scroll-arrow">↓</span>
      </div>
    {/if}

    {#if showAccent}
      <figure class="about-editorial-single-showcase__accent" use:reveal>
        <img src={accentImage} alt={accentAlt} loading="lazy" decoding="async" />
      </figure>
    {/if}

    <div class="about-editorial-single-showcase__text-block">
      {#if label}
        <h2 class="about-editorial-single-showcase__label" use:reveal>{label}</h2>
      {/if}
      <p class="about-editorial-single-showcase__text" use:reveal={{ delay: 120 }}>{[text, mutedText].filter(Boolean).join(" ")}</p>

      {#if ctaLabel && ctaHref}
        <div class="about-editorial-single-showcase__cta" use:reveal={{ delay: 220 }}>
          <button
            class="ase-btn"
            type="button"
            on:click={() => navigate(ctaHref)}
            on:mousemove={handleButtonMove}
          >
            <span class="ase-btn__flip" data-text={ctaLabel}>
              <span class="ase-btn__text">{ctaLabel}</span>
            </span>
          </button>
        </div>
      {/if}
    </div>
  </div>
</section>

<style>
  .about-editorial-single-showcase {
    position: relative;
    width: 100%;
    min-height: max(220vh, var(--about-editorial-single-showcase-media-min-height, 32rem));
    background: var(--ase-bg, #000);
    color: var(--ase-ink, #f5f1e8);
    overflow: clip;
  }

  .about-editorial-single-showcase__media {
    position: absolute;
    inset: 0 0 auto;
    height: 150vh;
    margin: 0;
    overflow: hidden;
    /* Match the section/page background exactly (was #050505, a hair lighter):
       the media is absolutely positioned, so a 1px sliver of its background can
       show at its bottom edge as a thin line — matching it makes that invisible. */
    background: var(--ase-bg, #000);
  }

  .about-editorial-single-showcase__media picture {
    display: contents;
  }

  .about-editorial-single-showcase__media img {
    width: 100%;
    height: 100%;
    object-fit: var(--ase-media-fit, cover);
    object-position: var(--ase-media-pos, center);
    display: block;
    opacity: 0;
    transform: scale(1.04);
    transition:
      opacity 0.9s ease,
      transform 1.4s cubic-bezier(0.22, 0.61, 0.36, 1);
  }

  .about-editorial-single-showcase__media img.is-loaded {
    opacity: 1;
    transform: scale(1);
  }

  @media (prefers-reduced-motion: reduce) {
    .about-editorial-single-showcase__media img {
      opacity: 1;
      transform: none;
      transition: none;
    }
  }

  .about-editorial-single-showcase__gradient {
    position: absolute;
    inset: auto 0 0;
    height: 56vh;
    background: linear-gradient(
      to top,
      var(--ase-bg, #000) 0%,
      var(--ase-bg, #000) 30%,
      transparent 100%
    );
    pointer-events: none;
  }

  .about-editorial-single-showcase__floor {
    position: absolute;
    left: 0;
    right: 0;
    top: 150vh;              /* the media bottom (desktop) */
    height: 8vh;
    margin-top: -4vh;        /* straddle the edge: 4vh above → 4vh below */
    background: var(--ase-bg, #000);
    z-index: 0;              /* over the media, under the content */
    pointer-events: none;
  }

  .about-editorial-single-showcase__content {
    position: relative;
    z-index: 1;
    min-height: inherit;
    padding: clamp(1rem, 2vw, 1.8rem);
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(320px, 460px) minmax(0, 1.05fr);
    grid-template-rows: 100vh auto 40vh;
    align-items: start;
    gap: clamp(1.4rem, 4vw, 4.5rem);
  }

  .about-editorial-single-showcase__scroll-cue {
    grid-column: 1;
    grid-row: 1;
    align-self: end;
    justify-self: start;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    gap: 0.45rem;
    color: #fff;
    padding-bottom: max(clamp(2rem, 3.2vw, 2.8rem), calc(var(--safe-bottom-offset) + 1rem));
  }

  .about-editorial-single-showcase__scroll-arrow {
    display: block;
    font-family: "Inter", sans-serif;
    font-size: clamp(1.1rem, 1.1vw, 1.2rem);
    font-weight: 300;
    line-height: 1;
    color: #fff;
  }

  .about-editorial-single-showcase__text-block {
    grid-column: 3;
    grid-row: 2;
    justify-self: start;
    align-self: start;
    padding-top: clamp(8rem, 14vh, 12rem);
    margin-left: clamp(-8.75rem, -6.2vw, -4.4rem);
  }

  .about-editorial-single-showcase__label {
    margin: 0 0 clamp(1rem, 1.8vw, 1.5rem);
    font-family: "Inter", sans-serif;
    font-size: var(--project-overline-size, clamp(1.02rem, 1.35vw, 1.4rem));
    font-weight: 400;
    letter-spacing: -0.01em;
    color: var(--ase-muted, rgba(245, 241, 232, 0.62));
  }

  .about-editorial-single-showcase__label::before {
    content: "";
    display: block;
    width: 24px;
    height: 1px;
    background: var(--lead-blue, #5768ff);
    margin-bottom: 1.2rem;
  }

  .about-editorial-single-showcase__text {
    margin: 0;
    max-width: 23ch;
    font-size: clamp(1.5rem, 2.5vw, 2.55rem);
    font-weight: 300;
    line-height: 1.18;
    letter-spacing: -0.025em;
    color: var(--ase-ink, #f4efe6);
    text-wrap: pretty;
  }

  .about-editorial-single-showcase__cta {
    margin-top: clamp(1.6rem, 2.6vw, 2.4rem);
  }

  .ase-btn {
    font-family: "Inter", sans-serif;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: clamp(9rem, 12vw, 11rem);
    height: clamp(3rem, 3.6vw, 3.4rem);
    padding: 0 1.4rem;
    font-size: clamp(0.92rem, 1.05vw, 1.05rem);
    font-weight: 400;
    color: #f7f2e8;
    border: 0;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    border-radius: 10px;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.04);
    transition:
      transform 1.2s cubic-bezier(.22, .61, .36, 1),
      background 0.3s ease,
      box-shadow 1.2s cubic-bezier(.22, .61, .36, 1);
  }

  .ase-btn:hover {
    background: rgba(255, 255, 255, 0.18);
    transform: translateY(-2px);
  }

  .ase-btn__flip {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
  }

  .ase-btn__text {
    display: block;
    transform: translateY(0%);
    transition: transform 0.45s cubic-bezier(.22, .61, .36, 1);
  }

  .ase-btn__flip::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition: transform 0.45s cubic-bezier(.22, .61, .36, 1);
    white-space: nowrap;
    color: inherit;
  }

  .ase-btn:hover .ase-btn__text { transform: translateY(-100%); }
  .ase-btn:hover .ase-btn__flip::after { transform: translateY(0%); }

  .ase-btn::before,
  .ase-btn::after {
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

  .ase-btn::before {
    background: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-strong) 0%,
      var(--site-glow-mid) 22%,
      var(--site-glow-soft) 45%,
      var(--site-glow-fade) 62%,
      transparent 78%
    );
  }

  .ase-btn::after {
    background: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-ambient) 0%,
      var(--site-glow-outer) 42%,
      transparent 72%
    );
    filter: blur(2px);
  }

  .ase-btn:hover::before,
  .ase-btn:hover::after { opacity: 1; }

  .about-editorial-single-showcase__accent {
    grid-column: 2;
    grid-row: 2;
    justify-self: start;
    align-self: start;
    width: min(100%, 460px);
    aspect-ratio: 1.45 / 1;
    overflow: hidden;
    margin: 0;
    background: #0b0b0b;
    margin-top: clamp(31rem, 48vh, 40rem);
    margin-left: clamp(-24rem, -21vw, -12rem);
  }

  .about-editorial-single-showcase__accent img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  @media (max-width: 900px) {
    .about-editorial-single-showcase__content {
      grid-template-columns: 1fr;
      grid-template-rows: 100vh auto 34vh;
      padding: 1rem 0.8rem;
      box-sizing: border-box;
    }

    .about-editorial-single-showcase__scroll-cue {
      grid-row: 1;
      padding-bottom: 0;
    }

    .about-editorial-single-showcase__text-block {
      grid-column: 1;
      grid-row: 2;
      justify-self: start;
      padding-top: 6rem;
      margin-left: 0;
    }

    .about-editorial-single-showcase__text {
      max-width: 18ch;
      font-size: clamp(1.5rem, 6.6vw, 2rem);
      padding-inline: var(--project-text-inset, 0);
      line-height: 1.2;
    }

    .about-editorial-single-showcase__cta {
      padding-inline: var(--project-text-inset, 0);
    }

    .about-editorial-single-showcase__accent {
      grid-column: 1;
      grid-row: 2;
      width: min(78%, 340px);
      justify-self: start;
      margin-top: 18rem;
      margin-left: -0.8rem;
    }
  }

  @media (max-width: 640px) {
    .about-editorial-single-showcase {
      min-height: max(194vh, var(--about-editorial-single-showcase-media-min-height, 32rem));
    }

    .about-editorial-single-showcase__media {
      height: 138vh;
    }

    .about-editorial-single-showcase__floor {
      top: 138vh;
    }

    .about-editorial-single-showcase__gradient {
      height: 52vh;
      background: linear-gradient(
        to top,
        var(--ase-bg, #000) 0%,
        var(--ase-bg, #000) 34%,
        transparent 100%
      );
    }

    .about-editorial-single-showcase__content {
      grid-template-rows: 100vh auto 32vh;
      gap: 0;
      padding: 1rem 0.8rem 0;
    }

    .about-editorial-single-showcase__scroll-cue {
      padding-bottom: max(7rem, calc(var(--safe-bottom-offset) + 5rem));
    }

    .about-editorial-single-showcase__text-block {
      grid-row: 2;
      align-self: start;
      padding-top: 0;
      margin-top: -2vh;
      margin-left: 0;
      position: relative;
      z-index: 2;
    }

    .about-editorial-single-showcase__text {
      max-width: 18ch;
      font-size: clamp(1.4rem, 6.6vw, 1.9rem);
      line-height: 1.2;
      padding-inline: var(--project-text-inset, 0);
    }

    .about-editorial-single-showcase__accent {
      grid-row: 3;
      width: min(72%, 300px);
      justify-self: end;
      margin-top: -4.5rem;
      margin-left: 0;
      margin-right: -0.8rem;
    }
  }
</style>
