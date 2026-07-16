<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { registerParallax, unregisterParallax } from "$lib/scrollEngine.js";
  import SliderDock from "$lib/components/shared/SliderDock.svelte";

  // slides: [{ title, description, href, cta?, images: [hero, half1, half2] }]
  export let slides = [];
  export let ctaLabel = "Voir le projet";
  // Variante mobile : titre en haut, mais le petit texte descend dans la partie
  // basse (utilisé uniquement par le grand slider de la page « à propos »).
  export let mobileCaptionBottom = false;
  const N = slides.length;

  // Glow qui suit le curseur — même effet que les autres boutons du site.
  function handleGlowMove(event) {
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  // ── Description → lignes de MOTS (mots atomiques séparés par de vraies
  //    espaces → retour à la ligne naturel), chaque lettre gardant un index de
  //    séquence global (gauche→droite, ligne par ligne) pour le wipe gris→blanc.
  function tokenizeDesc(desc) {
    const lines = (desc ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
    let seq = 0;
    return lines.map((line) => ({
      words: line.split(/\s+/).filter(Boolean).map((word) => ({
        chars: [...word].map((ch) => ({ ch, k: seq++ })),
      })),
    }));
  }
  const descTokens = slides.map((s) => tokenizeDesc(s.description));
  const descLen = descTokens.map((lines) =>
    lines.reduce((a, l) => a + l.words.reduce((b, w) => b + w.chars.length, 0), 0)
  );

  // ── Refs ────────────────────────────────────────────────────────────────
  let sectionEl;
  const projectEls = slides.map(() => null);
  const letterRefs = slides.map((_, pi) => new Array(descLen[pi]).fill(null));
  const letterPrev = slides.map((_, pi) => new Float32Array(descLen[pi]).fill(-1));

  // ── State / géométrie (coordonnées document) ──────────────────────────────
  let activeIndex = 0;
  let projTop = new Array(N).fill(0);
  let projBottom = new Array(N).fill(0);
  let measured = false;

  // ── Tunables ──────────────────────────────────────────────────────────────
  const WIPE_SPREAD = 11;   // largeur (en lettres) du front doux du wipe
  const WIPE_FINISH = 0.82; // le wipe se termine avant le changement de projet
  const START_GREY = 138;   // gris de départ (comme actuellement) → blanc

  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

  function measure() {
    if (!browser) return;
    const sy = window.scrollY || 0;
    for (let i = 0; i < N; i++) {
      const el = projectEls[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      projTop[i] = r.top + sy;
      projBottom[i] = r.bottom + sy;
    }
    measured = true;
  }

  // Repeint uniquement les lettres qui changent (quantifié → pas de restyle inutile).
  function paintLetters(pi, p) {
    const T = descLen[pi];
    if (T === 0) return;
    const front = p * (T + WIPE_SPREAD);
    const refs = letterRefs[pi];
    const prev = letterPrev[pi];
    for (let k = 0; k < T; k++) {
      const w = clamp((front - k) / WIPE_SPREAD, 0, 1);
      const q = Math.round(w * 60) / 60;
      if (q !== prev[k]) {
        prev[k] = q;
        const el = refs[k];
        if (el) {
          const c = Math.round(START_GREY + (255 - START_GREY) * q);
          el.style.color = `rgb(${c},${c},${c})`;
        }
      }
    }
  }

  function resetLetters(pi) {
    const refs = letterRefs[pi];
    const prev = letterPrev[pi];
    for (let k = 0; k < refs.length; k++) {
      prev[k] = 0;
      if (refs[k]) refs[k].style.color = `rgb(${START_GREY},${START_GREY},${START_GREY})`;
    }
  }

  // ── Scroll (piloté par le moteur global, cohérent avec Lenis) ──────────────
  function onScroll(y, ctx) {
    if (!measured || N === 0) return;
    const vh = ctx?.vh || window.innerHeight;
    const mid = y + vh * 0.5;

    // Projet actif = le dernier dont le haut a dépassé le milieu de l'écran.
    let a = 0;
    for (let i = 0; i < N; i++) {
      if (projTop[i] <= mid) a = i;
    }
    if (a !== activeIndex) {
      resetLetters(activeIndex); // la sortie repasse au gris → réentrée propre
      activeIndex = a;
    }

    // Progression du wipe à l'intérieur du projet actif.
    const startY = projTop[a];
    const endY = a < N - 1 ? projTop[a + 1] : projBottom[a];
    const span = Math.max(1, endY - startY);
    const p = clamp((mid - startY) / span / WIPE_FINISH, 0, 1);
    paintLetters(a, p);
  }

  // ── Aller à un projet (scroll natif fluide, aucun hijack) — piloté par le
  //    dock de pagination (points + lecture auto).
  function goTo(i) {
    if (!browser) return;
    measure();
    const target = clamp(i, 0, N - 1);
    // Amène le HAUT du projet en haut de l'écran (+1px pour franchir proprement
    // le seuil et activer ce projet).
    window.scrollTo({ top: Math.max(0, projTop[target] + 1), behavior: "smooth" });
  }

  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 120);
  }

  let _dockObs;
  onMount(() => {
    if (!browser || N === 0) return;

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        measure();
        for (let i = 0; i < N; i++) resetLetters(i);
        registerParallax(onScroll);
      })
    );

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
    window.addEventListener("load", measure, { passive: true });
    window.addEventListener("pageshow", measure, { passive: true });

    // Pendant que la section est à l'écran (le dock du bas y est épinglé), on
    // efface la vignette globale (`.bottom-gradient`, z 99999) pour que le
    // bouton passe devant.
    if (sectionEl) {
      _dockObs = new IntersectionObserver(
        ([entry]) =>
          window.dispatchEvent(
            new CustomEvent("pip-dock-visible", { detail: { visible: entry.isIntersecting } })
          ),
        { threshold: 0 }
      );
      _dockObs.observe(sectionEl);
    }
  });

  onDestroy(() => {
    if (!browser) return;
    unregisterParallax(onScroll);
    clearTimeout(resizeTimer);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onResize);
    window.removeEventListener("load", measure);
    window.removeEventListener("pageshow", measure);
    _dockObs?.disconnect();
    window.dispatchEvent(new CustomEvent("pip-dock-visible", { detail: { visible: false } }));
  });
