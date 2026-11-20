/*  ── Chargement anticipé des images différées ─────────────────────────────
 *
 *  Pourquoi ce fichier existe (2026-10-20, plainte « images qui arrivent en
 *  retard / à blanc », sur iPhone ET sur le Mac du client, tous deux Safari).
 *
 *  `loading="lazy"` laisse le NAVIGATEUR décider quand partir chercher l'image.
 *  Chromium part très tôt (1 250 à 2 500 px avant l'écran selon le réseau).
 *  Safari part tard, à peine avant l'écran : sur un réseau moyen, l'image n'est
 *  pas arrivée quand elle entre dans le cadre et on voit le fond. Mesuré au
 *  Playwright, réseau bridé à 400 Ko/s : WebKit a des images vides sur 17 pas
 *  de défilement sur 72 (home) et 35 sur 95 (Harmonia), Chromium sur 0 à 8.
 *
 *  Deuxième trou, pour TOUS les navigateurs : une image différée posée dans un
 *  rail horizontal (cartes des pôles, sliders) est rognée par le rail tant
 *  qu'on n'a pas glissé jusqu'à elle. Aucune marge ne la rattrape : elle ne
 *  part qu'une fois à l'écran, donc toujours en retard.
 *
 *  Ce module garde `loading="lazy"` dans le HTML (le navigateur ne charge pas
 *  tout d'un coup) mais bascule chaque image en `eager` dès qu'elle arrive à
 *  AHEAD écrans sous le bas de la fenêtre. Une image dans un rail rogné est
 *  suivie à travers son rail : elle part quand le rail approche, comme ses
 *  voisines.
 *
 *  Ce qu'il ne fait PAS :
 *   - une image dont un ancêtre est en `display: none` n'a pas de boîte, donc
 *     pas d'intersection : elle n'est jamais demandée (c'est voulu, voir
 *     `home/HomeFeatureCards.svelte`). Si le bloc s'affiche plus tard,
 *     l'observateur la voit à ce moment-là.
 *   - aucune lecture de mise en page pendant le défilement : tout passe par un
 *     IntersectionObserver (calculé par le navigateur au rendu). Les seules
 *     lectures (`getComputedStyle`, `getBoundingClientRect`, pour savoir si
 *     un rail la cache) ont lieu une fois par image, à son arrivée dans le DOM.
 *   - rien si l'utilisateur a demandé l'économie de données (`saveData`).
 * ─────────────────────────────────────────────────────────────────────────── */

/** Écrans d'avance sous la fenêtre (et derrière, pour un retour en arrière). */
const AHEAD = 2.5;
const BEHIND = 1;

let installed = false;

/*  ── La bonne variante (2026-11-18) ──────────────────────────────────────
 *  Le build pose sur chaque image ses variantes (`srcset`) et une valeur
 *  d'attente `sizes="100vw"` (voir `$lib/images/preprocess.js`). Pour une
 *  image différée, on connaît sa boîte avant qu'elle parte : `sizes` reçoit
 *  la largeur réelle, et le navigateur choisit la variante juste — une carte
 *  de 400 px ne télécharge plus (ni ne décode) une image de 2 880 px.
 *  En `object-fit: cover`, l'image peut déborder de sa boîte en largeur :
 *  on prend alors la largeur qu'elle occupe vraiment (hauteur × format).
 *  Pas de garde sur `currentSrc` (retirée le 2026-11-18) : WebKit le remplit
 *  dès l'analyse de la page, même pour une image différée qu'il n'a pas encore
 *  demandée — sur Safari, l'ajustement ne s'appliquait donc presque jamais, et
 *  une vignette de 365 px recevait une image de 1 440 (plus lourde à décoder
 *  et à envoyer à la carte graphique : des images sautées au défilement). Le
 *  module n'est appelé que pour une image pas encore chargée. */
function ajusterSizes(img) {
  if (!img.hasAttribute("data-rsizes")) return;
  const largeur = img.offsetWidth;
  const hauteur = img.offsetHeight;
  if (!largeur) return;
  let besoin = largeur;
  const w = +img.getAttribute("width");
  const h = +img.getAttribute("height");
  if (w && h && hauteur && getComputedStyle(img).objectFit === "cover") {
    besoin = Math.max(largeur, hauteur * (w / h));
  }
  const valeur = `${Math.ceil(besoin)}px`;
  img.sizes = valeur;
  const picture = img.parentElement?.tagName === "PICTURE" ? img.parentElement : null;
  picture?.querySelectorAll("source[data-rsizes]").forEach((s) => (s.sizes = valeur));
}

