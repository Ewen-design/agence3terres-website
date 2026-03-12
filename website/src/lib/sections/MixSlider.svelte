<script>
  import { onMount, onDestroy } from "svelte";

  const slides = [
    {
      number: "01",
      title: "Branding\n& stratégie",
      description: "Nous révélons l’essence des marques et façonnons des identités fortes, cohérentes et mémorables. De la stratégie à l’identité visuelle, chaque élément est pensé pour créer une marque singulière et durable.",
      image: "images/parfum3.webp"
    },
    {
      number: "02",
      title: "Contenus\n& communication",
      description: "Nous imaginons des contenus qui donnent vie aux marques. Images, mots et récits se rencontrent pour créer une communication sensible, cohérente et impactante.",
      image: "images/parfum2.webp"
    },
    {
      number: "03",
      title: "Expériences\ndigitales & web", 
      description: "Nous concevons des expériences digitales élégantes et immersives. Chaque interface est pensée pour refléter l’univers de la marque et offrir une navigation fluide et intuitive.",
      image: "images/parfum4.webp"
    },
    {
      number: "04",
      title: "Accompagnement\n& événements",
      description: "Designing refined digital identities, interfaces, and visual systems with lasting impact.",
     image: "images/photo.webp"
    }
  ];

  let sections = [];
  let activeIndex = 0;
  let fills = [0, 0, 0, 0];
  let ticking = false;
  let observer;

  const THRESHOLD = 0.6;
  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));

  function updateProgress() {
    const vh = window.innerHeight;
    const next = slides.map(() => 0);

    sections.forEach((section, i) => {
      if (!section) return;

      const rect = section.getBoundingClientRect();

      // 0% quand la slide arrive
      // 100% exactement quand la slide suivante atteint le threshold 0.6
      // Avec une slide de 100vh et threshold 0.6 :
      // le changement arrive quand la slide courante a top = -60vh
      const progress = clamp((-rect.top) / (vh * THRESHOLD), 0, 1);

      next[i] = progress * 100;
    });

    fills = next;
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateProgress);
    }
  }

  onMount(() => {
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeIndex = Number(entry.target.dataset.index);
          }
        });
      },
      { threshold: THRESHOLD }
    );

    sections.forEach((section) => {
      if (section) observer.observe(section);
    });
  });

  onDestroy(() => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    if (observer) observer.disconnect();
  });
</script>

<section class="slider">
  <div class="sticky">
    <div class="backgrounds">
      <div class="progress-nav">
        {#each slides as slide, i}
          <div class="segment">
            <div class="segment-line">
              <div class="segment-fill" style="width:{fills[i]}%"></div>
            </div>

            <div class="segment-label">
              <span class="num">{slide.number}</span>
            </div>
          </div>
        {/each}
      </div>

      {#each slides as slide, i}
        <div
          class="bg"
          class:active={activeIndex === i}
        >
          <img src={slide.image} alt="">
          <div class="overlay"></div>
        </div>
      {/each}
    </div>
  </div>

  <div class="slides">
    {#each slides as slide, i}
      <section
        class="slide"
        bind:this={sections[i]}
        data-index={i}
      >
        <div class="content">
          <div class="number">{slide.number}</div>
          <h2>{slide.title}</h2>
          <p>{slide.description}</p>
        </div>
      </section>
    {/each}

    <div class="tail" aria-hidden="true"></div>
  </div>
</section>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Aboreto&display=swap');

  :global(body){
    margin:0;
    background:#050b14;
    color:white;
    font-family:Inter, sans-serif;
  }

  .slider{
    position:relative;
    width:100%;
  }

  /* sticky scene */
  .sticky{
    position:sticky;
    top:0;
    height:100vh;
    overflow:hidden;
    background:#050b14;
    isolation:isolate;
    z-index:0;
  }

  /* couche de sécurité pour masquer ton background fixe */
  .sticky::before{
    content:"";
    position:absolute;
    inset:0;
    background:#050b14;
    z-index:0;
  }

  /* backgrounds */
  .backgrounds{
    position:absolute;
    inset:0;
    z-index:1;
    background:#050b14;
  }

  .bg{
    position:absolute;
    inset:0;
    opacity:0;
    transition:opacity 900ms ease;
    z-index:1;
    background:#050b14;
  }

  .bg.active{
    opacity:1;
    z-index:2;
  }

  .bg img{
    width:100%;
    height:100%;
    object-fit:cover;
    position:absolute;
    inset:0;
    display:block;
  }

  /* slides flow */
  .slides{
    position:relative;
    z-index:3;
  }

  .slide{
    min-height:100vh;
    display:flex;
    align-items:center;
    padding:8rem 4rem;
    position:relative;
  }

  .tail{
    height:60vh;
  }

  .content{
    max-width:720px;
    z-index:5;
    position:relative;
  }

  .number{
    opacity:.7;
    margin-bottom:1rem;
    font-size:1.2rem;
    position:relative;
    z-index:5;
  }

  h2{
    font-family:"Aboreto", serif;
    font-size:clamp(4rem,4vw,8rem);
    line-height:0.95;
    white-space:pre-line;
    margin:0;
    color:white;
    letter-spacing:.02em;
    position:relative;
    z-index:5;
  }

  p{
    margin-top:2rem;
    font-size:1.2rem;
    max-width:480px;
    opacity:.9;
    position:relative;
    z-index:5;
    color:rgba(244, 244, 244, 0.733);
  }

  @media (max-width:800px){
    .slide{
      padding:6rem 2rem;
      align-items:flex-end;
    }

    h2{
      font-size:clamp(3rem,15vw,5rem);
    }

    p{
      font-size:1rem;
    }
  }

  .progress-nav{
    position:absolute;
    left:2rem;
    right:2rem;
    bottom:2rem;
    z-index:4;
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:.8rem;
  }

  .segment-line{
    position:relative;
    height:2px;
    background:rgba(255,255,255,0.16);
    overflow:hidden;
    margin-bottom:.7rem;
  }

  .segment-fill{
    position:absolute;
    left:0;
    top:0;
    bottom:0;
    width:0%;
    background:white;
    box-shadow:0 0 12px rgba(255,255,255,0.2);
    transition:width 80ms linear;
  }

  .segment-label{
    font-size:.9rem;
    opacity:.85;
  }
</style> 