import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { create as createAxios } from 'axios';
import { Alert, Button, Card, Collapse, Descriptions, List, Space, Tag, Typography } from 'antd';
import { type AxiosLikeInstance, type StreamDownloadSaveStrategy, useStreamDownloader } from '../../../src';
import { useStoryT } from '../../locales';

const REAL_DOWNLOAD_URL = 'https://huggingface.co/gpt2/resolve/main/pytorch_model.bin';

interface UseStreamDownloaderStoryArgs {
  downloadUrl: string;
  fileName: string;
  progressThrottleMs: number;
  autoDispose: boolean;
  saveStrategy: StreamDownloadSaveStrategy;
}

interface DemoLogItem {
  id: number;
  message: string;
}

const HOOK_API_ITEMS = [
  {
    signature: 'useStreamDownloader(options?)',
    description:
      'EN: Create a stable downloader instance and subscribe React to snapshot updates. CN: 创建稳定的 downloader 实例，并让 React 订阅快照更新。',
  },
  {
    signature: 'options.progressThrottleMs?: number',
    description: 'EN: Forwarded into the underlying class constructor. CN: 透传给底层 class 构造参数。',
  },
  {
    signature: 'options.autoDispose?: boolean',
    description: 'EN: Control whether unmount disposes the downloader. CN: 控制组件卸载时是否自动释放 downloader。',
  },
  {
    signature: 'result.downloader',
    description:
      'EN: Stable class instance for advanced imperative control. CN: 供高级命令式控制使用的稳定 class 实例。',
  },
  {
    signature: 'result.snapshot',
    description: 'EN: Reactive snapshot mirrored from the class. CN: 从 class 同步过来的响应式快照。',
  },
  {
    signature: 'result.isRunning',
    description: 'EN: React-friendly running flag. CN: 面向 React 场景的运行态标志。',
  },
  {
    signature: 'result.start(request?)',
    description:
      'EN: Bound start helper that returns the same success result as the class. CN: 已绑定的启动方法，返回值与 class 一致。',
  },
  {
    signature: 'result.cancel()',
    description: 'EN: Bound cancel helper. CN: 已绑定的取消方法。',
  },
  {
    signature: 'result.reset()',
    description: 'EN: Bound terminal-reset helper. CN: 已绑定的终态重置方法。',
  },
] as const;

const meta: Meta<UseStreamDownloaderStoryArgs> = {
  title: 'Hooks/useStreamDownloader',
  parameters: {
    docs: {
      description: {
        component: `- **EN:** \`useStreamDownloader\` is the React adapter over \`StreamDownloader\`. This page focuses on the hook-specific surface while still using a real CORS-enabled large file and a real \`axios.create({ adapter: 'fetch' })\` instance. For the full transport and type contract, see [Utils/StreamDownloader](?path=/docs/utils-streamdownloader--playground).\n- **CN:** \`useStreamDownloader\` 是 \`StreamDownloader\` 的 React 适配层。本页聚焦 hook 自身接口，同时依旧使用真实、支持 CORS 的大文件和真实的 \`axios.create({ adapter: 'fetch' })\` 实例。完整的 transport 与类型契约请查看 [Utils/StreamDownloader](?path=/docs/utils-streamdownloader--playground)。`,
      },
    },
  },
  args: {
    downloadUrl: REAL_DOWNLOAD_URL,
    fileName: 'gpt2-pytorch-model.bin',
    progressThrottleMs: 120,
    autoDispose: true,
    saveStrategy: 'file-system-access',
  },
  argTypes: {
    downloadUrl: {
      control: 'text',
      description:
        '- **EN:** Real public file URL used by the hook demo.\n- **CN:** hook demo 使用的真实公开文件 URL。',
    },
    fileName: {
      control: 'text',
      description: '- **EN:** Optional explicit file name override.\n- **CN:** 可选的显式文件名覆盖。',
    },
    progressThrottleMs: {
      control: { type: 'number', min: 0, max: 2000, step: 20 },
      description: '- **EN:** Forwarded into the underlying class constructor.\n- **CN:** 透传给底层 class 构造参数。',
    },
    autoDispose: {
      control: 'boolean',
      description:
        '- **EN:** Whether the hook disposes the downloader on unmount.\n- **CN:** hook 卸载时是否自动释放 downloader。',
    },
    saveStrategy: {
      control: 'radio',
      options: ['auto', 'file-system-access', 'stream-saver'],
      description:
        '- **EN:** Save strategy passed into `start(request)`.\n- **CN:** 传给 `start(request)` 的保存策略。',
    },
  },
};

