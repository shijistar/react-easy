import type { CSSProperties, FC, ReactNode } from 'react';
import { useContext, useEffect, useMemo } from 'react';
import { ConfigProvider as ReactConfigProvider } from 'antd';
import classNames from 'classnames';
import locales, { langs, resources } from '../../locales';
import type localesEn from '../../locales/langs/en';
import ReactEasyContext, { type ReactEasyContextProps } from './context';
import useStyle from './style';

export interface ConfigProviderProps extends ReactEasyContextProps {
  /**
   * - **EN:** Child elements of the ConfigProvider
   * - **CN:** ConfigProvider 的子元素
   */
  children: ReactNode;
  /**
   * - **EN:** Custom prefix for the component's CSS class.
   * - **CN:** 组件的自定义 CSS 类前缀。
   */
  prefixCls?: string;
  /**
   * - **EN:** Custom class name for the root element
   * - **CN:** 根元素的自定义类名
   */
  className?: string;
  /**
   * - **EN:** Custom styles for the root element
   * - **CN:** 根元素的自定义样式
   */
  style?: CSSProperties;
  /**
   * - **EN:** Custom localization resources, if `lang` exists, it will override the localization
   *   resources of that language, otherwise, it will add a new language
   * - **CN:** 自定义本地化资源，如果`lang`存在，则会覆盖该语言的本地化资源，否则，会添加一种新的语言
   */
  locales?: Partial<typeof localesEn>;
}

/**
 * - **EN:** Provide global configuration for AntdHelper
 * - **CN:** 提供AntdHelper的全局配置
 */
const ConfigProvider: FC<ConfigProviderProps> = (props) => {
  const { children, locales: userLocales, prefixCls: prefixClsInProps, className, style, ...restProps } = props;
  const { lang: langInProps } = restProps;
  const { getPrefixCls, rootPrefixCls } = useContext(ReactConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('react-easy', prefixClsInProps);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle(prefixCls, rootPrefixCls);
  const contextValue = useMemo(
    () => {
      if (langInProps !== locales.language) {
        locales.changeLanguage(langInProps || 'en');
      }
      return restProps;
    },
    // eslint-disable-next-line @tiny-codes/react-hooks/exhaustive-deps
    [langInProps, ...Object.values(restProps)]
  );

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

  return wrapCSSVar(
    <ReactEasyContext.Provider value={contextValue}>
      <div className={classNames(hashId, cssVarCls, prefixCls, className)} style={style}>
        {children}
      </div>
    </ReactEasyContext.Provider>
  );
};
ConfigProvider.displayName = 'ReactEasyConfigProvider';

export default ConfigProvider;
