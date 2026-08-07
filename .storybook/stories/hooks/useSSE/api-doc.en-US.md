## API

### Props — UseSSEProps\<T\>

| Name             | Description                                                             | Type                                                                | (Default) |
| ---------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------- | --------- |
| `url`            | The URL to connect to                                                   | `RequestInfo`                                                       | -         |
| `connectOptions` | Options for the connection (except `onmessage` / `onerror` / `onclose`) | `Omit<FetchEventSourceInit, 'onmessage' \| 'onerror' \| 'onclose'>` | -         |
| `autoConnect`    | Automatically connect on mount                                          | `boolean`                                                           | `false`   |
| `autoClose`      | Automatically close the connection when the component unmounts          | `boolean`                                                           | `true`    |
| `parseMessage`   | Custom parser for incoming messages; defaults to `JSON.parse`           | `(original: EventSourceMessage) => T`                               | -         |
| `onMessage`      | Callback for each incoming message                                      | `(messageData: T) => void`                                          | -         |
| `onError`        | Callback for errors                                                     | `(error: any) => void`                                              | -         |
| `onClose`        | Callback when the connection closes                                     | `() => void`                                                        | -         |

### Return

| Member         | Description                                                       | Signature                                                                               |
| -------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `connect`      | Open the SSE stream; per-call options merge with `connectOptions` | `(options?: FetchEventSourceInit & Partial<Pick<UseSSEProps, 'url'>>) => Promise<void>` |
| `abort`        | Abort the current connection                                      | `() => void`                                                                            |
| `isRequesting` | Whether a connection attempt is in progress                       | `boolean`                                                                               |
| `isConnected`  | Whether the connection is currently open                          | `boolean`                                                                               |
