将任意自定义内容包装成有效的 Ant Design `Form.Item` 控件。它必须作为 `Form.Item` 的直接子节点，并向你的渲染函数提供 `value` 与 `onChange`，从而把自定义 UI 接入表单状态。

## 适用场景

当某个表单字段的 UI 不被 Ant Design 内置控件覆盖——滑块、自定义选择器、基于 canvas 的输入——但你仍希望它参与 `Form` 的校验、取值与提交流程时，使用 `FormItemControl`。

## 核心特性

- **渲染属性桥接** —— `children` 接收 `{ value, onChange }`，正是 Ant Design 控件所期望的契约。
- **表单原生** —— 校验、`initialValues`、`getFieldsValue`、提交全部可用，因为它本身就是真正的 `Form.Item` 子节点。
- **零样板** —— 你只需提供控件 UI，包装层负责表单接线。

## 使用注意

- 它必须直接放在 `<Form.Item>` 内部；中间夹入其它元素会破坏绑定。
- 在你的自定义控件内部调用 `onChange` 并传入新值，即可更新表单状态。
- 常见搭配：用 `Slider` 处理数值字段、颜色选择器，或第三方输入库。
