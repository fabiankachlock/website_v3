import { defineConfig } from 'astro/config';
import astroI18next from 'astro-i18next';
import prefetch from '@astrojs/prefetch';
import sitemap from '@astrojs/sitemap';
import vue from '@astrojs/vue';
import compress from 'astro-compress';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  // site: 'https://fabiankachlock.github.io',
  // base: "/website_v3",
  server: {
    port: 3000,
  },
  build: {
    format: 'directory',
  },
  vite: {
    ssr: {
      noExternal: ['path-to-regexp', '@carbon/icons-vue'],
    },
  },
  integrations: [
    astroI18next(),
    prefetch({
      throttle: 1,
    }),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      i18n: {
        defaultLocale: 'de',
        locales: {
          de: 'de',
          en: 'en',
        },
      },
    }),
    vue({
      appEntrypoint: '/src/scripts/vue/setup',
    }),
    compress({
      css: true,
      img: false,
      svg: true,
      html: true,
      js: true,
      logger: 0,
    }),
    mdx(),
  ],
});
