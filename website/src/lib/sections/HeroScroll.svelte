<script>
  import { onMount } from "svelte";
  import gsap from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";

  gsap.registerPlugin(ScrollTrigger);

  let wrapper;

  onMount(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: "+=260%", // ⬅️ plus long pour laisser vivre le texte
          scrub: true,
          pin: true,
        }
      });

      // 🎬 PHASE 1 — Zoom + éclaircissement + netteté
      tl.to(".zoom-img", {
        scale: 2,
        z: 350,
        ease: "power1.inOut",
        duration: 2
      })
      .to(".hero-bg", {
        scale: 1.2,
        filter: "brightness(1) blur(0px)",
        ease: "power1.inOut",
        duration: 2
      }, "<")

      // ✨ PHASE 2 — TEXTE APPARAÎT (pendant que l’image reste visible)
      .to(".hero-text", {
        opacity: 1,
        y: 0,
        ease: "power2.out",
        duration: 1.2
      })

      // 🌫️ PHASE 3 — Disparition du fond
      .to(".hero-bg", {
        opacity: 0,
        ease: "power1.out",
        duration: 0.8
      })
      .to(".hero-text", {
        opacity: 0,
        y: 30,
        ease: "power1.out",
        duration: 0.6
      }, "<");

    }, wrapper);

    return () => ctx.revert();
  });
</script>

<section class="hero-wrapper" bind:this={wrapper}>
  <div class="hero-bg"></div>

  <!-- ✨ TEXTE QUI APPARAÎT APRÈS LE ZOOM -->
  <div class="hero-text">
    L’image crée l’émotion.  
    Nous créons l’expérience.
  </div>

  <div class="image-container">
    <img
      class="zoom-img"
      src="/images/grotte2.png"
      alt=""
    />
  </div>
</section>

<style>
  .hero-wrapper {
    position: relative;
    height: 100vh;
    z-index: 10;
    width: 100vw;
    margin-left: calc(50% - 50vw);
    overflow: hidden;
  }

  .hero-bg {
    position: absolute;
    inset: 0;
    background: url("/images/imageterres.jpg") center / cover no-repeat;
    z-index: 1;
    opacity: 1;

    /* sombre + flou au départ */
    filter: brightness(0.45) blur(8px);
    will-change: transform, opacity, filter;
  }

  .image-container {
    position: absolute;
    inset: 0;
    perspective: 600px;
    z-index: 2;
    overflow: hidden;
  }

  .zoom-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    will-change: transform;
  }

  /* ✨ TEXTE HERO */
  .hero-text {
    position: absolute;
    bottom: 10%;
    left: 8%;
    max-width: 520px;
    font-family: "Aboreto", serif;
    font-size: 2.2rem;
    line-height: 1.3;
    color: white;
    z-index: 3;

    opacity: 0;
    transform: translateY(40px);
    will-change: transform, opacity;
  }

  @media (max-width: 768px) {
    .hero-text {
      font-size: 1.6rem;
      left: 5%;
      right: 5%;
    }
  }
</style>
