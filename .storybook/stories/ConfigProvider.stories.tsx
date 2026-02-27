import type { Meta, StoryObj } from '@storybook/react-vite';
import { App as AntdApp, Space, Typography } from 'antd';
import ConfigProvider, { type ConfigProviderProps } from '../../src/components/ConfigProvider';
import ConfirmAction from '../../src/components/ConfirmAction';

type ConfigProviderStoryArgs = ConfigProviderProps;

const meta: Meta<ConfigProviderStoryArgs> = {
  title: 'Components/ConfigProvider',
  component: ConfigProvider,
  args: {
    lang: 'zh-CN',
    ConfirmAction: {
      title: '全局确认标题',
      content: '这是由 ConfigProvider 注入的全局默认内容。',
    },
  },
  argTypes: {},
};

export default meta;
type Story = StoryObj<ConfigProviderStoryArgs>;

export const Playground: Story = {
  render: (args: ConfigProviderStoryArgs) => (
    <AntdApp>
      <ConfigProvider {...args}>
        <Space direction="vertical" size={12}>
          <Typography.Text>下面按钮未传 title/content，将使用全局默认值：</Typography.Text>
          <ConfirmAction.Button onOk={async () => Promise.resolve()}>打开确认框</ConfirmAction.Button>
        </Space>
      </ConfigProvider>
    </AntdApp>
  ),
};
