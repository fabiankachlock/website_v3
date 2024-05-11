import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';
import astroI18next from 'astro-i18next';
import { fromHtml } from 'hast-util-from-html';
import { h } from 'hastscript';
import { rehypeAccessibleEmojis } from 'rehype-accessible-emojis';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

import linkIcon from './src/assets/link.svg?raw';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  prefetch: {
    defaultStrategy: 'viewport',
    prefetchAll: true,
  },
  site: 'https://new.fabiankachlock.dev',
  // base: '/website_v3',
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
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      rehypeHeadingIds,
      rehypeAccessibleEmojis,
      rehypeKatex,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'before',
          content(node) {
            return [h('span.header-link', fromHtml(linkIcon))];
          },
          group(node) {
            return h('.header-group');
          },
        },
      ],
      [rehypeExternalLinks, { rel: ['external', 'noopener', 'noreferrer', 'nofollow'] }],
    ],
    experimentalThemes: {
      light: 'catppuccin-latte',
      dark: 'ayu-dark',
    },
  },
  integrations: [
    astroI18next(),
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
    mdx(),
  ],
});
