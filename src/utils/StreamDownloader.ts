import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import streamSaver from 'streamsaver';

const INITIAL_SNAPSHOT: Readonly<StreamDownloadSnapshot> = {
  status: 'idle',
  progress: {
    loadedBytes: 0,
  },
};

/**
 * - **EN:** Structured error type used by `StreamDownloader`.
 * - **CN:** `StreamDownloader` 使用的结构化错误类型。
 */
export class StreamDownloadError extends Error {
  /**
   * - **EN:** Stable machine-readable error code.
   * - **CN:** 稳定的机器可读错误码。
   */
  code: StreamDownloadErrorCode;

  /**
   * - **EN:** Optional root cause preserved for debugging.
   * - **CN:** 为调试保留的可选根因对象。
   */
  cause?: unknown;

  /**
   * - **EN:** Create a structured stream-download error.
   * - **CN:** 创建结构化的流式下载错误。
   *
   * @param code - machine-readable error code | 机器可读错误码
   * @param message - human-readable error message | 面向人的错误消息
   * @param options - optional extension fields such as the original cause | 可选扩展字段，例如原始 cause
   */
  constructor(code: StreamDownloadErrorCode, message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'StreamDownloadError';
    this.code = code;
    this.cause = options?.cause;
  }
}

/**
 * - **EN:** Browser-side streaming downloader for large files.
 * - **CN:** 浏览器端大文件流式下载器。
 */
export default class StreamDownloader {
  private readonly defaultRequest?: Partial<StreamDownloadRequest>;
  private readonly progressThrottleMs: number;
  private readonly listeners = new Set<StreamDownloadListener>();
  private snapshot: StreamDownloadSnapshot = cloneInitialSnapshot();
  private abortController: AbortController | null = null;
  private activeReader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private activeWriter: WritableChunkWriter | null = null;
  private disposed = false;

  /**
   * - **EN:** Create a downloader instance with optional defaults and progress throttling.
   * - **CN:** 使用可选默认请求与进度节流配置创建下载器实例。
   *
   * @param init - constructor options such as defaultRequest and progressThrottleMs | 构造参数，例如
   *   defaultRequest 与 progressThrottleMs
   */
  constructor(init?: StreamDownloaderInit) {
    this.defaultRequest = init?.defaultRequest;
    this.progressThrottleMs = init?.progressThrottleMs ?? 100;
  }

  /**
   * - **EN:** Return the latest immutable downloader snapshot.
   * - **CN:** 返回当前最新的只读下载器快照。
   */
  getSnapshot(): Readonly<StreamDownloadSnapshot> {
    return this.snapshot;
  }

  /**
   * - **EN:** Read the current task status without cloning the full snapshot.
   * - **CN:** 在不复制完整快照的情况下读取当前任务状态。
   */
  get status(): StreamDownloadStatus {
    return this.snapshot.status;
  }

  /**
   * - **EN:** Whether the downloader currently has an active task.
   * - **CN:** 当前下载器是否存在活动中的任务。
   */
  get isRunning(): boolean {
    return this.status === 'preparing' || this.status === 'downloading';
  }