</script>

{#if N > 0}
<section class="ps" class:ps--mcap-bottom={mobileCaptionBottom} bind:this={sectionEl} aria-label="Sélection de projets">
  <!-- Pile d'images qui défile normalement (aucun sticky sur les images) -->
  <div class="ps__stack">
    {#each slides as slide, i}
      <article class="ps__project" bind:this={projectEls[i]}>
        {#if slide.full}
          <!-- "Votre projet ?" : une seule grande image plein écran -->
          <div class="ps__full">
            <img src={slide.images[0]} alt="" loading="lazy" decoding="async" draggable="false" />
          </div>
        {:else}
          <!-- Une seule image ~200vh par projet -->
          <div class="ps__solo">
            <img src={slide.images[0]} alt="" loading="lazy" decoding="async" draggable="false" />
          </div>
        {/if}
        <!-- Assombrissement par projet : nul si actif, fort si à venir/passé -->
        <div class="ps__dark" class:is-dim={activeIndex !== i} aria-hidden="true"></div>
      </article>
    {/each}
  </div>

  <!-- UI fixe (sticky) par-dessus : titre en haut, infos en bas à gauche -->
  <div class="ps__ui-wrap">
    <div class="ps__ui">
      <div class="ps__grad-top" aria-hidden="true"></div>
      <div class="ps__grad-bottom" aria-hidden="true"></div>
      <!-- Mobile : assombrissement radial léger dans le coin bas-gauche -->
      <div class="ps__grad-corner" aria-hidden="true"></div>

      <!-- Titre (haut-gauche), swap par projet -->
      <div class="ps__titles" aria-live="polite">
        {#each slides as slide, i}
          <div
            class="ps__title-slot"
            class:is-active={activeIndex === i}
            aria-hidden={activeIndex !== i ? "true" : undefined}
          >
            <h2 class="ps__title">{slide.title}</h2>
          </div>
        {/each}
      </div>

      <!-- Bas-gauche : texte + bouton + flèche -->
      <div class="ps__bottom">
        {#each slides as slide, i}
          <div
            class="ps__info"
            class:is-active={activeIndex === i}
            aria-hidden={activeIndex !== i ? "true" : undefined}
          >
            <!-- Sur mobile : titre au-dessus du texte, dans la partie basse -->
            <div class="ps__mtitle" aria-hidden="true">{slide.title}</div>
            <div class="ps__caption">
              {#each descTokens[i] as line, li}
                <span class="ps__cap-line" style="--li:{li}">{#each line.words as word, wi}{#if wi > 0}{" "}{/if}<span class="ps__word">{#each word.chars as tok}<span class="ps__letter" bind:this={letterRefs[i][tok.k]}>{tok.ch}</span>{/each}</span>{/each}</span>
              {/each}
            </div>

            <div class="ps__actions">
              {#if slide.href}
                <a
                  href={slide.href}
                  class="ps__btn"
                  data-cursor="button"
                  on:mousemove={handleGlowMove}
                  tabindex={activeIndex === i ? 0 : -1}
                  aria-label={(slide.cta ?? ctaLabel) + " — " + slide.title.replace(/\n/g, " ")}
                >
                  <span class="ps__btn-inner" data-text={slide.cta ?? ctaLabel}>
                    <span class="ps__btn-text">{slide.cta ?? ctaLabel}</span>
                  </span>
                </a>
              {/if}
            </div>
          </div>
        {/each}
      </div>

    </div>
  </div>

  <!-- Dock de pagination (points + lecture auto). Il gère lui-même son
       épinglage (overlay sticky par le haut) et sa stabilité vs barre Safari. -->
  <SliderDock
    count={N}
    active={activeIndex}
    interval={5200}
    label="projets"
    on:goto={(e) => goTo(e.detail)}
  />
</section>
{/if}

<style>
  .ps {
    position: relative;
    width: 100%;
    background: #000;
    z-index: 2;
    /* Hauteur de l'image unique par projet (~200vh) */
    --solo-h: 200vh;
    /* Marges & arrondi */
    --side-gap: 0.5rem;
    --proj-gap: 1.6rem;
    --img-radius: 14px;
    /* Hauteur de la barre navigateur mobile (0 quand rétractée), constante :
       sert à décaler le contenu du bas et à combler le "trou" sous le dégradé. */
    --bar-inset: 0px;
    --bar-inset: calc(100lvh - 100svh);
  }

  /* ── Pile d'images (défilement naturel) ─────────────────────────────────── */
  .ps__stack {
    position: relative;
    z-index: 0;
    /* Petite marge sur les côtés (fond noir visible autour des images) */
    padding-inline: var(--side-gap);
  }
  .ps__project {
    position: relative;
    display: block;
  }
  /* Un peu plus d'espace entre deux projets */
  .ps__project + .ps__project {
    margin-top: var(--proj-gap);
  }
  .ps__solo {
    position: relative;
    width: 100%;
    height: var(--solo-h);
    overflow: hidden;
    border-radius: var(--img-radius);
  }
  .ps__solo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* "Votre projet ?" : une seule image plein écran */
  .ps__full {
    position: relative;
    width: 100%;
    height: 100vh;
    height: 100lvh;
    overflow: hidden;
  }
  .ps__full img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Voile d'assombrissement, un par projet, piloté par la classe .is-dim */
  .ps__dark {
    position: absolute;
    inset: 0;
    z-index: 2;
    background: #03070d;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.85s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .ps__dark.is-dim {
    opacity: 0.96;
  }

  /* ── UI fixe (sticky) par-dessus la pile ────────────────────────────────── */
  .ps__ui-wrap {
    position: absolute;
    inset: 0;
    z-index: 5;
    pointer-events: none;
  }
  .ps__ui {
    position: sticky;
    top: 0;
    /* 100lvh (grand viewport) : l'UI couvre TOUJOURS le bas, même quand la barre
       Safari se rétracte → plus de "trou" sous le dégradé. */
    height: 100vh;
    height: 100lvh;
    overflow: hidden;
    isolation: isolate;
  }

  .ps__grad-top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 36vh;
    pointer-events: none;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.42) 0%, rgba(0, 0, 0, 0) 100%);
  }
  /* Dégradé d'assombrissement en bas pour lire le texte. Il descend jusqu'au bas
     du 100lvh (grand viewport) et déborde encore de --bar-inset dessous : sur
     mobile, quand la barre Safari se rétracte, aucune zone claire n'apparaît. */
  .ps__grad-bottom {
    position: absolute;
    bottom: calc(-1 * var(--bar-inset));
    left: 0;
    right: 0;
    height: calc(56vh + var(--bar-inset));
    pointer-events: none;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.66) 0%,
      rgba(0, 0, 0, 0.66) calc(var(--bar-inset)),
      rgba(0, 0, 0, 0.5) 26%,
      rgba(0, 0, 0, 0.22) 52%,
      rgba(0, 0, 0, 0) 100%
    );
  }
  /* Assombrissement radial du coin bas-gauche (mobile uniquement, voir @media) */
  .ps__grad-corner {
    display: none;
  }

  /* ── Titre (haut) ───────────────────────────────────────────────────────── */
  .ps__titles {
    position: absolute;
    top: clamp(6rem, 10vw, 9rem);
    left: clamp(1.5rem, 5.5vw, 5.5rem);
    right: clamp(1.5rem, 5.5vw, 5.5rem);
    z-index: 3;
  }
  .ps__title-slot {
    position: absolute;
    top: 0;
    left: 0;
    /* Focus-pull : arrive du flou → net (même effet qu'avant) */
    opacity: 0;
    filter: blur(16px);
    transform: translate3d(0, 24px, 0);
    transition: opacity 0.55s ease,
      filter 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.85s cubic-bezier(0.22, 0.61, 0.36, 1);
    backface-visibility: hidden;
  }
  .ps__title-slot.is-active {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
  }
  .ps__title {
    margin: 0;
    font-family: var(--site-font, "Inter", sans-serif);
    font-weight: 600;
    font-size: clamp(4rem, 7vw, 8.6rem);
    line-height: 0.9;
    letter-spacing: -0.03em;
    color: #fff;
    white-space: pre-line;
    text-wrap: balance;
    max-width: 12ch;
    text-shadow: 0 8px 32px rgba(0, 0, 0, 0.22);
  }

  /* ── Bas-gauche : texte + bouton + flèche ───────────────────────────────── */
  .ps__bottom {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 3;
  }
  .ps__info {
    position: absolute;
    left: clamp(1.5rem, 5.5vw, 5.5rem);
    right: clamp(1.5rem, 5.5vw, 5.5rem);
    /* +--bar-inset : l'UI fait 100lvh, on remonte donc le contenu jusqu'au bas
       réel de l'écran (barre Safari visible). */
    bottom: calc(max(clamp(2rem, 4vw, 3.4rem), var(--safe-bottom-offset)) + var(--bar-inset));
  }

  /* Titre affiché dans la partie basse sur mobile uniquement (desktop = titre en haut) */
  .ps__mtitle {
    display: none;
  }

  .ps__caption {
    max-width: 34ch;
    margin: 0 0 clamp(1.3rem, 2vw, 1.9rem);
  }
  .ps__cap-line {
    display: block;
    font-family: var(--site-font, "Inter", sans-serif);
    font-weight: 300;
    font-size: clamp(1rem, 1.15vw, 1.2rem);
    line-height: 1.55;
    text-wrap: pretty;
    /* Swap par projet : flou → net (même effet qu'avant) */
    opacity: 0;
    filter: blur(10px);
    transform: translate3d(0, 16px, 0);
    transition: opacity 0.45s ease,
      filter 0.6s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
    backface-visibility: hidden;
  }
  .ps__info.is-active .ps__cap-line {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
    transition-delay: calc(var(--li, 0) * 0.07s);
  }
  /* Mot atomique : ne se coupe jamais en interne, le retour à la ligne se fait
     sur les vraies espaces entre les mots. */
  .ps__word {
    display: inline-block;
    white-space: nowrap;
  }
  /* Lettre : gris (piloté par JS) → blanc, lissé pour un wipe sans saccade */
  .ps__letter {
    color: rgb(138, 138, 138);
    will-change: color;
    transition: color 0.12s linear;
  }

  .ps__actions {
    display: flex;
    align-items: center;
    gap: 1rem;
    pointer-events: none;
    opacity: 0;
    filter: blur(8px);
    transform: translate3d(0, 14px, 0);
    transition: opacity 0.5s ease,
      filter 0.6s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .ps__info.is-active .ps__actions {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
    pointer-events: auto;
    transition-delay: 0.12s;
  }

  /* ── Bouton verre (identique aux autres boutons du site) ────────────────── */
  .ps__btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    padding: 0 1.5rem;
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 0.9rem;
    color: #fff;
    text-decoration: none;
    white-space: nowrap;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    border-radius: 10px;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.08);
    transition: background 0.3s ease, transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .ps__btn:hover { background: rgba(255, 255, 255, 0.18); }
  .ps__btn:focus-visible {
    outline: 2px solid var(--lead-blue, #5768ff);
    outline-offset: 3px;
  }
  .ps__btn::before,
  .ps__btn::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.25s ease;
  }
  .ps__btn::before {
    background: radial-gradient(
      96px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-strong) 0%,
      var(--site-glow-mid) 26%,
      var(--site-glow-soft) 52%,
      var(--site-glow-fade) 70%,
      transparent 86%
    );
  }
  .ps__btn::after {
    background: radial-gradient(
      120px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-ambient) 0%,
      var(--site-glow-outer) 48%,
      transparent 82%
    );
    filter: blur(3px);
  }
  .ps__btn:hover::before,
  .ps__btn:hover::after { opacity: 1; }
  .ps__btn-inner {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
  }
  .ps__btn-text { display: block; transition: transform 0.42s cubic-bezier(0.22, 0.61, 0.36, 1); }
  .ps__btn-inner::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition: transform 0.42s cubic-bezier(0.22, 0.61, 0.36, 1);
    white-space: nowrap;
    color: inherit;
  }
  .ps__btn:hover .ps__btn-text { transform: translateY(-100%); }
  .ps__btn:hover .ps__btn-inner::after { transform: translateY(0); }

  /* ── Responsive ─────────────────────────────────────────────────────────── */
  @media (max-width: 1024px) {
    .ps__title { font-size: clamp(3.2rem, 8vw, 6rem); }
  }

  /* The landscape condition mirrors the mobile layout onto phones wider than
     900px in landscape (Pro Max etc.), which would otherwise keep the desktop
     top-title layout in a short viewport. */
  @media (max-width: 900px),
    (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    /* Titre du haut masqué : sur mobile il passe dans la partie basse,
       juste au-dessus du petit texte. */
    .ps__titles { display: none; }

    /* Infos en HAUT sur mobile → assombrissement radial dans le coin HAUT-gauche
       pour mieux lire le titre + texte + bouton. */
    .ps__grad-corner {
      display: block;
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: radial-gradient(
        128% 108% at 0% 0%,
        rgba(0, 0, 0, 0.54) 0%,
        rgba(0, 0, 0, 0.34) 26%,
        rgba(0, 0, 0, 0.14) 50%,
        rgba(0, 0, 0, 0) 74%
      );
    }

    /* Bloc d'infos (titre + texte + bouton) placé dans la partie HAUTE.
       `.ps__bottom` doit couvrir toute la hauteur pour que le `top` de
       `.ps__info` parte bien du haut (et non du bas). */
    .ps__bottom {
      top: 0;
    }
    .ps__info {
      left: 1.25rem;
      right: 1.25rem;
      top: clamp(6rem, 16vh, 8.5rem);
      bottom: auto;
    }
    .ps__caption { max-width: 26rem; }
    .ps__cap-line { font-size: clamp(0.95rem, 3.8vw, 1.1rem); }

    /* Variante « à propos » : le titre reste en haut mais le petit texte
       (+ bouton éventuel) descend dans la partie basse. Le bloc d'infos couvre
       toute la hauteur ; `margin-top:auto` pousse le texte vers le bas. */
    .ps--mcap-bottom .ps__info {
      /* Remonté davantage pour ne pas passer sous le dock de changement de slide
         (points + lecture) épinglé en bas de l'écran. */
      bottom: calc(max(clamp(5.5rem, 16vw, 8rem), var(--safe-bottom-offset)) + var(--bar-inset));
      display: flex;
      flex-direction: column;
    }
    .ps--mcap-bottom .ps__caption {
      margin-top: auto;
      max-width: 20rem;
    }

    .ps__mtitle {
      display: block;
      /* Titre au-dessus du texte, écart resserré (bloc compact en haut). */
      margin: 0 0 clamp(1rem, 3.5vw, 1.8rem);
      font-family: var(--site-font, "Inter", sans-serif);
      font-weight: 600;
      font-size: clamp(2.6rem, 12vw, 4.6rem);
      line-height: 0.92;
      letter-spacing: -0.03em;
      color: #fff;
      white-space: pre-line;
      text-wrap: balance;
      text-shadow: 0 8px 32px rgba(0, 0, 0, 0.22);
      /* Même effet de swap (flou → net) que le titre desktop */
      opacity: 0;
      filter: blur(16px);
      transform: translate3d(0, 20px, 0);
      transition: opacity 0.55s ease,
        filter 0.85s cubic-bezier(0.22, 0.61, 0.36, 1),
        transform 0.85s cubic-bezier(0.22, 0.61, 0.36, 1);
      backface-visibility: hidden;
    }
    .ps__info.is-active .ps__mtitle {
      opacity: 1;
      filter: blur(0);
      transform: translate3d(0, 0, 0);
    }
  }

  @media (max-width: 480px) {
    .ps__mtitle { font-size: clamp(2.2rem, 14vw, 3.6rem); }
    .ps__cap-line { font-size: clamp(0.92rem, 4.2vw, 1.05rem); }
  }

  @media (prefers-reduced-motion: reduce) {
    .ps__title-slot,
    .ps__mtitle,
    .ps__cap-line,
    .ps__actions {
      transition: opacity 0.25s ease;
      transform: none;
      filter: none;
    }
    .ps__title-slot.is-active,
    .ps__info.is-active .ps__mtitle,
    .ps__info.is-active .ps__cap-line,
    .ps__info.is-active .ps__actions {
      opacity: 1;
      transform: none;
      filter: none;
    }
  }

  /* Landscape refinements on top of the (now shared) mobile layout: lift the
     info block, shrink the title + its margin, and pull the top/bottom
     darkening gradients back so they don't swallow the short viewport. */
  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .ps__grad-bottom { height: calc(34vh + var(--bar-inset)); }
    .ps__grad-top { height: 24vh; }

    .ps__info { top: clamp(3.5rem, 9vh, 5.5rem); }

    .ps__mtitle {
      font-size: clamp(1.7rem, 6.5vw, 2.6rem);
      margin: 0 0 clamp(0.6rem, 2vw, 1rem);
    }

    .ps--mcap-bottom .ps__info {
      bottom: calc(max(clamp(3rem, 9vw, 4.5rem), var(--safe-bottom-offset)) + var(--bar-inset));
    }
  }
</style>
