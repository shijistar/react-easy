## API

### 参数 —— UseStreamDownloaderOptions

| 参数                 | 说明                                             | 类型                             | 默认值 |
| -------------------- | ------------------------------------------------ | -------------------------------- | ------ |
| `autoDispose`        | 组件卸载时是否自动释放 downloader                | `boolean`                        | `true` |
| `defaultRequest`     | 会合并进每次 `start(request)` 调用的默认请求片段 | `Partial<StreamDownloadRequest>` | -      |
| `progressThrottleMs` | 两次进度快照派发之间的最小间隔（毫秒）           | `number`                         | `100`  |

> 继承 `StreamDownloaderInit`（`defaultRequest`、`progressThrottleMs`）。

### 返回值 —— UseStreamDownloaderResult

| 成员         | 说明                             | 类型                                                                        |
| ------------ | -------------------------------- | --------------------------------------------------------------------------- |
| `downloader` | 供高级命令式控制使用的稳定类实例 | `StreamDownloader`                                                          |
| `snapshot`   | 从底层类实例镜像过来的响应式快照 | `Readonly<StreamDownloadSnapshot>`                                          |
| `isRunning`  | 当前是否存在活动下载任务         | `boolean`                                                                   |
| `start`      | 启动下载任务                     | `(request?: StreamDownloadRequest) => Promise<StreamDownloadSuccessResult>` |
| `cancel`     | 取消当前活动任务                 | `() => void`                                                                |
| `reset`      | 将终态快照重置回 idle            | `() => void`                                                                |
