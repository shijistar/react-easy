import { createInstance, type i18n } from 'i18next';
import enUS from './langs/en-US';
import zhCN from './langs/zh-CN';

export const langs = ['en', 'en-US', 'zh-CN'] as const;

export type Langs = (typeof langs)[number];

export const resources = {
  en: { translation: enUS },
  'en-US': { translation: enUS },
  'zh-CN': { translation: zhCN },
} as const;

const reactEasyI18n: i18n = createInstance({});

reactEasyI18n.init({
  lng: 'en',
  resources,
});

export const t: i18n['t'] = ((...args) => {
  return reactEasyI18n.t(...args);
}) as i18n['t'];

export default reactEasyI18n;
