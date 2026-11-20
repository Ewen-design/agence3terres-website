// ───────────────────────────────────────────────────────────────────────────
//  Batterie « visiteur anormal » — chercher les failles, pas le cas nominal.
//
//    npm run build && npx vite preview --port 4173   (redémarrer après CHAQUE build)
//    npm run test:chaos
//    npm run test:chaos -- --engines webkit --devices mobile --scenarios 3,10
//
//  Chaque scénario malmène le site comme le ferait un visiteur pressé,
//  maladroit ou sur un mauvais réseau : double clic, deux liens d'affilée,
//  retour arrière en pleine transition, menu en rafale, défilement et
//  redimensionnement pendant un changement de page, onglet quitté, remontée
//  en plein départ « projet suivant », clavier, morceaux de code ou images
//  qui ne se chargent pas…
//  Puis le même BILAN DE SANTÉ : pas d'erreur JavaScript, pas de verrou de
//  défilement, pas de voile ni de transform resté sur la page, la page défile,
//  le bouton du menu répond, l'URL est l'une de celles attendues.
// ───────────────────────────────────────────────────────────────────────────
import { chromium, webkit, firefox } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { attendre, finIntro, etatGlobal, anomaliesEtat } from "./outils.mjs";

const ICI = dirname(fileURLToPath(import.meta.url));
const ARGS = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith("--")) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith("--") ? all[i + 1] : "1"]);
    return acc;
  }, [])
);
const BASE = ARGS.base ?? "http://localhost:4173";
const SORTIE = ARGS.out ?? join(ICI, "resultats", "chaos");
const MOTEURS = { chromium, webkit, firefox };
const APPAREILS = {
  desktop: { viewport: { width: 1440, height: 900 } },
  mobile: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 }
};
const COMBOS = (ARGS.combos ?? "chromium:desktop,webkit:desktop,firefox:desktop,webkit:mobile,chromium:mobile")
  .split(",")
  .map((c) => c.split(":"));
const FILTRE = ARGS.scenarios ? new Set(ARGS.scenarios.split(",").map(Number)) : null;
const PARALLELE = Math.max(1, +(ARGS.parallele ?? 3));

const norm = (p) => p.replace(/\/+$/, "") || "/";

/* ── Gestes ─────────────────────────────────────────────────────────────── */

async function ouvrir(page, route, { intro = false } = {}) {
  await page.goto(BASE + route, { waitUntil: "load" });
  if (!intro) {
    await attendre(250);
    await page.keyboard.press("Escape").catch(() => {});
  }
  await finIntro(page);
  await attendre(500);
}

async function defiler(page, tactile, dy) {
  if (tactile) await page.evaluate((d) => window.scrollBy(0, d), dy);
  else await page.mouse.wheel(0, dy);
}

/** Le premier lien visible et cliquable vers `href` (hors menu fermé). */
async function amenerLien(page, href) {
  return page.evaluate((href) => {
    const liens = [...document.querySelectorAll(`a[href="${href}"], a[href="${href}/"]`)].filter((a) => {
      if (a.closest(".fs-menu:not(.is-visible)")) return false;
      const r = a.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    const a = liens[0];
    if (!a) return false;
    a.scrollIntoView({ block: "center" });
    return true;
  }, href);
}

async function cliquerLien(page, href, tactile, { double = false } = {}) {
  if (!(await amenerLien(page, href))) throw new Error(`lien ${href} introuvable`);
  await attendre(350);
  const box = await page.evaluate((href) => {
    // Un lien réellement TOUCHABLE : à l'écran, et c'est bien lui sous le
    // doigt (pas un lien du pied de page en sommeil, recouvert par la page).
    const a = [...document.querySelectorAll(`a[href="${href}"], a[href="${href}/"]`)].find((x) => {
      const r = x.getBoundingClientRect();
      if (!(r.width > 0 && r.top >= 0 && r.bottom <= innerHeight) || x.closest(".fs-menu:not(.is-visible)")) return false;
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(r.height / 2, 40));
      return !!hit && (hit === x || x.contains(hit));
    });
    if (!a) return null;
    const r = a.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, 40) };
  }, href);
  if (!box) throw new Error(`lien ${href} hors de l'écran`);
  if (tactile) {
    await page.touchscreen.tap(box.x, box.y);
    if (double) await page.touchscreen.tap(box.x, box.y);
  } else if (double) {
    await page.mouse.dblclick(box.x, box.y);
  } else {
    await page.mouse.click(box.x, box.y);
  }
}

async function boutonMenu(page) {
  await page.locator(".header-nav-btn.more").first().click({ timeout: 3000, force: true });
}

/** Un VRAI glissé de doigt. Chromium : événements tactiles du protocole, le
 *  défilement part sur le compositeur comme sur un téléphone. WebKit (pas de
 *  geste tactile sous Playwright) : touchstart / touchmove synthétiques, puis
 *  le défilement que le système ferait si le touchmove n'est pas annulé.
 *  Rend `false` si la page a refusé le geste (touchmove annulé). */