  /**
   * - **EN:** Subscribe to snapshot changes and receive an unsubscribe function.
   * - **CN:** 订阅快照变化，并返回一个取消订阅函数。
   *
   * @param listener - callback invoked whenever the public snapshot changes | 每次公开快照变化时触发的回调
   */
  subscribe(listener: StreamDownloadListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * - **EN:** Start a streaming download task. Rejects with `DOWNLOAD_CANCELLED` when the task is
   *   cancelled.
   * - **CN:** 启动一个流式下载任务；如果任务被取消，则以 `DOWNLOAD_CANCELLED` 拒绝。
   *
   * @param request - per-call request options that override constructor defaults |
   *   单次调用的请求参数，会覆盖构造阶段的默认值
   */
  async start(request?: StreamDownloadRequest): Promise<StreamDownloadSuccessResult> {
    if (this.disposed) {
      this.disposed = false;
    }
    if (this.isRunning) {
      throw new StreamDownloadError('TASK_ALREADY_RUNNING', 'A download task is already running.');
    }

    // Resolve constructor defaults and per-call overrides into one normalized request before
    // touching network or file-system APIs.
    const normalizedRequest = this.mergeRequest(request);
    const url = normalizedRequest.url?.trim();
    if (!url) {
      throw new StreamDownloadError('INVALID_REQUEST_URL', 'The download url is required.');
    }

    this.abortController = new AbortController();
    const startedAt = now();
    let lastEmitAt = 0;

    // Publish a preparing snapshot first so consumers can immediately reflect that the task has
    // been accepted even before the response stream and writable target are ready.
    this.setSnapshot({
      status: 'preparing',
      requestUrl: url,
      fileName: normalizedRequest.fileName,
      transport: normalizedRequest.transport === 'axios' ? 'axios' : 'fetch',
      saveStrategy: undefined,
      progress: {
        loadedBytes: 0,
      },
      errorCode: undefined,
      errorMessage: undefined,
    });

    try {
      // Build the read-side context first: validate transport, open the remote response, derive the
      // file name, and determine whether progress percentage can be computed.
      const downloadContext = await this.createDownloadContext(normalizedRequest, this.abortController.signal);
      if (this.abortController.signal.aborted) {
        throw createCancelledError();
      }

      // Only after the remote stream is confirmed do we ask the browser for a writable destination,
      // which may show a save-file prompt or create a StreamSaver-backed sink.
      const writable = await this.openWritable(
        downloadContext.fileName,
        normalizedRequest.saveStrategy,
        downloadContext.totalBytes,
      );
      if (this.abortController.signal.aborted) {
        throw createCancelledError();
      }

      this.activeWriter = writable.writer;
      this.setSnapshot({
        status: 'downloading',
        requestUrl: url,
        fileName: downloadContext.fileName,
        transport: downloadContext.transport,
        saveStrategy: writable.saveStrategy,
        progress: {
          loadedBytes: 0,
          totalBytes: downloadContext.totalBytes,
          percent: downloadContext.totalBytes != null ? 0 : undefined,
          speedBps: 0,
        },
        errorCode: undefined,
        errorMessage: undefined,
      });

      this.activeReader = downloadContext.stream.getReader();
      let loadedBytes = 0;

      // Pull chunks from the remote readable stream and immediately forward them into the selected
      // writable target. This keeps memory usage bounded and preserves the streaming-only contract.
      for (;;) {
        if (this.abortController.signal.aborted) {
          throw createCancelledError();
        }
        const { done, value } = await this.activeReader.read();
        if (done) {
          if (this.abortController.signal.aborted) {
            throw createCancelledError();
          }
          break;
        }
        if (!value || value.byteLength === 0) {
          continue;
        }

        await this.activeWriter.write(value);
        loadedBytes += value.byteLength;

        const currentTs = now();
        if (currentTs - lastEmitAt >= this.progressThrottleMs) {
          lastEmitAt = currentTs;
          this.updateProgress(loadedBytes, downloadContext.totalBytes, startedAt);
        }
      }

      await this.activeWriter.close();
      this.updateProgress(loadedBytes, downloadContext.totalBytes, startedAt, true);

      // Persist the final terminal result separately from the snapshot so callers can await a
      // compact success payload while UI subscribers continue to rely on the reactive snapshot.
      const result: StreamDownloadSuccessResult = {
        status: 'success',
        fileName: downloadContext.fileName,
        loadedBytes,
        totalBytes: downloadContext.totalBytes,
        transport: downloadContext.transport,
        saveStrategy: writable.saveStrategy,
      };

      this.setSnapshot({
        status: 'success',
        requestUrl: url,
        fileName: downloadContext.fileName,
        transport: downloadContext.transport,
        saveStrategy: writable.saveStrategy,
        progress: {
          ...this.snapshot.progress,
          loadedBytes,
          totalBytes: downloadContext.totalBytes,
          percent: downloadContext.totalBytes != null ? 100 : this.snapshot.progress.percent,
          speedBps: this.snapshot.progress.speedBps,
        },
        errorCode: undefined,
        errorMessage: undefined,
      });

      return result;
    } catch (error) {
      const normalizedError = this.normalizeError(error);
      if (normalizedError.code === 'DOWNLOAD_CANCELLED') {
        this.setSnapshot({
          ...this.snapshot,
          status: 'cancelled',
          errorCode: normalizedError.code,
          errorMessage: normalizedError.message,
        });
      } else {
        this.setSnapshot({
          ...this.snapshot,
          status: 'failed',
          errorCode: normalizedError.code,
          errorMessage: normalizedError.message,
        });
      }
      await this.abortCurrentWriter(normalizedError);
      throw normalizedError;
    } finally {
      // Always release stream locks and the abort controller reference so the instance can be safely
      // reused by the next task.
      this.activeReader?.releaseLock?.();
      this.activeReader = null;
      this.activeWriter?.releaseLock?.();
      this.activeWriter = null;
      this.abortController = null;
    }
  }

  /**
   * - **EN:** Cancel the active task if one is running.
   * - **CN:** 如果当前存在活动任务，则取消该任务。
   */
  cancel(): void {
    if (!this.isRunning) {
      return;
    }

    const cancelledError = createCancelledError();
    this.abortController?.abort(cancelledError);
    void this.activeReader?.cancel(cancelledError).catch(() => undefined);
    void this.abortCurrentWriter(cancelledError);
  }

  /**
   * - **EN:** Reset a terminal snapshot back to the initial idle state.
   * - **CN:** 将终态快照重置回初始 idle 状态。
   */
  reset(): void {
    if (this.isRunning) {
      return;
    }
    this.snapshot = cloneInitialSnapshot();
    this.emit();
  }

  /**
   * - **EN:** Dispose the downloader, cancel any active task, and clear listeners.
   * - **CN:** 释放下载器，取消活动任务，并清空监听器。
   */
  dispose(): void {
    this.disposed = true;
    this.cancel();
    this.listeners.clear();
    this.snapshot = cloneInitialSnapshot();
  }

  private emit() {
    const currentSnapshot = this.snapshot;
    this.listeners.forEach((listener) => {
      try {
        listener(currentSnapshot);
      } catch (error) {
        // Ignore listener errors to avoid breaking the download flow.
        console.error(error);
      }
    });
  }

  private setSnapshot(snapshot: StreamDownloadSnapshot) {
    this.snapshot = snapshot;
    this.emit();
  }

  private updateProgress(loadedBytes: number, totalBytes: number | undefined, startedAt: number, force = false) {
    const elapsedMs = Math.max(now() - startedAt, 1);
    const speedBps = (loadedBytes / elapsedMs) * 1000;
    const percent =
      totalBytes != null && totalBytes > 0
        ? Math.min(100, Math.round((loadedBytes / totalBytes) * 10000) / 100)
        : undefined;

    if (!force && this.snapshot.progress.loadedBytes === loadedBytes) {
      return;
    }

    this.setSnapshot({
      ...this.snapshot,
      progress: {
        loadedBytes,
        totalBytes,
        percent,
        speedBps,
      },
    });
  }

  private mergeRequest(request?: StreamDownloadRequest): StreamDownloadRequest {
    // Merge constructor-level defaults with per-call overrides while preserving the discriminated
    // union shape of the selected transport branch.
    const defaultRequest = this.defaultRequest;
    const transport = request?.transport ?? defaultRequest?.transport ?? 'fetch';
    const base = {
      ...defaultRequest,
      ...request,
      headers: {
        ...defaultRequest?.headers,
        ...request?.headers,
      },
      fileName: request?.fileName ?? defaultRequest?.fileName,
      saveStrategy: request?.saveStrategy ?? defaultRequest?.saveStrategy ?? 'auto',
      url: request?.url ?? defaultRequest?.url ?? '',
    };

    if (transport === 'axios') {
      const defaultAxios = defaultRequest && 'axios' in defaultRequest ? defaultRequest.axios : undefined;
      const requestAxios = request && 'axios' in request ? request.axios : undefined;
      const axiosInstance = requestAxios?.instance ?? defaultAxios?.instance;

      return {
        transport: 'axios',
        url: base.url,
        fileName: base.fileName,
        saveStrategy: base.saveStrategy,
        method:
          (request && 'method' in request ? request.method : undefined) ??
          (defaultRequest && 'method' in defaultRequest ? defaultRequest.method : undefined) ??
          'GET',
        headers: base.headers,
        data:
          request && 'data' in request
            ? request.data
            : defaultRequest && 'data' in defaultRequest
              ? defaultRequest.data
              : undefined,
        axios: {
          instance: axiosInstance as AxiosLikeInstance,
          adapter: requestAxios?.adapter ?? defaultAxios?.adapter ?? 'fetch',
          config: {
            ...(defaultAxios?.config ?? {}),
            ...(requestAxios?.config ?? {}),
          },
        },
      } satisfies AxiosStreamDownloadRequest;
    }

    return {
      transport: 'fetch',
      url: base.url,
      fileName: base.fileName,
      saveStrategy: base.saveStrategy,
      method:
        (request && 'method' in request ? request.method : undefined) ??
        (defaultRequest && 'method' in defaultRequest ? defaultRequest.method : undefined) ??
        'GET',
      headers: base.headers,
      body:
        request && 'body' in request
          ? request.body
          : defaultRequest && 'body' in defaultRequest
            ? defaultRequest.body
            : undefined,
      credentials:
        (request && 'credentials' in request ? request.credentials : undefined) ??
        (defaultRequest && 'credentials' in defaultRequest ? defaultRequest.credentials : undefined),
      init: {
        ...((defaultRequest && 'init' in defaultRequest ? defaultRequest.init : undefined) ?? {}),
        ...((request && 'init' in request ? request.init : undefined) ?? {}),
      },
    } satisfies FetchStreamDownloadRequest;
  }

  private async createDownloadContext(
    request: StreamDownloadRequest,
    signal: AbortSignal,
  ): Promise<NormalizedDownloadContext> {
    if (request.transport === 'axios') {
      return this.createAxiosDownloadContext(request, signal);
    }
    return this.createFetchDownloadContext(request, signal);
  }

  private async createFetchDownloadContext(
    request: FetchStreamDownloadRequest,
    signal: AbortSignal,
  ): Promise<NormalizedDownloadContext> {
    // Native fetch is the simplest browser path: it already exposes a real ReadableStream when the
    // server and runtime support streaming responses.
    const response = await fetch(request.url, {
      ...(request.init ?? {}),
      method: request.method ?? (request.body != null ? 'POST' : 'GET'),
      headers: request.headers,
      body: request.body,
      credentials: request.credentials,
      signal,
    });

    if (!response.ok) {
      throw new StreamDownloadError('HTTP_ERROR', `Request failed with status ${response.status}.`);
    }

    if (!response.body) {
      throw new StreamDownloadError('EMPTY_RESPONSE_STREAM', 'Fetch response does not contain a readable stream.');
    }

    const totalBytes = parseTotalBytes(response.headers, {
      requestUrl: request.url,
      transport: 'fetch',
    });

    return {
      fileName: deriveFileName(request.url, request.fileName, response.headers),
      stream: response.body,
      totalBytes,
      transport: 'fetch',
    };
  }

  private async createAxiosDownloadContext(
    request: AxiosStreamDownloadRequest,
    signal: AbortSignal,
  ): Promise<NormalizedDownloadContext> {
    if (!request.axios?.instance || typeof request.axios.instance.request !== 'function') {
      throw new StreamDownloadError('INVALID_AXIOS_INSTANCE', 'A valid axios-like instance is required.');
    }

    if (request.axios.adapter !== 'fetch') {
      throw new StreamDownloadError(
        'AXIOS_ADAPTER_NOT_SUPPORTED',
        'Only axios instances that explicitly use the fetch adapter are supported.',
      );
    }

    // Axios is only accepted when the injected instance is explicitly configured to use the fetch
    // adapter, because XHR-based adapters do not provide the browser ReadableStream contract we need.
    const response = await request.axios.instance.request<unknown>({
      ...(request.axios.config ?? {}),
      url: request.url,
      method: request.method ?? (request.data != null ? 'POST' : 'GET'),
      headers: request.headers,
      data: request.data,
      signal,
      responseType: 'stream',
    });

    if (!response || typeof response.status !== 'number') {
      throw new StreamDownloadError(
        'INVALID_AXIOS_INSTANCE',
        'The axios instance returned an invalid response object.',
      );
    }

    if (response.status < 200 || response.status >= 300) {
      throw new StreamDownloadError('HTTP_ERROR', `Request failed with status ${response.status}.`);
    }

    const stream = extractReadableStreamFromUnknown(response.data);
    if (!stream) {
      throw new StreamDownloadError(
        'AXIOS_ADAPTER_NOT_SUPPORTED',
        'The axios response data is not a browser ReadableStream. Please use a fetch-adapter-backed instance.',
      );
    }

    const headers = toHeaders(response.headers);
    const totalBytes = parseTotalBytes(headers, {
      requestUrl: request.url,
      transport: 'axios',
    });

    return {
      fileName: deriveFileName(request.url, request.fileName, headers),
      stream,
      totalBytes,
      transport: 'axios',
    };
  }

  private async openWritable(
    fileName: string,
    requestedStrategy: StreamDownloadSaveStrategy | undefined,
    totalBytes?: number,
  ): Promise<{ saveStrategy: 'file-system-access' | 'stream-saver'; writer: WritableChunkWriter }> {
    const saveStrategy = this.resolveSaveStrategy(requestedStrategy);

    if (saveStrategy === 'file-system-access') {
      const picker = (globalThis as typeof globalThis & { showSaveFilePicker?: SaveFilePickerFn }).showSaveFilePicker;
      if (typeof picker !== 'function') {
        throw new StreamDownloadError(
          'UNSUPPORTED_SAVE_STRATEGY',
          'File System Access API is not available in the current environment.',
        );
      }
      const handle = await picker({ suggestedName: fileName });
      const writable = await handle.createWritable();
      return {
        saveStrategy,
        writer: toWritableChunkWriter(writable),
      };
    }

    if (!streamSaver || typeof streamSaver.createWriteStream !== 'function') {
      throw new StreamDownloadError(
        'UNSUPPORTED_SAVE_STRATEGY',
        'StreamSaver is not available in the current environment.',
      );
    }

    const writable = streamSaver.createWriteStream(fileName, totalBytes != null ? { size: totalBytes } : undefined);
    return {
      saveStrategy,
      writer: toWritableChunkWriter(writable),
    };
  }

  private resolveSaveStrategy(requestedStrategy: StreamDownloadSaveStrategy | undefined) {
    // Respect an explicit strategy first; only fall back to capability detection when the caller asks
    // for `auto`.
    if (requestedStrategy === 'file-system-access' || requestedStrategy === 'stream-saver') {
      return requestedStrategy;
    }

    const picker = (globalThis as typeof globalThis & { showSaveFilePicker?: SaveFilePickerFn }).showSaveFilePicker;
    if (typeof picker === 'function') {
      return 'file-system-access' as const;
    }

    if (streamSaver && typeof streamSaver.createWriteStream === 'function') {
      return 'stream-saver' as const;
    }

    throw new StreamDownloadError(
      'UNSUPPORTED_SAVE_STRATEGY',
      'No supported streaming save strategy is available in the current environment.',
    );
  }

  private async abortCurrentWriter(error: unknown) {
    if (this.activeWriter?.abort) {
      await Promise.resolve(this.activeWriter.abort(error)).catch(() => undefined);
    }
  }

  private normalizeError(error: unknown): StreamDownloadError {
    if (error instanceof StreamDownloadError) {
      return error;
    }

    if (this.abortController?.signal.aborted || isAbortError(error)) {
      return createCancelledError(error);
    }

    return new StreamDownloadError('WRITE_FAILED', 'Streaming download failed.', { cause: error });
  }
}

function cloneInitialSnapshot(): StreamDownloadSnapshot {
  return {
    status: INITIAL_SNAPSHOT.status,
    progress: {
      ...INITIAL_SNAPSHOT.progress,
    },
  };
}

function now() {
  return typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now();
}

function createCancelledError(cause?: unknown) {
  return new StreamDownloadError('DOWNLOAD_CANCELLED', 'The download task was cancelled.', { cause });
}

function isAbortError(error: unknown) {
  return error instanceof DOMException ? error.name === 'AbortError' : false;
}

function toWritableChunkWriter(writable: unknown): WritableChunkWriter {
  if (isObject(writable) && typeof writable.getWriter === 'function') {
    const writer = writable.getWriter() as unknown as WritableChunkWriter;
    if (typeof writer.write === 'function' && typeof writer.close === 'function') {
      return writer;
    }
  }

  if (isObject(writable) && typeof writable.write === 'function' && typeof writable.close === 'function') {
    return writable as unknown as WritableChunkWriter;
  }

  throw new StreamDownloadError('WRITE_FAILED', 'Unable to resolve a writable stream writer.');
}

function extractReadableStreamFromUnknown(data: unknown): ReadableStream<Uint8Array> | null {
  if (typeof ReadableStream !== 'undefined' && data instanceof ReadableStream) {
    return data as ReadableStream<Uint8Array>;
  }

  if (isObject(data) && isObject(data.body) && typeof data.body.getReader === 'function') {
    return data.body as unknown as ReadableStream<Uint8Array>;
  }

  if (isObject(data) && typeof data.getReader === 'function') {
    return data as unknown as ReadableStream<Uint8Array>;
  }

  return null;
}

function parseTotalBytes(headers: Headers, context: { requestUrl: string; transport: StreamDownloadTransport }) {
  const raw = headers.get('Content-Length');
  if (!raw) {
    console.warn(
      `[StreamDownloader] Missing Content-Length header for ${context.transport} request to ${context.requestUrl}; download percent cannot be calculated.`,
    );
    return undefined;
  }

  const total = Number(raw);
  if (!Number.isFinite(total) || total < 0) {
    console.warn(
      `[StreamDownloader] Invalid Content-Length header (${raw}) for ${context.transport} request to ${context.requestUrl}; download percent cannot be calculated.`,
    );
    return undefined;
  }

  return total;
}

function deriveFileName(url: string, explicitFileName: string | undefined, headers: Headers) {
  if (explicitFileName?.trim()) {
    return explicitFileName.trim();
  }

  const fromContentDisposition = parseFileNameFromContentDisposition(headers.get('Content-Disposition'));
  if (fromContentDisposition) {
    return fromContentDisposition;
  }

  try {
    const pathname = new URL(url, 'http://localhost').pathname;
    const lastSegment = pathname.split('/').filter(Boolean).at(-1);
    if (lastSegment) {
      return decodeURIComponent(lastSegment);
    }
  } catch {
    // Ignore malformed URL parsing and fall back to a generic filename.
  }

  return 'download';
}

function parseFileNameFromContentDisposition(contentDisposition: string | null) {
  if (!contentDisposition) {
    return undefined;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].replace(/^"|"$/g, ''));
    } catch {
      // Ignore malformed percent-encoding and continue with other strategies.
    }
  }

  const simpleMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (simpleMatch?.[1]) {
    return simpleMatch[1];
  }

  return undefined;
}

