Wraps arbitrary custom content into a valid Ant Design `Form.Item` control. It must be a direct child of `Form.Item` and hands your render function a `value` and `onChange`, bridging custom UI to form state.

## When to use

Use `FormItemControl` when a form field's UI is not covered by Ant Design's built-in controls — a slider, a custom picker, a canvas-based input — but you still want it to participate in `Form` validation, value binding, and submission.

## Key features

- **Render-prop bridge** — `children` receives `{ value, onChange }`, exactly the contract Ant Design controls expect.
- **Form-native** — validation, `initialValues`, `getFieldsValue`, and submit all work because it is a real `Form.Item` child.
- **Zero markup** — you supply only the control UI; the wrapper handles the form wiring.

## Usage notes

- It must be placed directly inside `<Form.Item>`; nesting other elements between breaks the binding.
- Call `onChange` with the new value from within your custom control to update form state.
- Useful pairings: a `Slider` for numeric fields, a color picker, or a third-party input library.
