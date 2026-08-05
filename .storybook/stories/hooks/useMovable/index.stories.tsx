import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Card, Space, Switch, Typography } from 'antd';
import useMovable from '../../../../src/hooks/useMovable';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

interface UseMovableStoryArgs {
  enabled: boolean;
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
    persist: true,
  },
  argTypes: {
    enabled: {
      control: 'boolean',
      description: storyT('storybook.stories.useMovable.argTypes.enabled.description'),
    },
    persist: {
      control: 'boolean',
      description: storyT('storybook.stories.useMovable.argTypes.persist.description'),
    },
  },
};

export default meta;
type Story = StoryObj<UseMovableStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** Drag the blue card around the container. Toggle `enabled` to turn dragging on/off and `persist` to store the position in `localStorage`.\\n- **CN:** 拖动蓝色卡片在容器内移动。切换 `enabled` 开关控制拖动，切换 `persist` 将位置持久化到 `localStorage`。',
      },
    },
  },
  render: function Render(args: UseMovableStoryArgs) {
    return <UseMovableStoryDemo {...args} />;
  },
};

function UseMovableStoryDemo({ enabled, persist }: UseMovableStoryArgs) {
  const t = useStoryT();
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number } | undefined>(undefined);

  const { onPointerDown, position: hookPosition } = useMovable({
    enabled,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    containerRef: containerRef as any,
    storageKey: persist ? 'storybook.useMovable.position' : undefined,
    ignoreSelectors: ['.ant-btn'],
  });

  const effectivePosition = hookPosition ?? position ?? { left: 0, top: 0 };
  void setPosition;

  return (
    <Card variant="outlined" style={{ maxWidth: 920 }} title={t('storybook.stories.useMovable.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('storybook.stories.useMovable.description')}
        </Typography.Paragraph>

        <Space wrap>
          <Typography.Text strong>{t('storybook.stories.useMovable.enabledLabel')}</Typography.Text>
          <Switch checked={enabled} disabled />
          <Typography.Text strong>{t('storybook.stories.useMovable.persistLabel')}</Typography.Text>
          <Switch checked={persist} disabled />
        </Space>

        <div
          ref={containerRef}
          style={{
            position: 'relative',
            height: 260,
            border: '1px dashed #d9d9d9',
            borderRadius: 8,
            overflow: 'hidden',
            background: '#fafafa',
          }}
        >
          <div
            onPointerDown={onPointerDown}
            style={{
              position: 'absolute',
              left: effectivePosition.left || 16,
              top: effectivePosition.top || 16,
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
            {`left: ${effectivePosition.left || 16}, top: ${effectivePosition.top || 16}`}
          </Typography.Text>
        </Space>

        <Alert type="info" message={t('storybook.stories.useMovable.tip')} showIcon />
      </Space>
    </Card>
  );
}
