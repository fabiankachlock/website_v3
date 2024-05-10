import { defineConfig } from 'astro/config';
import astroI18next from 'astro-i18next';
import sitemap from '@astrojs/sitemap';
import vue from '@astrojs/vue';
import compress from '@playform/compress';

import mdx from '@astrojs/mdx';
import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import { rehypeAccessibleEmojis } from 'rehype-accessible-emojis';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { h } from 'hastscript';
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic';
import rehypeExternalLinks from 'rehype-external-links';

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
            return [h('span.header-link', fromHtmlIsomorphic(linkIcon))];
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
