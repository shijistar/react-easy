import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from 'antd';
import ContextMenu from '../../src/components/ContextMenu';

const meta: Meta<typeof ContextMenu> = {
  title: 'Components/ContextMenu',
  component: ContextMenu,
  args: {
    trigger: ['contextMenu'],
    items: [
      { key: 'copy', label: '复制', shortcutKey: { metaKey: true, key: 'c' } },
      { key: 'paste', label: '粘贴', shortcutKey: { metaKey: true, key: 'v' } },
      { type: 'separator' },
      {
        type: 'submenu',
        key: 'more',
        label: '更多操作',
        items: [
          { key: 'rename', label: '重命名' },
          { key: 'archive', label: '归档' },
        ],
      },
    ],
  },
  argTypes: {},
  render: (args) => (
    <ContextMenu {...args}>
      <Button type="dashed">右键（或按触发方式）打开菜单</Button>
    </ContextMenu>
  ),
};

export default meta;
type Story = StoryObj<typeof ContextMenu>;

export const Playground: Story = {};
