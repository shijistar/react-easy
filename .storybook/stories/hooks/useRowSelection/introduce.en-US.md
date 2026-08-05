Generate the `rowSelection` prop for Ant Design Table with **cross-page selection support**. Unlike the built-in `TableRowSelection`, the `onChange` callback returns the selected **row objects** (not just row keys), and selected rows are cached internally so selections survive page changes.

## When to use

- Tables with pagination where selections must persist across pages.
- When you need the selected row objects (not only keys) in callbacks.
- When selection state lives outside the Table (controlled `value`).

## Key features

- **Cross-page selection** — an internal cache keeps all selected row objects, so switching pages does not lose earlier selections.
- **Row-object callbacks** — `onChange(value)` receives `T[]` row objects instead of key arrays.
- **Automatic row key** — falls back to the `id` or `code` field when `rowKey` is not provided.
- **Restorable cache** — pass `cache` to rehydrate selections when the Table remounts (e.g. from `localStorage` or a MicroApp host).

## Usage notes

- Pass the returned object directly to `Table`'s `rowSelection` prop; it returns `undefined` when `checkable` is `false`.
- The hook only manages selection; the Table itself must still render the checkbox column.
- `value` is the source of truth: keep it in `useState` and pass it back in for a controlled selection.
