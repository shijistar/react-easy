import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Button, Card, Input, Space, Tag, Typography } from 'antd';
import { getColorLuminance } from '../../../../src/utils/color';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

interface ColorStoryArgs {
  color: string;
}

const PRESETS = ['#1677ff', '#000000', '#ffffff', '#ff5722', '#4caf50', '#f5f5f5'];

const meta: Meta<ColorStoryArgs> = {
  title: 'Utils/color',
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
      },
    },
  },
  args: {
    color: '#1677ff',
  },
  argTypes: {
    color: {
      control: 'color',
      description: storyT('storybook.stories.color.argTypes.color.description'),
    },
  },
};

export default meta;
type Story = StoryObj<ColorStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** Type a color (hex `#rrggbb`, `#rgb`, or `rgb(r, g, b)`) or pick a preset, then read the relative luminance and whether it counts as a light or dark color.\n- **CN:** 输入颜色（`#rrggbb`、`#rgb` 或 `rgb(r, g, b)` 格式），或选择预设色，即可查看其相对亮度以及深浅判断。',
      },
    },
  },
  render: function Render(args: ColorStoryArgs) {
    return <ColorStoryDemo {...args} />;
  },
};

function ColorStoryDemo({ color }: ColorStoryArgs) {
  const t = useStoryT();
  const [current, setCurrent] = useState(color);
  const luminance = getColorLuminance(current);
  const isDark = luminance < 0.5;

  return (
    <Card variant="outlined" style={{ maxWidth: 920 }} title={t('storybook.stories.color.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('storybook.stories.color.description')}
        </Typography.Paragraph>

        <Space wrap>
          <Input
            style={{ maxWidth: 200 }}
            placeholder={t('storybook.stories.color.inputPlaceholder')}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
          {PRESETS.map((preset) => (
            <Button key={preset} onClick={() => setCurrent(preset)}>
              {preset}
            </Button>
          ))}
        </Space>

        <Space wrap>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 6,
              border: '1px solid rgba(0,0,0,0.15)',
              backgroundColor: /^(#[0-9a-fA-F]{3,8}|rgb\(.*\)$)/.test(current) ? current : 'transparent',
            }}
          />
          <Typography.Text strong>{t('storybook.stories.color.luminanceLabel')}</Typography.Text>
          <Typography.Text code>{luminance.toFixed(4)}</Typography.Text>
          <Tag color={isDark ? 'purple' : 'gold'}>
            {isDark ? t('storybook.stories.color.darkTag') : t('storybook.stories.color.lightTag')}
          </Tag>
        </Space>

        <Alert type="info" title={t('storybook.stories.color.tip')} showIcon />
      </Space>
    </Card>
  );
}
