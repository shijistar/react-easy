import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from 'antd';
import ContextMenu from '../../src/components/ContextMenu';

const meta: Meta<typeof ContextMenu> = {
  title: 'Components/ContextMenu',
  component: ContextMenu,
  args: {
    id: 'demo-context-menu',
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
  argTypes: {
    trigger: {
      control: 'inline-check',
      options: ['click', 'doubleClick', 'hover', 'contextMenu'],
      description: `- **EN:** Trigger methods to show the menu.
- **CN:** 触发显示菜单的方式。`,
      table: { defaultValue: { summary: '["contextMenu"]（demo）' } },
    },
    items: {
      control: 'object',
      description: `- **EN:** Menu items to be displayed.
- **CN:** 要显示的菜单项。`,
      table: { defaultValue: { summary: '内置示例菜单项（demo）' } },
    },
    theme: {
      control: 'radio',
      options: ['light', 'dark'],
      description: `- **EN:** Theme mode of the context menu.
- **CN:** 上下文菜单主题模式。`,
      table: { defaultValue: { summary: 'light（react-contexify 默认）' } },
    },
  },
  render: (args) => (
    <ContextMenu {...args}>
      <Button type="dashed">右键（或按触发方式）打开菜单</Button>
    </ContextMenu>
  ),
};

export default meta;
type Story = StoryObj<typeof ContextMenu>;

export const Playground: Story = {};
