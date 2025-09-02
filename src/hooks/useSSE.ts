import { useEffect, useRef, useState } from 'react';
import type { EventSourceMessage, FetchEventSourceInit } from '@microsoft/fetch-event-source';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import useRefFunction from './useRefFunction';
import useRefValue from './useRefValue';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface UseSSEProps<T = any> {
  /** The URL to connect to */
  url: RequestInfo;
  /** Options for the connection. */
  connectOptions?: Omit<FetchEventSourceInit, 'onmessage' | 'onerror' | 'onclose'>;
  /** Automatically connect to the SSE channel. Default is `false`. */
  autoConnect?: boolean;
  /** Automatically close the connection when the component unmounts. Default is `true`. */
  autoClose?: boolean;
  /** Function to parse the incoming message. If not provided, the default JSON parser will be used. */
  parseMessage?: (original: EventSourceMessage) => T;
  /** Callback function to handle incoming messages. */
  onMessage?: (messageData: T) => void;
  /** Callback function to handle errors. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError?: (error: any) => void;
  /** Callback function to handle connection closure. */
  onClose?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useSSE = <T = any>(props: UseSSEProps<T>) => {
  const { url, autoConnect, connectOptions, onMessage, parseMessage, onError, onClose } = props;
  const autoConnectRef = useRefValue(autoConnect);
  const [isRequesting, setIsRequesting] = useState(false);
  const isRequestingRef = useRefValue(isRequesting);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const abortCtrlRef = useRef<AbortController | undefined>(undefined);

  const connect = useRefFunction(async (options?: FetchEventSourceInit & Partial<Pick<UseSSEProps, 'url'>>) => {
    const {
      url: connectUrl = url,
      headers = {},
      onopen,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onmessage,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onclose,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onerror,
      ...restOptions
    } = { ...connectOptions, ...options };
    abortCtrlRef.current = new AbortController();
    try {
      setIsRequesting(true);
      setIsConnected(false);
      await fetchEventSource(connectUrl, {
        method: 'post',
        signal: abortCtrlRef.current.signal,
        openWhenHidden: true,
        onopen: async (response: Response) => {
          setIsConnected(true);
          onopen?.(response);
        },
        onmessage(event) {
          if (!isRequestingRef.current) {
            setIsRequesting(false);
          }
          try {
            let parsed: T;
            if (parseMessage) {
              parsed = parseMessage(event);
            } else {
              parsed = event.data ? JSON.parse(event.data) : undefined;
            }
            if (parsed != null) {
              onMessage?.(parsed);
            }
          } catch (error) {
            console.error('Error parsing message data:', error);
            console.log('The underlying event:', event);
          }
        },
        onerror(error) {
          setIsRequesting(false);
          onError?.(error);
        },
        onclose() {
          setIsRequesting(false);
          onClose?.();
        },
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        ...restOptions,
      });
    } finally {
      setIsRequesting(false);
    }
  });

  const close = useRefFunction(() => {
    setIsConnected(false);
    if (isConnected && abortCtrlRef.current) {
      abortCtrlRef.current.abort();
    }
  });

  useEffect(() => {
    if (autoConnectRef.current) {
      connect();
    }
    return close;
  }, []);

  // 清理函数
  return {
    connect,
    close,
    isRequesting,
    isConnected,
  };
};

export default useSSE;
