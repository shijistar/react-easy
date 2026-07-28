import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Button, Card, Descriptions, List, Space, Typography } from 'antd';
import { type AxiosLikeInstance, useStreamDownloader } from '../../../src';
import { useStoryT } from '../../locales';

interface UseStreamDownloaderStoryArgs {
  fileName: string;
  totalBytes: number;
  chunkSize: number;
  delayMs: number;
}

interface DemoLogItem {
  id: number;
  message: string;
}

const meta: Meta<UseStreamDownloaderStoryArgs> = {
  title: 'Hooks/useStreamDownloader',
  parameters: {
    docs: {
      description: {
        component: `- **EN:** \`useStreamDownloader\` wraps a stable \`StreamDownloader\` instance and exposes a React-friendly surface: \`snapshot\`, \`isRunning\`, \`start\`, \`cancel\`, and \`reset\`. This page focuses only on the hook's incremental value. For the full class contract and transport/save-strategy details, see [Utils/StreamDownloader](?path=/docs/utils-streamdownloader--api).\n- **CN:** \`useStreamDownloader\` 会包装一个稳定的 \`StreamDownloader\` 实例，并暴露更适合 React 场景的接口：\`snapshot\`、\`isRunning\`、\`start\`、\`cancel\`、\`reset\`。本页只覆盖 hook 自身的增量价值；完整 class 契约以及 transport / save strategy 细节请查看 [Utils/StreamDownloader](?path=/docs/utils-streamdownloader--api)。`,
      },
    },
  },
  args: {
    fileName: 'hook-demo.bin',
    totalBytes: 8192,
    chunkSize: 2048,
    delayMs: 40,
  },
};

export default meta;
type Story = StoryObj<UseStreamDownloaderStoryArgs>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: `- **EN:** Trigger a mocked \`fetch\` or mocked axios(fetch-adapter) download through the hook, then inspect how \`snapshot\` and \`isRunning\` update without manual subscription wiring.\n- **CN:** 通过 hook 触发模拟 \`fetch\` 或模拟 axios(fetch-adapter) 下载，观察无需手写订阅逻辑时 \`snapshot\` 与 \`isRunning\` 如何自动刷新。`,
      },
    },
  },
  render: function Render(args: UseStreamDownloaderStoryArgs) {
    return <UseStreamDownloaderStoryDemo {...args} />;
  },
};

function UseStreamDownloaderStoryDemo({ fileName, totalBytes, chunkSize, delayMs }: UseStreamDownloaderStoryArgs) {
  const t = useStoryT();
  const envRef = useRef<(() => void) | null>(null);
  const logIdRef = useRef(0);
  const [logs, setLogs] = useState<DemoLogItem[]>([]);
  const { snapshot, isRunning, start, cancel, reset } = useStreamDownloader();

  useEffect(() => {
    return () => {
      envRef.current?.();
    };
  }, []);

  const appendLog = (message: string) => {
    setLogs((prev) => [{ id: ++logIdRef.current, message }, ...prev].slice(0, 8));
  };

  const prepareFetchEnvironment = () => {
    envRef.current?.();
    envRef.current = installMockDownloadEnvironment({ fileName, totalBytes, chunkSize, delayMs });
  };

  const startFetchDownload = async () => {
    prepareFetchEnvironment();
    appendLog(t('storybook.stories.useStreamDownloader.logs.fetchStart'));
    try {
      const result = await start({
        url: `https://example.com/downloads/${fileName}`,
        saveStrategy: 'file-system-access',
      });
      appendLog(`${t('storybook.stories.useStreamDownloader.logs.success')} (${result.transport})`);
    } catch (error) {
      appendLog(formatErrorLog(t('storybook.stories.useStreamDownloader.logs.error'), error));
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
    appendLog(t('storybook.stories.useStreamDownloader.logs.axiosStart'));
    try {
      const result = await start({
        transport: 'axios',
        url: `https://example.com/downloads/${fileName}`,
        saveStrategy: 'file-system-access',
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

  const cancelDownload = () => {
    cancel();
    appendLog(t('storybook.stories.useStreamDownloader.logs.cancel'));
  };

  const resetSnapshot = () => {
    reset();
    appendLog(t('storybook.stories.useStreamDownloader.logs.reset'));
  };

  return (
    <Card bordered style={{ maxWidth: 920 }} title={t('storybook.stories.useStreamDownloader.cardTitle')}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          type="info"
          showIcon
          message={t('storybook.stories.useStreamDownloader.mockHint')}
          description={t('storybook.stories.useStreamDownloader.description')}
        />

        <Space wrap>
          <Button type="primary" onClick={() => void startFetchDownload()} disabled={isRunning}>
            {t('storybook.stories.useStreamDownloader.actions.startFetch')}
          </Button>
          <Button onClick={() => void startAxiosDownload()} disabled={isRunning}>
            {t('storybook.stories.useStreamDownloader.actions.startAxios')}
          </Button>
          <Button onClick={cancelDownload} disabled={!isRunning}>
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
          <Descriptions.Item label={t('storybook.stories.useStreamDownloader.fields.fileName')}>
            {snapshot.fileName ?? '--'}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.useStreamDownloader.fields.loadedBytes')}>
            {String(snapshot.progress.loadedBytes)}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.useStreamDownloader.fields.percent')}>
            {snapshot.progress.percent != null ? `${snapshot.progress.percent}%` : '--'}
          </Descriptions.Item>
          <Descriptions.Item label={t('storybook.stories.useStreamDownloader.fields.error')}>
            {snapshot.errorCode ? `${snapshot.errorCode}: ${snapshot.errorMessage}` : '--'}
          </Descriptions.Item>
        </Descriptions>

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

function installMockDownloadEnvironment({ fileName, totalBytes, chunkSize, delayMs }: UseStreamDownloaderStoryArgs) {
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
      controller.enqueue(new Uint8Array(nextSize).fill(2));
    },
  });
}

function formatErrorLog(prefix: string, error: unknown) {
  return `${prefix}: ${error instanceof Error ? error.message : String(error)}`;
}
