import type { Meta, StoryObj } from '@storybook/react-vite';
import { App as AntdApp, Space, Typography } from 'antd';
import ConfigProvider from '../../src/components/ConfigProvider';
import ConfirmAction from '../../src/components/ConfirmAction';

interface ConfigProviderStoryArgs {
  lang: 'en' | 'zh-CN';
  defaultTitle: string;
  defaultContent: string;
}

const meta: Meta<ConfigProviderStoryArgs> = {
  title: 'Components/ConfigProvider',
  args: {
    lang: 'zh-CN',
    defaultTitle: '全局确认标题',
    defaultContent: '这是由 ConfigProvider 注入的全局默认内容。',
  },
  argTypes: {
    lang: {
      control: 'radio',
      options: ['en', 'zh-CN'],
      description: `- **EN:** Language of the component for global configuration.
- **CN:** 组件语言（全局配置）。`,
      table: { defaultValue: { summary: 'en（组件默认） / zh-CN（demo）' } },
    },
    defaultTitle: {
      control: 'text',
      description: `- **EN:** Global default title for \`ConfirmAction\` in this demo.
- **CN:** 当前示例中 \`ConfirmAction\` 的全局默认标题。`,
      table: { defaultValue: { summary: '全局确认标题（demo）' } },
    },
    defaultContent: {
      control: 'text',
      description: `- **EN:** Global default content for \`ConfirmAction\` in this demo.
- **CN:** 当前示例中 \`ConfirmAction\` 的全局默认内容。`,
      table: { defaultValue: { summary: '这是由 ConfigProvider 注入的全局默认内容。（demo）' } },
    },
  },
};

export default meta;
type Story = StoryObj<ConfigProviderStoryArgs>;

export const Playground: Story = {
  render: (args: ConfigProviderStoryArgs) => (
    <AntdApp>
      <ConfigProvider
        lang={args.lang}
        ConfirmAction={{
          title: args.defaultTitle,
          content: args.defaultContent,
        }}
      >
        <Space direction="vertical" size={12}>
          <Typography.Text>下面按钮未传 title/content，将使用全局默认值：</Typography.Text>
          <ConfirmAction.Button onOk={async () => Promise.resolve()}>打开确认框</ConfirmAction.Button>
        </Space>
      </ConfigProvider>
    </AntdApp>
  ),
};
