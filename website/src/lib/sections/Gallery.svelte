<script lang="ts">
  type GalleryCard = {
    image: string;
    alt: string;
    className: string;
    width: number;
    height: number;
    loading?: "eager" | "lazy";
    fetchpriority?: "high" | "low" | "auto";
  };

  const cards: GalleryCard[] = [
    {
      image: "images/photo.webp",
      alt: "Close-up technical detail",
      className: "dna-top-left",
      width: 900,
      height: 420,
      loading: "eager",
      fetchpriority: "high"
    },
    {
      image: "images/photo.webp",
      alt: "Metallic product close-up",
      className: "dna-bottom-left",
      width: 900,
      height: 980,
      loading: "lazy",
      fetchpriority: "low"
    },
    {
      image: "images/photo.webp",
      alt: "Minimal wearable device",
      className: "dna-center",
      width: 1100,
      height: 1400,
      loading: "eager",
      fetchpriority: "high"
    },
    {
      image: "images/photo.webp",
      alt: "Soft material surface",
      className: "dna-right",
      width: 950,
      height: 900,
      loading: "lazy",
      fetchpriority: "low"
    }
  ];
</script>

<section class="dna-section" aria-labelledby="dna-title">
  <div class="dna-shell">
    <div class="dna-intro">
      <div class="dna-title-block">
        <h2 id="dna-title" class="dna-heading">
          <span class="dna-title-main">Design is in</span>
          <span class="dna-title-accent">our DNA</span>
        </h2>
      </div>

      <div class="dna-copy">
        <p>
          Oura is rooted in Finnish design philosophy — uniquely designed to
          pair with your mind and body. Each Oura Ring is made from
          aerospace-grade titanium, one of the strongest materials on earth.
          Years of testing guarantee they’re comfortable for everyone, crafted
          to perfection, and long-lasting.
        </p>
      </div>
    </div>

    <div class="dna-gallery" aria-label="Design gallery">
      {#each cards as card (card.className)}
        <article class={`dna-card ${card.className}`}>
          <img
            src={card.image}
            alt={card.alt}
            width={card.width}
            height={card.height}
            loading={card.loading ?? "lazy"}
            fetchpriority={card.fetchpriority ?? "auto"}
            decoding="async"
            draggable="false"
          />
        </article>
      {/each}
    </div>
  </div>
</section>

<style>
  .dna-section {
    --dna-bg: #f5f3ee;
    --dna-bg-top: #f8f7f3;
    --dna-text: #4d4843;
    --dna-muted: #6f6962;
    --dna-card-bg: #ece7df;
    --dna-line: rgba(96, 86, 78, 0.05);
    --dna-shadow-card:
      0 1px 0 rgba(255, 255, 255, 0.52) inset,
      0 8px 20px rgba(79, 62, 41, 0.014);

    width: 100%;
    min-height: auto;
    padding-block: clamp(4.5rem, 8vw, 7rem);
    background:
      radial-gradient(circle at 15% 0%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 34%),
      linear-gradient(180deg, var(--dna-bg-top) 0%, var(--dna-bg) 100%);
    color: var(--dna-text);
    font-family: "Inter", sans-serif;
    overflow: hidden;
  }

  .dna-shell {
    width: min(100%, 1560px);
    margin: 0 auto;
    padding:
      0
      clamp(1.25rem, 3vw, 2.6rem)
      clamp(1.2rem, 2vw, 2rem);
  }

  .dna-intro {
    display: grid;
    grid-template-columns: 1.3fr 0.95fr;
    align-items: start;
    column-gap: clamp(3rem, 9vw, 10rem);
    margin-bottom: clamp(2rem, 3.2vw, 2.8rem);
  }

  .dna-title-block {
    max-width: 42rem;
    padding-top: clamp(0.35rem, 0.9vw, 0.8rem);
  }

  .dna-heading {
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 0.9;
    letter-spacing: -0.055em;
  }

  .dna-title-main {
    font-size: clamp(2.9rem, 4.5vw, 4.5rem);
    font-weight: 300;
    color: rgba(78, 72, 67, 0.96);
  }

  .dna-title-accent {
    margin-top: 0.05em;
    margin-left: clamp(3.6rem, 6vw, 5.4rem);
    font-family: "Cormorant Garamond", serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(3rem, 4.6vw, 4.6rem);
    color: rgba(89, 82, 77, 0.86);
  }

  .dna-copy {
    max-width: 28.5rem;
    justify-self: end;
    padding-top: clamp(0.25rem, 0.8vw, 0.7rem);
  }

  .dna-copy p {
    margin: 0;
    font-size: clamp(1rem, 0.95vw, 1.06rem);
    line-height: 1.56;
    letter-spacing: -0.012em;
    color: var(--dna-muted);
  }

  .dna-gallery {
    display: grid;
    grid-template-columns: 1.08fr 1.28fr 1.06fr;
    grid-template-rows: 8.625rem 18.375rem;
    gap: 0.75rem;
    align-items: stretch;
  }

  .dna-card {
    position: relative;
    overflow: hidden;
    border-radius: 3px;
    background: var(--dna-card-bg);
    border: 1px solid var(--dna-line);
    box-shadow: var(--dna-shadow-card);
  }

  .dna-card img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: center;
    user-select: none;
    pointer-events: none;
  }

  .dna-top-left {
    grid-column: 1;
    grid-row: 1;
  }

  .dna-bottom-left {
    grid-column: 1;
    grid-row: 2;
  }

  .dna-center {
    grid-column: 2;
    grid-row: 1 / span 2;
    margin-top: 0.75rem;
  }

  .dna-right {
    grid-column: 3;
    grid-row: 2;
  }

  @media (max-width: 1100px) {
    .dna-section {
      padding-block: clamp(3.5rem, 6vw, 5rem);
    }

    .dna-shell {
      padding: 0 1.35rem 1.2rem;
    }

    .dna-intro {
      grid-template-columns: 1fr;
      row-gap: 1.4rem;
      margin-bottom: 1.7rem;
    }

    .dna-copy {
      justify-self: start;
      max-width: 36rem;
      padding-top: 0;
    }

    .dna-gallery {
      grid-template-columns: 1fr 1.08fr;
      grid-template-rows: 8.625rem 15.125rem 15.125rem;
      gap: 0.7rem;
    }

    .dna-top-left {
      grid-column: 1;
      grid-row: 1;
    }

    .dna-bottom-left {
      grid-column: 1;
      grid-row: 2 / span 2;
    }

    .dna-center {
      grid-column: 2;
      grid-row: 1 / span 2;
      margin-top: 0.625rem;
    }

    .dna-right {
      grid-column: 2;
      grid-row: 3;
    }
  }

  @media (max-width: 700px) {
    .dna-section {
      padding-block: 3rem 3.75rem;
    }

    .dna-shell {
      padding: 0 1rem 1rem;
    }

    .dna-intro {
      margin-bottom: 1.25rem;
    }

    .dna-title-main {
      font-size: clamp(2.35rem, 9vw, 3.25rem);
    }

    .dna-title-accent {
      margin-left: 2.25rem;
      font-size: clamp(2.45rem, 9.2vw, 3.35rem);
    }

    .dna-copy {
      max-width: 100%;
    }

    .dna-copy p {
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .dna-gallery {
      grid-template-columns: 1fr;
      grid-template-rows: none;
      gap: 0.65rem;
    }

    .dna-top-left,
    .dna-bottom-left,
    .dna-center,
    .dna-right {
      grid-column: 1;
      grid-row: auto;
      margin-top: 0;
    }

    .dna-top-left {
      aspect-ratio: 1.8 / 1;
    }

    .dna-bottom-left {
      aspect-ratio: 1 / 1.18;
    }

    .dna-center {
      aspect-ratio: 1 / 1.28;
    }

    .dna-right {
      aspect-ratio: 1.08 / 1;
    }
  }
</style>