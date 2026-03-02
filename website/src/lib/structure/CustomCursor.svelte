<script>
  import { onMount, onDestroy } from "svelte";

  let cursor;
  let x = 0;
  let y = 0;
  let scale = 1;
  let text = "";
  let mode = "dot"; // dot | button
  let isActive = false;
  let isDesktop = false;

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
    // ✅ Desktop uniquement
    isDesktop = window.matchMedia("(pointer: fine)").matches;
    if (!isDesktop) return;

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", handleHover);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
  });

  onDestroy(() => {
    if (!isDesktop) return;

    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseover", handleHover);
    window.removeEventListener("mousedown", down);
    window.removeEventListener("mouseup", up);
  });
</script>

{#if isDesktop}
  <div
    bind:this={cursor}
    class="cursor"
    class:button={mode === "button"}
    class:active={isActive}
  >
    <span>{text}</span>
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

  /* ✅ Glass identique navbar */
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

/* Mode bouton */
.cursor.button {
  width: auto;
  height: 42px;
  padding: 0 18px;
  border-radius: 3px;

  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  background: rgba(255,255,255,0.15);
  border: 0px solid rgba(255,255,255,0.3);
}

/* Texte */
.cursor span {
  pointer-events: none;
}

/* Click */
.cursor.active {
  transform: scale(1.08);
  box-shadow:
    0 8px 14px rgba(0,0,0,0.1),
    inset 0 0 0 1px rgba(255,255,255,0.4);
}
</style>