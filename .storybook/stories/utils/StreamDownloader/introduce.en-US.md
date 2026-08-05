Browser-side streaming downloader for large files. It reads the remote response as a `ReadableStream`, throttles progress emissions, and writes bytes into a destination chosen at runtime — either the File System Access API or a StreamSaver-backed writable stream. The class is framework-agnostic and acts as the source of truth for the download contract; the [Hooks/useStreamDownloader](?path=/docs/hooks-usestreamdownloader--playground) page is the React adapter.

## When to use

- Downloading large files in the browser with live progress, cancellation, and error reporting.
- When a download must be started imperatively (outside render), reused across components, or embedded in non-React code.
- When you need both `fetch` and axios (`fetch` adapter) transports behind one API.

## Key features

- **Dual transport** — native `fetch` or an injected axios instance explicitly backed by the `fetch` adapter.
- **Pluggable save strategy** — `auto` detection, File System Access API (`file-system-access`), or StreamSaver (`stream-saver`).
- **Progress throttling** — configurable minimum interval between snapshot emissions (`progressThrottleMs`).
- **Subscription model** — `subscribe(listener)` + `getSnapshot()` follow the `useSyncExternalStore` contract, usable with or without React.
- **Lifecycle control** — `cancel()`, `reset()`, and `dispose()` cover cancellation, terminal-state reset, and resource release.
- **Stable error codes** — typed error codes (`TASK_ALREADY_RUNNING`, `DOWNLOAD_CANCELLED`, …) via `StreamDownloadError`.

## Usage notes

- The remote URL must support CORS and expose a readable stream body; otherwise the download fails with `HTTP_ERROR` or `EMPTY_RESPONSE_STREAM`.
- `file-system-access` requires a secure context (HTTPS/localhost) and shows a native save dialog; `stream-saver` may depend on additional browser/service-worker capability.
- Only one task can run at a time; calling `start()` while running rejects with `TASK_ALREADY_RUNNING`.
- The live demo intentionally triggers a real save flow and a real network transfer — prefer `file-system-access` when your browser supports it.
