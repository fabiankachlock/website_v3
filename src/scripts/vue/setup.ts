import type { App } from 'vue';
import i18next from 'i18next';
import I18NextVue from 'i18next-vue';

export default (app: App) => {
  app.use(I18NextVue, { i18next });
};
