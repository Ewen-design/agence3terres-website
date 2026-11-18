// ───────────────────────────────────────────────────────────────────────────
//  Sonde de FLUIDITÉ du défilement à la molette (bureau, Lenis).
//
//    npm run test:fluidite                       (WebKit et Chromium, 6 pages)
//    npm run test:fluidite -- --engines webkit --routes /,/apropos
//
//  Une molette continue (crans réguliers) descend toute la page, la souris au
//  centre — donc au-dessus des cartes, rails et blocs collants qui passent.
//  Relevé image par image : position, vitesse. Ce qui est signalé :
//    • ARRÊT : la page ne bouge plus pendant ≥ 4 images alors que la molette
//      tourne encore (le « scroll qui s'arrête sans raison ») ;
//    • À-COUP : la vitesse chute de plus de moitié d'une image à l'autre puis
//      repart (le « ralentit sans raison ») ;
//    • RECUL : la page remonte alors qu'on descend (deux pilotes qui se battent) ;
//    • images longues (> 34 ms).
//  Avec Lenis, le défilement est piloté par JavaScript : contrairement au
//  défilement natif de Safari, WebKit sous Playwright le reproduit fidèlement.
// ───────────────────────────────────────────────────────────────────────────
import { chromium, webkit, firefox } from "playwright";
import { attendre, finIntro } from "./outils.mjs";

const ARGS = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith("--")) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith("--") ? all[i + 1] : "1"]);
    return acc;
  }, [])
);
const BASE = ARGS.base ?? "http://localhost:4173";
const MOTEURS = { chromium, webkit, firefox };
const ENGINES = (ARGS.engines ?? "webkit,chromium").split(",");
const ROUTES = (ARGS.routes ?? "/,/apropos,/services,/services/digital,/travail,/projet9").split(",");
const CRAN = +(ARGS.cran ?? 100);
const RYTHME = +(ARGS.rythme ?? 50);

/** Un ralentissement qui suit un TROU dans les crans de molette n'est pas un
 *  défaut du site : sans consigne, Lenis ralentit, c'est son rôle. */
const apresTrou = (t, crans, rythme) => {
  const avant = crans.filter((c) => c <= t);
  if (avant.length < 2) return true;
  const dernier = avant[avant.length - 1];
  return t - dernier > rythme * 1.6 || dernier - avant[avant.length - 2] > rythme * 1.6;
};

function analyser(rel, sections, crans, bas) {
  const pbs = [];
  let arret = 0;
  for (let i = 1; i < rel.length; i++) {
    const [t, y, enCours] = rel[i];
    const v = y - rel[i - 1][1];
    const dt = t - rel[i - 1][0];
    const ou = sections(y);
    if (dt > 34) pbs.push({ type: "image longue", t, y, detail: `${Math.round(dt)} ms`, ou });
    if (v < -0.5) pbs.push({ type: "recul", t, y, detail: `${v.toFixed(1)} px`, ou });
    // Immobile EN BAS DE PAGE : la molette tourne encore, mais il n'y a plus
    // rien à défiler — ce n'est pas un arrêt.
    if (enCours && Math.abs(v) < 0.05 && y < bas - 2) {
      arret++;
      if (arret === 4) pbs.push({ type: "arrêt", t, y, detail: "≥ 4 images immobiles, molette en cours", ou });
    } else arret = 0;
    if (i >= 2 && enCours) {
      const vp = rel[i - 1][1] - rel[i - 2][1];
      const vs = rel[i + 1] ? rel[i + 1][1] - y : v;
      if (vp > 6 && v < vp * 0.45 && vs > v * 1.6 && !apresTrou(t, crans, RYTHME))
        pbs.push({ type: "à-coup", t, y, detail: `${vp.toFixed(1)} → ${v.toFixed(1)} → ${vs.toFixed(1)} px/image`, ou });
    }
  }
  return pbs;
}

for (const engine of ENGINES) {
  const browser = await MOTEURS[engine].launch();
  for (const route of ROUTES) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const erreurs = [];
    page.on("pageerror", (e) => erreurs.push(e.message));
    await page.goto(BASE + route, { waitUntil: "load" });
    await attendre(250);
    await page.keyboard.press("Escape").catch(() => {});
    await finIntro(page);
    await attendre(800);
    // Toutes les images chargées d'abord : on mesure le défilement, pas le réseau.
    await page.evaluate(async () => {
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y < h; y += 900) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
      window.scrollTo(0, 0);
      window.lenis?.scrollTo(0, { immediate: true, force: true });
    });
    await attendre(1500);
    const lenis = await page.evaluate(() => !!window.lenis);
    await page.mouse.move(720, 450);
    const fin = await page.evaluate(() => {
      const n = document.querySelector(".nextp");
      return (n ? n.getBoundingClientRect().top + scrollY - innerHeight * 1.3 : document.documentElement.scrollHeight - innerHeight) - 50;
    });
    await page.evaluate(() => {
      window.__rel = [];
      window.__crans = [];
      window.addEventListener("wheel", (e) => window.__crans.push(e.timeStamp), { passive: true });
      window.__molette = true;
      const f = (t) => {
        window.__rel.push([t, window.scrollY, window.__molette]);
        if (window.__rel.length < 5000 && !window.__stop) requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    });
    // Crans réguliers : la position n'est relue que tous les 12 crans, pour ne
    // pas espacer les crans d'un aller-retour à chaque fois.
    for (let k = 0; k < 400; k++) {
      await page.mouse.wheel(0, CRAN);
      await attendre(RYTHME);
      if (k % 12 === 11 && (await page.evaluate(() => scrollY)) >= fin) break;
    }
    await page.evaluate(() => (window.__molette = false));
    await attendre(800);
    const { rel, crans } = await page.evaluate(() => {
      window.__stop = true;
      return { rel: window.__rel, crans: window.__crans };
    });
    // Repères : quelle section est au centre de l'écran à une position donnée.
    const bornes = await page.evaluate(() =>
      [...document.querySelectorAll(".page-wrapper section, .page-wrapper > div > *")]
        .map((s) => {
          const r = s.getBoundingClientRect();
          return { top: r.top + scrollY, bottom: r.bottom + scrollY, nom: (s.className || s.tagName).toString().split(" ")[0].slice(0, 28) };
        })
        .filter((b) => b.bottom - b.top > 200)
    );
    const sections = (y) => {
      const c = y + 450;
      const b = bornes.filter((x) => c >= x.top && c <= x.bottom).sort((a, z) => (a.bottom - a.top) - (z.bottom - z.top))[0];
      return b ? b.nom : "?";
    };
    const bas = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    const pbs = analyser(rel, sections, crans, bas);
    const parType = {};
    for (const p of pbs) parType[p.type] = (parType[p.type] ?? 0) + 1;
    const lignes = Object.entries(parType).map(([t, n]) => `${t} ×${n}`).join(", ");
    console.log(`${engine.padEnd(8)} ${route.padEnd(18)} Lenis ${lenis ? "oui" : "non"} · ${rel.length} images · ${pbs.length ? "✗ " + lignes : "✓ fluide"}${erreurs.length ? " · erreurs JS : " + erreurs.join(" | ") : ""}`);
    for (const p of pbs.filter((x) => x.type !== "image longue").slice(0, 6)) console.log(`      ${p.type} à y=${Math.round(p.y)} (${p.ou}) : ${p.detail}`);
    await ctx.close();
  }
  await browser.close();
}
