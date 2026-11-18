<script>
  // ───────────────────────────────────────────────────────────────────────────
  //  ProjectNextFooter — le pied de page des pages projet : le projet SUIVANT,
  //  atteint au défilement.
  //
  //  Repris de « Projet suivant au défilement » de la librairie. Arrivé au bas
  //  d'un projet, ce qu'on veut n'est pas revenir à la liste mais voir le
  //  suivant : le pied de page devient une transition plutôt qu'une fin.
  //
  //  ── LE PIED DE PAGE EST DÉJÀ LE HERO SUIVANT ──────────────────────────────
  //  Le panneau peint EXACTEMENT ce que le hero du projet suivant affichera :
  //  la même image (ou le poster de sa vidéo, qui en est le photogramme 0), au
  //  même cadrage, son nom et sa flèche au même endroit, et — sur téléphone —
  //  le même fondu au noir en bas d'écran. Les règles de position et de taille
  //  sont donc RECOPIÉES de `ProjectHeroProjetsStyle` : les toucher ici sans les
  //  toucher là-bas ferait sauter l'image ou le titre au changement de page.
  //
  //  ── La course : une CARTE qui s'ouvre (refait le 2026-11-18) ──────────────
  //  Une enveloppe haute de plusieurs écrans, un panneau `sticky` d'un écran
  //  dedans. Le projet suivant y arrive en CARTE — les marges et l'arrondi du
  //  cadre des hero du site — qui monte avec la page puis s'ouvre, au fil du
  //  défilement, jusqu'au plein écran : exactement le hero d'arrivée, cadre
  //  ouvert. L'image se pose de 1,12 à 1 pendant l'ouverture, le titre suit le
  //  coin bas gauche de la carte jusqu'à sa place dans le hero, et une ligne
  //  au-dessus de la carte (« Projet suivant », la catégorie, un compteur de 0
  //  à 100) est poussée hors champ par son bord haut.
  //  Repris d'Estrela (estrela.studio), passé dans l'identité du site : avant,
  //  c'était une image plein écran sous un voile sombre qui s'éclaircissait,
  //  avec une fine jauge de chargement — le client trouvait ça « classique ».
  //  La carte, le compteur et le titre sont écrits image par image en
  //  `transform` (compositeur) ; seule la découpe de la carte (`clip-path`)
  //  est repeinte, et c'est un rectangle arrondi.
  //  La course est volontairement PLUS COURTE que l'enveloppe : la progression
  //  atteint 1 avant le bas absolu de la page, sinon un navigateur qui amortit
  //  la fin de course resterait bloqué à 0,99. Un clic sur la carte déroule la
  //  course jusqu'au bout (défilement doux) : le départ est alors le même.
  //
  //  ── LE DÉPART (refait le 2026-10-02, pour l'iPhone) ────────────────────────
  //  Sur un vrai téléphone, c'est Safari qui tient le défilement, pas la page :
  //  un doigt encore posé reprend la main sur un `scrollTo` programmé, l'inertie
  //  continue après le geste, et la barre d'outils se replie ou se déplie en
  //  changeant la hauteur visible. Changer de page au milieu de tout ça laissait
  //  voir la page d'arrivée reprise en mouvement, ou à la mauvaise hauteur.
  //  D'où deux temps :
  //    1. ATTENDRE LE REPOS. La page ne part que quand aucun doigt n'est posé,
  //       que la position BRUTE du défilement et la hauteur visible sont
  //       immobiles depuis un instant, et que l'image est peinte. Un lecteur
  //       qui remonte avant annule le départ : tout revient en place.
  //    2. COUVRIR LE CHANGEMENT. Au départ, le panneau passe de `sticky` à
  //       `fixed` — même place à l'écran, rien ne bouge — et c'est SOUS lui que
  //       la page change, revient en haut et laisse Safari ajuster sa barre. On
  //       vérifie que la page d'arrivée est bien en haut et que son image est
  //       prête, puis le panneau s'efface en un fondu bref sur le hero, qui est
  //       le même à l'écran.
  //
  //  ── ET RIEN NE DOIT FAIRE ATTENDRE (2026-10-02, troisième passe) ───────────
  //  Chronométrée, la page d'arrivée se monte en une centaine de millisecondes
  //  même sur un processeur bridé six fois. Le « blocage » ressenti au doigt
  //  venait des attentes enchaînées par-dessus, pendant lesquelles le panneau
  //  couvrait l'écran et refusait les gestes — plus d'une seconde en tout :
  //  la position lissée qui rattrapait le doigt, la sortie du libellé attendue
  //  AVANT de partir, puis un fondu final de près d'une demi-seconde. Donc :
  //    • au doigt, la course suit la position RÉELLE (le lissage ne sert qu'à
  //      la molette, qui avance par crans) ;
  //    • la sortie du libellé et de la jauge se joue PENDANT le départ, sous la
  //      couverture, au lieu d'être attendue ;
  //    • le fondu final est bref, laisse passer les gestes vers la page, et le
  //      premier geste du lecteur le termine sur-le-champ — le panneau et le
  //      hero étant identiques, l'arrêt net ne se voit pas.
  // ───────────────────────────────────────────────────────────────────────────
  import { onDestroy, onMount, tick } from "svelte";
  import { browser } from "$app/environment";
  import {
    registerParallax,
    unregisterParallax,
    registerWrite,
    unregisterWrite,
    forceScrollEngineUpdate,
    snapScrollEngine
  } from "$lib/scrollEngine.js";
  import { navigate } from "$lib/navigate.js";
  import { fitTitle } from "$lib/actions/fitTitle.js";
  import { markProjectHandoff } from "$lib/projectHandoff.js";
  import { arreterGlissade, defilerVers } from "$lib/defilementLisse.js";

  /** Le projet annoncé — une entrée de `$lib/data/projets.js`. */
  export let project = null;
  /** Le libellé d'état, posé à côté de la jauge — jamais en surtitre. */
  export let libelle = "Projet suivant";

  /** Part de l'enveloppe sur laquelle la progression se joue (le reste est du mou). */
  const COURSE = 0.78;
  /** Au-delà, on part. Jamais 1 : la fin de course est amortie sur certains
   *  navigateurs. C'est AUSSI le point où la carte est pleine et le compteur à
   *  100 (2026-11-18) : avant, la carte paraissait pleine vers 0,9 et la page
   *  ne partait qu'à 0,985 — le client devait « encore faire un scroll de
   *  plus » alors que rien ne bougeait plus à l'écran. */
  const SEUIL = 0.96;
  /** En deçà, un départ engagé est annulé : le lecteur est remonté. */
  const SEUIL_RETOUR = 0.86;
  /** Courbe de l'ouverture (exposant du reste) : < 2 pour que la carte bouge
   *  visiblement jusqu'au seuil au lieu de se figer sur le dernier dixième. */
  const COURBE = 1.5;
  /** Immobilité exigée avant de partir : position du défilement et hauteur
   *  visible. Une inertie iOS déplace la page à CHAQUE image jusqu'à son arrêt :
   *  sept images sans le moindre mouvement, c'est un arrêt. */
  const REPOS_MS = 120;
  /** Au-delà, on part même si l'image n'a pas fini de charger (réseau lent). */
  const ATTENTE_IMAGE_MAX = 1200;
  /** Le fondu final du panneau sur le hero d'arrivée — bref : les deux sont
   *  identiques, il ne fait qu'adoucir un écart d'un pixel s'il en reste un. */
  const REVELATION_MS = 220;
  /** Part d'écran sur laquelle la carte commence à s'ouvrir AVANT de se
   *  coller en haut : elle monte et s'élargit dans le même geste. */
  const ENTREE = 0.45;
  /** Zoom de l'image dans la carte fermée ; 1 une fois ouverte (le hero). */
  const ZOOM = 0.12;
  /** Au doigt, la carte AFFICHÉE rattrape la progression en douceur (constante
   *  de temps, ms) au lieu de la suivre image par image. Repris d'Avatr
   *  (vision.avatr.com, `onScroll({ sync: .8 })` d'anime.js) : Safari iOS
   *  livre la position du défilement par à-coups irréguliers, et une valeur
   *  qui la suit à la lettre les montre tous. Le départ, lui, reste décidé sur
   *  la position RÉELLE (voir `handleRead`) : le lissage n'ajoute aucune
   *  attente. Sur grand écran, la position est déjà lissée par le moteur. */
  const LISSAGE_DOIGT_MS = 70;

  let wrapEl;
  let panelEl;
  let cardEl;
  let cueEl;
  let barreEl;
  let itemGEl;
  let itemDEl;
  let chiffreEl;
  let imgEl;
  /** La carte fermée : marges haut / côtés / bas et arrondi, en px. */
  let geo = { t: 0, s: 0, b: 0, r: 22 };
  let entreePx = 0;
  let chiffreAffiche = -1;
  let barreCachee = false;
  /** La progression telle que la carte l'AFFICHE (voir `LISSAGE_DOIGT_MS`). */
  let pVue = 0;
  let dernierPas = 0;
  let rafVue = 0;
  let progress = 0;
  let leaving = false;
  /** La navigation est lancée : plus d'annulation possible. */
  let depart = false;
  /** Le panneau est figé à l'écran (`fixed`) pendant que la page change dessous. */
  let couverture = false;
  /** …puis s'efface en fondu sur le hero d'arrivée. */
  let revelation = false;
  /** Quelques centaines de millisecondes après une annulation : la jauge
   *  revient en glissant au lieu de sauter. */
  let retour = false;
  let sortieTimer;
  let retourTimer;
  let debutSortie = 0;
  let reduced = false;
  let tactile = false;
  let toucheActive = false;
  /** L'image du hero suivant est chargée : elle peut se montrer (en fondu). */
  let chargee = false;

  /*  ── Le composant SURVIT au changement de page ─────────────────────────────
   *  Il vit dans le layout, à la même place d'une page projet à l'autre : Svelte
   *  ne le démonte pas, il change seulement sa prop `project`. Tout l'état de
   *  la course est donc remis à zéro ici — mais PAS pendant la couverture :
   *  le panneau montre alors encore le projet dans lequel on entre, et doit le
   *  montrer jusqu'au bout du fondu. `affiche` est ce projet-là.
   *
   *  `arme` est le garde-fou de l'autre bord : le pied de page ne s'arme
   *  qu'une fois qu'une lecture l'a vu franchement en deçà du seuil. */
  let affiche = null;
  let slugCourant = null;
  let arme = false;
  /*  Le titre sort du flou UNE SEULE FOIS, par une classe et une transition
   *  CSS — pas image par image. Recalculer un `filter: blur()` sur un titre de
   *  130 px à chaque image de défilement rastérise la couche à chaque fois. */
  let ouvert = false;

  $: if (!couverture && project?.slug !== slugCourant) {
    slugCourant = project?.slug ?? null;
    affiche = project;
    clearTimeout(sortieTimer);
    clearTimeout(retourTimer);
    leaving = false;
    depart = false;
    retour = false;
    arme = false;
    ouvert = false;
    progress = 0;
    pVue = 0;
    pAppliquee = -1;
    chiffreAffiche = -1;
    sale = true;
    chargee = false;
    besoinMesure = true;
    if (browser) {
      forceScrollEngineUpdate();
      tick().then(verifierImage);
    }
  }

  /** La jauge, pour les lecteurs d'écran : par pas de 5 %, pas à chaque image. */
  $: pourcent = Math.round(progress * 20) * 5;

  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
  const prochaineImage = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));
  const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /*  ── Les mesures ───────────────────────────────────────────────────────────
   *  La course ne dépend que de deux hauteurs fixes — l'enveloppe et le
   *  panneau, en `svh` — et non de `innerHeight`, qui change chaque fois que
   *  la barre de Safari iOS se replie ou se déplie.
   *
   *  La position de l'enveloppe est lue à CHAQUE image, mais seulement quand
   *  elle est à moins d'un écran de la vue (`pres`, tenu par un
   *  IntersectionObserver), et dans la phase de LECTURE du moteur : la mise en
   *  page y est propre, la lecture ne coûte rien et n'est jamais périmée. */
  let pres = false;
  let wrapTop = 0;
  let course = 1;
  let besoinMesure = true;

  function scheduleMeasure() {
    besoinMesure = true;
    forceScrollEngineUpdate();
  }

  function presence(node) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        pres = entry.isIntersecting;
        besoinMesure = true;
        forceScrollEngineUpdate();
      },
      { rootMargin: "100% 0px 100% 0px" }
    );
    observer.observe(node);
    return { destroy: () => observer.disconnect() };
  }

  /*  ── Le repos ──────────────────────────────────────────────────────────────
   *  Mesuré sur la position BRUTE du navigateur, pas sur celle du moteur : le
   *  moteur la borne à la hauteur de la page, si bien qu'un rebond élastique en
   *  bas de page passait pour de l'immobilité. Et sur la hauteur visible : tant
   *  que la barre de Safari bouge, la page n'est pas au repos non plus. */
  let derniereY = -1;
  let derniereVue = -1;
  let dernierMouvement = 0;

  function noterMouvement(now) {
    const y = window.scrollY || window.pageYOffset || 0;
    const vue = window.visualViewport?.height ?? window.innerHeight;
    if (Math.abs(y - derniereY) > 0.1 || Math.abs(vue - derniereVue) > 0.5) {
      derniereY = y;
      derniereVue = vue;
      dernierMouvement = now;
    }
  }

  /*  ── Lecture et écriture SÉPARÉES ────────────────────────────────────────
   *  `handleRead` ne fait que lire et CALCULER ; `handleWrite` applique.
   *  À la molette, la progression suit la position LISSÉE (`motionY`) : la
   *  molette arrive par crans, une valeur calculée sur la position brute
   *  avancerait par sauts. Au DOIGT, elle suit la position réelle : le
   *  défilement tactile est déjà continu, et le lissage ne faisait qu'ajouter
   *  un retard — le voile, l'image et la jauge traînaient derrière le doigt, et
   *  le seuil n'était atteint qu'après l'arrêt. */
  let sale = false;
  let pAppliquee = -1;

  function handleRead(y, ctx) {
    if (!affiche || couverture) return;

    noterMouvement(ctx?.now ?? performance.now());

    if (!pres || !wrapEl || !panelEl) {
      // Loin du bas de page : la progression vaut forcément zéro. Le panneau
      // est hors de vue, son arrivée pourra donc se rejouer.
      if (!leaving) {
        arme = true;
        ouvert = false;
      }
      return;
    }

    if (besoinMesure) {
      besoinMesure = false;
      course = Math.max((wrapEl.offsetHeight - panelEl.offsetHeight) * COURSE, 1);
      mesurerCarte();
    }

    const haut = wrapEl.getBoundingClientRect().top;
    wrapTop = haut + y;

    // La carte s'ouvre dès qu'elle est à moitié montée, et finit d'arriver au
    // bout de la course : p = 1 à `wrapTop + course`, comme avant.
    const p = clamp(((tactile ? y : ctx?.motionY ?? y) - wrapTop + entreePx) / (course + entreePx));
    if (Math.abs(p - progress) > 0.0005) {
      progress = p;
      sale = true;
    }

    // L'arrivée du titre, de la flèche et du libellé se joue quand le panneau
    // s'est posé ; elle se rejouera si le lecteur remonte jusqu'à le perdre.
    if (haut >= (ctx?.vh || window.innerHeight)) {
      if (!leaving) ouvert = false;
    } else if (!ouvert && p > 0.02) {
      ouvert = true;
    }

    if (!arme) {
      if (p < 0.5) arme = true;
      return;
    }

    if (leaving) {
      if (!depart && p < SEUIL_RETOUR) annuler();
      return;
    }

    if (p >= SEUIL) partir();
  }

  /*  Les trois valeurs sont écrites DIRECTEMENT sur les trois éléments
   *  concernés, et non en propriété personnalisée sur le panneau : une
   *  propriété personnalisée ferait recalculer tout le sous-arbre à chaque
   *  image. Rien n'est écrit pendant la couverture : le panneau doit rester
   *  exactement tel qu'il était au départ. */
  /*  La progression affichée avance vers sa cible : au départ la course est
   *  finie (carte ouverte, image posée), sinon la progression lue. */
  function avancerVue(now) {
    const cible = leaving ? 1 : progress;
    if (!tactile || reduced) {
      pVue = cible;
      dernierPas = now;
      return;
    }
    const dt = Math.min(64, Math.max(0, now - (dernierPas || now)));
    dernierPas = now;
    pVue += (cible - pVue) * (1 - Math.exp(-dt / LISSAGE_DOIGT_MS));
    if (Math.abs(cible - pVue) < 0.0004) pVue = cible;
  }

  /*  Quand le moteur de défilement s'arrête (fin d'inertie), la carte finit
   *  de rattraper sa cible sur ses propres images — sans rien lire. */
  function suivreVue() {
    if (rafVue || couverture) return;
    rafVue = requestAnimationFrame((t) => {
      rafVue = 0;
      handleWrite(0, { now: t });
    });
  }

  function handleWrite(_y, ctx) {
    if (couverture) return;
    if (sale) {
      sale = false;
      pAppliquee = -1;
    }
    avancerVue(ctx?.now ?? performance.now());
    if (pVue !== (leaving ? 1 : progress)) suivreVue();

    const p = pVue;
    if (p === pAppliquee) return;
    pAppliquee = p;

    // L'ouverture RALENTIT en arrivant : la carte se pose sur le plein écran
    // du hero sans à-coup final — et elle y est EXACTEMENT au seuil de départ
    // (progression rapportée au seuil), pas avant.
    const u = Math.min(1, p / SEUIL);
    const reste = Math.pow(1 - u, COURBE);
    const t = geo.t * reste;
    const s = geo.s * reste;
    const b = geo.b * reste;
    const r = geo.r * reste;

    if (cardEl) {
      cardEl.style.clipPath = reste < 0.0005
        ? "none"
        : `inset(${t.toFixed(2)}px ${s.toFixed(2)}px ${b.toFixed(2)}px ${s.toFixed(2)}px round ${r.toFixed(2)}px)`;
    }
    if (imgEl) imgEl.style.transform = reduced ? "none" : `scale(${(1 + ZOOM * reste).toFixed(5)})`;
    // Le titre suit le coin bas gauche de la carte : à l'ouverture complète,
    // il est à sa place dans le hero, au pixel près.
    if (cueEl) cueEl.style.transform = `translate3d(${s.toFixed(2)}px, ${(-b).toFixed(2)}px, 0)`;

    // La ligne du haut est portée par le bord haut de la carte, qui la pousse
    // hors champ en s'ouvrant ; elle s'efface sur la seconde moitié. Éteinte,
    // elle passe en `visibility: hidden` : un calque à opacité nulle dans un
    // `sticky` est repeint à chaque mise en page par Safari ≤ 18.1.
    const fondu = clamp((1 - reste - 0.45) / 0.4);
    const opacite = leaving ? 0 : 1 - fondu * fondu * (3 - 2 * fondu);
    if (barreEl) {
      barreEl.style.transform = `translate3d(0, ${(t - 14).toFixed(2)}px, 0)`;
      barreEl.style.opacity = opacite.toFixed(3);
      const cachee = opacite < 0.002;
      if (cachee !== barreCachee) {
        barreEl.style.visibility = cachee ? "hidden" : "";
        barreCachee = cachee;
      }
    }
    if (itemGEl) itemGEl.style.transform = `translate3d(${s.toFixed(2)}px, 0, 0)`;
    if (itemDEl) itemDEl.style.transform = `translate3d(${(-s).toFixed(2)}px, 0, 0)`;

    // Le compteur atteint 100 au départ, pas à la fin théorique de la course.
    const chiffre = leaving ? 100 : Math.min(100, Math.round((p / SEUIL) * 100));
    if (chiffreEl && chiffre !== chiffreAffiche) {
      chiffreEl.textContent = String(chiffre);
      chiffreAffiche = chiffre;
    }
  }

  /*  La carte fermée : les marges et l'arrondi du cadre des hero du site
   *  (`--site-inset`, 22 px ; 18 px sur téléphone), en plus large sur les
   *  côtés et en haut pour qu'elle se lise comme une carte posée sur la page.
   *  Lu sur les mêmes bases que le CSS (`clamp(0.9rem, 2vw, 1.8rem)`). */
  function mesurerCarte() {
    const vw = window.innerWidth || 1;
    const vh = panelEl?.offsetHeight || window.innerHeight || 1;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const marge = clamp(0.02 * vw, 0.9 * rem, 1.8 * rem);
    const telephone = vw <= 640;
    geo = telephone
      ? { t: Math.round(vh * 0.17), s: Math.round(marge), b: Math.round(vh * 0.035), r: 18 }
      : { t: Math.round(vh * 0.16), s: Math.round(Math.max(marge * 3, vw * 0.06)), b: Math.round(Math.max(marge, vh * 0.05)), r: 22 };
    entreePx = Math.round(vh * ENTREE);
    pAppliquee = -1;
    sale = true;
  }

  /** Un clic sur la carte déroule la course jusqu'au bout. */
  function allerAuBout() {
    if (leaving || couverture || !wrapEl) return;
    const cible = Math.ceil(wrapTop + course + 2);
    if (reduced) window.scrollTo(0, cible);
    else defilerVers(cible);
  }

  function partir() {
    if (leaving || !arme || !affiche) return;
    leaving = true;
    // La carte est pleine : la glissade du défilement lissé (Lenis, grand
    // écran) n'a plus rien à montrer, et le départ attendrait sa fin (le
    // repos) près d'une seconde. Elle s'arrête sur place.
    if (!tactile) arreterGlissade();
    sale = true;
    debutSortie = performance.now();
    // Hors de la phase de lecture du moteur : le départ écrit des styles.
    clearTimeout(sortieTimer);
    sortieTimer = setTimeout(planifierDepart, 0);
  }

  function annuler() {
    if (!leaving || depart) return;
    clearTimeout(sortieTimer);
    leaving = false;
    sale = true;
    retour = true;
    clearTimeout(retourTimer);
    retourTimer = setTimeout(() => (retour = false), 360);
  }

  function planifierDepart() {
    clearTimeout(sortieTimer);
    if (!leaving || depart || !affiche) return;

    // La sortie du libellé et de la jauge n'est PAS attendue : elle se finit
    // sous la couverture, puis dans le fondu final.
    const now = performance.now();
    noterMouvement(now);
    const ecoule = now - debutSortie;
    const attente = Math.max(
      REPOS_MS - (now - dernierMouvement),
      toucheActive ? 60 : 0,
      chargee || ecoule > ATTENTE_IMAGE_MAX ? 0 : 60
    );

    if (attente > 0) {
      sortieTimer = setTimeout(planifierDepart, Math.ceil(attente) + 8);
      return;
    }

    partirSousCouverture();
  }

  async function partirSousCouverture() {
    depart = true;
    const cible = affiche.slug;

    // 1. L'état d'arrivée est écrit (carte ouverte, image posée à l'échelle 1,
    //    compteur plein), puis le panneau se fige à l'écran : de `sticky` à
    //    `fixed`, à la même place. L'affichage lissé est d'abord posé sur la
    //    fin : le raccord exige la carte EXACTEMENT ouverte.
    cancelAnimationFrame(rafVue);
    rafVue = 0;
    pVue = 1;
    sale = true;
    handleWrite();
    couverture = true;
    // L'en-tête ne doit pas lire le saut de défilement qui vient comme une
    // remontée du lecteur : il se déplierait (« MENU ») pile au changement.
    tenirEntete(true);
    await tick();

    // 2. La page change dessous. Le relais est levé au DERNIER moment : il se
    //    périme au bout de 2,5 s, et le hero suivant ne doit sauter son
    //    arrivée que si c'est bien nous qui l'amenons à l'écran.
    markProjectHandoff();
    await navigate(`/${cible}`, { silent: true });

    const arrive = (window.location.pathname.replace(/\/+$/, "") || "/") === `/${cible}`;
    if (!arrive) {
      // La navigation n'a pas eu lieu (une autre était déjà en cours) : on
      // rend la main plutôt que de rester figé.
      tenirEntete(false);
      couverture = false;
      depart = false;
      leaving = false;
      sale = true;
      return;
    }

    await decouvrir();
  }

  async function decouvrir() {
    // 3. La page d'arrivée doit être EN HAUT. Sur iPhone, un geste ou une fin
    //    d'inertie peut encore avoir repris la main sur la remise à zéro : on
    //    la refait tant qu'il le faut, invisible sous le panneau.
    //    « En haut » doit TENIR deux images de suite : une fin d'inertie qu'on
    //    n'aurait pas vue peut encore reprendre la main une fois.
    let enHaut = 0;
    for (let essai = 0; essai < 20 && enHaut < 2; essai += 1) {
      if ((window.scrollY || window.pageYOffset || 0) <= 0.5) {
        enHaut += 1;
      } else {
        enHaut = 0;
        window.scrollTo(0, 0);
      }
      await prochaineImage();
    }
    snapScrollEngine();
    // L'en-tête reprend sa lecture à partir d'ici, dans l'état où il était.
    tenirEntete(false);
    await prochaineImage();

    // 4. Son image est prête — c'est la même que celle du panneau, déjà en
    //    mémoire : le décodage est immédiat. Un hero vidéo n'a pas d'image à
    //    décoder : on laisse à son poster le temps d'être peint.
    //    Décodée ne veut pas dire affichée : deux images de plus pour qu'elle
    //    soit bien PEINTE à l'écran avant que le panneau commence à s'effacer —
    //    sans quoi, sur un téléphone lent, le fondu découvrait un instant le
    //    fond noir du hero.
    const image = document.querySelector(".hero-join-clean .hero-media img");
    if (image?.decode) await Promise.race([image.decode().catch(() => {}), attendre(250)]);
    else await attendre(120);
    await prochaineImage();
    await prochaineImage();

    // 5. Le panneau s'efface en un fondu bref sur le hero, identique à l'écran.
    //    Dès ce moment il laisse passer les gestes (voir `.is-revealing`), et le
    //    premier geste du lecteur arrête le fondu net : la page lui appartient.
    revelation = true;
    const geste = new AbortController();
    await Promise.race([attendre(reduced ? 0 : REVELATION_MS + 20), premierGeste(geste.signal)]);
    geste.abort();

    // 6. Le panneau retrouve sa place, hors champ au bas de la nouvelle page,
    //    et prend le projet suivant (voir le bloc réactif plus haut).
    couverture = false;
    revelation = false;
  }

  /** Voir `handleHold` dans `Header.svelte`. */
  function tenirEntete(hold) {
    window.dispatchEvent(new CustomEvent("header:hold", { detail: { hold } }));
  }

  /** Le premier geste du lecteur — doigt, molette, clavier. */
  function premierGeste(signal) {
    return new Promise((resolve) => {
      for (const type of ["touchstart", "pointerdown", "wheel", "keydown"]) {
        window.addEventListener(type, () => resolve(), { passive: true, once: true, signal });
      }
    });
  }

  /*  L'image arrive en fondu à son chargement (elle est paresseuse : sur un
   *  défilement rapide, elle peut finir de charger sous les yeux). Une image
   *  déjà complète avant que l'écouteur soit posé ne déclenche plus `load` :
   *  d'où cette vérification au montage et à chaque changement de projet. */
  function verifierImage() {
    if (imgEl?.complete && imgEl.naturalWidth > 0) chargee = true;
  }

  function surChargement() {
    chargee = true;
  }

  onMount(() => {
    if (!browser) return;

    reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    tactile = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;

    // Un doigt posé, ou qui vient de se lever (l'inertie démarre à cet
    // instant) : la fenêtre de repos repart de zéro.
    const surToucher = (event) => {
      toucheActive = event.touches.length > 0;
      dernierMouvement = performance.now();
    };

    registerParallax(handleRead, { priority: 3 });
    registerWrite(handleWrite, { priority: 3 });
    verifierImage();
    forceScrollEngineUpdate();

    window.addEventListener("touchstart", surToucher, { passive: true });
    window.addEventListener("touchend", surToucher, { passive: true });
    window.addEventListener("touchcancel", surToucher, { passive: true });
    window.addEventListener("resize", scheduleMeasure, { passive: true });
    window.addEventListener("orientationchange", scheduleMeasure, { passive: true });
    window.addEventListener("pageshow", scheduleMeasure);
    if (document.fonts?.ready) document.fonts.ready.then(scheduleMeasure).catch(() => {});

    return () => {
      unregisterParallax(handleRead);
      unregisterWrite(handleWrite);
      window.removeEventListener("touchstart", surToucher);
      window.removeEventListener("touchend", surToucher);
      window.removeEventListener("touchcancel", surToucher);
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("orientationchange", scheduleMeasure);
      window.removeEventListener("pageshow", scheduleMeasure);
      clearTimeout(sortieTimer);
      clearTimeout(retourTimer);
    };
  });

  // Le composant est démonté par la navigation qui quitte les pages projet :
  // sans ça, un minuteur de départ survivrait au changement de page.
  onDestroy(() => {
    clearTimeout(sortieTimer);
    clearTimeout(retourTimer);
    if (browser) cancelAnimationFrame(rafVue);
    if (browser && couverture) tenirEntete(false);
  });
