import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Button, Card, Input, Space, Switch, Typography } from 'antd';
import { base64ToArrayBuffer, base64ToString, stringToBase64 } from '../../../../src/utils/base64';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

interface Base64StoryArgs {
  urlSafe: boolean;
}

const meta: Meta<Base64StoryArgs> = {
  title: 'Utils/base64',
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
      },
    },
  },
  args: {
    urlSafe: false,
  },
  argTypes: {
    urlSafe: {
      control: 'boolean',
      description: storyT('storybook.stories.base64.argTypes.urlSafe.description'),
    },
  },
};

export default meta;
type Story = StoryObj<Base64StoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** Type some text, then click **Encode** to turn it into Base64 (standard or URL-safe). Use **Decode** to convert a Base64 string back into text. Toggle `urlSafe` to switch between the two formats.\n- **CN:** 输入文本后点击**编码**将其转为 Base64（标准或 URL 安全格式）。使用**解码**将 Base64 字符串还原为文本。切换 `urlSafe` 可在两种格式之间转换。',
      },
    },
  },
  render: function Render(args: Base64StoryArgs) {
    return <Base64StoryDemo {...args} />;
  },
};

function Base64StoryDemo({ urlSafe }: Base64StoryArgs) {
  const t = useStoryT();
  const [input, setInput] = useState('hello, react-easy');
  const [encoded, setEncoded] = useState('');
  const [decoded, setDecoded] = useState('');

  const bufferBytes = useMemo(() => {
    if (!encoded) return null;
    try {
      return base64ToArrayBuffer(encoded, { urlSafe }).byteLength;
    } catch {
      return null;
    }
  }, [encoded, urlSafe]);

  const handleEncode = () => {
    setEncoded(stringToBase64(input, { urlSafe }));
    setDecoded('');
  };

  const handleDecode = () => {
    setDecoded(base64ToString(input, { urlSafe }));
  };

  return (
    <Card variant="outlined" style={{ maxWidth: 920 }} title={t('storybook.stories.base64.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('storybook.stories.base64.description')}
        </Typography.Paragraph>

        <Space wrap>
          <Input
            style={{ maxWidth: 420 }}
            placeholder={t('storybook.stories.base64.inputPlaceholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type="primary" onClick={handleEncode}>
            {t('storybook.stories.base64.actions.encode')}
          </Button>
          <Button onClick={handleDecode}>{t('storybook.stories.base64.actions.decode')}</Button>
        </Space>

        <Space wrap>
          <Typography.Text strong>{t('storybook.stories.base64.urlSafeLabel')}</Typography.Text>
          <Switch checked={urlSafe} />
        </Space>

        <Space orientation="vertical" size="small" style={{ width: '100%' }}>
          <Typography.Text strong>{t('storybook.stories.base64.encodedLabel')}</Typography.Text>
          <Typography.Text code>{encoded || '—'}</Typography.Text>
          <Typography.Text strong>{t('storybook.stories.base64.decodedLabel')}</Typography.Text>
          <Typography.Text code>{decoded || '—'}</Typography.Text>
          <Typography.Text strong>{t('storybook.stories.base64.bufferLabel')}</Typography.Text>
          <Typography.Text code>{bufferBytes == null ? '—' : bufferBytes}</Typography.Text>
        </Space>

        <Alert type="info" title={t('storybook.stories.base64.tip')} showIcon />
      </Space>
    </Card>
  );
}
