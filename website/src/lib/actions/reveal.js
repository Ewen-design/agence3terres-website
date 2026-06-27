import { browser } from "$app/environment";

/**
 * Focus-pull text reveal — the same "arrival" effect used by the site's
 * sliders (blur → sharp, slight rise, fade-in). Apply it to any text element
 * with `use:reveal` so every text on the site shares one consistent motion.
 *
 *   <h2 use:reveal>Titre</h2>
 *   <p use:reveal={{ delay: 80 }}>Texte</p>
 *
 * SSR-safe (no-op on the server), reveals once on scroll-into-view, and is
 * disabled under `prefers-reduced-motion`.
 */

const REVEAL_CLASS = "is-revealed";

let observer = null;

function ensureObserver() {
  if (observer || !browser) return observer;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add(REVEAL_CLASS);
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
  );

  return observer;
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

  const obs = ensureObserver();
  obs?.observe(node);

  return {
    update(next = {}) {
      if (next.delay) node.style.setProperty("--reveal-delay", `${next.delay}ms`);
    },
    destroy() {
      obs?.unobserve(node);
    }
  };
}
