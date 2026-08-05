import { useEffect, useMemo, useSyncExternalStore } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { create as createAxios } from 'axios';
import { List, Space, Tag, Typography } from 'antd';
import StreamDownloader, {
  type StreamDownloadRequest,
  type StreamDownloadSaveStrategy,
} from '../../../../src/utils/StreamDownloader';
import storyI18n, { storyT, useStoryT } from '../../../locales';
import StreamDownloaderDemoCard, {
  formatErrorLog,
  getCodeBlockStyle,
  useStreamDownloaderDemoLogs,
} from '../../shared/streamDownloaderDemo';
import apiDocEN from './api-doc.en-US.md?raw';
import apiDocCN from './api-doc.zh-CN.md?raw';
import introduceEN from './introduce.en-US.md?raw';
import introduceCN from './introduce.zh-CN.md?raw';

const REAL_DOWNLOAD_URL = 'https://huggingface.co/gpt2/resolve/main/pytorch_model.bin';

interface StreamDownloaderStoryArgs {
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
   * - **EN:** Constructor-level progress throttling window in milliseconds.
   * - **CN:** 构造级进度节流窗口，单位毫秒。
   */
  progressThrottleMs: number;
  /**
   * - **EN:** Save strategy forwarded into `downloader.start()`.
   * - **CN:** 透传给 `downloader.start()` 的保存策略。
   */
  saveStrategy: StreamDownloadSaveStrategy;
}

const INSTANCE_API_ITEMS = [
  {
    signature: 'new StreamDownloader(init?)',
    description:
      'EN: Create an instance with optional defaultRequest and progressThrottleMs. \nCN: 使用可选 defaultRequest 与 progressThrottleMs 创建实例。',
  },
  {
    signature: 'getSnapshot(): Readonly<StreamDownloadSnapshot>',
    description: 'EN: Read the latest immutable snapshot. \nCN: 读取当前最新的只读快照。',
  },
  {
    signature: 'status: StreamDownloadStatus',
    description: 'EN: Read the current task status getter. \nCN: 读取当前任务状态 getter。',
  },
  {
    signature: 'isRunning: boolean',
    description: 'EN: Tell whether an active task exists. \nCN: 判断当前是否存在活动任务。',
  },
  {
    signature: 'subscribe(listener): () => void',
    description:
      'EN: Subscribe to snapshot changes and receive an unsubscribe function. \nCN: 订阅快照变化并获得取消订阅函数。',
  },
  {
    signature: 'start(request?): Promise<StreamDownloadSuccessResult>',
    description:
      'EN: Start a real streaming download task with fetch or axios(fetch adapter). \nCN: 使用 fetch 或 axios(fetch adapter) 启动真实流式下载任务。',
  },
  {
    signature: 'cancel(): void',
    description: 'EN: Cancel the active task. \nCN: 取消当前活动任务。',
  },
  {
    signature: 'reset(): void',
    description: 'EN: Reset a terminal snapshot back to idle. \nCN: 将终态快照重置回 idle。',
  },
  {
    signature: 'dispose(): void',
    description: 'EN: Cancel work, clear listeners, and release the instance. \nCN: 取消任务、清空监听器并释放实例。',
  },
] as const;

const TYPE_API_ITEMS = [
  'StreamDownloadTransport = fetch | axios',
  'StreamDownloadSaveStrategy = auto | file-system-access | stream-saver',
  'StreamDownloadStatus = idle | preparing | downloading | success | failed | cancelled',
  'StreamDownloadErrorCode',
  'StreamDownloadProgress',
  'StreamDownloadSnapshot',
  'StreamDownloadBaseRequest',
  'FetchStreamDownloadRequest',
  'AxiosStreamDownloadRequest',
  'StreamDownloadRequest',
  'StreamDownloadSuccessResult',
  'StreamDownloadError',
  'StreamDownloaderInit',
  'StreamDownloadListener',
  'StreamDownloadAxiosOptions',
  'SaveFilePickerFn',
] as const;

const meta: Meta<StreamDownloaderStoryArgs> = {
  title: 'Utils/StreamDownloader',
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
    saveStrategy: 'auto',
  },
  argTypes: {
    url: {
      control: 'text',
      description: storyT('storybook.stories.StreamDownloader.argTypes.url.description'),
    },
    fileName: {
      control: 'text',
      description: storyT('storybook.stories.StreamDownloader.argTypes.fileName.description'),
    },
    progressThrottleMs: {
      control: { type: 'number', min: 0, max: 2000, step: 20 },
      description: storyT('storybook.stories.StreamDownloader.argTypes.progressThrottleMs.description'),
    },
    saveStrategy: {
      control: 'radio',
      options: ['auto', 'file-system-access', 'stream-saver'],
      description: storyT('storybook.stories.StreamDownloader.argTypes.saveStrategy.description'),
    },
  },
};

