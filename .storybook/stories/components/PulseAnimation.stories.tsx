import type { Meta, StoryObj } from '@storybook/react-vite';
import PulseAnimation from '../../../src/components/Animation/Pulse';

const meta: Meta<typeof PulseAnimation> = {
  title: 'Components/PulseAnimation',
  component: PulseAnimation,
  parameters: {
    docs: {
      description: {
        component: `- **EN:** An animated pulse-bar indicator suitable for audio-style activity or lightweight loading feedback.
- **CN:** 一个脉冲柱状动画组件，适合音频活动态或轻量加载反馈场景。`,
      },
    },
  },
  args: {
    bars: 8,
    barGap: 4,
    duration: 1.6,
    delayRate: 0.09,
    barColor: '#1677ff',
    style: { width: 240, height: 64 },
  },
  argTypes: {
    bars: {
      control: 'number',
      description: `- **EN:** Number of animated bars.
- **CN:** 动画柱条数量。`,
      table: { defaultValue: { summary: '8' } },
    },
    barGap: {
      control: 'number',
      description: `- **EN:** Horizontal gap between bars.
- **CN:** 柱条之间的水平间距。`,
      table: { defaultValue: { summary: '4' } },
    },
    duration: {
      control: 'number',
      description: `- **EN:** Animation duration in seconds.
- **CN:** 动画总时长，单位为秒。`,
      table: { defaultValue: { summary: '1.6' } },
    },
    delayRate: {
      control: 'number',
      description: `- **EN:** Delay offset rate used to stagger each bar animation.
- **CN:** 每根柱条的错峰延迟系数。`,
      table: { defaultValue: { summary: '0.09' } },
    },
    barColor: {
      control: 'color',
      description: `- **EN:** Base color of the animation bars.
- **CN:** 动画柱条的基础颜色。`,
      table: { defaultValue: { summary: "'#1677ff'" } },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PulseAnimation>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: `- **EN:** Adjust bar count, gap, and timing controls to explore different motion rhythms.
- **CN:** 可调整柱子数量、间距和节奏参数，观察不同的动画律动效果。`,
      },
    },
  },
};
