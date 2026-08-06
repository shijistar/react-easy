import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Card, Space, Typography } from 'antd';
import useProcessingText from '../../../../src/hooks/useProcessingText';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

interface UseProcessingTextStoryArgs {
  enabled: boolean;
  interval: number;
  maxDots: number;
  dotText: string;
  prefixText: string;
}

const meta: Meta<UseProcessingTextStoryArgs> = {
  title: 'Hooks/useProcessingText',
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
      },
    },
  },
  args: {
    enabled: true,
    interval: 300,
    maxDots: 3,
    dotText: '.',
    prefixText: '',
  },
  argTypes: {
    enabled: {
      control: 'boolean',
      description: storyT('storybook.stories.useProcessingText.argTypes.enabled.description'),
    },
    interval: {
      control: { type: 'range', min: 100, max: 2000, step: 50 },
      description: storyT('storybook.stories.useProcessingText.argTypes.interval.description'),
    },
    maxDots: {
      control: { type: 'range', min: 1, max: 6, step: 1 },
      description: storyT('storybook.stories.useProcessingText.argTypes.maxDots.description'),
    },
    dotText: {
      control: 'text',
      description: storyT('storybook.stories.useProcessingText.argTypes.dotText.description'),
    },
    prefixText: {
      control: 'text',
      description: storyT('storybook.stories.useProcessingText.argTypes.prefixText.description'),
    },
  },
};

export default meta;
type Story = StoryObj<UseProcessingTextStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** Watch the animated "Processing..." text cycle its dots. Toggle `enabled` to freeze/resume the animation and adjust `maxDots` to control the dot count.\\n- **CN:** 观察"处理中..."动画文字的循环点。切换 `enabled` 冻结/恢复动画，调整 `maxDots` 控制点的数量。',
      },
    },
  },
  render: function Render(args: UseProcessingTextStoryArgs) {
    return <UseProcessingTextStoryDemo {...args} />;
  },
};

function UseProcessingTextStoryDemo({ enabled, interval, maxDots, dotText, prefixText }: UseProcessingTextStoryArgs) {
  const t = useStoryT();

  const text = useProcessingText({
    enabled,
    prefixText,
    interval,
    maxDots,
    dotText,
  });

  return (
    <Card variant="outlined" style={{ maxWidth: 920 }} title={t('storybook.stories.useProcessingText.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Alert type="info" title={t('storybook.stories.useProcessingText.tip')} showIcon />

        <Typography.Title level={3} style={{ margin: 0, height: 32 }}>
          {text}
        </Typography.Title>
      </Space>
    </Card>
  );
}
