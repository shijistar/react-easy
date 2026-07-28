import { type CSSProperties, type Key, type ReactNode, useCallback, useRef, useState } from 'react';
import type { CollapseProps } from 'antd';
import { Alert, Button, Card, Collapse, Descriptions, List, Progress, Space, Typography } from 'antd';
import type { StreamDownloadSnapshot } from '../../../src';

export interface DemoLogItem {
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

export interface StreamDownloaderDemoConfigItem {
  /**
   * - **EN:** Optional stable key for one config row.
   * - **CN:** 单条配置行的可选稳定 key。
   */
  key?: Key;
  /**
   * - **EN:** Config row label.
   * - **CN:** 配置项标签。
   */
  label: ReactNode;
  /**
   * - **EN:** Config row content.
   * - **CN:** 配置项内容。
   */
  value: ReactNode;
}

export interface StreamDownloaderDemoActionLabels {
  /**
   * - **EN:** Label for the native fetch start action.
   * - **CN:** 原生 fetch 启动动作的标签。
   */
  startFetch: ReactNode;
  /**
   * - **EN:** Label for the axios(fetch adapter) start action.
   * - **CN:** axios(fetch adapter) 启动动作的标签。
   */
  startAxios: ReactNode;
  /**
   * - **EN:** Label for the cancel action.
   * - **CN:** 取消动作的标签。
   */
  cancel: ReactNode;
  /**
   * - **EN:** Label for the reset action.
   * - **CN:** 重置动作的标签。
   */
  reset: ReactNode;
}

export interface StreamDownloaderDemoFieldLabels {
  /**
   * - **EN:** Label for the status field.
   * - **CN:** 状态字段标签。
   */
  status: ReactNode;
  /**
   * - **EN:** Optional label for the running-state field.
   * - **CN:** 运行状态字段的可选标签。
   */
  isRunning?: ReactNode;
  /**
   * - **EN:** Label for the request URL field.
   * - **CN:** 请求 URL 字段标签。
   */
  requestUrl: ReactNode;
  /**
   * - **EN:** Label for the final file name field.
   * - **CN:** 最终文件名字段标签。
   */
  fileName: ReactNode;
  /**
   * - **EN:** Label for the transport field.
   * - **CN:** 传输方式字段标签。
   */
  transport: ReactNode;
  /**
   * - **EN:** Label for the save-strategy field.
   * - **CN:** 保存策略字段标签。
   */
  saveStrategy: ReactNode;
  /**
   * - **EN:** Label for the loaded-bytes field.
   * - **CN:** 已加载字节数字段标签。
   */
  loadedBytes: ReactNode;
  /**
   * - **EN:** Label for the total-bytes field.
   * - **CN:** 总字节数字段标签。
   */
  totalBytes: ReactNode;
  /**
   * - **EN:** Label for the percent field.
   * - **CN:** 百分比字段标签。
   */
  percent: ReactNode;
  /**
   * - **EN:** Label for the speed field.
   * - **CN:** 速度字段标签。
   */
  speedBps: ReactNode;
  /**
   * - **EN:** Label for the error field.
   * - **CN:** 错误字段标签。
   */
  error: ReactNode;
}

export interface StreamDownloaderDemoCardProps {
  /**
   * - **EN:** Card title.
   * - **CN:** 卡片标题。
   */
  title: ReactNode;
  /**
   * - **EN:** Alert title shown above the live demo.
   * - **CN:** 展示在 live demo 上方的提示标题。
   */
  hintTitle: ReactNode;
  /**
   * - **EN:** Alert description shown above the live demo.
   * - **CN:** 展示在 live demo 上方的提示说明。
   */
  hintDescription: ReactNode;
  /**
   * - **EN:** Config section title.
   * - **CN:** 配置区标题。
   */
  configTitle: ReactNode;
  /**
   * - **EN:** Rendered config rows.
   * - **CN:** 已渲染的配置行。
   */
  configItems: StreamDownloaderDemoConfigItem[];
  /**
   * - **EN:** Snapshot section title.
   * - **CN:** 快照区标题。
   */
  snapshotTitle: ReactNode;
  /**
   * - **EN:** Current reactive snapshot.
   * - **CN:** 当前响应式快照。
   */
  snapshot: Readonly<StreamDownloadSnapshot>;
  /**
   * - **EN:** Whether the current task is running.
   * - **CN:** 当前任务是否处于运行态。
   */
  isRunning: boolean;
  /**
   * - **EN:** Start native fetch download.
   * - **CN:** 启动原生 fetch 下载。
   */
  onStartFetch: () => void;
  /**
   * - **EN:** Start axios(fetch adapter) download.
   * - **CN:** 启动 axios(fetch adapter) 下载。
   */
  onStartAxios: () => void;
  /**
   * - **EN:** Cancel the current task.
   * - **CN:** 取消当前任务。
   */
  onCancel: () => void;
  /**
   * - **EN:** Reset the terminal snapshot.
   * - **CN:** 重置终态快照。
   */
  onReset: () => void;
  /**
   * - **EN:** Action button labels.
   * - **CN:** 动作按钮标签。
   */
  actionLabels: StreamDownloaderDemoActionLabels;
  /**
   * - **EN:** Snapshot field labels.
   * - **CN:** 快照字段标签。
   */
  fieldLabels: StreamDownloaderDemoFieldLabels;
  /**
   * - **EN:** Extra collapsible documentation/demo sections.
   * - **CN:** 额外的可折叠文档 / 演示区块。
   */
  sections: CollapseProps['items'];
  /**
   * - **EN:** Log section title.
   * - **CN:** 日志区标题。
   */
  logsTitle: ReactNode;
  /**
   * - **EN:** Empty-state text for the log list.
   * - **CN:** 日志列表的空状态文案。
   */
  logsEmptyText: ReactNode;
  /**
   * - **EN:** Current log rows.
   * - **CN:** 当前日志行。
   */
  logs: DemoLogItem[];
  /**
   * - **EN:** Optional max width for the demo card.
   * - **CN:** demo 卡片的可选最大宽度。
   */
  maxWidth?: number;
}

export function useStreamDownloaderDemoLogs(limit = 10) {
  const logIdRef = useRef(0);
  const [logs, setLogs] = useState<DemoLogItem[]>([]);

  const appendLog = useCallback(
    (message: string) => {
      setLogs((prev) => [{ id: ++logIdRef.current, message }, ...prev].slice(0, limit));
    },
    [limit],
  );

  return {
    logs,
    appendLog,
  };
}

export function formatErrorLog(prefix: string, error: unknown) {
  return `${prefix}: ${error instanceof Error ? error.message : String(error)}`;
}

export function formatByteRate(speedBps: number) {
  if (speedBps < 1024) {
    return `${speedBps.toFixed(0)} B/s`;
  }
  if (speedBps < 1024 ** 2) {
    return `${(speedBps / 1024).toFixed(2)} KB/s`;
  }
  return `${(speedBps / 1024 ** 2).toFixed(2)} MB/s`;
}

export function getCodeBlockStyle(): CSSProperties {
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

function StreamDownloaderDemoCard({
  title,
  hintTitle,
  hintDescription,
  configTitle,
  configItems,
  snapshotTitle,
  snapshot,
  isRunning,
  onStartFetch,
  onStartAxios,
  onCancel,
  onReset,
  actionLabels,
  fieldLabels,
  sections,
  logsTitle,
  logsEmptyText,
  logs,
  maxWidth = 1080,
}: StreamDownloaderDemoCardProps) {
  return (
    <Card variant="outlined" style={{ maxWidth }} title={title}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Alert type="info" showIcon title={hintTitle} description={hintDescription} />

        <Descriptions bordered column={1} size="small" title={configTitle}>
          {configItems.map((item, index) => (
            <Descriptions.Item key={item.key ?? index} label={item.label}>
              {item.value}
            </Descriptions.Item>
          ))}
        </Descriptions>

        <Space wrap>
          <Button type="primary" onClick={() => void onStartFetch()} disabled={isRunning}>
            {actionLabels.startFetch}
          </Button>
          <Button type="primary" onClick={() => void onStartAxios()} disabled={isRunning}>
            {actionLabels.startAxios}
          </Button>
          <Button onClick={() => void onCancel()} disabled={!isRunning}>
            {actionLabels.cancel}
          </Button>
          <Button onClick={() => void onReset()}>{actionLabels.reset}</Button>
        </Space>

        <Descriptions bordered column={1} size="small" title={snapshotTitle} styles={{ label: { width: 200 } }}>
          <Descriptions.Item label={fieldLabels.status}>{snapshot.status}</Descriptions.Item>
          {fieldLabels.isRunning ? (
            <Descriptions.Item label={fieldLabels.isRunning}>{String(isRunning)}</Descriptions.Item>
          ) : null}
          <Descriptions.Item label={fieldLabels.requestUrl}>{snapshot.requestUrl ?? '--'}</Descriptions.Item>
          <Descriptions.Item label={fieldLabels.fileName}>{snapshot.fileName ?? '--'}</Descriptions.Item>
          <Descriptions.Item label={fieldLabels.transport}>{snapshot.transport ?? '--'}</Descriptions.Item>
          <Descriptions.Item label={fieldLabels.saveStrategy}>{snapshot.saveStrategy ?? '--'}</Descriptions.Item>
          <Descriptions.Item label={fieldLabels.loadedBytes}>{String(snapshot.progress.loadedBytes)}</Descriptions.Item>
          <Descriptions.Item label={fieldLabels.totalBytes}>
            {snapshot.progress.totalBytes != null ? String(snapshot.progress.totalBytes) : '--'}
          </Descriptions.Item>
          <Descriptions.Item label={fieldLabels.percent}>
            <Progress
              percent={snapshot.progress.percent ?? 0}
              status={snapshot.progress.percent === 100 ? 'success' : 'active'}
            />
          </Descriptions.Item>
          <Descriptions.Item label={fieldLabels.speedBps}>
            {snapshot.progress.speedBps != null ? formatByteRate(snapshot.progress.speedBps) : '--'}
          </Descriptions.Item>
          <Descriptions.Item label={fieldLabels.error}>
            <Typography.Text type={snapshot.errorCode ? 'danger' : undefined}>
              {snapshot.errorCode ? `${snapshot.errorCode}: ${snapshot.errorMessage}` : '--'}
            </Typography.Text>
          </Descriptions.Item>
        </Descriptions>

        <Collapse items={sections} />

        <div>
          <Typography.Text strong>{logsTitle}</Typography.Text>
          <List
            bordered
            size="small"
            style={{ marginTop: 8 }}
            dataSource={logs}
            rowKey="id"
            locale={{ emptyText: logsEmptyText }}
            renderItem={(item) => <List.Item>{item.message}</List.Item>}
          />
        </div>
      </Space>
    </Card>
  );
}

export default StreamDownloaderDemoCard;
