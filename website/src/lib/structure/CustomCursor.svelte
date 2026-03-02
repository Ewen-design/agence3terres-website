<script>
  import { onMount, onDestroy } from "svelte";

  let cursor;
  let x = 0;
  let y = 0;
  let scale = 1;
  let text = "";
  let mode = "dot"; // dot | button | slider
  let isActive = false;
  let isDesktop = false;

  let previewImage = "";
  let direction = "next";

  let currentSliderEl = null;
  let isLeaving = false;

  function updateTransform() {
    if (!cursor) return;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }

  function move(e) {
    x = e.clientX;
    y = e.clientY;
    updateTransform();
  }

  function handleHover(e) {
    const el = e.target.closest("[data-cursor]");

    // 🔥 SORTIE PROPRE DU SLIDER
    if (!el) {
      if (mode === "slider" && !isLeaving) {
        isLeaving = true;

        // on laisse la transition CSS faire l'animation inverse
        setTimeout(() => {
          mode = "dot";
          previewImage = "";
          currentSliderEl = null;
          isLeaving = false;
          updateTransform();
        }, 350); // durée identique à la transition CSS
      } else if (mode !== "slider") {
        scale = 1;
        text = "";
        mode = "dot";
        previewImage = "";
        currentSliderEl = null;
      }

      return;
    }

    const type = el.dataset.cursor;

    if (type === "view") {
      text = "Voir plus";
      mode = "button";
      scale = 1;
      currentSliderEl = null;
    }

    else if (type === "close") {
      text = "Fermer";
      mode = "button";
      scale = 1;
      currentSliderEl = null;
    }

    else if (type === "button") {
      text = "Voir";
      mode = "button";
      scale = 1;
      currentSliderEl = null;
    }

    else if (type === "next" || type === "prev") {
      mode = "slider";
      previewImage = el.dataset.image;
      direction = type;
      scale = 1;
      currentSliderEl = el;
    }

    updateTransform();
  }

  function down() {
    isActive = true;

    if (mode !== "slider") {
      scale = 1.1;
      updateTransform();
    }
  }

  function up() {
    isActive = false;
    scale = 1;
    updateTransform();
  }

  // 🔥 refresh automatique après changement d’index
  function refreshSliderPreview() {
    if (!currentSliderEl) return;

    requestAnimationFrame(() => {
      previewImage = currentSliderEl.dataset.image;
      direction = currentSliderEl.dataset.cursor;
    });
  }

  onMount(() => {
    isDesktop = window.matchMedia("(pointer: fine)").matches;
    if (!isDesktop) return;

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", handleHover);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);

    window.addEventListener("slider-index-changed", refreshSliderPreview);
  });

  onDestroy(() => {
    if (!isDesktop) return;

    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseover", handleHover);
    window.removeEventListener("mousedown", down);
    window.removeEventListener("mouseup", up);

    window.removeEventListener("slider-index-changed", refreshSliderPreview);
  });
</script>

{#if isDesktop}
  <div
    bind:this={cursor}
    class="cursor"
    class:button={mode === "button"}
    class:slider={mode === "slider"}
    class:active={isActive}
  >
    {#if mode === "slider"}
      <div class="preview">
        <img src={previewImage} alt="" />
        <div class="arrow {direction}"></div>
      </div>
    {:else}
      <span>{text}</span>
    {/if}
  </div>
{/if}

<style>
:global(body) {
  cursor: none;
}

.cursor {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9999;

  width: 26px;
  height: 26px;
  border-radius: 50%;

  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  box-shadow:
    0 8px 10px rgba(0, 0, 0, 0.06),
    inset 0 0 0 1px rgba(255, 255, 255, 0.3);

  display: flex;
  align-items: center;
  justify-content: center;

  color: white;
  font-size: 0.75rem;
  white-space: nowrap;

  transition:
    width 0.35s cubic-bezier(.22,1,.36,1),
    height 0.35s cubic-bezier(.22,1,.36,1),
    border-radius 0.35s cubic-bezier(.22,1,.36,1),
    background 0.35s ease,
    box-shadow 0.35s ease;
}

.cursor.button {
  width: auto;
  height: 42px;
  padding: 0 18px;
  border-radius: 3px;
  backdrop-filter: blur(10px);
  background: rgba(255,255,255,0.15);
}

.cursor.slider {
  width: 140px;
  height: 140px;
  border-radius: 3px;
  padding: 0;
  overflow: hidden;
  background: none;
  backdrop-filter: none;
  box-shadow: none;
}

.preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.8);
}

.arrow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 42px;
  height: 2px;
  background: white;
  transform: translate(-50%, -50%);
}

.arrow::after {
  content: "";
  position: absolute;
  right: -1px;
  top: 50%;
  width: 12px;
  height: 12px;
  border-top: 2px solid white;
  border-right: 2px solid white;
  transform: translateY(-50%) rotate(45deg);
}

.arrow.prev {
  transform: translate(-50%, -50%) rotate(180deg);
}
</style>
