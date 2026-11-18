// ───────────────────────────────────────────────────────────────────────────
//  Batterie de stabilité — toutes les pages, trois moteurs, plusieurs formats.
//
//    npm run build && npx vite preview --port 4173      (dans un autre terminal)
//    npm run test:stabilite                              (tout)
//    npm run test:stabilite -- --engines webkit --devices mobile --routes /,/projet9
//
//  Ce qui est relevé, page par page :
//    • erreurs JS et erreurs console, requêtes en échec (4xx/5xx, coupées) ;
//    • images CASSÉES (chargées sans pixels) ;
//    • images VIDES À L'ÉCRAN : visibles dans le cadre mais pas encore
//      arrivées — et combien de temps elles l'ont été ;
//    • textes / blocs à arrivée (`.reveal`) restés invisibles alors qu'ils
//      sont dans le cadre depuis deux pas de défilement ;
//    • débordement horizontal (la page « glisse » sur le côté au doigt) ;
//    • sauts de mise en page (CLS, Chromium seulement : les autres moteurs
//      n'exposent pas `layout-shift`) ;
//    • images saccadées : intervalles entre deux images > 50 ms pendant le
//      défilement (fil principal bloqué) ;
//    • l'intro : quand elle se termine, et si le média du hero est prêt à cet
//      instant (sinon on découvre un hero vide).
//  Puis, par contexte : navigation interne (lien, retour arrière), et la chaîne
//  « projet suivant » au bas des pages projet.
//
//  Ce que ça NE voit PAS (voir la mémoire du projet) : le défilement asynchrone
//  de Safari (tremblements d'éléments collants), l'inertie et la barre d'outils
//  d'iOS, le mode économie d'énergie. Un vrai iPhone reste le dernier juge.
// ───────────────────────────────────────────────────────────────────────────
import { chromium, webkit, firefox } from "playwright";
import { attendre, finIntro, etatGlobal, anomaliesEtat } from "./outils.mjs";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ICI = dirname(fileURLToPath(import.meta.url));

const ARGS = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith("--")) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith("--") ? all[i + 1] : "1"]);
    return acc;
  }, [])
);

const BASE = ARGS.base ?? "http://localhost:4173";
const SORTIE = ARGS.out ?? join(ICI, "resultats");
const ROUTES_TOUTES = [
  "/", "/services", "/services/digital", "/services/design", "/services/studio",
  "/travail", "/apropos", "/contact", "/mentions-legales",
  "/projet9", "/projet8", "/projet4", "/projet3", "/projet6", "/projet1",
  "/page-qui-nexiste-pas"
];
const ROUTES = ARGS.routes ? ARGS.routes.split(",") : ROUTES_TOUTES;
const MOTEURS = { chromium, webkit, firefox };
const ENGINES = (ARGS.engines ?? "chromium,webkit,firefox").split(",");
const APPAREILS = {
  desktop: { viewport: { width: 1440, height: 900 } },
  laptop: { viewport: { width: 1280, height: 720 } },
  tablet: { viewport: { width: 820, height: 1180 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 },
  mobile: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 },
  paysage: { viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 }
};
const DEVICES = (ARGS.devices ?? "desktop,tablet,mobile").split(",");
const SANS_NAV = ARGS["sans-nav"] === "1";
const SANS_CHAINE = ARGS["sans-chaine"] === "1";
const REDUIT = ARGS.reduit === "1";
/** `--reseau lent` : 1,6 Mb/s et 150 ms de latence (Chromium, émulation
 *  réseau) ; sur WebKit et Firefox, qui n'ont pas d'émulation, chaque image et
 *  chaque vidéo est retardée de 450 ms à la source. */
const LENT = ARGS.reseau === "lent";

/** Bruit connu, sans rapport avec le site (extensions, moteurs de test). */
const BRUIT = [/favicon/i, /ERR_ABORTED/, /NS_BINDING_ABORTED/, /cancelled/i, /Load request cancelled/i];


