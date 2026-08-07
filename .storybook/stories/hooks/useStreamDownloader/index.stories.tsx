import { useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { create as createAxios } from 'axios';
import { List, Space, Tag, Typography } from 'antd';
import { type StreamDownloadSaveStrategy, useStreamDownloader } from '../../../../src';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import StreamDownloaderDemoCard, {
  formatErrorLog,
  useStreamDownloaderDemoLogs,
} from '../../shared/streamDownloaderDemo';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

const REAL_DOWNLOAD_URL = 'https://huggingface.co/gpt2/resolve/main/pytorch_model.bin';

interface UseStreamDownloaderStoryArgs {
  /**
   * - **EN:** Storybook-controlled real download URL.
   * - **CN:** 由 Storybook 控制的真实下载 URL。
   */
  url: string;
  /**
   * - **EN:** Optional explicit file name override.
   * - **CN:** 可选的显式文件名覆盖。
   */
  fileName: string;
  /**
   * - **EN:** Hook-level progress throttling window in milliseconds.
   * - **CN:** hook 级进度节流窗口，单位毫秒。
   */
  progressThrottleMs: number;
  /**
   * - **EN:** Whether the hook should dispose the downloader on unmount.
   * - **CN:** hook 卸载时是否应释放 downloader。
   */
  autoDispose: boolean;
  /**
   * - **EN:** Save strategy forwarded into `start(request)`.
   * - **CN:** 透传给 `start(request)` 的保存策略。
   */
  saveStrategy: StreamDownloadSaveStrategy;
}

const HOOK_API_ITEMS = [
  {
    signature: 'useStreamDownloader(options?)',
    description: storyT('storybook.stories.useStreamDownloader.hookApi.useStreamDownloader.description'),
  },
  {
    signature: 'options.progressThrottleMs?: number',
    description: storyT('storybook.stories.useStreamDownloader.hookApi.progressThrottleMs.description'),
  },
  {
    signature: 'options.autoDispose?: boolean',
    description: storyT('storybook.stories.useStreamDownloader.hookApi.autoDispose.description'),
  },
  {
    signature: 'result.downloader',
    description: storyT('storybook.stories.useStreamDownloader.hookApi.downloader.description'),
  },
  {
    signature: 'result.snapshot',
    description: storyT('storybook.stories.useStreamDownloader.hookApi.snapshot.description'),
  },
  {
    signature: 'result.isRunning',
    description: storyT('storybook.stories.useStreamDownloader.hookApi.isRunning.description'),
  },
  {
    signature: 'result.start(request?)',
    description: storyT('storybook.stories.useStreamDownloader.hookApi.start.description'),
  },
  {
    signature: 'result.cancel()',
    description: storyT('storybook.stories.useStreamDownloader.hookApi.cancel.description'),
  },
  {
    signature: 'result.reset()',
    description: storyT('storybook.stories.useStreamDownloader.hookApi.reset.description'),
  },
] as const;

const meta: Meta<UseStreamDownloaderStoryArgs> = {
  title: 'Hooks/useStreamDownloader',
  parameters: {
    docs: {
      description: {
        component: storyI18n.language === 'zh-CN' ? `${introduceCN}\n${apiDocCN}` : `${introduceEN}\n${apiDocEN}`,
      },
    },
  },
  args: {
    url: REAL_DOWNLOAD_URL,
    fileName: '',
    progressThrottleMs: 120,
    autoDispose: true,
    saveStrategy: 'auto',
  },
  argTypes: {
    url: {
      control: 'text',
      description: storyT('storybook.stories.useStreamDownloader.argTypes.url.description'),
    },
    fileName: {
      control: 'text',
      description: storyT('storybook.stories.useStreamDownloader.argTypes.fileName.description'),
    },
    progressThrottleMs: {
      control: { type: 'number', min: 0, max: 2000, step: 20 },
      description: storyT('storybook.stories.useStreamDownloader.argTypes.progressThrottleMs.description'),
    },
    autoDispose: {
      control: 'boolean',
      description: storyT('storybook.stories.useStreamDownloader.argTypes.autoDispose.description'),
    },
    saveStrategy: {
      control: 'radio',
      options: ['auto', 'file-system-access', 'stream-saver'],
      description: storyT('storybook.stories.useStreamDownloader.argTypes.saveStrategy.description'),
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
  url,
  fileName,
  progressThrottleMs,
  autoDispose,
  saveStrategy,
}: UseStreamDownloaderStoryArgs) {
  const t = useStoryT();
  const { appendLog, logs } = useStreamDownloaderDemoLogs();
  const { downloader, snapshot, isRunning, start, cancel, reset } = useStreamDownloader({
    autoDispose,
    progressThrottleMs,
  });
  const axiosInstance = useMemo(() => createAxios({ adapter: 'fetch' }), []);

  const normalizedFileName = fileName.trim() || undefined;

  const startFetchDownload = async () => {
    appendLog(t('storybook.stories.useStreamDownloader.logs.fetchStart'));
    try {
      const result = await start({
        url,
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
        url,
        fileName: normalizedFileName,
        saveStrategy,
        axios: {
          instance: axiosInstance,
          adapter: 'fetch',
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

  const configItems = [
    {
      key: 'url',
      label: t('storybook.stories.useStreamDownloader.config.url'),
      value: (
        <Typography.Link href={url} target="_blank">
          {url}
        </Typography.Link>
      ),
    },
    {
      key: 'fileName',
      label: t('storybook.stories.useStreamDownloader.config.fileName'),
      value: normalizedFileName ?? '--',
    },
    {
      key: 'saveStrategy',
      label: t('storybook.stories.useStreamDownloader.config.saveStrategy'),
      value: <Tag>{saveStrategy}</Tag>,
    },
    {
      key: 'progressThrottleMs',
      label: t('storybook.stories.useStreamDownloader.config.progressThrottleMs'),
      value: String(progressThrottleMs),
    },
    {
      key: 'autoDispose',
      label: t('storybook.stories.useStreamDownloader.config.autoDispose'),
      value: String(autoDispose),
    },
    {
      key: 'downloaderStatus',
      label: t('storybook.stories.useStreamDownloader.config.downloaderStatus'),
      value: downloader.status,
    },
  ];

  const sections = [
    {
      key: 'hook-api',
      label: t('storybook.stories.useStreamDownloader.sections.hookApi'),
      children: (
        <List
          size="small"
          dataSource={[...HOOK_API_ITEMS]}
          renderItem={(item: (typeof HOOK_API_ITEMS)[number]) => (
            <List.Item>
              <Space orientation="vertical" size={0}>
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
  ];

  return (
    <StreamDownloaderDemoCard
      title={t('storybook.stories.useStreamDownloader.cardTitle')}
      hintTitle={t('storybook.stories.useStreamDownloader.realHint')}
      hintDescription={t('storybook.stories.useStreamDownloader.description')}
      configTitle={t('storybook.stories.useStreamDownloader.configTitle')}
      configItems={configItems}
      snapshotTitle={t('storybook.stories.useStreamDownloader.snapshotTitle')}
      snapshot={snapshot}
      isRunning={isRunning}
      onStartFetch={() => {
        void startFetchDownload();
      }}
      onStartAxios={() => {
        void startAxiosDownload();
      }}
      onCancel={() => {
        cancel();
        appendLog(t('storybook.stories.useStreamDownloader.logs.cancel'));
      }}
      onReset={resetSnapshot}
      actionLabels={{
        startFetch: t('storybook.stories.useStreamDownloader.actions.startFetch'),
        startAxios: t('storybook.stories.useStreamDownloader.actions.startAxios'),
        cancel: t('storybook.stories.useStreamDownloader.actions.cancel'),
        reset: t('storybook.stories.useStreamDownloader.actions.reset'),
      }}
      fieldLabels={{
        status: t('storybook.stories.useStreamDownloader.fields.status'),
        isRunning: t('storybook.stories.useStreamDownloader.fields.isRunning'),
        requestUrl: t('storybook.stories.useStreamDownloader.fields.requestUrl'),
        fileName: t('storybook.stories.useStreamDownloader.fields.fileName'),
        transport: t('storybook.stories.useStreamDownloader.fields.transport'),
        saveStrategy: t('storybook.stories.useStreamDownloader.fields.saveStrategy'),
        loadedBytes: t('storybook.stories.useStreamDownloader.fields.loadedBytes'),
        totalBytes: t('storybook.stories.useStreamDownloader.fields.totalBytes'),
        percent: t('storybook.stories.useStreamDownloader.fields.percent'),
        speedBps: t('storybook.stories.useStreamDownloader.fields.speedBps'),
        error: t('storybook.stories.useStreamDownloader.fields.error'),
      }}
      sections={sections}
      logsTitle={t('storybook.stories.useStreamDownloader.logs.title')}
      logsEmptyText={t('storybook.stories.useStreamDownloader.logs.empty')}
      logs={logs}
    />
  );
}
