// ───────────────────────────────────────────────────────────────────────────
//  Images VIDES à l'écran à rythme humain (2026-11-19). La batterie attend la
//  fin du chargement avant de défiler : sur un débit limité tout est alors
//  déjà là. Ici on défile d'un écran toutes les 1,1 s dès l'intro passée, et
//  on cumule, image par image, le temps passé vide DANS le cadre (une image
//  masquée par un parent — onglet inactif, carte repliée — ne compte pas).
//
//    node tests/stabilite/serveur.mjs /tmp/site 4381 --debit 300 --latence 60
//    node tests/stabilite/vides.mjs http://localhost:4381 /projet4,/projet9 [mobile|desktop] [webkit|chromium]
// ───────────────────────────────────────────────────────────────────────────
import { webkit, chromium } from "playwright";
const BASE = process.argv[2] ?? "http://localhost:4381"; const routes = (process.argv[3] ?? "/projet9").split(","); const mobile = process.argv[4] !== "desktop";
const moteur = process.argv[5] === "chromium" ? chromium : webkit;
const b = await moteur.launch();
let totalVide = 0, totalN = 0;
for (const route of routes) {
  const ctx = await b.newContext(mobile ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 } : { viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction(() => !document.documentElement.classList.contains("site-intro-active") && !document.getElementById("site-intro-loader")?.offsetParent, null, { timeout: 20000 }).catch(() => {});
  await page.evaluate(() => {
    window.__vides = {};
    const t0 = performance.now();
    const step = () => {
      const now = performance.now() - t0;
      for (const img of document.querySelectorAll("img")) {
        const r = img.getBoundingClientRect();
        if (r.width < 80 || r.height < 80 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
        // Masquée par un PARENT (onglet inactif, carte repliée) : pas un trou.
        // L'image elle-même à 0 pendant son arrivée, si.
        let el = img.parentElement, cache = false;
        const csi = getComputedStyle(img);
        if (csi.visibility === "hidden" || csi.display === "none" || (+csi.opacity < 0.05 && !img.dataset.arrivee)) cache = true;
        for (let k = 0; k < 6 && el && !cache; k++, el = el.parentElement) { const cs = getComputedStyle(el); if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity < 0.05) cache = true; }
        if (cache) continue;
        const vide = !(img.complete && img.naturalWidth > 0) || img.dataset.arrivee === "attente";
        const k = (img.currentSrc || img.src).split("/").pop().slice(0, 40);
        const v = (window.__vides[k] ??= { vide: 0, depuis: null });
        if (vide) { if (v.depuis === null) v.depuis = now; } else if (v.depuis !== null) { v.vide += now - v.depuis; v.depuis = null; }
      }
      requestAnimationFrame(step);
    };
    step();
  });
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h - 2000; y += 844 * 0.9) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(1100);
  }
  const v = await page.evaluate(() => { const now = performance.now(); return Object.entries(window.__vides).map(([k, v]) => [k, Math.round(v.vide + (v.depuis !== null ? 1 : 0) * 0)]).filter(([, d]) => d > 250); });
  const somme = v.reduce((a, [, d]) => a + d, 0);
  totalVide += somme; totalN += v.length;
  console.log(`${route.padEnd(10)} ${v.length} image(s) vides > 250 ms, cumul ${somme} ms : ${v.slice(0, 5).map(([k, d]) => `${k} ${d}`).join(", ")}`);
  await ctx.close();
}
console.log(`TOTAL ${totalN} images, ${totalVide} ms`);
await b.close();
