Establish a **STOMP-over-WebSocket** connection using SockJS, mainly for bidirectional transmission of serializable text messages. The hook wraps a `@stomp/stompjs` client, manages connect/close, subscribes to a receive endpoint, and provides a typed `send` helper.

## When to use

- Real-time bidirectional messaging: chat, notifications, live dashboards.
- Spring Boot / Spring Messaging backends that expose SockJS + STOMP endpoints.
- Any flow where the server pushes messages and the client also publishes to a channel.

## Key features

- **Full lifecycle** — `connect()` / `close()` manage the SockJS socket and STOMP client.
- **Auto subscription** — subscribes to `subscribeEndpoint` when connected and routes messages to `onMessage`.
- **Typed messaging** — `parseMessageBody` deserializes the raw body; `send(body)` publishes to `sendEndpoint`.
- **Connection state** — `connecting` flag and callbacks `onConnected` / `onClose` for UI feedback.

## Usage notes

- Requires a SockJS-compatible STOMP server; the demo does not auto-connect.
- `connectConfig` is merged with default heartbeats (`5000`ms in/out) and the `webSocketFactory`.
- `send()` requires `sendEndpoint`; it logs an error when the endpoint is missing.
- The hook shows a `notification` on connection errors/disconnects.