async function glisserDoigt(page, engine, dy, { x = 195, y = 600, duree = 160 } = {}) {
  if (engine === "chromium") {
    const cdp = await page.context().newCDPSession(page);
    const y0 = await page.evaluate(() => scrollY);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    const pas = 8;
    for (let i = 1; i <= pas; i++) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y - (dy * i) / pas }] });
      await attendre(duree / pas);
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await cdp.detach().catch(() => {});
    await attendre(60);
    return Math.abs((await page.evaluate(() => scrollY)) - y0) > 5;
  }
  return page.evaluate(
    ({ x, y, dy }) => {
      const cible = document.elementFromPoint(x, y) || document.body;
      let t;
      try {
        t = new Touch({ identifier: Date.now(), target: cible, clientX: x, clientY: y });
      } catch {
        t = null;
      }
      const ev = (type, liste) =>
        t
          ? new TouchEvent(type, { touches: liste, targetTouches: liste, changedTouches: [t], bubbles: true, cancelable: true })
          : new Event(type, { bubbles: true, cancelable: true });
      cible.dispatchEvent(ev("touchstart", [t]));
      const libre = cible.dispatchEvent(ev("touchmove", [t]));
      if (libre) window.scrollBy(0, dy);
      cible.dispatchEvent(ev("touchend", []));
      return libre;
    },
    { x, y, dy }
  );
}

/** Attend que la nouvelle page soit à l'écran, carte encore en train de
 *  revenir (voile levé, `.page-stage` encore transformée). */
async function attendreRetourCarte(page, titre, selecteur = null) {
  // Le contenu, pas l'URL : SvelteKit change l'URL dès le clic, la page ne
  // change à l'écran qu'une fois le recul fini (voir la mémoire du projet).
  // `selecteur` : un élément propre à la page d'arrivée, quand son titre ne la
  // distingue pas (les pages pôles portent le titre de la home).
  await page.waitForFunction(
    ([titre, selecteur]) => {
      const st = document.querySelector(".page-stage");
      const arrivee = selecteur ? !!document.querySelector(selecteur) : document.title.includes(titre);
      return arrivee && !document.querySelector(".page-fade.is-on") && !!st?.style.transform;
    },
    [titre, selecteur],
    { timeout: 8000, polling: "raf" }
  );
}

/** Surveille, image par image, la page qui défile ALORS que la carte est
 *  encore là (séance de transition en cours) : le bug filmé par le client. */
