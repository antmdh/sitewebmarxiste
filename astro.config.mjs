import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.marxistsgames.org',
  output: 'server',
  adapter: cloudflare({ imageService: 'compile' }),
  integrations: [sitemap()],
  markdown: {
    shikiConfig: { theme: 'github-dark' },
  },
  vite: {
    build: { cssMinify: true },
  },
});
