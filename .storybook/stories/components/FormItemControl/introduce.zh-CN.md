FormItemControl 将自定义内容包装成有效的 `Form.Item` 控件，必须作为 `Form.Item` 的直接子节点使用，并向子组件提供 `value` 与 `onChange` 以与表单状态交互。

## 适用场景

你有一个自定义控件（滑块、取色器、富文本编辑器等），希望接入 Ant Design 的 `Form`，而不必自己重新实现 `value`/`onChange` 的对接。
