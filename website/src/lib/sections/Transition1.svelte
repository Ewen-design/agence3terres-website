<script>
  import { onMount, onDestroy } from "svelte";

  let section;
  let leftCard;
  let rightCard;
  let isMobile = false;

  const clamp = (v, min, max) => Math.max(min, Math.min(v, max));

  function checkMobile() {
    isMobile = window.innerWidth <= 900;
  }

  function updateScroll() {
    if (!section || isMobile) {
      if (leftCard) leftCard.style.transform = "translate3d(0,0,0)";
      if (rightCard) rightCard.style.transform = "translate3d(0,0,0)";
      return;
    }

    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;

    const progress = clamp((rect.top + rect.height / 2 - vh / 2) / vh, -1, 1);

    if (leftCard) {
      const offsetLeft = progress * -190;
      leftCard.style.transform = `translate3d(0, ${offsetLeft}px, 0)`;
    }

    if (rightCard) {
      const offsetRight = progress * -35;
      rightCard.style.transform = `translate3d(0, ${offsetRight}px, 0)`;
    }
  }

  function handleResize() {
    checkMobile();
    updateScroll();
  }

  onMount(() => {
    checkMobile();
    updateScroll();

    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", handleResize);
    };
  });
</script>

<section class="transition-section" bind:this={section}>
  <div class="inner">
    <div class="card left" bind:this={leftCard}>
      <p class="small">01</p>
      <h2>Une vision claire.</h2>
    </div>

    <div class="card right" bind:this={rightCard}>
      <p>
        Nous concevons des expériences de marque élégantes, sobres et lisibles,
        pensées pour créer une respiration naturelle entre des séquences plus
        immersives et plus cinématiques.
      </p>
    </div>
  </div>
</section>

<style>
  .transition-section {
    position: relative;
    min-height: 150vh;
    background: #000;
    overflow: hidden;
    display: flex;
    align-items: center;
  }

  .inner {
    width: 100%;
    max-width: 1180px;
    margin: 0 auto;
    padding: 12rem 2rem;
    display: grid;
    grid-template-columns: 0.95fr 1.35fr;
    gap: 2rem;
    align-items: center;
  }

  .card {

    will-change: transform;
    box-shadow: 0 18px 60px rgba(0, 0, 0, 0.28);
  }

  .left {
    padding: 1rem 0rem;
    max-width: 300px;
  }

  .right {
        background: #111;
    border-radius: 3px;
    padding: 2.4rem 2.2rem;
    max-width: 640px;
    justify-self: end;
  }

  .small {
    margin: 0 0 1.2rem 0;
    font-size: 0.78rem;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.35);
  }

  h2 {
    margin: 0;
    font-family: "Aboreto", serif;
    font-style: italic;
    font-size: clamp(9rem, 3vw, 3rem);
    line-height: 1.02;
    font-weight: 400;
    color: #fff;
  }

  .right p {
    margin: 0;
    max-width: 30rem;
    font-size: 1.02rem;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.58);
  }

  @media (max-width: 900px) {
    .transition-section {
      min-height: auto;
      padding: 5rem 0;
    }

    .inner {
      grid-template-columns: 1fr;
      gap: 1rem;
      padding: 0 1rem;
    }

    .card {
      transform: none !important;
    }

    .left,
    .right {
      max-width: 100%;
      justify-self: stretch;
    }

    .left {
      padding: 1.4rem 1.2rem;
    }

    .right {
      padding: 1.4rem 1.2rem;
    }

    .small {
      margin-bottom: 0.9rem;
      font-size: 0.7rem;
    }

    h2 {
      font-size: clamp(1.8rem, 9vw, 3rem);
    }

    .right p {
      max-width: 100%;
      font-size: 0.95rem;
      line-height: 1.65;
    }
  }
</style>