import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Button, Card, Input, Space, Tag, Typography } from 'antd';
import useStompSocket from '../../../../src/hooks/useStompSocket';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

interface UseStompSocketStoryArgs {
  url: string;
  sendEndpoint: string;
  subscribeEndpoint: string;
}

const meta: Meta<UseStompSocketStoryArgs> = {
  title: 'Hooks/useStompSocket',
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
      },
    },
  },
  args: {
    url: '',
    sendEndpoint: '/app/send',
    subscribeEndpoint: '/topic/messages',
  },
  argTypes: {
    url: {
      control: 'text',
      description: storyT('storybook.stories.useStompSocket.argTypes.url.description'),
    },
    sendEndpoint: {
      control: 'text',
      description: storyT('storybook.stories.useStompSocket.argTypes.sendEndpoint.description'),
    },
    subscribeEndpoint: {
      control: 'text',
      description: storyT('storybook.stories.useStompSocket.argTypes.subscribeEndpoint.description'),
    },
  },
};

export default meta;
type Story = StoryObj<UseStompSocketStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** Enter a SockJS/STOMP endpoint URL and press **Connect**. The hook opens the socket, subscribes to the receive endpoint, and lets you send messages. A live backend is required; the demo renders without one.\\n- **CN:** 输入 SockJS/STOMP 服务地址并点击**连接**。hook 会建立 socket、订阅接收端点，并允许发送消息。本示例需要真实后端；没有后端也能正常渲染。',
      },
    },
  },
  render: function Render(args: UseStompSocketStoryArgs) {
    return <UseStompSocketStoryDemo {...args} />;
  },
};

function UseStompSocketStoryDemo({ url: initialUrl, sendEndpoint, subscribeEndpoint }: UseStompSocketStoryArgs) {
  const t = useStoryT();
  const [url, setUrl] = useState(initialUrl);
  const [message, setMessage] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);

  const appendLog = (text: string) => {
    setLog((prev) => [text, ...prev].slice(0, 10));
  };

  const { connect, close, send } = useStompSocket<string>({
    url,
    sendEndpoint,
    subscribeEndpoint,
    onConnected: () => {
      setConnected(true);
      setBusy(false);
      appendLog(t('storybook.stories.useStompSocket.log.connected'));
    },
    onMessage: (msg) => {
      appendLog(`${t('storybook.stories.useStompSocket.log.received')} ${msg}`);
    },
    onClose: () => {
      setConnected(false);
      setBusy(false);
      appendLog(t('storybook.stories.useStompSocket.log.closed'));
    },
  });

  const handleConnect = async () => {
    setBusy(true);
    appendLog(t('storybook.stories.useStompSocket.log.connecting'));
    await connect();
  };

  const handleSend = () => {
    if (!message.trim()) return;
    send(message);
    appendLog(`${t('storybook.stories.useStompSocket.log.sent')} ${message}`);
    setMessage('');
  };

  return (
    <Card variant="outlined" style={{ maxWidth: 920 }} title={t('storybook.stories.useStompSocket.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('storybook.stories.useStompSocket.description')}
        </Typography.Paragraph>

        <Alert type="info" title={t('storybook.stories.useStompSocket.serverHint')} showIcon />

        <Space wrap style={{ width: '100%' }}>
          <Input
            style={{ maxWidth: 420 }}
            placeholder={t('storybook.stories.useStompSocket.urlPlaceholder')}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button type="primary" loading={busy} disabled={!url.trim()} onClick={handleConnect}>
            {t('storybook.stories.useStompSocket.connect')}
          </Button>
          <Button danger disabled={!connected} onClick={close}>
            {t('storybook.stories.useStompSocket.close')}
          </Button>
          <Space size="small">
            <Typography.Text strong>{t('storybook.stories.useStompSocket.statusLabel')}</Typography.Text>
            <Tag color={connected ? 'green' : 'default'}>
              {connected
                ? t('storybook.stories.useStompSocket.status.connected')
                : t('storybook.stories.useStompSocket.status.disconnected')}
            </Tag>
          </Space>
        </Space>

        <Space wrap style={{ width: '100%' }}>
          <Input
            style={{ maxWidth: 420 }}
            placeholder={t('storybook.stories.useStompSocket.messagePlaceholder')}
            value={message}
            disabled={!connected}
            onChange={(e) => setMessage(e.target.value)}
            onPressEnter={handleSend}
          />
          <Button disabled={!connected || !message.trim()} onClick={handleSend}>
            {t('storybook.stories.useStompSocket.send')}
          </Button>
        </Space>

        <Typography.Text strong>{t('storybook.stories.useStompSocket.logTitle')}</Typography.Text>
        {log.length === 0 ? (
          <Typography.Text type="secondary">{t('storybook.stories.useStompSocket.emptyLog')}</Typography.Text>
        ) : (
          log.map((item, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Typography.Text key={`${item}-${index}`} code>
              {item}
            </Typography.Text>
          ))
        )}
      </Space>
    </Card>
  );
}
