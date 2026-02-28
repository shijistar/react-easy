import type { Meta, StoryObj } from '@storybook/react-vite';
import { App as AntdApp, Space, Typography } from 'antd';
import ConfigProvider, { type ConfigProviderProps } from '../../src/components/ConfigProvider';
import ConfirmAction from '../../src/components/ConfirmAction';
import { storyT, useStoryT } from '../locales';

type ConfigProviderStoryArgs = ConfigProviderProps;

const meta: Meta<ConfigProviderStoryArgs> = {
  title: 'Components/ConfigProvider',
  component: ConfigProvider,
  args: {
    lang: 'zh-CN',
    ConfirmAction: {
      title: storyT('storybook.stories.ConfigProvider.args.confirmTitle'),
      content: storyT('storybook.stories.ConfigProvider.args.confirmContent'),
    },
  },
  argTypes: {},
};

export default meta;
type Story = StoryObj<ConfigProviderStoryArgs>;

export const Playground: Story = {
  render: function Render(args: ConfigProviderStoryArgs) {
    const t = useStoryT();
    return (
      <AntdApp>
        <ConfigProvider {...args}>
          <Space direction="vertical" size={12}>
            <Typography.Text>{t('storybook.stories.ConfigProvider.hint')}</Typography.Text>
            <ConfirmAction.Button onOk={async () => Promise.resolve()}>
              {t('storybook.stories.ConfigProvider.openButton')}
            </ConfirmAction.Button>
          </Space>
        </ConfigProvider>
      </AntdApp>
    );
  },
};
