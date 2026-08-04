## API

`ModalActionProps<FormData, P, TriggerProp, Event, Ref>` extends antd `ModalProps` (minus `onOk`) plus a trigger definition. It renders a modal hosting your form component. Key props are listed below.

| Prop               | Description                                                                                     | Type                                                 | Default     |
| ------------------ | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------- |
| `formComp`         | Your form component; the parent creates the `Form` instance and injects `form` + save handlers. | `ComponentType<P & RefAttributes<Ref>>`              | -           |
| `formProps`        | Props passed to `formComp` (excluding the auto-injected form contract).                         | `Omit<P, keyof FormCompPropsConstraint<FormData>>`   | -           |
| `triggerComponent` | Component used as the trigger that opens the modal.                                             | `ComponentType<TriggerProp>`                         | `Button`    |
| `triggerProps`     | Props passed to the trigger component.                                                          | `TriggerProp`                                        | -           |
| `triggerEvent`     | Event on the trigger that opens the modal.                                                      | `keyof TriggerProp`                                  | `'onClick'` |
| `onOk`             | Called with `formData` on confirm; return `SubmitWithoutClosingSymbol` to keep open.            | `(formData, ...args) => unknown \| Promise<unknown>` | -           |
| `afterOk`          | Called after a successful `onOk`; receives its return value.                                    | `(data?) => void`                                    | -           |
| `onBeforeOpen`     | Runs before opening; throwing/rejecting prevents the modal.                                     | `() => Promise<unknown> \| unknown`                  | -           |

> Inherits all antd `ModalProps` (title, width, okText, open, `modalRender`, …). The form component receives `form`, `onSave`, `onOpenChange` via `FormCompPropsConstraint`.
