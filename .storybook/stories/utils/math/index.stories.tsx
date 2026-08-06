import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Button, Card, InputNumber, Space, Typography } from 'antd';
import { random } from '../../../../src/utils/math';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

interface MathStoryArgs {
  min: number;
  max: number;
}

const meta: Meta<MathStoryArgs> = {
  title: 'Utils/math',
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
      },
    },
  },
  args: {
    min: 1,
    max: 100,
  },
  argTypes: {
    min: {
      control: { type: 'number' },
      description: storyT('storybook.stories.math.argTypes.min.description'),
    },
    max: {
      control: { type: 'number' },
      description: storyT('storybook.stories.math.argTypes.max.description'),
    },
  },
};

export default meta;
type Story = StoryObj<MathStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** Click **random()** to generate a decimal in `[0, 1)`. Set `min`/`max` and click **random(min, max)** to generate an inclusive random integer.\n- **CN:** 点击 **random()** 生成 `[0, 1)` 之间的小数。设置 `min`/`max` 后点击 **random(min, max)** 生成包含两端在内的随机整数。',
      },
    },
  },
  render: function Render(args: MathStoryArgs) {
    return <MathStoryDemo {...args} />;
  },
};

function MathStoryDemo({ min, max }: MathStoryArgs) {
  const t = useStoryT();
  const [decimal, setDecimal] = useState<number | null>(null);
  const [integer, setInteger] = useState<number | null>(null);

  return (
    <Card variant="outlined" style={{ maxWidth: 920 }} title={t('storybook.stories.math.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('storybook.stories.math.description')}
        </Typography.Paragraph>

        <Space wrap>
          <Button type="primary" onClick={() => setDecimal(random())}>
            {t('storybook.stories.math.actions.randomDecimal')}
          </Button>
          <Typography.Text strong>{t('storybook.stories.math.decimalResultLabel')}</Typography.Text>
          <Typography.Text code>{decimal == null ? '—' : decimal.toFixed(8)}</Typography.Text>
        </Space>

        <Space wrap>
          <Typography.Text strong>{t('storybook.stories.math.minLabel')}</Typography.Text>
          <InputNumber value={min} style={{ width: 120 }} />
          <Typography.Text strong>{t('storybook.stories.math.maxLabel')}</Typography.Text>
          <InputNumber value={max} style={{ width: 120 }} />
          <Button onClick={() => setInteger(random(min, max))}>
            {t('storybook.stories.math.actions.randomInteger')}
          </Button>
          <Typography.Text strong>{t('storybook.stories.math.integerResultLabel')}</Typography.Text>
          <Typography.Text code>{integer == null ? '—' : integer}</Typography.Text>
        </Space>

        <Alert type="info" title={t('storybook.stories.math.tip')} showIcon />
      </Space>
    </Card>
  );
}
