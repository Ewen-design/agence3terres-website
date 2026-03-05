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
        navigate("projet1");
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

  <section
    class="hero"
    style="background-image:url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee')"
  >
    <div class="overlay">
      <h1>Atelier Noir</h1>
      <span>Direction artistique</span>
    </div>
  </section>

  <section class="content">
    <p>
      Atelier Noir explore une approche minimaliste de la direction artistique.
    </p>
    <p>
      Le contraste et l’espace deviennent les éléments centraux.
    </p>
    <p>
      Le scroll devient narratif et contemplatif.
    </p>
  </section>

  <section class="next">

    <div class="sticky">Prochain projet</div>

    <div
      class="next-image"
      bind:this={trigger}
      style="background-image:url('https://images.unsplash.com/photo-1520962917960-42d4c9c64c66')"
    >
      <h2>Maison Élixir</h2>

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

.content {
  max-width: 900px;
  padding: 150px 80px;
  line-height: 1.8;
}

.next {
  position: relative;
  height: 160vh;
}

.sticky {
  position: sticky;
  top: 40px;
  margin-left: 80px;
  padding: 12px 24px;
  background: white;
  color: black;
}

.next-image {
  height: 100vh;
  margin-top: 200px;
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

.loader {
  position: absolute;
  bottom: 60px;
  left: 10%;
  width: 80%;
  height: 1px;
  background: rgba(255,255,255,0.3);
}

.bar {
  height: 100%;
  background: white;
  transition: width 0.1s linear;
}
</style>