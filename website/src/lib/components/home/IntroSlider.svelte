<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  export let main  = "Chaque projet,";
  export let muted = "une signature.";

  // split into words for staggered reveal
  const mainWords  = main.split(" ");
  const mutedWords = muted.split(" ");

  let pEl;
  let revealed = false;
  let obs;

  onMount(() => {
    if (!browser || !pEl) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      revealed = true;
      return;
    }
    obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { revealed = true; obs.disconnect(); } },
      { rootMargin: "0px 0px -10% 0px", threshold: 0 }
    );
    obs.observe(pEl);
    return () => obs?.disconnect();
  });
</script>

<section class="story-slider-intro">
  <div class="story-slider-intro__text-wrap">
    <div class="story-slider-intro__card">
      <p class="story-slider-intro__text" class:is-revealed={revealed} bind:this={pEl}>
        <!-- main words -->
        {#each mainWords as word, w}
          {#if w > 0}<span class="ssi__space"> </span>{/if}
          <span class="ssi__word" style="--w:{w}">{word}</span>
        {/each}
        <!-- muted words (display:block gives the line break) -->
        <span class="story-slider-intro__muted-line">
          {#each mutedWords as word, w}
            {#if w > 0}<span class="ssi__space"> </span>{/if}
            <span class="ssi__word ssi__word--muted" style="--w:{mainWords.length + w}">{word}</span>
          {/each}
        </span>
      </p>
    </div>
  </div>
</section>

<style>
  .story-slider-intro {
    position: relative;
    z-index: 3;
    background: #000;
    padding: 0;
    width: 100%;
  }

  .story-slider-intro__text-wrap {
    width: min(1500px, 100%);
    margin: 0 auto;
    display: flex;
    justify-content: flex-start;
    padding:
      clamp(5rem, 10vw, 10rem)
      clamp(1.5rem, 3vw, 3rem)
      clamp(5rem, 10vw, 10rem);
    align-self: start;
    min-width: 0;
  }

  .story-slider-intro__card {
    width: min(640px, 100%);
    padding: 0;
    min-width: 0;
  }

  .story-slider-intro__text {
    margin: 0;
    max-width: 22ch;
    font-family: "Inter", sans-serif;
    font-weight: 300;
    font-size: clamp(1.4rem, 2.5vw, 2.8rem);
    line-height: 1.1;
    letter-spacing: -0.015em;
    text-align: left;
  }

  .story-slider-intro__text::before {
    content: "";
    display: block;
    width: 24px;
    height: 1px;
    background: #5768ff;
    margin-bottom: 1.2rem;
  }

  /* muted-line wraps the second line — display:block creates the break */
  .story-slider-intro__muted-line {
    display: block;
  }

  .ssi__space {
    display: inline;
  }

  /* each word starts hidden and slides up into place */
  .ssi__word {
    display: inline-block;
    color: #f5f1e8;
    opacity: 0;
    filter: blur(9px);
    transform: translateY(0.3em);
    transition:
      opacity  0.52s ease,
      filter 0.7s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.62s cubic-bezier(0.22, 0.61, 0.36, 1);
    transition-delay: calc(var(--w, 0) * 0.07s);
  }

  .ssi__word--muted {
    color: rgba(245, 241, 232, 0.35);
  }

  /* reveal: all words animate to final state */
  .story-slider-intro__text.is-revealed .ssi__word {
    opacity: 1;
    filter: blur(0);
    transform: none;
  }

  .story-slider-intro__text.is-revealed .ssi__word--muted {
    opacity: 1; /* color already handles the muted look */
  }

  @media (prefers-reduced-motion: reduce) {
    .ssi__word {
      transition: none;
      opacity: 1 !important;
      transform: none !important;
    }
  }

  @media (max-width: 900px) {
    .story-slider-intro__text-wrap {
      width: min(100%, 760px);
      margin: 0 auto;
      display: flex;
      justify-content: flex-start;
      padding: 4rem 1.25rem 4rem;
    }

    .story-slider-intro__card {
      width: min(90vw, 560px);
      padding: 0;
    }

    .story-slider-intro__text {
      font-size: clamp(1.3rem, 5.5vw, 2.2rem);
      line-height: 1.12;
      max-width: 18ch;
    }
  }

  @media (max-width: 640px) {
    .story-slider-intro__text-wrap {
      padding: 3.5rem 1.1rem 3.5rem;
    }

    .story-slider-intro__card {
      width: min(88vw, 480px);
    }

    .story-slider-intro__text {
      font-size: clamp(1.2rem, 6vw, 2rem);
    }
  }

  @media (max-width: 420px) {
    .story-slider-intro__card {
      width: min(90vw, 18rem);
    }

    .story-slider-intro__text {
      font-size: clamp(1.1rem, 5.8vw, 1.6rem);
    }
  }

</style>
