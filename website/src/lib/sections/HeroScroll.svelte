<script>
  import { onMount, onDestroy } from "svelte";
  import gsap from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";

  gsap.registerPlugin(ScrollTrigger);

  let wrapper;
  let ctx;

  onMount(() => {
    // Création du contexte GSAP pour s'assurer que tout est scoped à ce composant
    ctx = gsap.context(() => {
      // État initial sécurisé
      gsap.set(".hero-text", { opacity: 0, y: 40 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: "+=260%",
          scrub: true,
          pin: true,
          invalidateOnRefresh: true
        }
      });

      // PHASE 1 — Zoom + éclaircissement + netteté
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
      }, "<") // "<" = synchronisé avec la précédente

      // PHASE 2 — TEXTE APPARAÎT
      .to(".hero-text", {
        opacity: 1,
        y: 0,
        ease: "power2.out",
        duration: 1.2
      })

      // PHASE 3 — Disparition
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

    // Recalcul ScrollTrigger au chargement complet
    const handleLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", handleLoad);

    onDestroy(() => {
      window.removeEventListener("load", handleLoad);
      ctx.revert(); // Nettoie GSAP
    });
  });
</script>

<section class="hero-wrapper" bind:this={wrapper}>
  <div class="hero-bg"></div>

  <div class="hero-text">
    L’image crée l’émotion.  
    Nous créons l’expérience.
  </div>

  <div class="image-container">
    <img class="zoom-img" src="/images/grotte2.png" alt="Hero Image" />
  </div>
</section>

<style>
  .hero-wrapper {
    position: relative;
    height: 100vh;
    width: 100vw;
    margin-left: calc(50% - 50vw);
    overflow: hidden;
    z-index: 10;
  }

  .hero-bg {
    position: absolute;
    inset: 0;
    background: url("/images/imageterres.jpg") center / cover no-repeat;
    z-index: 1;
    filter: brightness(0.45) blur(8px);
    opacity: 1;
    will-change: transform, opacity, filter;
  }

  .image-container {
    position: absolute;
    inset: 0;
    perspective: 600px;
    overflow: hidden;
    z-index: 2;
  }

  .zoom-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    will-change: transform;
  }

  .hero-text {
    position: absolute;
    bottom: 10%;
    left: 8%;
    max-width: 520px;
    font-family: "Aboreto", serif;
    font-size: 2.2rem;
    line-height: 1.3;
    color: #fff;
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