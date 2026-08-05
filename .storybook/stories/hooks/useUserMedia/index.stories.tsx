import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Button, Card, Space, Tag, Typography } from 'antd';
import useUserMedia from '../../../../src/hooks/useUserMedia';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

interface UseUserMediaStoryArgs {
  audio: boolean;
}

const meta: Meta<UseUserMediaStoryArgs> = {
  title: 'Hooks/useUserMedia',
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
      },
    },
  },
  args: {
    audio: true,
  },
  argTypes: {
    audio: {
      control: 'boolean',
      description: storyT('storybook.stories.useUserMedia.argTypes.audio.description'),
    },
  },
};

export default meta;
type Story = StoryObj<UseUserMediaStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** Press **Start recording** to request the microphone and begin recording (audio only). The demo shows the live `isRecording` state and whether a media stream is available. It never auto-starts.\\n- **CN:** 点击**开始录制**请求麦克风权限并开始录制（仅音频）。示例展示实时的 `isRecording` 状态与媒体流是否可用；不会自动开始录制。',
      },
    },
  },
  render: function Render(args: UseUserMediaStoryArgs) {
    return <UseUserMediaStoryDemo {...args} />;
  },
};

function UseUserMediaStoryDemo({ audio }: UseUserMediaStoryArgs) {
  const t = useStoryT();
  const [error, setError] = useState<string | null>(null);

  const { isRecording, startRecording, stopRecording, mediaStream } = useUserMedia({
    media: { audio: audio ? true : false, video: false },
    onStartRecording: () => setError(null),
    onStopRecording: () => undefined,
  });

  const handleStart = async () => {
    setError(null);
    try {
      await startRecording();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <Card variant="outlined" style={{ maxWidth: 920 }} title={t('storybook.stories.useUserMedia.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('storybook.stories.useUserMedia.description')}
        </Typography.Paragraph>

        <Space wrap>
          <Button type="primary" disabled={isRecording} onClick={handleStart}>
            {t('storybook.stories.useUserMedia.start')}
          </Button>
          <Button danger disabled={!isRecording} onClick={stopRecording}>
            {t('storybook.stories.useUserMedia.stop')}
          </Button>
        </Space>

        <Space wrap>
          <Typography.Text strong>{t('storybook.stories.useUserMedia.recordingLabel')}</Typography.Text>
          <Tag color={isRecording ? 'red' : 'default'}>
            {isRecording
              ? t('storybook.stories.useUserMedia.recording')
              : t('storybook.stories.useUserMedia.notRecording')}
          </Tag>
          <Typography.Text strong>{t('storybook.stories.useUserMedia.streamLabel')}</Typography.Text>
          <Tag color={mediaStream ? 'green' : 'default'}>
            {mediaStream
              ? t('storybook.stories.useUserMedia.streamAvailable')
              : t('storybook.stories.useUserMedia.streamNone')}
          </Tag>
        </Space>

        {error && <Alert type="error" message={error} showIcon />}
        <Alert type="info" message={t('storybook.stories.useUserMedia.tip')} showIcon />
      </Space>
    </Card>
  );
}
