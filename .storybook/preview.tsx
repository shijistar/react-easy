import { type ComponentType, type PropsWithChildren, useMemo, useState } from 'react';
import { type Control, DocsContainer, type DocsContainerProps } from '@storybook/addon-docs/blocks';
import type { Preview, ReactRenderer } from '@storybook/react-vite';
import { App as AntdApp, ConfigProvider as AntdConfigProvider, theme as antThemes } from 'antd';
import enUS from 'antd/es/locale/en_US';
import zhCN from 'antd/es/locale/zh_CN';
import { FORCE_RE_RENDER } from 'storybook/internal/core-events';
import type { StoryContext, StoryContextForEnhancers } from 'storybook/internal/csf';
import { addons, useStoryContext } from 'storybook/preview-api';
import { themes } from 'storybook/theming';
import ConfigProvider from '../src/components/ConfigProvider';
import { useRefValue } from '../src/hooks';
import type { Langs } from '../src/locales';
import storyI18n, { storyT } from './locales';
import { getGlobalValueFromUrl } from './utils/global';
import { inferControlFromDocgenType, standardizeJsDocDefaultValue } from './utils/jsdoc';

// import './preview.css';

const themeFromUrl = getGlobalValueFromUrl('backgrounds.value');
const langFromUrl = getGlobalValueFromUrl('lang');
const isPreferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

const preview: Preview = {
  initialGlobals: {
    lang: 'en-US',
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
    docs: {
      container: (props: PropsWithChildren<DocsContainerProps>) => {
        const globalValue = (props.context as unknown as StoryContext<ReactRenderer>)?.globals?.backgrounds?.value;
        const theme = globalValue ?? themeFromUrl;
        const isDark = theme ? theme === 'dark' : isPreferDark;
        return <DocsContainer {...props} theme={isDark ? themes.dark : themes.light} />;
      },
      extractComponentDescription: (
        component: ComponentType & {
          __docgenInfo?: { description?: string };
        }
      ) => {
        const raw = component?.__docgenInfo?.description ?? '';
        return stripExampleBlock(raw);
      },
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
        if (themeFromGlobal !== prevTheme) {
          setPrevTheme(themeFromGlobal);
          (window.top ?? window.parent ?? window).location.reload();
        }
      }, [themeFromGlobal, prevTheme]);

      // Reload the page if the language changes.
      useMemo(() => {
        if (storyI18n.language !== lang) {
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

function stripExampleBlock(input = '') {
  return (
    input
      // Remove @example to the next @tag (or the end).
      .replace(/\n?@example[\s\S]*?(?=\n@\w+|$)/g, '')
      .trim()
  );
}

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
      description: argType?.description ?? docProp?.description ?? '',
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
