import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import type { ReactRenderer } from '@storybook/react-vite';
import { FORCE_RE_RENDER } from 'storybook/internal/core-events';
import type { PartialStoryFn, StoryContext } from 'storybook/internal/csf';
import { addons, useStoryContext } from 'storybook/preview-api';
import type enUS from 'antd/es/locale/en_US';
import type zhCN from 'antd/es/locale/zh_CN';
import darkAlgorithm from 'antd/es/theme/themes/dark';
import defaultAlgorithm from 'antd/es/theme/themes/default';
import { useRefValue } from '../../src/hooks';
import type { Langs } from '../../src/locales';
import storyI18n from '../locales';
import { getGlobalValueFromUrl } from '../utils/global';

const AppLazy = lazy(() => import('antd/es/app'));
const AntdConfigProviderLazy = lazy(() => import('antd/es/config-provider'));
const ConfigProviderLazy = lazy(() => import('../../src/components/ConfigProvider'));

const langFromUrl = getGlobalValueFromUrl('lang');
const themeFromUrl = getGlobalValueFromUrl('backgrounds.value');
const isPreferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

const usePreviewDecorator = (
  Story: PartialStoryFn<ReactRenderer, Record<string, unknown>>,
  context: StoryContext<ReactRenderer, Record<string, unknown>>,
) => {
  const themeFromGlobal = context.globals?.backgrounds?.value;
  const theme: string | undefined = themeFromGlobal ?? themeFromUrl;
  const lang: Langs | undefined = context.globals.lang ?? langFromUrl ?? 'en-US';
  const [andtLocale, setAndtLocale] = useState<typeof zhCN | typeof enUS>();
  const { viewMode } = useStoryContext();
  const viewModeRef = useRefValue(viewMode);
  const [prevTheme, setPrevTheme] = useState(themeFromGlobal);
  const isDark = theme === 'dark' || (!theme && isPreferDark);

  // Reload the page if the theme changes.
  useMemo(() => {
    if (themeFromGlobal && themeFromGlobal !== prevTheme) {
      setPrevTheme(themeFromGlobal);
      (window.top ?? window.parent ?? window).location.reload();
    }
  }, [themeFromGlobal, prevTheme]);

  // Reload the page if the language changes.
  useMemo(() => {
    if (lang && storyI18n.language !== lang) {
      storyI18n.changeLanguage(lang).then(() => {
        if (viewModeRef.current === 'docs') {
          addons.getChannel().emit(FORCE_RE_RENDER);
        } else if (viewModeRef.current === 'story') {
          (window.top ?? window.parent ?? window).location.reload();
        }
      });
    }
  }, [lang]);

  useEffect(() => {
    import(lang === 'zh-CN' ? 'antd/es/locale/zh_CN' : 'antd/es/locale/en_US').then((module) => {
      const locale = lang === 'zh-CN' ? module.default : module.default;
      setAndtLocale(locale);
    });
  }, [lang]);

  return (
    <Suspense fallback={null}>
      <AntdConfigProviderLazy locale={andtLocale} theme={{ algorithm: isDark ? darkAlgorithm : defaultAlgorithm }}>
        <Suspense fallback={null}>
          <AppLazy>
            <Suspense fallback={null}>
              <ConfigProviderLazy lang={lang}>
                <Story />
              </ConfigProviderLazy>
            </Suspense>
          </AppLazy>
        </Suspense>
      </AntdConfigProviderLazy>
    </Suspense>
  );
};

export default usePreviewDecorator;
