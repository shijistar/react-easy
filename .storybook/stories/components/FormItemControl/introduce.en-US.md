FormItemControl wraps custom content into a valid `Form.Item` control. It must be used as a direct child of `Form.Item`, and provides its children with `value` and `onChange` to interact with the form state.

## When to use

You have a custom widget (slider, color picker, rich editor, …) that you want to plug into an Ant Design `Form` without reimplementing `value`/`onChange` wiring.
