import type { Preview } from '@storybook/react';
import { App as AntdApp } from 'antd';
import ConfigProvider from '../src/components/ConfigProvider';

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
  decorators: [
    (Story) => (
      <AntdApp>
        <ConfigProvider lang="zh-CN">
          <div style={{ padding: 16 }}>
            <Story />
          </div>
        </ConfigProvider>
      </AntdApp>
    ),
  ],
};

export default preview;
