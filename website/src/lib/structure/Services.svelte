<script>
  let active = null;

  const services = [
    {
      title: "Brand Strategy",
      subtitle: "Positionnement & Vision",
      text: "Nous construisons des marques fortes, cohérentes et stratégiquement différenciantes.",
      image: "/images/parfum.jpg"
    },
    {
      title: "Creative Direction",
      subtitle: "Identité & Univers Visuel",
      text: "Direction artistique globale, systèmes visuels, cohérence esthétique et impact émotionnel.",
      image: "/images/parfum.jpg"
    },
    {
      title: "Digital Experience",
      subtitle: "Web & Interaction",
      text: "Conception d’expériences digitales immersives, élégantes et performantes.",
      image: "/images/parfum.jpg"
    }
  ];
</script>

<section class="services">

  <!-- HERO -->
  <div class="hero">
    <h1>
      Services designed<br>
      to elevate brands.
    </h1>
  </div>

  <!-- BLOCKS -->
  {#each services as service, i}
    <div 
      class="service {i % 2 === 0 ? 'left' : 'right'} {active === i ? 'active' : ''}"
      on:mouseenter={() => active = i}
      on:mouseleave={() => active = null}
    >

      <div class="image-wrapper">
        <div 
          class="image"
          style="background-image:url({service.image})"
        ></div>
      </div>

      <div class="content">
        <span class="subtitle">{service.subtitle}</span>
        <h2>{service.title}</h2>
        <p>{service.text}</p>

        <div class="cta">
          Discover →
        </div>
      </div>

    </div>
  {/each}

</section>

<style>

/* GLOBAL */

.services {
  background: linear-gradient(to bottom, #ffffff, #f4f4f4);
  color: #111;
  overflow: hidden;
}

/* HERO */

.hero {
  height: 80vh;
  display: flex;
  align-items: center;
  padding: 0 10vw;
}

.hero h1 {
  font-family: 'Aboreto', serif;
  font-size: clamp(3rem, 6vw, 6rem);
  line-height: 1.1;
  font-weight: 400;
}

/* SERVICE BLOCK */

.service {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 100vh;
  padding: 0 10vw;
  transition: all 0.8s cubic-bezier(.77,0,.18,1);
}

/* ALTERNANCE */

.service.left {
  flex-direction: row;
}

.service.right {
  flex-direction: row-reverse;
}

/* IMAGE */

.image-wrapper {
  width: 55%;
  overflow: hidden;
}

.image {
  width: 100%;
  height: 70vh;
  background-size: cover;
  background-position: center;
  transform: scale(1.05);
  transition: 
    transform 1.5s cubic-bezier(.77,0,.18,1),
    filter 1s ease;
  filter: grayscale(20%);
}

/* CONTENT */

.content {
  width: 40%;
  max-width: 500px;
  transition: transform .8s cubic-bezier(.77,0,.18,1);
}

.subtitle {
  font-size: 0.8rem;
  letter-spacing: 3px;
  opacity: 0.5;
}

h2 {
  font-family: 'Aboreto', serif;
  font-size: clamp(2.5rem, 3.5vw, 4rem);
  margin: 20px 0;
}

p {
  line-height: 1.7;
  opacity: 0.8;
}

.cta {
  margin-top: 30px;
  font-size: 0.9rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  transition: transform .4s ease;
}

/* HOVER EFFECTS */

.service.active .image {
  transform: scale(1.15);
  filter: grayscale(0%);
}

.service.active .content {
  transform: translateY(-10px);
}

.service.active .cta {
  transform: translateX(10px);
}

/* TRANSITION BETWEEN BLOCKS */

.service::after {
  content: "";
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 200px;
  background: linear-gradient(to bottom, transparent, #f4f4f4);
  pointer-events: none;
}

/* RESPONSIVE */

@media (max-width: 1000px) {
  .service {
    flex-direction: column !important;
    justify-content: center;
    gap: 40px;
  }

  .image-wrapper,
  .content {
    width: 100%;
  }

  .image {
    height: 50vh;
  }
}

</style>