/** @type {import('astro-i18next').AstroI18nextConfig} */
export default {
  defaultLocale: 'de',
  locales: ['de', 'en'],
  namespaces: ['common'],
  defaultNamespace: 'common',
  load: ['server', 'client'],
  routes: {
    en: {
      impressum: 'imprint',
    },
  },
};
