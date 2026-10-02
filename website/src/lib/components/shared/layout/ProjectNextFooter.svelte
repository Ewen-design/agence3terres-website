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
  //  même cadrage, et son nom au même endroit, à la même taille, avec le même
  //  dégradé. Quand la navigation part, rien ne bouge à l'écran — c'est tout
  //  l'effet. Les règles de position et de taille du titre sont donc RECOPIÉES
  //  de `ProjectHeroProjetsStyle` : les toucher ici sans les toucher là-bas
  //  ferait sauter le titre au changement de page.
  //
  //  ── La mécanique ──────────────────────────────────────────────────────────
  //  Une enveloppe haute de plusieurs écrans, un panneau `sticky` d'un écran
  //  dedans. La progression est la part de l'enveloppe déjà parcourue ; elle
  //  éclaircit le voile, révèle le titre et remplit la pastille. À un cheveu de
  //  la fin, les éléments PROPRES au pied de page (surtitre, pastille, mentions)
  //  s'effacent, le voile finit de s'ouvrir sur l'image nue, et la navigation
  //  part en mode SILENCIEUX — sans le fondu-flou habituel du site, qui ferait
  //  disparaître puis revenir une image qui, elle, ne change pas.
  //
  //  La course est volontairement PLUS COURTE que l'enveloppe : la progression
  //  atteint 1 avant le bas absolu de la page. Sinon, sur un navigateur qui
  //  amortit la fin de course, on resterait bloqué à 0,99 sans jamais partir.
  // ───────────────────────────────────────────────────────────────────────────
  import { onDestroy, onMount } from "svelte";
  import { browser } from "$app/environment";
  import {
    registerParallax,
    unregisterParallax,
    registerWrite,
    unregisterWrite,
    forceScrollEngineUpdate
  } from "$lib/scrollEngine.js";
  import { navigate } from "$lib/navigate.js";
  import { markProjectHandoff } from "$lib/projectHandoff.js";

  /** Le projet annoncé — une entrée de `$lib/data/projets.js`. */
  export let project = null;
  /** Le libellé d'état, posé à côté de la pastille — jamais en surtitre. */
  export let libelle = "Projet suivant";

  /** Part de l'enveloppe sur laquelle la progression se joue (le reste est du mou). */
  const COURSE = 0.78;
  /** Au-delà, on part. Jamais 1 : la fin de course est amortie sur certains navigateurs. */
  const SEUIL = 0.985;
  /** Durée de l'effacement des éléments propres au pied de page. */
  const SORTIE_MS = 380;

  let wrapEl;
  let panelEl;
  let veilEl;
  let fillEl;
  let imgEl;
  let progress = 0;
  let leaving = false;
  let sortieTimer;
  let reduced = false;
  let mesurePeriodique;

  /*  ── Le composant SURVIT au changement de page ─────────────────────────────
   *  Il vit dans le layout, à la même place d'une page projet à l'autre : Svelte
   *  ne le démonte pas, il change seulement sa prop `project`. Sans remise à
   *  zéro, `leaving` restait donc à `true` après le premier passage et le
   *  deuxième ne partait jamais.
   *
   *  `arme` est le garde-fou de l'autre bord : juste après l'arrivée, le
   *  défilement n'est pas encore revenu en haut et les mesures datent de la
   *  page précédente — une lecture y trouverait une progression pleine et
   *  repartirait aussitôt. Le pied de page ne s'arme qu'une fois qu'une lecture
   *  l'a vu franchement en deçà du seuil. */
  let slugCourant = null;
  let arme = false;
  /*  Le titre sort du flou UNE SEULE FOIS, par une classe et une transition
   *  CSS — pas image par image. Recalculer un `filter: blur()` sur un titre de
   *  130 px à chaque image de défilement rastérise la couche à chaque fois :
   *  c'est la source de saccade la plus chère de tout le panneau. */
  let ouvert = false;

  $: if (project?.slug !== slugCourant) {
    slugCourant = project?.slug ?? null;
    leaving = false;
    arme = false;
    ouvert = false;
    progress = 0;
    pAppliquee = -1;
    sale = true;
    if (browser) scheduleMeasure();
  }

  // Mesures mises en cache : lire la boîte de l'enveloppe à chaque image
  // forcerait un recalcul de mise en page par image de défilement.
  let wrapTop = 0;
  let course = 1;

  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));

  function measure() {
    if (!wrapEl) return;
    const y = window.scrollY || window.pageYOffset || 0;
    const vh = window.innerHeight || 1;
    wrapTop = wrapEl.getBoundingClientRect().top + y;
    course = Math.max((wrapEl.offsetHeight - vh) * COURSE, 1);
  }

  /*  ── La mesure se fait DANS la phase de lecture ───────────────────────────
   *  Elle était déclenchée par un minuteur, donc au milieu d'une image, juste
   *  après que d'autres blocs avaient écrit des styles : `getBoundingClientRect`
   *  y forçait alors un recalcul de mise en page SYNCHRONE, et la page
   *  accrochait. Ici on ne lève qu'un drapeau ; la mesure a lieu au début de la
   *  prochaine image, avant toute écriture — l'ordre pour lequel les phases du
   *  moteur existent. */
  let besoinMesure = true;

  function scheduleMeasure() {
    besoinMesure = true;
    forceScrollEngineUpdate();
  }

  /*  ── Lecture et écriture SÉPARÉES ────────────────────────────────────────
   *  Écrire un style dans la phase de LECTURE du moteur de scroll oblige le
   *  navigateur à recalculer la mise en page au milieu de la passe de lecture
   *  des autres blocs : c'est exactement ce que les deux phases servent à
   *  éviter, et ça se voyait — la course du pied de page saccadait.
   *  `handleRead` ne fait plus que CALCULER ; `handleWrite` applique. */
  let sale = false;
  let pAppliquee = -1;

  /*  ── Pourquoi la position LISSÉE, et pas celle du navigateur ─────────────
   *  Sur grand écran le site défile nativement : la molette arrive par crans
   *  d'une centaine de pixels. Une valeur calculée sur la position brute avance
   *  donc par sauts — c'est la saccade, et elle est d'autant plus visible que
   *  l'écran est grand. Le moteur de scroll tient pour ça une position amortie
   *  (`motionY`, 155 ms de constante de temps) qui transforme ces crans en
   *  glissement continu, et il garde sa boucle vivante jusqu'à ce qu'elle ait
   *  rattrapé la position réelle. C'est elle qu'il faut lire — le hero du site
   *  fait exactement pareil pour son assombrissement. */
  function handleRead(y, ctx) {
    if (!wrapEl || leaving) return;

    if (besoinMesure) {
      besoinMesure = false;
      measure();
    }

    const p = clamp(((ctx?.motionY ?? y) - wrapTop) / course);

    if (Math.abs(p - progress) > 0.0008) {
      progress = p;
      sale = true;
    }

    if (!ouvert && p > 0.04) ouvert = true;

    if (!arme) {
      if (p < 0.5) arme = true;
      return;
    }

    if (p >= SEUIL) partir();
  }

  /*  Les trois valeurs sont écrites DIRECTEMENT sur les trois éléments
   *  concernés, et non en propriété personnalisée sur le panneau. Une
   *  propriété personnalisée change le style de TOUS les descendants qui
   *  l'héritent : le navigateur recalcule alors le sous-arbre entier à chaque
   *  image de défilement, pour deux valeurs qui n'intéressent que deux
   *  éléments. Écrites à la feuille, ce sont trois mutations de composition,
   *  sans recalcul de mise en page. */
  function handleWrite() {
    if (!sale) return;
    sale = false;
    if (progress === pAppliquee) return;
    pAppliquee = progress;

    // Le voile s'ouvre en courbe en S plutôt qu'en pente droite : une rampe
    // linéaire se lit comme une arête au départ et à l'arrivée.
    const u = clamp(progress / 0.9);
    const doux = u * u * (3 - 2 * u);
    if (veilEl) veilEl.style.opacity = (0.74 * (1 - doux)).toFixed(4);

    // L'image se pose LENTEMENT, du début à la toute fin de la course : c'est
    // ce qui donne à la descente un mouvement continu, et elle atterrit
    // exactement sur l'échelle 1 du hero qui lui succède.
    if (imgEl) imgEl.style.transform = `scale(${(1 + 0.05 * (1 - progress)).toFixed(4)})`;

    if (fillEl) fillEl.style.transform = `scaleX(${progress.toFixed(4)})`;
  }

  function partir() {
    if (leaving || !arme || !project) return;
    leaving = true;

    // Le relais : le hero suivant saute son arrivée, les deux images étant
    // déjà identiques à l'écran.
    markProjectHandoff();

    const aller = () => navigate(`/${project.slug}`, { silent: true });

    if (reduced) {
      aller();
      return;
    }

    sortieTimer = setTimeout(aller, SORTIE_MS);
  }

  onMount(() => {
    if (!browser) return;

    reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    registerParallax(handleRead, { priority: 3 });
    registerWrite(handleWrite, { priority: 3 });
    forceScrollEngineUpdate();

    window.addEventListener("resize", scheduleMeasure, { passive: true });
    window.addEventListener("orientationchange", scheduleMeasure, { passive: true });
    window.addEventListener("pageshow", scheduleMeasure);

    /*  La page au-dessus grandit encore après le montage (images paresseuses,
     *  polices) : l'enveloppe se déplace, il faut la remesurer. Mais SURTOUT PAS
     *  par un `ResizeObserver` sur la racine du document — il se déclenchait à
     *  chaque image chargée pendant le défilement, donc en plein mouvement.
     *  Une mesure périodique très lâche suffit : elle ne coûte rien (un drapeau)
     *  et la mesure elle-même a lieu dans la phase de lecture. */
    mesurePeriodique = setInterval(scheduleMeasure, 1500);

    if (document.fonts?.ready) document.fonts.ready.then(scheduleMeasure).catch(() => {});

    return () => {
      unregisterParallax(handleRead);
      unregisterWrite(handleWrite);
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("orientationchange", scheduleMeasure);
      window.removeEventListener("pageshow", scheduleMeasure);
      clearInterval(mesurePeriodique);
      clearTimeout(sortieTimer);
    };
  });

  // Le composant est démonté par la navigation qu'il vient de déclencher : sans
  // ça, le minuteur de sortie survivrait au changement de page.
  onDestroy(() => {
    clearTimeout(sortieTimer);
  });
