<script>
  import { onMount } from "svelte";
  import gsap from "gsap";
  import Lenis from "lenis";

  import aigleciel from "/images/aigleciel.jpg";

  const items = Array.from({ length: 12 });

  onMount(() => {
    const lenis = new Lenis();

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  });
</script>

<section class="loop-images">
  <div class="carousel-track" style="--time: 60s; --total: 12;">
    {#each items as _, i}
      <div class="carousel-item" style="--i: {i + 1}">
        <img src={aigleciel} alt="image" />
      </div>
    {/each}
  </div>

  <span class="scroll-down">
    Scroll down
    <span class="arrow">↓</span>
  </span>
</section>

<style>
  /* ====== ISOLATION (n'affecte pas le reste du site) ====== */
  .loop-images * {
    box-sizing: border-box;
  }

  /* ====== SECTION PLEINE LARGEUR ====== */
  .loop-images {
    position: relative;
    width: 100vw;
    height: 100svh;
    background: white;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ====== CARROUSEL ====== */
  .carousel-track {
    --left: -300rem;
    position: relative;
    width: 100%;
    height: 30rem;
  }

  .carousel-item {
    position: absolute;
    width: 30rem;
    height: 30rem;
    left: 100%;
    display: flex;
    justify-content: center;
    perspective: 1000px;
    transform-style: preserve-3d;
    animation: scroll-left var(--time) linear infinite;
    animation-delay: calc(var(--time) / var(--total) * (var(--i) - 1) - var(--time));
    transition: 0.5s ease-in-out;
  }

  .carousel-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: rotateY(-45deg);
    transition: 0.5s ease-in-out;
    mask: linear-gradient(black 70%, transparent 100%);
  }

  .carousel-item:hover img {
    transform: rotateY(0deg) translateY(-1rem);
  }

  @keyframes scroll-left {
    to {
      left: var(--left);
    }
  }

  /* ====== SCROLL DOWN ====== */
  .scroll-down {
    position: absolute;
    bottom: 5rem;
    left: 0;
    right: 0;
    text-align: center;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 1.6rem;
    color: black;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .arrow {
    font-size: 2rem;
    animation: bounce 1.2s infinite ease-in-out;
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(6px);
    }
  }

  /* ====== RESPONSIVE ====== */
  @media (max-width: 900px) {
    .carousel-item {
      width: 22rem;
      height: 22rem;
    }

    .carousel-track {
      height: 22rem;
    }
  }

  @media (max-width: 600px) {
    .carousel-item {
      width: 18rem;
      height: 18rem;
    }

    .carousel-track {
      height: 18rem;
    }
  }
  .loop-images {
  position: relative;
  width: 100vw;
  height: 100svh;
  background: linear-gradient(
		to bottom,
		#f5f6f7 0%,
		#eef1f4 100%
	);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  /* IMPORTANT : force la section à sortir du conteneur parent */
  margin-left: calc(50% - 50vw);
}

</style>