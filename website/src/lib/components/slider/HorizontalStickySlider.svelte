<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";

  export let slides = [];

  // ── Tokenise titles for per-letter reveal ─────────────────────────────
  function tokenize(str = "") {
    const out = []; let idx = 0;
    for (const line of str.split("\n")) {
      if (out.length) out.push({ br: true });
      for (const ch of line) out.push({ br: false, ch, i: idx++ });
    }
    return out;
  }
  const allTokens  = slides.map(s => tokenize(s.title));
  const charCounts = allTokens.map(t => t.filter(x => !x.br).length);
  const N = slides.length;

  // ── DOM refs ──────────────────────────────────────────────────────────
  let sectionEl, stickyEl, viewportEl, trackEl;
  const bgRefs   = slides.map(() => null);
  const spanRefs = allTokens.map(t => t.map(() => null));

  // ── Geometry ──────────────────────────────────────────────────────────
  let sectionTop = 0;
  let _stickyH   = browser ? window.innerHeight : 1;
  let _slideW    = browser ? window.innerWidth  : 1;

  // ── State ─────────────────────────────────────────────────────────────
  let activeIndex = 0;
  let _index   = 0;     // current / target slide
  let _visual  = 0;     // rendered position (follows the animated scroll)
  let _raf     = 0;
  let _lastScroll = -1e9;
  let _wasPinned  = false;
  let _lastY = 0, _vel = 0;

  // Entry freeze: hold the visuals on the entry slide until the first scroll.
  let _frozen = false, _freezeSlide = 0;

  // Animated step (the controlled motion onto a slide).
  let _anim = false, _animFrom = 0, _animTo = 0, _animStart = 0, _animDur = 0;
  let _animEase = (t) => t;

  // Gestures.
  let _wheelAccum = 0, _stepCooldown = 0;
  let _touching = false, _swiped = false, _touchPrevY = 0, _touchAccum = 0;

  // ── Tunables ──────────────────────────────────────────────────────────
  const STEP_DUR     = 520;   // ms: one slide transition (the controlled glide)
  const ENTRY_DUR    = 300;   // ms: soft, decisive landing onto a slide
  const WHEEL_STEP   = 45;    // px of wheel accumulated to advance one slide
  const STEP_COOLDOWN = 180;  // ms between two wheel steps (paces continuous scroll)
  const SWIPE_PX     = 44;    // px swipe before a slide flips
  const VEL_STOP     = 5;     // px/frame: below this the scroll counts as stopped
  const KEEPALIVE    = 160;   // ms keep rendering after the last scroll tick
  const ON_EPS       = 0.01;  // distance to a slide considered "on it"
  const Q            = 1 / 256;

  const _opPrev = allTokens.map(t => new Float32Array(t.length).fill(-1));
  const _bgPrev = new Float32Array(N).fill(-1);
  let   _prevX  = Infinity;

  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  const norm  = (v, a, b)   => clamp((v - a) / (b - a), 0, 1);
  const maxSlide = () => Math.max(0, N - 1);
  const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOutCubic   = (t) => 1 - Math.pow(1 - t, 3);
  function maxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  // ── Measurement ───────────────────────────────────────────────────────
  function measure() {
    if (!sectionEl || !browser) return;
    sectionTop = sectionEl.getBoundingClientRect().top + (window.scrollY || 0);
    _stickyH   = stickyEl ? stickyEl.offsetHeight : window.innerHeight;
    _slideW    = Math.max(1, viewportEl ? viewportEl.clientWidth : window.innerWidth);
  }
  function refreshTop() {
    if (sectionEl) sectionTop = sectionEl.getBoundingClientRect().top + (window.scrollY || 0);
  }
  function scrollForIndex(i) {
    return clamp(sectionTop + clamp(i, 0, maxSlide()) * _stickyH, 0, maxScroll());
  }
  // Slider fills the viewport (live geometry → never stale).
  function pinnedNow() {
    if (!sectionEl || !_stickyH) return false;
    const range = maxSlide() * _stickyH;
    if (range <= 0) return false;
    const relY = -sectionEl.getBoundingClientRect().top;
    return relY >= -0.5 && relY <= range + 0.5;
  }

  // ── Render ────────────────────────────────────────────────────────────
  function renderVisual() {
    if (trackEl) {
      const x  = -_visual * _slideW;
      const qx = Math.round(x / Q) * Q;
      if (qx !== _prevX) {
        trackEl.style.transform = `translate3d(${qx.toFixed(2)}px,0,0)`;
        _prevX = qx;
      }
    }

    for (let si = 0; si < N; si++) {
      const bgOpacity = Math.round(clamp(1 - Math.abs(_visual - si), 0, 1) / Q) * Q;
      if (bgOpacity !== _bgPrev[si]) {
        _bgPrev[si] = bgOpacity;
        const bg = bgRefs[si];
        if (bg) bg.style.opacity = bgOpacity.toFixed(3);
      }

      const tokens = allTokens[si];
      const total  = charCounts[si];
      const prev   = _opPrev[si];
      const refs   = spanRefs[si];
      const enter  = norm(_visual, si - 0.5, si);
      const exit   = norm(_visual, si, si + 0.5);
      for (let t = 0; t < tokens.length; t++) {
        if (tokens[t].br) continue;
        const frac  = tokens[t].i / (total - 1 || 1);
        const inOp  = norm(enter, frac * 0.26, frac * 0.26 + 0.74);
        const outOp = 1 - norm(exit, frac * 0.26, frac * 0.26 + 0.74);
        const qop   = Math.round(clamp(Math.min(inOp, outOp), 0, 1) / Q) * Q;
        if (qop === prev[t]) continue;
        prev[t] = qop;
        const el = refs[t];
        if (el) el.style.opacity = qop.toFixed(3);
      }
    }

    const next = clamp(Math.round(_visual), 0, maxSlide());
    if (next !== activeIndex) activeIndex = next;
  }

  // ── Animated step (controls the motion → lands cleanly on a slide) ─────
  function wake() { if (!_raf && browser) _raf = requestAnimationFrame(frame); }

  function startAnim(target, dur, ts, ease) {
    refreshTop();
    // Kill any in-flight wheel-damping momentum so our glide never fights it.
    window.dispatchEvent(new Event("app:wheel-damping-stop"));
    const to = scrollForIndex(target);
    const from = window.scrollY || 0;
    _index = clamp(target, 0, maxSlide());
    if (Math.abs(to - from) < 1) { _anim = false; return; }
    _anim = true; _animFrom = from; _animTo = to; _animStart = ts; _animDur = dur;
    _animEase = ease || easeInOutCubic;
    wake();
  }
  function stepTo(target, ts) { startAnim(target, STEP_DUR, ts); }

  // First scroll while frozen: snap the scroll onto the frozen slide (invisible
  // — the visuals were already there) and release control to normal stepping.
  function unfreeze() {
    window.scrollTo(0, scrollForIndex(_freezeSlide));
    _lastY = window.scrollY || 0;
    _vel = 0;
    _index = _freezeSlide;
    _frozen = false;
    _anim = false;
  }

  function frame(ts) {
    _raf = 0;
    if (!browser || N === 0 || !sectionEl) return;

    let y = window.scrollY || 0;

    if (_anim) {
      const t = clamp((ts - _animStart) / _animDur, 0, 1);
      y = _animFrom + (_animTo - _animFrom) * _animEase(t);
      window.scrollTo(0, y);
      if (t >= 1) _anim = false;
    }

    // One layout read per frame → sectionTop + pinned from a single rect.
    const rectTop = sectionEl.getBoundingClientRect().top;
    sectionTop = rectTop + y;
    const maxS  = maxSlide();
    const range = maxS * _stickyH;
    const relY  = -rectTop;                          // = y - sectionTop
    const rawP  = range > 0 ? clamp(relY / _stickyH, 0, maxS) : 0;
    const pinned  = range > 0 && relY >= -0.5 && relY <= range + 0.5;
    const onSlide = Math.abs(rawP - Math.round(rawP)) <= ON_EPS;
    _vel = y - _lastY; _lastY = y;

    // Arrived fullscreen → freeze the visuals on the entry slide (slide 0 from
    // the top, last from the bottom — from the scroll direction).
    if (pinned && !_wasPinned) {
      _wasPinned = true;
      window.dispatchEvent(new Event("app:wheel-damping-stop")); // cut desktop momentum
      _freezeSlide = _vel > 0.5 ? 0 : _vel < -0.5 ? maxS : clamp(Math.round(rawP), 0, maxS);
      _index = _freezeSlide;
      _frozen = true; _anim = false;
      _wheelAccum = 0; _stepCooldown = 0;
    } else if (!pinned) {
      _wasPinned = false;
      _frozen = false;               // scrolled out → drop the freeze
    }

    if (_frozen) {
      _visual = _freezeSlide;         // visuals held on the entry slide
      // Momentum dead → snap onto the slide (invisible) and hand back control.
      if (!_touching && Math.abs(_vel) < VEL_STOP) unfreeze();
    } else {
      _visual = rawP;                 // locked 1:1 to the scroll the step animates
      if (!_anim && onSlide) _index = Math.round(rawP);
      // Settle stray (keyboard / scrollbar) scrolls onto a slide.
      if (!_anim && pinned && !onSlide && !_touching && Math.abs(_vel) < VEL_STOP) {
        startAnim(clamp(Math.round(rawP), 0, maxS), ENTRY_DUR, ts, easeOutCubic);
      }
    }

    renderVisual();

    if (_anim || _frozen || (ts - _lastScroll) < KEEPALIVE || (pinned && !onSlide)) wake();
  }

  // ── Input (scoped to the section → the rest of the page is never touched) ─
  function onWheel(e) {
    const t = now();
    if (!pinnedNow()) { _wheelAccum = 0; return; }     // not full-screen → page scrolls
    if (e.ctrlKey) return;                              // zoom
    const dy = e.deltaY;
    if (!dy) return;
    if (_frozen) unfreeze();                            // first scroll → unfreeze
    const dir = dy > 0 ? 1 : -1;
    const target = _index + dir;
    if (target < 0 || target > maxSlide()) { _wheelAccum = 0; return; } // boundary → exit
    e.preventDefault();
    e.stopPropagation();                               // keep the wheel-damping out of it
    _lastScroll = t;
    if (_wheelAccum !== 0 && Math.sign(_wheelAccum) !== dir) _wheelAccum = 0; // direction flip
    _wheelAccum += dy;
    if (t >= _stepCooldown && Math.abs(_wheelAccum) >= WHEEL_STEP) {
      _wheelAccum = 0;
      _stepCooldown = t + STEP_COOLDOWN;
      stepTo(_index + dir, t);                          // advance exactly one slide
    }
  }

  function onTouchStart(e) {
    _touching = true; _swiped = false; _touchAccum = 0;
    _touchPrevY = e.touches?.[0]?.clientY ?? 0;
    _lastScroll = now(); wake();
  }
  function onTouchMove(e) {
    if (!_touching || !e.touches || e.touches.length !== 1) return; // ignore pinch
    if (!pinnedNow()) return;
    const y = e.touches[0].clientY;
    const dy = _touchPrevY - y;
    _touchPrevY = y;
    if (Math.abs(dy) < 0.5 && _touchAccum === 0) return;
    if (_frozen) unfreeze();                            // first swipe → unfreeze
    _touchAccum += dy;
    const dir = _touchAccum > 0 ? 1 : -1;
    const target = _index + dir;
    if (target < 0 || target > maxSlide()) return;     // boundary → native page exit
    e.preventDefault();
    e.stopPropagation();
    _lastScroll = now();
    if (_swiped) return;
    if (Math.abs(_touchAccum) >= SWIPE_PX) { _swiped = true; stepTo(target, now()); }
  }
  function onTouchEnd() {
    _touching = false; _swiped = false; _touchAccum = 0; _lastScroll = now();
  }

  function onScroll() { _lastScroll = now(); wake(); }

  let _resizeRaf = 0;
  function onResize() {
    if (_resizeRaf) cancelAnimationFrame(_resizeRaf);
    _resizeRaf = requestAnimationFrame(() => {
      _resizeRaf = 0;
      _anim = false; _prevX = Infinity;
      const keep = pinnedNow();
      measure();
      if (keep) window.scrollTo(0, scrollForIndex(_index));
      refreshTop();
      const range = maxSlide() * _stickyH;
      _visual = range > 0 ? clamp(((window.scrollY || 0) - sectionTop) / _stickyH, 0, maxSlide()) : 0;
      _index = clamp(Math.round(_visual), 0, maxSlide());
      renderVisual(); wake();
    });
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────
  let _bodyObs;
  onMount(() => {
    if (!browser || N === 0) return;

    measure();
    requestAnimationFrame(() => requestAnimationFrame(() => { measure(); onResize(); }));

    // Section-scoped → cannot affect (or block) scrolling anywhere else.
    sectionEl.addEventListener("wheel",       onWheel,      { passive: false });
    sectionEl.addEventListener("touchstart",  onTouchStart, { passive: true });
    sectionEl.addEventListener("touchmove",   onTouchMove,  { passive: false });
    sectionEl.addEventListener("touchend",    onTouchEnd,   { passive: true });
    sectionEl.addEventListener("touchcancel", onTouchEnd,   { passive: true });

    window.addEventListener("scroll",            onScroll, { passive: true });
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
    if (sectionEl) {
      sectionEl.removeEventListener("wheel",       onWheel);
      sectionEl.removeEventListener("touchstart",  onTouchStart);
      sectionEl.removeEventListener("touchmove",   onTouchMove);
      sectionEl.removeEventListener("touchend",    onTouchEnd);
      sectionEl.removeEventListener("touchcancel", onTouchEnd);
    }
    window.removeEventListener("scroll",            onScroll);
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
  class="hss"
  bind:this={sectionEl}
  style="--slide-count:{N}"
  aria-roledescription="carrousel"
  aria-label="Sélection de projets"
>
  <div class="hss__sticky" bind:this={stickyEl}>

    <!-- Crossfade backgrounds (stay in place, fill the whole sticky) -->
    <div class="hss__bgs" aria-hidden="true">
      {#each slides as slide, i}
        <div
          class="hss__bg"
          bind:this={bgRefs[i]}
          style="opacity:{i === 0 ? 1 : 0}"
        >
          <img
            src={slide.image} alt=""
            loading="eager"
            decoding="async"
            draggable="false" />
        </div>
      {/each}
      <div class="hss__overlay"></div>
    </div>

    <!-- Horizontal titles track (translated by JS) -->
    <div class="hss__viewport" bind:this={viewportEl}>
      <div class="hss__track" bind:this={trackEl} aria-hidden="true">
        {#each slides as _s, i}
          <div class="hss__panel">
            <h2 class="hss__title">
              {#each allTokens[i] as token, t}
                {#if token.br}<br />{:else}<span bind:this={spanRefs[i][t]}>{token.ch}</span>{/if}
              {/each}
            </h2>
          </div>
        {/each}
      </div>
    </div>

    <!-- Scroll hint arrow -->
    <div class="hss__arrow-cue" aria-hidden="true">
      <span class="hss__arrow-symbol">↓</span>
    </div>

    <!-- Bottom: gradient + captions + buttons (swap in place) -->
    <div class="hss__bottom">
      <div class="hss__bottom-grad" aria-hidden="true"></div>
      <div class="hss__captions" aria-live="polite">
        {#each slides as slide, i}
          <div
            class="hss__caption"
            class:is-active={activeIndex === i}
            aria-hidden={activeIndex !== i ? "true" : undefined}
          >
            {#each (slide.description ?? "").split("\n").filter(Boolean) as line, li}
              <span class="hss__caption-line" style="--li:{li}">
                <span>{line}</span>
              </span>
            {/each}
            {#if slide.href}
              <a
                href={slide.href}
                class="hss__btn"
                tabindex={activeIndex === i ? 0 : -1}
                aria-label={"Voir le projet " + (slide.title ?? "").replace(/\n/g, " ")}
              >
                <span class="hss__btn-inner" data-text="Voir le projet">
                  <span class="hss__btn-text">Voir le projet</span>
                </span>
              </a>
            {/if}
          </div>
        {/each}
      </div>
    </div>

  </div>

  <!-- Vertical scroll course that drives the horizontal slider -->
  <div class="hss__spacer" aria-hidden="true"></div>
</section>
{/if}

<style>
  .hss {
    position: relative;
    z-index: 2;
    width: 100%;
    background: #050b14;
    /* Distance the Safari mobile URL bar occupies. 0 on desktop / when shown. */
    --bar-inset: 0px;
    --bar-inset: calc(100lvh - 100svh);
  }

  /* ── Sticky panel ───────────────────────────────────────────────────── */
  .hss__sticky {
    position: sticky;
    top: 0;
    /* Fixed LARGE viewport height: always fills the screen even when the
       Safari URL bar retracts, and never resizes (content stays put). */
    height: 100vh;
    height: 100lvh;
    overflow: hidden;
    isolation: isolate;
    background: #050b14;
  }

  .hss__spacer {
    height: calc((var(--slide-count) - 1) * 100vh);
    height: calc((var(--slide-count) - 1) * 100lvh);
  }

  /* ── Backgrounds ────────────────────────────────────────────────────── */
  .hss__bgs {
    position: absolute; inset: 0; z-index: 0;
    background: #050b14; pointer-events: none;
  }
  .hss__bg {
    position: absolute; inset: 0;
    opacity: 0;
    will-change: opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
  }
  .hss__bg img {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover; display: block; pointer-events: none;
    transform: translateZ(0);
    backface-visibility: hidden;
  }
  .hss__overlay {
    position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(to bottom,
      rgba(0,0,0,.55) 0%, rgba(0,0,0,.10) 30%, rgba(0,0,0,0) 55%);
  }

  /* ── Viewport (clips the horizontal track) ──────────────────────────── */
  .hss__viewport {
    position: absolute; inset: 0; z-index: 1;
    overflow: hidden;
  }

  /* ── Track ──────────────────────────────────────────────────────────── */
  .hss__track {
    display: flex; height: 100%;
    width: calc(var(--slide-count) * 100%);
    will-change: transform;
    transform: translate3d(0, 0, 0);
  }
  .hss__panel {
    flex: 0 0 calc(100% / var(--slide-count));
    width: calc(100% / var(--slide-count));
    height: 100%;
    display: flex;
    align-items: flex-start;
    padding: clamp(6rem, 10vw, 9rem) clamp(1.5rem, 5.5vw, 5.5rem) 0;
  }

  /* ── Title ──────────────────────────────────────────────────────────── */
  .hss__title {
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
  }
  .hss__title span {
    display: inline;
    opacity: 1; /* JS overrides per-letter */
  }

  /* ── Bottom bar (lifted above the URL-bar zone so it stays visible) ──── */
  .hss__bottom {
    /* Gradient reaches the TRUE bottom (lvh) so no hole appears when the
       Safari URL bar retracts; captions are lifted separately below. */
    position: absolute; bottom: 0; left: 0; right: 0;
    height: calc(clamp(14rem, 34vh, 26rem) + var(--bar-inset));
    z-index: 2;
    pointer-events: none;
  }
  .hss__bottom-grad {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom,
      rgba(0,0,0,0) 0%, rgba(0,0,0,.48) 42%, rgba(0,0,0,.88) 100%);
  }
  .hss__captions {
    position: absolute;
    bottom: calc(var(--bar-inset) + clamp(2.5rem, 5vw, 4rem));
    left: clamp(1.5rem, 5.5vw, 5.5rem);
    z-index: 1;
    min-height: 8rem;
  }
  .hss__caption { position: absolute; bottom: 0; left: 0; }
  .hss__caption-line { display: block; overflow: hidden; }
  .hss__caption-line > span {
    display: block;
    font-family: var(--site-font, "Inter", sans-serif);
    font-weight: 300;
    font-size: clamp(1rem, 1.15vw, 1.2rem);
    line-height: 1.55;
    color: rgba(255,255,255,.88);
    white-space: nowrap;
    opacity: 0;
    filter: blur(8px);
    transform: translate3d(0, 110%, 0);
    transition: transform .42s cubic-bezier(.22,.61,.36,1), opacity .3s ease, filter .57s cubic-bezier(.22,.61,.36,1);
    transition-delay: 0s;
    will-change: transform, opacity;
    backface-visibility: hidden;
  }
  .hss__caption.is-active .hss__caption-line > span {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
    transition-delay: calc(var(--li, 0) * .045s);
  }

  /* ── Button ─────────────────────────────────────────────────────────── */
  .hss__btn {
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
    overflow: hidden;
    pointer-events: none;
    opacity: 0;
    transform: translate3d(0, 110%, 0);
    transition: transform .42s cubic-bezier(.22,.61,.36,1), opacity .3s ease;
    transition-delay: 0s;
    will-change: transform, opacity;
    backface-visibility: hidden;
  }
  .hss__caption.is-active .hss__btn {
    opacity: 1;
    transform: translate3d(0, 0, 0);
    transition-delay: .08s;
    pointer-events: auto;
  }
  .hss__btn:focus-visible {
    outline: 2px solid rgba(245,241,232,.9);
    outline-offset: 3px;
  }
  .hss__btn-inner {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
  }
  .hss__btn-text {
    display: block;
    transition: transform .42s cubic-bezier(.22,.61,.36,1);
  }
  .hss__btn-inner::after {
    content: attr(data-text);
    position: absolute; left: 0; top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition: transform .42s cubic-bezier(.22,.61,.36,1);
    white-space: nowrap;
  }
  .hss__btn:hover .hss__btn-text { transform: translateY(-100%); }
  .hss__btn:hover .hss__btn-inner::after { transform: translateY(0); }

  /* ── Scroll arrow ───────────────────────────────────────────────────── */
  .hss__arrow-cue {
    position: absolute;
    right: clamp(1.5rem, 5.5vw, 5.5rem);
    bottom: calc(var(--bar-inset) + clamp(2.5rem, 5vw, 4rem));
    z-index: 3;
    pointer-events: none;
  }
  .hss__arrow-symbol {
    display: block;
    font-family: var(--site-font, "Inter", sans-serif);
    font-size: clamp(1.1rem, 1.1vw, 1.2rem);
    font-weight: 300;
    color: #fff;
    line-height: 1;
  }

  /* ── Responsive ─────────────────────────────────────────────────────── */
  @media (max-width: 1024px) {
    .hss__title { font-size: clamp(3.2rem, 8vw, 6rem); }
  }

  @media (max-width: 900px) {
    .hss__panel {
      padding: clamp(5rem, 14vh, 7rem) 1.25rem 0;
    }
    .hss__title {
      font-size: clamp(2.6rem, 12vw, 4.6rem);
      max-width: 100%;
    }
    .hss__captions {
      bottom: calc(var(--bar-inset) + clamp(3.5rem, 9vh, 5.5rem));
      left: 1.25rem;
    }
    .hss__caption-line > span {
      font-size: clamp(.95rem, 3.8vw, 1.1rem);
    }
    .hss__btn {
      height: 36px;
      font-size: .84rem;
      padding: 0 1.2rem;
    }
    .hss__arrow-cue {
      right: 1.25rem;
      bottom: calc(var(--bar-inset) + clamp(3.5rem, 9vh, 5.5rem));
    }
  }

  @media (max-width: 480px) {
    .hss__title { font-size: clamp(2.2rem, 14vw, 3.6rem); }
    .hss__caption-line > span { font-size: clamp(.92rem, 4.2vw, 1.05rem); }
  }

  @media (prefers-reduced-motion: reduce) {
    .hss__caption-line > span, .hss__btn { transition: none; }
    .hss__caption.is-active .hss__caption-line > span,
    .hss__caption.is-active .hss__btn { opacity: 1; transform: none; }
    .hss__title span { opacity: 1 !important; transition: none; }
  }

  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .hss__bottom { height: calc(clamp(7rem, 18vh, 11rem) + var(--bar-inset)); }
    .hss__panel { padding-top: clamp(3.5rem, 7vw, 5rem); }
  }
</style>
