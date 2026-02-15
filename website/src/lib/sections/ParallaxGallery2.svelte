<script>
  import { onMount, onDestroy } from "svelte";
  import ProjectOffCanvas from "./ProjectOffCanvas.svelte";

  let cards = [];
  let selected = null;

  const items = [
    { id: "1607419726991-5fc7e74cda67", title: "Création de logo", date: "2024", desc: "Refonte complète de l'identité visuelle et création d'un système graphique minimaliste." },
    { id: "1601042879364-f3947d3f9c16", title: "Brand Identity", date: "2023", desc: "Développement d'une plateforme de marque et direction artistique globale." },
    { id: "1536098561742-ca998e48cbcc", title: "UI Design", date: "2024", desc: "Conception d'interfaces modernes axées sur l’expérience utilisateur." },
    { id: "1514439827219-9137a0b99245", title: "UX Research", date: "2022", desc: "Études utilisateurs et architecture d'information pour application mobile." },
    { id: "1525790935716-36a6c45ad067", title: "Direction Artistique", date: "2023", desc: "Supervision créative et mise en place d’un univers visuel premium." },
    { id: "1561344640-2453889cde5b", title: "Motion Concept", date: "2024", desc: "Concept motion design pour lancement de produit digital." }
  ];

  function parallax(card) {
    const wrapper = card.querySelector(".card-image-wrapper");
    const diff = card.offsetHeight - wrapper.offsetHeight;
    const rect = card.getBoundingClientRect();
    const progress = rect.top / window.innerHeight;
    const yPos = diff * progress;
    wrapper.style.transform = `translateY(${yPos}px)`;
  }

  function update() {
    cards.forEach(parallax);
  }

  function openProject(item) {
    selected = item;
    document.body.style.overflow = "hidden";
  }

  function closeProject() {
    selected = null;
    document.body.style.overflow = "";
  }

  onMount(() => {
    cards = document.querySelectorAll(".card");
    window.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    update();
  });

  onDestroy(() => {
    window.removeEventListener("scroll", update);
    window.removeEventListener("resize", update);
  });
</script>

<section class="gallery">
  <div class="gallery-grid">
    {#each items as item, i}
      <div class="card size-{i}" data-cursor="view" on:click={() => openProject(item)}>
        <div class="card-image-wrapper">
          <img src={`https://images.unsplash.com/photo-${item.id}?q=80&w=1600&auto=format&fit=crop`} alt="" />
        </div>

        <div class="info">
          <span class="date">{item.date}</span>
          <span class="title">{item.title}</span>
        </div>
      </div>
    {/each}
  </div>
</section>

<ProjectOffCanvas {selected} on:close={closeProject} />

<style>
.gallery {
  position: relative;
  left: 50%;
  margin-left: -50vw;
  width: 100vw;
  background: #fff;
  padding: 8rem 0;
}

/* 🔥 GRILLE DESIGN ASYMÉTRIQUE */
.gallery-grid {
  width: min(1500px, 92%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: 220px;
  gap: 1rem;
}

/* BASE CARD */
.card {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  cursor: pointer;
  aspect-ratio: 1/1;
}

/* 🧩 TAILLES VARIÉES */
.size-0 { grid-column: span 3; grid-row: span 2; }
.size-1 { grid-column: span 2; grid-row: span 1; }
.size-2 { grid-column: span 1; grid-row: span 1; }
.size-3 { grid-column: span 2; grid-row: span 2; }
.size-4 { grid-column: span 1; grid-row: span 1; }
.size-5 { grid-column: span 3; grid-row: span 1; }

/* PARALLAX */
.card-image-wrapper {
  height: 135%;
  will-change: transform;
}

/* IMAGE */
.card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.5s ease, transform 1.2s ease;
}

.card:hover img {
  filter: brightness(0.6);
  transform: scale(1.05);
}

/* INFO OVERLAY */
.info {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 14px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  background: rgba(255,255,255,0.15);
  color: white;
  font-size: 0.8rem;
  opacity: 0;
  transform: translateY(-10px);
  transition: 0.4s ease;
}

.card:hover .info {
  opacity: 1;
  transform: translateY(0);
}

/* 📱 RESPONSIVE */
@media (max-width: 900px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 200px;
  }
  .card { grid-column: span 1 !important; grid-row: span 1 !important; }
}
</style>
