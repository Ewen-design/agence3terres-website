<script>
  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";

  let sections = [];
  let container;

  function splitText(el) {
    const text = el.innerText;
    el.innerHTML = text
      .split("")
      .map((l, i) => {
        if (l === " ") return " ";
        return `<span style="transition-delay:${i * 20}ms">${l}</span>`;
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

      const screenProgress = center / winH;
      let opacity;

      if (screenProgress > 0.95) {
        opacity = 1 - (screenProgress - 0.95) * 6;
      } else if (screenProgress < 0.95) {
        opacity = screenProgress * 6;
      } else {
        opacity = 1;
      }

      bg.style.opacity = clamp(opacity, 0, 1);

      const speed = -4;
      const offset = rect.top * speed * 0.08;
      bg.style.transform = `translate3d(0, ${offset}px, 0)`;

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

<!-- HEADER HERO -->
<section class="about-hero">
  <h1>À PROPOS</h1>
  <p>
    Nous sculptons des expériences digitales<br />
    où la matière rencontre la lumière.
  </p>
</section>

<!-- PARALLAX STORY -->
<div bind:this={container}>

  <section class="parallax-section">
    <div class="bg" style="background-image:url('/images/carte.png')"></div>
    <div class="content left">
      <h2 class="text">UNE APPROCHE SENSORIELLE</h2>
      <p>
        Chaque projet commence par une immersion.
        Nous explorons la matière, le rythme, l’émotion.
      </p>
      <button>Découvrir notre méthode</button>
    </div>
  </section>

  <section class="parallax-section">
    <div class="bg" style="background-image:url('/images/livre.png')"></div>
    <div class="content right">
      <h2 class="text">DES EXPÉRIENCES FLUIDES</h2>
      <p>
        Le mouvement guide l’attention.
        Le détail crée la différence.
      </p>
      <button>Voir nos réalisations</button>
    </div>
  </section>

  <section class="parallax-section center">
    <div class="bg" style="background-image:url('/images/parfum.jpg')"></div>
    <div class="content center">
      <h2 class="text">UNE SIGNATURE VISUELLE FORTE</h2>
      <p>
        Identité. Narration. Impact.
        Nous concevons des univers mémorables.
      </p>
      <button>Nous contacter</button>
    </div>
  </section>

</div>

<style>
/* HERO */
.about-hero {
  height: 70vh;
  background: #000;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 10vw;
}

.about-hero h1 {
  font-family: "Aboreto", serif;
  font-size: clamp(3rem, 6vw, 6rem);
  letter-spacing: 0.2em;
  margin-bottom: 1.5rem;
}

.about-hero p {
  font-size: 1.2rem;
  opacity: 0.7;
  max-width: 500px;
}

/* PARALLAX */
.parallax-section {
  position: relative;
  height: 200vh;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  overflow: hidden;
  display: flex;
  align-items: center;
  background: black;
}

.bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transform: translate3d(0,0,0);
  will-change: transform, opacity;
  z-index: 1;
}

.content {
  position: relative;
  z-index: 2;
  width: 40%;
  color: white;
  font-family: "Aboreto", serif;
}

.content h2 {
  font-size: clamp(2rem, 3vw, 3rem);
  margin-bottom: 1.5rem;
}

.content p {
  font-family: "Manrope", sans-serif;
  font-size: 1rem;
  opacity: 0.75;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.left { margin-left: 8vw; text-align: left; }
.right { margin-left: auto; margin-right: 8vw; text-align: right; }
.center { margin: 0 auto; text-align: center; }

/* TEXT ANIMATION */
.text :global(span) {
  opacity: 0;
  display: inline-block;
  transition: opacity 0.4s ease;
}

/* BUTTON */
button {
  padding: 12px 28px;
  background: transparent;
  border: 1px solid white;
  color: white;
  font-family: "Manrope", sans-serif;
  font-size: 0.85rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.4s ease;
}

button:hover {
  background: white;
  color: black;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .content {
    width: 80%;
    margin: 0 auto;
    text-align: center;
  }
}
</style>