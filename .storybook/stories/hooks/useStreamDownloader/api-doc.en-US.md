## API

### Options — UseStreamDownloaderOptions

| Name                 | Description                                                      | Type                             | Default |
| -------------------- | ---------------------------------------------------------------- | -------------------------------- | ------- |
| `autoDispose`        | Whether to dispose the downloader on component unmount           | `boolean`                        | `true`  |
| `defaultRequest`     | Default request fragment merged into every `start(request)` call | `Partial<StreamDownloadRequest>` | -       |
| `progressThrottleMs` | Minimum interval between progress snapshot emissions (ms)        | `number`                         | `100`   |

> Inherits `StreamDownloaderInit` (`defaultRequest`, `progressThrottleMs`).

### Return — UseStreamDownloaderResult

| Member       | Description                                                      | Type                                                                        |
| ------------ | ---------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `downloader` | Stable downloader class instance for advanced imperative control | `StreamDownloader`                                                          |
| `snapshot`   | Reactive snapshot mirrored from the underlying class instance    | `Readonly<StreamDownloadSnapshot>`                                          |
| `isRunning`  | Whether the current downloader has an active task                | `boolean`                                                                   |
| `start`      | Start a download task                                            | `(request?: StreamDownloadRequest) => Promise<StreamDownloadSuccessResult>` |
| `cancel`     | Cancel the active task                                           | `() => void`                                                                |
| `reset`      | Reset the terminal snapshot back to idle                         | `() => void`                                                                |
