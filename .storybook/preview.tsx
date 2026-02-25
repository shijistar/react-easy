import { useMemo } from 'react';
import type { Preview } from '@storybook/react';
import { App as AntdApp, ConfigProvider as AntdConfigProvider, theme } from 'antd';
import enUS from 'antd/es/locale/en_US';
import zhCN from 'antd/es/locale/zh_CN';
// import { ensure, themes } from 'storybook/theming';
import ConfigProvider from '../src/components/ConfigProvider';
import demoI18n from './locales';

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
      // theme: ensure(isPreferDark ? themes.dark : themes.light),
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
        if (demoI18n.language !== lang) {
          demoI18n.changeLanguage(lang);
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
};

export default preview;
