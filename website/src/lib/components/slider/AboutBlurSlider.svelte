<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";

  export let slides = [];
  export let ctaLabel = "Voir le projet";
  const N = slides.length;

  // ── Progressive-blur ladder (sharp → strong). Adjacent levels are close,
  //    so crossfading between them reads as a true, continuous blur (no ghost).
  const BLUR_LEVELS = [0, 12, 28, 48]; // px
  const K = BLUR_LEVELS.length;
  const BASE_BLUR = BLUR_LEVELS[K - 1];
  const ANIM = [];
  for (let k = K - 2; k >= 0; k--) ANIM.push({ bl: BLUR_LEVELS[k], k });

  // ── DOM refs ──────────────────────────────────────────────────────────
  let sectionEl, stickyEl, spacerEl;
  const bgRefs    = slides.map(() => null);
  const layerRefs = slides.map(() => new Array(K - 1).fill(null));

  // Glow-on-hover border (same as the rest of the site's buttons).
  function handleBtnMove(event) {
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

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
  let _bodyObs;
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

    <!-- Titles (top, swap in place) -->
    <div class="bfs__titles">
      {#each slides as slide, i}
        <h2 class="bfs__title" class:is-active={activeIndex === i} aria-hidden={activeIndex !== i ? "true" : undefined}>
          {slide.title}
        </h2>
      {/each}
    </div>

    <!-- Scroll hint arrow → advances to the next slide -->
    <button class="bfs__arrow-cue" type="button" on:click={goNext} aria-label="Slide suivante">
      <span class="bfs__arrow-symbol" aria-hidden="true">↓</span>
    </button>

    <!-- Bottom: gradient + captions + buttons (swap in place) -->
    <div class="bfs__bottom">
      <div class="bfs__bottom-grad" aria-hidden="true"></div>
      <div class="bfs__captions" aria-live="polite">
        {#each slides as slide, i}
          <div
            class="bfs__caption"
            class:is-active={activeIndex === i}
            aria-hidden={activeIndex !== i ? "true" : undefined}
          >
            {#each (slide.description ?? "").split("\n").filter(Boolean) as line, li}
              <span class="bfs__caption-line" style="--li:{li}">
                <span>{line}</span>
              </span>
            {/each}
            {#if slide.href}
              <a
                href={slide.href}
                class="bfs__btn"
                tabindex={activeIndex === i ? 0 : -1}
                data-cursor="button"
                on:mousemove={handleBtnMove}
                aria-label={ctaLabel + (slide.title ? " — " + slide.title.replace(/\n/g, " ") : "")}
              >
                <span class="bfs__btn-inner" data-text={ctaLabel}>
                  <span class="bfs__btn-text">{ctaLabel}</span>
                </span>
              </a>
            {/if}
          </div>
        {/each}
      </div>
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

  /* ── Titles (top) ───────────────────────────────────────────────────── */
  .bfs__titles {
    position: absolute; z-index: 2;
    top: 0; left: 0; right: 0;
    padding: clamp(6rem, 10vw, 9rem) clamp(1.5rem, 5.5vw, 5.5rem) 0;
    pointer-events: none;
  }
  .bfs__title {
    position: absolute;
    top: clamp(6rem, 10vw, 9rem);
    left: clamp(1.5rem, 5.5vw, 5.5rem);
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
  .bfs__title.is-active {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
  }

  /* ── Bottom bar ─────────────────────────────────────────────────────── */
  .bfs__bottom {
    position: absolute; bottom: 0; left: 0; right: 0;
    height: calc(clamp(17rem, 42vh, 32rem) + var(--bar-inset));
    z-index: 2;
    pointer-events: none;
  }
  /* Smoothly-eased gradient (many stops) so there's no visible banding/edge. */
  .bfs__bottom-grad {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom,
      rgba(0,0,0,0)    0%,
      rgba(0,0,0,.03) 20%,
      rgba(0,0,0,.10) 36%,
      rgba(0,0,0,.21) 50%,
      rgba(0,0,0,.36) 63%,
      rgba(0,0,0,.53) 75%,
      rgba(0,0,0,.70) 86%,
      rgba(0,0,0,.85) 95%,
      rgba(0,0,0,.9)  100%);
  }
  .bfs__captions {
    position: absolute;
    bottom: calc(var(--bar-inset) + clamp(2.5rem, 5vw, 4rem));
    left: clamp(1.5rem, 5.5vw, 5.5rem);
    z-index: 1;
    min-height: 8rem;
  }
  /* Explicit width (not just max-width): the captions wrapper has no in-flow
     content — every caption is absolutely positioned — so it collapses to 0
     and a max-width alone would shrink the text to its longest word. A real
     width, viewport-based and minus the side gutters, lets the text breathe. */
  .bfs__caption {
    position: absolute;
    bottom: 0;
    left: 0;
    width: min(72rem, calc(100vw - clamp(1.5rem, 5.5vw, 5.5rem) - clamp(3.5rem, 8vw, 8rem)));
  }
  /* Desktop: cap the caption to ~3 lines so short descriptions read as a small
     stacked block rather than one very long line. Mobile keeps its own width. */
  @media (min-width: 901px) {
    .bfs__caption {
      width: min(34ch, calc(100vw - clamp(1.5rem, 5.5vw, 5.5rem) - clamp(3.5rem, 8vw, 8rem)));
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
  .bfs__caption.is-active .bfs__caption-line > span {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
    transition-delay: calc(var(--li, 0) * .07s);
  }

  /* ── Button ─────────────────────────────────────────────────────────── */
  .bfs__btn {
    display: inline-flex;
    align-items: center;
    height: 38px;
    margin-top: 1.1rem;
    padding: 0 1.4rem;
    font-family: var(--site-font, "Inter", sans-serif);
    font-weight: 400;
    font-size: .88rem;
    color: #f5f1e8;
    text-decoration: none;
    background: rgba(255,255,255,.12);
    backdrop-filter: blur(18px) saturate(150%);
    -webkit-backdrop-filter: blur(18px) saturate(150%);
    border-radius: 10px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transform: translate3d(0, 18px, 0) scale(.96);
    transition: transform .6s cubic-bezier(.22,.61,.36,1), opacity .45s ease;
    backface-visibility: hidden;
  }
  .bfs__caption.is-active .bfs__btn {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
    transition-delay: .18s;
    pointer-events: auto;
  }
  .bfs__btn:focus-visible {
    outline: 2px solid rgba(245,241,232,.9);
    outline-offset: 3px;
  }
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
  }
  .bfs__btn:hover .bfs__btn-text { transform: translateY(-100%); }
  .bfs__btn:hover .bfs__btn-inner::after { transform: translateY(0); }

  /* Glowing border on hover — same system as the rest of the site's buttons. */
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
  }
  .bfs__btn::before {
    background: radial-gradient(
      128px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-strong) 0%,
      var(--site-glow-mid) 26%,
      var(--site-glow-soft) 52%,
      var(--site-glow-fade) 70%,
      transparent 86%
    );
    transition: opacity 0.25s ease;
  }
  .bfs__btn::after {
    background: radial-gradient(
      156px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-ambient) 0%,
      var(--site-glow-outer) 48%,
      transparent 82%
    );
    filter: blur(3px);
    transition: opacity 0.25s ease;
  }
  .bfs__btn:hover::before,
  .bfs__btn:hover::after { opacity: 1; }

  /* ── Scroll arrow ───────────────────────────────────────────────────── */
  .bfs__arrow-cue {
    position: absolute;
    right: clamp(1.5rem, 5.5vw, 5.5rem);
    bottom: calc(var(--bar-inset) + clamp(2.5rem, 5vw, 4rem));
    z-index: 3;
    pointer-events: auto;
    display: inline-flex; align-items: center; justify-content: center;
    padding: .7rem; margin: -.7rem;       /* bigger hit area, glyph stays put */
    background: none; border: 0;
    color: #fff; cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: transform .35s cubic-bezier(.22,.61,.36,1), opacity .3s ease;
  }
  .bfs__arrow-cue:hover { transform: translateY(4px); }
  .bfs__arrow-cue:active { transform: translateY(2px); }
  .bfs__arrow-cue:focus-visible { outline: 2px solid rgba(245,241,232,.9); outline-offset: 4px; border-radius: 8px; }
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
    .bfs__titles { padding: clamp(5rem, 14vh, 7rem) 1.25rem 0; }
    .bfs__title {
      top: clamp(5rem, 14vh, 7rem); left: 1.25rem;
      font-size: clamp(2.6rem, 12vw, 4.6rem); max-width: 100%;
    }
    .bfs__captions { bottom: calc(var(--bar-inset) + clamp(3.5rem, 9vh, 5.5rem)); left: 1.25rem; }
    .bfs__caption-line > span { font-size: clamp(.95rem, 3.8vw, 1.1rem); }
    .bfs__btn { height: 36px; font-size: .84rem; padding: 0 1.2rem; }
    .bfs__arrow-cue { right: 1.25rem; bottom: calc(var(--bar-inset) + clamp(3.5rem, 9vh, 5.5rem)); }
  }

  @media (max-width: 480px) {
    .bfs__title { font-size: clamp(2.2rem, 14vw, 3.6rem); }
    .bfs__caption-line > span { font-size: clamp(.92rem, 4.2vw, 1.05rem); }
  }

  @media (prefers-reduced-motion: reduce) {
    .bfs__title, .bfs__caption-line > span, .bfs__btn { transition: opacity .25s ease; transform: none; filter: none; }
    .bfs__title.is-active, .bfs__caption.is-active .bfs__caption-line > span,
    .bfs__caption.is-active .bfs__btn { opacity: 1; transform: none; filter: none; }
  }

  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .bfs__bottom { height: calc(clamp(6.5rem, 18vh, 10rem) + var(--bar-inset)); }
    .bfs__title { top: clamp(3rem, 7vw, 4.5rem); }
    .bfs__captions { bottom: calc(var(--bar-inset) + clamp(1.6rem, 4vh, 2.6rem)); }
    .bfs__arrow-cue { bottom: calc(var(--bar-inset) + clamp(1.6rem, 4vh, 2.6rem)); }
  }
</style>
