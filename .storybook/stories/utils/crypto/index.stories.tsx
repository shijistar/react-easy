import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Button, Card, Input, Space, Switch, Typography } from 'antd';
import { advancedDecrypt, advancedEncrypt, decryptAES, encryptAES } from '../../../../src/utils/crypto';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

interface CryptoStoryArgs {
  text: string;
  key: string;
  advanced: boolean;
}

const meta: Meta<CryptoStoryArgs> = {
  title: 'Utils/crypto',
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
      },
    },
  },
  args: {
    text: 'Hello, React Easy!',
    key: 'my-secret-key',
    advanced: false,
  },
  argTypes: {
    text: {
      control: 'text',
      description: storyT('storybook.stories.crypto.argTypes.text.description'),
    },
    key: {
      control: 'text',
      description: storyT('storybook.stories.crypto.argTypes.key.description'),
    },
    advanced: {
      control: 'boolean',
      description: storyT('storybook.stories.crypto.argTypes.advanced.description'),
    },
  },
};

export default meta;
type Story = StoryObj<CryptoStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** Enter plain text and a key, then encrypt and decrypt with the standard AES flow, or toggle `advanced` to use the double-pass flow.\n- **CN:** 输入明文与密钥，使用标准 AES 流程加密/解密，或切换 `advanced` 使用双重加密流程。',
      },
    },
  },
  render: function Render(args: CryptoStoryArgs) {
    return <CryptoStoryDemo {...args} />;
  },
};

function CryptoStoryDemo({ text, key: secretKey, advanced }: CryptoStoryArgs) {
  const t = useStoryT();
  const [plainText, setPlainText] = useState(text);
  const [secret, setSecret] = useState(secretKey);
  const [cipherText, setCipherText] = useState('');
  const [decrypted, setDecrypted] = useState('');
  const [busy, setBusy] = useState(false);

  const handleEncrypt = async () => {
    setBusy(true);
    try {
      const result = advanced ? await advancedEncrypt(plainText, secret) : await encryptAES(plainText, secret);
      setCipherText(result);
      setDecrypted('');
    } finally {
      setBusy(false);
    }
  };

  const handleDecrypt = async () => {
    if (!cipherText) return;
    setBusy(true);
    try {
      const result = advanced ? await advancedDecrypt(cipherText, secret) : await decryptAES(cipherText, secret);
      setDecrypted(result);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card variant="outlined" style={{ maxWidth: 920 }} title={t('storybook.stories.crypto.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('storybook.stories.crypto.description')}
        </Typography.Paragraph>

        <Space wrap>
          <Typography.Text strong>{t('storybook.stories.crypto.plainTextLabel')}</Typography.Text>
          <Input style={{ maxWidth: 280 }} value={plainText} onChange={(e) => setPlainText(e.target.value)} />
        </Space>

        <Space wrap>
          <Typography.Text strong>{t('storybook.stories.crypto.keyLabel')}</Typography.Text>
          <Input.Password style={{ maxWidth: 280 }} value={secret} onChange={(e) => setSecret(e.target.value)} />
        </Space>

        <Space wrap>
          <Typography.Text strong>{t('storybook.stories.crypto.advancedLabel')}</Typography.Text>
          <Switch checked={advanced} disabled />
        </Space>

        <Space wrap>
          <Button type="primary" loading={busy} onClick={() => void handleEncrypt()}>
            {t('storybook.stories.crypto.actions.encrypt')}
          </Button>
          <Button loading={busy} onClick={() => void handleDecrypt()}>
            {t('storybook.stories.crypto.actions.decrypt')}
          </Button>
        </Space>

        <Space orientation="vertical" size={4} style={{ width: '100%' }}>
          <Typography.Text strong>{t('storybook.stories.crypto.cipherLabel')}</Typography.Text>
          <Typography.Text code copyable style={{ wordBreak: 'break-all' }}>
            {cipherText || '—'}
          </Typography.Text>
        </Space>

        <Space orientation="vertical" size={4} style={{ width: '100%' }}>
          <Typography.Text strong>{t('storybook.stories.crypto.resultLabel')}</Typography.Text>
          <Typography.Text code>{decrypted || '—'}</Typography.Text>
        </Space>

        <Alert type="info" title={t('storybook.stories.crypto.tip')} showIcon />
      </Space>
    </Card>
  );
}
