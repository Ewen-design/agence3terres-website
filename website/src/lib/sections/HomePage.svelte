<script>
  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";

  let section;
  let cards = [];
  let metrics = [];

  function clamp(v, min, max) {
    return Math.max(min, Math.min(v, max));
  }

  // 📏 Mesure robuste (UNE FOIS)
  function measure() {
    const scrollY = window.scrollY;

    metrics = cards.map(card => {
      const rect = card.getBoundingClientRect();

      return {
        top: rect.top + scrollY,
        height: rect.height,
        wrapper: card.querySelector(".parallax-wrapper")
      };
    });
  }

  // 🚀 appelé par le moteur global
  function updateParallax(scrollY) {
    const winH = window.innerHeight;

    metrics.forEach(m => {
      const relativeTop = m.top - scrollY;
      const center = relativeTop + m.height / 2;

      const progress = clamp((center - winH / 2) / winH, -1, 1);

      const speed = -200;
      const offset = progress * speed;

      m.wrapper.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
  }

  onMount(() => {
    cards = [...section.querySelectorAll(".visual")];

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure); // important images

    registerParallax(updateParallax);
  });

  onDestroy(() => {
    unregisterParallax(updateParallax);
    window.removeEventListener("resize", measure);
    window.removeEventListener("load", measure);
  });
</script>


<section class="home-showcase" bind:this={section}>

  <div class="split">
    <div class="visual">
      <div class="parallax-wrapper">
        <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600&auto=format&fit=crop" />
      </div>
    </div>

    <div class="content">
      <h2>Discover our creative VISION</h2>
      <p>We shape visual universes where form, texture and motion create immersive brand experiences.</p>
    </div>
  </div>

  <div class="split reverse">
    <div class="visual">
      <div class="parallax-wrapper">
        <img src="https://images.unsplash.com/photo-1604014237800-1c9102c219da?q=80&w=1600&auto=format&fit=crop" />
      </div>
    </div>

    <div class="content">
      <h2>Crafted interactions with artistic DEPTH</h2>
      <p>Every motion, contrast and transition is designed to create rhythm and harmony.</p>
    </div>
  </div>

  <div class="split">
    <div class="visual">
      <div class="parallax-wrapper">
        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop" />
      </div>
    </div>

    <div class="content">
      <h2>Where design meets emotional IMPACT</h2>
      <p>We blend minimalism, sculpture-like compositions and cinematic pacing.</p>
    </div>
  </div>

</section>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Aboreto&display=swap');

  .home-showcase {
    width: 100vw;
    margin-left: 50%;
    transform: translateX(-50%);
    background: #111;
    color: #fff;
    padding: 12vh 0;
  }

  .split {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    align-items: center;
    gap: 6vw;
    padding: 14vh 10vw;
  }

  .split.reverse {
    grid-template-columns: 1fr 1.1fr;
  }

  .split.reverse .visual { order: 2; }
  .split.reverse .content { order: 1; }

  .visual {
    height: 520px;
    overflow: hidden;
    position: relative;
  }

  .parallax-wrapper {
    height: 140%;
    will-change: transform;
    transform: translate3d(0,0,0);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 720px;
    margin: 0 auto;
  }

  h2 {
    font-family: 'Aboreto', serif;
    font-size: clamp(2.5rem, 4vw, 4.5rem);
    line-height: 1.05;
    margin-bottom: 2rem;
    width: 100%;
  }

  p {
    font-size: 1.05rem;
    color: #9b9b9b;
    line-height: 1.65;
    max-width: 620px;
  }

  @media (max-width: 900px) {
    .split {
      grid-template-columns: 1fr;
      padding: 12vh 6vw;
    }
  }
</style>
