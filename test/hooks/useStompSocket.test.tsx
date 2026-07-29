import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useStompSocket from '../../src/hooks/useStompSocket';

const mockState = vi.hoisted(() => {
  const state: {
    notificationError: ReturnType<typeof vi.fn>;
    latestSocket: unknown;
    latestClient: unknown;
    throwSockJSError: boolean;
    SockJSMock: ReturnType<typeof vi.fn>;
    MockClient: new (config: Record<string, unknown>) => unknown;
  } = {
    notificationError: vi.fn(),
    latestSocket: undefined,
    latestClient: undefined,
    throwSockJSError: false,
    SockJSMock: undefined as never,
    MockClient: undefined as never,
  };

  state.MockClient = class MockClient {
    public activate = vi.fn();
    public deactivate = vi.fn();
    public subscribe = vi.fn();
    public publish = vi.fn();
    public debug = vi.fn();
    public onConnect?: () => void;
    public onStompError?: (error: unknown) => void;
    public onWebSocketError?: (error: unknown) => void;
    public onWebSocketClose?: (event: { type: string; code: number }) => void;
    public config: Record<string, unknown>;

    constructor(config: Record<string, unknown>) {
      this.config = config;
      state.latestClient = this;
    }
  };

  state.SockJSMock = vi.fn(function MockSockJS(this: Record<string, unknown>, url: string) {
    if (state.throwSockJSError) {
      throw new Error('sockjs boom');
    }
    this.url = url;
    this.close = vi.fn();
    state.latestSocket = this;
  });

  return state;
});

vi.mock('@stomp/stompjs', () => ({
  Client: mockState.MockClient,
}));

vi.mock('sockjs-client/dist/sockjs.js', () => ({
  default: mockState.SockJSMock,
}));

vi.mock('antd', () => ({
  notification: {
    error: mockState.notificationError,
  },
}));

vi.mock('../../src/hooks/useT', () => ({
  default: () => (key: string) => key,
}));

