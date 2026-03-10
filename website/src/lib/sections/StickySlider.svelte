<script>
import { onMount } from "svelte";

const slides = [
{
number: "01",
title: "AI Strategy\n& Execution",
description: "Driving AI transformation for products, platforms, and people.",
image: "images/photo.webp"
},
{
number: "02",
title: "Product\nInnovation",
description: "Launching flagship digital experiences—used daily by billions.",
image:
"https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2000&q=80"
},
{
number: "03",
title: "Brand\nExperiences",
description: "Creating elegant systems, campaigns, and immersive brand worlds.",
image: "images/photo.webp"
}
];

let sections = [];
let activeIndex = 0;

onMount(() => {
const observer = new IntersectionObserver(
(entries) => {
entries.forEach((entry) => {
if (entry.isIntersecting) {
activeIndex = Number(entry.target.dataset.index);
}
});
},
{ threshold: 0.6 }
);

sections.forEach((section) => observer.observe(section));
});
</script>

<section class="slider">

<div class="sticky">

<div class="backgrounds">
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
    background:#050b14; /* très important */
    isolation:isolate;  /* très important */
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
    background:#050b14; /* sécurité supplémentaire */
  }

  .bg{
    position:absolute;
    inset:0;
    opacity:0;
    transition:opacity 900ms ease;
    z-index:1;
    background:#050b14; /* empêche de voir derrière pendant le fade */
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

  .overlay{
    position:absolute;
    inset:0;
    background:
      linear-gradient(
        to right,
        rgba(0,0,0,0.72) 0%,
        rgba(0,0,0,0.42) 35%,
        rgba(0,0,0,0.22) 60%,
        rgba(0,0,0,0.38) 100%
      );
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
    color:#9b9b9b;
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
</style>