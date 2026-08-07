浏览器端大文件流式下载器。它将远端响应作为 `ReadableStream` 读取，对进度派发做节流，并把字节写入运行时选择的目标 —— 要么是 File System Access API，要么是 StreamSaver 支持的可写流。类本身与框架无关，是下载契约的真相来源；[Hooks/useStreamDownloader](?path=/docs/hooks-usestreamdownloader--playground) 页面是其 React 适配层。

## 适用场景

- 在浏览器中下载大文件，需要实时进度、取消与错误上报。
- 下载需要在渲染之外命令式启动、跨组件复用，或嵌入非 React 代码。
- 需要用一个 API 同时覆盖 `fetch` 与 axios（`fetch` adapter）两种传输方式。

## 核心特性

- **双传输** —— 原生 `fetch`，或显式基于 `fetch` adapter 的外部 axios 实例。
- **可插拔保存策略** —— `auto` 自动探测、File System Access API（`file-system-access`）、StreamSaver（`stream-saver`）。
- **进度节流** —— 可通过 `progressThrottleMs` 配置快照派发的最小间隔。
- **订阅模型** —— `subscribe(listener)` + `getSnapshot()` 遵循 `useSyncExternalStore` 契约，React 内外皆可用。
- **生命周期控制** —— `cancel()`、`reset()`、`dispose()` 覆盖取消、终态重置与资源释放。
- **稳定错误码** —— 通过 `StreamDownloadError` 提供类型化错误码（`TASK_ALREADY_RUNNING`、`DOWNLOAD_CANCELLED` 等）。

## 示例代码

```ts
import { StreamDownloader } from '@tiny-codes/react-easy';

const downloader = new StreamDownloader({ progressThrottleMs: 200 });

downloader.subscribe((snapshot) => {
  console.log(snapshot.status, snapshot.progress.percent);
});

await downloader.start({
  url: '/api/report',
  fileName: 'report.pdf',
  saveStrategy: 'auto',
});
```

## 使用注意

- 远端 URL 必须支持 CORS 并暴露可读流 body，否则会以 `HTTP_ERROR` 或 `EMPTY_RESPONSE_STREAM` 失败。
- `file-system-access` 需要安全上下文（HTTPS/localhost）并弹出原生保存对话框；`stream-saver` 可能依赖额外的浏览器 / service worker 能力。
- 同一时间只能运行一个任务；运行中再次调用 `start()` 会以 `TASK_ALREADY_RUNNING` 拒绝。
- live demo 会真实触发保存流程与网络传输 —— 浏览器支持时优先使用 `file-system-access`。
