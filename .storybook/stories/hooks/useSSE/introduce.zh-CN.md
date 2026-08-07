基于 `@microsoft/fetch-event-source` 建立 Server-Sent Events（SSE）连接。hook 管理完整生命周期——连接、消息解析、错误处理与中断——并暴露 `connect` / `abort` 以及实时的 `isRequesting` / `isConnected` 状态。消息默认按 JSON 解析，也可通过自定义 `parseMessage` 解析。

## 适用场景

- 对接 LLM / AI 后端的流式输出。
- 服务端推送更新（通知、进度、实时比分等），无需 WebSocket 的重量级场景。
- 服务端持续推送事件流的单向实时通道。

## 核心特性

- **生命周期托管** —— 一次 `connect()` 建立连接，`abort()` 关闭连接；`autoClose` 在卸载时自动断开。
- **灵活解析** —— 默认 JSON 解析，也可提供 `parseMessage` 处理自定义消息体。
- **可组合配置** —— `connectOptions` 与每次调用 `connect(options)` 的覆盖项合并。
- **状态可观察** —— `isRequesting` 与 `isConnected` 标志位方便 UI 反馈。
- **错误安全** —— 错误统一路由到 `onError`，连接失败不会向 React 抛异常。

## 示例代码

```tsx
import { useEffect } from 'react';
import { useSSE } from '@tiny-codes/react-easy';

export function LiveFeed() {
  const { connect, abort, isConnected } = useSSE<{ id: number; text: string }>({
    url: '/api/events',
    autoConnect: true,
    onMessage: (data) => appendLog(data),
  });

  useEffect(() => () => abort(), [abort]);

  return (
    <>
      <button onClick={() => connect()}>连接</button>
      <button onClick={abort}>断开</button>
      <span>{isConnected ? '已连接' : '未连接'}</span>
    </>
  );
}
```

## 使用注意

- 仅在调用 `connect()` 或 `autoConnect` 为 `true` 时才建立连接。
- `autoClose` 默认为 `true`，组件卸载时自动中断连接。
- `connectOptions` 中的 `onmessage` / `onerror` / `onclose` 会被忽略，请使用 hook 专属回调。
- 默认 `parseMessage` 期望 JSON（`JSON.parse(event.data)`）；非 JSON 事件得到 `undefined` 并被跳过。
