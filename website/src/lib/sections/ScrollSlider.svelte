<script>
  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";

  let section;
  let images = [];

  const slides = [
    {
      img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2000&auto=format&fit=crop",
      title: "Matière",
      text: "Textures naturelles, surfaces brutes et profondeur sensorielle."
    },
    {
      img: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=2000&auto=format&fit=crop",
      title: "Lumière",
      text: "Jeux d’ombres, contrastes subtils et atmosphères vibrantes."
    },
    {
      img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2000&auto=format&fit=crop",
      title: "Espace",
      text: "Volumes, respiration visuelle et équilibre des formes."
    }
  ];

  function clamp(v, min, max) {
    return Math.max(min, Math.min(v, max));
  }

  function updateParallax() {
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const winH = window.innerHeight;

    // progression de la section dans le viewport
    const progress = clamp(-rect.top / rect.height, 0, 1);

    images.forEach((img, i) => {
      const local = progress * slides.length - i;
      const offset = clamp(local, -1, 1) * -120;

      img.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
  }

  onMount(() => {
    images = section.querySelectorAll(".parallax-img");
    registerParallax(updateParallax);
  });

  onDestroy(() => {
    unregisterParallax(updateParallax);
  });
</script>

<section class="slider" bind:this={section}>
  <div class="sticky">

    {#each slides as slide, i}
      <div class="slide">
        <div
          class="bg parallax-img"
          style={`background-image:url(${slide.img})`}
        ></div>

        <div class="content">
          <h2>{slide.title}</h2>
          <p>{slide.text}</p>
        </div>
      </div>
    {/each}

  </div>
</section>

<style>
.slider {
  height: 300vh; /* 3 slides = 3 écrans */
  position: relative;
}

.sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}

.slide {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
}

.slide:nth-child(1) { z-index: 3; }
.slide:nth-child(2) { z-index: 2; }
.slide:nth-child(3) { z-index: 1; }

.bg {
  position: absolute;
  inset: -10%;
  background-size: cover;
  background-position: center;
  will-change: transform;
}

.content {
  position: relative;
  z-index: 2;
  margin-left: 8vw;
  max-width: 480px;
  color: white;
}

h2 {
  font-family: "Aboreto", serif;
  font-size: 3rem;
  margin-bottom: 1rem;
}

p {
  opacity: 0.85;
  line-height: 1.6;
  font-size: 1rem;
}
</style>
