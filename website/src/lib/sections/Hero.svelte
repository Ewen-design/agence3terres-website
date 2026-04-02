<script>
  import { onMount } from "svelte";

  let pinSection;
  let afterSection;
  let leftTitleEl;
  let rightTitleEl;

  let heroProgress = 0;
  let textReveal = 0;

  let vw = 0;
  let leftW = 0;
  let rightW = 0;

  let ticking = false;

  let introStarted = false;
  let introVisible = false;
  let hintVisible = false;

  let fallbackTimeout;
  let hintTimeout;

  const finalText =
    "Nous concevons des identités, des expériences et des univers visuels pensés pour marquer durablement les esprits.";

  const words = finalText.split(" ");

  let charCount = 0;
  const totalChars = finalText.replace(/\s/g, "").length;
  const halfChars = totalChars / 2;

  let grayStartsAtWord = words.length;

  for (let w = 0; w < words.length; w++) {
    const nextCount = charCount + words[w].length;
    if (nextCount >= halfChars) {
      grayStartsAtWord = w + 1;
      break;
    }
    charCount = nextCount;
  }

  const wordOffsets = [];
  let runningOffset = 0;
  for (const word of words) {
    wordOffsets.push(runningOffset);
    runningOffset += word.length;
  }

  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  function easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function measureTitles() {
    vw = window.innerWidth || 0;
    leftW = leftTitleEl?.offsetWidth || 0;
    rightW = rightTitleEl?.offsetWidth || 0;
  }

  function updateScrollState() {
    ticking = false;
    if (!pinSection || !afterSection) return;

    const vh = window.innerHeight;

    const pinRect = pinSection.getBoundingClientRect();
    const pinScrollable = Math.max(pinSection.offsetHeight - vh, 1);
    const pinRaw = clamp(-pinRect.top / pinScrollable, 0, 1);
    heroProgress = pinRaw;

    const afterRect = afterSection.getBoundingClientRect();
    const revealStart = vh * 0.92;
    const revealEnd = vh * 0.18;
    const rawReveal = clamp(
      (revealStart - afterRect.top) / (revealStart - revealEnd),
      0,
      1
    );
    textReveal = easeOutCubic(rawReveal);
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScrollState);
  }

  function startIntro() {
    if (introStarted) return;
    introStarted = true;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        introVisible = true;

        hintTimeout = setTimeout(() => {
          hintVisible = true;
        }, 220);
      });
    });
  }

  onMount(() => {
    const updateAll = () => {
      measureTitles();
      updateScrollState();
    };

    const handlePreloaderDone = () => {
      startIntro();
    };

    updateAll();
    requestAnimationFrame(updateAll);

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", updateAll, { passive: true });
    window.addEventListener("orientationchange", updateAll, { passive: true });
    window.addEventListener("preloader:done", handlePreloaderDone);

    // fallback si jamais l’event n’est pas encore branché
    fallbackTimeout = setTimeout(() => {
      startIntro();
    }, 1800);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", updateAll);
      window.removeEventListener("orientationchange", updateAll);
      window.removeEventListener("preloader:done", handlePreloaderDone);
      clearTimeout(fallbackTimeout);
      clearTimeout(hintTimeout);
    };
  });

  $: mergeProgress = clamp(heroProgress / 0.9, 0, 1);
  $: smoothMerge = easeInOutSine(mergeProgress);

  $: darkProgress = easeInOutSine(clamp(heroProgress / 0.96, 0, 1));
  $: imageDark = lerp(0, 0.93, darkProgress);
  $: imageScale = lerp(1.06, 1.01, darkProgress);

  $: sideMargin = Math.min(vw * 0.085, 118);
  $: joinGap = Math.min(vw * 0.012, 14);

  $: leftStartX = sideMargin;
  $: leftEndX = vw * 0.5 - leftW - joinGap * 0.5;

  $: rightStartX = vw - rightW - sideMargin;
  $: rightEndX = vw * 0.5 + joinGap * 0.5;

  $: leftX = lerp(leftStartX, leftEndX, smoothMerge);
  $: rightX = lerp(rightStartX, rightEndX, smoothMerge);

  $: hintScrollFade = 1 - easeOutCubic(clamp(heroProgress / 0.03, 0, 1));
  $: scrollHintOpacity = hintVisible ? hintScrollFade : 0;

  function letterOpacity(i) {
    return clamp(textReveal * 1.3 - i * 0.022, 0, 1);
  }

  function letterY(i) {
    return (1 - letterOpacity(i)) * 14;
  }
