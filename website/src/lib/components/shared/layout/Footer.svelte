<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import { reveal } from "$lib/actions/reveal.js";
  import SiteGradient from "$lib/components/shared/SiteGradient.svelte";
  import {
    registerRead,
    unregisterRead,
    forceScrollEngineUpdate
  } from "$lib/scrollEngine.js";

  let footerEl;
  let resizeObserver;
  let curReveal = 0;
  let tgtReveal = 0;
  let rafId = null;

  const lerp = (a, b, t) => a + (b - a) * t;

  function applyReveal(val) {
    footerEl?.style.setProperty("--footer-reveal", val.toFixed(4));
  }

  function revealLoop() {
    curReveal = lerp(curReveal, tgtReveal, 0.1);
    applyReveal(curReveal);
    if (Math.abs(curReveal - tgtReveal) > 0.001) {
      rafId = requestAnimationFrame(revealLoop);
    } else {
      curReveal = tgtReveal;
      applyReveal(tgtReveal);
      rafId = null;
    }
  }

  // Les deux entrées `prisme-*` sont des rendus 3D du prisme de la marque, vus
  // de très près (voir public/images/prisme-<plan>-<fond>.webp). Chaque plan
  // existe en trois fonds — `noir`, `nuit`, `aube` — et changer de fond ne
  // demande que de changer le suffixe ici.
  const footerImages = {
    "/": "/images/prisme-traverse-noir.webp",
    "/services": "/images/montre-justx.webp",
    "/travail": "/images/cartes-visites.webp",
    "/apropos": "/images/prisme-eclat-bas-aube.webp",
    "/projet3": "/images/moovy-salon.webp",
    "/projet8": "/images/lybra-affichage.webp",
  };

  /*  ── Les pieds de page à DÉGRADÉ ────────────────────────────────────────
   *  Portés de la librairie de dégradés (voir `shared/SiteGradient.svelte`) et
   *  repeints à la palette du site. Là où une route en a un, il REMPLACE la
   *  photographie de fond : le prisme reste pour toutes les autres. Chaque
   *  pôle a le sien, pour qu'on ne lise pas trois fois le même bas de page. */
  const footerGradients = {
    "/": "aura-spectre",
    // Le même que la home : « Halo bleu » n'allait pas ici. Il reste porté dans
    // `SiteGradient` et prêt à servir ailleurs, il n'est simplement plus posé.
    "/apropos": "aura-spectre",
    "/services/design": "arete",
    "/services/digital": "ellipses",
    "/services/studio": "dunes"
  };

  $: pathname = $page.url.pathname.replace(/\/+$/, "") || "/";
  // Page suivante = hauteur de document différente : la course du fondu change.
  $: if (browser && pathname) scheduleMeasure();
  $: footerGradient = footerGradients[pathname] ?? null;
  $: footerImage = footerImages[pathname] ?? footerImages["/"];
  $: footerThemeClass =
    pathname === "/services" ? "theme-services" :
    ["/travail", "/projet1", "/projet3", "/projet4", "/projet6", "/projet8"].includes(pathname) ? "theme-projets" :
    pathname === "/apropos" ? "theme-apropos" :
    pathname === "/contact" ? "theme-contact" :
    "theme-home";

  function handleButtonMove(event) {
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  /*  ── Pourquoi la mesure est séparée de la lecture ─────────────────────────
   *  Cette fonction écrivait `--footer-reserve` puis lisait `scrollHeight` dans
   *  la foulée, à CHAQUE événement de défilement. Or la variable écrite change
   *  la marge basse de `.page-wrapper`, donc la hauteur du document : la lecture
   *  qui suit forçait un recalcul de mise en page synchrone, sur une valeur que
   *  l'écriture venait de salir, soixante fois par seconde. C'est cher partout
   *  et ruineux sur Firefox — c'est l'autre moitié du défilement qui tremble.
   *
   *  Les hauteurs sont donc mesurées À PART, seulement quand quelque chose a pu
   *  les changer, et la lecture de défilement ne fait plus que de l'arithmétique
   *  sur des valeurs déjà connues. */
  let besoinMesure = true;
  let hFooter = 0;
  let debutReveal = 0;
  let courseReveal = 1;

  function measure() {
    if (!browser || !footerEl) return;
    const h = footerEl.offsetHeight;
    const vh = window.innerHeight;
    const docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);

    // L'écriture ne part que si la valeur a vraiment changé : sinon elle salit
    // la mise en page pour rien, et la mesure suivante la refait calculer.
    if (h !== hFooter) {
      hFooter = h;
      document.documentElement.style.setProperty("--footer-reserve", `${h}px`);
    }

    debutReveal = Math.max(docH - vh - h * 1.05, 0);
    courseReveal = Math.max(h * 0.82, 1);
  }

  function scheduleMeasure() {
    besoinMesure = true;
    forceScrollEngineUpdate();
  }

  function handleRead(y) {
    if (!footerEl) return;

    if (besoinMesure) {
      besoinMesure = false;
      measure();
    }

    const cible = Math.min(Math.max((y - debutReveal) / courseReveal, 0), 1);
    if (cible === tgtReveal) return;

    tgtReveal = cible;
    if (!rafId) rafId = requestAnimationFrame(revealLoop);
  }

  onMount(() => {
    if (!browser || !footerEl) return;

    // Le pied de page change de hauteur (texte qui se replie, barre d'adresse
    // mobile) : seul CET élément est observé, jamais la racine du document.
    resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(footerEl);

    /*  La lecture passe par le moteur de scroll du site, comme tout le reste :
     *  une seule boucle d'images, une phase de lecture avant les écritures, et
     *  la position du défilement lue au début de l'image plutôt que reprise
     *  d'un écouteur qui, sur Firefox, arrive quand ça l'arrange. */
    registerRead(handleRead, { priority: 4 });
    forceScrollEngineUpdate();

    window.addEventListener("resize", scheduleMeasure, { passive: true });
    window.addEventListener("orientationchange", scheduleMeasure, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      unregisterRead(handleRead);
      resizeObserver?.disconnect();
      document.documentElement.style.removeProperty("--footer-reserve");
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("orientationchange", scheduleMeasure);
    };
  });
