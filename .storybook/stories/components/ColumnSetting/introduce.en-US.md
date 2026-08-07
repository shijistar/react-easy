Helps users manage table columns — visibility, ordering, and a "check all" / reset flow — and can persist preferences with a storage key. It renders a dropdown triggered by a button.

## When to use

Use `ColumnSetting` wherever a table exposes column customization: data grids, admin lists, report builders — anywhere users benefit from hiding, reordering, or re-showing columns and having that choice remembered.

## Key features

- **Visibility & order** — `columns` carries each column's display state, order, and `disabled` flag; the component emits the updated array via `onChange`.
- **Persistence** — `storageKey` saves the selection to `localStorage` so preferences survive reloads.
- **Custom titles** — `renderColumnTitle` overrides how each column header is labeled in the panel.
- **Composable triggers** — `triggerProps` / `dropdownProps` / `popupProps` / `checkAllProps` / `resetProps` customize the button, dropdown, popup, and action buttons.
- **Inherits Ant Design** — column items follow `ColumnType`, so your existing column definitions drop in directly.

## Sample code

```tsx
import { useState } from 'react';
import { ColumnSetting, type ColumnSettingItem } from '@tiny-codes/react-easy';
import { Table } from 'antd';

interface User {
  id: number;
  name: string;
  role: string;
}

export function Demo() {
  const [columns, setColumns] = useState<ColumnSettingItem<User>[]>(() => buildColumns());

  return (
    <>
      <ColumnSetting columns={columns} onChange={setColumns} storageKey="user-columns" />
      <Table rowKey="id" dataSource={data} columns={columns} pagination={false} />
    </>
  );
}
```

## Usage notes

- At least one column always stays visible (the last visible checkbox is disabled) to prevent hiding everything.
- When `storageKey` is set, the selection is read on mount and written on every `onChange`.
- Mark a column `disabled` to lock it visible while still listing it.
