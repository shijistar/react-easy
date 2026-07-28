import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Button, Card, Descriptions, List, Space, Typography } from 'antd';
import StreamDownloader, { type AxiosLikeInstance } from '../../../src/utils/StreamDownloader';
import { useStoryT } from '../../locales';

interface StreamDownloaderStoryArgs {
  fileName: string;
  totalBytes: number;
  chunkSize: number;
  delayMs: number;
}

interface DemoLogItem {
  id: number;
  message: string;
}

const meta: Meta<StreamDownloaderStoryArgs> = {
  title: 'Utils/StreamDownloader',
  parameters: {
    docs: {
      description: {
        component: `- **EN:** \`StreamDownloader\` is the low-level browser streaming downloader for large files. It coordinates transport selection (\`fetch\` or an injected axios instance with a fetch adapter), save-strategy selection (\`File System Access API\` or \`StreamSaver.js\`), status transitions, progress updates, cancellation, and terminal reset. This Storybook demo uses mocked network responses and a mocked save-file picker so you can inspect the public API without writing a real file.\n- **CN:** \`StreamDownloader\` 是面向大文件场景的浏览器端底层流式下载类，负责 transport 选择（\`fetch\` 或显式注入的 axios fetch adapter 实例）、save strategy 选择（\`File System Access API\` 或 \`StreamSaver.js\`）、状态流转、进度更新、取消控制与终态重置。本 Storybook 示例使用了模拟网络响应和模拟保存器，便于在不落真实文件的情况下观察公开 API 行为。\n\n- **EN:** Public API: \`constructor(init?)\`, \`getSnapshot()\`, \`status\`, \`isRunning\`, \`subscribe(listener)\`, \`start(request?)\`, \`cancel()\`, \`reset()\`, \`dispose()\`.\n- **CN:** 公开 API 包括：\`constructor(init?)\`、\`getSnapshot()\`、\`status\`、\`isRunning\`、\`subscribe(listener)\`、\`start(request?)\`、\`cancel()\`、\`reset()\`、\`dispose()\`。`,
      },
    },
  },
  args: {
    fileName: 'storybook-demo.bin',
    totalBytes: 12288,
    chunkSize: 2048,
    delayMs: 40,
  },
  argTypes: {
    fileName: {
      control: 'text',
      description: `- **EN:** File name injected into the mocked \`Content-Disposition\` header and save dialog.\n- **CN:** 注入到模拟 \`Content-Disposition\` 响应头和保存对话框中的文件名。`,
    },
    totalBytes: {
      control: { type: 'number', min: 1024, max: 65536, step: 1024 },
      description: `- **EN:** Total bytes emitted by the mocked stream.\n- **CN:** 模拟流输出的总字节数。`,
    },
    chunkSize: {
      control: { type: 'number', min: 256, max: 8192, step: 256 },
      description: `- **EN:** Byte size of each mocked chunk.\n- **CN:** 每个模拟分块的字节大小。`,
    },
    delayMs: {
      control: { type: 'range', min: 0, max: 400, step: 20 },
      description: `- **EN:** Delay between mocked chunks to make progress transitions easier to observe.\n- **CN:** 模拟分块之间的延迟，便于观察进度变化。`,
    },
  },
};

export default meta;
type Story = StoryObj<StreamDownloaderStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: `- **EN:** Use the buttons below to start a mocked \`fetch\` or mocked axios(fetch-adapter) download, then inspect the downloader snapshot, current transport, chosen save strategy, progress, and event history.\n- **CN:** 通过下面的按钮分别触发模拟 \`fetch\` 或模拟 axios(fetch-adapter) 下载，然后观察 downloader 的快照、当前 transport、save strategy、进度以及事件日志。`,
      },
    },
  },
  render: function Render(args: StreamDownloaderStoryArgs) {
    return <StreamDownloaderStoryDemo {...args} />;
  },
};

