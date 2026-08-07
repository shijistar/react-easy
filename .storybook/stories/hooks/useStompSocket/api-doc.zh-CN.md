## API

### 参数 —— UseSocketOptions\<M\>

| 参数                | 说明                                    | 类型                   | 默认值 |
| ------------------- | --------------------------------------- | ---------------------- | ------ |
| `url`               | Socket 连接地址                         | `string`               | -      |
| `connectConfig`     | STOMP 连接配置                          | `StompConfig`          | -      |
| `sendEndpoint`      | 发布消息的频道路径                      | `string`               | -      |
| `subscribeEndpoint` | 接收消息的端点路径                      | `string`               | -      |
| `onConnected`       | 连接成功回调                            | `() => void`           | -      |
| `onMessage`         | 接收到消息回调                          | `(message: M) => void` | -      |
| `parseMessageBody`  | 解析消息体；返回值作为 `onMessage` 入参 | `(body: string) => M`  | -      |
| `onClose`           | 连接关闭回调                            | `() => void`           | -      |

### 返回值

| 成员          | 说明                                   | 签名                     |
| ------------- | -------------------------------------- | ------------------------ |
| `connect`     | 建立 socket 与 STOMP 连接              | `() => Promise<void>`    |
| `close`       | 停用 STOMP 客户端并关闭 socket         | `() => void`             |
| `send`        | 向 `sendEndpoint` 发布消息             | `(body: string) => void` |
| `connecting`  | 是否正在连接                           | `boolean`                |
| `socket`      | 底层 SockJS socket（可能为 undefined） | `WebSocket \| undefined` |
| `stompClient` | 底层 STOMP 客户端（可能为 undefined）  | `Client \| undefined`    |