</script>

{#if affiche}
  <section class="nextp" bind:this={wrapEl} use:presence aria-label={`${libelle} : ${affiche.title}`}>
    <div
      class="nextp__panel"
      class:is-leaving={leaving}
      class:is-cover={couverture}
      class:is-revealing={revelation}
      bind:this={panelEl}
    >
      <!--  La carte : tout ce que le hero d'arrivée peint, découpé en rectangle
            arrondi qui s'ouvre jusqu'au plein écran (voir `handleWrite`).
            `hero-media` et `hero-dark-layer` ne sont pas décoratifs : `app.css`
            porte, pour les écrans TACTILES, un assombrissement du bas du hero
            qui vise ces deux classes (bloc `@media (hover: none) and
            (pointer: coarse)`). Sans elles, la carte serait claire là où le
            hero d'arrivée est sombre — et le raccord se verrait. -->
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
      <div class="nextp__card" bind:this={cardEl} data-cursor="view" on:click={allerAuBout}>
        <div class="nextp__media hero-media" aria-hidden="true">
          <picture>
            {#if affiche.hero?.mobileImage}
              <source media="(max-width: 640px)" srcset={affiche.hero.mobileImage} sizes="100vw" />
            {/if}
            <!--  `sizes="100vw"` écrit en dur, comme dans le hero : les deux
                  doivent choisir la MÊME variante, sinon le hero d'arrivée
                  repartirait chercher une autre image au changement de page.
                  `data-no-arrivee` : l'image a son propre fondu (`is-loaded`). -->
            <img
              src={affiche.hero?.image}
              sizes="100vw"
              alt=""
              loading="lazy"
              decoding="async"
              data-no-arrivee
              class:is-loaded={chargee}
              bind:this={imgEl}
              on:load={surChargement}
              on:error={surChargement}
            />
          </picture>
          <div class="nextp__dark hero-dark-layer"></div>
        </div>

        <!--  Le fondu au noir du bas d'écran, propre au hero TÉLÉPHONE (voir les
              styles) : sans lui, toute la moitié basse s'assombrissait d'un coup
              au changement de page. -->
        <span class="nextp__fondu" aria-hidden="true"></span>
      </div>

      <!--  La ligne au-dessus de la carte : portée par son bord haut, poussée
            hors champ quand elle s'ouvre. Le compteur remplace l'ancienne
            jauge ; il atteint 100 au départ. -->
      <div class="nextp__barre" class:is-open={ouvert} bind:this={barreEl}>
        <span class="nextp__item nextp__item--g" bind:this={itemGEl}>
          <span class="nextp__in">{libelle}</span>
        </span>
        <span class="nextp__item nextp__item--d" bind:this={itemDEl}>
          <span class="nextp__in nextp__compteur" role="progressbar" aria-label={`Vers ${affiche.title}`}
            aria-valuemin="0" aria-valuemax="100" aria-valuenow={pourcent}>
            <span class="nextp__chiffre" bind:this={chiffreEl}>0</span><span class="nextp__pct">%</span>
          </span>
        </span>
      </div>

      <!-- Le titre : mêmes règles que `.hero-scroll-label` du hero projet, au
           pixel près une fois la carte ouverte — c'est ce qui rend le passage
           invisible. Pendant l'ouverture, il suit le coin de la carte. -->
      <div class="nextp__cue" class:is-open={ouvert} bind:this={cueEl}>
        <p class="nextp__label" use:fitTitle={affiche.title}>{affiche.title}</p>
        <!--  La flèche du hero, et pas un intitulé : la pile du hero d'arrivée
              est exactement « titre + flèche », donc le titre se pose ici à la
              même hauteur au pixel près. Elle RESTE au départ : elle est déjà
              celle du hero d'arrivée. -->
        <span class="nextp__arrow" aria-hidden="true">↓</span>
      </div>

      <!--  Le raccourci pour qui ne veut pas dérouler — et le seul chemin au
            clavier vers le projet suivant.
            `preload-code="viewport"` n'est pas là pour lui : il est TOUJOURS
            dans le cadre du panneau, donc le code de la page suivante se charge
            dès que le pied de page apparaît. Quand la course arrive au bout, il
            n'y a plus rien à télécharger et le passage est instantané.
            ⚠️ `preload-CODE`, pas `preload-data` : `viewport` n'est pas une
            valeur de `preload-data` — SvelteKit l'ignorait (avec une erreur en
            console) et rien n'était préchargé. -->
      <a class="nextp__skip" href={`/${affiche.slug}`} data-sveltekit-preload-code="viewport">
        Voir le projet {affiche.title}
      </a>
    </div>
  </section>
{/if}

