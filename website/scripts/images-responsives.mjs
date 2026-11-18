// ───────────────────────────────────────────────────────────────────────────
//  Variantes responsives des images du site.
//
//    npm run images
//
//  Pourquoi (2026-11-18) : le site servait chaque image à sa taille d'origine,
//  jusqu'à 5 179 px de large. Le poids du fichier restait raisonnable (WebP),
//  mais c'est la taille DÉCODÉE qui compte : 4 000 × 3 000 px = 48 Mo de
//  mémoire, pour une carte de 400 px sur un téléphone. Safari iOS décode ces
//  images sur le fil principal (à-coups au défilement) et, quand la mémoire
//  sature, en jette du cache — l'image redevient vide en remontant.
//
//  Ce script lit toutes les images que le code référence (`/images/…`, et les
//  affiches de `/videos/…`), et écrit pour chacune des versions plus petites
//  dans `public/images/_r/` (cwebp, Homebrew). Le manifeste
//  `src/lib/images/variantes.json` dit lesquelles existent ; le préprocesseur
//  Svelte (`src/lib/images/preprocess.js`) s'en sert pour poser `srcset`,
//  `sizes`, `width` et `height` sur chaque `<img>` au moment du build.
//
//  Une image remplacée sous le même nom est détectée (empreinte du fichier) :
//  ses variantes sont refaites au prochain passage, et d'ici là le build les
//  ignore (il retombe sur l'original) plutôt que de servir l'ancienne image.
// ───────────────────────────────────────────────────────────────────────────
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, unlinkSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { cpus } from "node:os";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(RACINE, "public");
const SORTIE = join(PUBLIC, "images", "_r");
const MANIFESTE = join(RACINE, "src", "lib", "images", "variantes.json");

/** Largeurs produites. 1280 couvre un téléphone en pleine largeur (390 × 3),
 *  2880 un écran de 1440 px en Retina. Rien au-delà : au-delà, c'est de la
 *  mémoire décodée sans aucun gain visible. */
const ECHELLE = [640, 960, 1280, 1920, 2880];
/** Une variante doit être franchement plus petite que l'original. */
const MARGE = 0.9;
const QUALITE = "82";

function fichiersSource(dossier) {
  const out = [];
  for (const nom of readdirSync(dossier)) {
    const chemin = join(dossier, nom);
    const st = statSync(chemin);
    if (st.isDirectory()) {
      if (["unused", "legacy"].includes(nom)) continue;
      out.push(...fichiersSource(chemin));
    } else if (/\.(svelte|js)$/.test(nom)) {
      out.push(chemin);
    }
  }
  return out;
}

function imagesReferencees() {
  const set = new Set();
  const motif = /\/(?:images|videos)\/[A-Za-z0-9_.\-/]+\.(?:webp|jpe?g|png)/g;
  for (const f of fichiersSource(join(RACINE, "src"))) {
    for (const m of readFileSync(f, "utf8").matchAll(motif)) {
      if (m[0].startsWith("/images/_r/")) continue;
      set.add(m[0]);
    }
  }
  return [...set].sort();
}

function dimensions(fichier) {
  const sortie = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", fichier], { encoding: "utf8" });
  const w = +(/pixelWidth: (\d+)/.exec(sortie)?.[1] ?? 0);
  const h = +(/pixelHeight: (\d+)/.exec(sortie)?.[1] ?? 0);
  return { w, h };
}

export const empreinte = (fichier) => createHash("sha1").update(readFileSync(fichier)).digest("hex").slice(0, 12);
export const nomVariante = (src, largeur) =>
  `/images/_r/${src.replace(/^\//, "").replace(/\.[a-z]+$/i, "").replace(/\//g, "__")}-${largeur}.webp`;

async function principal() {
  if (!existsSync(SORTIE)) mkdirSync(SORTIE, { recursive: true });
  const ancien = existsSync(MANIFESTE) ? JSON.parse(readFileSync(MANIFESTE, "utf8")) : {};
  const manifeste = {};
  const travaux = [];
  const refs = imagesReferencees();

  for (const src of refs) {
    const fichier = join(PUBLIC, src);
    if (!existsSync(fichier)) {
      console.warn(`  ! introuvable : ${src}`);
      continue;
    }
    const sig = empreinte(fichier);
    const { w, h } = dimensions(fichier);
    if (!w || !h) continue;
    const largeurs = ECHELLE.filter((l) => l < w * MARGE);
    manifeste[src] = { w, h, v: largeurs, sig };
    const aJour = ancien[src]?.sig === sig;
    for (const l of largeurs) {
      const cible = join(PUBLIC, nomVariante(src, l));
      if (aJour && existsSync(cible)) continue;
      travaux.push({ fichier, cible, l });
    }
  }

  // Variantes orphelines (image retirée, ou échelle changée).
  const attendues = new Set(Object.entries(manifeste).flatMap(([src, e]) => e.v.map((l) => nomVariante(src, l).split("/").pop())));
  for (const nom of readdirSync(SORTIE)) {
    if (!attendues.has(nom)) unlinkSync(join(SORTIE, nom));
  }

  console.log(`${refs.length} images référencées, ${travaux.length} variante(s) à produire…`);
  const paralleles = Math.max(2, cpus().length - 2);
  let i = 0;
  await Promise.all(
    Array.from({ length: paralleles }, async () => {
      while (i < travaux.length) {
        const t = travaux[i++];
        await new Promise((resolve, reject) => {
          import("node:child_process").then(({ execFile }) =>
            execFile(
              "cwebp",
              ["-quiet", "-q", QUALITE, "-m", "5", "-sharp_yuv", "-metadata", "icc", "-resize", String(t.l), "0", t.fichier, "-o", t.cible],
              (err) => (err ? reject(err) : resolve())
            )
          );
        });
        process.stdout.write(".");
      }
    })
  );

  writeFileSync(MANIFESTE, JSON.stringify(manifeste, null, 1) + "\n");
  const total = readdirSync(SORTIE).reduce((s, n) => s + statSync(join(SORTIE, n)).size, 0);
  console.log(`\n${Object.keys(manifeste).length} images au manifeste · ${readdirSync(SORTIE).length} variantes · ${(total / 1048576).toFixed(1)} Mo dans ${relative(RACINE, SORTIE)}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) principal();
