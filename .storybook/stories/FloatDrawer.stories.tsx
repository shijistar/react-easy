import type { Meta, StoryObj } from '@storybook/react';
import FloatDrawer from '../../src/components/FloatDrawer';

const meta: Meta<typeof FloatDrawer> = {
  title: 'Components/FloatDrawer',
  component: FloatDrawer,
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
      title: '设置面板',
    },
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: `- **EN:** Whether the drawer is open.
- **CN:** 抽屉是否打开。`,
    },
    position: {
      control: 'radio',
      options: ['left', 'right', 'top', 'bottom'],
      description: `- **EN:** Position of the drawer.
    - **CN:** 抽屉的位置。`,
    },
    defaultSize: {
      control: { type: 'number', min: 120, max: 500, step: 10 },
      description: `- **EN:** Default size of the drawer.
    - **CN:** 抽屉默认尺寸。`,
    },
    minSize: {
      control: { type: 'number', min: 0, max: 400, step: 10 },
      description: `- **EN:** Minimum size of the drawer.
    - **CN:** 抽屉最小尺寸。`,
    },
    maxSize: {
      control: { type: 'number', min: 120, max: 800, step: 10 },
      description: `- **EN:** Maximum size of the drawer.
    - **CN:** 抽屉最大尺寸。`,
    },
    showToggle: {
      control: 'boolean',
      description: `- **EN:** Whether to show the toggle button.
    - **CN:** 是否显示展开/收起按钮。`,
    },
    resizable: {
      control: 'boolean',
      description: `- **EN:** Whether the drawer is resizable.
    - **CN:** 抽屉是否可调整大小。`,
    },
    destroyOnClose: {
      control: 'boolean',
      description: `- **EN:** Whether to destroy the drawer content when closed.
    - **CN:** 抽屉关闭时是否销毁内容。`,
    },
    cardProps: {
      control: 'object',
      description: `- **EN:** Custom properties for the inner card element.
    - **CN:** 内部卡片元素自定义属性。`,
    },
  },
  render: (args) => (
    <div style={{ width: 640, height: 320, border: '1px dashed #d9d9d9', position: 'relative', overflow: 'hidden' }}>
      <FloatDrawer {...args}>
        <div style={{ padding: 8 }}>这里可以放置筛选项、操作面板、预览内容等。</div>
      </FloatDrawer>
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof FloatDrawer>;

export const Playground: Story = {};
