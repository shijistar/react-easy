import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Button, Card, Input, InputNumber, Space, Typography } from 'antd';
import { randomChars, readTextAnyEncoding } from '../../../../src/utils/string';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

interface StringStoryArgs {
  length: number;
  sourceText: string;
}

const meta: Meta<StringStoryArgs> = {
  title: 'Utils/string',
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
      },
    },
  },
  args: {
    length: 12,
    sourceText: 'Hello, React Easy!',
  },
  argTypes: {
    length: {
      control: { type: 'number', min: 1, max: 128 },
      description: storyT('storybook.stories.string.argTypes.length.description'),
    },
    sourceText: {
      control: 'text',
      description: storyT('storybook.stories.string.argTypes.sourceText.description'),
    },
  },
};

export default meta;
type Story = StoryObj<StringStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** Generate a random alphanumeric string with `randomChars`, then read text back from a `Blob` with `readTextAnyEncoding`.\n- **CN:** 使用 `randomChars` 生成随机字母数字字符串，再用 `readTextAnyEncoding` 从 `Blob` 读取文本。',
      },
    },
  },
  render: function Render(args: StringStoryArgs) {
    return <StringStoryDemo {...args} />;
  },
};

function StringStoryDemo({ length, sourceText }: StringStoryArgs) {
  const t = useStoryT();
  const [charsLength, setCharsLength] = useState(length);
  const [randomResult, setRandomResult] = useState('');
  const [textSource, setTextSource] = useState(sourceText);
  const [readResult, setReadResult] = useState('');
  const [busy, setBusy] = useState(false);

  const handleGenerate = () => {
    setRandomResult(randomChars(charsLength));
  };

  const handleRead = async () => {
    setBusy(true);
    try {
      const blob = new Blob([textSource], { type: 'text/plain' });
      const result = await readTextAnyEncoding(blob);
      setReadResult(result);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card variant="outlined" style={{ maxWidth: 920 }} title={t('storybook.stories.string.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('storybook.stories.string.description')}
        </Typography.Paragraph>

        <Space orientation="vertical" size={8} style={{ width: '100%' }}>
          <Typography.Text strong>{t('storybook.stories.string.randomCharsTitle')}</Typography.Text>
          <Space wrap>
            <InputNumber min={1} max={128} value={charsLength} onChange={(value) => setCharsLength(value ?? 0)} />
            <Button type="primary" onClick={handleGenerate}>
              {t('storybook.stories.string.actions.generate')}
            </Button>
          </Space>
          <Space wrap>
            <Typography.Text strong>{t('storybook.stories.string.resultLabel')}</Typography.Text>
            <Typography.Text code>{randomResult || '—'}</Typography.Text>
          </Space>
        </Space>

        <Space orientation="vertical" size={8} style={{ width: '100%' }}>
          <Typography.Text strong>{t('storybook.stories.string.readTextTitle')}</Typography.Text>
          <Space wrap>
            <Input style={{ maxWidth: 320 }} value={textSource} onChange={(e) => setTextSource(e.target.value)} />
            <Button loading={busy} onClick={() => void handleRead()}>
              {t('storybook.stories.string.actions.read')}
            </Button>
          </Space>
          <Space wrap>
            <Typography.Text strong>{t('storybook.stories.string.resultLabel')}</Typography.Text>
            <Typography.Text code>{readResult || '—'}</Typography.Text>
          </Space>
        </Space>

        <Alert type="info" title={t('storybook.stories.string.tip')} showIcon />
      </Space>
    </Card>
  );
}
