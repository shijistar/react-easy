## API

| Prop       | Type                                                                     | Description                                                       |
| ---------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `children` | `(options: { value: any; onChange: (value: any) => void }) => ReactNode` | Render prop receiving the current `value` and a setter `onChange` |

## Usage

Place it inside `<Form.Item name="...">`. The render prop receives the form value and a change handler, so your custom control becomes a controlled form field.

```tsx
<Form.Item name="score" label="Score">
  <FormItemControl>{({ value, onChange }) => <Slider value={value} onChange={onChange} />}</FormItemControl>
</Form.Item>
```
