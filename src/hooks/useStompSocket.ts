import { useRef, useState } from 'react';
import type { StompConfig } from '@stomp/stompjs';
import { Client } from '@stomp/stompjs';
import { notification } from 'antd';
import useRefFunction from './useRefFunction';
import useT from './useT';

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
  const socketRef = useRef<WebSocket | undefined>(undefined);
  const stompClientRef = useRef<Client | undefined>(undefined);
  const isConnectedRef = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  const [, refresh] = useState<void>();

  const connect = useRefFunction(async () => {
    const promise = new Promise<void>((resolve, reject) => {
      try {
        // 创建WebSocket连接
        socketRef.current = new WebSocket(url);

        // 创建STOMP客户端
        stompClientRef.current = new Client({
          heartbeatIncoming: 5000,
          heartbeatOutgoing: 5000,
          ...connectConfig,
          webSocketFactory: () => socketRef.current,
        });
        // 连接Stomp服务器
        stompClientRef.current.activate();

        // 连接STOMP服务器
        stompClientRef.current.onConnect = () => {
          isConnectedRef.current = true;
          onConnected?.();
          if (subscribeEndpoint) {
            stompClientRef.current?.subscribe(subscribeEndpoint, (response) => {
              if (parseMessageBody) {
                onMessage?.(parseMessageBody(response.body));
              } else {
                onMessage?.(response.body as M);
              }
            });
          }
          resolve();
        };
        stompClientRef.current.onStompError = (error) => {
          console.error('STOMP Error:', error);
        };
        stompClientRef.current.onWebSocketError = (error) => {
          console.error('WebSocket Error:', error);
        };
        socketRef.current.onerror = (error: unknown) => {
          console.error(error);
        };

        stompClientRef.current.onWebSocketClose = (event) => {
          if (event.type === 'close' && event.code === 1000) {
            return;
          }
          stompClientRef.current?.debug('StompClient closed');
          if (isConnectedRef.current) {
            isConnectedRef.current = false;
            // 服务端断开
            onClose?.();
            notification.error({ message: t('hooks.useStompSocket.connectError') });
          } else {
            // 客户端连接失败
            notification.error({ message: undefined, description: t('hooks.useStompSocket.serverDisconnected') });
          }
        };
        socketRef.current.onclose = (event) => {
          stompClientRef.current?.debug('Socket closed');
          console.log('event', event);
          onClose?.();
        };
      } catch (error: unknown) {
        console.error(error);
        // notification.error({ message: error?.message ?? JSON.stringify(error) });
        reject(error);
      }
    });
    refresh();
    await new Promise((resolve) => setTimeout(resolve));
    return promise;
  });
  const close = useRefFunction(() => {
    try {
      stompClientRef.current?.deactivate();
      socketRef.current?.close();
      isConnectedRef.current = false;
    } catch (error) {
      console.error(error);
    }
  });
  const send = useRefFunction((body: string) => {
    if (!sendEndpoint) {
      console.error('No publish endpoint defined, unable to send message');
      return;
    }
    stompClientRef.current?.publish({
      destination: sendEndpoint,
      body,
    });
  });
  return {
    connect,
    close,
    send,
    socket: socketRef.current,
    stompClient: stompClientRef.current,
  };
}

export default useStompSocket;