function toHeaders(headers: Headers | Record<string, unknown> | undefined) {
  if (headers instanceof Headers) {
    return headers;
  }

  const normalized = new Headers();
  Object.entries(headers ?? {}).forEach(([key, value]) => {
    if (typeof value === 'string') {
      normalized.set(key, value);
    }
  });
  return normalized;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

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
   * - **EN:** Auto-detect the best available streaming save strategy at runtime.
   * - **CN:** 运行时自动探测最合适的流式保存策略。
   */
  | 'auto'
  /**
   * - **EN:** Use the File System Access API.
   * - **CN:** 使用 File System Access API。
   */
  | 'file-system-access'
  /**
   * - **EN:** Use StreamSaver-backed writable streams.
   * - **CN:** 使用基于 StreamSaver 的可写流。
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
 * - **EN:** Response shape consumed from an injected axios instance, backed by official axios types.
 * - **CN:** 从注入的 axios 实例消费的响应结构，底层基于官方 axios 类型。
 */
export interface AxiosLikeResponse<T = unknown, D = unknown> {
  /**
   * - **EN:** HTTP status code returned by the remote endpoint.
   * - **CN:** 远端接口返回的 HTTP 状态码。
   */
  status: AxiosResponse<T, D>['status'];
  /**
   * - **EN:** Optional HTTP status text returned by axios.
   * - **CN:** axios 返回的可选 HTTP 状态文本。
   */
  statusText?: AxiosResponse<T, D>['statusText'];
  /**
   * - **EN:** Response headers returned by axios.
   * - **CN:** axios 返回的响应头。
   */
  headers?: AxiosResponse<T, D>['headers'];
  /**
   * - **EN:** Response payload that should expose a browser `ReadableStream` for streaming mode.
   * - **CN:** 响应数据；在流式模式下应暴露浏览器 `ReadableStream`。
   */
  data: AxiosResponse<T, D>['data'];
}

/**
 * - **EN:** Minimal axios request contract consumed by `StreamDownloader`, backed by official axios
 *   types.
 * - **CN:** `StreamDownloader` 消费的最小 axios 请求契约，底层基于官方 axios 类型。
 */
export interface AxiosLikeInstance {
  /**
   * - **EN:** Issue an axios request and return the normalized response shape used by the downloader.
   * - **CN:** 发起 axios 请求，并返回下载器使用的归一化响应结构。
   *
   * @param config - axios request config merged by the downloader | 由下载器组装后的 axios 请求配置
   */
  request<T = unknown, D = unknown>(config: AxiosRequestConfig<D>): Promise<AxiosLikeResponse<T, D>>;
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
  instance: AxiosLikeInstance;
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
   * - **CN:** 请求的保存策略。
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
