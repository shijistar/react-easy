import { type CSSProperties, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { create as createAxios } from 'axios';
import { Alert, Button, Card, Collapse, Descriptions, List, Progress, Space, Tag, Typography } from 'antd';
import StreamDownloader, {
  type AxiosLikeInstance,
  type StreamDownloadRequest,
  type StreamDownloadSaveStrategy,
} from '../../../src/utils/StreamDownloader';
import { useStoryT } from '../../locales';

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

interface DemoLogItem {
  /**
   * - **EN:** Stable row key for the event log list.
   * - **CN:** 事件日志列表的稳定行键。
   */
  id: number;
  /**
   * - **EN:** Human-readable event text.
   * - **CN:** 面向人的事件文本。
   */
  message: string;
}

const INSTANCE_API_ITEMS = [
  {
    signature: 'new StreamDownloader(init?)',
    description:
      'EN: Create an instance with optional defaultRequest and progressThrottleMs. CN: 使用可选 defaultRequest 与 progressThrottleMs 创建实例。',
  },
  {
    signature: 'getSnapshot(): Readonly<StreamDownloadSnapshot>',
    description: 'EN: Read the latest immutable snapshot. CN: 读取当前最新的只读快照。',
  },
  {
    signature: 'status: StreamDownloadStatus',
    description: 'EN: Read the current task status getter. CN: 读取当前任务状态 getter。',
  },
  {
    signature: 'isRunning: boolean',
    description: 'EN: Tell whether an active task exists. CN: 判断当前是否存在活动任务。',
  },
  {
    signature: 'subscribe(listener): () => void',
    description:
      'EN: Subscribe to snapshot changes and receive an unsubscribe function. CN: 订阅快照变化并获得取消订阅函数。',
  },
  {
    signature: 'start(request?): Promise<StreamDownloadSuccessResult>',
    description:
      'EN: Start a real streaming download task with fetch or axios(fetch adapter). CN: 使用 fetch 或 axios(fetch adapter) 启动真实流式下载任务。',
  },
  {
    signature: 'cancel(): void',
    description: 'EN: Cancel the active task. CN: 取消当前活动任务。',
  },
  {
    signature: 'reset(): void',
    description: 'EN: Reset a terminal snapshot back to idle. CN: 将终态快照重置回 idle。',
  },
  {
    signature: 'dispose(): void',
    description: 'EN: Cancel work, clear listeners, and release the instance. CN: 取消任务、清空监听器并释放实例。',
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
  'AxiosLikeResponse',
  'AxiosLikeInstance',
  'StreamDownloadAxiosOptions',
  'SaveFilePickerFn',
] as const;

const meta: Meta<StreamDownloaderStoryArgs> = {
  title: 'Utils/StreamDownloader',
  parameters: {
    docs: {
      description: {
        component: `- **EN:** \`StreamDownloader\` is the class-level source of truth for browser-side large-file streaming downloads. This story shows the full public API surface and uses a real, CORS-enabled remote asset together with a real \`axios.create({ adapter: 'fetch' })\` instance.\n- **CN:** \`StreamDownloader\` 是浏览器端大文件流式下载能力的 class 级真相来源。本页展示完整公开 API，并使用真实、支持 CORS 的远端文件和真实的 \`axios.create({ adapter: 'fetch' })\` 实例。\n\n- **EN:** The live demo intentionally triggers a real save flow and a real network transfer. Prefer \`file-system-access\` when your browser supports it; \`stream-saver\` may still depend on additional browser/service-worker capability.\n- **CN:** 这个 live demo 会真实触发保存流程与网络传输。若浏览器支持，优先使用 \`file-system-access\`；而 \`stream-saver\` 仍可能依赖额外的浏览器 / service worker 能力。`,
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
      description:
        '- **EN:** Real public file URL used by both fetch and axios demos.\n- **CN:** fetch 与 axios demo 共用的真实公开文件 URL。',
    },
    fileName: {
      control: 'text',
      description:
        '- **EN:** Optional explicit file name override. Leave empty to derive it from response headers / URL.\n- **CN:** 可选显式文件名覆盖；留空时从响应头 / URL 推导。',
    },
    progressThrottleMs: {
      control: { type: 'number', min: 0, max: 2000, step: 20 },
      description:
        '- **EN:** Constructor-level progress throttling window in milliseconds.\n- **CN:** 构造参数级别的进度节流窗口，单位毫秒。',
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
  const logIdRef = useRef(0);
  const [logs, setLogs] = useState<DemoLogItem[]>([]);
  const downloader = useMemo(() => new StreamDownloader({ progressThrottleMs }), [progressThrottleMs]);
  const snapshot = useSyncExternalStore(
    downloader.subscribe.bind(downloader),
    downloader.getSnapshot.bind(downloader),
    downloader.getSnapshot.bind(downloader),
  );
  const axiosInstance = useMemo<AxiosLikeInstance>(() => createAxios({ adapter: 'fetch' }), []);

  useEffect(() => {
    return () => {
      downloader.dispose();
    };
  }, [downloader]);

  const normalizedFileName = fileName.trim() || undefined;

  const appendLog = (message: string) => {
    setLogs((prev) => [{ id: ++logIdRef.current, message }, ...prev].slice(0, 10));
  };

  const startFetchDownload = async () => {
    appendLog(t('storybook.stories.StreamDownloader.logs.fetchStart'));
    try {
      const result = await downloader.start({
        url: url,
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
        url: url,
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

  return (
    <Card variant="outlined" style={{ maxWidth: 1080 }} title={t('storybook.stories.StreamDownloader.cardTitle')}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          type="info"
          showIcon
          title={t('storybook.stories.StreamDownloader.realHint')}
          description={t('storybook.stories.StreamDownloader.description')}
        />

        <Descriptions bordered column={1} size="small" title={t('storybook.stories.StreamDownloader.configTitle')}>
          <Descriptions.Item label={t('storybook.stories.StreamDownloader.config.url')}>
            <Typography.Link href={url} target="_blank">
              {url}
            </Typography.Link>
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.StreamDownloader.config.fileName')}>
            {normalizedFileName ?? '--'}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.StreamDownloader.config.saveStrategy')}>
            <Tag>{saveStrategy}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.StreamDownloader.config.progressThrottleMs')}>
            {String(progressThrottleMs)}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.StreamDownloader.config.statusGetter')}>
            {downloader.status}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.StreamDownloader.config.isRunningGetter')}>
            {String(downloader.isRunning)}
          </Descriptions.Item>
        </Descriptions>

        <Space wrap>
          <Button type="primary" onClick={() => void startFetchDownload()} disabled={downloader.isRunning}>
            {t('storybook.stories.StreamDownloader.actions.startFetch')}
          </Button>
          <Button type="primary" onClick={() => void startAxiosDownload()} disabled={downloader.isRunning}>
            {t('storybook.stories.StreamDownloader.actions.startAxios')}
          </Button>
          <Button
            onClick={() => {
              downloader.cancel();
              appendLog(t('storybook.stories.StreamDownloader.logs.cancel'));
            }}
            disabled={!downloader.isRunning}
          >
            {t('storybook.stories.StreamDownloader.actions.cancel')}
          </Button>
          <Button onClick={resetSnapshot}>{t('storybook.stories.StreamDownloader.actions.reset')}</Button>
        </Space>

        <Descriptions
          bordered
          column={1}
          size="small"
          title={t('storybook.stories.StreamDownloader.snapshotTitle')}
          styles={{ label: { width: 200 } }}
        >
          <Descriptions.Item label={t('storybook.stories.StreamDownloader.fields.status')}>
            {snapshot.status}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.StreamDownloader.fields.requestUrl')}>
            {snapshot.requestUrl ?? '--'}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.StreamDownloader.fields.fileName')}>
            {snapshot.fileName ?? '--'}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.StreamDownloader.fields.transport')}>
            {snapshot.transport ?? '--'}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.StreamDownloader.fields.saveStrategy')}>
            {snapshot.saveStrategy ?? '--'}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.StreamDownloader.fields.loadedBytes')}>
            {String(snapshot.progress.loadedBytes)}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.StreamDownloader.fields.totalBytes')}>
            {snapshot.progress.totalBytes != null ? String(snapshot.progress.totalBytes) : '--'}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.StreamDownloader.fields.percent')}>
            <Progress
              percent={snapshot.progress.percent ?? 0}
              status={snapshot.progress.percent === 100 ? 'success' : 'active'}
            />
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.StreamDownloader.fields.speedBps')}>
            {snapshot.progress.speedBps != null ? formatByteRate(snapshot.progress.speedBps) : '--'}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.StreamDownloader.fields.error')}>
            <Typography.Text type={snapshot.errorCode ? 'danger' : undefined}>
              {snapshot.errorCode ? `${snapshot.errorCode}: ${snapshot.errorMessage}` : '--'}
            </Typography.Text>
          </Descriptions.Item>
        </Descriptions>

        <Collapse
          items={[
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
                        <Typography.Text>{item.description}</Typography.Text>
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
                    <Typography.Text strong>
                      {t('storybook.stories.StreamDownloader.sections.fetchExample')}
                    </Typography.Text>
                    <pre style={getCodeBlockStyle()}>{requestExamples.fetchRequest}</pre>
                  </div>
                  <div>
                    <Typography.Text strong>
                      {t('storybook.stories.StreamDownloader.sections.axiosExample')}
                    </Typography.Text>
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
          ]}
        />

        <div>
          <Typography.Text strong>{t('storybook.stories.StreamDownloader.logs.title')}</Typography.Text>
          <List
            bordered
            size="small"
            style={{ marginTop: 8 }}
            dataSource={logs}
            rowKey="id"
            locale={{ emptyText: t('storybook.stories.StreamDownloader.logs.empty') }}
            renderItem={(item) => <List.Item>{item.message}</List.Item>}
          />
        </div>
      </Space>
    </Card>
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
    url: url,
    fileName,
    saveStrategy,
  };

  const normalizedFileName = fileName ? `\n  fileName: '${fileName}',` : '';

  return {
    fetchRequest: JSON.stringify(fetchRequest, null, 2),
    axiosRequest: `const axiosInstance = axios.create({ adapter: 'fetch' });\n\nconst request = {\n  transport: 'axios',\n  url: '${url}',${normalizedFileName}\n  saveStrategy: '${saveStrategy}',\n  axios: {\n    instance: axiosInstance,\n    adapter: 'fetch',\n  },\n};`,
  };
}

function formatErrorLog(prefix: string, error: unknown) {
  return `${prefix}: ${error instanceof Error ? error.message : String(error)}`;
}

function formatByteRate(speedBps: number) {
  if (speedBps < 1024) {
    return `${speedBps.toFixed(0)} B/s`;
  }
  if (speedBps < 1024 ** 2) {
    return `${(speedBps / 1024).toFixed(2)} KB/s`;
  }
  return `${(speedBps / 1024 ** 2).toFixed(2)} MB/s`;
}

function getCodeBlockStyle(): CSSProperties {
  return {
    marginTop: 8,
    marginBottom: 0,
    padding: 12,
    borderRadius: 8,
    background: '#00000008',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  };
}
