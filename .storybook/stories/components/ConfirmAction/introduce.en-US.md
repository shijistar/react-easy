Wraps a trigger component and opens a confirm-style modal before executing the action. Can switch between Button, Switch, and Link trigger types.

## When to use

Use `ConfirmAction` whenever a user action is destructive, irreversible, or worth a second thought — deleting a record, resetting configuration, submitting a paid order, etc. It binds the confirm dialog to the trigger so the action only runs after the user explicitly confirms.

## Key features

- **Trigger-agnostic** — wrap any component as the trigger (`Button`, `Switch`, `Link`, or your own) via `triggerComponent` + `triggerProps`, and choose which of its events opens the dialog with `triggerEvent`.
- **Two-way confirmation flow** — `onOk` runs the real action and can be async; `afterOk` fires only after `onOk` resolves successfully, which is the right place to do follow-up navigation or state refresh.
- **Danger mode** — `danger` (default `true` for `DeleteConfirmAction`) tints the title, icon, and confirm button red; `titleColor` / `contentColor` / `iconColor` let you fine-tune the palette and override the danger styling.
- **Programmatic open** — grab a ref and call `show(props?)` to open the dialog imperatively, e.g. from a table row handler.
- **Global defaults** — default title/content and other props can be supplied through `ConfigProvider`, so you don't repeat them on every instance.
- **Inherits antd** — everything from antd's `ModalFuncProps` (title, content, okText, cancelText, okButtonProps, …) is available.

## Sample code

```tsx
import { ConfirmAction } from '@tiny-codes/react-easy';

export function DangerZone() {
  return (
    <ConfirmAction.Button
      title="Are you sure?"
      content="This action cannot be undone."
      danger
      onOk={async () => {
        await api.remove();
      }}
    >
      Delete item
    </ConfirmAction.Button>
  );
}
```

## Usage notes

- `onBeforeOpen` returning (or rejecting with) a value prevents the dialog from opening; use it for permission or pre-condition checks.
- When `onOk` returns a Promise, the confirm button shows a loading state automatically until it settles; throwing inside `onOk` cancels the flow and `afterOk` will not run.
- `afterOk` is the success callback — do not put the actual action logic there, keep that in `onOk`.
- The dialog reads its default title/content from `ConfigProvider` (`defaultConfirmTitle` / `defaultConfirmContent`) unless overridden per instance.
