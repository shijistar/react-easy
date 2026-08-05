import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import FloatDrawer from '../../../../src/components/FloatDrawer';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

const meta: Meta<typeof FloatDrawer> = {
  title: 'Components/FloatDrawer',
  component: FloatDrawer,
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
      },
    },
  },
  args: {
    open: true,
    position: 'right',
    defaultSize: 260,
    minSize: 160,
    maxSize: 420,
    showToggle: true,
    resizable: true,
    destroyOnClose: false,
    cardProps: {
      title: storyT('storybook.stories.FloatDrawer.args.cardTitle'),
    },
    onClick: fn(),
    onOpenChange: fn(),
    onResize: fn(),
  },
  argTypes: {},
  render: function Render(args) {
    const t = useStoryT();
    return (
      <div style={{ width: 640, height: 640, border: '1px dashed #d54305', position: 'relative', overflow: 'hidden' }}>
        <FloatDrawer {...args}>
          <div style={{ padding: 8 }}>{t('storybook.stories.FloatDrawer.content')}</div>
        </FloatDrawer>
      </div>
    );
  },
};

export default meta;
type Story = StoryObj<typeof FloatDrawer>;

export const Playground: Story = {};
