## API

### Constructor — StreamDownloaderInit

| Name                 | Description                                                      | Type                             | Default |
| -------------------- | ---------------------------------------------------------------- | -------------------------------- | ------- |
| `defaultRequest`     | Default request fragment merged into every `start(request)` call | `Partial<StreamDownloadRequest>` | -       |
| `progressThrottleMs` | Minimum interval between progress snapshot emissions (ms)        | `number`                         | `100`   |

### Instance members

| Member        | Description                                                    | Signature                                                                   |
| ------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `getSnapshot` | Read the latest immutable snapshot                             | `(): Readonly<StreamDownloadSnapshot>`                                      |
| `status`      | Read the current task status (getter)                          | `(): StreamDownloadStatus` — getter property                                |
| `isRunning`   | Whether an active task exists (getter)                         | `(): boolean` — getter property                                             |
| `subscribe`   | Subscribe to snapshot changes; returns an unsubscribe function | `(listener: StreamDownloadListener) => () => void`                          |
| `start`       | Start a streaming download task                                | `(request?: StreamDownloadRequest) => Promise<StreamDownloadSuccessResult>` |
| `cancel`      | Cancel the active task                                         | `() => void`                                                                |
| `reset`       | Reset a terminal snapshot back to idle                         | `() => void`                                                                |
| `dispose`     | Cancel work, clear listeners, and release the instance         | `() => void`                                                                |

### Key types

| Type                          | Description                                                                                                                                                                                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `StreamDownloadTransport`     | `'fetch' \| 'axios'` — supported request transports                                                                                                                                                                                                                      |
| `StreamDownloadSaveStrategy`  | `'auto' \| 'file-system-access' \| 'stream-saver'`                                                                                                                                                                                                                       |
| `StreamDownloadStatus`        | `'idle' \| 'preparing' \| 'downloading' \| 'success' \| 'failed' \| 'cancelled'`                                                                                                                                                                                         |
| `StreamDownloadErrorCode`     | Stable codes: `TASK_ALREADY_RUNNING`, `UNSUPPORTED_TRANSPORT`, `UNSUPPORTED_SAVE_STRATEGY`, `INVALID_REQUEST_URL`, `HTTP_ERROR`, `EMPTY_RESPONSE_STREAM`, `INVALID_AXIOS_INSTANCE`, `AXIOS_ADAPTER_NOT_SUPPORTED`, `WRITE_ABORTED`, `WRITE_FAILED`, `DOWNLOAD_CANCELLED` |
| `StreamDownloadProgress`      | `loadedBytes`, `totalBytes?`, `percent?`, `speedBps?`                                                                                                                                                                                                                    |
| `StreamDownloadSnapshot`      | `status`, `requestUrl?`, `fileName?`, `transport?`, `saveStrategy?`, `progress`, `errorCode?`, `errorMessage?`                                                                                                                                                           |
| `StreamDownloadRequest`       | `FetchStreamDownloadRequest \| AxiosStreamDownloadRequest`                                                                                                                                                                                                               |
| `StreamDownloadSuccessResult` | `status: 'success'`, `fileName`, `loadedBytes`, `totalBytes?`, `transport`, `saveStrategy`                                                                                                                                                                               |
| `StreamDownloadError`         | Error class carrying a stable `StreamDownloadErrorCode`                                                                                                                                                                                                                  |