export default meta;
type Story = StoryObj<StreamDownloaderStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '- **EN:** Click one of the start buttons to perform a real browser-side streaming download against the current URL, then inspect status, snapshot, request examples, and API reference below.\n- **CN:** 点击任一启动按钮，对当前 URL 执行真实的浏览器端流式下载，然后在下方查看状态、快照、请求示例与 API 参考。',
      },
    },
  },
  render: function Render(args: StreamDownloaderStoryArgs) {
    return <StreamDownloaderStoryDemo {...args} />;
  },
};

function StreamDownloaderStoryDemo({ url, fileName, progressThrottleMs, saveStrategy }: StreamDownloaderStoryArgs) {
  const t = useStoryT();
  const { appendLog, logs } = useStreamDownloaderDemoLogs();
  const downloader = useMemo(() => new StreamDownloader({ progressThrottleMs }), [progressThrottleMs]);
  const snapshot = useSyncExternalStore(
    downloader.subscribe.bind(downloader),
    downloader.getSnapshot.bind(downloader),
    downloader.getSnapshot.bind(downloader),
  );
  const axiosInstance = useMemo(() => createAxios({ adapter: 'fetch' }), []);

  useEffect(() => {
    return () => {
      downloader.dispose();
    };
  }, [downloader]);

  const normalizedFileName = fileName.trim() || undefined;

  const startFetchDownload = async () => {
    appendLog(t('storybook.stories.StreamDownloader.logs.fetchStart'));
    try {
      const result = await downloader.start({
        url,
        fileName: normalizedFileName,
        saveStrategy,
      });
      appendLog(`${t('storybook.stories.StreamDownloader.logs.success')} (${result.transport})`);
    } catch (error) {
      appendLog(formatErrorLog(t('storybook.stories.StreamDownloader.logs.error'), error));
    }
  };

  const startAxiosDownload = async () => {
    appendLog(t('storybook.stories.StreamDownloader.logs.axiosStart'));
    try {
      const result = await downloader.start({
        transport: 'axios',
        url,
        fileName: normalizedFileName,
        saveStrategy,
        axios: {
          instance: axiosInstance,
          adapter: 'fetch',
        },
      });
      appendLog(`${t('storybook.stories.StreamDownloader.logs.success')} (${result.transport})`);
    } catch (error) {
      appendLog(formatErrorLog(t('storybook.stories.StreamDownloader.logs.error'), error));
    }
  };

  const resetSnapshot = () => {
    downloader.reset();
    appendLog(t('storybook.stories.StreamDownloader.logs.reset'));
  };

  const requestExamples = buildRequestExamples({
    url,
    fileName: normalizedFileName,
    saveStrategy,
  });

  const configItems = [
    {
      key: 'url',
      label: t('storybook.stories.StreamDownloader.config.url'),
      value: (
        <Typography.Link href={url} target="_blank">
          {url}
        </Typography.Link>
      ),
    },
    {
      key: 'fileName',
      label: t('storybook.stories.StreamDownloader.config.fileName'),
      value: normalizedFileName ?? '--',
    },
    {
      key: 'saveStrategy',
      label: t('storybook.stories.StreamDownloader.config.saveStrategy'),
      value: <Tag>{saveStrategy}</Tag>,
    },
    {
      key: 'progressThrottleMs',
      label: t('storybook.stories.StreamDownloader.config.progressThrottleMs'),
      value: String(progressThrottleMs),
    },
  ];

  const sections = [
    {
      key: 'instance-api',
      label: t('storybook.stories.StreamDownloader.sections.instanceApi'),
      children: (
        <List
          size="small"
          dataSource={[...INSTANCE_API_ITEMS]}
          renderItem={(item: (typeof INSTANCE_API_ITEMS)[number]) => (
            <List.Item>
              <Space orientation="vertical" size={0}>
                <Typography.Text code>{item.signature}</Typography.Text>
                <Typography.Paragraph style={{ marginLeft: 24 }}>
                  <br />
                  {item.description.split('\n').map((line, index) => (
                    <div key={line}>{line}</div>
                  ))}
                </Typography.Paragraph>
              </Space>
            </List.Item>
          )}
        />
      ),
    },
    {
      key: 'request-api',
      label: t('storybook.stories.StreamDownloader.sections.requestApi'),
      children: (
        <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Typography.Text strong>{t('storybook.stories.StreamDownloader.sections.fetchExample')}</Typography.Text>
            <pre style={getCodeBlockStyle()}>{requestExamples.fetchRequest}</pre>
          </div>
          <div>
            <Typography.Text strong>{t('storybook.stories.StreamDownloader.sections.axiosExample')}</Typography.Text>
            <pre style={getCodeBlockStyle()}>{requestExamples.axiosRequest}</pre>
          </div>
        </Space>
      ),
    },
    {
      key: 'type-api',
      label: t('storybook.stories.StreamDownloader.sections.typeApi'),
      children: (
        <List
          size="small"
          dataSource={[...TYPE_API_ITEMS]}
          renderItem={(item: (typeof TYPE_API_ITEMS)[number]) => (
            <List.Item>
              <Typography.Text code>{item}</Typography.Text>
            </List.Item>
          )}
        />
      ),
    },
  ];

  return (
    <StreamDownloaderDemoCard
      title={t('storybook.stories.StreamDownloader.cardTitle')}
      hintTitle={t('storybook.stories.StreamDownloader.realHint')}
      hintDescription={t('storybook.stories.StreamDownloader.description')}
      configTitle={t('storybook.stories.StreamDownloader.configTitle')}
      configItems={configItems}
      snapshotTitle={t('storybook.stories.StreamDownloader.snapshotTitle')}
      snapshot={snapshot}
      isRunning={downloader.isRunning}
      onStartFetch={() => {
        void startFetchDownload();
      }}
      onStartAxios={() => {
        void startAxiosDownload();
      }}
      onCancel={() => {
        downloader.cancel();
        appendLog(t('storybook.stories.StreamDownloader.logs.cancel'));
      }}
      onReset={resetSnapshot}
      actionLabels={{
        startFetch: t('storybook.stories.StreamDownloader.actions.startFetch'),
        startAxios: t('storybook.stories.StreamDownloader.actions.startAxios'),
        cancel: t('storybook.stories.StreamDownloader.actions.cancel'),
        reset: t('storybook.stories.StreamDownloader.actions.reset'),
      }}
      fieldLabels={{
        isRunning: t('storybook.stories.StreamDownloader.config.isRunningGetter'),
        status: t('storybook.stories.StreamDownloader.fields.status'),
        requestUrl: t('storybook.stories.StreamDownloader.fields.requestUrl'),
        fileName: t('storybook.stories.StreamDownloader.fields.fileName'),
        transport: t('storybook.stories.StreamDownloader.fields.transport'),
        saveStrategy: t('storybook.stories.StreamDownloader.fields.saveStrategy'),
        loadedBytes: t('storybook.stories.StreamDownloader.fields.loadedBytes'),
        totalBytes: t('storybook.stories.StreamDownloader.fields.totalBytes'),
        percent: t('storybook.stories.StreamDownloader.fields.percent'),
        speedBps: t('storybook.stories.StreamDownloader.fields.speedBps'),
        error: t('storybook.stories.StreamDownloader.fields.error'),
      }}
      sections={sections}
      logsTitle={t('storybook.stories.StreamDownloader.logs.title')}
      logsEmptyText={t('storybook.stories.StreamDownloader.logs.empty')}
      logs={logs}
    />
  );
}

function buildRequestExamples({
  url,
  fileName,
  saveStrategy,
}: {
  url: string;
  fileName?: string;
  saveStrategy: StreamDownloadSaveStrategy;
}) {
  const fetchRequest: StreamDownloadRequest = {
    url,
    fileName,
    saveStrategy,
  };

  const normalizedFileName = fileName ? `\n  fileName: '${fileName}',` : '';

  return {
    fetchRequest: JSON.stringify(fetchRequest, null, 2),
    axiosRequest: `const axiosInstance = axios.create({ adapter: 'fetch' });\n\nconst request = {\n  transport: 'axios',\n  url: '${url}',${normalizedFileName}\n  saveStrategy: '${saveStrategy}',\n  axios: {\n    instance: axiosInstance,\n    adapter: 'fetch',\n  },\n};`,
  };
}
