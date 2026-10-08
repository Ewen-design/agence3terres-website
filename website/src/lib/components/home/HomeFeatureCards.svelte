<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import AutoVideo from "$lib/components/shared/media/AutoVideo.svelte";
  import { reveal } from "$lib/actions/reveal.js";

  // ───────────────────────────────────────────────────────────────────────────
  //  HomeFeatureCards — ce que fait l'agence, en quatre volets.
  //
  //  DEUX MISES EN PAGE, DEUX MÉCANIQUES, ET C'EST ASSUMÉ.
  //
  //  • GRAND ÉCRAN (refait le 2026-09-05). Un VISUEL COLLANT à gauche, presque
  //    carré, aux marges et à l'arrondi du site : il ne bouge plus de tout le
  //    bloc. À sa droite, les quatre volets défilent normalement — numéro, titre,
  //    phrase — et le visuel FOND vers celui du volet qui passe au milieu de
  //    l'écran. Le volet suivant reste visible en dessous, en demi-teinte : on
  //    voit toujours où on va.
  //    Ce qu'il remplace : quatre cartes plein écran qui se recouvraient au
  //    défilement. Le principe des cartes reste, mais sur téléphone seulement.
  //
  //  • TÉLÉPHONE. Chaque volet est une carte plein écran, collée à `top: 0`,
  //    qui RECOUVRE la précédente : c'est l'ordre du DOM qui décide de
  //    l'empilement. Le visuel occupe le haut de la carte À FRANC-BORD (depuis
  //    le 2026-10-02 : plus aucune marge au-dessus ni sur les côtés), la phrase
  //    se pose en bas, et le fond de la carte est un dégradé du clair au foncé.
  //
  //  ── POURQUOI DEUX BLOCS DE BALISES ET PAS UN SEUL ─────────────────────────
  //  Les deux mises en page ne veulent pas le même ARBRE, et aucune feuille de
  //  style ne peut les réconcilier : sur téléphone le visuel est DANS la carte,
  //  sur grand écran les quatre visuels sont empilés dans une boîte collante
  //  COMMUNE, sœur de la liste. Or un élément `position: sticky` ne peut coller
  //  que dans son parent : mis dans une carte, il se décollerait au bout d'une
  //  hauteur d'écran. Il faut donc bien deux structures.
  //
  //  Le doublon ne coûte RIEN à télécharger, et c'est la condition pour qu'il
  //  soit acceptable :
  //    • les images portent `loading="lazy"`. Un `<img>` différé dont un ancêtre
  //      est en `display: none` n'a pas de boîte, ne s'approche donc jamais du
  //      viewport, et n'est jamais demandé.
  //    • la vidéo passe par AutoVideo, qui ne pose son `src` qu'à l'entrée dans
  //      le viewport (IntersectionObserver). Même raison : pas de boîte, pas
  //      d'intersection, pas de fichier.
  //  Le seul surcoût réel est une poignée de nœuds DOM.
  //
  //  ⚠️ NE PAS remplacer le `display: none` des deux blocs par une bascule en
  //  JavaScript (`matchMedia` + `{#if}`) : la page est prérendue, le HTML livré
  //  choisirait une mise en page au hasard, et l'autre moitié des visiteurs
  //  verrait le bloc se réorganiser après l'hydratation.
  //
  //  ⚠️ AUCUN JAVASCRIPT NE PLACE QUOI QUE CE SOIT.
  //  Ni les cartes du téléphone, ni le visuel collant : tout repose sur
  //  `position: sticky`. Une version pilotée au défilement (transform écrit à
  //  chaque image) tremblait en permanence — le fil principal était toujours une
  //  image en retard sur le compositeur. Le seul JS ici est un
  //  IntersectionObserver qui dit QUEL volet est au milieu de l'écran ; il ne
  //  déplace rien, il ne fait que changer une opacité.
  // ───────────────────────────────────────────────────────────────────────────

  export let cards = [];

  /*  ── Les trois props ajoutées pour les pages projet (2026-10-01) ───────────
   *  Ce composant n'est plus seulement celui de la home : les pages projet
   *  l'emploient tel quel pour leur « notre rôle ». Elles avaient d'abord une
   *  COPIE, qui tremblait sur Safari là où l'original ne tremble pas — on l'a
   *  jetée plutôt que de chercher ce qui différait.
   *
   *  Les trois réglages sont donc là pour ça, et tous trois sont sans effet
   *  tant qu'on ne les passe pas : la home n'en passe aucun.
   *    `title`      un en-tête au-dessus du bloc (la home n'en a pas) ;
   *    `background` la couleur de la section (la home garde le noir du site) ;
   *    et par carte, `fit` / `bg` pour un visuel qu'il ne faut pas rogner — un
   *    logotype très large, par exemple, qui perdrait son nom en `cover`.
   *
   *  Le cadrage par carte vaut pour les deux mises en page : `fit` et
   *  `position` (grand écran), que `mobileFit` et `mobilePosition` remplacent
   *  sur téléphone quand le même point de cadrage ne tient plus — le cadre y
   *  est presque carré, mais pas au même format. */
  export let title = "";
  export let background = "";

  const rank = (i) => String(i + 1).padStart(2, "0");

  let active = 0;
  let itemEls = [];
  let observer;

  onMount(() => {
    if (!browser) return;

    // La bande de décision : les 10 % de hauteur au MILIEU de l'écran. Un volet
    // devient courant quand il la traverse. Prendre le viewport entier ferait
    // basculer deux volets à la fois pendant les raccords ; prendre le seul
    // centre (une ligne) laisserait des trous entre deux volets.
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = itemEls.indexOf(entry.target);
          if (i >= 0) active = i;
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    for (const el of itemEls) if (el) observer.observe(el);
    return () => observer?.disconnect();
  });
