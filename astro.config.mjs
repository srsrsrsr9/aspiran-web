import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Custom domain on GitHub Pages: site is the domain, base stays "/".
export default defineConfig({
  site: 'https://aspiran.in',
  integrations: [sitemap()],
  build: { assets: 'assets', inlineStylesheets: 'always' },
});
