<script>
  /*  ── Le menu « sous la page » et la transition de page (2026-10-08) ───────
   *  Porté du composant « Menu sous la page » de la librairie. Le menu ne se
   *  pose pas PAR-DESSUS le site : il vit DESSOUS. Ouvrir fait reculer la page
   *  — `.page-stage` du layout, qui porte le contenu ET le pied de page — :
   *  elle descend, se réduit et s'arrondit comme une carte qu'on écarte.
   *
   *  Le même moteur joue DEUX gestes sur la page :
   *  - « menu » : la carte descend et découvre le menu ;
   *  - « cadre » : la transition de page. La carte recule SUR PLACE en prenant
   *    les marges et l'arrondi du cadre du hero de la home (`--site-inset` /
   *    22 px, 1rem / 18 px sous 900 px), un voile au noir de la page la couvre,
   *    la navigation a lieu dessous, le voile se lève sur la nouvelle page et la
   *    carte revient plein
   *    écran. Les navigations SILENCIEUSES (liens du menu, pied de page
   *    « projet suivant ») n'y passent pas : celle du menu a son propre geste,
   *    celle des projets sa transition spéciale, qu'on ne touche pas.
   *
   *  Le voile est un aplat posé exactement sur la carte (sa découpe reprend sa
   *  forme en coordonnées d'écran), dont seule l'opacité s'anime. Un flou a été
   *  essayé à sa place le 2026-10-08, puis retiré à la demande du client.
   *
   *  Le header n'est PAS touché : son bouton pilote `open` (bind).
   *
   *  Ce qui tient au défilement du DOCUMENT :
   *  - la carte est une découpe (`clip-path: inset(...)`) de `.page-stage` à la
   *    fenêtre courante, en coordonnées du document, et l'origine du transform
   *    est le centre de cette fenêtre ;
   *  - le pied de page est en `position: fixed` : sous un ancêtre transformé il
   *    irait se recaler au bas du document — il est épinglé le temps du geste ;
   *  - le défilement est verrouillé SEULEMENT menu ouvert, par `overflow:
   *    hidden` sur <html>. Surtout pas de `preventDefault` sur la molette :
   *    dans le WebKit de Safari 18.1, une molette annulée laisse le défilement
   *    de la page BLOQUÉ même après le retrait de l'écouteur.
   *
   *  Le transform de la carte est une TRANSITION CSS (compositeur) ; la
   *  découpe et les voiles suivent le transform RÉEL image par image. */
  import { onMount, untrack } from "svelte";
  import { afterNavigate, beforeNavigate, onNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import { navigate } from "$lib/navigate.js";
  import {
    clearSilentNavigation,
    isSilentNavigationPending,
    markNextNavigationSilent
  } from "$lib/routeTransitionState.js";

  let { open = $bindable(false) } = $props();

  // Chaque mot porte son rang dans tout le menu : la cascade de la home
  // (38 ms d'un mot au suivant) court d'un nom à l'autre.
  let wordCount = 0;
  const pages = [
    { label: "Accueil", path: "/" },
    { label: "Services", path: "/services" },
    { label: "Projets", path: "/travail" },
    { label: "À propos", path: "/apropos" },
    { label: "Contact", path: "/contact" }
  ].map((item, index) => ({
    ...item,
    index,
    words: item.label.split(" ").map((text) => ({ text, i: wordCount++ }))
  }));

  // Les boutons réseaux du menu précédent, tels quels.
  const socialLinks = [
    { href: "https://www.instagram.com/agence_3terres/", label: "Instagram", icon: "/images/instagram.png", className: "icon-instagram" },
    { href: "mailto:contact@agence3terres.fr", label: "Mail", icon: "/images/mail.png", className: "icon-mail" }
  ];

  const EASE_CARD = "cubic-bezier(0.76, 0, 0.24, 1)"; // power3.inOut
  // Un geste INTERROMPU (refermer pendant l'ouverture, rouvrir pendant la
  // fermeture) repart vite : en `inOut`, la carte restait figée un quart de
  // seconde avant de revenir.
  const EASE_TURN = "cubic-bezier(0.22, 1, 0.36, 1)";
  // Les deux temps du voile — les MÊMES que `.page-fade` en CSS.
  const FADE_IN_MS = 200;
  const FADE_OUT_MS = 450;
  // L'arrivée des noms — l'effet des textes de la home (`revealWordIn`
  // d'app.css), rejoué image par image en JS : départ à 20 % du recul, 0,65 s
  // par mot, 38 ms d'écart (la cadence de la home), flou de 12 px, montée de
  // 0,24 em, violet profond puis indigo de la charte à 38 % de la course.
  const WORD_START = 0.2;
  const WORD_MS = 650;
  const WORD_STAGGER_MS = 38;
  const WORD_BLUR = 12;
  const WORD_RISE = 0.24;
  const WORD_INK_FROM = [23, 5, 47]; // #17052f
  const WORD_INK_MID = [87, 104, 255]; // #5768ff
  const WORD_INK_MID_AT = 0.38;

  const pathname = $derived(page.url.pathname.replace(/\/+$/, "") || "/");

  // La rubrique de la page courante : ses sous-pages (pôles, projets) gardent
  // le nom de leur rubrique en blanc.
  const sectionIndex = $derived.by(() => {
    if (pathname.startsWith("/services")) return 1;
    if (pathname === "/travail" || /^\/projet\d+$/.test(pathname)) return 2;
    if (pathname === "/apropos") return 3;
    if (pathname === "/contact") return 4;
    return 0;
  });

  let visible = $state(false); //  le menu est à l'écran (ouvert ou en mouvement)
  let opened = $state(false); //   la cible : ouvert ou refermé
  let veiled = $state(false); //   la carte est voilée (changement de page)
  let backdrop = $state(false); // le fond du menu sert de fond à la carte (cadre)
  let revealed = $state(false); // les noms sont (ou arrivent) à l'écran

  let rootEl;
  let veilEl;
  let fadeEl;
  let probeEl;

  // Hors réactivité : l'état de la carte.
  /** @type {null | "menu" | "frame"} */
  let mode = null;
  let stage = null;
  let geo = null;
  let cfg = { recede: 0.5, scale: 0.95, radius: 22, duration: 1 };
  let frame = { inset: 24, radius: 22, out: 0.62, back: 0.78 };
  let pinned = new Set();
  let finishTimer = 0;
  let geometryRaf = 0;
  let navigating = false;
  let navigatedUnder = false;
  let scrollLocked = false;
  let startRaf = 0;
  let moveCount = 0;
  let trackRaf = 0;
  // La cible du DERNIER mouvement lancé (true = reculée, false = à plat) : une
  // fin de transition ne compte que si elle est celle de ce mouvement-là.
  let lastTarget = false;
  // Appelé quand le recul de la transition de page est réellement fini.
  let onOutCardDone = null;
  let revealRaf = 0;

  // La transition de page en cours : sa phase et la promesse que SvelteKit
  // attend avant de changer la page (`onNavigate`).
  /** @type {null | "out" | "in"} */
  let pagePhase = null;
  let outPromise = null;
  let pageTimers = [];

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  function readConfig() {
    const cs = getComputedStyle(rootEl);
    const num = (name, fallback) => {
      const v = parseFloat(cs.getPropertyValue(name));
      return Number.isFinite(v) ? v : fallback;
    };
    cfg = {
      recede: num("--menu-recede", 0.5),
      scale: num("--menu-scale", 0.95),
      radius: num("--menu-radius", 22),
      duration: num("--menu-duration", 1)
    };
    // La marge du cadre est une longueur CSS (`clamp(...)`) : mesurée par une
    // sonde, pas relue comme un nombre.
    frame = {
      inset: probeEl?.getBoundingClientRect().width || 24,
      radius: num("--frame-radius", 22),
      out: num("--frame-out", 0.62),
      back: num("--frame-back", 0.78)
    };
  }

  // Position dans le document, transform ignoré (offsetTop ne le voit pas).
  function docTop(el) {
    let y = 0;
    for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
    return y;
  }

  function measure() {
    stage = document.querySelector(".page-stage");
    if (!stage) return false;
    const vh = window.innerHeight;
    const y = window.scrollY - docTop(stage);
    const footer = [...stage.children].find((el) => getComputedStyle(el).position === "fixed") ?? null;
    geo = {
      y,
      vh,
      vw: document.documentElement.clientWidth,
      // La découpe couvre au moins toute la fenêtre visible, barre d'outils
      // comprise : un liseré de menu sous la carte se verrait au départ.
      h: Math.max(vh, document.documentElement.clientHeight),
      footer,
      footerTop: footer ? y + vh - footer.offsetHeight : 0
    };
    return true;
  }

  // L'échelle du cadre : celle qui laisse la marge du hero de chaque côté.
  const frameScale = () => (geo ? 1 - (2 * frame.inset) / geo.vw : 1);
  const targetScale = () => (mode === "frame" ? frameScale() : cfg.scale);

  // Où en est la carte, lu sur le transform RÉEL (celui que la transition est
  // en train de jouer) : 0 = à plat, 1 = reculée.
  function cardProgress() {
    const full = targetScale();
    if (!stage || full >= 1) return 0;
    const m = getComputedStyle(stage).transform;
    if (!m || m === "none") return 0;
    const a = parseFloat(m.slice(m.indexOf("(") + 1));
    if (!Number.isFinite(a)) return 0;
    return Math.min(1, Math.max(0, (1 - a) / (1 - full)));
  }

  const px = (n) => `${n.toFixed(2)}px`;

  // La carte à l'écran pour une avancée `p` : la découpe de la page (dans ses
  // coordonnées, AVANT le transform), et la même forme en coordonnées d'écran
  // pour les deux voiles, qui ne sont pas transformés.
  function render(p) {
    if (!stage || !geo) return;
    const { y, vh, vw, h } = geo;
    let stageClip;
    let screenClip;

    if (mode === "frame") {
      // Recul sur place : la marge du hero tout autour, l'arrondi du hero.
      const s = 1 - (1 - frameScale()) * p;
      const m = frame.inset * p;
      const r = frame.radius * p;
      const half = (vh / 2 - m) / s;
      stageClip = `inset(${px(y + vh / 2 - half)} 0px calc(100% - ${px(y + vh / 2 + half)}) 0px round ${px(r / s)})`;
      screenClip = `inset(${px(m)} round ${px(r)})`;
    } else {
      // La découpe descend d'un écran SOUS la fenêtre : le bas de la carte est
      // toujours hors champ, ses coins du bas ne se voient jamais.
      const s = 1 - (1 - cfg.scale) * p;
      const r = cfg.radius * p;
      const rl = px(r / s);
      stageClip = `inset(${px(y)} 0px calc(100% - ${px(y + h * 2)}) 0px round ${rl} ${rl} 0px 0px)`;
      const top = cfg.recede * vh * p + (vh * (1 - s)) / 2;
      const side = (vw * (1 - s)) / 2;
      screenClip = `inset(${px(top)} ${px(side)} 0px ${px(side)} round ${px(r)} ${px(r)} 0px 0px)`;
    }

    stage.style.clipPath = stageClip;
    if (fadeEl) fadeEl.style.clipPath = screenClip;
    if (veilEl) veilEl.style.clipPath = screenClip;
  }

  function unpin(el) {
    el.style.top = "";
    el.style.bottom = "";
    pinned.delete(el);
  }

  function writeGeometry() {
    if (!stage || !geo) return;
    stage.style.transformOrigin = `50% ${px(geo.y + geo.vh / 2)}`;

    for (const el of [...pinned]) if (el !== geo.footer) unpin(el);
    if (geo.footer) {
      geo.footer.style.top = px(geo.footerTop);
      geo.footer.style.bottom = "auto";
      pinned.add(geo.footer);
    }

    rootEl.style.setProperty("--menu-vh", `${geo.vh}px`);
  }

  // Une cible jamais identique au point de départ du geste précédent : sinon le
  // navigateur y voit un aller-retour et RACCOURCIT encore la durée qu'on a
  // déjà calculée (la carte sautait en une image). Un décalage différent à
  // chaque geste, d'un millième à un dixième de pixel : invisible.
  function moveCard(toFull, { instant = false, duration = cfg.duration, ease = EASE_CARD } = {}) {
    if (!stage || !geo) return;
    const nudge = ((++moveCount % 97) + 1) * 0.001;
    let transform;
    if (!toFull) transform = `translate3d(0px, ${nudge.toFixed(3)}px, 0px) scale(1)`;
    else if (mode === "frame") transform = `translate3d(0px, ${nudge.toFixed(3)}px, 0px) scale(${frameScale().toFixed(5)})`;
    else transform = `translate3d(0px, ${(cfg.recede * geo.vh + nudge).toFixed(3)}px, 0px) scale(${cfg.scale})`;
    stage.style.transition = instant || duration < 0.01 ? "none" : `transform ${duration.toFixed(3)}s ${ease}`;
    stage.style.transform = transform;
    lastTarget = toFull;
  }

  // La découpe et les voiles suivent le transform RÉEL de la carte,
  // image par image : une seule horloge pour tout.
  function track() {
    cancelAnimationFrame(trackRaf);
    const step = () => {
      if (!mode || !stage) return;
      render(cardProgress());
      trackRaf = requestAnimationFrame(step);
    };
    trackRaf = requestAnimationFrame(step);
  }

  function stopTrack() {
    cancelAnimationFrame(trackRaf);
    trackRaf = 0;
  }

  /* ── Le défilement : verrouillé menu ouvert, libre dès qu'on referme ── */

  function onTouchMove(event) {
    if (opened && visible) event.preventDefault();
  }

  function lockScroll() {
    if (scrollLocked) return;
    scrollLocked = true;
    // `scrollLocks.js` (observateur du layout) retire tout `overflow: hidden`
    // posé sur <html> s'il ne voit pas de menu ouvert : la classe doit donc être
    // là AVANT le verrou.
    rootEl?.classList.add("is-visible");
    document.documentElement.style.overflow = "hidden";
    if (window.matchMedia?.("(pointer: coarse)").matches) {
      document.addEventListener("touchmove", onTouchMove, { passive: false });
    }
  }

  function unlockScroll() {
    document.removeEventListener("touchmove", onTouchMove);
    if (!scrollLocked) return;
    scrollLocked = false;
    if (document.documentElement.style.overflow === "hidden") {
      document.documentElement.style.overflow = "";
    }
  }

  // Le layout lève tous les verrous quand l'onglet redevient visible : menu
  // toujours ouvert, on remet le nôtre.
  function onVisibilityChange() {
    if (document.visibilityState !== "visible" || !opened || !visible) return;
    scrollLocked = false;
    lockScroll();
  }

  function focusMenuButton() {
    document.querySelector(".header-nav-btn")?.focus?.();
  }

  function onKeyDown(event) {
    if (event.key !== "Escape" || !visible || !opened) return;
    event.preventDefault();
    open = false;
    focusMenuButton();
  }

  // Une barre de défilement tirée, une inertie qui finit sa course : la
  // découpe suit la fenêtre, sans transition.
  function onScroll() {
    cancelAnimationFrame(geometryRaf);
    geometryRaf = requestAnimationFrame(() => {
      if (!mode || !measure()) return;
      writeGeometry();
      render(cardProgress());
    });
  }

  function onResize() {
    cancelAnimationFrame(geometryRaf);
    geometryRaf = requestAnimationFrame(() => {
      if (!mode) return;
      if (mode === "menu" && !opened) {
        finishSession();
        return;
      }
      readConfig();
      if (!measure()) return;
      writeGeometry();
      if (mode === "menu") moveCard(true, { instant: true });
      render(cardProgress());
    });
  }

  // La carte a fini son mouvement.
  // Chaque fin est rapportée au mouvement qui l'a produite (`lastTarget`) :
  // la fin tardive d'un RECUL arrivée pendant le retour ne doit pas rendre la
  // page d'un coup (c'était le recul qui « sautait » au lieu de glisser).
  function onTransitionEnd(event) {
    if (event.target !== stage || event.propertyName !== "transform") return;
    if (mode === "menu") {
      if (lastTarget && opened) {
        stopTrack();
        render(1);
      } else if (!lastTarget && !opened) {
        finishSession();
      }
    } else if (mode === "frame") {
      if (lastTarget && pagePhase === "out") {
        stopTrack();
        render(1);
        onOutCardDone?.();
      } else if (!lastTarget && pagePhase === "in") {
        finishSession();
      }
    }
  }

  function addListeners() {
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    stage?.addEventListener("transitionend", onTransitionEnd);
  }

  function removeListeners() {
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    for (const el of document.querySelectorAll(".page-stage")) {
      el.removeEventListener("transitionend", onTransitionEnd);
    }
    stage?.removeEventListener("transitionend", onTransitionEnd);
  }

  /* ── Une séance : la page prise en main, puis rendue ── */

  function beginSession(nextMode) {
    if (!rootEl) return false;
    // Arrête une inertie en cours : la carte est prise à CETTE position.
    window.scrollTo(window.scrollX, window.scrollY);
    mode = nextMode;
    if (!measure()) {
      mode = null;
      return false;
    }
    readConfig();
    writeGeometry();
    // La carte devient un calque AVANT de bouger, à plat : rien ne change à
    // l'écran, et le navigateur a le temps de le peindre — sinon la première
    // image du mouvement le peint en catastrophe (accroc, bas d'écran vide).
    moveCard(false, { instant: true });
    render(0);
    // Pas d'`inert` ni de `pointer-events` sur la page : les basculer
    // recalcule le style de TOUTE la page au premier instant du geste.
    addListeners();
    if (nextMode === "menu") visible = true;
    else backdrop = true;
    return true;
  }

  // Rend la page telle qu'elle était, quoi qu'il arrive : appelée à la fin de
  // la séance, et au démontage même si rien n'était en cours.
  function releasePage() {
    unlockScroll();
    clearTimeout(finishTimer);
    stopReveal();
    cancelAnimationFrame(startRaf);
    startRaf = 0;
    stopTrack();
    cancelAnimationFrame(geometryRaf);
    removeListeners();
    for (const t of pageTimers) clearTimeout(t);
    pageTimers = [];

    for (const el of new Set([stage, ...document.querySelectorAll(".page-stage")])) {
      if (!el) continue;
      el.style.transition = "";
      el.style.transform = "";
      el.style.transformOrigin = "";
      el.style.clipPath = "";
      el.style.pointerEvents = "";
      el.inert = false;
    }
    for (const el of [...pinned]) unpin(el);
    if (fadeEl) fadeEl.style.clipPath = "";
    if (veilEl) veilEl.style.clipPath = "";
  }

  function finishSession() {
    releasePage();
    stage = null;
    geo = null;
    mode = null;
    pagePhase = null;
    outPromise = null;
    onOutCardDone = null;
    lastTarget = false;
    veiled = false;
    backdrop = false;
    revealed = false;
    visible = false;

    // La page suivante s'est montée SOUS la carte transformée : ce qu'elle a
    // mesuré au montage (getBoundingClientRect) était réduit et décalé. Un
    // `resize` fait tout remesurer, maintenant qu'elle est à plat.
    if (navigatedUnder) {
      navigatedUnder = false;
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    }
  }

  /* ── Le menu ── */

  // ── L'arrivée des noms ──────────────────────────────────────────────────
  //  Rejouée en JS, image par image, à partir du temps écoulé : une animation
  //  CSS de `filter` sur ces mots — posés dans un calque glissé SOUS la page,
  //  elle-même transformée pendant le geste — pouvait rester figée dans Safari
  //  sur une image floue, ou ne montrer le texte qu'à la fin. Ici chaque image
  //  recalcule l'état de chaque mot ; une image en retard est rattrapée par la
  //  suivante, et un mot arrivé rend la main au CSS (net, à la couleur du
  //  lien). Rien ne peut rester entre deux états.
  const cubic = (p1x, p1y, p2x, p2y) => {
    const bx = (t) => 3 * p1x * t * (1 - t) ** 2 + 3 * p2x * t * t * (1 - t) + t ** 3;
    const by = (t) => 3 * p1y * t * (1 - t) ** 2 + 3 * p2y * t * t * (1 - t) + t ** 3;
    return (x) => {
      let lo = 0;
      let hi = 1;
      for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2;
        if (bx(mid) < x) lo = mid;
        else hi = mid;
      }
      return by((lo + hi) / 2);
    };
  };
  // La courbe de `revealWordIn`.
  const wordEase = cubic(0.22, 0.61, 0.36, 1);

  const parseRgb = (value) => (value.match(/[\d.]+/g) || [255, 255, 255]).slice(0, 3).map(Number);
  const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));

  function clearWord(el) {
    el.style.opacity = "";
    el.style.filter = "";
    el.style.transform = "";
    el.style.color = "";
  }

  function stopReveal() {
    cancelAnimationFrame(revealRaf);
    revealRaf = 0;
    for (const el of rootEl?.querySelectorAll(".menu-word") ?? []) clearWord(el);
  }

  function startReveal() {
    stopReveal();
    const words = [...(rootEl?.querySelectorAll(".menu-word") ?? [])];
    if (!words.length || reducedMotion()) {
      revealed = true;
      return;
    }
    // La couleur d'arrivée de chaque mot : celle de son lien (gris, ou blanc
    // pour la rubrique courante), lue avant d'écrire quoi que ce soit.
    const finals = words.map((el) => parseRgb(getComputedStyle(el.parentElement).color));
    const draw = (el, i, t) => {
      const e = wordEase(t);
      const ink =
        t < WORD_INK_MID_AT
          ? mix(WORD_INK_FROM, WORD_INK_MID, wordEase(t / WORD_INK_MID_AT))
          : mix(WORD_INK_MID, finals[i], wordEase((t - WORD_INK_MID_AT) / (1 - WORD_INK_MID_AT)));
      el.style.opacity = e.toFixed(3);
      el.style.filter = `blur(${(WORD_BLUR * (1 - e)).toFixed(2)}px)`;
      el.style.transform = `translateY(${(WORD_RISE * (1 - e)).toFixed(3)}em)`;
      el.style.color = `rgb(${ink.join(", ")})`;
    };
    // État de départ posé AVANT que la classe ne les rende visibles : aucune
    // image de texte net avant l'arrivée.
    words.forEach((el, i) => draw(el, i, 0));
    revealed = true;

    const start = performance.now() + cfg.duration * WORD_START * 1000;
    const step = (now) => {
      let pending = false;
      words.forEach((el, i) => {
        const t = (now - start - i * WORD_STAGGER_MS) / WORD_MS;
        if (t >= 1) {
          if (el.style.filter) clearWord(el);
          return;
        }
        pending = true;
        draw(el, i, Math.max(0, t));
      });
      revealRaf = pending ? requestAnimationFrame(step) : 0;
    };
    revealRaf = requestAnimationFrame(step);
  }

  function show() {
    if (opened) return;
    // Une transition de page est en cours : le menu attendra.
    if (mode === "frame") {
      queueMicrotask(() => (open = false));
      return;
    }
    const fresh = !visible;
    if (fresh && !beginSession("menu")) return;
    clearTimeout(finishTimer);
    cancelAnimationFrame(startRaf);
    opened = true;
    lockScroll();

    if (fresh) {
      // Deux images d'attente : le calque est prêt quand la carte part.
      startRaf = requestAnimationFrame(() => {
        startRaf = requestAnimationFrame(() => {
          startRaf = 0;
          if (!opened) return;
          moveCard(true);
          track();
          startReveal();
        });
      });
      return;
    }

    // Rouvert pendant qu'il se refermait : la carte repart d'où elle est.
    const p = cardProgress();
    moveCard(true, { duration: Math.max(0.3, (1 - p) * cfg.duration), ease: EASE_TURN });
    track();
    if (!revealed) startReveal();
  }

  function hide() {
    if (!opened) return;
    opened = false;
    // Le défilement revient dès que la carte remonte, pas à la fin du geste.
    unlockScroll();
    clearTimeout(finishTimer);

    // Refermé avant même d'avoir bougé : rien à animer.
    if (startRaf) {
      finishSession();
      return;
    }

    const p = cardProgress();
    const full = p > 0.98;
    const duration = full ? cfg.duration : Math.max(0.28, p * cfg.duration);
    moveCard(false, { duration, ease: full ? EASE_CARD : EASE_TURN });
    track();
    // Filet si `transitionend` ne vient pas (onglet en arrière-plan…).
    finishTimer = setTimeout(finishSession, duration * 1000 + 200);
  }

  $effect(() => {
    const wanted = open;
    untrack(() => (wanted ? show() : hide()));
  });

  /* ── La transition de page (geste « cadre ») ── */

  function later(fn, ms) {
    pageTimers.push(setTimeout(fn, ms));
  }

  // Recul sur place, puis voile. Chaque étape part de l'état RÉEL de la carte,
  // pas d'une minuterie à part : si le navigateur est occupé au moment du clic
  // (la page suivante se charge), le départ de la carte peut prendre du
  // retard, et un voile parti à l'heure couvrait alors tout l'écran, marges
  // comprises. La promesse ne tombe que quand la carte a FINI de reculer et
  // que le voile est posé : la page ne change jamais hors de l'aperçu.
  function startPageOut() {
    const reprise = mode === "frame";
    if (!reprise && !beginSession("frame")) return null;
    pagePhase = "out";
    navigatedUnder = true;
    for (const t of pageTimers) clearTimeout(t);
    pageTimers = [];

    let resolveOut;
    const ready = new Promise((resolve) => (resolveOut = resolve));
    let cardDone = false;
    let veilDone = false;
    const settle = () => {
      if (cardDone && veilDone && pagePhase === "out") resolveOut();
    };
    const cardFinished = () => {
      if (cardDone) return;
      cardDone = true;
      settle();
    };
    onOutCardDone = cardFinished;

    const go = () => {
      startRaf = 0;
      const p = cardProgress();
      const outMs = frame.out * 1000 * (1 - p);
      if (outMs < 20) {
        render(1);
        cardFinished();
      } else {
        moveCard(true, { duration: outMs / 1000, ease: reprise ? EASE_TURN : EASE_CARD });
        track();
        // Filet si `transitionend` ne vient pas (onglet en arrière-plan…).
        later(cardFinished, outMs + 200);
      }
      // Le voile part une fois la carte bien engagée, DANS l'aperçu.
      later(() => {
        render(cardProgress());
        veiled = true;
        later(() => {
          veilDone = true;
          settle();
        }, FADE_IN_MS + 20);
      }, outMs * 0.55);
    };
    if (reprise) go();
    else startRaf = requestAnimationFrame(() => (startRaf = requestAnimationFrame(go)));

    // Filet : une navigation annulée ne laisse pas la page reculée et voilée.
    later(() => {
      if (pagePhase === "out") {
        clearSilentNavigation();
        runPageIn();
      }
    }, 8000);
    return ready;
  }

  // La nouvelle page est en place sous le voile : il se lève, puis la carte
  // revient plein écran sur la courbe du menu.
  function runPageIn() {
    if (mode !== "frame") return;
    for (const t of pageTimers) clearTimeout(t);
    pageTimers = [];
    cancelAnimationFrame(startRaf);
    startRaf = 0;
    onOutCardDone = null;
    pagePhase = "in";
    if (measure()) writeGeometry();
    render(cardProgress());
    veiled = false;
    later(() => {
      const p = cardProgress();
      const backMs = frame.back * 1000 * Math.max(0.35, p);
      moveCard(false, { duration: backMs / 1000, ease: EASE_CARD });
      track();
      // Filet seulement : c'est la fin RÉELLE du retour qui rend la page.
      finishTimer = setTimeout(finishSession, backMs + 400);
    }, FADE_OUT_MS * 0.5);
  }

  const samePath = (a, b) => (a.pathname.replace(/\/+$/, "") || "/") === (b.pathname.replace(/\/+$/, "") || "/");

  beforeNavigate((nav) => {
    if (!nav.to || nav.willUnload || nav.to.url.origin !== window.location.origin) return;
    if (nav.from && samePath(nav.from.url, nav.to.url)) return;
    // Liens du menu, pied de page « projet suivant » : leur geste à eux.
    if (isSilentNavigationPending()) return;

    // Menu ouvert et changement de page venu d'ailleurs (le logo) : la carte
    // se voile, la page change dessous, puis le menu se referme.
    if (mode === "menu") {
      if (opened && !navigating) {
        markNextNavigationSilent();
        navigatedUnder = true;
        veiled = true;
        outPromise = wait(FADE_IN_MS);
      }
      return;
    }

    if (reducedMotion() || !rootEl) return;
    const out = startPageOut();
    if (!out) return;
    // Le layout ne joue pas son propre fondu par-dessus.
    markNextNavigationSilent();
    outPromise = out;
  });

  // SvelteKit attend la fin du recul et du voile avant de changer la page.
  onNavigate(() => {
    if (outPromise) return outPromise;
  });

  afterNavigate(() => {
    outPromise = null;
    if (mode === "frame") {
      runPageIn();
      return;
    }
    if (mode !== "menu" || !visible) return;
    // Le document vient de revenir en haut : la découpe le suit, dans la même
    // image.
    if (measure()) {
      writeGeometry();
      render(cardProgress());
      stage.addEventListener("transitionend", onTransitionEnd);
    }
    // Changement de page venu d'ailleurs que du menu (le logo) : le voile se
    // lève et la carte remonte sur la nouvelle page.
    if (opened && !navigating) {
      veiled = false;
      setTimeout(() => (open = false), 120);
      return;
    }
    // `navigate()` vient de lever les verrous : menu encore ouvert, on remet
    // le nôtre jusqu'à ce que la carte remonte.
    if (opened) {
      scrollLocked = false;
      lockScroll();
    }
  });

  async function go(event, item) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (navigating || !opened) return;

    if (item.path === pathname) {
      open = false;
      return;
    }

    // La carte se voile, la page change dessous, le voile se lève sur la
    // nouvelle page et le menu se referme.
    navigating = true;
    veiled = true;
    await wait(reducedMotion() ? 0 : FADE_IN_MS);

    navigatedUnder = true;
    try {
      await navigate(item.path === "/" ? "home" : item.path.slice(1), { silent: true });
    } catch {
      // navigate() journalise ses propres erreurs.
    }

    navigating = false;
    veiled = false;
    await wait(reducedMotion() ? 0 : 120);
    open = false;
  }

  function handleGlowMove(event) {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  onMount(() => {
    return () => {
      opened = false;
      finishSession();
    };
  });
</script>

<div
  class="fs-menu"
  class:is-visible={visible}
  class:is-open={opened}
  class:is-backdrop={backdrop && !visible}
  class:is-revealed={revealed}
  bind:this={rootEl}
  aria-hidden={!visible}
>
  <!-- Sonde : la marge du cadre est une longueur CSS (`clamp`), mesurée ici. -->
  <span class="frame-probe" bind:this={probeEl} aria-hidden="true"></span>

  <nav class="menu-content" aria-label="Navigation principale">
    <ul class="menu-list">
      {#each pages as item (item.path)}
        <li>
          <a
            class="menu-link"
            class:is-section={sectionIndex === item.index}
            href={item.path}
            aria-current={pathname === item.path ? "page" : undefined}
            data-sveltekit-preload-data="hover"
            onclick={(event) => go(event, item)}
          >
            {#each item.words as word, w (word.i)}{#if w > 0}{" "}{/if}<span class="menu-word" style:--i={word.i}>{word.text}</span>{/each}
          </a>
        </li>
      {/each}
    </ul>
  </nav>

  <div class="menu-socials">
    {#each socialLinks as social (social.href)}
      <a
        class="social-link"
        href={social.href}
        target={social.href.startsWith("http") ? "_blank" : undefined}
        rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
        aria-label={social.label}
        data-cursor="button"
        onmousemove={handleGlowMove}
      >
        <img src={social.icon} alt="" class="icon {social.className}" draggable="false" />
      </a>
    {/each}
  </div>
</div>

<!-- Les deux voiles de la carte. Frères du menu, pas enfants : ils doivent
     passer AU-DESSUS de la page, que le menu a sous lui. Ni l'un ni l'autre
     n'est transformé : leur découpe reprend, en coordonnées d'écran, la forme
     exacte de la carte. Le voile prend les clics sur la carte menu ouvert (et
     referme) ; l'autre la couvre pendant un changement de page. -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
  class="menu-card-veil"
  class:is-catching={visible && opened}
  bind:this={veilEl}
  aria-hidden="true"
  onclick={() => (open = false)}
></div>

<div class="page-fade" class:is-on={veiled} bind:this={fadeEl} aria-hidden="true"></div>

<style>
  /* ── Réglages ─────────────────────────────────────────────────────────────
     Le recul, la réduction, l'arrondi et la durée sont lus ICI par le script :
     les ajuster par écran se fait dans les media queries, pas dans le JS. */
  .fs-menu {
    --menu-recede: 0.5;   /* la carte descend de la moitié de l'écran */
    --menu-scale: 0.95;
    --menu-radius: 22;    /* px, l'arrondi des médias du site */
    --menu-duration: 1;   /* s, entraîne tous les temps */
    --menu-vh: 100svh;    /* posé en px par le script à l'ouverture */
    --menu-band: calc(var(--menu-vh) * var(--menu-recede));
    /* Bord haut de la carte, une fois réduite autour du centre de l'écran. */
    --menu-card-top: calc(var(--menu-vh) * (var(--menu-recede) + (1 - var(--menu-scale)) / 2));
    /* Les marges latérales s'alignent sur les bords de la carte. */
    --menu-gutter: max(var(--site-inset, 1.25rem), calc((1 - var(--menu-scale)) * 50vw));
    /* Le gris des noms au repos — celui du menu précédent, refroidi avec la
       palette bleu nuit. */
    --menu-muted: rgb(151, 156, 163);
    /* Le verre des boutons du site (blanc à 11 % sur un fond passé en
       `saturate(160%) brightness(0.82)`), calculé une fois pour le fond uni du
       menu : sur un aplat, le flou ne change rien, et un vrai `backdrop-filter`
       sous la carte qui glisse par-dessus laisse un rectangle clair sur WebKit
       (voir la note sur les boutons en verre). Même rendu que le bouton du
       header posé sur ce fond. */
    --menu-glass: rgb(43, 48, 55);
    --menu-glass-hover: rgb(60, 64, 71);
    /* La transition de page : le cadre du hero de la home (marge et arrondi,
       voir `Hero.svelte`), le temps du recul et celui du retour (s). */
    --frame-inset: var(--site-inset, 1.25rem);
    --frame-radius: 22;
    --frame-out: 0.62;
    --frame-back: 0.78;

    /* SOUS la page : `main` est un contexte d'empilement (isolation), le menu
       s'y peint au-dessus de son fond et sous tout le reste. */
    position: fixed;
    inset: 0;
    z-index: -1;
    /* Un aplat, un cran au-dessus du noir des pages : la carte s'en détache. */
    background: var(--bg-panel, #171b21);
    color: #fff;
    visibility: hidden;
    pointer-events: none;
  }

  .fs-menu.is-visible {
    visibility: visible;
    pointer-events: auto;
  }

  /* Transition de page : seul le fond du menu se montre autour de la carte. */
  .fs-menu.is-backdrop {
    visibility: visible;
  }

  .fs-menu.is-backdrop .menu-content,
  .fs-menu.is-backdrop .menu-socials {
    visibility: hidden;
  }

  .frame-probe {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--frame-inset);
    height: 0;
    visibility: hidden;
    pointer-events: none;
  }

  /* ── Les noms de pages, centrés dans la bande découverte ── */

  .menu-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 3;
    height: var(--menu-band);
    display: flex;
    align-items: center;
    justify-content: center;
    /* Sous le bouton du header (1rem + 40 px). */
    padding: calc(1rem + 40px + clamp(0.75rem, 2vh, 1.5rem)) var(--menu-gutter) clamp(1rem, 3vh, 2rem);
    pointer-events: none;
  }

  .menu-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0;
    padding: 0;
    list-style: none;
    text-align: center;
    pointer-events: auto;
  }

  .menu-link {
    /* Couleur d'arrivée de l'effet mot à mot (voir `revealWordIn`). */
    --reveal-final: var(--menu-muted);
    display: inline-block;
    color: var(--menu-muted);
    text-decoration: none;
    font-family: var(--site-font);
    font-weight: var(--site-weight-display, 500);
    /* Les cinq noms tiennent dans la bande, même sur un écran bas. */
    font-size: min(clamp(2rem, 3vw, 3.4rem), calc((var(--menu-band) - 6.5rem) / 5.8));
    line-height: 1.12;
    letter-spacing: -0.025em;
    transition: color 0.5s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .menu-link.is-section,
  .menu-link:hover,
  .menu-link:focus-visible {
    --reveal-final: #fff;
    color: #fff;
  }

  /* Survoler un autre nom éteint celui de la rubrique : un seul nom blanc. */
  .menu-list:has(.menu-link:hover) .menu-link.is-section:not(:hover) {
    --reveal-final: var(--menu-muted);
    color: var(--menu-muted);
  }

  .menu-link:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 6px;
    border-radius: 4px;
  }

  /* L'arrivée des noms est menée par le script (voir `startReveal`) : le CSS
     ne porte que l'état caché et l'état arrivé, net. */
  .menu-word {
    display: inline-block;
    opacity: 0;
  }

  .fs-menu.is-revealed .menu-word {
    opacity: 1;
  }

  /* ── Les boutons réseaux du menu précédent, coin bas droit ── */

  .menu-socials {
    --social-size: clamp(3.2rem, 4vw, 4.1rem);
    --social-gap: clamp(0.75rem, 2.2vh, 1.4rem);
    position: absolute;
    z-index: 4;
    right: var(--menu-gutter);
    /* Juste au-dessus du coin haut droit de la carte. */
    top: calc(var(--menu-card-top) - var(--social-size) - var(--social-gap));
    display: flex;
    align-items: center;
    gap: clamp(0.8rem, 1.2vw, 1.1rem);
  }

  .social-link {
    position: relative;
    width: var(--social-size);
    height: var(--social-size);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--menu-glass);
    border-radius: 10px;
    transition:
      transform 0.35s cubic-bezier(.22, .61, .36, 1),
      background 0.35s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .social-link:hover {
    background: var(--menu-glass-hover);
  }

  .social-link:focus-visible {
    outline: 2px solid rgba(var(--ink-muted-rgb, 245, 241, 232), 0.9);
    outline-offset: 3px;
  }

  /* Le halo de contour qui suit la souris (`--mx`/`--my`). */
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

  @media (hover: hover) and (pointer: fine) {
    .social-link:hover::before,
    .social-link:hover::after {
      opacity: 1;
    }
  }

  .icon {
    display: block;
    object-fit: contain;
    filter: brightness(0) invert(1);
    user-select: none;
  }

  .icon-instagram {
    width: clamp(1.4rem, 1.8vw, 1.7rem);
    height: clamp(1.4rem, 1.8vw, 1.7rem);
  }

  .icon-mail {
    width: clamp(1.32rem, 1.72vw, 1.62rem);
    height: clamp(1.32rem, 1.72vw, 1.62rem);
  }

  /* ── Les voiles de la carte ── */

  .menu-card-veil {
    position: fixed;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .menu-card-veil.is-catching {
    pointer-events: auto;
  }

  /* Le voile du changement de page : le noir de la page, en fondu (les durées
     sont celles du script, FADE_IN_MS / FADE_OUT_MS). */
  .page-fade {
    position: fixed;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    visibility: hidden;
    opacity: 0;
    background: var(--bg-deep, #050709);
    transition:
      opacity 0.45s ease,
      visibility 0s linear 0.45s;
  }

  .page-fade.is-on {
    visibility: visible;
    opacity: 1;
    transition:
      opacity 0.2s ease,
      visibility 0s;
  }

  /* Le verre des boutons mobiles du site (`saturate(130%)`, sans
     assombrissement), même seuil que le header. */
  /* Le cadre du hero sur petit écran : 1rem de marge, 18 px d'arrondi. */
  @media (max-width: 900px) {
    .fs-menu {
      --frame-inset: 1rem;
      --frame-radius: 18;
    }

  }

  @media (max-width: 768px) {
    .fs-menu {
      --menu-glass: rgb(47, 52, 59);
      --menu-glass-hover: rgb(64, 68, 75);
    }
  }

  /* ── Tablette et mobile : la carte descend plus bas ── */

  @media (max-width: 999px) {
    .fs-menu {
      --menu-recede: 0.65;
      --menu-scale: 0.85;
      --menu-radius: 18;
      --menu-duration: 0.85;
    }

    .menu-content {
      padding-top: calc(0.85rem + 40px + 1rem);
      padding-bottom: 1.25rem;
    }

    .menu-link {
      font-size: min(clamp(2.1rem, 9.5vw, 2.9rem), calc((var(--menu-band) - 6rem) / 5.6));
      line-height: 1.1;
    }
  }

  /* ── Téléphone couché : écran bas, les noms sur une ligne ── */

  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .fs-menu {
      --menu-recede: 0.6;
      --menu-scale: 0.9;
    }

    .menu-content {
      padding-top: calc(0.85rem + 40px + 0.25rem);
      padding-bottom: 0.5rem;
    }

    .menu-list {
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
      column-gap: clamp(1rem, 3vw, 2rem);
    }

    .menu-link {
      font-size: min(clamp(1.3rem, 3.2vw, 1.9rem), calc(var(--menu-band) * 0.14));
    }

    .menu-socials {
      --social-size: 2.9rem;
      --social-gap: 0.6rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .fs-menu {
      --menu-duration: 0.001;
    }

  }
</style>
