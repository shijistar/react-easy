## API

该组件继承 antd 的 `ModalFuncProps`（title、content、okText、cancelText、okButtonProps 等）。以下属性为 `ConfirmAction` 特有。

| 属性               | 说明                                                                                          | 类型                                       | 默认值          |
| ------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------ | --------------- |
| `danger`           | 是否以红色危险模式渲染，影响标题、图标与确认按钮的颜色。`DeleteConfirmAction` 默认为 `true`。 | `boolean`                                  | `false`         |
| `titleColor`       | 确认框标题颜色。                                                                              | `TextProps['type'] \| 'primary'`           | `warning`       |
| `contentColor`     | 确认框内容文本颜色。                                                                          | `TextProps['type'] \| 'primary'`           | -               |
| `iconColor`        | 确认框标题图标颜色，默认与 `titleColor` 相同。                                                | `TextProps['type'] \| 'primary'`           | 同 `titleColor` |
| `triggerComponent` | 用作触发器、点击后打开对话框的组件。                                                          | `ComponentType<TriggerProp>`               | `Button`        |
| `triggerProps`     | 传给触发器组件的属性。                                                                        | `TriggerProp`                              | -               |
| `triggerEvent`     | 触发器上用于打开对话框的事件名（如 `onClick`、`onChange`）。                                  | `keyof TriggerProp`                        | `'onClick'`     |
| `children`         | 触发器的自定义内容。                                                                          | `ReactNode`                                | -               |
| `onBeforeOpen`     | 打开前的回调；若抛错或 reject，对话框不会打开。                                               | `() => Promise<unknown> \| unknown`        | -               |
| `onOk`             | 点击确认按钮的回调，可为异步。                                                                | `(...args) => unknown \| Promise<unknown>` | -               |
| `afterOk`          | `onOk` 成功 resolve 后的回调；若 `onOk` 失败则不执行。                                        | `(data?) => void`                          | -               |

### Ref —— `ConfirmActionRef`

| 方法      | 签名                                                          | 说明                         |
| --------- | ------------------------------------------------------------- | ---------------------------- |
| `show`    | `(props?: Parameters<ModalFunc>[0]) => ReturnType<ModalFunc>` | 以命令式方式打开确认对话框。 |
| `update`  | `(props?: Parameters<ModalFunc>[0]) => ReturnType<ModalFunc>` | 更新已打开对话框的属性。     |
| `destroy` | `() => void`                                                  | 关闭并销毁对话框。           |
