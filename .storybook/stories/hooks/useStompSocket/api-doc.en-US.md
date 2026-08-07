## API

### Options — UseSocketOptions\<M\>

| Name                | Description                                      | Type                   | (Default) |
| ------------------- | ------------------------------------------------ | ---------------------- | --------- |
| `url`               | Socket connection address                        | `string`               | -         |
| `connectConfig`     | STOMP connection configuration                   | `StompConfig`          | -         |
| `sendEndpoint`      | Channel path for publishing messages             | `string`               | -         |
| `subscribeEndpoint` | Endpoint path for receiving messages             | `string`               | -         |
| `onConnected`       | Connection success callback                      | `() => void`           | -         |
| `onMessage`         | Message received callback                        | `(message: M) => void` | -         |
| `parseMessageBody`  | Parse the message body; result feeds `onMessage` | `(body: string) => M`  | -         |
| `onClose`           | Connection close callback                        | `() => void`           | -         |

### Return

| Member        | Description                                      | Signature                |
| ------------- | ------------------------------------------------ | ------------------------ |
| `connect`     | Establish the socket and STOMP connection        | `() => Promise<void>`    |
| `close`       | Deactivate the STOMP client and close the socket | `() => void`             |
| `send`        | Publish a message to `sendEndpoint`              | `(body: string) => void` |
| `connecting`  | Whether a connection is in progress              | `boolean`                |
| `socket`      | The underlying SockJS socket (may be undefined)  | `WebSocket \| undefined` |
| `stompClient` | The underlying STOMP client (may be undefined)   | `Client \| undefined`    |
