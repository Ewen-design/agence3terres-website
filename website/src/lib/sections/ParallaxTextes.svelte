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
          end: "+=320%",
          scrub: true,
          pin: true,
        }
      });

      tl.to(".intro-text", { opacity: 0, duration: 1.4 })
        .to(".bg-image", { opacity: 1, duration: 2.2 }, "<")

        .to(".t1", { opacity: 1, duration: 1.2 })
        .to(".t1", { opacity: 0, duration: 1.2 })

        .to(".t2", { opacity: 1, duration: 1.2 })
        .to(".t2", { opacity: 0, duration: 1.2 })

        .to(".t3", { opacity: 1, duration: 1.2 })
        .to(".t3", { opacity: 0, duration: 1.2 })

        // 🤍 BLANC FINAL — PLUS LENT & FLUIDE
        .to(".white-fade", {
          opacity: 1,
          duration: 2.2,           // plus long
          ease: "power3.inOut"     // beaucoup plus smooth
        });

    }, wrapper);

    return () => ctx.revert();
  });
</script>

<section class="narrative-wrapper" bind:this={wrapper}>
  <div class="bg-black"></div>
  <div class="bg-image"></div>
  <div class="white-fade"></div>

  <div class="text-layer">
    <h1 class="intro-text">
      Nous façonnons des expériences de marque avec une attention rare au
      <span class="gold">SENS</span>
    </h1>

    <h1 class="scroll-text t1">
      Chaque projet naît d’une vision créative pensée pour générer de
      l’<span class="gold">ÉMOTION</span>
    </h1>

    <h1 class="scroll-text t2">
      Nous construisons des récits puissants capables d’engager durablement
      votre <span class="gold">AUDIENCE</span>
    </h1>

    <h1 class="scroll-text t3">
      Des expériences esthétiques qui transforment votre image en véritable
      <span class="gold">SIGNATURE</span>
    </h1>
  </div>
</section>

<style>
  .narrative-wrapper {
    position: relative;
    height: 100vh;
    width: 100vw;
    margin-left: calc(50% - 50vw);
    overflow: hidden;
    background: #111;
  }

  .bg-black {
    position: absolute;
    inset: 0;
    background: #111;
    z-index: 1;
  }

  .bg-image {
    position: absolute;
    inset: 0;
    background: url("public/images/aigleciel.jpg") center / cover no-repeat;
    filter: blur(26px) brightness(0.55);
    opacity: 0;
    z-index: 2;
    transform: scale(1.12);
  }

  .white-fade {
    position: absolute;
    inset: 0;
    background: linear-gradient(
		to bottom,
		#111 0%,
		black 100%
	);
    opacity: 0;
    z-index: 4;
    pointer-events: none;
  }

  .text-layer {
    position: absolute;
    inset: 0;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  h1 {
    position: absolute;
    max-width: 920px;
    text-align: center;
    color: white;
    font-family: "Aboreto", serif;
    font-size: clamp(2.1rem, 4vw, 3.8rem);
  }

  .intro-text { opacity: 1; }
  .scroll-text { opacity: 0; }

  .gold {
    font-style: italic;
    background: linear-gradient(90deg,#f4ead1,#c79b3a);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
</style>
