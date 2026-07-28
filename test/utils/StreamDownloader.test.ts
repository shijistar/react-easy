import streamSaver from 'streamsaver';
import { describe, expect, it, vi } from 'vitest';
import StreamDownloader, { type AxiosLikeInstance, StreamDownloadError } from '../../src/utils/StreamDownloader';

vi.mock('streamsaver', () => ({
  default: {
    createWriteStream: vi.fn(),
  },
}));

describe('StreamDownloader', () => {
  it('starts from idle snapshot', () => {
    const downloader = new StreamDownloader();

    expect(downloader.getSnapshot()).toMatchObject({
      status: 'idle',
      progress: {
        loadedBytes: 0,
      },
    });
    expect(downloader.isRunning).toBe(false);
  });

  it('downloads with fetch + file system access stream writer', async () => {
    const writer = {
      write: vi.fn(async (_chunk?: Uint8Array) => undefined),
      close: vi.fn(async () => undefined),
      abort: vi.fn(async () => undefined),
    };
    const writable = {
      getWriter: vi.fn(() => writer),
    } as unknown as WritableStream<Uint8Array>;
    const createWritable = vi.fn(async () => writable);

    vi.stubGlobal(
      'showSaveFilePicker',
      vi.fn(async () => ({ createWritable })),
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(createByteStream(['hello ', 'world']), {
            status: 200,
            headers: {
              'Content-Length': '11',
              'Content-Disposition': 'attachment; filename="demo.txt"',
            },
          }),
      ),
    );

    const downloader = new StreamDownloader();
    const result = await downloader.start({
      url: 'https://example.com/files/demo.txt',
      saveStrategy: 'file-system-access',
    });

    expect(result).toMatchObject({
      status: 'success',
      fileName: 'demo.txt',
      loadedBytes: 11,
      transport: 'fetch',
      saveStrategy: 'file-system-access',
    });
    expect(writer.write).toHaveBeenCalledTimes(2);
    expect(writer.close).toHaveBeenCalledTimes(1);
    expect(downloader.getSnapshot()).toMatchObject({
      status: 'success',
      fileName: 'demo.txt',
      progress: {
        loadedBytes: 11,
        totalBytes: 11,
        percent: 100,
      },
      transport: 'fetch',
      saveStrategy: 'file-system-access',
    });
  });

  it('downloads with axios fetch-adapter instance', async () => {
    const writer = {
      write: vi.fn(async (_chunk?: Uint8Array) => undefined),
      close: vi.fn(async () => undefined),
      abort: vi.fn(async () => undefined),
    };
    const writable = {
      getWriter: vi.fn(() => writer),
    } as unknown as WritableStream<Uint8Array>;
    const createWritable = vi.fn(async () => writable);
    const axiosInstance = {
      request: vi.fn(async () => ({
        status: 200,
        headers: {
          'Content-Length': '9',
          'Content-Disposition': 'attachment; filename="axios.txt"',
        },
        data: createByteStream(['axios', '.txt']),
      })),
    } as unknown as AxiosLikeInstance;

    vi.stubGlobal(
      'showSaveFilePicker',
      vi.fn(async () => ({ createWritable })),
    );

    const downloader = new StreamDownloader();
    const result = await downloader.start({
      transport: 'axios',
      url: 'https://example.com/files/axios.txt',
      saveStrategy: 'file-system-access',
      axios: {
        instance: axiosInstance,
        adapterHint: 'fetch',
      },
    });

    expect(result).toMatchObject({
      status: 'success',
      fileName: 'axios.txt',
      loadedBytes: 9,
      transport: 'axios',
      saveStrategy: 'file-system-access',
    });
    expect(axiosInstance.request).toHaveBeenCalledTimes(1);
    expect(writer.write).toHaveBeenCalledTimes(2);
  });

  it('falls back to StreamSaver when auto strategy cannot use file system access', async () => {
    const writer = {
      write: vi.fn(async (_chunk?: Uint8Array) => undefined),
      close: vi.fn(async () => undefined),
      abort: vi.fn(async () => undefined),
    };
    const writable = {
      getWriter: vi.fn(() => writer),
    } as unknown as WritableStream<Uint8Array>;

    vi.stubGlobal('showSaveFilePicker', undefined);
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(createByteStream(['save', 'r']), {
            status: 200,
            headers: {
              'Content-Length': '5',
              'Content-Disposition': 'attachment; filename="stream-saver.txt"',
            },
          }),
      ),
    );
    vi.mocked(streamSaver.createWriteStream).mockReturnValue(writable);

    const downloader = new StreamDownloader();
    const result = await downloader.start({
      url: 'https://example.com/files/stream-saver.txt',
      saveStrategy: 'auto',
    });

    expect(result).toMatchObject({
      status: 'success',
      saveStrategy: 'stream-saver',
      loadedBytes: 5,
    });
    expect(streamSaver.createWriteStream).toHaveBeenCalledWith('stream-saver.txt', { size: 5 });
  });

  it('rejects axios transport when response data is not a readable stream', async () => {
    const axiosInstance = {
      request: vi.fn(async () => ({
        status: 200,
        data: {},
      })),
    } as unknown as AxiosLikeInstance;
    const downloader = new StreamDownloader();

    await expect(
      downloader.start({
        transport: 'axios',
        url: 'https://example.com/files/demo.txt',
        axios: {
          instance: axiosInstance,
          adapterHint: 'fetch',
        },
      }),
    ).rejects.toBeInstanceOf(StreamDownloadError);
  });

  it('rejects with DOWNLOAD_CANCELLED when cancel is called during download', async () => {
    const writer = {
      write: vi.fn(async (_chunk?: Uint8Array) => undefined),
      close: vi.fn(async () => undefined),
      abort: vi.fn(async () => undefined),
    };
    const writable = {
      getWriter: vi.fn(() => writer),
    } as unknown as WritableStream<Uint8Array>;

    vi.stubGlobal(
      'showSaveFilePicker',
      vi.fn(async () => ({ createWritable: async () => writable })),
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(createDelayedByteStream(['first', 'second'], 10), {
            status: 200,
            headers: { 'Content-Length': '11' },
          }),
      ),
    );

    const downloader = new StreamDownloader();
    const promise = downloader.start({
      url: 'https://example.com/files/demo.txt',
      saveStrategy: 'file-system-access',
    });

    downloader.cancel();

    await expect(promise).rejects.toMatchObject({
      code: 'DOWNLOAD_CANCELLED',
    });
    expect(downloader.getSnapshot().status).toBe('cancelled');
  });

  it('resets terminal snapshot back to idle', async () => {
    const writer = {
      write: vi.fn(async (_chunk?: Uint8Array) => undefined),
      close: vi.fn(async () => undefined),
      abort: vi.fn(async () => undefined),
    };
    const writable = {
      getWriter: vi.fn(() => writer),
    } as unknown as WritableStream<Uint8Array>;

    vi.stubGlobal(
      'showSaveFilePicker',
      vi.fn(async () => ({ createWritable: async () => writable })),
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(createByteStream(['done']), {
            status: 200,
            headers: { 'Content-Length': '4' },
          }),
      ),
    );

    const downloader = new StreamDownloader();
    await downloader.start({
      url: 'https://example.com/files/reset.txt',
      saveStrategy: 'file-system-access',
    });

    downloader.reset();

    expect(downloader.getSnapshot()).toMatchObject({
      status: 'idle',
      progress: {
        loadedBytes: 0,
      },
    });
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

function createDelayedByteStream(chunks: string[], delayMs: number) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const chunk of chunks) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}
