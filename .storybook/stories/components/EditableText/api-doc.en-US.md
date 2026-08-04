## API

`EditableTextProps<V, TT, IT>` extends `EditableFormProps<V, IT>` (which carries `value`, `required`, `textComp`, `onOk`, `afterOk`, and the render hooks). Key props are listed below.

| Prop              | Description                                                                                       | Type                                                | Default  |
| ----------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------- | -------- |
| `value`           | Current text value displayed and edited by the component.                                         | `V`                                                 | -        |
| `editable`        | Whether the edit affordance is shown. Set `false` to disable editing.                             | `boolean`                                           | `true`   |
| `editing`         | Force the component into editing mode when controlled externally.                                 | `boolean`                                           | `false`  |
| `required`        | Marks the editor as required when confirming changes.                                             | `boolean`                                           | `false`  |
| `textComp`        | Typography component type used to render the read-only state (`Text`/`Paragraph`/`Title`/`Link`). | `'Text' \| 'Paragraph' \| 'Title' \| 'Link'`        | `'Text'` |
| `displayText`     | Custom read-only text, replacing the `value` display.                                             | `boolean \| ReactNode \| ((value: V) => ReactNode)` | `true`   |
| `block`           | Display as block-level (full width) in view/edit modes.                                           | `boolean \| { view?: boolean; editing?: boolean }`  | `false`  |
| `onChange`        | Called with the new value after a successful `onOk` save.                                         | `(value: V \| undefined) => void`                   | -        |
| `onEditingChange` | Called when the editing state changes.                                                            | `(editing: boolean) => void`                        | -        |

> `renderView` / `renderEdit` / `renderInput` (from `EditableFormProps`) customize each phase; `className` / `style` / `classNames` style the surface.
