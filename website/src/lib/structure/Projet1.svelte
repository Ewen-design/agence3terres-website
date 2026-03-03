<script>
  import { onMount } from "svelte";

  export let navigate;

  let trigger;
  let progress = 0;
  let interval;
  let hasStarted = false;

  function startTransition() {
    if (hasStarted) return;
    hasStarted = true;

    interval = setInterval(() => {
      progress += 100 / (1500 / 16);
      if (progress >= 100) {
        clearInterval(interval);
        navigate("projet2");
      }
    }, 16);
  }

  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startTransition();
        }
      },
      { threshold: 0.95 }
    );

    observer.observe(trigger);
  });
</script>

<article class="project">

  <!-- HERO -->
  <section
    class="hero"
    style="background-image:url('https://images.unsplash.com/photo-1520962917960-42d4c9c64c66')"
  >
    <div class="overlay">
      <h1>Maison Élixir</h1>
      <span>Branding & Digital</span>
    </div>
  </section>

  <!-- CONTENT -->
  <section class="content">
    <p>
      Maison Élixir est un projet premium mêlant identité visuelle,
      direction artistique et expérience digitale immersive.
    </p>
    <p>
      L’accent est mis sur la matière, la lumière et le rythme du scroll.
    </p>
    <p>
      Chaque section agit comme une respiration.
    </p>
  </section>

  <!-- NEXT PROJECT (vrai bas de page) -->
  <section class="next">

    <div class="sticky">
      Prochain projet
    </div>

    <div
      class="next-image"
      bind:this={trigger}
      style="background-image:url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee')"
    >
      <h2>Atelier Noir</h2>

      {#if hasStarted}
        <div class="loader">
          <div class="bar" style="width:{progress}%"></div>
        </div>
      {/if}
    </div>

  </section>

</article>

<style>
.project {
  background: black;
  color: white;
}

/* HERO */

.hero {
  height: 100vh;
  background-size: cover;
  background-position: center;
  position: relative;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 80px;
}

.hero h1 {
  font-family: 'Aboreto', serif;
  font-size: clamp(3rem, 6vw, 6rem);
}

.hero span {
  margin-top: 20px;
  opacity: 0.7;
}

/* CONTENT */

.content {
  max-width: 900px;
  padding: 150px 80px;
  line-height: 1.8;
}

/* NEXT */

.next {
  position: relative;
  min-height: 100vh;
}

.sticky {
  position: sticky;
  top: 40px;
  margin-left: 80px;
  padding: 12px 24px;
  background: white;
  color: black;
  z-index: 5;
}

.next-image {
  height: 100vh;
  width: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.next-image h2 {
  font-family: 'Aboreto', serif;
  font-size: 4rem;
}

/* LOADER */

.loader {
  position: absolute;
  bottom: 60px;
  left: 10%;
  width: 80%;
  height: 4px;
  background: rgba(255,255,255,0.3);
}

.bar {
  height: 100%;
  background: white;
  transition: width 0.1s linear;
}
</style>