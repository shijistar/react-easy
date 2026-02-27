import { type ComponentType, type PropsWithChildren, useMemo } from 'react';
import { type Control, DocsContainer, type DocsContainerProps } from '@storybook/addon-docs/blocks';
import type { Preview, ReactRenderer } from '@storybook/react-vite';
import { App as AntdApp, ConfigProvider as AntdConfigProvider, theme } from 'antd';
import enUS from 'antd/es/locale/en_US';
import zhCN from 'antd/es/locale/zh_CN';
import type { StoryContext, StoryContextForEnhancers } from 'storybook/internal/csf';
import { themes } from 'storybook/theming';
import ConfigProvider from '../src/components/ConfigProvider';
import storyI18n from './locales';
import { inferControlFromDocgenType, standardizeJsDocDefaultValue } from './utils/jsdoc';
import './preview.css';

const isPreferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

const preview: Preview = {
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
        light: { name: 'Light', value: '#ffffff' },
        dark: { name: 'Dark', value: '#2c2c2c' },
      },
    },
    docs: {
      container: (props: PropsWithChildren<DocsContainerProps>) => {
        const bgValue = (props.context as unknown as StoryContext<ReactRenderer>)?.globals?.backgrounds?.value;
        const isDark = bgValue ? bgValue === 'dark' : isPreferDark;
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
  initialGlobals: {
    lang: 'en-US',
    backgrounds: { value: isPreferDark ? 'dark' : 'light' },
  },
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const bgValue = context.globals?.backgrounds?.value;
      const lang = context.globals.lang ?? 'en-US';
      const antdLocale = lang === 'zh-CN' ? zhCN : enUS;
      useMemo(() => {
        if (storyI18n.language !== lang) {
          storyI18n.changeLanguage(lang);
        }
      }, [lang]);

      return (
        <AntdConfigProvider
          locale={antdLocale}
          theme={{ algorithm: bgValue === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm }}
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
  console.log('newArgTypes', newArgTypes);
  return newArgTypes;
}

export default preview;
