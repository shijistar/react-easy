import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Card, Divider, Input, List, Slider, Space, Tag, Typography } from 'antd';
import AudioPlayer from '../../../../src/utils/AudioPlayer';
import musicUrl from '../../../assets/sample.mp3';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

interface AudioPlayerStoryArgs {
  source: string;
  initialVolume: number;
  seekStep: number;
}

interface AudioEventLog {
  id: number;
  type: string;
  time: string;
}

const meta: Meta<AudioPlayerStoryArgs> = {
  title: 'Utils/AudioPlayer',
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
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
      description: storyT('storybook.stories.AudioPlayer.argTypes.source.description'),
    },
    initialVolume: {
      control: { type: 'range', min: 0, max: 1, step: 0.1 },
      description: storyT('storybook.stories.AudioPlayer.argTypes.initialVolume.description'),
    },
    seekStep: {
      control: { type: 'number', min: 1, max: 60, step: 1 },
      description: storyT('storybook.stories.AudioPlayer.argTypes.seekStep.description'),
    },
  },
};

export default meta;
type Story = StoryObj<AudioPlayerStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** The `AudioPlayer` class is UI-less: instantiate it, then drive playback programmatically. This demo creates one instance, wires its callbacks into the event log, and cleans it up with `dispose()` when the story unmounts.\n- **CN:** `AudioPlayer` 类不包含用户界面：实例化后通过编程方式控制播放。本 demo 创建一个实例，将其回调接入事件日志，并在 story 卸载时通过 `dispose()` 释放资源。',
      },
    },
  },
  render: function Render(args: AudioPlayerStoryArgs) {
    return <AudioPlayerStoryDemo {...args} />;
  },
};

function AudioPlayerStoryDemo({ source, initialVolume, seekStep }: AudioPlayerStoryArgs) {
  const t = useStoryT();
  const sourceRef = useRef(source);
  const eventIdRef = useRef(0);
  const [draftSource, setDraftSource] = useState(source);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(initialVolume);
  const [isPlaying, setIsPlaying] = useState(false);
  const [eventLogs, setEventLogs] = useState<AudioEventLog[]>([]);

  const appendEventLog = useCallback((type: string) => {
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
  }, []);

  // AudioPlayer is a plain class; create it once and mirror args via imperative methods.
  const playerRef = useRef<AudioPlayer | null>(null);
  if (!playerRef.current) {
    playerRef.current = new AudioPlayer({
      source,
      volume: initialVolume,
      onPlay: () => appendEventLog('play'),
      onPause: () => appendEventLog('pause'),
      onStop: () => appendEventLog('stop'),
      onPlayEnd: () => appendEventLog('ended'),
      onError: () => appendEventLog('error'),
    });
  }
  const player = playerRef.current;

  useEffect(() => {
    setDraftSource(source);
    if (source !== sourceRef.current) {
      sourceRef.current = source;
      void player.setAudioSource(source);
      appendEventLog('source-change');
    }
  }, [player, source, appendEventLog]);

  useEffect(() => {
    let cancelled = false;

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
  }, [player, appendEventLog]);

  const statusTag = useMemo(() => {
    return isPlaying ? (
      <Tag color="green">{t('storybook.stories.AudioPlayer.status.playing')}</Tag>
    ) : (
      <Tag color="default">{t('storybook.stories.AudioPlayer.status.paused')}</Tag>
    );
  }, [isPlaying, t]);
  const progressMax = useMemo(() => {
    return Number.isFinite(duration) && duration > 0 ? duration : Math.max(currentTime, 0);
  }, [currentTime, duration]);

  return (
    <Card
      variant="outlined"
      style={{ maxWidth: 880 }}
      title={t('storybook.stories.AudioPlayer.cardTitle')}
      extra={statusTag}
    >
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            value={draftSource}
            onChange={(event) => setDraftSource(event.target.value)}
            placeholder={t('storybook.stories.AudioPlayer.sourcePlaceholder')}
          />
          <Button
            onClick={async () => {
              sourceRef.current = draftSource;
              await player.setAudioSource(draftSource);
              appendEventLog('source-change');
            }}
          >
            {t('storybook.stories.AudioPlayer.applySource')}
          </Button>
        </Space.Compact>

        <Space wrap>
          {/* eslint-disable-next-line storybook/context-in-play-function -- calling AudioPlayer.play(), not Storybook play() */}
          <Button type="primary" onClick={() => void player.play().catch(() => undefined)}>
            {t('storybook.stories.AudioPlayer.actions.play')}
          </Button>
          <Button onClick={() => player.pause()}>{t('storybook.stories.AudioPlayer.actions.pause')}</Button>
          <Button onClick={() => player.stop()}>{t('storybook.stories.AudioPlayer.actions.stop')}</Button>
          <Button onClick={() => player.seekBackward(seekStep)}>
            {t('storybook.stories.AudioPlayer.actions.backward', { seconds: seekStep })}
          </Button>
          <Button onClick={() => player.seekForward(seekStep)}>
            {t('storybook.stories.AudioPlayer.actions.forward', { seconds: seekStep })}
          </Button>
        </Space>

        <div>
          <Typography.Text strong>{t('storybook.stories.AudioPlayer.progressLabel')}</Typography.Text>
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
              {t('storybook.stories.AudioPlayer.currentTime', { value: currentTime.toFixed(1) })}
            </Typography.Text>
            <Typography.Text>
              {t('storybook.stories.AudioPlayer.duration', { value: duration ? duration.toFixed(1) : '--' })}
            </Typography.Text>
          </Space>
        </div>

        <div>
          <Typography.Text strong>{t('storybook.stories.AudioPlayer.volumeLabel')}</Typography.Text>
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
          <Typography.Text strong>{t('storybook.stories.AudioPlayer.eventLogTitle')}</Typography.Text>
          <List
            bordered
            size="small"
            rowKey="id"
            dataSource={eventLogs}
            locale={{ emptyText: t('storybook.stories.AudioPlayer.emptyLog') }}
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
