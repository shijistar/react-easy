import type { AxiosInstance } from 'axios';
import streamSaver from 'streamsaver';
import { describe, expect, it, vi } from 'vitest';
import StreamDownloader from '../../src/utils/StreamDownloader';

vi.mock('streamsaver', () => ({
  default: {
    createWriteStream: vi.fn(),
  },
}));

describe('StreamDownloader edge cases', () => {
  it('subscribes, unsubscribes, and ignores listener errors', () => {
    const downloader = new StreamDownloader();
    const goodListener = vi.fn();
    const badListener = vi.fn(() => {
      throw new Error('listener failed');
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const unsubscribeGood = downloader.subscribe(goodListener);
    downloader.subscribe(badListener);

    (downloader as unknown as { setSnapshot: (snapshot: unknown) => void }).setSnapshot({
      status: 'preparing',
      progress: { loadedBytes: 1 },
    });

    expect(goodListener).toHaveBeenCalledTimes(1);
    expect(badListener).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalled();

    unsubscribeGood();
    (downloader as unknown as { setSnapshot: (snapshot: unknown) => void }).setSnapshot({
      status: 'success',
      progress: { loadedBytes: 2 },
    });

    expect(goodListener).toHaveBeenCalledTimes(1);
    expect(badListener).toHaveBeenCalledTimes(2);
  });

  it('rejects invalid request URLs and already-running tasks', async () => {
    const downloader = new StreamDownloader();
    await expect(downloader.start({ url: '   ' })).rejects.toMatchObject({ code: 'INVALID_REQUEST_URL' });

    (downloader as unknown as { snapshot: { status: string; progress: { loadedBytes: number } } }).snapshot = {
      status: 'downloading',
      progress: { loadedBytes: 0 },
    };

    await expect(downloader.start({ url: 'https://example.com/file.bin' })).rejects.toMatchObject({
      code: 'TASK_ALREADY_RUNNING',
    });
  });

  it('rejects fetch HTTP errors and empty response bodies', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 500 })),
    );
    const downloader = new StreamDownloader();
    await expect(downloader.start({ url: 'https://example.com/error.bin' })).rejects.toMatchObject({
      code: 'HTTP_ERROR',
    });

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, status: 200, body: null, headers: new Headers() }) as Response),
    );

    await expect(downloader.start({ url: 'https://example.com/empty.bin' })).rejects.toMatchObject({
      code: 'EMPTY_RESPONSE_STREAM',
    });
  });

  it('validates axios instance, adapter, and response shape', async () => {
    const downloader = new StreamDownloader();

    await expect(
      downloader.start({
        transport: 'axios',
        url: 'https://example.com/demo.txt',
        axios: { instance: undefined as unknown as AxiosInstance, adapter: 'fetch' },
      }),
    ).rejects.toMatchObject({ code: 'INVALID_AXIOS_INSTANCE' });

    await expect(
      downloader.start({
        transport: 'axios',
        url: 'https://example.com/demo.txt',
        axios: { instance: { request: vi.fn() } as unknown as AxiosInstance, adapter: 'xhr' as never },
      }),
    ).rejects.toMatchObject({ code: 'AXIOS_ADAPTER_NOT_SUPPORTED' });

    await expect(
      downloader.start({
        transport: 'axios',
        url: 'https://example.com/demo.txt',
        axios: {
          instance: { request: vi.fn(async () => ({})) } as unknown as AxiosInstance,
          adapter: 'fetch',
        },
      }),
    ).rejects.toMatchObject({ code: 'INVALID_AXIOS_INSTANCE' });

    await expect(
      downloader.start({
        transport: 'axios',
        url: 'https://example.com/demo.txt',
        axios: {
          instance: {
            request: vi.fn(async () => ({ status: 404, data: createByteStream(['fail']) })),
          } as unknown as AxiosInstance,
          adapter: 'fetch',
        },
      }),
    ).rejects.toMatchObject({ code: 'HTTP_ERROR' });
  });

  it('accepts axios body streams, preserves Headers instances, and trims explicit file names', async () => {
    const writer = {
      write: vi.fn(async (_chunk?: Uint8Array) => undefined),
      close: vi.fn(async () => undefined),
      abort: vi.fn(async () => undefined),
    };
    const createWritable = vi.fn(async () => writer);

    vi.stubGlobal(
      'showSaveFilePicker',
      vi.fn(async () => ({ createWritable })),
    );

    const downloader = new StreamDownloader();
    const result = await downloader.start({
      transport: 'axios',
      url: 'https://example.com/download/source.bin',
      fileName: '  custom.bin  ',
      saveStrategy: 'file-system-access',
      axios: {
        adapter: 'fetch',
        instance: {
          request: vi.fn(async () => ({
            status: 200,
            headers: new Headers({ 'Content-Length': '4' }),
            data: { body: createByteStream(['done']) },
          })),
        } as unknown as AxiosInstance,
      },
    });

    expect(result).toMatchObject({
      status: 'success',
      fileName: 'custom.bin',
      transport: 'axios',
      saveStrategy: 'file-system-access',
      loadedBytes: 4,
    });
    expect(writer.write).toHaveBeenCalledTimes(1);
    expect(writer.close).toHaveBeenCalledTimes(1);
  });

  it('rejects unsupported save strategies and invalid writable targets', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(createByteStream(['bad']), {
            status: 200,
            headers: { 'Content-Length': '3' },
          }),
      ),
    );
    vi.stubGlobal('showSaveFilePicker', undefined);
    const downloader = new StreamDownloader();

    await expect(
      downloader.start({
        url: 'https://example.com/demo.txt',
        saveStrategy: 'file-system-access',
      }),
    ).rejects.toMatchObject({ code: 'UNSUPPORTED_SAVE_STRATEGY' });

    const originalCreateWriteStream = streamSaver.createWriteStream;
    (streamSaver as unknown as { createWriteStream?: unknown }).createWriteStream = undefined;
    await expect(
      downloader.start({
        url: 'https://example.com/demo.txt',
        saveStrategy: 'auto',
      }),
    ).rejects.toMatchObject({ code: 'UNSUPPORTED_SAVE_STRATEGY' });
    (streamSaver as unknown as { createWriteStream?: unknown }).createWriteStream = originalCreateWriteStream;

    vi.mocked(streamSaver.createWriteStream).mockReturnValue({} as WritableStream<Uint8Array>);

    await expect(
      downloader.start({
        url: 'https://example.com/demo.txt',
        saveStrategy: 'stream-saver',
      }),
    ).rejects.toMatchObject({ code: 'WRITE_FAILED' });
  });

  it('warns for invalid headers and malformed file names before falling back', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const writer = {
      write: vi.fn(async (_chunk?: Uint8Array) => undefined),
      close: vi.fn(async () => undefined),
      abort: vi.fn(async () => undefined),
    };
    const writable = { getWriter: vi.fn(() => writer) } as unknown as WritableStream<Uint8Array>;

    vi.stubGlobal(
      'showSaveFilePicker',
      vi.fn(async () => ({ createWritable: async () => writable })),
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(createByteStream(['warn']), {
            status: 200,
            headers: {
              'Content-Length': 'NaN',
              'Content-Disposition': 'attachment; filename*=UTF-8\'\'%E0%A4%A; filename="fallback.txt"',
            },
          }),
      ),
    );

    const downloader = new StreamDownloader();
    const result = await downloader.start({
      url: 'https://example.com/files/warn.bin',
      saveStrategy: 'file-system-access',
    });

    expect(result).toMatchObject({
      status: 'success',
      fileName: 'fallback.txt',
      totalBytes: undefined,
    });
    expect(warnSpy).toHaveBeenCalled();
  });

  it('falls back to a generic file name for malformed URLs', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const writer = {
      write: vi.fn(async (_chunk?: Uint8Array) => undefined),
      close: vi.fn(async () => undefined),
      abort: vi.fn(async () => undefined),
    };
    const writable = { getWriter: vi.fn(() => writer) } as unknown as WritableStream<Uint8Array>;

    vi.stubGlobal(
      'showSaveFilePicker',
      vi.fn(async () => ({ createWritable: async () => writable })),
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(createByteStream(['bad']), {
            status: 200,
            headers: { 'Content-Length': '3' },
          }),
      ),
    );

    const downloader = new StreamDownloader();
    const result = await downloader.start({
      url: 'http://%',
      saveStrategy: 'file-system-access',
    });

    expect(result.fileName).toBe('download');
    expect(warnSpy).toHaveBeenCalled();
  });

  it('disposes safely, maps AbortError to cancellation, and accepts direct getReader responses', async () => {
    const writer = {
      write: vi.fn(async (_chunk?: Uint8Array) => undefined),
      close: vi.fn(async () => undefined),
      abort: vi.fn(async () => undefined),
    };
    vi.stubGlobal(
      'showSaveFilePicker',
      vi.fn(async () => ({ createWritable: async () => writer })),
    );

    const downloader = new StreamDownloader();
    const cancelSpy = vi.spyOn(downloader, 'cancel');
    downloader.dispose();
    expect(cancelSpy).toHaveBeenCalledTimes(1);

    const normalized = (
      downloader as unknown as { normalizeError: (error: unknown) => { code: string } }
    ).normalizeError(new DOMException('aborted', 'AbortError'));
    expect(normalized.code).toBe('DOWNLOAD_CANCELLED');

    const stream = createByteStream(['direct']);
    const result = await downloader.start({
      transport: 'axios',
      url: 'https://example.com/files/direct.bin',
      saveStrategy: 'file-system-access',
      axios: {
        adapter: 'fetch',
        instance: {
          request: vi.fn(async () => ({
            status: 200,
            headers: { 'Content-Length': '6', 'Content-Disposition': 'attachment' },
            data: {
              getReader: () => stream.getReader(),
            },
          })),
        } as unknown as AxiosInstance,
      },
    });

    expect(result).toMatchObject({
      status: 'success',
      fileName: 'direct.bin',
      loadedBytes: 6,
    });
  });

  it('covers helper fallbacks for save-strategy resolution and writer normalization', async () => {
    const downloader = new StreamDownloader();

    vi.stubGlobal('showSaveFilePicker', vi.fn());
    expect(
      (downloader as unknown as { resolveSaveStrategy: (strategy: undefined) => string }).resolveSaveStrategy(
        undefined,
      ),
    ).toBe('file-system-access');

    (downloader as unknown as { activeWriter: { abort: (error: unknown) => Promise<void> } | null }).activeWriter = {
      abort: vi.fn(async () => {
        throw new Error('abort failed');
      }),
    };
    await (downloader as unknown as { abortCurrentWriter: (error: unknown) => Promise<void> }).abortCurrentWriter(
      new Error('x'),
    );

    const normalized = (
      downloader as unknown as { normalizeError: (error: unknown) => { code: string; cause?: unknown } }
    ).normalizeError(new Error('write failed'));
    expect(normalized).toMatchObject({ code: 'WRITE_FAILED' });
  });

  it('covers reset and progress no-op behavior while running', () => {
    const downloader = new StreamDownloader();
    const emitSpy = vi.spyOn(downloader as unknown as { emit: () => void }, 'emit');
    (downloader as unknown as { snapshot: { status: string; progress: { loadedBytes: number } } }).snapshot = {
      status: 'downloading',
      progress: { loadedBytes: 5 },
    };

    downloader.reset();
    expect(
      (downloader as unknown as { snapshot: { status: string; progress: { loadedBytes: number } } }).snapshot,
    ).toMatchObject({
      status: 'downloading',
      progress: { loadedBytes: 5 },
    });

    (
      downloader as unknown as {
        updateProgress: (loaded: number, total: number | undefined, startedAt: number, force?: boolean) => void;
      }
    ).updateProgress(5, 10, Date.now(), false);
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('throws when stream-saver strategy is requested without a createWriteStream implementation', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(createByteStream(['bad']), {
            status: 200,
            headers: { 'Content-Length': '3' },
          }),
      ),
    );
    vi.stubGlobal('showSaveFilePicker', undefined);
    const originalCreateWriteStream = streamSaver.createWriteStream;
    (streamSaver as unknown as { createWriteStream?: unknown }).createWriteStream = undefined;

    const downloader = new StreamDownloader();
    await expect(
      downloader.start({
        url: 'https://example.com/demo.txt',
        saveStrategy: 'stream-saver',
      }),
    ).rejects.toMatchObject({ code: 'UNSUPPORTED_SAVE_STRATEGY' });

    (streamSaver as unknown as { createWriteStream?: unknown }).createWriteStream = originalCreateWriteStream;
  });

  it('swallows activeReader.cancel cleanup rejections', async () => {
    const downloader = new StreamDownloader();
    const cancel = vi.fn(async () => {
      throw new Error('cancel failed');
    });
    const abortCurrentWriter = vi
      .spyOn(downloader as unknown as { abortCurrentWriter: (error: unknown) => Promise<void> }, 'abortCurrentWriter')
      .mockResolvedValue(undefined);

    (downloader as unknown as { snapshot: { status: 'downloading'; progress: { loadedBytes: number } } }).snapshot = {
      status: 'downloading',
      progress: { loadedBytes: 0 },
    };
    (downloader as unknown as { abortController: AbortController }).abortController = new AbortController();
    (downloader as unknown as { activeReader: { cancel: typeof cancel } }).activeReader = { cancel };

    expect(() => downloader.cancel()).not.toThrow();
    await Promise.resolve();

    expect(cancel).toHaveBeenCalledTimes(1);
    expect(abortCurrentWriter).toHaveBeenCalledTimes(1);
  });

  it('supports stream-saver downloads without content-length and falls back to Date.now timing', async () => {
    const originalPerformance = globalThis.performance;
    vi.stubGlobal('performance', undefined);
    const dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(1000);

    const writer = {
      write: vi.fn(async (_chunk?: Uint8Array) => undefined),
      close: vi.fn(async () => undefined),
      abort: vi.fn(async () => undefined),
    };
    vi.mocked(streamSaver.createWriteStream).mockReturnValue({
      getWriter: vi.fn(() => writer),
    } as unknown as WritableStream<Uint8Array>);
    vi.stubGlobal('showSaveFilePicker', undefined);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(createByteStream(['xy']), { status: 200, headers: {} })),
    );

    const downloader = new StreamDownloader();
    const result = await downloader.start({
      url: 'https://example.com/files/no-size.bin',
      saveStrategy: 'stream-saver',
    });

    expect(result).toMatchObject({
      status: 'success',
      fileName: 'no-size.bin',
      totalBytes: undefined,
      saveStrategy: 'stream-saver',
      loadedBytes: 2,
    });
    expect(streamSaver.createWriteStream).toHaveBeenCalledWith('no-size.bin', undefined);

    vi.stubGlobal('performance', originalPerformance);
    dateNowSpy.mockRestore();
  });

  it('handles cancellation windows and skips empty chunks', async () => {
    const writer = {
      write: vi.fn(async (_chunk?: Uint8Array) => undefined),
      close: vi.fn(async () => undefined),
      abort: vi.fn(async () => undefined),
    };

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(createByteStream(['x']), { status: 200, headers: { 'Content-Length': '1' } })),
    );

    const downloaderAfterOpen = new StreamDownloader();
    vi.spyOn(
      downloaderAfterOpen as unknown as {
        openWritable: (...args: unknown[]) => Promise<{ saveStrategy: string; writer: typeof writer }>;
      },
      'openWritable',
    ).mockImplementation(async () => {
      downloaderAfterOpen.cancel();
      return { saveStrategy: 'file-system-access', writer };
    });
    await expect(downloaderAfterOpen.start({ url: 'https://example.com/after-open.bin' })).rejects.toMatchObject({
      code: 'DOWNLOAD_CANCELLED',
    });

    const downloaderDuringLoop = new StreamDownloader();
    vi.spyOn(
      downloaderDuringLoop as unknown as {
        openWritable: (...args: unknown[]) => Promise<{ saveStrategy: string; writer: typeof writer }>;
      },
      'openWritable',
    ).mockResolvedValue({
      saveStrategy: 'file-system-access',
      writer,
    });
    vi.spyOn(
      downloaderDuringLoop as unknown as {
        createDownloadContext: (
          ...args: unknown[]
        ) => Promise<{ fileName: string; stream: ReadableStream<Uint8Array>; totalBytes?: number; transport: 'fetch' }>;
      },
      'createDownloadContext',
    ).mockResolvedValue({
      fileName: 'loop.bin',
      totalBytes: 1,
      transport: 'fetch',
      stream: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new Uint8Array([1]));
          controller.enqueue(new Uint8Array([2]));
          controller.close();
        },
      }),
    });
    writer.write.mockImplementationOnce(async () => {
      downloaderDuringLoop.cancel();
    });
    await expect(downloaderDuringLoop.start({ url: 'https://example.com/during-loop.bin' })).rejects.toMatchObject({
      code: 'DOWNLOAD_CANCELLED',
    });

    const downloaderOnDone = new StreamDownloader();
    vi.spyOn(
      downloaderOnDone as unknown as {
        openWritable: (...args: unknown[]) => Promise<{ saveStrategy: string; writer: typeof writer }>;
      },
      'openWritable',
    ).mockResolvedValue({
      saveStrategy: 'file-system-access',
      writer,
    });
    vi.spyOn(
      downloaderOnDone as unknown as {
        createDownloadContext: (...args: unknown[]) => Promise<{
          fileName: string;
          stream: { getReader: () => { read: () => Promise<{ done: boolean; value?: Uint8Array }> } };
          totalBytes?: number;
          transport: 'fetch';
        }>;
      },
      'createDownloadContext',
    ).mockResolvedValue({
      fileName: 'done.bin',
      totalBytes: 0,
      transport: 'fetch',
      stream: {
        getReader: () => ({
          read: async () => {
            downloaderOnDone.cancel();
            return { done: true, value: undefined };
          },
        }),
      },
    });
    await expect(downloaderOnDone.start({ url: 'https://example.com/on-done.bin' })).rejects.toMatchObject({
      code: 'DOWNLOAD_CANCELLED',
    });

    const downloaderWithEmptyChunk = new StreamDownloader();
    vi.spyOn(
      downloaderWithEmptyChunk as unknown as {
        openWritable: (...args: unknown[]) => Promise<{ saveStrategy: string; writer: typeof writer }>;
      },
      'openWritable',
    ).mockResolvedValue({
      saveStrategy: 'file-system-access',
      writer,
    });
    vi.spyOn(
      downloaderWithEmptyChunk as unknown as {
        createDownloadContext: (...args: unknown[]) => Promise<{
          fileName: string;
          stream: { getReader: () => { read: ReturnType<typeof vi.fn> } };
          totalBytes?: number;
          transport: 'fetch';
        }>;
      },
      'createDownloadContext',
    ).mockResolvedValue({
      fileName: 'empty.bin',
      totalBytes: 1,
      transport: 'fetch',
      stream: {
        getReader: () => ({
          read: vi
            .fn()
            .mockResolvedValueOnce({ done: false, value: new Uint8Array(0) })
            .mockResolvedValueOnce({ done: false, value: new Uint8Array([7]) })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      },
    });
    writer.write.mockClear();
    const result = await downloaderWithEmptyChunk.start({ url: 'https://example.com/empty-chunk.bin' });
    expect(result).toMatchObject({ status: 'success', loadedBytes: 1 });
    expect(writer.write).toHaveBeenCalledTimes(1);
  });
});

function createByteStream(chunks: string[]) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
      controller.close();
    },
  });
}
