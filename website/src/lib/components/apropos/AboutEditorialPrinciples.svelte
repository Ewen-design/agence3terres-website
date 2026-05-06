<script>
  import { onMount } from "svelte";

  const items = [
    {
      title: "Direction claire",
      kicker: "Cap",
      text: "Nous posons un cap lisible des la premiere intention, pour que chaque decision serve une vision plus juste.",
      image: "/images/telephone2.webp",
      alt: "Portrait editorial agence 3 terres"
    },
    {
      title: "Exigence visuelle",
      kicker: "Regard",
      text: "Le detail, la matiere et le rythme de composition construisent une presence percutante sans surenchere.",
      image: "/images/creation_logo_desktop.webp",
      alt: "Composition visuelle premium"
    },
    {
      title: "Recit coherent",
      kicker: "Narration",
      text: "Chaque projet est pense comme un ensemble coherent, du positionnement jusqu'aux derniers points de contact.",
      image: "/images/carte_visite_desktop2.webp",
      alt: "Direction artistique et edition"
    },
    {
      title: "Production soignee",
      kicker: "Execution",
      text: "Nous accordons autant de soin a la fabrication qu'a l'idee, pour obtenir une presence nette et durable.",
      image: "/images/appareil_photo.webp",
      alt: "Processus de creation graphique"
    },
    {
      title: "Dialogue continu",
      kicker: "Relation",
      text: "Le travail avance dans un dialogue precise, fluide et exigeant, afin que chaque arbitrage reste pertinent.",
      image: "/images/telephone2_parfum.webp",
      alt: "Echange et suivi de projet"
    },
    {
      title: "Presence durable",
      kicker: "Impact",
      text: "Nous cherchons des systemes de marque et des experiences qui restent desirables, lisibles et memorables.",
      image: "/images/telephone3.webp",
      alt: "Image de marque durable"
    }
  ];

  let activeIndex = 0;
  let shellEl;
  let previewEl;
  let mobileTrackEl;
  let rowEls = [];
  let mobileCardEls = [];
  let previewTop = 0;
  let mobileScrollFrame = 0;
  let mobileInitFrame = 0;

  function updatePreviewPosition() {
    const row = rowEls[activeIndex];
    if (!shellEl || !previewEl || !row) return;

    const shellRect = shellEl.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const rowTop = rowRect.top - shellRect.top;
    const rawTop = rowTop + 14;
    const maxTop = Math.max(0, shellEl.offsetHeight - previewEl.offsetHeight);

    previewTop = Math.max(0, Math.min(rawTop, maxTop));
  }

  $: activeIndex, updatePreviewPosition();

  function updateMobileActiveCard() {
    if (!mobileTrackEl || !mobileCardEls.length) return;

    const trackRect = mobileTrackEl.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width * 0.5;
    let nextIndex = activeIndex;
    let nearestDistance = Number.POSITIVE_INFINITY;

    mobileCardEls.forEach((card, index) => {
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const center = rect.left + rect.width * 0.5;
      const distance = Math.abs(center - trackCenter);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nextIndex = index;
      }
    });

    activeIndex = nextIndex;
  }

  function handleMobileTrackScroll() {
    if (mobileScrollFrame) cancelAnimationFrame(mobileScrollFrame);
    mobileScrollFrame = requestAnimationFrame(updateMobileActiveCard);
  }

  onMount(() => {
    const handleResize = () => {
      updatePreviewPosition();
      if (mobileInitFrame) cancelAnimationFrame(mobileInitFrame);
      mobileInitFrame = requestAnimationFrame(updateMobileActiveCard);
    };
    window.addEventListener("resize", handleResize, { passive: true });
    mobileInitFrame = requestAnimationFrame(() => {
      updatePreviewPosition();
      updateMobileActiveCard();
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      if (mobileScrollFrame) cancelAnimationFrame(mobileScrollFrame);
      if (mobileInitFrame) cancelAnimationFrame(mobileInitFrame);
    };
  });
</script>

<section class="about-editorial-principles">
  <div class="principles-shell principles-shell-desktop" bind:this={shellEl}>
    <div class="principles-list" role="tablist" aria-label="Principes Agence 3 Terres">
      {#each items as item, index}
        <button
          bind:this={rowEls[index]}
          class="principle-row"
          class:is-active={activeIndex === index}
          type="button"
          role="tab"
          aria-selected={activeIndex === index}
          on:mouseenter={() => (activeIndex = index)}
          on:focus={() => (activeIndex = index)}
          on:click={() => (activeIndex = index)}
        >
          <span class="principle-title-lane">
            <span class="principle-title">{item.title}</span>
          </span>
        </button>
      {/each}
    </div>

    <div
      class="principles-preview"
      aria-live="polite"
      bind:this={previewEl}
      style={`transform: translate3d(0, ${previewTop}px, 0);`}
    >
      {#key activeIndex}
        <div class="preview-panel is-active">
          <div class="preview-copy">
            <p class="preview-text">{items[activeIndex].text}</p>
          </div>

          <div class="preview-media">
            <img src={items[activeIndex].image} alt={items[activeIndex].alt} loading="lazy" />
          </div>
        </div>
      {/key}
    </div>
  </div>

  <div class="principles-mobile" aria-label="Principes Agence 3 Terres">
    <div class="principles-mobile-track" bind:this={mobileTrackEl} on:scroll={handleMobileTrackScroll}>
      {#each items as item, index}
        <article
          bind:this={mobileCardEls[index]}
          class="principle-mobile-card"
          class:is-active={activeIndex === index}
          on:focusin={() => (activeIndex = index)}
        >
          <div class="principle-mobile-line"></div>
          <h3 class="principle-mobile-title">{item.title}</h3>

          <div class="principle-mobile-preview">
            <div class="principle-mobile-copy-wipe">
              <p class="principle-mobile-text">{item.text}</p>
            </div>

            <div class="principle-mobile-media-wipe">
              <div class="principle-mobile-media">
                <img
                  src={item.image}
                  alt={item.alt}
                  loading="eager"
                  decoding="async"
                  fetchpriority={index < 2 ? "high" : "auto"}
                />
              </div>
            </div>
          </div>
        </article>
      {/each}
    </div>
  </div>
</section>

<style>
  .about-editorial-principles {
    position: relative;
    background: #000;
    color: #f5f1e8;
    padding: clamp(2.4rem, 4vw, 4.2rem) 0;
    overflow: clip;
  }

  .principles-shell {
    position: relative;
    min-height: clamp(40rem, 56vw, 50rem);
    --preview-width: min(30vw, 30rem);
    --preview-gap: clamp(1.2rem, 4vw, 2.8rem);
    --title-lane-width: min(56vw, 42rem);
    --title-offset: clamp(1rem, 4vw, 3.8rem);
    --title-padding-end: clamp(0.55rem, 1.35vw, 1rem);
  }

  .principles-list {
    position: relative;
    z-index: 1;
  }

  .principle-row {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: clamp(1.25rem, 1.9vw, 1.6rem) 0;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
    position: relative;
  }

  .principle-row::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: calc(
      min(
        calc(100% - var(--preview-width) - var(--preview-gap)),
        var(--title-lane-width)
      ) + var(--title-offset) - var(--title-padding-end)
    );
    height: 1px;
    background: rgba(255, 255, 255, 0.12);
    transition:
      width 0.45s cubic-bezier(.22, 1, .36, 1),
      background-color 0.45s ease;
  }

  .principle-row.is-active::before,
  .principle-row:hover::before,
  .principle-row:focus-visible::before {
    width: 100%;
  }

  .principle-title-lane {
    width: min(
      calc(100% - var(--preview-width) - var(--preview-gap)),
      var(--title-lane-width)
    );
    display: flex;
    justify-content: flex-end;
    margin-left: var(--title-offset);
    padding: 0 var(--title-padding-end) 0 0;
  }

  .principle-title {
    display: inline-block;
    font-family: "Clash Display", sans-serif;
    font-weight: 300;
    font-size: clamp(1.95rem, 4.35vw, 4.35rem);
    line-height: 0.88;
    letter-spacing: -0.045em;
    color: rgba(255, 255, 255, 0.22);
    width: 100%;
    text-align: right;
    transition:
      color 0.48s ease,
      opacity 0.48s ease;
  }

  .principle-row.is-active .principle-title,
  .principle-row:hover .principle-title,
  .principle-row:focus-visible .principle-title {
    color: #f5f1e8;
  }

  .principles-preview {
    position: absolute;
    top: 0;
    right: 0;
    width: var(--preview-width);
    min-height: clamp(12rem, 18vw, 15rem);
    pointer-events: none;
    z-index: 2;
    transition: transform 0.55s cubic-bezier(.22, 1, .36, 1);
  }

  .preview-panel {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    align-items: start;
    gap: clamp(0.9rem, 1.5vw, 1.35rem);
    animation: previewFadeIn 0.28s ease both;
  }

  .preview-panel.is-active {
    opacity: 1;
    visibility: visible;
  }

  .preview-copy,
  .preview-media {
    clip-path: inset(0 0 100% 0);
    -webkit-clip-path: inset(0 0 100% 0);
    animation: previewWipeIn 0.95s cubic-bezier(.22, 1, .36, 1) forwards;
    transition:
      clip-path 0.95s cubic-bezier(.22, 1, .36, 1),
      -webkit-clip-path 0.95s cubic-bezier(.22, 1, .36, 1);
  }

  .preview-panel.is-active .preview-copy,
  .preview-panel.is-active .preview-media {
    clip-path: inset(0 0 0 0);
    -webkit-clip-path: inset(0 0 0 0);
  }

  .preview-copy {
    width: 100%;
    padding-top: 0;
    align-self: start;
  }

  .preview-text {
    margin: 0;
    max-width: 16ch;
    font-family: "Clash Display", sans-serif;
    font-weight: 300;
    font-size: clamp(1.04rem, 1.18vw, 1.24rem);
    line-height: 1.28;
    color: rgba(245, 241, 232, 0.88);
  }

  .preview-media {
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    background: #090909;
  }

  .preview-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .principles-mobile {
    display: none;
  }

  @media (max-width: 1100px) {
    .principles-shell {
      --preview-width: min(28vw, 18rem);
      --title-lane-width: min(60vw, 36rem);
      min-height: clamp(38rem, 60vw, 46rem);
    }

    .principles-preview {
      width: var(--preview-width);
    }
  }

  @media (max-width: 900px) {
    .about-editorial-principles {
      padding: 2.8rem 0 3.4rem;
    }

    .principles-shell-desktop {
      display: none;
    }

    .principles-mobile {
      display: block;
      padding-left: 1rem;
      min-height: 75vh;
    }

    .principles-mobile-track {
      display: flex;
      gap: 0.9rem;
      overflow-x: auto;
      overflow-y: visible;
      min-height: 75vh;
      align-items: stretch;
      padding: 0 1rem 0.45rem 0;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-x: contain;
    }

    .principles-mobile-track::-webkit-scrollbar {
      display: none;
    }

    .principle-mobile-card {
      flex: 0 0 82vw;
      min-width: 82vw;
      min-height: 75vh;
      padding: 1rem 0.15rem 0.2rem 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }

    .principle-mobile-line {
      width: 100%;
      height: 1px;
      background: rgba(255, 255, 255, 0.14);
      margin-bottom: 1rem;
    }

    .principle-mobile-title {
      margin-bottom: 7rem;
      font-family: "Clash Display", sans-serif;
      font-weight: 300;
      font-size: clamp(2rem, 9vw, 3rem);
      line-height: 0.96;
      letter-spacing: -0.04em;
      color: rgba(245, 241, 232, 0.44);
      text-align: left;
      transition: color 0.46s ease;
    }

    .principle-mobile-card.is-active .principle-mobile-title {
      color: #f5f1e8;
    }

    .principle-mobile-preview {
      margin-top: 4.5rem;
      padding-top: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 1rem;
      width: min(100%, 90%);
      margin-left: auto;
    }

    .principle-mobile-copy-wipe {
      opacity: 1;
      width: min(100%, 16.9rem);
      align-self: flex-end;
    }

    .principle-mobile-media-wipe {
      width: 100%;
    }

    .principle-mobile-text {
      margin: 0;
      font-family: "Clash Display", sans-serif;
      font-weight: 300;
      font-size: clamp(1.06rem, 3.9vw, 1.22rem);
      line-height: 1.34;
      color: rgba(245, 241, 232, 0.28);
      text-align: left;
      width: 100%;
      transition: color 0.46s ease;
    }

    .principle-mobile-card.is-active .principle-mobile-text {
      color: rgba(245, 241, 232, 0.74);
    }

    .principle-mobile-media {
      position: relative;
      width: min(100%, 16.9rem);
      aspect-ratio: 1.18 / 0.92;
      overflow: hidden;
      background: #090909;
      margin-left: auto;
      margin-right: 0;
      align-self: flex-end;
      flex: none;
    }

    .principle-mobile-media::after {
      content: "";
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.42);
      pointer-events: none;
      z-index: 1;
      transition: opacity 1.02s cubic-bezier(.22, 1, .36, 1);
    }

    .principle-mobile-card.is-active .principle-mobile-media::after,
    .principle-mobile-card:active .principle-mobile-media::after {
      opacity: 0;
    }

    .principle-mobile-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transform: translateZ(0) scale(1);
      filter: brightness(0.68);
      will-change: transform, filter;
      transition:
        transform 1.08s cubic-bezier(.22, 1, .36, 1),
        filter 1.02s cubic-bezier(.22, 1, .36, 1);
    }

    .principle-mobile-card.is-active .principle-mobile-media img,
    .principle-mobile-card:active .principle-mobile-media img {
      transform: translateZ(0) scale(1.075);
      filter: brightness(1);
    }
  }

  @keyframes previewFadeIn {
    from {
      opacity: 0;
      visibility: hidden;
    }

    to {
      opacity: 1;
      visibility: visible;
    }
  }

  @keyframes previewWipeIn {
    from {
      clip-path: inset(0 0 100% 0);
      -webkit-clip-path: inset(0 0 100% 0);
    }

    to {
      clip-path: inset(0 0 0 0);
      -webkit-clip-path: inset(0 0 0 0);
    }
  }
</style>
