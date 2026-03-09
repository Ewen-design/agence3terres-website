<script>
  import { tick } from "svelte";

  let index = 0;
  let animating = false;
  let slider;
  let transitionLayer;

  let layerImage = null;
  let layerStyle = "";

  const images = [
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2070",
    "https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=2070",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070"
  ];

  $: nextIndex = (index + 1) % images.length;
  $: prevIndex = (index - 1 + images.length) % images.length;

  function handleClick(e) {
    if (animating) return;

    const zone = e.target.closest("[data-cursor]");
    if (!zone) return;

    const direction = zone.dataset.cursor;
    const targetIndex =
      direction === "prev" ? prevIndex : nextIndex;

    const rect = slider.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    animating = true;
    layerImage = images[targetIndex];

    layerStyle = `
      left:${x - 70}px;
      top:${y - 70}px;
      width:140px;
      height:140px;
      border-radius:3px;
    `;

    tick().then(() => {
      transitionLayer.getBoundingClientRect();

      layerStyle = `
        left:0;
        top:0;
        width:100%;
        height:100%;
        border-radius:0;
        transition: all 0.85s cubic-bezier(.22,1,.36,1);
      `;

      transitionLayer.addEventListener("transitionend", () => {
        index = targetIndex;
        window.dispatchEvent(new Event("slider-index-changed"));
        layerImage = null;
        animating = false;
      }, { once: true });
    });
  }

 

</script>

<div class="slider" bind:this={slider} on:click={handleClick}>
  <!-- zones interactives invisibles -->
  <div
    class="zone left"
    data-cursor="prev"
    data-image={images[prevIndex]}
  ></div>

  <div
    class="zone right"
    data-cursor="next"
    data-image={images[nextIndex]}
  ></div>

  <img src={images[index]} alt="" draggable="false" />

  {#if layerImage}
    <div
      class="transition-layer"
      bind:this={transitionLayer}
      style={layerStyle}
    >
      <img src={layerImage} alt="" draggable="false" />
    </div>
  {/if}
</div>

<style>
.slider {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.slider img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  user-select: none;
}

.zone {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  z-index: 5;
}

.zone.left { left: 0; }
.zone.right { right: 0; }

.transition-layer {
  position: absolute;
  z-index: 20;
  overflow: hidden;
}

.transition-layer img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>