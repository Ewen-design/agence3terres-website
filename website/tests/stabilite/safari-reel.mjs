// ───────────────────────────────────────────────────────────────────────────
//  Fluidité dans le VRAI Safari du Mac (2026-11-19), par WebDriver.
//
//  Le WebKit de Playwright ne défile pas comme Safari (pas de défilement
//  asynchrone, pas de composition sur la carte graphique) : les saccades que
//  le client voit sur Safari bureau n'y apparaissent pas. Ici, Safari lui-même.
//
//  Prérequis (une fois) : Safari → Réglages → Développeur → « Autoriser
//  l'automatisation à distance », `safaridriver --enable` (mot de passe admin),
//  puis QUITTER Safari (le réglage n'est lu qu'au lancement). Ensuite, dans un
//  autre terminal :
//    safaridriver -p 4447
//    node tests/stabilite/safari-reel.mjs [--base http://localhost:4173] [--routes /,/apropos]
//
//  Le défilement passe par de VRAIS événements de molette (WheelEvent
//  synthétiques envoyés à la page, que Lenis traite comme ceux du pavé), au
//  rythme d'un pavé tactile : des crans réguliers, puis une pause. Chaque image
//  est horodatée par `requestAnimationFrame` ; on relève les images longues
//  (> 20 ms, > 33 ms) et, pour chacune, le bloc de la page alors au milieu de
//  l'écran — c'est ce qui dit OÙ ça saccade.
// ───────────────────────────────────────────────────────────────────────────
const ARGS = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith("--")) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith("--") ? all[i + 1] : "1"]);
    return acc;
  }, [])
);
const DRIVER = ARGS.driver ?? "http://localhost:4447";
const BASE = ARGS.base ?? "http://localhost:4173";
const ROUTES = (ARGS.routes ?? "/,/apropos,/services,/services/digital,/travail,/projet9,/projet4,/projet3").split(",");
// `--essais base,x` : chaque page est mesurée aussi avec `?essai=x` (pour
// comparer avec un interrupteur posé le temps d'un essai ; aucun en place).
const ESSAIS = (ARGS.essais ?? "base").split(",");

async function wd(method, path, body) {
  const r = await fetch(DRIVER + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
  const j = await r.json();
  if (j.value?.error) throw new Error(`${j.value.error}: ${j.value.message}`);
  return j.value;
}

const session = await wd("POST", "/session", { capabilities: { alwaysMatch: { browserName: "safari" } } });
const sid = session.sessionId;
const exec = (script, args = []) => wd("POST", `/session/${sid}/execute/async`, { script, args });
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  // Une page longue dépasse les 30 s accordées par défaut à un script (et
  // Safari ralentit une fenêtre masquée : ne pas utiliser le Mac pendant la mesure).
  await wd("POST", `/session/${sid}/timeouts`, { script: 180000 });
  await wd("POST", `/session/${sid}/window/rect`, { width: 1440, height: 900, x: 0, y: 0 });
  for (const route of ROUTES) for (const essai of ESSAIS) {
    const q = essai === "base" ? "" : `${route.includes("?") ? "&" : "?"}essai=${essai}`;
    await wd("POST", `/session/${sid}/url`, { url: BASE + route + q });
    await attendre(5000);
    const res = await exec(`
      const done = arguments[arguments.length - 1];
      const max = document.documentElement.scrollHeight - innerHeight;
      const images = [];
      let last = performance.now(), running = true;
      const bloc = () => {
        let el = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
        for (let k = 0; k < 8 && el && !(el.className && typeof el.className === "string" && el.className.trim()); k++) el = el.parentElement;
        return el ? (el.className + "").trim().split(/\\s+/)[0].slice(0, 32) : "?";
      };
      const pas = (t) => { const d = t - last; last = t; if (running) { images.push([d, scrollY, d > 20 ? bloc() : ""]); requestAnimationFrame(pas); } };
      requestAnimationFrame(pas);
      const cible = document.documentElement;
      // Sans Lenis, une molette synthétique ne fait rien défiler : on défile
      // alors par petits pas, au même rythme (moins fidèle que la vraie molette).
      const sansLenis = !window.lenis;
      let i = 0;
      // Crans de pavé : 18 événements de 40 px toutes les 16 ms, puis 260 ms de pause.
      const crans = setInterval(() => {
        if (scrollY >= max - 5 || i > 6000) {
          clearInterval(crans);
          setTimeout(() => { running = false; done(images); }, 900);
          return;
        }
        const phase = i % 34;
        if (phase < 18) {
          if (sansLenis) window.scrollBy(0, 40);
          else cible.dispatchEvent(new WheelEvent("wheel", { deltaY: 40, deltaMode: 0, bubbles: true, cancelable: true, clientX: innerWidth / 2, clientY: innerHeight / 2 }));
        }
        i++;
      }, 16);
    `);
    const d = res.map((r) => r[0]).filter((x) => x < 1000);
    const longues = res.filter((r) => r[0] > 20 && r[0] < 1000);
    const tres = res.filter((r) => r[0] > 33 && r[0] < 1000);
    const parBloc = {};
    for (const [ms, , b] of longues) parBloc[b] = (parBloc[b] || 0) + 1;
    const tri = d.slice().sort((a, b) => a - b);
    const p95 = tri[Math.floor(tri.length * 0.95)] ?? 0;
    const med = tri[Math.floor(tri.length / 2)] ?? 0;
    // Images « manquées » : plus de 1,5 intervalle d'affichage (médiane).
    const manquees = d.filter((x) => x > med * 1.5).length;
    if (ARGS.detail) {
      const lignes = res.filter((r) => r[0] > med * 1.5 && r[0] < 1000).map((r) => `${r[0].toFixed(0)}ms@${Math.round(r[1])}:${r[2]}`);
      console.log("    " + lignes.join("  "));
    }
    console.log(
      `${(route + (essai === "base" ? "" : " [" + essai + "]")).padEnd(30)} ${d.length} images · médiane ${med.toFixed(1)} · p95 ${p95.toFixed(1)} ms · manquées ${manquees} (${((100 * manquees) / d.length).toFixed(1)} %) · > 33 ms : ${tres.length}` +
        (longues.length ? `\n    où : ${Object.entries(parBloc).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([b, n]) => `${b} ×${n}`).join(", ")}` : "")
    );
  }
} finally {
  await wd("DELETE", `/session/${sid}`).catch(() => {});
}
