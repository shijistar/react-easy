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

const storyI18n: i18n = createInstance({});

storyI18n.init({
  lng: 'en',
  resources,
});

export const t: i18n['t'] = ((...args) => {
  return storyI18n.t(...args);
}) as i18n['t'];

export const useStoryT = () => {
  const context = useContext(ReactEasyContext);
  const lang = context.lang;

  // eslint-disable-next-line @tiny-codes/react-hooks/exhaustive-deps
  return useMemo(() => ((...args: unknown) => t(...args)) as typeof t, [lang]);
};

export default storyI18n;
