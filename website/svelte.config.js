import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'dist',
      assets: 'dist',
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
