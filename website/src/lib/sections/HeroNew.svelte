<script>
  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";

  let section;
  let scene;

  let progress = 0;
  let smoothProgress = 0;
  let visible = false;
  let textProgress = 0;

  const words = ["Crafting", "Digital", "Experiences", "Elegantly"];

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function updateHero() {
    if (!section || !scene) return;

    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const max = rect.height - vh;

    let raw = Math.min(Math.max(-rect.top / max, 0), 1);

    if (raw < 0.002) {
      raw = 0;
      smoothProgress = 0;
    } else if (raw > 0.998) {
      raw = 1;
      smoothProgress = 1;
    } else {
      const eased = easeOutCubic(raw);
      smoothProgress += (eased - smoothProgress) * 0.075;
    }

    progress = smoothProgress;

    const revealDelay = 0.18;
    textProgress = Math.max(0, Math.min((progress - revealDelay) / (1 - revealDelay), 1));

    visible = rect.bottom > 0 && rect.top < vh;

    if (visible) {
      scene.style.position = "fixed";
      scene.style.top = "0";
      scene.style.left = "0";
      scene.style.width = "100%";
      scene.style.height = "100vh";
      scene.style.opacity = "1";
      scene.style.pointerEvents = "none";
    } else {
      scene.style.opacity = "0";
      scene.style.pointerEvents = "none";
    }
  }

  function scrollToEnd() {
    if (!section) return;

    const targetY =
      window.scrollY +
      section.getBoundingClientRect().top +
      section.offsetHeight -
      window.innerHeight;

    // @ts-ignore
    if (window.lenis && typeof window.lenis.scrollTo === "function") {
      // @ts-ignore
      window.lenis.scrollTo(targetY, {
        duration: 5.5,
        easing: (t) => 1 - Math.pow(1 - t, 2.5)
      });
    } else {
      window.scrollTo({
        top: targetY,
        behavior: "smooth"
      });
    }
  }

  onMount(() => {
    registerParallax(updateHero);
    window.addEventListener("resize", updateHero);

    updateHero();

    return () => {
      unregisterParallax(updateHero);
      window.removeEventListener("resize", updateHero);
    };
  });

  onDestroy(() => {
    unregisterParallax(updateHero);
    window.removeEventListener("resize", updateHero);
  });
</script>

<section
  bind:this={section}
  class="hero"
  data-hero="intro"
  data-cursor="down"
  style="--p:{progress}; --tp:{textProgress};"
  on:click={scrollToEnd}
  role="button"
  tabindex="0"
  on:keydown={(e) => (e.key === "Enter" || e.key === " ") && scrollToEnd()}
>
  <div class="scene" bind:this={scene}>
    <div class="base-gradient"></div>
    <div class="ambient ambient-1"></div>
    <div class="ambient ambient-2"></div>
    <div class="ambient ambient-3"></div>
    <div class="vignette"></div>
    <div class="dark-cover"></div>
    <div class="center-glow"></div>
    <div class="warm-ring"></div>
    <div class="white-lift"></div>

    <div class="content">
      <h1>
        {#each words as word, i}
          <span
            class="word"
            style="
              opacity:{textProgress > i * 0.18 ? 1 : 0};
              filter:blur({textProgress > i * 0.18 ? 0 : 14}px);
              transform:translate3d(0,{textProgress > i * 0.18 ? 0 : 28}px,0);
            "
          >
            {word}
          </span>
        {/each}
      </h1>

      <div class="scroll-indicator" style="opacity:{Math.max(0, 1 - textProgress * 2)}">
        Faites défiler pour découvrir
      </div>
    </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    height: 400vh;
    background: #000;
    isolation: isolate;
    cursor: none;
  }

  .scene {
    position: fixed;
    inset: 0;
    opacity: 0;
    overflow: hidden;
    z-index: 0;
    will-change: opacity;
    backface-visibility: hidden;
    transform: translateZ(0);
  }

  .base-gradient,
  .ambient,
  .vignette,
  .dark-cover,
  .center-glow,
  .warm-ring,
  .white-lift {
    position: absolute;
    inset: -4%;
  }

.base-gradient {
  background:
    radial-gradient(
      66% 66% at 50% 50%,
      rgba(255, 249, 240, calc(0.16 + var(--p) * 0.82)) 0%,
      rgba(255, 235, 214, calc(0.16 + var(--p) * 0.74)) 20%,
      rgba(239, 197, 146, calc(0.14 + var(--p) * 0.60)) 40%,
      rgba(214, 126, 60, calc(0.18 + var(--p) * 0.48)) 58%,
      rgba(108, 40, 12, calc(0.42 + var(--p) * 0.28)) 78%,
      rgba(5, 2, 2, 1) 100%
    );
  animation: baseDrift 40s ease-in-out infinite alternate;
  will-change: transform;
}

  .ambient {
    opacity: calc(0.025 + var(--p) * 0.045);
    will-change: transform, opacity;
  }

  .ambient-1 {
  background:
    radial-gradient(
      28% 28% at 34% 42%,
      rgba(243, 212, 166, 0.34) 0%,
      rgba(219, 158, 92, 0.12) 42%,
      rgba(255, 255, 255, 0) 76%
    );
  filter: blur(34px);
  animation: ambientOne 48s ease-in-out infinite alternate;
}

