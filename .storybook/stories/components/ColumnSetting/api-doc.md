## API

| Prop                | Type                                                   | Default | Description                                                                         |
| ------------------- | ------------------------------------------------------ | ------- | ----------------------------------------------------------------------------------- |
| `columns`           | `ColumnSettingItem<T>[]`                               | -       | Column definitions including visibility, ordering, and `disabled` state             |
| `onChange`          | `(nextColumns: T[]) => void`                           | -       | Called when the selected columns change; returns columns with `hidden` updated      |
| `storageKey`        | `string`                                               | -       | Local storage key for persisting column settings. If unset, persistence is disabled |
| `renderColumnTitle` | `(col: ColumnSettingItem, index: number) => ReactNode` | -       | Custom renderer for column titles                                                   |
| `triggerProps`      | `ButtonProps`                                          | -       | Props for the button that opens the dropdown                                        |
| `dropdownProps`     | `DropdownProps`                                        | -       | Props for the dropdown component                                                    |
| `popupProps`        | `React.HTMLAttributes<HTMLDivElement>`                 | -       | Props for the dropdown popup container                                              |
| `checkAllProps`     | `ButtonProps`                                          | -       | Props for the "Check All" button                                                    |
| `resetProps`        | `ButtonProps`                                          | -       | Props for the "Reset" button                                                        |
| `prefixCls`         | `string`                                               | -       | Custom CSS class prefix                                                             |

### `ColumnSettingItem`

Extends Ant Design `ColumnType<T>` and adds:

| Field      | Type      | Description                                 |
| ---------- | --------- | ------------------------------------------- |
| `disabled` | `boolean` | Disable toggling visibility for this column |

## Notes | 说明

- **EN:** At least one column always remains visible — the last visible column's checkbox is disabled to prevent hiding everything.
- **CN:** 至少会保留一列可见：最后一列可见项的勾选框会被禁用，避免把所有列都隐藏掉。
- **EN:** When `storageKey` is set, the selection is read from `localStorage` on mount and written back on every change.
- **CN:** 设置 `storageKey` 后，挂载时会从 `localStorage` 读取选择，并在每次变更时写回。
