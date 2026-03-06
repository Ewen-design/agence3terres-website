<script>
  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";

  let section;
  let scene;

  let progress = 0;
  let smoothProgress = 0;
  let visible = false;
  let drift = 0;
  let rafId;

  const words = ["Crafting", "Digital", "Experiences", "Elegantly"];

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function updateHero() {
    if (!section || !scene) return;

    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const max = rect.height - vh;

    const raw = Math.min(Math.max(-rect.top / max, 0), 1);
    const eased = easeOutCubic(raw);

    smoothProgress += (eased - smoothProgress) * 0.12;
    progress = smoothProgress;

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

  onMount(() => {
    registerParallax(updateHero);
    window.addEventListener("resize", updateHero);

    const animate = (time) => {
      drift = time * 0.00008;
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    updateHero();

    return () => {
      unregisterParallax(updateHero);
      window.removeEventListener("resize", updateHero);
      cancelAnimationFrame(rafId);
    };
  });

  onDestroy(() => {
    unregisterParallax(updateHero);
    window.removeEventListener("resize", updateHero);
    cancelAnimationFrame(rafId);
  });
</script>

<section bind:this={section} class="hero" style="--p:{progress}; --d:{drift};">
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
              opacity:{progress > i * 0.16 ? 1 : 0};
              filter:blur({progress > i * 0.16 ? 0 : 14}px);
              transform:translate3d(0,{progress > i * 0.16 ? 0 : 28}px,0);
            "
          >
            {word}
          </span>
        {/each}
      </h1>
    </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    height: 600vh;
    background: #111;
    isolation: isolate;
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
        62% 62% at 50% 50%,
        rgba(255, 252, 248, calc(0.18 + var(--p) * 0.80)) 0%,
        rgba(255, 232, 214, calc(0.18 + var(--p) * 0.72)) 16%,
        rgba(255, 188, 150, calc(0.16 + var(--p) * 0.60)) 32%,
        rgba(231, 103, 50, calc(0.18 + var(--p) * 0.54)) 50%,
        rgba(111, 30, 8, calc(0.42 + var(--p) * 0.30)) 74%,
        #111 100%
      );
    animation: baseDrift 26s ease-in-out infinite alternate;
    will-change: transform;
  }

  .ambient {
    opacity: calc(0.035 + var(--p) * 0.055);
    will-change: transform, opacity;
  }

  .ambient-1 {
    background:
      radial-gradient(
        28% 28% at 34% 42%,
        rgba(255, 206, 170, 0.55) 0%,
        rgba(255, 162, 112, 0.18) 38%,
        #111 72%
      );
    filter: blur(26px);
    animation: ambientOne 34s ease-in-out infinite alternate;
  }

  .ambient-2 {
    background:
      radial-gradient(
        24% 24% at 66% 36%,
        rgba(255, 240, 230, 0.35) 0%,
        rgba(255, 176, 122, 0.14) 42%,
        #111 74%
      );
    filter: blur(30px);
    animation: ambientTwo 40s ease-in-out infinite alternate;
  }

  .ambient-3 {
    background:
      radial-gradient(
        30% 30% at 52% 64%,
        rgba(221, 94, 42, 0.22) 0%,
        rgba(255, 166, 120, 0.10) 40%,
        #111 76%
      );
    filter: blur(34px);
    animation: ambientThree 38s ease-in-out infinite alternate;
  }

  .vignette {
    background:
      radial-gradient(
        90% 90% at 50% 50%,
        rgba(0, 0, 0, 0) 52%,
        rgba(0, 0, 0, calc(0.18 - var(--p) * 0.08)) 76%,
        rgba(0, 0, 0, calc(0.52 - var(--p) * 0.18)) 100%
      );
  }

  .dark-cover {
    background:
      radial-gradient(
        62% 62% at 50% 50%,
        rgba(0, 0, 0, calc(0.88 - var(--p) * 0.72)) 0%,
        rgba(0, 0, 0, calc(0.95 - var(--p) * 0.55)) 35%,
        rgba(0, 0, 0, calc(1 - var(--p) * 0.22)) 100%
      );
  }

  .center-glow {
    background:
      radial-gradient(
        34% 34% at 50% 50%,
        rgba(255, 255, 255, calc(var(--p) * 0.48)) 0%,
        rgba(255, 236, 221, calc(var(--p) * 0.30)) 34%,
        rgba(255, 186, 132, calc(var(--p) * 0.16)) 58%,
        rgba(255, 255, 255, 0) 76%
      );
    filter: blur(18px);
  }

  .warm-ring {
    background:
      radial-gradient(
        50% 50% at 50% 50%,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 169, 110, calc(var(--p) * 0.10)) 42%,
        rgba(204, 78, 28, calc(var(--p) * 0.18)) 58%,
        rgba(255, 255, 255, 0) 74%
      );
    filter: blur(24px);
  }

  .white-lift {
    background:
      radial-gradient(
        46% 46% at 50% 50%,
        rgba(255, 255, 255, calc(max(0, (var(--p) - 0.55)) * 2.1)) 0%,
        rgba(255, 245, 238, calc(max(0, (var(--p) - 0.55)) * 1.25)) 22%,
        rgba(255, 255, 255, 0) 60%
      );
    filter: blur(10px);
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
    font-family: "Aboreto", serif;
    font-size: clamp(2.8rem, 6vw, 6.2rem);
    line-height: 1.1;
    letter-spacing: 0.08em;
    color: rgba(255, 255, 255, calc(0.78 + var(--p) * 0.22));
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.48em;
    text-shadow: 0 0 22px rgba(255, 255, 255, 0.08);
  }

  .word {
    display: inline-block;
    will-change: transform, opacity, filter;
    transition:
      opacity 1.6s cubic-bezier(.22,.61,.36,1),
      transform 1.6s cubic-bezier(.22,.61,.36,1),
      filter 1.6s cubic-bezier(.22,.61,.36,1);
  }

  @keyframes baseDrift {
    0% {
      transform: scale(1) translate3d(-0.8%, -0.5%, 0);
    }
    100% {
      transform: scale(1.06) translate3d(0.8%, 0.6%, 0);
    }
  }

  @keyframes ambientOne {
    0% {
      transform: translate3d(-1.6%, -1.2%, 0) scale(1.02);
    }
    100% {
      transform: translate3d(1.8%, 1.1%, 0) scale(1.06);
    }
  }

  @keyframes ambientTwo {
    0% {
      transform: translate3d(1.4%, -1.4%, 0) scale(1.01);
    }
    100% {
      transform: translate3d(-1.8%, 1.5%, 0) scale(1.05);
    }
  }

  @keyframes ambientThree {
    0% {
      transform: translate3d(-1.1%, 1.6%, 0) scale(1.03);
    }
    100% {
      transform: translate3d(1.2%, -1.8%, 0) scale(1.07);
    }
  }

  @media (max-width: 768px) {
    .hero {
      height: 520vh;
    }

    h1 {
      gap: 0.28em;
      font-size: clamp(2.2rem, 10vw, 4.2rem);
    }

    .center-glow {
      filter: blur(14px);
    }

    .warm-ring {
      filter: blur(18px);
    }

    .ambient-1,
    .ambient-2,
    .ambient-3 {
      opacity: calc(0.02 + var(--p) * 0.04);
    }
  }
</style>
