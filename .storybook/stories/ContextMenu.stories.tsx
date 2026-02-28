import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from 'antd';
import ContextMenu from '../../src/components/ContextMenu';
import { storyT, useStoryT } from '../locales';

const meta: Meta<typeof ContextMenu> = {
  title: 'Components/ContextMenu',
  component: ContextMenu,
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
