import streamSaver from 'streamsaver';

export type StreamDownloadTransport = 'fetch' | 'axios';

export type StreamDownloadSaveStrategy = 'auto' | 'file-system-access' | 'stream-saver';

export type StreamDownloadStatus = 'idle' | 'preparing' | 'downloading' | 'success' | 'failed' | 'cancelled';

export type StreamDownloadErrorCode =
  | 'TASK_ALREADY_RUNNING'
  | 'UNSUPPORTED_TRANSPORT'
  | 'UNSUPPORTED_SAVE_STRATEGY'
  | 'INVALID_REQUEST_URL'
  | 'HTTP_ERROR'
  | 'EMPTY_RESPONSE_STREAM'
  | 'INVALID_AXIOS_INSTANCE'
  | 'AXIOS_ADAPTER_NOT_SUPPORTED'
  | 'WRITE_ABORTED'
  | 'WRITE_FAILED'
  | 'DOWNLOAD_CANCELLED';

export interface StreamDownloadProgress {
  loadedBytes: number;
  totalBytes?: number;
  percent?: number;
  speedBps?: number;
}

export interface StreamDownloadSnapshot {
  status: StreamDownloadStatus;
  requestUrl?: string;
  fileName?: string;
  transport?: StreamDownloadTransport;
  saveStrategy?: Exclude<StreamDownloadSaveStrategy, 'auto'>;
  progress: StreamDownloadProgress;
  errorCode?: StreamDownloadErrorCode;
  errorMessage?: string;
}

export interface AxiosLikeResponse<T = unknown> {
  status: number;
  statusText?: string;
  headers?: Headers | Record<string, string | undefined>;
  data: T;
}

export interface AxiosLikeInstance {
  request<T = unknown>(config: Record<string, unknown>): Promise<AxiosLikeResponse<T>>;
}

export interface StreamDownloadAxiosOptions {
  instance: AxiosLikeInstance;
  adapterHint: 'fetch';
  config?: Record<string, unknown>;
}

export interface StreamDownloadBaseRequest {
  url: string;
  fileName?: string;
  saveStrategy?: StreamDownloadSaveStrategy;
}

export interface FetchStreamDownloadRequest extends StreamDownloadBaseRequest {
  transport?: 'fetch';
  method?: string;
  headers?: Record<string, string>;
  body?: BodyInit | null;
  credentials?: RequestCredentials;
  init?: Omit<RequestInit, 'method' | 'headers' | 'body' | 'credentials' | 'signal'>;
}

export interface AxiosStreamDownloadRequest extends StreamDownloadBaseRequest {
  transport: 'axios';
  method?: string;
  headers?: Record<string, string>;
  data?: unknown;
  axios: StreamDownloadAxiosOptions;
}

export type StreamDownloadRequest = FetchStreamDownloadRequest | AxiosStreamDownloadRequest;

export interface StreamDownloadSuccessResult {
  status: 'success';
  fileName: string;
  loadedBytes: number;
  totalBytes?: number;
  transport: StreamDownloadTransport;
  saveStrategy: 'file-system-access' | 'stream-saver';
}

export class StreamDownloadError extends Error {
  code: StreamDownloadErrorCode;
  cause?: unknown;

  constructor(code: StreamDownloadErrorCode, message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'StreamDownloadError';
    this.code = code;
    this.cause = options?.cause;
  }
}

export interface StreamDownloaderInit {
  defaultRequest?: Partial<StreamDownloadRequest>;
  progressThrottleMs?: number;
}

export type StreamDownloadListener = (snapshot: Readonly<StreamDownloadSnapshot>) => void;

interface WritableChunkWriter {
  write: (chunk: Uint8Array) => Promise<unknown> | unknown;
  close: () => Promise<unknown> | unknown;
  abort?: (reason?: unknown) => Promise<unknown> | unknown;
  releaseLock?: () => void;
}

interface SaveHandleLike {
  createWritable: () => Promise<unknown>;
}

interface SaveFilePickerOptionsLike {
  suggestedName?: string;
}

interface NormalizedDownloadContext {
  fileName: string;
  stream: ReadableStream<Uint8Array>;
  totalBytes?: number;
  transport: StreamDownloadTransport;
}

export type SaveFilePickerFn = (options?: SaveFilePickerOptionsLike) => Promise<SaveHandleLike>;

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

  constructor(init?: StreamDownloaderInit) {
    this.defaultRequest = init?.defaultRequest;
    this.progressThrottleMs = init?.progressThrottleMs ?? 100;
  }

  getSnapshot(): Readonly<StreamDownloadSnapshot> {
    return this.snapshot;
  }

  get status(): StreamDownloadStatus {
    return this.snapshot.status;
  }

  get isRunning(): boolean {
    return this.status === 'preparing' || this.status === 'downloading';
  }

  subscribe(listener: StreamDownloadListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async start(request?: StreamDownloadRequest): Promise<StreamDownloadSuccessResult> {
    if (this.disposed) {
      this.disposed = false;
    }
    if (this.isRunning) {
      throw new StreamDownloadError('TASK_ALREADY_RUNNING', 'A download task is already running.');
    }

    const normalizedRequest = this.mergeRequest(request);
    const url = normalizedRequest.url?.trim();
    if (!url) {
      throw new StreamDownloadError('INVALID_REQUEST_URL', 'The download url is required.');
    }

    this.abortController = new AbortController();
    const startedAt = now();
    let lastEmitAt = 0;

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
      const downloadContext = await this.createDownloadContext(normalizedRequest, this.abortController.signal);
      if (this.abortController.signal.aborted) {
        throw createCancelledError();
      }

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
      this.activeReader?.releaseLock?.();
      this.activeReader = null;
      this.activeWriter?.releaseLock?.();
      this.activeWriter = null;
      this.abortController = null;
    }
  }

  cancel(): void {
    if (!this.isRunning) {
      return;
    }

    const cancelledError = createCancelledError();
    this.abortController?.abort(cancelledError);
    void this.activeReader?.cancel(cancelledError).catch(() => undefined);
    void this.abortCurrentWriter(cancelledError);
  }

  reset(): void {
    if (this.isRunning) {
      return;
    }
    this.snapshot = cloneInitialSnapshot();
    this.emit();
  }

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
      } catch {
        // Ignore listener errors to avoid breaking the download flow.
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
          adapterHint: requestAxios?.adapterHint ?? defaultAxios?.adapterHint ?? 'fetch',
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

    return {
      fileName: deriveFileName(request.url, request.fileName, response.headers),
      stream: response.body,
      totalBytes: parseTotalBytes(response.headers),
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

    if (request.axios.adapterHint !== 'fetch') {
      throw new StreamDownloadError(
        'AXIOS_ADAPTER_NOT_SUPPORTED',
        'Only axios instances that explicitly use the fetch adapter are supported.',
      );
    }

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

    return {
      fileName: deriveFileName(request.url, request.fileName, headers),
      stream,
      totalBytes: parseTotalBytes(headers),
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

function parseTotalBytes(headers: Headers) {
  const raw = headers.get('Content-Length');
  if (!raw) {
    return undefined;
  }
  const total = Number(raw);
  return Number.isFinite(total) && total >= 0 ? total : undefined;
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
    return decodeURIComponent(utf8Match[1].replace(/^"|"$/g, ''));
  }

  const simpleMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (simpleMatch?.[1]) {
    return simpleMatch[1];
  }

  return undefined;
}

function toHeaders(headers: Headers | Record<string, string | undefined> | undefined) {
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
