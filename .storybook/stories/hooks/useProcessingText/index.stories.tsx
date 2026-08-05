import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Card, Input, InputNumber, Space, Typography } from 'antd';
import useProcessingText from '../../../../src/hooks/useProcessingText';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

interface UseProcessingTextStoryArgs {
  enabled: boolean;
  maxDots: number;
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
    maxDots: 3,
  },
  argTypes: {
    enabled: {
      control: 'boolean',
      description: storyT('storybook.stories.useProcessingText.argTypes.enabled.description'),
    },
    maxDots: {
      control: { type: 'range', min: 1, max: 6, step: 1 },
      description: storyT('storybook.stories.useProcessingText.argTypes.maxDots.description'),
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

function UseProcessingTextStoryDemo({ enabled, maxDots }: UseProcessingTextStoryArgs) {
  const t = useStoryT();
  const [prefixText, setPrefixText] = useState('');
  const [interval, setInterval] = useState(300);

  const text = useProcessingText({
    enabled,
    prefixText,
    interval,
    maxDots,
  });

  return (
    <Card variant="outlined" style={{ maxWidth: 920 }} title={t('storybook.stories.useProcessingText.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('storybook.stories.useProcessingText.description')}
        </Typography.Paragraph>

        <Space wrap>
          <Typography.Text strong>{t('storybook.stories.useProcessingText.prefixLabel')}</Typography.Text>
          <Input
            style={{ maxWidth: 200 }}
            placeholder={t('storybook.stories.useProcessingText.prefixPlaceholder')}
            value={prefixText}
            onChange={(e) => setPrefixText(e.target.value)}
          />
          <Typography.Text strong>{t('storybook.stories.useProcessingText.intervalLabel')}</Typography.Text>
          <InputNumber min={100} max={2000} step={50} value={interval} onChange={(v) => setInterval(v ?? 300)} />
        </Space>

        <Typography.Title level={3} style={{ margin: 0 }}>
          {text}
        </Typography.Title>

        <Alert type="info" title={t('storybook.stories.useProcessingText.tip')} showIcon />
      </Space>
    </Card>
  );
}