async function surveillerCarte(page) {
  await page.evaluate(() => {
    const y0 = scrollY;
    const s = (window.__surv = { pire: 0, images: 0, plateA: null, t0: performance.now(), rangeSous: null });
    // La carte est là tant qu'il y a une découpe ou une réduction ; une page
    // « aplatie » (transform neutre, sans découpe) attendant d'être rangée au
    // calme est déjà une page à plat.
    const carteLa = (st) => !!st && (!!st.style.clipPath || /scale\((?!1\))/.test(st.style.transform));
    // Le RANGEMENT (transform retiré) ne doit jamais tomber doigt posé ni en
    // plein défilement : c'est là que Safari décale ses éléments fixes.
    let dernierDefil = -1e9;
    let touche = false;
    addEventListener("scroll", () => (dernierDefil = performance.now()), { passive: true, capture: true });
    addEventListener("touchstart", () => (touche = true), { passive: true, capture: true });
    addEventListener("touchend", (e) => !e.touches?.length && (touche = false), { passive: true, capture: true });
    let avaitTransform = true;
    const step = () => {
      const st = document.querySelector(".page-stage");
      const carte = carteLa(st);
      const d = Math.abs(scrollY - y0);
      if (carte && d > 30) s.pire = Math.max(s.pire, d);
      if (!carte && s.plateA === null) s.plateA = performance.now() - s.t0;
      const tf = st && getComputedStyle(st).transform !== "none";
      if (avaitTransform && !tf && s.rangeSous === null) {
        s.rangeSous = { touche, ecart: Math.round(performance.now() - dernierDefil) };
      }
      avaitTransform = tf;
      if (++s.images < 150) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

/** Le rangement de la page tombé sous le doigt ou en plein défilement. */
function rangeSousLeDoigt(s) {
  const r = s?.rangeSous;
  if (!r) return null;
  if (r.touche) return "page rangée (transform retiré) doigt posé";
  if (r.ecart < 120) return `page rangée en plein défilement (${r.ecart} ms après le dernier)`;
  return null;
}

/** Mène le pied de page « projet suivant » jusqu'à l'état voulu. */
async function mener(page, tactile, classe) {
  await page.evaluate(() => {
    const n = document.querySelector(".nextp");
    if (n) window.scrollTo(0, n.getBoundingClientRect().top + scrollY - innerHeight * 0.3);
  });
  await attendre(600);
  for (let i = 0; i < 160; i++) {
    const ok = await page.evaluate((c) => !!document.querySelector(`.nextp__panel.${c}`), classe);
    if (ok) return true;
    await defiler(page, tactile, 60);
    await attendre(25);
  }
  return false;
}

/* ── Le bilan de santé ──────────────────────────────────────────────────── */

async function sante(page, attendus, tactile) {
  const a = [];
  // Laisser retomber : transition finie, couverture levée — et que ça TIENNE
  // une demi-seconde (une transition démarre deux images après le clic : un
  // seul relevé la voyait « stable » avant qu'elle commence).
  const stabiliser = async () => {
    await attendre(300);
    let stable = 0;
    for (let k = 0; k < 90 && stable < 6; k++) {
      const ok = await page.evaluate(() => {
        const st = document.querySelector(".page-stage");
        const menu = !!document.querySelector(".fs-menu.is-visible");
        return (
          !document.querySelector(".nextp__panel.is-cover") &&
          !document.documentElement.classList.contains("site-intro-active") &&
          !document.querySelector(".page-fade.is-on") &&
          (menu || !st || getComputedStyle(st).transform === "none")
        );
      }).catch(() => false);
      stable = ok ? stable + 1 : 0;
      await attendre(100);
    }
    return stable >= 6;
  };
  if (!(await stabiliser())) a.push("la page ne s'est pas stabilisée en 9 s");
  // Un témoignage ouvert verrouille la page, c'est voulu : Échap doit le
  // refermer — sa fermeture rejoue le geste de transition, on l'attend.
  if (await page.evaluate(() => !!document.querySelector(".pcard"))) {
    await page.keyboard.press("Escape").catch(() => {});
    await attendre(600);
    if (!(await stabiliser())) a.push("la page ne se stabilise pas après la fermeture du témoignage");
    if (await page.evaluate(() => !!document.querySelector(".pcard"))) a.push("le témoignage ne se referme pas (Échap)");
  }
  // Un menu resté ouvert n'est pas une faute en soi : on le referme proprement.
  if (await page.evaluate(() => !!document.querySelector(".fs-menu.is-visible"))) {
    await page.keyboard.press("Escape").catch(() => {});
    await attendre(600);
    await stabiliser();
    if (await page.evaluate(() => !!document.querySelector(".fs-menu.is-visible"))) a.push("le menu ne se referme pas (Échap)");
  }
  const e = await etatGlobal(page);
  if (attendus && !attendus.map(norm).includes(norm(e.path))) a.push(`URL ${e.path} (attendu : ${attendus.join(" ou ")})`);
  a.push(...anomaliesEtat(e).filter((x) => !x.startsWith("URL")));
  // Voiles et calques de transition.
  const voiles = await page.evaluate(() => {
    const out = [];
    // `.menu-card-veil` est un capteur de clic transparent : seul compte qu'il
    // n'attrape plus les clics une fois le menu refermé.
    const capteur = document.querySelector(".menu-card-veil.is-catching");
    if (capteur && !document.querySelector(".fs-menu.is-visible")) out.push("capteur de clic du menu resté actif");
    for (const sel of [".page-fade", ".route-transition-layer"]) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility !== "hidden" && cs.display !== "none" && +cs.opacity > 0.05) out.push(`${sel} visible (opacité ${cs.opacity})`);
    }
    if (document.documentElement.classList.contains("vt-page")) out.push("transition de vue jamais finie");
    return out;
  });
  a.push(...voiles);
  // La page défile encore.
  const avant = await page.evaluate(() => ({ y: scrollY, max: document.documentElement.scrollHeight - innerHeight }));
  if (avant.max > 500) {
    const sens = avant.y > avant.max - 450 ? -400 : 400;
    await defiler(page, tactile, sens);
    await attendre(500);
    const apres = await page.evaluate(() => scrollY);
    if (Math.abs(apres - avant.y) < 40) a.push(`la page ne défile plus (y ${Math.round(avant.y)} → ${Math.round(apres)})`);
  }
  // Le bouton du menu répond.
  const btn = await page.evaluate(() => {
    const b = document.querySelector(".header-nav-btn.more");
    if (!b) return "absent";
    const r = b.getBoundingClientRect();
    const cs = getComputedStyle(b);
    if (!r.width || cs.visibility === "hidden" || +cs.opacity < 0.2) return "invisible";
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return hit && (b === hit || b.contains(hit)) ? "ok" : "recouvert";
  });
  if (btn !== "ok") a.push(`bouton du menu ${btn}`);
  return a;
}

/* ── Les scénarios ──────────────────────────────────────────────────────── */

/*  Le lien suivi DEPUIS L'ACCUEIL (2026-11-20) : la carte « Nos clients », qui
 *  menait à /travail, a été retirée de la home ; une carte de « Trois pôles »
 *  déclenche la même transition. */
const DEPUIS_ACCUEIL = "/services/digital";

const SCENARIOS = [
  {
    nom: "double clic sur une carte projet",
    async jouer(page, { tactile }) {
      await ouvrir(page, "/travail");
      await cliquerLien(page, "/projet9", tactile, { double: true });
      return ["/projet9"];
    }
  },
  {
    nom: "deux liens d'affilée (80 ms)",
    async jouer(page, { tactile }) {
      await ouvrir(page, "/");
      await cliquerLien(page, DEPUIS_ACCUEIL, tactile);
      await attendre(80);
      await cliquerLien(page, "/contact", tactile).catch(() => {});
      return [DEPUIS_ACCUEIL, "/contact", "/"];
    }
  },
  {
    nom: "retour arrière en pleine transition",
    async jouer(page, { tactile }) {
      await ouvrir(page, "/travail");
      await cliquerLien(page, "/projet9", tactile);
      await attendre(150);
      await page.goBack().catch(() => {});
      return ["/travail", "/projet9"];
    }
  },
  {
    nom: "rafale retour / avance",
    async jouer(page, { tactile }) {
      await ouvrir(page, "/");
      await cliquerLien(page, DEPUIS_ACCUEIL, tactile);
      await attendre(2600);
      await cliquerLien(page, "/projet3", tactile);
      await attendre(2600);
      for (const sens of ["back", "forward", "back", "back", "forward", "back"]) {
        await (sens === "back" ? page.goBack() : page.goForward()).catch(() => {});
        await attendre(110);
      }
      return ["/", DEPUIS_ACCUEIL, "/projet3"];
    }
  },
  {
    nom: "menu en rafale (7 clics)",
    async jouer(page) {
      await ouvrir(page, "/apropos");
      await page.evaluate(() => window.scrollTo(0, innerHeight * 1.5));
      await attendre(400);
      for (let i = 0; i < 7; i++) {
        await boutonMenu(page).catch(() => {});
        await attendre(60);
      }
      return ["/apropos"];
    }
  },
  {
    nom: "lien du menu puis bouton du menu aussitôt",
    async jouer(page) {
      await ouvrir(page, "/projet8");
      await boutonMenu(page);
      await page.waitForFunction(() => document.querySelector(".fs-menu.is-visible"), null, { timeout: 4000 }).catch(() => {});
      await attendre(700);
      await page.locator('.menu-link[href="/travail"]').first().click({ timeout: 3000 }).catch(() => {});
      await attendre(60);
      await boutonMenu(page).catch(() => {});
      return ["/travail", "/projet8"];
    }
  },
  {
    nom: "défilement pendant la transition",
    async jouer(page, { tactile }) {
      await ouvrir(page, "/");
      await cliquerLien(page, DEPUIS_ACCUEIL, tactile);
      for (let i = 0; i < 14; i++) {
        await defiler(page, tactile, i % 2 ? -300 : 500);
        await attendre(45);
      }
      return [DEPUIS_ACCUEIL];
    }
  },
  {
    nom: "fenêtre redimensionnée pendant la transition",
    bureau: true,
    async jouer(page, { tactile, conf }) {
      await ouvrir(page, "/travail");
      await cliquerLien(page, "/projet4", tactile);
      await attendre(120);
      await page.setViewportSize({ width: 900, height: 700 });
      await attendre(300);
      await page.setViewportSize(conf.viewport);
      return ["/projet4"];
    }
  },
  {
    nom: "onglet quitté pendant la transition",
    async jouer(page, { tactile, ctx }) {
      await ouvrir(page, "/travail");
      await cliquerLien(page, "/projet4", tactile);
      await attendre(100);
      const autre = await ctx.newPage();
      await autre.bringToFront();
      await attendre(1500);
      await page.bringToFront();
      await autre.close();
      return ["/projet4"];
    }
  },
  {
    nom: "projet suivant : remonter en plein départ",
    async jouer(page, { tactile }) {
      await ouvrir(page, "/projet9");
      await mener(page, tactile, "is-leaving");
      for (let i = 0; i < 8; i++) {
        await defiler(page, tactile, -700);
        await attendre(30);
      }
      return ["/projet9", "/projet8"];
    }
  },
  {
    nom: "projet suivant : menu pendant la couverture",
    async jouer(page, { tactile }) {
      await ouvrir(page, "/projet8");
      if (!(await mener(page, tactile, "is-cover"))) await mener(page, tactile, "is-leaving");
      await boutonMenu(page).catch(() => {});
      return ["/projet8", "/projet4"];
    }
  },
  {
    nom: "projet suivant : clavier pendant le départ",
    async jouer(page, { tactile }) {
      await ouvrir(page, "/projet4");
      await mener(page, tactile, "is-leaving");
      for (const k of ["End", "Space", "ArrowDown", "Home", "PageDown"]) {
        await page.keyboard.press(k).catch(() => {});
        await attendre(40);
      }
      return ["/projet4", "/projet3"];
    }
  },
  {
    nom: "projet suivant : clic sur la carte puis remontée",
    async jouer(page, { tactile }) {
      await ouvrir(page, "/projet1");
      await page.evaluate(() => {
        const n = document.querySelector(".nextp");
        window.scrollTo(0, n.getBoundingClientRect().top + scrollY + 10);
      });
      await attendre(700);
      await page.locator(".nextp__card").first().click({ timeout: 3000, force: true }).catch(() => {});
      await attendre(250);
      await defiler(page, tactile, -900);
      return ["/projet1", "/projet9"];
    }
  },
  {
    nom: "saut au bas de la page (Fin) puis retour en haut",
    async jouer(page) {
      await ouvrir(page, "/");
      await page.keyboard.press("End");
      await attendre(1500);
      await page.keyboard.press("Home");
      await attendre(1500);
      return ["/"];
    }
  },
  {
    nom: "molette folle sur une page à blocs collants",
    async jouer(page, { tactile }) {
      await ouvrir(page, "/apropos");
      for (let i = 0; i < 40; i++) {
        await defiler(page, tactile, i % 2 ? -900 : 1100);
        await attendre(16);
      }
      return ["/apropos"];
    }
  },
  {
    nom: "clics et touches pendant l'intro",
    async jouer(page, { tactile }) {
      await page.goto(BASE + "/", { waitUntil: "load" });
      for (let i = 0; i < 4; i++) {
        if (tactile) await page.touchscreen.tap(200, 400);
        else await page.mouse.click(700, 450);
        await page.keyboard.press("Tab");
        await attendre(90);
      }
      await finIntro(page);
      return ["/"];
    }
  },
  {
    nom: "navigation au clavier (Tab puis Entrée)",
    bureau: true,
    async jouer(page) {
      await ouvrir(page, "/services");
      for (let i = 0; i < 12; i++) await page.keyboard.press("Tab");
      await page.keyboard.press("Enter");
      return null; // toute page interne
    }
  },
  {
    nom: "code de la page suivante qui ne se charge pas",
    async jouer(page, { tactile, ctx }) {
      await ouvrir(page, "/");
      await ctx.route(/\/_app\/immutable\/nodes\/.*\.js/, (r) => r.abort());
      await cliquerLien(page, DEPUIS_ACCUEIL, tactile);
      await attendre(2500);
      await ctx.unroute(/\/_app\/immutable\/nodes\/.*\.js/);
      return ["/", DEPUIS_ACCUEIL];
    }
  },
  {
    nom: "toutes les images en échec",
    async jouer(page, { tactile, ctx }) {
      await ctx.route(/\.(webp|jpe?g|png)(\?.*)?$/, (r) => r.abort());
      await ouvrir(page, "/projet9");
      for (let i = 0; i < 8; i++) {
        await defiler(page, tactile, 800);
        await attendre(120);
      }
      await ctx.unroute(/\.(webp|jpe?g|png)(\?.*)?$/);
      return ["/projet9"];
    }
  },
  {
    nom: "témoignage ouvert puis menu",
    async jouer(page) {
      await ouvrir(page, "/projet4");
      const ok = await page.evaluate(() => {
        const b = document.querySelector(".pquote__more");
        if (!b) return false;
        b.scrollIntoView({ block: "center" });
        return true;
      });
      if (!ok) return ["/projet4"];
      await attendre(900);
      await page.locator(".pquote__more").first().click({ timeout: 3000, force: true }).catch(() => {});
      await attendre(500);
      await boutonMenu(page).catch(() => {});
      await attendre(900);
      await boutonMenu(page).catch(() => {});
      return ["/projet4"];
    }
  },
  {
    nom: "page inexistante puis lien vers l'accueil",
    async jouer(page, { tactile }) {
      await page.goto(BASE + "/nimporte-quoi", { waitUntil: "load" });
      await attendre(300);
      await page.keyboard.press("Escape").catch(() => {});
      await finIntro(page);
      await attendre(500);
      await cliquerLien(page, "/", tactile).catch(() => page.goto(BASE + "/"));
      return ["/"];
    }
  },
  {
    // Vidéo du client (2026-11-19) : logo touché depuis /travail, défilement
    // au doigt dès que la home apparaît — la page défilait AVEC sa carte.
    nom: "logo puis défilement au doigt aussitôt la page apparue",
    // Suppose la carte de transition ou la vidéo : sans objet en mouvement réduit.
    anime: true,
    mobile: true,
    async jouer(page, { engine, anomalies }) {
      await ouvrir(page, "/travail");
      await page.locator(".mobile-logo").first().click({ timeout: 3000, force: true });
      await attendreRetourCarte(page, "Née pour créer");
      await surveillerCarte(page);
      await glisserDoigt(page, engine, 420);
      const yGeste = await page.evaluate(() => scrollY);
      await attendre(700);
      const s = await page.evaluate(() => ({ ...window.__surv, y: scrollY }));
      if (s.pire > 0) anomalies.push(`la page a défilé de ${Math.round(s.pire)} px DANS sa carte`);
      if (s.plateA === null || s.plateA > 120) anomalies.push(`carte rendue à plat en ${s.plateA === null ? "∞" : Math.round(s.plateA)} ms après le toucher`);
      if (yGeste > 100 && s.y < yGeste * 0.5) anomalies.push(`ramené en haut après le geste (y ${Math.round(yGeste)} → ${Math.round(s.y)})`);
      const r = rangeSousLeDoigt(s);
      if (r) anomalies.push(r);
      return ["/"];
    }
  },
  {
    nom: "molette aussitôt la page apparue",
    // Suppose la carte de transition ou la vidéo : sans objet en mouvement réduit.
    anime: true,
    bureau: true,
    async jouer(page, { anomalies }) {
      await ouvrir(page, "/travail");
      await page.locator(".site-prism-mark").first().click({ timeout: 3000, force: true });
      await attendreRetourCarte(page, "Née pour créer");
      await surveillerCarte(page);
      await page.mouse.move(700, 500);
      await page.mouse.wheel(0, 500);
      await attendre(120);
      await page.mouse.wheel(0, 400);
      await attendre(800);
      const s = await page.evaluate(() => ({ ...window.__surv, y: scrollY }));
      if (s.plateA === null || s.plateA > 450) anomalies.push(`carte rendue à plat en ${s.plateA === null ? "∞" : Math.round(s.plateA)} ms après la molette`);
      if (s.y < 200) anomalies.push(`la molette n'a pas fait défiler la nouvelle page (y ${Math.round(s.y)})`);
      return ["/"];
    }
  },
  {
    nom: "doigt qui glisse pendant le départ de la page",
    mobile: true,
    async jouer(page, { engine, anomalies }) {
      await ouvrir(page, "/");
      await page.evaluate(() => window.scrollTo(0, innerHeight * 2));
      await attendre(400);
      await cliquerLien(page, DEPUIS_ACCUEIL, true);
      await attendre(120);
      const y0 = await page.evaluate(() => scrollY);
      const libre = await glisserDoigt(page, engine, 500);
      const y1 = await page.evaluate(() => scrollY);
      if (libre && Math.abs(y1 - y0) > 40 && (await page.evaluate(() => location.pathname === "/"))) {
        anomalies.push(`l'ancienne page a défilé pendant son départ (${Math.round(y1 - y0)} px)`);
      }
      return [DEPUIS_ACCUEIL];
    }
  },
  {
    nom: "menu refermé puis défilement aussitôt",
    async jouer(page, { engine, tactile, anomalies }) {
      await ouvrir(page, "/apropos");
      await page.evaluate(() => window.scrollTo(0, innerHeight * 1.2));
      await attendre(400);
      await boutonMenu(page);
      await attendre(1100);
      await boutonMenu(page);
      await attendre(90);
      await surveillerCarte(page);
      if (tactile) await glisserDoigt(page, engine, 380);
      else await page.mouse.wheel(0, 500);
      await attendre(600);
      const s = await page.evaluate(() => window.__surv);
      if (tactile && s.pire > 0) anomalies.push(`la page a défilé de ${Math.round(s.pire)} px DANS sa carte (menu qui se referme)`);
      const r = tactile ? rangeSousLeDoigt(s) : null;
      if (r) anomalies.push(r);
      if (s.plateA === null || s.plateA > (tactile ? 120 : 450)) anomalies.push(`carte rendue à plat en ${s.plateA === null ? "∞" : Math.round(s.plateA)} ms`);
      return ["/apropos"];
    }
  },
  {
    nom: "page rendue au toucher, menu ouvert aussitôt",
    // Suppose la carte de transition ou la vidéo : sans objet en mouvement réduit.
    anime: true,
    async jouer(page, { engine, tactile, anomalies }) {
      await ouvrir(page, "/travail");
      await page.locator(tactile ? ".mobile-logo" : ".site-prism-mark").first().click({ timeout: 3000, force: true });
      await attendreRetourCarte(page, "Née pour créer");
      if (tactile) await glisserDoigt(page, engine, 200);
      else await page.mouse.wheel(0, 300);
      await attendre(250);
      await boutonMenu(page).catch(() => {});
      await attendre(900);
      const verrou = await page.evaluate(() => ({
        menu: !!document.querySelector(".fs-menu.is-open"),
        overflow: getComputedStyle(document.documentElement).overflowY
      }));
      if (verrou.menu && verrou.overflow !== "hidden") anomalies.push("menu ouvert mais la page n'est plus verrouillée (verrou levé par la navigation)");
      return ["/"];
    }
  },
  {
    nom: "lien touché pendant le retour de la carte",
    // Suppose la carte de transition ou la vidéo : sans objet en mouvement réduit.
    anime: true,
    async jouer(page, { tactile }) {
      await ouvrir(page, "/");
      await cliquerLien(page, DEPUIS_ACCUEIL, tactile);
      await attendreRetourCarte(page, null, 'a[href="/projet6"], a[href="/projet6/"]');
      await cliquerLien(page, "/projet6", tactile).catch(() => {});
      return [DEPUIS_ACCUEIL, "/projet6"];
    }
  },
  {
    nom: "onglet caché / montré en rafale (vidéo du hero)",
    // Suppose la carte de transition ou la vidéo : sans objet en mouvement réduit.
    anime: true,
    async jouer(page, { anomalies }) {
      await ouvrir(page, "/");
      await page.waitForFunction(() => document.querySelector(".hero video")?.currentTime > 0.5, null, { timeout: 15000 }).catch(() => {});
      await page.evaluate(async () => {
        let cache = false;
        Object.defineProperty(document, "hidden", { configurable: true, get: () => cache });
        Object.defineProperty(document, "visibilityState", { configurable: true, get: () => (cache ? "hidden" : "visible") });
        const pause = (ms) => new Promise((r) => setTimeout(r, ms));
        for (const ms of [40, 900, 15, 2600, 60, 300, 2100, 10, 20, 2200]) {
          cache = !cache;
          document.dispatchEvent(new Event("visibilitychange"));
          await pause(ms);
        }
        cache = false;
        document.dispatchEvent(new Event("visibilitychange"));
        window.dispatchEvent(new Event("focus"));
      });
      await attendre(1200);
      const v = await page.evaluate(async () => {
        const el = document.querySelector(".hero video");
        if (!el) return null;
        const t0 = el.currentTime;
        await new Promise((r) => setTimeout(r, 600));
        return { paused: el.paused, avance: el.currentTime - t0 };
      });
      if (v && (v.paused || v.avance < 0.2)) anomalies.push(`vidéo du hero arrêtée après la rafale (pause ${v.paused}, +${v.avance.toFixed(2)} s)`);
      return ["/"];
    }
  },
  {
    nom: "touches de défilement pendant toute la transition",
    bureau: true,
    async jouer(page, { tactile }) {
      await ouvrir(page, "/");
      await cliquerLien(page, DEPUIS_ACCUEIL, tactile);
      for (let i = 0; i < 24; i++) {
        await page.keyboard.press(["Space", "PageDown", "ArrowDown", "End", "Home", "PageUp"][i % 6]).catch(() => {});
        await attendre(70);
      }
      return [DEPUIS_ACCUEIL];
    }
  },
  {
    nom: "témoignage ouvert puis retour du navigateur",
    async jouer(page) {
      await ouvrir(page, "/travail");
      await page.goto(BASE + "/projet4", { waitUntil: "load" });
      await finIntro(page);
      await attendre(500);
      const ok = await page.evaluate(() => {
        const b = document.querySelector(".pquote__more");
        if (!b) return false;
        b.scrollIntoView({ block: "center" });
        return true;
      });
      if (!ok) return ["/projet4"];
      await attendre(800);
      await page.locator(".pquote__more").first().click({ timeout: 3000, force: true }).catch(() => {});
      await attendre(700);
      await page.goBack().catch(() => {});
      await attendre(1500);
      return ["/travail", "/projet4"];
    }
  },
  {
    nom: "menu ouvert puis retour du navigateur",
    async jouer(page, { tactile }) {
      await ouvrir(page, "/");
      await cliquerLien(page, DEPUIS_ACCUEIL, tactile);
      await attendre(2600);
      await boutonMenu(page);
      await attendre(500);
      await page.goBack().catch(() => {});
      await attendre(300);
      await boutonMenu(page).catch(() => {});
      return ["/", DEPUIS_ACCUEIL];
    }
  },
  {
    nom: "menu ouvert, fenêtre passée en téléphone puis revenue",
    bureau: true,
    async jouer(page, { conf }) {
      await ouvrir(page, "/services");
      await boutonMenu(page);
      await attendre(400);
      await page.setViewportSize({ width: 390, height: 800 });
      await attendre(500);
      await page.setViewportSize(conf.viewport);
      await attendre(400);
      return ["/services"];
    }
  },
  {
    nom: "Échap et menu en rafale pendant la transition",
    async jouer(page, { tactile }) {
      await ouvrir(page, "/");
      await cliquerLien(page, DEPUIS_ACCUEIL, tactile);
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press("Escape").catch(() => {});
        if (i % 3 === 0) await boutonMenu(page).catch(() => {});
        await attendre(110);
      }
      return [DEPUIS_ACCUEIL];
    }
  },
  {
    nom: "vidéo du hero après un aller-retour",
    // Suppose la carte de transition ou la vidéo : sans objet en mouvement réduit.
    anime: true,
    async jouer(page, { tactile, anomalies }) {
      await ouvrir(page, "/");
      await cliquerLien(page, DEPUIS_ACCUEIL, tactile);
      await attendre(2600);
      await page.goBack().catch(() => {});
      await attendre(2500);
      // Le retour arrière rend la position du clic (plus bas dans la home) :
      // on remonte voir le hero, comme le ferait le lecteur.
      const yRetour = await page.evaluate(() => scrollY);
      await page.evaluate(() => window.scrollTo(0, 0));
      await attendre(900);
      const v = await page.evaluate(async () => {
        const el = document.querySelector(".hero video");
        if (!el) return null;
        const t0 = el.currentTime;
        await new Promise((r) => setTimeout(r, 700));
        return { paused: el.paused, avance: el.currentTime - t0 };
      });
      if (!v) anomalies.push("pas de vidéo dans le hero au retour");
      else if (v.paused || v.avance < 0.25) anomalies.push(`vidéo du hero arrêtée au retour (pause ${v.paused}, +${v.avance.toFixed(2)} s, retour à y ${Math.round(yRetour)})`);
      return ["/"];
    }
  },
  {
    nom: "trois cartes projet touchées à la chaîne",
    async jouer(page, { tactile }) {
      await ouvrir(page, "/travail");
      for (const href of ["/projet9", "/projet8", "/projet4"]) {
        await cliquerLien(page, href, tactile).catch(() => {});
        await attendre(140);
      }
      return ["/projet9", "/projet8", "/projet4", "/travail"];
    }
  },
  {
    nom: "redimensionnements en rafale sur une page à blocs collants",
    bureau: true,
    async jouer(page, { conf }) {
      await ouvrir(page, "/apropos");
      await page.evaluate(() => window.scrollTo(0, innerHeight * 2.4));
      await attendre(400);
      for (const [w, h] of [[1200, 800], [880, 700], [1440, 900], [700, 900], [1100, 650], [conf.viewport.width, conf.viewport.height]]) {
        await page.setViewportSize({ width: w, height: h });
        await page.mouse.wheel(0, 260);
        await attendre(90);
      }
      return ["/apropos"];
    }
  },
  {
    nom: "téléphone tourné pendant la transition",
    mobile: true,
    async jouer(page) {
      await ouvrir(page, "/");
      await cliquerLien(page, DEPUIS_ACCUEIL, true);
      await attendre(250);
      await page.setViewportSize({ width: 844, height: 390 });
      await attendre(500);
      await page.setViewportSize({ width: 390, height: 844 });
      return [DEPUIS_ACCUEIL];
    }
  },
  {
    nom: "retour arrière vers le milieu d'une séquence collée",
    async jouer(page, { tactile }) {
      await ouvrir(page, "/apropos");
      await page.evaluate(() => window.scrollTo(0, innerHeight * 3.2));
      await attendre(700);
      await page.evaluate(() => {
        const a = [...document.querySelectorAll('a[href="/contact"], a[href="/travail"], a[href="/"]')].find((x) => {
          const r = x.getBoundingClientRect();
          return r.width > 0 && !x.closest(".fs-menu");
        });
        a?.click();
      });
      await attendre(2600);
      await page.goBack().catch(() => {});
      await attendre(1200);
      for (let i = 0; i < 6; i++) {
        await defiler(page, tactile, i % 2 ? -350 : 500);
        await attendre(60);
      }
      return ["/apropos"];
    }
  },
  {
    nom: "téléphone tourné en pleine page",
    mobile: true,
    async jouer(page) {
      await ouvrir(page, "/projet9");
      await page.evaluate(() => window.scrollTo(0, innerHeight * 3));
      await attendre(400);
      await page.setViewportSize({ width: 844, height: 390 });
      await attendre(700);
      await page.setViewportSize({ width: 390, height: 844 });
      await attendre(700);
      return ["/projet9"];
    }
  }
];

/* ── Exécution ──────────────────────────────────────────────────────────── */

async function contexte(engine, device) {
  const conf = { ...APPAREILS[device] };
  if (engine === "firefox") delete conf.isMobile;
  // `--reduit 1` : tout le parcours en « mouvement réduit » (aucune
  // transition animée, aucun lissage — d'autres chemins de code).
  if (ARGS.reduit) conf.reducedMotion = "reduce";
  const browser = await MOTEURS[engine].launch();
  const tactile = !!conf.hasTouch;
  const res = { engine, device, scenarios: [] };
  for (const [i, sc] of SCENARIOS.entries()) {
    const n = i + 1;
    if (FILTRE && !FILTRE.has(n)) continue;
    if (sc.bureau && tactile) continue;
    if (sc.mobile && !tactile) continue;
    if (sc.anime && ARGS.reduit) continue;
    const ctx = await browser.newContext(conf);
    const page = await ctx.newPage();
    const erreurs = [];
    page.on("pageerror", (e) => erreurs.push(e.message.slice(0, 160)));
    let anomalies = [];
    try {
      // Les scénarios peuvent relever eux-mêmes ce qu'ils voient EN COURS de
      // geste (`anomalies`), avant le bilan de fin.
      const attendus = await sc.jouer(page, { tactile, conf, ctx, engine, anomalies });
      anomalies.push(...(await sante(page, attendus, tactile)));
    } catch (e) {
      anomalies.push(`scénario interrompu : ${e.message.split("\n")[0]}`);
    }
    res.scenarios.push({ n, nom: sc.nom, anomalies, erreurs: [...new Set(erreurs)] });
    await ctx.close();
    process.stdout.write(anomalies.length || erreurs.length ? "✗" : ".");
  }
  await browser.close();
  return res;
}

mkdirSync(SORTIE, { recursive: true });
console.log(`Chaos : ${COMBOS.length} contexte(s) × ${FILTRE ? FILTRE.size : SCENARIOS.length} scénario(s) sur ${BASE}`);
let prochain = 0;
const resultats = new Array(COMBOS.length);
await Promise.all(
  Array.from({ length: Math.min(PARALLELE, COMBOS.length) }, async () => {
    while (prochain < COMBOS.length) {
      const k = prochain++;
      const [e, d] = COMBOS[k];
      try {
        resultats[k] = await contexte(e, d);
      } catch (err) {
        resultats[k] = { engine: e, device: d, scenarios: [{ n: 0, nom: "contexte", anomalies: [err.message.split("\n")[0]], erreurs: [] }] };
      }
      writeFileSync(join(SORTIE, `${e}-${d}.json`), JSON.stringify(resultats[k], null, 2));
    }
  })
);

const lignes = [];
let total = 0;
for (const r of resultats) {
  lignes.push(`\n══ ${r.engine} · ${r.device}`);
  for (const s of r.scenarios) {
    const pb = [...s.anomalies, ...s.erreurs.map((e) => `erreur JS : ${e}`)];
    total += pb.length ? 1 : 0;
    lignes.push(`  ${pb.length ? "✗" : "✓"} ${String(s.n).padStart(2)}. ${s.nom}${pb.length ? "\n      - " + pb.join("\n      - ") : ""}`);
  }
}
lignes.push(`\n${total} scénario(s) en échec.`);
const texte = lignes.join("\n");
console.log("\n" + texte);
writeFileSync(join(SORTIE, "resume.txt"), texte);
