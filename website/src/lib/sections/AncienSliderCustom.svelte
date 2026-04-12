<script>
  import { tick } from "svelte";

  let index = 0;
  let animating = false;
  let slider;
  let transitionLayer;

  let layerImage = null;
  let layerStyle = "";

  const images = [
    "images/telephone_main.webp",
    "images/telephone_parfum.webp",
    "images/telephone2.webp",
    "images/appareil_photo.webp",
    "images/parfum_ordinateur.webp",
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

<div class="slider" bind:this={slider} role="group" aria-label="Diaporama">
  <!-- zones interactives invisibles -->
  <button
    type="button"
    class="zone left"
    data-cursor="prev"
    data-image={images[prevIndex]}
    aria-label="Image précédente"
    on:click={handleClick}
  ></button>

  <button
    type="button"
    class="zone right"
    data-cursor="next"
    data-image={images[nextIndex]}
    aria-label="Image suivante"
    on:click={handleClick}
  ></button>

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
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
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