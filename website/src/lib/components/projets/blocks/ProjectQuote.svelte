<script>
  // ───────────────────────────────────────────────────────────────────────────
  //  ProjectQuote — le mot du client, en fin de page projet (2026-10-09)
  //
  //  Remplace le mur des autres projets (`ProjectWall`) juste avant le pied de
  //  page : un écran entier (~100svh), rien d'autre qu'une phrase centrée, en
  //  grand, et sa signature dessous. Le pied de page « projet suivant » prend
  //  ensuite le relais pour la suite de la visite.
  //
  //  ⚠️ LA PHRASE ARRIVE D'UN SEUL BLOC, SUR PLACE (2026-10-10) : du flou au net
  //  en fondu, sans montée, et sans le découpage mot à mot du reste du site.
  //  Le client voyait les mots « se replacer » après leur apparition, trois
  //  fois de suite, dans son Safari 18.1 — invisible sous Chromium et sous le
  //  WebKit de Playwright (filmés image par image : rien ne bouge). Plutôt que
  //  de traquer UNE cause, toutes sont retirées : aucun mot n'est plus une
  //  boîte à part (calque, position et équilibrage de ligne propres), le texte
  //  n'est plus jamais retouché par le script, et la couche de l'arrivée est
  //  GARDÉE ensuite (`keepLayer`) — c'est en la retirant que Safari recale un
  //  texte au pixel. Ne pas remettre `reveal` (mot à mot) ici.
  //
  //  Le surtitre et la signature suivent, en léger différé. Même convention
  //  de couleur que les autres textes des pages projet : ce qui est dans
  //  `<span class="hl">` reste en pleine encre ; sans `.hl`, toute la phrase
  //  est en pleine encre.
  //
  //  Les guillemets français sont posés ici, avec des espaces insécables, DANS
  //  le texte (`withQuotes`), collés au premier et au dernier mot.
  //
  //  ── LE TÉMOIGNAGE EN ENTIER (2026-10-09, Ludosphères) ─────────────────────
  //  Quand le client a écrit plus long que ce qu'un écran porte, la page n'en
  //  montre qu'une phrase, sous un petit surtitre (`label`) et SANS signature,
  //  et un « + » (le bouton de verre du site) ouvre le texte complet dans une
  //  carte plein écran (`ProjectQuoteCard`) : la page recule et se voile au
  //  noir comme pour une transition de page, la carte revient plein écran en
  //  restant noire, et le texte s'y pose. Le bouton menu du header passe en
  //  croix et la referme — le geste se rejoue alors à l'envers. Voir
  //  `$lib/pageCard.js`.
  //
  //  ── OU EN VIDÉO (2026-10-17, Lybra) ──────────────────────────────────────
  //  Avec `video`, le « + » ouvre la même carte, et la vidéo du client y prend
  //  la place du texte, en pleine hauteur, AVEC LE SON (`ProjectQuoteVideo`).
  //  L'élément <video> est fabriqué ICI, dans le clic même (`primeVideo`) :
  //  la carte ne s'ouvre que trois secondes plus tard, et Safari refuserait
  //  alors le son à un élément qui n'a jamais vu le geste.
  // ───────────────────────────────────────────────────────────────────────────
  import { onDestroy, tick } from "svelte";
  import { beforeNavigate } from "$app/navigation";
  import { revealBlock } from "$lib/actions/reveal.js";
  import { coverPage, uncoverPage, setPageCardOpen } from "$lib/pageCard.js";
  import ProjectQuoteCard from "./ProjectQuoteCard.svelte";

  // Pose les guillemets DANS le texte, au contact du premier et du dernier mot
  // (après les balises ouvrantes, avant les fermantes) : l'arrivée mot à mot
  // les découpe alors avec leur mot, et ils ne peuvent plus rester seuls en
  // bout de ligne.
  function withQuotes(html, { open = true, close = true } = {}) {
    const head = html.match(/^\s*(?:<[^/][^>]*>\s*)*/)[0];
    const tail = html.slice(head.length).match(/(?:\s*<\/[^>]+>)*\s*$/)[0];
    const body = html.slice(head.length, html.length - tail.length);
    return `${head}${open ? "«&nbsp;" : ""}${body}${close ? "&nbsp;»" : ""}${tail}`;
  }

  /** La citation. HTML autorisé (`.hl`), sans guillemets. */
  export let quote = "";
  /** Qui parle. */
  export let author = "";
  /** Sa fonction, sa structure. */
  export let role = "";
  /** Petit surtitre gris au-dessus de la citation. */
  export let label = "";

  /** Le témoignage complet, en paragraphes (HTML, sans guillemets). Le « + »
   *  n'apparaît que s'il est fourni. */
  export let full = [];
  /** La carte : photo de la personne, sa signature `{ name, org }`, le logo
   *  de sa marque en filigrane. */
  export let photo = "";
  export let photoAlt = "";
  export let photoPosition = "50% 30%";
  export let signature = null;
  export let logo = "";
  /** Le témoignage en vidéo, à la place du texte : `{ src, poster }` (un
   *  seul fichier H.264, son compris). Le « + » apparaît aussi avec lui. */
  export let video = null;

  $: hasCard = full.length > 0 || Boolean(video?.src);

  $: quoted = withQuotes(quote);
  $: fullQuoted = full.map((para, i) =>
    withQuotes(para, { open: i === 0, close: i === full.length - 1 })
  );

  /** @type {"closed" | "covering" | "open" | "closing"} */
  let phase = "closed";
  let mounted = false;
  let ready = false;
  let contentHidden = false;
  let fadeIn = false;
  let leaving = false;
  let cardEl;
  let plusEl;
  let scrollHeld = false;
  /** L'élément <video> de la carte, vivant du clic à la fermeture. */
  let videoEl = null;

  // Le panneau est sorti de `.page-stage` : la page recule pendant les deux
  // gestes (transform), et un `position: fixed` resté dedans la suivrait.
  // L'hôte est un enfant de la section, jamais une racine du composant :
  // Svelte retire ses racines en parcourant leurs voisins, ce qu'un nœud
  // déplacé fausserait.
  function portal(node) {
    (document.querySelector("main") ?? document.body).appendChild(node);
    return {
      destroy() {
        node.remove();
      }
    };
  }

  function holdScroll() {
    if (scrollHeld) return;
    scrollHeld = true;
    document.documentElement.style.overflow = "hidden";
  }

  function releaseScroll() {
    if (!scrollHeld) return;
    scrollHeld = false;
    if (document.documentElement.style.overflow === "hidden") {
      document.documentElement.style.overflow = "";
    }
  }

  // DANS le geste : un <video> rangé hors champ, et une lecture MUETTE
  // aussitôt mise en pause. Safari lève alors, pour CET élément, l'obligation
  // d'un geste pour jouer le son — la carte pourra le lancer à l'ouverture.
  // Le fichier commence aussi à charger pendant que la page recule.
  function primeVideo() {
    const el = document.createElement("video");
    el.playsInline = true;
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");
    el.preload = "auto";
    if (video.poster) el.poster = video.poster;
    el.defaultMuted = true;
    el.muted = true;
    el.style.cssText =
      "position:fixed;left:-9999px;top:0;width:2px;height:2px;opacity:0;pointer-events:none";
    el.src = video.src;
    document.body.appendChild(el);
    el.play()
      ?.then(() => {
        // La carte a pu démarrer la vraie lecture entre-temps (`data-live`).
        if (el.dataset.live === undefined) el.pause();
      })
      .catch(() => {});
    return el;
  }

  function releaseVideo() {
    if (!videoEl) return;
    const el = videoEl;
    videoEl = null;
    el.pause();
    // Coupe le téléchargement en cours et libère le décodeur.
    el.removeAttribute("src");
    el.load();
    el.remove();
  }

  async function openCard() {
    if (phase !== "closed") return;
    phase = "covering";
    if (video?.src) videoEl = primeVideo();
    const cover = coverPage();
    fadeIn = !cover;
    const covered = cover ? await cover : null;
    if (phase !== "covering") {
      releaseVideo();
      return;
    }

    // L'écran est noir : le panneau se pose, du même noir, dans l'image même —
    // encore VIDE.
    mounted = true;
    phase = "open";
    await tick();
    // Après le montage : le layout lève tout verrou de défilement dont il ne
    // voit pas le propriétaire (`data-scroll-lock-owner` sur le panneau).
    holdScroll();
    setPageCardOpen(true, closeCard);
    cardEl?.focus({ preventScroll: true });

    // Les textes n'arrivent qu'une fois la page rendue à plat dessous et au
    // repos : lancés pendant qu'elle se redessinait, ils accrochaient.
    if (covered?.released) await covered.released;
    if (phase === "open") ready = true;
  }

  function removeCard() {
    releaseScroll();
    releaseVideo();
    mounted = false;
    ready = false;
    contentHidden = false;
    leaving = false;
    fadeIn = false;
    phase = "closed";
    plusEl?.focus({ preventScroll: true });
  }

  function closeCard() {
    if (phase !== "open") return;
    phase = "closing";
    setPageCardOpen(false);
    // Les textes s'effacent d'abord, sur le noir ; puis le geste à l'envers.
    contentHidden = true;
    setTimeout(() => {
      if (phase !== "closing") return;
      if (!uncoverPage(removeCard)) {
        leaving = true;
        setTimeout(removeCard, 400);
      }
    }, 360);
  }

  function onKeyDown(event) {
    if (event.key === "Escape" && phase === "open") {
      event.preventDefault();
      closeCard();
    }
  }

  function handleButtonMove(event) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    button.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    button.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  // Une navigation pendant que la carte est ouverte (le logo, le retour du
  // navigateur) : la carte s'efface pendant que la page part.
  beforeNavigate(() => {
    if (phase === "closed") return;
    videoEl?.pause();
    setPageCardOpen(false);
    leaving = true;
    releaseScroll();
  });

  onDestroy(() => {
    if (phase !== "closed") setPageCardOpen(false);
    if (scrollHeld) releaseScroll();
    releaseVideo();
  });
