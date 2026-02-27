import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Loading from '../../src/components/Loading';

const meta: Meta<typeof Loading> = {
  title: 'Components/Loading',
  component: Loading,
  args: {
    mode: 'absolute',
    spinning: true,
    tip: '加载中...',
    size: 'default',
  },
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof Loading>;

export const Standalone: Story = {
  args: {
    spinning: true,
  },
  render: (args: ComponentProps<typeof Loading>) => (
    <div style={{ position: 'relative', padding: 24, border: '1px dashed #d54305', borderRadius: 8 }}>
      <Loading {...args} />
      这里是业务内容区域
    </div>
  ),
};
