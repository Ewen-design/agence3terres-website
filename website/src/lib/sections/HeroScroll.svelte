<script>
  import { onMount, onDestroy } from "svelte";
  import gsap from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";

  gsap.registerPlugin(ScrollTrigger);

  let wrapper;
  let ctx;

  onMount(() => {
    ctx = gsap.context(() => {

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

      tl.to(".zoom-img", {
        scale: 6,
        ease: "power1.inOut",
        duration: 2
      })
      .to(".hero-bg", {
        scale: 1.2,
        filter: "brightness(1) blur(0px)",
        ease: "power1.inOut",
        duration: 2
      }, "<")
      .to(".hero-text", {
        opacity: 1,
        y: 0,
        ease: "power2.out",
        duration: 1.2
      })
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

    ScrollTrigger.refresh();
  });

  onDestroy(() => {
    ctx?.revert(); // nettoie UNIQUEMENT ce composant
  });
</script>

<section class="hero-wrapper" bind:this={wrapper}>
  <div class="hero-bg"></div>

  <div class="hero-text">
    L’image crée l’émotion.  
    Nous créons l’expérience.
  </div>

  <div class="image-container">
    <img class="zoom-img" src="/images/nuages.png" alt="Hero Image" />
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
  filter: brightness(0.8) blur(0px);
  opacity: 1;
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
}
</style>