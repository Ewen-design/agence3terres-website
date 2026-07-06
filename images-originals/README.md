# images-originals

Versions **originales haute résolution** des 28 images qui ont été redimensionnées
pour optimiser le site (2000–8000 px → 2200 px de côté max).

- Les versions **réduites** (utilisées par le site) sont dans `website/public/images/`.
- Ce dossier est **hors du build** (`website/public/` est le seul dossier servi) :
  les originaux sont conservés ici mais **ne partent pas en production**.

Pour restaurer un original dans le site, il suffit de recopier le fichier voulu
depuis ce dossier vers `website/public/images/` (attention : cela réintroduit le
poids/dimensions d'origine et les problèmes de performance associés).
