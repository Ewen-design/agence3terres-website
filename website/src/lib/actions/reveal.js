import { browser } from "$app/environment";

/**
 * Arrivée de texte du site — la même que le paragraphe d'ouverture de la home
 * (« Nous sommes 3 Terres… ») : le texte est découpé en mots, et chaque mot se
 * dépose l'un après l'autre en sortant du flou, en traversant le violet profond
 * puis l'indigo de la charte avant de rejoindre sa couleur définitive.
 *
 *   <h2 use:reveal>Titre</h2>
 *   <p use:reveal={{ delay: 80 }}>Texte</p>
 *
 * Le découpage en mots est automatique : il ne s'applique qu'aux éléments dont
 * le contenu est du texte (ou du texte enrichi de balises en ligne — un `.hl`
 * par exemple). `use:reveal` posé sur une `<figure>` qui contient une image ou
 * une vidéo garde donc l'arrivée en bloc, ce qui est le comportement voulu : on
 * ne découpe pas un média en mots.
 *
 * Forcer l'un ou l'autre : `use:reveal={{ words: true }}` / `{ words: false }`.
 * Garder la couche après l'arrivée : `{ keepLayer: true }` (voir plus bas).
 *
 * SSR-safe (no-op côté serveur), joue une seule fois à l'entrée dans le
 * viewport, et se désactive sous `prefers-reduced-motion`.
 */

const REVEAL_CLASS = "is-revealed";
const WORD_STAGGER = 38; // ms entre deux mots — cadence du paragraphe de la home

// Balises qu'on traverse pour aller chercher le texte. Tout le reste (img,
// video, div, figure…) fait basculer l'élément en arrivée par bloc.
const INLINE_TAGS = new Set([
  "SPAN", "EM", "STRONG", "B", "I", "A", "SMALL", "MARK", "U", "SUP", "SUB", "BR", "WBR"
]);

let observer = null;
let railObserver = null;
/** rail (ou carrousel) → éléments qu'il porte hors champ sur le côté */
const rails = new Map();
const railChecked = new WeakSet();

/*  Les mots partent un par un, au rythme de la cascade (voir `app.css`,
 *  `.reveal-word.is-on`) : un mot reçoit sa classe — donc son animation et
 *  son calque — à SON heure, au lieu que tous les reçoivent dans la même
 *  image avec un délai. */
function lancerMots(node) {
  const mots = node.querySelectorAll(".reveal-word");
  if (!mots.length) return;
  const delai = parseFloat(node.style.getPropertyValue("--reveal-delay")) || 0;
  const depart = performance.now() + delai;
  let i = 0;
  const pas = (t) => {
    while (i < mots.length && t >= depart + i * WORD_STAGGER) mots[i++].classList.add("is-on");
    if (i < mots.length) requestAnimationFrame(pas);
  };
  requestAnimationFrame(pas);
}

function revealNode(node) {
  if (node.classList.contains(REVEAL_CLASS)) return;
  node.classList.add(REVEAL_CLASS);
  observer?.unobserve(node);
  if (node.dataset.revealWords) lancerMots(node);

  // Le délai couvre la cascade complète : durée de l'animation + décalage
  // du dernier mot.
  const words = Number(node.dataset.revealWords) || 0;
  window.setTimeout(() => {
    // Libère la couche GPU. La garder sur tous les éléments révélés (des
    // dizaines par page) promeut des couches en permanence et alourdit la
    // composition sur mobile. Sauf demande contraire (`keepLayer`) : voir
    // plus bas.
    if (node.dataset.revealKeepLayer === undefined) node.style.willChange = "auto";
    // Et libère les animations des mots, finies depuis longtemps. Rien ne
    // change à l'écran : elles se remplissent vers l'arrière seulement
    // (`backwards`, voir `app.css`), chaque mot a déjà rendu la main à ses
    // valeurs normales — sa couleur héritée comprise, qui suit donc les
    // changements de thème des pages projet.
    if (words) node.classList.add("reveal--settled");
  }, 1300 + words * WORD_STAGGER);
}

/*  ── Les éléments hors champ SUR LE CÔTÉ (2026-11-18) ──────────────────────
 *  Une carte rangée à droite d'un rail horizontal (pôles, carrousels) ou un
 *  visage latéral d'un carrousel 3D ne croise jamais la fenêtre tant qu'on ne
 *  l'y amène pas : son arrivée ne se déclenchait pas, et la carte glissait
 *  dans le cadre VIDE, l'image n'apparaissant qu'après (constaté par la
 *  batterie de stabilité sur /services/* et /apropos). Elle se joue
 *  maintenant quand son rail entre dans la fenêtre, avec ses voisines. Le
 *  rail est le premier ancêtre qui, lui, est dans le cadre en largeur. */
function railOf(node, entry) {
  const b = entry.boundingClientRect;
  const vw = entry.rootBounds?.width || window.innerWidth;
  if (!b.width) return null;
  const part = (Math.min(b.right, vw) - Math.max(b.left, 0)) / b.width;
  if (part >= 0.5) return null;
  for (let el = node.parentElement, d = 0; el && el !== document.body && d < 12; el = el.parentElement, d++) {
    const r = el.getBoundingClientRect();
    if (!r.width) continue;
    if ((Math.min(r.right, vw) - Math.max(r.left, 0)) / Math.min(r.width, vw) >= 0.5) return el;
  }
  return null;
}

function ensureRailObserver() {
  if (railObserver) return railObserver;
  railObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const set = rails.get(entry.target);
        rails.delete(entry.target);
        railObserver.unobserve(entry.target);
        set?.forEach((n) => n.isConnected && revealNode(n));
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0 }
  );
  return railObserver;
}

