基于 SockJS 建立 **STOMP 协议 WebSocket** 连接，主要用于双向传递可序列化的字符型消息。hook 封装了 `@stomp/stompjs` 客户端，管理连接/关闭、订阅接收端点，并提供类型化的 `send` 发送辅助。

## 适用场景

- 实时双向消息：聊天、通知、实时仪表盘。
- 暴露 SockJS + STOMP 端点的 Spring Boot / Spring Messaging 后端。
- 服务端推送消息、客户端同时向频道发布消息的场景。

## 核心特性

- **完整生命周期** —— `connect()` / `close()` 管理 SockJS socket 与 STOMP 客户端。
- **自动订阅** —— 连接成功后订阅 `subscribeEndpoint`，并将消息路由到 `onMessage`。
- **类型化消息** —— `parseMessageBody` 反序列化原始消息体；`send(body)` 发布到 `sendEndpoint`。
- **连接状态** —— `connecting` 标志与 `onConnected` / `onClose` 回调便于 UI 反馈。

## 示例代码

```tsx
import { useStompSocket } from '@tiny-codes/react-easy';

export function Chat() {
  const { connect, send, close, connecting } = useStompSocket<string>({
    url: '/ws',
    sendEndpoint: '/app/chat.send',
    subscribeEndpoint: '/topic/chat',
    onMessage: (body) => appendMessage(body),
    onConnected: () => console.log('connected'),
  });

  return (
    <>
      <button onClick={() => connect()} disabled={connecting}>
        连接
      </button>
      <button onClick={() => send('你好')}>发送</button>
      <button onClick={close}>关闭</button>
    </>
  );
}
```

## 使用注意

- 需要 SockJS 兼容的 STOMP 服务端；示例不会自动连接。
- `connectConfig` 与默认心跳（进出各 5000ms）及 `webSocketFactory` 合并。
- `send()` 依赖 `sendEndpoint`；未配置端点时会打印错误日志。
- 连接出错/断开时 hook 会弹出 `notification` 提示。
