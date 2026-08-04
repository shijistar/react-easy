## API

| Prop       | Description                                                       | Type                                                                     |
| ---------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `children` | Render prop receiving the current `value` and a setter `onChange` | `(options: { value: any; onChange: (value: any) => void }) => ReactNode` |

## Usage

Place it inside `<Form.Item name="...">`. The render prop receives the form value and a change handler, so your custom control becomes a controlled form field.

```tsx
<Form.Item name="score" label="Score">
  <FormItemControl>{({ value, onChange }) => <Slider value={value} onChange={onChange} />}</FormItemControl>
</Form.Item>
```
