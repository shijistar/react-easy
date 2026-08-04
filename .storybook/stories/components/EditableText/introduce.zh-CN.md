基于 Ant Design Typography 的内联可编辑文本组件。默认以只读文本展示，按需切换到输入框/文本域编辑器，支持 `Text`、`Paragraph`、`Title`、`Link` 多种渲染形态。

## 适用场景

当一段文本既需要展示、又需要就地快速编辑时（如用户资料、内联标签、可配置标题，或任何"用完整表单显得过重"的字段），使用 `EditableText`。

## 核心特性

- **原生 Typography** —— 只读态渲染为 `Text`/`Paragraph`/`Title`/`Link`，样式与省略行为与原生 Ant Design 一致。
- **内联编辑** —— 无需离开布局即可切换为 `Input`/`TextArea` 编辑器；`editable` 控制是否展示编辑入口。
- **受控与异步保存** —— 通过 `value`/`onChange` 管理数据，`editing` 强制进入编辑态，`onOk`/`afterOk` 处理保存流程；`required`、`textComp` 用于校验与排版微调。
- **自定义渲染** —— `displayText`/`children` 覆盖只读展示，`renderView`/`renderEdit`/`renderInput`（来自 `EditableFormProps`）定制各阶段。
- **块级或行内** —— `block` 属性选择只读/编辑态下的整行块级还是行内展示。

## 使用注意

- `editable={false}` 会完全隐藏编辑按钮；可通过外部控制 `editing` 实现编程式编辑。
- 保存失败应在 `onOk` 中处理，抛出错误可保持编辑器打开。
- 只读态仍可沿用 Ant Design 的省略配置，但 `children`/`displayText` 覆盖会禁用截断效果。
