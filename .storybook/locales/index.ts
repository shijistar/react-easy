import { useContext, useMemo } from 'react';
import { createInstance, type i18n } from 'i18next';
import ReactEasyContext from '../../src/components/ConfigProvider/context';
import enUS from './langs/en-US';
import zhCN from './langs/zh-CN';

export const resources = {
  en: { translation: enUS },
  'en-US': { translation: enUS },
  'zh-CN': { translation: zhCN },
} as const;

const demoI18n: i18n = createInstance({});

demoI18n.init({
  lng: 'en',
  resources,
});

export const t: i18n['t'] = ((...args) => {
  return demoI18n.t(...args);
}) as i18n['t'];

export const useT = (): typeof t => {
  const context = useContext(ReactEasyContext);
  const lang = context.lang;

  // eslint-disable-next-line @tiny-codes/react-hooks/exhaustive-deps
  return useMemo(() => t, [lang]);
};

export default demoI18n;
