import type { Meta, StoryObj } from '@storybook/react';
import PulseAnimation from '../../src/components/Animation/Pulse';

const meta: Meta<typeof PulseAnimation> = {
  title: 'Components/PulseAnimation',
  component: PulseAnimation,
  args: {
    bars: 8,
    barGap: 4,
    duration: 1.6,
    delayRate: 0.09,
    barColor: '#1677ff',
  },
  argTypes: {
    bars: {
      control: { type: 'number', min: 3, max: 24, step: 1 },
      description: `- **EN:** Number of bars.
- **CN:** 脉动柱子数量。`,
    },
    barGap: {
      control: { type: 'number', min: 0, max: 20, step: 1 },
      description: `- **EN:** Gap between bars.
- **CN:** 柱子间距。`,
    },
    duration: {
      control: { type: 'number', min: 0.2, max: 5, step: 0.1 },
      description: `- **EN:** Animation duration in seconds.
- **CN:** 动画持续时间（秒）。`,
    },
    delayRate: {
      control: { type: 'number', min: 0, max: 0.5, step: 0.01 },
      description: `- **EN:** Animation delay rate between bars.
- **CN:** 柱子之间的动画延迟比例。`,
    },
    barColor: {
      control: 'color',
      description: `- **EN:** Background color of the bars.
- **CN:** 柱子背景色。`,
    },
  },
  render: (args) => <PulseAnimation {...args} style={{ width: 240, height: 64, ...args.style }} />,
};

export default meta;
type Story = StoryObj<typeof PulseAnimation>;

export const Playground: Story = {};