function StreamDownloaderStoryDemo({ fileName, totalBytes, chunkSize, delayMs }: StreamDownloaderStoryArgs) {
  const t = useStoryT();
  const envRef = useRef<(() => void) | null>(null);
  const logIdRef = useRef(0);
  const [logs, setLogs] = useState<DemoLogItem[]>([]);
  const downloader = useMemo(() => new StreamDownloader(), []);
  const snapshot = useSyncExternalStore(
    downloader.subscribe.bind(downloader),
    downloader.getSnapshot.bind(downloader),
    downloader.getSnapshot.bind(downloader),
  );

  useEffect(() => {
    return () => {
      envRef.current?.();
      downloader.dispose();
    };
  }, [downloader]);

  const appendLog = (message: string) => {
    setLogs((prev) => [{ id: ++logIdRef.current, message }, ...prev].slice(0, 8));
  };

  const prepareFetchEnvironment = () => {
    envRef.current?.();
    envRef.current = installMockDownloadEnvironment({ fileName, totalBytes, chunkSize, delayMs });
  };

  const startFetchDownload = async () => {
    prepareFetchEnvironment();
    appendLog(t('storybook.stories.StreamDownloader.logs.fetchStart'));
    try {
      const result = await downloader.start({
        url: `https://example.com/downloads/${fileName}`,
        saveStrategy: 'file-system-access',
      });
      appendLog(`${t('storybook.stories.StreamDownloader.logs.success')} (${result.transport})`);
    } catch (error) {
      appendLog(formatErrorLog(t('storybook.stories.StreamDownloader.logs.error'), error));
    }
  };

  const startAxiosDownload = async () => {
    prepareFetchEnvironment();
    const axiosInstance: AxiosLikeInstance = {
      request: async () => ({
        status: 200,
        headers: {
          'Content-Length': String(totalBytes),
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
        data: createMockByteStream(totalBytes, chunkSize, delayMs),
      }),
    };
    appendLog(t('storybook.stories.StreamDownloader.logs.axiosStart'));
    try {
      const result = await downloader.start({
        transport: 'axios',
        url: `https://example.com/downloads/${fileName}`,
        saveStrategy: 'file-system-access',
        axios: {
          instance: axiosInstance,
          adapterHint: 'fetch',
        },
      });
      appendLog(`${t('storybook.stories.StreamDownloader.logs.success')} (${result.transport})`);
    } catch (error) {
      appendLog(formatErrorLog(t('storybook.stories.StreamDownloader.logs.error'), error));
    }
  };

  const cancelDownload = () => {
    downloader.cancel();
    appendLog(t('storybook.stories.StreamDownloader.logs.cancel'));
  };

  const resetSnapshot = () => {
    downloader.reset();
    appendLog(t('storybook.stories.StreamDownloader.logs.reset'));
  };

  return (
    <Card bordered style={{ maxWidth: 920 }} title={t('storybook.stories.StreamDownloader.cardTitle')}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          type="info"
          showIcon
          message={t('storybook.stories.StreamDownloader.mockHint')}
          description={t('storybook.stories.StreamDownloader.description')}
        />

        <Space wrap>
          <Button type="primary" onClick={() => void startFetchDownload()} disabled={downloader.isRunning}>
            {t('storybook.stories.StreamDownloader.actions.startFetch')}
          </Button>
          <Button onClick={() => void startAxiosDownload()} disabled={downloader.isRunning}>
            {t('storybook.stories.StreamDownloader.actions.startAxios')}
          </Button>
          <Button onClick={cancelDownload} disabled={!downloader.isRunning}>
            {t('storybook.stories.StreamDownloader.actions.cancel')}
          </Button>
          <Button onClick={resetSnapshot}>{t('storybook.stories.StreamDownloader.actions.reset')}</Button>
        </Space>

        <Descriptions bordered column={1} size="small" title={t('storybook.stories.StreamDownloader.snapshotTitle')}>
          <Descriptions.Item label={t('storybook.stories.StreamDownloader.fields.status')}>
            {snapshot.status}
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
            {snapshot.progress.percent != null ? `${snapshot.progress.percent}%` : '--'}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.StreamDownloader.fields.error')}>
            {snapshot.errorCode ? `${snapshot.errorCode}: ${snapshot.errorMessage}` : '--'}
          </Descriptions.Item>
        </Descriptions>

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

function installMockDownloadEnvironment({ fileName, totalBytes, chunkSize, delayMs }: StreamDownloaderStoryArgs) {
  const originalFetch = globalThis.fetch;
  const originalPicker = (globalThis as typeof globalThis & { showSaveFilePicker?: unknown }).showSaveFilePicker;

  globalThis.fetch = async () =>
    new Response(createMockByteStream(totalBytes, chunkSize, delayMs), {
      status: 200,
      headers: {
        'Content-Length': String(totalBytes),
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  (globalThis as typeof globalThis & { showSaveFilePicker?: unknown }).showSaveFilePicker = async () => ({
    createWritable: async () => ({
      getWriter() {
        return {
          write: async (_chunk: Uint8Array) => undefined,
          close: async () => undefined,
          abort: async () => undefined,
        };
      },
    }),
  });

  return () => {
    globalThis.fetch = originalFetch;
    if (originalPicker === undefined) {
      delete (globalThis as typeof globalThis & { showSaveFilePicker?: unknown }).showSaveFilePicker;
    } else {
      (globalThis as typeof globalThis & { showSaveFilePicker?: unknown }).showSaveFilePicker = originalPicker;
    }
  };
}

function createMockByteStream(totalBytes: number, chunkSize: number, delayMs: number) {
  let sentBytes = 0;
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (sentBytes >= totalBytes) {
        controller.close();
        return;
      }
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
      const nextSize = Math.min(chunkSize, totalBytes - sentBytes);
      sentBytes += nextSize;
      controller.enqueue(new Uint8Array(nextSize).fill(1));
    },
  });
}

function formatErrorLog(prefix: string, error: unknown) {
  return `${prefix}: ${error instanceof Error ? error.message : String(error)}`;
}
