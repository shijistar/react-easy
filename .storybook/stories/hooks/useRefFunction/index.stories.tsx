import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Button, Card, Space, Tag, Typography } from 'antd';
import useRefFunction from '../../../../src/hooks/useRefFunction';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

interface UseRefFunctionStoryArgs {
  showIdentity: boolean;
}

const meta: Meta<UseRefFunctionStoryArgs> = {
  title: 'Hooks/useRefFunction',
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
      },
    },
  },
  args: {
    showIdentity: true,
  },
  argTypes: {
    showIdentity: {
      control: 'boolean',
      description: storyT('storybook.stories.useRefFunction.argTypes.showIdentity.description'),
    },
  },
};

export default meta;
type Story = StoryObj<UseRefFunctionStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** The returned function keeps an immutable reference across re-renders while always calling the latest closure. Click **Increment** to re-render and compare the stored identity.\\n- **CN:** 返回的函数在多次渲染间保持引用不变，同时始终调用最新的闭包。点击**递增**触发重新渲染，对比保存的函数引用。',
      },
    },
  },
  render: function Render(args: UseRefFunctionStoryArgs) {
    return <UseRefFunctionStoryDemo {...args} />;
  },
};

function UseRefFunctionStoryDemo({ showIdentity }: UseRefFunctionStoryArgs) {
  const t = useStoryT();
  const [count, setCount] = useState(0);
  const [firstRef, setFirstRef] = useState<(() => void) | null>(null);
  const [identityChanged, setIdentityChanged] = useState(false);

  const stableLog = useRefFunction(() => {
    // eslint-disable-next-line no-console
    console.log(`count=${count}`);
    return count;
  });

  const capture = () => {
    if (!firstRef) {
      setFirstRef(stableLog);
      return;
    }
    setIdentityChanged(firstRef !== stableLog);
  };

  return (
    <Card variant="outlined" style={{ maxWidth: 920 }} title={t('storybook.stories.useRefFunction.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('storybook.stories.useRefFunction.description')}
        </Typography.Paragraph>

        <Space wrap>
          <Button type="primary" onClick={() => setCount((c) => c + 1)}>
            {t('storybook.stories.useRefFunction.increment')}
          </Button>
          <Button onClick={() => stableLog()}>{t('storybook.stories.useRefFunction.invoke')}</Button>
          <Button onClick={capture}>{t('storybook.stories.useRefFunction.capture')}</Button>
        </Space>

        <Space wrap>
          <Typography.Text strong>{t('storybook.stories.useRefFunction.countLabel')}</Typography.Text>
          <Tag color="blue">{count}</Tag>
          {showIdentity && (
            <>
              <Typography.Text strong>{t('storybook.stories.useRefFunction.identityLabel')}</Typography.Text>
              <Tag color={identityChanged ? 'red' : 'green'}>
                {identityChanged
                  ? t('storybook.stories.useRefFunction.identityChanged')
                  : t('storybook.stories.useRefFunction.identityStable')}
              </Tag>
            </>
          )}
        </Space>

        <Alert type="info" message={t('storybook.stories.useRefFunction.tip')} showIcon />
      </Space>
    </Card>
  );
}
