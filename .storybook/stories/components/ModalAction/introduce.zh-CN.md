在执行业务操作前打开一个包含表单的弹窗。与 `ConfirmAction` 类似，它绑定触发器，但弹出的不是简单确认框，而是一个完整可编辑表单，并为你自动管理表单实例。

## 适用场景

当操作前的步骤需要结构化输入时（创建或编辑记录、收集参数，或任何"ConfirmAction 的普通弹框不够、但单独开一个页面又过重"的流程），使用 `ModalAction`。

## 核心特性

- **弹窗内表单** —— 传入 `formComp`（你的表单组件），ModalAction 会创建 `Form` 实例与 `Modal`，并将 `form` 及保存处理函数注入到你的组件中。
- **触发器无关** —— 通过 `triggerComponent` / `triggerProps` / `triggerEvent` 选择任意触发器，与 `ConfirmAction` 一致。
- **异步保存** —— `onOk` 接收表单数据且可异步；返回 `SubmitWithoutClosingSymbol` 可保持弹窗不关闭（适合"保存并继续"）。
- **afterOk** —— 仅在保存成功后触发，用于跳转/刷新。
- **继承 antd** —— 全部 `ModalProps`（title、width、okText 等）均可用。

## 使用注意

- 不要在 `formComp` 内部再渲染 `<Form>`；父组件已提供实例——请使用注入的 `form` 并通过 `onSave` 注册保存。
- `onOk` 返回 `SubmitWithoutClosingSymbol` 会阻止自动关闭；返回其它值会透传给 `afterOk`。
- 实际提交逻辑放在 `onOk` 中；`afterOk` 仅用于成功后的副作用。
