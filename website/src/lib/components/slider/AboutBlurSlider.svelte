<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";

  export let slides = [];
  export let ctaLabel = "Voir le projet";
  const N = slides.length;

  // ── Progressive-blur ladder (sharp → strong). Adjacent levels are close,
  //    so crossfading between them reads as a true, continuous blur (no ghost).
  const BLUR_LEVELS = [0, 7, 16, 28]; // px
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
  const SEGMENT_FRAC = 1.5;   // scroll-per-slide (viewport heights). Match the CSS spacer.
  let sectionTop = 0;
  let _stickyH   = browser ? window.innerHeight : 1;
  let _segH      = _stickyH * SEGMENT_FRAC;

  // ── State ─────────────────────────────────────────────────────────────
  let activeIndex = 0;
  let _prog   = 0;     // heavily smoothed scroll progress in [0, N-1]
  let _raf    = 0;
  let _lastTs = 0;
  let _lastScroll = -1e9;
  let _lastInput  = -1e9;
  let _lastY = 0, _vel = 0, _velSmooth = 0;
  let _isCoarse = false;

  // Magnetic pull onto a sharp slide (a velocity-aware spring).
  let _settling = false, _sTarget = 0, _sVel = 0;
  let _anchor = 0;   // slide we last rested on (for directional completion)

  // ── Tunables ──────────────────────────────────────────────────────────
  const TAU         = 0.18;   // s: smoothing time-constant (high → very fluid)
  const CROSS_START = 0.5;    // segment fraction where the image swap begins
  const CROSS_END   = 0.82;   // ... and ends (fairly quick handoff)
  const SHARP_HOLD  = 0.18;   // fraction kept perfectly sharp around each slide
  const ADV_THRESH  = 0.12;   // move past this (from the anchor) → complete to the next slide
  const BLUR_END    = 0.62;   // fraction at which the outgoing image is fully blurred
  const INPUT_IDLE  = 70;     // ms after the last user input before the magnet engages
  const VEL_ENGAGE_WHEEL = 24; // px/frame: engage while still gently decelerating (desktop)
  const VEL_ENGAGE_TOUCH = 6;  // px/frame: wait for native momentum to fade (mobile)
  const SPRING_K    = 110;    // magnet stiffness (higher → snappier attraction)
  const SPRING_DAMP = 2.2 * Math.sqrt(110); // ~1.1 ratio → smooth, no overshoot
  const KEEPALIVE   = 220;    // ms: keep rendering after the last scroll tick
  const Q           = 1 / 256;

  const _bgPrev  = new Float32Array(N).fill(-1);
  const _layPrev = slides.map(() => new Float32Array(K - 1).fill(-1));

  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const maxProg = () => Math.max(0, N - 1);
  const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
  const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  // ── Measurement ───────────────────────────────────────────────────────
  function measure() {
    if (!sectionEl || !browser) return;
    sectionTop = sectionEl.getBoundingClientRect().top + (window.scrollY || 0);
    _stickyH   = stickyEl ? stickyEl.offsetHeight : window.innerHeight;
    // Derive the scroll-per-slide from the REAL spacer height → JS always
    // matches the CSS (which sets a longer segment on desktop).
    const seg  = spacerEl && N > 1 ? spacerEl.offsetHeight / (N - 1) : _stickyH * SEGMENT_FRAC;
    _segH      = Math.max(1, seg);
  }

  // ── Render (opacity only → GPU-composited, never re-rasterised) ───────
  function setOp(el, prev, idx, v) {
    const q = Math.round(clamp(v, 0, 1) / Q) * Q;
    if (q !== prev[idx]) { prev[idx] = q; if (el) el.style.opacity = q.toFixed(3); }
  }

  function render() {
    const maxP  = maxProg();
    const lo    = clamp(Math.floor(_prog), 0, maxP);
    const hi    = Math.min(lo + 1, maxP);
    const f     = lo === hi ? 0 : _prog - lo;
    const c     = smoothstep(CROSS_START, CROSS_END, f);   // 0 → lo, 1 → hi
    const steps = K - 1;

    for (let i = 0; i < N; i++) {
      let op = 0, bf = 0;
      if (i === lo)              { op = 1 - c; bf = smoothstep(SHARP_HOLD, BLUR_END, f); }
      if (i === hi && hi !== lo) { op = c;     bf = smoothstep(SHARP_HOLD, BLUR_END, 1 - f); }

      setOp(bgRefs[i], _bgPrev, i, op);

      const pos  = bf * steps;
      const refs = layerRefs[i], prev = _layPrev[i];
      for (let k = 0; k < steps; k++) setOp(refs[k], prev, k, 1 - clamp(pos - k, 0, 1));
    }

    const next = clamp(f >= (CROSS_START + CROSS_END) / 2 ? hi : lo, 0, maxP);
    if (next !== activeIndex) {
      activeIndex = next;
      // The window shifts → newly-mounted layers need their opacity re-applied.
      _bgPrev.fill(-1);
      for (const p of _layPrev) p.fill(-1);
    }
  }

  // ── Smooth pull of the real scroll onto a target (sharp slide) ────────
  function startSettle(target, vel0) {
    _sTarget = clamp(target, 0, maxScroll());
    _sVel = vel0 || 0;           // px/s — carries the in-flight scroll velocity
    _settling = true;
    wake();
  }
  function slideScroll(i) {
    sectionTop = sectionEl.getBoundingClientRect().top + (window.scrollY || 0);
    return clamp(sectionTop + clamp(i, 0, maxProg()) * _segH, 0, maxScroll());
  }
  function goNext() {
    if (!sectionEl) return;
    startSettle(slideScroll(clamp(activeIndex + 1, 0, maxProg())));
  }

  // ── Loop ──────────────────────────────────────────────────────────────
  function wake() { if (!_raf && browser) _raf = requestAnimationFrame(frame); }

  function frame(ts) {
    _raf = 0;
    if (!browser || N === 0 || !sectionEl) return;

    const dt = clamp((ts - _lastTs) || 16, 8, 50);
    _lastTs = ts;
    const dt_s = dt / 1000;

    let y = window.scrollY || 0;

    // Velocity-aware spring: carries the in-flight scroll velocity and pulls
    // smoothly onto the target sharp slide → feels like the scroll is attracted
    // there, in one continuous motion (no separate "snap").
    if (_settling) {
      const acc = -SPRING_K * (y - _sTarget) - SPRING_DAMP * _sVel;
      _sVel += acc * dt_s;
      y += _sVel * dt_s;
      window.scrollTo(0, y);
      if (Math.abs(y - _sTarget) < 0.5 && Math.abs(_sVel) < 12) {
        window.scrollTo(0, _sTarget); y = _sTarget; _sVel = 0; _settling = false;
      }
    }

    const rectTop = sectionEl.getBoundingClientRect().top;
    sectionTop = rectTop + y;
    const maxP  = maxProg();
    const range = maxP * _segH;
    const relY  = -rectTop;
    const rawProg = _segH > 0 ? clamp(relY / _segH, 0, maxP) : 0;
    _vel = y - _lastY; _lastY = y;
    _velSmooth += (_vel - _velSmooth) * 0.3;   // smoothed → clean, stable spring hand-off

    // Frame-rate independent smoothing → identical, silky feel at 60/120 Hz.
    const a = 1 - Math.exp(-dt / (TAU * 1000));
    const d = rawProg - _prog;
    if (Math.abs(d) > 0.0004) _prog += d * a;
    else                      _prog = rawProg;

    render();

    // Engage the magnet while the scroll is still gently decelerating, shortly
    // after you stop driving — so it flows out of the gesture toward the net.
    const pinned  = range > 0 && relY > -1 && relY < range + 1;
    const nearest = clamp(Math.round(rawProg), 0, maxP);
    const onNet   = Math.abs(rawProg - nearest) <= SHARP_HOLD;
    if (!_settling && onNet) _anchor = nearest;          // remember where we rest
    const velEngage = _isCoarse ? VEL_ENGAGE_TOUCH : VEL_ENGAGE_WHEEL;
    if (!_settling && pinned && !onNet && Math.abs(_vel) < velEngage
        && (ts - _lastInput) >= INPUT_IDLE) {
      // Directional: a small move toward the next slide completes to it instead
      // of snapping back, so a short scroll never returns to where you were.
      const from = rawProg - _anchor;
      let tgt;
      if (Math.abs(from) <= 1) tgt = from > ADV_THRESH ? _anchor + 1 : from < -ADV_THRESH ? _anchor - 1 : _anchor;
      else                     tgt = nearest;
      tgt = clamp(tgt, 0, maxP);
      if (!_isCoarse) window.dispatchEvent(new Event("app:wheel-damping-stop")); // cut coast
      startSettle(clamp(sectionTop + tgt * _segH, 0, maxScroll()), _velSmooth * 1000 / dt);
    }

    const moving = Math.abs(rawProg - _prog) > 0.0004;
    if (_settling || moving || (ts - _lastScroll) < KEEPALIVE) wake();
  }

  // ── Wiring (all passive — can never block or jank the page scroll) ────
  function onScroll() { _lastScroll = now(); wake(); }
  function onInput()  { _settling = false; _lastInput = now(); _lastScroll = now(); wake(); }

  let _resizeRaf = 0;
  function onResize() {
    if (_resizeRaf) cancelAnimationFrame(_resizeRaf);
    _resizeRaf = requestAnimationFrame(() => {
      _resizeRaf = 0;
      _settling = false;
      measure();
      const maxP = maxProg();
      _prog = _segH > 0 ? clamp(-(sectionEl.getBoundingClientRect().top) / _segH, 0, maxP) : 0;
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
    window.addEventListener("wheel",             onInput,  { passive: true });
    window.addEventListener("touchstart",        onInput,  { passive: true });
    window.addEventListener("keydown",           onInput,  { passive: true });
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
    window.removeEventListener("wheel",             onInput);
    window.removeEventListener("touchstart",        onInput);
    window.removeEventListener("keydown",           onInput);
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
    height: calc((var(--slide-count) - 1) * 215vh);
    height: calc((var(--slide-count) - 1) * 215lvh);
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
      height: calc((var(--slide-count) - 1) * 150vh);
      height: calc((var(--slide-count) - 1) * 150lvh);
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
</style>
