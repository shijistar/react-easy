import { useEffect, useMemo, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Card, Divider, Input, List, Slider, Space, Tag, Typography } from 'antd';
import { useRefFunction } from '../../../src/hooks';
import useAudioPlayer from '../../../src/hooks/useAudioPlayer';
// @ts-expect-error: because Vite handles mp3 imports natively
import musicUrl from '../../assets/sample.mp3';
import { useStoryT } from '../../locales';

interface UseAudioPlayerStoryArgs {
  source: string;
  initialVolume: number;
  seekStep: number;
}

interface AudioEventLog {
  id: number;
  type: string;
  time: string;
}

const meta: Meta<UseAudioPlayerStoryArgs> = {
  title: 'Hooks/useAudioPlayer',
  parameters: {
    docs: {
      description: {
        component: `- **EN:** Demonstrates how to use the \`useAudioPlayer\` hook to create a stable \`AudioPlayer\` instance, control playback, switch sources, and observe player state in a React view. \n\n Note that AudioPlayer is an audio playback API object and does not provide a user interface, only playback control and state management functionality.
- **CN:** 演示如何使用 \`useAudioPlayer\` 钩子创建稳定的 \`AudioPlayer\` 实例，完成播放控制、音源切换，并在 React 视图中观察播放器状态。\n\n 注意 AudioPlayer 是一个音频播放API对象，不提供用户界面，仅提供播放控制和状态管理功能。`,
      },
    },
  },
  args: {
    source: musicUrl,
    initialVolume: 0.5,
    seekStep: 10,
  },
  argTypes: {
    source: {
      control: 'text',
      description: `- **EN:** Initial audio source URL used by the demo. Prefer local static assets served by Storybook for reliable playback.
- **CN:** 示例初始使用的音频地址。为保证播放更稳定，建议优先使用由 Storybook 提供的本地静态资源。`,
    },
    initialVolume: {
      control: { type: 'range', min: 0, max: 1, step: 0.1 },
      description: `- **EN:** Initial player volume used when the hook instance is created.
- **CN:** Hook 实例创建时使用的初始音量。`,
    },
    seekStep: {
      control: { type: 'number', min: 1, max: 60, step: 1 },
      description: `- **EN:** Demo-only option that controls how many seconds the forward/backward buttons seek.
- **CN:** 示例专用参数，用于控制前进/后退按钮每次跳转的秒数。`,
    },
  },
};

export default meta;
type Story = StoryObj<UseAudioPlayerStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: `- **EN:** Includes source switching, transport controls, progress/volume synchronization, and an event log so you can inspect how the player behaves over time.
- **CN:** 提供音源切换、播放控制、进度与音量同步，以及事件日志，便于观察播放器在不同交互下的行为。`,
      },
    },
  },
  render: function Render(args: UseAudioPlayerStoryArgs) {
    return <UseAudioPlayerStoryDemo {...args} />;
  },
};

