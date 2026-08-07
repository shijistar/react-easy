## API

`DeleteConfirmAction` is a pre-configured `ConfirmAction` with `confirmType: 'delete'` and `danger: true`. It does **not** add new props — it reuses the full `ConfirmActionProps` and exposes static trigger builders.

| Prop               | Description                                                              | Type                                       | Default     |
| ------------------ | ------------------------------------------------------------------------ | ------------------------------------------ | ----------- |
| `triggerComponent` | Component used as the trigger that opens the dialog.                     | `ComponentType<TriggerProp>`               | `Button`    |
| `triggerProps`     | Props passed to the trigger component.                                   | `TriggerProp`                              | -           |
| `triggerEvent`     | Event on the trigger that opens the dialog (e.g. `onClick`, `onChange`). | `keyof TriggerProp`                        | `'onClick'` |
| `danger`           | Renders in red danger mode (default `true` here).                        | `boolean`                                  | `true`      |
| `onOk`             | Callback when confirm is clicked; can be async.                          | `(...args) => unknown \| Promise<unknown>` | -           |
| `afterOk`          | Callback after `onOk` resolves; skipped on failure.                      | `(data?) => void`                          | -           |
| `onBeforeOpen`     | Runs before opening; throwing/rejecting prevents the dialog.             | `() => Promise<unknown> \| unknown`        | -           |

### Static builders

- `DeleteConfirmAction.Button` — trigger is an antd `Button` (`onClick`).
- `DeleteConfirmAction.Switch` — trigger is an antd `Switch` (`onChange`).
- `DeleteConfirmAction.Link` — trigger is a `Typography.Link` (`onClick`).

> All other `ConfirmActionProps` (title, content, okText, iconColor, …) and the ref methods `show` / `update` / `destroy` are available — see `ConfirmAction`.
