import type { ComponentType, PropsWithChildren } from 'react';
import { lazy, Suspense, useMemo, useState } from 'react';
import type { Control, DocsContainerProps } from '@storybook/addon-docs/blocks';
import type { Preview, ReactRenderer } from '@storybook/react-vite';
import { FORCE_RE_RENDER } from 'storybook/internal/core-events';
import type { StoryContext, StoryContextForEnhancers } from 'storybook/internal/csf';
import { addons, useStoryContext } from 'storybook/preview-api';
import { App as AntdApp, ConfigProvider as AntdConfigProvider, theme as antThemes } from 'antd';
import enUS from 'antd/es/locale/en_US';
import zhCN from 'antd/es/locale/zh_CN';
import ConfigProvider from '../src/components/ConfigProvider';
import { useRefValue } from '../src/hooks';
import type { Langs } from '../src/locales';
import storyI18n, { storyT } from './locales';
import { stripExampleBlock } from './utils/description';
import { pickLangDoc } from './utils/doc';
import { getGlobalValueFromUrl } from './utils/global';
import { inferControlFromDocgenType, standardizeJsDocDefaultValue } from './utils/jsdoc';

// Loading them lazily keeps them out of the story-view critical path.
const ThemedDocsContainer = lazy(() => import('./lazy-docs').then((m) => ({ default: m.ThemedDocsContainer })));
const DocsPage = lazy(() => import('./lazy-docs').then((m) => ({ default: m.DocsPage })));

// import './preview.css';

const themeFromUrl = getGlobalValueFromUrl('backgrounds.value');
const langFromUrl = getGlobalValueFromUrl('lang');
const isPreferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

const preview: Preview = {
  initialGlobals: {
    lang: '',
    backgrounds: {
      value: themeFromUrl ?? (isPreferDark ? 'dark' : 'light'),
      grid: false,
    },
  },
  globalTypes: {
    lang: {
      description: 'Internationalization locale',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en-US', right: '🇺🇸', title: 'English' },
          { value: 'zh-CN', right: '🇨🇳', title: '中文' },
        ],
      },
    },
  },
  parameters: {
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        light: { value: '#ffffff', name: storyT('storybook.stories.Backgrounds.light') },
        dark: { value: '#2c2c2c', name: storyT('storybook.stories.Backgrounds.dark') },
      },
    },
    viewport: { value: 'desktop', isRotated: false },
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Introduce', 'Install', 'Get Started', 'Changelog', 'Components'],
        locales: '',
      },
    },
    docs: {
      container: (props: PropsWithChildren<DocsContainerProps>) => {
        const globalValue = (props.context as unknown as StoryContext<ReactRenderer>)?.globals?.backgrounds?.value;
        const theme = globalValue ?? themeFromUrl;
        const isDark = theme ? theme === 'dark' : isPreferDark;
        const Container = ThemedDocsContainer as unknown as ComponentType<
          PropsWithChildren<DocsContainerProps> & { isDark: boolean }
        >;
        return (
          <Suspense fallback={null}>
            <Container {...props} isDark={isDark} />
          </Suspense>
        );
      },
      extractComponentDescription: (
        component: ComponentType & {
          __docgenInfo?: { description?: string };
        },
      ) => {
        const raw = component?.__docgenInfo?.description ?? '';
        let result = stripExampleBlock(raw);
        result = pickLangDoc(result);
        return result;
      },
      page: () => (
        <Suspense fallback={null}>
          <DocsPage />
        </Suspense>
      ),
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const themeFromGlobal = context.globals?.backgrounds?.value;
      const theme: string | undefined = themeFromGlobal ?? themeFromUrl;
      const lang: Langs | undefined = context.globals.lang ?? langFromUrl ?? 'en-US';
      const antdLocale = lang === 'zh-CN' ? zhCN : enUS;
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

      return (
        <AntdConfigProvider
          locale={antdLocale}
          theme={{ algorithm: isDark ? antThemes.darkAlgorithm : antThemes.defaultAlgorithm }}
        >
          <AntdApp>
            <ConfigProvider lang={lang}>
              <Story />
            </ConfigProvider>
          </AntdApp>
        </AntdConfigProvider>
      );
    },
  ],
  argTypesEnhancers: [jsdocArgTypesEnhancer],
};

/** Enhances the argTypes of a story based on JSDoc comments. */
function jsdocArgTypesEnhancer(context: StoryContextForEnhancers) {
  const component = context.component;
  const docProps = component?.__docgenInfo?.props;
  if (!docProps) return context.argTypes;

  const newArgTypes = { ...(context.argTypes || {}) };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Object.entries(docProps).forEach(([name, docProp]: [string, any]) => {
    const inferred = inferControlFromDocgenType(docProp?.type);
    const argType = newArgTypes[name];

    newArgTypes[name] = {
      ...argType,
      control: { type: argType?.control ?? inferred.control } as Control,
      options: argType?.options ?? inferred.options,
      // The handwritten description will not be overwritten.
      description: pickLangDoc(argType?.description ?? docProp?.description ?? ''),
      table: {
        ...(argType?.table || {}),
        defaultValue: {
          ...docProp?.defaultValue,
          summary:
            docProp?.defaultValue?.summary ?? standardizeJsDocDefaultValue(String(docProp.defaultValue?.value ?? '-')),
        },
      },
    };
  });
  return newArgTypes;
}

export default preview;
