<script>
  import { tick, onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { navigate } from "$lib/navigate.js";

  export let open = false;
  export let origin = { x: 0, y: 0, width: 44, height: 40 };

  let visible = false;
  let expanded = false;
  let contentVisible = false;
  let closing = false;
  let navigating = false;
  let retracting = false;
  let activeIndex = null;
  let isMobile = false;

  let raf1;
  let raf2;
  let openContentTimer;
  let navigateTimer;
  let wipeRetractTimer;
  let finalCloseTimer;
  let releaseTransitionTimer;

  const OPEN_CONTENT_DELAY = 1080;
  const CONTENT_OUT_BEFORE_WIPE = 760;
  const CLOSE_WIPE_MS = 1180;
  const NAVIGATE_DELAY = 140;

  const links = [
    { label: "L'envol", page: "home", image: "images/photo.webp" },
    { label: "Projets", page: "travail", image: "images/parfum4.webp" },
    { label: "À propos", page: "apropos", image: "images/parfum3.webp" },
    { label: "Services", page: "services", image: "images/parfum2.webp" },
    { label: "Contact", page: "contact", image: "images/photo2.webp" }
  ];

  function checkMobile() {
    isMobile = window.innerWidth <= 900;
  }

  function clearAsync() {
    cancelAnimationFrame(raf1);
    cancelAnimationFrame(raf2);
    clearTimeout(openContentTimer);
    clearTimeout(navigateTimer);
    clearTimeout(wipeRetractTimer);
    clearTimeout(finalCloseTimer);
    clearTimeout(releaseTransitionTimer);
  }

  function setMenuTransitionSuppressed(value) {
    if (!browser) return;

    if (value) {
      document.documentElement.classList.add("fs-menu-route-transition");
    } else {
      document.documentElement.classList.remove("fs-menu-route-transition");
    }
  }

  function finishClose() {
    visible = false;
    expanded = false;
    contentVisible = false;
    closing = false;
    navigating = false;
    retracting = false;
    open = false;
    document.body.classList.remove("menu-open");

    releaseTransitionTimer = setTimeout(() => {
      setMenuTransitionSuppressed(false);
    }, 80);
  }

  function startOpen() {
    clearAsync();

    visible = true;
    expanded = false;
    contentVisible = false;
    closing = false;
    navigating = false;
    retracting = false;
    activeIndex = null;

    document.body.classList.add("menu-open");

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        expanded = true;
      });
    });

    openContentTimer = setTimeout(() => {
      contentVisible = true;
    }, isMobile ? 1020 : OPEN_CONTENT_DELAY);
  }

  function startClose() {
    if (!visible || closing || navigating) return;

    clearAsync();

    closing = true;
    retracting = false;
    contentVisible = false;
    activeIndex = null;

    wipeRetractTimer = setTimeout(() => {
      retracting = true;
      expanded = false;
    }, isMobile ? 720 : CONTENT_OUT_BEFORE_WIPE);

    finalCloseTimer = setTimeout(() => {
      finishClose();
    }, (isMobile ? 720 : CONTENT_OUT_BEFORE_WIPE) + (isMobile ? 1080 : CLOSE_WIPE_MS));
  }

  $: if (open && !visible) {
    startOpen();
  }

  $: if (!open && visible && !closing && !navigating) {
    startClose();
  }

  onMount(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
  });

  onDestroy(() => {
    if (!browser) return;
    clearAsync();
    window.removeEventListener("resize", checkMobile);
    document.body.classList.remove("menu-open");
    setMenuTransitionSuppressed(false);
  });

  async function close() {
    if (closing || navigating) return;
    open = false;
    await tick();
  }

  async function handleClick(link, index) {
    if (closing || navigating) return;

    if (isMobile && activeIndex !== index) {
      activeIndex = index;
      return;
    }

    if (!link.page) {
      close();
      return;
    }

    clearAsync();

    navigating = true;
    closing = true;
    retracting = false;
    activeIndex = null;
    contentVisible = false;

    setMenuTransitionSuppressed(true);

    navigateTimer = setTimeout(() => {
      navigate(link.page);
    }, isMobile ? 120 : NAVIGATE_DELAY);

    wipeRetractTimer = setTimeout(() => {
      retracting = true;
      expanded = false;
    }, isMobile ? 720 : CONTENT_OUT_BEFORE_WIPE);

    finalCloseTimer = setTimeout(() => {
      finishClose();
    }, (isMobile ? 720 : CONTENT_OUT_BEFORE_WIPE) + (isMobile ? 1080 : CLOSE_WIPE_MS));

    open = false;
    await tick();
  }

  function handleEnter(index) {
    activeIndex = index;
  }

  function handleLeave(index) {
    if (!isMobile && activeIndex === index) {
      activeIndex = null;
    }
  }

  function handleGlowMove(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  $: originStyle = `
    --origin-x:${origin?.x ?? 0}px;
    --origin-y:${origin?.y ?? 0}px;
    --origin-w:${origin?.width ?? 44}px;
    --origin-h:${origin?.height ?? 40}px;
  `;
</script>

<div
  class="fs-menu {visible ? 'is-visible' : ''} {expanded ? 'expanded' : ''} {contentVisible ? 'content-visible' : ''} {closing ? 'is-closing' : ''} {navigating ? 'is-navigating' : ''} {retracting ? 'is-retracting' : ''} {isMobile ? 'mobile' : ''}"
  style={originStyle}
  aria-hidden={!visible}
>
  <div
    class="bg-hit"
    role="button"
    tabindex="0"
    aria-label="Fermer le menu"
    on:click={close}
    on:keydown={(e) => {
      if (e.key === "Enter" || e.key === " ") close();
    }}
  ></div>

  <div class="menu-scrim"></div>
  <div class="menu-blur"></div>
  <div class="wipe-panel"></div>

  <div class="topbar ui-el">
    <div class="meta">Agence 3 Terres</div>

    <button
      class="nav-btn close-block"
      type="button"
      aria-label="Fermer le menu"
      on:mousemove={handleGlowMove}
      on:click|stopPropagation={close}
    >
      <svg class="close-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6L18 18" />
        <path d="M18 6L6 18" />
      </svg>
    </button>
  </div>

  <nav class="menu-accordion ui-el" aria-label="Navigation principale">
    {#each links as link, i}
      <button
        class="menu-item"
        class:active={activeIndex === i}
        style="--i:{i}"
        type="button"
        on:mouseenter={() => handleEnter(i)}
        on:mouseleave={() => handleLeave(i)}
        on:mousemove={handleGlowMove}
        on:click={() => handleClick(link, i)}
      >
        <div class="menu-item-bg">
          <img src={link.image} alt={link.label} loading="lazy" />
          <div class="menu-item-overlay"></div>
        </div>

        <div class="menu-item-content">
          <span class="menu-index">0{i + 1}</span>
          <span class="menu-label">{link.label}</span>
        </div>
      </button>
    {/each}
  </nav>

  <div class="bottom-bar ui-el">
    <div class="bottom-col">
      <div class="bottom-label">Email</div>
      <a href="mailto:contact@agence3terres.com">contact@agence3terres.com</a>
    </div>

    <div class="bottom-col center-note">
      <div class="bottom-label">Paris / France</div>
      <span>Branding · Direction artistique · Digital</span>
    </div>

    <div class="bottom-col bottom-right">
      <div class="bottom-label">Suivre</div>
      <div class="socials">
        <a href="/" on:click|preventDefault={() => {}}>Instagram</a>
        <a href="/" on:click|preventDefault={() => {}}>LinkedIn</a>
        <a href="/" on:click|preventDefault={() => {}}>Behance</a>
      </div>
    </div>
  </div>
</div>

<style>
  :global(body.menu-open) {
    overflow: hidden;
    touch-action: none;
  }

  :global(html.fs-menu-route-transition .route-transition-layer) {
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }

  .fs-menu {
    position: fixed;
    inset: 0;
    z-index: 9999;
    overflow: hidden;
    color: #f5f1e8;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    background: transparent;
  }

  .fs-menu.is-visible {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  .bg-hit {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: transparent;
  }

  .menu-scrim {
    position: absolute;
    inset: 0;
    z-index: 2;
    opacity: 0;
    background: rgba(0, 0, 0, 0.44);
    transition: opacity 1.1s cubic-bezier(.23, 1, .32, 1);
    pointer-events: none;
  }

  .menu-blur {
    position: absolute;
    inset: 0;
    z-index: 3;
    opacity: 0;
    backdrop-filter: blur(0px);
    -webkit-backdrop-filter: blur(0px);
    transition:
      opacity 1.1s cubic-bezier(.23, 1, .32, 1),
      backdrop-filter 1.1s cubic-bezier(.23, 1, .32, 1),
      -webkit-backdrop-filter 1.1s cubic-bezier(.23, 1, .32, 1);
    pointer-events: none;
  }

  .wipe-panel {
    position: absolute;
    left: -10vw;
    top: -140px;
    width: 120vw;
    height: calc(100vh + 280px);
    z-index: 4;
    opacity: 0;
    background: linear-gradient(
      to bottom,
      #111 0%,
      #101010 24%,
      #0a0a0a 58%,
      #000 100%
    );
    transform: translate3d(0, calc(-100% - 140px), 0);
    will-change: transform, opacity;
    pointer-events: none;
    transition:
      transform 1.18s cubic-bezier(.2, .88, .22, 1),
      opacity 0.36s ease;
  }

  .fs-menu.expanded .menu-scrim {
    opacity: 1;
  }

  .fs-menu.expanded .menu-blur {
    opacity: 1;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .fs-menu.expanded .wipe-panel {
    opacity: 1;
    transform: translate3d(0, 140px, 0);
  }

  .ui-el {
    opacity: 0;
    filter: blur(16px);
    transform: translate3d(0, 30px, 0);
    transition:
      opacity 1s ease,
      filter 1.28s cubic-bezier(.22, 1, .36, 1),
      transform 1.28s cubic-bezier(.22, 1, .36, 1);
  }

  .fs-menu.content-visible .ui-el {
    opacity: 1;
    filter: blur(0px);
    transform: translate3d(0, 0, 0);
  }

  .fs-menu.is-closing .ui-el,
  .fs-menu.is-navigating .ui-el {
    opacity: 0;
    filter: blur(16px);
    transform: translate3d(0, -28px, 0);
  }

  .fs-menu.is-retracting .wipe-panel {
    transform: translate3d(0, calc(-100% - 140px), 0);
    transition:
      transform 1.18s cubic-bezier(.2, .88, .22, 1),
      opacity 0.36s ease;
  }

  .fs-menu.is-retracting .menu-scrim {
    opacity: 0;
  }

  .fs-menu.is-retracting .menu-blur {
    opacity: 0;
    backdrop-filter: blur(0px);
    -webkit-backdrop-filter: blur(0px);
  }

  .topbar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 40;
    height: 96px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
    pointer-events: none;
  }

  .meta {
    font-family: "Manrope", sans-serif;
    font-size: 0.75rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(245, 241, 232, 0.62);
    pointer-events: none;
  }

  .nav-btn {
    position: relative;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 1.5rem;
    font-size: 0.9rem;
    font-family: inherit;
    white-space: nowrap;
    color: inherit;
    border: none;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 3px;
    box-shadow:
      0 8px 10px rgba(0, 0, 0, 0.06),
      inset 0 0 0 0 rgba(255, 255, 255, 0.4);
    transition:
      transform 1.2s cubic-bezier(.22,.61,.36,1),
      box-shadow 1.2s cubic-bezier(.22,.61,.36,1),
      background 1.2s cubic-bezier(.22,.61,.36,1);
  }

  .nav-btn::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: radial-gradient(
      80px circle at var(--mx, 50%) var(--my, 50%),
      rgba(212, 175, 55, 0.95),
      rgba(212, 102, 55, 0.45) 40%,
      transparent 75%
    );
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;
    filter: drop-shadow(0 0 3px rgba(212, 175, 55, 0.35));
  }

  .nav-btn:hover::before {
    opacity: 1;
  }

  .close-block {
    pointer-events: auto;
    width: 44px;
    min-width: 44px;
    padding: 0;
  }

  .close-icon {
    width: 18px;
    height: 18px;
    stroke: currentColor;
    stroke-width: 1.8;
    fill: none;
    transition: transform 0.5s ease;
    pointer-events: none;
  }

  .close-block:hover .close-icon {
    transform: rotate(90deg) scale(1.15);
  }

  .menu-accordion {
    position: absolute;
    inset: 0;
    z-index: 20;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-top: 96px;
    padding-bottom: 112px;
  }

  .menu-item {
    position: relative;
    width: 100%;
    min-height: clamp(84px, 9.6vh, 116px);
    height: clamp(84px, 9.6vh, 116px);
    border: 0;
    padding: 0;
    margin: 0;
    color: inherit;
    background: transparent;
    cursor: pointer;
    overflow: hidden;
    transition: height 560ms cubic-bezier(.22,1,.36,1);
  }

  .menu-item:nth-child(1) { background: #151515; }
  .menu-item:nth-child(2) { background: #111; }
  .menu-item:nth-child(3) { background: #0c0c0c; }
  .menu-item:nth-child(4) { background: #070707; }
  .menu-item:nth-child(5) { background: #000; }

  .menu-item.active {
    height: clamp(170px, 21vh, 250px);
  }

  .menu-item::before {
    content: "";
    position: absolute;
    inset: 0;
    padding: 1px;
    background: radial-gradient(
      110px circle at var(--mx, 50%) var(--my, 50%),
      rgba(212, 175, 55, 0.98),
      rgba(212, 102, 55, 0.58) 34%,
      rgba(212, 175, 55, 0.22) 56%,
      transparent 74%
    );
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    pointer-events: none;
    filter:
      drop-shadow(0 0 4px rgba(212, 175, 55, 0.42))
      drop-shadow(0 0 12px rgba(212, 102, 55, 0.18));
    z-index: 5;
    transition: opacity 0.2s ease;
  }

  .menu-item:hover::before,
  .menu-item.active::before {
    opacity: 1;
  }

  .menu-item::after {
    content: "";
    position: absolute;
    inset: -1px;
    pointer-events: none;
    z-index: 4;
    box-shadow:
      inset 0 0 0 1px rgba(255,255,255,0.04),
      0 0 0 1px rgba(212, 175, 55, 0),
      0 0 24px rgba(212, 175, 55, 0);
    transition: box-shadow 0.28s ease;
  }

  .menu-item:hover::after,
  .menu-item.active::after {
    box-shadow:
      inset 0 0 0 1px rgba(255,255,255,0.06),
      0 0 0 1px rgba(212, 175, 55, 0.16),
      0 0 24px rgba(212, 175, 55, 0.08);
  }

  .menu-item-bg {
    position: absolute;
    inset: 0;
    z-index: 1;
    overflow: hidden;
  }

  .menu-item-bg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.04);
    opacity: 0;
    filter: brightness(0.64) saturate(0.9) contrast(1.04);
    transition:
      transform 650ms cubic-bezier(.22,1,.36,1),
      opacity 340ms ease,
      filter 340ms ease;
    will-change: transform, opacity;
  }

  .menu-item.active .menu-item-bg img {
    opacity: 1;
    transform: scale(1);
    filter: brightness(0.82) saturate(1) contrast(1.05);
  }

  .menu-item-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(0,0,0,0.42), rgba(0,0,0,0.18)),
      linear-gradient(90deg, rgba(0,0,0,0.14), rgba(0,0,0,0.08));
    opacity: 0;
    transition: opacity 0.28s ease;
    pointer-events: none;
  }

  .menu-item.active .menu-item-overlay {
    opacity: 1;
  }

  .menu-item-content {
    position: relative;
    z-index: 2;
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.4rem 4.4rem;
  }

  .menu-label {
    font-family: "Iowan Old Style", "Georgia", "Times New Roman", serif;
    font-weight: 500;
    font-size: clamp(1.9rem, 4vw, 4.8rem);
    line-height: 0.96;
    letter-spacing: -0.045em;
    color: #f5f1e8;
    text-align: center;
    transition:
      opacity 260ms ease,
      text-shadow 0.28s ease;
  }

  .menu-item.active .menu-label {
    text-shadow: 0 6px 28px rgba(0,0,0,0.28);
  }

  .menu-index {
    position: absolute;
    right: clamp(1rem, 2.4vw, 2rem);
    top: 50%;
    transform: translateY(-50%);
    font-family: "Iowan Old Style", "Georgia", "Times New Roman", serif;
    font-size: clamp(1.1rem, 1.8vw, 2rem);
    line-height: 1;
    letter-spacing: -0.04em;
    color: rgba(245, 241, 232, 0.92);
    z-index: 2;
  }

  .bottom-bar {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 30;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 24px;
    align-items: end;
    padding: 24px 2rem 26px;
    pointer-events: none;
  }

  .bottom-col {
    display: flex;
    flex-direction: column;
    gap: 7px;
    min-width: 0;
    pointer-events: auto;
  }

  .bottom-right {
    align-items: flex-end;
    text-align: right;
  }

  .center-note {
    align-items: center;
    text-align: center;
  }

  .bottom-label {
    font-family: "Geist Mono", monospace;
    font-size: 0.68rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    opacity: 0.45;
  }

  .bottom-bar a,
  .bottom-bar span {
    color: #f5f1e8;
    text-decoration: none;
    font-family: "Manrope", sans-serif;
    font-size: 0.96rem;
    line-height: 1.4;
    opacity: 0.9;
    transition: opacity 0.35s ease;
  }

  .bottom-bar a:hover {
    opacity: 1;
  }

  .socials {
    display: flex;
    gap: 18px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  @media (max-width: 900px) {
    .topbar {
      height: 84px;
      padding: 0 1rem;
    }

    .meta {
      font-size: 0.68rem;
      letter-spacing: 0.16em;
    }

    .close-block {
      width: 44px;
      height: 40px;
    }

    .menu-accordion {
      padding-top: 84px;
      padding-bottom: 172px;
    }

    .menu-item {
      height: 82px;
      min-height: 82px;
    }

    .menu-item.active {
      height: 162px;
    }

    .menu-label {
      font-size: clamp(1.6rem, 7vw, 2.8rem);
    }

    .menu-index {
      right: 1rem;
      font-size: 1.1rem;
    }

    .menu-item-content {
      padding: 1rem 3.4rem 1rem 1rem;
    }

    .bottom-bar {
      grid-template-columns: 1fr;
      gap: 16px;
      padding: 18px 1rem 22px;
    }

    .bottom-col,
    .bottom-right,
    .center-note {
      align-items: center;
      text-align: center;
    }

    .socials {
      justify-content: center;
      gap: 14px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .menu-scrim,
    .menu-blur,
    .wipe-panel,
    .ui-el,
    .menu-item,
    .menu-item-bg img,
    .menu-item-overlay,
    .menu-label,
    .close-icon {
      transition: none !important;
      animation: none !important;
      filter: none !important;
    }
  }
</style>