<script>
  import { reveal } from "$lib/actions/reveal.js";

  // Grand titre (pleine intensité) + un seul paragraphe en dessous.
  export let lead = "";
  export let text = "";
</script>

<section class="sl">
  <div class="sl-inner">
    <h2 class="sl-head" use:reveal>{lead}</h2>
    {#if text}
      <p class="sl-text" use:reveal={{ delay: 90 }}>{text}</p>
    {/if}
  </div>
</section>

<style>
  .sl {
    background: transparent;
    padding: clamp(4rem, 8vw, 8rem) 0 clamp(2rem, 4vw, 3.5rem);
  }

  .sl-inner {
    width: min(1400px, 92%);
    margin: 0 auto;
  }

  .sl-head {
    margin: 0;
    max-width: 16ch;
    font-family: "Inter", sans-serif;
    font-weight: 600;
    font-size: clamp(2.8rem, 7vw, 6.5rem);
    line-height: 0.94;
    letter-spacing: -0.04em;
    color: var(--project-surface-ink, #f4efe6);
    text-wrap: balance;
    transition:
      opacity 0.6s ease,
      filter 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      color var(--project-theme-transition, 920ms cubic-bezier(0.16, 1, 0.3, 1));
    transition-delay: var(--reveal-delay, 0ms);
  }

  .sl-text {
    margin: clamp(1.6rem, 2.8vw, 2.4rem) 0 0;
    max-width: 58ch;
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: clamp(1.05rem, 1.35vw, 1.35rem);
    line-height: 1.5;
    color: var(--project-surface-muted, rgba(244, 239, 230, 0.7));
    text-wrap: pretty;
    transition:
      opacity 0.6s ease,
      filter 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      color var(--project-theme-transition, 920ms cubic-bezier(0.16, 1, 0.3, 1));
    transition-delay: var(--reveal-delay, 0ms);
  }
</style>
