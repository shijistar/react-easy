import type { Preview } from '@storybook/react';
import { App as AntdApp, ConfigProvider as AntdConfigProvider, theme } from 'antd';
import ConfigProvider from '../src/components/ConfigProvider';
import { getColorLuminance } from '../src/utils/color';

const preview: Preview = {
  parameters: {
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const bgValue = context.globals?.backgrounds?.value;
      const isDark = bgValue && getColorLuminance(bgValue) < 0.5;
      return (
        <AntdConfigProvider theme={{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
          <AntdApp>
            <ConfigProvider lang="zh-CN">
              <div style={{ padding: 16 }}>
                <Story />
              </div>
            </ConfigProvider>
          </AntdApp>
        </AntdConfigProvider>
      );
    },
  ],
};

export default preview;
