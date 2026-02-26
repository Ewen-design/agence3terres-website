<script>
  import { onMount, onDestroy } from "svelte";
  import gsap from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";

  gsap.registerPlugin(ScrollTrigger);

  let wrapper;
  let ctx;

  const textsContent = [
    "Nous façonnons des expériences de marque avec une attention rare au SENS",
    "Chaque projet naît d’une vision créative pensée pour générer de l’ÉMOTION",
    "Nous construisons des récits puissants capables d’engager durablement votre AUDIENCE",
    "Des expériences esthétiques qui transforment votre image en véritable SIGNATURE"
  ];

  onMount(() => {
    ctx = gsap.context(() => {

      const texts = gsap.utils.toArray(".scroll-text");

      // Split mots
      texts.forEach(text => {
        const words = text.innerText.split(" ");
        text.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(" ");
      });

      gsap.set(".word", { opacity: 0.25, color: "#888" });
      gsap.set(".bg-image", { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: "+=800%",
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      texts.forEach((text, index) => {
        const words = text.querySelectorAll(".word");

        tl.set(text, { opacity: 1 });

        // Révélation mot par mot
        tl.to(words, {
          opacity: 1,
          color: "#fff",
          stagger: 0.08,
          ease: "none",
          duration: 2
        });

        // Pause pour respiration
        tl.to({}, { duration: 0.8 });

        // Transition fond + disparition texte
        if (index === 0) {
          tl.to(".bg-image", { opacity: 1, duration: 2, ease: "none" }, "<");
        }

        if (index < texts.length - 1) {
          tl.to(text, { opacity: 0, duration: 1.2, ease: "none" });
        }
      });

    }, wrapper);

    window.addEventListener("load", () => ScrollTrigger.refresh());

    onDestroy(() => {
      ctx.revert();
    });
  });
</script>

<section class="narrative-wrapper" bind:this={wrapper}>
  <div class="bg-black"></div>
  <div class="bg-image"></div>

  <div class="text-layer">
    {#each textsContent as text}
      <h1 class="scroll-text">{text}</h1>
    {/each}
  </div>
</section>

<style>
.narrative-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
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
  background: url("/images/aigleciel.jpg") center / cover no-repeat;
  filter: blur(25px) brightness(0.6);
  z-index: 2;
  opacity: 0;
  transform: scale3d(1.1, 1.1, 1);
  will-change: opacity, transform;
}

.text-layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  pointer-events: none;
}

h1 {
  position: absolute;
  max-width: 900px;
  text-align: center;
  font-family: "Aboreto", serif;
  font-size: clamp(2rem, 4vw, 3.5rem);
  line-height: 1.3;
  color: #fff;
  opacity: 0;
  will-change: opacity;
}

.word {
  display: inline-block;
  will-change: opacity, color;
}
</style>