import { useRef, useState } from 'react';
import type { StompConfig } from '@stomp/stompjs';
import { Client } from '@stomp/stompjs';
import { notification } from 'antd';
import useRefFunction from './useRefFunction';
import useT from './useT';
// @ts-expect-error: because dist/sockjs.js is for browser but no types provided
import SockJS from 'sockjs-client/dist/sockjs.js';

export interface UseSocketOptions<M = string> {
  /**
   * - **EN:** Socket connection address
   * - **CN:** Socket连接地址
   */
  url: string;
  /**
   * - **EN:** STOMP connection configuration
   * - **CN:** - **CN:** STOMP连接配置
   */
  connectConfig?: StompConfig;
  /**
   * - **EN:** Channel path for publishing messages
   * - **CN:** 发布消息的频道路径
   */
  sendEndpoint?: string;
  /**
   * - **EN:** Endpoint path for receiving messages
   * - **CN:** 接收消息的端点路径
   */
  subscribeEndpoint?: string;
  /**
   * - **EN:** Connection success callback
   * - **CN:** 连接成功回调
   */
  onConnected?: () => void;
  /**
   * - **EN:** Message received callback
   * - **CN:** 接收到消息回调
   */
  onMessage?: (message: M) => void;
  /**
   * - **EN:** Parse message body, return value as input parameter for `onMessage`
   * - **CN:** 解析消息体，返回值作为`onMessage`的输入参数。
   *
   * @param body - The raw message body received from the server, needs to be deserialized based on
   *   actual conditions. | 从服务端接收到的原始消息体，需要根据实际情况进行反序列化。
   *
   * @returns Parsed message body as the input parameter of `onMessage`| 解析后的消息体，作为`onMessage`的输入参数
   */
  parseMessageBody?: (body: string) => M;
  /**
   * - **EN:** Connection close callback
   * - **CN:** 连接关闭回调
   */
  onClose?: () => void;
}

/**
 * - **EN:** Establish a WebSocket based on the STOMP protocol, mainly used for bidirectional
 *   transmission of serializable character messages.
 * - **CN:** 建立基于STOMP协议的WebSocket，主要用于双向传递可序列化的字符型消息
 */
function useStompSocket<M = string>(options: UseSocketOptions<M>) {
  const { url, sendEndpoint, subscribeEndpoint, connectConfig, onMessage, parseMessageBody, onConnected, onClose } =
    options;
  const t = useT();
  // The returned `socket` / `stompClient` are render values, so they are mirrored in state: a ref
  // would not trigger a re-render and the caller would keep reading a stale (or undefined) handle.
  const [socket, setSocket] = useState<WebSocket | undefined>(undefined);
  const [stompClient, setStompClient] = useState<Client | undefined>(undefined);
  const [connecting, setConnecting] = useState(false);
  const isConnectedRef = useRef(false);

  const connect = useRefFunction(async () => {
    const promise = new Promise<void>((resolve, reject) => {
      try {
        setConnecting(true);
        // Create SockJS instance
        const nextSocket = new SockJS(url) as WebSocket;
        setSocket(nextSocket);

        // Create STOMP client
        const nextClient = new Client({
          heartbeatIncoming: 5000,
          heartbeatOutgoing: 5000,
          ...connectConfig,
          webSocketFactory: () => nextSocket,
        });
        setStompClient(nextClient);
        // Connect to STOMP server
        nextClient.activate();

        // STOMP server connection established
        nextClient.onConnect = () => {
          setConnecting(false);
          isConnectedRef.current = true;
          onConnected?.();
          if (subscribeEndpoint) {
            nextClient.subscribe(subscribeEndpoint, (response) => {
              if (parseMessageBody) {
                onMessage?.(parseMessageBody(response.body));
              } else {
                onMessage?.(response.body as M);
              }
            });
          }
          resolve();
        };
        nextClient.onStompError = (error) => {
          console.error('STOMP Error:', error);
        };
        nextClient.onWebSocketError = (error) => {
          console.error('WebSocket Error:', error);
        };
        nextSocket.onerror = (error: unknown) => {
          console.error(error);
        };

        nextClient.onWebSocketClose = (event) => {
          setConnecting(false);
          // Normal close
          if (event.type === 'close' && event.code === 1000) {
            return;
          }
          nextClient.debug('StompClient closed');
          if (isConnectedRef.current) {
            isConnectedRef.current = false;
            onClose?.();
            notification.error({ message: undefined, description: t('hooks.useStompSocket.serverDisconnected') });
          } else {
            // Client connection failed
            notification.error({ message: t('hooks.useStompSocket.connectError') });
          }
        };
        nextSocket.onclose = (event) => {
          setConnecting(false);
          isConnectedRef.current = false;
          nextClient.debug('Socket closed');
          console.log('event', event);
          onClose?.();
        };
      } catch (error: unknown) {
        console.error(error);
        // notification.error({ message: error?.message ?? JSON.stringify(error) });
        reject(error);
      }
    });
    void promise.catch(() => undefined);
    // Let React flush the state updates above, so `socket` and `stompClient` are already available
    // when the returned promise settles.
    await new Promise((resolve) => setTimeout(resolve));
    return promise;
  });
  const close = useRefFunction(() => {
    try {
      stompClient?.deactivate();
      socket?.close();
      isConnectedRef.current = false;
      setConnecting(false);
    } catch (error) {
      console.error(error);
    }
  });
  const send = useRefFunction((body: string) => {
    if (!sendEndpoint) {
      console.error('No publish endpoint defined, unable to send message');
      return;
    }
    stompClient?.publish({
      destination: sendEndpoint,
      body,
    });
  });
  return {
    connect,
    close,
    send,
    connecting,
    socket,
    stompClient,
  };
}

export default useStompSocket;
