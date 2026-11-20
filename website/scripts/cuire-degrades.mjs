// ───────────────────────────────────────────────────────────────────────────
//  Précalcul des dégradés « peints » de SiteGradient (arête, dunes, ellipses).
//
//    npx vite preview --port 4173   (dans un autre terminal, après un build)
//    npm run degrades
//
//  Pourquoi (2026-11-20) : ces fonds fondaient deux images et un dégradé en
//  `background-blend-mode: hue`. Safari calcule cette fusion pixel par pixel,
//  sur le processeur, au premier affichage — une image sautée à l'entrée de
//  « Trois pôles » sur la home, à chaque premier passage. Rendue une fois ici
//  par WebKit (le moteur de Safari), la fusion devient une simple image.
//  Pour changer les couleurs : modifier DECLARATIONS ci-dessous, relancer.
// ───────────────────────────────────────────────────────────────────────────
import { webkit } from "playwright";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.BASE ?? "http://localhost:4173";
const COMMUN = `--deg-fond: #050709; --deg-1: #5768ff; --deg-2: #d0dbff; --deg-3: #8f93ff;
  background-color: #050709; background-size: cover; background-position: center;
  background-repeat: no-repeat; background-blend-mode: hue, normal, normal;`;
const DECLARATIONS = {
  arete: `background-image: linear-gradient(155deg, color-mix(in srgb, var(--deg-1) 100%, transparent) 0%, color-mix(in srgb, color-mix(in oklab, var(--deg-3) 35%, var(--deg-1)) 100%, transparent) 50%, color-mix(in srgb, var(--deg-1) 100%, transparent) 100%), url(/degrades/arete-1.webp), url(/degrades/arete-2.webp);`,
  dunes: `background-image: linear-gradient(155deg, color-mix(in srgb, var(--deg-1) 100%, transparent) 0%, color-mix(in srgb, color-mix(in oklab, var(--deg-3) 35%, var(--deg-1)) 100%, transparent) 50%, color-mix(in srgb, var(--deg-1) 100%, transparent) 100%), url(/degrades/dunes-1.webp), url(/degrades/dunes-2.webp);`,
  ellipses: `background-image: linear-gradient(155deg, color-mix(in srgb, var(--deg-1) 100%, transparent) 0%, color-mix(in srgb, color-mix(in oklab, var(--deg-3) 35%, var(--deg-1)) 100%, transparent) 50%, color-mix(in srgb, var(--deg-1) 100%, transparent) 100%), url(/degrades/ellipses-1.webp), url(/degrades/ellipses-2.webp);`
};

const tmp = mkdtempSync(join(tmpdir(), "degrades-"));
const b = await webkit.launch();
const p = await (await b.newContext({ viewport: { width: 1120, height: 1400 }, deviceScaleFactor: 1 })).newPage();
await p.goto(`${BASE}/robots.txt`);
for (const [nom, image] of Object.entries(DECLARATIONS)) {
  await p.setContent(
    `<body style="margin:0;background:#050709"><div id="g" style="width:1120px;height:1400px;${COMMUN} ${image}"></div></body>`,
    { waitUntil: "load" }
  );
  await p.waitForTimeout(800);
  const png = join(tmp, `${nom}.png`);
  await p.locator("#g").screenshot({ path: png });
  execFileSync("cwebp", ["-quiet", "-q", "92", png, "-o", join(RACINE, "public", "degrades", `${nom}-cuit.webp`)]);
  console.log(`public/degrades/${nom}-cuit.webp`);
}
await b.close();
