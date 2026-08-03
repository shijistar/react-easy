import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, Space, Typography } from 'antd';
import PulseAnimation from '../../../src/components/Animation/Pulse';
import { useStoryT } from '../../locales';
import apidoc from './PulseAnimation.apidoc.md?raw';

const meta: Meta<typeof PulseAnimation> = {
  title: 'Components/PulseAnimation',
  component: PulseAnimation,
  parameters: {
    docs: {
      description: {
        component: apidoc,
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
    },
    barStyle: {
      control: 'object',
      description: `- **EN:** Extra styles applied to each bar.
- **CN:** 应用于每根柱条的额外样式。`,
    },
    prefixCls: {
      control: 'text',
      description: `- **EN:** Custom CSS class prefix for the component.
- **CN:** 组件的自定义 CSS 类前缀。`,
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

export const AudioActivity: Story = {
  parameters: {
    docs: {
      description: {
        story: `- **EN:** A typical audio-activity indicator: many thin bars with a tight gap and a short stagger delay, rendered inside a player card.
- **CN:** 典型的音频活动指示器：细密柱条 + 小间距 + 短错峰延迟，放在播放器卡片中演示。`,
      },
    },
  },
  render: function Render() {
    const t = useStoryT();
    return (
      <Card style={{ width: 360 }} title={t('storybook.stories.PulseAnimation.audioCardTitle')}>
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <Space>
            <Typography.Text strong>{t('storybook.stories.PulseAnimation.audioTrack')}</Typography.Text>
            <Typography.Text type="secondary">{t('storybook.stories.PulseAnimation.audioPlaying')}</Typography.Text>
          </Space>
          <PulseAnimation bars={24} barGap={3} duration={1.2} delayRate={0.05} style={{ width: '100%', height: 40 }} />
        </Space>
      </Card>
    );
  },
};

export const LightLoading: Story = {
  parameters: {
    docs: {
      description: {
        story: `- **EN:** Use pulse bars as a lightweight loading indicator next to text content.
- **CN:** 将脉冲柱条作为轻量加载指示器，与文本内容并排展示。`,
      },
    },
  },
  render: function Render() {
    const t = useStoryT();
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <PulseAnimation bars={8} barGap={4} duration={1.6} delayRate={0.09} style={{ width: 120, height: 32 }} />
        <Typography.Text type="secondary">{t('storybook.stories.PulseAnimation.loadingTip')}</Typography.Text>
      </div>
    );
  },
};
