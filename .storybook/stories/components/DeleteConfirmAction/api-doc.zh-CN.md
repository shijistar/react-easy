## API

`DeleteConfirmAction` 是预设了 `confirmType: 'delete'` 与 `danger: true` 的 `ConfirmAction`，**不新增属性**，复用完整的 `ConfirmActionProps` 并暴露静态触发器构造器。

| 属性               | 说明                                                   | 类型                                       | 默认值      |
| ------------------ | ------------------------------------------------------ | ------------------------------------------ | ----------- |
| `triggerComponent` | 用作触发器、点击后打开对话框的组件。                   | `ComponentType<TriggerProp>`               | `Button`    |
| `triggerProps`     | 传给触发器组件的属性。                                 | `TriggerProp`                              | -           |
| `triggerEvent`     | 触发器上触发对话框的事件（如 `onClick`、`onChange`）。 | `keyof TriggerProp`                        | `'onClick'` |
| `danger`           | 以红色危险模式渲染（此处默认为 `true`）。              | `boolean`                                  | `true`      |
| `onOk`             | 点击确认时的回调，可异步。                             | `(...args) => unknown \| Promise<unknown>` | -           |
| `afterOk`          | `onOk` 成功后触发；失败时不执行。                      | `(data?) => void`                          | -           |
| `onBeforeOpen`     | 打开前执行；抛错或 reject 会阻止对话框。               | `() => Promise<unknown> \| unknown`        | -           |

### 静态构造器

- `DeleteConfirmAction.Button` —— 触发器为 antd `Button`（`onClick`）。
- `DeleteConfirmAction.Switch` —— 触发器为 antd `Switch`（`onChange`）。
- `DeleteConfirmAction.Link` —— 触发器为 `Typography.Link`（`onClick`）。

> 其余 `ConfirmActionProps`（title、content、okText、iconColor 等）以及 ref 方法 `show` / `update` / `destroy` 均可用——详见 `ConfirmAction`。
