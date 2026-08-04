import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from 'antd';
import ContextMenu from '../../../../src/components/ContextMenu';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

const meta: Meta<typeof ContextMenu> = {
  title: 'Components/ContextMenu',
  component: ContextMenu,
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? introduceCN + apiDocCN : introduceEN + apiDocEN,
      },
    },
  },
  args: {
    trigger: ['contextMenu'],
    items: [
      {
        key: 'copy',
        label: storyT('storybook.stories.ContextMenu.items.copy'),
        shortcutKey: { metaKey: true, key: 'c' },
      },
      {
        key: 'paste',
        label: storyT('storybook.stories.ContextMenu.items.paste'),
        shortcutKey: { metaKey: true, key: 'v' },
      },
      { type: 'separator' },
      {
        type: 'submenu',
        key: 'more',
        label: storyT('storybook.stories.ContextMenu.items.more'),
        items: [
          { key: 'rename', label: storyT('storybook.stories.ContextMenu.items.rename') },
          { key: 'archive', label: storyT('storybook.stories.ContextMenu.items.archive') },
        ],
      },
    ],
    onVisibilityChange: fn(),
  },
  argTypes: {},
  render: function Render(args) {
    const t = useStoryT();
    return (
      <ContextMenu {...args}>
        <Button type="dashed">{t('storybook.stories.ContextMenu.openMenu')}</Button>
      </ContextMenu>
    );
  },
};

export default meta;
type Story = StoryObj<typeof ContextMenu>;

export const Playground: Story = {};
