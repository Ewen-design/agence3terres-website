<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";

  export let slides = [];
  export let ctaLabel = "Voir le projet";
  const N = slides.length;

  // Glow qui suit le curseur — même effet que les autres boutons du site.
  function handleGlowMove(event) {
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  // Libellé du bouton, spécifique à la slide active si elle définit `cta`.
  $: activeCta = slides[activeIndex]?.cta ?? ctaLabel;

  // ── Progressive-blur ladder (sharp → strong). Adjacent levels are close,
  //    so crossfading between them reads as a true, continuous blur (no ghost).
  const BLUR_LEVELS = [0, 12, 28, 48]; // px
  const K = BLUR_LEVELS.length;
  const BASE_BLUR = BLUR_LEVELS[K - 1];
  const ANIM = [];
  for (let k = K - 2; k >= 0; k--) ANIM.push({ bl: BLUR_LEVELS[k], k });

  // ── DOM refs ──────────────────────────────────────────────────────────
  let sectionEl, stickyEl, spacerEl, bottomEl;
  const bgRefs    = slides.map(() => null);
  const layerRefs = slides.map(() => new Array(K - 1).fill(null));

  // ── Geometry ──────────────────────────────────────────────────────────
  let sectionTop = 0;
  let _segH      = browser ? window.innerHeight : 1;

  // ── State ─────────────────────────────────────────────────────────────
  // Plain NATIVE scroll — no preventDefault, no scrollTo — so this can never
  // trap or break page scrolling, and there's no scroll-jump to flash. The
  // scroll position picks the slide via a latched hysteresis (stable, one at a
  // time), and a time-eased `_view` plays the blur crossfade.
  let activeIndex = 0;   // committed slide → drives DOM (title / caption / dock) + blur
  let _anchor = 0;       // the slide the scroll is currently based on
  let _view   = 0;       // time-eased visual index driving the blur crossfade
  let _animFrom = 0;     // eased-tween start value
  let _animStart = -1e9; // eased-tween start timestamp
  let _isCoarse = false; // touch device? → skip the desktop snap (avoid any mobile flash)
  let _raf = 0;
  let _lastScroll = -1e9;

  // ── Tunables ──────────────────────────────────────────────────────────
  const VIEW_DUR     = 560;   // ms: blur-transition duration, eased in-out → soft, not dry
  const COMMIT_FRAC  = 0.30;  // scroll this fraction of a segment → latch to the next slide (reactive)
  const REVERT_FRAC  = 0.15;  // ... only fall back below this (hysteresis dead-band → stable, no flicker)
  const SHARP_HOLD   = 0.13;  // within this of a slide → treat it as rested there
  const SNAP_IDLE    = 90;    // ms after you stop scrolling → smooth-snap onto the committed slide
  const KEEPALIVE    = 240;   // ms: keep the loop alive after the last scroll (must exceed SNAP_IDLE)
  const Q            = 1 / 256;

  const _bgPrev  = new Float32Array(N).fill(-1);
  const _layPrev = slides.map(() => new Float32Array(K - 1).fill(-1));

  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const maxProg = () => Math.max(0, N - 1);
  const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
  const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  // ── Measurement ───────────────────────────────────────────────────────
  function measure() {
    if (!sectionEl || !browser) return;
    sectionTop = sectionEl.getBoundingClientRect().top + (window.scrollY || 0);
    const seg  = spacerEl && N > 1 ? spacerEl.offsetHeight / (N - 1) : window.innerHeight;
    _segH      = Math.max(1, seg);
  }

  // ── Render (opacity only → GPU-composited, never re-rasterised) ───────
  function setOp(el, prev, idx, v) {
    const q = Math.round(clamp(v, 0, 1) / Q) * Q;
    if (q !== prev[idx]) { prev[idx] = q; if (el) el.style.opacity = q.toFixed(3); }
  }

  function render() {
    const maxP  = maxProg();
    const lo    = clamp(Math.floor(_view), 0, maxP);
    const hi    = Math.min(lo + 1, maxP);
    const f     = lo === hi ? 0 : _view - lo;
    // Focus-pull BLUR with NO cross-dissolve dip: the bottom frame (lo) stays
    // FULLY OPAQUE the whole time, so the dark section background can never show
    // through at the 50/50 point → no brightness "flash" (which the dock's
    // backdrop-filter otherwise amplified at the bottom). The top frame (hi)
    // just fades in over it. Both blur heavily through the middle → a pure blur
    // morph. Symmetric in f, so it's identical in both scroll directions.
    const steps = K - 1;

    for (let i = 0; i < N; i++) {
      let op = -1, bf = 0;
      if (i === lo)                   { op = 1;                      bf = smoothstep(0, 0.55, f); }
      else if (i === hi && hi !== lo) { op = smoothstep(0.08, 1, f); bf = smoothstep(0, 0.55, 1 - f); }

      if (op < 0) { setOp(bgRefs[i], _bgPrev, i, 0); continue; }
      setOp(bgRefs[i], _bgPrev, i, op);

      const pos  = bf * steps;
      const refs = layerRefs[i], prev = _layPrev[i];
      for (let k = 0; k < steps; k++) setOp(refs[k], prev, k, 1 - clamp(pos - k, 0, 1));
    }
  }

  // ── Advance one slide (arrow button) — native smooth scroll, no hijack ─
  function goNext() {
    if (!sectionEl || !browser) return;
    measure();
    const target = clamp(activeIndex + 1, 0, maxProg());
    window.scrollTo({ top: clamp(sectionTop + target * _segH, 0, maxScroll()), behavior: "smooth" });
  }

  // ── Loop (self-stopping; runs only while easing, or briefly after scroll) ─
  function wake() { if (!_raf && browser) _raf = requestAnimationFrame(frame); }

  function frame(ts) {
    _raf = 0;
    if (!browser || N === 0 || !sectionEl) return;

    const rect    = sectionEl.getBoundingClientRect();
    const vh      = window.innerHeight;
    const maxP    = maxProg();
    sectionTop    = rect.top + (window.scrollY || 0);
    const rawProg = _segH > 0 ? clamp(-rect.top / _segH, 0, maxP) : 0;

    // Latched, one-slide-at-a-time commit. `_anchor` is the slide we rest on; we
    // only latch to a neighbour past COMMIT_FRAC and only fall back below
    // REVERT_FRAC → the wide dead-band makes scroll jitter unable to flip it.
    const nearest = clamp(Math.round(rawProg), 0, maxP);
    const onNet   = Math.abs(rawProg - nearest) <= SHARP_HOLD;
    let nextActive = activeIndex;
    if (onNet) {
      _anchor = nearest;
      nextActive = nearest;
    } else {
      const from = rawProg - _anchor;
      if (activeIndex === _anchor) {
        if (from > COMMIT_FRAC)       nextActive = clamp(_anchor + 1, 0, maxP);
        else if (-from > COMMIT_FRAC) nextActive = clamp(_anchor - 1, 0, maxP);
      } else if (activeIndex === _anchor + 1 && from < REVERT_FRAC) {
        nextActive = _anchor;
      } else if (activeIndex === _anchor - 1 && -from < REVERT_FRAC) {
        nextActive = _anchor;
      }
    }
    if (nextActive !== activeIndex) {
      // A hard flick can jump > 1: start the crossfade from the adjacent frame.
      if (Math.abs(nextActive - _view) > 1) _view = nextActive - Math.sign(nextActive - _view);
      _animFrom = _view;
      _animStart = ts;
      activeIndex = nextActive;
      _bgPrev.fill(-1);
      for (const p of _layPrev) p.fill(-1);
    }

    // Eased, fixed-duration blur transition toward the committed slide → soft in
    // and out (not dry), a touch longer so the focus-pull blur reads well.
    const t = clamp((ts - _animStart) / VIEW_DUR, 0, 1);
    _view = _animFrom + (activeIndex - _animFrom) * easeInOut(t);

    render();

    // Gentle NATIVE snap (desktop only): once you stop scrolling within the
    // pinned slider and you're not sitting on a slide, smooth-scroll onto the
    // committed one. A single native scrollTo (no preventDefault, no per-step
    // jump) → the reactive "rest on one slide" feel, without ever trapping the
    // page scroll or flashing. Skipped on touch to be 100% safe against the
    // mobile flash.
    const idle = ts - _lastScroll;
    if (!_isCoarse && rect.top <= 1 && rect.bottom >= vh - 1
        && idle > SNAP_IDLE && idle < KEEPALIVE
        && Math.abs(rawProg - activeIndex) > 0.03) {
      window.dispatchEvent(new Event("app:wheel-damping-stop"));
      window.scrollTo({ top: clamp(sectionTop + activeIndex * _segH, 0, maxScroll()), behavior: "smooth" });
    }

    const animating = t < 1;
    if (animating || idle < KEEPALIVE) wake();
  }

  function onScroll() { _lastScroll = now(); wake(); }

  let _resizeRaf = 0;
  function onResize() {
    if (_resizeRaf) cancelAnimationFrame(_resizeRaf);
    _resizeRaf = requestAnimationFrame(() => {
      _resizeRaf = 0;
      measure();
      const maxP = maxProg();
      const prog = _segH > 0 ? clamp(-(sectionEl.getBoundingClientRect().top) / _segH, 0, maxP) : 0;
      activeIndex = clamp(Math.round(prog), 0, maxP);
      _anchor = activeIndex;
      _view = activeIndex;
      _animFrom = activeIndex; _animStart = -1e9;
      _bgPrev.fill(-1);
      for (const p of _layPrev) p.fill(-1);
      render();
      wake();
    });
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────
  let _bodyObs, _dockObs;
  onMount(() => {
    if (!browser || N === 0) return;

    _isCoarse = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
    measure();
    requestAnimationFrame(() => requestAnimationFrame(() => { onResize(); }));

    window.addEventListener("scroll",            onScroll, { passive: true });
    window.addEventListener("wheel",             onScroll, { passive: true });
    window.addEventListener("touchmove",         onScroll, { passive: true });
    window.addEventListener("resize",            onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
    window.addEventListener("load",              measure,  { passive: true });
    window.addEventListener("pageshow",          measure,  { passive: true });
    window.visualViewport?.addEventListener("resize", onResize, { passive: true });

    _bodyObs = new ResizeObserver(() => measure());
    _bodyObs.observe(document.body);

    // While the glass dock is on screen, tell the layout to fade the global
    // bottom vignette (`.bottom-gradient`, z-index 99999) so the dock reads in
    // front of it — same mechanism as ProjectInProgress.
    if (bottomEl) {
      _dockObs = new IntersectionObserver(
        ([entry]) =>
          window.dispatchEvent(
            new CustomEvent("pip-dock-visible", { detail: { visible: entry.isIntersecting } })
          ),
        { threshold: 0 }
      );
      _dockObs.observe(bottomEl);
    }
  });

  onDestroy(() => {
    if (!browser) return;
    if (_raf) cancelAnimationFrame(_raf);
    if (_resizeRaf) cancelAnimationFrame(_resizeRaf);
    window.removeEventListener("scroll",            onScroll);
    window.removeEventListener("wheel",             onScroll);
    window.removeEventListener("touchmove",         onScroll);
    window.removeEventListener("resize",            onResize);
    window.removeEventListener("orientationchange", onResize);
    window.removeEventListener("load",              measure);
    window.removeEventListener("pageshow",          measure);
    window.visualViewport?.removeEventListener("resize", onResize);
    _bodyObs?.disconnect();
    _dockObs?.disconnect();
    window.dispatchEvent(new CustomEvent("pip-dock-visible", { detail: { visible: false } }));
  });
</script>



{#if N > 0}
<section
  class="bfs"
  bind:this={sectionEl}
  style="--slide-count:{N}"
  aria-roledescription="carrousel"
  aria-label="Sélection de projets"
>
  <div class="bfs__sticky" bind:this={stickyEl}>

    <!-- Backgrounds: only the active slide ±1 are mounted (mobile memory). -->
    <div class="bfs__bgs" aria-hidden="true">
      {#each slides as slide, i}
        {#if Math.abs(i - activeIndex) <= 1}
          <!-- opacity is owned by JS only (no reactive value → no flash on swap) -->
          <div class="bfs__bg" bind:this={bgRefs[i]} style="opacity:0">
            <img class="bfs__img" src={slide.image} alt=""
                 style="filter:blur({BASE_BLUR}px)"
                 loading="eager" decoding="async" draggable="false" />
            {#each ANIM as L}
              <img class="bfs__img bfs__img--anim" src={slide.image} alt=""
                   style="filter:blur({L.bl}px);opacity:1"
                   bind:this={layerRefs[i][L.k]}
                   loading="eager" decoding="async" draggable="false" />
            {/each}
          </div>
        {/if}
      {/each}
      <div class="bfs__overlay"></div>
    </div>

    <!-- Head (top): title + small description + arrow, per-slide swap -->
    <div class="bfs__heads" aria-live="polite">
      {#each slides as slide, i}
        <div
          class="bfs__head"
          class:is-active={activeIndex === i}
          aria-hidden={activeIndex !== i ? "true" : undefined}
        >
          <h2 class="bfs__title">{slide.title}</h2>

          <div class="bfs__sub">
            <div class="bfs__caption">
              {#each (slide.description ?? "").split("\n").filter(Boolean) as line, li}
                <span class="bfs__caption-line" style="--li:{li}">
                  <span>{line}</span>
                </span>
              {/each}
            </div>

            <button
              class="bfs__arrow-cue"
              type="button"
              on:mousedown|preventDefault
              on:click={goNext}
              tabindex={activeIndex === i ? 0 : -1}
              aria-label="Slide suivante"
            >
              <span class="bfs__arrow-symbol" aria-hidden="true">↓</span>
            </button>
          </div>
        </div>
      {/each}
    </div>

    <!-- Bottom-left: simple bouton verre (href suit la slide active) -->
    <div class="bfs__bottom" bind:this={bottomEl}>
      <div class="bfs__bottom-grad" aria-hidden="true"></div>
      <a
        href={slides[activeIndex]?.href}
        class="bfs__btn"
        data-cursor="button"
        on:mousemove={handleGlowMove}
        aria-label={activeCta + (slides[activeIndex]?.title ? " — " + slides[activeIndex].title.replace(/\n/g, " ") : "")}
      >
        <span class="bfs__btn-inner" data-text={activeCta}>
          <span class="bfs__btn-text">{activeCta}</span>
        </span>
      </a>
    </div>

  </div>

  <!-- Vertical scroll course that drives the blur / crossfade -->
  <div class="bfs__spacer" bind:this={spacerEl} aria-hidden="true"></div>
</section>
{/if}

<style>
  .bfs {
    position: relative;
    z-index: 2;
    width: 100%;
    background: #050b14;
    --bar-inset: 0px;
    --bar-inset: calc(100lvh - 100svh);
  }

  /* ── Sticky panel ───────────────────────────────────────────────────── */
  .bfs__sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    height: 100lvh;
    overflow: hidden;
    isolation: isolate;
    background: #050b14;
  }

  /* Scroll length per slide. Desktop needs more scroll (a gesture covers more
     viewport heights) — mobile keeps the shorter, perfect length. The JS reads
     this real height, so the two never go out of sync. */
  .bfs__spacer {
    height: calc((var(--slide-count) - 1) * 110vh);
    height: calc((var(--slide-count) - 1) * 110lvh);
  }

  /* ── Backgrounds ────────────────────────────────────────────────────── */
  .bfs__bgs {
    position: absolute; inset: 0; z-index: 0;
    background: #050b14; pointer-events: none;
  }
  .bfs__bg {
    position: absolute; inset: 0;
    opacity: 0;
  }
  /* Each layer is the same image at a fixed blur radius (rasterised once by
     the GPU). Scaled up so the blurred edges never reveal the background. */
  .bfs__img {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover; display: block; pointer-events: none;
    transform: scale(1.12) translateZ(0);
    backface-visibility: hidden;
  }
  .bfs__overlay {
    position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(to bottom,
      rgba(0,0,0,.55) 0%, rgba(0,0,0,.10) 30%, rgba(0,0,0,0) 55%);
  }

  /* ── Head (top): title + description + arrow ─────────────────────────── */
  .bfs__heads {
    position: absolute; z-index: 2;
    top: 0; left: 0; right: 0;
    pointer-events: none;
  }
  .bfs__head {
    position: absolute;
    top: clamp(6rem, 10vw, 9rem);
    left: clamp(1.5rem, 5.5vw, 5.5rem);
    right: clamp(1.5rem, 5.5vw, 5.5rem);
  }
  .bfs__title {
    margin: 0;
    font-family: var(--site-font, "Inter", sans-serif);
    font-weight: 600;
    font-size: clamp(4rem, 7vw, 8.6rem);
    line-height: 0.9;
    letter-spacing: -0.03em;
    color: #fff;
    text-shadow: 0 8px 32px rgba(0,0,0,.22);
    max-width: 12ch;
    white-space: pre-line;
    text-wrap: balance;
    /* Focus-pull: the title comes INTO focus (blur → sharp) as it arrives. */
    opacity: 0;
    filter: blur(16px);
    transform: translate3d(0, 24px, 0);
    transition: opacity .55s ease,
      filter .85s cubic-bezier(.22,.61,.36,1),
      transform .85s cubic-bezier(.22,.61,.36,1);
    backface-visibility: hidden;
  }
  .bfs__head.is-active .bfs__title {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
  }

  /* Small description + arrow, sitting right under the title. */
  .bfs__sub {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: clamp(1rem, 1.8vw, 1.5rem);
    margin-top: clamp(1.4rem, 2.4vw, 2.2rem);
  }

  /* ── Bottom: glass dock ─────────────────────────────────────────────── */
  .bfs__bottom {
    position: absolute; bottom: 0; left: 0; right: 0;
    height: calc(clamp(11rem, 28vh, 20rem) + var(--bar-inset));
    z-index: 2;
    pointer-events: none;
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
    padding:
      0
      clamp(1rem, 2vw, 2rem)
      max(clamp(1rem, 2.2vw, 1.6rem), var(--safe-bottom-offset))
      clamp(1rem, 2vw, 1.8rem);
    box-sizing: border-box;
  }
  /* Light vignette only — the glass dock floats over the live image. */
  .bfs__bottom-grad {
    position: absolute; inset: 0;
    pointer-events: none;
    background: linear-gradient(to bottom,
      rgba(0,0,0,0)    0%,
      rgba(0,0,0,.04) 45%,
      rgba(0,0,0,.12) 74%,
      rgba(0,0,0,.2)  100%);
  }

  .bfs__caption {
    max-width: min(40rem, 100%);
  }
  /* Desktop: cap the description to a small stacked block. */
  @media (min-width: 901px) {
    .bfs__caption {
      max-width: 34ch;
    }
  }
  .bfs__caption-line { display: block; }
  .bfs__caption-line > span {
    display: block;
    font-family: var(--site-font, "Inter", sans-serif);
    font-weight: 300;
    font-size: clamp(1rem, 1.15vw, 1.2rem);
    line-height: 1.55;
    color: rgba(255,255,255,.88);
    white-space: normal;        /* wrap long descriptions instead of overflowing */
    text-wrap: pretty;
    opacity: 0;
    filter: blur(10px);
    transform: translate3d(0, 16px, 0);
    transition: opacity .45s ease,
      filter .6s cubic-bezier(.22,.61,.36,1),
      transform .6s cubic-bezier(.22,.61,.36,1);
    transition-delay: 0s;
    backface-visibility: hidden;
  }
  .bfs__head.is-active .bfs__caption-line > span {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
    transition-delay: calc(var(--li, 0) * .07s);
  }

  /* ── Simple bouton verre (comme les autres boutons du site) ──────────── */
  .bfs__btn {
    position: relative;
    pointer-events: auto;
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
    transition:
      background 0.3s ease,
      transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .bfs__btn:hover { background: rgba(255, 255, 255, 0.18); }
  .bfs__btn:focus-visible {
    outline: 2px solid var(--lead-blue, #5768ff);
    outline-offset: 3px;
  }

  /* Glow qui s'illumine et suit le curseur — identique aux boutons du site. */
  .bfs__btn::before,
  .bfs__btn::after {
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
  .bfs__btn::before {
    background: radial-gradient(
      96px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-strong) 0%,
      var(--site-glow-mid) 26%,
      var(--site-glow-soft) 52%,
      var(--site-glow-fade) 70%,
      transparent 86%
    );
  }
  .bfs__btn::after {
    background: radial-gradient(
      120px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-ambient) 0%,
      var(--site-glow-outer) 48%,
      transparent 82%
    );
    filter: blur(3px);
  }
  .bfs__btn:hover::before,
  .bfs__btn:hover::after { opacity: 1; }
  .bfs__btn-inner {
    position: relative; display: block; overflow: hidden;
    height: 1.2em; line-height: 1.2em;
  }
  .bfs__btn-text { display: block; transition: transform .42s cubic-bezier(.22,.61,.36,1); }
  .bfs__btn-inner::after {
    content: attr(data-text);
    position: absolute; left: 0; top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition: transform .42s cubic-bezier(.22,.61,.36,1);
    white-space: nowrap;
    color: inherit;
  }
  .bfs__btn:hover .bfs__btn-text { transform: translateY(-100%); }
  .bfs__btn:hover .bfs__btn-inner::after { transform: translateY(0); }

  /* ── Scroll arrow (under the title) ─────────────────────────────────── */
  .bfs__arrow-cue {
    pointer-events: none;
    display: inline-flex; align-items: center; justify-content: center;
    padding: .6rem; margin: -.6rem;       /* bigger hit area, glyph stays put */
    background: none; border: 0;
    color: #fff; cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    opacity: 0;
    transition: transform .35s cubic-bezier(.22,.61,.36,1), opacity .4s ease;
  }
  .bfs__head.is-active .bfs__arrow-cue {
    opacity: 1;
    pointer-events: auto;
    transition-delay: .12s;
  }
  .bfs__arrow-cue:hover { transform: translateY(4px); }
  .bfs__arrow-cue:active { transform: translateY(2px); }
  .bfs__arrow-cue:focus-visible { outline: 2px solid rgba(245,241,232,.9); outline-offset: 4px; }
  .bfs__arrow-symbol {
    display: block;
    font-family: var(--site-font, "Inter", sans-serif);
    font-size: clamp(1.1rem, 1.1vw, 1.2rem);
    font-weight: 300;
    color: #fff;
    line-height: 1;
  }

  /* ── Responsive ─────────────────────────────────────────────────────── */
  @media (max-width: 1024px) {
    .bfs__title { font-size: clamp(3.2rem, 8vw, 6rem); }
  }

  @media (max-width: 900px) {
    .bfs__spacer {
      height: calc((var(--slide-count) - 1) * 95vh);
      height: calc((var(--slide-count) - 1) * 95lvh);
    }
    .bfs__head {
      top: clamp(5rem, 14vh, 7rem); left: 1.25rem; right: 1.25rem;
    }
    .bfs__title {
      font-size: clamp(2.6rem, 12vw, 4.6rem); max-width: 100%;
    }
    .bfs__caption-line > span { font-size: clamp(.95rem, 3.8vw, 1.1rem); }
    .bfs__bottom {
      padding-left: 1.25rem;
      padding-right: 1.25rem;
      /* Bouton remonté sur mobile. */
      padding-bottom: max(clamp(3.6rem, 12vw, 5.4rem), calc(var(--safe-bottom-offset) + 2.6rem));
    }
  }

  @media (max-width: 480px) {
    .bfs__title { font-size: clamp(2.2rem, 14vw, 3.6rem); }
    .bfs__caption-line > span { font-size: clamp(.92rem, 4.2vw, 1.05rem); }
  }

  @media (prefers-reduced-motion: reduce) {
    .bfs__title, .bfs__caption-line > span { transition: opacity .25s ease; transform: none; filter: none; }
    .bfs__head.is-active .bfs__title,
    .bfs__head.is-active .bfs__caption-line > span,
    .bfs__head.is-active .bfs__arrow-cue { opacity: 1; transform: none; filter: none; }
  }
</style>