</script>

{#if project}
  <section class="nextp" bind:this={wrapEl} aria-label={`${libelle} : ${project.title}`}>
    <div class="nextp__panel" class:is-leaving={leaving} bind:this={panelEl}>
      <!--  `hero-media` et `hero-dark-layer` ne sont pas décoratifs : `app.css`
            porte, pour les écrans TACTILES, un assombrissement du bas du hero
            qui vise ces deux classes (voir le bloc `@media (hover: none) and
            (pointer: coarse)`). Sans elles, le panneau serait clair là où le
            hero d'arrivée est sombre — et le raccord se verrait.
            Ces classes sont GLOBALES : les règles du hero, elles, sont
            portées par Svelte et ne touchent pas cet élément. -->
      <div class="nextp__media hero-media" aria-hidden="true">
        <picture>
          {#if project.hero?.mobileImage}
            <source media="(max-width: 640px)" srcset={project.hero.mobileImage} />
          {/if}
          <img src={project.hero?.image} alt="" loading="lazy" decoding="async" bind:this={imgEl} />
        </picture>
        <div class="nextp__dark hero-dark-layer"></div>
        <span class="nextp__veil" bind:this={veilEl}></span>
      </div>

      <!-- Le titre : mêmes règles que `.hero-scroll-label` du hero projet, au
           pixel près — c'est ce qui rend le passage invisible. -->
      <div class="nextp__cue" class:is-open={ouvert}>
        <p class="nextp__label">{project.title}</p>
        <!--  La flèche du hero, et pas un intitulé : la pile du hero d'arrivée
              est exactement « titre + flèche », donc le titre se pose ici à la
              même hauteur au pixel près. C'est aussi le bon signe — c'est bien
              en descendant qu'on rejoint le projet suivant. -->
        <span class="nextp__arrow" aria-hidden="true">↓</span>
      </div>

      <div class="nextp__side" class:is-open={ouvert}>
        <p class="nextp__libelle">{libelle}</p>

        <div class="nextp__bar" role="progressbar" aria-label={`Vers ${project.title}`}
          aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(progress * 100)}>
          <span class="nextp__fill" bind:this={fillEl}></span>
        </div>
      </div>

      <!--  Le raccourci pour qui ne veut pas dérouler — et le seul chemin au
            clavier vers le projet suivant.
            `preload-data="viewport"` n'est pas là pour lui : il est TOUJOURS
            dans le cadre du panneau, donc le code de la page suivante se charge
            dès que le pied de page apparaît. Quand la course arrive au bout, il
            n'y a plus rien à télécharger et le passage est instantané. -->
      <a class="nextp__skip" href={`/${project.slug}`} data-sveltekit-preload-data="viewport">
        Voir le projet {project.title}
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
    /* Son échelle est réécrite à chaque image pendant la course : la couche
       doit exister d'avance, sinon la promotion se fait en plein mouvement. */
    will-change: transform;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
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

  /*  Le voile : opaque quand le panneau arrive, il s'ouvre au fur et à mesure et
   *  finit sur l'image nue — exactement l'état du hero au repos. C'est cette
   *  valeur d'arrivée qui doit valoir zéro, pas autre chose : le hero suivant
   *  n'a aucun voile. */
  .nextp__veil {
    position: absolute;
    inset: 0;
    z-index: 2;
    background: rgba(var(--shade-rgb, 5, 7, 9), 1);
    /* La valeur est écrite par le JS à chaque image (voir `handleWrite`) : une
       seule mutation d'opacité, que le compositeur applique sans recalculer la
       mise en page. Cette valeur de départ ne sert qu'au premier rendu. */
    opacity: 0.74;
    will-change: opacity;
  }

  /*  ── Le titre, recopié du hero ──
   *  Dans le hero, la pile titre + flèche vit DANS `.hero-stage-content`, qui
   *  porte déjà `inset: var(--site-inset)` : ses décalages s'ajoutent donc à
   *  cette marge. Ici il n'y a pas de couche intermédiaire — on additionne à la
   *  main, sinon le titre saute d'une marge de site au changement de page.
   *  Mesuré : sans cette addition, 28,8 px d'écart à gauche et 31,2 px en bas. */
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
  }

  .nextp__libelle {
    margin: 0;
    font-family: var(--site-font);
    font-size: 0.76rem;
    font-weight: var(--site-weight);
    line-height: 1.4;
    letter-spacing: 0.01em;
    color: rgba(255, 255, 255, 0.58);
  }

  .nextp__label {
    /*  ── Pourquoi ce remplissage vertical ───────────────────────────────────
     *  Le dégradé est peint sur la BOÎTE puis découpé par le texte : un glyphe
     *  qui déborde de la boîte n'a plus de fond, donc plus de couleur, et
     *  disparaît. Avec `line-height: 1`, les jambages (le p de Ludosphères, le
     *  y de Moovy) et les accents (è, é) débordent — c'est ce qui coupait les
     *  titres en haut et en bas. La boîte est donc étirée par un remplissage,
     *  et les marges négatives l'annulent dans le flux : rien ne bouge de
     *  place, la boîte est seulement plus grande que le texte.
     *  ⚠️ Les mêmes valeurs vivent dans l'autre fichier (hero ↔ pied de page
     *  « projet suivant ») : le titre doit rester au même endroit au pixel
     *  près d'une page à l'autre. Les arrêts du dégradé ont été redécalés en
     *  conséquence (0,24 em de remplissage bas ≈ 17 % de la nouvelle boîte). */
    padding-block: 0.18em 0.24em;
    margin-block: -0.18em -0.24em;
    margin: 0;
    font-family: var(--site-font);
    font-size: clamp(7rem, 9vw, 20rem);
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
    /*  Il sort du flou UNE SEULE FOIS, au début de la course, puis ne bouge
     *  plus : c'est lui qui doit rester immobile au changement de page. La
     *  transition est menée par le navigateur, jamais réécrite à chaque image —
     *  un flou recalculé image par image sur un titre de cette taille est la
     *  source de saccade la plus chère du panneau. */
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

  /*  Les mesures de `.hero-scroll-arrow`, au pixel près : la pile est ancrée
   *  par le bas, c'est donc cette ligne qui fixe la hauteur du titre. La
   *  toucher ici sans la toucher dans le hero ferait sauter le titre au
   *  changement de page. */
  .nextp__arrow {
    display: block;
    font-family: var(--site-font);
    font-size: clamp(1.1rem, 1.1vw, 1.2rem);
    line-height: 1;
    font-weight: var(--site-weight);
    color: #fff;
    opacity: 0;
    transition: opacity 620ms ease 180ms;
  }

  .nextp__cue.is-open .nextp__arrow {
    opacity: 1;
  }

  /* ── La pastille de progression ──
     Le verre du site, rempli au fur et à mesure. Pas de barre nue : le site
     n'en a pas, et une pastille de verre y est chez elle. */
  /* La colonne de droite : les mentions, puis la pastille juste dessous. Le
     haut de l'écran reste libre — le bouton du header y vit. */
  .nextp__side {
    position: absolute;
    right: clamp(1rem, 2vw, 1.8rem);
    bottom: max(clamp(1.1rem, 2.4vw, 1.8rem), var(--safe-bottom-offset));
    z-index: 4;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: clamp(0.5rem, 1vw, 0.75rem);
    opacity: 0;
    transition: opacity 620ms ease 120ms;
  }

  .nextp__side.is-open {
    opacity: 1;
  }

  .nextp__bar {
    position: relative;
    width: clamp(9rem, 16vw, 15rem);
    height: 6px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    transform: translateZ(0);
    transition: opacity 320ms ease, filter 320ms ease, transform 320ms ease;
  }

  .nextp__fill {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background: #fff;
    transform: scaleX(0);
    transform-origin: left center;
    will-change: transform;
  }


  /* Le raccourci reste hors de l'écran mais entièrement focalisable : c'est le
     seul chemin au clavier vers le projet suivant, puisque la progression est
     pilotée au défilement. Il revient à l'écran quand il prend le focus. */
  .nextp__skip {
    position: absolute;
    left: clamp(1rem, 2vw, 1.8rem);
    top: clamp(3rem, 5vw, 4rem);
    z-index: 5;
    padding: 0.7em 1.1em;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    font-family: var(--site-font);
    font-size: 0.92rem;
    color: #fff;
    opacity: 0;
    pointer-events: none;
  }

  .nextp__skip:focus-visible {
    opacity: 1;
    pointer-events: auto;
    outline: 2px solid var(--lead-blue, #5768ff);
    outline-offset: 3px;
  }

  /* ── La sortie ──
     Seuls les éléments PROPRES au pied de page s'en vont. Le titre reste : il
     est déjà celui du hero qui arrive. */
  .nextp__panel.is-leaving .nextp__arrow,
  .nextp__panel.is-leaving .nextp__side {
    opacity: 0;
    filter: blur(10px);
    transform: translateY(-8px);
    transition:
      opacity 340ms cubic-bezier(0.22, 1, 0.36, 1),
      filter 340ms cubic-bezier(0.22, 1, 0.36, 1),
      transform 340ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .nextp__panel.is-leaving .nextp__veil {
    opacity: 0;
    transition: opacity 340ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* ── Téléphone ──
     Mêmes règles que le hero en dessous de 640 px : le média déborde de 12svh
     par le bas, le dégradé disparaît, et le titre change de place et de taille.
     Recopiées telles quelles — voir l'en-tête. */
  @media (max-width: 900px) {
    .nextp__label {
      font-size: clamp(5rem, 12vw, 9rem);
      max-width: 9ch;
    }
  }

  @media (max-width: 640px) {
    .nextp {
      height: 200svh;
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

    .nextp__label {
      font-size: clamp(3.4rem, 15vw, 5.6rem);
      line-height: 0.95;
      max-width: 8ch;
    }

    .nextp__cue {
      left: calc(1rem + var(--site-inset));
      bottom: auto;
      top: calc(100svh - var(--site-inset) - max(11rem, calc(var(--safe-bottom-offset) + 10rem)));
      gap: 0.42rem;
    }

    .nextp__arrow {
      font-size: 1rem;
    }

    .nextp__side {
      left: calc(1rem + var(--site-inset));
      right: calc(1rem + var(--site-inset));
      bottom: max(clamp(1.6rem, 6vw, 2.4rem), calc(var(--safe-bottom-offset) + 0.6rem));
      align-items: stretch;
      gap: 0.75rem;
    }

    .nextp__bar {
      width: 100%;
      backdrop-filter: blur(12px) saturate(130%);
      -webkit-backdrop-filter: blur(12px) saturate(130%);
    }

  }

  /*  Mouvement réduit : plus de course du tout. Le panneau se lit comme un pied
   *  de page ordinaire — image, nom, et un lien qu'on suit si on veut. Le
   *  passage automatique reste (il est déclenché par la lecture du défilement),
   *  mais sans effacement progressif. */
  @media (prefers-reduced-motion: reduce) {
    .nextp__veil {
      opacity: 0.32;
    }

    .nextp__arrow,
    .nextp__label,
    .nextp__side {
      opacity: 1;
      filter: none;
      transform: none;
      transition: none;
    }

    .nextp__panel.is-leaving .nextp__arrow,
    .nextp__panel.is-leaving .nextp__side,
    .nextp__panel.is-leaving .nextp__veil {
      transition: none;
    }

  }
</style>
