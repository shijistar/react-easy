import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import useStreamDownloader from '../../src/hooks/useStreamDownloader';

describe('useStreamDownloader', () => {
  it('returns a stable downloader instance and idle snapshot', () => {
    const { result, rerender } = renderHook(() => useStreamDownloader());
    const firstDownloader = result.current.downloader;

    rerender();

    expect(result.current.downloader).toBe(firstDownloader);
    expect(result.current.snapshot.status).toBe('idle');
    expect(result.current.isRunning).toBe(false);
  });

  it('updates snapshot after a successful download', async () => {
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
          new Response(
            new ReadableStream<Uint8Array>({
              start(controller) {
                controller.enqueue(new TextEncoder().encode('hello'));
                controller.close();
              },
            }),
            {
              status: 200,
              headers: {
                'Content-Length': '5',
                'Content-Disposition': 'attachment; filename="hook.txt"',
              },
            },
          ),
      ),
    );

    const { result } = renderHook(() => useStreamDownloader());

    await act(async () => {
      await result.current.start({
        url: 'https://example.com/files/hook.txt',
        saveStrategy: 'file-system-access',
      });
    });

    expect(result.current.snapshot).toMatchObject({
      status: 'success',
      fileName: 'hook.txt',
      progress: {
        loadedBytes: 5,
        totalBytes: 5,
        percent: 100,
      },
    });
  });

  it('auto disposes the downloader on unmount', () => {
    const { result, unmount } = renderHook(() => useStreamDownloader());
    const disposeSpy = vi.spyOn(result.current.downloader, 'dispose');

    unmount();

    expect(disposeSpy).toHaveBeenCalledTimes(1);
  });
});