.ambient-2 {
  background:
    radial-gradient(
      24% 24% at 66% 36%,
      rgba(255, 240, 220, 0.22) 0%,
      rgba(220, 170, 102, 0.09) 44%,
      rgba(255, 255, 255, 0) 78%
    );
  filter: blur(38px);
  animation: ambientTwo 58s ease-in-out infinite alternate;
}

.ambient-3 {
  background:
    radial-gradient(
      30% 30% at 52% 64%,
      rgba(198, 110, 44, 0.16) 0%,
      rgba(228, 170, 106, 0.07) 44%,
      rgba(255, 255, 255, 0) 80%
    );
  filter: blur(42px);
  animation: ambientThree 54s ease-in-out infinite alternate;
}

  .vignette {
    background:
      radial-gradient(
        92% 92% at 50% 50%,
        rgba(0, 0, 0, 0) 54%,
        rgba(0, 0, 0, calc(0.16 - var(--p) * 0.07)) 78%,
        rgba(0, 0, 0, calc(0.48 - var(--p) * 0.16)) 100%
      );
  }

  .dark-cover {
    background:
      radial-gradient(
        64% 64% at 50% 50%,
        rgba(0, 0, 0, calc(0.92 - var(--p) * 0.74)) 0%,
        rgba(0, 0, 0, calc(0.97 - var(--p) * 0.58)) 36%,
        rgba(0, 0, 0, calc(1 - var(--p) * 0.20)) 100%
      );
  }

.center-glow {
  background:
    radial-gradient(
      38% 38% at 50% 50%,
      rgba(255, 248, 238, calc(var(--p) * 0.40)) 0%,
      rgba(255, 230, 198, calc(var(--p) * 0.22)) 38%,
      rgba(222, 170, 92, calc(var(--p) * 0.10)) 62%,
      rgba(255, 255, 255, 0) 80%
    );
  filter: blur(24px);
}

.warm-ring {
  background:
    radial-gradient(
      54% 54% at 50% 50%,
      rgba(255, 255, 255, 0) 0%,
      rgba(214, 166, 94, calc(var(--p) * 0.07)) 44%,
      rgba(170, 92, 34, calc(var(--p) * 0.12)) 60%,
      rgba(255, 255, 255, 0) 78%
    );
  filter: blur(30px);
}

.white-lift {
  background:
    radial-gradient(
      50% 50% at 50% 50%,
      rgba(255, 252, 246, calc(max(0, (var(--p) - 0.52)) * 1.85)) 0%,
      rgba(255, 242, 222, calc(max(0, (var(--p) - 0.52)) * 1.02)) 26%,
      rgba(255, 255, 255, 0) 64%
    );
  filter: blur(13px);
}

  .content {
    position: relative;
    z-index: 3;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 6vw;
    text-align: center;
  }

h1 {
  margin: 0;
  margin-top: 8vh;
  font-family: "Aboreto", serif;
  font-size: clamp(2.8rem, 6vw, 6.2rem);
  line-height: 1.1;
  letter-spacing: 0.08em;
  color: rgba(255, 248, 238, calc(0.78 + var(--tp) * 0.22));
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.48em;
  text-shadow: 0 0 22px rgba(255, 240, 215, 0.08);
}

  .word {
    display: inline-block;
    will-change: transform, opacity, filter;
    transition:
      opacity 2s cubic-bezier(.22,.61,.36,1),
      transform 2s cubic-bezier(.22,.61,.36,1),
      filter 2s cubic-bezier(.22,.61,.36,1);
  }

.scroll-indicator {
  position: absolute;
  bottom: 8vh;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #fff;
  pointer-events: none;
  transition: opacity 0.6s ease;
  white-space: nowrap;
}

  @keyframes baseDrift {
    0% {
      transform: scale(1) translate3d(-0.6%, -0.4%, 0);
    }
    100% {
      transform: scale(1.04) translate3d(0.6%, 0.4%, 0);
    }
  }

  @keyframes ambientOne {
    0% {
      transform: translate3d(-1.2%, -0.9%, 0) scale(1.01);
    }
    100% {
      transform: translate3d(1.3%, 0.9%, 0) scale(1.04);
    }
  }

  @keyframes ambientTwo {
    0% {
      transform: translate3d(1.1%, -1.1%, 0) scale(1.01);
    }
    100% {
      transform: translate3d(-1.3%, 1.1%, 0) scale(1.04);
    }
  }

  @keyframes ambientThree {
    0% {
      transform: translate3d(-0.9%, 1.1%, 0) scale(1.02);
    }
    100% {
      transform: translate3d(1%, -1.2%, 0) scale(1.05);
    }
  }

  @media (max-width: 768px) {
    .hero {
      height: 520vh;
    }

    h1 {
      margin-top: 10vh;
      gap: 0.28em;
      font-size: clamp(2.2rem, 10vw, 4.2rem);
    }

    .ambient {
      opacity: calc(0.015 + var(--p) * 0.03);
    }

    .scroll-indicator {
      bottom: 7vh;
      font-size: 0.68rem;
      letter-spacing: 0.18em;
    }
  }
</style>