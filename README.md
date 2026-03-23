# Agence 3 Terres — Site vitrine

Site vitrine de l'Agence 3 Terres, construit avec **Svelte 5 + SvelteKit**, servi en production via **Caddy** dans un conteneur **Docker**. L'expérience utilisateur repose sur des animations GSAP avancées (ScrollTrigger, SplitText) et un scroll fluide via Lenis.

## Stack technique

| Couche           | Technologie                       |
| ---------------- | --------------------------------- |
| Framework        | Svelte 5 + SvelteKit 2            |
| Build            | Vite 7 + adapter-static (SSG)     |
| Animations       | GSAP 3 (ScrollTrigger, SplitText) |
| Scroll fluide    | Lenis                             |
| Serveur          | Caddy 2 (Alpine)                  |
| Conteneurisation | Docker multi-stage                |
| CI/CD            | GitHub Actions → ghcr.io          |

## Prérequis

- Node.js >= 20
- npm >= 10
- Docker (pour la production)

## Installation

```bash
git clone <url-du-repo>
cd agence3terres-website/website
npm install
```

## Développement

```bash
cd website
npm run dev       # Serveur de dev avec HMR sur http://localhost:5173
npm run build     # Build de production → website/dist/
npm run preview   # Prévisualisation du build de production
```

Le build génère des fichiers statiques pré-rendus (SSG) dans `website/dist/`.
Le fichier `dist/index.html` contient le HTML complet, indexable par les moteurs de recherche.

## Production (Docker)

```bash
# Construire et lancer le conteneur
docker compose -f docker/compose.yml up

# Build manuel de l'image
docker build -f docker/Dockerfile -t agence3terres .
```

L'image est automatiquement construite et publiée sur `ghcr.io/ewen-design/website` à chaque push sur `main` via GitHub Actions (`.github/workflows/CI.yml`).

Le conteneur expose le port **80**. La terminaison TLS est gérée en amont par le reverse proxy Pangolin.

## Architecture

```
website/src/
├── app.html             # Template HTML (lang="fr", meta, favicon)
├── app.css              # Styles globaux (reset, variables, fonts)
├── routes/
│   ├── +layout.js       # Active le prérendu SSG
│   ├── +layout.svelte   # Layout global — Google Fonts
│   └── +page.svelte     # Page principale — orchestre toutes les sections
└── lib/
    ├── scrollEngine.js  # Moteur de parallax custom (GSAP + Lenis)
    ├── sections/        # 14 composants de section (HeroScroll, ParallaxGallery, etc.)
    └── structure/       # Composants transverses (Header, Footer, CustomCursor, IntroLoader)
```

**Flux de données :** `+page.svelte` orchestre toutes les sections et initialise `scrollEngine.js` une seule fois au montage via `onMount`. Chaque section enregistre ses propres ScrollTriggers. Lenis gère le scroll fluide globalement.

**Note SSR :** Tous les accès aux APIs navigateur (`window`, `document`, GSAP, Lenis) sont protégés par `onMount` ou `if (browser)` de `$app/environment`. L'application est pré-rendue côté serveur au moment du build.

## Licence

**Tous droits réservés — Agence 3 Terres**

Ce code source est la propriété exclusive d'Agence 3 Terres. Toute reproduction, distribution ou utilisation, même partielle, est interdite sans autorisation écrite préalable.

## Restriction sur les ressources visuelles

Les images et ressources graphiques présentes dans ce dépôt sont soumises à des droits stricts :

- **`website/public/images/`** — Photographies et visuels propriété d'Agence 3 Terres ou de leurs auteurs respectifs. Toute réutilisation, reproduction ou redistribution est formellement interdite sans accord écrit.
- **Images externes** (hébergées sur `cdn.prod.website-files.com`, `images.unsplash.com`) — Ces ressources sont soumises aux conditions d'utilisation de leurs hébergeurs et auteurs. L'Agence 3 Terres ne cède aucun droit sur ces contenus tiers.
- **Logo et identité visuelle** — Le logo (`logo3.png`) et tous les éléments d'identité visuelle sont la propriété exclusive d'Agence 3 Terres.

Toute utilisation des ressources visuelles à des fins commerciales, éditoriales ou de communication sans autorisation explicite constitue une violation du droit d'auteur.
