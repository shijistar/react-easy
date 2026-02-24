import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Loading from '../../src/components/Loading';

const meta: Meta<typeof Loading> = {
  title: 'Components/Loading',
  component: Loading,
  args: {
    mode: 'flex',
    spinning: true,
    tip: '加载中...',
    size: 'default',
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['flex', 'absolute'],
      description: `
      - **EN:** Positioning mode when used independently.
      - **CN:** 独立使用时的定位方式。
    `,
    },
    spinning: {
      control: 'boolean',
      description: `
      - **EN:** Whether loading animation is active.
      - **CN:** 是否显示加载动画。
    `,
    },
    size: {
      control: 'select',
      options: ['small', 'default', 'large'],
      description: `
      - **EN:** Size of loading indicator.
      - **CN:** 加载指示器尺寸。
    `,
    },
  },
  render: (args) => (
    <div style={{ position: 'relative', minHeight: 120, border: '1px dashed #d9d9d9', padding: 16 }}>
      <Loading {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof Loading>;

export const Standalone: Story = {};

export const WithChildren: Story = {
  args: {
    spinning: true,
  },
  render: (args: ComponentProps<typeof Loading>) => (
    <Loading {...args}>
      <div style={{ background: '#fafafa', padding: 24, borderRadius: 8 }}>这里是业务内容区域</div>
    </Loading>
  ),
};
