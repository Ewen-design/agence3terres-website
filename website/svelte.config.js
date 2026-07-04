import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'dist',
      assets: 'dist',
      // SPA fallback shell for any route that isn't prerendered — this is what
      // lets unknown URLs resolve client-side to +error.svelte (the 404 page)
      // instead of being served the prerendered home. Caddy serves /200.html
      // as its final try_files fallback.
      fallback: '200.html',
    }),
    // Root-absolute asset URLs (/_app/…) instead of relative (../_app/…).
    // The site is always served from the domain root, and Caddy's SPA fallback
    // can serve any HTML shell at any URL depth / trailing slash. Relative paths
    // (SvelteKit 2's default) then resolve to a wrong, non-existent location and
    // the CSS/JS 404 → unstyled page. Absolute paths always resolve correctly.
    paths: {
      relative: false,
    },
    files: {
      assets: 'public',
    },
  },
};
