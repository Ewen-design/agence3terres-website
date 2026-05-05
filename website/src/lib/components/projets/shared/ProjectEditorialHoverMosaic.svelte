<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  export let text = "";
  export let feature = {
    src: "",
    alt: "",
    titleLeft: "",
    titleRight: "",
    hoverImages: [],
  };
  export let items = [];

  let tileEls = [];
  let centeredIndex = -1;
  let resizeTimer;

  function updateCenteredTile() {
    if (!browser || window.innerWidth > 900) {
      centeredIndex = -1;
      return;
    }

    const viewportCenter = (window.innerHeight || 0) * 0.5;
    let nextIndex = -1;
    let nearest = Infinity;

    tileEls.forEach((tile, index) => {
      const media = tile?.querySelector(".project-editorial-hover-mosaic__media");
      if (!media) return;
      const rect = media.getBoundingClientRect();
      const center = rect.top + rect.height * 0.5;
      const distance = Math.abs(center - viewportCenter);

      if (distance < nearest) {
        nearest = distance;
        nextIndex = index;
      }
    });

    centeredIndex = nextIndex;
  }

  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateCenteredTile, 80);
  }

  onMount(() => {
    if (!browser) return;

    updateCenteredTile();

    window.addEventListener("scroll", updateCenteredTile, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateCenteredTile);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      clearTimeout(resizeTimer);
    };
  });
</script>

