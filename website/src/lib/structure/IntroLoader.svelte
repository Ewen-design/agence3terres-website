<script>
  import { onMount } from "svelte";

  let visible = true;
  let hide = false;

  onMount(() => {
    // déclenche la disparition après 2s
    setTimeout(() => {
      hide = true;
    }, 2000);

    // supprime complètement le composant après le fade out
    setTimeout(() => {
      visible = false;
    }, 2600);
  });
</script>

{#if visible}
<div class="loader {hide ? 'hide' : ''}">
  <img src="/images/logo3.png" alt="Logo" />
</div>
{/if}

<style>
  .loader {
    position: fixed;
    inset: 0;
    background: #000; /* écran noir immédiat */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  img {
    width: 360px; /* légèrement plus grand */
    opacity: 0;
    animation:
      logoFade 1.4s ease forwards,
      logoZoom 2.4s cubic-bezier(.22,.61,.36,1) forwards;
  }

  /* disparition du loader */
  .hide {
    animation: fadeOut 0.8s ease forwards;
  }

  @keyframes fadeOut {
    to { opacity: 0; }
  }

  @keyframes logoFade {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes logoZoom {
    from { transform: scale(0.92); }
    to { transform: scale(1.1); }
  }
</style>
