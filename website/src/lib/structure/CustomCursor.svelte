<script>
  import { onMount, onDestroy } from "svelte";

  let cursor;
  let x = 0;
  let y = 0;
  let scale = 1;
  let text = "";
  let mode = "dot"; // dot | button
  let isActive = false;

  function updateTransform() {
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }

  function move(e) {
    x = e.clientX;
    y = e.clientY;
    updateTransform();
  }

  function handleHover(e) {
    const el = e.target.closest("[data-cursor]");
    if (!el) {
      scale = 1;
      text = "";
      mode = "dot";
      updateTransform();
      return;
    }

    const type = el.dataset.cursor;

    if (type === "view") {
      text = "Voir plus";
      mode = "button";
      scale = 1;
    }

    else if (type === "close") {
      text = "Fermer";
      mode = "button";
      scale = 1;
    }

    else if (type === "button") {
      text = "Voir";
      mode = "button";
      scale = 1;
    }

    updateTransform();
  }

  function down() {
    isActive = true;
    scale = 1.1;
    updateTransform();
  }

  function up() {
    isActive = false;
    scale = 1;
    updateTransform();
  }

  onMount(() => {
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", handleHover);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
  });

  onDestroy(() => {
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseover", handleHover);
    window.removeEventListener("mousedown", down);
    window.removeEventListener("mouseup", up);
  });
</script>

<div
  bind:this={cursor}
  class="cursor"
  class:button={mode === "button"}
  class:active={isActive}
>
  <span>{text}</span>
</div>

<style>
:global(body) { cursor: none; }

.cursor {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9999;

  width: 26px;
  height: 26px;
  border-radius: 50%;

  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

    box-shadow:
      0 4px 20px rgba(0,0,0,0.25),
      inset 0 0 0 1px rgba(255,255,255,0.8);

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

/* ✨ MODE BOUTON (header style) */
.cursor.button {
  width: auto;
  height: 42px;
  padding: 0 18px;
  border-radius: 12px;

  backdrop-filter: blur(14px);
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.35);

  box-shadow: 0 0 24px rgba(255,255,255,0.25);
}

/* Texte */
.cursor span {
  pointer-events: none;
}

/* 🔥 CLIC */
.cursor.active {
  transform: scale(1.08);
  box-shadow: 0 0 35px rgba(255,255,255,0.45);
}
</style>
