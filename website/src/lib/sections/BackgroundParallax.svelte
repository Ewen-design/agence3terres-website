<script>
  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";

  let sections = [];
  let container;

  function splitText(el) {
    const text = el.innerText;
    el.innerHTML = text
      .split("") // chaque caractère
      .map((l, i) => {
        if (l === " ") return " "; // <-- préserve les espaces
        return `<span style="transition-delay:${i * 25}ms">${l}</span>`;
      })
      .join("");
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(v, max));
  }

  function updateParallax() {
    const winH = window.innerHeight;

    sections.forEach(section => {
      const bg = section.querySelector(".bg");
      const textSpans = section.querySelectorAll(".text span");
      const rect = section.getBoundingClientRect();
      const center = rect.top + rect.height / 2;

      // ==== Opacity cinématique ====
      const screenProgress = center / winH;
      let opacity;

      if (screenProgress > 0.85) {
        opacity = 1 - (screenProgress - 0.85) * 6;
      } else if (screenProgress < 0.15) {
        opacity = screenProgress * 6;
      } else {
        opacity = 1;
      }

      bg.style.opacity = clamp(opacity, 0, 1);

      // ==== Parallax stable ====
      const speed = -4;
      const offset = rect.top * speed * 0.08;
      bg.style.transform = `translate3d(0, ${offset}px, 0)`;

      // ==== Texte ====
      if (opacity > 0.6) {
        textSpans.forEach(s => (s.style.opacity = 1));
      }
    });
  }

  onMount(() => {
    sections = Array.from(container.querySelectorAll(".parallax-section"));
    container.querySelectorAll(".text").forEach(splitText);

    registerParallax(updateParallax);
  });

  onDestroy(() => {
    unregisterParallax(updateParallax);
  });
</script>

<div bind:this={container}>
  <section class="parallax-section">
    <div class="bg" style="background-image:url('/images/carte-copie.jpg')"></div>
    <div class="content left">
      <h2 class="text">UNE VISION STRATÉGIQUE</h2>
    </div>
  </section>

  <section class="parallax-section">
    <div class="bg" style="background-image:url('/images/livre.png')"></div>
    <div class="content right">
      <h2 class="text">UNE IDENTITÉ FORTE</h2>
    </div>
  </section>
</div>

<style>
.parallax-section {
  position: relative;
  height: 100vh;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  background: black;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  will-change: transform, opacity;
  transform: translate3d(0,0,0);
  z-index: 1;
}

.content {
  position: relative;
  z-index: 2;
  width: 40%;
  font-family: "Aboreto", serif;
  font-size: clamp(2rem, 3.5vw, 2.7rem);
  color: white;
}

.left { margin-left: 8vw; text-align: left; }
.right { margin-left: auto; margin-right: 8vw; text-align: right; }

.text :global(span) {
  opacity: 0;
  display: inline-block;
  transition: opacity 0.35s ease;
}

/* Responsive */
@media (max-width: 900px) {
  .content {
    width: 80%;
    font-size: clamp(1.5rem, 5vw, 2rem);
  }
  .left, .right {
    margin: 0 auto;
    text-align: center;
  }
}
</style>