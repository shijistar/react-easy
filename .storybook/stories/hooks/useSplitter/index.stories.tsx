import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, Space, Tag, Typography } from 'antd';
import useSplitter from '../../../../src/hooks/useSplitter';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

interface UseSplitterStoryArgs {
  direction: 'vertical' | 'horizontal';
  defaultRatio: number;
  minRatio: number;
  maxRatio: number;
}

const meta: Meta<UseSplitterStoryArgs> = {
  title: 'Hooks/useSplitter',
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
      },
    },
  },
  args: {
    direction: 'vertical',
    defaultRatio: 0.32,
    minRatio: 0.15,
    maxRatio: 0.85,
  },
  argTypes: {
    direction: {
      control: 'radio',
      options: ['vertical', 'horizontal'],
      description: storyT('storybook.stories.useSplitter.argTypes.direction.description'),
    },
    defaultRatio: {
      control: { type: 'range', min: 0.1, max: 0.9, step: 0.01 },
      description: storyT('storybook.stories.useSplitter.argTypes.defaultRatio.description'),
    },
    minRatio: {
      control: { type: 'range', min: 0.05, max: 0.5, step: 0.01 },
      description: storyT('storybook.stories.useSplitter.argTypes.minRatio.description'),
    },
    maxRatio: {
      control: { type: 'range', min: 0.5, max: 0.95, step: 0.01 },
      description: storyT('storybook.stories.useSplitter.argTypes.maxRatio.description'),
    },
  },
};

export default meta;
type Story = StoryObj<UseSplitterStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** Drag the splitter handle to resize the two panes. Use the controls to change direction and the `minRatio` / `maxRatio` boundaries, and watch the live `percent` update as you drag.\n- **CN:** 拖动分割条即可调整两个面板的尺寸。通过控件切换方向并调整 `minRatio` / `maxRatio` 边界，拖动时可实时观察 `percent` 的变化。',
      },
    },
  },
  render: function Render(args: UseSplitterStoryArgs) {
    return <UseSplitterStoryDemo {...args} />;
  },
};

function UseSplitterStoryDemo({ direction, defaultRatio, minRatio, maxRatio }: UseSplitterStoryArgs) {
  const t = useStoryT();
  const { dom, percent, dragging } = useSplitter({
    direction,
    defaultRatio,
    minRatio,
    maxRatio,
    onChange: () => undefined,
  });

  const ratio = percent ?? defaultRatio;
  const vertical = direction === 'vertical';

  const leftPaneStyle: CSSProperties = vertical
    ? { height: '100%', width: `${ratio * 100}%` }
    : { width: '100%', height: `${ratio * 100}%` };

  const containerStyle: CSSProperties = vertical
    ? { display: 'flex', height: 300, width: '100%' }
    : { display: 'flex', flexDirection: 'column', height: 300, width: '100%' };

  return (
    <Card variant="outlined" style={{ maxWidth: 920 }} title={t('storybook.stories.useSplitter.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('storybook.stories.useSplitter.description')}
        </Typography.Paragraph>

        <div style={containerStyle}>
          <div
            style={{
              ...leftPaneStyle,
              flex: '0 0 auto',
              background: '#1677ff',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {t('storybook.stories.useSplitter.pane', { position: vertical ? 'left' : 'top' })}
          </div>
          {dom}
          <div style={{ flex: 1, minWidth: 0, minHeight: 0, background: '#52c41a' }} />
        </div>

        <Space wrap>
          <Typography.Text strong>{t('storybook.stories.useSplitter.directionLabel')}</Typography.Text>
          <Tag>{direction}</Tag>
          <Typography.Text strong>{t('storybook.stories.useSplitter.ratioLabel')}</Typography.Text>
          <Tag color={dragging ? 'processing' : undefined}>{`${(ratio * 100).toFixed(1)}%`}</Tag>
          <Typography.Text strong>{t('storybook.stories.useSplitter.minRatioLabel')}</Typography.Text>
          <Tag>{minRatio}</Tag>
          <Typography.Text strong>{t('storybook.stories.useSplitter.maxRatioLabel')}</Typography.Text>
          <Tag>{maxRatio}</Tag>
        </Space>
      </Space>
    </Card>
  );
}
