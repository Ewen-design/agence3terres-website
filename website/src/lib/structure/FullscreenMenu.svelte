<script>
  import { tick, onDestroy } from "svelte";

  export let open = false;
  export let navigate;
  export let origin = { x: 0, y: 0, width: 44, height: 40 };

  let visible = false;
  let expanded = false;       // fond noir déployé
  let contentVisible = false; // éléments visibles
  let closing = false;
  let hovered = null;

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
    { label: "Contact", page: "contact", image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=2000" }
  ];

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

    if (typeof document !== "undefined") {
      document.body.classList.add("menu-open");
    }

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        expanded = true;
      });
    });

    // le contenu arrive après le déploiement du fond
    contentTimer = setTimeout(() => {
      contentVisible = true;
    }, 420);
  }

  function startClose() {
    if (!visible || closing) return;

    clearAsync();
    closing = true;
    hovered = null;

    // 1) les éléments disparaissent d'abord
    contentVisible = false;

    // 2) puis le fond se rétracte
    retractTimer = setTimeout(() => {
      expanded = false;
    }, 220);

    // 3) démontage à la fin
    closeTimer = setTimeout(() => {
      visible = false;
      closing = false;
      open = false;

      if (typeof document !== "undefined") {
        document.body.classList.remove("menu-open");
      }
    }, 1170); // 220ms + 950ms
  }

  $: if (open && !visible) {
    startOpen();
  }

  $: if (!open && visible && !closing) {
    startClose();
  }

  onDestroy(() => {
    clearAsync();
    if (typeof document !== "undefined") {
      document.body.classList.remove("menu-open");
    }
  });

  async function close() {
    if (closing) return;
    open = false;
    await tick();
  }

  function handleClick(link) {
    if (navigate && link.page) {
      navigate(link.page);
    }
    close();
  }

  $: originStyle = `
    --origin-x:${origin?.x ?? 0}px;
    --origin-y:${origin?.y ?? 0}px;
    --origin-w:${origin?.width ?? 44}px;
    --origin-h:${origin?.height ?? 40}px;
  `;
</script>

<div
  class="fs-menu {visible ? 'is-visible' : ''} {expanded ? 'expanded' : ''} {contentVisible ? 'content-visible' : ''} {closing ? 'is-closing' : ''}"
  style={originStyle}
  aria-hidden={!visible}
