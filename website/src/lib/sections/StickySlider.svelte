<script>
  import { onMount } from "svelte";

  const slides = [
    {
      number: "01",
      title: "AI Strategy\n& Execution",
      description: "Driving AI transformation for products, platforms, and people.",
      image: "images/photo.webp"
    },
    {
      number: "02",
      title: "Product\nInnovation",
      description: "Launching flagship digital experiences—used daily by billions.",
      image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2000&q=80"
    },
    {
      number: "03",
      title: "Brand\nExperiences",
      description: "Creating elegant systems, campaigns, and immersive brand worlds.",
      image: "images/photo.webp"
    }
  ];

  let sections = [];
  let activeIndex = 0;

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeIndex = Number(entry.target.dataset.index);
          }
        });
      },
      { threshold: 0.6 }
    );

    sections.forEach((section) => section && observer.observe(section));

    return () => observer.disconnect();
  });
</script>

<section class="slider">
  <div class="sticky">
    <div class="backgrounds">
      {#each slides as slide, i}
        <div class="bg" class:active={activeIndex === i}>
          <img src={slide.image} alt="" />
          <div class="overlay"></div>
        </div>
      {/each}
    </div>
  </div>

  <div class="slides">
    {#each slides as slide, i}
      <section class="slide" bind:this={sections[i]} data-index={i}>
        <div class="content">
          <div class="number">{slide.number}</div>
          <h2>{slide.title}</h2>
          <p>{slide.description}</p>
        </div>
      </section>
    {/each}
  </div>
</section>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Aboreto&display=swap");

  :global(body) {
    margin: 0;
    background: #050b14;
    color: white;
    font-family: Inter, sans-serif;
  }

  :global(*) {
    box-sizing: border-box;
  }

  .slider {
    position: relative;
    width: 100%;
  }

  /* sticky scene */
  .sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    height: 100svh;
    overflow: hidden;
    background: #050b14;
    isolation: isolate;
    z-index: 0;
  }

  .sticky::before {
    content: "";
    position: absolute;
    inset: 0;
    background: #050b14;
    z-index: 0;
  }

  /* backgrounds */
  .backgrounds {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: #050b14;
  }

  .bg {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 900ms ease;
    z-index: 1;
    background: #050b14;
  }

  .bg.active {
    opacity: 1;
    z-index: 2;
  }

  .bg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    inset: 0;
    display: block;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(
        to right,
        rgba(0, 0, 0, 0.74) 0%,
        rgba(0, 0, 0, 0.48) 34%,
        rgba(0, 0, 0, 0.24) 60%,
        rgba(0, 0, 0, 0.38) 100%
      );
  }

  /* slides flow */
  .slides {
    position: relative;
    z-index: 3;
  }

  .slide {
    min-height: 100vh;
    min-height: 100svh;
    display: flex;
    align-items: center;
    padding: clamp(4rem, 7vw, 8rem) clamp(1.25rem, 5vw, 4.5rem);
    position: relative;
  }

  .content {
    position: relative;
    z-index: 5;
    width: min(100%, 760px);
  }

  .number {
    opacity: 0.7;
    margin-bottom: clamp(0.75rem, 1.2vw, 1rem);
    font-size: clamp(0.85rem, 1vw, 1.1rem);
    letter-spacing: 0.08em;
    position: relative;
    z-index: 5;
  }

  h2 {
    font-family: "Aboreto", serif;
    font-size: clamp(3.5rem, 6vw, 8rem);
    line-height: 0.92;
    white-space: pre-line;
    margin: 0;
    color: white;
    letter-spacing: 0.02em;
    position: relative;
    z-index: 5;
    max-width: 10ch;
    text-wrap: balance;
  }

  p {
    margin-top: clamp(1.25rem, 2.5vw, 2rem);
    font-size: clamp(1rem, 1.25vw, 1.2rem);
    line-height: 1.55;
    max-width: 34rem;
    opacity: 0.9;
    position: relative;
    z-index: 5;
    color: #a7a7a7;
  }

  /* grand desktop */
  @media (min-width: 1440px) {
    .content {
      width: min(100%, 820px);
    }

    p {
      max-width: 36rem;
    }
  }

  /* tablette */
  @media (max-width: 1024px) {
    .slide {
      padding: 5rem 2.25rem;
    }

    .content {
      width: min(100%, 680px);
    }

    h2 {
      font-size: clamp(3rem, 8vw, 5.5rem);
      max-width: 11ch;
    }

    p {
      max-width: 30rem;
      font-size: 1.05rem;
    }
  }

  /* mobile */
  @media (max-width: 800px) {
    .overlay {
      background:
        linear-gradient(
          to top,
          rgba(0, 0, 0, 0.72) 0%,
          rgba(0, 0, 0, 0.5) 30%,
          rgba(0, 0, 0, 0.28) 55%,
          rgba(0, 0, 0, 0.4) 100%
        );
    }

    .slide {
      align-items: flex-end;
      padding: 0 1.25rem 2.25rem;
    }

    .content {
      width: 100%;
      max-width: 100%;
    }

    .number {
      margin-bottom: 0.75rem;
      font-size: 0.82rem;
    }

    h2 {
      font-size: clamp(2.3rem, 12vw, 4.2rem);
      line-height: 0.94;
      max-width: 100%;
    }

    p {
      margin-top: 1rem;
      font-size: 0.98rem;
      line-height: 1.5;
      max-width: 26rem;
    }
  }

  /* petit mobile */
  @media (max-width: 480px) {
    .slide {
      padding: 0 1rem 1.5rem;
    }

    .number {
      font-size: 0.78rem;
    }

    h2 {
      font-size: clamp(2rem, 13vw, 3.2rem);
      line-height: 0.96;
      letter-spacing: 0.01em;
    }

    p {
      font-size: 0.92rem;
      line-height: 1.45;
      max-width: 100%;
      color: #b0b0b0;
    }
  }
</style>