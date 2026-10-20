# images-originals

Versions **originales haute résolution** des 28 images qui ont été redimensionnées
pour optimiser le site (2000–8000 px → 2200 px de côté max).

- Les versions **réduites** (utilisées par le site) sont dans `website/public/images/`.
- Ce dossier est **hors du build** (`website/public/` est le seul dossier servi) :
  les originaux sont conservés ici mais **ne partent pas en production**.

Pour restaurer un original dans le site, il suffit de recopier le fichier voulu
depuis ce dossier vers `website/public/images/` (attention : cela réintroduit le
poids/dimensions d'origine et les problèmes de performance associés).

## Passage du 2026-10-20 (chargement des images)

Originaux mis de côté avant réduction (même nom côté site, jeton `?v=2` posé sur
les références des `.webp`) :

- `justx-couleurs2.avant-2026-10-20.webp` — 8000×5500, Adobe RGB → site : 3300 px, sRGB
  (le `justx-couleurs2.webp` déjà présent ici est une version plus ancienne).
- `justx-rs.webp` — 4592 px → site : 3000 px.
- `harmonia-tel-accueil.webp`, `ludo-tel-cosmos.webp`, `missionx-tel-victoire.webp`,
  `moovy-tel-joker.webp` — captures de téléphone ~960 px → site : 640 px
  (affichées à 190 px de large au plus, besoin mesuré 470 px même sur écran 2560 Retina).
- `instagram.png`, `mail.png` (512 → 160 px) et `logo_prisme.png` (969 → 384 px, masque
  du logo du header) : réduits sur place, sans jeton (rendu identique).
