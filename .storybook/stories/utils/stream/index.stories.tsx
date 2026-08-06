import { useMemo, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Button, Card, InputNumber, List, Space, Tag, Typography } from 'antd';
import { StreamTimeSlicerClass } from '../../../../src/utils/stream';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

interface StreamStoryArgs {
  sliceSize: number;
  chunkLength: number;
}

interface SliceLog {
  id: number;
  channels: number;
  samples: number;
  durationMs: number;
  time: string;
}

const meta: Meta<StreamStoryArgs> = {
  title: 'Utils/stream',
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
      },
    },
  },
  args: {
    sliceSize: 1024,
    chunkLength: 256,
  },
  argTypes: {
    sliceSize: {
      control: { type: 'number', min: 128, max: 8192, step: 128 },
      description: storyT('storybook.stories.stream.argTypes.sliceSize.description'),
    },
    chunkLength: {
      control: { type: 'number', min: 32, max: 2048, step: 32 },
      description: storyT('storybook.stories.stream.argTypes.chunkLength.description'),
    },
  },
};

export default meta;
type Story = StoryObj<StreamStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "- **EN:** This demo pushes simulated mono-channel PCM frames into a `StreamTimeSlicerClass` configured with `sliceMode: 'size'`. Once the accumulated samples reach `sliceSize`, the slicer emits a merged `Float32Array` through `onSlice` and resets.\n- **CN:** 本 demo 向配置了 `sliceMode: 'size'` 的 `StreamTimeSlicerClass` 推入模拟的单声道 PCM 帧。当累积采样数达到 `sliceSize` 时，切片器通过 `onSlice` 输出合并后的 `Float32Array` 并重置。",
      },
    },
  },
  render: function Render(args: StreamStoryArgs) {
    return <StreamStoryDemo {...args} />;
  },
};

function StreamStoryDemo({ sliceSize, chunkLength }: StreamStoryArgs) {
  const t = useStoryT();
  const slicerRef = useRef<StreamTimeSlicerClass | null>(null);
  const eventIdRef = useRef(0);
  const [logs, setLogs] = useState<SliceLog[]>([]);
  const [draftSliceSize, setDraftSliceSize] = useState(sliceSize);
  const [draftChunkLength, setDraftChunkLength] = useState(chunkLength);

  if (!slicerRef.current) {
    slicerRef.current = new StreamTimeSlicerClass({
      sliceMode: 'size',
      value: sliceSize,
      onSlice: (channels, sliceDuration) => {
        setLogs((prev) => {
          const next = [
            {
              id: ++eventIdRef.current,
              channels: channels.length,
              samples: channels.reduce((sum, ch) => sum + ch.length, 0),
              durationMs: Math.round(sliceDuration),
              time: new Date().toLocaleTimeString(),
            },
            ...prev,
          ];
          return next.slice(0, 6);
        });
      },
    });
  }
  const slicer = slicerRef.current;

  // Keep `value` in sync with the arg so re-renders respect the latest sliceSize.
  useMemo(() => {
    slicer.value = sliceSize;
    return sliceSize;
  }, [sliceSize, slicer]);

  const pushChunk = () => {
    // Push one frame of mono PCM samples (values in [-1, 1]) for the slicer to accumulate.
    const frame = new Float32Array(draftChunkLength);
    for (let i = 0; i < draftChunkLength; i++) {
      frame[i] = Math.sin((i + (Date.now() % 1000)) / 16) * 0.5;
    }
    slicer.push([frame]);
  };

  const flushNow = () => {
    slicer.flush();
  };

  const resetNow = () => {
    slicer.reset();
    setLogs([]);
  };

  return (
    <Card variant="outlined" style={{ maxWidth: 920 }} title={t('storybook.stories.stream.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {t('storybook.stories.stream.description')}
        </Typography.Paragraph>

        <Space wrap>
          <Space size="small">
            <Typography.Text>{t('storybook.stories.stream.sliceSizeLabel')}</Typography.Text>
            <InputNumber
              min={128}
              max={8192}
              step={128}
              value={draftSliceSize}
              onChange={(value) => setDraftSliceSize(value ?? sliceSize)}
            />
          </Space>
          <Space size="small">
            <Typography.Text>{t('storybook.stories.stream.chunkLengthLabel')}</Typography.Text>
            <InputNumber
              min={32}
              max={2048}
              step={32}
              value={draftChunkLength}
              onChange={(value) => setDraftChunkLength(value ?? chunkLength)}
            />
          </Space>
        </Space>

        <Space wrap>
          <Button type="primary" onClick={pushChunk}>
            {t('storybook.stories.stream.actions.push')}
          </Button>
          <Button onClick={flushNow}>{t('storybook.stories.stream.actions.flush')}</Button>
          <Button onClick={resetNow}>{t('storybook.stories.stream.actions.reset')}</Button>
          <Tag color="blue">{t('storybook.stories.stream.modeTag', { value: 'size' })}</Tag>
        </Space>

        <div>
          <Typography.Text strong>{t('storybook.stories.stream.logTitle')}</Typography.Text>
          <List
            bordered
            size="small"
            rowKey="id"
            dataSource={logs}
            locale={{ emptyText: t('storybook.stories.stream.emptyLog') }}
            renderItem={(item) => (
              <List.Item>
                <Space split={<Tag />} size="small" wrap>
                  <Typography.Text code>{`#${item.id}`}</Typography.Text>
                  <Typography.Text>
                    {t('storybook.stories.stream.logChannels', { value: item.channels })}
                  </Typography.Text>
                  <Typography.Text>{t('storybook.stories.stream.logSamples', { value: item.samples })}</Typography.Text>
                  <Typography.Text type="secondary">
                    {t('storybook.stories.stream.logDuration', { value: item.durationMs })}
                  </Typography.Text>
                  <Typography.Text type="secondary">{item.time}</Typography.Text>
                </Space>
              </List.Item>
            )}
          />
        </div>

        <Alert type="info" title={t('storybook.stories.stream.tip')} showIcon />
      </Space>
    </Card>
  );
}
