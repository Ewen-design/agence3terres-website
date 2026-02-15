<script>
  import { createEventDispatcher } from "svelte";
  import { fade, fly } from "svelte/transition";

  export let selected;
  const dispatch = createEventDispatcher();

  function close() {
    dispatch("close");
  }
</script>

{#if selected}
<div class="overlay" transition:fade>
  <div class="panel" in:fly={{ x: 200, duration: 500 }} out:fly={{ x: 200, duration: 400 }}>
    
    <button class="close" data-cursor="close" on:click={close}>✕</button>

    <div class="content">
      <div class="image">
        <!-- 🔥 IMAGE DYNAMIQUE -->
        <img src={selected.image || "/images/parfum.jpg"} alt="" />
      </div>

      <div class="info">
        <span class="date">{selected.date}</span>
        <h2>{selected.title}</h2>
        <p>{selected.desc}</p>
      </div>
    </div>

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
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.5s ease, color 0.5s ease, transform 0.5s ease, opacity 0.5s ease;
}

.close:hover {
  background: white;
  color: black;
  transform: scale(1.15);
}

.content {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 4vw;
  width: 100%;
  height: 100%;
  align-items: center;
}

.image img {
  width: 100%;
  height: 80vh;
  object-fit: cover;
}

.info {
  color: white;
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