<style>
  .nextp {
    position: relative;
    z-index: 2;
    /* L'enveloppe : la course de défilement du panneau. */
    height: 240svh;
    background: var(--bg-deep, #050709);
  }

  .nextp__panel {
    position: sticky;
    top: 0;
    height: 100svh;
    overflow: hidden;
    isolation: isolate;
    background: var(--bg-deep, #050709);
    color: #fff;
  }

  /*  ── La couverture ──
   *  Au départ, le panneau est posé en haut de l'écran (collé) : le passer en
   *  `fixed` à la même place ne déplace rien. La page change dessous ; tant
   *  qu'elle n'est pas prête — une centaine de millisecondes — aucun geste ne
   *  la fait défiler. Son enveloppe garde sa hauteur propre : rien ne bouge
   *  non plus dans le flux. */
  .nextp__panel.is-cover {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 3;
    touch-action: none;
  }

  /*  Le fondu final ne retient plus rien : les gestes traversent le panneau
   *  jusqu'à la page (le script l'arrête net au premier d'entre eux). */
  .nextp__panel.is-revealing {
    opacity: 0;
    pointer-events: none;
    transition: opacity 220ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  /*  ── La carte ──
   *  Plein écran, découpée par le script (`clip-path: inset(… round …)`) :
   *  seul le contour bouge, jamais la boîte — redimensionner à chaque image
   *  un élément qui porte une image, c'est le défilement qui accroche (même
   *  règle que le cadre des hero, `heroFrame.js`). L'état de départ ci-dessous
   *  ne sert qu'au premier rendu, avant la première mesure. */
  .nextp__card {
    position: absolute;
    inset: 0;
    z-index: 0;
    cursor: pointer;
    clip-path: inset(16svh 6vw 5svh 6vw round 22px);
    background: var(--bg-deep, #050709);
    /*  Un calque à part (2026-11-18) : sa découpe change à chaque image ; sans
     *  calque, WebKit repeignait avec elle ce qu'elle contient — dont le
     *  fondu au noir de 68rem du téléphone. Calque sur la CARTE, jamais sur
     *  le panneau `sticky` qui la porte (voir la mémoire du projet). */
    will-change: transform;
  }

  .nextp__panel.is-leaving .nextp__card,
  .nextp__panel.is-cover .nextp__card {
    cursor: default;
  }

  /* Même boîte que `.hero-media` du hero projet : c'est la condition du
     raccord. Ne pas la modifier d'un côté seulement. */
  .nextp__media {
    position: absolute;
    inset: 0;
    height: var(--viewport-height, 100svh);
    z-index: 0;
    pointer-events: none;
  }

  .nextp__media picture {
    display: block;
    position: absolute;
    inset: 0;
  }

  .nextp__media img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* L'image arrive en fondu à son chargement, jamais d'un coup sec. */
    opacity: 0;
    transform: scale(1.12);
    transition: opacity 700ms cubic-bezier(0.22, 1, 0.36, 1);
    /* Son échelle est réécrite à chaque image pendant la course : la couche
       doit exister d'avance, sinon la promotion se fait en plein mouvement. */
    will-change: transform;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .nextp__media img.is-loaded {
    opacity: 1;
  }

  /* Le dégradé du bas, identique à `.hero-media::after`. */
  .nextp__media::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 22svh;
    background: linear-gradient(
      to top,
      rgba(var(--shade-rgb, 0, 0, 0), 0.88) 0%,
      rgba(var(--shade-rgb, 0, 0, 0), 0.58) 34%,
      rgba(var(--shade-rgb, 0, 0, 0), 0.2) 68%,
      rgba(var(--shade-rgb, 0, 0, 0), 0) 100%
    );
    pointer-events: none;
    z-index: 1;
  }

  /*  Le calque d'assombrissement du hero mobile. Éteint sur grand écran (le
   *  hero l'y éteint aussi, par JavaScript) ; sur écran tactile, `app.css` le
   *  rallume avec son dégradé — les deux panneaux se ressemblent alors trait
   *  pour trait. */
  .nextp__dark {
    position: absolute;
    inset: 0;
    z-index: 1;
    opacity: 0;
    pointer-events: none;
  }

  /*  Le fondu au noir du hero TÉLÉPHONE. Sous 640 px, la bande infos du hero
   *  (`.after-section::before` dans `ProjectHeroProjetsStyle`) remonte un
   *  dégradé de 68rem par-dessus le média, jusqu'au noir plein au bas de
   *  l'écran. Le panneau ne l'avait pas : au changement de page, toute la
   *  moitié basse s'assombrissait d'un coup. Recopié ici à l'identique (mêmes
   *  arrêts, même hauteur, même ancrage au bas d'un cadre de 100svh) : les
   *  deux fichiers doivent rester d'accord. */
  .nextp__fondu {
    display: none;
  }

  /*  ── La ligne au-dessus de la carte ──
   *  Une rangée de hauteur nulle collée en haut du panneau ; le script la
   *  descend jusqu'au bord haut de la carte (`translate`) et décale les deux
   *  extrémités sur ses bords (gauche / droite). Les arrivées sont portées par
   *  les `.nextp__in`, jamais par les éléments que le script déplace. */
  .nextp__barre {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 0;
    z-index: 4;
    pointer-events: none;
    will-change: transform, opacity;
  }

  .nextp__item {
    position: absolute;
    bottom: 0;
    display: block;
    font-family: var(--site-font);
    font-size: 0.8rem;
    font-weight: var(--site-weight);
    line-height: 1.3;
    letter-spacing: 0.01em;
    white-space: nowrap;
  }

  .nextp__item--g {
    left: 0;
    color: #fff;
    will-change: transform;
  }

  .nextp__item--d {
    right: 0;
    will-change: transform;
  }

  .nextp__in {
    display: inline-block;
    opacity: 0;
    translate: 0 10px;
    transition:
      opacity 620ms cubic-bezier(0.22, 1, 0.36, 1) var(--nextp-delai, 0ms),
      translate 760ms cubic-bezier(0.22, 1, 0.36, 1) var(--nextp-delai, 0ms);
  }

  .nextp__item--d .nextp__in {
    --nextp-delai: 120ms;
  }

  .nextp__barre.is-open .nextp__in {
    opacity: 1;
    translate: 0 0;
  }

  /*  Le compteur : chiffres à chasse fixe et largeur réservée — sinon toute
   *  la ligne bougerait d'un pixel à chaque chiffre. */
  .nextp__compteur {
    color: #fff;
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum" 1;
  }

  .nextp__chiffre {
    display: inline-block;
    min-width: 3ch;
    text-align: right;
  }

  .nextp__pct {
    margin-left: 0.2em;
    color: rgba(255, 255, 255, 0.58);
  }

  /*  ── Le titre, recopié du hero ──
   *  Dans le hero, la pile titre + flèche vit DANS `.hero-stage-content`, qui
   *  porte déjà `inset: var(--site-inset)` : ses décalages s'ajoutent donc à
   *  cette marge. Ici il n'y a pas de couche intermédiaire — on additionne à la
   *  main, sinon le titre saute d'une marge de site au changement de page.
   *  Pendant l'ouverture, le script le décale jusqu'au coin de la carte ;
   *  carte ouverte, ce décalage est nul. */
  .nextp__cue {
    position: absolute;
    left: calc(var(--site-inset) + clamp(1rem, 2vw, 1.8rem));
    bottom: calc(var(--site-inset) + max(clamp(1rem, 2.2vw, 1.6rem), var(--safe-bottom-offset)));
    z-index: 4;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    gap: 0.45rem;
    color: #fff;
    pointer-events: none;
    will-change: transform;
  }

  .nextp__label {
    /*  ── Pourquoi ce remplissage vertical ───────────────────────────────────
     *  Le dégradé est peint sur la BOÎTE puis découpé par le texte : un glyphe
     *  qui déborde de la boîte n'a plus de fond, donc plus de couleur, et
     *  disparaît. La boîte est donc étirée par un remplissage, et les marges
     *  négatives l'annulent dans le flux.
     *  ⚠️ Les mêmes valeurs vivent dans l'autre fichier (hero ↔ pied de page
     *  « projet suivant ») : le titre doit rester au même endroit au pixel
     *  près d'une page à l'autre. */
    padding-block: 0.18em 0.24em;
    margin-block: -0.18em -0.24em;
    margin: 0;
    font-family: var(--site-font);
    /* Même réduction que le titre du hero (action `fitTitle`). */
    font-size: calc(clamp(7rem, 9vw, 20rem) * var(--title-fit, 1));
    font-weight: var(--site-weight-display);
    line-height: 1;
    letter-spacing: 0.02em;
    text-align: left;
    /* Le même dégradé de transparence que le titre du hero. */
    background: linear-gradient(
      to top,
      #ffffff 0%,
      #ffffff 45%,
      rgba(255, 255, 255, 0.28) 88%,
      rgba(255, 255, 255, 0.22) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
    max-width: 10ch;
    min-width: min-content;
    text-wrap: balance;
    /*  Il sort du flou UNE SEULE FOIS, quand le panneau s'est posé, puis ne
     *  bouge plus : c'est lui qui doit rester immobile au changement de page.
     *  Mêmes durées et même courbe que l'arrivée du titre du hero. */
    opacity: 0;
    filter: blur(14px);
    transform: translate3d(0, 14px, 0);
    transition:
      opacity 720ms cubic-bezier(0.22, 1, 0.36, 1),
      filter 900ms cubic-bezier(0.22, 1, 0.36, 1),
      transform 720ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .nextp__cue.is-open .nextp__label {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
  }

  /*  Au doigt, le titre arrive SANS flou animé : un `blur()` recalculé à chaque
   *  image sur un titre de cette taille est ce qui fait accrocher un téléphone
   *  (le site l'y retire partout, voir `.reveal` dans `app.css`). Il garde
   *  pourtant `blur(0)` au repos, comme le titre du hero : c'est l'état exact
   *  que le hero affiche quand il prend le relais. */
  @media (hover: none) and (pointer: coarse) {
    .nextp__label {
      filter: blur(0);
      transition:
        opacity 720ms cubic-bezier(0.22, 1, 0.36, 1),
        transform 720ms cubic-bezier(0.22, 1, 0.36, 1);
    }
  }

  /*  Les mesures de `.hero-scroll-arrow`, au pixel près : la pile est ancrée
   *  par le bas, c'est donc cette ligne qui fixe la hauteur du titre. Son
   *  arrivée est aussi celle du hero (`app.css`) : un fondu et une petite
   *  remontée, un temps après le titre. */
  .nextp__arrow {
    display: block;
    font-family: var(--site-font);
    font-size: clamp(1.1rem, 1.1vw, 1.2rem);
    line-height: 1;
    font-weight: var(--site-weight);
    color: #fff;
    opacity: 0;
    transform: translate3d(0, 12px, 0);
    transition:
      opacity 760ms cubic-bezier(0.22, 1, 0.36, 1) 160ms,
      transform 760ms cubic-bezier(0.22, 1, 0.36, 1) 160ms;
  }

  .nextp__cue.is-open .nextp__arrow {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  /* Le raccourci reste hors de l'écran mais entièrement focalisable : c'est le
     seul chemin au clavier vers le projet suivant, puisque la progression est
     pilotée au défilement. Il revient à l'écran quand il prend le focus — et
     ne porte son verre qu'à ce moment-là : un flou d'arrière-plan invisible
     coûte quand même son calcul à chaque image. */
  .nextp__skip {
    position: absolute;
    left: clamp(1rem, 2vw, 1.8rem);
    top: clamp(3rem, 5vw, 4rem);
    z-index: 5;
    padding: 0.7em 1.1em;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.11);
    font-family: var(--site-font);
    font-size: 0.92rem;
    color: #fff;
    opacity: 0;
    pointer-events: none;
  }

  .nextp__skip:focus-visible {
    opacity: 1;
    pointer-events: auto;
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    outline: 2px solid var(--lead-blue, #5768ff);
    outline-offset: 3px;
  }

  /* ── Téléphone ──
     Mêmes règles que le hero en dessous de 640 px : le média déborde de 12svh
     par le bas, le dégradé disparaît, et le titre change de place et de taille.
     Recopiées telles quelles — voir l'en-tête. */
  @media (max-width: 900px) {
    .nextp__label {
      font-size: calc(clamp(5rem, 12vw, 9rem) * var(--title-fit, 1));
      max-width: 9ch;
    }
  }

  @media (max-width: 640px) {
    .nextp {
      height: 200svh;
    }

    .nextp__card {
      clip-path: inset(17svh 1rem 3.5svh 1rem round 18px);
    }

    .nextp__media::after {
      display: none;
    }

    /*  Sous 640 px, le hero ÉTEINT son calque d'assombrissement (sa propre
     *  règle, en `!important`, l'emporte sur celle d'`app.css` parce qu'elle
     *  est portée par Svelte et pèse donc une classe de plus). Le panneau doit
     *  faire exactement pareil, sinon il arrive plus sombre que le hero et le
     *  raccord se voit. Au-dessus de 640 px sur écran tactile, les deux le
     *  gardent allumé. */
    .nextp__dark {
      background: none;
      opacity: 0 !important;
    }

    .nextp__media img {
      inset: 0 0 -12svh 0;
      height: calc(100% + 12svh);
    }

    /* Le fondu au noir de `.after-section::before` du hero : ancré au bas du
       cadre (le haut de la bande infos), 68rem de haut, mêmes arrêts. Il passe
       sous le titre, comme dans le hero. */
    .nextp__fondu {
      display: block;
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 68rem;
      z-index: 3;
      pointer-events: none;
      background: linear-gradient(
        to bottom,
        rgba(var(--shade-rgb, 0, 0, 0), 0) 0%,
        rgba(var(--shade-rgb, 0, 0, 0), 0.01) 16%,
        rgba(var(--shade-rgb, 0, 0, 0), 0.03) 32%,
        rgba(var(--shade-rgb, 0, 0, 0), 0.08) 48%,
        rgba(var(--shade-rgb, 0, 0, 0), 0.18) 64%,
        rgba(var(--shade-rgb, 0, 0, 0), 0.38) 78%,
        rgba(var(--shade-rgb, 0, 0, 0), 0.68) 90%,
        rgba(var(--shade-rgb, 0, 0, 0), 0.92) 97%,
        rgba(var(--shade-rgb, 0, 0, 0), 1) 100%
      );
    }

    .nextp__label {
      font-size: calc(clamp(3.4rem, 15vw, 5.6rem) * var(--title-fit, 1));
      line-height: 0.95;
      max-width: 8ch;
    }

    /*  ── Ancré sur 100svh, et sur RIEN qui bouge ──
     *  Le titre était placé avec `--safe-bottom-offset`, donc avec
     *  `env(safe-area-inset-bottom)` — que Safari iOS fait varier d'une
     *  trentaine de pixels chaque fois que sa barre d'outils se replie ou se
     *  déplie. Le titre sautait donc en pleine course, et parfois juste au
     *  changement de page. Le bas d'un cadre de 100svh est TOUJOURS au-dessus
     *  de la barre et de l'indicateur d'accueil : la marge de sécurité n'y
     *  servait à rien. Même règle dans le hero. */
    .nextp__cue {
      left: calc(1rem + var(--site-inset));
      bottom: auto;
      top: calc(100svh - var(--site-inset) - 11rem);
      gap: 0.42rem;
    }

    .nextp__arrow {
      font-size: 1rem;
    }
  }

  /*  Mouvement réduit : la carte suit toujours le défilement (c'est le
   *  lecteur qui la mène), mais rien ne s'anime de lui-même et l'image ne
   *  zoome pas. Le passage automatique reste, sans fondu. */
  @media (prefers-reduced-motion: reduce) {
    .nextp__media img {
      transform: none;
    }

    .nextp__media img,
    .nextp__arrow,
    .nextp__label,
    .nextp__in,
    .nextp__panel.is-revealing {
      transition: none;
    }

    .nextp__arrow,
    .nextp__label,
    .nextp__in {
      opacity: 1;
      filter: none;
      transform: none;
      translate: none;
    }
  }
</style>
