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
      await cliquerLien(page, "/travail", tactile);
      await attendre(80);
      await cliquerLien(page, "/contact", tactile).catch(() => {});
      return ["/travail", "/contact", "/"];
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
      await cliquerLien(page, "/travail", tactile);
      await attendre(2600);
      await cliquerLien(page, "/projet9", tactile);
      await attendre(2600);
      for (const sens of ["back", "forward", "back", "back", "forward", "back"]) {
        await (sens === "back" ? page.goBack() : page.goForward()).catch(() => {});
        await attendre(110);
      }
      return ["/", "/travail", "/projet9"];
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
      await cliquerLien(page, "/travail", tactile);
      for (let i = 0; i < 14; i++) {
        await defiler(page, tactile, i % 2 ? -300 : 500);
        await attendre(45);
      }
      return ["/travail"];
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
      await cliquerLien(page, "/travail", tactile);
      await attendre(2500);
      await ctx.unroute(/\/_app\/immutable\/nodes\/.*\.js/);
      return ["/", "/travail"];
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
  const browser = await MOTEURS[engine].launch();
  const tactile = !!conf.hasTouch;
  const res = { engine, device, scenarios: [] };
  for (const [i, sc] of SCENARIOS.entries()) {
    const n = i + 1;
    if (FILTRE && !FILTRE.has(n)) continue;
    if (sc.bureau && tactile) continue;
    if (sc.mobile && !tactile) continue;
    const ctx = await browser.newContext(conf);
    const page = await ctx.newPage();
    const erreurs = [];
    page.on("pageerror", (e) => erreurs.push(e.message.slice(0, 160)));
    let anomalies = [];
    try {
      const attendus = await sc.jouer(page, { tactile, conf, ctx });
      anomalies = await sante(page, attendus, tactile);
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