</script>

<section
  class="fcards"
  aria-label={title || "Ce que nous faisons"}
  style={background ? `background:${background};` : undefined}
>
  {#if title}
    <header class="fcards__head">
      <h2 class="fcards__head-title" use:reveal>{@html title}</h2>
    </header>
  {/if}

  <!-- ── Grand écran : le visuel collant, puis la liste ────────────────────── -->
  <div class="fcards__desk">
    <div class="fcards__stage">
      {#each cards as card, i}
        <div
          class="fcards__shot"
          class:is-on={i === active}
          style={card.bg ? `background:${card.bg};` : undefined}
        >
          {#if card.video}
            <!-- `active` : la vidéo ne tourne que quand son volet est courant.
                 Les autres restent chargées mais en pause — une opacité nulle
                 n'empêche pas l'intersection, AutoVideo ne peut pas le deviner
                 seul. -->
            <AutoVideo
              sources={card.video}
              mobileSources={card.mobileVideo ?? []}
              poster={card.poster}
              mobilePoster={card.mobilePoster ?? ""}
              label={card.alt}
              active={i === active}
              objectFit="cover"
              objectPosition="var(--fc-media-anchor, center)"
            />
          {:else}
            <img
              class="fcards__img"
              style:object-fit={card.fit ?? "cover"}
              style:object-position={card.position ?? "center"}
              src={card.image}
              alt={card.alt}
              loading="lazy"
              decoding="async"
              draggable="false"
            />
          {/if}
        </div>
      {/each}
    </div>

    <ol class="fcards__list">
      {#each cards as card, i}
        <li
          class="fcards__item"
          class:is-on={i === active}
          bind:this={itemEls[i]}
        >
          <span class="fcards__num">{rank(i)}</span>
          {#if card.title}<h3 class="fcards__title">{card.title}</h3>{/if}
          <p class="fcards__text">{@html card.text}</p>
        </li>
      {/each}
    </ol>
  </div>

  <!-- ── Téléphone : les cartes plein écran qui se recouvrent ──────────────── -->
  <div class="fcards__track">
    {#each cards as card, i}
      <article class="fcards__card">
        <div class="fcards__media" style={card.bg ? `background:${card.bg};` : undefined}>
          {#if card.video}
            <!-- Le cadrage est passé en variable CSS et non en valeur fixe :
                 AutoVideo pose `object-position` en style EN LIGNE, qu'aucune
                 règle d'ici ne pourrait plus battre. En lui donnant un `var()`,
                 c'est la feuille de style qui garde la main. -->
            <AutoVideo
              sources={card.video}
              mobileSources={card.mobileVideo ?? []}
              poster={card.poster}
              mobilePoster={card.mobilePoster ?? ""}
              label={card.alt}
              objectFit="var(--fc-media-fit, contain)"
              objectPosition="var(--fc-media-anchor, center)"
            />
          {:else}
            <!-- Le visuel REMPLIT le cadre (`cover`) : c'est le point de
                 cadrage de chaque carte qui garde le sujet dans le champ. Un
                 visuel qu'il ne faut pas rogner (logotype sur aplat) passe en
                 `contain`, sur le fond `bg` de sa carte. -->
            <img
              class="fcards__img"
              style:object-fit={card.mobileFit ?? card.fit ?? "cover"}
              style:object-position={card.mobilePosition ?? card.position ?? "center"}
              src={card.image}
              alt={card.alt}
              loading="lazy"
              decoding="async"
              draggable="false"
            />
          {/if}
        </div>

        <div class="fcards__body">
          {#if card.icon}
            <span class="fcards__icon" aria-hidden="true">{@html card.icon}</span>
          {:else if card.title}
            <!-- Sans pictogramme, c'est le titre qui ouvre la carte : sur la
                 home le dessin tient ce rôle, sur une page projet il n'y en a
                 pas et la carte serait sans en-tête. -->
            <h3 class="fcards__ctitle">{card.title}</h3>
          {/if}
          <!-- Pas d'arrivée mot à mot ici (retirée le 2026-09-03) : le texte
               est déjà porté par le défilement, qui fait monter chaque carte
               par-dessus la précédente. Deux mouvements sur le même élément se
               gênaient. -->
          <p class="fcards__text">{@html card.text}</p>
        </div>
      </article>
    {/each}
  </div>
</section>

<style>
  .fcards__head {
    padding:
      clamp(6rem, 11vw, 10rem)
      var(--project-side-padding, var(--site-inset))
      clamp(2.5rem, 4.5vw, 4rem);
  }

  .fcards__head-title {
    margin: 0;
    max-width: 18ch;
    padding-inline: var(--project-text-inset, 0);
    font-family: var(--site-font);
    font-weight: var(--site-weight-display);
    font-size: var(--project-display-size, clamp(2.1rem, 3vw, 3.45rem));
    line-height: var(--project-lead-line-height, 1.2);
    letter-spacing: var(--project-lead-tracking, -0.01em);
    text-wrap: balance;
  }

  .fcards__ctitle {
    margin: 0;
    font-family: var(--site-font);
    font-weight: var(--site-weight-display);
    font-size: clamp(1.5rem, 6.5vw, 2rem);
    line-height: 1.04;
    letter-spacing: -0.03em;
    color: #f4efe6;
  }

  @media (max-width: 760px) {
    .fcards__head {
      padding:
        clamp(4.5rem, 15vw, 7rem)
        var(--project-side-padding, var(--site-inset))
        clamp(1.8rem, 6vw, 2.8rem);
    }

    .fcards__head-title {
      /* Le jeton des pages projet descend déjà à 22 px : plus de taille propre
         au téléphone (elle montait à 35 px). */
      max-width: 24ch;
    }
  }

  /*  ── PAS de `overflow-x: clip` ici (retiré le 2026-10-02) ──────────────────
   *  Cette section est l'ancêtre DIRECT des deux éléments collants du bloc (le
   *  cadre du grand écran, les cartes du téléphone). Pour un `overflow-x:
   *  clip`, WebKit fabrique un calque de découpe à part autour du collant :
   *  c'est la cause du bug 247130 (« sticky qui saute de 1 à 2 px dans un
   *  conteneur en overflow-x: clip », corrigé dans Safari 16.2), et le même
   *  montage est encore signalé comme instable sur iOS. Rien ici ne déborde en
   *  largeur, et le `body` coupe déjà tout débordement horizontal du site :
   *  la déclaration ne protégeait de rien. */
  .fcards {
    --fc-radius: 18px;
    width: 100%;
    color: #f4efe6;
    background: var(--bg-deep, #050709);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     GRAND ÉCRAN — visuel collant à gauche, volets qui défilent à droite
     ═══════════════════════════════════════════════════════════════════════ */

  /* Caché par défaut : c'est le bloc du téléphone qui sert en dessous de
     761 px. Les deux blocs ne sont jamais affichés ensemble. */
  .fcards__desk {
    display: none;
  }

  @media (min-width: 761px) {
    .fcards__desk {
      --fc-inset: var(--site-inset);
      display: flex;
      /* `flex-start` et surtout pas `stretch` : un élément étiré à la hauteur de
         son conteneur remplit toute la course, et `position: sticky` n'a plus
         nulle part où coller. */
      align-items: flex-start;
      /* L'écart mesuré sur la référence : le texte y commence aux deux tiers de
         la largeur, soit un peu moins d'un dixième d'écran après le cadre. */
      gap: clamp(2.5rem, 5vw, 7rem);
      padding: var(--fc-inset);
    }

    /* Le cadre du visuel. Il est dimensionné par sa HAUTEUR — une hauteur
       d'écran moins les marges — et son `aspect-ratio` en déduit la largeur.
       C'est le sens qui marche : en grille, la largeur des colonnes se résout
       AVANT la hauteur des rangées, une colonne `auto` ne pourrait donc pas se
       dimensionner sur la hauteur ; en flex la hauteur est connue d'abord.
       Le `max-width` est un garde-fou pour les fenêtres hautes et étroites, où
       le carré pousserait le texte hors de l'écran : le cadre s'y allonge en
       portrait plutôt que de sortir. */
    .fcards__stage {
      position: sticky;
      top: var(--fc-inset);
      /*  Le point d'accroche et la hauteur sont RAMENÉS AU PIXEL ENTIER. Aux
       *  valeurs calculées ils tombent sur des fractions (28,8 px d'accroche,
       *  842,4 px de haut en 1440×900) : la boîte occupe alors des rangées de
       *  pixels à moitié, et le navigateur doit arbitrer cet arrondi à chaque
       *  image. Les navigateurs sans `round()` gardent la ligne du dessus. */
      top: round(var(--fc-inset), 1px);
      /*  AUCUNE couche forcée ici — ni `translateZ(0)`, ni `will-change`, ni
       *  `backface-visibility`. C'était censé stabiliser le rendu du masque
       *  arrondi ; en pratique, sur une boîte `position: sticky`, forcer une
       *  couche la sort du chemin rapide du fil de défilement : Safari défile
       *  de façon asynchrone et la boîte est alors repositionnée avec une
       *  image de retard, ce qui se voit comme une vibration d'un demi-pixel
       *  sur le seul élément censé rester immobile. Le collant nu est posé par
       *  le fil de défilement lui-même, et ne bouge pas. Le masque arrondi
       *  tient très bien avec `overflow: hidden` + `border-radius`. */
      flex: 0 0 auto;
      height: calc(100svh - 2 * var(--fc-inset));
      height: round(calc(100svh - 2 * var(--fc-inset)), 1px);
      aspect-ratio: 1.06 / 1;
      /* 64 % et pas 56 % : le plafond se calcule sur la LARGEUR du conteneur,
         pas sur celle de l'écran. À 56 % il mordait sur un écran 1512x900 —
         le cadre y sortait en portrait (815x842) au lieu du carré voulu. À 64 %
         il ne se déclenche plus que sur les fenêtres franchement hautes et
         étroites, ce pour quoi il est là. */
      max-width: 64%;
      width: auto;
      border-radius: var(--project-media-radius, 22px);
      overflow: hidden;
      /* Fond du cadre pendant le chargement des visuels. */
      background: linear-gradient(
        160deg,
        var(--bg-panel-hi, #1d222a) 0%,
        var(--bg-panel, #161617) 46%,
        var(--bg-deep, #050709) 100%
      );
    }

    /* Les quatre visuels sont empilés au même endroit ; seule l'opacité change.
       Un `{#key}` qui remonterait l'élément relancerait un chargement à chaque
       passage, et le premier aller-retour clignoterait. */
    .fcards__shot {
      position: absolute;
      inset: 0;
      opacity: 0;
      /*  ── ÉTEINT = MASQUÉ, pas seulement transparent (2026-10-02) ──────────
       *  Un calque à opacité nulle à l'intérieur d'un `sticky` déclenche un
       *  défaut de WebKit, corrigé seulement dans Safari 18.2 (bug 280316) :
       *  le défilement et la mise en page ne le jugent pas de la même façon
       *  (« vide » pour l'un, « visible » pour l'autre), et le calque est
       *  REPEINT à chaque mise en page qui survient pendant le défilement.
       *  Trois visuels éteints sur quatre vivaient ainsi en permanence dans le
       *  cadre collant. `visibility: hidden` les met d'accord : le visuel
       *  s'efface en fondu, PUIS est masqué ; il est rendu visible dès qu'il
       *  s'allume, avant son fondu d'entrée. Une image ou une vidéo masquée
       *  garde sa boîte : elle se charge comme avant. */
      visibility: hidden;
      /*  ── La couche va ICI, sur le visuel, et surtout PAS sur le cadre ──────
       *  Sur la boîte `position: sticky` elle-même, une couche forcée est
       *  nuisible : elle la sort du chemin rapide du fil de défilement. Sur le
       *  visuel QUI EST DEDANS, elle est exactement ce qu'il faut — le visuel
       *  est alors rastérisé une fois pour toutes, et le défilement ne fait
       *  plus que le COMPOSER. Sans elle, le navigateur le repeint à chaque
       *  image à un décalage sous-pixel légèrement différent : invisible sur
       *  une photographie, très visible sur un logotype blanc posé sur un
       *  aplat, où les bords francs se mettent à grouiller. C'est ce que les
       *  pages projet affichent (et pas la home, qui n'a que des photos), et
       *  c'est pour ça que le tremblement ne se voyait que là. */
      transform: translateZ(0);
      /* Un fondu long : les volets font trois quarts d'écran, un fondu court se
         lirait comme une coupe au milieu du défilement. */
      transition:
        opacity 620ms cubic-bezier(0.4, 0, 0.2, 1),
        visibility 0s linear 620ms;
    }

    .fcards__shot.is-on {
      opacity: 1;
      visibility: visible;
      transition:
        opacity 620ms cubic-bezier(0.4, 0, 0.2, 1),
        visibility 0s linear 0s;
    }

    /* La vidéo du digital est DÉTOURÉE : au rendu, l'appareil sort déjà par la
       droite et par le bas du plan. Ancrée en haut à gauche, c'est bien ce
       bord-là qui déborde du cadre, et la sortie ne se lit plus comme une coupe
       en plein vide. */
    .fcards__shot :global(video) {
      --fc-media-anchor: left top;
    }

    .fcards__shot .fcards__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* ── Les deux respirations de la liste, et pourquoi elles ne sont pas
       décoratives ────────────────────────────────────────────────────────────
       Un volet devient courant quand son MILIEU traverse le milieu de l'écran.
       Sans marge en haut, le premier volet y arrive 13 svh AVANT que le cadre
       n'ait commencé à coller : on lisait « 01 » alors que le visuel était
       encore à moitié sous la ligne de flottaison. Sans marge en bas, le
       DERNIER volet y arrive après que le cadre s'est décollé, et le visuel
       remontait pendant qu'on lisait. Les deux valeurs sont calculées, pas
       choisies : elles décalent la liste juste assez pour que les quatre volets
       tombent tous dans la course d'épinglage du cadre. */
    .fcards__list {
      flex: 1 1 auto;
      min-width: 0;
      margin: 0;
      padding: 15svh 0 22svh;
      list-style: none;
    }

    /* Chaque volet fait TROIS QUARTS d'écran, et pas un écran entier : c'est ce
       qui laisse le volet suivant dépasser en bas, en demi-teinte. À 100 svh il
       n'y aurait jamais qu'un volet visible, et le bloc perdrait la lecture
       d'ensemble qu'on voit dans la référence. */
    .fcards__item {
      min-height: 74svh;
      display: flex;
      flex-direction: column;
      /* Le texte est calé EN HAUT de son créneau, pas au milieu. C'est ce qui
         fait apparaître le volet suivant en bas de l'écran : le créneau courant
         est traversé en son milieu, son texte se retrouve donc à 13 svh du haut,
         et celui d'après, calé au haut du créneau suivant, tombe à 87 svh —
         juste au-dessus de la ligne de flottaison. Centrés, les deux textes
         seraient à 50 svh et 124 svh : on ne verrait jamais que le courant. */
      justify-content: flex-start;
      gap: clamp(0.9rem, 1.4vw, 1.5rem);
      padding: 0 clamp(1rem, 3vw, 4rem) 0 0;
      /* Les volets qui ne sont pas courants reculent, sans disparaître. */
      opacity: 0.26;
      transition: opacity 520ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .fcards__item.is-on {
      opacity: 1;
    }

    .fcards__num {
      display: block;
      font-family: var(--site-font);
      font-size: clamp(0.82rem, 0.92vw, 1rem);
      font-weight: 500;
      letter-spacing: 0.04em;
      font-variant-numeric: tabular-nums;
      color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.42);
    }

    .fcards__title {
      margin: 0;
      font-family: var(--site-font);
      font-weight: var(--site-weight-display, 500);
      font-size: clamp(1.9rem, 3.4vw, 3.4rem);
      line-height: 1.05;
      letter-spacing: var(--site-display-letter-spacing, -0.028em);
      color: #f4efe6;
      text-wrap: balance;
    }

    .fcards__item .fcards__text {
      max-width: 34ch;
      font-size: clamp(1.02rem, 1.15vw, 1.24rem);
      color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.62);
    }

    /* Le bloc du téléphone n'existe pas ici. */
    .fcards__track {
      display: none;
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     TÉLÉPHONE — les cartes plein écran qui se recouvrent (inchangé)
     ═══════════════════════════════════════════════════════════════════════ */
  @media (max-width: 760px) {
    .fcards {
      /* Plein écran : aucune marge sur les côtés. En bas, juste de quoi laisser
         voir l'arrondi de la DERNIÈRE carte — sans ce filet, ses coins tombent
         pile sur la fin de la section et l'arrondi ne se voit pas. */
      padding: 0 0 var(--site-inset);
    }
  }

  .fcards__card {
    /* Toutes au MÊME `top` : chacune recouvre complètement la précédente. */
    position: sticky;
    top: 0;
    /* Même stabilité de rendu pour l'entrée et la sortie des cartes mobiles. */
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    /* Tout est en `svh` et jamais en `vh` : sur iOS, `vh` se mesure sur l'écran
       SANS la barre d'outils, donc la carte dépassait par le bas tant qu'elle
       était affichée — son bas devenait invisible. `svh` prend le plus petit
       écran possible, ce qui tient dans tous les cas. */
    height: 100svh;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    /* Le visuel prend ce qui reste, la phrase se dimensionne sur son texte. */
    grid-template-rows: minmax(0, 1fr) auto;
    align-items: stretch;
    border-radius: var(--fc-radius);
    overflow: hidden;
    /* Du clair au foncé : le visuel occupe le clair, le texte se pose dans le
       foncé. */
    background: linear-gradient(
      to bottom,
      var(--bg-panel-hi, #1d222a) 0%,
      var(--bg-panel, #161617) 30%,
      var(--bg-raised, #0a0e12) 62%,
      var(--bg-deep, #000) 100%
    );
    /* L'ombre est portée vers le HAUT : la carte qui arrive monte par-dessus la
       précédente, c'est donc son arête SUPÉRIEURE qui doit se détacher. */
    box-shadow:
      0 -1px 0 rgba(255, 255, 255, 0.08),
      0 -6px 18px rgba(var(--shade-rgb, 0, 0, 0), 0.55),
      0 -22px 48px rgba(var(--shade-rgb, 0, 0, 0), 0.45),
      0 -48px 90px rgba(var(--shade-rgb, 0, 0, 0), 0.32);
  }

  /*  ── Le visuel à FRANC-BORD (2026-10-02) ──────────────────────────────────
   *  Il prend toute la largeur de la carte et part de son bord haut : plus
   *  aucune marge au-dessus ni sur les côtés, c'est l'arrondi de la carte qui
   *  le découpe. Il REMPLIT son cadre (`cover`, point de cadrage réglé carte par
   *  carte) et s'arrête net au-dessus du texte, à une distance fixe : le visuel
   *  est rogné par le bas plutôt que de venir toucher la phrase. Le cadre prend
   *  toute la hauteur que le texte laisse libre — une phrase plus longue rogne
   *  donc un peu plus le visuel, jamais l'inverse.
   *  Avant : un retrait de 1 rem sur les côtés et d'environ 3,5 vh au-dessus,
   *  et les formats paysage en `contain`, qui flottaient au milieu d'un vide
   *  deux fois plus grand que ce retrait. */
  .fcards__media {
    /* Le cadrage de la VIDÉO. En variables parce qu'AutoVideo écrit son
       `object-fit` et son `object-position` en style EN LIGNE — seul un `var()`
       laisse la feuille de style décider. Les plans sont des captures d'écran
       de téléphone : ils remplissent le cadre, calés en haut. */
    --fc-media-fit: cover;
    --fc-media-anchor: center top;
    grid-column: 1;
    grid-row: 1;
    position: relative;
    min-width: 0;
  }

  /* Le cadrage des images est posé en ligne, carte par carte (voir le
     balisage) : ici, seulement la boîte. */
  .fcards__img {
    display: block;
    width: 100%;
    height: 100%;
  }

  .fcards__body {
    /* Rangée explicite : sans elle, le placement automatique renvoie ce bloc à
       une DEUXIÈME colonne dès que le visuel n'occupe plus la première, et la
       carte se coupe en deux. */
    grid-column: 1;
    grid-row: 2;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: clamp(1rem, 3svh, 1.6rem);
    /* En haut, la respiration entre le bas du visuel et le texte. En bas,
       beaucoup d'air, et c'est voulu : les cartes montent pendant qu'on les
       lit — un texte calé trop bas arriverait tard dans le champ, et
       sortirait par le haut avant d'être lu. */
    padding: clamp(1.6rem, 5svh, 2.6rem) 1.5rem clamp(4.5rem, 15svh, 8rem);
  }

  .fcards__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.9rem;
    height: 1.9rem;
    color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.72);
  }

  .fcards__icon :global(svg) {
    width: 100%;
    height: 100%;
    display: block;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .fcards__text {
    margin: 0;
    font-family: var(--site-font);
    font-size: 1.12rem;
    font-weight: var(--site-weight);
    line-height: 1.45;
    letter-spacing: -0.012em;
    color: #f4efe6;
    text-wrap: pretty;
  }

  .fcards__text :global(.dim) {
    color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.5);
  }

  /* ── Téléphone en paysage ───────────────────────────────────────────────────
     L'écran est large (la mise en page de grand écran s'y applique) mais très
     bas : seuls les espacements et l'échelle du texte sont resserrés, le visuel
     collant reste. */
  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .fcards__desk {
      gap: 1.4rem;
    }

    .fcards__item {
      /* Une hauteur d'écran entière ici : à 74 svh sur un écran de 390 px de
         haut, deux volets tiendraient dans le champ et on ne saurait plus lequel
         est courant. */
      min-height: 100svh;
      gap: 0.5rem;
      padding-right: 1.4rem;
    }

    .fcards__title {
      font-size: 1.5rem;
    }

    .fcards__item .fcards__text {
      max-width: 32ch;
      font-size: 0.98rem;
    }
  }

  /* ── Mouvement réduit ───────────────────────────────────────────────────────
     Le visuel collant ne pose pas de problème (c'est le navigateur qui le
     tient), mais les fondus et l'empilement des cartes du téléphone, si. */
  @media (prefers-reduced-motion: reduce) {
    .fcards__shot,
    .fcards__shot.is-on,
    .fcards__item {
      transition: none;
    }

    .fcards__card {
      position: relative;
      top: 0;
    }

    .fcards__card + .fcards__card {
      margin-top: clamp(0.55rem, 0.8vw, 0.85rem);
    }
  }
</style>
