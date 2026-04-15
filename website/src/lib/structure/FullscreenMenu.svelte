<script>
  import { tick, onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import { navigate } from "$lib/navigate.js";

  export let open = false;
  export let origin = { x: 0, y: 0, width: 44, height: 40 };

  const socialLinks = [
    {
      href: "/",
      label: "Instagram",
      icon: "/images/instagram.png",
      className: "icon-instagram"
    },
    {
      href: "/",
      label: "Facebook",
      icon: "/images/facebook.png",
      className: "icon-facebook"
    },
    {
      href: "/",
      label: "X",
      icon: "/images/X.png",
      className: "icon-x"
    }
  ];

  const links = [
    { label: "L'envol", page: "home", image: "/images/photo.webp" },
    { label: "Projets", page: "travail", image: "/images/parfum4.webp" },
    { label: "À propos", page: "apropos", image: "/images/parfum3.webp" },
    { label: "Services", page: "services", image: "/images/parfum2.webp" },
    { label: "Contact", page: "contact", image: "/images/photo2.webp" }
  ];

  const PANEL_OPEN_DELAY = 170;
  const CONTENT_REVEAL_DELAY = 780;
  const FOOTER_REVEAL_DELAY = 1380;
  const CLOSE_CONTENT_MS = 280;
  const CLOSE_PANEL_DELAY = 190;
  const PANEL_CLOSE_MS = 1420;
  const NAVIGATE_DELAY = 150;

  let visible = false;
  let expanded = false;
  let contentVisible = false;
  let mediaVisible = false;
  let footerVisible = false;
  let closing = false;
  let navigating = false;
  let isMobile = false;
  let previewIndex = 0;

  let openPanelTimer;
  let openContentTimer;
  let openFooterTimer;
  let closePanelTimer;
  let finishTimer;
  let navigateTimer;
  let resizeHandler;

  function getPageIndex(pathname) {
    const clean = pathname?.replace(/\/+$/, "") || "/";

    if (clean === "/") return 0;

    const match = links.findIndex((link) => `/${link.page}` === clean);
    return match >= 0 ? match : 0;
  }

  function syncViewportMode() {
    isMobile = window.innerWidth <= 900;
  }

  function clearAsync() {
    clearTimeout(openPanelTimer);
    clearTimeout(openContentTimer);
    clearTimeout(openFooterTimer);
    clearTimeout(closePanelTimer);
    clearTimeout(finishTimer);
    clearTimeout(navigateTimer);
  }

  function setMenuTransitionSuppressed() {}

  function finishClose() {
    visible = false;
    expanded = false;
    contentVisible = false;
    mediaVisible = false;
    footerVisible = false;
    closing = false;
    navigating = false;
    open = false;
    document.body.classList.remove("menu-open");

    setTimeout(() => {
      setMenuTransitionSuppressed(false);
    }, 80);
  }

  function startOpen() {
    clearAsync();

    visible = true;
    expanded = false;
    contentVisible = false;
    mediaVisible = false;
    footerVisible = false;
    closing = false;
    navigating = false;
    previewIndex = getPageIndex($page.url.pathname);

    document.body.classList.add("menu-open");

    openPanelTimer = setTimeout(() => {
      expanded = true;
    }, PANEL_OPEN_DELAY);

    openContentTimer = setTimeout(() => {
      contentVisible = true;
      mediaVisible = true;
    }, isMobile ? 560 : CONTENT_REVEAL_DELAY);

    openFooterTimer = setTimeout(() => {
      footerVisible = true;
    }, isMobile ? 860 : FOOTER_REVEAL_DELAY);
  }

  function startClose() {
    if (!visible || closing) return;

    clearAsync();

    closing = true;
    contentVisible = false;
    mediaVisible = false;
    footerVisible = false;

    closePanelTimer = setTimeout(() => {
      expanded = false;
    }, CLOSE_PANEL_DELAY);

    finishTimer = setTimeout(() => {
      finishClose();
    }, CLOSE_CONTENT_MS + PANEL_CLOSE_MS);
  }

  $: if (open && !visible) {
    startOpen();
  }

  $: if (!open && visible && !closing && !navigating) {
    startClose();
  }

  onMount(() => {
    if (!browser) return;

    syncViewportMode();
    resizeHandler = () => syncViewportMode();
    window.addEventListener("resize", resizeHandler, { passive: true });
  });

  onDestroy(() => {
    if (!browser) return;
    clearAsync();
    window.removeEventListener("resize", resizeHandler);
    document.body.classList.remove("menu-open");
    setMenuTransitionSuppressed(false);
  });

  async function close() {
    if (closing || navigating) return;
    open = false;
    await tick();
  }

  async function handleClick(link) {
    if (closing || navigating) return;

    const targetPath = link.page === "home" ? "/" : `/${link.page}`;
    const currentPath = ($page.url.pathname || "/").replace(/\/+$/, "") || "/";

    if (targetPath === currentPath) {
      close();
      return;
    }

    clearAsync();

    navigating = true;
    closing = true;
    contentVisible = false;
    mediaVisible = false;
    footerVisible = false;

    navigateTimer = setTimeout(() => {
      navigate(link.page);
    }, NAVIGATE_DELAY);

    closePanelTimer = setTimeout(() => {
      expanded = false;
    }, CLOSE_PANEL_DELAY);

    finishTimer = setTimeout(() => {
      finishClose();
    }, CLOSE_CONTENT_MS + PANEL_CLOSE_MS);

    open = false;
    await tick();
  }

  function handleEnter(index) {
    if (isMobile || closing) return;
    previewIndex = index;
  }

  function handleLeave() {
    if (isMobile || closing) return;
    previewIndex = getPageIndex($page.url.pathname);
  }

  function handleGlowMove(event) {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  $: originStyle = `
    --origin-x:${origin?.x ?? 0}px;
    --origin-y:${origin?.y ?? 0}px;
    --origin-w:${origin?.width ?? 44}px;
    --origin-h:${origin?.height ?? 40}px;
  `;
</script>

<div
  class="fs-menu {visible ? 'is-visible' : ''} {expanded ? 'expanded' : ''} {contentVisible ? 'content-visible' : ''} {mediaVisible ? 'media-visible' : ''} {footerVisible ? 'footer-visible' : ''} {closing ? 'is-closing' : ''} {navigating ? 'is-navigating' : ''} {isMobile ? 'mobile' : ''}"
  style={originStyle}
  aria-hidden={!visible}
>
  <div
    class="bg-hit"
    role="button"
    tabindex="0"
    aria-label="Fermer le menu"
    on:click={close}
    on:keydown={(event) => {
      if (event.key === "Enter" || event.key === " ") close();
    }}
  ></div>

  <div class="menu-scrim"></div>
  <div class="menu-blur"></div>

  <div class="menu-shell">
    <div class="menu-panel"></div>

    <div class="menu-media-shell" aria-hidden="true">
      <div class="menu-media-reveal">
        <div class="menu-media-stack">
          {#each links as link, i}
            <img
              class="menu-media-image"
              class:is-active={previewIndex === i}
              src={link.image}
              alt=""
              loading="lazy"
            />
          {/each}
          <div class="menu-media-overlay"></div>
        </div>
      </div>
    </div>

    <div class="menu-logo-wrap ui-content ui-top">
      <img class="menu-logo" src="/images/test_logo.png" alt="Agence 3 Terres" />
    </div>

    <button
      class="nav-btn close-block ui-content ui-top"
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

    <nav class="menu-nav ui-content" aria-label="Navigation principale">
      {#each links as link, i}
        <button
          class="menu-link"
          class:is-current={previewIndex === i}
          type="button"
          aria-current={(link.page === "home" ? "/" : `/${link.page}`) === (($page.url.pathname || "/").replace(/\/+$/, "") || "/") ? "page" : undefined}
          on:mouseenter={() => handleEnter(i)}
          on:mouseleave={handleLeave}
          on:focus={() => handleEnter(i)}
          on:blur={handleLeave}
          on:click={() => handleClick(link)}
        >
          <span class="menu-link-line">
            <span class="menu-link-text">{link.label}</span>
          </span>
        </button>
      {/each}
    </nav>

    <div class="bottom-gradient"></div>

    <div class="bottom-strip ui-bottom">
      <div class="menu-email">
        <div class="bottom-kicker">e-mail</div>
        <a href="mailto:contact@agence3terres.com">contact@agence3terres.com</a>
      </div>

      <div class="menu-socials">
        <div class="bottom-kicker">nous suivre</div>
        <div class="socials-group">
          {#each socialLinks as social}
            <a
              class="social-link"
              href={social.href}
              aria-label={social.label}
              data-cursor="button"
              on:mousemove={handleGlowMove}
              on:click|preventDefault
            >
              <img src={social.icon} alt={social.label} class={`icon ${social.className}`} />
            </a>
          {/each}
        </div>
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
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    color: #f5f1e8;
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

  .menu-scrim,
  .menu-blur {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .menu-scrim {
    z-index: 2;
    opacity: 0;
    background:
      linear-gradient(90deg, rgba(0, 0, 0, 0.68) 0%, rgba(0, 0, 0, 0.58) 52%, rgba(0, 0, 0, 0.42) 100%);
    transition: opacity 1.45s cubic-bezier(.22, 1, .36, 1);
  }

  .menu-blur {
    z-index: 3;
    opacity: 0;
    backdrop-filter: blur(0px);
    -webkit-backdrop-filter: blur(0px);
    transition:
      opacity 1.45s cubic-bezier(.22, 1, .36, 1),
      backdrop-filter 1.45s cubic-bezier(.22, 1, .36, 1),
      -webkit-backdrop-filter 1.45s cubic-bezier(.22, 1, .36, 1);
  }

  .menu-shell {
    position: absolute;
    inset: 0;
    z-index: 4;
  }

  .menu-panel {
    position: absolute;
    inset: 0 auto 0 0;
    width: 100vw;
    background: #000;
    clip-path: inset(0 100% 0 0);
    -webkit-clip-path: inset(0 100% 0 0);
    will-change: clip-path;
    transition:
      clip-path 1.45s cubic-bezier(.18, .93, .2, 1),
      -webkit-clip-path 1.45s cubic-bezier(.18, .93, .2, 1);
  }

  .menu-media-shell {
    position: absolute;
    top: clamp(2.4rem, 4vh, 3rem);
    right: clamp(1.5rem, 2.4vw, 2.4rem);
    bottom: clamp(2.4rem, 4vh, 3rem);
    width: min(34vw, 460px);
    overflow: hidden;
    pointer-events: none;
    z-index: 10;
  }

  .menu-media-reveal {
    position: absolute;
    inset: 0;
    clip-path: inset(100% 0 0 0);
    -webkit-clip-path: inset(100% 0 0 0);
    will-change: clip-path;
    transition:
      clip-path 1.55s cubic-bezier(.18, .93, .2, 1),
      -webkit-clip-path 1.55s cubic-bezier(.18, .93, .2, 1);
  }

  .menu-media-stack {
    position: absolute;
    inset: 0;
    background: #040404;
    border-radius: 4px;
  }

  .menu-media-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transform: scale(1.045);
    filter: brightness(0.72) saturate(0.9) contrast(1.02);
    transition:
      opacity 1.05s cubic-bezier(.22, 1, .36, 1),
      transform 1.45s cubic-bezier(.22, 1, .36, 1),
      filter 1.05s cubic-bezier(.22, 1, .36, 1);
  }

  .menu-media-image.is-active {
    opacity: 1;
    transform: scale(1);
    filter: brightness(0.84) saturate(0.98) contrast(1.04);
  }

  .menu-media-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(0, 0, 0, 0.18) 0%, rgba(0, 0, 0, 0.38) 100%),
      linear-gradient(270deg, rgba(0, 0, 0, 0.34) 0%, rgba(0, 0, 0, 0) 45%);
  }

  .ui-content {
    opacity: 0;
    filter: blur(18px);
    transform: translate3d(0, 26px, 0);
    transition:
      opacity 1.18s cubic-bezier(.22, 1, .36, 1),
      filter 1.18s cubic-bezier(.22, 1, .36, 1),
      transform 1.18s cubic-bezier(.22, 1, .36, 1);
  }

  .menu-logo-wrap {
    position: absolute;
    top: clamp(0.8rem, 1.5vw, 1.1rem);
    left: 50%;
    z-index: 20;
    transform: translateX(-50%) translate3d(0, 26px, 0);
    width: min(92px, 11vw);
    display: flex;
    justify-content: center;
    pointer-events: none;
  }

  .menu-logo {
    display: block;
    width: 100%;
    height: auto;
    object-fit: contain;
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
    border: 1px solid rgba(255, 255, 255, 0.14);
    cursor: pointer;
    background: rgba(255, 255, 255, 0.10);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 2px;
    transition:
      transform 1s cubic-bezier(.22,.61,.36,1),
      background 1s cubic-bezier(.22,.61,.36,1),
      border-color 0.45s cubic-bezier(.22,.61,.36,1);
  }

  .nav-btn::before,
  .nav-btn::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
  }

  .nav-btn::before {
    border: 1px solid transparent;
    border-radius: inherit;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      rgba(255, 225, 140, 1) 0%,
      rgba(212, 175, 55, 0.95) 22%,
      rgba(212, 102, 55, 0.55) 45%,
      rgba(212, 102, 55, 0.12) 62%,
      transparent 78%
    );
    transition: opacity 0.25s ease;
  }

  .nav-btn::after {
    border: 1px solid transparent;
    border-radius: inherit;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      rgba(212, 175, 55, 0.55) 0%,
      rgba(212, 102, 55, 0.22) 42%,
      transparent 72%
    );
    filter: blur(2px);
    transition: opacity 0.25s ease;
  }

  .nav-btn:hover::before,
  .nav-btn:hover::after {
    opacity: 1;
  }

  .close-block {
    position: absolute;
    top: clamp(1rem, 2vw, 1.6rem);
    right: clamp(1rem, 2vw, 1.6rem);
    z-index: 21;
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

  .menu-nav {
    position: absolute;
    top: clamp(4.9rem, 10vh, 7rem);
    left: clamp(1.4rem, 2.4vw, 2.25rem);
    z-index: 12;
    width: min(34vw, 460px);
    display: flex;
    flex-direction: column;
    gap: clamp(0.2rem, 0.45vw, 0.45rem);
    transform: none;
    align-items: flex-start;
  }

  .menu-link {
    position: relative;
    width: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    color: #f5f1e8;
    text-align: left;
    cursor: pointer;
  }

  .menu-link-line {
    display: block;
    overflow: hidden;
  }

  .menu-link-text {
    display: inline-block;
    font-family: "Titre", serif;
    font-size: clamp(4.35rem, 7vw, 8rem);
    line-height: 0.88;
    letter-spacing: -0.06em;
    transform: none;
    clip-path: inset(100% 0 0 0);
    -webkit-clip-path: inset(100% 0 0 0);
    opacity: 0;
    transition:
      clip-path 1.18s cubic-bezier(.22, 1, .36, 1),
      -webkit-clip-path 1.18s cubic-bezier(.22, 1, .36, 1),
      opacity 0.6s ease,
      color 0.6s ease,
      opacity 0.6s ease,
      filter 0.8s ease;
  }

  .menu-link.is-current .menu-link-text,
  .menu-link:hover .menu-link-text,
  .menu-link:focus-visible .menu-link-text {
    color: #ffffff;
    filter: drop-shadow(0 0 18px rgba(255, 255, 255, 0.09));
  }

  .menu-link:not(.is-current) .menu-link-text {
    color: rgba(245, 241, 232, 0.28);
  }

  .bottom-gradient {
    position: absolute;
    inset: auto 0 0 0;
    height: clamp(180px, 28vh, 320px);
    z-index: 13;
    pointer-events: none;
    opacity: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.42) 42%, rgba(0, 0, 0, 0.84) 100%);
    transition: opacity 1.2s cubic-bezier(.22, 1, .36, 1);
  }

  .bottom-strip {
    position: absolute;
    left: clamp(1rem, 2vw, 2rem);
    right: clamp(1rem, 2vw, 2rem);
    bottom: clamp(1rem, 2.4vw, 2rem);
    z-index: 14;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 2rem;
    opacity: 0;
    filter: blur(16px);
    transform: translate3d(0, 26px, 0);
    transition:
      opacity 1.18s cubic-bezier(.22, 1, .36, 1),
      filter 1.18s cubic-bezier(.22, 1, .36, 1),
      transform 1.18s cubic-bezier(.22, 1, .36, 1);
  }

  .bottom-kicker {
    font-family: "General Sans", sans-serif;
    font-size: 0.9rem;
    letter-spacing: 0.02em;
    text-transform: none;
    color: rgba(245, 241, 232, 0.58);
    margin-bottom: 0.8rem;
  }

  .menu-email a {
    font-family: "General Sans", sans-serif;
    font-size: clamp(1.05rem, 1.45vw, 1.5rem);
    line-height: 1;
    letter-spacing: -0.03em;
    color: #f5f1e8;
    text-decoration: none;
  }

  .menu-socials {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .socials-group {
    display: flex;
    align-items: center;
    gap: clamp(0.8rem, 1.2vw, 1.1rem);
  }

  .social-link {
    position: relative;
    width: clamp(3.2rem, 4vw, 4.1rem);
    height: clamp(3.2rem, 4vw, 4.1rem);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition:
      transform 0.35s cubic-bezier(.22,.61,.36,1),
      background 0.35s ease,
      border-color 0.35s ease;
  }

  .social-link:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.24);
  }

  .social-link::before,
  .social-link::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
  }

  .social-link::before {
    border: 1px solid transparent;
    border-radius: inherit;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      rgba(255, 225, 140, 1) 0%,
      rgba(212, 175, 55, 0.95) 22%,
      rgba(212, 102, 55, 0.55) 45%,
      rgba(212, 102, 55, 0.12) 62%,
      transparent 78%
    );
    transition: opacity 0.25s ease;
  }

  .social-link::after {
    border: 1px solid transparent;
    border-radius: inherit;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      rgba(212, 175, 55, 0.55) 0%,
      rgba(212, 102, 55, 0.22) 42%,
      transparent 72%
    );
    filter: blur(2px);
    transition: opacity 0.25s ease;
  }

  .social-link:hover::before,
  .social-link:hover::after {
    opacity: 1;
  }

  .icon {
    display: block;
    object-fit: contain;
    filter: brightness(0) invert(1);
  }

  .icon-instagram {
    width: clamp(1.4rem, 1.8vw, 1.7rem);
    height: clamp(1.4rem, 1.8vw, 1.7rem);
  }

  .icon-facebook {
    width: clamp(1.2rem, 1.6vw, 1.5rem);
    height: clamp(1.2rem, 1.6vw, 1.5rem);
  }

  .icon-x {
    width: clamp(1.26rem, 1.65vw, 1.55rem);
    height: clamp(1.26rem, 1.65vw, 1.55rem);
  }

  .fs-menu.expanded .menu-scrim {
    opacity: 1;
  }

  .fs-menu.expanded .menu-blur {
    opacity: 1;
    backdrop-filter: blur(13px);
    -webkit-backdrop-filter: blur(13px);
  }

  .fs-menu.expanded .menu-panel {
    clip-path: inset(0 0 0 0);
    -webkit-clip-path: inset(0 0 0 0);
  }

  .fs-menu.media-visible .menu-media-reveal {
    clip-path: inset(0 0 0 0);
    -webkit-clip-path: inset(0 0 0 0);
  }

  .fs-menu.content-visible .ui-content {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
  }

  .fs-menu.content-visible .menu-link-text {
    transform: none;
    clip-path: inset(0 0 0 0);
    -webkit-clip-path: inset(0 0 0 0);
    opacity: 1;
  }

  .fs-menu.footer-visible .bottom-gradient,
  .fs-menu.footer-visible .bottom-strip {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
  }

  .fs-menu.is-closing .ui-content,
  .fs-menu.is-closing .bottom-strip,
  .fs-menu.is-navigating .ui-content,
  .fs-menu.is-navigating .bottom-strip {
    opacity: 0;
    filter: blur(18px);
    transform: translate3d(0, -18px, 0);
  }

  .fs-menu.is-closing .menu-link-text,
  .fs-menu.is-navigating .menu-link-text {
    transform: none;
    clip-path: inset(0 0 100% 0);
    -webkit-clip-path: inset(0 0 100% 0);
    opacity: 0;
  }

  .fs-menu.is-closing .bottom-gradient,
  .fs-menu.is-navigating .bottom-gradient {
    opacity: 0;
  }

  .fs-menu.is-closing .menu-media-reveal,
  .fs-menu.is-navigating .menu-media-reveal {
    clip-path: inset(100% 0 0 0);
    -webkit-clip-path: inset(100% 0 0 0);
  }

  .fs-menu.is-closing .menu-panel,
  .fs-menu.is-navigating .menu-panel {
    clip-path: inset(0 100% 0 0);
    -webkit-clip-path: inset(0 100% 0 0);
  }

  .fs-menu.is-closing .menu-scrim,
  .fs-menu.is-navigating .menu-scrim {
    opacity: 0;
  }

  .fs-menu.is-closing .menu-blur,
  .fs-menu.is-navigating .menu-blur {
    opacity: 0;
    backdrop-filter: blur(0px);
    -webkit-backdrop-filter: blur(0px);
  }

  @media (max-width: 900px) {
    .menu-panel {
      width: 100vw;
    }

    .menu-media-shell {
      top: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      opacity: 0.26;
    }

    .menu-media-overlay {
      background:
        linear-gradient(180deg, rgba(0, 0, 0, 0.54) 0%, rgba(0, 0, 0, 0.7) 100%),
        linear-gradient(90deg, rgba(0, 0, 0, 0.36) 0%, rgba(0, 0, 0, 0.16) 100%);
    }

    .menu-logo-wrap {
      top: 0.8rem;
      width: min(82px, 26vw);
    }

    .menu-nav {
      left: 1rem;
      right: 1rem;
      width: auto;
      top: clamp(4.8rem, 10vh, 6rem);
      gap: 0.3rem;
    }

    .menu-link-text {
      font-size: clamp(3rem, 12vw, 4.8rem);
      line-height: 0.9;
    }

    .bottom-strip {
      left: 1rem;
      right: 1rem;
      bottom: 1rem;
      flex-direction: column;
      align-items: stretch;
      gap: 1.2rem;
    }

    .menu-socials {
      align-items: flex-start;
    }

    .socials-group {
      justify-content: flex-start;
    }

    .social-link {
      width: 3.1rem;
      height: 3.1rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .menu-scrim,
    .menu-blur,
    .menu-panel,
    .menu-media-reveal,
    .menu-media-image,
    .ui-content,
    .menu-link-text,
    .bottom-gradient,
    .bottom-strip,
    .nav-btn,
    .social-link,
    .close-icon {
      transition: none !important;
      animation: none !important;
      filter: none !important;
    }

    .fs-menu.is-visible,
    .fs-menu.expanded,
    .fs-menu.content-visible,
    .fs-menu.media-visible,
    .fs-menu.footer-visible {
      opacity: 1;
      visibility: visible;
    }
  }
</style>
