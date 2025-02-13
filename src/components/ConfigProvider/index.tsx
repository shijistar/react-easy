import { type FC, type ReactNode, useEffect } from 'react';
import locales, { langs, resources } from '../../locales';
import type localesEn from '../../locales/langs/en';
import ReactEasyContext, { type ReactEasyContextProps } from './context';

export interface ConfigProviderProps extends ReactEasyContextProps {
  /**
   * **EN:** Custom localized resources, if `lang` exists, it will override the localized resources
   * of the corresponding language,
   *
   * **CN:** 自定义本地化资源，如果`lang`存在，则会覆盖对应语言的本地化资源，如果`lang`不存在，则会添加一种新的语言
   */
  locales?: Partial<typeof localesEn>;
  children: ReactNode;
}

/**
 * **EN:** Provide global configuration for AntdHelper
 *
 * **CN:** 提供AntdHelper的全局配置
 */
const ConfigProvider: FC<ConfigProviderProps> = (props) => {
  const { children, locales: userLocales, ...restProps } = props;
  const { lang: langInProps } = restProps;

  useEffect(() => {
    // Dynamically add language pack
    if (userLocales) {
      const lang = langInProps || 'en';
      if (lang && langs.includes(lang)) {
        locales.removeResourceBundle(lang, 'translation');
        locales.addResourceBundle(lang, 'translation', { ...resources[lang].translation, ...userLocales });
      } else {
        locales.addResourceBundle(lang, 'translation', { ...resources.en.translation, ...userLocales });
      }
    }
  }, [langInProps, userLocales]);

  useEffect(() => {
    // Set the language of the component
    locales.changeLanguage(langInProps || 'en');
  }, [langInProps]);

  return <ReactEasyContext.Provider value={restProps}>{children}</ReactEasyContext.Provider>;
};

export default ConfigProvider;
