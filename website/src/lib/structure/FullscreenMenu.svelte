<script>
  import { tick, onMount, onDestroy } from "svelte";

  export let open = false;
  export let navigate;
  export let origin = { x: 0, y: 0, width: 44, height: 40 };

  let visible = false;
  let expanded = false;
  let contentVisible = false;
  let closing = false;
  let activeIndex = null;
  let isMobile = false;

  let raf1;
  let raf2;
  let closeTimer;
  let contentTimer;
  let retractTimer;

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
    clearTimeout(closeTimer);
    clearTimeout(contentTimer);
    clearTimeout(retractTimer);
  }

  function startOpen() {
    clearAsync();
    visible = true;
    closing = false;
    expanded = false;
    contentVisible = false;
    activeIndex = null;

    if (typeof document !== "undefined") {
      document.body.classList.add("menu-open");
    }

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        expanded = true;
      });
    });

    contentTimer = setTimeout(() => {
      contentVisible = true;
    }, isMobile ? 220 : 300);
  }

  function startClose() {
    if (!visible || closing) return;

    clearAsync();
    closing = true;
    contentVisible = false;
    activeIndex = null;

    retractTimer = setTimeout(() => {
      expanded = false;
    }, isMobile ? 120 : 160);

    closeTimer = setTimeout(() => {
      visible = false;
      closing = false;
      open = false;

      if (typeof document !== "undefined") {
        document.body.classList.remove("menu-open");
      }
    }, isMobile ? 640 : 820);
  }

  $: if (open && !visible) {
    startOpen();
  }

  $: if (!open && visible && !closing) {
    startClose();
  }

  onMount(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
  });

  onDestroy(() => {
    clearAsync();
    window.removeEventListener("resize", checkMobile);
    if (typeof document !== "undefined") {
      document.body.classList.remove("menu-open");
    }
  });

  async function close() {
    if (closing) return;
    open = false;
    await tick();
  }

  function handleClick(link, index) {
    if (isMobile && activeIndex !== index) {
      activeIndex = index;
      return;
    }

    if (navigate && link.page) {
      navigate(link.page);
    }

    close();
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
  class="fs-menu {visible ? 'is-visible' : ''} {expanded ? 'expanded' : ''} {contentVisible ? 'content-visible' : ''} {closing ? 'is-closing' : ''} {isMobile ? 'mobile' : ''}"
  style={originStyle}
  aria-hidden={!visible}
>
  <div class="expander"></div>
  <div class="bg-base" role="button" tabindex="0" aria-label="Fermer le menu" on:click={close} on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') close(); }}></div>

  <div class="topbar">
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

  <nav class="menu-accordion" aria-label="Navigation principale">
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

  <div class="bottom-bar">
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

  .fs-menu {
    position: fixed;
    inset: 0;
    z-index: 9999;
    overflow: hidden;
    color: #f5f1e8;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    background: #000;
  }

  .fs-menu.is-visible {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  .expander {
    position: absolute;
    left: var(--origin-x);
    top: var(--origin-y);
    width: var(--origin-w);
    height: var(--origin-h);
    background:
      linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0)),
      #151515;
    border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    transform: translate(-50%, -50%) scale(1);
    transform-origin: center center;
    border-radius: 10px;
    z-index: 5;
    pointer-events: none;
    will-change: transform, border-radius, opacity;
    transition:
      transform 0.82s cubic-bezier(.22,1,.36,1),
      border-radius 0.82s cubic-bezier(.22,1,.36,1),
      opacity 0.24s ease;
  }

  .fs-menu.expanded .expander {
    transform: translate(-50%, -50%) scale(58);
    border-radius: 0;
    opacity: 0;
  }

  .bg-base {
    position: absolute;
    inset: 0;
    z-index: 1;
    opacity: 0;
    transition: opacity 0.28s ease;
    background:
      linear-gradient(
  to bottom,
  #151515 0%,
  #151515 50%,
  #000 50%,
  #000 100%
);
  }

  .fs-menu.expanded .bg-base {
    opacity: 1;
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

  .meta,
  .close-block,
  .bottom-col {
    opacity: 0;
    transform: translateY(-14px);
    transition:
      opacity 0.28s ease,
      transform 0.38s cubic-bezier(.22,1,.36,1);
  }

  .fs-menu.content-visible .meta,
  .fs-menu.content-visible .close-block {
    opacity: 1;
    transform: translateY(0);
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
    opacity: 0;
    transform: translateY(16px);
    transition:
      opacity 0.28s ease,
      transform 0.42s cubic-bezier(.22,1,.36,1),
      height 560ms cubic-bezier(.22,1,.36,1);
    transition-delay: calc(var(--i) * 0.025s);
  }

  .fs-menu.content-visible .menu-item {
    opacity: 1;
    transform: translateY(0);
  }

  .menu-item:nth-child(1) {
    background: #151515;
  }

  .menu-item:nth-child(2) {
    background: #111;
  }

  .menu-item:nth-child(3) {
    background: #0c0c0c;
  }

  .menu-item:nth-child(4) {
    background: #070707;
  }

  .menu-item:nth-child(5) {
    background: #000;
  }

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

  .fs-menu.content-visible .bottom-col {
    opacity: 1;
    transform: translateY(0);
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
    .expander {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      transition:
        transform 0.66s cubic-bezier(.22,1,.36,1),
        border-radius 0.66s cubic-bezier(.22,1,.36,1),
        opacity 0.2s ease;
    }

    .fs-menu.expanded .expander {
      transform: translate(-50%, -50%) scale(88);
    }

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
    .expander,
    .bg-base,
    .meta,
    .close-block,
    .menu-item,
    .menu-item-bg img,
    .menu-item-overlay,
    .menu-label,
    .close-icon,
    .bottom-col {
      transition: none !important;
      animation: none !important;
    }
  }
</style>