## API

| Prop       | Type                                                                     | Description                                                       |
| ---------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `children` | `(options: { value: any; onChange: (value: any) => void }) => ReactNode` | Render prop receiving the current `value` and a setter `onChange` |

## 用法

把它放在 `<Form.Item name="...">` 内部。渲染函数会收到表单 `value` 与一个变更回调，自定义控件即可成为受控表单字段。

```tsx
<Form.Item name="score" label="Score">
  <FormItemControl>{({ value, onChange }) => <Slider value={value} onChange={onChange} />}</FormItemControl>
</Form.Item>
```
