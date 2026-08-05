`StreamDownloader` 类的 React 适配层，对外提供稳定的 downloader 实例、响应式快照以及已经绑定好的 action 方法。它通过 `useSyncExternalStore` 订阅快照变化，进度、状态与错误信息会自动触发组件重渲染，无需手动管理订阅。

## 适用场景

- 在 React 组件中下载大文件，并实时展示进度、状态与错误反馈。
- 既想要 `snapshot` + `isRunning` 的响应式便利，又希望保留完整类 API 用于高级命令式控制。
- 作为 [Utils/StreamDownloader](?path=/docs/utils-streamdownloader--playground) 的 hook 级对应页面，类级 transport 与类型细节请看后者。

## 核心特性

- **实例稳定** —— 每次挂载生命周期只创建一个 `StreamDownloader`，并在渲染间复用。
- **响应式快照** —— `snapshot` 镜像类状态，任何公开变化都会触发组件重渲染。
- **绑定好的方法** —— `start` / `cancel` / `reset` 已预绑定实例，可直接传递而不会丢失 `this`。
- **自动释放** —— 默认在卸载时 dispose downloader；需要实例存活于组件之外时，可通过 `autoDispose: false` 关闭。

## 使用注意

- 完整的 transport 契约、保存策略与类型体系在类级页面： [Utils/StreamDownloader](?path=/docs/utils-streamdownloader--playground)。本页聚焦 hook 自身接口。
- `start(request)` 返回 `Promise<StreamDownloadSuccessResult>`，失败或取消时会以 `StreamDownloadError`（如 `DOWNLOAD_CANCELLED`）拒绝 —— 请务必处理 rejection。
- `snapshot` 是普通对象，直接读取 `status`、`progress`、`errorCode` 等字段即可。
- demo 会真实触发网络传输与保存流程 —— 浏览器支持时优先使用 `file-system-access`。