/*  ── L'arrivée d'une image (2026-11-18) ──────────────────────────────────
 *  Plainte récurrente : « l'arrivée des images qui bug ». Une image différée
 *  qui finit d'arriver à l'écran se peignait par bandes, ou d'un coup sec, et
 *  Safari la DÉCODAIT au moment de la peindre, sur le fil principal (à-coup
 *  du défilement). Désormais elle reste transparente tant qu'elle n'est pas
 *  chargée ET décodée (`decode()`, hors du fil principal), puis arrive en
 *  fondu (`app.css`, `img[data-arrivee]`). Chargée en avance, ce fondu se
 *  joue hors champ : on ne le voit que sur un réseau lent — et c'est alors
 *  un fondu propre au lieu d'une image qui se dessine.
 *  `data-no-arrivee` sur l'image ou un ancêtre : le composant gère lui-même
 *  son apparition. */
/*  Le fondu ne se joue QUE pour une image qui arrive sous les yeux
 *  (2026-11-18, « scroll moins fluide sur Safari bureau ») : une animation
 *  d'opacité fait créer puis détruire un calque à WebKit, même hors champ, et
 *  ces créations en série pendant le défilement se payaient. Une image arrivée
 *  hors champ — le cas courant, elles partent 2,5 écrans en avance — apparaît
 *  simplement, sans animation : personne ne la regardait. */
const sousLesYeux = new WeakSet();
let regard = null;
const regardees = new Set();
function oublierRegard(img) {
  regard?.unobserve(img);
  regardees.delete(img);
}
function observerRegard(img) {
  regardees.add(img);
  if (!regard) {
    regard = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) sousLesYeux.add(e.target);
        else sousLesYeux.delete(e.target);
      }
    });
  }
  regard.observe(img);
}

function preparerArrivee(img) {
  if (img.closest("[data-no-arrivee]")) return;
  img.dataset.arrivee = "attente";
  observerRegard(img);
  const fini = () => {
    img.removeEventListener("load", charge);
    img.removeEventListener("error", fini);
    oublierRegard(img);
    if (sousLesYeux.has(img)) img.dataset.arrivee = "ok";
    else delete img.dataset.arrivee;
  };
  // Filet (2026-11-19) : l'image reste TRANSPARENTE tant que `decode()` n'a pas
  // répondu, et Safari peut laisser cette promesse en suspens (grande image,
  // mémoire tendue, image retirée puis remise dans la page) — elle restait
  // alors vide pour toujours. Passé ce délai, elle s'affiche quand même :
  // décodée au moment de la peindre, comme avant ce module.
  let filet = 0;
  const finiUneFois = () => {
    if (!filet) return;
    clearTimeout(filet);
    filet = 0;
    fini();
  };
  const charge = () => {
    if (filet) return;
    filet = setTimeout(finiUneFois, 1200);
    if (typeof img.decode === "function") img.decode().then(finiUneFois, finiUneFois);
    else finiUneFois();
  };
  img.addEventListener("load", charge);
  img.addEventListener("error", fini);
  // Arrivée entre le test `complete` et la pose des écouteurs.
  if (img.complete && img.naturalWidth > 0) charge();
}

