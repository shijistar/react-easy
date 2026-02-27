import type { Meta, StoryObj } from '@storybook/react-vite';
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
  argTypes: {},
  render: (args) => (
    <div style={{ width: 640, height: 640, border: '1px dashed #d9d9d9', position: 'relative', overflow: 'hidden' }}>
      <FloatDrawer {...args}>
        <div style={{ padding: 8 }}>这里可以放置筛选项、操作面板、预览内容等。</div>
      </FloatDrawer>
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof FloatDrawer>;

export const Playground: Story = {};
