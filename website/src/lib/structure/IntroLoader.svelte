<script>
  import { onMount } from "svelte";

  let phase = "draw";
  let progressReady = false;

  onMount(() => {
    const isMobile = window.innerWidth <= 768;
    const minDuration = isMobile ? 5600 : 5000;

    let heroReady = false;
    let minElapsed = false;
    let finished = false;

    let raf1;
    let raf2;
    let drawTimer;
    let minTimer;
    let leaveTimer;

    function tryFinish() {
      if (finished) return;
      if (!heroReady || !minElapsed) return;

      finished = true;
      phase = "done";

      document.body.classList.remove("intro-active", "intro-draw", "intro-lock");
      document.body.classList.add("intro-leaving");

      leaveTimer = setTimeout(() => {
        document.body.classList.remove("intro-leaving");
        document.body.classList.add("intro-complete");
        window.dispatchEvent(new CustomEvent("intro-complete"));
      }, 900);
    }

    function onHeroReady() {
      heroReady = true;
      tryFinish();
    }

    document.body.classList.add("intro-active", "intro-lock");
    document.body.classList.remove("intro-draw", "intro-leaving", "intro-complete");

    window.addEventListener("hero-ready", onHeroReady);

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        drawTimer = setTimeout(() => {
          progressReady = true;
          document.body.classList.add("intro-draw");
        }, isMobile ? 120 : 40);
      });
    });

    minTimer = setTimeout(() => {
      minElapsed = true;
      tryFinish();
    }, minDuration);

    return () => {
      window.removeEventListener("hero-ready", onHeroReady);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(drawTimer);
      clearTimeout(minTimer);
      clearTimeout(leaveTimer);

      document.body.classList.remove("intro-active", "intro-draw", "intro-leaving", "intro-lock");
      document.body.classList.add("intro-complete");
    };
  });
</script>

<div class="background {phase}">
  <div class="progress-container">
    <div class="progress-bar {progressReady ? 'play' : ''}"></div>
  </div>
</div>

<style>
  .background {
    position: fixed;
    inset: 0;
    background: #111;
    z-index: 9998;
    transition:
      opacity 0.9s cubic-bezier(.22,.61,.36,1),
      visibility 0.9s cubic-bezier(.22,.61,.36,1);
  }

  .background.done {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }

  .progress-container {
    position: absolute;
    left: 50%;
    bottom: 35%;
    transform: translateX(-50%);
    width: 200px;
    height: 1px;
    background: rgba(255,255,255,0.15);
    overflow: hidden;
    z-index: 10001;
  }

  .progress-bar {
    width: 0%;
    height: 100%;
    background: #fff;
  }

  .progress-bar.play {
    animation: loading 5s cubic-bezier(.7,0,.3,1) forwards;
  }

  @keyframes loading {
    to { width: 100%; }
  }

  @media (max-width: 768px) {
    .progress-container {
      width: 152px;
      bottom: 33%;
    }

    .progress-bar.play {
      animation: loading 5.2s cubic-bezier(.7,0,.3,1) forwards;
    }
  }
</style>