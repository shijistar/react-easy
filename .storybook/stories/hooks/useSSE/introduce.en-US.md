Establish a Server-Sent Events (SSE) connection using `@microsoft/fetch-event-source`. The hook manages the full lifecycle — connect, message parsing, error handling, and abort — and exposes `connect` / `abort` plus live `isRequesting` / `isConnected` state. Messages are parsed as JSON by default, or through a custom `parseMessage`.

## When to use

- Streaming responses from LLM / AI backends over SSE.
- Server push updates (notifications, progress, live scores) where WebSocket is overkill.
- One-way real-time channels where the server sends a stream of events.

## Key features

- **Lifecycle managed** — a single `connect()` call opens the stream; `abort()` closes it; `autoClose` disconnects on unmount.
- **Flexible parsing** — default JSON parsing, or provide `parseMessage` for custom payloads.
- **Composable options** — `connectOptions` merges with per-call `connect(options)` overrides.
- **Observable state** — `isRequesting` and `isConnected` flags for UI feedback.
- **Error-safe** — errors are routed to `onError` and connection failures do not throw into React.

## Sample code

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
      <button onClick={() => connect()}>Connect</button>
      <button onClick={abort}>Disconnect</button>
      <span>{isConnected ? 'connected' : 'disconnected'}</span>
    </>
  );
}
```

## Usage notes

- The stream is only opened when `connect()` is called, or when `autoConnect` is `true`.
- `autoClose` defaults to `true`, so the connection is aborted automatically on unmount.
- `onmessage` / `onerror` / `onclose` passed inside `connectOptions` are ignored; use the hook's dedicated callbacks instead.
- The default `parseMessage` expects JSON (`JSON.parse(event.data)`); non-JSON events yield `undefined` and are skipped.
