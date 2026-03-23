# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static SPA for Agence 3 Terres built with Svelte 5 + SvelteKit 2, served via Caddy in Docker. Heavy use of GSAP animations and Lenis smooth scrolling. Pre-rendered at build time (SSG) via adapter-static.

## Commands

All commands run from `website/`:

```bash
npm run dev      # Dev server with HMR
npm run build    # Production build → website/dist/
npm run preview  # Preview production build locally
```

Docker:
```bash
docker compose -f docker/compose.yml up   # Run production container
```

## Architecture

```
website/src/
├── app.html             # HTML template (lang="fr", favicon, %sveltekit.head%)
├── app.css              # Global styles
├── routes/
│   ├── +layout.js       # export const prerender = true
│   ├── +layout.svelte   # Global layout: app.css import + Google Fonts via <svelte:head>
│   └── +page.svelte     # Root page: imports all sections, calls initScrollEngine() on mount
└── lib/
    ├── scrollEngine.js  # Custom scroll animation engine (GSAP + Lenis)
    ├── sections/        # Page section components (one per visual section)
    └── structure/       # Layout: Header, Footer, FullscreenMenu, CustomCursor, IntroLoader
```

**Data flow:** `+page.svelte` orchestrates all sections and triggers `initScrollEngine()` once on mount. Section components register their own GSAP scroll triggers. Lenis handles smooth scrolling globally.

**SSR/SSG:** The app is prerendered at build time. All browser-only code (GSAP, Lenis, window, document) is guarded by `onMount` or `if (browser)` from `$app/environment`. Never add browser-only code at module level without a `browser` guard.

## Deployment

- **CI:** `.github/workflows/CI.yml` — on push to `main`, builds Docker image and pushes to `ghcr.io/ewen-design/website` (`:latest` + commit SHA tag)
- **Docker:** Multi-stage build (`docker/Dockerfile`) — Node 20-alpine builder → Caddy 2-alpine production, non-root UID 1000
- **Caddy:** `docker/Caddyfile` — SPA fallback (`try_files {path} /index.html`), CSP allows `unsafe-inline` (required by GSAP), immutable caching for hashed assets, gzip+zstd compression
- **Reverse proxy:** Container connects to external Docker network `pangolin`; Caddy listens on :80, TLS handled upstream
- **Static assets:** Served from `website/public/` (configured via `kit.files.assets` in svelte.config.js), output to `website/dist/`

## Key Constraints

- CSP `unsafe-inline` for styles is intentional — GSAP applies inline styles dynamically; do not remove it
- The Caddyfile has no TLS block by design — TLS terminates at the Pangolin reverse proxy
- `gsap.registerPlugin(...)` must always be inside `onMount` or behind `if (browser)` — never at bare module level
- `$app/environment` `browser` guard is the standard pattern for all browser-only initialization
