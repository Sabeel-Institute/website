// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Canonical origin, used for canonical links, absolute Open Graph URLs
  // (link previews in WhatsApp, Instagram, email), the sitemap, and
  // robots.txt. Change this when the site moves domains.
  site: 'https://oursabeel.com',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  image: { layout: 'constrained' },
  // The staff guide (src/pages/course-guide-*.astro) is unlisted.
  integrations: [sitemap({ filter: (page) => !/\/course-guide-[a-z0-9]+\/$/.test(page) })],
  vite: { plugins: [tailwindcss()] },
});
