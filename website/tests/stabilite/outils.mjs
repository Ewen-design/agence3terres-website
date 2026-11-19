// Outils communs aux batteries de stabilité (`battery.mjs`, `chaos.mjs`) :
// l'état global de la page après un geste, et ce qui n'y est pas normal.

export const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

export async function finIntro(page, timeout = 12000) {
  try {
    await page.waitForFunction(() => !document.getElementById("site-intro-loader"), null, { timeout, polling: 100 });
    return true;
  } catch {
    return false;
  }
}

export async function etatGlobal(page) {
  return page.evaluate(() => {
    const html = document.documentElement;
    const pw = document.querySelector(".page-wrapper");
    const ps = document.querySelector(".page-stage");
    const csPw = pw ? getComputedStyle(pw) : null;
    const csPs = ps ? getComputedStyle(ps) : null;
    const menuOuvert = !!document.querySelector(".fs-menu.is-visible");
    return {
      path: location.pathname,
      y: Math.round(scrollY),
      // Défilement interne (écran tactile) : le document est toujours en
      // `overflow: hidden` par construction ; le verrou se lit sur le bloc.
      htmlOverflow: html.classList.contains("defilement-interne")
        ? getComputedStyle(document.querySelector(".defileur")).overflowY
        : getComputedStyle(html).overflowY,
      bodyOverflow: html.classList.contains("defilement-interne") ? "auto" : getComputedStyle(document.body).overflowY,
      introActive: html.classList.contains("site-intro-active"),
      menuOuvert,
      pageOpacity: csPw ? +csPw.opacity : null,
      pageFilter: csPw ? csPw.filter : null,
      stageTransform: csPs ? csPs.transform : null,
      stageClip: csPs ? csPs.clipPath : null,
      nextCover: !!document.querySelector(".nextp__panel.is-cover"),
      debord: html.scrollWidth - innerWidth
    };
  });
}

export function anomaliesEtat(e, attendu) {
  const a = [];
  if (attendu && e.path.replace(/\/+$/, "") !== attendu.replace(/\/+$/, "")) a.push(`URL ${e.path} au lieu de ${attendu}`);
  if (e.htmlOverflow === "hidden" && !e.menuOuvert) a.push("défilement verrouillé (html overflow hidden)");
  if (e.bodyOverflow === "hidden" && !e.menuOuvert) a.push("défilement verrouillé (body overflow hidden)");
  if (e.introActive) a.push("intro encore active");
  if (e.pageOpacity != null && e.pageOpacity < 0.99) a.push(`page à opacité ${e.pageOpacity}`);
  if (e.pageFilter && e.pageFilter !== "none") a.push(`filtre résiduel sur la page : ${e.pageFilter}`);
  if (e.stageTransform && e.stageTransform !== "none") a.push(`transform résiduel sur .page-stage : ${e.stageTransform}`);
  if (e.stageClip && e.stageClip !== "none") a.push(`découpe résiduelle sur .page-stage : ${e.stageClip}`);
  if (e.nextCover) a.push("panneau « projet suivant » resté en couverture");
  if (e.debord > 1) a.push(`débordement horizontal ${e.debord}px`);
  return a;
}