export function installLazyAhead() {
  if (installed || typeof window === "undefined") return;
  if (!("IntersectionObserver" in window)) return;
  if (navigator.connection?.saveData) return;
  installed = true;

  const seen = new WeakSet();
  /** cible observée → images qu'elle porte (l'image elle-même, ou son rail) */
  const groups = new Map();

  /*  Une file d'attente (4 images d'avance à la fois, priorité basse) a été
   *  essayée le 2026-11-19 puis RETIRÉE : aucun gain mesuré (Chromium charge
   *  lui-même ses images différées très tôt ; WebKit à 2,4 Mb/s ne montrait
   *  pas de trou), et en freinant le préchargement elle faisait arriver plus
   *  d'images SOUS LES YEUX pendant le défilement — chacune avec son fondu,
   *  c'est-à-dire un calque créé puis détruit par WebKit en plein défilement
   *  (Safari bureau, voir plus bas `regard`). Le vrai voleur de débit était
   *  ailleurs : les affiches des vidéos (voir AutoVideo). */
  const load = (img) => {
    if (img.getAttribute("loading") === "lazy") img.setAttribute("loading", "eager");
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const imgs = groups.get(entry.target);
        groups.delete(entry.target);
        io.unobserve(entry.target);
        imgs?.forEach(load);
      }
    },
    { rootMargin: `${BEHIND * 100}% 0px ${AHEAD * 100}% 0px` }
  );

  /*  Le rail qui rogne l'image horizontalement, s'il y en a un : premier
   *  ancêtre qui coupe en x ET hors duquel l'image tombe entièrement (carte
   *  rangée à droite d'un rail). Un cadre qui ne fait que rogner les bords
   *  d'une image agrandie (parallaxe) ne compte pas. Les très grands
   *  conteneurs (la page entière) sont ignorés : les suivre ferait tout partir
   *  dès l'ouverture. */
  const clipTarget = (img) => {
    const r = img.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return img;
    const maxH = window.innerHeight * 2;
    let el = img.parentElement;
    for (let depth = 0; el && el !== document.body && depth < 12; depth++, el = el.parentElement) {
      if (getComputedStyle(el).overflowX === "visible") continue;
      const b = el.getBoundingClientRect();
      const dehors = r.right <= b.left + 1 || r.left >= b.right - 1;
      if (dehors && b.height < maxH) return el;
    }
    return img;
  };

  /*  ── Le chargement AU CALME (2026-11-20, bureau) ──────────────────────────
   *  Plainte qui revenait (films d'écran du client, Safari bureau) : des
   *  à-coups « au premier passage, avec le chargement », toujours aux mêmes
   *  blocs, et plus rien au second. Au premier passage, chaque image se
   *  télécharge, se décode et part à la carte graphique PENDANT qu'on défile.
   *  Les sites de référence (estrela.studio) font l'inverse : tout est chargé
   *  avant le premier geste.
   *  Ici, dès la page chargée — l'intro est encore à l'écran, rien ne défile —
   *  les images différées partent DANS L'ORDRE DE LA PAGE, deux à la fois,
   *  chacune attendue jusqu'à son décodage. Dès que la page défile, la file
   *  s'arrête (les images en route finissent) et ne reprend que la page
   *  immobile depuis 300 ms : le travail se fait pendant qu'on lit, pas
   *  pendant qu'on glisse. L'avance de 2,5 écrans ci-dessus reste le filet de
   *  qui descend sans s'arrêter. Pas sur écran tactile (jugé parfait ; et la
   *  mémoire d'un téléphone ne garderait pas toutes ces images décodées). */
  const file = [];
  let dernierDefilement = 0;
  let enRoute = 0;
  let fileMinuterie = 0;
  const auCalme = () => performance.now() - dernierDefilement > 300;
  const prete = (img) =>
    img.complete && img.naturalWidth > 0
      ? (img.decode?.() ?? Promise.resolve()).catch(() => {})
      : new Promise((ok) => {
          const fin = () => ok();
          img.addEventListener("load", () => (img.decode?.() ?? Promise.resolve()).then(fin, fin), { once: true });
          img.addEventListener("error", fin, { once: true });
          setTimeout(fin, 2500);
        });
  const avancerFile = () => {
    clearTimeout(fileMinuterie);
    fileMinuterie = 0;
    if (!fileActive) return;
    if (!auCalme()) {
      fileMinuterie = window.setTimeout(avancerFile, 320);
      return;
    }
    while (enRoute < 2 && file.length) {
      const img = file.shift();
      if (!img.isConnected || img.getAttribute("loading") !== "lazy") continue;
      // Sans boîte (`display: none`, autre mise en page) : jamais demandée.
      if (!img.getClientRects().length) continue;
      if (!img.getAttribute("src") && !img.getAttribute("srcset")) continue;
      enRoute++;
      load(img);
      prete(img).then(() => {
        enRoute--;
        avancerFile();
      });
    }
  };
  let fileActive = false;
  const bureau = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (bureau) {
    window.addEventListener("scroll", () => (dernierDefilement = performance.now()), { passive: true, capture: true });
    const demarrer = () => {
      fileActive = true;
      avancerFile();
    };
    if (document.readyState === "complete") window.setTimeout(demarrer, 200);
    else window.addEventListener("load", () => window.setTimeout(demarrer, 200), { once: true });
  }

  const register = (img) => {
    if (seen.has(img)) return;
    seen.add(img);
    if (img.complete && img.naturalWidth > 0) return;
    if (bureau) {
      file.push(img);
      if (fileActive && !fileMinuterie && enRoute < 2) window.setTimeout(avancerFile, 0);
    }
    preparerArrivee(img);
    const target = clipTarget(img);
    ajusterSizes(img);
    let set = groups.get(target);
    if (!set) {
      set = new Set();
      groups.set(target, set);
      io.observe(target);
    }
    set.add(img);
  };

  const scan = () => {
    // Les cibles d'une page quittée ne croiseront plus jamais la fenêtre.
    for (const img of regardees) if (!img.isConnected) oublierRegard(img);
    for (const target of groups.keys()) {
      if (!target.isConnected) {
        io.unobserve(target);
        groups.delete(target);
      }
    }
    document.querySelectorAll('img[loading="lazy"]').forEach(register);
  };

  // Navigation interne : les nouvelles pages arrivent par le routeur.
  let pending = 0;
  const schedule = () => {
    if (pending) return;
    pending = window.setTimeout(() => {
      pending = 0;
      scan();
    }, 120);
  };
  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  scan();
}
