import { useEffect, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Card, Space, Typography } from 'antd';
import useMovable, { type UseMovableProps } from '../../../../src/hooks/useMovable';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

interface UseMovableStoryArgs extends Pick<UseMovableProps, 'enabled'> {
  persist: boolean;
}

const meta: Meta<UseMovableStoryArgs> = {
  title: 'Hooks/useMovable',
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
      },
    },
  },
  args: {
    enabled: true,
    persist: false,
  },
  argTypes: {
    enabled: {
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
      description: storyT('storybook.stories.useMovable.argTypes.enabled.description'),
    },
    persist: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
      description: storyT('storybook.stories.useMovable.argTypes.persist.description'),
    },
  },
};

export default meta;
type Story = StoryObj<UseMovableStoryArgs>;

export const MovingWithinContainer: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** Drag the blue card around the container. Toggle `enabled` to turn dragging on/off and `persist` to store the position in `localStorage`.\\n- **CN:** 拖动蓝色卡片在容器内移动。切换 `enabled` 开关控制拖动，切换 `persist` 将位置持久化到 `localStorage`。',
      },
    },
  },
  render: function Render(args: UseMovableStoryArgs) {
    return <UseMovableStoryDemo inContainer {...args} />;
  },
};
export const MovingFreely: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** Drag the blue card freely around the screen. Toggle `enabled` to turn dragging on/off and `persist` to store the position in `localStorage`.\\n- **CN:** 自由拖动蓝色卡片在屏幕上移动。切换 `enabled` 开关控制拖动，切换 `persist` 将位置持久化到 `localStorage`。',
      },
    },
  },
  render: function Render(args: UseMovableStoryArgs) {
    return <UseMovableStoryDemo {...args} />;
  },
};

function UseMovableStoryDemo({ enabled, persist, inContainer }: UseMovableStoryArgs & { inContainer?: boolean }) {
  const t = useStoryT();
  const viewPortRef = useRef<HTMLDivElement>(null);
  const movableDomRef = useRef<HTMLDivElement>(null);
  useMovable({
    enabled,
    movableDomRef,
    viewPortRef: inContainer ? viewPortRef : undefined,
    storageKey: persist ? 'storybook.useMovable.position' : undefined,
    ignoreSelectors: ['.ant-btn'],
  });

  useEffect(() => {
    if (movableDomRef.current && !inContainer) {
      const rect = movableDomRef.current.getBoundingClientRect();
      movableDomRef.current.style.left = rect.left + 'px';
      movableDomRef.current.style.top = rect.top + 'px';
    }
  }, [inContainer]);

  return (
    <Card variant="outlined" style={{ maxWidth: 920 }} title={t('storybook.stories.useMovable.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('storybook.stories.useMovable.description')}
        </Typography.Paragraph>
        {inContainer && <Alert type="info" title={t('storybook.stories.useMovable.tip')} showIcon />}

        <div
          ref={viewPortRef}
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: 260,
            border: '1px dashed #d9d9d9',
            borderRadius: 8,
            background: '#fafafa',
          }}
        >
          <div
            ref={movableDomRef}
            style={{
              position: inContainer ? 'absolute' : 'fixed',
              width: 180,
              padding: '16px 20px',
              borderRadius: 8,
              background: '#1677ff',
              color: '#fff',
              cursor: enabled ? 'grab' : 'not-allowed',
              touchAction: 'none',
              userSelect: 'none',
            }}
          >
            <Typography.Text strong style={{ color: '#fff' }}>
              {t('storybook.stories.useMovable.handle')}
            </Typography.Text>
            <Typography.Text style={{ color: '#fff', display: 'block', fontSize: 12 }}>
              {t('storybook.stories.useMovable.dragHint')}
            </Typography.Text>
          </div>
        </div>

        <Space wrap>
          <Typography.Text strong>{t('storybook.stories.useMovable.positionLabel')}</Typography.Text>
          <Typography.Text code>
            {`left: ${movableDomRef.current?.style.left ?? 0}, top: ${movableDomRef.current?.style.top ?? 0}`}
          </Typography.Text>
        </Space>
      </Space>
    </Card>
  );
}
