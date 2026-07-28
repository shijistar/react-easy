import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useSSE from '../../src/hooks/useSSE';

const fetchEventSourceMock = vi.fn();

vi.mock('@microsoft/fetch-event-source', () => ({
  fetchEventSource: (...args: Parameters<typeof fetchEventSourceMock>) => fetchEventSourceMock(...args),
}));

describe('useSSE', () => {
  beforeEach(() => {
    fetchEventSourceMock.mockReset();
  });

  it('connects manually, merges options, parses default messages and handles parse errors', async () => {
    const onMessage = vi.fn();
    const onError = vi.fn();
    const onClose = vi.fn();
    const onOpen = vi.fn();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    fetchEventSourceMock.mockImplementationOnce(async (connectUrl, options) => {
      expect(connectUrl).toBe('/override');
      expect(options.method).toBe('post');
      expect(options.openWhenHidden).toBe(true);
      expect(options.headers).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'token',
      });

      await options.onopen?.(new Response(null, { status: 200 }));
      options.onerror?.(new Error('message-error'));
      options.onmessage?.({ data: '{"value":1}' } as never);
      options.onmessage?.({ data: '{bad-json' } as never);
      options.onclose?.();
    });

    const { result } = renderHook(() =>
      useSSE({
        url: '/base',
        connectOptions: { headers: { Authorization: 'token' } },
        onMessage,
        onError,
        onClose,
      }),
    );

    await act(async () => {
      await result.current.connect({ url: '/override', onopen: onOpen });
    });

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(onMessage).toHaveBeenCalledWith({ value: 1 });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(result.current.isRequesting).toBe(false);
    expect(result.current.isConnected).toBe(true);
    expect(errorSpy).toHaveBeenCalledWith('Error parsing message data:', expect.any(Error));
    expect(logSpy).toHaveBeenCalledWith('The underlying event:', expect.objectContaining({ data: '{bad-json' }));
  });

  it('uses custom parseMessage and autoConnect, and aborts on unmount', async () => {
    const onMessage = vi.fn();
    const parseMessage = vi.fn((event: { data: string }) => ({ wrapped: event.data.toUpperCase() }));
    let capturedSignal: AbortSignal | undefined;

    fetchEventSourceMock.mockImplementationOnce(async (_connectUrl, options) => {
      capturedSignal = options.signal;
      await options.onopen?.(new Response(null, { status: 200 }));
      options.onmessage?.({ data: 'hello' } as never);
      return new Promise<void>(() => undefined);
    });

    const { result, unmount } = renderHook(() =>
      useSSE({
        url: '/auto',
        autoConnect: true,
        parseMessage,
        onMessage,
      }),
    );

    await waitFor(() => {
      expect(fetchEventSourceMock).toHaveBeenCalledTimes(1);
      expect(onMessage).toHaveBeenCalledWith({ wrapped: 'HELLO' });
    });

    act(() => {
      result.current.abort();
    });

    expect(result.current.isConnected).toBe(false);
    expect(capturedSignal?.aborted).toBe(true);

    unmount();
    expect(capturedSignal?.aborted).toBe(true);
  });

  it('handles non-ok responses without calling onClose', async () => {
    const onClose = vi.fn();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    fetchEventSourceMock.mockImplementationOnce(async (_connectUrl, options) => {
      await options.onopen?.(new Response(null, { status: 500 }));
      options.onmessage?.({ data: '' } as never);
      options.onclose?.();
    });

    const { result } = renderHook(() =>
      useSSE({
        url: '/error',
        onClose,
      }),
    );

    act(() => {
      result.current.abort();
    });

    await act(async () => {
      await result.current.connect();
    });

    expect(onClose).not.toHaveBeenCalled();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.isRequesting).toBe(false);
    expect(errorSpy).toHaveBeenCalledWith('SSE connection error:', expect.any(Response));
  });
});
