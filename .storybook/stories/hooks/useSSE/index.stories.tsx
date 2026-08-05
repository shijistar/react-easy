import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Button, Card, Input, List, Space, Tag, Typography } from 'antd';
import useSSE from '../../../../src/hooks/useSSE';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

interface UseSSEStoryArgs {
  url: string;
}

interface SseLog {
  id: number;
  text: string;
}

const meta: Meta<UseSSEStoryArgs> = {
  title: 'Hooks/useSSE',
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
      },
    },
  },
  args: {
    url: '',
  },
  argTypes: {
    url: {
      control: 'text',
      description: storyT('storybook.stories.useSSE.argTypes.url.description'),
    },
  },
};

export default meta;
type Story = StoryObj<UseSSEStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** Enter the URL of an SSE endpoint and press **Connect**. Observe the `isRequesting` / `isConnected` indicators flip as the connection is established and streams messages into the log below. No connection is opened until you press the button, and no backend is required to render this demo.\n- **CN:** 输入 SSE 服务端地址并点击**连接**。观察 `isRequesting` / `isConnected` 指示器在建立连接并接收消息时的变化（消息会写入下方日志）。未点击按钮前不会发起连接，本示例无需真实后端即可渲染。',
      },
    },
  },
  render: function Render(args: UseSSEStoryArgs) {
    return <UseSSEStoryDemo {...args} />;
  },
};

function UseSSEStoryDemo({ url }: UseSSEStoryArgs) {
  const t = useStoryT();
  const [messages, setMessages] = useState<SseLog[]>([]);
  const [draftUrl, setDraftUrl] = useState(url);

  const appendLog = (text: string) => {
    setMessages((prev) => [{ id: Date.now() + prev.length, text }, ...prev].slice(0, 12));
  };

  const { connect, abort, isRequesting, isConnected } = useSSE<unknown>({
    url: draftUrl,
    onMessage: (data) => {
      appendLog(typeof data === 'string' ? data : data === null ? String(data) : JSON.stringify(data));
    },
    onError: (error) => {
      appendLog(`${t('storybook.stories.useSSE.errorPrefix')} ${String(error)}`);
    },
    onClose: () => {
      appendLog(t('storybook.stories.useSSE.closed'));
    },
  });

  const handleConnect = async () => {
    appendLog(t('storybook.stories.useSSE.connecting'));
    await connect();
  };

  const handleAbort = () => {
    abort();
    appendLog(t('storybook.stories.useSSE.aborted'));
  };

  const statusTag = isConnected ? (
    <Tag color="green">{t('storybook.stories.useSSE.status.connected')}</Tag>
  ) : isRequesting ? (
    <Tag color="processing">{t('storybook.stories.useSSE.status.requesting')}</Tag>
  ) : (
    <Tag>{t('storybook.stories.useSSE.status.idle')}</Tag>
  );

  return (
    <Card variant="outlined" style={{ maxWidth: 920 }} title={t('storybook.stories.useSSE.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('storybook.stories.useSSE.description')}
        </Typography.Paragraph>

        <Alert type="info" message={t('storybook.stories.useSSE.serverHint')} showIcon />

        <Space wrap style={{ width: '100%' }}>
          <Input
            style={{ maxWidth: 460 }}
            placeholder={t('storybook.stories.useSSE.urlPlaceholder')}
            value={draftUrl}
            onChange={(event) => setDraftUrl(event.target.value)}
            onPressEnter={handleConnect}
          />
          <Button type="primary" disabled={!draftUrl.trim()} onClick={handleConnect}>
            {t('storybook.stories.useSSE.connect')}
          </Button>
          <Button disabled={!isConnected && !isRequesting} onClick={handleAbort}>
            {t('storybook.stories.useSSE.abort')}
          </Button>
          <Space size="small">
            <Typography.Text strong>{t('storybook.stories.useSSE.connectedLabel')}</Typography.Text>
            {statusTag}
          </Space>
        </Space>

        <Typography.Text type="secondary">
          {t('storybook.stories.useSSE.currentUrl', { url: draftUrl || '--' })}
        </Typography.Text>

        <List
          size="small"
          bordered
          dataSource={messages}
          locale={{ emptyText: t('storybook.stories.useSSE.emptyMessages') }}
          renderItem={(item) => (
            <List.Item key={item.id}>
              <Typography.Text code>{item.text}</Typography.Text>
            </List.Item>
          )}
        />
      </Space>
    </Card>
  );
}
