## API

### 构造参数 —— StreamDownloaderInit

| 参数                 | 说明                                             | 类型                             | 默认值 |
| -------------------- | ------------------------------------------------ | -------------------------------- | ------ |
| `defaultRequest`     | 会合并进每次 `start(request)` 调用的默认请求片段 | `Partial<StreamDownloadRequest>` | -      |
| `progressThrottleMs` | 两次进度快照派发之间的最小间隔（毫秒）           | `number`                         | `100`  |

### 实例成员

| 成员          | 说明                               | 签名                                                                        |
| ------------- | ---------------------------------- | --------------------------------------------------------------------------- |
| `getSnapshot` | 读取当前最新的只读快照             | `(): Readonly<StreamDownloadSnapshot>`                                      |
| `status`      | 读取当前任务状态（getter）         | `(): StreamDownloadStatus` —— getter 属性                                   |
| `isRunning`   | 判断当前是否存在活动任务（getter） | `(): boolean` —— getter 属性                                                |
| `subscribe`   | 订阅快照变化，返回取消订阅函数     | `(listener: StreamDownloadListener) => () => void`                          |
| `start`       | 启动流式下载任务                   | `(request?: StreamDownloadRequest) => Promise<StreamDownloadSuccessResult>` |
| `cancel`      | 取消当前活动任务                   | `() => void`                                                                |
| `reset`       | 将终态快照重置回 idle              | `() => void`                                                                |
| `dispose`     | 取消任务、清空监听器并释放实例     | `() => void`                                                                |

### 关键类型

| 类型                          | 说明                                                                                                                                                                                                                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `StreamDownloadTransport`     | `'fetch' \| 'axios'` —— 支持的请求传输方式                                                                                                                                                                                                                             |
| `StreamDownloadSaveStrategy`  | `'auto' \| 'file-system-access' \| 'stream-saver'`                                                                                                                                                                                                                     |
| `StreamDownloadStatus`        | `'idle' \| 'preparing' \| 'downloading' \| 'success' \| 'failed' \| 'cancelled'`                                                                                                                                                                                       |
| `StreamDownloadErrorCode`     | 稳定错误码：`TASK_ALREADY_RUNNING`、`UNSUPPORTED_TRANSPORT`、`UNSUPPORTED_SAVE_STRATEGY`、`INVALID_REQUEST_URL`、`HTTP_ERROR`、`EMPTY_RESPONSE_STREAM`、`INVALID_AXIOS_INSTANCE`、`AXIOS_ADAPTER_NOT_SUPPORTED`、`WRITE_ABORTED`、`WRITE_FAILED`、`DOWNLOAD_CANCELLED` |
| `StreamDownloadProgress`      | `loadedBytes`、`totalBytes?`、`percent?`、`speedBps?`                                                                                                                                                                                                                  |
| `StreamDownloadSnapshot`      | `status`、`requestUrl?`、`fileName?`、`transport?`、`saveStrategy?`、`progress`、`errorCode?`、`errorMessage?`                                                                                                                                                         |
| `StreamDownloadRequest`       | `FetchStreamDownloadRequest \| AxiosStreamDownloadRequest`                                                                                                                                                                                                             |
| `StreamDownloadSuccessResult` | `status: 'success'`、`fileName`、`loadedBytes`、`totalBytes?`、`transport`、`saveStrategy`                                                                                                                                                                             |
| `StreamDownloadError`         | 携带稳定 `StreamDownloadErrorCode` 的错误类                                                                                                                                                                                                                            |