</script>

<section class="hero-join-clean">
  <section class="pin-section" bind:this={pinSection}>
    <div class="sticky-stage">
      <div class="hero-media">
        <img
          src="images/photo.webp"
          alt="Agence 3 Terres"
          style={`transform: scale(${imageScale}); filter: brightness(${1 - imageDark});`}
        />
        <div class="hero-dark-layer" style={`opacity:${imageDark};`}></div>
      </div>

      <div class="titles-layer">
        <span
          class="title-left"
          class:intro-visible={introVisible}
          bind:this={leftTitleEl}
          style={`--title-x:${leftX}px; transform: translate3d(${leftX}px,-50%,0);`}
        >
          Agence
        </span>

        <span
          class="title-right"
          class:intro-visible={introVisible}
          bind:this={rightTitleEl}
          style={`--title-x:${rightX}px; transform: translate3d(${rightX}px,-50%,0);`}
        >
          3 Terres
        </span>

        <div
          class="scroll-hint"
          class:hint-visible={hintVisible}
          aria-hidden="true"
          style={`opacity:${scrollHintOpacity}; transform: translate3d(-50%, ${lerp(14, 0, scrollHintOpacity)}px, 0); filter: blur(${lerp(10, 0, scrollHintOpacity)}px);`}
        >
          Scroll pour découvrir
        </div>
      </div>
    </div>
  </section>

  <section class="after-section" bind:this={afterSection}>
    <div class="after-grid">
      <div
        class="after-text"
        style={`transform: translate3d(${lerp(24, 0, textReveal)}px,0,0);`}
      >
        <h2 aria-label={finalText}>
          {#each words as word, w}
            <span class="word" class:muted-word={w >= grayStartsAtWord}>
              {#each word.split("") as letter, i}
                <span
                  style={`opacity:${clamp(0.78 + letterOpacity(wordOffsets[w] + i) * 0.22, 0, 1)}; transform: translate3d(0,${letterY(wordOffsets[w] + i)}px,0);`}
                >
                  {letter}
                </span>
              {/each}
            </span>{#if w < words.length - 1}<span class="space">&nbsp;</span>{/if}
          {/each}
        </h2>
      </div>

      <div
        class="after-image"
        style={`opacity:${textReveal}; transform: translate3d(0,${lerp(26, 0, textReveal)}px,0);`}
      >
        <img src="images/photo.webp" alt="Visuel 3 Terres" />
      </div>
    </div>
  </section>
</section>

<style>
  .hero-join-clean {
    position: relative;
    width: 100%;
    background: #000;
    color: #f4efe6;
    overflow: clip;
  }

  .pin-section {
    position: relative;
    height: 265vh;
  }

  .sticky-stage {
    position: sticky;
    top: 0;
    height: 100vh;
    height: 100svh;
    overflow: hidden;
    background: #000;
  }

  .hero-media {
    position: absolute;
    inset: 0;
    background: #000;
  }

  .hero-media img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    will-change: transform, filter;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .hero-dark-layer {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        circle at 50% 50%,
        rgba(0, 0, 0, 0.01) 0%,
        rgba(0, 0, 0, 0.08) 38%,
        rgba(0, 0, 0, 0.22) 62%,
        rgba(0, 0, 0, 0.84) 100%
      );
    pointer-events: none;
    will-change: opacity;
  }

  .titles-layer {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
  }

  .title-left,
  .title-right {
    position: absolute;
    top: 50%;
    line-height: 0.94;
    letter-spacing: -0.05em;
    white-space: nowrap;
    will-change: transform, opacity, filter;
    font-size: clamp(2.9rem, 7.8vw, 8.8rem);
    opacity: 0;
    filter: blur(18px);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .title-left {
    font-family: "Titre", serif;
    font-weight: 400;
  }

  .title-right {
    font-family: "Titre italic", serif;
    font-style: italic;
    font-weight: 100;
  }

  .title-left.intro-visible {
    animation: titleEnterLeft 1.25s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .title-right.intro-visible {
    animation: titleEnterRight 1.25s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .scroll-hint {
    position: absolute;
    left: 50%;
    bottom: clamp(1.3rem, 3vw, 2.4rem);
    font-family: "General Sans", sans-serif;
    font-size: clamp(0.82rem, 0.95vw, 0.98rem);
    font-weight: 300;
    letter-spacing: 0.04em;
    color: rgba(255, 255, 255, 0.76);
    white-space: nowrap;
    will-change: transform, opacity, filter;
    opacity: 0;
  }

  .hint-visible {
    transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .after-section {
    position: relative;
    z-index: 3;
    background: #000;
    padding: 16vh 0 18vh;
  }

  .after-grid {
    width: min(1400px, 92%);
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.78fr);
    gap: clamp(1.4rem, 4vw, 4.5rem);
    align-items: start;
  }

  .after-text {
    will-change: transform, opacity;
    width: 100%;
    min-width: 0;
  }

  .after-text h2 {
    margin: 0;
    width: 100%;
    max-width: 30ch;
    font-family: "General Sans", sans-serif;
    font-weight: 300;
    font-size: clamp(1.3rem, 2.8vw, 2.8rem);
    line-height: 1;
    letter-spacing: -0.05em;
    color: #fff;
  }

  .word {
    display: inline-block;
    white-space: nowrap;
  }

  .word span {
    display: inline-block;
    color: #fff;
    will-change: transform, opacity;
  }

  .word.muted-word span {
    color: rgba(255, 255, 255, 0.7);
  }

  .space {
    display: inline;
  }

 .after-image {
  justify-self: end;
  width: min(100%, 460px);
  aspect-ratio: 1.45 / 1;
  overflow: hidden;
  background: #0b0b0b;
  will-change: transform, opacity;
  margin-top: clamp(4rem, 6vw, 7rem);/* ← AJOUT */
}

  .after-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform: translateZ(0);
  }

  @keyframes titleEnterLeft {
    from {
      opacity: 0;
      filter: blur(18px);
      transform: translate3d(calc(var(--title-x, 0px) - 42px), -50%, 0);
    }
    to {
      opacity: 1;
      filter: blur(0);
      transform: translate3d(var(--title-x, 0px), -50%, 0);
    }
  }

  @keyframes titleEnterRight {
    from {
      opacity: 0;
      filter: blur(18px);
      transform: translate3d(calc(var(--title-x, 0px) + 42px), -50%, 0);
    }
    to {
      opacity: 1;
      filter: blur(0);
      transform: translate3d(var(--title-x, 0px), -50%, 0);
    }
  }

  @media (max-width: 900px) {
    .pin-section {
      height: 235vh;
    }

    .title-left,
    .title-right {
      font-size: clamp(2.2rem, 9vw, 5rem);
    }

    .after-grid {
      width: min(94%, 760px);
      grid-template-columns: 1fr 0.82fr;
      gap: 0.8rem;
    }

    .after-text h2 {
      font-size: clamp(1.3rem, 6.8vw, 2.7rem);
      max-width: 11ch;
    }

    .scroll-hint {
      bottom: 1.25rem;
      font-size: 0.82rem;
    }
  }

  @media (max-width: 640px) {
    .pin-section {
      height: 220vh;
    }

    .title-left,
    .title-right {
      font-size: clamp(1.85rem, 10vw, 3.3rem);
    }

    .after-section {
      padding: 11vh 0 12vh;
    }

    .after-grid {
      width: min(94%, 520px);
      grid-template-columns: 1fr;
      gap: 1rem;
    }

      .after-text {
    width: 78%; /* ← AVANT 66% */
    justify-self: start;
  }

    .after-text h2 {
      font-size: clamp(1.15rem, 6.4vw, 1.95rem);
      line-height: 1.04;
      max-width: none;
    }

     .after-image {
    width: min(78%, 340px); /* un peu plus large aussi */
    justify-self: end;
    aspect-ratio: 1.6 / 1;
    margin-top: 3.5rem; /* ← image encore un peu plus basse sur mobile */
  }


    .scroll-hint {
      bottom: 1.05rem;
      font-size: 0.78rem;
      letter-spacing: 0.03em;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-media img,
    .hero-dark-layer,
    .title-left,
    .title-right,
    .scroll-hint,
    .after-text,
    .after-image,
    .after-text h2 span {
      transition: none !important;
      animation: none !important;
      filter: none !important;
      opacity: 1 !important;
    }
  }
</style>