export default meta;
type Story = StoryObj<UseStreamDownloaderStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** Start a real fetch or axios download through the hook, observe the reactive `snapshot` and `isRunning`, and inspect the hook-specific API reference below.\n- **CN:** 通过 hook 启动真实的 fetch 或 axios 下载，观察响应式 `snapshot` 与 `isRunning`，并查看下方 hook 专属 API 参考。',
      },
    },
  },
  render: function Render(args: UseStreamDownloaderStoryArgs) {
    return <UseStreamDownloaderStoryDemo {...args} />;
  },
};

function UseStreamDownloaderStoryDemo({
  downloadUrl,
  fileName,
  progressThrottleMs,
  autoDispose,
  saveStrategy,
}: UseStreamDownloaderStoryArgs) {
  const t = useStoryT();
  const logIdRef = useRef(0);
  const [logs, setLogs] = useState<DemoLogItem[]>([]);
  const { downloader, snapshot, isRunning, start, cancel, reset } = useStreamDownloader({
    autoDispose,
    progressThrottleMs,
  });
  const axiosInstance = useRef<AxiosLikeInstance>(
    createAxios({ adapter: 'fetch' }) as unknown as AxiosLikeInstance,
  ).current;

  const normalizedFileName = fileName.trim() || undefined;

  const appendLog = (message: string) => {
    setLogs((prev) => [{ id: ++logIdRef.current, message }, ...prev].slice(0, 10));
  };

  const startFetchDownload = async () => {
    appendLog(t('storybook.stories.useStreamDownloader.logs.fetchStart'));
    try {
      const result = await start({
        url: downloadUrl,
        fileName: normalizedFileName,
        saveStrategy,
      });
      appendLog(`${t('storybook.stories.useStreamDownloader.logs.success')} (${result.transport})`);
    } catch (error) {
      appendLog(formatErrorLog(t('storybook.stories.useStreamDownloader.logs.error'), error));
    }
  };

  const startAxiosDownload = async () => {
    appendLog(t('storybook.stories.useStreamDownloader.logs.axiosStart'));
    try {
      const result = await start({
        transport: 'axios',
        url: downloadUrl,
        fileName: normalizedFileName,
        saveStrategy,
        axios: {
          instance: axiosInstance,
          adapterHint: 'fetch',
        },
      });
      appendLog(`${t('storybook.stories.useStreamDownloader.logs.success')} (${result.transport})`);
    } catch (error) {
      appendLog(formatErrorLog(t('storybook.stories.useStreamDownloader.logs.error'), error));
    }
  };

  const resetSnapshot = () => {
    reset();
    appendLog(t('storybook.stories.useStreamDownloader.logs.reset'));
  };

  return (
    <Card bordered style={{ maxWidth: 1080 }} title={t('storybook.stories.useStreamDownloader.cardTitle')}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          type="info"
          showIcon
          message={t('storybook.stories.useStreamDownloader.realHint')}
          description={t('storybook.stories.useStreamDownloader.description')}
        />

        <Descriptions bordered column={1} size="small" title={t('storybook.stories.useStreamDownloader.configTitle')}>
          <Descriptions.Item label={t('storybook.stories.useStreamDownloader.config.url')}>
            <Typography.Link href={downloadUrl} target="_blank">
              {downloadUrl}
            </Typography.Link>
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.useStreamDownloader.config.fileName')}>
            {normalizedFileName ?? '--'}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.useStreamDownloader.config.saveStrategy')}>
            <Tag>{saveStrategy}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.useStreamDownloader.config.progressThrottleMs')}>
            {String(progressThrottleMs)}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.useStreamDownloader.config.autoDispose')}>
            {String(autoDispose)}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.useStreamDownloader.config.downloaderStatus')}>
            {downloader.status}
          </Descriptions.Item>
        </Descriptions>

        <Space wrap>
          <Button type="primary" onClick={() => void startFetchDownload()} disabled={isRunning}>
            {t('storybook.stories.useStreamDownloader.actions.startFetch')}
          </Button>
          <Button onClick={() => void startAxiosDownload()} disabled={isRunning}>
            {t('storybook.stories.useStreamDownloader.actions.startAxios')}
          </Button>
          <Button
            onClick={() => {
              cancel();
              appendLog(t('storybook.stories.useStreamDownloader.logs.cancel'));
            }}
            disabled={!isRunning}
          >
            {t('storybook.stories.useStreamDownloader.actions.cancel')}
          </Button>
          <Button onClick={resetSnapshot}>{t('storybook.stories.useStreamDownloader.actions.reset')}</Button>
        </Space>

        <Descriptions bordered column={1} size="small" title={t('storybook.stories.useStreamDownloader.snapshotTitle')}>
          <Descriptions.Item label={t('storybook.stories.useStreamDownloader.fields.status')}>
            {snapshot.status}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.useStreamDownloader.fields.isRunning')}>
            {String(isRunning)}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.useStreamDownloader.fields.requestUrl')}>
            {snapshot.requestUrl ?? '--'}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.useStreamDownloader.fields.fileName')}>
            {snapshot.fileName ?? '--'}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.useStreamDownloader.fields.transport')}>
            {snapshot.transport ?? '--'}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.useStreamDownloader.fields.saveStrategy')}>
            {snapshot.saveStrategy ?? '--'}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.useStreamDownloader.fields.loadedBytes')}>
            {String(snapshot.progress.loadedBytes)}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.useStreamDownloader.fields.totalBytes')}>
            {snapshot.progress.totalBytes != null ? String(snapshot.progress.totalBytes) : '--'}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.useStreamDownloader.fields.percent')}>
            {snapshot.progress.percent != null ? `${snapshot.progress.percent}%` : '--'}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.useStreamDownloader.fields.speedBps')}>
            {snapshot.progress.speedBps != null ? `${snapshot.progress.speedBps.toFixed(2)} B/s` : '--'}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.useStreamDownloader.fields.error')}>
            {snapshot.errorCode ? `${snapshot.errorCode}: ${snapshot.errorMessage}` : '--'}
          </Descriptions.Item>
        </Descriptions>

        <Collapse
          items={[
            {
              key: 'hook-api',
              label: t('storybook.stories.useStreamDownloader.sections.hookApi'),
              children: (
                <List
                  size="small"
                  dataSource={[...HOOK_API_ITEMS]}
                  renderItem={(item: (typeof HOOK_API_ITEMS)[number]) => (
                    <List.Item>
                      <Space direction="vertical" size={0}>
                        <Typography.Text code>{item.signature}</Typography.Text>
                        <Typography.Text>{item.description}</Typography.Text>
                      </Space>
                    </List.Item>
                  )}
                />
              ),
            },
            {
              key: 'class-link',
              label: t('storybook.stories.useStreamDownloader.sections.classLink'),
              children: (
                <Typography.Paragraph>
                  <Typography.Link href="?path=/docs/utils-streamdownloader--playground">
                    {t('storybook.stories.useStreamDownloader.sections.classLinkText')}
                  </Typography.Link>
                </Typography.Paragraph>
              ),
            },
          ]}
        />

        <div>
          <Typography.Text strong>{t('storybook.stories.useStreamDownloader.logs.title')}</Typography.Text>
          <List
            bordered
            size="small"
            style={{ marginTop: 8 }}
            dataSource={logs}
            rowKey="id"
            locale={{ emptyText: t('storybook.stories.useStreamDownloader.logs.empty') }}
            renderItem={(item) => <List.Item>{item.message}</List.Item>}
          />
        </div>
      </Space>
    </Card>
  );
}

function formatErrorLog(prefix: string, error: unknown) {
  return `${prefix}: ${error instanceof Error ? error.message : String(error)}`;
}
