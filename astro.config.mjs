import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://marxistgames.org',
  output: 'server',
  adapter: cloudflare({ imageService: 'compile' }),
  integrations: [sitemap()],
  markdown: {
    shikiConfig: { theme: 'github-dark' },
  },
  vite: {
    build: { cssMinify: true },
    server: {
      allowedHosts: ['mar-reef-unless-beth.trycloudflare.com'],
    },
  },
});