function ensureObserver() {
  if (observer || !browser) return observer;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const node = entry.target;
        if (entry.isIntersecting) {
          revealNode(node);
          continue;
        }
        if (railChecked.has(node)) continue;
        railChecked.add(node);
        const rail = railOf(node, entry);
        if (!rail) continue;
        let set = rails.get(rail);
        if (!set) {
          set = new Set();
          rails.set(rail, set);
          ensureRailObserver().observe(rail);
        }
        set.add(node);
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
  );

  return observer;
}

/** Le contenu est-il du texte (éventuellement enrichi de balises en ligne) ? */
function isTextContent(node) {
  if (!node.textContent.trim()) return false;
  for (const child of node.childNodes) {
    if (child.nodeType === 1 && !INLINE_TAGS.has(child.tagName)) return false;
  }
  return true;
}

/**
 * Emballe chaque mot dans un `<span class="reveal-word">` porteur de son index.
 * Les balises en ligne sont traversées, pas remplacées : un `.hl` garde donc sa
 * couleur, et ses mots la reprennent.
 *
 * Retourne le nombre de mots.
 */
function splitIntoWords(root) {
  let index = 0;

  const walk = (parent) => {
    const children = Array.from(parent.childNodes);
    if (!children.length) return;

    for (const child of children) {
      if (child.nodeType === 3) {
        const text = child.nodeValue;
        if (!text.trim()) continue;

        const fragment = document.createDocumentFragment();
        // Coupé aux espaces ordinaires SEULEMENT : une espace insécable (ou
        // fine insécable) reste DANS le mot. Séparés en deux boîtes `inline-
        // block`, « « » et « Ludosphères » pouvaient tomber sur deux lignes
        // malgré l'insécable entre eux (vu dans Chrome, 2026-10-09).
        for (const part of text.split(/([^\S\u00a0\u202f]+)/)) {
          if (!part) continue;
          if (!part.trim()) {
            fragment.appendChild(document.createTextNode(part));
            continue;
          }
          const word = document.createElement("span");
          word.className = "reveal-word";
          word.style.setProperty("--i", String(index++));
          word.textContent = part;
          fragment.appendChild(word);
        }
        parent.replaceChild(fragment, child);
      } else if (child.nodeType === 1 && child.tagName !== "BR" && child.tagName !== "WBR") {
        walk(child);
      }
    }
  };

  walk(root);
  return index;
}

/**
 * Variante en bloc : le texte arrive d'un seul tenant (flou → net, légère
 * montée), sans découpage en mots.
 *
 * Utilisée par les composants des pages projet, qui gardent volontairement
 * l'arrivée d'origine : leurs pages enchaînent beaucoup de blocs éditoriaux
 * courts, et la cascade mot à mot y devient bavarde. S'importe en lieu et place
 * de `reveal`, ce qui bascule tout le fichier d'un coup :
 *
 *   import { revealBlock as reveal } from "$lib/actions/reveal.js";
 */
export function revealBlock(node, options = {}) {
  return reveal(node, { ...options, words: false });
}

export function reveal(node, options = {}) {
  if (!browser) return {};

  node.classList.add("reveal");

  if (options.delay) {
    node.style.setProperty("--reveal-delay", `${options.delay}ms`);
  }

  const prefersReduced =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  if (prefersReduced) {
    node.classList.add(REVEAL_CLASS);
    return {};
  }

  // `keepLayer` : l'élément GARDE sa couche après l'arrivée. Pour un très grand
  // texte seul à l'écran : quand Safari retire la couche d'un texte, il le
  // redessine dans celle du dessous, recalé au pixel — un léger glissement,
  // une fois le texte posé, qu'on lit comme un texte qui « se replace ».
  if (options.keepLayer) node.dataset.revealKeepLayer = "";

  const wantsWords = options.words ?? isTextContent(node);
  if (wantsWords) {
    const count = splitIntoWords(node);
    if (count) {
      node.dataset.revealWords = String(count);
      node.classList.add("reveal--words");
    }
  }

  // Dans un GROUPE (`data-reveal-groupe` sur un ancêtre) : l'arrivée se joue
  // quand le groupe entre dans la fenêtre, pour tous ses éléments ensemble.
  // Pour un carrousel 3D (/apropos, citations) : l'observateur jugeait mal un
  // visage tourné dans l'espace, et une citation pouvait rester invisible une
  // fois ramenée de face (WebKit, format portable — 2026-11-18).
  const groupe = node.parentElement?.closest("[data-reveal-groupe]");
  if (groupe) {
    let set = rails.get(groupe);
    if (!set) {
      set = new Set();
      rails.set(groupe, set);
      ensureRailObserver().observe(groupe);
    }
    set.add(node);
    return {
      update(next = {}) {
        if (next.delay) node.style.setProperty("--reveal-delay", `${next.delay}ms`);
      },
      destroy() {
        const s = rails.get(groupe);
        if (!s) return;
        s.delete(node);
        if (!s.size) {
          rails.delete(groupe);
          railObserver?.unobserve(groupe);
        }
      }
    };
  }

  const obs = ensureObserver();
  obs?.observe(node);

  return {
    update(next = {}) {
      if (next.delay) node.style.setProperty("--reveal-delay", `${next.delay}ms`);
    },
    destroy() {
      obs?.unobserve(node);
      for (const [rail, set] of rails) {
        if (!set.delete(node) || set.size) continue;
        rails.delete(rail);
        railObserver?.unobserve(rail);
      }
    }
  };
}
