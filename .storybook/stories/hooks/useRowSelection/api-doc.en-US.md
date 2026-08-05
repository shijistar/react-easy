## API

### Options — UseRowSelectionOption\<T\>

Extends `Omit<TableRowSelection<T>, 'preserveSelectedRowKeys' | 'selectedRowKeys' | 'onChange'>`.

| Name        | Description                                                                            | Type                               | (Default) |
| ----------- | -------------------------------------------------------------------------------------- | ---------------------------------- | --------- |
| `value`     | The selected row objects                                                               | `T[]`                              | -         |
| `onChange`  | Callback triggered when the selected rows change; receives row objects                 | `(value: T[]) => void`             | -         |
| `rowKey`    | Field name or function to get the object key; falls back to `id` or `code`             | `keyof T \| ((item: T) => string)` | -         |
| `checkable` | Whether table selection is enabled; `false` disables the feature                       | `boolean`                          | `true`    |
| `cache`     | Cache of all selected objects, used to initialize the internal cache (for persistence) | `T[]`                              | -         |

> Other `TableRowSelection` options (e.g. `type`, `columnWidth`, `getCheckboxProps`) pass through.

### Return

| Member       | Description                                                     | Signature                           |
| ------------ | --------------------------------------------------------------- | ----------------------------------- |
| rowSelection | The rowSelection prop for `Table`, or `undefined` when disabled | `TableRowSelection<T> \| undefined` |
