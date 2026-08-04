`ConfirmAction` 的预设变体，专门用于删除场景。它在操作执行前弹出红色危险模式确认框，并提供 `Button` / `Switch` / `Link` 触发器构造器。

## 适用场景

当操作具有破坏性、难以撤销（如删除记录、清空数据集、解除资源关联等）时，使用 `DeleteConfirmAction`（而非普通 `ConfirmAction`）。危险样式的视觉提示可降低误点击风险。

## 核心特性

- **默认危险模式** —— `danger` 为 `true` 且图标为删除字形，无需额外配置即可表达"破坏性"。
- **与 ConfirmAction 同款 API** —— `ConfirmActionProps` 的全部能力均可用：`triggerComponent`、`triggerProps`、`triggerEvent`、`onOk`、`afterOk`、`onBeforeOpen`，以及 ref 的 `show`/`update`/`destroy`。
- **便捷触发器** —— `DeleteConfirmAction.Button` / `.Switch` / `.Link` 是开箱即用的触发器变体。
- **全局默认值** —— 默认标题/内容取自 `ConfigProvider` 的删除确认配置。

## 使用注意

- 它本质就是 `confirmType: 'delete'` 的 `ConfirmAction`，如需非默认外观，可在实例上覆盖 `titleColor` / `iconColor` / `okButtonProps.type`。
- 真正的删除逻辑放在 `onOk` 中；`afterOk` 用于成功后的 UI 更新。
- 复用 `Button`/`Switch`/`Link` 构造器可保持触发元素在全应用的一致性。
