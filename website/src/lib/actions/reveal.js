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

/** node → éléments qui contiennent directement des mots (voir `paintFinalColor`). */
const wordHosts = new WeakMap();

let observer = null;

/**
 * Fige la couleur d'arrivée de chaque groupe de mots.
 *
 * Elle est passée en `--reveal-final` plutôt que laissée à `inherit` dans les
 * keyframes : `inherit` n'y est pas fiable, et chaque mot doit rejoindre la
 * couleur de SON hôte — un `.hl` en pleine encre au milieu d'un paragraphe gris
 * n'atterrit pas au même endroit. La propriété étant héritée, une écriture par
 * hôte suffit : inutile de toucher les mots un par un.
 *
 * Lecture faite à l'apparition et non au montage : au montage il faudrait lire
 * le style calculé de tous les textes de la page d'un coup, juste après les
 * avoir modifiés — donc autant de recalculs de style forcés. Ici le coût est
 * étalé sur le défilement, et la couleur lue est celle du thème courant (les
 * pages projet en changent au scroll).
 */
function paintFinalColor(node) {
  const hosts = wordHosts.get(node);
  if (!hosts) return;
  for (const host of hosts) {
    host.style.setProperty("--reveal-final", window.getComputedStyle(host).color);
  }
}

function ensureObserver() {
  if (observer || !browser) return observer;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const node = entry.target;
        paintFinalColor(node);
        node.classList.add(REVEAL_CLASS);
        observer.unobserve(node);

        // Le délai couvre la cascade complète : durée de l'animation + décalage
        // du dernier mot.
        const words = Number(node.dataset.revealWords) || 0;
        window.setTimeout(() => {
          // Libère la couche GPU. La garder sur tous les éléments révélés (des
          // dizaines par page) promeut des couches en permanence et alourdit la
          // composition sur mobile.
          node.style.willChange = "auto";
          // Et retire l'animation des mots : `both` fige la dernière image, donc
          // la couleur d'arrivée. Or les pages projet changent de thème au
          // scroll — un texte figé y resterait à l'ancienne couleur.
          if (words) node.classList.add("reveal--settled");
        }, 1300 + words * WORD_STAGGER);
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
 * Retourne le nombre de mots, et enregistre les hôtes pour `paintFinalColor`.
 */
function splitIntoWords(root) {
  let index = 0;
  const hosts = [];

  const walk = (parent) => {
    const children = Array.from(parent.childNodes);
    if (!children.length) return;

    let hosted = false;

    for (const child of children) {
      if (child.nodeType === 3) {
        const text = child.nodeValue;
        if (!text.trim()) continue;

        const fragment = document.createDocumentFragment();
        for (const part of text.split(/(\s+)/)) {
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
          hosted = true;
        }
        parent.replaceChild(fragment, child);
      } else if (child.nodeType === 1 && child.tagName !== "BR" && child.tagName !== "WBR") {
        walk(child);
      }
    }

    if (hosted) hosts.push(parent);
  };

  walk(root);
  if (index) wordHosts.set(root, hosts);
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

  const wantsWords = options.words ?? isTextContent(node);
  if (wantsWords) {
    const count = splitIntoWords(node);
    if (count) {
      node.dataset.revealWords = String(count);
      node.classList.add("reveal--words");
    }
  }

  const obs = ensureObserver();
  obs?.observe(node);

  return {
    update(next = {}) {
      if (next.delay) node.style.setProperty("--reveal-delay", `${next.delay}ms`);
    },
    destroy() {
      obs?.unobserve(node);
      wordHosts.delete(node);
    }
  };
}
