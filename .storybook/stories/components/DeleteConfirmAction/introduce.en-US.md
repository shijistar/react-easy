A pre-configured variant of `ConfirmAction` for deletion. It opens a red danger-mode confirm dialog before the action runs, and exposes `Button` / `Switch` / `Link` trigger builders.

## When to use

Use `DeleteConfirmAction` (instead of plain `ConfirmAction`) for any destructive, hard-to-undo deletion — removing a record, clearing a dataset, unlinking resources, etc. The danger styling signals risk and reduces accidental clicks.

## Key features

- **Danger by default** — `danger` is `true` and the icon is a delete glyph, so the dialog reads as destructive without extra config.
- **Same API as ConfirmAction** — everything from `ConfirmActionProps` applies: `triggerComponent`, `triggerProps`, `triggerEvent`, `onOk`, `afterOk`, `onBeforeOpen`, ref `show`/`update`/`destroy`.
- **Convenience triggers** — `DeleteConfirmAction.Button` / `.Switch` / `.Link` are ready-made trigger variants.
- **Global defaults** — default title/content come from `ConfigProvider`'s deletion settings.

## Sample code

```tsx
import { DeleteConfirmAction } from '@tiny-codes/react-easy';

export function UserList() {
  return (
    <DeleteConfirmAction.Button
      onOk={async () => {
        await api.deleteUser(id);
      }}
    >
      Delete
    </DeleteConfirmAction.Button>
  );
}
```

## Usage notes

- Because it is just `ConfirmAction` with `confirmType: 'delete'`, you can override `titleColor` / `iconColor` / `okButtonProps.type` per instance if you need a non-default look.
- Put the real deletion logic in `onOk`; use `afterOk` for post-success UI updates.
- Reusing the `Button`/`Switch`/`Link` builders keeps trigger markup consistent across your app.