/* ── Instrumentation posée AVANT tout script de la page ─────────────────── */
function instrumenter() {
  const S = (window.__stab = {
    cls: 0,
    shifts: [],
    gaps: [],
    introDone: null,
    heroReadyAtIntro: null,
    seen: {},
    loafs: []
  });
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.hadRecentInput) continue;
        S.cls += e.value;
        if (e.value > 0.005)
          S.shifts.push({
            t: Math.round(e.startTime),
            v: +e.value.toFixed(4),
            nodes: (e.sources || []).slice(0, 3).map((s) => {
              const n = s.node;
              if (!n || !n.nodeName) return "?";
              return n.nodeName.toLowerCase() + (n.id ? "#" + n.id : "") + (n.className && typeof n.className === "string" ? "." + n.className.trim().split(/\s+/).slice(0, 2).join(".") : "");
            })
          });
      }
    }).observe({ type: "layout-shift", buffered: true });
  } catch {}
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.duration < 80) continue;
        S.loafs.push({
          t: Math.round(e.startTime),
          d: Math.round(e.duration),
          scripts: (e.scripts || []).slice(0, 2).map((s) => `${(s.sourceURL || "").split("/").pop()}:${s.sourceFunctionName || s.invoker || ""} ${Math.round(s.duration)}ms`)
        });
      }
    }).observe({ type: "long-animation-frame", buffered: true });
  } catch {}
  // Intervalles entre images : tous les moteurs.
  let last = 0;
  const tick = (t) => {
    if (last && S.mesure) {
      const gap = t - last;
      if (gap > 50) S.gaps.push(Math.round(gap));
    }
    last = t;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  window.addEventListener("preloader:done", () => {
    S.introDone = performance.now();
    S.heroReadyAtIntro = window.__stabHeroPret ? window.__stabHeroPret() : null;
  });
  window.__stabHeroPret = () => {
    const vh = innerHeight;
    const vw = innerWidth;
    const out = [];
    for (const m of document.querySelectorAll(".page-wrapper img, .page-wrapper video")) {
      const r = m.getBoundingClientRect();
      if (r.width < 120 || r.height < 120 || r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) continue;
      const vis = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) * Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
      if (vis < vw * vh * 0.2) continue;
      if (m.tagName === "IMG") out.push({ src: (m.currentSrc || m.src || "").split("/").pop(), pret: m.complete && m.naturalWidth > 0 });
      else {
        // Une vidéo pas encore lue mais dont l'affiche est peinte (attribut,
        // calque <img> ou calque en image de fond) n'est pas un trou à l'écran.
        let affiche = !!m.getAttribute("poster");
        for (const el of m.parentElement?.children ?? []) {
          if (el === m) continue;
          if (el.tagName === "IMG" && el.complete && el.naturalWidth > 0) affiche = true;
          const u = /url\(["']?([^"')]+)["']?\)/.exec(el.style?.backgroundImage || "")?.[1];
          if (u && performance.getEntriesByName(new URL(u, location.href).href).some((e) => e.responseEnd > 0)) affiche = true;
        }
        out.push({ src: (m.currentSrc || "video").split("/").pop(), pret: m.readyState >= 2 || affiche });
      }
    }
    return out;
  };
}

/* ── Relevé à l'écran : exécuté dans la page à chaque pas ────────────────── */
function releve(pas) {
  const S = window.__stab;
  const vh = innerHeight;
  const vw = innerWidth;
  const now = performance.now();
  const visible = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity < 0.05) return false;
    }
    return true;
  };
  const dansCadre = (r, part = 0.5) => {
    if (r.width < 24 || r.height < 24) return false;
    const vis = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) * Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
    return vis >= r.width * r.height * part || vis >= vw * vh * 0.25;
  };
  const vides = [];
  for (const img of document.querySelectorAll("img")) {
    if (img.closest("#site-intro-loader, .fs-menu")) continue;
    const r = img.getBoundingClientRect();
    if (!dansCadre(r)) continue;
    // Le contenant visible (une image en fondu à 0 tant qu'elle n'est pas
    // arrivée est quand même un trou à l'écran : on teste ses ancêtres).
    const cont = img.parentElement;
    if (cont && !visible(cont)) continue;
    const src = img.currentSrc || img.src || img.getAttribute("src") || "";
    if (!src) continue;
    const pret = img.complete && img.naturalWidth > 0;
    if (!pret) {
      vides.push(src.split("/").pop());
      if (!S.seen[src]) S.seen[src] = { vuA: now, pas };
    }
  }
  // Arrivées restées invisibles : dans le cadre aux deux tiers, pas révélées.
  const bloques = [];
  for (const el of document.querySelectorAll(".reveal:not(.is-revealed)")) {
    const r = el.getBoundingClientRect();
    if (r.height < 8) continue;
    const vis = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
    if (vis < Math.min(r.height, vh) * 0.66) continue;
    // …et en largeur : une carte rangée hors champ dans un rail n'est pas
    // « à l'écran » (elle arrive avec son rail, voir reveal.js).
    if (r.width && (Math.min(r.right, vw) - Math.max(r.left, 0)) / Math.min(r.width, vw) < 0.5) continue;
    if (el.parentElement && !visible(el.parentElement)) continue;
    bloques.push(`${el.tagName.toLowerCase()}.${[...el.classList].filter((c) => c !== "reveal").slice(0, 2).join(".")} « ${(el.textContent || "").trim().slice(0, 40)} »`);
  }
  return {
    y: Math.round(scrollY),
    vides,
    bloques,
    debord: document.documentElement.scrollWidth - innerWidth
  };
}

