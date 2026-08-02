<script>
  import { tick, onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import { navigate } from "$lib/navigate.js";

  export let open = false;
  export let origin = { x: 0, y: 0, width: 44, height: 40 };

  const socialLinks = [
    {
      href: "https://www.instagram.com/agence_3terres/",
      label: "Instagram",
      icon: "/images/instagram.png",
      className: "icon-instagram"
    },
    {
      href: "mailto:contact@agence3terres.fr",
      label: "Mail",
      icon: "/images/mail.png",
      className: "icon-mail"
    }
  ];

  // Une image par page (change au survol du nom de page). `placement` pilote le
  // cadrage / l'ancrage plein écran de chaque image (voir .placement-* en CSS).
  const links = [
    { label: "Accueil", page: "home", image: "/images/ipad-creation.webp", desktopImage: "/images/ipad-creation2.webp", placement: "home" },
    { label: "Services", page: "services", image: "/images/montre-justx.webp", placement: "services" },
    { label: "Projets", page: "travail", image: "/images/justx-ipads.webp", placement: "projets" },
    { label: "A propos", page: "apropos", image: "/images/visage.webp", placement: "apropos" },
    { label: "Contact", page: "contact", image: "/images/mobile-photo2.webp", placement: "contact" }
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

    // Mark the navigation "silent": the full-screen menu already covers the page
    // swap, so the layout's page-level fade transition is redundant here — it only
    // added latency (goto used to wait on the ~300ms enter fade playing behind the
    // opaque menu, then a ~520ms exit fade after). Silent nav skips both, so the
    // route changes near-instantly, client-side.
    try {
      await navigate(path === "/" ? "home" : path.replace(/^\//, ""), { silent: true });
    } catch {
      // navigate() logs its own errors.
    }

    // The destination is now rendered underneath the (still-covering) menu, so the
    // user never sees the previous page. Only now play the smooth close animation,
    // which wipes the menu away to reveal the new page. Silent nav keeps the wait
    // above short, so this stays fast and reactive.
    navigating = false;
    open = false;
    startClose();
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

    <!-- Grande image par page : ancrée à gauche / en bas, en très grand et
         pleinement visible (object-fit: contain), un peu en retrait dans le fond.
         Change au survol du nom de page (previewIndex). -->
    <div class="menu-media" aria-hidden="true">
      <div class="menu-media-stack">
        {#each links as link, i}
          <img
            class="menu-media-image placement-{link.placement}"
            class:is-active={previewIndex === i}
            src={!isMobile && link.desktopImage ? link.desktopImage : link.image}
            alt=""
            loading="lazy"
            decoding="async"
            draggable="false"
          />
        {/each}
      </div>
      <div class="menu-media-scrim"></div>
    </div>

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
          <div class="mobile-socials">
            {#each socialLinks as social}
              <a
                class="social-link"
                href={social.href}
                target={social.href.startsWith("http") ? "_blank" : undefined}
                rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                aria-label={social.label}
                data-cursor="button"
                on:mousemove={handleGlowMove}
                on:click={(e) => { if (social.href === "/") e.preventDefault(); }}
              >
                <img src={social.icon} alt={social.label} class={`icon ${social.className}`} />
              </a>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <div class="menu-upper">
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
    </div>

    <div class="bottom-strip ui-bottom">
      <div class="menu-socials">
        <div class="bottom-kicker">nous suivre</div>
        <div class="socials-group">
          {#each socialLinks as social}
            <a
              class="social-link"
              href={social.href}
              target={social.href.startsWith("http") ? "_blank" : undefined}
              rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
              aria-label={social.label}
              data-cursor="button"
              on:mousemove={handleGlowMove}
              on:click={(e) => { if (social.href === "/") e.preventDefault(); }}
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
  }

  .fs-menu {
    position: fixed;
    inset: 0 auto auto 0;
    width: 100%;
    height: 100vh;
    height: 100lvh;
    min-height: 100vh;
    min-height: 100lvh;
    z-index: 500000;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    color: #fff;
    overflow: hidden;
    --menu-panel-duration: 920ms;
    --menu-content-duration: 800ms;
    --menu-footer-duration: 760ms;
    --menu-media-duration: 1100ms;
    --menu-scrim-duration: 920ms;
    --menu-blur-strength: 13px;
    --menu-ease: cubic-bezier(.22, 1, .36, 1);
    --menu-muted-gray: rgb(157, 156, 156);
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

  .mobile-topbar {
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
  }

  /* Fond noir : simple assombrissement progressif très doux (opacité seule, pas de
     blur plein écran → léger et fluide, n'entrave plus l'anim du bouton header). */
  .menu-panel {
    position: absolute;
    inset: 0;
    background: #010101;
    opacity: 0;
    will-change: opacity;
    transition: opacity var(--menu-panel-duration) var(--menu-ease);
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

  /* ─────────────── Grande image par page (fond gauche) ─────────────── */
  /* L'image apparaît en simple fondu d'opacité (léger, GPU) — PAS de blur/translate
     plein écran (trop lourd → saccadait l'ouverture). */
  .menu-media {
    position: absolute;
    inset: 0;
    z-index: 5;
    pointer-events: none;
    overflow: hidden;
    opacity: 0;
    transition: opacity var(--menu-content-duration) var(--menu-ease);
  }

  .fs-menu.content-visible .menu-media {
    opacity: 1;
  }

  .fs-menu.is-closing .menu-media {
    opacity: 0;
  }

  .menu-media-stack {
    position: absolute;
    inset: 0;
  }

  /* Apparition : fondu + léger dézoom (scale 1.06 → 1). Aucun `filter` sur l'image
     (5 filtres plein écran = coûteux, saccadait l'ouverture) — l'effet « dans le
     fond » vient du voile .menu-media-scrim. */
  .menu-media-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    /* Pleinement visible : l'image entière tient dans l'écran, jamais rognée. */
    object-fit: contain;
    object-position: left bottom;
    opacity: 0;
    transform: scale(1.06);
    transition:
      opacity var(--menu-media-duration) var(--menu-ease),
      transform var(--menu-media-duration) var(--menu-ease);
  }

  .menu-media-image.is-active {
    opacity: 1;
    transform: scale(1);
  }

  /* Cadrage par page — ancrages demandés. */
  .placement-home    { object-position: left bottom; }   /* ipad-creation : bas-gauche */
  .placement-services { object-position: left center; }  /* montre-justx : milieu, collé gauche */
  .placement-projets { object-position: center center; } /* justx-ipads : pleine largeur, centre */
  .placement-apropos { object-position: left bottom; }   /* visage : bas-gauche */
  .placement-contact { object-position: left center; }   /* mobile-photo : pleine hauteur, gauche */

  /* Projets sur desktop : pleine LARGEUR au centre. L'image (ratio ~1.43) est plus
     « carrée » que l'écran, donc `contain` la mettait en pleine hauteur (pas pleine
     largeur) → on remplit la largeur en `cover` (léger recadrage haut/bas). */
  @media (min-width: 901px) {
    .placement-projets {
      object-fit: cover;
      object-position: center center;
    }
  }

  /* Voile de lisibilité : assombrit la DROITE (où sont les noms de pages) et le
     bas (réseaux), en laissant la gauche/le centre bien exposés → l'image se voit
     pleinement, le texte reste lisible. */
  .menu-media-scrim {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(270deg, rgba(1, 1, 1, 0.86) 0%, rgba(1, 1, 1, 0.6) 20%, rgba(1, 1, 1, 0.22) 44%, rgba(1, 1, 1, 0) 66%),
      linear-gradient(0deg, rgba(1, 1, 1, 0.5) 0%, rgba(1, 1, 1, 0) 30%),
      linear-gradient(180deg, rgba(1, 1, 1, 0.34) 0%, rgba(1, 1, 1, 0) 22%),
      /* voile plat léger → image un peu « dans le fond » (remplace le filtre). */
      rgba(1, 1, 1, 0.24);
  }

  /* ─────────────── Navigation (noms de pages, à droite) ─────────────── */
  .menu-upper {
    position: relative;
    z-index: 8;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: clamp(1.25rem, 2vw, 1.75rem) clamp(1.75rem, 5vw, 6rem);
    pointer-events: none;
  }

  .menu-nav {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: clamp(0.6rem, 1.2vh, 1.2rem);
    text-align: right;
    pointer-events: auto;
  }

  .menu-link {
    position: relative;
    width: auto;
    padding: 0;
    border: 0;
    background: transparent;
    color: #fff;
    text-align: right;
    cursor: pointer;
  }

  /* Focus-pull arrival lives on the line wrapper so the text element stays free
     to drive its own colour / glow on hover (no filter conflict). */
  .menu-link-line {
    display: block;
    overflow: visible;
    padding: 0.16em 0 0.2em;
    opacity: 0;
    filter: blur(16px);
    transform: translate3d(0, 26px, 0);
    transition:
      opacity 0.55s ease,
      filter 0.85s var(--menu-ease),
      transform 0.85s var(--menu-ease);
    will-change: opacity, filter, transform;
    backface-visibility: hidden;
  }

  .menu-link-text {
    display: inline-block;
    font-family: "Inter", sans-serif;
    font-weight: 300;
    font-style: normal;
    font-size: clamp(2.95rem, 4.6vw, 5.4rem);
    line-height: 0.94;
    letter-spacing: -0.025em;
    color: var(--menu-muted-gray);
    padding-right: 0.02em;
    text-shadow: 0 2px 16px rgba(0, 0, 0, 0.38);
    transition:
      color 620ms ease,
      filter 720ms ease;
  }

  .menu-link.is-current .menu-link-text,
  .menu-link:hover .menu-link-text,
  .menu-link:focus-visible .menu-link-text {
    color: #fff;
    filter: drop-shadow(0 0 18px rgba(255, 255, 255, 0.1));
  }

  .menu-nav .menu-link:nth-child(1) .menu-link-line { transition-delay: 90ms; }
  .menu-nav .menu-link:nth-child(2) .menu-link-line { transition-delay: 155ms; }
  .menu-nav .menu-link:nth-child(3) .menu-link-line { transition-delay: 210ms; }
  .menu-nav .menu-link:nth-child(4) .menu-link-line { transition-delay: 255ms; }
  .menu-nav .menu-link:nth-child(5) .menu-link-line { transition-delay: 290ms; }

  .fs-menu.is-closing .menu-nav .menu-link .menu-link-line {
    transition-delay: 0ms;
  }

  /* ─────────────── Réseaux / contact (bas droite) ─────────────── */
  .bottom-strip {
    position: absolute;
    left: clamp(1rem, 2vw, 2rem);
    right: clamp(1.75rem, 5vw, 6rem);
    bottom: clamp(1rem, 2.4vw, 2rem);
    z-index: 14;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
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

  .social-link::before,
  .social-link::after {
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

  .social-link::before {
    background: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-strong) 0%,
      var(--site-glow-mid) 22%,
      var(--site-glow-soft) 45%,
      var(--site-glow-fade) 62%,
      transparent 78%
    );
    transition: opacity 0.25s ease;
  }

  .social-link::after {
    background: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-ambient) 0%,
      var(--site-glow-outer) 42%,
      transparent 72%
    );
    filter: blur(2px);
    transition: opacity 0.25s ease;
  }

  .social-link:hover::before,
  .social-link:hover::after {
    opacity: 1;
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
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    border-radius: 10px;
    /* Mêmes hints GPU que les boutons verre du site (header/footer/contact) : init
       propre du backdrop-filter. Le translateZ sur le bouton LUI-MÊME est sans
       danger (seul un transform sur un ANCÊTRE casserait le blur). */
    will-change: transform, opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transition:
      transform 0.35s cubic-bezier(.22, .61, .36, 1),
      background 0.35s ease,
      border-color 0.35s ease;
    pointer-events: auto;
  }

  .social-link:hover {
    background: rgba(255, 255, 255, 0.18);
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

  .icon-mail {
    width: clamp(1.32rem, 1.72vw, 1.62rem);
    height: clamp(1.32rem, 1.72vw, 1.62rem);
  }

  .icon-x {
    width: clamp(1.26rem, 1.65vw, 1.55rem);
    height: clamp(1.26rem, 1.65vw, 1.55rem);
  }

  .bottom-kicker {
    font-family: "Inter", sans-serif;
    font-size: 0.9rem;
    letter-spacing: 0.02em;
    color: var(--menu-muted-gray);
    margin-bottom: 0.8rem;
    text-align: right;
  }

  /* ─────────────── États d'ouverture / fermeture ─────────────── */
  .fs-menu.expanded .menu-scrim {
    opacity: 1;
  }

  .fs-menu.expanded .menu-blur {
    opacity: 1;
    backdrop-filter: blur(var(--menu-blur-strength));
    -webkit-backdrop-filter: blur(var(--menu-blur-strength));
  }

  .fs-menu.expanded .menu-panel {
    opacity: 1;
  }

  .fs-menu.content-visible .ui-content {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
  }

  .fs-menu.content-visible .menu-link-line {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
  }

  .fs-menu.footer-visible .bottom-strip {
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

  .fs-menu.is-closing .menu-link-line {
    opacity: 0;
    filter: blur(14px);
    transform: translate3d(0, -14px, 0);
    transition-delay: 0ms;
  }

  .fs-menu.is-closing .menu-panel {
    opacity: 0;
  }

  .fs-menu.is-closing .menu-scrim {
    opacity: 0;
  }

  .fs-menu.is-closing .menu-blur {
    opacity: 0;
    backdrop-filter: blur(0px);
    -webkit-backdrop-filter: blur(0px);
  }

  /* ─────────────── Tablette ─────────────── */
  @media (max-width: 1100px) and (min-width: 901px) {
    .menu-upper {
      padding-right: clamp(1.5rem, 4vw, 3rem);
    }

    .menu-link-text {
      font-size: clamp(2.8rem, 5.5vw, 4.4rem);
    }
  }

  /* ─────────────── Mobile ─────────────── */
  @media (max-width: 900px) {
    .social-link {
      backdrop-filter: blur(12px) saturate(130%);
      -webkit-backdrop-filter: blur(12px) saturate(130%);
    }

    .fs-menu {
      --menu-panel-duration: 460ms;
      --menu-content-duration: 420ms;
      --menu-footer-duration: 380ms;
      --menu-media-duration: 560ms;
      --menu-scrim-duration: 460ms;
      --menu-blur-strength: 0px;
    }

    .menu-blur {
      display: none;
    }

    /* Solid black surface: drop the blur/translate on mobile (costly on GPU). */
    .menu-panel {
      transform: none;
      filter: none;
      will-change: opacity;
      transition: opacity var(--menu-panel-duration) var(--menu-ease);
    }

    .fs-menu.expanded .menu-panel {
      transform: none;
      filter: none;
      opacity: 1;
    }

    .fs-menu.is-closing .menu-panel {
      transform: none;
      filter: none;
      opacity: 0;
    }

    .ui-content,
    .mobile-topbar {
      filter: none;
    }

    .fs-menu.is-closing .ui-content,
    .fs-menu.is-closing .bottom-strip {
      filter: none;
    }

    .menu-shell {
      display: flex;
      flex-direction: column;
      inset: 0;
      padding-top: calc(env(safe-area-inset-top, 0px) + 0.9rem);
      padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 1.5rem);
      gap: 0;
    }

    /* Image plein écran derrière la nav, un peu plus présente sur mobile. */
    .menu-media {
      z-index: 5;
    }

    /* Projets & Services : image AU-DESSUS des noms (les noms restent centrés en
       dessous). Décalées un peu plus bas que le tout en haut. */
    .placement-projets { object-position: center 12%; }
    .placement-services { object-position: center 24%; }

    /* À propos (visage) : remontée un peu par rapport au bas. */
    .placement-apropos { object-position: left 82%; }

    /* Contact : beaucoup plus grande et collée bas-gauche. On sort du plein écran :
       boîte fixée en bas à gauche, PLUS LARGE que l'écran (déborde à droite) → l'image
       est franchement calée à gauche et bien grande. */
    .placement-contact {
      inset: auto auto 0 0;
      width: 155%;
      height: 82%;
      object-fit: cover;
      object-position: left bottom;
    }

    /* Voile mobile : assombrit surtout le CENTRE (derrière les noms) et laisse le
       haut / le bas plus clairs → les images calées en haut (projets/services) ou en
       bas (contact/accueil/à propos) restent bien visibles. */
    .menu-media-scrim {
      background:
        linear-gradient(180deg,
          rgba(1, 1, 1, 0.26) 0%,
          rgba(1, 1, 1, 0.52) 38%,
          rgba(1, 1, 1, 0.52) 62%,
          rgba(1, 1, 1, 0.26) 100%),
        rgba(1, 1, 1, 0.18);
    }

    /* Le contact passe désormais par la barre du bas (centrée) → on retire tout le
       système d'en haut à gauche. La fermeture reste assurée par la croix du header. */
    .mobile-topbar {
      display: none;
    }

    .mobile-square-btn {
      position: relative;
      overflow: hidden;
      border: 0;
      color: inherit;
      width: 2.75rem;
      height: 2.75rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(24, 24, 24, 0.96);
      border-radius: 10px;
      padding: 0;
      cursor: pointer;
      transition:
        transform 0.35s cubic-bezier(.22, .61, .36, 1),
        background 0.35s ease,
        border-color 0.35s ease;
    }

    /* The header X (top-right) closes the menu now → drop the in-menu close. */
    .mobile-close-btn {
      display: none;
    }

    /* Contact button (mail) in the LEFT corner. */
    .mobile-actions {
      position: relative;
      justify-self: start;
      grid-column: 1;
    }

    .mobile-actions-panel {
      position: absolute;
      top: calc(100% + 0.55rem);
      left: 0;
      right: auto;
      width: 2.75rem;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
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

    .mobile-socials {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
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

    .mobile-actions-toggle:hover .mobile-action-mail-icon,
    .mobile-actions-toggle:focus-visible .mobile-action-mail-icon,
    .mobile-actions-toggle:active .mobile-action-mail-icon,
    .mobile-actions-toggle[aria-expanded="true"] .mobile-action-mail-icon {
      transform: scale(1.08);
    }

    /* Boutons contact / réseaux en bas, CENTRÉS (comme desktop mais centré). */
    .bottom-strip {
      display: flex;
      left: 1rem;
      right: 1rem;
      bottom: calc(env(safe-area-inset-bottom, 0px) + 3.25rem);
      justify-content: center;
      gap: 0;
      filter: none;
      /* PAS de transform ici : un ancêtre transformé casserait le backdrop-filter
         des boutons (ils ne bluraient pas). Arrivée en opacité seule. */
      transform: none;
      transition: opacity var(--menu-footer-duration) var(--menu-ease);
    }

    /* AUCUN `filter` sur la barre (même `blur(0)` créerait un backdrop root qui
       casse le blur des boutons enfants). On force `none` dans tous les états. */
    .fs-menu.footer-visible .bottom-strip {
      transform: none;
      filter: none;
    }

    .fs-menu.is-closing .bottom-strip {
      transform: none;
      filter: none;
      opacity: 0;
    }

    .bottom-strip .menu-socials {
      align-items: center;
    }

    .bottom-strip .bottom-kicker {
      text-align: center;
    }

    .bottom-strip .socials-group {
      justify-content: center;
    }

    .menu-upper {
      order: 3;
      height: auto;
      flex: 1 1 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem 1.25rem;
    }

    .menu-nav {
      width: 100%;
      max-width: 20rem;
      align-items: center;
      text-align: center;
      gap: 0.42rem;
    }

    .menu-link,
    .menu-link-text {
      text-align: center;
    }

    .menu-link-text {
      font-size: clamp(2.4rem, 9vw, 3.7rem);
      line-height: 0.92;
    }

    .menu-link-line {
      display: flex;
      justify-content: center;
      opacity: 1;
      filter: none;
      transform: none;
      transition: none;
    }

    /* Mobile drives the lightweight reveal on the text itself (no blur, for perf). */
    .menu-link-text {
      opacity: 0;
      transform: translate3d(0, 14px, 0);
      transition:
        opacity var(--menu-content-duration) var(--menu-ease),
        transform var(--menu-content-duration) var(--menu-ease);
    }

    .fs-menu.content-visible .menu-link-text {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }

    .fs-menu.is-closing .menu-link-text {
      opacity: 0;
      transform: translate3d(0, -10px, 0);
      transition-delay: 0ms;
    }

    .menu-nav .menu-link:nth-child(1) .menu-link-text { transition-delay: 40ms; }
    .menu-nav .menu-link:nth-child(2) .menu-link-text { transition-delay: 80ms; }
    .menu-nav .menu-link:nth-child(3) .menu-link-text { transition-delay: 110ms; }
    .menu-nav .menu-link:nth-child(4) .menu-link-text { transition-delay: 135ms; }
    .menu-nav .menu-link:nth-child(5) .menu-link-text { transition-delay: 155ms; }

    .fs-menu.is-closing .menu-nav .menu-link .menu-link-text {
      transition-delay: 0ms;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .menu-scrim,
    .menu-blur,
    .menu-panel,
    .menu-media,
    .menu-media-image,
    .ui-content,
    .menu-link-text,
    .menu-link-line,
    .bottom-strip,
    .social-link {
      transition: none !important;
      animation: none !important;
      filter: none !important;
    }

    .fs-menu.content-visible .menu-link-line {
      opacity: 1;
      transform: none;
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

  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .menu-link-text { font-size: clamp(1.5rem, 6vw, 2.4rem); }
    .menu-nav { gap: clamp(0.15rem, 1vh, 0.5rem); }
    .menu-upper {
      max-height: 100%;
      overflow-y: auto;
    }
  }
</style>
