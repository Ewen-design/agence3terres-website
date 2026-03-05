<script>
  import { createEventDispatcher } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  export let selected;
  export let items = [];

  const dispatch = createEventDispatcher();

  let currentIndex = 0;
  let direction = 1;

  $: if (selected && items.length) {
    currentIndex = items.findIndex((item) => item === selected);
  }

  function close() {
    dispatch("close");
  }

  function prev() {
    if (currentIndex > 0) {
      direction = -1.5;
      selected = items[currentIndex - 1];
    }
  }

  function next() {
    if (currentIndex < items.length - 1) {
      direction = 1.5;
      selected = items[currentIndex + 1];
    }
  }
</script>

{#if selected}
<div class="overlay" transition:fade>
  <div class="panel" in:fly={{ x: 200, duration: 500 }} out:fly={{ x: 200, duration: 400 }}>
    
    <button class="close" data-cursor="close" on:click={close}>✕</button>

    {#if currentIndex > 0}
      <button 
        class="arrow left" 
        on:click={prev}
        transition:fade>
        ←
      </button>
    {/if}

    {#if currentIndex < items.length - 1}
      <button 
        class="arrow right" 
        on:click={next}
        transition:fade>
        →
      </button>
    {/if}

    {#key selected}
      <div
        class="card animated"
        in:fly|local={{ x: direction * 1200, duration: 900, opacity: 1, easing: cubicOut }}
        out:fly|local={{ x: direction * -1200, duration: 900, opacity: 1, easing: cubicOut }}
      >
        <!-- 🔥 PARALLAX BACKGROUND -->
        <div 
          class="background parallax-bg"
          style="background-image: url({selected.image || '/images/parfum.jpg'})"
          in:fly|local={{ 
            x: direction * -700,   /* moitié de la card = effet profondeur */
            duration: 900,
            opacity: 1,
            easing: cubicOut
          }}
          out:fly|local={{ 
            x: direction * 700,
            duration: 900,
            opacity: 1,
            easing: cubicOut
          }}>
        </div>

        <div class="info">
          <span class="date">{selected.date}</span>
          <h2>{selected.title}</h2>
          <p>{selected.desc}</p>
        </div>
      </div>
    {/key}

  </div>
</div>
{/if}



<style>
.overlay {
  position: fixed;
  inset: 0;
  backdrop-filter: blur(20px);
  background: rgba(0,0,0,0.4);
  z-index: 1000;
}

.panel {
  position: fixed;
  inset: 0;
  padding: 5vw;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close {
  position: absolute;
  top: 30px;
  right: 40px;
  font-size: 1.4rem;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  border: none;
  color: white;
  padding: 12px 16px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.4s ease;
}

.close:hover {
  background: white;
  color: black;
  transform: scale(1.1);
}

.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.4rem;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 3px;
  box-shadow:
    0 8px 10px rgba(0,0,0,0.06),
    inset 0 0 0 0px rgba(255,255,255,0.4);
  border: none;
  color: white;
  padding: 14px 18px;
  cursor: pointer;
  transition: all 0.4s ease;
  z-index: 1000
}

.arrow:hover {
  background: white;
  color: black;
  transform: translateY(-50%) scale(1.1);
}

.arrow.left {
  left: 40px;
}

.arrow.right {
  right: 40px;
}

.card.animated {
  position: absolute;
  width: 80%;
  height: 80vh;
}

.card {
  position: relative;
  width: 80%;
  height: 80vh;
  background: #111;
  border-radius: 3px;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

/* 🔥 PARALLAX SETTINGS */
.parallax-bg {
  will-change: transform;
  transform: scale(1.15); /* zoom léger pour éviter les bords visibles */
}

.background {
  position: absolute;
  inset: -5%; /* déborde pour éviter les blancs pendant le move */
  background-size: cover;
  background-position: right center;
}

.background::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to left,
    rgba(17,17,17,0) 30%,
    rgba(17,17,17,0.95) 55%,
    rgba(17,17,17,1) 75%,
    #111 95%
  );
}

.info {
  position: relative;
  z-index: 2;
  color: white;
  padding: 4vw;
  max-width: 45%;
}

.info h2 {
  font-family: "Aboreto", serif;
  font-size: 2.6rem;
  margin: 10px 0 20px;
  letter-spacing: 1px;
}

.info p {
  line-height: 1.6;
  opacity: 0.9;
}

.date {
  font-size: 0.9rem;
  opacity: 0.7;
  letter-spacing: 1px;
}
</style>