</script>

<svelte:window on:keydown={onKeyDown} />

<section class="pquote" aria-label="Le mot du client">
  <figure class="pquote__figure">
    {#if label}<p class="pquote__label" use:revealBlock={{ keepLayer: true }}>{label}</p>{/if}
    <blockquote class="pquote__text" use:revealBlock={{ delay: 80, keepLayer: true }}>{@html quoted}</blockquote>
    {#if author || role}
      <figcaption class="pquote__cite" use:revealBlock={{ delay: 200, keepLayer: true }}>
        {#if author}<span class="pquote__author">{author}</span>{/if}
        {#if role}<span class="pquote__role">{role}</span>{/if}
      </figcaption>
    {/if}

    {#if hasCard}
      <button
        class="pquote__more card-plus"
        type="button"
        aria-label={video?.src ? "Voir le témoignage en vidéo" : "Lire le témoignage en entier"}
        aria-haspopup="dialog"
        aria-expanded={phase === "open"}
        data-cursor="button"
        bind:this={plusEl}
        on:click={openCard}
        on:mousemove={handleButtonMove}
        use:revealBlock={{ delay: 220 }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      </button>
    {/if}
  </figure>

  {#if hasCard}
    <div class="pquote__portal" use:portal>
      {#if mounted}
        <ProjectQuoteCard
          paragraphs={fullQuoted}
          {photo}
          {photoAlt}
          {photoPosition}
          {signature}
          {logo}
          {ready}
          {contentHidden}
          {fadeIn}
          {leaving}
          video={videoEl}
          videoPoster={video?.poster ?? ""}
          bind:el={cardEl}
        />
      {/if}
    </div>
  {/if}
</section>

<style>
  .pquote {
    display: grid;
    place-items: center;
    min-height: 100svh;
    padding: clamp(5rem, 12vh, 9rem) var(--project-side-padding, var(--site-inset));
    color: var(--project-surface-ink, #f4efe6);
    overflow-x: clip;
  }

  .pquote__figure {
    margin: 0;
    width: min(100%, 58rem);
    text-align: center;
  }

  /* Le texte arrive sur place : ni montée, ni mots qui bougent (voir plus
     haut). Le « + » garde la montée des boutons. */
  .pquote__label,
  .pquote__text,
  .pquote__cite {
    --reveal-shift: 0px;
  }

  /* Plus grand que les accroches de la page (36 px au repos) : c'est le seul
     texte de l'écran. Mais sans retomber dans les 45 px+ qu'on vient de
     quitter sur téléphone — 27 px à 390 px de large. */
  .pquote__text {
    margin: 0;
    font-family: var(--site-font);
    font-weight: var(--site-weight-display, 500);
    font-size: clamp(1.7rem, 3.6vw, 3.6rem);
    line-height: 1.14;
    letter-spacing: -0.015em;
    text-wrap: balance;
  }

  .pquote__text:has(:global(.hl)) {
    color: color-mix(in srgb, var(--project-surface-ink, #f4efe6) 50%, transparent);
  }

  .pquote__text :global(.hl) {
    color: var(--project-surface-ink, #f4efe6);
  }

  .pquote__cite {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    margin-top: clamp(2rem, 5vh, 3.25rem);
    font-family: var(--site-font);
    font-size: clamp(0.95rem, 1.1vw, 1.1rem);
    line-height: 1.4;
  }

  .pquote__author {
    font-weight: var(--site-weight-display, 500);
  }

  .pquote__role {
    color: color-mix(in srgb, var(--project-surface-ink, #f4efe6) 50%, transparent);
  }

  /* Le surtitre : le gabarit de la signature, en gris. */
  .pquote__label {
    margin: 0 0 clamp(1.4rem, 3.5vh, 2.25rem);
    font-family: var(--site-font);
    font-size: clamp(0.95rem, 1.1vw, 1.1rem);
    line-height: 1.4;
    color: color-mix(in srgb, var(--project-surface-ink, #f4efe6) 50%, transparent);
  }

  /*  ── Le « + » ───────────────────────────────────────────────────────────
   *  Le bouton de verre du site, au fond et aux effets de « Visiter le site »
   *  du hero de la même page (`.hero-cta`) : verre blanc à 11 % sur un fond
   *  flouté, arrondi de 10 px, et au survol le liseré qui suit le curseur. Un
   *  carré à la hauteur de ce bouton, un « + » au trait de la croix du header,
   *  qui pivote au survol comme elle. Sur écran tactile, `.card-plus` coupe
   *  les liserés (`app.css`). */
  .pquote__more {
    position: relative;
    display: inline-grid;
    place-items: center;
    width: clamp(3.15rem, 4vw, 3.9rem);
    aspect-ratio: 1;
    margin-top: clamp(2.25rem, 5.5vh, 3.5rem);
    padding: 0;
    border: 0;
    border-radius: 10px;
    color: #f7f2e8;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    box-shadow: 0 6px 8px rgba(var(--shade-rgb, 0, 0, 0), 0.04);
    -webkit-tap-highlight-color: transparent;
    transition:
      box-shadow 1.2s cubic-bezier(.22,.61,.36,1),
      background 1.2s cubic-bezier(.22,.61,.36,1);
  }

  .pquote__more svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    transition: transform 0.6s cubic-bezier(.22,.61,.36,1);
  }

  .pquote__more::before,
  .pquote__more::after {
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

  .pquote__more::before {
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

  .pquote__more::after {
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
    .pquote__more:hover::before,
    .pquote__more:hover::after {
      opacity: 1;
    }

    .pquote__more:hover svg {
      transform: scale(1.12) rotate(90deg);
    }
  }

  .pquote__more:focus-visible {
    outline: 1px solid rgba(255, 255, 255, 0.6);
    outline-offset: 3px;
  }

  @media (max-width: 900px) {
    .pquote {
      padding: clamp(4rem, 10vh, 6rem) var(--project-side-padding, 1rem);
    }

    /* Le verre mobile du site, comme `.hero-cta`. */
    .pquote__more {
      width: 3.45rem;
      backdrop-filter: blur(12px) saturate(130%);
      -webkit-backdrop-filter: blur(12px) saturate(130%);
    }
  }

  /* Téléphone couché : un écran fait 390 px de haut, la citation n'a pas
     besoin d'en occuper un entier pour respirer. */
  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .pquote {
      min-height: auto;
    }
  }
</style>