>
  <div class="expander"></div>

  <div class="bg-base" on:click={close}></div>
  <div class="noise"></div>
  <div class="vignette"></div>
  <div class="gold-glow"></div>

  {#if hovered && visible && !closing}
    <div class="bg-image-layer">
      <div class="bg-image" style="background-image:url({hovered.image})"></div>
      <div class="bg-dark"></div>
      <div class="bg-vignette"></div>
    </div>
  {/if}

  <div class="topbar">
    <div class="top-left meta">Agence 3 Terres</div>

    <div class="top-center logo-wrap">
      <img src="/images/logo.jpg" alt="Logo Agence 3 Terres" />
    </div>

    <div
      class="close-block"
      role="button"
      tabindex="0"
      aria-label="Fermer le menu"
      on:click|stopPropagation={close}
      on:keydown={(e) => (e.key === "Enter" || e.key === " ") && close()}
      data-cursor="fermer"
    >
      <div class="close-icon">✕</div>
    </div>
  </div>

  <nav class="center-nav" aria-label="Navigation principale">
    {#each links as link, i}
      <button
        class="nav-link {hovered === link ? 'is-active' : ''} {hovered && hovered !== link ? 'is-dimmed' : ''}"
        style="--i:{i}"
        on:mouseenter={() => (hovered = link)}
        on:mouseleave={() => (hovered = null)}
        on:click={() => handleClick(link)}
        data-cursor="voir"
      >
        <span class="index">0{i + 1}</span>
        <span class="label">{link.label}</span>
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
    cursor: none;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
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
      #050505;
    border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(18px);
    transform: translate(-50%, -50%) scale(1);
    transform-origin: center center;
    border-radius: 18px;
    z-index: 5;
    pointer-events: none;
    will-change: transform, border-radius, opacity;
    transition:
      transform 0.95s cubic-bezier(.22,1,.36,1),
      border-radius 0.95s cubic-bezier(.22,1,.36,1),
      opacity 0.35s ease;
  }

  .fs-menu.expanded .expander {
    transform: translate(-50%, -50%) scale(60);
    border-radius: 0;
    opacity: 0;
  }

  .bg-base,
  .noise,
  .vignette,
  .gold-glow,
  .bg-image-layer,
  .bg-dark,
  .bg-vignette {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.35s ease;
  }

  .fs-menu.expanded .bg-base,
  .fs-menu.expanded .noise,
  .fs-menu.expanded .vignette,
  .fs-menu.expanded .gold-glow,
  .fs-menu.expanded .bg-image-layer {
    opacity: 1;
  }

  .bg-base {
    z-index: 1;
    background:
      radial-gradient(circle at 50% 40%, rgba(255,255,255,0.03), transparent 28%),
      linear-gradient(180deg, #0a0a0a 0%, #050505 100%);
  }

  .noise {
    z-index: 2;
    pointer-events: none;
    background-image: radial-gradient(rgba(255,255,255,0.9) 0.6px, transparent 0.8px);
    background-size: 8px 8px;
    mix-blend-mode: soft-light;
  }

  .fs-menu.expanded .noise {
    opacity: 0.06;
  }

  .vignette {
    z-index: 2;
    pointer-events: none;
    background: radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.48) 100%);
  }

  .gold-glow {
    z-index: 2;
    pointer-events: none;
    background: radial-gradient(circle at 50% 50%, rgba(196, 155, 94, 0.08), transparent 26%);
    filter: blur(40px);
    animation: glowPulse 5s ease-in-out infinite;
  }

  @keyframes glowPulse {
    0%, 100% { opacity: 0.75; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.06); }
  }

  .bg-image-layer {
    z-index: 3;
    pointer-events: none;
  }

  .bg-image {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    animation:
      revealImage 0.9s cubic-bezier(.77,0,.18,1) forwards,
      zoomInside 8s ease forwards;
    will-change: transform, clip-path;
  }

  .bg-dark {
    opacity: 1;
    background: rgba(0,0,0,0.45);
  }

  .bg-vignette {
    opacity: 1;
    background: linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 30%);
    pointer-events: none;
  }

  @keyframes revealImage {
    from { clip-path: inset(0 100% 0 0); }
    to { clip-path: inset(0 0 0 0); }
  }

  @keyframes zoomInside {
    from { transform: scale(1); }
    to { transform: scale(1.15); }
  }

  .topbar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 110px;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 0 38px;
    z-index: 50;
  }

  .meta,
  .logo-wrap,
  .close-block {
    opacity: 0;
    transform: translateY(-18px);
    transition: opacity 0.32s ease, transform 0.32s ease;
  }

  .meta {
    transition-delay: 0.05s;
    font-family: "Manrope", sans-serif;
    font-size: 0.8rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .logo-wrap {
    transition-delay: 0.1s;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .logo-wrap img {
    height: 56px;
    width: auto;
    object-fit: contain;
    opacity: 0.92;
  }

  .close-block {
    transition-delay: 0.15s;
    justify-self: end;
    width: 75px;
    height: 75px;
    backdrop-filter: blur(40px);
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: none;
    position: relative;
    z-index: 60;
    pointer-events: auto;
  }

  .close-block:hover {
    background: white;
  }

  .close-icon {
    font-size: 1.8rem;
    color: white;
    transition: .5s ease;
    line-height: 1;
    pointer-events: none;
  }

  .close-block:hover .close-icon {
    color: black;
    transform: rotate(90deg) scale(1.2);
  }

  .fs-menu.content-visible .meta,
  .fs-menu.content-visible .logo-wrap,
  .fs-menu.content-visible .close-block {
    opacity: 1;
    transform: translateY(0);
  }

  .center-nav {
    position: absolute;
    inset: 0;
    z-index: 20;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 130px 24px 140px;
  }

  .nav-link {
    position: relative;
    display: inline-flex;
    align-items: baseline;
    gap: 18px;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: none;
    padding: 0;
    opacity: 0;
    transform: translateY(20px);
    transition:
      opacity 0.32s ease,
      transform 0.32s cubic-bezier(.22,1,.36,1),
      filter 0.85s ease,
      letter-spacing 0.85s ease;
    transition-delay: calc(var(--i) * 0.03s);
  }

  .fs-menu.content-visible .nav-link {
    opacity: 1;
    transform: translateY(0);
  }

  .index {
    font-family: "Geist Mono", monospace;
    font-size: 0.68rem;
    letter-spacing: 0.2em;
    opacity: 0.42;
    transform: translateY(-0.55em);
    min-width: 32px;
    text-align: right;
  }

  .label {
    font-family: "Aboreto", serif;
    font-size: clamp(2.2rem, 5.6vw, 5rem);
    line-height: 0.95;
    letter-spacing: 0.04em;
    text-align: center;
    transition:
      letter-spacing 0.85s ease,
      transform 0.85s cubic-bezier(.22,1,.36,1),
      opacity 0.85s ease;
  }

  .nav-link.is-active {
    transform: translateX(16px) scale(1.015);
  }

  .nav-link.is-active .label {
    letter-spacing: 0.11em;
    transform: translateX(10px);
  }

  .nav-link.is-dimmed {
    opacity: 0.18;
    filter: blur(2.2px);
  }

  .bottom-bar {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 20;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 24px;
    align-items: end;
    padding: 28px 38px 30px;
  }

  .bottom-col {
    display: flex;
    flex-direction: column;
    gap: 7px;
    min-width: 0;
    opacity: 0;
    transform: translateY(18px);
    transition: opacity 0.32s ease, transform 0.32s ease;
  }

  .fs-menu.content-visible .bottom-col {
    opacity: 1;
    transform: translateY(0);
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
    cursor: none;
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
      height: 92px;
      padding: 0 18px;
      grid-template-columns: 1fr auto auto;
      gap: 12px;
    }

    .meta {
      font-size: 0.68rem;
      letter-spacing: 0.16em;
    }

    .logo-wrap img {
      height: 42px;
    }

    .close-block {
      width: 58px;
      height: 58px;
    }

    .close-icon {
      font-size: 1.4rem;
    }

    .center-nav {
      gap: 0.8rem;
      padding: 110px 18px 170px;
    }

    .nav-link {
      gap: 10px;
      flex-direction: column;
      align-items: center;
    }

    .index {
      min-width: auto;
      transform: none;
      font-size: 0.62rem;
      opacity: 0.38;
    }

    .label {
      font-size: clamp(2rem, 9vw, 3.8rem);
    }

    .bottom-bar {
      grid-template-columns: 1fr;
      gap: 16px;
      padding: 18px 18px 22px;
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
</style>