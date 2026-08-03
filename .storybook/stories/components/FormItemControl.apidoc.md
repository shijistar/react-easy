# FormItemControl

- **EN:** FormItemControl wraps custom content into a valid `Form.Item` control. It must be used as a direct child of `Form.Item`, and provides its children with `value` and `onChange` to interact with the form state.
- **CN:** FormItemControl 将自定义内容包装成有效的 `Form.Item` 控件，必须作为 `Form.Item` 的直接子节点使用，并向子组件提供 `value` 与 `onChange` 以与表单状态交互。

## When to use | 适用场景

- **EN:** You have a custom widget (slider, color picker, rich editor, …) that you want to plug into an Ant Design `Form` without reimplementing `value`/`onChange` wiring.
- **CN:** 你有一个自定义控件（滑块、取色器、富文本编辑器等），希望接入 Ant Design 的 `Form`，而不必自己重新实现 `value`/`onChange` 的对接。

## API

| Prop | Type | Description |
| --- | --- | --- |
| `children` | `(options: { value: any; onChange: (value: any) => void }) => ReactNode` | Render prop receiving the current `value` and a setter `onChange` |

## Usage | 用法

- **EN:** Place it inside `<Form.Item name="...">`. The render prop receives the form value and a change handler, so your custom control becomes a controlled form field.
- **CN:** 把它放在 `<Form.Item name="...">` 内部。渲染函数会收到表单 `value` 与一个变更回调，自定义控件即可成为受控表单字段。

```tsx
<Form.Item name="score" label="Score">
  <FormItemControl>
    {({ value, onChange }) => <Slider value={value} onChange={onChange} />}
  </FormItemControl>
</Form.Item>
```
