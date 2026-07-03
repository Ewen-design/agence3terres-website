<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { reveal } from "$lib/actions/reveal.js";

  let dockEl;

  // While the glass dock is on screen, tell the layout to fade the global
  // bottom vignette (`.bottom-gradient`, z-index 99999) so the dock reads in
  // front of it instead of scrolling behind it.
  onMount(() => {
    if (!browser || !dockEl) return;

    const notify = (visible) =>
      window.dispatchEvent(
        new CustomEvent("pip-dock-visible", { detail: { visible } })
      );

    const io = new IntersectionObserver(
      ([entry]) => notify(entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(dockEl);

    return () => {
      io.disconnect();
      notify(false);
    };
  });

  export let id = "projet-en-cours";
  export let image = "";
  export let mobileImage = "";
  export let alt = "";
  export let title = "Projet en cours\nde création";
  export let ctaLabel = "Voir tous les projets";
  export let ctaHref = "/travail";
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
      <div class="pip__dock" bind:this={dockEl}>
        <a class="pip__cta" href={ctaHref} data-cursor="button">
          <span class="pip__cta-flip" data-text={ctaLabel}>
            <span class="pip__cta-text">{ctaLabel}</span>
          </span>
        </a>
      </div>
    {/if}
  </div>
</section>

<style>
  .pip {
    position: relative;
    min-height: 100svh;
    display: flex;
    align-items: stretch;
    overflow: clip;
    background: #000;
    isolation: isolate;
    /* Solid black backstop — paints over any subpixel seam at the very bottom
       edge of the page so no thin line shows under the gradient. */
    box-shadow: 0 2px 0 0 #000;
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

  /* Clean black fade — a smooth, many-stop ramp (no flat band or hard step that
     would read as a line) dissolving upward so the image stays visible. */
  .pip__shade {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(
        to top,
        #000 0%,
        rgba(0, 0, 0, 0.95) 4%,
        rgba(0, 0, 0, 0.82) 9%,
        rgba(0, 0, 0, 0.66) 15%,
        rgba(0, 0, 0, 0.5) 22%,
        rgba(0, 0, 0, 0.36) 30%,
        rgba(0, 0, 0, 0.24) 39%,
        rgba(0, 0, 0, 0.14) 49%,
        rgba(0, 0, 0, 0.07) 61%,
        rgba(0, 0, 0, 0.02) 76%,
        rgba(0, 0, 0, 0) 100%
      ),
      /* Soft top darkening so the title stays legible over the image. */
      linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.6) 0%,
        rgba(0, 0, 0, 0.34) 12%,
        rgba(0, 0, 0, 0.12) 26%,
        rgba(0, 0, 0, 0) 42%
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
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: clamp(3.2rem, 8vh, 6rem) 0 0;
    color: #f5f1e8;
  }

  .pip__title {
    margin: 0;
    max-width: 14ch;
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: clamp(4.6rem, 4vw, 12rem);
    line-height: 1;
    letter-spacing: -0.02em;
    white-space: pre-line;
    text-wrap: balance;
    color: #f7f3ea;
    text-shadow: 0 8px 40px rgba(0, 0, 0, 0.32);
  }

  /* Glass dock behind the button: blurred surface, faint inner white glow and
     a hairline white border — the button sits on top of it. */
  .pip__dock {
    position: relative;
    display: flex;
    justify-content: center;
    width: 100%;
    max-width: 540px;
    margin-inline: auto;
    padding: clamp(1.5rem, 2.6vw, 2.4rem) clamp(1.6rem, 3vw, 3rem);
    /* rounded top only — the bottom is flush with the section edge */
    border-radius: clamp(26px, 3vw, 40px) clamp(26px, 3vw, 40px) 0 0;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(24px) saturate(150%);
    -webkit-backdrop-filter: blur(24px) saturate(150%);
    /* very very thin white contour — a hairline, no line at the bottom */
    border: 0.5px solid rgba(255, 255, 255, 0.2);
    border-bottom: none;
    box-shadow:
      /* internal white glow */
      inset 0 0 60px rgba(255, 255, 255, 0.14),
      inset 0 1px 1px rgba(255, 255, 255, 0.28),
      0 24px 60px rgba(0, 0, 0, 0.4);
  }

  .pip__cta {
    position: relative;
    display: inline-flex;
    flex: 1;
    max-width: 640px;
    align-items: center;
    justify-content: center;
    height: clamp(3.1rem, 3.8vw, 3.7rem);
    padding: 0 1.6rem;
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: clamp(0.98rem, 1.1vw, 1.12rem);
    color: #14110c;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    background: #f4f0e7;
    border-radius: clamp(14px, 1.8vw, 22px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
    transition: background 0.35s ease, transform 0.35s ease;
  }

  .pip__cta:hover {
    background: #fffdf8;
    transform: translateY(-1px);
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

  @media (max-width: 900px) {
    .pip__title {
      font-size: clamp(3.4rem, 8.5vw, 6rem);
      max-width: 12ch;
    }
  }

  @media (max-width: 640px) {
    .pip__media img {
      transform: scale(1.04);
    }

    .pip__title {
      font-size: clamp(2.5rem, 11.5vw, 4.2rem);
      max-width: 11ch;
    }

    .pip__dock {
      /* keep the blur flush to the bottom edge but lift the button higher */
      padding: clamp(1.4rem, 4vw, 1.8rem) 1.2rem clamp(3.8rem, 12vw, 5rem);
    }

    .pip__cta {
      width: 100%;
    }
  }
</style>
