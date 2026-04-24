<script>
  import { tick, onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import { navigate } from "$lib/navigate.js";
  import { projectPages } from "$lib/data/projectPages.js";

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
    { label: "A propos", page: "apropos", image: "/images/parfum3.webp" },
    { label: "Services", page: "services", image: "/images/parfum2.webp" },
    { label: "Contact", page: "contact", image: "/images/photo2.webp" }
  ];

  const projectPreviewCards = [
    {
      page: "projet1",
      title: projectPages.projet1.title,
      meta: "Projet sélectionné",
      image: projectPages.projet1.hero.image,
      alt: projectPages.projet1.hero.alt,
      large: true
    },
    {
      page: "projet2",
      title: projectPages.projet2.title,
      image: projectPages.projet2.hero.image,
      alt: projectPages.projet2.hero.alt,
      text: projectPages.projet2.hero.summaryMain,
      large: false
    }
  ];

  const PANEL_OPEN_DELAY = 170;
  const CONTENT_REVEAL_DELAY = 780;
  const FOOTER_REVEAL_DELAY = 1380;
  const CLOSE_CONTENT_MS = 860;
  const CLOSE_PANEL_DELAY = 420;
  const PANEL_CLOSE_MS = 1880;
  const NAVIGATE_DELAY = 1380;

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

  async function handlePath(path) {
    if (closing || navigating) return;

    const currentPath = ($page.url.pathname || "/").replace(/\/+$/, "") || "/";

    if (path === currentPath) {
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
      navigate(path === "/" ? "home" : path.replace(/^\//, ""));
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

  async function handleClick(link) {
    const targetPath = link.page === "home" ? "/" : `/${link.page}`;
    await handlePath(targetPath);
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

    <div class="menu-upper ui-content">
      <div class="menu-top-logo" aria-hidden="true">
        <img src="/images/logo_prisme.png" alt="" />
      </div>

      <nav class="menu-nav" aria-label="Navigation principale">
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

      <aside class="project-previews" aria-label="Aperçus projets">
        {#each projectPreviewCards as card}
          <button
            class="project-card"
            class:large={card.large}
            type="button"
            on:click={() => handlePath(`/${card.page}`)}
          >
            {#if card.large}
              <div class="project-card-copy">
                <span class="project-card-title">{card.title}</span>
              </div>
              <img class="project-card-image" src={card.image} alt={card.alt} loading="lazy" />
            {:else}
              <div class="project-card-copy compact">
                <span class="project-card-title compact-title">{card.title}</span>
              </div>
              <div class="project-card-row">
                <img class="project-card-image compact-image" src={card.image} alt={card.alt} loading="lazy" />
                <p class="project-card-text">{card.text}</p>
              </div>
            {/if}
          </button>
        {/each}
      </aside>
    </div>

    <div class="menu-media-shell ui-content" aria-hidden="true">
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
    color: #fff;
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
    background: rgba(0, 0, 0, 0.84);
    transition: opacity 1.8s cubic-bezier(.16, 1, .3, 1);
  }

  .menu-blur {
    z-index: 3;
    opacity: 0;
    backdrop-filter: blur(0px);
    -webkit-backdrop-filter: blur(0px);
    transition:
      opacity 1.8s cubic-bezier(.16, 1, .3, 1),
      backdrop-filter 1.8s cubic-bezier(.16, 1, .3, 1),
      -webkit-backdrop-filter 1.8s cubic-bezier(.16, 1, .3, 1);
  }

  .menu-shell {
    position: absolute;
    inset: 0;
    z-index: 4;
    display: grid;
    grid-template-rows: minmax(0, 1fr) minmax(260px, 44vh);
  }

  .menu-panel {
    position: absolute;
    inset: 0;
    background: #010101;
    clip-path: inset(0 0 100% 0);
    -webkit-clip-path: inset(0 0 100% 0);
    will-change: clip-path;
    transition:
      clip-path 1.9s cubic-bezier(.16, 1, .3, 1),
      -webkit-clip-path 1.9s cubic-bezier(.16, 1, .3, 1);
  }

  .ui-content {
    opacity: 0;
    filter: blur(18px);
    transform: translate3d(0, 26px, 0);
    transition:
      opacity 1.6s cubic-bezier(.16, 1, .3, 1),
      filter 1.6s cubic-bezier(.16, 1, .3, 1),
      transform 1.6s cubic-bezier(.16, 1, .3, 1);
  }

  .menu-upper {
    position: relative;
    z-index: 8;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    min-height: 0;
    padding: clamp(1.25rem, 2vw, 1.75rem) clamp(1rem, 2vw, 2rem) 0;
  }

  .menu-top-logo {
    position: absolute;
    top: calc(clamp(1.25rem, 2vw, 1.75rem) + 0.2rem);
    left: 50%;
    z-index: 12;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    pointer-events: none;
  }

  .menu-top-logo img {
    display: block;
    width: clamp(2.15rem, 3.35vw, 3rem);
    height: auto;
    object-fit: contain;
  }

  .menu-nav {
    grid-column: 1;
    justify-self: start;
    width: min(100%, 620px);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: clamp(0.35rem, 0.7vh, 0.75rem);
    padding-top: clamp(1rem, 2.6vh, 2rem);
  }

  .menu-link {
    position: relative;
    width: auto;
    padding: 0;
    border: 0;
    background: transparent;
    color: #fff;
    text-align: left;
    cursor: pointer;
  }

  .menu-link-line {
    display: block;
    overflow: visible;
    padding: 0.16em 0 0.2em;
  }

  .menu-link-text {
    display: inline-block;
    font-family: "Titre", serif;
    font-style: italic;
    font-size: clamp(3.35rem, 4.7vw, 5.6rem);
    line-height: 0.94;
    letter-spacing: -0.025em;
    clip-path: inset(100% 0 0 0);
    -webkit-clip-path: inset(100% 0 0 0);
    opacity: 0;
    color: rgba(255, 255, 255, 0.42);
    padding-right: 0.08em;
    transition:
      clip-path 1.6s cubic-bezier(.16, 1, .3, 1),
      -webkit-clip-path 1.6s cubic-bezier(.16, 1, .3, 1),
      opacity 1.05s ease,
      color 1.05s ease,
      filter 1.2s ease;
  }

  .menu-link.is-current .menu-link-text,
  .menu-link:hover .menu-link-text,
  .menu-link:focus-visible .menu-link-text {
    color: #fff;
    filter: drop-shadow(0 0 18px rgba(255, 255, 255, 0.08));
  }

  .project-previews {
    position: relative;
    z-index: 9;
    grid-column: 2;
    justify-self: end;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: min(22vw, 290px);
    padding-top: 0.2rem;
  }

  .project-card {
    position: relative;
    overflow: hidden;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.75rem;
    padding: 0.95rem;
    border: 0;
    border-radius: 2px;
    background: #171717;
    color: #fff;
    text-align: left;
    cursor: pointer;
  }

  .project-card.large {
    gap: 0.9rem;
    background: #151515;
  }

  .nav-btn::before,
  .nav-btn::after,
  .social-link::before,
  .social-link::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
  }

  .nav-btn::before,
  .social-link::before {
    border: 1px solid transparent;
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

  .nav-btn::after,
  .social-link::after {
    border: 1px solid transparent;
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
  .nav-btn:hover::after,
  .social-link:hover::before,
  .social-link:hover::after {
    opacity: 1;
  }

  .project-card-copy {
    display: flex;
    flex-direction: column;
    gap: 0.22rem;
  }

  .project-card-copy.compact {
    gap: 0.3rem;
  }

  .project-card-title {
    font-family: "General Sans", sans-serif;
    font-size: 1rem;
    line-height: 1.1;
    letter-spacing: -0.03em;
    font-weight: 400;
  }

  .project-card.large .project-card-title {
    font-size: 1.18rem;
  }

  .compact-title {
    max-width: 16ch;
  }

  .project-card-meta {
    font-family: "General Sans", sans-serif;
    font-size: 0.72rem;
    line-height: 1.2;
    color: rgba(255, 255, 255, 0.5);
  }

  .project-card-row {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr);
    align-items: start;
    gap: 0.8rem;
  }

  .project-card-image {
    width: 100%;
    height: clamp(82px, 8vw, 102px);
    border-radius: 2px;
    object-fit: cover;
    filter: brightness(0.88) saturate(0.9);
  }

  .project-card.large .project-card-image {
    height: clamp(120px, 10vw, 148px);
  }

  .compact-image {
    width: 64px;
    height: 64px;
  }

  .project-card-text {
    margin: 0;
    font-family: "General Sans", sans-serif;
    font-size: 0.76rem;
    line-height: 1.25;
    color: rgba(255, 255, 255, 0.72);
  }

  .menu-media-shell {
    position: relative;
    z-index: 7;
    min-height: 0;
  }

  .menu-media-reveal {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    clip-path: inset(100% 0 0 0);
    -webkit-clip-path: inset(100% 0 0 0);
    will-change: clip-path;
    transition:
      clip-path 1.95s cubic-bezier(.16, 1, .3, 1),
      -webkit-clip-path 1.95s cubic-bezier(.16, 1, .3, 1);
  }

  .menu-media-stack {
    position: absolute;
    inset: 0;
    background: #050505;
  }

  .menu-media-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transform: scale(1.04);
    filter: brightness(0.72) saturate(0.9) contrast(1.02);
    transition:
      opacity 1.15s cubic-bezier(.16, 1, .3, 1),
      transform 1.7s cubic-bezier(.16, 1, .3, 1),
      filter 1.15s cubic-bezier(.16, 1, .3, 1);
  }

  .menu-media-image.is-active {
    opacity: 1;
    transform: scale(1);
    filter: brightness(0.86) saturate(0.98) contrast(1.03);
  }

  .menu-media-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.24) 100%),
      linear-gradient(0deg, rgba(0, 0, 0, 0.34) 0%, rgba(0, 0, 0, 0) 30%);
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
    background: rgba(255, 255, 255, 0.10);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 2px;
    cursor: pointer;
    transition:
      transform 1s cubic-bezier(.22,.61,.36,1),
      background 1s cubic-bezier(.22,.61,.36,1),
      border-color 0.35s ease;
  }

  .close-block {
    position: absolute;
    left: 50%;
    bottom: clamp(1rem, 2.2vh, 1.75rem);
    z-index: 30;
    width: min(320px, calc(100% - 2rem));
    min-width: 44px;
    padding: 0;
    transform: translateX(-50%);
    color: inherit;
    pointer-events: auto;
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
      opacity 1.65s cubic-bezier(.16, 1, .3, 1),
      filter 1.65s cubic-bezier(.16, 1, .3, 1),
      transform 1.65s cubic-bezier(.16, 1, .3, 1);
    pointer-events: none;
  }

  .bottom-kicker {
    font-family: "General Sans", sans-serif;
    font-size: 0.9rem;
    letter-spacing: 0.02em;
    color: rgba(255, 255, 255, 0.58);
    margin-bottom: 0.8rem;
  }

  .menu-email a {
    font-family: "General Sans", sans-serif;
    font-size: clamp(1.05rem, 1.45vw, 1.5rem);
    line-height: 1;
    letter-spacing: -0.03em;
    color: #fff;
    text-decoration: none;
    pointer-events: auto;
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
      transform 0.35s cubic-bezier(.22, .61, .36, 1),
      background 0.35s ease,
      border-color 0.35s ease;
    pointer-events: auto;
  }

  .social-link:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.24);
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
    clip-path: inset(0 0 0 0);
    -webkit-clip-path: inset(0 0 0 0);
    opacity: 1;
  }

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
    clip-path: inset(0 0 100% 0);
    -webkit-clip-path: inset(0 0 100% 0);
    opacity: 0;
  }

  .fs-menu.is-closing .menu-media-reveal,
  .fs-menu.is-navigating .menu-media-reveal {
    clip-path: inset(100% 0 0 0);
    -webkit-clip-path: inset(100% 0 0 0);
  }

  .fs-menu.is-closing .menu-panel,
  .fs-menu.is-navigating .menu-panel {
    clip-path: inset(0 0 100% 0);
    -webkit-clip-path: inset(0 0 100% 0);
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

  @media (max-width: 1100px) {
    .menu-upper {
      grid-template-columns: minmax(0, 1fr);
      justify-items: center;
      padding-top: 1rem;
    }

    .project-previews {
      position: absolute;
      top: 1rem;
      right: 1rem;
      grid-column: auto;
      width: min(34vw, 260px);
    }

    .menu-nav {
      grid-column: auto;
      justify-self: center;
      align-items: flex-start;
      padding-top: clamp(4rem, 10vw, 5.5rem);
    }
  }

  @media (max-width: 900px) {
    .menu-top-logo {
      top: calc(clamp(1.25rem, 2vw, 1.75rem) + 0.2rem);
    }

    .menu-top-logo img {
      width: clamp(1.95rem, 7vw, 2.45rem);
    }

    .menu-shell {
      grid-template-rows: minmax(0, 1fr) minmax(220px, 36vh);
    }

    .menu-upper {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.2rem 1rem 0;
    }

    .menu-nav {
      width: 100%;
      padding-top: 1.2rem;
      gap: 0.45rem;
    }

    .menu-link-text {
      font-size: clamp(2.85rem, 10.5vw, 4.5rem);
      line-height: 0.92;
    }

    .project-previews {
      display: none;
    }

    .close-block {
      width: min(260px, calc(100% - 2rem));
      height: 40px;
    }

    .bottom-strip {
      left: 1rem;
      right: 1rem;
      top: calc(64svh + 1rem);
      bottom: auto;
      flex-direction: row;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
    }

    .menu-socials {
      align-items: flex-end;
    }

    .socials-group {
      justify-content: flex-end;
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