describe('useStompSocket', () => {
  beforeEach(() => {
    mockState.latestSocket = undefined;
    mockState.latestClient = undefined;
    mockState.throwSockJSError = false;
    mockState.notificationError.mockReset();
    mockState.SockJSMock.mockClear();
  });

  it('connects, subscribes, parses messages, sends messages and closes cleanly', async () => {
    const onConnected = vi.fn();
    const onMessage = vi.fn();
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useStompSocket<{ value: number }>({
        url: '/socket',
        sendEndpoint: '/send',
        subscribeEndpoint: '/topic',
        parseMessageBody: (body) => JSON.parse(body) as { value: number },
        onConnected,
        onMessage,
        onClose,
      }),
    );

    let promise!: Promise<void>;
    await act(async () => {
      promise = result.current.connect();
      await Promise.resolve();
    });

    expect(result.current.connecting).toBe(true);
    expect(mockState.SockJSMock).toHaveBeenCalledWith('/socket');
    expect(mockState.latestClient.activate).toHaveBeenCalledTimes(1);
    expect(typeof mockState.latestClient.config.webSocketFactory).toBe('function');
    expect(mockState.latestClient.config.heartbeatIncoming).toBe(5000);
    expect(mockState.latestClient.config.heartbeatOutgoing).toBe(5000);

    act(() => {
      mockState.latestClient.onConnect?.();
    });

    await act(async () => {
      await promise;
    });

    await waitFor(() => {
      expect(result.current.connecting).toBe(false);
      expect(result.current.socket).toBe(mockState.latestSocket);
      expect(result.current.stompClient).toBe(mockState.latestClient);
    });

    expect(onConnected).toHaveBeenCalledTimes(1);
    expect(mockState.latestClient.subscribe).toHaveBeenCalledWith('/topic', expect.any(Function));

    act(() => {
      mockState.latestClient.subscribe.mock.calls[0][1]({ body: '{"value":1}' });
    });

    expect(onMessage).toHaveBeenCalledWith({ value: 1 });

    act(() => {
      result.current.send('hello');
    });

    expect(mockState.latestClient.publish).toHaveBeenCalledWith({ destination: '/send', body: 'hello' });

    act(() => {
      result.current.close();
    });

    expect(mockState.latestClient.deactivate).toHaveBeenCalledTimes(1);
    expect(mockState.latestSocket.close).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('logs low-level errors and handles disconnect notifications', async () => {
    const onClose = vi.fn();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const { result } = renderHook(() =>
      useStompSocket({
        url: '/socket',
        subscribeEndpoint: '/topic',
        onClose,
      }),
    );

    let promise!: Promise<void>;
    await act(async () => {
      promise = result.current.connect();
      await Promise.resolve();
    });

    act(() => {
      mockState.latestClient.onConnect?.();
    });

    await act(async () => {
      await promise;
    });

    act(() => {
      mockState.latestClient.onStompError?.('stomp-error');
      mockState.latestClient.onWebSocketError?.('ws-error');
      mockState.latestSocket.onerror?.('sock-error');
      mockState.latestClient.onWebSocketClose?.({ type: 'close', code: 4001 });
      mockState.latestSocket.onclose?.({ type: 'close' });
    });

    expect(errorSpy).toHaveBeenCalledWith('STOMP Error:', 'stomp-error');
    expect(errorSpy).toHaveBeenCalledWith('WebSocket Error:', 'ws-error');
    expect(errorSpy).toHaveBeenCalledWith('sock-error');
    expect(mockState.notificationError).toHaveBeenCalledWith({
      message: undefined,
      description: 'hooks.useStompSocket.serverDisconnected',
    });
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(logSpy).toHaveBeenCalledWith('event', { type: 'close' });
  });

  it('reports connection failure and ignores normal close notifications', async () => {
    const onMessage = vi.fn();
    const { result } = renderHook(() =>
      useStompSocket({
        url: '/socket',
        subscribeEndpoint: '/topic',
        onMessage,
      }),
    );

    await act(async () => {
      void result.current.connect();
      await Promise.resolve();
    });

    expect(mockState.latestClient.config.webSocketFactory()).toBe(mockState.latestSocket);

    act(() => {
      mockState.latestClient.onConnect?.();
      mockState.latestClient.subscribe.mock.calls[0][1]({ body: 'raw-body' });
    });

    expect(onMessage).toHaveBeenCalledWith('raw-body');

    act(() => {
      mockState.latestClient.onWebSocketClose?.({ type: 'close', code: 1000 });
    });

    expect(mockState.notificationError).not.toHaveBeenCalled();

    const { result: failedResult } = renderHook(() =>
      useStompSocket({
        url: '/socket-2',
      }),
    );

    await act(async () => {
      void failedResult.current.connect();
      await Promise.resolve();
    });

    act(() => {
      mockState.latestClient.onWebSocketClose?.({ type: 'close', code: 4000 });
    });

    expect(mockState.notificationError).toHaveBeenLastCalledWith({
      message: 'hooks.useStompSocket.connectError',
    });
  });

  it('logs send/close errors and rejects when socket creation fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { result } = renderHook(() =>
      useStompSocket({
        url: '/socket',
      }),
    );

    act(() => {
      result.current.send('hello');
    });

    expect(errorSpy).toHaveBeenCalledWith('No publish endpoint defined, unable to send message');

    const { result: successResult } = renderHook(() =>
      useStompSocket({
        url: '/socket',
        sendEndpoint: '/send',
      }),
    );

    let promise!: Promise<void>;
    await act(async () => {
      promise = successResult.current.connect();
      await Promise.resolve();
    });
    act(() => {
      mockState.latestClient.onConnect?.();
    });
    await act(async () => {
      await promise;
    });

    mockState.latestClient.deactivate.mockImplementation(() => {
      throw new Error('deactivate failed');
    });

    act(() => {
      successResult.current.close();
    });

    expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));

    mockState.throwSockJSError = true;
    const { result: failedResult } = renderHook(() =>
      useStompSocket({
        url: '/socket',
      }),
    );

    await expect(failedResult.current.connect()).rejects.toThrow('sockjs boom');
    expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
  });
});