/* ── Conformité (accessibilité, référencement) : exécuté dans la page ───── */
function conformite() {
  const pb = [];
  const nomAccessible = (el) => {
    if ((el.getAttribute("aria-label") || "").trim()) return true;
    if (el.getAttribute("aria-labelledby")) return true;
    if ((el.getAttribute("title") || "").trim()) return true;
    if ((el.textContent || "").trim()) return true;
    if ([...el.querySelectorAll("img[alt]")].some((i) => i.getAttribute("alt").trim())) return true;
    if (el.querySelector("svg title")) return true;
    return false;
  };
  const sansAlt = [...document.images].filter((i) => !i.hasAttribute("alt") && !i.closest("[aria-hidden='true']"));
  if (sansAlt.length) pb.push(`${sansAlt.length} image(s) sans attribut alt : ${sansAlt.slice(0, 3).map((i) => (i.getAttribute("src") || "").split("/").pop()).join(", ")}`);
  const muets = [...document.querySelectorAll("a[href], button")].filter((el) => !el.closest("[aria-hidden='true'], [inert]") && !nomAccessible(el));
  if (muets.length) pb.push(`${muets.length} lien(s)/bouton(s) sans nom accessible : ${muets.slice(0, 3).map((e) => e.tagName.toLowerCase() + "." + [...e.classList].slice(0, 2).join(".")).join(", ")}`);
  const ids = {};
  for (const el of document.querySelectorAll("[id]")) ids[el.id] = (ids[el.id] || 0) + 1;
  const doublons = Object.entries(ids).filter(([, n]) => n > 1).map(([id]) => id);
  if (doublons.length) pb.push(`id en double : ${doublons.slice(0, 4).join(", ")}`);
  // Les titres AFFICHÉS (une copie en `display: none` n'est lue par personne).
  const h1 = [...document.querySelectorAll("h1")].filter((h) => h.getClientRects().length && !h.closest("[aria-hidden='true']")).length;
  if (h1 !== 1) pb.push(`${h1} titre(s) h1 affiché(s) (1 attendu)`);
  if (!document.documentElement.lang) pb.push("html sans lang");
  if (!document.title.trim()) pb.push("titre de page vide");
  if (!document.querySelector('meta[name="description"]')?.content?.trim()) pb.push("meta description absente");
  const vides = [...document.querySelectorAll('a[href="#"], a[href^="javascript:"]')].length;
  if (vides) pb.push(`${vides} lien(s) vers « # » ou javascript:`);
  return pb;
}

function bilanImages() {
  const S = window.__stab;
  const out = [];
  for (const [src, info] of Object.entries(S.seen)) {
    const e = performance.getEntriesByName(src)[0];
    const img = [...document.images].find((i) => (i.currentSrc || i.src) === src);
    const fin = e ? e.responseEnd : null;
    out.push({
      src: src.replace(location.origin, ""),
      attente: fin != null ? Math.max(0, Math.round(fin - info.vuA)) : null,
      chargee: img ? img.complete && img.naturalWidth > 0 : null,
      lazy: img?.getAttribute("loading") ?? null
    });
  }
  const cassees = [...document.images]
    .filter((i) => i.complete && i.naturalWidth === 0 && (i.currentSrc || i.getAttribute("src")))
    .map((i) => (i.currentSrc || i.getAttribute("src")).replace(location.origin, ""));
  return { tard: out, cassees };
}




