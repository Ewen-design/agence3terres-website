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
    { label: "Accueil", page: "home", image: "/images/photo.webp" },
    { label: "Services", page: "services", image: "/images/creation_logo_desktop2.webp" },
    { label: "Projets", page: "travail", image: "/images/parfum4.webp" },
    { label: "A propos", page: "apropos", image: "/images/parfum3.webp" },
    { label: "Contact", page: "contact", image: "/images/photo2.webp" }
  ];

  const projectPreviewCards = [
    {
      page: "projet1",
      title: projectPages.projet1.title,
      meta: "Projet sélectionné",
      image: projectPages.projet1.hero.image,
      alt: projectPages.projet1.hero.alt,
      text: "Une identité et une présence visuelle pensées avec justesse, rythme et précision.",
      large: true
    },
    {
      page: "projet2",
      title: projectPages.projet2.title,
      image: projectPages.projet2.hero.image,
      alt: projectPages.projet2.hero.alt,
      text: projectPages.projet2.hero.summaryMain,
      large: false
    },
    {
      page: "services",
      title: "Conception de site web",
      image: "/images/creation_logo_desktop2.webp",
      alt: "Aperçu service conception de site web",
      text: "Des sites pensés comme des expériences fluides, désirables et précisées dans le détail.",
      large: false
    },
    {
      page: "contact",
      title: "Contact",
      image: "/images/photo2.webp",
      alt: "Aperçu page contact",
      text: "Un point d'entrée direct pour cadrer votre projet avec clarté et exigence.",
      large: false
    }
  ];

  let visible = false;
  let expanded = false;
  let contentVisible = false;
  let mediaVisible = false;
  let footerVisible = false;
  let closing = false;
  let navigating = false;
  let isMobile = false;
  let previewIndex = 0;
  let mobileActionsOpen = false;

  let openPanelTimer;
  let openContentTimer;
  let openFooterTimer;
  let closePanelTimer;
  let finishTimer;
  let resizeHandler;

  function getMotionProfile() {
    if (isMobile) {
      return {
        openPanelDelay: 0,
        openContentDelay: 150,
        openFooterDelay: 240,
        closeFinishMs: 420
      };
    }

    return {
      openPanelDelay: 0,
      openContentDelay: 220,
      openFooterDelay: 340,
      closeFinishMs: 760
    };
  }

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
    mobileActionsOpen = false;
    document.body.classList.remove("menu-open");
  }

  function startOpen() {
    clearAsync();
    const motion = getMotionProfile();

    visible = true;
    expanded = false;
    contentVisible = false;
    mediaVisible = false;
    footerVisible = false;
    closing = false;
    navigating = false;
    mobileActionsOpen = false;
    previewIndex = getPageIndex($page.url.pathname);

    document.body.classList.add("menu-open");

    openPanelTimer = setTimeout(() => {
      expanded = true;
    }, motion.openPanelDelay);

    openContentTimer = setTimeout(() => {
      contentVisible = true;
      mediaVisible = true;
    }, motion.openContentDelay);

    openFooterTimer = setTimeout(() => {
      footerVisible = true;
    }, motion.openFooterDelay);
  }

  function startClose() {
    if (!visible || closing) return;

    clearAsync();
    const motion = getMotionProfile();

    closing = true;
    contentVisible = false;
    mediaVisible = false;
    footerVisible = false;

    closePanelTimer = setTimeout(() => {
      expanded = false;
    }, 0);

    finishTimer = setTimeout(() => {
      finishClose();
    }, motion.closeFinishMs);
  }

  $: if (open && !visible) {
    startOpen();
  }

  $: if (open && visible && closing) {
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

    try {
      await navigate(path === "/" ? "home" : path.replace(/^\//, ""));
    } finally {
      open = false;
      finishClose();
    }
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

  function toggleMobileActions() {
    mobileActionsOpen = !mobileActionsOpen;
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

    <div class="mobile-topbar ui-content">
      <button
        class="mobile-square-btn mobile-close-btn"
        type="button"
        aria-label="Fermer le menu"
        on:mousemove={handleGlowMove}
        on:click|stopPropagation={close}
      >
        <svg class="mobile-topbar-icon mobile-close-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6L18 18" />
          <path d="M18 6L6 18" />
        </svg>
      </button>

      <div class="mobile-top-logo" aria-hidden="true">
        <img src="/images/logo_prisme.png" alt="" />
      </div>

      <div class="mobile-actions">
        <button
          class="mobile-square-btn mobile-actions-toggle"
          type="button"
          aria-label="Ouvrir les actions"
          aria-expanded={mobileActionsOpen}
          on:mousemove={handleGlowMove}
          on:click|stopPropagation={toggleMobileActions}
        >
          <img class="mobile-action-mail-icon" src="/images/mail.png" alt="" aria-hidden="true" />
        </button>

        <div class="mobile-actions-panel" class:is-open={mobileActionsOpen}>
          <a class="mobile-mail-link" href="mailto:contact@agence3terres.com">
            contact@agence3terres.com
          </a>

          <div class="mobile-socials">
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
        {#each projectPreviewCards.filter((card) => card.page !== "contact") as card}
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

    <div class="mobile-preview-rail ui-bottom" aria-label="Aperçus secondaires">
      <div class="mobile-preview-scroll">
        {#each projectPreviewCards as card}
          <button
            class="mobile-preview-card"
            type="button"
            on:click={() => handlePath(`/${card.page}`)}
          >
            <div class="mobile-preview-copy">
              <span class="mobile-preview-title">{card.title}</span>
              <p class="mobile-preview-text">{card.text}</p>
            </div>

            <div class="mobile-preview-row">
              <img class="mobile-preview-image" src={card.image} alt={card.alt} loading="lazy" />
            </div>
          </button>
        {/each}
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
    inset: 0 auto auto 0;
    width: 100%;
    height: 100vh;
    height: 100lvh;
    min-height: 100vh;
    min-height: 100lvh;
    z-index: 9999;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    color: #fff;
    overflow: hidden;
    --menu-panel-duration: 920ms;
    --menu-content-duration: 800ms;
    --menu-footer-duration: 760ms;
    --menu-media-duration: 920ms;
    --menu-scrim-duration: 920ms;
    --menu-blur-strength: 13px;
    --menu-ease: cubic-bezier(.22, 1, .36, 1);
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

  .mobile-topbar,
  .mobile-preview-rail {
    display: none;
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
    transition: opacity var(--menu-scrim-duration) var(--menu-ease);
  }

  .menu-blur {
    z-index: 3;
    opacity: 0;
    backdrop-filter: blur(0px);
    -webkit-backdrop-filter: blur(0px);
    transition:
      opacity var(--menu-scrim-duration) var(--menu-ease),
      backdrop-filter var(--menu-scrim-duration) var(--menu-ease),
      -webkit-backdrop-filter var(--menu-scrim-duration) var(--menu-ease);
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
      clip-path var(--menu-panel-duration) var(--menu-ease),
      -webkit-clip-path var(--menu-panel-duration) var(--menu-ease);
  }

  .ui-content {
    opacity: 0;
    filter: blur(18px);
    transform: translate3d(0, 26px, 0);
    transition:
      opacity var(--menu-content-duration) var(--menu-ease),
      filter var(--menu-content-duration) var(--menu-ease),
      transform var(--menu-content-duration) var(--menu-ease);
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
    gap: clamp(0.3rem, 0.58vh, 0.62rem);
    padding-top: clamp(4.9rem, 8.9vh, 6.9rem);
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
    font-family: "Clash Display", sans-serif;
    font-weight: 300;
    font-style: normal;
    font-size: clamp(2.95rem, 4.15vw, 4.8rem);
    line-height: 0.94;
    letter-spacing: -0.025em;
    clip-path: inset(100% 0 0 0);
    -webkit-clip-path: inset(100% 0 0 0);
    opacity: 0;
    color: rgba(255, 255, 255, 0.42);
    padding-right: 0.08em;
    transition:
      clip-path var(--menu-content-duration) var(--menu-ease),
      -webkit-clip-path var(--menu-content-duration) var(--menu-ease),
      opacity 620ms ease,
      color 620ms ease,
      filter 720ms ease;
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
    padding-top: clamp(4.9rem, 8.9vh, 6.9rem);
  }

  .mobile-preview-card,
  .mobile-square-btn {
    border: 0;
    color: inherit;
  }

  .mobile-square-btn {
    position: relative;
    overflow: hidden;
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
    font-family: "Clash Display", sans-serif;
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
    font-family: "Clash Display", sans-serif;
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
    font-family: "Clash Display", sans-serif;
    font-size: 0.76rem;
    line-height: 1.25;
    color: rgba(255, 255, 255, 0.72);
  }

  .menu-media-shell {
    position: relative;
    z-index: 7;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .menu-media-reveal {
    position: relative;
    width: min(28vw, 34rem);
    height: min(74vh, 52rem);
    overflow: hidden;
    pointer-events: none;
    border-radius: 2px;
    clip-path: inset(100% 0 0 0);
    -webkit-clip-path: inset(100% 0 0 0);
    will-change: clip-path;
    transition:
      clip-path var(--menu-media-duration) var(--menu-ease),
      -webkit-clip-path var(--menu-media-duration) var(--menu-ease);
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
      opacity 760ms var(--menu-ease),
      transform var(--menu-media-duration) var(--menu-ease),
      filter 760ms var(--menu-ease);
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
    border: 0px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.15);
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
      opacity var(--menu-footer-duration) var(--menu-ease),
      filter var(--menu-footer-duration) var(--menu-ease),
      transform var(--menu-footer-duration) var(--menu-ease);
    pointer-events: none;
  }

  .mobile-preview-scroll {
    display: flex;
    gap: 0.75rem;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 0 1rem;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    overscroll-behavior-x: contain;
  }

  .mobile-preview-scroll::-webkit-scrollbar {
    display: none;
  }

  .mobile-preview-card {
    flex: 0 0 min(18.5rem, 76vw);
    display: grid;
    grid-template-columns: 4.3rem minmax(0, 1fr);
    gap: 0.7rem;
    align-items: center;
    padding: 0.75rem;
    background: rgba(24, 24, 24, 0.88);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    text-align: left;
    cursor: pointer;
  }

  .mobile-preview-copy {
    order: 2;
    min-width: 0;
  }

  .mobile-preview-row {
    order: 1;
  }

  .mobile-preview-image {
    width: 4.3rem;
    height: 4.3rem;
    object-fit: cover;
    border-radius: 2px;
    filter: brightness(0.88) saturate(0.92);
  }

  .mobile-preview-title {
    display: block;
    font-family: "Clash Display", sans-serif;
    font-size: 0.82rem;
    line-height: 1.04;
    letter-spacing: -0.03em;
    color: #fff;
  }

  .mobile-preview-text {
    margin: 0.28rem 0 0;
    font-family: "Clash Display", sans-serif;
    font-size: 0.64rem;
    line-height: 1.14;
    color: rgba(255, 255, 255, 0.68);
  }

  .mobile-square-btn::before,
  .mobile-square-btn::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
  }

  .mobile-square-btn::before {
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

  .mobile-square-btn::after {
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

  .mobile-square-btn:hover::before,
  .mobile-square-btn:hover::after,
  .mobile-square-btn:focus-visible::before,
  .mobile-square-btn:focus-visible::after,
  .mobile-square-btn:active::before,
  .mobile-square-btn:active::after {
    opacity: 1;
  }

  .bottom-kicker {
    font-family: "Clash Display", sans-serif;
    font-size: 0.9rem;
    letter-spacing: 0.02em;
    color: rgba(255, 255, 255, 0.58);
    margin-bottom: 0.8rem;
  }

  .menu-email a {
    font-family: "Clash Display", sans-serif;
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
    border: 0px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.15);
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
    backdrop-filter: blur(var(--menu-blur-strength));
    -webkit-backdrop-filter: blur(var(--menu-blur-strength));
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

  .fs-menu.footer-visible .mobile-preview-rail {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
  }

  .fs-menu.is-closing .ui-content,
  .fs-menu.is-closing .bottom-strip {
    opacity: 0;
    filter: blur(18px);
    transform: translate3d(0, -18px, 0);
  }

  .fs-menu.is-closing .menu-link-text {
    clip-path: inset(0 0 100% 0);
    -webkit-clip-path: inset(0 0 100% 0);
    opacity: 0;
  }

  .fs-menu.is-closing .menu-media-reveal {
    clip-path: inset(100% 0 0 0);
    -webkit-clip-path: inset(100% 0 0 0);
  }

  .fs-menu.is-closing .menu-panel {
    clip-path: inset(0 0 100% 0);
    -webkit-clip-path: inset(0 0 100% 0);
  }

  .fs-menu.is-closing .menu-scrim {
    opacity: 0;
  }

  .fs-menu.is-closing .menu-blur {
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
      padding-top: clamp(7.1rem, 15vw, 8.9rem);
    }
  }

  @media (min-width: 901px) {
    .menu-media-shell {
      position: absolute;
      top: clamp(6.75rem, 9vh, 7.75rem);
      bottom: clamp(2.5rem, 4vh, 3.5rem);
      left: 0;
      right: 0;
      width: min(32vw, 39rem);
      min-height: 0;
      margin: 0 auto;
      display: block;
      padding: 0;
    }

    .menu-media-reveal {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      max-height: none;
      min-height: 0;
    }
  }

  @media (max-width: 900px) {
    .fs-menu {
      --menu-panel-duration: 460ms;
      --menu-content-duration: 420ms;
      --menu-footer-duration: 380ms;
      --menu-media-duration: 460ms;
      --menu-scrim-duration: 460ms;
      --menu-blur-strength: 8px;
    }

    .menu-top-logo {
      top: calc(clamp(1.25rem, 2vw, 1.75rem) + 0.2rem);
    }

    .menu-top-logo img {
      width: clamp(1.95rem, 7vw, 2.45rem);
    }

    .menu-shell {
      display: flex;
      flex-direction: column;
      inset: 0;
      padding-top: calc(env(safe-area-inset-top, 0px) + 0.9rem);
      padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 5.25rem);
      gap: 0;
    }

    .mobile-topbar {
      position: relative;
      z-index: 18;
      display: grid;
      grid-template-columns: 2.75rem 1fr 2.75rem;
      align-items: center;
      width: 100%;
      padding: 0 1rem;
      margin-bottom: 0.9rem;
      opacity: 0;
      filter: blur(18px);
      transform: translate3d(0, 26px, 0);
      transition:
        opacity var(--menu-content-duration) var(--menu-ease),
        filter var(--menu-content-duration) var(--menu-ease),
        transform var(--menu-content-duration) var(--menu-ease);
    }

    .mobile-square-btn {
      width: 2.75rem;
      height: 2.75rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      padding: 0;
      cursor: pointer;
      transition:
        transform 0.35s cubic-bezier(.22, .61, .36, 1),
        background 0.35s ease,
        border-color 0.35s ease;
    }

    .mobile-close-btn {
      justify-self: start;
    }

    .mobile-actions {
      position: relative;
      justify-self: end;
    }

    .mobile-actions-panel {
      position: absolute;
      top: calc(100% + 0.55rem);
      right: 0;
      min-width: min(15rem, 74vw);
      padding: 0.95rem 0.9rem 1rem;
      background: rgba(18, 18, 18, 0.9);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      opacity: 0;
      pointer-events: none;
      transform: translate3d(0, -8px, 0);
      transition:
        opacity 260ms ease,
        transform 260ms ease;
    }

    .mobile-actions-panel.is-open {
      opacity: 1;
      pointer-events: auto;
      transform: translate3d(0, 0, 0);
    }

    .mobile-mail-link {
      display: block;
      font-family: "Clash Display", sans-serif;
      font-size: 0.86rem;
      line-height: 1.2;
      color: #fff;
      text-decoration: none;
      margin-bottom: 0.95rem;
      word-break: break-word;
    }

    .mobile-socials {
      display: flex;
      justify-content: flex-end;
      gap: 0.6rem;
    }

    .mobile-top-logo {
      display: flex;
      justify-content: center;
      pointer-events: none;
    }

    .mobile-top-logo img {
      width: 2rem;
      height: auto;
      object-fit: contain;
    }

    .mobile-topbar-icon {
      width: 1rem;
      height: 1rem;
      stroke: currentColor;
      stroke-width: 1.8;
      fill: none;
      transition: transform 0.5s ease;
    }

    .mobile-action-mail-icon {
      width: 1.45rem;
      height: 1.45rem;
      object-fit: contain;
      filter: brightness(0) invert(1);
      transition: transform 0.35s ease;
    }

    .mobile-close-btn:hover .mobile-close-icon,
    .mobile-close-btn:focus-visible .mobile-close-icon,
    .mobile-close-btn:active .mobile-close-icon {
      transform: rotate(90deg) scale(1.12);
    }

    .mobile-actions-toggle:hover .mobile-action-mail-icon,
    .mobile-actions-toggle:focus-visible .mobile-action-mail-icon,
    .mobile-actions-toggle:active .mobile-action-mail-icon,
    .mobile-actions-toggle[aria-expanded="true"] .mobile-action-mail-icon {
      transform: scale(1.08);
    }

    .menu-top-logo,
    .project-previews,
    .close-block,
    .bottom-strip {
      display: none;
    }

    .menu-media-shell {
      order: 2;
      height: 25vh;
      min-height: 10.6rem;
      padding: 0 1rem;
      margin-bottom: 0.7rem;
      opacity: 0;
      filter: blur(18px);
      transform: translate3d(0, 26px, 0);
      transition:
        opacity var(--menu-content-duration) var(--menu-ease),
        filter var(--menu-content-duration) var(--menu-ease),
        transform var(--menu-content-duration) var(--menu-ease);
    }

    .menu-media-reveal {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 2px;
    }

    .menu-upper {
      order: 3;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 2.2rem 1.25rem 0;
      flex: 1 1 auto;
    }

    .menu-nav {
      width: 100%;
      max-width: 19rem;
      padding-top: 0;
      gap: 0.42rem;
      align-items: center;
    }

    .menu-link-text {
      font-size: clamp(2.3rem, 8vw, 3.45rem);
      line-height: 0.92;
      text-align: center;
    }

    .menu-link {
      width: 100%;
      text-align: center;
    }

    .menu-link-line {
      display: flex;
      justify-content: center;
    }

    .mobile-preview-rail {
      order: 4;
      display: block;
      width: 100%;
      margin-top: 1.35rem;
      padding-bottom: 0.2rem;
      opacity: 0;
      filter: blur(16px);
      transform: translate3d(0, 26px, 0);
      transition:
        opacity var(--menu-footer-duration) var(--menu-ease),
        filter var(--menu-footer-duration) var(--menu-ease),
        transform var(--menu-footer-duration) var(--menu-ease);
    }

    .social-link {
      width: 2.7rem;
      height: 2.7rem;
    }

    .icon-instagram {
      width: 1.05rem;
      height: 1.05rem;
    }

    .icon-facebook {
      width: 0.98rem;
      height: 0.98rem;
    }

    .icon-x {
      width: 1rem;
      height: 1rem;
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
