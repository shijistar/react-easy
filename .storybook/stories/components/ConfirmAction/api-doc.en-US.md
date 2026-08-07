## API

The component extends antd's `ModalFuncProps` (title, content, okText, cancelText, okButtonProps, …). The props below are specific to `ConfirmAction`.

| Prop               | Description                                                                                                                         | Type                                       | Default              |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------- |
| `danger`           | Whether to render in red danger mode, affecting the title, icon and confirm button color. `DeleteConfirmAction` defaults to `true`. | `boolean`                                  | `false`              |
| `titleColor`       | Color of the confirm box title.                                                                                                     | `TextProps['type'] \| 'primary'`           | `warning`            |
| `contentColor`     | Color of the confirm box content text.                                                                                              | `TextProps['type'] \| 'primary'`           | -                    |
| `iconColor`        | Color of the confirm box title icon; defaults to the same as `titleColor`.                                                          | `TextProps['type'] \| 'primary'`           | same as `titleColor` |
| `triggerComponent` | The component used as the trigger that opens the dialog.                                                                            | `ComponentType<TriggerProp>`               | `Button`             |
| `triggerProps`     | Props passed to the trigger component.                                                                                              | `TriggerProp`                              | -                    |
| `triggerEvent`     | The event name on the trigger that opens the dialog (e.g. `onClick`, `onChange`).                                                   | `keyof TriggerProp`                        | `'onClick'`          |
| `children`         | Custom content of the trigger.                                                                                                      | `ReactNode`                                | -                    |
| `onBeforeOpen`     | Callback before opening; if it throws/rejects, the dialog won't open.                                                               | `() => Promise<unknown> \| unknown`        | -                    |
| `onOk`             | Callback when the confirm button is clicked; can be async.                                                                          | `(...args) => unknown \| Promise<unknown>` | -                    |
| `afterOk`          | Callback after `onOk` resolves successfully; won't run if `onOk` fails.                                                             | `(data?) => void`                          | -                    |

### Ref — `ConfirmActionRef`

| Method    | Signature                                                     | Description                           |
| --------- | ------------------------------------------------------------- | ------------------------------------- |
| `show`    | `(props?: Parameters<ModalFunc>[0]) => ReturnType<ModalFunc>` | Open the confirm dialog imperatively. |
| `update`  | `(props?: Parameters<ModalFunc>[0]) => ReturnType<ModalFunc>` | Update the open dialog's props.       |
| `destroy` | `() => void`                                                  | Close and destroy the dialog.         |
