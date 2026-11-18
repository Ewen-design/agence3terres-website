// ───────────────────────────────────────────────────────────────────────────
//  Préprocesseur Svelte : chaque `<img>` (et chaque `<source>` d'un
//  `<picture>`) reçoit ses variantes responsives au moment du build.
//
//    <img src={projet.image} alt="" loading="lazy" />
//      devient
//    <img srcset={__rimg.srcset(projet.image)} sizes="100vw" data-rsizes
//         width={__rimg.w(projet.image)} height={__rimg.h(projet.image)}
//         src={projet.image} alt="" loading="lazy" />
//
//  Tout passe par des EXPRESSIONS évaluées par `responsive.js`, y compris
//  pour une adresse écrite en dur : une seule source de vérité (le manifeste
//  validé), le prérendu écrit le résultat dans le HTML, et un `src` qui change
//  (carrousel) emporte son `srcset` avec lui.
//
//  Ce qui n'est PAS touché : un `<img>` qui a déjà son `srcset`, un `src`
//  qu'on ne sait pas lire (spread), et les dossiers `unused/` et `legacy/`.
//  `width`/`height` ne sont posés que s'ils manquent, et jamais dans un
//  `<picture>` (la source téléphone n'a pas forcément le même format).
//  `sizes="100vw"` est une valeur d'attente : pour une image différée,
//  `$lib/lazyAhead.js` la remplace par la largeur réelle de sa boîte avant
//  le chargement (repérée par `data-rsizes`).
// ───────────────────────────────────────────────────────────────────────────

const IMPORT = `import * as __rimg from "$lib/images/responsive.js";`;

/** Fin de la balise ouvrante commençant à `debut`, en respectant `{…}` et les
 *  guillemets (un attribut peut contenir `>` dans une expression). */
function finDeBalise(texte, debut) {
  let prof = 0;
  let guillemet = null;
  for (let i = debut; i < texte.length; i++) {
    const c = texte[i];
    if (guillemet) {
      if (c === guillemet) guillemet = null;
      continue;
    }
    if (prof > 0) {
      if (c === "{") prof++;
      else if (c === "}") prof--;
      else if (c === '"' || c === "'" || c === "`") {
        // Chaîne JS dans une expression : on la saute en entier.
        const fin = texte.indexOf(c, i + 1);
        if (fin > 0) i = fin;
      }
      continue;
    }
    if (c === "{") prof++;
    else if (c === '"' || c === "'") guillemet = c;
    else if (c === ">") return i;
  }
  return -1;
}

/** Valeur d'un attribut sous forme d'EXPRESSION JS, ou null. */
function expressionAttribut(balise, nom) {
  // nom={expr}
  const reExpr = new RegExp(`(?:^|\\s)${nom}=\\{`);
  const m = reExpr.exec(balise);
  if (m) {
    const debut = m.index + m[0].length;
    let prof = 1;
    for (let i = debut; i < balise.length; i++) {
      if (balise[i] === "{") prof++;
      else if (balise[i] === "}" && --prof === 0) return balise.slice(debut, i).trim();
    }
    return null;
  }
  // nom="littéral" (sans expression dedans)
  const reLit = new RegExp(`(?:^|\\s)${nom}=(["'])([^"'{}]*)\\1`);
  const l = reLit.exec(balise);
  if (l) return JSON.stringify(l[2]);
  // nom="{expr}" (rare)
  const reQ = new RegExp(`(?:^|\\s)${nom}="\\{([^}]*)\\}"`);
  const q = reQ.exec(balise);
  if (q) return q[1].trim();
  // {nom} (raccourci Svelte)
  if (new RegExp(`(?:^|\\s)\\{${nom}\\}`).test(balise)) return nom;
  return null;
}

const aAttribut = (balise, nom) => new RegExp(`(?:^|\\s)(?:${nom}(?:=|\\s|/?$)|\\{${nom}\\})`).test(balise);

/** Les zones à ne pas toucher : scripts et styles. */
function zonesExclues(texte) {
  const zones = [];
  for (const m of texte.matchAll(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g)) zones.push([m.index, m.index + m[0].length]);
  return zones;
}

export function imagesResponsives() {
  return {
    name: "images-responsives",
    markup({ content, filename }) {
      if (!filename || !filename.endsWith(".svelte")) return;
      if (/[\\/](unused|legacy)[\\/]/.test(filename)) return;
      if (!/<(img|source)\b/.test(content)) return;

      const zones = zonesExclues(content);
      const dansZone = (i) => zones.some(([a, b]) => i >= a && i < b);
      let sortie = "";
      let curseur = 0;
      let modifie = false;

      // Les `<picture>` : leurs `<img>` ne reçoivent pas de dimensions.
      const pictures = [];
      for (const m of content.matchAll(/<picture\b[\s\S]*?<\/picture>/g)) pictures.push([m.index, m.index + m[0].length]);
      const dansPicture = (i) => pictures.some(([a, b]) => i > a && i < b);

      for (const m of content.matchAll(/<(img|source)\b/g)) {
        const debut = m.index;
        if (dansZone(debut) || debut < curseur) continue;
        const fin = finDeBalise(content, debut + m[0].length);
        if (fin < 0) continue;
        const tag = m[1];
        const attributs = content.slice(debut + m[0].length, fin);
        const ajouts = [];

        if (tag === "img") {
          if (aAttribut(attributs, "srcset")) continue;
          const src = expressionAttribut(attributs, "src");
          if (!src) continue;
          ajouts.push(`srcset={__rimg.srcset(${src})}`);
          if (!aAttribut(attributs, "sizes")) ajouts.push(`sizes="100vw" data-rsizes`);
          if (!dansPicture(debut) && !aAttribut(attributs, "width") && !aAttribut(attributs, "height")) {
            ajouts.push(`width={__rimg.w(${src})} height={__rimg.h(${src})}`);
          }
        } else {
          // <source srcset="une seule adresse"> → toutes ses variantes.
          const src = expressionAttribut(attributs, "srcset");
          if (!src || /\s\d+[wx]\b/.test(src)) continue;
          sortie += content.slice(curseur, debut);
          const sansSrcset = attributs
            .replace(/(^|\s)srcset=\{[^}]*\}/, "$1")
            .replace(/(^|\s)srcset=(["'])[^"']*\2/, "$1")
            .replace(/(^|\s)\{srcset\}/, "$1");
          const extra = aAttribut(attributs, "sizes") ? "" : ` sizes="100vw" data-rsizes`;
          sortie += `<source srcset={__rimg.srcset(${src}) || ${src}}${extra}${sansSrcset}`;
          curseur = fin;
          modifie = true;
          continue;
        }

        sortie += content.slice(curseur, debut) + `<img ${ajouts.join(" ")}`;
        curseur = debut + m[0].length;
        modifie = true;
      }

      if (!modifie) return;
      sortie += content.slice(curseur);

      // L'import, dans le script d'instance (créé s'il n'existe pas).
      const script = /<script(?![^>]*\bcontext=["']module["'])(?![^>]*\bmodule\b)[^>]*>/.exec(sortie);
      if (script) {
        const pos = script.index + script[0].length;
        sortie = sortie.slice(0, pos) + `\n  ${IMPORT}` + sortie.slice(pos);
      } else {
        sortie = `<script>\n  ${IMPORT}\n</script>\n` + sortie;
      }
      return { code: sortie };
    }
  };
}