function UseAudioPlayerStoryDemo({ source, initialVolume, seekStep }: UseAudioPlayerStoryArgs) {
  const t = useStoryT();
  const sourceRef = useRef(source);
  const volumeRef = useRef(initialVolume);
  const eventIdRef = useRef(0);
  const [draftSource, setDraftSource] = useState(source);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(initialVolume);
  const [isPlaying, setIsPlaying] = useState(false);
  const [eventLogs, setEventLogs] = useState<AudioEventLog[]>([]);

  // Keep only the latest few events so the demo stays readable while showing playback transitions.
  const appendEventLog = useRefFunction((type: string) => {
    setEventLogs((prev) => {
      const next = [
        {
          id: ++eventIdRef.current,
          type,
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ];
      return next.slice(0, 8);
    });
  });

  // useAudioPlayer returns a stable AudioPlayer instance; later updates are pushed via imperative methods.
  const player = useAudioPlayer({
    source,
    volume: initialVolume,
    onPlay: () => appendEventLog('play'),
    onPause: () => appendEventLog('pause'),
    onStop: () => appendEventLog('stop'),
    onPlayEnd: () => appendEventLog('ended'),
    onError: () => appendEventLog('error'),
  });

  useEffect(() => {
    // Mirror Storybook args into the existing player instance instead of recreating it on every arg change.
    setDraftSource(source);
    if (source !== sourceRef.current) {
      sourceRef.current = source;
      void player.setAudioSource(source);
      appendEventLog('source-change');
    }
  }, [player, source]);

  useEffect(() => {
    if (volumeRef.current === initialVolume) return;
    volumeRef.current = initialVolume;
    player.setVolume(initialVolume);
    setVolume(initialVolume);
    appendEventLog('volume-change');
  }, [initialVolume, player]);

  useEffect(() => {
    let cancelled = false;

    // Combine polling with native media events so the demo reflects both continuous progress and discrete state changes.
    const syncState = () => {
      if (cancelled) return;
      setCurrentTime(Number.isFinite(player.currentTime) ? player.currentTime : 0);
      setDuration(Number.isFinite(player.duration) ? player.duration : 0);
      setVolume(player.volume);
      setIsPlaying(player.isPlaying);
    };

    const handler = () => syncState();
    const errorHandler = () => {
      appendEventLog('error');
      syncState();
    };
    const interval = window.setInterval(syncState, 250);
    player.addEventListener('timeupdate', handler);
    player.addEventListener('loadedmetadata', handler);
    player.addEventListener('ended', handler);
    player.addEventListener('play', handler);
    player.addEventListener('pause', handler);
    player.addEventListener('error', errorHandler);

    syncState();

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      player.removeEventListener('timeupdate', handler);
      player.removeEventListener('loadedmetadata', handler);
      player.removeEventListener('ended', handler);
      player.removeEventListener('play', handler);
      player.removeEventListener('pause', handler);
      player.removeEventListener('error', errorHandler);
      player.dispose();
    };
  }, [appendEventLog, player]);

  const statusTag = useMemo(() => {
    return isPlaying ? (
      <Tag color="green">{t('storybook.stories.useAudioPlayer.status.playing')}</Tag>
    ) : (
      <Tag color="default">{t('storybook.stories.useAudioPlayer.status.paused')}</Tag>
    );
  }, [isPlaying, t]);
  const progressMax = useMemo(() => {
    return Number.isFinite(duration) && duration > 0 ? duration : Math.max(currentTime, 0);
  }, [currentTime, duration]);

  return (
    <Card
      variant="outlined"
      style={{ maxWidth: 880 }}
      title={t('storybook.stories.useAudioPlayer.cardTitle')}
      extra={statusTag}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            value={draftSource}
            onChange={(event) => setDraftSource(event.target.value)}
            placeholder={t('storybook.stories.useAudioPlayer.sourcePlaceholder')}
          />
          <Button
            onClick={async () => {
              sourceRef.current = draftSource;
              await player.setAudioSource(draftSource);
              appendEventLog('source-change');
            }}
          >
            {t('storybook.stories.useAudioPlayer.applySource')}
          </Button>
        </Space.Compact>

        <Space wrap>
          {/* eslint-disable-next-line storybook/context-in-play-function -- calling AudioPlayer.play(), not Storybook play() */}
          <Button type="primary" onClick={() => void player.play().catch(() => undefined)}>
            {t('storybook.stories.useAudioPlayer.actions.play')}
          </Button>
          <Button onClick={() => player.pause()}>{t('storybook.stories.useAudioPlayer.actions.pause')}</Button>
          <Button onClick={() => player.stop()}>{t('storybook.stories.useAudioPlayer.actions.stop')}</Button>
          <Button onClick={() => player.seekBackward(seekStep)}>
            {t('storybook.stories.useAudioPlayer.actions.backward', { seconds: seekStep })}
          </Button>
          <Button onClick={() => player.seekForward(seekStep)}>
            {t('storybook.stories.useAudioPlayer.actions.forward', { seconds: seekStep })}
          </Button>
        </Space>

        <div>
          <Typography.Text strong>{t('storybook.stories.useAudioPlayer.progressLabel')}</Typography.Text>
          <Slider
            min={0}
            max={progressMax}
            step={0.1}
            value={Math.min(Math.max(currentTime, 0), progressMax)}
            onChange={(value) => player.seek(Number(value))}
            tooltip={{ open: false }}
          />
          <Space split={<Divider type="vertical" />} size="small">
            <Typography.Text>
              {t('storybook.stories.useAudioPlayer.currentTime', { value: currentTime.toFixed(1) })}
            </Typography.Text>
            <Typography.Text>
              {t('storybook.stories.useAudioPlayer.duration', { value: duration ? duration.toFixed(1) : '--' })}
            </Typography.Text>
          </Space>
        </div>

        <div>
          <Typography.Text strong>{t('storybook.stories.useAudioPlayer.volumeLabel')}</Typography.Text>
          <Slider
            min={0}
            max={1}
            step={0.1}
            value={volume}
            onChange={(value) => {
              const nextVolume = Number(value);
              player.setVolume(nextVolume);
              setVolume(nextVolume);
              appendEventLog('volume-change');
            }}
            tooltip={{ open: false }}
          />
        </div>

        <div>
          <Typography.Text strong>{t('storybook.stories.useAudioPlayer.eventLogTitle')}</Typography.Text>
          <List
            bordered
            size="small"
            rowKey="id"
            dataSource={eventLogs}
            locale={{ emptyText: t('storybook.stories.useAudioPlayer.emptyLog') }}
            renderItem={(item) => (
              <List.Item>
                <Space split={<Divider type="vertical" />} size="small">
                  <Typography.Text code>{item.type}</Typography.Text>
                  <Typography.Text type="secondary">{item.time}</Typography.Text>
                </Space>
              </List.Item>
            )}
          />
        </div>
      </Space>
    </Card>
  );
}
