<script lang="ts">
  type Finish = {
    color: string;
    label: string;
  };

  type GalleryItem = {
    src: string;
    alt: string;
    className: string;
    width?: number;
    height?: number;
    loading?: "eager" | "lazy";
    fetchpriority?: "high" | "low" | "auto";
  };

  type GalleryColumn = {
    className: string;
    items: GalleryItem[];
  };

  const finishes: Finish[] = [
    { color: "#d9d8d5", label: "Ivoire doux" },
    { color: "#b8b7b3", label: "Gris minéral" },
    { color: "#6e6b67", label: "Graphite" },
    { color: "#2d2c2a", label: "Noir profond" },
    { color: "#b89c63", label: "Or satiné" },
    { color: "#e4d4ca", label: "Rose poudré" }
  ];

  let selectedFinish = 1;

  const galleryColumns: GalleryColumn[] = [
    {
      className: "edge-left",
      items: [
        {
          src: "images/photo.webp",
          alt: "Ring close-up",
          className: "left-top",
          width: 500,
          height: 720,
          loading: "eager",
          fetchpriority: "high"
        },
        {
          src: "images/photo.webp",
          alt: "Hands detail",
          className: "left-bottom",
          width: 500,
          height: 640,
          loading: "lazy",
          fetchpriority: "low"
        }
      ]
    },
    {
      className: "portrait-left",
      items: [
        {
          src: "images/photo.webp",
          alt: "Smiling woman portrait",
          className: "single",
          width: 700,
          height: 1100,
          loading: "eager",
          fetchpriority: "high"
        }
      ]
    },
    {
      className: "portrait-center",
      items: [
        {
          src: "images/photo.webp",
          alt: "Athletic portrait",
          className: "single",
          width: 700,
          height: 980,
          loading: "eager",
          fetchpriority: "high"
        }
      ]
    },
    {
      className: "hero-product",
      items: [
        {
          src: "images/photo.webp",
          alt: "Ring on mineral surface",
          className: "single",
          width: 1000,
          height: 1200,
          loading: "eager",
          fetchpriority: "high"
        }
      ]
    },
    {
      className: "edge-right",
      items: [
        {
          src: "images/photo.webp",
          alt: "Ring detail",
          className: "right-top",
          width: 500,
          height: 720,
          loading: "lazy",
          fetchpriority: "low"
        },
        {
          src: "images/photo.webp",
          alt: "Hands with rings",
          className: "right-bottom",
          width: 500,
          height: 720,
          loading: "lazy",
          fetchpriority: "low"
        }
      ]
    }
  ];

  function selectFinish(index: number) {
    selectedFinish = index;
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Cormorant+Garamond:ital,wght@1,400&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<section class="lifestyle-section" aria-labelledby="lifestyle-title">
  <div class="canvas-shell">
    <div class="top">
      <h2 id="lifestyle-title" class="heading">
        <span class="title-main">Un projet de</span>
        <span class="title-accent">Serein Design</span>
      </h2>

      <div class="controls">
        <div class="select-copy" aria-label="Collection sélectionnée">
          <span class="select-title">Horizon</span>
          <span class="select-subtitle">Sleek, sophisticated design</span>
        </div>

        <div class="finish-card" aria-label="Choix de couleur">
          {#each finishes as finish, index (finish.color)}
            <button
              type="button"
              class="swatch"
              class:active={selectedFinish === index}
              style={`--swatch:${finish.color}`}
              aria-label={`Choisir la finition ${finish.label}`}
              aria-pressed={selectedFinish === index}
              on:click={() => selectFinish(index)}
            />
          {/each}
        </div>
      </div>
    </div>
  </div>

  <div class="gallery-wrap">
    <div class="gallery" aria-label="Galerie visuelle du projet">
      {#each galleryColumns as column (column.className)}
        <div class={`col ${column.className}`}>
          {#each column.items as item (item.alt)}
            <article class={`card ${item.className}`}>
              <img
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                loading={item.loading ?? "lazy"}
                decoding="async"
                fetchpriority={item.fetchpriority ?? "auto"}
                draggable="false"
              />
            </article>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(html, body) {
    margin: 0;
  }

  .lifestyle-section {
    --bg: #f3efea;
    --bg-top: #f7f4ef;
    --text: #4e4741;
    --muted: #8d857d;
    --card: #e9e3db;
    --line: rgba(96, 86, 78, 0.08);
    --line-soft: rgba(96, 86, 78, 0.06);
    --shadow-ui: 0 1px 0 rgba(255, 255, 255, 0.72) inset,
      0 6px 18px rgba(93, 74, 49, 0.018);
    --shadow-card: 0 1px 0 rgba(255, 255, 255, 0.58) inset,
      0 10px 24px rgba(90, 72, 50, 0.018);

    position: relative;
    isolation: isolate;
    width: 100%;
    min-height: 100svh;
    padding-block: clamp(4.5rem, 9vw, 8.5rem);
    overflow: clip;
    background:
      radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.76) 0%, rgba(255, 255, 255, 0) 42%),
      linear-gradient(180deg, var(--bg-top) 0%, var(--bg) 100%);
    font-family: "Inter", sans-serif;
    color: var(--text);
    contain: layout paint style;
  }

  .canvas-shell {
    width: min(100%, 1600px);
    margin: 0 auto;
    padding:
      0
      clamp(0.9rem, 1.25vw, 1.3rem)
      clamp(1.8rem, 2.4vw, 2.5rem);
  }

  .top {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.1rem;
    margin-bottom: clamp(2.8rem, 4.2vw, 4rem);
  }

  .heading {
    margin: 0;
    display: flex;
    align-items: baseline;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.28rem;
    line-height: 0.92;
    letter-spacing: -0.055em;
    text-align: center;
    text-wrap: balance;
  }

  .title-main {
    font-size: clamp(2.8rem, 4.25vw, 3rem);
    font-weight: 300;
    color: rgba(74, 67, 61, 0.96);
  }

  .title-accent {
    font-family: "Cormorant Garamond", serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(2.9rem, 4.45vw, 4.15rem);
    color: rgba(79, 72, 66, 0.92);
  }

  .controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.7rem;
    flex-wrap: wrap;
  }

  .select-copy,
  .finish-card {
    min-height: 2.35rem;
    border-radius: 7px;
    border: 1px solid var(--line-soft);
    background: rgba(255, 255, 255, 0.82);
    box-shadow: var(--shadow-ui);
  }

  .select-copy {
    display: inline-flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.45rem 0.85rem 0.48rem;
  }

  .select-title {
    font-size: 0.86rem;
    font-weight: 500;
    color: rgba(76, 69, 63, 0.95);
    line-height: 1;
  }

  .select-subtitle {
    font-size: 0.78rem;
    font-weight: 400;
    color: var(--muted);
    line-height: 1;
    white-space: nowrap;
  }

  .finish-card {
    display: flex;
    align-items: center;
    gap: 0.48rem;
    padding: 0 0.72rem;
  }

  .swatch {
    position: relative;
    inline-size: 0.88rem;
    block-size: 0.88rem;
    flex: 0 0 auto;
    border: none;
    border-radius: 999px;
    background: var(--swatch);
    cursor: pointer;
    box-shadow:
      0 0 0 1px rgba(88, 79, 71, 0.11),
      inset 0 1px 1px rgba(255, 255, 255, 0.45);
    transition:
      transform 140ms ease,
      box-shadow 140ms ease,
      opacity 140ms ease;
    -webkit-tap-highlight-color: transparent;
  }

  .swatch:hover {
    transform: scale(1.04);
  }

  .swatch:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 1px rgba(88, 79, 71, 0.11),
      inset 0 1px 1px rgba(255, 255, 255, 0.45),
      0 0 0 4px rgba(111, 101, 91, 0.12);
  }

  .swatch.active::before {
    content: "";
    position: absolute;
    inset: -0.24rem;
    border-radius: inherit;
    border: 1px solid rgba(103, 95, 87, 0.46);
  }

  .gallery-wrap {
    width: 100%;
  }

  .gallery {
    width: 100%;
    margin: 0 auto;
    padding-inline: clamp(0.55rem, 1vw, 0.95rem);
    display: grid;
    grid-template-columns:
      minmax(72px, 0.6fr)
      minmax(150px, 1.15fr)
      minmax(130px, 1fr)
      minmax(220px, 1.6fr)
      minmax(72px, 0.6fr);
    gap: 0.8rem;
    align-items: end;
  }

  .col {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 0.72rem;
    min-height: 30rem;
    contain: layout paint;
  }

  .card {
    position: relative;
    overflow: hidden;
    border-radius: 3px;
    background: var(--card);
    box-shadow: var(--shadow-card);
    contain: paint;
  }

  .card img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: center;
    filter: saturate(0.94) brightness(1.01) contrast(0.98);
    user-select: none;
    pointer-events: none;
  }

  .edge-left {
    margin-left: clamp(-1.6rem, -1.8vw, -1rem);
    padding-top: 1.1rem;
  }

  .portrait-left {
    padding-top: 5.2rem;
  }

  .portrait-center {
    padding-top: 8.3rem;
  }

  .hero-product {
    padding-top: 4.2rem;
  }

  .edge-right {
    margin-right: clamp(-1.6rem, -1.8vw, -1rem);
    padding-top: 0;
  }

  .left-top {
    height: 18rem;
  }

  .left-bottom {
    height: 16rem;
  }

  .portrait-left .single {
    height: 26rem;
  }

  .portrait-center .single {
    height: 20rem;
  }

  .hero-product .single {
    height: 25rem;
  }

  .right-top {
    height: 18rem;
  }

  .right-bottom {
    height: 18rem;
  }

  @media (max-width: 1100px) {
    .lifestyle-section {
      padding-block: clamp(3.5rem, 7vw, 5.5rem);
    }

    .gallery {
      grid-template-columns: 1fr 0.9fr 1.15fr;
      gap: 0.7rem;
      padding-inline: 0.9rem;
    }

    .edge-left,
    .edge-right {
      display: none;
    }

    .col {
      min-height: auto;
      padding-top: 0;
      margin: 0;
    }

    .portrait-left .single {
      height: 18rem;
    }

    .portrait-center .single {
      height: 14rem;
      margin-top: 2.8rem;
    }

    .hero-product .single {
      height: 20rem;
      margin-top: 0.6rem;
    }
  }

  @media (max-width: 780px) {
    .lifestyle-section {
      padding-block: 3.25rem 4rem;
    }

    .canvas-shell {
      padding: 0 0.9rem 1.2rem;
    }

    .top {
      margin-bottom: 2rem;
    }

    .heading {
      gap: 0.14rem;
    }

    .title-main {
      font-size: clamp(2rem, 10vw, 3rem);
    }

    .title-accent {
      font-size: clamp(2.1rem, 10.3vw, 3.15rem);
    }

    .controls {
      width: 100%;
      gap: 0.6rem;
    }

    .select-copy,
    .finish-card {
      width: min(100%, 22rem);
      justify-content: center;
    }

    .gallery {
      grid-template-columns: 1fr;
      gap: 0.8rem;
      padding-inline: 0.9rem;
    }

    .portrait-left,
    .portrait-center,
    .hero-product {
      margin: 0;
    }

    .portrait-left .single,
    .portrait-center .single,
    .hero-product .single {
      height: auto;
      min-height: 14rem;
      margin-top: 0;
    }

    .portrait-left .single,
    .portrait-center .single {
      aspect-ratio: 0.76;
    }

    .hero-product .single {
      aspect-ratio: 1.08;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .swatch {
      transition: none;
    }
  }
</style>