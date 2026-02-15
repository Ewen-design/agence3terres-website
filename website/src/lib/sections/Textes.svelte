<script>
  import { onMount } from "svelte";
  import gsap from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  import SplitText from "gsap/SplitText";
  import Lenis from "@studio-freight/lenis";

  gsap.registerPlugin(ScrollTrigger, SplitText);

  onMount(() => {
    const lenis = new Lenis();
    let targetVelocity = 0;

    lenis.on("scroll", (e) => {
      targetVelocity = Math.abs(e.velocity) * 0.02;
      ScrollTrigger.update();
    });

    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    const textBlocks = gsap.utils.toArray(".copy-block p");
    const splitInstances = textBlocks.map((block) =>
      SplitText.create(block, { type: "words", mask: "words" })
    );

    gsap.set(splitInstances[1].words, { yPercent: 100 });
    gsap.set(splitInstances[2].words, { yPercent: 100 });

    const overlapCount = 3;

    const getWordProgress = (phaseProgress, wordIndex, totalWords) => {
      const totalLength = 1 + overlapCount / totalWords;
      const scale =
        1 /
        Math.min(
          totalLength,
          1 + (totalWords - 1) / totalWords + overlapCount / totalWords
        );

      const startTime = (wordIndex / totalWords) * scale;
      const endTime = startTime + (overlapCount / totalWords) * scale;
      const duration = endTime - startTime;

      if (phaseProgress <= startTime) return 0;
      if (phaseProgress >= endTime) return 1;
      return (phaseProgress - startTime) / duration;
    };

    const animateBlock = (outBlock, inBlock, phaseProgress) => {
      outBlock.words.forEach((word, i) => {
        const progress = getWordProgress(
          phaseProgress,
          i,
          outBlock.words.length
        );
        gsap.set(word, { yPercent: progress * 100 });
      });

      inBlock.words.forEach((word, i) => {
        const progress = getWordProgress(
          phaseProgress,
          i,
          inBlock.words.length
        );
        gsap.set(word, { yPercent: 100 - progress * 100 });
      });
    };

    const indicator = document.querySelector(".scroll-indicator");
    const marqueeTrack = document.querySelector(".marquee-track");
    const items = gsap.utils.toArray(".marquee-item");

    items.forEach((item) =>
      marqueeTrack.appendChild(item.cloneNode(true))
    );

    let marqueePosition = 0;
    let smoothVelocity = 0;

    gsap.ticker.add(() => {
      smoothVelocity += (targetVelocity - smoothVelocity) * 0.5;

      const baseSpeed = 0.45;
      const speed = baseSpeed + smoothVelocity * 9;

      marqueePosition -= speed;

      const trackWidth = marqueeTrack.scrollWidth / 2;
      if (marqueePosition <= -trackWidth) {
        marqueePosition = 0;
      }

      gsap.set(marqueeTrack, { x: marqueePosition });
      targetVelocity *= 0.9;
    });

    ScrollTrigger.create({
      trigger: ".container",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const scrollProgress = self.progress;
        gsap.set(indicator, { "--progress": scrollProgress });

        if (scrollProgress <= 0.5) {
          const phase1 = scrollProgress / 0.5;
          animateBlock(splitInstances[0], splitInstances[1], phase1);
        } else {
          const phase2 = (scrollProgress - 0.5) / 0.5;
          gsap.set(splitInstances[0].words, { yPercent: 100 });
          animateBlock(splitInstances[1], splitInstances[2], phase2);
        }
      }
    });
  });
</script>

<div class="fullwidth-wrapper">
  <div class="container">
    <section class="hero">
      <div class="about-copy">
        <div class="copy-block">
          <p>
            I craft digital experiences with a focus on design, functionality,
            and user-centered thinking. My approach is thoughtful and iterative.
          </p>
        </div>
        <div class="copy-block">
          <p>
            I build interfaces that feel intuitive, with clean code and
            attention to detail across every interaction.
          </p>
        </div>
        <div class="copy-block">
          <p>
            The final products aim to bridge design intent and technical
            precision, creating seamless experiences that resonate with users.
          </p>
        </div>
      </div>

      <div class="marquee">
        <div class="marquee-track">
          {#each Array(10) as _}
            <div class="marquee-item">
              <img src="/images/aigleciel.jpg" alt="aigle" />
            </div>
          {/each}
        </div>
      </div>

      <div class="scroll-indicator"></div>
    </section>
  </div>
</div>

<style>

/* wrapper qui casse la contrainte du parent */
.fullwidth-wrapper {
  width: 100vw;
  margin-left: calc(50% - 50vw);
  background: #000;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.container {
  position: relative;
  width: 100%;
  height: 600vh;
}

.hero {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: 100svh;
  overflow: hidden;
  background: #000;
}

.about-copy {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  padding: 2rem;
  display: flex;
  gap: 4rem;
}

.copy-block {
  flex: 1;
}

.copy-block p {
  font-size: 1.75rem;
  font-weight: 450;
  letter-spacing: -0.025rem;
  line-height: 1.25;
}

.copy-block p .word {
  will-change: transform;
}

.scroll-indicator {
  position: absolute;
  width: 10rem;
  height: 0.1rem;
  top: 3rem;
  right: 2rem;
  background-color: #2f2f2f;
}

.scroll-indicator::after {
  content: "";
  position: absolute;
  inset: 0;
  background-color: #fff;
  transform-origin: left;
  transform: scaleX(var(--progress, 0));
  will-change: transform;
}

.marquee {
  position: absolute;
  left: 0;
  bottom: 2rem;
  width: 100%;
  height: 7.5rem;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.marquee-track {
  display: flex;
  gap: 0.75rem;
  will-change: transform;
}

.marquee-item {
  width: 10rem;
  height: 6rem;
  border-radius: 0.25rem;
  overflow: hidden;
}

@media (max-width: 1000px) {
  .about-copy {
    top: 20rem;
    flex-direction: column;
  }

  .copy-block p {
    font-size: 1.25rem;
  }
}
</style>