</script>

<footer
  class={`footer section-full ${footerThemeClass}`}
  bind:this={footerEl}
>
  {#if footerGradient}
    <div class="footer-bg footer-bg--grad">
      <SiteGradient nom={footerGradient} />
    </div>
  {:else}
    <div class="footer-bg" style={`background-image: url('${footerImage}')`}></div>
  {/if}
  <div class="footer-overlay" class:is-grad={Boolean(footerGradient)}></div>

  <div class="footer-content">
    <div class="footer-shell">
      <div class="hero-block">
        <div class="hero-copy">
          <h2 use:reveal>Parlons <span class="footer-h2-muted">de votre projet.</span></h2>
          <a
            href="/contact"
            class="contact-button nav-btn"
            data-sveltekit-preload-data="hover"
            on:mousemove={handleButtonMove}
          >
            <span class="nav-btn-flip" data-text="Nous contacter">
              <span class="nav-btn-text">Nous contacter</span>
            </span>
          </a>
        </div>
      </div>

      <div class="footer-bar">
        <p class="legal">2026 Agence 3 Terres</p>
        <a
          class="legal legal-link legal-right"
          href="/mentions-legales"
          data-sveltekit-preload-data="hover"
        >
          Mentions légales
        </a>
      </div>
    </div>
  </div>
</footer>

<style>
  .footer {
    --footer-reveal: 0;
    position: fixed;
    inset: auto 0 0 0;
    bottom: 0;
    overflow: hidden;
    background: var(--bg-deep, #070707);
    isolation: isolate;
    z-index: 0;
    opacity: var(--footer-reveal);
    /*  L'opacité varie à chaque image pendant l'apparition du pied de page.
     *  Sans promotion, le navigateur REPEINT tout ce qu'il contient à chaque
     *  fois — et depuis qu'il contient un dégradé (plusieurs rampes plus un
     *  grain fondu), ça coûtait douze millisecondes par image sur Firefox.
     *  Promu, l'opacité passe au compositeur, sans repeindre.
     *  ⚠️ Ce `will-change` ne change rien au verre des boutons : `.footer`
     *  était DÉJÀ leur racine de fond (il porte `opacity` et `isolation`). */
    will-change: opacity;
  }

  .footer-bg,
  .footer-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  /*  Le dégradé n'est pas une photographie : il n'a ni à être assombri ni à
   *  être dessaturé, et il porte son propre grain. Il garde seulement le fondu
   *  d'apparition du pied de page. */
  /*  Le dégradé ne fait PAS varier sa propre opacité : le fondu est déjà porté
   *  par `.footer`, et deux opacités animées l'une dans l'autre font repeindre
   *  la couche intérieure à chaque image. */
  .footer-bg--grad {
    filter: none;
    transform: none;
    opacity: 1;
    will-change: auto;
  }

  .footer-bg {
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    filter: brightness(0.56) contrast(1.02) saturate(0.92);
    opacity: calc(0.12 + (0.88 * var(--footer-reveal)));
    will-change: opacity;
    transform: scale(1.03);
  }

  .footer-overlay {
    background: linear-gradient(
      to bottom,
      rgba(2, 4, 6, 0.9) 0%,
      rgba(4, 6, 9, 0.46) 34%,
      rgba(4, 6, 9, 0.22) 58%,
      rgba(2, 4, 6, 0.9) 100%
    );
    opacity: calc(0.2 + (0.8 * var(--footer-reveal)));
    will-change: opacity;
  }

  /* Sur un dégradé, le voile ne sert qu'à tenir le texte : deux fois moins
     appuyé que sur une photographie, sinon il éteint la couleur. */
  .footer-overlay.is-grad {
    background: linear-gradient(
      to bottom,
      rgba(2, 4, 6, 0.58) 0%,
      rgba(4, 6, 9, 0.16) 36%,
      rgba(4, 6, 9, 0.1) 58%,
      rgba(2, 4, 6, 0.62) 100%
    );
  }

  .footer-content {
    position: relative;
    z-index: 2;
    min-height: 100lvh;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: clamp(1.2rem, 2vw, 2rem);
  }

  .footer-shell {
    display: flex;
    flex-direction: column;
    gap: clamp(2rem, 5vw, 4rem);
    padding-bottom: max(clamp(1rem, 2vw, 1.8rem), var(--safe-bottom-offset));
    /* Pas de will-change/opacity/transform ici : ils feraient de .footer-shell
       un "backdrop root" qui exclut .footer-bg → le backdrop-filter du bouton
       n'aurait rien à flouter. Le fondu du footer est porté par .footer opacity. */
  }

  .hero-block {
    min-height: min(74lvh, 860px);
    display: flex;
    align-items: end;
    gap: clamp(1.4rem, 4vw, 4rem);
  }

  .hero-copy {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: clamp(1.5rem, 3vw, 2.8rem);
    max-width: min(44rem, 78vw);
    padding-bottom: clamp(1rem, 2.4vw, 2.2rem);
    width: 100%;
  }

  .hero-copy h2 {
    margin: 0;
    max-width: 10ch;
    font-family: var(--site-font);
    font-weight: var(--site-weight-display);
    font-size: clamp(2.2rem, 5.5vw, 4.8rem);
    line-height: 0.96;
    letter-spacing: -0.04em;
    color: #fff;
    text-wrap: balance;
  }

  .footer-h2-muted {
    color: rgba(255, 255, 255, 0.42);
  }

  .nav-btn {
    font-family: var(--site-font);
    font-weight: var(--site-weight);
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    color: inherit;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    will-change: transform, opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 10px;
    box-shadow: 0 6px 8px rgba(var(--shade-rgb, 0, 0, 0), 0.04);
    transition:
      color 220ms ease,
      transform 1.2s cubic-bezier(.22,.61,.36,1),
      box-shadow 1.2s cubic-bezier(.22,.61,.36,1),
      background 1.2s cubic-bezier(.22,.61,.36,1);
  }

  .nav-btn-flip {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
  }

  .nav-btn-text {
    display: block;
    transform: translateY(0%);
    transition:
      transform 0.45s cubic-bezier(.22,.61,.36,1),
      opacity 0.28s ease;
  }

  .nav-btn-flip::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition:
      transform 0.45s cubic-bezier(.22,.61,.36,1),
      opacity 0.28s ease;
    white-space: nowrap;
    color: inherit;
  }

  .nav-btn:hover .nav-btn-text {
    transform: translateY(-100%);
  }

  .nav-btn:hover .nav-btn-flip::after {
    transform: translateY(0%);
  }

  .nav-btn::before,
  .nav-btn::after {
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

  .nav-btn::before {
    background: radial-gradient(
      128px circle at var(--mx, 50%) var(--my, 50%),
      var(--footer-glow-strong, var(--site-glow-strong)) 0%,
      var(--footer-glow-mid, var(--site-glow-mid)) 26%,
      var(--footer-glow-soft, var(--site-glow-soft)) 52%,
      var(--footer-glow-fade, var(--site-glow-fade)) 70%,
      transparent 86%
    );
    transition: opacity 0.25s ease;
  }

  .nav-btn::after {
    background: radial-gradient(
      156px circle at var(--mx, 50%) var(--my, 50%),
      var(--footer-glow-ambient, var(--site-glow-ambient)) 0%,
      var(--footer-glow-outer, var(--site-glow-outer)) 48%,
      transparent 82%
    );
    filter: blur(3px);
    transition: opacity 0.25s ease;
  }

  .nav-btn:hover::before,
  .nav-btn:hover::after {
    opacity: 1;
  }

  .contact-button {
    min-width: clamp(180px, 20vw, 260px);
    min-height: clamp(60px, 6.8vw, 78px);
    padding: 0 2rem;
    margin-top: clamp(0.35rem, 1vw, 0.8rem);
    border: 0 solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.11);
    color: #fff;
    text-decoration: none;
    font-size: clamp(1.08rem, 1.5vw, 1.26rem);
    font-weight: var(--site-weight);
  }

  .contact-button:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.17);
  }

  .theme-home,
  .theme-apropos,
  .theme-services,
  .theme-projets,
  .theme-contact {
    --footer-glow-strong: var(--site-glow-strong);
    --footer-glow-mid: var(--site-glow-mid);
    --footer-glow-soft: var(--site-glow-soft);
    --footer-glow-fade: var(--site-glow-fade);
    --footer-glow-ambient: var(--site-glow-ambient);
    --footer-glow-outer: var(--site-glow-outer);
  }

  .footer-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 1.1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }

  .legal {
    margin: 0;
    font-family: var(--site-font);
    font-weight: var(--site-weight);
    font-size: 0.76rem;
    color: rgba(255, 255, 255, 0.44);
    line-height: 1.4;
  }

  .legal-right {
    text-align: right;
  }

  .legal-link {
    transition: color 220ms ease, opacity 220ms ease;
  }

  .legal-link:hover {
    color: rgba(255, 255, 255, 0.78);
  }

  .footer-bg {
    transform: scale(1);
  }

  .footer-shell {
    opacity: 1;
    transform: none;
  }

  @media (max-width: 768px) {
    .nav-btn,
    .contact-button {
      backdrop-filter: blur(12px) saturate(130%);
      -webkit-backdrop-filter: blur(12px) saturate(130%);
    }

    .footer {
      inset: auto 0 auto 0;
      top: 30lvh;
      bottom: auto;
      height: 70lvh;
      min-height: 70lvh;
    }

    .footer-bg {
      filter: brightness(0.52) contrast(1.02) saturate(0.92);
    }

    .footer-bg--grad {
      filter: none;
    }

    .footer-content {
      height: 70lvh;
      min-height: 70lvh;
      padding-bottom: max(clamp(2.1rem, 6.8vw, 2.7rem), env(safe-area-inset-bottom, 0px));
    }

    .hero-block {
      min-height: calc(70lvh - clamp(5.5rem, 10vw, 7rem));
      align-items: end;
    }

    .hero-copy {
      max-width: 100%;
      gap: clamp(1.8rem, 5vw, 2.5rem);
    }

    .hero-copy h2 {
      max-width: 9ch;
      font-size: clamp(1.9rem, 9.5vw, 3.2rem);
    }

    .contact-button {
      width: min(100%, 260px);
      min-height: 64px;
      margin-top: 0;
      margin-left: 0;
      align-self: flex-start;
    }

    .footer-bar {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      flex-wrap: nowrap;
    }

    .legal {
      font-size: 0.72rem;
      max-width: none;
      white-space: nowrap;
    }

    .legal-right {
      text-align: right;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .footer-bg,
    .footer-overlay,
    .footer-shell,
    .contact-button,
    .nav-btn,
    .nav-btn-text,
    .nav-btn-flip::after {
      transition: none;
    }

    .footer-bg,
    .footer-overlay,
    .footer-shell {
      opacity: 1;
      transform: none;
    }

    .nav-btn:hover .nav-btn-text {
      transform: translateY(0%);
    }

    .nav-btn:hover .nav-btn-flip::after,
    .nav-btn::before,
    .nav-btn::after {
      opacity: 0;
      transform: translateY(100%);
    }
  }
</style>
