import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    host: true,
    port: 5174,
    allowedHosts: ['localhost', 'agence3terres.fr', 'demo.agence3terres.fr'],
  },
});
