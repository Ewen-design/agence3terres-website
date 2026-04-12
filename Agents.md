# Agents.md

Guidance for coding agents working in this repository.

## Scope

- This file applies to the whole project root.
- The application code lives in `website/`.
- Docker and deployment config live in `docker/`.

## Project Summary

- Marketing site for Agence 3 Terres.
- Frontend stack: Svelte 5, SvelteKit 2, Vite 7, `@sveltejs/adapter-static`.
- Animation stack: GSAP and Lenis.
- Output model: static prerendered site generated into `website/dist/`.
- Production serving: Caddy in Docker.

## Working Directories

- Run frontend commands from `website/`.
- Run container commands from the project root with files under `docker/`.

## Common Commands

From `website/`:

```bash
npm install
npm run dev
npm run build
npm run preview
```

From the project root:

```bash
docker compose -f docker/compose.yml up
docker build -f docker/Dockerfile -t agence3terres .
```

## Repository Map

```text
.
├── Agents.md
├── CLAUDE.md
├── README.md
├── docker/
│   ├── Caddyfile
│   ├── compose.yml
│   └── Dockerfile
└── website/
    ├── package.json
    ├── src/
    │   ├── app.css
    │   ├── app.html
    │   ├── lib/
    │   │   ├── scrollEngine.js
    │   │   ├── sections/
    │   │   └── structure/
    │   └── routes/
    │       ├── +layout.js
    │       ├── +layout.svelte
    │       └── +page.svelte
    └── public/
```

## Architecture Notes

- `website/src/routes/+page.svelte` orchestrates the homepage sections.
- Shared visual and layout components are under `website/src/lib/structure/`.
- Section-level animated content is under `website/src/lib/sections/`.
- `website/src/lib/scrollEngine.js` coordinates the global scroll behavior.
- `website/src/routes/+layout.js` enables prerendering.

## Implementation Rules

- Treat the site as SSG-first. Changes must keep prerendering intact.
- Keep browser-only code behind `onMount` or a `$app/environment` `browser` guard.
- Do not register GSAP plugins at module scope.
- Be careful with scroll behavior changes: GSAP and Lenis are coupled to the visual experience.
- Preserve the existing visual direction unless the task explicitly asks for redesign work.

## Deployment Constraints

- Caddy serves the built static output.
- The Caddy setup uses SPA fallback to `/index.html`.
- TLS is terminated upstream, not inside this project.
- The current CSP allows inline styles because GSAP applies them dynamically; do not remove that casually.

## Assets And Content

- Images in `website/public/images/` should be treated as owned client assets.
- Avoid renaming or replacing media unless the task requires it.
- Keep copy and branding consistent with the French-language site unless instructed otherwise.

## Before Finishing Work

- Run the relevant verification command when possible, usually `npm run build` from `website/`.
- If you touch animation, layout, or routing code, prefer validating the production build, not only dev assumptions.
- Summarize any constraints, skipped verification, or unresolved risks in the handoff.
