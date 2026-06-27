<script>
  import { reveal } from "$lib/actions/reveal.js";

  export let eyebrow = "";
  export let text = "";
  export let leftImage = "";
  export let leftAlt = "";
  export let leftTitleLeft = "";
  export let leftTitleRight = "";
  export let leftHoverImages = [];
  export let rightImage = "";
  export let rightAlt = "";
  export let rightTitleLeft = "";
  export let rightTitleRight = "";
  export let rightHoverImages = [];
  export let reverse = false;

  $: mediaItems = [
    {
      src: leftImage,
      alt: leftAlt,
      titleLeft: leftTitleLeft,
      titleRight: leftTitleRight,
      hoverImages: leftHoverImages
    },
    {
      src: rightImage,
      alt: rightAlt,
      titleLeft: rightTitleLeft,
      titleRight: rightTitleRight,
      hoverImages: rightHoverImages
    }
  ];
</script>

<section class="services-editorial-hover-showcase" class:services-editorial-hover-showcase--reverse={reverse}>
  <div class="services-editorial-hover-showcase__media-grid">
    {#each mediaItems as item, index}
      <figure
        class:services-editorial-hover-showcase__media--dark={index === 0}
        class="services-editorial-hover-showcase__media"
      >
        <img src={item.src} alt={item.alt} loading="lazy" />

        <div class="services-editorial-hover-showcase__veil"></div>

        {#if item.titleLeft}
          <p class="services-editorial-hover-showcase__side-title services-editorial-hover-showcase__side-title--left">
            {item.titleLeft}
          </p>
        {/if}

        {#if item.titleRight}
          <p class="services-editorial-hover-showcase__side-title services-editorial-hover-showcase__side-title--right">
            {item.titleRight}
          </p>
        {/if}

        {#if item.hoverImages?.length}
          <div class="services-editorial-hover-showcase__floating-card">
            <div class="services-editorial-hover-showcase__slideshow">
              {#each item.hoverImages as image, slideIndex}
                <img
                  src={image.src}
                  alt={image.alt || ""}
                  loading="lazy"
                  class="services-editorial-hover-showcase__slide"
                  style={`--slide-index:${slideIndex}; --slide-count:${item.hoverImages.length};`}
                />
              {/each}
            </div>
          </div>
        {/if}
      </figure>
    {/each}
  </div>

  <div class="services-editorial-hover-showcase__text-grid">
    <div class="services-editorial-hover-showcase__eyebrow" use:reveal>{eyebrow}</div>
    <p use:reveal={{ delay: 90 }}>{text}</p>
  </div>
</section>

<style>
  .services-editorial-hover-showcase {
    background: #000;
    color: #fff;
    padding: 0 1.25rem 7rem;
  }

  .services-editorial-hover-showcase__media-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .services-editorial-hover-showcase__media {
    position: relative;
    margin: 4rem 0 0;
    overflow: hidden;
    border-radius: 3px;
    min-height: 32rem;
    background: #111;
    isolation: isolate;
  }

  .services-editorial-hover-showcase__media--dark {
    background: #040404;
  }

  .services-editorial-hover-showcase__media > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition:
      transform 1.45s cubic-bezier(0.16, 1, 0.3, 1),
      filter 1.15s ease;
    will-change: transform, filter;
  }

  .services-editorial-hover-showcase__veil {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(10, 10, 10, 0.04) 12%, rgba(10, 10, 10, 0.26) 100%),
      linear-gradient(0deg, rgba(10, 10, 10, 0.1), rgba(10, 10, 10, 0.1));
    opacity: 0.22;
    transition: opacity 0.85s ease;
  }

  .services-editorial-hover-showcase__side-title {
    position: absolute;
    top: 50%;
    z-index: 2;
    max-width: clamp(5rem, 11vw, 9rem);
    margin: 0;
    font-family: "Inter", sans-serif;
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

  .services-editorial-hover-showcase__side-title--left {
    left: clamp(0.7rem, 1.8vw, 1.35rem);
    text-align: left;
  }

  .services-editorial-hover-showcase__side-title--right {
    right: clamp(0.7rem, 1.8vw, 1.35rem);
    text-align: right;
  }

  .services-editorial-hover-showcase__floating-card {
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

  .services-editorial-hover-showcase__slideshow {
    position: relative;
    width: 100%;
    height: 100%;
    background: #111;
  }

  .services-editorial-hover-showcase__slide {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    animation-name: services-editorial-hover-showcase-slideshow;
    animation-duration: calc(var(--slide-count) * 1.8s);
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    animation-delay: calc(var(--slide-index) * 1.8s);
    animation-fill-mode: both;
  }

  .services-editorial-hover-showcase__media:hover > img,
  .services-editorial-hover-showcase__media:focus-within > img {
    transform: scale(1.04);
    filter: saturate(0.95) brightness(0.82);
  }

  .services-editorial-hover-showcase__media:hover .services-editorial-hover-showcase__veil,
  .services-editorial-hover-showcase__media:focus-within .services-editorial-hover-showcase__veil {
    opacity: 0.68;
  }

  .services-editorial-hover-showcase__media:hover .services-editorial-hover-showcase__floating-card,
  .services-editorial-hover-showcase__media:focus-within .services-editorial-hover-showcase__floating-card {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  .services-editorial-hover-showcase__media:hover .services-editorial-hover-showcase__side-title--left,
  .services-editorial-hover-showcase__media:focus-within .services-editorial-hover-showcase__side-title--left {
    opacity: 1;
    transform: translate(-4px, -50%);
  }

  .services-editorial-hover-showcase__media:hover .services-editorial-hover-showcase__side-title--right,
  .services-editorial-hover-showcase__media:focus-within .services-editorial-hover-showcase__side-title--right {
    opacity: 1;
    transform: translate(4px, -50%);
  }

  .services-editorial-hover-showcase__text-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
    gap: 2rem;
    align-items: start;
    padding-top: 1rem;
  }

  .services-editorial-hover-showcase__eyebrow {
    font-family: "Inter", sans-serif;
    font-style: normal;
    font-size: clamp(1.4rem, 1.8vw, 2rem);
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .services-editorial-hover-showcase__text-grid p {
    margin: 0;
    max-width: 23ch;
    font-family: "Inter", sans-serif;
    font-weight: 300;
    font-size: clamp(1.3rem, 2.8vw, 2.8rem);
    line-height: 1;
    letter-spacing: -0.05em;
  }

  .services-editorial-hover-showcase--reverse .services-editorial-hover-showcase__media-grid figure:first-child {
    order: 2;
  }

  .services-editorial-hover-showcase--reverse .services-editorial-hover-showcase__media-grid figure:last-child {
    order: 1;
  }

  @keyframes services-editorial-hover-showcase-slideshow {
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
    .services-editorial-hover-showcase {
      padding: 0 0.8rem 4rem;
    }

    .services-editorial-hover-showcase__media-grid,
    .services-editorial-hover-showcase__text-grid {
      grid-template-columns: 1fr;
    }

    .services-editorial-hover-showcase__media {
      min-height: 20rem;
    }

    .services-editorial-hover-showcase__floating-card {
      width: min(14rem, calc(100% - 2.4rem));
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }

    .services-editorial-hover-showcase__veil {
      opacity: 0.44;
    }

    .services-editorial-hover-showcase__side-title {
      max-width: 4.8rem;
      font-size: clamp(1.2rem, 5vw, 1.8rem);
    }

    .services-editorial-hover-showcase__text-grid p {
      max-width: 14ch;
      font-size: clamp(1.6rem, 9vw, 2.8rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .services-editorial-hover-showcase__media > img,
    .services-editorial-hover-showcase__veil,
    .services-editorial-hover-showcase__floating-card,
    .services-editorial-hover-showcase__side-title {
      transition: none;
    }

    .services-editorial-hover-showcase__slide {
      animation: none;
    }
  }
</style>
