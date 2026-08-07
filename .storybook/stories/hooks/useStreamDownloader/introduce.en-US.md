React adapter over the `StreamDownloader` class that exposes a stable downloader instance, a reactive snapshot, and bound action helpers. It subscribes the component to snapshot changes via `useSyncExternalStore`, so progress, status, and error state re-render automatically without manual subscription management.

## When to use

- Downloading large files in a React component while showing live progress, status, and error feedback.
- When you want the convenience of a reactive `snapshot` + `isRunning` while still keeping the full class API for advanced imperative control.
- As the hook-level counterpart to [Utils/StreamDownloader](?path=/docs/utils-streamdownloader--playground) for class-level transport and type details.

## Key features

- **Stable instance** — exactly one `StreamDownloader` is created per mounted lifecycle and reused across renders.
- **Reactive snapshot** — `snapshot` mirrors the class state and re-renders the component on every public change.
- **Bound helpers** — `start` / `cancel` / `reset` are pre-bound to the instance, so they can be passed around without losing `this`.
- **Auto-dispose** — the downloader is disposed on unmount by default; disable via `autoDispose: false` when the instance must outlive the component.

## Sample code

```tsx
import { useStreamDownloader } from '@tiny-codes/react-easy';

export function DownloadButton() {
  const { start, cancel, isRunning, snapshot } = useStreamDownloader();

  return (
    <>
      <button
        disabled={isRunning}
        onClick={() => start({ url: '/api/report', fileName: 'report.pdf', saveStrategy: 'auto' })}
      >
        Download
      </button>
      <button onClick={cancel} disabled={!isRunning}>
        Cancel
      </button>
      <span>{snapshot.progress.percent ?? 0}%</span>
    </>
  );
}
```

## Usage notes

- The full transport contract, save strategies, and type system live in the class-level page: [Utils/StreamDownloader](?path=/docs/utils-streamdownloader--playground). This page focuses on the hook-only surface.
- `start(request)` returns a `Promise<StreamDownloadSuccessResult>` and rejects with a `StreamDownloadError` (e.g. `DOWNLOAD_CANCELLED`) on failure/cancel — always handle the rejection.
- `snapshot` is a plain object; read `status`, `progress`, `errorCode`, etc. directly from it.
- The demo performs a real network transfer and a real save flow — prefer `file-system-access` when supported.
