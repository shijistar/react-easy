import type { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * - **EN:** Supported request transport types.
 * - **CN:** 支持的请求传输类型。
 */
export type StreamDownloadTransport =
  /**
   * - **EN:** Use the browser's native `fetch` implementation.
   * - **CN:** 使用浏览器原生的 `fetch` 实现。
   */
  | 'fetch'
  /**
   * - **EN:** Use an injected axios instance that is explicitly backed by the `fetch` adapter.
   * - **CN:** 使用显式基于 `fetch` adapter 的外部 axios 实例。
   */
  | 'axios';

/**
 * - **EN:** Supported streaming save strategies.
 * - **CN:** 支持的流式保存策略。
 */
export type StreamDownloadSaveStrategy =
  /**
   * - **EN:** Auto-detect the best available streaming save strategy at runtime. `file-system-access`
   *   is preferred, followed by `stream-saver`.
   * - **CN:** 运行时自动探测最合适的流式保存策略。优先使用 `file-system-access`，其次使用 `stream-saver`。
   */
  | 'auto'
  /**
   * - **EN:** Use the File System Access API, showing a file save dialog where the file name and save
   *   location can be specified.
   * - **CN:** 使用 File System Access API，显示一个文件保存对话框，可以指定文件名和保存位置。
   */
  | 'file-system-access'
  /**
   * - **EN:** Use StreamSaver-backed writable streams, causing the browser to directly download the
   *   file.
   * - **CN:** 使用基于 StreamSaver 的可写流，浏览器直接下载文件。
   */
  | 'stream-saver';

/**
 * - **EN:** Lifecycle status of a download task.
 * - **CN:** 下载任务的生命周期状态。
 */
export type StreamDownloadStatus =
  /**
   * - **EN:** No task has started yet, or the terminal state was reset.
   * - **CN:** 尚未启动任务，或终态已被重置。
   */
  | 'idle'
  /**
   * - **EN:** The task was accepted and is preparing remote/local stream resources.
   * - **CN:** 任务已受理，正在准备远端/本地流资源。
   */
  | 'preparing'
  /**
   * - **EN:** Bytes are actively flowing from the remote source to the local writer.
   * - **CN:** 字节正在从远端源持续写入本地目标。
   */
  | 'downloading'
  /**
   * - **EN:** The task completed successfully.
   * - **CN:** 任务已成功完成。
   */
  | 'success'
  /**
   * - **EN:** The task failed with an error.
   * - **CN:** 任务因错误而失败。
   */
  | 'failed'
  /**
   * - **EN:** The task was cancelled by the caller or runtime.
   * - **CN:** 任务被调用方或运行时取消。
   */
  | 'cancelled';

/**
 * - **EN:** Stable error codes exposed by `StreamDownloader`.
 * - **CN:** `StreamDownloader` 对外暴露的稳定错误码。
 */
export type StreamDownloadErrorCode =
  /**
   * - **EN:** A new task was requested while another one is still active.
   * - **CN:** 在已有活动任务时又请求了新任务。
   */
  | 'TASK_ALREADY_RUNNING'
  /**
   * - **EN:** The selected transport is unsupported.
   * - **CN:** 所选传输方式不受支持。
   */
  | 'UNSUPPORTED_TRANSPORT'
  /**
   * - **EN:** The selected save strategy is unsupported in the current runtime.
   * - **CN:** 当前运行环境不支持所选保存策略。
   */
  | 'UNSUPPORTED_SAVE_STRATEGY'
  /**
   * - **EN:** The request URL is missing or invalid.
   * - **CN:** 请求 URL 缺失或无效。
   */
  | 'INVALID_REQUEST_URL'
  /**
   * - **EN:** The remote endpoint returned a non-success HTTP status.
   * - **CN:** 远端接口返回了非成功 HTTP 状态。
   */
  | 'HTTP_ERROR'
  /**
   * - **EN:** The response does not expose a readable stream body.
   * - **CN:** 响应没有暴露可读流 body。
   */
  | 'EMPTY_RESPONSE_STREAM'
  /**
   * - **EN:** The injected axios instance does not satisfy the required contract.
   * - **CN:** 注入的 axios 实例不满足所需契约。
   */
  | 'INVALID_AXIOS_INSTANCE'
  /**
   * - **EN:** The axios instance is not backed by a browser-compatible fetch stream path.
   * - **CN:** axios 实例没有走浏览器兼容的 fetch 流式路径。
   */
  | 'AXIOS_ADAPTER_NOT_SUPPORTED'
  /**
   * - **EN:** Writing to the destination stream was aborted.
   * - **CN:** 写入目标流时被中止。
   */
  | 'WRITE_ABORTED'
  /**
   * - **EN:** Writing to the destination stream failed.
   * - **CN:** 写入目标流失败。
   */
  | 'WRITE_FAILED'
  /**
   * - **EN:** The download task was cancelled.
   * - **CN:** 下载任务已取消。
   */
  | 'DOWNLOAD_CANCELLED';

/**
 * - **EN:** Progress metrics reported during a streaming download.
 * - **CN:** 流式下载过程中上报的进度指标。
 */
export interface StreamDownloadProgress {
  /**
   * - **EN:** Bytes that have already been written into the destination stream.
   * - **CN:** 已经写入目标流的字节数。
   */
  loadedBytes: number;
  /**
   * - **EN:** Total bytes reported by `Content-Length`, when available.
   * - **CN:** 由 `Content-Length` 提供的总字节数；如果缺失则为空。
   */
  totalBytes?: number;
  /**
   * - **EN:** Completion percentage derived from `loadedBytes / totalBytes`, when available.
   * - **CN:** 基于 `loadedBytes / totalBytes` 计算出的完成百分比；如果无法计算则为空。
   */
  percent?: number;
  /**
   * - **EN:** Average transfer speed in bytes per second.
   * - **CN:** 平均传输速度，单位为字节每秒。
   */
  speedBps?: number;
}

/**
 * - **EN:** Reactive snapshot describing the latest downloader state.
 * - **CN:** 描述下载器最新状态的响应式快照。
 */
export interface StreamDownloadSnapshot {
  /**
   * - **EN:** Latest lifecycle status of the current or most recent task.
   * - **CN:** 当前或最近一次任务的最新生命周期状态。
   */
  status: StreamDownloadStatus;
  /**
   * - **EN:** Request URL of the current or most recent task.
   * - **CN:** 当前或最近一次任务的请求 URL。
   */
  requestUrl?: string;
  /**
   * - **EN:** Final or derived file name used for saving.
   * - **CN:** 实际保存时使用的最终或推导出的文件名。
   */
  fileName?: string;
  /**
   * - **EN:** Transport chosen by the current or most recent task.
   * - **CN:** 当前或最近一次任务使用的传输方式。
   */
  transport?: StreamDownloadTransport;
  /**
   * - **EN:** Concrete save strategy selected for the task.
   * - **CN:** 当前任务实际选择的保存策略。
   */
  saveStrategy?: Exclude<StreamDownloadSaveStrategy, 'auto'>;
  /**
   * - **EN:** Latest streaming progress payload.
   * - **CN:** 最新的流式进度数据。
   */
  progress: StreamDownloadProgress;
  /**
   * - **EN:** Stable error code when the task ends in a terminal error state.
   * - **CN:** 当任务以错误终态结束时对应的稳定错误码。
   */
  errorCode?: StreamDownloadErrorCode;
  /**
   * - **EN:** Human-readable error message when available.
   * - **CN:** 可用时的人类可读错误消息。
   */
  errorMessage?: string;
}

/**
 * - **EN:** Axios-specific options for the `transport: 'axios'` request branch.
 * - **CN:** `transport: 'axios'` 请求分支专用的 axios 选项。
 */
export interface StreamDownloadAxiosOptions {
  /**
   * - **EN:** The adapter must be fixed to `fetch` so the response can expose a browser
   *   `ReadableStream`.
   * - **CN:** adapter 必须固定为 `fetch`，这样响应才能暴露浏览器 `ReadableStream`。
   */
  adapter: /**
   * - **EN:** Force axios to use the fetch adapter.
   * - **CN:** 强制 axios 使用 fetch adapter。
   */
  'fetch';
  /**
   * - **EN:** Injected axios instance.
   * - **CN:** 注入的 axios 实例。
   */
  instance: AxiosInstance;
  /**
   * - **EN:** Extra axios config merged after the downloader's required fields.
   * - **CN:** 在下载器必需字段之外额外合并的 axios 配置。
   */
  config?: Omit<
    AxiosRequestConfig<unknown>,
    'adapter' | 'data' | 'headers' | 'method' | 'responseType' | 'signal' | 'url'
  >;
}

/**
 * - **EN:** Shared request fields for all download transports.
 * - **CN:** 所有下载传输方式共享的请求字段。
 */
export interface StreamDownloadBaseRequest {
  /**
   * - **EN:** Remote URL to stream from.
   * - **CN:** 需要被流式下载的远端 URL。
   */
  url: string;
  /**
   * - **EN:** Optional explicit file name override.
   * - **CN:** 可选的显式文件名覆盖。
   */
  fileName?: string;
  /**
   * - **EN:** Requested save strategy.
   * - **CN:** 文件保存方式。
   */
  saveStrategy?: StreamDownloadSaveStrategy;
}

/**
 * - **EN:** Request shape for the native `fetch` transport.
 * - **CN:** 原生 `fetch` 传输方式对应的请求结构。
 */
export interface FetchStreamDownloadRequest extends StreamDownloadBaseRequest {
  /**
   * - **EN:** Optional discriminant for the fetch branch.
   * - **CN:** fetch 分支的可选判别字段。
   */
  transport?: /**
   * - **EN:** Explicitly choose the native fetch path.
   * - **CN:** 显式选择原生 fetch 路径。
   */
  'fetch';
  /**
   * - **EN:** HTTP method used by fetch.
   * - **CN:** fetch 使用的 HTTP 方法。
   */
  method?: string;
  /**
   * - **EN:** Request headers passed to fetch.
   * - **CN:** 传给 fetch 的请求头。
   */
  headers?: Record<string, string>;
  /**
   * - **EN:** Request body passed to fetch.
   * - **CN:** 传给 fetch 的请求体。
   */
  body?: BodyInit | null;
  /**
   * - **EN:** Credential mode passed to fetch.
   * - **CN:** 传给 fetch 的凭据模式。
   */
  credentials?: RequestCredentials;
  /**
   * - **EN:** Additional fetch init fields merged by the downloader.
   * - **CN:** 由下载器合并的额外 fetch init 字段。
   */
  init?: Omit<RequestInit, 'body' | 'credentials' | 'headers' | 'method' | 'signal'>;
}

/**
 * - **EN:** Request shape for an injected axios instance using the fetch adapter.
 * - **CN:** 使用 fetch adapter 的外部 axios 实例对应的请求结构。
 */
export interface AxiosStreamDownloadRequest extends StreamDownloadBaseRequest {
  /**
   * - **EN:** Discriminant for the axios branch.
   * - **CN:** axios 分支的判别字段。
   */
  transport: /**
   * - **EN:** Explicitly choose the injected axios path.
   * - **CN:** 显式选择注入的 axios 路径。
   */
  'axios';
  /**
   * - **EN:** HTTP method used by axios.
   * - **CN:** axios 使用的 HTTP 方法。
   */
  method?: string;
  /**
   * - **EN:** Request headers passed to axios.
   * - **CN:** 传给 axios 的请求头。
   */
  headers?: Record<string, string>;
  /**
   * - **EN:** Request payload passed to axios.
   * - **CN:** 传给 axios 的请求数据。
   */
  data?: unknown;
  /**
   * - **EN:** Axios-only transport options.
   * - **CN:** axios 专属的传输选项。
   */
  axios: StreamDownloadAxiosOptions;
}

/**
 * - **EN:** Public request union accepted by `start()` and `defaultRequest`.
 * - **CN:** `start()` 与 `defaultRequest` 接受的公开请求联合类型。
 */
export type StreamDownloadRequest = FetchStreamDownloadRequest | AxiosStreamDownloadRequest;

/**
 * - **EN:** Successful terminal result returned by `start()`.
 * - **CN:** `start()` 成功完成时返回的终态结果。
 */
export interface StreamDownloadSuccessResult {
  /**
   * - **EN:** Successful terminal status literal.
   * - **CN:** 成功终态状态字面量。
   */
  status: /**
   * - **EN:** The task completed successfully.
   * - **CN:** 任务已成功完成。
   */
  'success';
  /**
   * - **EN:** Final file name used for saving.
   * - **CN:** 最终用于保存的文件名。
   */
  fileName: string;
  /**
   * - **EN:** Total bytes written into the destination.
   * - **CN:** 实际写入目标的总字节数。
   */
  loadedBytes: number;
  /**
   * - **EN:** Total bytes reported by the remote response, when available.
   * - **CN:** 远端响应报告的总字节数；如果可用则返回。
   */
  totalBytes?: number;
  /**
   * - **EN:** Transport that produced the successful result.
   * - **CN:** 产出成功结果的传输方式。
   */
  transport: StreamDownloadTransport;
  /**
   * - **EN:** Concrete save strategy selected at runtime.
   * - **CN:** 运行时选定的具体保存策略。
   */
  saveStrategy: /**
   * - **EN:** Saved through the File System Access API.
   * - **CN:** 通过 File System Access API 保存。
   */
  | 'file-system-access'
    /**
     * - **EN:** Saved through StreamSaver.
     * - **CN:** 通过 StreamSaver 保存。
     */
    | 'stream-saver';
}

/**
 * - **EN:** Constructor options for `StreamDownloader`.
 * - **CN:** `StreamDownloader` 的构造参数。
 */
export interface StreamDownloaderInit {
  /**
   * - **EN:** Optional default request fragment merged into every `start(request)` call.
   * - **CN:** 可选的默认请求片段，会被合并进每次 `start(request)` 调用。
   */
  defaultRequest?: Partial<StreamDownloadRequest>;
  /**
   * - **EN:** Minimum interval between progress snapshot emissions, in milliseconds.
   * - **CN:** 两次进度快照派发之间的最小间隔，单位毫秒。
   */
  progressThrottleMs?: number;
}

/**
 * - **EN:** Listener invoked whenever the public snapshot changes.
 * - **CN:** 每次公开快照变化时触发的监听器。
 *
 * @param snapshot - latest immutable downloader snapshot | 最新的只读下载器快照
 */
export type StreamDownloadListener = (snapshot: Readonly<StreamDownloadSnapshot>) => void;

/**
 * - **EN:** Minimal writable-stream writer contract consumed internally by the downloader.
 * - **CN:** 下载器内部消费的最小可写流 writer 契约。
 */
export interface WritableChunkWriter {
  /**
   * - **EN:** Write one binary chunk into the destination stream.
   * - **CN:** 向目标流写入一个二进制分片。
   *
   * @param chunk - binary chunk to write | 要写入的二进制分片
   */
  write: (chunk: Uint8Array) => Promise<unknown> | unknown;
  /**
   * - **EN:** Finalize the destination stream.
   * - **CN:** 结束目标流写入。
   */
  close: () => Promise<unknown> | unknown;
  /**
   * - **EN:** Abort the destination stream when the task fails or is cancelled.
   * - **CN:** 当任务失败或取消时中止目标流。
   *
   * @param reason - abort reason forwarded to the destination writer | 透传给目标 writer 的中止原因
   */
  abort?: (reason?: unknown) => Promise<unknown> | unknown;
  /**
   * - **EN:** Optional release hook for writers that expose lock semantics.
   * - **CN:** 对外暴露锁语义的 writer 的可选释放方法。
   */
  releaseLock?: () => void;
}

/**
 * - **EN:** Minimal save-handle contract used for File System Access integration.
 * - **CN:** File System Access 集成所需的最小保存句柄契约。
 */
export interface SaveHandleLike {
  /**
   * - **EN:** Create a writable target from the selected save handle.
   * - **CN:** 从所选保存句柄创建可写目标。
   */
  createWritable: () => Promise<unknown>;
}

/**
 * - **EN:** Minimal picker options forwarded into `showSaveFilePicker`.
 * - **CN:** 透传给 `showSaveFilePicker` 的最小参数结构。
 */
export interface SaveFilePickerOptionsLike {
  /**
   * - **EN:** Suggested file name shown by the browser picker.
   * - **CN:** 浏览器保存选择器中展示的建议文件名。
   */
  suggestedName?: string;
}

/**
 * - **EN:** Normalized read-side download context derived from the chosen transport.
 * - **CN:** 从所选传输方式归一化得到的读端下载上下文。
 */
export interface NormalizedDownloadContext {
  /**
   * - **EN:** Final file name derived for the download.
   * - **CN:** 为本次下载推导出的最终文件名。
   */
  fileName: string;
  /**
   * - **EN:** Browser readable stream that yields binary chunks.
   * - **CN:** 产出二进制分片的浏览器可读流。
   */
  stream: ReadableStream<Uint8Array>;
  /**
   * - **EN:** Parsed `Content-Length`, when available.
   * - **CN:** 解析出的 `Content-Length`；如果可用则返回。
   */
  totalBytes?: number;
  /**
   * - **EN:** Transport that produced this normalized context.
   * - **CN:** 产出该归一化上下文的传输方式。
   */
  transport: StreamDownloadTransport;
}

/**
 * - **EN:** Minimal `showSaveFilePicker` signature used by the downloader.
 * - **CN:** 下载器内部使用的最小 `showSaveFilePicker` 方法签名。
 *
 * @param options - picker options such as the suggested file name | 选择器参数，例如建议文件名
 */
export type SaveFilePickerFn = (options?: SaveFilePickerOptionsLike) => Promise<SaveHandleLike>;
