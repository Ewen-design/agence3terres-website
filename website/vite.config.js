import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Le manifeste des variantes d'images, VALIDÉ au démarrage du build : une
 * image remplacée sous le même nom sans que `npm run images` ait été relancé
 * perd ses variantes (le site retombe sur l'original) au lieu de servir
 * l'ancienne image en petit. Voir `scripts/images-responsives.mjs`.
 */
function imagesVariantes() {
  const ID = 'virtual:images-variantes';
  const manifeste = fileURLToPath(new URL('./src/lib/images/variantes.json', import.meta.url));
  const publicDir = fileURLToPath(new URL('./public', import.meta.url));
  let valide = null;

  const charger = () => {
    if (valide) return valide;
    valide = {};
    if (!existsSync(manifeste)) return valide;
    const brut = JSON.parse(readFileSync(manifeste, 'utf8'));
    const perimees = [];
    const manquantes = [];
    const nomVariante = (src, l) =>
      `/images/_r/${src.replace(/^\//, '').replace(/\.[a-z]+$/i, '').replace(/\//g, '__')}-${l}.webp`;
    for (const [src, e] of Object.entries(brut)) {
      const fichier = publicDir + src;
      if (!existsSync(fichier)) continue;
      const sig = createHash('sha1').update(readFileSync(fichier)).digest('hex').slice(0, 12);
      if (sig !== e.sig) {
        perimees.push(src);
        continue;
      }
      // Une variante absente du disque (dossier `_r` pas commité, pas copié)
      // ferait une image cassée en ligne : l'original sert alors seul.
      if (e.v.some((l) => !existsSync(publicDir + nomVariante(src, l)))) {
        manquantes.push(src);
        continue;
      }
      valide[src] = { w: e.w, h: e.h, v: e.v };
    }
    if (perimees.length) {
      console.warn(`\n⚠ images remplacées sans variantes à jour (servies en original) — lancer \`npm run images\` :\n  ${perimees.join('\n  ')}\n`);
    }
    if (manquantes.length) {
      console.warn(`\n⚠ variantes absentes de public/images/_r (servies en original) — lancer \`npm run images\` et commiter le dossier :\n  ${manquantes.slice(0, 12).join('\n  ')}${manquantes.length > 12 ? `\n  … ${manquantes.length - 12} de plus` : ''}\n`);
    }
    return valide;
  };

  return {
    name: 'images-variantes',
    resolveId: (id) => (id === ID ? '\0' + ID : null),
    load: (id) => (id === '\0' + ID ? `export default ${JSON.stringify(charger())};` : null),
    handleHotUpdate({ file }) {
      if (file === manifeste) valide = null;
    }
  };
}

export default defineConfig({
  plugins: [imagesVariantes(), sveltekit()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['localhost', 'agence3terres.fr', 'demo.agence3terres.fr'],
  },
});
