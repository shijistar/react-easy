import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Button, Card, Space, Tag, Typography } from 'antd';
import useRefValue from '../../../../src/hooks/useRefValue';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

interface UseRefValueStoryArgs {
  showSync: boolean;
}

const meta: Meta<UseRefValueStoryArgs> = {
  title: 'Hooks/useRefValue',
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
      },
    },
  },
  args: {
    showSync: true,
  },
  argTypes: {
    showSync: {
      control: 'boolean',
      description: storyT('storybook.stories.useRefValue.argTypes.showSync.description'),
    },
  },
};

export default meta;
type Story = StoryObj<UseRefValueStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** `useRefValue` returns a mutable ref whose `.current` always matches the latest state value. Click **Increment** and watch the ref stay in sync with the counter.\\n- **CN:** `useRefValue` 返回一个可变 ref，其 `.current` 始终与最新状态保持一致。点击**递增**，观察 ref 与计数器实时同步。',
      },
    },
  },
  render: function Render(args: UseRefValueStoryArgs) {
    return <UseRefValueStoryDemo {...args} />;
  },
};

function UseRefValueStoryDemo({ showSync }: UseRefValueStoryArgs) {
  const t = useStoryT();
  const [count, setCount] = useState(0);
  const [captured, setCaptured] = useState(0);
  const countRef = useRefValue(count);

  // A one-time effect that reads the ref, proving the ref stays fresh without re-running.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCaptured(countRef.current);
    }, 500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <Card variant="outlined" style={{ maxWidth: 920 }} title={t('storybook.stories.useRefValue.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('storybook.stories.useRefValue.description')}
        </Typography.Paragraph>

        <Space wrap>
          <Button type="primary" onClick={() => setCount((c) => c + 1)}>
            {t('storybook.stories.useRefValue.increment')}
          </Button>
          <Button onClick={() => setCaptured(countRef.current)}>{t('storybook.stories.useRefValue.capture')}</Button>
        </Space>

        <Space wrap>
          <Typography.Text strong>{t('storybook.stories.useRefValue.stateLabel')}</Typography.Text>
          <Tag color="blue">{count}</Tag>
          <Typography.Text strong>{t('storybook.stories.useRefValue.refLabel')}</Typography.Text>
          <Tag color="green">{countRef.current}</Tag>
          {showSync && (
            <>
              <Typography.Text strong>{t('storybook.stories.useRefValue.capturedLabel')}</Typography.Text>
              <Tag color={captured === count ? 'green' : 'orange'}>{captured}</Tag>
            </>
          )}
        </Space>

        <Alert type="info" title={t('storybook.stories.useRefValue.tip')} showIcon />
      </Space>
    </Card>
  );
}
