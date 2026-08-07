import type { Meta, StoryObj } from '@storybook/react-vite';
import { App as AntdApp, Space, Typography } from 'antd';
import ConfigProvider, { type ConfigProviderProps } from '../../../../src/components/ConfigProvider';
import ConfirmAction from '../../../../src/components/ConfirmAction';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

type ConfigProviderStoryArgs = ConfigProviderProps;

const meta: Meta<ConfigProviderStoryArgs> = {
  title: 'Components/ConfigProvider',
  component: ConfigProvider,
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
      },
    },
  },
  args: {
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
          <Space orientation="vertical" size={12}>
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