<section class="project-editorial-hover-mosaic">
  <div class="project-editorial-hover-mosaic__grid">
    <article
      class="project-editorial-hover-mosaic__tile project-editorial-hover-mosaic__tile--feature"
      class:is-centered={centeredIndex === 0}
      bind:this={tileEls[0]}
    >
      <figure class="project-editorial-hover-mosaic__media">
        <img src={feature.src} alt={feature.alt} loading="lazy" />

        <div class="project-editorial-hover-mosaic__veil"></div>

        {#if feature.titleLeft}
          <p class="project-editorial-hover-mosaic__side-title project-editorial-hover-mosaic__side-title--left">
            {feature.titleLeft}
          </p>
        {/if}

        {#if feature.titleRight}
          <p class="project-editorial-hover-mosaic__side-title project-editorial-hover-mosaic__side-title--right">
            {feature.titleRight}
          </p>
        {/if}

        <div class="project-editorial-hover-mosaic__floating-card">
          {#if feature.hoverImages?.length}
            <div class="project-editorial-hover-mosaic__slideshow">
              {#each feature.hoverImages as image, index}
                <img
                  src={image.src}
                  alt={image.alt || ""}
                  loading="lazy"
                  class="project-editorial-hover-mosaic__slide"
                  style={`--slide-index:${index}; --slide-count:${feature.hoverImages.length};`}
                />
              {/each}
            </div>
          {/if}
        </div>
      </figure>
    </article>

    {#each items.slice(0, 2) as item, index}
      <article
        class="project-editorial-hover-mosaic__tile"
        class:is-centered={centeredIndex === index + 1}
        bind:this={tileEls[index + 1]}
      >
        <figure class="project-editorial-hover-mosaic__media">
          <img src={item.src} alt={item.alt} loading="lazy" />

          <div class="project-editorial-hover-mosaic__veil"></div>

          {#if item.titleLeft}
            <p class="project-editorial-hover-mosaic__side-title project-editorial-hover-mosaic__side-title--left">
              {item.titleLeft}
            </p>
          {/if}

          {#if item.titleRight}
            <p class="project-editorial-hover-mosaic__side-title project-editorial-hover-mosaic__side-title--right">
              {item.titleRight}
            </p>
          {/if}

          <div class="project-editorial-hover-mosaic__floating-card">
            {#if item.hoverImages?.length}
              <div class="project-editorial-hover-mosaic__slideshow">
                {#each item.hoverImages as image, index}
                  <img
                    src={image.src}
                    alt={image.alt || ""}
                    loading="lazy"
                    class="project-editorial-hover-mosaic__slide"
                    style={`--slide-index:${index}; --slide-count:${item.hoverImages.length};`}
                  />
                {/each}
              </div>
            {/if}
          </div>
        </figure>
      </article>
    {/each}
  </div>

  {#if text}
    <div class="project-editorial-hover-mosaic__intro">
      <div class="project-editorial-hover-mosaic__body">
        <p class="project-editorial-hover-mosaic__text">{text}</p>
      </div>
    </div>
  {/if}
</section>

<style>
  .project-editorial-hover-mosaic {
    padding:
      clamp(4.5rem, 7vw, 7rem)
      max(0.45rem, calc(var(--project-side-padding, 1.25rem) * 0.55))
      clamp(5rem, 8vw, 8rem);
    background:
      radial-gradient(circle at top, rgba(255, 255, 255, 0.1), transparent 40%),
      var(--project-surface-bg, #f7f5f1);
    color: var(--project-surface-ink, #171412);
  }

  .project-editorial-hover-mosaic__intro {
    display: flex;
    justify-content: flex-start;
    margin: clamp(1.35rem, 2vw, 1.8rem) 0 0;
  }

  .project-editorial-hover-mosaic__body {
    display: flex;
    justify-content: flex-start;
  }

  .project-editorial-hover-mosaic__text {
    margin: 0;
    max-width: 21ch;
    padding-inline: var(--project-text-inset, 0);
    font-family: "Clash Display", sans-serif;
    font-weight: 300;
    font-size: var(--project-lead-size, clamp(1.35rem, 2.7vw, 2.8rem));
    line-height: 0.98;
    letter-spacing: -0.05em;
  }

  .project-editorial-hover-mosaic__grid {
    --mosaic-tile-height: min(98vh, 76rem);
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(0.45rem, 0.8vw, 0.7rem);
  }

  .project-editorial-hover-mosaic__tile {
    min-width: 0;
  }

  .project-editorial-hover-mosaic__tile--feature {
    grid-column: 1 / -1;
  }

  .project-editorial-hover-mosaic__tile--feature .project-editorial-hover-mosaic__media {
    height: var(--mosaic-tile-height);
  }

  .project-editorial-hover-mosaic__tile:not(.project-editorial-hover-mosaic__tile--feature) .project-editorial-hover-mosaic__media {
    height: var(--mosaic-tile-height);
  }

  .project-editorial-hover-mosaic__media {
    position: relative;
    overflow: hidden;
    border-radius: 2px;
    background: var(--project-surface-card, #ddd3c3);
    isolation: isolate;
  }

  .project-editorial-hover-mosaic__media > img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition:
      transform 1.45s cubic-bezier(0.16, 1, 0.3, 1),
      filter 1.15s ease;
    will-change: transform, filter;
  }

  .project-editorial-hover-mosaic__tile.is-centered .project-editorial-hover-mosaic__media > img {
    transform: scale(1.03);
  }

  .project-editorial-hover-mosaic__veil {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(10, 10, 10, 0.04) 12%, rgba(10, 10, 10, 0.26) 100%),
      linear-gradient(0deg, rgba(10, 10, 10, 0.1), rgba(10, 10, 10, 0.1));
    opacity: 0.22;
    transition: opacity 0.85s ease;
  }

  .project-editorial-hover-mosaic__side-title {
    position: absolute;
    top: 50%;
    z-index: 2;
    max-width: clamp(5rem, 11vw, 9rem);
    font-family: "Clash Display", sans-serif;
    font-size: clamp(1.45rem, 2.4vw, 2.65rem);
    line-height: 0.92;
    letter-spacing: -0.05em;
    color: rgba(255, 248, 240, 0.9);
    text-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
    opacity: 0;
    transform: translateY(calc(-50% + 12px));
    transition:
      opacity 0.35s ease,
      transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .project-editorial-hover-mosaic__side-title--left {
    left: clamp(0.7rem, 1.8vw, 1.35rem);
    text-align: left;
  }

  .project-editorial-hover-mosaic__side-title--right {
    right: clamp(0.7rem, 1.8vw, 1.35rem);
    text-align: right;
  }

  .project-editorial-hover-mosaic__floating-card {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 3;
    width: clamp(10rem, 27vw, 25rem);
    aspect-ratio: 1.16;
    border-radius: 2px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 25px 80px rgba(11, 8, 5, 0.28);
    opacity: 0;
    transform: translate(-50%, calc(-50% + 16px)) scale(0.985);
    transition:
      opacity 0.45s ease,
      transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .project-editorial-hover-mosaic__slideshow {
    position: relative;
    width: 100%;
    height: 100%;
    background: #111;
  }

  .project-editorial-hover-mosaic__slide {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    animation-name: project-editorial-hover-mosaic-slideshow;
    animation-duration: calc(var(--slide-count) * 1.8s);
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    animation-delay: calc(var(--slide-index) * 1.8s);
    animation-fill-mode: both;
  }

  .project-editorial-hover-mosaic__media:hover > img,
  .project-editorial-hover-mosaic__media:focus-within > img {
    transform: scale(1.04);
    filter: saturate(0.95) brightness(0.82);
  }

  .project-editorial-hover-mosaic__media:hover .project-editorial-hover-mosaic__veil,
  .project-editorial-hover-mosaic__media:focus-within .project-editorial-hover-mosaic__veil {
    opacity: 0.68;
  }

  .project-editorial-hover-mosaic__media:hover .project-editorial-hover-mosaic__floating-card,
  .project-editorial-hover-mosaic__media:focus-within .project-editorial-hover-mosaic__floating-card {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  .project-editorial-hover-mosaic__media:hover .project-editorial-hover-mosaic__side-title--left,
  .project-editorial-hover-mosaic__media:focus-within .project-editorial-hover-mosaic__side-title--left {
    opacity: 1;
    transform: translate(-4px, -50%);
  }

  .project-editorial-hover-mosaic__media:hover .project-editorial-hover-mosaic__side-title--right,
  .project-editorial-hover-mosaic__media:focus-within .project-editorial-hover-mosaic__side-title--right {
    opacity: 1;
    transform: translate(4px, -50%);
  }

  @keyframes project-editorial-hover-mosaic-slideshow {
    0% {
      opacity: 0;
    }

    8%,
    42% {
      opacity: 1;
    }

    58%,
    100% {
      opacity: 0;
    }
  }

  @media (max-width: 900px) {
    .project-editorial-hover-mosaic {
      padding:
        clamp(3.6rem, 12vw, 5rem)
        clamp(0.35rem, 1.8vw, 0.45rem)
        clamp(3.8rem, 12vw, 5rem);
    }

    .project-editorial-hover-mosaic__grid {
      --mosaic-tile-height: auto;
      grid-template-columns: 1fr;
    }

    .project-editorial-hover-mosaic__intro {
      margin-top: 1rem;
    }

    .project-editorial-hover-mosaic__body {
      justify-content: flex-start;
    }

    .project-editorial-hover-mosaic__text {
      max-width: 12ch;
      font-size: clamp(1.7rem, 8.5vw, 2.55rem);
    }

    .project-editorial-hover-mosaic__tile--feature {
      grid-column: auto;
    }

    .project-editorial-hover-mosaic__tile--feature .project-editorial-hover-mosaic__media,
    .project-editorial-hover-mosaic__tile:not(.project-editorial-hover-mosaic__tile--feature) .project-editorial-hover-mosaic__media {
      aspect-ratio: 0.82;
      height: auto;
    }

    .project-editorial-hover-mosaic__tile:not(.project-editorial-hover-mosaic__tile--feature) .project-editorial-hover-mosaic__media {
      aspect-ratio: 0.74;
    }

    .project-editorial-hover-mosaic__side-title {
      max-width: 4.8rem;
      font-size: clamp(1.2rem, 5vw, 1.8rem);
    }

    .project-editorial-hover-mosaic__floating-card {
      display: none;
    }

    .project-editorial-hover-mosaic__veil {
      opacity: 0.3;
    }

    .project-editorial-hover-mosaic__side-title {
      display: none;
    }

    .project-editorial-hover-mosaic__media:hover > img,
    .project-editorial-hover-mosaic__media:focus-within > img {
      transform: none;
      filter: none;
    }

    .project-editorial-hover-mosaic__media:hover .project-editorial-hover-mosaic__veil,
    .project-editorial-hover-mosaic__media:focus-within .project-editorial-hover-mosaic__veil {
      opacity: 0.3;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .project-editorial-hover-mosaic__media > img,
    .project-editorial-hover-mosaic__veil,
    .project-editorial-hover-mosaic__floating-card,
    .project-editorial-hover-mosaic__side-title {
      transition: none;
    }

    .project-editorial-hover-mosaic__slide {
      animation: none;
    }
  }
</style>
