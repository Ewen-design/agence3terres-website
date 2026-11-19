// ───────────────────────────────────────────────────────────────────────────
//  Serveur statique de test, calqué sur docker/Caddyfile (2026-11-19) :
//  try_files {path} {path}/index.html {path}.html /200.html, requêtes Range,
//  mêmes en-têtes de cache. Deux usages :
//  - servir un INSTANTANÉ de dist/ copié à part : un `npm run build` lancé
//    pendant une batterie (par un autre agent) ne la casse plus ;
//  - brider le DÉBIT, que WebKit et Firefox ne savent pas émuler : `--debit`
//    est partagé entre toutes les réponses en cours, comme un vrai lien
//    (c'est ce qui a montré les affiches de vidéos qui volaient le débit aux
//    images, voir `vides.mjs`).
//
//    cp -R dist /tmp/site && node tests/stabilite/serveur.mjs /tmp/site 4380 \
//      [--debit 300] [--latence 60] [--journal]
//    puis `--base http://localhost:4380` pour les batteries.
//  ⚠️ Pas le port 4190 : WebKit le refuse (port « restreint »).
// ───────────────────────────────────────────────────────────────────────────
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const [, , racine = "dist", port = "4380", ...reste] = process.argv;
const latence = reste.includes("--latence") ? Number(reste[reste.indexOf("--latence") + 1]) : 0;
// Débit PARTAGÉ (Ko/s) entre toutes les réponses, comme un vrai lien : chacune
// reçoit sa part à tour de rôle toutes les 50 ms.
const debit = reste.includes("--debit") ? Number(reste[reste.indexOf("--debit") + 1]) : 0;
const flux = new Set();
if (debit) {
  setInterval(() => {
    let budget = debit * 1024 * 0.05;
    let liste = [...flux];
    while (budget > 512 && liste.length) {
      const part = Math.max(512, Math.floor(budget / liste.length));
      for (const f of liste) {
        const n = Math.min(part, f.buf.length - f.off);
        if (n > 0) {
          f.res.write(f.buf.subarray(f.off, f.off + n));
          f.off += n;
          budget -= n;
        }
        if (f.off >= f.buf.length) {
          f.res.end();
          flux.delete(f);
        }
      }
      liste = liste.filter((f) => flux.has(f));
    }
  }, 50);
}
function envoyerBride(res, fichier, debut, fin) {
  const buf = fs.readFileSync(fichier).subarray(debut, fin + 1);
  const f = { res, buf, off: 0 };
  flux.add(f);
  res.on("close", () => flux.delete(f));
}
const ROOT = path.resolve(racine);

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".webm": "video/webm",
  ".mov": "video/quicktime", ".woff2": "font/woff2", ".woff": "font/woff", ".ico": "image/x-icon",
  ".xml": "application/xml", ".txt": "text/plain", ".gif": "image/gif", ".avif": "image/avif"
};

function trouver(p) {
  const essais = [p, path.join(p, "index.html"), p + ".html"];
  for (const e of essais) {
    const abs = path.join(ROOT, e);
    if (!abs.startsWith(ROOT)) continue;
    try {
      if (fs.statSync(abs).isFile()) return abs;
    } catch {}
  }
  return path.join(ROOT, "200.html");
}

function cache(p, query) {
  if (p.startsWith("/_app/immutable/")) return "public, max-age=31536000, immutable";
  if (p.startsWith("/images/") || p.startsWith("/degrades/")) return "public, max-age=86400, stale-while-revalidate=604800";
  if (p.startsWith("/videos/")) return query.has("v") ? "public, max-age=31536000, immutable" : "public, no-cache";
  return "no-cache, no-store, must-revalidate";
}

const journal = reste.includes("--journal");
const T0 = Date.now();
http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://x");
    if (journal && /\.(webp|png|jpe?g|mp4|webm|mov|avif)/.test(url.pathname)) {
      const t = Date.now() - T0;
      const nom = `${url.pathname.split("/").pop().slice(0, 46)} ${req.headers.range ?? ""}`;
      console.log(`${String(t).padStart(7)} + ${nom}`);
      res.on("close", () => console.log(`${String(Date.now() - T0).padStart(7)} ${res.writableFinished ? "=" : "x"} ${nom} (${Date.now() - T0 - t} ms)`));
    }
    const p = decodeURIComponent(url.pathname);
    const fichier = trouver(p);
    let stat;
    try {
      stat = fs.statSync(fichier);
    } catch {
      res.writeHead(404).end();
      return;
    }
    const type = TYPES[path.extname(fichier).toLowerCase()] || "application/octet-stream";
    const etag = `"${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`;
    const entetes = {
      "Content-Type": type,
      "Accept-Ranges": "bytes",
      ETag: etag,
      "Last-Modified": stat.mtime.toUTCString(),
      "Cache-Control": cache(p, url.searchParams)
    };
    const envoyer = () => {
      if (req.headers["if-none-match"] === etag && !req.headers.range) {
        res.writeHead(304, entetes).end();
        return;
      }
      const range = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
      if (range) {
        let debut = range[1] === "" ? stat.size - Number(range[2]) : Number(range[1]);
        let fin = range[1] === "" || range[2] === "" ? stat.size - 1 : Number(range[2]);
        fin = Math.min(fin, stat.size - 1);
        if (debut > fin || debut >= stat.size) {
          res.writeHead(416, { "Content-Range": `bytes */${stat.size}` }).end();
          return;
        }
        res.writeHead(206, { ...entetes, "Content-Range": `bytes ${debut}-${fin}/${stat.size}`, "Content-Length": fin - debut + 1 });
        if (req.method === "HEAD") return res.end();
        if (debit && !/\.(html|js|css|json|woff2?)$/.test(fichier)) envoyerBride(res, fichier, debut, fin);
        else fs.createReadStream(fichier, { start: debut, end: fin }).pipe(res);
        return;
      }
      res.writeHead(200, { ...entetes, "Content-Length": stat.size });
      if (req.method === "HEAD") return res.end();
      if (debit && !/\.(html|js|css|json|woff2?)$/.test(fichier)) envoyerBride(res, fichier, 0, stat.size - 1);
      else fs.createReadStream(fichier).pipe(res);
    };
    if (latence && /\.(webp|png|jpe?g|mp4|webm|mov|avif)$/i.test(fichier)) setTimeout(envoyer, latence);
    else envoyer();
  })
  .listen(Number(port), "0.0.0.0", () => console.log(`serveur ${ROOT} sur :${port}${latence ? ` (latence ${latence} ms)` : ""}${debit ? ` (débit ${debit} Ko/s)` : ""}`));
