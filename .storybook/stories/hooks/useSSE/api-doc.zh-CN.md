## API

### 参数 —— UseSSEProps\<T\>

| 参数             | 说明                                                 | 类型                                                                | 默认值  |
| ---------------- | ---------------------------------------------------- | ------------------------------------------------------------------- | ------- |
| `url`            | 要连接的地址                                         | `RequestInfo`                                                       | -       |
| `connectOptions` | 连接选项（不含 `onmessage` / `onerror` / `onclose`） | `Omit<FetchEventSourceInit, 'onmessage' \| 'onerror' \| 'onclose'>` | -       |
| `autoConnect`    | 挂载时自动连接                                       | `boolean`                                                           | `false` |
| `autoClose`      | 组件卸载时自动关闭连接                               | `boolean`                                                           | `true`  |
| `parseMessage`   | 自定义消息解析函数；默认使用 `JSON.parse`            | `(original: EventSourceMessage) => T`                               | -       |
| `onMessage`      | 每条消息到达时的回调                                 | `(messageData: T) => void`                                          | -       |
| `onError`        | 错误回调                                             | `(error: any) => void`                                              | -       |
| `onClose`        | 连接关闭回调                                         | `() => void`                                                        | -       |

### 返回值

| 成员           | 说明                                              | 签名                                                                                    |
| -------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `connect`      | 打开 SSE 流；调用时的选项与 `connectOptions` 合并 | `(options?: FetchEventSourceInit & Partial<Pick<UseSSEProps, 'url'>>) => Promise<void>` |
| `abort`        | 中断当前连接                                      | `() => void`                                                                            |
| `isRequesting` | 是否正在建立连接                                  | `boolean`                                                                               |
| `isConnected`  | 连接是否已建立                                    | `boolean`                                                                               |
