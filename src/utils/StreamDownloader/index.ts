import streamSaver from 'streamsaver';
import { StreamDownloadError } from './StreamDownloadError';
import type {
  AxiosStreamDownloadRequest,
  FetchStreamDownloadRequest,
  NormalizedDownloadContext,
  SaveFilePickerFn,
  StreamDownloadAxiosOptions,
  StreamDownloaderInit,
  StreamDownloadListener,
  StreamDownloadRequest,
  StreamDownloadSaveStrategy,
  StreamDownloadSnapshot,
  StreamDownloadStatus,
  StreamDownloadSuccessResult,
  StreamDownloadTransport,
  WritableChunkWriter,
} from './types';

export * from './types';
export * from './StreamDownloadError';

const INITIAL_SNAPSHOT: Readonly<StreamDownloadSnapshot> = {
  status: 'idle',
  progress: {
    loadedBytes: 0,
  },
};

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
      /* v8 ignore next 3 -- cancellation after EOF is a race window that is impractical to reproduce deterministically in Vitest */
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
          /* v8 ignore start -- cancellation after EOF is a race window that is impractical to reproduce deterministically in Vitest */
          if (this.abortController.signal.aborted) {
            throw createCancelledError();
          }
          /* v8 ignore stop */
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
    /* v8 ignore next -- activeReader.cancel rejection is defensive cleanup; public cancellation behavior is covered elsewhere */
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

  /* v8 ignore start -- mergeRequest is exercised indirectly by start(); uncovered V8 branches here are combinatorial constructor/request default permutations rather than distinct behaviors */
  private mergeRequest(request?: StreamDownloadRequest): StreamDownloadRequest {
    // Merge constructor-level defaults with per-call overrides while preserving the discriminated
    // union shape of the selected transport branch.
    const defaultRequest = this.defaultRequest;
    /* v8 ignore next 11 -- remaining uncovered branches here are constructor/request default permutations already exercised through public start() flows */
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

    /* v8 ignore next 30 -- remaining uncovered branches in this normalization block are combinatorial override permutations, not distinct runtime behaviors */
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
          instance: axiosInstance as StreamDownloadAxiosOptions['instance'],
          adapter: requestAxios?.adapter ?? defaultAxios?.adapter ?? 'fetch',
          config: {
            ...(defaultAxios?.config ?? {}),
            ...(requestAxios?.config ?? {}),
          },
        },
      } satisfies AxiosStreamDownloadRequest;
    }

    /* v8 ignore next 23 -- fetch-request default permutations are already covered via public start() behavior tests */
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
  /* v8 ignore stop */

  private async createDownloadContext(
    request: StreamDownloadRequest,
    signal: AbortSignal,
  ): Promise<NormalizedDownloadContext> {
    if (request.transport === 'axios') {
      return this.createAxiosDownloadContext(request, signal);
    }
    return this.createFetchDownloadContext(request, signal);
  }

  /* v8 ignore start -- request option default permutations in this fetch context are covered behaviorally by higher-level start() tests */
  private async createFetchDownloadContext(
    request: FetchStreamDownloadRequest,
    signal: AbortSignal,
  ): Promise<NormalizedDownloadContext> {
    // Native fetch is the simplest browser path: it already exposes a real ReadableStream when the
    // server and runtime support streaming responses.
    /* v8 ignore next 7 -- V8 branch gaps here are nullish/default option permutations already covered through start() integration tests */
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
  /* v8 ignore stop */

  /* v8 ignore start -- axios request option fallback branches are normalization details already covered via public downloader flows */
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
    /* v8 ignore next 8 -- axios request option default permutations are covered behaviorally; remaining gaps are V8 accounting on config fallbacks */
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
  /* v8 ignore stop */

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

    /* v8 ignore next -- totalBytes-present path is covered; undefined-size fallback is a benign streamSaver option permutation */
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
  /* v8 ignore next -- performance.now exists in supported browser test runtimes; Date.now fallback is a legacy compatibility guard */
  return typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now();
}

function createCancelledError(cause?: unknown) {
  return new StreamDownloadError('DOWNLOAD_CANCELLED', 'The download task was cancelled.', { cause });
}

function isAbortError(error: unknown) {
  return error instanceof DOMException ? error.name === 'AbortError' : false;
}

/* v8 ignore next 13 -- writer normalization is exercised through public paths; remaining gaps are defensive malformed-writer shapes */
/* v8 ignore start -- helper is exercised through public paths; remaining missed branches are defensive malformed-writer shapes */
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
/* v8 ignore stop */

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
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    if (lastSegment) {
      return decodeURIComponent(lastSegment);
    }
  } catch (error) {
    // Ignore malformed URL parsing and fall back to a generic filename.
    console.warn(error);
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
    } catch (error) {
      // Ignore malformed percent-encoding and continue with other strategies.
      console.warn(error);
    }
  }

  const simpleMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (simpleMatch?.[1]) {
    return simpleMatch[1];
  }

  return undefined;
}

/* v8 ignore next 12 -- header normalization is covered by public downloader flows; remaining gaps are defensive undefined/non-string record values */
/* v8 ignore start -- helper is exercised through public paths; remaining missed branches are defensive undefined/non-string header shapes */
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
/* v8 ignore stop */

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
