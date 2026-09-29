<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  // ───────────────────────────────────────────────────────────────────────────
  //  HomeLead — une phrase d'accroche seule, centrée, entre deux blocs.
  //
  //  Elle vivait dans `Hero.svelte` (la « after-section ») jusqu'au 2026-09-01.
  //  Sortie de là pour qu'un autre bloc puisse se glisser entre le cadre du hero
  //  et elle. Le texte est découpé en mots : chacun arrive séparément, comme
  //  dans l'intro du site.
  // ───────────────────────────────────────────────────────────────────────────

  //  `d: 1` = mot à 50 % d'encre : la première phrase reste pleine, la suite
  //  s'efface — dans le même titre et à la même taille. La ponctuation reste
  //  collée à son mot, sinon les blancs se dédoublent à la césure.
  export let words = [
    {t: "Tout"}, {t: "ce"}, {t: "qu'un"}, {t: "projet"}, {t: "demande."},
    {t: "L'identité,", d: 1}, {t: "le", d: 1}, {t: "digital", d: 1}, {t: "et", d: 1},
    {t: "l'image,", d: 1}, {t: "tenus", d: 1}, {t: "par", d: 1}, {t: "la", d: 1},
    {t: "même", d: 1}, {t: "équipe.", d: 1}
  ];

  let h2El;
  let revealed = false;
  let observer;

  onMount(() => {
    if (!browser) return;

    if (!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches && h2El) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) { revealed = true; observer.disconnect(); }
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0 }
      );
      observer.observe(h2El);
    } else {
      revealed = true;
    }

    return () => observer?.disconnect();
  });
</script>

<section class="lead-section">
  <div class="lead-grid">
    <h2
      class="lead-title"
      bind:this={h2El}
      class:is-revealed={revealed}
    >{#each words as w, i}<span class="lead-word" class:is-dim={w.d} style="--i:{i}"
        >{w.t}</span>{" "}{/each}</h2>
  </div>
</section>

<style>
  /* Peu d'air en dessous : le paquet de cartes arrive juste derrière, et un
     grand vide entre les deux donnait l'impression d'un défilement mort. Peu
     d'air au-dessus non plus depuis que le bloc au mockup s'est glissé entre le
     hero et cette phrase — les 18vh d'origine creusaient un trou. */
  .lead-section {
    position: relative;
    z-index: 3;
    background: var(--bg-deep, #000);
    padding: 11vh 0 8vh;
  }

  .lead-grid {
    width: min(1400px, 92%);
    margin: 0 auto;
  }

  .lead-title {
    margin: 0 auto;
    width: 45rem;
    max-width: 100%;
    font-family: var(--site-font);
    /* Échelle et rythme repris de la référence : 36 px au repos, 28 px sous
       991 px, 22 px sous 767 px, en medium et resserré. */
    font-weight: 500;
    font-size: clamp(1.375rem, 2.9vw, 2.25rem);
    line-height: 1.2;
    letter-spacing: -0.01em;
    text-align: center;
    color: #f4efe6;
    text-wrap: balance;
  }

  /* Arrivée mot par mot, reprise de l'intro du site : chaque mot se dépose en
     flou et traverse le violet profond puis l'indigo de la charte avant de
     rejoindre sa couleur définitive. */
  .lead-word {
    display: inline-block;
    opacity: 0;
    --lead-final: #f4efe6;
    will-change: opacity, filter, transform;
  }

  .lead-word.is-dim {
    --lead-final: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.5);
  }

  @keyframes leadIn {
    0% {
      opacity: 0;
      filter: blur(12px);
      transform: translateY(0.24em);
      color: #17052f;
    }
    38% {
      color: #5768ff;
    }
    100% {
      opacity: 1;
      filter: blur(0);
      transform: translateY(0);
      color: var(--lead-final);
    }
  }

  .lead-title.is-revealed .lead-word {
    animation: leadIn 0.9s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    animation-delay: calc(var(--i) * 38ms);
  }

  @media (max-width: 900px) {
    .lead-section {
      padding: 9vh 0 8vh;
    }
  }

  @media (max-width: 640px) {
    .lead-title {
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .lead-word {
      opacity: 1;
      color: var(--lead-final);
    }

    .lead-title.is-revealed .lead-word {
      animation: none;
    }
  }
</style>