async function defiler(page, tactile, dy) {
  if (tactile) {
    await page.evaluate((d) => window.scrollBy(0, d), dy);
  } else {
    await page.mouse.wheel(0, dy);
  }
}

/** Nouvel onglet — bridé AVANT sa première requête en mode réseau lent. */
async function nouvellePage(ctx) {
  const page = await ctx.newPage();
  if (ctx.__brider) {
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 90000 });
  }
  return page;
}

/* ── Une page : chargement, intro, descente complète ────────────────────── */
async function testerPage(ctx, route, { tactile, introNaturelle }) {
  const page = await nouvellePage(ctx);
  const res = { route, erreurs: [], requetes: [], anomalies: [], intro: null, pas: 0, vides: [], bloques: [], tard: [], cassees: [], cls: null, shifts: [], gaps: [], loafs: [] };
  page.on("pageerror", (e) => res.erreurs.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error" || BRUIT.some((b) => b.test(m.text()))) return;
    // La page inexistante est VOULUE : son 404 n'est pas une erreur du site.
    if (/page-qui-nexiste-pas/.test(route) && /404/.test(m.text())) return;
    res.erreurs.push(`console: ${m.text().slice(0, 200)}`);
  });
  page.on("requestfailed", (r) => {
    const f = r.failure()?.errorText ?? "";
    if (!BRUIT.some((b) => b.test(f))) res.requetes.push(`${f} ${r.url().replace(BASE, "")}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 400 && !/page-qui-nexiste-pas/.test(r.url())) res.requetes.push(`${r.status()} ${r.url().replace(BASE, "")}`);
  });

  const t0 = Date.now();
  try {
    await page.goto(BASE + route, { waitUntil: "load", timeout: 45000 });
  } catch (e) {
    res.anomalies.push(`chargement : ${e.message.split("\n")[0]}`);
  }
  const tLoad = Date.now() - t0;
  if (!introNaturelle) {
    await attendre(250);
    await page.keyboard.press("Escape").catch(() => {});
  }
  const introOk = await finIntro(page);
  if (!introOk) res.anomalies.push("l'intro ne s'est pas terminée en 12 s");
  res.intro = await page.evaluate(() => ({ fin: Math.round(window.__stab.introDone ?? -1), heroAuDepart: window.__stab.heroReadyAtIntro })).catch(() => null);
  res.intro.load = tLoad;
  if (introNaturelle && res.intro?.heroAuDepart?.some((h) => !h.pret)) {
    res.anomalies.push(`hero pas prêt à la fin de l'intro : ${res.intro.heroAuDepart.filter((h) => !h.pret).map((h) => h.src).join(", ")}`);
  }
  await attendre(700);

  // Descente, pas de 0,7 écran. On s'arrête AVANT le pied de page « projet
  // suivant » (sinon la page part — c'est testé à part).
  await page.evaluate(() => (window.__stab.mesure = true));
  const vh = (await page.evaluate(() => innerHeight)) || 800;
  const vus = new Map();
  for (let i = 0; i < 80; i++) {
    const avant = await page.evaluate(() => {
      const n = document.querySelector(".nextp");
      return { y: scrollY, max: document.documentElement.scrollHeight - innerHeight, nextp: n ? n.getBoundingClientRect().top : null };
    });
    if (avant.nextp != null && avant.nextp < vh * 1.4) break;
    if (avant.y >= avant.max - 2) break;
    await defiler(page, tactile, Math.round(vh * 0.7));
    await attendre(380);
    const r = await page.evaluate(releve, i).catch(() => null);
    if (!r) continue;
    res.pas++;
    if (r.vides.length) res.vides.push({ y: r.y, imgs: r.vides });
    for (const b of r.bloques) vus.set(b, (vus.get(b) ?? 0) + 1);
    if (r.debord > 1 && !res.anomalies.some((a) => a.startsWith("débordement"))) res.anomalies.push(`débordement horizontal ${r.debord}px à y=${r.y}`);
  }
  await page.evaluate(() => (window.__stab.mesure = false));
  // Un bloc vu non révélé sur DEUX relevés consécutifs (≥ 760 ms dans le cadre).
  res.bloques = [...vus.entries()].filter(([, n]) => n >= 2).map(([b]) => b);
  await attendre(1200);
  const bi = await page.evaluate(bilanImages).catch(() => ({ tard: [], cassees: [] }));
  res.tard = bi.tard.filter((t) => t.attente == null || t.attente > 150);
  res.cassees = bi.cassees;
  const st = await page.evaluate(() => ({ cls: +window.__stab.cls.toFixed(4), shifts: window.__stab.shifts.slice(0, 6), gaps: window.__stab.gaps, loafs: window.__stab.loafs.slice(0, 6) })).catch(() => null);
  if (st) Object.assign(res, st);
  res.anomalies.push(...anomaliesEtat(await etatGlobal(page)).filter((a) => !a.startsWith("URL")));
  res.conformite = await page.evaluate(conformite).catch(() => []);
  await page.close();
  return res;
}

/* ── Navigation interne : lien de la page, puis retour arrière ──────────── */
async function testerNavigation(ctx, tactile) {
  const page = await nouvellePage(ctx);
  const out = { erreurs: [], etapes: [] };
  page.on("pageerror", (e) => out.erreurs.push(`pageerror: ${e.message}`));
  await page.goto(BASE + "/", { waitUntil: "load" });
  await attendre(250);
  await page.keyboard.press("Escape").catch(() => {});
  await finIntro(page);
  await attendre(600);

  const suivre = async (selecteur, attendu) => {
    const ok = await page.evaluate((sel) => {
      const a = [...document.querySelectorAll(sel)].find((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
      if (!a) return false;
      a.scrollIntoView({ block: "center" });
      return true;
    }, selecteur);
    if (!ok) return out.etapes.push({ etape: `clic ${selecteur}`, anomalies: ["lien introuvable"] });
    await attendre(500);
    const t = Date.now();
    await page.locator(selecteur).filter({ visible: true }).first().click({ timeout: 5000 }).catch((e) => out.erreurs.push(`clic: ${e.message.split("\n")[0]}`));
    await page.waitForFunction((p) => location.pathname.replace(/\/+$/, "") === p, attendu, { timeout: 6000 }).catch(() => {});
    // La transition est finie quand la page est rendue à plat (ou au bout de 4 s).
    await page.waitForFunction(() => {
      const st = document.querySelector(".page-stage");
      return !document.documentElement.classList.contains("vt-page") && (!st || getComputedStyle(st).transform === "none");
    }, null, { timeout: 4000 }).catch(() => {});
    await attendre(600);
    const e = await etatGlobal(page);
    out.etapes.push({ etape: `clic → ${attendu}`, ms: Date.now() - t, anomalies: anomaliesEtat(e, attendu).concat(e.y > 2 ? [`arrivée à y=${e.y} au lieu du haut`] : []), vides: (await page.evaluate(releve, 0)).vides });
  };

  await suivre('a[href="/travail"]', "/travail");
  await suivre('a[href="/projet9"], a[href="/projet9/"]', "/projet9");
  await page.goBack().catch(() => {});
  await attendre(2200);
  const e = await etatGlobal(page);
  out.etapes.push({ etape: "retour arrière → /travail", anomalies: anomaliesEtat(e, "/travail"), vides: (await page.evaluate(releve, 0)).vides });
  await page.goForward().catch(() => {});
  await attendre(2200);
  const e2 = await etatGlobal(page);
  out.etapes.push({ etape: "avance → /projet9", anomalies: anomaliesEtat(e2, "/projet9") });
  await page.close();
  return out;
}

/* ── Le menu : ouverture, choix d'une page, état final ───────────────────── */
async function testerMenu(ctx) {
  const page = await nouvellePage(ctx);
  const out = { erreurs: [], etapes: [] };
  page.on("pageerror", (e) => out.erreurs.push(`pageerror: ${e.message}`));
  await page.goto(BASE + "/projet9", { waitUntil: "load" });
  await attendre(250);
  await page.keyboard.press("Escape").catch(() => {});
  await finIntro(page);
  await attendre(600);
  // Ouvert à mi-page : le cas le plus exigeant (la carte reprend la page là où elle est).
  await page.evaluate(() => window.scrollTo(0, innerHeight * 2));
  await attendre(700);
  for (const [lien, attendu] of [["/travail", "/travail"], ["/apropos", "/apropos"]]) {
    await page.locator(".header-nav-btn.more").first().click({ timeout: 5000 }).catch((e) => out.erreurs.push(`ouverture: ${e.message.split("\n")[0]}`));
    await page.waitForFunction(() => document.querySelector(".fs-menu.is-visible"), null, { timeout: 4000 }).catch(() => out.erreurs.push("le menu ne s'ouvre pas"));
    await attendre(900);
    await page.locator(`.menu-link[href="${lien}"]`).first().click({ timeout: 5000 }).catch((e) => out.erreurs.push(`lien: ${e.message.split("\n")[0]}`));
    await page.waitForFunction((p) => location.pathname.replace(/\/+$/, "") === p, attendu, { timeout: 6000 }).catch(() => {});
    await page.waitForFunction(() => !document.querySelector(".fs-menu.is-visible"), null, { timeout: 5000 }).catch(() => {});
    await attendre(900);
    const e = await etatGlobal(page);
    const a = anomaliesEtat(e, attendu);
    if (e.menuOuvert) a.push("menu resté ouvert");
    if (e.y > 2) a.push(`arrivée à y=${e.y} au lieu du haut`);
    out.etapes.push({ etape: `menu → ${attendu}`, anomalies: a });
  }
  await page.close();
  return out;
}

/* ── Redimensionnement en pleine lecture (bureau → téléphone → bureau) ──── */
async function testerRedimension(ctx, conf) {
  if (conf.isMobile) return null;
  const page = await nouvellePage(ctx);
  const out = { erreurs: [], etapes: [] };
  page.on("pageerror", (e) => out.erreurs.push(`pageerror: ${e.message}`));
  for (const route of ["/", "/projet9", "/apropos"]) {
    await page.goto(BASE + route, { waitUntil: "load" });
    await attendre(250);
    await page.keyboard.press("Escape").catch(() => {});
    await finIntro(page);
    await page.evaluate(() => window.scrollTo(0, innerHeight * 3));
    await attendre(500);
    for (const vp of [{ width: 390, height: 844 }, { width: 820, height: 1180 }, conf.viewport]) {
      await page.setViewportSize(vp);
      await attendre(700);
    }
    const e = await etatGlobal(page);
    out.etapes.push({ etape: `redimension ${route}`, anomalies: anomaliesEtat(e).filter((a) => !a.startsWith("URL")) });
  }
  await page.close();
  return out;
}

/* ── La chaîne « projet suivant » : deux passages de suite ──────────────── */
async function testerChaine(ctx, tactile) {
  const page = await nouvellePage(ctx);
  const out = { erreurs: [], passages: [] };
  page.on("pageerror", (e) => out.erreurs.push(`pageerror: ${e.message}`));
  await page.goto(BASE + "/projet9", { waitUntil: "load" });
  await attendre(250);
  await page.keyboard.press("Escape").catch(() => {});
  await finIntro(page);
  await attendre(600);
  const ordre = ["/projet9", "/projet8", "/projet4"];
  for (let k = 0; k < 2; k++) {
    const depart = ordre[k];
    const cible = ordre[k + 1];
    // Jusqu'au haut du pied de page, d'un coup (on ne teste pas la page ici).
    await page.evaluate(() => {
      const n = document.querySelector(".nextp");
      if (n) window.scrollTo(0, n.getBoundingClientRect().top + scrollY - innerHeight);
    });
    await attendre(500);
    const t = Date.now();
    let parti = false;
    for (let i = 0; i < 90 && !parti; i++) {
      // Plus aucun geste une fois le départ engagé : on mesure la page
      // d'arrivée telle que le pied de page la rend, pas notre défilement.
      const engage = await page.evaluate(() => !!document.querySelector(".nextp__panel.is-leaving, .nextp__panel.is-cover"));
      if (!engage) await defiler(page, tactile, 70);
      await attendre(45);
      parti = await page.evaluate((c) => location.pathname.replace(/\/+$/, "") === c, cible);
    }
    await attendre(1600);
    const e = await etatGlobal(page);
    out.passages.push({
      de: depart,
      vers: cible,
      parti,
      ms: Date.now() - t,
      anomalies: anomaliesEtat(e, cible).concat(e.y > 2 ? [`arrivée à y=${e.y} au lieu du haut`] : [])
    });
    if (!parti) break;
  }
  await page.close();
  return out;
}

async function contexte(engine, device) {
  const conf = { ...APPAREILS[device] };
  if (engine === "firefox") delete conf.isMobile;
  if (REDUIT) conf.reducedMotion = "reduce";
  const browser = await MOTEURS[engine].launch();
  const ctx = await browser.newContext(conf);
  await ctx.addInitScript(instrumenter);
  if (LENT && engine !== "chromium") {
    await ctx.route(/\.(webp|jpe?g|png|avif|mp4)(\?.*)?$/, async (route) => {
      await attendre(450);
      route.continue().catch(() => {});
    });
  }
  ctx.__brider = LENT && engine === "chromium";
  const tactile = !!conf.hasTouch;
  const res = { engine, device, reduit: REDUIT, viewport: conf.viewport, pages: [], navigation: null, chaine: null };
  for (const [i, route] of ROUTES.entries()) {
    const introNaturelle = i === 0 || route === "/projet9" || route === "/travail";
    try {
      res.pages.push(await testerPage(ctx, route, { tactile, introNaturelle }));
    } catch (e) {
      res.pages.push({ route, anomalies: [`échec du test : ${e.message.split("\n")[0]}`], erreurs: [], requetes: [] });
    }
    process.stdout.write(".");
  }
  if (!SANS_NAV) {
    try { res.navigation = await testerNavigation(ctx, tactile); } catch (e) { res.navigation = { echec: e.message.split("\n")[0] }; }
  }
  if (!SANS_CHAINE) {
    try { res.chaine = await testerChaine(ctx, tactile); } catch (e) { res.chaine = { echec: e.message.split("\n")[0] }; }
  }
  if (!SANS_NAV) {
    try { res.menu = await testerMenu(ctx); } catch (e) { res.menu = { echec: e.message.split("\n")[0] }; }
    try { res.redimension = await testerRedimension(ctx, conf); } catch (e) { res.redimension = { echec: e.message.split("\n")[0] }; }
  }
  await browser.close();
  return res;
}

function resume(r) {
  const lignes = [];
  const p95 = (arr) => {
    if (!arr.length) return 0;
    const s = [...arr].sort((a, b) => a - b);
    return s[Math.floor(s.length * 0.95)] ?? s[s.length - 1];
  };
  lignes.push(`\n══ ${r.engine} · ${r.device}${r.reduit ? " · mouvement réduit" : ""}${LENT ? " · réseau lent" : ""} (${r.viewport.width}×${r.viewport.height})`);
  for (const p of r.pages) {
    const pb = [];
    if (p.erreurs?.length) pb.push(`${p.erreurs.length} erreur(s) JS : ${[...new Set(p.erreurs)].slice(0, 2).join(" | ")}`);
    if (p.requetes?.length) pb.push(`${p.requetes.length} requête(s) en échec : ${[...new Set(p.requetes)].slice(0, 3).join(" | ")}`);
    if (p.cassees?.length) pb.push(`images cassées : ${p.cassees.join(", ")}`);
    const tard = (p.tard || []).filter((t) => t.attente == null || t.attente > 300);
    if (tard.length) pb.push(`${tard.length} image(s) vide(s) à l'écran > 300 ms : ${tard.slice(0, 4).map((t) => `${t.src.split("/").pop()} (${t.attente ?? "jamais"}ms, ${t.lazy ?? "eager"})`).join(", ")}`);
    if (p.bloques?.length) pb.push(`${p.bloques.length} arrivée(s) bloquée(s) : ${p.bloques.slice(0, 3).join(" | ")}`);
    if (p.cls != null && p.cls > 0.05) pb.push(`CLS ${p.cls} (${(p.shifts || []).map((s) => `${s.v}@${s.t}ms ${s.nodes.join("+")}`).slice(0, 3).join(" ; ")})`);
    const gros = (p.gaps || []).filter((g) => g > 100);
    if (gros.length) pb.push(`${gros.length} image(s) > 100 ms pendant le défilement (max ${Math.max(...gros)} ms, p95 ${p95(p.gaps)} ms)`);
    for (const a of p.anomalies || []) pb.push(a);
    for (const c of p.conformite || []) pb.push(`conformité : ${c}`);
    lignes.push(`  ${pb.length ? "✗" : "✓"} ${p.route.padEnd(24)} intro ${p.intro?.fin ?? "?"} ms · ${p.pas ?? 0} pas${pb.length ? "\n      - " + pb.join("\n      - ") : ""}`);
  }
  if (r.navigation) {
    if (r.navigation.echec) lignes.push(`  ✗ navigation : ${r.navigation.echec}`);
    else for (const e of r.navigation.etapes) lignes.push(`  ${e.anomalies.length ? "✗" : "✓"} nav ${e.etape}${e.ms ? ` (${e.ms} ms)` : ""}${e.anomalies.length ? " — " + e.anomalies.join(" ; ") : ""}${e.vides?.length ? ` · vides : ${e.vides.join(", ")}` : ""}`);
    if (r.navigation.erreurs?.length) lignes.push(`  ✗ nav erreurs : ${r.navigation.erreurs.join(" | ")}`);
  }
  for (const [nom, bloc] of [["menu", r.menu], ["redimension", r.redimension]]) {
    if (!bloc) continue;
    if (bloc.echec) lignes.push(`  ✗ ${nom} : ${bloc.echec}`);
    else for (const e of bloc.etapes) lignes.push(`  ${e.anomalies.length ? "✗" : "✓"} ${e.etape}${e.anomalies.length ? " — " + e.anomalies.join(" ; ") : ""}`);
    if (bloc.erreurs?.length) lignes.push(`  ✗ ${nom} erreurs : ${bloc.erreurs.join(" | ")}`);
  }
  if (r.chaine) {
    if (r.chaine.echec) lignes.push(`  ✗ chaîne : ${r.chaine.echec}`);
    else for (const c of r.chaine.passages) lignes.push(`  ${c.parti && !c.anomalies.length ? "✓" : "✗"} projet suivant ${c.de} → ${c.vers}${c.parti ? "" : " — PAS PARTI"}${c.anomalies.length ? " — " + c.anomalies.join(" ; ") : ""}`);
    if (r.chaine.erreurs?.length) lignes.push(`  ✗ chaîne erreurs : ${r.chaine.erreurs.join(" | ")}`);
  }
  return lignes.join("\n");
}

mkdirSync(SORTIE, { recursive: true });
const combos = ENGINES.flatMap((e) => DEVICES.map((d) => [e, d]));
console.log(`Batterie : ${combos.length} contexte(s) × ${ROUTES.length} page(s) sur ${BASE}`);
/** Contextes menés en même temps (`--parallele N`, 3 par défaut) : au-delà,
 *  les navigateurs se disputent le processeur et les mesures de temps
 *  (images saccadées, durée de l'intro) ne veulent plus rien dire. */
const PARALLELE = Math.max(1, +(ARGS.parallele ?? 3));
let prochain = 0;
const resultats = new Array(combos.length);
await Promise.all(
  Array.from({ length: Math.min(PARALLELE, combos.length) }, async () => {
    while (prochain < combos.length) {
      const k = prochain++;
      resultats[k] = await mener(...combos[k]);
    }
  })
);

async function mener(e, d) {
  {
    try {
      const r = await contexte(e, d);
      writeFileSync(join(SORTIE, `${e}-${d}${REDUIT ? "-reduit" : ""}${LENT ? "-lent" : ""}.json`), JSON.stringify(r, null, 2));
      return r;
    } catch (err) {
      return { engine: e, device: d, viewport: APPAREILS[d].viewport, pages: [{ route: "*", anomalies: [`contexte en échec : ${err.message.split("\n")[0]}`] }] };
    }
  }
}
const texte = resultats.map(resume).join("\n");
console.log("\n" + texte);
writeFileSync(join(SORTIE, `resume${REDUIT ? "-reduit" : ""}${LENT ? "-lent" : ""}.txt`), texte);
