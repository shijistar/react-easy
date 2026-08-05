import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, Space, Typography } from 'antd';
import PulseAnimation from '../../../../src/components/Animation/Pulse';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

const meta: Meta<typeof PulseAnimation> = {
  title: 'Components/PulseAnimation',
  component: PulseAnimation,
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
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
      description: storyT('storybook.stories.PulseAnimation.argTypes.bars.description'),
      table: { defaultValue: { summary: '8' } },
    },
    barGap: {
      control: 'number',
      description: storyT('storybook.stories.PulseAnimation.argTypes.barGap.description'),
      table: { defaultValue: { summary: '4' } },
    },
    duration: {
      control: 'number',
      description: storyT('storybook.stories.PulseAnimation.argTypes.duration.description'),
      table: { defaultValue: { summary: '1.6' } },
    },
    delayRate: {
      control: 'number',
      description: storyT('storybook.stories.PulseAnimation.argTypes.delayRate.description'),
      table: { defaultValue: { summary: '0.09' } },
    },
    barColor: {
      control: 'color',
      description: storyT('storybook.stories.PulseAnimation.argTypes.barColor.description'),
    },
    barStyle: {
      control: 'object',
      description: storyT('storybook.stories.PulseAnimation.argTypes.barStyle.description'),
    },
    prefixCls: {
      control: 'text',
      description: storyT('storybook.stories.PulseAnimation.argTypes.prefixCls.description'),
    },
  },
};

export default meta;
type Story = StoryObj<typeof PulseAnimation>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: storyT('storybook.stories.PulseAnimation.stories.Playground.description'),
      },
    },
  },
};

export const AudioActivity: Story = {
  parameters: {
    docs: {
      description: {
        story: storyT('storybook.stories.PulseAnimation.stories.AudioActivity.description'),
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
        story: storyT('storybook.stories.PulseAnimation.stories.LightLoading.description'),
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
